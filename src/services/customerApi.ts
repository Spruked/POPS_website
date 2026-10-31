export interface CustomerProfile {
 first_name:string; middle_name:string; last_name:string; full_name:string; name:string; display_name:string;
 email:string; phone:string; street_address:string; address_line2:string; city:string; state:string; postal_code:string; country:string;
 verified:boolean; email_verified_at:string|null; status:'active'|'unverified'|'suspended'|'closed'; created_at:string; updated_at:string; last_login:string|null; profile_complete:boolean; pending_email:string|null;
 preferences:{marketing_email:boolean;research_invitations:boolean;policy_version:string;updated_at:string};
}
export interface CustomerOptions {countries:[string,string][];us_states:[string,string][];policy_version:string}
export interface CustomerSession {
  csrfToken: string;
  user: (CustomerProfile & {beta:{status:string;platform:string}|null;permissions:{geography:boolean;customer_profiles:boolean;account_status:boolean}}) | null;
  development: boolean;
  emailDelivery: string;
}
export class CustomerError extends Error {
  fields: Record<string, string[]>;
  constructor(message: string, fields: Record<string, string[]> = {}) { super(message); this.fields = fields; }
}
export async function customerSession(): Promise<CustomerSession> {
  const response = await fetch('/api/customer/session', {credentials: 'same-origin', cache: 'no-store'});
  if (!response.ok) throw new CustomerError('The customer service is unavailable. Nothing has been submitted. Please try again later.');
  return response.json();
}
export async function customerGet<T>(action:string):Promise<T>{
 const response=await fetch(`/api/customer/${action}`,{credentials:'same-origin',cache:'no-store'});
 const data=await response.json();if(!response.ok)throw new CustomerError(data.error||'Unable to complete this request.',data.fields);return data;
}
export async function customerPost<T={message:string}>(action: string, payload: Record<string, unknown>): Promise<T> {
  let session: CustomerSession;
  try { session = await customerSession(); } catch { throw new CustomerError('The customer service is unavailable. Nothing has been submitted. Please try again later.'); }
  let response: Response;
  try {
    response = await fetch(`/api/customer/${action}`, {method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json', 'X-CSRFToken':session.csrfToken}, body:JSON.stringify(payload)});
  } catch { throw new CustomerError('The connection was interrupted. We could not confirm the result. Check your account or retry before assuming it succeeded.'); }
  let data: {message?: string; error?: string; fields?: Record<string,string[]>};
  try { data = await response.json(); } catch { throw new CustomerError('The service returned an unexpected response. We could not confirm completion.'); }
  if (!response.ok) throw new CustomerError(data.error || 'Unable to complete this request.', data.fields);
  return data as T;
}
