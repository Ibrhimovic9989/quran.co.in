// Splits the developer portal across two subdomains (the "big-4" pattern):
//   developers.quran.co.in          → the public landing / docs
//   console.developers.quran.co.in  → the authenticated console (keys, OAuth apps)
//
// One Next.js app, one deploy, routed by hostname. The auth cookie is on
// `.quran.co.in`, so the session is shared across both subdomains. On localhost
// and Vercel preview URLs we serve everything (no split) so dev still works.

import { NextResponse, type NextRequest } from 'next/server';

const LANDING_HOST = 'developers.quran.co.in';
const CONSOLE_HOST = 'console.developers.quran.co.in';

// Routes that belong to the console (everything else is landing/docs).
const CONSOLE_PATHS = ['/dashboard', '/apps'];

function isConsolePath(pathname: string): boolean {
  return CONSOLE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const { pathname, search } = req.nextUrl;

  // Only enforce the split on the real production hosts; localhost / *.vercel.app
  // previews serve every route so development and preview deploys keep working.
  if (host !== LANDING_HOST && host !== CONSOLE_HOST) {
    return NextResponse.next();
  }

  const onConsole = host === CONSOLE_HOST;

  if (onConsole) {
    // Console home → the dashboard.
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Landing/docs pages don't live on the console → send them to the landing.
    if (!isConsolePath(pathname)) {
      return NextResponse.redirect(`https://${LANDING_HOST}${pathname}${search}`);
    }
    return NextResponse.next();
  }

  // On the landing host: console pages live on the console subdomain.
  if (isConsolePath(pathname)) {
    return NextResponse.redirect(`https://${CONSOLE_HOST}${pathname}${search}`);
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and files with an extension.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
