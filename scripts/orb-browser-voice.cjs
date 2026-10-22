// Browser tests simulate recognition only. Model replies and Qwen WAVs stay real.
async function installVoiceInput(context){await context.addInitScript(()=>{
 window.__recognitions=[];
 class Recognition {constructor(){window.__recognitions.push(this);}start(){this.started=true;}stop(){this.onend?.();}abort(){this.aborted=true;this.onend?.();}}
 Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:Recognition});
 Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:undefined});
});}
async function voiceQuestion(page,text){
 const count=await page.evaluate(()=>window.__recognitions.length);
 await page.getByRole('button',{name:'Talk to Pops',exact:true}).dispatchEvent('click');
 await page.waitForFunction(count=>window.__recognitions.length>count&&window.__recognitions.at(-1).started&&!window.__recognitions.at(-1).continuous,count);
 const response=page.waitForResponse(r=>r.url().endsWith('/api/orb/website-text')&&r.status()!==401&&r.request().postDataJSON()?.event==='question',{timeout:90000});
 await page.evaluate(text=>{const r=window.__recognitions.at(-1);r.onresult({resultIndex:0,results:[Object.assign([{transcript:text}],{isFinal:true})]});r.stop();},text);
 return response;
}
module.exports={installVoiceInput,voiceQuestion};
