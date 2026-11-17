import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const { createFixture } = require('../server/test/public-fixture.cjs');
const app = await createFixture(0);
let browser;
try {
  const base = await app.getUrl();
  browser = await chromium.launch({ headless: true });
  for (const width of [360, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    // Intercept all external traffic: never send fixture visits to the real GA property.
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === base) return route.continue();
      if (url.href === 'https://www.googletagmanager.com/gtag/js?id=G-TQKFJZL6YS') {
        return route.fulfill({ contentType: 'application/javascript', body: `
          window.testGoogleTagLoads = (window.testGoogleTagLoads || 0) + 1;
          fetch('https://www.google-analytics.com/g/collect?tid=G-TQKFJZL6YS')
            .then(() => { window.testAnalyticsConnection = true; });
        ` });
      }
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.testCspViolations = [];
      document.addEventListener('securitypolicyviolation', event => {
        window.testCspViolations.push(`${event.violatedDirective}: ${event.blockedURI}`);
      });
    });
    for (const path of ['/', '/products', '/product/100', '/syringe-filters', '/contact-us']) {
      const response = await page.goto(base + path);
      assert.equal(response.status(), 200, path);
      await page.waitForFunction(() => window.testAnalyticsConnection === true);
      const state = await page.evaluate(() => ({
        loads: window.testGoogleTagLoads,
        commands: window.dataLayer.map(command => Array.from(command)),
        violations: window.testCspViolations,
        scripts: document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length
      }));
      assert.equal(state.loads, 1, path);
      assert.equal(state.scripts, 1, path);
      assert.equal(state.commands.filter(command => command[0] === 'js').length, 1, path);
      assert.deepEqual(state.commands.filter(command => command[0] === 'config'), [['config', 'G-TQKFJZL6YS']], path);
      assert.deepEqual(state.violations, [], path);
      assert.match(response.headers()['content-security-policy'], /connect-src[^;]*https:\/\/\*\.google-analytics\.com/);
    }
    for (const path of ['/quotation-request-received?request=TEST-ONLY', '/unknown-analytics-test', '/internal/desk']) {
      await page.goto(base + path);
      assert.equal(await page.evaluate(() => typeof window.gtag), 'undefined', path);
      assert.equal(await page.locator('script[src="/assets/google-tag.js"]').count(), 0, path);
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`Google tag: public documents, exclusions, single initialization and CSP passed at ${width}px`);
  }
} finally {
  await browser?.close();
  await app.close();
}
