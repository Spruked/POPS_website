export type WebsiteOrbTargetAction = "scroll_to_target" | "ping" | "explain";

export type WebsiteOrbTargetId =
  | "pops.nav.access"
  | "pops.nav.get-pops"
  | "pops.home.what-is-pops"
  | "pops.home.capture"
  | "pops.home.evidence-vault"
  | "pops.home.records"
  | "pops.home.local-first"
  | "pops.access.options"
  | "pops.access.standard"
  | "pops.access.hardship"
  | "pops.access.sponsor"
  | "pops.access.membership"
  | "pops.access.checkout"
  | "pops.access.activation"
  | "pops.access.local-first";

export interface WebsiteOrbTarget {
  id: WebsiteOrbTargetId;
  route: string;
  selector: string;
  label: string;
  description: string;
  actions: WebsiteOrbTargetAction[];
  guideOnly: true;
}

export interface WebsiteOrbGuideRequest {
  targetId: WebsiteOrbTargetId;
  reason?: string;
  message?: string;
}

export interface WebsiteOrbGuideState {
  target: WebsiteOrbTarget;
  rect: DOMRect;
  message: string;
  pulseKey: number;
}

