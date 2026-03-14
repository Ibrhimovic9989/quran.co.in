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
    'permissions-policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), web-share=(), clipboard-read=(), clipboard-write=(), window-management=(), window-placement=(), local-fonts=(), idle-detection=()',
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
        {/* CRITICAL: Block Web Share API IMMEDIATELY - Must be FIRST in head */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){'use strict';try{if(typeof window!=='undefined'){try{delete window.getScreenDetails;window.getScreenDetails=undefined;delete window.queryLocalFonts;window.queryLocalFonts=undefined}catch(e){}try{Object.defineProperty(window,'getScreenDetails',{get:function(){return undefined},configurable:false});Object.defineProperty(window,'queryLocalFonts',{get:function(){return undefined},configurable:false})}catch(e){}}if(typeof navigator!=='undefined'){try{delete navigator.share;delete navigator.canShare;delete navigator.windowControlsOverlay}catch(e){}try{Object.defineProperty(navigator,'share',{get:function(){return undefined},set:function(){},configurable:false});Object.defineProperty(navigator,'canShare',{get:function(){return undefined},set:function(){},configurable:false});Object.defineProperty(navigator,'windowControlsOverlay',{get:function(){return undefined},configurable:false})}catch(e){}}}catch(e){}})();`,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                // Block IMMEDIATELY - before anything else can run
                try {
                  if (typeof window !== 'undefined') {
                    try { delete window.getScreenDetails; window.getScreenDetails = undefined; } catch(e) {}
                    try {
                      Object.defineProperty(window, 'getScreenDetails', {
                        get: function() { return undefined; },
                        configurable: false
                      });
                    } catch(e) {}
                  }
                  if (typeof navigator !== 'undefined') {
                    // Delete first
                    try { delete navigator.share; } catch(e) {}
                    try { delete navigator.canShare; } catch(e) {}
                    
                    // Block with defineProperty - make it completely inaccessible
                    try {
                      Object.defineProperty(navigator, 'share', {
                        get: function() { 
                          return undefined; 
                        },
                        set: function() {},
                        configurable: false,
                        enumerable: false,
                        writable: false
                      });
                    } catch(e) {}
                    
                    try {
                      Object.defineProperty(navigator, 'canShare', {
                        get: function() { 
                          return undefined; 
                        },
                        set: function() {},
                        configurable: false,
                        enumerable: false,
                        writable: false
                      });
                    } catch(e) {}
                    
                    // Block via prototype if possible
                    try {
                      if (navigator.__proto__) {
                        Object.defineProperty(navigator.__proto__, 'share', {
                          get: function() { return undefined; },
                          set: function() {},
                          configurable: false,
                          enumerable: false
                        });
                        Object.defineProperty(navigator.__proto__, 'canShare', {
                          get: function() { return undefined; },
                          set: function() {},
                          configurable: false,
                          enumerable: false
                        });
                      }
                    } catch(e) {}
                  }
                } catch(e) {}
                
                // Also block on window load event
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', function() {
                    try {
                      if (typeof window.getScreenDetails !== 'undefined') {
                        window.getScreenDetails = undefined;
                      }
                      if (navigator.share !== undefined) {
                        Object.defineProperty(navigator, 'share', {
                          get: function() { return undefined; },
                          configurable: false
                        });
                      }
                      if (navigator.canShare !== undefined) {
                        Object.defineProperty(navigator, 'canShare', {
                          get: function() { return undefined; },
                          configurable: false
                        });
                      }
                    } catch(e) {}
                  }, true);
                }
              })();
            `,
          }}
        />
        {/* Prevent permission popups - Block ALL device access requests including Web Share API */}
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), web-share=(), clipboard-read=(), clipboard-write=(), ambient-light-sensor=(), autoplay=(), battery=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), gamepad=(), keyboard-map=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), xr-spatial-tracking=(), window-management=(), window-placement=(), local-fonts=(), idle-detection=(), keyboard-map=()" />
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
        {/* Additional blocking script with beforeInteractive strategy */}
        <Script
          id="block-web-share-api"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                try {
                  if (typeof window !== 'undefined') {
                    try { window.getScreenDetails = undefined; window.queryLocalFonts = undefined; } catch(e) {}
                  }
                  if (typeof navigator !== 'undefined') {
                    try { delete navigator.share; } catch(e) {}
                    try { delete navigator.canShare; } catch(e) {}
                    try { delete navigator.windowControlsOverlay; } catch(e) {}
                    Object.defineProperty(navigator, 'share', { get: function() { return undefined; }, configurable: false });
                    Object.defineProperty(navigator, 'canShare', { get: function() { return undefined; }, configurable: false });
                    Object.defineProperty(navigator, 'windowControlsOverlay', { get: function() { return undefined; }, configurable: false });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
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
