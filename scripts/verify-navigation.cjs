const {chromium}=require('playwright');
const fs=require('fs');
const assert=require('node:assert/strict');
const origin='http://localhost:5173';
const expected=['Home','Windows','Android','Demo','Beta','Pricing','Sign In'];
const secondary=['About / Our Mission','Declaration','Pledge','Lexicon','Early Adopters','How It Works','Installation','FAQs','Contact & Support','Policies & Procedures','Terms of Service','Privacy Notice'];
const dir='docs/launch/screenshots';
(async()=>{
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
 const context=await browser.newContext();await context.addInitScript(()=>sessionStorage.setItem('pops:startup-splash-seen','1'));
 const page=await context.newPage(),results=[];
 try{
  for(const width of [1440,1280,1100]){
   await page.setViewportSize({width,height:1000});await page.goto(origin+'/desktop-app');await page.waitForFunction(()=>getComputedStyle(document.querySelector('main')).opacity==='1');
   const header=page.getByRole('navigation',{name:'Primary navigation',exact:true});
   for(const name of expected)assert.equal(await header.getByRole('link',{name,exact:true}).isVisible(),true,`${width} ${name}`);
   assert.equal(await header.getByRole('link',{name:/Cart with/}).isVisible(),true);
   assert.equal(await header.getByRole('link',{name:'Get P.O.P.S.',exact:true}).isVisible(),true);
   const aside=page.getByRole('complementary',{name:'Explore P.O.P.S.'});assert.equal(await aside.isVisible(),true);
   for(const name of secondary)assert.equal(await aside.getByRole('link',{name,exact:true}).count(),1);
   const layout=await page.evaluate(()=>{const aside=document.querySelector('.site-secondary').getBoundingClientRect(),main=document.querySelector('main').getBoundingClientRect(),links=[...document.querySelectorAll('.site-header a')].filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};});return {asideRight:aside.right,mainLeft:main.left,links,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.ok(layout.mainLeft>=layout.asideRight-1);assert.equal(layout.overflow,false);
   for(let i=1;i<layout.links.length;i++)assert.ok(layout.links[i].left>=layout.links[i-1].right-1,`${width} header links overlap`);
   assert.equal(await header.locator('[aria-haspopup]').count(),0);
   await page.screenshot({path:`${dir}/navigation-desktop-${width}.png`});
   if(width===1440){await header.screenshot({path:`${dir}/navigation-header.png`});await page.locator('.site-secondary-inner').screenshot({path:`${dir}/navigation-sidebar.png`});}
   results.push({width,mode:'direct desktop header and reserved-width sidebar',passed:true});
  }
  for(const width of [1024,820,390,320]){
   await page.setViewportSize({width,height:900});await page.goto(origin+'/desktop-app');await page.waitForFunction(()=>getComputedStyle(document.querySelector('main')).opacity==='1');
   const header=page.getByRole('navigation',{name:'Primary navigation',exact:true}),menu=page.getByRole('button',{name:'Open navigation',exact:true});
   assert.equal(await menu.isVisible(),true);assert.match(await menu.innerText(),/Menu/);assert.equal(await header.getByRole('link',{name:'Get P.O.P.S.',exact:true}).isVisible(),true);
   if(width===390)await page.screenshot({path:`${dir}/navigation-mobile-closed.png`});
   await menu.click();assert.equal(await page.getByRole('button',{name:'Close navigation'}).getAttribute('aria-expanded'),'true');
   for(const name of [...expected,...secondary])assert.equal(await header.getByRole('link',{name,exact:true}).count(),1,`${width} flat link ${name}`);
   assert.equal(await header.locator('[aria-haspopup]').count(),0);assert.equal(await header.locator('select').count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`${dir}/navigation-flat-menu-${width}.png`});
   if(width===390){await header.getByRole('link',{name:'Privacy Notice',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/navigation-flat-menu-mobile-bottom.png`});}
   const menuLinks=await page.locator('#primary-navigation a').allTextContents();assert.equal(menuLinks.length,23);
   await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');assert.equal(await page.getByRole('button',{name:'Open navigation'}).evaluate(el=>el===document.activeElement),true);
   await page.getByRole('button',{name:'Open navigation'}).click();await header.getByRole('link',{name:'Beta',exact:true}).click({position:{x:25,y:22}});await page.waitForURL('**/beta');assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');
   results.push({width,mode:'labeled Menu and 23 direct flat destinations',passed:true});
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/account');await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:'Create account',exact:true}).isVisible(),true);assert.equal(await page.getByRole('link',{name:'Forgot password',exact:true}).isVisible(),true);
  fs.writeFileSync('docs/launch/navigation-results.json',JSON.stringify({status:'passed',results,accountActions:'Create account and Forgot password visible; existing account routes preserved',dropdowns:0},null,2));console.log('Navigation passed at 1440, 1280, 1100, 1024, 820, 390 and 320px. Screenshots saved.');
 }catch(error){await page.screenshot({path:`${dir}/navigation-failure.png`});throw error;}finally{await browser.close();}
})();
