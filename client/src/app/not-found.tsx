import type { Metadata } from 'next';

export const metadata: Metadata = { title: { absolute: 'Page not found | Gimo Tech Supplies' }, description: 'The page you requested could not be found.', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="status-page" aria-labelledby="not-found-title">
      <div className="shell-narrow">
        <p className="status-code">404 · Page not found</p>
        <h1 id="not-found-title">We couldn’t find that page.</h1>
        <p className="lede">The link may be out of date, or the page may have moved.</p>
        <div className="btn-row center">
          <a className="btn btn-primary" href="/">Go to homepage</a>
          <a className="link-arrow" href="/products/nylon-syringe-filter-25mm-045um">Nylon syringe filters</a>
          <a className="link-arrow" href="/syringe-filters">All syringe filters</a>
        </div>
      </div>
    </section>
  );
}
