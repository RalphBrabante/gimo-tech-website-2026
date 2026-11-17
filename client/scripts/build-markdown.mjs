// Post-build: write a Markdown copy of every exported page (out/<page>.md, homepage out/index.md)
// so AI agents can request text/markdown instead of HTML. Only the page's <main> content is
// converted. Dependency-free; the HTML is our own build output.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const outDir = process.argv[2] || 'out';
const origin = 'https://gimosupplies.com';
const SKIP = new Set(['404.html', '_not-found.html']);

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&');
const inline = (html) => decode(html
  .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const label = inline(text).trim();
    if (!label) return '';
    if (href.startsWith('#')) return label; // in-page anchors mean nothing outside the HTML page
    const url = href.startsWith('/') ? origin + href : href;
    return `[${label}](${url})`;
  })
  .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, text) => `**${inline(text).trim()}**`)
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ''))
  .replace(/\s+/g, ' ');

function toMarkdown(main) {
  let html = main
    .replace(/<(script|style|svg|canvas|noscript|template|iframe|form|button)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<picture\b[\s\S]*?<\/picture>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<[^>]+class="[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/(?:span|p|h2|ul|div)>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Visual duplicates hidden from assistive technology (e.g. animated story captions).
    .replace(/<(ol|ul)\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/gi, '')
    // In-page anchor buttons ("Request a quote" → #quote) are navigation chrome, not content.
    .replace(/<a\b[^>]*href="#[^"]*"[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<a\b[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*href="#[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    // Product tiles and link cards: "- [Heading](url): description" instead of run-together text.
    .replace(/<a\b([^>]*class="[^"]*\b(?:tile|card-link)\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) => {
      const href = attrs.match(/href="([^"]+)"/)?.[1] ?? '';
      const heading = inline(inner.match(/<(h[23]|strong)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2] ?? '').trim();
      const description = inline(inner.match(/<(?:p|span)\b(?![^>]*class="[^"]*(?:eyebrow|link-arrow))[^>]*>([\s\S]*?)<\/(?:p|span)>/i)?.[1] ?? '').trim();
      return heading ? `<li><a href="${href}">${heading}</a>${description ? `: ${description}` : ''}</li>` : '';
    })
    // Big-number highlights: <span class="highlight-value">25<small>mm</small></span><p>Label</p>
    .replace(/<span class="highlight-value"[^>]*>([\s\S]*?)<\/span>\s*<p>([\s\S]*?)<\/p>/gi, (_, value, label) => `<li>${inline(label).trim()}: ${inline(value.replace(/<small>/gi, ' ')).trim()}</li>`);
  const blocks = [];
  const push = (text) => { const t = text.trim(); if (t) blocks.push(t); };
  // Tokenise block-level elements in document order.
  const pattern = /<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>|<summary\b[^>]*>([\s\S]*?)<\/summary>|<li\b[^>]*>([\s\S]*?)<\/li>|<tr\b[^>]*>([\s\S]*?)<\/tr>|<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>|<p\b[^>]*>([\s\S]*?)<\/p>|<a\b[^>]*class="[^"]*\b(?:btn|link-arrow|card-link|tile)\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const [whole, hTag, hText, summary, li, tr, dt, dd, p] = match;
    if (hTag) push(`${'#'.repeat(Number(hTag[1]))} ${inline(hText)}`);
    else if (summary) push(`### ${inline(summary)}`);
    else if (li !== undefined) { if (!/<(li|p|h\d)\b/i.test(li)) push(`- ${inline(li)}`); else push(`- ${inline(li.replace(/<(h\d|p)\b[^>]*>/gi, ' ').replace(/<\/(h\d|p)>/gi, ': ')).trim()}`.replace(/:\s*$/, '')); }
    else if (tr) { const cells = [...tr.matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => inline(c[1]).trim()); if (cells.length) push(`| ${cells.join(' | ')} |`); }
    else if (dt) push(`- **${inline(dt).trim()}**: ${inline(dd).trim()}`);
    else if (p !== undefined) push(inline(p));
    else push(inline(whole));
  }
  // Table header separator after the first row of each run of rows.
  const lines = [];
  for (let i = 0; i < blocks.length; i++) {
    lines.push(blocks[i]);
    if (blocks[i].startsWith('|') && !blocks[i - 1]?.startsWith('|') && blocks[i + 1]?.startsWith('|')) lines.push(`|${' --- |'.repeat(blocks[i].split('|').length - 2)}`);
  }
  return lines.reduce((acc, line, i) => acc + (i === 0 ? '' : (line.startsWith('- ') && lines[i - 1].startsWith('- ')) || (line.startsWith('|') && lines[i - 1].startsWith('|')) ? '\n' : '\n\n') + line, '');
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== '_next') yield* htmlFiles(full); }
    else if (entry.name.endsWith('.html') && !SKIP.has(relative(outDir, full))) yield full;
  }
}

let count = 0;
for await (const file of htmlFiles(outDir)) {
  const html = await readFile(file, 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i)?.[1];
  if (!main) continue;
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? '').trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? '';
  const body = toMarkdown(main);
  const markdown = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\ncanonical: ${canonical}\n---\n\n${body}\n`;
  await writeFile(file.replace(/\.html$/, '.md'), markdown);
  count += 1;
}
console.log(`Markdown: wrote ${count} page${count === 1 ? '' : 's'} to ${outDir}`);
