import type { InputHTMLAttributes } from 'react';
export function CustomerField({name,label,errors,...props}: InputHTMLAttributes<HTMLInputElement> & {name:string;label:string;errors?:Record<string,string[]>}) {
 const messages=errors?.[name];
 return <div><label htmlFor={`customer-${name}`}>{label}</label><input id={`customer-${name}`} name={name} aria-invalid={messages ? true : undefined} aria-describedby={messages ? `error-${name}` : undefined} {...props}/>{messages && <span className="launch-field-error" id={`error-${name}`}>{messages.join(' ')}</span>}</div>;
}
export function Honeypot(){return <div className="launch-honeypot" aria-hidden="true"><label htmlFor="customer-website">Leave this field empty</label><input id="customer-website" name="website" autoComplete="off" tabIndex={-1}/></div>;}
export function FormFeedback({message,error=false}:{message:string;error?:boolean}) {return message ? <div className={`launch-feedback${error?' is-error':''}`} role={error?'alert':'status'}>{message}</div> : null;}
