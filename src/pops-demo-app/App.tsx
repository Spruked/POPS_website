import {useCallback,useEffect,useLayoutEffect,useReducer,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import CaseOverview from './pages/CaseOverview';
import ContactsDossier from './pages/ContactsDossier';
import Incidents from './pages/Incidents';
import EvidenceVault from './pages/EvidenceVault';
import VisitationCalendar from './pages/VisitationCalendar';
import Reports from './pages/Reports';
import RelationshipTree from './components/RelationshipTree';
import DemoTour from './components/DemoTour';
import {DerivedTimeline} from './components/DerivedTimeline';
import {DemoToastContext} from './hooks/useToast';
import type {Toast} from './hooks/useToast';
import type {DossierCategory,Page} from './types';
import {demoTimeline,demoReports} from './data/demoRecords';
import {resetDemoRecords} from './data/demoRuntime';
import {restoreTourState,saveTourState,tourReducer} from './tour/tourController';
import type {TourAction} from './tour/tourController';
import {tourSteps} from './tour/tourSteps';
import type {DemoScreen} from './tour/tourSteps';
import {dispatchTourStop,stopDemoOrb,DEMO_ORB_STATUS_EVENT} from './tour/orbBridge';
import appCss from './styles/index.css?inline';
import demoCss from './styles/demo.css?inline';

const screenPages:Record<DemoScreen|'calendar',Page>={dashboard:'dashboard',dossier:'contacts',relationships:'relationshipTree',incident:'incidents',evidence:'evidence',timeline:'events',review:'reports','get-pops':'member',calendar:'calendar'};
export default function PopsDemoApp(){
 const hostRef=useRef<HTMLDivElement>(null),[shadow,setShadow]=useState<ShadowRoot|null>(null);
 const [tour,reduce]=useReducer(tourReducer,undefined,restoreTourState);
 const [screen,setScreen]=useState<DemoScreen|'calendar'>(()=>tourSteps[tour.index].screen);
 const [category,setCategory]=useState<DossierCategory>('all'),[focusedPerson,setFocusedPerson]=useState<string|undefined>();
 const [voiceStatus,setVoiceStatus]=useState(tour.active?'Tour restored. Resume narration when you are ready.':'Narration begins only after Start Tour.');
 const [toasts,setToasts]=useState<Toast[]>([]),[sessionKey,setSessionKey]=useState(0);
 const toastTimers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const resumeRequested=useRef(false);
 const show=useCallback((message:string,type:'success'|'error'='success')=>{const id=`demo-toast-${Date.now()}`;setToasts(current=>[...current,{id,message,type}]);toastTimers.current.push(setTimeout(()=>setToasts(current=>current.filter(item=>item.id!==id)),3500));},[]);
 useLayoutEffect(()=>{const host=hostRef.current;if(host)setShadow(host.shadowRoot||host.attachShadow({mode:'open'}));},[]);
 useEffect(()=>{resetDemoRecords();return ()=>{stopDemoOrb('exit');toastTimers.current.forEach(clearTimeout);};},[]);
 useEffect(()=>{saveTourState(tour);},[tour]);
 useEffect(()=>{setScreen(tourSteps[tour.index].screen);},[tour.index,tour.active]);
 useEffect(()=>{const handler=(event:Event)=>{const status=(event as CustomEvent<{message:string;code:string}>).detail;if(status?.message)setVoiceStatus(status.message);if(status?.code==='interrupted'||status?.code==='audio-blocked')reduce({type:'pause'});};window.addEventListener(DEMO_ORB_STATUS_EVENT,handler);return ()=>window.removeEventListener(DEMO_ORB_STATUS_EVENT,handler);},[]);
 useEffect(()=>{
  if(!shadow||!tour.active||tour.paused){stopDemoOrb();return;}
  let cancelled=false;
  const timer=setTimeout(()=>{if(!cancelled){dispatchTourStop(tourSteps[tour.index],tour.muted,resumeRequested.current);resumeRequested.current=false;}},180);
  return ()=>{cancelled=true;clearTimeout(timer);stopDemoOrb();};
 },[shadow,tour.active,tour.index,tour.muted,tour.paused,sessionKey]);
 useEffect(()=>{shadow?.querySelector('.demo-screen-scroll')?.scrollTo({top:0});},[shadow,screen,sessionKey]);
 function dispatch(action:TourAction){
  if(action.type==='pause'){stopDemoOrb('pause');setVoiceStatus('Narration paused. Resume continues this stop when you are ready.');}
  if(action.type==='exit'){stopDemoOrb('exit');setVoiceStatus('Tour exited. Pops is available for normal website guidance.');}
  if(action.type==='resume'){resumeRequested.current=true;setScreen(tourSteps[tour.index].screen);}
  reduce(action);
 }
 function start(){stopDemoOrb('restart');resumeRequested.current=false;resetDemoRecords();setCategory('all');setFocusedPerson(undefined);setToasts([]);setSessionKey(current=>current+1);reduce({type:'restart'});setVoiceStatus('Preparing the scripted tour…');}
 function openScreen(next:DemoScreen|'calendar'){
  if(next==='calendar'){stopDemoOrb();reduce({type:'pause'});setScreen(next);setVoiceStatus('Exploring the calendar. Resume narration to return to the guided stop.');}
  else{setScreen(next);reduce({type:'go',screen:next});}
 }
 function navigate(page:Page){
  if(page.startsWith('contacts')){const categories:Partial<Record<Page,DossierCategory>>={contactsAttorneys:'attorney',contactsOtherParent:'other_parent',contactsChildren:'child',contactsWitnesses:'witness',contactsHistory:'history'};setCategory(categories[page]||'all');setFocusedPerson(undefined);openScreen('dossier');}
  else if(page==='relationshipTree')openScreen('relationships');
  else if(page==='calendar'||page==='visitation')openScreen('calendar');
  else if(page==='events')openScreen('timeline');
  else if(page==='incidents')openScreen('incident');
  else if(page.startsWith('evidence'))openScreen('evidence');
  else if(page.startsWith('reports'))openScreen('review');
  else openScreen('dashboard');
 }
 const screens={dashboard:<CaseOverview/>,dossier:<ContactsDossier category={category} focusContactId={focusedPerson}/>,relationships:<RelationshipTree onOpenDossier={id=>{setFocusedPerson(id);setCategory('all');openScreen('dossier');}}/>,incident:<Incidents/>,evidence:<EvidenceVault/>,calendar:<VisitationCalendar/>,timeline:<><div className="page-header"><h2>Derived Timeline</h2><p>One fictional record, in chronological order.</p></div><DerivedTimeline events={demoTimeline}/><button className="btn btn-primary" onClick={()=>openScreen('evidence')}>Open linked evidence</button></>,review:<><section className="card" data-demo-review-summary><h2>Review the selected record</h2><p>Alex Morgan · October 10 exchange · three linked fictional text fixtures · Jordan Lee’s review context.</p><p>No legal finding, real case export, or guarantee of admissibility is implied.</p></section><Reports/></>,'get-pops':<section className="card demo-get-pops"><span className="badge badge-blue">Preserve. Protect. Prove.</span><h2>From a moment to an organized record.</h2><p>You followed the same fictional people, exchange, evidence and chronology through the adapted application screens.</p><p>Windows features and delivery remain subject to release verification. The relationship tree is a conceptual preview; Android and synchronization are developing separately.</p><p>Checkout is unavailable. This tour does not create a license, order, account, or evidence record.</p><div className="demo-end-links"><Link className="btn btn-primary" to="/access" onClick={()=>dispatch({type:'exit'})}>Get Pops! — view access</Link><Link className="btn btn-ghost" to="/beta" onClick={()=>dispatch({type:'exit'})}>Explore beta participation</Link><button className="btn btn-ghost" onClick={start}>Restart tour</button></div><details><summary>Fictional review recap</summary><pre>{demoReports[0].content}</pre></details></section>};
 return <div id="pops-demo-root" ref={hostRef} data-tour-active={tour.active&&!tour.paused?'true':'false'} data-tour-step={tour.index} data-demo-screen={screen} aria-label="Isolated Pops fictional application demonstration">{shadow&&createPortal(<DemoToastContext.Provider value={{toasts,show}}><style>{appCss+'\n'+demoCss}</style><DemoTour state={tour} dispatch={dispatch} voiceStatus={voiceStatus} onStart={start}/><div className="demo-disclosure"><strong>Fictional data only.</strong> No native services, uploads, private records or evidence storage. Refresh restores the tour position paused and resets all example edits.</div><div className="app-container" key={sessionKey}><div className="field-bg"/><Sidebar currentPage={screenPages[screen]} onNavigate={navigate}/><section className="main-content pops-main-content demo-screen-scroll" aria-label={`Mini application: ${screen}`} tabIndex={-1}><div data-demo-target={screen}><div className="demo-screen-content">{screens[screen]}</div></div></section><ToastContainer toasts={toasts}/></div></DemoToastContext.Provider>,shadow)}</div>;
}
