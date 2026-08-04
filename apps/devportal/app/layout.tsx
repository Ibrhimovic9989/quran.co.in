import type { Metadata, Viewport } from 'next';
import { Inter, Lora, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/auth/auth-client';
import { SiteHeader } from '@/components/layout/site-header';
import './globals.css';

// UI font — quiet, neutral chrome (matches the main app)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

// Reading font — warm serif for editorial text
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-reading',
  display: 'swap',
});

// Monospace — code blocks and API keys
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const BASE_URL = 'https://developers.quran.co.in';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'quran.co.in Developers — Build with the Qurʾān API',
    template: '%s | quran.co.in Developers',
  },
  description:
    'The free, public quran.co.in API. Read all 114 surahs and 6,236 ayahs, get an API key in seconds, and ship with generous rate limits and an OpenAPI spec.',
  applicationName: 'quran.co.in Developers',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'quran.co.in Developers',
    title: 'Build with the Qurʾān API',
    description:
      'The free, public quran.co.in API — surahs, ayahs, audio and more. Get a key and start building.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build with the Qurʾān API',
    description:
      'The free, public quran.co.in API — surahs, ayahs, audio and more. Get a key and start building.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${lora.variable} ${mono.variable}`}
      >
        <AuthProvider>
          <SiteHeader />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
              <p>© {new Date().getFullYear()} quran.co.in — a free service.</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://quran.co.in"
                  className="transition-colors hover:text-ink"
                >
                  Main app
                </a>
                <a
                  href="https://api.quran.co.in/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  API reference
                </a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
