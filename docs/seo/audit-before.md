# Technical SEO baseline

Baseline commit: `7163fe2f14a43b8d208abe93e69c5cf0888ad032`, main. Remote main was verified with `git ls-remote` and matched. Inspection began October 1, 2026 Asia/Manila (September 30 UTC); each JSON observation contains its own UTC timestamp. The worktree was initially clean.

## Evidence and scope

`inventory-before.json` records 20 discovered public URLs using known routes, public HTML links and the production sitemap. It records HTTP status, final URL/chain, content type, metadata, H1, schema types, incoming links, sitemap membership and failures. The crawler fetched robots first, waited one second between documents, and did not fetch disallowed APIs, submit forms or access databases. The initial sandbox DNS failures and web-tool fetch failure were transport failures, not 404s; authorized network access subsequently returned robots and documents.

The observed sitemap/HTML did not expose any numeric product URL. That is **not** evidence that the production product table is empty. No production DB records, draft pages, enquiries, users or private data were accessed. Production catalogue/CMS completeness remains unverified. The six electronics in the historical migration are confirmed fixtures in source only; their presence in production is unknown.

## Runtime-confirmed findings

- `/` returned 200 but no raw-HTML H1 or meaningful body. Chrome subsequently rendered a homepage: the initial/rendered-content gap is confirmed.
- `/products` and legacy `/contact-us/`, `/about-gimo/`, `/request-for-a-quote/` returned real HTML 404s.
- The category, nylon product, comparison guide, bag, QR-label and Lazada pages returned 200 with visible initial H1s.
- The three existing nylon aliases returned one-hop 301s to the dedicated page. Preserve them.
- `/product/not-an-id` returned JSON 400. The intentionally nonexistent page returned HTML 404.
- `robots.txt` blocks `/api/`, although the original homepage required public API responses to populate content.
- `host-variants-before.json`: HTTP apex redirects to HTTPS apex; HTTPS www serves 200; HTTP www redirects to HTTPS www. A later slash probe returned **429**, not 404. Do not disable throttling or infer crawler blocking from this.

## Source-confirmed findings

- Homepage products request can discard all independent `forkJoin` results; only four products are linked; fixed stars and numeric prices imply unsupported review/offer facts.
- Add-to-quote removes all attribution parameters.
- Generic products have no Product/BreadcrumbList schema; raw JSON.stringify allows script-closing content in JSON-LD.
- Sitemap reads active products independently of product identity/publication rules and caches for an hour with a day of stale serving.
- CMS metadata can be empty; images reserve no intrinsic space; gallery thumbnails reuse originals.
- At widths below 900px homepage primary navigation is hidden without replacement.
- Public product detail API uses the unrestricted internal lookup and can return an inactive record.
- Existing protection includes real 404 routes, Helmet, authenticated internal APIs, HTML noindex on internal pages, hashed asset caching, and offscreen/reduced-motion safeguards in the category 3D feature.

## Baseline lab measurements

`browser-before.json` contains actual Chrome lab observations at 360, 768, 1024 and 1440px. These are single runs without CPU/network emulation, not Lighthouse or field Core Web Vitals. Successful homepage observations: LCP 1248–1900ms, CLS about 0.0056–0.0278. Category mobile LCP was 3628ms in one run. Four late desktop navigations failed and remain explicit null-status transport errors. A separate HTTP request observed 429; exact attribution to edge vs application cannot be established. No further public crawling was performed after this evidence.

Local after-change timings use a different origin/network and fixture data and cannot establish a production performance improvement. Field INP and p75 CWV, Search Console, PageSpeed and production DB reconciliation were unavailable.

`preflight-errors.json` retains preliminary transport failures whose exact request timestamps were not preserved. Their later successful retries do not turn the failed attempts into HTTP passes.
