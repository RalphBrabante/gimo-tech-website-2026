import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';

interface Product { id: number; name: string; sku: string; category: string; description: string; price: number; rating: number; accent: string; imageUrl: string | null; }
interface QuoteCartItem { product: Product; quantity: number; }
interface StoreSettings { currencyCode: string; freeShippingThresholdCents: number | null; }

interface FilterTypeItem { name: string; tag: string; description: string; format: string; pack: string; color: string; }
interface BenefitCard { icon: string; title: string; body: string; linkLabel: string; linkHref: string; }
interface StatItem { value: string; label: string; }
interface PlanCard { eyebrow: string; title: string; subtitle: string; bullets: string[]; ctaLabel: string; ctaHref: string; featured: boolean; }

interface HomepageContent {
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

interface MenuLink { label: string; href: string; openInNewTab: boolean; }
interface PublicMenus {
  header: MenuLink[];
  footer: { products: MenuLink[]; services: MenuLink[]; purchasing: MenuLink[] };
}

const FALLBACK_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    eyebrow: 'Fast shipping laboratory supplies',
    heading: 'Syringe filters for reliable HPLC sample preparation.',
    body: 'Gimo Tech Supplies provides multiple syringe filter membrane types for chromatographic workflows, including Nylon, PTFE, PVDF, and MCE options in common laboratory formats such as 25mm and 0.45um.',
    ticks: [
      'HPLC sample prep and laboratory filtration',
      'Bulk canister packs and routine-use supply options',
      'Authentic lab supplies with responsive purchasing support'
    ],
    ctaLabel: 'View syringe filters',
    ctaHref: '#shop'
  },
  filter_types: {
    eyebrow: 'Syringe filter types',
    heading: 'Choose the membrane for your method',
    items: [
      { name: 'Nylon Syringe Filter', tag: 'General HPLC prep', description: 'A common choice for aqueous and mixed sample preparation workflows that need dependable filtration.', format: '25mm / 0.45um options', pack: 'Canister and bulk pack support', color: '#f0b21a' },
      { name: 'PTFE Syringe Filter', tag: 'Solvent-compatible', description: 'Used for stronger solvent workflows where chemical resistance and low extractables matter.', format: 'Hydrophobic and method-fit options', pack: 'Bulk canister pack availability', color: '#e92f38' },
      { name: 'PVDF Syringe Filter', tag: 'Low binding', description: 'A useful option for methods that benefit from low protein binding and consistent filtration.', format: '25mm / 0.45um options', pack: 'Routine laboratory pack sizes', color: '#4630a3' },
      { name: 'MCE Syringe Filter', tag: 'Clarification', description: 'Suited for general sample clarification and laboratory preparation workflows.', format: 'Single-piece and pack options', pack: 'Flexible ordering support', color: '#07945f' }
    ]
  },
  benefits: {
    eyebrow: 'Laboratory supplier focus',
    heading: 'Supplies built around real lab workflows.',
    body: 'Our catalog is centered on practical consumables that laboratories reorder often: syringe filters for HPLC preparation and customized biohazard bags for controlled disposal and tracking.',
    bullets: [
      'Nylon, PTFE, PVDF, and MCE syringe filter options',
      'Bulk pack support for procurement and recurring laboratory use',
      'Biohazard bag printing with QR code attachment workflows',
      'Clear product descriptions, SKU tracking, and purchasing support'
    ],
    ctaLabel: 'Request a quote',
    ctaHref: '#contact',
    cards: [
      { icon: 'HPLC', title: 'Chromatography ready', body: 'Filters suited for routine HPLC sample preparation.', linkLabel: 'Browse filters', linkHref: '#shop' },
      { icon: '4x', title: 'Multiple membranes', body: 'Nylon, PTFE, PVDF, and MCE options for different methods.', linkLabel: 'See details', linkHref: '#filter-types-title' },
      { icon: 'QR', title: 'Traceable waste bags', body: 'Customized biohazard bags with printed QR code series.', linkLabel: 'Review options', linkHref: '#biohazard-bags' },
      { icon: 'QA', title: 'Supplier assistance', body: 'Responsive support for product matching and repeat orders.', linkLabel: 'Get support', linkHref: '#contact' }
    ]
  },
  impact_banner: {
    eyebrow: 'Customized biohazard bags',
    heading: 'Printed QR code series for traceable laboratory waste handling.',
    body: 'Order customized biohazard bags with series-based printing and QR code attachments for internal tracking, receiving, or disposal documentation workflows.',
    ctaLabel: 'Discuss custom printing',
    ctaHref: '#contact'
  },
  split_1: {
    eyebrow: 'Syringe filter selection',
    heading: 'Match membrane, diameter, and pore size to your method.',
    body: 'Tell us your sample type, solvent system, and instrument workflow. We can help identify the syringe filter type and pack size that fits your laboratory process.',
    checklist: [
      'Nylon, PTFE, PVDF, and MCE filters',
      'HPLC sample preparation',
      '25mm filter formats',
      '0.45um pore size options',
      'Bulk canister packs',
      'Repeat-order support'
    ],
    ctaLabel: 'Ask for recommendations',
    ctaHref: '#contact'
  },
  split_2: {
    eyebrow: 'Custom labeling workflow',
    heading: 'Biohazard bag printing with QR code attachments.',
    body: 'We support laboratories that need customized bag series, printed identifiers, QR code attachments, and purchasing coordination for repeat batches.',
    stats: [
      { value: 'QR', label: 'Code attachments' },
      { value: 'ID', label: 'Series printing' },
      { value: 'PO', label: 'Procurement support' }
    ],
    ctaLabel: 'Start a custom order',
    ctaHref: '#contact'
  },
  consult_intro: {
    eyebrow: 'Laboratory purchasing support',
    heading: 'Request product details or a custom quotation.',
    body: 'Send your syringe filter requirements or biohazard bag printing details and we will help prepare the right product options.'
  },
  plans: {
    eyebrow: 'Purchasing paths',
    heading: 'Supply options for laboratories',
    cards: [
      { eyebrow: 'FILTERS', title: 'HPLC', subtitle: 'Syringe Filter Supply', bullets: ['Nylon, PTFE, PVDF, and MCE options', 'Common diameter and pore sizes', 'Bulk canister packs', 'Repeat procurement support'], ctaLabel: 'Request filter quote', ctaHref: '#contact', featured: false },
      { eyebrow: 'CANISTER', title: '100', subtitle: 'Routine Lab Packs', bullets: ['Canister pack availability', 'Non-sterile lab-use options', 'SKU-based reordering', 'Fast shipping coordination'], ctaLabel: 'View catalog', ctaHref: '#shop', featured: true },
      { eyebrow: 'CUSTOM', title: 'QR', subtitle: 'Biohazard Bag Printing', bullets: ['Customized print layout', 'QR code attachments', 'Series-based identifiers', 'Batch order coordination'], ctaLabel: 'Discuss printing', ctaHref: '#contact', featured: false }
    ]
  },
  location: {
    tagline: 'Visit GIMO Laboratory Supplies',
    description: 'B2 L26 Diamond St., South 1 Camella Homes Annex, Brgy., San Pedro, Laguna 4023',
    ctaLabel: 'View on Google Maps',
    ctaHref: 'https://www.google.com/maps/place/GIMO+Laboratory+Supplies/@14.3808892,121.0679065,15z/data=!4m6!3m5!1s0x3397d1d871eba07b:0x8ca7e1b4bd2d5c7a!8m2!3d14.3723706!4d121.0582515!16s%2Fg%2F11jgc0gmss?entry=ttu'
  },
  cta_banner: {
    heading: 'Need syringe filters or custom QR biohazard bags?',
    ctaLabel: 'Request a quote',
    ctaHref: '#contact'
  },
  footer_brand: {
    blurb: 'Laboratory supplies for HPLC sample preparation and custom biohazard bag workflows.',
    copyrightLine: '© 2026 Gimo Tech Supplies. All rights reserved.'
  }
};

