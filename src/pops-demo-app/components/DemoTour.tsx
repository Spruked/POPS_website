import {ArrowLeft,RotateCcw,Volume2,VolumeX,Pause,Play,X} from 'lucide-react';
import type {TourState,TourAction} from '../tour/tourController';
import {tourSteps} from '../tour/tourSteps';
export default function DemoTour({state,dispatch,voiceStatus,onStart,narration}:{narration?:string;state:TourState;dispatch:(action:TourAction)=>void;voiceStatus:string;onStart:()=>void}){
 const step=tourSteps[state.index];
 return <section className="demo-tour" aria-label="Pops application tour controls">
 {!state.active?<><div><span className="demo-eyebrow">An application inside the website</span><h2>Follow one record from people to review.</h2><p>Eight guided stops. Real application screens, adapted for fictional data. No uploads or native application services.</p></div><button className="btn btn-primary demo-start" onClick={onStart}><Play size={18}/> Start Tour</button></>:<>
 <div className="demo-tour-heading"><span className="demo-eyebrow">Guided tour · {state.index+1} / {tourSteps.length}</span><h2>{step.title}</h2><button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:'exit'})}><X size={16}/> Exit tour</button></div>
 <p className="demo-caption" aria-live="polite">{step.caption}</p><p className="demo-task">{step.task} Pops guides progression after narration. Click Pops to interrupt and ask your question aloud, then Resume narration.</p>
 <div className="demo-tour-actions"><button className="btn btn-ghost btn-sm" disabled={state.index===0} onClick={()=>dispatch({type:'back'})}><ArrowLeft size={16}/> Back</button><button className="btn btn-ghost btn-sm" onClick={()=>dispatch({type:state.paused?'resume':'pause'})}>{state.paused?<Play size={16}/>:<Pause size={16}/>} {state.paused?'Resume narration':'Pause narration'}</button><button className="btn btn-ghost btn-sm" aria-pressed={state.muted} onClick={()=>dispatch({type:'mute'})}>{state.muted?<VolumeX size={16}/>:<Volume2 size={16}/>} {state.muted?'Enable voice':'Mute voice'}</button><button className="btn btn-ghost btn-sm" onClick={onStart}><RotateCcw size={16}/> Restart</button></div>
 <p className="demo-voice-status" role="status">{voiceStatus}</p><details className="demo-transcript"><summary>Read this stop’s narration</summary><p>{narration||step.narration}</p></details>
 </>}
 </section>;
}
