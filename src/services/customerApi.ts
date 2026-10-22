export interface CustomerSession {
  csrfToken: string;
  user: {name: string; email: string; verified: boolean; beta: {status: string; platform: string} | null} | null;
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
export async function customerPost(action: string, payload: Record<string, unknown>): Promise<{message: string}> {
  let session: CustomerSession;
  try { session = await customerSession(); } catch { throw new CustomerError('The customer service is unavailable. Nothing has been submitted. Please try again later.'); }
  let response: Response;
  try {
    response = await fetch(`/api/customer/${action}`, {method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json', 'X-CSRFToken':session.csrfToken}, body:JSON.stringify(payload)});
  } catch { throw new CustomerError('The connection was interrupted. We could not confirm the result. Check your account or retry before assuming it succeeded.'); }
  let data: {message?: string; error?: string; fields?: Record<string,string[]>};
  try { data = await response.json(); } catch { throw new CustomerError('The service returned an unexpected response. We could not confirm completion.'); }
  if (!response.ok) throw new CustomerError(data.error || 'Unable to complete this request.', data.fields);
  return {message:data.message || 'Request completed.'};
}
