import {useEffect,useRef} from 'react';
import {admitDemoCommand,DEMO_ORB_EVENT,demoOrbStatus,findDemoTarget,narrationUrls} from './orbBridge';
import type {DemoOrbCommand} from './orbBridge';
import type {WebsiteOrbGuideRequest} from '../../orb/websiteOrbTargetTypes';

interface BridgeCallbacks{
 available:()=>boolean;
 caption:(text:string,target:string)=>void;
 guide:(request:WebsiteOrbGuideRequest)=>void;
 clear:()=>void;
 activity:(speaking:boolean)=>void;
 released?:(reason:string)=>void;
}
export function useWebsiteDemoTour(callbacks:BridgeCallbacks){
 const callbacksRef=useRef(callbacks);callbacksRef.current=callbacks;
 const stopRef=useRef<(interrupted?:boolean)=>void>(()=>{});
 useEffect(()=>{
  let audio:HTMLAudioElement|null=null,utterance:SpeechSynthesisUtterance|null=null,owned=false,generation=0;
  let last:{target:string;time:number}|null=null;
  let activeTarget:HTMLElement|null=null;
  const cleanup=(reason:string,interrupted=false)=>{
   generation++;
   if(audio){last={target:audio.dataset.demoTarget||'',time:audio.currentTime};audio.pause();audio.removeAttribute('src');audio.load();audio=null;}
   if(utterance){window.speechSynthesis?.cancel();utterance=null;}
   activeTarget?.classList.remove('demo-target-active');activeTarget=null;
   if(owned){callbacksRef.current.clear();callbacksRef.current.activity(false);callbacksRef.current.released?.(reason);}owned=false;
   if(reason==='exit'||reason==='restart'||interrupted)last=null;
   if(interrupted)demoOrbStatus('Tour paused for normal Pops interaction. Resume when you are ready.','interrupted');
  };
  stopRef.current=(interrupted=false)=>cleanup('interruption',interrupted);
  const handler=(event:Event)=>{
   const command=(event as CustomEvent<DemoOrbCommand>).detail;if(!command)return;
   if(command.action==='stop'){cleanup(command.reason||'replace');return;}
   const step=admitDemoCommand(command);
   if(!step){demoOrbStatus('Tour request declined: active screen and approved target must correspond.','declined');return;}
   if(!owned&&!callbacksRef.current.available()){demoOrbStatus('Pops is busy with another interaction. Tour narration is paused.','interrupted');return;}
   cleanup('replace');owned=true;
   const token=generation;
   callbacksRef.current.caption(step.narration,step.targetId);
   callbacksRef.current.guide({targetId:step.targetId,reason:'user-started-scripted-tour',message:step.caption});
   activeTarget=findDemoTarget(step.selector);activeTarget?.classList.add('demo-target-active');
   if(command.muted){callbacksRef.current.activity(false);demoOrbStatus('Voice muted. Pops is pointing to this stop; captions and transcript remain available.','muted');return;}
   let fallbackStarted=false;
   const fallback=()=>{
    if(generation!==token||fallbackStarted)return;
    fallbackStarted=true;
    if(audio){audio.pause();audio.onerror=null;}
    if(!('speechSynthesis' in window)){callbacksRef.current.activity(false);demoOrbStatus('Voice is unavailable. Use the complete transcript and highlighted target.','unavailable');return;}
    utterance=new SpeechSynthesisUtterance(step.narration);utterance.lang='en-US';utterance.rate=.95;
    utterance.onstart=()=>{if(token===generation){callbacksRef.current.activity(true);demoOrbStatus('Pops is narrating with a browser voice fallback.','speaking');}};
    utterance.onend=()=>{if(token===generation){callbacksRef.current.activity(false);utterance=null;demoOrbStatus('Narration complete. Explore this screen or choose Next.','complete');}};
    utterance.onerror=()=>{if(token===generation){callbacksRef.current.activity(false);utterance=null;demoOrbStatus('Audio is unavailable. Captions and the full transcript remain available.','unavailable');}};
    window.speechSynthesis.speak(utterance);
   };
   audio=new Audio(narrationUrls[step.screen]);audio.dataset.demoTarget=step.targetId;audio.volume=.85;
   if(command.resume&&last?.target===step.targetId){const resumeTime=last.time;audio.addEventListener('loadedmetadata',()=>{if(audio&&Number.isFinite(audio.duration))audio.currentTime=Math.min(resumeTime,Math.max(0,audio.duration-.1));},{once:true});}
   audio.onplaying=()=>{if(token===generation){callbacksRef.current.activity(true);demoOrbStatus('Pops is narrating this fictional example.','speaking');}};
   audio.onended=()=>{if(token===generation){last=null;callbacksRef.current.activity(false);demoOrbStatus('Narration complete. Explore this screen or choose Next.','complete');}};
   audio.onerror=fallback;
   audio.play().catch((error:DOMException)=>{if(token!==generation||fallbackStarted)return;if(error.name!=='NotAllowedError'){fallback();return;}callbacksRef.current.activity(false);demoOrbStatus('Press Resume narration to enable audio. Captions remain available.','audio-blocked');});
  };
  const visibility=()=>{if(document.hidden&&owned)cleanup('visibility',true);};
  window.addEventListener(DEMO_ORB_EVENT,handler);document.addEventListener('visibilitychange',visibility);
  return ()=>{cleanup('exit');window.removeEventListener(DEMO_ORB_EVENT,handler);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 return ()=>stopRef.current(true);
}
