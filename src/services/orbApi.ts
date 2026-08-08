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
  const formData = new FormData();
  formData.append("audio", blob, "website-orb.webm");

  const response = await fetch("/api/orb/website-voice", {
    method: "POST",
    body: formData,
  });

  return parseOrbResponse(response);
}

export async function sendWebsiteOrbText(transcript: string): Promise<OrbResponse> {
  const response = await fetch("/api/orb/website-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  return parseOrbResponse(response);
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
