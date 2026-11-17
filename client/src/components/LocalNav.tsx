/** Sticky product sub-navigation (in-page sections of one document) with a persistent CTA. */
export function LocalNav({ title, links, cta }: { title: string; links: { href: string; label: string }[]; cta: { href: string; label: string } }) {
  return (
    <div className="lnav">
      <div className="shell lnav-inner">
        <span className="lnav-title">{title}</span>
        <nav className="lnav-links" aria-label={`${title} sections`}>
          {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
        <a className="btn btn-primary btn-small" href={cta.href}>{cta.label}</a>
      </div>
    </div>
  );
}
