import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PageLoader } from '@/components/ui/page-loader';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quran.co.in - Your Gateway to the Holy Quran',
  description: 'A modern, beautiful application for reading and studying the Holy Quran',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  other: {
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), web-share=(), window-management=(), local-fonts=(), idle-detection=()',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-JDCEZRC9GF';

  return (
    <html lang="en">
      <head>
        {/* Block device APIs that trigger popups - Must be as early as possible */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){'use strict';try{if(typeof window!=='undefined'){try{window.getScreenDetails=undefined;window.queryLocalFonts=undefined}catch(e){}try{Object.defineProperty(window,'getScreenDetails',{value:undefined,writable:false,configurable:false});Object.defineProperty(window,'queryLocalFonts',{value:undefined,writable:false,configurable:false})}catch(e){}}if(typeof navigator!=='undefined'){try{Object.defineProperty(navigator,'share',{value:undefined,writable:false,configurable:false});Object.defineProperty(navigator,'canShare',{value:undefined,writable:false,configurable:false});Object.defineProperty(navigator,'windowControlsOverlay',{value:undefined,writable:false,configurable:false})}catch(e){}}}catch(e){}})();`,
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
      <body className={inter.className}>
        <AuthProvider>
          <PageLoader />
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
