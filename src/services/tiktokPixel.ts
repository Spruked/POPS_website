// Optional TikTok marketing measurement. Never load before explicit opt-in.
const PIXEL_ID = 'DBK9QJ3C77U97ADLNV40';
type PixelQueue = { (...args: unknown[]): void; push?: (args: unknown[]) => void; track?: (event: string) => void; page?: () => void; load?: (id: string) => void; methods?: string[]; setAndDefer?: (queue: PixelQueue, name: string) => void; _i?: Record<string, unknown>; _t?: Record<string, number>; _o?: Record<string, unknown> };
declare global { interface Window { ttq?: PixelQueue; TiktokAnalyticsObject?: string; } }
let loaded = false;

export function enableTikTokPixel() {
  if (loaded || window.ttq) return;
  loaded = true;
  const t = 'ttq';
  window.TiktokAnalyticsObject = t;
  const q = ((...args: unknown[]) => { (q.push as (args: unknown[]) => void)(args); }) as PixelQueue;
  const calls: unknown[][] = [];
  q.push = (args: unknown[]) => { calls.push(args); };
  q.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
  q.setAndDefer = (queue, method) => { (queue as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => queue.push?.([method, ...args]); };
  for (const method of q.methods) q.setAndDefer(q, method);
  q._i = {}; q._t = {}; q._o = {};
  q.load = id => {
    q._i![id] = [];
    q._t![id] = Date.now();
    q._o![id] = {};
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + encodeURIComponent(id) + '&lib=ttq';
    document.head.appendChild(script);
  };
  window.ttq = q;
  q.load(PIXEL_ID);
  q.page?.();
}

export function trackTikTokBetaSignup() {
  if (loaded) window.ttq?.track?.('CompleteRegistration');
}
