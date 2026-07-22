'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Loader2, RotateCcw, ExternalLink, Globe, Focus, Share2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { type Mode, SUGGESTED, LOADING_STEPS } from './constants';
import { renderMarkdown } from './answer-renderer';
import { backendUrl } from '@/lib/api/backend';

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
      <div className="flex items-center gap-2 text-accent-soft0">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        <span className="text-sm font-medium transition-all duration-300">{LOADING_STEPS[step]}</span>
      </div>
      <div className="flex gap-1 pl-6">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-0.5 rounded-full transition-all duration-500',
              i <= step ? 'bg-accent w-6' : 'bg-gray-200 w-3'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AskPage() {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), mode, history: historyToSend }),
      });

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
      header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid #e5e7eb;';
      header.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:#f3e8ff;display:flex;align-items:center;justify-content:center;font-size:14px;">✨</div>
          <span style="font-size:14px;font-weight:700;color:#7c3aed;">Ask the Quran</span>
        </div>
        <span style="font-size:12px;color:#9ca3af;font-family:system-ui;">quran.co.in</span>
      `;
      bubble.prepend(header);

      // Inject question bubble
      const qDiv = document.createElement('div');
      qDiv.setAttribute('data-tmp', 'true');
      qDiv.style.cssText = 'background:#1f2937;color:white;border-radius:14px;padding:10px 16px;margin-bottom:16px;font-size:14px;display:inline-block;max-width:90%;line-height:1.5;';
      qDiv.textContent = question;
      header.after(qDiv);

      // Inject footer
      const footer = document.createElement('div');
      footer.setAttribute('data-tmp', 'true');
      footer.style.cssText = 'padding-top:14px;margin-top:14px;border-top:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;';
      footer.innerHTML = `
        <span style="font-size:10px;color:#9ca3af;">Answers sourced from the Holy Quran</span>
        <span style="font-size:13px;font-weight:700;color:#7c3aed;">quran.co.in</span>
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
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, barY);
        ctx.lineTo(IG_W - pad, barY);
        ctx.stroke();
        // "quran.co.in" right-aligned
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('quran.co.in', IG_W - pad, barY + 36);
        // Page indicator left-aligned
        if (totalPages > 1) {
          ctx.fillStyle = '#9ca3af';
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
    <div className="min-h-screen bg-gradient-to-b from-accent-soft/40 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 pb-44 md:pb-48">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-soft mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ask the Quran</h1>
          <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
            {mode === 'focused'
              ? 'Get answers grounded in semantically matched ayahs — every response is cited.'
              : 'Ask about any surah, ayah, or topic. The full Quran is open to you.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-1">
            <button
              onClick={() => switchMode('focused')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                mode === 'focused' ? 'bg-white text-accent-strong shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Focus className="w-3.5 h-3.5" /> Focused
            </button>
            <button
              onClick={() => switchMode('open')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                mode === 'open' ? 'bg-white text-accent-strong shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Globe className="w-3.5 h-3.5" /> Open Quran
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="space-y-6 mb-6">

          {/* Suggested questions */}
          {messages.length === 0 && (
            <>
              <div className={cn(
                'text-xs text-center px-3 py-1.5 rounded-full w-fit mx-auto mb-4',
                mode === 'focused'
                  ? 'bg-accent-soft text-accent border border-accent-soft'
                  : 'bg-gold-soft/40 text-gold-text border border-gold-soft'
              )}>
                {mode === 'focused'
                  ? 'Answers are drawn from semantically related ayahs'
                  : 'Ask about any specific ayah, surah, or Quranic topic'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED[mode].map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className={cn(
                      'text-left text-sm px-4 py-3 rounded-xl border bg-white transition-all',
                      mode === 'focused'
                        ? 'border-gray-200 hover:border-accent/40 hover:bg-accent-soft/50 text-gray-600 hover:text-accent-strong'
                        : 'border-gray-200 hover:border-gold/50 hover:bg-gold-soft/40/50 text-gray-600 hover:text-gold-text'
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
                  <div className="max-w-[85%] bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    {/* Answer bubble */}
                    <div className="answer-bubble bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                      {msg.content ? (
                        <div className="text-sm md:text-base space-y-0.5 msg-content">
                          {renderMarkdown(msg.content)}
                        </div>
                      ) : (
                        <LoadingIndicator />
                      )}

                      {/* Share as Image button */}
                      {msg.content && !loading && (
                        <div data-share-btn="true" className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => {
                              const qIdx = i - 1;
                              const q = qIdx >= 0 ? messages[qIdx].content : '';
                              handleShareAnswer(q, i);
                            }}
                            disabled={sharingIdx === i}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-accent transition-colors disabled:opacity-50"
                          >
                            {sharingIdx === i ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                            {sharingIdx === i ? 'Generating…' : 'Share as Image'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Source ayahs */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-400 px-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {mode === 'focused' ? 'Referenced ayahs' : 'Context provided'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((s) => (
                            <Link
                              key={`${s.surahNumber}:${s.ayahNumber}`}
                              href={`/quran/${s.surahNumber}?ayah=${s.ayahNumber}`}
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
                                mode === 'focused'
                                  ? 'border-accent/30 bg-accent-soft text-accent-strong hover:bg-accent-soft'
                                  : 'border-gold/40 bg-gold-soft/40 text-gold-text hover:bg-gold-soft'
                              )}
                            >
                              {s.englishName} {s.surahNumber}:{s.ayahNumber}
                              <ExternalLink className="w-3 h-3 opacity-50" />
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
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setMessages([])}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> New conversation
            </button>
          </div>
        )}

        {/* Input — fixed to viewport so it's always visible.
            On mobile, lift above the bottom tab bar (~3.5rem + safe-area); flush on md+. */}
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="max-w-3xl mx-auto">
          <div className={cn(
            'bg-white border rounded-2xl shadow-lg overflow-hidden transition-all',
            mode === 'focused'
              ? 'border-gray-200 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent-soft'
              : 'border-gray-200 focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold-soft'
          )}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'focused'
                  ? 'Ask about any topic in the Quran…'
                  : 'Ask about any ayah, surah, or topic…'
              }
              rows={2}
              className="w-full px-4 pt-4 pb-2 text-sm md:text-base text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none bg-transparent"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <p className="text-[11px] text-gray-400">Enter to send · Shift+Enter for new line</p>
              <button
                onClick={() => ask(input)}
                disabled={!input.trim() || loading}
                className={cn(
                  'inline-flex items-center gap-1.5 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors',
                  mode === 'focused' ? 'bg-accent hover:bg-accent-strong' : 'bg-gold-text hover:bg-gold-text'
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ask
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Not a substitute for scholarly guidance. Always refer to qualified scholars.
          </p>
          </div>
        </div>

      </div>
    </div>
  );
}
