import {demoSnapshot,updateDemo} from '../data/demoRuntime';
import type {CaseAlert,CaseMatter} from '../types';
export function useCase(){return {
 getCaseOverviewData:async()=>structuredClone(demoSnapshot().overview),
 saveCaseMatter:async(item:CaseMatter)=>updateDemo(current=>({...current,overview:item.id==='primary'?{...current.overview,primaryCase:item}:{...current.overview,relatedCases:[item,...current.overview.relatedCases.filter(matter=>matter.id!==item.id)]}})),
 deleteCaseMatter:async(id:string)=>updateDemo(current=>({...current,overview:{...current.overview,relatedCases:current.overview.relatedCases.filter(matter=>matter.id!==id)}})),
 saveCaseAlert:async(item:CaseAlert)=>updateDemo(current=>({...current,overview:{...current.overview,alerts:[item,...current.overview.alerts]}})),
 resolveCaseAlert:async(id:string)=>updateDemo(current=>({...current,overview:{...current.overview,alerts:current.overview.alerts.filter(item=>item.id!==id)}})),
};}
