// Website-only TikTok Pixel events. The base snippet is installed in index.html.
// Events are emitted only when their corresponding website action occurs.
type TikTokQueue = unknown[][] & {
  page?: () => void;
  track?: (name: string, params?: Record<string, unknown>) => void;
  identify?: (params: Record<string, string>) => void;
};
declare global { interface Window { ttq?: TikTokQueue } }

const USD = 'USD';
const item = (id: string, name: string, price?: number) => ({
  content_id: id, content_type: 'product', content_name: name,
  ...(price === undefined ? {} : { price }),
});
const details = (id: string, name: string, value?: number) => ({
  contents: [item(id, name)],
  ...(value === undefined ? {} : { value, currency: USD }),
});

export function trackTikTokPage() { window.ttq?.page?.(); }
export function trackTikTokBetaPageView() {
  window.ttq?.track?.('ViewContent', details('pops-beta-android', 'POPS Beta Tester Registration', 0));
}
export function trackTikTokBetaFormAttempt() {
  window.ttq?.track?.('ClickButton', details('pops-beta-android', 'POPS Beta Tester Registration'));
}
export function trackTikTokBetaSignup() {
  window.ttq?.track?.('CompleteRegistration', {
    contents: [item('pops-beta-android', 'POPS Beta Tester Registration', 0)],
    value: 0,
    currency: USD,
  });
}
export function trackTikTokSearch(query: string) {
  if (query.trim()) window.ttq?.track?.('Search', {
    ...details('pops-website', 'POPS Website', 0), search_string: query.trim(),
  });
}
export function trackTikTokContact() {
  window.ttq?.track?.('Contact', details('pops-contact', 'POPS Website Contact', 0));
}
export function trackTikTokLead() {
  window.ttq?.track?.('Lead', details('pops-lead', 'POPS Lead', 0));
}
export function trackTikTokWishlist() {
  window.ttq?.track?.('AddToWishlist', details('pops-desktop', 'POPS Desktop', 99));
}

// Implement TikTok identify only where a user separately authorizes matching.
// SHA-256 is applied client-side; no raw name, email, or phone is passed to ttq.
async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
export async function identifyTikTokCustomer(
  values: { email?: string; phone?: string; externalId?: string },
  matchingAuthorized: boolean,
) {
  if (!matchingAuthorized || !window.ttq?.identify) return;
  const identifiers: Record<string, string> = {};
  if (values.email?.trim()) identifiers.email = await sha256(values.email.trim().toLowerCase());
  if (values.phone?.trim()) {
    const normalizedPhone = values.phone.trim().replace(/[^+\d]/g, '');
    if (normalizedPhone) identifiers.phone_number = await sha256(normalizedPhone);
  }
  if (values.externalId?.trim()) identifiers.external_id = await sha256(values.externalId.trim());
  if (Object.keys(identifiers).length) window.ttq.identify(identifiers);
}
