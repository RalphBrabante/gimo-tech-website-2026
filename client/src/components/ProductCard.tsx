import type { PublicProduct } from '@/lib/types';
import { productPath } from '@/lib/site';
import { AddToQuoteButton } from './quote/QuoteBag';

export function ProductCard({ product, headingLevel = 3 }: { product: PublicProduct; headingLevel?: 2 | 3 }) {
  const href = productPath(product);
  const image = product.images[0]?.url ?? product.imageUrl;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="product-card">
      <a className="product-card-media" href={href} tabIndex={-1} aria-hidden="true" style={image ? undefined : { background: product.accent }}>
        {image ? <img src={image} width={360} height={270} alt="" loading="lazy" decoding="async" /> : product.category.charAt(0)}
      </a>
      <div className="product-card-body">
        <span className="tag">{product.category}</span>
        <Heading><a href={href}>{product.name}</a></Heading>
        <p>{product.description}</p>
        <div className="product-card-actions">
          <a className="link-arrow" href={href} aria-label={`View details for ${product.name}`}>Details</a>
          <AddToQuoteButton className="btn btn-outline btn-small" product={{ id: product.id, name: product.name, sku: product.sku, category: product.category, imageUrl: image, accent: product.accent }} />
        </div>
      </div>
    </article>
  );
}
