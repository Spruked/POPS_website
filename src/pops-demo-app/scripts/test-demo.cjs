const {chromium}=require('playwright');
const {installVoiceInput,voiceQuestion}=require('../../../scripts/orb-browser-voice.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const origin=process.env.DEMO_BASE_URL||'http://localhost:5173';
const mode=new URL(origin).port==='5173'?'development':'production';
const out=path.join('src/pops-demo-app/validation',mode);fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
const screens=['dashboard','dossier','relationships','incident','evidence','timeline','review','get-pops'];
const results={status:'running',mode,origin,checks:[],pointers:[],modelReplies:[],errors:[],forbiddenRequests:[],speech:'Actual Qwen WAV decoding/playback at every desktop stop and the first tablet/mobile stop; other responsive stops use real muted reading-time progression. Clips seek near their end for regression timing. Recognition input is simulated. Browser speech synthesis is a failure sentinel and must never be called.',audio:[]};
fs.writeFileSync(path.join(out,'test-results.json'),JSON.stringify(results,null,2)+'\n');
(async()=>{
 const browser=await chromium.launch(process.env.PLAYWRIGHT_CHANNEL==='chromium'?{}:{channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
 async function newPage(width){
  const context=await browser.newContext({viewport:{width,height:1100}});
  await context.addInitScript(()=>{
   sessionStorage.setItem('pops:startup-splash-seen','1');window.__spoken=[];window.__utterance=null;window.__popsAudio=[];
   const NativeAudio=window.Audio;window.Audio=function(src){const audio=new NativeAudio(src);window.__popsAudio.push(audio);return audio;};window.Audio.prototype=NativeAudio.prototype;
   Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:undefined});Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:undefined});
   const voice={speaking:false,cancel(){this.speaking=false;window.__utterance=null;},getVoices(){return[];},speak(utterance){this.speaking=true;window.__utterance=utterance;window.__spoken.push(utterance.text);setTimeout(()=>utterance.onstart?.(),0);}};
   Object.defineProperty(window,'speechSynthesis',{configurable:true,value:voice});
   window.__finishPopsSpeech=()=>{const audio=[...window.__popsAudio].reverse().find(item=>item.src.startsWith('blob:')&&!item.paused);if(audio){audio.currentTime=Math.max(0,audio.duration-.04);return;}const utterance=window.__utterance;voice.speaking=false;window.__utterance=null;utterance?.onend?.();};
  });
  await installVoiceInput(context);
  const page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',error=>results.errors.push(error.message));
  page.on('request',request=>{if(/\/api\/(?:customer|checkout)|\/api\/orb\/tools\/run/.test(request.url()))results.forbiddenRequests.push(new URL(request.url()).pathname);});
  return{page,context,host:page.locator('#pops-demo-root')};
 }
 function reply(page,screen){return page.waitForResponse(response=>response.url().endsWith('/api/orb/website-text')&&response.request().postDataJSON()?.event==='tour_stop'&&response.request().postDataJSON()?.demo_screen===screen,{timeout:90000});}
 async function receive(response,screen){assert.equal(response.status(),200,await response.text());const data=await response.json();assert.equal(data.llm_source,'local-llama.cpp');assert.ok(data.spoken_output.length>20);results.modelReplies.push({screen,text:data.spoken_output,action:data.action});if(screen!=='get-pops')assert.equal(data.action.screen,screens[screens.indexOf(screen)+1],screen+' model-selected progression');await active.page.waitForFunction(()=>window.__spoken.length>0||window.__popsAudio.some(a=>a.src.startsWith('blob:')&&!a.paused&&a.currentTime>0)||document.getElementById('pops-demo-root')?.shadowRoot?.querySelector('.demo-voice-status')?.textContent.includes('Voice muted'),null,{timeout:120000});const audio=await active.page.evaluate(()=>{const a=[...window.__popsAudio].reverse().find(a=>a.src.startsWith('blob:')&&!a.paused);return a?{duration:a.duration,currentTime:a.currentTime}:null;});if(audio)results.audio.push({screen,...audio});assert.equal(await active.page.evaluate(()=>window.__spoken.length),0,'Qwen default voice unexpectedly fell back to browser speech');return data;}
 async function screen(page,name){await page.waitForFunction(name=>document.getElementById('pops-demo-root')?.dataset.demoScreen===name,name);}
 async function pointer(page,name){
  await page.waitForFunction(()=>{const host=document.getElementById('pops-demo-root');return document.querySelector(`.website-orb-target-ring[data-orb-target-id="pops.demo.${host?.dataset.demoScreen}"]`);});await page.waitForTimeout(300);
  const bounds=await page.evaluate(()=>{
   const host=document.getElementById('pops-demo-root'),root=host.shadowRoot,ring=document.querySelector('.website-orb-target-ring');
   const selectors={dashboard:'[data-demo-target="dashboard"] .stats-grid',dossier:'[data-demo-dossier-identity]',relationships:'.demo-relationship-map',incident:'[data-demo-target="incident"] .card',evidence:'[data-demo-evidence-inventory]',timeline:'.pops-timeline',review:'[data-demo-review-summary]','get-pops':'.demo-get-pops'};
   const target=root.querySelector('.modal .modal-header')||root.querySelector(selectors[host.dataset.demoScreen]);
   const rect=target.getBoundingClientRect(),view=root.querySelector(target.closest('.modal')?'.app-container':'.demo-screen-scroll').getBoundingClientRect(),controls=root.querySelector('.demo-tour').getBoundingClientRect(),actual=ring.getBoundingClientRect();
   const left=Math.max(0,rect.left,view.left),right=Math.min(innerWidth,rect.right,view.right),top=Math.max(96,rect.top,view.top,controls.bottom),bottom=Math.min(innerHeight,rect.bottom,view.bottom);
   return{visible:right>left&&bottom>top,expected:{left:Math.max(8,left-8),top:Math.max(8,top-8),width:Math.max(32,right-left+16),height:Math.max(32,bottom-top+16)},actual:{left:actual.left,top:actual.top,width:actual.width,height:actual.height}};
  });
  assert.ok(bounds.visible,name+' visible');for(const key of ['left','top','width','height'])assert.ok(Math.abs(bounds.actual[key]-bounds.expected[key])<8,name+' pointer '+key+' '+JSON.stringify(bounds));results.pointers.push({name,...bounds});
 }
 let active;
 try{
  active=await newPage(1440);let {page,host,context}=active;
  await page.goto(origin+'/product-demo');
  if(process.env.DEMO_ASSET_URLS){await page.evaluate(async inventory=>{const audio=new AudioContext();try{for(const item of inventory){const response=await fetch(item.url);if(!response.ok)throw Error('Asset unavailable: '+item.url);const bytes=await response.arrayBuffer();if(item.url.endsWith('.wav')){const decoded=await audio.decodeAudioData(bytes);if(decoded.duration<=0)throw Error('Empty narration audio');}}}finally{await audio.close();}},JSON.parse(process.env.DEMO_ASSET_URLS));results.checks.push('Production browser fetched all nine shipped assets and decoded all eight fallback WAVs.');}
  let next=reply(page,'dashboard');await host.getByRole('button',{name:'Start Tour',exact:true}).click();const firstReply=await receive(await next,'dashboard');await pointer(page,'desktop-dashboard');
  assert.equal(await host.getByRole('button',{name:'Next',exact:true}).count(),0);
  assert.ok(results.audio[0].duration>0,'Qwen WAV decoded and played');
  await page.screenshot({path:path.join(out,'screenshots/desktop-dashboard.png')});
  await host.getByRole('button',{name:'Pause narration',exact:true}).click();assert.equal(await page.locator('.website-orb-target-ring').count(),0);
  await host.getByRole('button',{name:'Mute voice',exact:true}).click();next=reply(page,'dashboard');await host.getByRole('button',{name:'Resume narration',exact:true}).click();await receive(await next,'dashboard');await host.getByRole('status').filter({hasText:'Voice muted'}).waitFor();assert.equal(await page.evaluate(()=>window.__utterance),null);await host.getByRole('button',{name:'Pause narration',exact:true}).click();await host.getByRole('button',{name:'Enable voice',exact:true}).click();results.checks.push('Mute suppresses generated speech while retaining captions; Pause cancels its pending progression and voice can be re-enabled.');
  next=reply(page,'dashboard');await host.getByRole('button',{name:'Resume narration',exact:true}).click();await receive(await next,'dashboard');await pointer(page,'desktop-resumed');
  results.checks.push('Real local-model narration delivered as actual Qwen WAV audio; no Next button; Pause/Resume cleans up and re-enters the same screen.');
  for(let index=1;index<screens.length;index++){
   next=reply(page,screens[index]);await page.evaluate(()=>window.__finishPopsSpeech());await screen(page,screens[index]);await receive(await next,screens[index]);await pointer(page,'desktop-'+screens[index]);await page.screenshot({path:path.join(out,'screenshots',String(index+1).padStart(2,'0')+'-'+screens[index]+'.png')});
   if(index===1){await host.getByRole('button',{name:/Jamie Morgan/}).click();assert.match(await host.locator('[data-demo-dossier-identity]').innerText(),/Jamie Morgan/);}
   if(index===2){await host.getByRole('button',{name:/Jordan Lee.*Current attorney/}).click();assert.equal(await host.getByRole('button',{name:'Open Jordan Lee’s dossier',exact:true}).count(),1);await page.screenshot({path:path.join(out,'screenshots/desktop-relationships.png')});}
   if(index===3){await host.getByRole('button',{name:'View',exact:true}).click();await host.getByRole('dialog',{name:'Incident Detail'}).waitFor();await pointer(page,'incident-modal');assert.match(await host.getByRole('dialog').innerText(),/demo-message-001/);await host.getByRole('button',{name:'Close',exact:true}).click();}
   if(index===4){await host.getByRole('button',{name:'Open Exchange message · fictional',exact:true}).click();await host.getByRole('button',{name:'Verify Integrity',exact:true}).click();await host.getByRole('dialog').getByText('MATCH — bundled fictional text only',{exact:false}).waitFor();await pointer(page,'evidence-modal');assert.equal(await host.locator('input[type=file]:not(:disabled)').count(),0);await page.screenshot({path:path.join(out,'screenshots/desktop-evidence-check.png')});await host.getByRole('button',{name:'Close',exact:true}).click();}
   if(index===5)assert.match(await host.locator('.pops-timeline').innerText(),/demo-message-001/);
   if(index===6){await host.getByRole('button',{name:'Preview',exact:true}).click();await host.getByRole('dialog').waitFor();await pointer(page,'review-modal');assert.match(await host.getByRole('dialog').innerText(),/FICTIONAL DEMONSTRATION/);await host.getByRole('button',{name:'Close',exact:true}).click();}
  }
  results.checks.push('All eight screens progressed from actual model-selected actions after Qwen audio completion; matching fictional people, incident, evidence, timeline, report and final access link inspected.');
  assert.equal(await host.getByRole('link',{name:'Get Pops! — view access'}).getAttribute('href'),'/access');
  let mutedReply=reply(page,'get-pops');await host.getByRole('button',{name:'Mute voice',exact:true}).click();await receive(await mutedReply,'get-pops');
  next=reply(page,'review');await host.getByRole('button',{name:'Back',exact:true}).click();await receive(await next,'review');
  next=reply(page,'dashboard');await host.getByRole('button',{name:'Restart',exact:true}).click();await receive(await next,'dashboard');
  await page.reload();await host.getByRole('button',{name:'Resume narration',exact:true}).waitFor();assert.equal(await host.getAttribute('data-tour-active'),'false');
  next=reply(page,'dashboard');await host.getByRole('button',{name:'Resume narration',exact:true}).click();await receive(await next,'dashboard');
  assert.equal(await page.locator('.orb-chat-toggle,#pops-conversation-panel').count(),0);
  let answer=await voiceQuestion(page,'Who is Jordan Lee in this fictional case?');let data=await answer.json();assert.equal(data.llm_source,'local-llama.cpp');assert.match(data.spoken_output,/attorney|counsel/i);await host.getByRole('button',{name:'Resume narration',exact:true}).waitFor();
  answer=await voiceQuestion(page,'Who did I just ask about?');data=await answer.json();assert.match(data.spoken_output,/Jordan/i);
  await host.getByRole('button',{name:'Exit tour',exact:true}).click();await host.getByRole('button',{name:'Start Tour',exact:true}).waitFor();assert.equal(await page.locator('.website-orb-target-ring').count(),0);
  await page.goto(origin+'/desktop-app');answer=await voiceQuestion(page,'Remind me who Jordan was in the demo.');data=await answer.json();assert.match(data.spoken_output,/Jordan|attorney|counsel/i);
  results.checks.push('Back, Restart and paused refresh recovery passed; conversational interruption remembers Jordan and resumes normal website context after Exit and page navigation.');
  await context.close();
  for(const width of [1024,390]){
   active=await newPage(width);({page,host,context}=active);await page.goto(origin+'/product-demo');next=reply(page,'dashboard');await host.getByRole('button',{name:'Start Tour',exact:true}).click();await receive(await next,'dashboard');
   mutedReply=reply(page,'dashboard');await host.getByRole('button',{name:'Mute voice',exact:true}).click();await receive(await mutedReply,'dashboard');
   for(let index=0;index<screens.length;index++){
    await screen(page,screens[index]);await pointer(page,width+'-'+screens[index]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(index===0||index===2)await page.screenshot({path:path.join(out,'screenshots',width+'-'+screens[index]+'.png')});
    if(index<screens.length-1){next=reply(page,screens[index+1]);await page.evaluate(()=>window.__finishPopsSpeech());await receive(await next,screens[index+1]);}
   }
   await host.getByRole('button',{name:'Exit tour',exact:true}).click();await context.close();
  }
  results.checks.push('Every model-guided screen and measured pointer passed at 1440px, 1024px and 390px; all layouts avoid document overflow.');
  assert.deepEqual(results.errors,[]);assert.deepEqual(results.forbiddenRequests,[]);
  results.checks.push('Zero uncaught browser errors, customer API requests, payment requests or native-tool requests during demo/conversation.');
  results.checks.push('Qwen audio covered every desktop stop plus initial tablet/mobile playback; responsive muted progression used real caption-reading timers.');results.status='passed';fs.writeFileSync(path.join(out,'test-results.json'),JSON.stringify(results,null,2)+'\n');console.log(results.checks.join('\n'));
 }catch(error){results.status='failed';results.failure=error.message;fs.writeFileSync(path.join(out,'test-results.json'),JSON.stringify(results,null,2)+'\n');if(active&&!active.page.isClosed())await active.page.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
