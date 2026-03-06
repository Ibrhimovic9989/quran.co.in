'use client';

import { useEffect, useMemo, useState } from 'react';
import { Code2, Copy, Facebook, Link2, MessageCircle, Send, Share2, X, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils/cn';

interface AyahShareButtonProps {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translationText: string;
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
}: AyahShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

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
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
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

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Share ${shareTitle}`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl md:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close share dialog"
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-7 h-7" />
            </button>

            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 md:text-5xl">Share this Ayah</h2>
              <p className="mt-4 text-base text-gray-600 md:text-xl">
                {shareTitle}
              </p>
              <p className="mt-4 font-arabic text-2xl leading-loose text-gray-900 md:text-4xl">
                {truncateText(arabicText, 140)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-lg">
                {truncateText(translationText, 220)}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-10 md:grid-cols-7">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={option.onClick}
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-2xl p-3 text-center transition-colors',
                      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                    )}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="text-sm font-medium text-gray-800">{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
              {copyMessage ?? 'Deep link shares open this exact ayah in the app.'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
