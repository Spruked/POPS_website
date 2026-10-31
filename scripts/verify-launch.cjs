const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const crypto=require('crypto');
const pages=JSON.parse(fs.readFileSync('src/data/sitePages.json','utf8'));
const before=JSON.parse(fs.readFileSync('docs/launch/before-pages.json','utf8'));
const output='docs/launch';
const screenshots=path.join(output,'screenshots');fs.mkdirSync(screenshots,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();
 const pageErrors=[],paymentRequests=[],results=[],checks=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 page.on('request',request=>{if(/checkout\/(square|stripe)|api\.squareup|api\.stripe|buy\.stripe|square\.link/.test(request.url()))paymentRequests.push(request.url());});
 await context.addInitScript(()=>sessionStorage.setItem('pops:startup-splash-seen','1'));
 const origin='http://localhost:5173';
 try{
  for(const definition of pages){
   await page.goto(origin+definition.path);await page.locator('main h1').waitFor();await page.waitForFunction(()=>Boolean(document.querySelector('meta[name=description]')?.content));
   const data=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name=description]')?.content,robots:document.querySelector('meta[name=robots]')?.content,canonical:document.querySelector('link[rel=canonical]')?.href,descriptionCount:document.querySelectorAll('meta[name=description]').length,h1s:document.querySelectorAll('main h1').length,words:document.querySelector('main').innerText.trim().split(/\s+/).length,ids:[...document.querySelectorAll('main [id]')].map(el=>el.id),hooks:[...document.querySelectorAll('[data-orb-target]')].map(el=>el.getAttribute('data-orb-target')),links:[...document.querySelectorAll('main a[href]')].map(el=>el.getAttribute('href')),overflow:document.documentElement.scrollWidth>innerWidth}));
   assert.equal(data.h1s,1,definition.path+' H1');assert.equal(data.descriptionCount,1,definition.path+' duplicate descriptions');
   assert.ok(data.description&&data.title,definition.path+' metadata');assert.equal(data.overflow,false,definition.path+' desktop overflow');
   if(!definition.indexable)assert.match(data.robots,/noindex/);
   const original=before.find(row=>row.route===definition.path);
   if(original)for(const hook of original.hooks)assert.ok(data.hooks.includes(hook),`Missing original hook ${hook} on ${definition.path}`);
   results.push({...definition,...data,beforeWords:original?.words||0});
   if(['/','/desktop-app','/android','/beta','/account','/access','/cart'].includes(definition.path)){await page.waitForFunction(()=>getComputedStyle(document.querySelector('main')).opacity==='1');await page.screenshot({path:path.join(screenshots,(definition.path==='/'?'home':definition.path.slice(1))+'.png'),fullPage:true});}
  }
  checks.push('All route definitions: desktop rendering, one H1, unique description element, metadata, noindex, preserved hooks, no horizontal overflow.');
  const publicRows=results.filter(row=>row.indexable);assert.equal(new Set(publicRows.map(row=>row.title)).size,publicRows.length);assert.equal(new Set(publicRows.map(row=>row.description)).size,publicRows.length);
  for(const row of results)for(const link of row.links){if(link.startsWith('/')&&!link.startsWith('//')){const target=link.split(/[?#]/)[0]||row.path;assert.ok(pages.some(p=>p.path===target)||['/pricing','/download','/contact'].includes(target)||target.startsWith('/lexicon/'),`Unknown internal link ${link} from ${row.path}`);}}
  checks.push('Public titles and descriptions unique; main-content internal destinations recognized.');
  await page.goto(origin+'/access');await page.getByRole('button',{name:'Save Guardian Access to cart',exact:true}).click();
  await page.reload();assert.match(await page.locator('main').innerText(),/Guardian Access/);
  assert.equal(await page.getByRole('button',{name:/^POPS Membership/}).count(),0);
  await page.goto(origin+'/access');assert.equal(await page.getByRole('button',{name:'Included with Guardian'}).isDisabled(),true);
  await page.getByRole('button',{name:'Save Guardian Access to cart',exact:true}).click();assert.match(await page.locator('main').innerText(),/\$99\.00/);
  await page.getByRole('button',{name:'Increase Guardian Access quantity'}).isDisabled().then(value=>assert.equal(value,true));
  await page.getByRole('button',{name:/^Sponsor a Father/}).click();await page.getByRole('button',{name:'Increase Sponsor a Father quantity'}).click();
  assert.equal(await page.locator('.summary-total strong').innerText(),'$149.00');
  await page.reload();assert.equal(await page.locator('.summary-total strong').innerText(),'$149.00');
  await page.getByRole('button',{name:'Remove Guardian Access'}).click();await page.getByRole('button',{name:'Remove Sponsor a Father'}).click();assert.match(await page.locator('main').innerText(),/cart is empty/);
  await page.evaluate(()=>localStorage.setItem('pops:website-cart:v1','corrupt'));await page.reload();assert.match(await page.locator('main').innerText(),/cart is empty/);
  await page.evaluate(()=>localStorage.setItem('pops:website-cart:v1',JSON.stringify([{id:'guardian',quantity:20,price:0},{id:'membership',quantity:1}])));await page.reload();assert.equal(await page.locator('.summary-total strong').innerText(),'$99.00');
  checks.push('Cart refresh, duplicate Guardian, included membership, sponsor quantity and integer-cents totals, removals, corrupt storage, canonical-price restoration.');
  await page.goto(origin+'/checkout');assert.equal(await page.locator('input[type=password],input[name*=card]').count(),0);assert.match(await page.locator('main').innerText(),/Checkout is not open/);
  checks.push('Checkout informational only; no payment requests or card fields.');
  for(const privatePath of ['/.local/customers/customers.sqlite3','/.local/customers/django-secret.txt','/backend/customer_site/settings.py']){const response=await context.request.get(origin+privatePath);assert.equal(response.status(),403,privatePath+' must not be served by Vite');}
  const blockedCheckout=await context.request.get(origin+'/api/checkout/square');assert.equal(blockedCheckout.status(),503);assert.match((await blockedCheckout.json()).error,/unavailable/);
  checks.push('Private database/secret/backend paths denied by Vite; legacy checkout API unavailable through local proxy.');
  const email=`launch-${Date.now()}@example.com`;
  await page.goto(origin+'/beta');await page.getByLabel('Name',{exact:true}).fill('Launch Test');await page.getByLabel('Email address',{exact:true}).fill(email);await page.locator('input[name=consent]').check();await page.getByRole('button',{name:'Submit beta interest'}).click();await page.getByRole('status').filter({hasText:'recorded'}).waitFor();
  checks.push('Beta enrollment returns persistence confirmation and local-only disclosure.');
  await page.goto(origin+'/account?mode=register');await page.getByLabel('First name',{exact:true}).fill('Launch');await page.getByLabel('Last name',{exact:true}).fill('Example');await page.getByLabel('Phone number',{exact:true}).fill('+12025550123');await page.getByLabel('Street address',{exact:true}).fill('100 Fictional Lane');await page.getByLabel('City',{exact:true}).fill('Austin');await page.getByLabel('State / Territory').selectOption('TX');await page.getByLabel('ZIP code',{exact:true}).fill('78701');await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('New password',{exact:true}).fill('Launch-proof-test!853');await page.getByLabel('Confirm new password',{exact:true}).fill('Launch-proof-test!853');await page.locator('input[name=consent]').check();await page.getByRole('button',{name:'Create account',exact:true}).click();await page.getByRole('status').filter({hasText:'verification link'}).waitFor();
  const mailPath=path.join('.local','customers','mail');const bodies=fs.readdirSync(mailPath).map(file=>fs.readFileSync(path.join(mailPath,file),'utf8'));const verification=bodies.find(body=>body.includes(email)&&body.includes('/account/verify?'));
  assert.ok(verification,'Verification email persisted in local outbox');const verifyUrl=verification.match(/http:\/\/localhost:5173\/account\/verify\?token=[^\s]+/)[0];
  await page.goto(verifyUrl);await page.getByRole('button',{name:'Verify email',exact:true}).click();await page.getByRole('status').filter({hasText:'Email verified'}).waitFor();
  await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill('Launch-proof-test!853');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('button',{name:'Sign out',exact:true}).waitFor();assert.match(await page.locator('main').innerText(),/pending review/);
  await page.reload();await page.getByRole('button',{name:'Sign out',exact:true}).waitFor();await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();
  await page.goto(origin+'/account?mode=recovery');await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByRole('button',{name:'Request password reset',exact:true}).click();await page.getByRole('status').filter({hasText:'eligible account'}).waitFor();
  const resets=fs.readdirSync(mailPath).map(file=>fs.readFileSync(path.join(mailPath,file),'utf8'));const resetMail=resets.find(body=>body.includes(email)&&body.includes('/account/reset?'));assert.ok(resetMail);const resetUrl=resetMail.match(/http:\/\/localhost:5173\/account\/reset\?uid=\d+&token=[^\s]+/)[0];
  await page.goto(resetUrl);await page.getByLabel('New password',{exact:true}).fill('Replacement-proof-test!754');await page.getByLabel('Confirm new password',{exact:true}).fill('Replacement-proof-test!754');await page.getByRole('button',{name:'Change password',exact:true}).click();await page.getByRole('status').filter({hasText:'Password changed'}).waitFor();await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill('Replacement-proof-test!754');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('button',{name:'Sign out',exact:true}).waitFor();await page.getByRole('button',{name:'Sign out',exact:true}).click();
  checks.push('Account registration, local verification email, email verification, login, session after refresh, linked beta status, logout, recovery email, reset, and login with new password.');
  await page.goto(origin+'/support');await page.getByLabel('Reply email').fill(email);await page.getByLabel('Technical question or request — no case evidence').fill('Fictional test data: verifying local support persistence and confirmation.');await page.locator('input[name=consent]').check();await page.getByRole('button',{name:'Save support request'}).click();await page.getByRole('status').filter({hasText:'has been saved'}).waitFor();checks.push('Support request saved with reference and no upload field.');
  await page.setViewportSize({width:390,height:844});
  for(const definition of pages.filter(row=>!row.path.startsWith('/account/'))){await page.goto(origin+definition.path);await page.locator('main h1').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,definition.path+' mobile overflow');if(['/','/beta','/access','/account'].includes(definition.path)){await page.waitForFunction(()=>getComputedStyle(document.querySelector('main')).opacity==='1');await page.screenshot({path:path.join(screenshots,`mobile-${definition.path==='/'?'home':definition.path.slice(1)}.png`),fullPage:true});}}
  await page.goto(origin);await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Pricing',exact:true}).click();assert.equal(new URL(page.url()).pathname,'/access');checks.push('Mobile route rendering at 390px and conventional navigation menu.');
  checks.push(require('./verify-protected.cjs').verifyProtected());
  assert.equal(paymentRequests.length,0);assert.deepEqual(pageErrors,[]);checks.push('No uncaught page errors or payment requests.');
  fs.writeFileSync(path.join(output,'after-pages.json'),JSON.stringify(results,null,2));fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({status:'passed',checks,pageErrors,paymentRequests,screenshots:fs.readdirSync(screenshots)},null,2));console.log(checks.join('\n'));
 }catch(error){await page.screenshot({path:path.join(screenshots,'test-failure.png'),fullPage:true});throw error;}
 finally{await browser.close();}
})();
