import { getPointerTarget } from "./pointerTargetRegistry";
import type { WebsiteOrbGuideRequest, WebsiteOrbGuideState, WebsiteOrbTarget } from "./websiteOrbTargetTypes";

export const WEBSITE_ORB_GUIDE_EVENT = "pops:website-orb-guide-target";

export function dispatchWebsiteOrbGuide(request: WebsiteOrbGuideRequest) {
  window.dispatchEvent(new CustomEvent<WebsiteOrbGuideRequest>(WEBSITE_ORB_GUIDE_EVENT, { detail: request }));
}

export function guideRequestFromPulse(pulse: Record<string, unknown> | undefined): WebsiteOrbGuideRequest | null {
  if (!pulse) return null;
  const targetId = pulse.semantic_target_id || pulse.orb_target_id || pulse.target_id;
  if (typeof targetId !== "string") return null;
  if (!getPointerTarget(targetId)) return null;
  return {
    targetId: targetId as WebsiteOrbGuideRequest["targetId"],
    reason: typeof pulse.intent === "string" ? pulse.intent : undefined,
    message: typeof pulse.guide_message === "string" ? pulse.guide_message : undefined,
  };
}

export function findPointerTargetElement(target: WebsiteOrbTarget): HTMLElement | null {
  return document.querySelector<HTMLElement>(target.selector);
}

export function scrollPointerTargetIntoView(element: HTMLElement) {
  element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
}

export function buildGuideState(
  target: WebsiteOrbTarget,
  element: HTMLElement,
  message: string | undefined,
  pulseKey: number,
): WebsiteOrbGuideState {
  return {
    target,
    rect: element.getBoundingClientRect(),
    message: message || target.description,
    pulseKey,
  };
}

