'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="status-page" aria-labelledby="error-title">
      <div className="shell-narrow">
        <p className="status-code">Temporarily unavailable</p>
        <h1 id="error-title">This page could not be loaded.</h1>
        <p className="lede">Please try again in a moment, or email <a href="mailto:gimotechsupplies@gmail.com">our supply team</a> for product and quotation enquiries.</p>
        <div className="btn-row center">
          <button type="button" className="btn btn-primary" onClick={reset}>Try again</button>
          <a className="link-arrow" href="/">Go to homepage</a>
        </div>
      </div>
    </section>
  );
}
