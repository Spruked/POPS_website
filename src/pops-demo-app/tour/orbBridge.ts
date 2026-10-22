import type {WebsiteOrbTarget} from '../../orb/websiteOrbTargetTypes';
import {tourSteps} from './tourSteps';
import type {TourStep} from './tourSteps';

export const DEMO_ORB_EVENT='pops:demo-orb-presentation';
export const DEMO_ORB_STATUS_EVENT='pops:demo-orb-status';
export const DEMO_HOST_ID='pops-demo-root';
export interface DemoOrbCommand{action:'present'|'stop';targetId?:string;muted?:boolean;resume?:boolean;reason?:string}
export function dispatchTourStop(step:TourStep,muted:boolean,resume=false){window.dispatchEvent(new CustomEvent<DemoOrbCommand>(DEMO_ORB_EVENT,{detail:{action:'present',targetId:step.targetId,muted,resume}}));}
export function stopDemoOrb(reason='replace'){window.dispatchEvent(new CustomEvent<DemoOrbCommand>(DEMO_ORB_EVENT,{detail:{action:'stop',reason}}));}
export function demoOrbStatus(message:string,code:string){window.dispatchEvent(new CustomEvent(DEMO_ORB_STATUS_EVENT,{detail:{message,code}}));}
export function demoStepFromTarget(id:string|undefined){return tourSteps.find(step=>step.targetId===id)||null;}
export function findDemoTarget(selector:string):HTMLElement|null{
 const root=document.getElementById(DEMO_HOST_ID)?.shadowRoot;
 if(!root?.querySelector(selector))return null;
 return root.querySelector<HTMLElement>('.modal[role="dialog"] .modal-header')||root.querySelector<HTMLElement>(selector)||null;
}
export function getDemoVisibleRect(element:HTMLElement):DOMRect|null{
 const rect=element.getBoundingClientRect();
 const root=element.getRootNode() as ShadowRoot;
 const viewport=root.querySelector(element.closest('.modal')?'.app-container':'.demo-screen-scroll')?.getBoundingClientRect();
 const left=Math.max(rect.left,viewport?.left||0,0),right=Math.min(rect.right,viewport?.right||innerWidth,innerWidth);
 const controlsBottom=root.querySelector('.demo-tour')?.getBoundingClientRect().bottom||0;
 const top=Math.max(rect.top,viewport?.top||0,96,controlsBottom),bottom=Math.min(rect.bottom,viewport?.bottom||innerHeight,innerHeight);
 return right>left&&bottom>top?new DOMRect(left,top,right-left,bottom-top):null;
}
export function scrollDemoTargetIntoView(element:HTMLElement){
 const host=document.getElementById(DEMO_HOST_ID),root=host?.shadowRoot;
 const viewport=root?.querySelector<HTMLElement>('.demo-screen-scroll');
 if(viewport){const target=element.getBoundingClientRect(),bounds=viewport.getBoundingClientRect();viewport.scrollTo({top:Math.max(0,viewport.scrollTop+target.top-bounds.top-20),behavior:'instant' as ScrollBehavior});}
 host?.scrollIntoView({behavior:'smooth',block:'start'});
}
export function getDemoPointerTarget(id:string|undefined):WebsiteOrbTarget|null{
 const step=demoStepFromTarget(id);if(!step)return null;
 const host=document.getElementById(DEMO_HOST_ID);
 if(location.pathname!=='/product-demo'||host?.dataset.tourActive!=='true'||host.dataset.demoScreen!==step.screen)return null;
 return {id:step.targetId,route:'/product-demo',selector:step.selector,label:step.title,description:step.caption,actions:['scroll_to_target','ping','explain'],guideOnly:true};
}
// Presentation gate: desired tour state ∩ runtime availability ∩ bounded policy.
// It does not replace TPC, Correspondence, Doctrine, cognition, retrieval or memory.
// Narration comes only from the matching authored step; callers cannot inject text or selectors.
export function admitDemoCommand(command:DemoOrbCommand){
 if(command.action!=='present')return null;
 const step=demoStepFromTarget(command.targetId),host=document.getElementById(DEMO_HOST_ID);
 if(location.pathname!=='/product-demo'||!step||host?.dataset.tourActive!=='true'||host.dataset.demoScreen!==step.screen||Number(host.dataset.tourStep)!==tourSteps.indexOf(step))return null;
 if(!findDemoTarget(step.selector))return null;
 return step;
}
export const narrationUrls:Record<string,string>={
 dashboard:new URL('../assets/narration/dashboard.wav',import.meta.url).href,
 dossier:new URL('../assets/narration/dossier.wav',import.meta.url).href,
 relationships:new URL('../assets/narration/relationships.wav',import.meta.url).href,
 incident:new URL('../assets/narration/incident.wav',import.meta.url).href,
 evidence:new URL('../assets/narration/evidence.wav',import.meta.url).href,
 timeline:new URL('../assets/narration/timeline.wav',import.meta.url).href,
 review:new URL('../assets/narration/review.wav',import.meta.url).href,
 'get-pops':new URL('../assets/narration/get-pops.wav',import.meta.url).href,
};
