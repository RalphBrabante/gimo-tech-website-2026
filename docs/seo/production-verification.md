# Rollout and production verification

## Before deployment

1. Review the diff and owner inputs. Back up the database and uploaded media. Reconcile active products/published pages with `inventory-before.json`; use no customer/admin data in public reports.
2. Deploy on an isolated staging database first. `npm ci && npm run build` must pass. Retain both `client/dist/client/browser` **and** `client/dist/client/server`; Nest loads Angular's ESM server bundle. Deploy the two atomically and restart Node to avoid cached server/browser bundle mismatches. `npm start`, Hostinger PORT and root server.js remain unchanged.
3. Set `PUBLIC_BASE_URL=https://gimosupplies.com` (origin only). Keep AUTH_SECRET, mail and database credentials private. Do not point fixture/test scripts at production. The fixture imports neither the production app/database module nor a mail transport.
4. One additive migration, `1790812800000-refine-public-homepage-copy`, updates only exact historical homepage hero/location text using parameterized compare-and-set SQL. It does not remove products or change prices. Review affected rows using SELECT on homepage_sections before allowing normal startup migrations. Docker was installed but its daemon was unavailable, so production or staging MySQL execution was not performed here; staging execution is a deployment gate.
5. Historical migrations remain untouched. New installations still execute historical demo seeds, which public projection hides only while fingerprints remain unchanged. Do not use demonstration records as genuine stock. Future fixtures belong in `server/test/`, not publication migrations.
6. Review installed dependency audit findings separately. Build output reported existing Angular/dependency vulnerabilities; this change does not claim to remediate the entire dependency tree or perform a framework migration.

## Safe operator procedures

- Demo dry run: export only the authorized products and image/edit-ownership fields to a private local JSON file. Run `node server/scripts/seo-demo-report.cjs /private/path/products.json`. Missing evidence is not proof of unchanged demo identity. Compare name, category, legacy SKU, exact default description, price/rating/accent, no images and null edit ownership against the original migration. Do not delete real/edited products. If the owner approves quarantine, use the existing authenticated product administration to deactivate only individually verified records after backing them up. This implementation does not execute cleanup SQL.
- Existing gallery derivatives: `node server/scripts/seo-image-derivatives.cjs /staging/uploads/products` is a dry run. On authorized staging/local media, add `--apply` to generate 240×180-bounded WebP thumbnails. Originals remain untouched. New uploads create thumbnails automatically. Existing originals remain usable until derivatives are generated. Deploy generated derivatives alongside uploads; do not hotlink new media.
- Rollback: restore the previous application artifact atomically and restart. The content migration down method intentionally leaves copy intact: matching replacement text cannot prove that a row was changed by this migration rather than an owner. Restore only individually reviewed rows from the pre-rollout snapshot if content rollback is needed; never blindly replace current text. No schema columns were added. Derivatives can remain harmlessly in place or be removed by their `.thumb.webp` suffix after verifying originals exist. Turning off `PUBLIC_ANALYTICS_ADAPTER` disables the optional adapter.

## Repeatable local verification

```sh
npm run build
npm run test:seo
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test --prefix client -- --watch=false --browsers=ChromeHeadless
npm run seo:fixture
# Separate terminal; fixture has no DB or mail connection:
npm run test:seo:browser
node scripts/seo-crawl.mjs http://127.0.0.1:3100 docs/seo/inventory-after.json
node scripts/seo-browser.mjs http://127.0.0.1:3100 docs/seo/browser-after.json
node scripts/seo-accessibility.mjs
node scripts/seo-3d-profile.mjs
```

Chrome must be installed or the scripts' channel adjusted to an installed Playwright browser. Always restart the fixture after a build. Public API catalogue arrays now paginate at 24 items (`/api/products?page=N`); public HTML pagination is `/products?page=N`. Existing single-product API shape remains, but unpublished/unchanged-demo records now return 404.

## Post-deployment checks (not completed by this task)

- Fetch robots first and run one rate-limited public crawl at a time. Stop/back off on 429 and preserve failed requests; never count transport errors as 404. Do not submit forms during crawling. Retrieve sitemap XML and parse it; compare against approved DB-derived canonical inventory. Ensure drafts, utility confirmations, aliases and unpublished/demo records are absent. Missing lastmod for static pages is intentional; database modification times must reflect meaningful edits.
- Inspect raw homepage HTML with JavaScript disabled: metadata, one H1, nav, content, four genuine featured products when available, full catalogue/contact links and identity schema. Check Chrome console for hydration errors. CDN HTML minification/email obfuscation must not rewrite Angular hydration nodes. Disable only such HTML transformation for these documents if a verified mismatch occurs; do not disable security headers or WAF broadly.
- Test more than four active products across pagination, exact SKU/configuration distinctions, initial HTML links and self-canonicals. Publish/unpublish a staging record and confirm sitemap changes immediately. Confirm caches/CDN honor `no-cache` for sitemap/home/catalogue; invalidation in repository does not prove edge invalidation.
- Test all three aliases and slash redirects. HTTPS www should redirect to apex. Configure the edge, if authorized, to send HTTP www straight to HTTPS apex in one hop; code cannot eliminate an upstream HTTP→HTTPS www redirect. Verify forwarded host/protocol without trusting arbitrary user-provided redirect destinations. Do not change uploads/API routing.
- Check unknown product IDs, unknown URLs, drafts and direct index.csr.html return appropriate 404; internal UI HTML cannot bypass controller auth via static paths. Internal APIs must remain authenticated. noindex is not authorization, and a robots-disallowed URL may not expose its noindex to crawlers.
- Submit only test enquiries against staging with test transport. Verify quantities, refresh behavior, failure recovery, focus trap/Escape/focus return, success only after server response and no GET-side server cart mutation. Test real mailbox delivery only under separate explicit owner authorization.
- Analytics adapter is opt-in: host an approved script at the configured `/assets/...js` path; it supplies `window.gimoAnalytics={consent:false,send(name,safeData){...}}`. Set consent true only through approved consent controls, and dispatch `gimo:analytics-ready` afterward for product views. Do not buffer pre-consent actions. Adapter must treat Lazada clicks as intent, never purchases/revenue; keep only allowed event fields. A vendor requiring external CSP origins needs a narrow separately reviewed policy update. No tracking ID or remote tag is shipped.
- In Search Console, submit the verified sitemap; inspect canonical landing/product pages, selected Google canonical, last crawl/indexing reasons and rendered HTML. Check redirects/legacy URLs and robots behavior. Do not assert that code guarantees indexing.
- Use Google Rich Results Test for applicable Product syntax and feature eligibility, and a Schema.org validator for generic structured data. Basic quote-only Product without offers/reviews is truthful but has commercial rich-result limitations. Visible FAQ content remains useful; FAQ markup is not a promised traffic opportunity.
- Measure mobile/desktop lab performance repeatedly under identical conditions and retrieve field p75 LCP, INP and CLS from CrUX/RUM where available. Targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. A local lab result is not field INP or a field pass. Test 200% zoom, keyboard navigation, focus, labels, contrast and the 3D static fallback/reduced-motion/offscreen behavior. Preserve bundle budgets.

The public analytics script uses the document's canonical pathname and suppresses events on noindex/missing-canonical documents, so arbitrary error paths and confirmation query identifiers cannot enter event payloads. It does not persist or send enquiry fields.
