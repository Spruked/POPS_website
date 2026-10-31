const {chromium}=require('playwright');
const {voiceQuestion}=require('./orb-browser-voice.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),checks=[],requests=[],errors=[];
 await page.addInitScript(()=>{
  sessionStorage.setItem('pops:startup-splash-seen','1');window.__audio=[];window.__recognitions=[];
  const Audio=window.Audio;window.Audio=function(src){const a=new Audio(src);window.__audio.push(a);return a;};window.Audio.prototype=Audio.prototype;
  class Recognition {constructor(){window.__recognitions.push(this);}start(){this.started=true;}stop(){this.onend?.();}abort(){this.aborted=true;this.onend?.();}}
  Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:Recognition});
  Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:undefined});
 });
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/api/orb/'))requests.push({path:r.url().split('/api/orb/')[1],body:r.postData()});});
 try{
  const ready=page.waitForResponse(r=>r.url().endsWith('/api/orb/session'));await page.goto('http://localhost:5173/desktop-app');await ready;assert.equal(await page.locator('.orb-chat-toggle,#pops-conversation-panel').count(),0);
  // Invalidate the backend session without resetting the frontend module cache,
  // reproducing an idle expiry or backend restart on an already-open page.
  await page.evaluate(async()=>{const token=await fetch('/api/orb/session').then(r=>r.json());await fetch('/api/orb/session/clear',{method:'POST',headers:{'Content-Type':'application/json','X-Orb-CSRF':token.csrfToken},body:'{}'});});
  const expired=page.waitForResponse(r=>r.url().endsWith('/api/orb/website-text')&&r.status()===401);
  const answerAfterExpiry=voiceQuestion(page,'Say hello in three words.');await expired;assert.equal((await answerAfterExpiry).status(),200);
  await page.getByRole('status').filter({hasText:'Preparing Qwen voice'}).waitFor();
  await page.waitForFunction(()=>window.__audio.some(a=>a.src.startsWith('blob:')&&!a.paused&&a.currentTime>0),null,{timeout:120000});
  checks.push('Expired server session returns 401, renews once, then delivers an actual model response and playable Qwen WAV without refreshing the page.');
  await page.getByRole('button',{name:'Talk to Pops',exact:true}).dispatchEvent('click');
  await page.getByRole('status').filter({hasText:'Listening… Ask your question'}).first().waitFor();
  const answer=page.waitForResponse(r=>r.url().endsWith('/api/orb/website-text')&&r.status()===200);
  await page.evaluate(()=>{const r=window.__recognitions.at(-1);r.onresult({resultIndex:0,results:[Object.assign([{transcript:'Say welcome in three words.'}],{isFinal:true})]});r.stop();});
  await answer;
  await page.waitForFunction(()=>window.__audio.some(a=>a.src.startsWith('blob:')&&!a.paused&&a.currentTime>0),null,{timeout:120000});
  assert.ok(requests.some(r=>r.path==='website-text'&&JSON.parse(r.body).transcript==='Say welcome in three words.'));
  assert.equal(requests.filter(r=>r.path==='website-voice').length,0);
  checks.push('A simulated browser recognition result reaches the actual LLM and Qwen playback; clicking Pops no longer posts audio to an unconfigured STT provider. Physical microphone transcription is not claimed.');
  await page.getByRole('button',{name:'Talk to Pops',exact:true}).dispatchEvent('click');
  await page.getByRole('status').filter({hasText:'Listening… Ask your question'}).first().waitFor();
  await page.evaluate(()=>window.__recognitions.at(-1).onerror({error:'not-allowed'}));
  await page.getByRole('status').filter({hasText:'Microphone permission was denied'}).first().waitFor();
  checks.push('Microphone denial is visible with a retry instruction; no text-chat control is present.');
  await page.getByRole('button',{name:'Talk to Pops',exact:true}).dispatchEvent('click');await page.getByRole('status').filter({hasText:'Listening… Ask your question'}).first().waitFor();
  await page.getByRole('link',{name:'Android',exact:true}).first().click();
  assert.equal(await page.evaluate(()=>window.__recognitions.at(-1).aborted),true);
  assert.equal(await page.evaluate(()=>window.__audio.filter(a=>a.src.startsWith('blob:')&&!a.paused).length),0);
  checks.push('Navigation aborts recognition and cancels audio.');
  assert.deepEqual(errors,[]);fs.mkdirSync('docs/launch/qwen-validation',{recursive:true});fs.writeFileSync('docs/launch/qwen-validation/recovery.json',JSON.stringify({status:'passed',checks,errors},null,2)+'\n');console.log(checks.join('\n'));
 }catch(error){await page.screenshot({path:'.local/orb/recovery-failure.png'});throw error;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
