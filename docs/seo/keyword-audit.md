# Google Ads keyword audit — nylon syringe filters (November 2026)

Target keywords supplied by the owner for the Google Ads campaign:

| Keyword | Priority | Landing page |
|---|---|---|
| nylon syringe filter philippines | High | `/products/nylon-syringe-filter-25mm-045um` |
| nylon syringe filter supplier | High | `/products/nylon-syringe-filter-25mm-045um` |
| buy nylon syringe filter | High | `/products/nylon-syringe-filter-25mm-045um` |
| 0.22 micron nylon syringe filter | High | See "0.22 micron" below |
| 0.45 micron nylon syringe filter | High | `/products/nylon-syringe-filter-25mm-045um` |
| syringe filter for HPLC | Medium | `/syringe-filters` (or the nylon page) |
| laboratory syringe filter supplier | Medium | `/syringe-filters` (or the nylon page) |

Method: `scripts/seo-keyword-audit.mjs` fetches every sitemap URL and scores each keyword in the title, H1, meta description and main content. "Exact" means the phrase appears verbatim after unit normalisation (`0.45 µm` = `0.45um` = `0.45 micron`); "partial" means every word appears. Raw data: `keyword-audit-before.json`, `keyword-audit-after.json`.

## Before (Angular/NestJS site, same source as production commit 608a1b7)

- Only the nylon page targeted nylon terms. Its title and H1 used "0.45µm", never "micron"; "supplier" did not appear on the page at all.
- **0.22 micron:** no mention anywhere on the site.
- **laboratory syringe filter supplier:** best match was `/about-gimo` (description only).
- **No on-page lead form on the ad landing page.** The only calls to action were `mailto:` links and Lazada. Google Ads cannot reliably count those as conversions, and many visitors have no mail client configured.
- **Live site returned HTTP 429** from Hostinger's CDN edge (`platform: hostinger`, empty body) after two or three page requests a couple of seconds apart. This was observed on 17 November 2026; see "HTTP 429" below.

## After (Next.js site)

| Keyword | Before: best page / score | After: best page / score | Pages with the exact phrase |
|---|---|---|---|
| nylon syringe filter philippines | nylon page / 7 | nylon page (now leads the title) | — |
| nylon syringe filter supplier | `/` / 1 | nylon page / 9 (H2 + body) | 1 |
| buy nylon syringe filter | nylon page / 10 | nylon page / 12 | 1 |
| 0.22 micron nylon syringe filter | none / 0 | 0.22 vs 0.45 guide / 5 | 2 |
| 0.45 micron nylon syringe filter | nylon page / 16 | nylon page / 16 | 6 |
| syringe filter for HPLC | `/syringe-filters` / 10 | `/syringe-filters` / 12 | 2 |
| laboratory syringe filter supplier | `/about-gimo` / 2 | nylon page / 9 | 3 |

Changes on the nylon landing page:

- **Title:** "Nylon Syringe Filter Philippines | 0.45 Micron 25mm Supplier".
- **H1:** "Nylon Syringe Filter 0.45 Micron".
- **Meta description:** carries "buy", "0.45 micron nylon syringe filters", "in the Philippines" and "laboratory syringe filter supplier".
- **New sections:** a supplier section, a 0.22 vs 0.45 comparison, a membrane comparison, and an 8-question FAQ (with matching FAQPage data).
- **Product structured data:** includes verified properties only.
- **On-page quotation form:** stores the request (`POST /api/product-enquiries`) and redirects to `/quotation-request-received`.
- **Buy links:** Lazada and Shopee, plus a sticky "Request a quote" bar.

## 0.22 micron

The owner confirmed that the supplied product is 0.45 µm only. The site therefore never claims to supply 0.22 µm. It covers the term through:

- an honest FAQ and a comparison block on the nylon page ("not part of this listing; ask us");
- a new guide, `/guides/0-22-vs-0-45-micron-syringe-filters`.

Google Ads recommendation: do not send "0.22 micron nylon syringe filter" traffic to the nylon page as if it were a 0.22 µm product. Either point it at the guide, add it as a negative keyword, or bid only once a 0.22 µm product is actually supplied. Ad copy must not promise 0.22 µm stock.

## HTTP 429

There were two separate sources:

1. **Hostinger CDN edge** (observed live). This is outside the application. Code-side mitigations:
   - Public HTML now carries `s-maxage=120, stale-while-revalidate=600`, so the CDN can serve repeat requests itself.
   - Assets stay long-cached.
   - Pages render from a 30-second in-memory data cache.

   The owner still needs to review the CDN and bot-protection settings in hPanel, and confirm in the Google Ads landing-page diagnostics that AdsBot is not being rate-limited.
2. **Application throttler** (source review). It keyed on `req.ip`, which behind the CDN is a shared edge address, so unrelated visitors and the internal dashboard shared one limit of 100 requests per minute. It now keys on `CF-Connecting-IP`/`True-Client-IP`. The site's own server-side renders bypass it with a per-process token. Quote and enquiry submissions keep a stricter limit of 10 per minute per visitor.

## Not verified here

- Production rendering after deployment.
- Search Console data, Google Ads Quality Score, and field Core Web Vitals.

Measurements in this document come from the local fixture, which uses sample catalogue data.
