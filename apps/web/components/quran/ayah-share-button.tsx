'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Code2, Copy, Facebook, Link2, MessageCircle, Send, Share2, X, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils/cn';

interface AyahShareButtonProps {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translationText: string;
  iconOnly?: boolean;
}

interface ShareOption {
  id: string;
  label: string;
  icon: typeof Facebook;
  onClick: () => void;
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function AyahShareButton({
  surahNumber,
  ayahNumber,
  surahName,
  arabicText,
  translationText,
  iconOnly = false,
}: AyahShareButtonProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const deepLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return `/quran/${surahNumber}?ayah=${ayahNumber}`;
    }

    return `${window.location.origin}/quran/${surahNumber}?ayah=${ayahNumber}`;
  }, [ayahNumber, surahNumber]);

  const shareTitle = useMemo(
    () => `Quran ${surahNumber}:${ayahNumber} - ${surahName}`,
    [ayahNumber, surahName, surahNumber]
  );

  const shareText = useMemo(() => {
    const excerpt = truncateText(translationText || arabicText, 180);
    return `${shareTitle}\n${excerpt}\n\nRead this ayah: ${deepLink}`;
  }, [arabicText, deepLink, shareTitle, translationText]);

  const embedCode = useMemo(() => {
    return `<blockquote cite="${deepLink}">
  <p>${escapeHtml(arabicText)}</p>
  <p>${escapeHtml(translationText)}</p>
  <footer>${escapeHtml(shareTitle)} · <a href="${deepLink}">${deepLink}</a></footer>
</blockquote>`;
  }, [arabicText, deepLink, shareTitle, translationText]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]') || []).filter(element => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!copyMessage) return;

    const timer = window.setTimeout(() => setCopyMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=700,height=700');
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const copyToClipboard = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(message);
    } catch (error) {
      console.error('Error copying share content:', error);
      setCopyMessage('Unable to copy right now');
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      onClick: () =>
        openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deepLink)}`),
    },
    {
      id: 'x',
      label: 'X',
      icon: XIcon,
      onClick: () =>
        openShareWindow(
          `https://x.com/intent/post?text=${encodeURIComponent(`${shareTitle}\n${deepLink}`)}`
        ),
    },
    {
      id: 'whatsapp',
      label: 'Whatsapp',
      icon: MessageCircle,
      onClick: () => openShareWindow(`https://wa.me/?text=${encodeURIComponent(shareText)}`),
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: Send,
      onClick: () =>
        openShareWindow(
          `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(
            `${shareTitle}\n${truncateText(translationText || arabicText, 180)}`
          )}`
        ),
    },
    {
      id: 'copy-link',
      label: 'Copy link',
      icon: Link2,
      onClick: () => {
        copyToClipboard(deepLink, 'Ayah link copied');
      },
    },
    {
      id: 'copy-embed',
      label: 'Copy Embed',
      icon: Code2,
      onClick: () => {
        copyToClipboard(embedCode, 'Embed code copied');
      },
    },
    {
      id: 'copy-text',
      label: 'Copy text',
      icon: Copy,
      onClick: () => {
        copyToClipboard(shareText, 'Ayah text copied');
      },
    },
  ];

  const handleShareOptionClick = async (onClick: () => void) => {
    onClick();
    closeDialog();
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2',
          iconOnly &&
            'h-9 w-9 rounded-full border-line bg-surface p-0 text-ink-muted hover:bg-accent-soft/50 hover:text-accent-strong'
        )}
        aria-label="Send ayah"
        title="Send ayah"
      >
        <Share2 className="w-4 h-4" />
        {!iconOnly && <span>Send</span>}
      </Button>

      {isMounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 px-0 py-0 md:items-center md:px-3 md:py-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Send ${shareTitle}`}
            onClick={closeDialog}
          >
            <div
              ref={dialogRef}
              className="relative max-h-[85dvh] w-full overflow-y-auto rounded-t-[1.75rem] border border-line bg-surface px-4 pb-5 pt-4 shadow-card-hover md:mx-auto md:max-h-[calc(100vh-2rem)] md:max-w-2xl md:rounded-[2rem] md:px-8 md:pb-8 md:pt-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line md:hidden" />
              <button
                type="button"
                aria-label="Close send dialog"
                className="absolute right-3 top-3 z-10 rounded-full bg-surface/90 p-2 text-ink-muted transition-colors hover:bg-accent-soft/60 hover:text-accent-strong md:right-4 md:top-4"
                onClick={closeDialog}
              >
                <X className="w-6 h-6 md:w-7 md:h-7" />
              </button>

              <div className="mx-auto max-w-xl text-center">
                <h2 className="pr-10 font-heading text-lg font-bold tracking-[-0.025em] text-ink md:pr-0 md:text-2xl">
                  Share this verse
                </h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink-muted md:mt-3 md:text-xs">
                  {shareTitle}
                </p>
                <p className="mt-3 font-arabic text-lg leading-loose text-ink md:mt-4 md:text-3xl">
                  {truncateText(arabicText, 90)}
                </p>
                <p className="mt-2 text-[13px] leading-[1.75] text-ink-soft md:mt-3 md:text-[15px]">
                  {truncateText(translationText, 120)}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 md:mt-8 md:grid-cols-4 md:gap-3">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleShareOptionClick(option.onClick)}
                      className={cn(
                        'flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-3 text-center transition-all',
                        'hover:border-accent/30 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-paper'
                      )}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white md:h-12 md:w-12">
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                      </span>
                      <span className="text-[11px] font-semibold leading-tight text-ink">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-surface-warm px-4 py-3 text-center text-[11px] text-ink-muted md:mt-6">
                {copyMessage ?? 'Deep link sends open this exact ayah in the app.'}
              </div>

              <div className="mt-4 flex justify-center pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden">
                <Button type="button" variant="ghost" size="sm" onClick={closeDialog} className="min-w-24 rounded-full">
                  Close
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
