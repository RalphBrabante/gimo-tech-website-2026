# Implementation and verification

Work remains on `main`, based on remotely verified commit `7163fe2f14a43b8d208abe93e69c5cf0888ad032`. Evidence was collected October 1, 2026 Asia/Manila; JSON reports carry exact UTC timestamps. Nothing was deployed, no production database was accessed or changed, and no real enquiry/email was submitted.

## Source fixed and locally tested

- **Homepage initial HTML:** Angular SSR inside the existing Nest architecture, with request-local TransferState and hydration. The same template/public services supply server HTML and browser enhancement; no second catalogue or hidden SEO copy. Menus/settings/homepage/catalogue failures are independent. Useful fallback copy and contact paths remain; render failures return an HTML 503 with Retry-After. Restoring the quotation bag runs inside Angular's zone after hydration, preserving DOM reuse and interaction updates. Server HTML contains the actual four featured products; the selected add-to-quote product is fetched separately without mutating any server cart.
- **Discovery and identity:** `/products` and self-canonical 24-item pagination, bounded database reads, shared `productPath()` used in public models, catalogue, product schema and sitemap. Tests expose all 29 genuine test records across two pages. No numeric ID is speculatively merged with nylon's 100-piece configuration. Existing aliases remain one-hop 301s. Valid public slash variants normalize, the observed www document alias redirects to configured origin, invalid IDs return HTML 404, and unknown APIs return JSON 404.
- **Truthful commerce:** fixed stars and unapproved price presentation removed. Existing prices, settings and ratings remain stored for administrators. Only exact unchanged historical demo fingerprints are excluded from public lists/details/sitemap and quotation acceptance; edited records survive. The public product API now checks publication status. No stock, review count, manufacturer, Offer or rating claims were invented.
- **Content and metadata:** missing CMS descriptions have a useful fallback; generic products receive Product/BreadcrumbList markup; JSON-LD safely escapes script-closing content. Business facts are centralized in `server/src/common/public-business.json`. Existing nylon title/H1 are retained; separately sold Lazada singles are distinguished from the documented 100-piece pack. Bag ordering guidance now distinguishes printed identifiers from a complete tracking system. Existing guide and QR content remain. Legacy contact/about/quotation destinations are restored while published CMS content takes precedence.
- **Sitemap and robots:** same genuine product projection and configured public origin, XML escaping, canonical de-duplication, accurate available database lastmod and no invented build dates. Fresh reads/no-cache avoid stale publication state. Confirmation/private/action/alias URLs are excluded. APIs remain robots-disallowed because initial public HTML no longer depends on crawling them. No private endpoint was opened.
- **Accessibility and media:** mobile navigation is visible, quotation focus is contained/restored, Escape works, heading levels are repaired, measured contrast issues corrected, tables keyboard-scrollable, and 200% CSS zoom checked. CMS images use actual local dimensions or a reserved aspect ratio with early-image priority. New product uploads create small WebP thumbnails; an explicit dry-run/backfill tool handles older uploads without overwriting originals. Existing Manrope is locally hosted with its SIL license; no external font CSS dependency. Existing 3D behavior and static fallback retained.
- **Measurement:** consent-gated optional same-origin adapter; no hardcoded tracking ID/tag. Product views, Lazada intent, quotation start/success and contact clicks use allowed fields only. Success is emitted after a successful response, never by visiting the confirmation URL. Add-to-quote removes only its own query parameter, retaining attribution/history and saved quantities.

## Actual acceptance results

