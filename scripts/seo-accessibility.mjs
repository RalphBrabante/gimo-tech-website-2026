import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const width of [360,1440]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();
 for(const path of ['/','/products','/product/100','/products/nylon-syringe-filter-25mm-045um','/syringe-filters','/contact-us','/sequential-qr-code-labels']){
  await page.goto('http://127.0.0.1:3100'+path);const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();results.push({path,width,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:audit.incomplete.map(v=>v.id)});
 }
 await context.close();
}
await writeFile('docs/seo/accessibility-after.json',JSON.stringify({timestamp:new Date().toISOString(),results},null,2)+'\n');
const page=await browser.newPage({viewport:{width:768,height:900}});await page.goto('http://127.0.0.1:3100/');await page.getByRole('button',{name:/Open quotation bag/}).click();await expect(page.getByRole('button',{name:'Close quotation bag'})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Browse products',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:/Open quotation bag/})).toBeFocused();
await page.evaluate(()=>document.documentElement.style.zoom='2');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);results.push({check:'dialog keyboard focus, Escape, return and 200% CSS zoom',overflow,status:overflow?'failed':'passed'});await browser.close();await writeFile('docs/seo/accessibility-after.json',JSON.stringify({timestamp:new Date().toISOString(),results},null,2)+'\n');console.log(results.map(r=>({path:r.path,width:r.width,violations:r.violations?.map(v=>[v.id,v.nodes.length]),status:r.status})));

if(results.some(r=>r.violations?.length || r.status==='failed'))process.exitCode=1;
