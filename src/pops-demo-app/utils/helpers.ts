let nextId=0;
export const generateId=()=>`demo-local-${++nextId}`;
export const formatDate=(date:string)=>date?new Date(date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}):'';
export const formatDateTime=(date:string)=>date?new Date(date).toLocaleString('en-US',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}):'';
export const classNames=(...classes:(string|false|undefined)[])=>classes.filter(Boolean).join(' ');
export async function sha256File(_file:File):Promise<never>{throw new Error('User files are disabled in this fictional demo.');}
export function downloadTextFile(_name:string,_content:string){/* No file operations in the website demo. */}
