// Lightweight markdown/citation renderer for the Ask answer stream.
// Extracted from app/ask/page.tsx to keep that component focused on chat state.
//
// Supported syntax: ## headings, "- "/"• " bullets, "1." numbered lists,
// ARABIC:/TRANSLATION: verse blocks, [Surah Name, X:Y] deep-link citations,
// and inline **bold** / *italic* emphasis.

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

// Parses "Surah Name, X:Y" → extracts surah + ayah number for a deep link.
function parseCitation(text: string): { surahNumber: number; ayahNumber: number; label: string } | null {
  const m = text.match(/^(.+),\s*(\d+):(\d+)$/);
  if (!m) return null;
  return { surahNumber: parseInt(m[2]), ayahNumber: parseInt(m[3]), label: text };
}

// Renders inline **bold** / *italic* emphasis within a plain text run.
function renderEmphasis(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((t, i) => {
    if (t.length > 4 && t.startsWith('**') && t.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-gray-900">
          {t.slice(2, -2)}
        </strong>
      );
    }
    if (t.length > 2 && t.startsWith('*') && t.endsWith('*')) {
      return <em key={`${keyPrefix}-i-${i}`}>{t.slice(1, -1)}</em>;
    }
    return <span key={`${keyPrefix}-t-${i}`}>{t}</span>;
  });
}

export function renderLine(line: string, key: string): React.ReactNode {
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
                className="inline-flex items-center gap-0.5 text-accent hover:text-accent-strong hover:underline font-medium transition-colors"
              >
                [{cite.label}
                <ExternalLink className="w-3 h-3 opacity-60" />]
              </Link>
            );
          }
        }
        return <span key={i}>{renderEmphasis(part, `${key}-${i}`)}</span>;
      })}
    </span>
  );
}

export function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Section heading: ## Heading
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={`h-${i}`} className="font-reading text-base font-semibold text-ink mt-4 mb-1.5 first:mt-0">
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
        <div key={`ar-${i}`} className="bg-gold-soft/30 border border-gold/30 rounded-xl px-4 py-3 my-2 space-y-2">
          <p lang="ar" dir="rtl"
            className="font-arabic text-right text-xl leading-[2.2] text-gray-800">
            {arabic}
          </p>
          {translation && (
            <p className="text-sm font-reading text-gold-text italic leading-relaxed border-t border-gold/30 pt-2">
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
            <li key={j} className="flex gap-2 text-ink-soft">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
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
            <li key={j} className="flex gap-2 text-ink-soft">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
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
            <li key={j} className="flex gap-2.5 text-ink-soft">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-soft text-accent text-[11px] font-bold flex items-center justify-center mt-0.5">
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
      <p key={`p-${i}`} className="font-reading leading-relaxed text-ink-soft">
        {renderLine(line, `p-${i}`)}
      </p>
    );
    i++;
  }

  return nodes;
}
