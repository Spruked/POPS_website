// The TikTok Pixel bootstrap is installed once in index.html.
// This module sends concrete website events; never repeat the bootstrap.
type TikTokQueue = unknown[][] & {
  page?: () => void;
  track?: (name: string, params?: Record<string, unknown>) => void;
  identify?: (params: Record<string, string>) => void;
};
declare global { interface Window { ttq?: TikTokQueue } }

const content = (id: string, name: string) => ({
  contents: [{ content_id: id, content_type: 'product', content_name: name }],
});

export function trackTikTokPage() { window.ttq?.page?.(); }
export function trackTikTokBetaPageView() {
  window.ttq?.track?.('ViewContent', content('pops-beta-android','POPS Beta Tester Registration'));
}
export function trackTikTokBetaFormAttempt() {
  window.ttq?.track?.('ClickButton', content('pops-beta-android','POPS Beta Tester Registration'));
}
export function trackTikTokBetaSignup() {
  window.ttq?.track?.('CompleteRegistration', content('pops-beta-android','POPS Beta Tester Registration'));
}
export function trackTikTokSearch(query: string) {
  if (query.trim()) window.ttq?.track?.('Search', { ...content('pops-website','POPS Website'), search_string: query.trim() });
}
export function trackTikTokContact() {
  window.ttq?.track?.('Contact', content('pops-contact','POPS Contact'));
}
export function trackTikTokLead() {
  window.ttq?.track?.('Lead', content('pops-lead','POPS Lead'));
}
export function trackTikTokWishlist() {
  window.ttq?.track?.('AddToWishlist', content('pops-desktop','POPS Desktop'));
}
// Do not send identify placeholders or fake a search, wishlist, or contact action.
// Those events should only be called by an actual associated website interaction.
