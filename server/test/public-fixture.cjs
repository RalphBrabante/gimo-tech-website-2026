// Real NestJS controllers + the real Next.js website and HTTP pipeline (src/http-setup.ts),
// with deterministic in-memory data. No environment file, database, mail transport or
// production credentials are loaded. Requires `npm run build` (server and client).
require('reflect-metadata');
const net = require('node:net');
const { Module, Controller, Post, HttpCode, Body } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { HealthController } = require('../dist/health.controller');
const { ProductsService } = require('../dist/products/products.service');
const { ProductsController } = require('../dist/products/products.controller');
const { PublicContentController } = require('../dist/public-content/public-content.controller');
const { HomepageService } = require('../dist/homepage/homepage.service');
const { MenusService } = require('../dist/menus/menus.service');
const { SettingsService } = require('../dist/settings/settings.service');
const { PagesService } = require('../dist/pages/pages.service');
const { SitemapController } = require('../dist/pages/sitemap.controller');
const { ApiNotFoundController } = require('../dist/pages/api-not-found.controller');
const { AddSeoLandingPages1784257200000 } = require('../dist/database/migrations/1784257200000-add-seo-landing-pages');
const { DEMO_PRODUCTS, isUnchangedDemo } = require('../dist/products/demo-products');
const { configureHttp, prepareRenderEnvironment } = require('../dist/http-setup');

const date = new Date('2026-09-01T00:00:00.000Z');
const fixtures = Array.from({ length: 29 }, (_, i) => ({ id: 100 + i, sku: `TEST-LAB-${i + 1}`, name: `Test laboratory consumable ${i + 1}`, category: 'Test fixtures', description: `Development fixture ${i + 1} for catalogue discovery. Not a business product.`, priceCents: 12300, rating: 4.9, accent: '#d8f3f1', imageUrl: '/assets/products/nylon-syringe-filter-hero-640.jpg', images: [], isActive: true, createdByUserId: 1, updatedByUserId: 1, updatedAt: date }));
fixtures.push(...DEMO_PRODUCTS.map(([name, category, priceCents, rating, accent], i) => ({ id: i + 1, sku: `LEGACY-${i + 1}`, name, category, priceCents, rating, accent, description: `Legacy catalog product: ${name}`, imageUrl: null, images: [], createdByUserId: null, updatedByUserId: null, isActive: true, updatedAt: date })));
const repository = {
  find: async () => fixtures,
  findAndCount: async ({ skip, take }) => { const visible = fixtures.filter((p) => p.isActive && !isUnchangedDemo(p)); return [visible.slice(skip, skip + take), visible.length]; },
  findOne: async ({ where }) => fixtures.find((p) => p.id === where.id && p.isActive) || null
};
const products = new ProductsService(repository, {});
const pages = [];
const submissions = [];

async function loadPages() {
  if (pages.length) return;
  await new AddSeoLandingPages1784257200000().up({ hasTable: async () => true, query: async (sql, p) => {
    if (sql.startsWith('SELECT')) return [];
    if (sql.startsWith('INSERT INTO pages')) { pages.push({ id: pages.length + 1, slug: p[0], title: p[1], metaDescription: p[2], status: p[3], ogImageUrl: p[4], blocks: [], updatedAt: date, createdAt: date }); return { insertId: pages.length }; }
    if (sql.includes('INSERT INTO page_blocks')) pages.find((x) => x.id === p[0]).blocks.push({ id: p[2] + 1, blockType: p[1], sortOrder: p[2], headingText: p[3], headingLevel: p[4], paragraphText: p[5], imageUrl: null, imageAlt: null, buttonLabel: p[6], buttonHref: p[7] });
  } });
}

// Explicit fake write endpoints for UI tests. Nothing is saved, emailed or sent anywhere.
class FakeQuotationsController {
  quote(body) { submissions.push({ type: 'quotation', body }); return { requestNumber: 'GQ-000001' }; }
  enquiry(body) { submissions.push({ type: 'enquiry', body }); return { requestNumber: 'GQ-000002' }; }
}
Controller('api')(FakeQuotationsController);
for (const [method, path] of [['quote', 'quotation-requests'], ['enquiry', 'product-enquiries']]) {
  const descriptor = Object.getOwnPropertyDescriptor(FakeQuotationsController.prototype, method);
  Body()(FakeQuotationsController.prototype, method, 0);
  HttpCode(201)(FakeQuotationsController.prototype, method, descriptor);
  Post(path)(FakeQuotationsController.prototype, method, descriptor);
}

function freePort() {
  return new Promise((resolve, reject) => { const s = net.createServer(); s.unref(); s.on('error', reject); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
}

async function createFixture(requestedPort = 3100, host = '127.0.0.1') {
  await loadPages();
  const port = requestedPort || await freePort();
  prepareRenderEnvironment(port);
  const pageService = { findPublishedBySlug: async (slug) => pages.find((p) => p.slug === slug) || null, listPublishedEntries: async () => pages.map(({ slug, updatedAt }) => ({ slug, updatedAt })) };
  class FixtureModule {}
  Module({
    controllers: [HealthController, ProductsController, PublicContentController, FakeQuotationsController, SitemapController, ApiNotFoundController],
    providers: [
      { provide: ProductsService, useValue: products },
      { provide: PagesService, useValue: pageService },
      { provide: HomepageService, useValue: { getAll: async () => null } },
      { provide: MenusService, useValue: { getPublic: async () => null } },
      { provide: SettingsService, useValue: { get: async () => ({ currencyCode: 'PHP', freeShippingThresholdCents: null }) } }
    ]
  })(FixtureModule);
  const app = await NestFactory.create(FixtureModule, { logger: false });
  const site = await configureHttp(app, { dev: false, port });
  await app.listen(port, host);
  const close = app.close.bind(app);
  app.close = async () => { await site.close(); await close(); };
  return app;
}

module.exports = { createFixture, products, fixtures, repository, pages, submissions };
if (require.main === module) createFixture(Number(process.env.FIXTURE_PORT) || 3100, process.env.FIXTURE_HOST).then((app) => app.getUrl()).then((url) => console.log(`Public fixture listening on ${url.replace('[::1]', '127.0.0.1')} (no DB or mail)`));
