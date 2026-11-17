'use client';

import { useState } from 'react';

export function ProductGallery({ images, name }: { images: { id: number; url: string; thumbnailUrl: string }[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  return (
    <div>
      <div className="gallery-main">
        <img src={current.url} width={760} height={570} alt={images.length > 1 ? `${name} – photo ${index + 1} of ${images.length}` : name} decoding="async" fetchPriority={index === 0 ? 'high' : undefined} />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs" role="group" aria-label="Product photos">
          {images.map((image, i) => (
            <button key={image.id || image.url} type="button" aria-current={i === index} aria-label={`Show photo ${i + 1} of ${images.length}`} onClick={() => setIndex(i)}>
              <img src={image.thumbnailUrl} width={72} height={54} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
