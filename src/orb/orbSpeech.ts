import {orbSpeech} from './visitorSession';
import type {OrbResponse} from '../services/orbApi';

// Shared transport only: the configured TTS provider runs outside the browser.
export async function prepareOrbSpeech(response:OrbResponse,signal:AbortSignal){
 if(!response.speech_id)throw Error('No session speech reference.');
 const controller=new AbortController();
 const abort=()=>controller.abort();signal.addEventListener('abort',abort,{once:true});
 // Keep the caption useful even when a local voice provider stalls.
 const timeout=window.setTimeout(abort,175000);
 try{
  if(signal.aborted)throw new DOMException('Speech interrupted.','AbortError');
  const {audio:blob,provider}=await orbSpeech(response.speech_id,controller.signal);
  if(signal.aborted)throw new DOMException('Speech interrupted.','AbortError');
  const url=URL.createObjectURL(blob),audio=new Audio(url);
  let released=false;
  const release=()=>{if(released)return;released=true;audio.onended=null;audio.onerror=null;audio.onplaying=null;audio.pause();audio.removeAttribute('src');audio.load();URL.revokeObjectURL(url);};
  return {audio,provider,release};
 }finally{window.clearTimeout(timeout);signal.removeEventListener('abort',abort);}
}
