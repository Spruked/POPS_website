const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
 const browser = await chromium.launch({channel:'chrome'});
 const page = await browser.newPage();
 await page.goto('http://localhost:5173');
 await page.evaluate(() => sessionStorage.setItem('pops:startup-splash-seen','1'));
 const routes=['/','/about','/desktop-app','/product-demo','/see-pops-in-action','/how-you-use-it','/access','/account','/cart','/checkout','/counsel-handoff','/events','/attorney-referral','/lexicon','/declaration','/pledge','/terms','/privacy','/policies-procedures'];
 const results=[];
 for(const route of routes){
  await page.goto('http://localhost:5173'+route);await page.locator('main').waitFor();
  results.push({route,actualPath:new URL(page.url()).pathname,words:(await page.locator('main').innerText()).trim().split(/\s+/).length,title:await page.title(),hooks:await page.locator('[data-orb-target]').evaluateAll(es=>es.map(e=>e.getAttribute('data-orb-target')))});
 }
 fs.writeFileSync('docs/launch/before-pages.json',JSON.stringify(results,null,2));await browser.close();
})();
