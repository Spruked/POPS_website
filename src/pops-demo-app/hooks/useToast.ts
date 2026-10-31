import {createContext,useContext} from 'react';
export interface Toast{id:string;message:string;type:'success'|'error'}
export const DemoToastContext=createContext<{toasts:Toast[];show:(message:string,type?:'success'|'error')=>void}>({toasts:[],show:()=>{}});
export const useToast=()=>useContext(DemoToastContext);
