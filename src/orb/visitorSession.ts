// Temporary ORB session transport. No account fields, DOM text or customer API access.
let session:Promise<{csrfToken:string}>|null=null;
let currentToken:string|null=null;
export const isPrivateOrbPage=(path=location.pathname)=>/^\/(?:account|cart|checkout|api)(?:\/|$)/.test(path);
async function bootstrap(){
 if(!session)session=fetch('/api/orb/session',{credentials:'same-origin',cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('The local Pops conversation service is unavailable.');const data=await response.json();currentToken=data.csrfToken;return data;}).catch(error=>{session=null;currentToken=null;throw error;});
 return session;
}
export async function orbPost<T>(path:string,payload:Record<string,unknown>,signal?:AbortSignal):Promise<T>{
 if(isPrivateOrbPage())throw Error('Pops conversation is available on public product pages. Customer information stays separate.');
 for(let attempt=0;attempt<2;attempt++){
  const token=await bootstrap();
  const response=await fetch('/api/orb/'+path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Orb-CSRF':token.csrfToken},body:JSON.stringify(payload),signal});
  const data=await response.json();
  // A rejected expired-session request performed no action. Renew once; never
  // replay network failures or reuse speech references from an expired memory.
  if(response.status===401&&attempt===0){if(currentToken===token.csrfToken){session=null;currentToken=null;}continue;}
  if(!response.ok)throw Error(typeof data.detail==='string'?data.detail:'The local conversation could not complete this request.');return data;
 }
 throw Error('The visitor session could not reconnect. Refresh this page.');
}
export async function reportOrbEvent(kind:string,screen?:string){if(isPrivateOrbPage())return;await orbPost('session/event',{kind,route:location.pathname,...(screen?{screen}:{})});}
export async function clearOrbSession(){await orbPost('session/clear',{});session=null;currentToken=null;}
export async function orbSpeech(responseId:string,signal:AbortSignal):Promise<Blob>{
 if(isPrivateOrbPage())throw Error('Customer pages are excluded from ORB speech.');
 const token=await bootstrap();
 const response=await fetch('/api/orb/speech',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Orb-CSRF':token.csrfToken},body:JSON.stringify({response_id:responseId,route:location.pathname}),signal});
 if(!response.ok)throw Error('Qwen server voice is unavailable. Retry when ready.');
 return response.blob();
}
export async function orbAudio(blob:Blob):Promise<Response>{
 if(isPrivateOrbPage())throw Error('Customer pages are excluded from ORB conversation.');
 const token=await bootstrap(),form=new FormData();form.append('audio',blob,'website-orb.webm');form.append('route',location.pathname);
 const host=document.getElementById('pops-demo-root');if(host?.dataset.demoContextActive==='true'&&host.dataset.demoScreen!=='calendar')form.append('demo_screen',host.dataset.demoScreen||'dashboard');
 return fetch('/api/orb/website-voice',{method:'POST',credentials:'same-origin',headers:{'X-Orb-CSRF':token.csrfToken},body:form});
}
export type OrbAction={type:'stay'|'show_screen'|'point'|'navigate'|'exit_demo';screen?:string;target_id?:string;route?:string};
export function dispatchOrbAction(action:OrbAction){window.dispatchEvent(new CustomEvent('pops:orb-validated-action',{detail:action}));}
