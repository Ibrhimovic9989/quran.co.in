'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Loader2, RotateCcw, ExternalLink, Globe, Focus, Share2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { type Mode, SUGGESTED, LOADING_STEPS } from './constants';
import { renderMarkdown } from './answer-renderer';
import { backendUrl } from '@/lib/api/backend';
import { useAuth, signIn } from '@/components/auth/auth-client';

interface SourceAyah {
  surahNumber: number;
  ayahNumber: number;
  englishName: string;
  translationText: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceAyah[];
}

// ── Loading indicator with cycling messages ───────────────────────────────────

function LoadingIndicator() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1 < LOADING_STEPS.length ? s + 1 : s));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center gap-2 text-accent">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        <span className="text-sm font-medium transition-all duration-300">{LOADING_STEPS[step]}</span>
      </div>
      <div className="flex gap-1 pl-6">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-0.5 rounded-full transition-all duration-500',
              i <= step ? 'bg-accent w-6' : 'bg-line w-3'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AskPage() {
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  const [mode, setMode] = useState<Mode>('focused');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Track whether user is near the bottom
  useEffect(() => {
    const onScroll = () => {
      const distFromBottom = document.documentElement.scrollHeight
        - window.scrollY - window.innerHeight;
      isNearBottomRef.current = distFromBottom < 150;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to the assistant message only once it has actual content (not empty loading bubble)
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (messages.length <= prevCountRef.current) return;
    prevCountRef.current = messages.length;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && last.content) {
      setTimeout(() => {
        lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }, [messages]);

  // During streaming: only follow bottom if user is already there
  useEffect(() => {
    if (!loading || !isNearBottomRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }, [messages, loading]);

  function switchMode(m: Mode) {
    setMode(m);
    setMessages([]);
    setInput('');
  }

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    // Ask (AI) has real cost, so it's for signed-in users only. Prompt instead
    // of firing a request that the API would reject with 401.
    if (!signedIn) {
      signIn('google', { callbackUrl: '/ask' });
      return;
    }

    const userMsg: Message = { role: 'user', content: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '', sources: [] };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const historyToSend = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(backendUrl('/api/quran/ask'), {
        method: 'POST',
        credentials: 'include', // send the session cookie so the API sees a signed-in user
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), mode, history: historyToSend }),
      });

      if (res.status === 401) {
        setMessages((prev) => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            content: 'Please sign in to use Ask — it’s free, and keeps this AI feature sustainable.',
          };
          return msgs;
        });
        setLoading(false);
        signIn('google', { callbackUrl: '/ask' });
        return;
      }

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'sources') {
              setMessages((prev) => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], sources: parsed.ayahs };
                return msgs;
              });
            } else if (parsed.type === 'token') {
              setMessages((prev) => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  content: msgs[msgs.length - 1].content + parsed.text,
                };
                return msgs;
              });
            }
          } catch { /* malformed chunk */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = {
          ...msgs[msgs.length - 1],
          content: 'Sorry, something went wrong. Please try again.',
        };
        return msgs;
      });
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  const [sharingIdx, setSharingIdx] = useState<number | null>(null);

  const isIOSDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafariDevice = () => /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  function downloadBlob(blob: Blob, name: string) {
    if (isIOSDevice()) {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toPngWithTimeout(el: HTMLElement, opts: Parameters<typeof toPng>[1], ms = 8000): Promise<string> {
    return Promise.race([
      toPng(el, opts),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('toPng timeout')), ms)),
    ]);
  }

  async function safeToPng(el: HTMLElement, opts: Parameters<typeof toPng>[1]) {
    if (isSafariDevice() || isIOSDevice()) {
      for (let i = 0; i < 3; i++) {
        try {
          const result = await toPngWithTimeout(el, opts);
          if (result && result.length > 1000) return result;
        } catch { /* timeout or error — retry */ }
      }
    }
    return toPngWithTimeout(el, opts);
  }

  const handleShareAnswer = async (question: string, idx: number) => {
    setSharingIdx(idx);
    try {
      const bubble = document.querySelector(`[data-msg-idx="${idx}"] .answer-bubble`) as HTMLElement;
      if (!bubble) return;

      // Hide share button temporarily
      const shareBtn = bubble.querySelector('[data-share-btn]') as HTMLElement;
      if (shareBtn) shareBtn.style.display = 'none';

      // Inject branding header
      const header = document.createElement('div');
      header.setAttribute('data-tmp', 'true');
      header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid #dcebef;';
      header.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:#e0f6f4;display:flex;align-items:center;justify-content:center;font-size:14px;">✨</div>
          <span style="font-size:14px;font-weight:700;color:#00636d;">Ask the Quran</span>
        </div>
        <span style="font-size:12px;color:#58717c;font-family:system-ui;">quran.co.in</span>
      `;
      bubble.prepend(header);

      // Inject question bubble
      const qDiv = document.createElement('div');
      qDiv.setAttribute('data-tmp', 'true');
      qDiv.style.cssText = 'background:#007e87;color:white;border-radius:14px;padding:10px 16px;margin-bottom:16px;font-size:14px;display:inline-block;max-width:90%;line-height:1.5;';
      qDiv.textContent = question;
      header.after(qDiv);

      // Inject footer
      const footer = document.createElement('div');
      footer.setAttribute('data-tmp', 'true');
      footer.style.cssText = 'padding-top:14px;margin-top:14px;border-top:1px solid #dcebef;display:flex;align-items:center;justify-content:space-between;';
      footer.innerHTML = `
        <span style="font-size:10px;color:#58717c;">Answers sourced from the Holy Quran</span>
        <span style="font-size:13px;font-weight:700;color:#00636d;">quran.co.in</span>
      `;
      bubble.appendChild(footer);

      // Capture at high res
      const dataUrl = await safeToPng(bubble, {
        pixelRatio: 3,
        quality: 0.95,
        backgroundColor: '#ffffff',
      });

      // Restore DOM
      bubble.querySelectorAll('[data-tmp]').forEach((el) => el.remove());
      if (shareBtn) shareBtn.style.display = '';

      // Load raw image
      const img = new window.Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); });

      // Instagram 3:4 dimensions
      const IG_W = 1080;
      const IG_H = 1440;
      const pad = 60;
      const brandingH = 56; // bottom branding bar height
      const contentW = IG_W - pad * 2;

      // Scale content width to fit IG_W
      const scale = Math.min(contentW / img.width, 1);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;

      // Helper: draw branding bar at bottom of a canvas
      const drawBranding = (ctx: CanvasRenderingContext2D, pageNum: number, totalPages: number) => {
        const barY = IG_H - brandingH;
        // Subtle top border
        ctx.strokeStyle = '#dcebef';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, barY);
        ctx.lineTo(IG_W - pad, barY);
        ctx.stroke();
        // "quran.co.in" right-aligned
        ctx.fillStyle = '#00636d';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('quran.co.in', IG_W - pad, barY + 36);
        // Page indicator left-aligned
        if (totalPages > 1) {
          ctx.fillStyle = '#58717c';
          ctx.font = '24px system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${pageNum} / ${totalPages}`, pad, barY + 34);
        }
      };

      // Available content height per page (above branding bar)
      const contentH = IG_H - pad - brandingH - 16;

      if (scaledH <= contentH) {
        // Single page — center vertically
        const canvas = document.createElement('canvas');
        canvas.width = IG_W;
        canvas.height = IG_H;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, IG_W, IG_H);
        const dx = (IG_W - scaledW) / 2;
        const dy = Math.min((contentH - scaledH) / 2 + pad, pad);
        ctx.drawImage(img, dx, dy, scaledW, scaledH);
        drawBranding(ctx, 1, 1);

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        );
        const file = new File([blob], 'quran-answer.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Ask the Quran — Quran.co.in' });
        } else {
          downloadBlob(blob, 'quran-answer.png');
        }
      } else {
        // Multi-page carousel
        // Overlap between pages (in source px) so text isn't cut mid-line
        const overlapPx = 60 / scale;
        const srcPageH = contentH / scale;
        const srcStep = srcPageH - overlapPx; // each page advances by this much
        const totalPages = Math.ceil((img.height - overlapPx) / srcStep);
        const files: File[] = [];

        for (let p = 0; p < totalPages; p++) {
          const canvas = document.createElement('canvas');
          canvas.width = IG_W;
          canvas.height = IG_H;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, IG_W, IG_H);

          const srcY = p * srcStep;
          const srcRemaining = Math.min(srcPageH, img.height - srcY);
          const drawH = srcRemaining * scale;
          const dx = (IG_W - scaledW) / 2;
          ctx.drawImage(
            img,
            0, srcY, img.width, srcRemaining,
            dx, pad, scaledW, drawH
          );

          // Fade-out gradient at bottom for non-last pages (signals "swipe")
          if (p < totalPages - 1) {
            const fadeH = 80;
            const fadeY = IG_H - brandingH - 16 - fadeH;
            const grad = ctx.createLinearGradient(0, fadeY, 0, fadeY + fadeH);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(1, 'rgba(255,255,255,1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, fadeY, IG_W, fadeH);
          }

          drawBranding(ctx, p + 1, totalPages);

          const pageBlob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), 'image/png')
          );
          files.push(
            new File([pageBlob], `quran-answer-${p + 1}.png`, { type: 'image/png' })
          );
        }

        if (navigator.canShare?.({ files })) {
          await navigator.share({ files, title: 'Ask the Quran — Quran.co.in' });
        } else {
          files.forEach((f) => downloadBlob(f, f.name));
        }
      }
    } catch (e) {
      console.error('Share image failed:', e);
    } finally {
      setSharingIdx(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-44 md:py-12 md:pb-48">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-[24px] md:text-[30px] font-bold leading-[1.2] tracking-[-0.035em] text-ink">Ask the Quran</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-[1.7] text-muted">
            {mode === 'focused'
              ? 'Explore a question with references to Quranic verses.'
              : 'Ask about any surah, ayah, or topic. The full Quran is open to you.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-7 flex">
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            <button
              aria-pressed={mode === 'focused'}
              onClick={() => switchMode('focused')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all',
                mode === 'focused' ? 'bg-accent-soft text-accent-strong' : 'text-muted hover:text-ink-soft'
              )}
            >
              <Focus className="h-3.5 w-3.5" /> Focused
            </button>
            <button
              aria-pressed={mode === 'open'}
              onClick={() => switchMode('open')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all',
                mode === 'open' ? 'bg-accent-soft text-accent-strong' : 'text-muted hover:text-ink-soft'
              )}
            >
              <Globe className="h-3.5 w-3.5" /> Open Quran
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="mb-6 space-y-6">

          {/* Suggested questions */}
          {messages.length === 0 && (
            <>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTED[mode].slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className={cn(
                      'rounded-2xl border bg-surface px-4 py-3.5 text-left text-[13px] leading-[1.6] text-ink-soft transition-all hover:shadow-card',
                      mode === 'focused'
                        ? 'border-line hover:border-accent/30 hover:text-accent-strong'
                        : 'border-line hover:border-gold/50 hover:text-gold-text'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Messages */}
          {messages.map((msg, i) => {
            const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
            return (
              <div
                key={i}
                ref={isLastAssistant ? lastAssistantRef : undefined}
                data-msg-idx={i}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-3 text-[13px] leading-relaxed text-white">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    {/* Answer bubble */}
                    <div className="answer-bubble rounded-2xl rounded-tl-sm border border-line bg-surface px-5 py-4">
                      {msg.content ? (
                        <div className="msg-content space-y-0.5 text-[14px] leading-[1.75] text-ink-soft md:text-[15px]">
                          {renderMarkdown(msg.content)}
                        </div>
                      ) : (
                        <LoadingIndicator />
                      )}

                      {/* Share as Image button */}
                      {msg.content && !loading && (
                        <div data-share-btn="true" className="mt-3 flex items-center gap-2 border-t border-line-soft pt-3">
                          <button
                            onClick={() => {
                              const qIdx = i - 1;
                              const q = qIdx >= 0 ? messages[qIdx].content : '';
                              handleShareAnswer(q, i);
                            }}
                            disabled={sharingIdx === i}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition-colors hover:text-accent-strong disabled:opacity-50"
                          >
                            {sharingIdx === i ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Share2 className="h-3.5 w-3.5" />
                            )}
                            {sharingIdx === i ? 'Generating…' : 'Share as Image'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Source ayahs */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                          <BookOpen className="h-3 w-3" />
                          {mode === 'focused' ? 'Referenced ayahs' : 'Context provided'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((s) => (
                            <Link
                              key={`${s.surahNumber}:${s.ayahNumber}`}
                              href={`/quran/${s.surahNumber}?ayah=${s.ayahNumber}`}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                                mode === 'focused'
                                  ? 'border-line bg-accent-soft text-accent-strong hover:border-accent/30'
                                  : 'border-gold-soft bg-gold-soft text-gold-text hover:border-gold/50'
                              )}
                            >
                              {s.englishName} {s.surahNumber}:{s.ayahNumber}
                              <ExternalLink className="h-3 w-3 opacity-50" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Reset */}
        {messages.length > 0 && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => setMessages([])}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition-colors hover:text-accent-strong"
            >
              <RotateCcw className="h-3 w-3" /> New conversation
            </button>
          </div>
        )}

        {/* Input — fixed to viewport so it's always visible.
            On mobile, lift above the bottom tab bar (~3.5rem + safe-area); flush on md+. */}
        <div className="fixed bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-gradient-to-t from-paper via-paper/95 to-transparent px-4 pb-4 pt-2">
          <div className="mx-auto max-w-3xl">
          <div className={cn(
            'overflow-hidden rounded-2xl border bg-surface shadow-card transition-all',
            mode === 'focused'
              ? 'border-line focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent-soft'
              : 'border-line focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold-soft'
          )}>
            <textarea
              aria-label="Your question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !signedIn
                  ? 'Sign in to ask about the Quran — it’s free'
                  : mode === 'focused'
                    ? 'Ask about any topic in the Quran…'
                    : 'Ask about any ayah, surah, or topic…'
              }
              rows={2}
              className="w-full resize-none bg-transparent px-4 pb-2 pt-4 text-[14px] text-ink placeholder:text-muted focus:outline-none"
            />
            <div className="flex items-center justify-end gap-3 px-3 pb-3 sm:justify-between">
              <p className="hidden text-[11px] text-muted sm:block">Enter to send · Shift+Enter for new line</p>
              <button
                onClick={() => (signedIn ? ask(input) : signIn('google', { callbackUrl: '/ask' }))}
                disabled={loading || (signedIn && !input.trim())}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-xs font-semibold text-white transition-colors disabled:bg-line disabled:text-muted',
                  mode === 'focused' ? 'bg-accent hover:bg-accent-strong' : 'bg-gold-text hover:bg-gold-text/90'
                )}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {signedIn ? 'Ask' : 'Sign in to Ask'}
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">
            Not a substitute for scholarly guidance. Always refer to qualified scholars.
          </p>
          </div>
        </div>

      </div>
    </div>
  );
}
