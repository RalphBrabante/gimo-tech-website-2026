'use client';

import { useEffect } from 'react';

/**
 * Fades sections in as they reach the viewport. Content is fully visible without JavaScript.
 * A rAF-throttled scroll check is used instead of IntersectionObserver: an observer never fires
 * when a fast scroll (or a slow device skipping frames) carries an element straight past the
 * viewport, which would leave it invisible.
 */
export function RevealObserver() {
  useEffect(() => {
    const pending = new Set(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    let frame = 0;
    const check = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;
      for (const el of pending) {
        if (el.getBoundingClientRect().top < limit) { el.classList.add('is-visible'); pending.delete(el); }
      }
      if (!pending.size) stop();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    const stop = () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    check();
    return () => { stop(); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return null;
}
