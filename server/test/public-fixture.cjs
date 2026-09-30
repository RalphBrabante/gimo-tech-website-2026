// Real Nest controllers and renderers; deterministic in-memory repository boundaries.
// No environment file, DB module, SMTP/mail transport or production credentials are loaded.
require('reflect-metadata');
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { resolve } = require('node:path');
const helmet = require('helmet');
const { ProductEntity } = require('../dist/products/entities/product.entity');
const { MenuItemEntity } = require('../dist/menus/entities/menu-item.entity');
const { ProductsService } = require('../dist/products/products.service');
const { PagesService } = require('../dist/pages/pages.service');
const { PageRendererService } = require('../dist/pages/page-renderer.service');
const { HomeRendererService } = require('../dist/homepage/home-renderer.service');
const { HomepageService } = require('../dist/homepage/homepage.service');
const { MenusService } = require('../dist/menus/menus.service');
const { SettingsService } = require('../dist/settings/settings.service');
const { ProductViewController } = require('../dist/products/product-view.controller');
const { ProductsController } = require('../dist/products/products.controller');
const { PagesViewController } = require('../dist/pages/pages-view.controller');
const { SitemapController } = require('../dist/pages/sitemap.controller');
const { QuotationThankYouController } = require('../dist/pages/quotation-thank-you.controller');
const { AddSeoLandingPages1784257200000 } = require('../dist/database/migrations/1784257200000-add-seo-landing-pages');
const { DEMO_PRODUCTS, isUnchangedDemo } = require('../dist/products/demo-products');
const date = new Date('2026-09-01T00:00:00.000Z');
const fixtures = Array.from({length:29},(_,i)=>({id:100+i,sku:`TEST-LAB-${i+1}`,name:`Test laboratory consumable ${i+1}`,category:'Test fixtures',description:`Development fixture ${i+1} for catalogue discovery. Not a business product.`,priceCents:12300,rating:4.9,accent:'#d8f3f1',imageUrl:'/assets/products/nylon-syringe-filter-hero-640.jpg',images:[],isActive:true,createdByUserId:1,updatedByUserId:1,updatedAt:date}));
fixtures.push(...DEMO_PRODUCTS.map(([name,category,priceCents,rating,accent],i)=>({id:i+1,sku:`LEGACY-${i+1}`,name,category,priceCents,rating,accent,description:`Legacy catalog product: ${name}`,imageUrl:null,images:[],createdByUserId:null,updatedByUserId:null,isActive:true,updatedAt:date})));
const repository = { find: async () => fixtures, findAndCount: async ({skip,take}) => { const publicProducts=fixtures.filter(p=>p.isActive&&!isUnchangedDemo(p));return [publicProducts.slice(skip,skip+take),publicProducts.length]; }, findOne: async ({where}) => fixtures.find(p=>p.id===where.id && p.isActive) || null };
const products = new ProductsService(repository, {});
const pages=[];
async function loadPages() {
 await new AddSeoLandingPages1784257200000().up({ hasTable:async()=>true, query:async(sql,p)=>{
  if(sql.startsWith('SELECT'))return [];
  if(sql.startsWith('INSERT INTO pages')) { pages.push({id:pages.length+1,slug:p[0],title:p[1],metaDescription:p[2],status:p[3],ogImageUrl:p[4],blocks:[],updatedAt:date,createdAt:date});return {insertId:pages.length}; }
  if(sql.includes('INSERT INTO page_blocks'))pages.find(x=>x.id===p[0]).blocks.push({id:p[2]+1,blockType:p[1],sortOrder:p[2],headingText:p[3],headingLevel:p[4],paragraphText:p[5],buttonLabel:p[6],buttonHref:p[7]});
 }});
}
async function createFixture(port=3100) {
 await loadPages();
 const pageService={findPublishedBySlug:async slug=>pages.find(p=>p.slug===slug)||null,listPublishedEntries:async()=>pages.map(({slug,updatedAt})=>({slug,updatedAt}))};
 class FixtureModule {}
 Module({controllers:[ProductsController,ProductViewController,SitemapController,QuotationThankYouController,PagesViewController],providers:[PageRendererService,HomeRendererService,{provide:ProductsService,useValue:products},{provide:PagesService,useValue:pageService},{provide:HomepageService,useValue:{getAll:async()=>null}},{provide:MenusService,useValue:{getPublic:async()=>null}},{provide:SettingsService,useValue:{get:async()=>({currencyCode:'PHP',freeShippingThresholdCents:null})}},{provide:getRepositoryToken(MenuItemEntity),useValue:{find:async()=>[]}}]})(FixtureModule);
 const app = await NestFactory.create(FixtureModule,{logger:false});
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:'],frameSrc:["'self'",'https://www.google.com']}}}));
 app.use(require('../dist/common/public-document.middleware').publicDocumentMiddleware);
 app.useStaticAssets(resolve(__dirname,'../../client/dist/client/browser'),{index:false});
 // An explicit fake response for local UI tests. Does not save, email, or reach any service.
 app.getHttpAdapter().getInstance().post('/api/quotation-requests',(_req,res)=>res.status(201).json({requestNumber:'TEST-ONLY-001'}));
 await app.listen(port,'127.0.0.1');return app;
}
module.exports={createFixture,products,fixtures,repository,pages};
if(require.main===module) createFixture().then(()=>console.log('SEO fixture listening on http://127.0.0.1:3100 (no DB or mail)'));
