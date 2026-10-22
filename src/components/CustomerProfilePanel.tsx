import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {CustomerField,FormFeedback} from './CustomerForms';
import CustomerDetailsFields from './CustomerDetailsFields';
import {customerGet,customerPost,CustomerError} from '../services/customerApi';
import type {CustomerOptions,CustomerSession} from '../services/customerApi';

export default function CustomerProfilePanel({user,options,preferencesOnly,onUpdated}:{user:NonNullable<CustomerSession['user']>;options:CustomerOptions|null;preferencesOnly:boolean;onUpdated:()=>Promise<void>}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false),[errors,setErrors]=useState<Record<string,string[]>>({}),[history,setHistory]=useState<{purpose:string;granted:boolean;policy_version:string;occurred_at:string}[]>([]);
 async function loadHistory(){const data=await customerGet<{events:typeof history}>('preferences/history');setHistory(data.events);}
 useEffect(()=>{if(preferencesOnly)void loadHistory().catch(()=>{});},[preferencesOnly]);
 async function submit(event:FormEvent<HTMLFormElement>,action:string){event.preventDefault();const payload:Record<string,unknown>=Object.fromEntries(new FormData(event.currentTarget));if(action==='preferences'){payload.marketing_email=payload.marketing_email==='on';payload.research_invitations=payload.research_invitations==='on';}await perform(action,payload);}
 async function perform(action:string,payload:Record<string,unknown>){setBusy(true);setMessage('');setErrors({});setFailed(false);try{const result=await customerPost(action,payload);setMessage(result.message);await onUpdated();if(action==='preferences')await loadHistory();}catch(error){setFailed(true);setMessage(error instanceof Error?error.message:'Unable to save your changes.');if(error instanceof CustomerError)setErrors(error.fields);}finally{setBusy(false);}}
 return <>
 <nav className="launch-tabs" aria-label="Customer profile navigation"><Link className="btn btn-ghost" to="/account">Account overview</Link><Link className="btn btn-ghost" to="/account/profile">Edit profile</Link><Link className="btn btn-ghost" to="/account/preferences">Communication preferences</Link></nav>
 {!user.profile_complete&&<p className="launch-feedback">Your existing account is preserved. Please complete the missing name, phone and mailing-address fields; we have not guessed those details.</p>}
 <FormFeedback message={message} error={failed}/>
 {preferencesOnly?<><form className="launch-form" onSubmit={e=>submit(e,'preferences')} aria-busy={busy}>
 <h3>Your choices</h3><p>Both preferences are optional and independently controlled. Neither is required for registration or product access. Verification, password reset, security notices and necessary service messages remain operational communications.</p>
 <label className="launch-check"><input type="checkbox" name="marketing_email" defaultChecked={user.preferences.marketing_email}/><span>Email me optional Pops! product news and marketing.</span></label>
 <label className="launch-check"><input type="checkbox" name="research_invitations" defaultChecked={user.preferences.research_invitations}/><span>Invite me to optional product research and surveys.</span></label>
 <p>Preference policy: {user.preferences.policy_version}. Your geographic profile supports aggregated product planning. These choices do not subscribe you to a third-party advertising campaign.</p><button className="btn btn-primary" disabled={busy}>Save communication preferences</button>
 </form><h3>Preference history</h3><p>Most recent 100 recorded choices and changes. Historical development accounts have no invented consent date.</p><div className="launch-table-wrap"><table><thead><tr><th scope="col">Date</th><th scope="col">Preference</th><th scope="col">Choice</th><th scope="col">Policy version</th></tr></thead><tbody>{history.map((event,i)=><tr key={i}><td>{new Date(event.occurred_at).toLocaleString()}</td><td>{event.purpose==='marketing_email'?'Marketing email':'Research invitations'}</td><td>{event.granted?'Granted':'Declined / withdrawn'}</td><td>{event.policy_version}</td></tr>)}</tbody></table></div></>:<>
 <form className="launch-form" onSubmit={e=>submit(e,'profile/save')} aria-busy={busy} key={user.updated_at}><CustomerDetailsFields options={options} profile={user} errors={errors}/><button className="btn btn-primary" disabled={busy}>Save profile</button></form>
 <form className="launch-form" onSubmit={e=>submit(e,'email/change')} aria-busy={busy}><h3>Change your verified email</h3><p>Current email: {user.email}. Your current address stays active until the new address is verified. Verification signs out all website sessions; your account, creation date and preferences are retained.</p><CustomerField name="email" label="New email address" type="email" autoComplete="email" maxLength={254} required errors={errors}/><CustomerField name="current_password" label="Current password to authorize email change" type="password" autoComplete="current-password" required errors={errors}/><button className="btn btn-primary" disabled={busy}>Verify a new email</button></form>
 {user.pending_email&&<div className="launch-feedback"><p>Pending verification: {user.pending_email}</p><button className="btn btn-ghost" disabled={busy} onClick={()=>perform('email/cancel',{})}>Cancel pending email change</button></div>}
 </>}
 </>;
}
