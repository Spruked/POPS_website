// TikTok conversion measurement is opt-in on the beta signup page.
const PIXEL_ID = 'DBK9QJ3C77U97ADLNV40';
type TikTokQueue = unknown[][] & { page?: () => void; track?: (event: string) => void; load?: (id: string) => void; instance?: (id: string) => TikTokQueue; _u?: string; methods?: string[]; setAndDefer?: (queue: TikTokQueue, name: string) => void; _i?: Record<string, TikTokQueue>; _t?: Record<string, number>; _o?: Record<string, object> };
declare global { interface Window { ttq?: TikTokQueue; TiktokAnalyticsObject?: string } }
let enabled = false;

export function enableTikTokPixel() {
  if (enabled || window.ttq) return;
  enabled = true;
  window.TiktokAnalyticsObject = 'ttq';
  const q = [] as unknown as TikTokQueue;
  window.ttq = q;
  q.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];
  q.setAndDefer = (queue, method) => {
    (queue as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => queue.push([method, ...args]);
  };
  for (const method of q.methods) q.setAndDefer(q, method);
  q._i = {};
  q.instance = id => {
    const instance = q._i?.[id] ?? ([] as unknown as TikTokQueue);
    for (const method of q.methods ?? []) q.setAndDefer?.(instance, method);
    return instance;
  };
  q._t = {};
  q._o = {};
  q.load = id => {
    q._i![id] = [] as unknown as TikTokQueue;
    q._i![id]._u = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    q._t![id] = Date.now();
    q._o![id] = {};
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + encodeURIComponent(id) + '&lib=ttq';
    document.head.appendChild(script);
  };
  q.load(PIXEL_ID);
  q.page?.();
}

export function trackTikTokBetaSignup() {
  if (enabled) window.ttq?.track?.('CompleteRegistration');
}
