import {tourSteps} from './tourSteps';
import type {DemoScreen} from './tourSteps';
export const TOUR_STORAGE_KEY='pops:mini-app-tour:v1';
export interface TourState{active:boolean;index:number;muted:boolean;paused:boolean}
export type TourAction={type:'start'|'restart'|'next'|'back'|'exit'|'pause'|'resume'|'mute'}|{type:'go';screen:DemoScreen};
export const initialTourState:TourState={active:false,index:0,muted:false,paused:false};
export function tourReducer(state:TourState,action:TourAction):TourState{
 switch(action.type){
  case 'start':case 'restart':return {...state,active:true,index:0,paused:false};
  case 'next':return {...state,index:Math.min(tourSteps.length-1,state.index+1),paused:false};
  case 'back':return {...state,index:Math.max(0,state.index-1),paused:false};
  case 'exit':return {...state,active:false,index:0,paused:false};
  case 'pause':return {...state,paused:true};
  case 'resume':return {...state,paused:false};
  case 'mute':return {...state,muted:!state.muted};
  case 'go':return {...state,index:Math.max(0,tourSteps.findIndex(step=>step.screen===action.screen))};
 }
}
export function restoreTourState():TourState{
 try{const value=JSON.parse(sessionStorage.getItem(TOUR_STORAGE_KEY)||'null');if(value&&Number.isInteger(value.index)&&value.index>=0&&value.index<tourSteps.length&&typeof value.active==='boolean')return {active:value.active,index:value.index,muted:value.muted===true,paused:value.active};}catch{/* Storage is optional. */}
 return initialTourState;
}
export function saveTourState(state:TourState){try{sessionStorage.setItem(TOUR_STORAGE_KEY,JSON.stringify({active:state.active,index:state.index,muted:state.muted}));}catch{/* Refresh recovery is best-effort; no case data is stored. */}}
