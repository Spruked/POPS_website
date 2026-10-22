import { createDemoRecords, DEMO_NOW, DEMO_TEXT } from './demoRecords';
import type { Incident } from '../types';

let snapshot=createDemoRecords();
const listeners=new Set<()=>void>();
export const demoSubscribe=(listener:()=>void)=>{listeners.add(listener);return ()=>{listeners.delete(listener);};};
export const demoSnapshot=()=>snapshot;
export function updateDemo(update:(current:ReturnType<typeof createDemoRecords>)=>ReturnType<typeof createDemoRecords>){snapshot=update(snapshot);listeners.forEach(listener=>listener());}
export function resetDemoRecords(){snapshot=createDemoRecords();listeners.forEach(listener=>listener());}
export async function hashDemoText(text:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');}
// This is an in-memory presentation adapter, not a native command bridge.
// No network, SQLite, localStorage, filesystem, Tauri, or evidence import is available.
export async function demoAction<T=unknown>(action:string,args:Record<string,unknown>={}):Promise<T>{
 let value:unknown;
 switch(action){
  case 'get_incidents': value=snapshot.incidents;break;
  case 'get_operational_records':value=snapshot.visits;break;
  case 'get_sealed_records':value=[];break;
  case 'get_audit_ledger':value=[{id:'demo-audit-001',recordId:'demo-incident-001',action:'Fictional fixture linked for review',payloadHash:snapshot.evidence[0]?.sha256,hash:snapshot.evidence[0]?.sha256,createdAt:DEMO_NOW,metadataJson:JSON.stringify({source:'Bundled fictional text',simulated:true})}];break;
  case 'get_evidence_chain':value=[{id:'demo-chain-001',evidenceId:String(args.evidenceId),action:'Example source association — simulated handling history',hash:snapshot.evidence.find(item=>item.id===args.evidenceId)?.sha256,createdAt:DEMO_NOW,metadataJson:JSON.stringify({fictional:true,incidentId:'demo-incident-001'})}];break;
  case 'verify_evidence_integrity':{const text=DEMO_TEXT[String(args.evidenceId)];if(!text)throw new Error('Only bundled fictional text can be checked.');const actualHash=await hashDemoText(text);value={status:actualHash===args.expectedHash?'MATCH — bundled fictional text only':'MISMATCH — fictional reference',expectedHash:args.expectedHash,actualHash};break;}
  case 'create_incident':{const input=args.input as Partial<Incident>;const item={...snapshot.incidents[0],...input,id:`demo-created-${snapshot.incidents.length+1}`,createdAt:DEMO_NOW};updateDemo(current=>({...current,incidents:[item,...current.incidents]}));value=item;break;}
  case 'delete_incident':updateDemo(current=>({...current,incidents:current.incidents.filter(item=>item.id!==args.id)}));break;
  case 'save_operational_record':updateDemo(current=>({...current,visits:[args.item as typeof current.visits[number],...current.visits]}));break;
  case 'delete_operational_record':updateDemo(current=>({...current,visits:current.visits.filter(item=>item.id!==args.id)}));break;
  default:throw new Error('This operation is unavailable in the fictional website demo. No native operation was performed.');
 }
 return structuredClone(value) as T;
}
