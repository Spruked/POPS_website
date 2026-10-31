import destinations from './registeredDestinations.json';
import {tourSteps} from '../pops-demo-app/tour/tourSteps';
import {getPointerTarget} from './pointerTargetRegistry';
import {dispatchWebsiteOrbGuide} from './pointerGuideController';
import type {OrbAction} from './visitorSession';
export function applyOrbAction(action:OrbAction,navigate:(route:string)=>void){
 if(action.type==='stay')return true;
 if(action.type==='navigate'&&action.route&&destinations.routes.includes(action.route)){navigate(action.route);return true;}
 if(action.type==='point'&&action.target_id){const target=getPointerTarget(action.target_id);if(target&&target.route===location.pathname){dispatchWebsiteOrbGuide({targetId:target.id,reason:'validated-local-model-guidance'});return true;}}
 const host=document.getElementById('pops-demo-root');
 if(host?.dataset.demoContextActive==='true'&&location.pathname==='/product-demo'){
  if(action.type==='show_screen'&&tourSteps.some(step=>step.screen===action.screen&&step.targetId===action.target_id)){window.dispatchEvent(new CustomEvent('pops:demo-llm-screen',{detail:action}));return true;}
  if(action.type==='exit_demo'){window.dispatchEvent(new CustomEvent('pops:demo-llm-exit'));return true;}
 }
 return false;
}
