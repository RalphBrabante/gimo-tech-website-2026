'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FilterScene } from './FilterScene';

export interface StoryStep { title: string; body: string }

/**
 * Sticky, scroll-driven product walkthrough. The steps are rendered in the HTML (and repeated in
 * the static list for reduced-motion users), so no content depends on WebGL or JavaScript.
 */
export function ScrollStory({ heading, intro, steps, fallback, label }: { heading: ReactNode; intro: string; steps: StoryStep[]; fallback: ReactNode; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      progress.current = Math.min(1, Math.max(0, -rect.top / span));
      setActive(Math.min(steps.length - 1, Math.floor(progress.current * steps.length)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [steps.length]);

  return (
    <section className="story" aria-labelledby="story-title">
      <div ref={trackRef} className="story-track">
        <div className="story-sticky">
          <div className="story-head shell">
            <p className="eyebrow">Inside the filter</p>
            <h2 id="story-title" className="headline">{heading}</h2>
            <p className="muted">{intro}</p>
          </div>
          <div className="story-canvas">
            <FilterScene mode="story" progress={progress} label={label} fallback={fallback} />
            <ol className="story-steps" aria-hidden="true">
              {steps.map((step, index) => (
                <li key={step.title} className={`story-step${index === active ? ' is-active' : ''}`}>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </li>
              ))}
            </ol>
          </div>
          <ol className="story-static shell grid grid-4">
            {steps.map((step) => (
              <li key={step.title} className="card"><h3>{step.title}</h3><p>{step.body}</p></li>
            ))}
          </ol>
        </div>
      </div>
      {/* Screen readers get the same facts once, in reading order. */}
      <ul className="sr-only">{steps.map((step) => <li key={step.title}>{step.title}: {step.body}</li>)}</ul>
    </section>
  );
}
