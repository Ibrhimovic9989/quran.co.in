// Tafsir Content Component
// Renders tafsir content with proper formatting for Arabic text, quotes, and markdown
// Follows Atomic Design - Molecule component

'use client';

import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils/cn';

interface TafsirContentProps {
  content: string;
  className?: string;
}

// Detect if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

// Process content to detect and style Arabic text blocks and quotes
const processContent = (content: string): string => {
  // First, handle Arabic quotes with English translations in parentheses
  // Pattern: «Arabic text» (English translation)
  let processed = content.replace(
    /«([^»]+)»\s*\(([^)]+)\)/g,
    '\n\n<div class="tafsir-quote-block"><div class="tafsir-arabic-quote">«$1»</div><div class="tafsir-quote-translation">($2)</div></div>\n\n'
  );
  
  // Handle standalone Arabic quotes (without translation)
  processed = processed.replace(
    /«([^»]+)»/g,
    (match) => {
      // Only replace if not already in a quote block
      if (!match.includes('tafsir-quote-block')) {
        return `\n\n<div class="tafsir-arabic-quote">${match}</div>\n\n`;
      }
      return match;
    }
  );
  
  // Split into lines for block-level processing
  const lines = processed.split('\n');
  const result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (!line) {
      result.push('');
      continue;
    }
    
    // Skip if already processed as quote
    if (line.includes('tafsir-quote-block') || line.includes('tafsir-arabic-quote')) {
      result.push(line);
      continue;
    }
    
    // Check if line is primarily Arabic (more than 30% Arabic characters)
    const arabicChars = (line.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = line.replace(/<[^>]+>/g, '').length; // Remove HTML tags for counting
    const isArabicBlock = totalChars > 0 && arabicChars / totalChars > 0.3;
    
    if (isArabicBlock && !line.includes('<div')) {
      // Wrap Arabic text in special div
      result.push(`<div class="tafsir-arabic-block">${line}</div>`);
    } else {
      // Regular text
      result.push(line);
    }
  }
  
  return result.join('\n');
};

export function TafsirContent({ content, className }: TafsirContentProps) {
  // Process content to identify Arabic blocks and quotes
  const processedContent = processContent(content);
  
  return (
    <div className={cn('tafsir-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Style paragraphs - with better spacing and HTML support
          p: ({ children }) => {
            // Check if paragraph contains HTML (our processed quotes/blocks)
            const childrenStr = String(children);
            if (childrenStr.includes('<div class="tafsir-')) {
              // Render HTML directly for processed content
              return <div className="mb-4 last:mb-0" dangerouslySetInnerHTML={{ __html: childrenStr }} />;
            }
            return (
              <p className="mb-4 leading-relaxed text-gray-700 last:mb-0">
                {children}
              </p>
            );
          },
          // Style headings
          h2: ({ children }) => (
            <h2 className="text-black text-xl font-semibold mt-6 mb-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-black text-lg font-semibold mt-4 mb-2">
              {children}
            </h3>
          ),
          // Style strong text
          strong: ({ children }) => (
            <strong className="text-black font-semibold">{children}</strong>
          ),
          // Style emphasis
          em: ({ children }) => (
            <em className="text-gray-700 italic">{children}</em>
          ),
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
              {children}
            </blockquote>
          ),
          // Style lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          // Style code blocks
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-100 p-4 rounded mb-4 overflow-x-auto text-sm text-gray-800">
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
