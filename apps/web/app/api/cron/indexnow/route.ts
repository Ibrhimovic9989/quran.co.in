// Daily Vercel Cron (see apps/web/vercel.json): re-submit every sitemap URL to
// IndexNow so Bing + Yandex keep our pages fresh (our biggest traffic source;
// Bing also feeds ChatGPT). No auth needed for IndexNow — it verifies via the
// public key file at /<KEY>.txt.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HOST = 'quran.co.in';
const KEY = '989f6f13d2fd3e8bad7a7478b2b4dbdd'; // public; matches /public/<KEY>.txt
const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

export async function GET(request: Request) {
  // If CRON_SECRET is set, only allow Vercel Cron (which sends it) to run this.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const xml = await (await fetch(`https://${HOST}/sitemap.xml`, { cache: 'no-store' })).text();
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urlList.length === 0) {
    return NextResponse.json({ error: 'No URLs in sitemap' }, { status: 500 });
  }

  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  });

  const results: Record<string, number | string> = {};
  await Promise.all(
    ENDPOINTS.map(async (ep) => {
      try {
        const r = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body,
        });
        results[ep] = r.status;
      } catch (e) {
        results[ep] = e instanceof Error ? e.message : 'error';
      }
    }),
  );

  return NextResponse.json({ submitted: urlList.length, results });
}