const FALLBACK_MENUS: PublicMenus = {
  header: [
    { label: 'Home', href: '/', openInNewTab: false },
    { label: 'Syringe Filters', href: '/syringe-filters', openInNewTab: false },
    { label: 'Biohazard Bags', href: '/biohazard-bags', openInNewTab: false },
    { label: 'Lazada Shop', href: '/lazada-shop', openInNewTab: false },
    { label: 'Contact', href: '/#contact', openInNewTab: false }
  ],
  footer: {
    products: [
      { label: 'Syringe filters', href: '/syringe-filters', openInNewTab: false },
      { label: 'QR biohazard bags', href: '/biohazard-bags', openInNewTab: false },
      { label: 'Lazada shop', href: '/lazada-shop', openInNewTab: false }
    ],
    services: [
      { label: 'Custom printing', href: '/biohazard-bags', openInNewTab: false },
      { label: 'QR code attachments', href: '/biohazard-bags', openInNewTab: false },
      { label: 'Repeat supply orders', href: '/#contact', openInNewTab: false }
    ],
    purchasing: [
      { label: 'Request a quote', href: '/#contact', openInNewTab: false },
      { label: 'Product matching', href: '/syringe-filters', openInNewTab: false },
      { label: 'Shipping support', href: '/#contact', openInNewTab: false }
    ]
  }
};

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule], templateUrl: './app.component.html', styleUrl: './app.component.scss' })
export class AppComponent implements OnInit {
  products: Product[] = []; loading = true; currencyCode = 'USD'; freeShippingThreshold: number | null = null;
  homepage: HomepageContent = FALLBACK_HOMEPAGE_CONTENT;
  menus: PublicMenus = FALLBACK_MENUS;
  quoteCart: QuoteCartItem[] = [];
  cartOpen = false;
  quoteFormOpen = false;
  quoteStatus = '';
  quoteSubmitting = false;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadQuoteCart();
    forkJoin({
      settings: this.http.get<StoreSettings>('/api/settings').pipe(catchError(() => of({ currencyCode: 'USD', freeShippingThresholdCents: null }))),
      products: this.http.get<Product[]>('/api/products'),
      homepage: this.http.get<HomepageContent>('/api/homepage').pipe(catchError(() => of(FALLBACK_HOMEPAGE_CONTENT))),
      menus: this.http.get<PublicMenus>('/api/menus').pipe(catchError(() => of(FALLBACK_MENUS)))
    }).subscribe({
      next: ({ settings, products, homepage, menus }) => {
        this.currencyCode = settings.currencyCode;
        this.freeShippingThreshold = settings.freeShippingThresholdCents === null ? null : settings.freeShippingThresholdCents / 100;
        this.products = products;
        this.homepage = homepage;
        this.menus = menus;
        this.addQuoteProductFromLocation(products);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get cartCount(): number {
    return this.quoteCart.reduce((total, item) => total + item.quantity, 0);
  }

  addToQuoteCart(product: Product): void {
    const existing = this.quoteCart.find((item) => item.product.id === product.id);
    if (existing) existing.quantity += 1;
    else this.quoteCart = [...this.quoteCart, { product, quantity: 1 }];
    this.saveQuoteCart();
    this.cartOpen = true;
    this.quoteFormOpen = false;
  }

  private addQuoteProductFromLocation(products: Product[]): void {
    const productId = Number(new URLSearchParams(window.location.search).get('add-to-quote'));
    if (!Number.isInteger(productId) || productId < 1) return;

    const product = products.find((candidate) => candidate.id === productId);
    if (!product) return;

    this.addToQuoteCart(product);
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
  }

  changeQuantity(productId: number, change: number): void {
    const item = this.quoteCart.find((candidate) => candidate.product.id === productId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity < 1) this.quoteCart = this.quoteCart.filter((candidate) => candidate.product.id !== productId);
    else this.quoteCart = [...this.quoteCart];
    this.saveQuoteCart();
  }

  removeFromQuoteCart(productId: number): void {
    this.quoteCart = this.quoteCart.filter((item) => item.product.id !== productId);
    this.saveQuoteCart();
  }

  openCart(): void { this.cartOpen = true; this.quoteFormOpen = false; this.quoteStatus = ''; }
  closeCart(): void { this.cartOpen = false; this.quoteFormOpen = false; }
  openQuoteForm(): void { if (this.quoteCart.length) { this.quoteFormOpen = true; this.quoteStatus = ''; } }
  backToCart(): void { this.quoteFormOpen = false; this.quoteStatus = ''; }

  submitQuoteRequest(event: SubmitEvent, name: string, company: string, email: string, phone: string, notes: string): void {
    event.preventDefault();
    if (this.quoteSubmitting || !this.quoteCart.length) return;
    this.quoteSubmitting = true;
    this.quoteStatus = 'Saving your quotation request…';
    this.http.post<{ requestNumber: string }>('/api/quotation-requests', {
      name, company: company || undefined, email, phone: phone || undefined, notes: notes || undefined,
      items: this.quoteCart.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
    }).subscribe({
      next: ({ requestNumber }) => {
        this.quoteCart = [];
        this.saveQuoteCart();
        window.location.assign(`/quotation-request-received?request=${encodeURIComponent(requestNumber)}`);
      },
      error: () => {
        this.quoteSubmitting = false;
        this.quoteStatus = 'We could not save your request. Please try again or email gimotechsupplies@gmail.com.';
      }
    });
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void { if (this.cartOpen) this.closeCart(); }

  private loadQuoteCart(): void {
    try {
      const saved = localStorage.getItem('gimo-quote-cart');
      if (!saved) return;
      const parsed = JSON.parse(saved) as QuoteCartItem[];
      if (Array.isArray(parsed)) this.quoteCart = parsed.filter((item) => item?.product?.id && Number.isInteger(item.quantity) && item.quantity > 0);
    } catch { this.quoteCart = []; }
  }

  private saveQuoteCart(): void {
    try { localStorage.setItem('gimo-quote-cart', JSON.stringify(this.quoteCart)); } catch { /* Keep the cart available for this visit. */ }
  }

}
