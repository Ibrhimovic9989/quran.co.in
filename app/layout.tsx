import type { Metadata, Viewport } from 'next';
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
    'permissions-policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), web-share=()',
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
        {/* CRITICAL: Block Web Share API IMMEDIATELY - Must run before ANY other script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                try {
                  // Block navigator.share completely - prevent browser from detecting it
                  if (typeof navigator !== 'undefined') {
                    try {
                      delete navigator.share;
                    } catch(e) {}
                    try {
                      delete navigator.canShare;
                    } catch(e) {}
                    Object.defineProperty(navigator, 'share', {
                      get: function() { return undefined; },
                      set: function() {},
                      configurable: false,
                      enumerable: false
                    });
                    Object.defineProperty(navigator, 'canShare', {
                      get: function() { return undefined; },
                      set: function() {},
                      configurable: false,
                      enumerable: false
                    });
                  }
                } catch(e) {
                  // Silently fail if blocking fails
                }
              })();
            `,
          }}
        />
        {/* Prevent permission popups - Block ALL device access requests including Web Share API */}
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), web-share=(), ambient-light-sensor=(), autoplay=(), battery=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), gamepad=(), keyboard-map=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), xr-spatial-tracking=()" />
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
