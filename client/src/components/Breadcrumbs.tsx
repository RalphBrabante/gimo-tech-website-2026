import type { Crumb } from '@/lib/seo';

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => index === items.length - 1
        ? <span key={item.path} aria-current="page">{item.name}</span>
        : <span key={item.path}><a href={item.path}>{item.name}</a> <span aria-hidden="true">/</span></span>)}
    </nav>
  );
}
