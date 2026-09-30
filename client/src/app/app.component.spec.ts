import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the homepage heading and crawlable nylon product link', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Syringe filters');
    expect(compiled.querySelector<HTMLAnchorElement>('a[href="/products/nylon-syringe-filter-25mm-045um"]')).toBeTruthy();
    expect(compiled.querySelector<HTMLAnchorElement>('a[href="/sequential-qr-code-labels"]')).toBeTruthy();
  });
  it('preserves independent menus and homepage when the catalogue request fails', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/products').flush({}, { status: 503, statusText: 'Unavailable' });
    http.expectOne('/api/settings').flush({ currencyCode: 'PHP', freeShippingThresholdCents: null });
    http.expectOne('/api/homepage').flush({ hero: { eyebrow: 'Philippines', heading: 'Independent laboratory heading', body: 'Useful supply information', ticks: [], ctaLabel: 'Products', ctaHref: '/products' } });
    http.expectOne('/api/menus').flush({ header: [{ label: 'Independent navigation', href: '/contact-us', openInNewTab: false }], footer: { products: [], services: [], purchasing: [] } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Independent laboratory heading');
    expect(fixture.nativeElement.textContent).toContain('Independent navigation');
    expect(fixture.nativeElement.textContent).not.toContain('Start the API');
    expect(fixture.componentInstance.catalogueUnavailable).toBeTrue();
    http.verify();
  });

});
