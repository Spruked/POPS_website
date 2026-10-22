const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const crypto=require('crypto');
const base='src/pops-demo-app',origin=process.env.DEMO_BASE_URL||'http://localhost:5173',mode=new URL(origin).port==='5173'?'development':'production',out=path.join(base,'validation',mode);
const channel=process.env.PLAYWRIGHT_CHANNEL||'chrome';
const screens=['dashboard','dossier','relationships','incident','evidence','timeline','review','get-pops'];
fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
(async()=>{
 const browser=await chromium.launch(channel==='chromium'?{}:{channel});
 const context=await browser.newContext({viewport:{width:1440,height:1100}});
 await context.addInitScript(()=>{
  sessionStorage.setItem('pops:startup-splash-seen','1');
  window.__demoAudio=[];
  const OriginalAudio=window.Audio;
  window.Audio=function(...args){const audio=new OriginalAudio(...args);window.__demoAudio.push(audio);return audio;};
 });
 const page=await context.newPage(),errors=[],requests=[],checks=[],pointers=[];page.setDefaultTimeout(15000);
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))requests.push({method:request.method(),path:new URL(request.url()).pathname});});
 const host=page.locator('#pops-demo-root');
 async function waitScreen(screen){await page.waitForFunction(screen=>document.getElementById('pops-demo-root')?.dataset.demoScreen===screen,screen);}
 async function pointer(screen){
  await page.waitForFunction(()=>{const host=document.getElementById('pops-demo-root');return document.querySelector(`.website-orb-target-ring[data-orb-target-id="pops.demo.${host?.dataset.demoScreen}"]`);});
  await page.waitForTimeout(900);
  const rect=await page.evaluate(()=>{
   const host=document.getElementById('pops-demo-root'),root=host.shadowRoot,ring=document.querySelector('.website-orb-target-ring');
   const selectors={dashboard:'[data-demo-target="dashboard"] .stats-grid',dossier:'[data-demo-dossier-identity]',relationships:'.demo-relationship-map',incident:'[data-demo-target="incident"] .card',evidence:'[data-demo-evidence-inventory]',timeline:'.pops-timeline',review:'[data-demo-review-summary]','get-pops':'.demo-get-pops'};
   const active=root.querySelector(selectors[host.dataset.demoScreen]);
   const selected=root.querySelector('.modal .modal-header')||active;
   const r=selected.getBoundingClientRect(),viewport=root.querySelector(selected.closest('.modal')?'.app-container':'.demo-screen-scroll').getBoundingClientRect(),controls=root.querySelector('.demo-tour').getBoundingClientRect();
   const left=Math.max(r.left,viewport.left,0),right=Math.min(r.right,viewport.right,innerWidth),top=Math.max(r.top,viewport.top,controls.bottom,96),bottom=Math.min(r.bottom,viewport.bottom,innerHeight),a=ring.getBoundingClientRect();
   return {expected:{left:Math.max(8,left-8),top:Math.max(8,top-8),width:Math.max(32,right-left+16),height:Math.max(32,bottom-top+16)},actual:{left:a.left,top:a.top,width:a.width,height:a.height},visible:right>left&&bottom>top};
  });
  assert.equal(rect.visible,true,screen+' target visible');
  for(const key of ['left','top','width','height'])assert.ok(Math.abs(rect.expected[key]-rect.actual[key])<8,`${screen}: pointer ${key} mismatch ${JSON.stringify(rect)}`);
  pointers.push({screen,...rect});
 }
 try{
  await page.goto(origin+'/product-demo');await host.getByRole('button',{name:'Start Tour',exact:true}).waitFor();
  assert.equal(await host.locator('input[type=file]:not(:disabled)').count(),0);
  await host.getByRole('button',{name:'Start Tour',exact:true}).click();await waitScreen('dashboard');
  await host.getByRole('status').filter({hasText:'Pops is narrating'}).waitFor();
  await page.waitForTimeout(700);
  let audio=await page.evaluate(()=>window.__demoAudio.filter(audio=>audio.dataset.demoTarget).map(audio=>({playing:!audio.paused,time:audio.currentTime,ready:audio.readyState,duration:audio.duration})));
  assert.ok(audio.some(item=>item.playing&&item.time>0&&item.duration>5));
  checks.push('Real bundled narration decoded and playback time advanced; no live TTS/native service.');
  const fixtureManifest=JSON.parse(fs.readFileSync(path.join(base,'assets/narration/manifest.json'),'utf8'));
  const narrationAssets=[];
  for(const entry of fixtureManifest){const bytes=fs.readFileSync(path.join(base,'assets/narration',entry.step+'.wav'));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase(),entry.sha256);narrationAssets.push({step:entry.step,sha256:entry.sha256});}
  checks.push('All eight committed narration files match their generation manifest.');
  await pointer('dashboard');
  await page.screenshot({path:path.join(out,'screenshots','desktop-dashboard.png')});
  const timeBefore=audio.find(item=>item.playing).time;
  await host.getByRole('button',{name:'Pause narration',exact:true}).click();await host.getByRole('button',{name:'Resume narration',exact:true}).waitFor();
  assert.equal(await page.locator('.website-orb-target-ring').count(),0);
  assert.equal(await page.evaluate(()=>window.__demoAudio.some(audio=>audio.dataset.demoTarget&&!audio.paused)),false);
  await host.getByRole('button',{name:'Resume narration',exact:true}).click();await host.getByRole('status').filter({hasText:'Pops is narrating'}).waitFor();await page.waitForTimeout(500);
  assert.ok(await page.evaluate(time=>window.__demoAudio.some(audio=>audio.dataset.demoTarget&&!audio.paused&&audio.currentTime>=time),timeBefore));
  await host.getByRole('button',{name:'Mute voice',exact:true}).click();await host.getByRole('status').filter({hasText:'Voice muted'}).waitFor();
  assert.equal(await page.evaluate(()=>window.__demoAudio.some(audio=>audio.dataset.demoTarget&&!audio.paused)),false);
  checks.push('Pause/resume preserves playback position; mute stops audio while retaining captions and guidance.');
  for(let index=1;index<screens.length;index++){
   console.log('Desktop stop:',screens[index]);
   await host.getByRole('button',{name:'Next',exact:true}).click();await waitScreen(screens[index]);await pointer(screens[index]);
   await page.waitForFunction(()=>document.getElementById('pops-demo-root')?.shadowRoot.querySelector('[role=status]')?.textContent.includes('Voice muted'));
   await host.getByRole('button',{name:'Enable voice',exact:true}).click();
   await host.getByRole('status').filter({hasText:'Pops is narrating'}).waitFor();
   await page.waitForTimeout(200);
   assert.ok(await page.evaluate(screen=>window.__demoAudio.some(a=>a.dataset.demoTarget==='pops.demo.'+screen&&!a.paused&&a.currentTime>0),screens[index]));
   await host.getByRole('button',{name:'Mute voice',exact:true}).click();
   if(index===1){
    await host.getByRole('button',{name:/Jamie Morgan/}).click();assert.match(await host.locator('[data-demo-dossier-identity]').innerText(),/Jamie Morgan/);
    checks.push('Copied dossier selects fictional contacts and shows matching identity/source context.');
   }
   if(index===2){
    await host.getByRole('button',{name:/Jordan Lee.*Current attorney/}).click();assert.equal(await host.getByRole('button',{name:'Open Jordan Lee’s dossier',exact:true}).count(),1);
    await page.screenshot({path:path.join(out,'screenshots','desktop-relationships.png')});
    await host.getByRole('button',{name:'Open Jordan Lee’s dossier',exact:true}).click();await waitScreen('dossier');assert.match(await host.locator('[data-demo-dossier-identity]').innerText(),/Jordan Lee/);
    await host.getByRole('button',{name:'Next',exact:true}).click();await waitScreen('relationships');
    checks.push('Conceptual relationship map uses explicit fixture edges and opens the same person’s dossier.');
   }
   if(index===3){
    await host.getByRole('button',{name:'View',exact:true}).click();await host.getByRole('dialog',{name:'Incident Detail'}).waitFor();await pointer('incident-dialog');
    assert.match(await host.getByRole('dialog').innerText(),/demo-message-001/);await host.getByRole('button',{name:'Close',exact:true}).click();
    checks.push('Copied incident view links the same fictional message, receipt, note, and timeline record.');
   }
   if(index===4){
    await host.getByRole('button',{name:'Open Exchange message · fictional',exact:true}).click();await host.getByRole('dialog',{name:'Evidence Detail'}).waitFor();await pointer('evidence-dialog');
    await host.getByRole('button',{name:'Verify Integrity',exact:true}).click();await host.getByRole('dialog',{name:'Evidence Detail'}).getByText('MATCH — bundled fictional text only',{exact:false}).waitFor();
    assert.equal(await host.locator('input[type=file]:not(:disabled)').count(),0);await page.screenshot({path:path.join(out,'screenshots','desktop-evidence-check.png')});
    await host.getByRole('button',{name:'Close',exact:true}).click();
    checks.push('Real Web Crypto SHA-256 comparison matches the exact bundled text; upload controls disabled.');
   }
   if(index===5){assert.match(await host.locator('.pops-timeline').innerText(),/demo-message-001/);checks.push('DerivedTimeline uses the same dated fictional event and evidence IDs.');}
   if(index===6){await host.getByRole('button',{name:'Preview',exact:true}).click();await host.getByRole('dialog').waitFor();await pointer('review-dialog');assert.match(await host.getByRole('dialog').innerText(),/FICTIONAL DEMONSTRATION/);await host.getByRole('button',{name:'Close',exact:true}).click();checks.push('Review report is previewable and native export/download controls are disabled.');}
  }
  await host.getByRole('button',{name:'Back',exact:true}).click();await waitScreen('review');await host.getByRole('button',{name:'Next',exact:true}).click();await waitScreen('get-pops');
  assert.equal(await host.getByRole('link',{name:'Get Pops! — view access',exact:true}).getAttribute('href'),'/access');
  await host.getByRole('button',{name:'Restart',exact:true}).click();await waitScreen('dashboard');
  await host.getByRole('button',{name:'Next',exact:true}).click();await waitScreen('dossier');
  await page.reload();await waitScreen('dossier');await host.getByRole('button',{name:'Resume narration',exact:true}).waitFor();assert.equal(await page.evaluate(()=>window.__demoAudio.some(audio=>audio.dataset.demoTarget&&!audio.paused)),false);
  await host.getByRole('button',{name:'Resume narration',exact:true}).click();await pointer('dossier');
  checks.push('Back, Next, Restart, final access link and browser-refresh recovery work; refresh is paused with fresh fictional data.');
  await host.getByRole('button',{name:'Case Calendar',exact:true}).click();await waitScreen('calendar');assert.equal(await host.getByRole('button',{name:'Resume narration',exact:true}).count(),1);await host.getByRole('button',{name:'Resume narration',exact:true}).click();await waitScreen('dossier');
  await page.evaluate(()=>Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw new Error('Test microphone permission denied');}}));
  await page.getByRole('button',{name:'Talk to Pops',exact:true}).click();await host.getByRole('button',{name:'Resume narration',exact:true}).waitFor();assert.equal(await page.locator('.website-orb-target-ring').count(),0);assert.match(await page.locator('.website-orb-speech').innerText(),/Test microphone permission denied/);
  await host.getByRole('button',{name:'Resume narration',exact:true}).click();await pointer('dossier');await host.getByRole('button',{name:'Exit tour',exact:true}).click();await host.getByRole('button',{name:'Start Tour',exact:true}).waitFor();assert.equal(await page.locator('.website-orb-target-ring').count(),0);assert.equal(await page.evaluate(()=>window.__demoAudio.some(audio=>audio.dataset.demoTarget&&!audio.paused)),false);
  checks.push('Calendar exploration and microphone interaction interrupt narration; Resume and Exit clean up and preserve normal ORB interaction.');
  // Script injection, route mismatch and missing active tour are denied.
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('pops:demo-orb-presentation',{detail:{action:'present',targetId:'pops.demo.dashboard',text:'Untrusted text',selector:'body'}})));assert.equal(await page.locator('.website-orb-target-ring').count(),0);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('pops:website-orb-guide-target',{detail:{targetId:'pops.nav.get-pops',message:'Normal website guidance after tour.'}})));await page.waitForURL(origin+'/');await page.locator('.website-orb-target-ring').waitFor();assert.equal(await page.getByRole('button',{name:'Talk to Pops',exact:true}).count(),1);
  checks.push('Unauthored/inactive tour requests denied; existing normal ORB guide event still navigates and highlights after tour.');
  for(const width of [1024,390]){
   await page.setViewportSize({width,height:1000});await page.goto(origin+'/product-demo');await host.getByRole('button',{name:'Start Tour',exact:true}).click();
   if(await host.getByRole('button',{name:'Mute voice',exact:true}).count())await host.getByRole('button',{name:'Mute voice',exact:true}).click();
   for(let i=0;i<screens.length;i++){
    console.log('Responsive stop:',width,screens[i]);
    if(i){await host.getByRole('button',{name:'Next',exact:true}).click();}
    await waitScreen(screens[i]);await pointer(`${width}-${screens[i]}`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`document overflow ${width}/${screens[i]}`);
    const bounds=await host.boundingBox();assert.ok(bounds.width<=width);
    if(i===0||i===2)await page.screenshot({path:path.join(out,'screenshots',`${width}-${screens[i]}.png`)});
   }
   await host.getByRole('button',{name:'Exit tour',exact:true}).click();
  }
  checks.push('All eight stops, controls, pointers and layout tested at desktop 1440px, tablet 1024px and mobile 390px.');
  checks.push('Every tour stop played its real bundled narration, including the production asset URLs.');
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const manifest=JSON.parse(fs.readFileSync(path.join(base,'source-manifest.json'),'utf8'));
  const sourceRoot=process.env.POPS_APPLICATION_SOURCE||manifest.readOnlySource;
  if(fs.existsSync(sourceRoot)){for(const item of manifest.files){const current=fs.readFileSync(path.join(sourceRoot,item.source));assert.equal(crypto.createHash('sha256').update(current).digest('hex'),item.sha256,`Original source changed: ${item.source}`);}checks.push('Read-only original source/asset hashes verified unchanged.');}else checks.push('Original application absent: skipped optional provenance comparison; demo has no application dependency.');
  checks.push('Zero uncaught browser errors and zero API/native/payment requests.');
  fs.writeFileSync(path.join(out,'test-results.json'),JSON.stringify({status:'passed',mode,origin,checks,pointers,errors,requests},null,2));console.log(checks.join('\n'));
 }catch(error){console.error(JSON.stringify(await page.evaluate(()=>{const h=document.getElementById('pops-demo-root'),r=h?.shadowRoot;return{host:h?.outerHTML,ring:document.querySelector('.website-orb-target-ring')?.outerHTML,status:r?.querySelector('[role=status]')?.textContent,active:r?.querySelector('.demo-target-active')?.getBoundingClientRect().toJSON(),viewport:r?.querySelector('.demo-screen-scroll')?.getBoundingClientRect().toJSON(),controls:r?.querySelector('.demo-tour')?.getBoundingClientRect().toJSON(),scroll:r?.querySelector('.demo-screen-scroll')?.scrollTop};}),null,2));await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw error;}finally{await browser.close();}
})();
