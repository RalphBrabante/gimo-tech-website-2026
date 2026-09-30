// Read-only, same-origin HTML/XML crawl. No forms, APIs, action queries or private URLs.
import { writeFile, mkdir } from 'node:fs/promises';
const origin = new URL(process.argv[2] || 'http://127.0.0.1:3100').origin;
const output = process.argv[3] || 'docs/seo/inventory-after.json';
const seed = ['/', '/products', '/syringe-filters', '/products/nylon-syringe-filter-25mm-045um', '/guides/nylon-vs-ptfe-vs-pvdf-vs-mce-syringe-filters', '/biohazard-bags', '/sequential-qr-code-labels', '/lazada-shop', '/quotation-request-received', '/contact-us/', '/about-gimo/', '/request-for-a-quote/', '/product/nylon-syringe-filter-25mm-045um', '/products/nylon-syringe-filter-25mm-0-45um', '/products/nylon-syringe-filter-25mm-045-micron', '/product/not-an-id', '/seo-intentionally-nonexistent', '/robots.txt', '/sitemap.xml'];
const inventory = new Map(seed.map(p => [new URL(p, origin).href, { discoverySources: ['known route inventory'], incomingLinks: [] }]));
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const text = s => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
let rules = [], robotsAvailable = false;
const eligible = u => u.origin === origin && !/^\/(api|internal|uploads|assets)(\/|$)/.test(u.pathname) && (!u.search || /^\?page=\d+$/.test(u.search)) && !/\.(?:js|css|png|jpg|webp|svg|ico|woff2?)$/.test(u.pathname);
function allowed(path) { const matched = rules.filter(r => path.startsWith(r.path)).sort((a,b) => b.path.length-a.path.length || Number(b.allow)-Number(a.allow)); return matched[0]?.allow ?? true; }
async function get(url) {
  const chain = []; let current = url;
  try {
    for(let i=0;i<8;i++) {
      const r = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'GimoReadOnlySEOAudit/1.0' } });
      if(r.status >= 300 && r.status < 400 && r.headers.get('location')) { const next = new URL(r.headers.get('location'), current).href; chain.push({ url: current, status: r.status, location: next }); if(new URL(next).origin !== origin) return {status: chain[0].status, finalUrl: next, redirectChain: chain, externalRedirect: true}; current = next; continue; }
      return { status: chain[0]?.status ?? r.status, finalStatus: r.status, finalUrl: current, redirectChain: chain, contentType: r.headers.get('content-type'), xRobotsTag: r.headers.get('x-robots-tag'), cacheControl: r.headers.get('cache-control'), body: await r.text() };
    }
    return { transportError: 'redirect limit', redirectChain: chain };
  } catch(e) { return { status: null, transportError: `${e.message}: ${e.cause?.code || ''}`, redirectChain: chain }; }
}
const robots = await get(`${origin}/robots.txt`);
if(robots.finalStatus === 200 && robots.body?.includes('User-agent:')) {
  robotsAvailable = true; let active=false;
  for(const line of robots.body.split('\n')) { const m=line.match(/^\s*(User-agent|Allow|Disallow):\s*([^#]*)/i); if(!m) continue; if(m[1].toLowerCase()==='user-agent') active=m[2].trim()==='*'; else if(active && m[2].trim()) rules.push({ path:m[2].trim(),allow:m[1].toLowerCase()==='allow' }); }
}
const sitemap = new Set();
let canonicalOrigin = origin;
for(const [url, item] of inventory) {
  Object.assign(item,{ url, environment: origin, timestamp: new Date().toISOString(), renderedComparison: 'not measured by HTTP crawler' });
  if(!robotsAvailable && !url.endsWith('/robots.txt')) { item.status=null; item.blocked='robots unavailable; crawl withheld'; continue; }
  if(!allowed(new URL(url).pathname)) { item.status=null; item.blocked='robots disallow'; continue; }
  if(!url.endsWith('/robots.txt')) await new Promise(r=>setTimeout(r, 1000));
  const result = url.endsWith('/robots.txt') ? robots : await get(url); const body=result.body || ''; delete result.body; Object.assign(item, result);
  item.canonical = decode(body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] || '');
  if (new URL(url).pathname === '/' && item.canonical) canonicalOrigin = new URL(item.canonical).origin;
  const meta = name => decode(body.match(new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)`, 'i'))?.[1] || '');
  item.title=text(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''); item.description=meta('description'); item.robots=meta('robots'); item.h1=[...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>text(m[1]));
  item.structuredDataTypes=[]; item.jsonLdErrors=[];
  for(const m of body.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) { try { const data=JSON.parse(m[1]); const visit=v=>{ if(!v||typeof v!=='object')return; if(v['@type'])item.structuredDataTypes.push(v['@type']); Object.values(v).forEach(visit); };visit(data); } catch(e) { item.jsonLdErrors.push(e.message); } }
  item.rawHtmlTextLength=text(body.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'')).length;
  const links = [...body.matchAll(/<a\b[^>]*href=["']([^"']+)/gi)].map(m=>decode(m[1]));
  const locs=[...body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>decode(m[1])); locs.forEach(l=>sitemap.add(l));
  for(const [href, source] of [...links.map(l=>[l,'HTML link']),...locs.map(l=>[l,'sitemap'])]) {
    try { const next=new URL(href,result.finalUrl || url); if(source==='sitemap' && next.origin===canonicalOrigin && canonicalOrigin!==origin) { const local=new URL(origin);next.protocol=local.protocol;next.host=local.host; } next.hash=''; if(!eligible(next))continue; const existing=inventory.get(next.href) || { discoverySources:[],incomingLinks:[] }; existing.discoverySources.push(`${source}: ${url}`); if(source==='HTML link') existing.incomingLinks.push(url); inventory.set(next.href,existing); }catch{}
  }
  if(inventory.size>2000) throw new Error('Safety URL cap reached; record completeness limit');
}
for(const item of inventory.values())item.sitemapMembership=sitemap.has(new URL(new URL(item.url).pathname + new URL(item.url).search, canonicalOrigin).href);
await mkdir('docs/seo',{recursive:true});
await writeFile(output,JSON.stringify({ timestamp:new Date().toISOString(), origin, completeness:'Public discovery only. Production DB and rendered-browser differences require separate reconciliation.', urls:[...inventory.values()] },null,2)+'\n');
console.log(`${inventory.size} discovered URLs saved to ${output}`);
