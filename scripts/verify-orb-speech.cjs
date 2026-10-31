const {chromium}=require('playwright');
const {installVoiceInput,voiceQuestion}=require('./orb-browser-voice.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs');
const output='docs/launch/qwen-validation';fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),errors=[];
 await context.addInitScript(()=>{
  sessionStorage.setItem('pops:startup-splash-seen','1');window.__audio=[];window.__urls=new Set();window.__fallbacks=[];
  const NativeAudio=window.Audio;window.Audio=function(src){const audio=new NativeAudio(src);window.__audio.push(audio);return audio;};window.Audio.prototype=NativeAudio.prototype;
  const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=create(blob);window.__urls.add(url);return url;};URL.revokeObjectURL=url=>{window.__urls.delete(url);revoke(url);};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speaking:false,cancel(){this.speaking=false;},getVoices(){return[];},speak(item){this.speaking=true;window.__fallbacks.push(item.text);item.onstart?.();}}});
  Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:undefined});Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:undefined});
 });
 await installVoiceInput(context);
 const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
 const host=page.locator('#pops-demo-root'),checks=[],samples=[];
 async function playing(){await page.waitForFunction(()=>window.__audio.some(a=>a.src.startsWith('blob:')&&!a.paused&&a.currentTime>0),null,{timeout:120000});samples.push(await page.evaluate(()=>{const a=window.__audio.find(a=>a.src.startsWith('blob:')&&!a.paused);return{duration:a.duration,currentTime:a.currentTime,readyState:a.readyState};}));assert.ok(samples.at(-1).duration>0);}
 async function silent(){await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__audio.filter(a=>a.src.startsWith('blob:')&&!a.paused).length),0);assert.equal(await page.evaluate(()=>window.__urls.size),0);}
 async function question(text){const response=await voiceQuestion(page,text);assert.equal(response.status(),200);return response.json();}
 try{
  await page.goto('http://localhost:5173/desktop-app');await playing();
  assert.equal(await page.locator('.orb-chat-toggle,#pops-conversation-panel').count(),0);const answer=await question('Which operating system does the desktop product target?');assert.match(answer.spoken_output,/Windows/);await page.waitForFunction(text=>document.querySelector('.website-orb-speech')?.textContent.includes(text),answer.spoken_output.slice(0,100),{timeout:3000});checks.push('Conversation captions appear as soon as the model replies, independently of Qwen audio preparation.');await playing();
  checks.push('Existing Qwen voice plays the authored greeting and an actual generated conversation response through the website backend.');
  await question('Which operating system did you just name?');await playing();assert.equal(await page.evaluate(()=>window.__audio.filter(a=>a.src.startsWith('blob:')&&!a.paused).length),1);
  await page.screenshot({path:output+'/conversation.png'});await page.getByRole('link',{name:'Android',exact:true}).first().click();await silent();
  checks.push('A new question interrupts the previous clip; route navigation stops playback and revokes its object URL.');
  await page.getByRole('link',{name:'Demo',exact:true}).first().click();await host.getByRole('button',{name:'Start Tour',exact:true}).click();await playing();await host.getByRole('status').filter({hasText:'Qwen TTS'}).waitFor();
  await page.screenshot({path:output+'/tour.png'});await host.getByRole('button',{name:'Pause narration',exact:true}).click();await silent();await host.getByRole('button',{name:'Resume narration',exact:true}).click();await playing();
  await host.getByRole('button',{name:'Exit tour',exact:true}).click();await silent();assert.equal(await page.evaluate(()=>window.__fallbacks.length),0);
  checks.push('Guided narration uses actual Qwen WAV playback; Pause/Resume and Exit immediately release audio, requests and blob URLs without browser speech.');
  let unblock;const held=new Promise(resolve=>unblock=resolve);
  await page.route('**/api/orb/speech',async route=>{await held;await route.abort().catch(()=>{});});
  const requested=page.waitForRequest(r=>r.url().endsWith('/api/orb/speech'));await host.getByRole('button',{name:'Start Tour',exact:true}).click();await requested;
  await host.getByRole('button',{name:'Exit tour',exact:true}).click();unblock();await silent();await page.unroute('**/api/orb/speech');assert.equal(await page.evaluate(()=>window.__fallbacks.length),0);
  checks.push('Exit during an intentionally delayed speech request cancels it; no late clip or emergency speech begins.');
  await page.route('**/api/orb/speech',route=>route.fulfill({status:503,contentType:'application/json',body:'{"detail":"Test-only Qwen outage"}'}));
  await host.getByRole('button',{name:'Start Tour',exact:true}).click();await host.getByRole('button',{name:'Resume narration',exact:true}).waitFor({timeout:90000});await host.getByRole('status').filter({hasText:'Qwen server voice'}).waitFor();assert.equal(await page.evaluate(()=>window.__fallbacks.length),0);
  await host.getByRole('button',{name:'Exit tour',exact:true}).click();assert.equal(await page.evaluate(()=>speechSynthesis.speaking),false);await page.unroute('**/api/orb/speech');
  checks.push('An explicitly simulated Qwen outage pauses the tour with captions and a retry control; no browser voice is used.');
  await host.getByRole('button',{name:'Start Tour',exact:true}).click();await playing();await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));await silent();
  await page.close();assert.ok(page.isClosed());checks.push('Page-hide cleanup stops active Qwen audio and revokes URLs; the browser page then closes cleanly.');
  assert.deepEqual(errors,[]);fs.writeFileSync(output+'/results.json',JSON.stringify({status:'passed',provider:'Existing Qwen CLI',voice:'Vivian',language:'English',checks,samples,errors,method:'Actual Qwen audio decoded and played. Browser recognition input is simulated; a speech-synthesis sentinel asserts zero browser voice. Outage and pending-request cancellation are explicitly simulated.'},null,2)+'\n');console.log(checks.join('\n'));
 }catch(error){if(!page.isClosed())await page.screenshot({path:'.local/qwen-tts/browser-failure.png',fullPage:true});throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
