import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ProductsService } from '../products/products.service';
import { HomepageService } from './homepage.service';
import { MenusService } from '../menus/menus.service';
import { SettingsService } from '../settings/settings.service';
import { storefrontPath } from '../storefront-path';
import { identityGraph, publicOrigin, analyticsAdapterPath } from '../common/public-site';
import { serializeJsonLd } from '../common/html.util';

@Injectable()
export class HomeRendererService {
  private readonly logger = new Logger(HomeRendererService.name);
  constructor(private readonly products: ProductsService, private readonly homepage: HomepageService, private readonly menus: MenusService, private readonly settings: SettingsService) {}
  async render(rawProductId?: string): Promise<string> {
    const [products, homepage, menus, settings, selectedProduct] = await Promise.allSettled([this.products.findPage(1, 4), this.homepage.getAll(), this.menus.getPublic(), this.settings.get(), rawProductId && /^[1-9]\d*$/.test(rawProductId) && Number.isSafeInteger(Number(rawProductId)) ? this.products.findOnePublic(Number(rawProductId)) : Promise.resolve(null)]);
    for (const [name, result] of Object.entries({ products, homepage, menus, settings })) if(result.status === 'rejected') this.logger.warn(`Public homepage ${name} unavailable; serving independent content`);
    const snapshot = { products: products.status === 'fulfilled' ? products.value.products : [], homepage: homepage.status === 'fulfilled' ? homepage.value : null, menus: menus.status === 'fulfilled' ? menus.value : null, settings: settings.status === 'fulfilled' ? settings.value : null, catalogueUnavailable: products.status === 'rejected', selectedProduct: selectedProduct.status === 'fulfilled' ? selectedProduct.value : null };
    const origin = publicOrigin();
    let document = await readFile(resolve(storefrontPath, 'index.csr.html'), 'utf8');
    document = document.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${serializeJsonLd({ '@context': 'https://schema.org', '@graph': identityGraph() })}</script>`).replaceAll('https://gimosupplies.com', origin);
    const adapter = analyticsAdapterPath();
    if (adapter) document = document.replace('<script src="/assets/analytics.js"', `<script src="${adapter}" defer></script><script src="/assets/analytics.js"`);
    // Keep native import in CommonJS Nest output to load Angular's ESM bundle.
    const module = await (new Function('url', 'return import(url)') as (url: string) => Promise<{ default: (document: string, url: string, data: unknown) => Promise<string> }>)(pathToFileURL(resolve(storefrontPath, '../server/main.server.mjs')).href);
    return module.default(document, `${origin}/`, snapshot);
  }
}
