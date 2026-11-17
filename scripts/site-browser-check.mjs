// Rendered-page check for the Next.js website (run against `npm run seo:fixture` or a local server).
// Usage: node scripts/site-browser-check.mjs [origin] [screenshotDir]
// Reports console errors, failed requests, horizontal overflow, H1 count and 3D readiness per
// route and viewport, then exercises the nylon enquiry form and the quote bag end to end.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const origin = process.argv[2] || 'http://127.0.0.1:3100';
const shots = process.argv[3] || null;
const routes = ['/', '/products/nylon-syringe-filter-25mm-045um', '/syringe-filters', '/guides/0-22-vs-0-45-micron-syringe-filters', '/sequential-qr-code-labels', '/products', '/product/100', '/biohazard-bags', '/contact-us', '/nope'];
const widths = [360, 768, 1024, 1440];
if (shots) await mkdir(shots, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
let failures = 0;
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    // Never send test traffic to Google.
    await context.route(/googletagmanager|google-analytics|doubleclick|google\.com\/maps/, (route) => route.fulfill({ status: 204, body: '' }));
    for (const route of routes) {
      const page = await context.newPage();
      const problems = [];
      page.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) problems.push(`console: ${m.text()}`); });
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('requestfailed', (r) => { if (!/googletagmanager|google/.test(r.url())) problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`); });
      const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60))); } window.scrollTo(0, 0); });
      await page.waitForTimeout(600);
      const info = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        stages: document.querySelectorAll('.stage').length,
        stagesReady: document.querySelectorAll('.stage.is-ready').length,
        hidden: [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0').length
      }));
      if (info.overflow > 1) problems.push(`horizontal overflow ${info.overflow}px`);
      if (info.h1 !== 1) problems.push(`h1 count ${info.h1}`);
      if (info.hidden) problems.push(`${info.hidden} reveal elements still hidden after scrolling`);
      if (shots) await page.screenshot({ path: `${shots}/${(route.replace(/\W+/g, '_') || 'home')}-${width}.png`, fullPage: true });
      failures += problems.length;
      results.push({ width, route, status: response?.status(), ...info, problems });
      await page.close();
    }
    await context.close();
  }

  // Conversion flows (fixture endpoints never store or send anything).
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${origin}/products/nylon-syringe-filter-25mm-045um#quote`);
  await page.click('button[type=submit]:has-text("Request a quotation")');
  const inlineErrors = await page.locator('.field-error').count();
  await page.fill('#enq-quantity', '3');
  await page.fill('#enq-name', 'Browser Test');
  await page.fill('#enq-email', 'test@example.com');
  await Promise.all([page.waitForURL(/quotation-request-received\?request=GQ-/), page.click('button[type=submit]:has-text("Request a quotation")')]);
  const enquiryOk = inlineErrors >= 2 && (await page.locator('h1').innerText()).includes('Thank you');

  await page.goto(`${origin}/product/100`);
  await page.click('button:has-text("Add to quotation bag")');
  const dialogOpen = await page.locator('dialog.drawer[open]').count();
  await page.keyboard.press('Escape');
  const dialogClosed = await page.locator('dialog.drawer[open]').count() === 0;
  const bagCount = await page.locator('.bag-count').innerText();
  await page.click('.bag-button');
  await page.click('button:has-text("Request quotation")');
  await page.fill('#bag-name', 'Browser Test');
  await page.fill('#bag-email', 'test@example.com');
  await Promise.all([page.waitForURL(/quotation-request-received/), page.click('button:has-text("Send quotation request")')]);
  const bagOk = dialogOpen === 1 && dialogClosed && bagCount === '1';

  // Mobile menu keyboard behaviour.
  await page.goto(`${origin}/`);
  await page.click('.menu-button');
  const menuOpen = await page.locator('#mobile-menu').isVisible();
  await page.keyboard.press('Escape');
  const menuClosed = !(await page.locator('#mobile-menu').isVisible());
  console.log(JSON.stringify({ enquiryOk, bagOk, menuOk: menuOpen && menuClosed }));
  if (!enquiryOk || !bagOk || !menuOpen || !menuClosed) failures += 1;
  await context.close();
} finally {
  await browser.close();
}

for (const r of results) console.log(`${r.problems.length ? 'FAIL' : 'ok  '} ${String(r.width).padEnd(5)} ${String(r.status).padEnd(4)} ${r.route.padEnd(48)} h1=${r.h1} 3d=${r.stagesReady}/${r.stages} ${r.problems.join(' | ')}`);
process.exitCode = failures ? 1 : 0;
