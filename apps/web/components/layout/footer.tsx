import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function Footer({ className }: { className?: string }) {
  return <footer className={cn('border-t border-line bg-paper px-4 py-5 text-xs text-muted sm:px-6', className)}>
    <div className="mx-auto max-w-[832px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>Quran.co.in · Free for everyone</p>
        <Link href="/about" className="inline-flex min-h-11 items-center hover:text-accent">About this project</Link>
      </div>
      <details>
        <summary className="w-fit cursor-pointer py-2">Help & information</summary>
        <nav aria-label="Footer" className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          {[['/contact','Contact'],['/help','Help'],['/faq','FAQs'],['/privacy','Privacy'],['/terms','Terms']].map(([href,label]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-accent">{label}</Link>)}
        </nav>
      </details>
    </div>
  </footer>;
}
