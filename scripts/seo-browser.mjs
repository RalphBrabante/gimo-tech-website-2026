import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const origin=process.argv[2] || 'http://127.0.0.1:3100';
const output=process.argv[3] || 'docs/seo/browser-after.json';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
for(const width of [360,768,1024,1440]) {
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
 await page.addInitScript(()=>{ window.lab={lcp:0,cls:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>window.lab.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.lab.cls+=e.value})).observe({type:'layout-shift',buffered:true}); });
 for(const path of ['/','/products','/products/nylon-syringe-filter-25mm-045um','/syringe-filters','/contact-us']) {
   let response; try { response=await page.goto(origin+path,{waitUntil:'networkidle'});await page.waitForTimeout(300); } catch(error) { results.push({path,width,status:null,transportError:error.message,errors:[...errors],failed:[...failed]}); continue; }
   const result=await page.evaluate(()=>({h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),overflow:document.documentElement.scrollWidth>innerWidth,lab:window.lab,ttfb:performance.getEntriesByType('navigation')[0]?.responseStart,resources:performance.getEntriesByType('resource').length,bodyText:document.body.innerText.length}));
   results.push({path,width,status:response.status(),...result,errors:[...errors],failed:[...failed]});errors.length=0;failed.length=0;
   if(path==='/')await page.screenshot({path:`/private/tmp/gimo-home-${width}.png`,fullPage:true});
 }
 await context.close();
}
await browser.close();await writeFile(output,JSON.stringify({timestamp:new Date().toISOString(),origin,measurement:'Single-run, local Chrome lab observations; no network/CPU throttling. Not Lighthouse or field Core Web Vitals; INP unavailable.',results},null,2)+'\n');
console.log(results.map(x=>({path:x.path,width:x.width,status:x.status,overflow:x.overflow,errors:x.errors,lcp:x.lab?.lcp,cls:x.lab?.cls})));
