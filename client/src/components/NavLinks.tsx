'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { MenuLink } from '@/lib/types';

function current(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Plain <a href> links: every navigation is a full document request (multi-page site). */
function Links({ links, pathname }: { links: MenuLink[]; pathname: string }) {
  return links.map((link) => (
    <a key={`${link.label}-${link.href}`} href={link.href} aria-current={current(pathname, link.href) ? 'page' : undefined} {...(link.openInNewTab ? { target: '_blank', rel: 'noopener' } : {})}>
      {link.label}
    </a>
  ));
}

export function DesktopNav({ links }: { links: MenuLink[] }) {
  const pathname = usePathname() ?? '/';
  return <nav className="gnav-links" aria-label="Primary navigation"><Links links={links} pathname={pathname} /></nav>;
}

export function MobileNav({ links }: { links: MenuLink[] }) {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button ref={button} type="button" className="menu-button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>
      <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation" hidden={!open}>
        <Links links={links} pathname={pathname} />
      </nav>
    </>
  );
}
