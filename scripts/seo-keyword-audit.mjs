// Read-only keyword/on-page audit for the Google Ads target terms.
// Usage: node scripts/seo-keyword-audit.mjs [origin] [output.json]
// Fetches robots-allowed public documents from the sitemap only, one at a time with a delay.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const origin = new URL(process.argv[2] || 'http://127.0.0.1:3000').origin;
const output = process.argv[3] || null;
const delayMs = origin.includes('127.0.0.1') || origin.includes('localhost') ? 0 : 1500;
const headers = { 'User-Agent': 'GimoReadOnlySEOAudit/1.1' };

export const KEYWORDS = [
  { term: 'nylon syringe filter philippines', priority: 'High' },
  { term: 'nylon syringe filter supplier', priority: 'High' },
  { term: 'buy nylon syringe filter', priority: 'High' },
  { term: '0.22 micron nylon syringe filter', priority: 'High' },
  { term: '0.45 micron nylon syringe filter', priority: 'High' },
  { term: 'syringe filter for hplc', priority: 'Medium' },
  { term: 'laboratory syringe filter supplier', priority: 'Medium' }
];

// Normalise units and punctuation so "0.45 µm", "0.45um" and "0.45 micron" all match.
const normalise = (s) => s.toLowerCase()
  .replace(/&micro;|µ|μ/g, 'u')
  .replace(/(\d)\s*(?:um|micron|microns|micrometre|micrometer)\b/g, '$1 micron')
  .replace(/[^a-z0-9. ]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const strip = (s) => decode(s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const first = (re, html) => { const m = html.match(re); return m ? decode(m[1]).trim() : null; };
const all = (re, html) => [...html.matchAll(re)].map((m) => strip(m[1]));
// Exact phrase, or every word of the phrase present (partial/"broad" coverage).
function coverage(haystack, term) {
  const h = normalise(haystack || '');
  const t = normalise(term);
  if (h.includes(t)) return 'exact';
  const words = t.split(' ').filter((w) => !['for', 'buy'].includes(w));
  return words.every((w) => h.includes(w)) ? 'partial' : 'none';
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const r = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(20000) });
  return { status: r.status, location: r.headers.get('location'), body: r.status === 200 ? await r.text() : '' };
}

async function main() {
  const sitemap = await fetchText(`${origin}/sitemap.xml`);
  const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(new URL(m[1]).pathname + new URL(m[1]).search, origin).href);
  const pages = [];
  for (const url of urls) {
    await sleep(delayMs);
    const r = await fetchText(url);
    const html = r.body;
    const body = strip(html.match(/<main[\s\S]*<\/main>/i)?.[0] ?? html);
    const title = first(/<title>([\s\S]*?)<\/title>/i, html);
    const description = first(/<meta name="description" content="([^"]*)"/i, html);
    const h1s = all(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, html);
    const h2s = all(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, html);
    const jsonLdTypes = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => {
      try { const d = JSON.parse(m[1]); return (d['@graph'] ?? [d]).map((n) => n['@type']); } catch { return ['INVALID_JSON']; }
    });
    const keywords = Object.fromEntries(KEYWORDS.map(({ term }) => [term, {
      title: coverage(title, term), h1: coverage(h1s.join(' '), term), description: coverage(description, term), body: coverage(body, term)
    }]));
    pages.push({
      url: new URL(url).pathname + new URL(url).search,
      status: r.status,
      title, titleLength: title?.length ?? 0,
      description, descriptionLength: description?.length ?? 0,
      canonical: first(/<link rel="canonical" href="([^"]*)"/i, html),
      robots: first(/<meta name="robots" content="([^"]*)"/i, html),
      h1s, h2Count: h2s.length,
      wordCount: body ? body.split(' ').length : 0,
      ogImage: first(/<meta property="og:image" content="([^"]*)"/i, html),
      jsonLdTypes,
      imagesMissingAlt: [...html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)].length,
      keywords
    });
    process.stderr.write(`${r.status} ${url}\n`);
  }

  // Best page per keyword: weight title/H1 highest.
  const score = (k) => ({ exact: 3, partial: 1, none: 0 })[k];
  const keywordMap = KEYWORDS.map(({ term, priority }) => {
    const ranked = pages.map((p) => ({ url: p.url, s: score(p.keywords[term].title) * 4 + score(p.keywords[term].h1) * 3 + score(p.keywords[term].description) * 2 + score(p.keywords[term].body) }))
      .sort((a, b) => b.s - a.s);
    const best = pages.find((p) => p.url === ranked[0].url);
    return { term, priority, bestPage: ranked[0].s ? ranked[0].url : null, bestScore: ranked[0].s, placement: ranked[0].s ? best.keywords[term] : null, exactAnywhere: pages.filter((p) => Object.values(p.keywords[term]).includes('exact')).map((p) => p.url) };
  });

  const report = { origin, auditedAt: new Date().toISOString(), pageCount: pages.length, keywordMap, pages };
  if (output) { await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2)); }
  console.table(keywordMap.map((k) => ({ keyword: k.term, priority: k.priority, bestPage: k.bestPage, score: k.bestScore, title: k.placement?.title, h1: k.placement?.h1, desc: k.placement?.description, body: k.placement?.body })));
  console.table(pages.map((p) => ({ url: p.url, status: p.status, titleLen: p.titleLength, descLen: p.descriptionLength, h1: p.h1s.length, words: p.wordCount, schema: p.jsonLdTypes.join(',') })));
}

await main();
