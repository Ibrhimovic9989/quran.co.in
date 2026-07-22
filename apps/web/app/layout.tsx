import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Scheherazade_New, Amiri, Noto_Naskh_Arabic } from 'next/font/google';
import { WebSiteSchema } from '@/components/seo/json-ld';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PageLoader } from '@/components/ui/page-loader';
import { ToastProvider } from '@/components/ui/toast';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { GAPageTracker } from '@/components/ui/ga-page-tracker';
import { SeasonalThemeApplier } from '@/components/ui/theme/seasonal-theme-applier';
import { SWRegister } from '@/components/ui/sw-register';
import { Suspense } from 'react';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

const scheherazade = Scheherazade_New({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-scheherazade',
  display: 'swap',
});

// Amiri — Saudi/Uthmani Quranic script
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

// Noto Naskh Arabic — Indo-Pak rounded Naskh style
const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-noto-naskh',
  display: 'swap',
});

const BASE_URL = 'https://quran.co.in';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Quran.co.in — Read the Holy Quran Online, Free',
    template: '%s | Quran.co.in',
  },
  description:
    'Read the Holy Quran online in Arabic with English translation, transliteration, audio recitation, and tafsir. All 114 surahs, 6,236 ayahs. Free, beautiful, and fast.',
  keywords: [
    'Quran online', 'read Quran', 'Holy Quran', 'Quran translation', 'Quran in English',
    'Quran Arabic', 'Quran with translation', 'Surah', 'Ayah', 'Islamic app',
    'Quran recitation', 'Quran audio', 'Quran tafsir', 'Quran transliteration',
    'read Quran online free', 'Quran.co.in',
  ],
  authors: [{ name: 'Quran.co.in' }],
  creator: 'Quran.co.in',
  publisher: 'Quran.co.in',
  category: 'religion',
  applicationName: 'Quran.co.in',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Quran.co.in',
    title: 'Quran.co.in — Read the Holy Quran Online, Free',
    description:
      'Read the Holy Quran online in Arabic with English translation, transliteration, audio recitation, and tafsir. All 114 surahs, 6,236 ayahs. Free, beautiful, and fast.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quran.co.in — Read the Holy Quran Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qurancoinn',
    creator: '@qurancoinn',
    title: 'Quran.co.in — Read the Holy Quran Online, Free',
    description:
      'Read the Holy Quran online in Arabic with English translation, audio, and tafsir. All 114 surahs free.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-JDCEZRC9GF';

  return (
    <html lang="en" translate="no">
      <head>
        {/* Suppress browser translate bar — app has its own translations */}
        <meta name="google" content="notranslate" />
        {/* Block device APIs that trigger popups - Must be as early as possible */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){'use strict';try{if(typeof window!=='undefined'){try{window.getScreenDetails=undefined;window.queryLocalFonts=undefined}catch(e){}try{Object.defineProperty(window,'getScreenDetails',{value:undefined,writable:false,configurable:false});Object.defineProperty(window,'queryLocalFonts',{value:undefined,writable:false,configurable:false})}catch(e){}}if(typeof navigator!=='undefined'){try{Object.defineProperty(navigator,'windowControlsOverlay',{value:undefined,writable:false,configurable:false})}catch(e){}}}catch(e){}})();`,
          }}
        />
        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${scheherazade.variable} ${amiri.variable} ${notoNaskh.variable}`}>
        <WebSiteSchema />
        <SeasonalThemeApplier />
        <SWRegister />
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
              <GAPageTracker measurementId={gaMeasurementId} />
            </Suspense>
            <PageLoader />
            <Navbar />
            <div className="pb-16 md:pb-0">
              {children}
              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
