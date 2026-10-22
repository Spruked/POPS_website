import {orbPost,orbAudio} from '../orb/visitorSession';
import type {OrbAction} from '../orb/visitorSession';
export interface OrbCognitivePulse {
  cognitive_mode: string;
  glow_intensity: number;
  [key: string]: unknown;
}

export interface OrbResponse {
  transcript: string;
  spoken_output: string;
  cognitive_pulse: OrbCognitivePulse;
  llm_source: string;
  memory_context: string | null;
  tts_audio_url: string | null;
  tts_provider: string | null;
  tts_error: string | null;
  action?:OrbAction;
  development_only?:boolean;
}

export interface OrbCapabilities {
  status: string;
  tesseract: {
    available: boolean;
    path: string | null;
    configured_path: string | null;
  };
  stt: {
    configured: boolean;
    url: string;
  };
  tts: {
    provider: string;
    configured: boolean;
    cache_dir: string;
  };
  local_llm: {
    configured: boolean;
    url: string | null;
    model: string | null;
  };
  desktop_mcp: {
    enabled: boolean;
    root: string;
    server_path: string;
    server_exists: boolean;
    relay_url: string | null;
  };
  dock_adapter: {
    websocket_url: string;
  };
}

export interface OrbToolSummary {
  name: string;
}

export interface OrbToolsCatalog {
  tools: OrbToolSummary[];
  desktop_mcp: {
    server_path: string;
    server_exists: boolean;
    read_only_default: boolean;
    browser_direct_access: boolean;
    catalog_source: string;
  };
}

async function parseOrbResponse(response: Response): Promise<OrbResponse> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `ORB request failed with ${response.status}`);
  }

  return response.json() as Promise<OrbResponse>;
}

export async function sendWebsiteOrbAudio(blob: Blob): Promise<OrbResponse> {
  const response=await orbAudio(blob);
  return parseOrbResponse(response);
}

export async function sendWebsiteOrbText(transcript:string,options:{event?:string;demo_screen?:string}={},signal?:AbortSignal):Promise<OrbResponse>{
 const host=document.getElementById('pops-demo-root');
 const demoScreen=host?.dataset.demoContextActive==='true'&&host.dataset.demoScreen!=='calendar'?host.dataset.demoScreen:undefined;
 return orbPost<OrbResponse>('website-text',{transcript,route:location.pathname,event:options.event||'question',...(options.demo_screen||demoScreen?{demo_screen:options.demo_screen||demoScreen}:{}),synthesize_tts:false},signal);
}

export async function getOrbCapabilities(): Promise<OrbCapabilities> {
  const response = await fetch("/api/orb/capabilities");
  if (!response.ok) {
    throw new Error(`Capabilities request failed with ${response.status}`);
  }

  return response.json() as Promise<OrbCapabilities>;
}

export async function getOrbToolsCatalog(): Promise<OrbToolsCatalog> {
  const response = await fetch("/api/orb/tools/catalog");
  if (!response.ok) {
    throw new Error(`Tools catalog request failed with ${response.status}`);
  }

  return response.json() as Promise<OrbToolsCatalog>;
}
