import { getPointerTarget } from "./pointerTargetRegistry";
import { findDemoTarget, getDemoVisibleRect, scrollDemoTargetIntoView } from '../pops-demo-app/tour/orbBridge';
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
  if (target.id.startsWith('pops.demo.')) return findDemoTarget(target.selector);
  if (window.location.pathname !== target.route) return null;
  let matches: HTMLElement[];
  try {
    const parentLocator = target.runtimeVerification?.parentLocator;
    if (parentLocator) {
      const parents = [...document.querySelectorAll<HTMLElement>(parentLocator)].filter(isVisibleTarget);
      matches = parents.length === 1
        ? [...parents[0].querySelectorAll<HTMLElement>(target.selector)]
        : [...document.querySelectorAll<HTMLElement>(target.selector)];
    } else {
      matches = [...document.querySelectorAll<HTMLElement>(target.selector)];
    }
  } catch {
    return null;
  }
  const visible = matches.filter(isVisibleTarget);
  if (target.runtimeVerification) {
    const expected = normalizeTargetText(target.runtimeVerification.expectedText);
    const matching = visible.filter((element) => targetText(element).some((text) => normalizeTargetText(text) === expected));
    return matching.length === 1 ? matching[0] : null;
  }
  return visible.length === 1 ? visible[0] : null;
}

function normalizeTargetText(value: string) {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function targetText(element: HTMLElement) {
  return [element.getAttribute('aria-label'), element.innerText, element.textContent,
    ...[...element.querySelectorAll('img[alt]')].map((image) => image.getAttribute('alt'))]
    .filter((value): value is string => Boolean(value));
}

function isVisibleTarget(element: HTMLElement) {
  if (!element.isConnected || element.getClientRects().length === 0) return false;
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = window.getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0
      || current.getAttribute('aria-hidden') === 'true' || current.hasAttribute('inert')) return false;
  }
  return true;
}

export function scrollPointerTargetIntoView(element: HTMLElement) {
  if (element.getRootNode() instanceof ShadowRoot && (element.getRootNode() as ShadowRoot).host.id === 'pops-demo-root') {
    scrollDemoTargetIntoView(element);
    return;
  }
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
    rect: target.id.startsWith('pops.demo.') ? getDemoVisibleRect(element) || element.getBoundingClientRect() : element.getBoundingClientRect(),
    message: message || target.description,
    pulseKey,
    hidden: target.id.startsWith('pops.demo.') && !getDemoVisibleRect(element),
  };
}

