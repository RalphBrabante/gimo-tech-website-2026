import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { getHome, getSite } from '@/lib/api';
import { BUSINESS, siteOrigin, ADDRESS_LINE } from '@/lib/site';
import { DesktopNav, MobileNav } from '@/components/NavLinks';
import { RevealObserver } from '@/components/RevealObserver';
import { QuoteBagProvider, BagButton } from '@/components/quote/QuoteBag';

// Pages read live CMS/catalogue data; the CDN caches the HTML briefly (see server next-handler).
export const dynamic = 'force-dynamic';

const manrope = localFont({
  src: '../../public/assets/fonts/manrope-latin.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-sans',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif']
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteOrigin()),
    applicationName: BUSINESS.name,
    icons: {
      icon: [{ url: '/gimo-flask-favicon-v2.png', sizes: '64x64', type: 'image/png' }, { url: '/gimo-flask-favicon-v2.ico' }],
      apple: [{ url: '/gimo-apple-touch-icon-v2.png', sizes: '180x180' }]
    },
    formatDetection: { telephone: false }
  };
}

export const viewport: Viewport = { themeColor: '#153f70', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ menus }, { homepage }] = await Promise.all([getSite(), getHome()]);
  const footerColumns = [
    { label: 'Products', links: menus.footer.products },
    { label: 'Services', links: menus.footer.services },
    { label: 'Purchasing help', links: menus.footer.purchasing }
  ].filter((column) => column.links.length);

  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        {/* Enables reveal-on-scroll styles only when JavaScript runs; content is visible otherwise. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <QuoteBagProvider email={BUSINESS.email}>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <header className="gnav">
            <div className="shell gnav-inner">
              <a className="gnav-brand" href="/" aria-label={`${BUSINESS.name} home`}>
                <picture>
                  <source srcSet="/assets/brand/gimo-tech-supplies-logo-420.webp" type="image/webp" />
                  <img src="/assets/brand/gimo-tech-supplies-logo-420.png" width={420} height={140} alt={BUSINESS.name} decoding="async" />
                </picture>
              </a>
              <DesktopNav links={menus.header} />
              <div className="gnav-actions">
                <BagButton />
                <MobileNav links={menus.header} />
              </div>
            </div>
          </header>

          <main id="main-content">{children}</main>

          <footer className="footer">
            <div className="shell">
              <div className="footer-top">
                <div className="footer-brand">
                  <a href="/" aria-label={`${BUSINESS.name} home`}>
                    <picture>
                      <source srcSet="/assets/brand/gimo-tech-supplies-logo-420.webp" type="image/webp" />
                      <img src="/assets/brand/gimo-tech-supplies-logo-420.png" width={420} height={140} alt={BUSINESS.name} loading="lazy" decoding="async" />
                    </picture>
                  </a>
                  <p>{homepage.footer_brand.blurb}</p>
                </div>
                <div className="footer-cols">
                  {footerColumns.map((column) => (
                    <div key={column.label}>
                      <h2>{column.label}</h2>
                      <ul>{column.links.map((link) => <li key={`${link.label}-${link.href}`}><a href={link.href} {...(link.openInNewTab ? { target: '_blank', rel: 'noopener' } : {})}>{link.label}</a></li>)}</ul>
                    </div>
                  ))}
                </div>
              </div>
              <address>
                <strong>{BUSINESS.name}</strong> ({BUSINESS.alternateName}) · {ADDRESS_LINE}<br />
                <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> · <a href={BUSINESS.lazadaShop} target="_blank" rel="noopener">Official Lazada shop</a> · <a href={BUSINESS.shopeeShop} target="_blank" rel="noopener">Official Shopee shop</a>
              </address>
              <p className="small">{homepage.footer_brand.copyrightLine}</p>
            </div>
          </footer>
        </QuoteBagProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
