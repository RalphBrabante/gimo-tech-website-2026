import { ProductEntity } from './entities/product.entity';
// Exact fingerprints of unchanged historical fixtures only. Any admin edit keeps the record.
export const DEMO_PRODUCTS = [
  ['Aero Pro Headphones', 'Audio', 12999, 4.8, '#d9f99d'],
  ['Orbit Smart Watch', 'Wearables', 18999, 4.7, '#bae6fd'],
  ['Arc Mechanical Keyboard', 'Accessories', 9499, 4.9, '#ddd6fe'],
  ['Flux Wireless Mouse', 'Accessories', 5999, 4.6, '#fed7aa'],
  ['Nova Portable Speaker', 'Audio', 7999, 4.5, '#fecdd3'],
  ['Pulse USB-C Hub', 'Accessories', 4999, 4.7, '#a7f3d0']
] as const;
export function isUnchangedDemo(p: ProductEntity): boolean {
  return p.sku === `LEGACY-${p.id}` && p.description === `Legacy catalog product: ${p.name}` && !p.imageUrl && Array.isArray(p.images) && p.images.length === 0 && p.createdByUserId === null && p.updatedByUserId === null && DEMO_PRODUCTS.some(([name, category, cents, rating, accent]) => p.name === name && p.category === category && p.priceCents === cents && Number(p.rating) === rating && p.accent === accent);
}
