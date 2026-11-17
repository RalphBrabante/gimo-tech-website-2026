export interface MenuLink { label: string; href: string; openInNewTab: boolean }
export interface PublicMenus { header: MenuLink[]; footer: { products: MenuLink[]; services: MenuLink[]; purchasing: MenuLink[] } }

export interface PageBlock {
  id: number;
  blockType: 'heading' | 'paragraph' | 'image' | 'button';
  sortOrder: number;
  headingText: string | null;
  headingLevel: number | null;
  paragraphText: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageSize: { width: number; height: number } | null;
  buttonLabel: string | null;
  buttonHref: string | null;
}

export interface CmsPage { slug: string; title: string; metaDescription: string | null; ogImageUrl: string | null; updatedAt: string; blocks: PageBlock[] }

interface FilterTypeItem { name: string; tag: string; description: string; format: string; pack: string; color: string }
interface BenefitCard { icon: string; title: string; body: string; linkLabel: string; linkHref: string }
interface StatItem { value: string; label: string }
interface PlanCard { eyebrow: string; title: string; subtitle: string; bullets: string[]; ctaLabel: string; ctaHref: string; featured: boolean }

export interface HomepageContent {
  hero: { eyebrow: string; heading: string; body: string; ticks: string[]; ctaLabel: string; ctaHref: string };
  filter_types: { eyebrow: string; heading: string; items: FilterTypeItem[] };
  benefits: { eyebrow: string; heading: string; body: string; bullets: string[]; ctaLabel: string; ctaHref: string; cards: BenefitCard[] };
  impact_banner: { eyebrow: string; heading: string; body: string; ctaLabel: string; ctaHref: string };
  split_1: { eyebrow: string; heading: string; body: string; checklist: string[]; ctaLabel: string; ctaHref: string };
  split_2: { eyebrow: string; heading: string; body: string; stats: StatItem[]; ctaLabel: string; ctaHref: string };
  consult_intro: { eyebrow: string; heading: string; body: string };
  plans: { eyebrow: string; heading: string; cards: PlanCard[] };
  location: { tagline: string; description: string; ctaLabel: string; ctaHref: string };
  cta_banner: { heading: string; ctaLabel: string; ctaHref: string };
  footer_brand: { blurb: string; copyrightLine: string };
}
