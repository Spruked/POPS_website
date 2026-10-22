import {useEffect,useRef} from 'react';
import {admitDemoCommand,DEMO_ORB_EVENT,demoOrbStatus,findDemoTarget,narrationUrls} from './orbBridge';
import type {DemoOrbCommand} from './orbBridge';
import type {WebsiteOrbGuideRequest} from '../../orb/websiteOrbTargetTypes';
import {sendWebsiteOrbText} from '../../services/orbApi';
import {dispatchOrbAction} from '../../orb/visitorSession';
import type {OrbAction} from '../../orb/visitorSession';

interface BridgeCallbacks{
 available:()=>boolean;caption:(text:string,target:string,source?:string)=>void;
 guide:(request:WebsiteOrbGuideRequest)=>void;clear:()=>void;activity:(speaking:boolean)=>void;released?:(reason:string)=>void;
}
export function useWebsiteDemoTour(callbacks:BridgeCallbacks){
 const callbacksRef=useRef(callbacks);callbacksRef.current=callbacks;
 const stopRef=useRef<(interrupted?:boolean)=>void>(()=>{});
 useEffect(()=>{
  let audio:HTMLAudioElement|null=null,utterance:SpeechSynthesisUtterance|null=null,owned=false,generation=0,request:AbortController|null=null;
  let activeTarget:HTMLElement|null=null;const timers=new Set<ReturnType<typeof setTimeout>>();
  const later=(callback:()=>void,delay:number)=>{const timer=setTimeout(()=>{timers.delete(timer);callback();},delay);timers.add(timer);};
  const cleanup=(reason:string,interrupted=false)=>{
   generation++;request?.abort();request=null;timers.forEach(clearTimeout);timers.clear();
   if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}
   if(utterance){window.speechSynthesis?.cancel();utterance=null;}
   activeTarget?.classList.remove('demo-target-active');activeTarget=null;
   if(owned){callbacksRef.current.clear();callbacksRef.current.activity(false);callbacksRef.current.released?.(reason);}owned=false;
   if(interrupted)demoOrbStatus('Guide paused for your question. Ask Pops, then Resume when ready.','interrupted');
  };
  stopRef.current=(interrupted=false)=>cleanup('interruption',interrupted);
  const handler=async(event:Event)=>{
   const command=(event as CustomEvent<DemoOrbCommand>).detail;if(!command)return;
   if(command.action==='stop'){cleanup(command.reason||'replace');return;}
   const step=admitDemoCommand(command);
   if(!step){demoOrbStatus('Guide request declined: screen and registered target must match.','declined');return;}
   if(!owned&&!callbacksRef.current.available()){demoOrbStatus('Pops is handling another interaction. Resume when ready.','interrupted');return;}
   cleanup('replace');owned=true;const token=generation;request=new AbortController();
   callbacksRef.current.guide({targetId:step.targetId,reason:'user-started-local-llm-tour',message:step.caption});
   activeTarget=findDemoTarget(step.selector);activeTarget?.classList.add('demo-target-active');
   demoOrbStatus('Pops is preparing this screen with the local model…','preparing');
   let text=step.narration,action:OrbAction={type:'stay'},model=false;
   try{
    const answer=await sendWebsiteOrbText(`Current screen: ${step.title} (${step.screen}). Approved screen brief: ${step.narration} Connect this screen to the fictional record and what we discussed. Explain this screen briefly, then emit the permitted transition after narration.`,{event:'tour_stop',demo_screen:step.screen},request.signal);
    if(token!==generation)return;
    text=answer.spoken_output;action=answer.action||{type:'stay'};model=answer.llm_source==='local-llama.cpp';
   }catch(error){if(token!==generation)return;demoOrbStatus('Local model unavailable. Playing the authored example only; automatic progression is paused. Resume to retry.','offline',text);}
   if(token!==generation)return;
   callbacksRef.current.caption(text,step.targetId,model?'local-llama.cpp-demo':'scripted-demo');
   demoOrbStatus(command.muted?'Voice muted. Read the caption; Pops will guide the next screen.':model?'Pops is narrating with the local model.':'Authored offline example; local model unavailable.',command.muted?'muted':model?'speaking':'offline',text);
   const advance=()=>{if(token===generation&&model&&action.type!=='stay')dispatchOrbAction(action);};
   const readingDelay=Math.min(16000,Math.max(6000,text.length*35));
   const complete=()=>{if(token!==generation)return;callbacksRef.current.activity(false);demoOrbStatus(model?'Narration complete. Pops is guiding the demonstration.':'Offline example complete. Resume to retry the local model.','complete',text);later(advance,900);};
   if(command.muted){callbacksRef.current.activity(false);later(advance,readingDelay);return;}
   if(model&&'speechSynthesis' in window){
    utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.98;
    let finished=false;const finish=()=>{if(finished||token!==generation)return;finished=true;utterance=null;complete();};
    utterance.onstart=()=>{if(token===generation)callbacksRef.current.activity(true);};
    utterance.onend=finish;utterance.onerror=()=>{if(token===generation)demoOrbStatus('Browser voice unavailable. Read the caption while Pops guides the screens.','voice-unavailable',text);later(finish,readingDelay);};
    try{window.speechSynthesis.speak(utterance);}catch{later(finish,readingDelay);}
    // Browser engines can fail without reporting an event. Captions remain usable.
    later(finish,Math.max(20000,readingDelay+10000));return;
   }
   if(model){later(complete,readingDelay);return;}
   audio=new Audio(narrationUrls[step.screen]);audio.volume=.85;audio.dataset.demoTarget=step.targetId;
   audio.onplaying=()=>{if(token===generation)callbacksRef.current.activity(true);};audio.onended=complete;
   audio.onerror=()=>{if(token===generation){callbacksRef.current.activity(false);demoOrbStatus('Voice unavailable. Read the authored transcript and Resume to retry the model.','voice-unavailable',text);}};
   audio.play().catch(()=>{if(token===generation){callbacksRef.current.activity(false);demoOrbStatus('Press Resume narration to enable audio or retry the local model.','audio-blocked',text);}});
  };
  const visibility=()=>{if(document.hidden&&owned)cleanup('visibility',true);};
  window.addEventListener(DEMO_ORB_EVENT,handler);document.addEventListener('visibilitychange',visibility);
  return()=>{cleanup('exit');window.removeEventListener(DEMO_ORB_EVENT,handler);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 return()=>stopRef.current(true);
}
