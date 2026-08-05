// Ping IndexNow (Bing + Yandex) with every URL in our sitemap so they recrawl
// fast — this is our largest traffic source (Bing also feeds ChatGPT).
//
//   node scripts/indexnow.mjs
//
// Runs manually and automatically from .github/workflows/indexnow.yml on every
// push to main that touches the web app. No auth needed — IndexNow verifies via
// the public key file hosted at https://quran.co.in/<KEY>.txt.

const HOST = 'quran.co.in';
const KEY = '989f6f13d2fd3e8bad7a7478b2b4dbdd'; // public; matches /public/<KEY>.txt
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

const xml = await (await fetch(SITEMAP)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
  console.error('No <loc> URLs found in the sitemap — aborting.');
  process.exit(1);
}

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList,
});

for (const ep of ENDPOINTS) {
  try {
    const r = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
    });
    console.log(`${ep} -> HTTP ${r.status}`);
  } catch (e) {
    console.log(`${ep} -> ERROR ${e.message}`);
  }
}
console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
