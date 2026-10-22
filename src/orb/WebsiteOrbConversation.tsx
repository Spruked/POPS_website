import {useState,useRef} from 'react';
import type {FormEvent} from 'react';
import type {OrbResponse} from '../services/orbApi';
import {clearOrbSession} from './visitorSession';
import './WebsiteOrbConversation.css';
export default function WebsiteOrbConversation({ask,onOpen,visible}:{ask:(question:string)=>Promise<OrbResponse>;onOpen:()=>void;visible:boolean}){
 const [open,setOpen]=useState(false),[question,setQuestion]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [messages,setMessages]=useState<{role:string;text:string}[]>([]),input=useRef<HTMLInputElement>(null);
 async function submit(event:FormEvent){event.preventDefault();if(!question.trim()||busy)return;const text=question.trim();setQuestion('');setBusy(true);setError('');setMessages(current=>[...current,{role:'You',text}]);try{const response=await ask(text);setMessages(current=>[...current,{role:'Pops',text:response.spoken_output}]);}catch(error){setError(error instanceof Error?error.message:'Pops could not answer right now.');}finally{setBusy(false);}}
 async function clear(){try{onOpen();await clearOrbSession();setMessages([]);setError('');}catch(error){setError(error instanceof Error?error.message:'Unable to clear this session.');}}
 if(!visible)return null;
 return <aside className="website-orb-conversation" aria-label="Pops conversation">
 <button className="btn btn-ghost orb-chat-toggle" type="button" aria-expanded={open} aria-controls="pops-conversation-panel" onClick={()=>{setOpen(!open);if(!open){onOpen();setTimeout(()=>input.current?.focus(),0);}}}>{open?'Close conversation':'Ask Pops'}</button>
 {open&&<section id="pops-conversation-panel" className="orb-chat-panel" aria-label="Ask Pops"><h2>Ask Pops</h2><p className="orb-chat-note">Local development assistant. Ask about the website or fictional demo. Keep private contact details, passwords and case records out of this conversation.</p><div className="orb-chat-messages" role="log" aria-live="polite">{messages.map((message,index)=><p key={index}><strong>{message.role}: </strong>{message.text}</p>)}{busy&&<p role="status">Pops is thinking…</p>}</div><form onSubmit={submit}><label htmlFor="pops-conversation-question">Question for Pops</label><input ref={input} id="pops-conversation-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={2000} autoComplete="off" required/><button className="btn btn-primary" disabled={busy}>Ask Pops</button></form>{error&&<p role="alert">{error}</p>}<button className="btn btn-ghost" type="button" disabled={busy} onClick={clear}>Clear visitor conversation</button><p className="orb-chat-note">Temporary context is isolated by visitor and expires after 30 minutes of inactivity. Clearing it does not change your customer account.</p></section>}
 </aside>;
}
