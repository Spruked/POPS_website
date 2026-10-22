import { useSyncExternalStore } from 'react';
import {demoSnapshot,demoSubscribe,updateDemo} from '../data/demoRuntime';
import type {ContactResearchFinding, Evidence, CourtOrder, Violation, Event, Report, PlayerDossierRecord} from '../types';
type Collections={evidence:Evidence;orders:CourtOrder;violations:Violation;events:Event;reports:Report;contacts:PlayerDossierRecord;research:ContactResearchFinding};
function useCollection<K extends keyof Collections>(key:K){
 const state=useSyncExternalStore(demoSubscribe,demoSnapshot,demoSnapshot);
 return {items:state[key] as Collections[K][],loaded:true,refresh:async()=>{},add:async(item:Collections[K])=>{updateDemo(current=>({...current,[key]:[item,...current[key]]}));},remove:async(id:string)=>{updateDemo(current=>({...current,[key]:current[key].filter(item=>item.id!==id)}));},update:async(id:string,changes:Partial<Collections[K]>)=>{updateDemo(current=>({...current,[key]:current[key].map(item=>item.id===id?{...item,...changes}:item)}));}};
}
export const useEvidenceStore=()=>useCollection('evidence');
export const useOrderStore=()=>useCollection('orders');
export const useViolationStore=()=>useCollection('violations');
export const useEventStore=()=>useCollection('events');
export const useReportStore=()=>useCollection('reports');
export const usePlayersStore=()=>useCollection('contacts');
export const useProfileStore=()=>({profile:useSyncExternalStore(demoSubscribe,demoSnapshot,demoSnapshot).profile});
export const useContactResearchStore=(contactId:string)=>{const store=useCollection('research');return {...store,items:store.items.filter(item=>item.contactId===contactId)};};
