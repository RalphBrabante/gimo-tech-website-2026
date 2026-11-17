/**
 * Owner-approved Google tag (G-TQKFJZL6YS) and the consent-gated event helper.
 * Policy: rendered only on indexable public documents — never on the 404, error or
 * quotation-confirmation pages. Same-origin, deferred, no inline code.
 */
export function SiteAnalytics() {
  return (
    <>
      <script src="/assets/google-tag.js" defer />
      <script src="/assets/analytics.js" defer />
    </>
  );
}