| Check | Result / evidence |
|---|---|
| Root production build | Passed; `build-results.txt`. Initial browser bundle about 271KB raw / 76KB estimated transfer. Existing budgets unchanged; final build has no budget warnings. |
| Server/data-integrity tests | 15 passed, 0 failed/skipped; `server-test-results.txt`. Includes failure isolation/503, safe schema, demo preservation, sitemap publication changes, origin safety, robots, legacy CMS precedence and image derivatives. |
| Angular tests | 3 passed; `client-test-results.txt`, including catalogue failure retaining independent content. |
| Browser regression groups | 7 passed; `regression-results.json`. Every sitemap canonical checked for unique useful initial metadata, one H1 and parseable schema; no-JS discovery, hydration node reuse, all products, alias/404, attribution, quantities and consent/success semantics. |
| Automated accessibility | Zero reported WCAG A/AA violations across seven representative routes at 360 and 1440px; `accessibility-after.json`. Keyboard dialog/Escape/focus return and 200% CSS zoom passed. Axe incomplete items still require human review; this is not a full conformance certification. |
| Responsive/browser lab | 20 route/viewport observations at 360/768/1024/1440px: no page errors, failed requests or horizontal overflow; `browser-after.json`. Local homepage LCP approximately 104–132ms, CLS 0.0081–0.0163 in these single runs. These are localhost timings, not production comparisons or field CWV. |
| 3D profile | `3d-profile.json`: normal motion ~60 callbacks/sec visible and zero offscreen; reduced motion zero continuous callbacks; forced vendor-asset failure retained useful page content/links and existing static fallback. Device GPU/battery impact was not measured. |
| Public discovery inventory | Production baseline: 20 URLs; final fixture: 52 discovered URLs with status/metadata/link/sitemap evidence. `inventory-before.json`, `inventory-after.json`, `redirects.json`, `host-variants-before.json`. Different datasets, not a claim that 32 production pages were added. |
| Demo dry run | `demo-dry-run.json` shows six exact local fixture matches and 29 preserved test products. Production presence remains unknown. |
| Diff hygiene | `git diff --check` passed. Historical migration files unchanged. |

The browser no-JS and hydration checks use the same SSR document/template. Local sitemap verification enumerates all fixture products, including those beyond the first four. Production raw/rendered differences are attached to inventory rows where an actual Chrome observation exists; unmeasured rows remain explicitly unmeasured.

## Production verified versus unavailable

**Production verified, before change:** read-only HTTP crawl of public pages/robots/sitemap and successful baseline Chrome observations. The initial homepage had no raw H1, legacy URLs/catalogue returned 404, malformed product ID returned 400 JSON, existing aliases worked. See `audit-before.md`.

**Production after change: not verified.** There was no deployment. Late baseline browser requests had transport failures, and a separate probe returned 429. Neither is silently treated as a 404 or a successful check. The public source inventory cannot enumerate unpublished/private production records or prove catalogue completeness.

**Externally blocked:** authorized production DB reconciliation, actual SKU/configuration identity, approved prices/stock/reviews, datasheets/photos/authorship, analytics/consent/provider approval, Search Console and field CWV. MySQL migration execution also remains a staging gate: Docker is installed but its daemon was unavailable, and no other test DB credentials were provided. Migration compare-and-set behavior was tested at the query boundary; an actual MySQL rollout was not claimed.

**Deployment concerns:** ship browser/server bundles together and restart Node; verify CDN HTML rewriting does not disturb hydration, and verify edge caching/compression/forwarded host behavior. The edge's existing HTTP-www redirect needs configuration to achieve a single hop all the way to HTTPS apex. Existing dependency audit findings are recorded in build output; the newly introduced Sharp decoder uses a patched release. No broad framework/dependency migration or security-header exemption was made.

## Changed-file groups and handoff

- Rendering/build: Angular server entry/config/component and `home-renderer.service.ts`; page/module/controller wiring.
- Public data/SEO: shared business/origin/URL/JSON utilities, product projection, sitemap, CMS renderer, legacy/404 middleware and one additive homepage-copy migration.
- Browser UI: navigation/dialog styles, accessible contrast/table behavior, analytics adapter hooks, local Manrope and gallery thumbnails.
- Verification/operations: `server/test/`, `scripts/seo-*`, dry-run tools, the README and this evidence directory.

[Rollout, migration, rollback and post-deployment checklist](production-verification.md) contains exact commands and verification gates. [Owner inputs](owner-inputs.md) lists the evidence needed to close every unresolved business/access dependency. Angular's [official hydration documentation](https://v18.angular.dev/guide/hydration/) describes the DOM-reuse constraints followed here.
