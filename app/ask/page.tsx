'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Loader2, RotateCcw, ExternalLink, Globe, Focus, Share2, Image, Download } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

type Mode = 'focused' | 'open';

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

const SUGGESTED: Record<Mode, string[]> = {
  focused: [
    'What does the Quran say about patience in hardship?',
    'Which ayahs speak about forgiveness and mercy?',
    'What does the Quran say about parents?',
    'Ayahs about gratitude and being thankful to Allah',
    'What does the Quran say about honesty?',
    'Verses about seeking knowledge',
  ],
  open: [
    'Explain Surah Al-Fatiha',
    'What is Ayah Al-Kursi (2:255)?',
    'What does Surah Al-Baqarah 2:214 say?',
    'Explain the last two ayahs of Surah Al-Baqarah',
    'What is the meaning of Surah Al-Ikhlas?',
    'What are the duas for parents in the Quran?',
  ],
};

const LOADING_STEPS = [
  'Searching through 6,236 ayahs…',
  'Reading the most relevant verses…',
  'Cross-referencing themes…',
  'Analyzing Quranic context…',
  'Composing your answer…',
];

// ── Markdown / citation renderer ──────────────────────────────────────────────

// Parses [Surah Name, X:Y] → extracts surah + ayah number for deep link
function parseCitation(text: string): { surahNumber: number; ayahNumber: number; label: string } | null {
  const m = text.match(/^(.+),\s*(\d+):(\d+)$/);
  if (!m) return null;
  return { surahNumber: parseInt(m[2]), ayahNumber: parseInt(m[3]), label: text };
}

function renderLine(line: string, key: string): React.ReactNode {
  // Split on citation pattern [Name, X:Y]
  const parts = line.split(/(\[[^\]]+,\s*\d+:\d+\])/g);
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const inner = part.slice(1, -1);
          const cite = parseCitation(inner);
          if (cite) {
            return (
              <Link
                key={i}
                href={`/quran/${cite.surahNumber}?ayah=${cite.ayahNumber}`}
                className="inline-flex items-center gap-0.5 text-purple-600 hover:text-purple-800 hover:underline font-medium transition-colors"
              >
                [{cite.label}
                <ExternalLink className="w-3 h-3 opacity-60" />]
              </Link>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Section heading: ## Heading
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={`h-${i}`} className="text-base font-semibold text-gray-900 mt-4 mb-1.5 first:mt-0">
          {line.slice(3)}
        </h3>
      );
      i++;
      continue;
    }

    // Arabic text line: ARABIC: <text>  (optionally followed by TRANSLATION: <text>)
    if (line.startsWith('ARABIC:')) {
      const arabic = line.slice(7).trim();
      let translation: string | null = null;
      if (i + 1 < lines.length && lines[i + 1].startsWith('TRANSLATION:')) {
        translation = lines[i + 1].slice(12).trim();
        i++; // consume the TRANSLATION line too
      }
      nodes.push(
        <div key={`ar-${i}`} className="bg-amber-50/60 border border-amber-100 rounded-xl px-4 py-3 my-2 space-y-2">
          <p lang="ar" dir="rtl"
            className="font-arabic text-right text-xl leading-[2.2] text-gray-800">
            {arabic}
          </p>
          {translation && (
            <p className="text-sm text-amber-800/80 italic leading-relaxed border-t border-amber-100 pt-2">
              {translation}
            </p>
          )}
        </div>
      );
      i++;
      continue;
    }

    // Bullet list block: lines starting with "- "
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
              <span className="leading-relaxed">{renderLine(item, `li-${j}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Bullet with • character
    if (line.startsWith('• ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('• ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul2-${i}`} className="space-y-1.5 my-2 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
              <span className="leading-relaxed">{renderLine(item, `li2-${j}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: "1. text", "2. text" etc.
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
                {j + 1}
              </span>
              <span className="leading-relaxed">{renderLine(item, `ol-${j}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line → spacing
    if (line.trim() === '') {
      nodes.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph line
    nodes.push(
      <p key={`p-${i}`} className="leading-relaxed text-gray-800">
        {renderLine(line, `p-${i}`)}
      </p>
    );
    i++;
  }

  return nodes;
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
      <div className="flex items-center gap-2 text-purple-500">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        <span className="text-sm font-medium transition-all duration-300">{LOADING_STEPS[step]}</span>
      </div>
      <div className="flex gap-1 pl-6">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-0.5 rounded-full transition-all duration-500',
              i <= step ? 'bg-purple-400 w-6' : 'bg-gray-200 w-3'
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

      const res = await fetch('/api/quran/ask', {
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

  const handleShareAnswer = async (question: string, answer: string, idx: number) => {
    setSharingIdx(idx);
    try {
      const res = await fetch('/api/og/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const file = new File([blob], 'quran-answer.png', { type: 'image/png' });

      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ask the Quran — Quran.co.in',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quran-answer.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch { /* user cancelled or error */ }
    finally { setSharingIdx(null); }
  };

  const accentClass = mode === 'focused' ? 'purple' : 'emerald';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 pb-44 md:pb-48">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-100 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
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
                mode === 'focused' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Focus className="w-3.5 h-3.5" /> Focused
            </button>
            <button
              onClick={() => switchMode('open')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                mode === 'open' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                  ? 'bg-purple-50 text-purple-600 border border-purple-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
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
                        ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 text-gray-600 hover:text-purple-700'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-gray-600 hover:text-emerald-700'
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
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    {/* Answer bubble */}
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                      {msg.content ? (
                        <div className="text-sm md:text-base space-y-0.5">
                          {renderMarkdown(msg.content)}
                        </div>
                      ) : (
                        <LoadingIndicator />
                      )}

                      {/* Share as Image button */}
                      {msg.content && !loading && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => {
                              // Find the user question for this answer
                              const qIdx = i - 1;
                              const q = qIdx >= 0 ? messages[qIdx].content : '';
                              handleShareAnswer(q, msg.content, i);
                            }}
                            disabled={sharingIdx === i}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                          >
                            {sharingIdx === i ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Image className="w-3.5 h-3.5" />
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
                                  ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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

        {/* Input — fixed to viewport so it's always visible */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="max-w-3xl mx-auto">
          <div className={cn(
            'bg-white border rounded-2xl shadow-lg overflow-hidden transition-all',
            mode === 'focused'
              ? 'border-gray-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100'
              : 'border-gray-200 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100'
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
                  mode === 'focused' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
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
