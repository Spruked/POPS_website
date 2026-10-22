import {useEffect,useRef} from 'react';
import {admitDemoCommand,DEMO_ORB_EVENT,demoOrbStatus,findDemoTarget,narrationUrls} from './orbBridge';
import type {DemoOrbCommand} from './orbBridge';
import type {WebsiteOrbGuideRequest} from '../../orb/websiteOrbTargetTypes';
import {sendWebsiteOrbText} from '../../services/orbApi';
import type {OrbResponse} from '../../services/orbApi';
import {prepareOrbSpeech} from '../../orb/orbSpeech';
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
  let audio:HTMLAudioElement|null=null,owned=false,generation=0,request:AbortController|null=null;
  let releaseAudio:(()=>void)|null=null;
  let activeTarget:HTMLElement|null=null;const timers=new Set<ReturnType<typeof setTimeout>>();
  const later=(callback:()=>void,delay:number)=>{const timer=setTimeout(()=>{timers.delete(timer);callback();},delay);timers.add(timer);};
  const cleanup=(reason:string,interrupted=false)=>{
   generation++;request?.abort();request=null;timers.forEach(clearTimeout);timers.clear();
   releaseAudio?.();releaseAudio=null;
   if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}
   activeTarget?.classList.remove('demo-target-active');activeTarget=null;
   if(owned){callbacksRef.current.clear();callbacksRef.current.activity(false);callbacksRef.current.released?.(reason);}owned=false;
   if(interrupted)demoOrbStatus('Guide paused for your spoken question. Click Pops, then Resume narration when ready.','interrupted');
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
   let text=step.narration,action:OrbAction={type:'stay'},model=false,speechResponse:OrbResponse|null=null;
   try{
    const answer=await sendWebsiteOrbText(`Current screen: ${step.title} (${step.screen}). Approved screen brief: ${step.narration} Connect this screen to the fictional record and what we discussed. Explain this screen briefly, then emit the permitted transition after narration.`,{event:'tour_stop',demo_screen:step.screen},request.signal);
    if(token!==generation)return;
    text=answer.spoken_output;action=answer.action||{type:'stay'};model=answer.llm_source==='local-llama.cpp';speechResponse=answer;
   }catch(error){if(token!==generation)return;demoOrbStatus('Local model unavailable. Playing the authored example only; automatic progression is paused. Resume to retry.','offline',text);}
   if(token!==generation)return;
   callbacksRef.current.caption(text,step.targetId,model?'local-llama.cpp-demo':'scripted-demo');
   demoOrbStatus(command.muted?'Voice muted. Read the caption; Pops will guide the next screen.':model?'Pops is narrating with the local model.':'Authored offline example; local model unavailable.',command.muted?'muted':model?'speaking':'offline',text);
   const advance=()=>{if(token===generation&&model&&action.type!=='stay')dispatchOrbAction(action);};
   const readingDelay=Math.min(16000,Math.max(6000,text.length*35));
   const complete=()=>{if(token!==generation)return;callbacksRef.current.activity(false);demoOrbStatus(model?'Narration complete. Pops is guiding the demonstration.':'Offline example complete. Resume to retry the local model.','complete',text);later(advance,900);};
   if(command.muted){callbacksRef.current.activity(false);later(advance,readingDelay);return;}
   const voiceUnavailable=()=>{
    if(token!==generation)return;
    releaseAudio?.();releaseAudio=null;audio=null;
    callbacksRef.current.activity(false);
    demoOrbStatus('Qwen server voice is unavailable or playback was blocked. The tour is paused. Resume narration to retry.','audio-blocked',text);
   };
   if(model&&speechResponse?.speech_id){
    demoOrbStatus('Preparing the Qwen voice. You can read the caption now.','preparing-voice',text);
    try{
     const prepared=await prepareOrbSpeech(speechResponse,request!.signal);
     if(token!==generation){prepared.release();return;}
     audio=prepared.audio;releaseAudio=prepared.release;audio.dataset.demoTarget=step.targetId;
     audio.onplaying=()=>{if(token===generation){callbacksRef.current.activity(true);demoOrbStatus('Pops is narrating with Qwen TTS.','speaking',text);}};
     audio.onended=complete;audio.onerror=voiceUnavailable;
     await audio.play().catch(()=>{if(token===generation)voiceUnavailable();});
    }catch{if(token===generation)voiceUnavailable();}
    return;
   }
   if(model){voiceUnavailable();return;}
   audio=new Audio(narrationUrls[step.screen]);audio.volume=.85;audio.dataset.demoTarget=step.targetId;
   audio.onplaying=()=>{if(token===generation)callbacksRef.current.activity(true);};audio.onended=complete;
   audio.onerror=()=>{if(token===generation){callbacksRef.current.activity(false);demoOrbStatus('Voice unavailable. Read the authored transcript and Resume to retry the model.','voice-unavailable',text);}};
   audio.play().catch(()=>{if(token===generation){callbacksRef.current.activity(false);demoOrbStatus('Press Resume narration to enable audio or retry the local model.','audio-blocked',text);}});
  };
  const visibility=()=>{if(document.hidden&&owned)cleanup('visibility',true);};
  const pagehide=()=>cleanup('pagehide',true);
  window.addEventListener(DEMO_ORB_EVENT,handler);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',pagehide);
  return()=>{cleanup('exit');window.removeEventListener(DEMO_ORB_EVENT,handler);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',pagehide);};
 },[]);
 return()=>stopRef.current(true);
}
