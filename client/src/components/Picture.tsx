/** Pre-optimised local photographs: AVIF → WebP → JPEG at 640/960/1280 widths. */
export function Picture({ base, alt, width, height, sizes, priority = false, className }: { base: string; alt: string; width: number; height: number; sizes: string; priority?: boolean; className?: string }) {
  const set = (ext: string) => `${base}-640.${ext} 640w, ${base}-960.${ext} 960w, ${base}-1280.${ext} 1280w`;
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img src={`${base}-640.jpg`} srcSet={set('jpg')} sizes={sizes} width={width} height={height} alt={alt}
        loading={priority ? 'eager' : 'lazy'} decoding="async" {...(priority ? { fetchPriority: 'high' as const } : {})} />
    </picture>
  );
}

export const NYLON_PHOTO = { base: '/assets/products/nylon-syringe-filter-hero', width: 640, height: 512 };
export const QR_PHOTO = { base: '/assets/products/sequential-qr-labels-hero', width: 640, height: 426 };
