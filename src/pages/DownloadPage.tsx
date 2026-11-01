import { Link, useNavigate } from 'react-router-dom';
import { ContentSection as Section, LaunchLinks, LaunchPage, StatusNote } from '../components/LaunchContent';
import { PRODUCTS, useCart } from '../cart';

const targets: Record<string, string> = {
  guardian: 'pops.access.standard',
  opendoor: 'pops.access.hardship',
  sponsor: 'pops.access.sponsor',
  membership: 'pops.access.membership',
};

export default function DownloadPage() {
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const hasPOPS Desktop = items.some((item) => item.id === 'guardian');
  const membership = PRODUCTS.find((product) => product.id === 'membership')!;
  const guardian = PRODUCTS.find((product) => product.id === 'guardian')!;
  const sponsor = PRODUCTS.find((product) => product.id === 'sponsor')!;

  return (
    <LaunchPage
      title="POPS Access | POPS Desktop for Windows, Android Testing & iOS Plans"
      description="Compare POPS applications, the $99 POPS Desktop for Windows offer, Windows assistance routes, and separate lifetime membership. Checkout is disabled."
      path="/access"
      eyebrow="POPS applications & access"
      heading="Choose your platform. Understand your access."
      intro="POPS helps fathers organize a record of parenting-time involvement, supporting material, and a chronological history for personal review and appropriate professional discussions. The Windows offer is published; Android is in Google Play testing; iOS is planned."
    >
      <StatusNote>
        Checkout is disabled. The website cannot accept payment or deliver an app license. A saved cart selection is not an order. Android and iOS are separate applications and are not included with POPS Desktop for Windows.
      </StatusNote>

      <section id="platforms" className="launch-section" aria-labelledby="platforms-title">
        <h2 id="platforms-title">The POPS application family</h2>
        <div className="launch-grid">
          <article className="launch-card" data-orb-target="pops.access.standard">
            <span className="mono">Windows Desktop · Published offer</span>
            <h3>POPS Desktop</h3>
            <p>The downloadable Windows application has a published price of <strong>$99.00 one time</strong>. Lifetime POPS Membership is included.</p>
            <p>The website and its fictional browser demonstration are available to explore. They are not the installable POPS Desktop application or a download service.</p>
            <Link className="btn btn-primary" to="/desktop-app">POPS Desktop for Windows details</Link>
          </article>
          <article className="launch-card">
            <span className="mono">Android · Google Play testing</span>
            <h3>POPS Android</h3>
            <p>The Android companion is progressing through Google Play testing. It is not publicly available, approved for production, or ready to purchase. No public Play Store listing or price is provided.</p>
            <p>Windows purchase, Open Door assistance, and sponsor funding do not grant Android access.</p>
            <Link className="btn btn-primary" to="/android">Android product status</Link>
          </article>
          <article className="launch-card">
            <span className="mono">iOS · Planned</span>
            <h3>POPS for iPhone</h3>
            <p>An iOS application is planned. No public release, date, price, or connection to another platform’s license has been announced.</p>
          </article>
        </div>
      </section>

      <section id="access-options" className="launch-section" data-orb-target="pops.access.options" aria-labelledby="access-options-title">
        <h2 id="access-options-title">Three ways to access the Windows application</h2>
        <p>These routes apply to POPS Desktop for Windows only. They do not promise access to an unreleased Android or planned iOS application.</p>
        <div className="launch-grid">
          <article id="guardian-access" className="launch-card" data-orb-target={targets.guardian}>
            <span className="mono">Standard purchase</span>
            <h3>POPS Desktop Access</h3>
            <div className="launch-price">$99.00 one time</div>
            <p>A one-time Windows desktop license with lifetime POPS Membership included. No mandatory recurring subscription is published for this offer.</p>
            <p>Installer delivery, activation, release-specific features, support, update coverage, and refund terms still need to be finalized. Checkout remains disabled.</p>
            <button className="btn btn-primary" onClick={() => { addItem(guardian); navigate('/cart'); }}>
              Save Windows offer to cart
            </button>
          </article>
          <article id="opendoor-access" className="launch-card" data-orb-target={targets.opendoor}>
            <span className="mono">Personally reviewed financial assistance</span>
            <h3>Open Door</h3>
            <p>For fathers who cannot afford the full Windows license price, Open Door is a personally reviewed assistance route, subject to eligibility and available funding.</p>
            <p>The review and approval workflow is not active on this website. An account or support message is not an application, approval, or license. This route is not offered for Android or iOS.</p>
            <Link className="btn btn-ghost" to="/policies-procedures">Review program policy</Link>
          </article>
          <article id="sponsor-access" className="launch-card" data-orb-target={targets.sponsor}>
            <span className="mono">Sponsor-funded Windows access</span>
            <h3>Sponsor a Father</h3>
            <div className="launch-price">$25 contribution increments</div>
            <p>Sponsor contributions are intended to support approved Open Door capacity for POPS Desktop for Windows. A contribution does not itself grant the sponsor or another person an application license.</p>
            <p>Payment, custom contribution amounts, and sponsorship fulfillment are unavailable. Sponsorship does not fund Android or iOS access.</p>
            <button className="btn btn-ghost" onClick={() => { addItem(sponsor); navigate('/cart'); }}>
              Save sponsorship selection
            </button>
          </article>
        </div>
      </section>

      <Section id="website-vs-application" title="Website experience and Windows app are different">
        <p>This website provides product information, support and beta-interest forms, a customer account, and a browser demonstration using fictional records. The demonstration is not the installed desktop application and does not store a real Evidence Vault.</p>
        <p>POPS Desktop is a separate downloadable Windows application. No installer is linked here, and the website does not currently deliver or activate a license.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/product-demo">Explore the fictional browser demo</Link>
          <Link className="btn btn-ghost" to="/desktop-app">Read Windows product details</Link>
        </div>
      </Section>

      <section id="membership" className="launch-section" data-orb-target={targets.membership} aria-labelledby="membership-title">
        <h2 id="membership-title">POPS Membership is a separate offering</h2>
        <p><strong>$12.99 one time</strong> for the published lifetime membership. Membership alone is not a Windows, Android, or iOS application license.</p>
        <p>POPS Desktop includes lifetime membership, so POPS Desktop buyers should not add membership separately. The availability of community services, events, and resource drops still requires confirmation.</p>
        <button className="btn btn-ghost" disabled={hasPOPS Desktop} onClick={() => { addItem(membership); navigate('/cart'); }}>
          {hasPOPS Desktop ? 'Membership included with POPS Desktop' : 'Save membership selection'}
        </button>
      </section>

      <section id="access-assistance" className="launch-section" data-orb-target="pops.access.activation" aria-labelledby="access-assistance-title">
        <h2 id="access-assistance-title">Open Door review and sponsorship</h2>
        <p>Open Door is intended to provide personally reviewed financial assistance toward the POPS Desktop for Windows offer, subject to program rules and available reserve capacity. The application and approval workflow is not active.</p>
        <p>Do not send private court details or family evidence to explain a financial need. Contact support for general availability information; that request is not an application or approval.</p>
        <div className="hero-actions">
          <Link className="btn btn-ghost" to="/policies-procedures">Read the existing program policy</Link>
          <Link className="btn btn-primary" to="/support">Ask about Windows access</Link>
        </div>
      </section>

      <Section id="private-records" title="Your private documentation is not tracked">
        <p>POPS does not track users’ private documentation entries. The Windows app’s private notes and supporting records are separate from website accounts, forms, and the fictional browser demo. General website forms are not for case documents or family evidence.</p>
        <p>The app is designed around local-first records. Encryption, automatic backup, and cloud synchronization are not promised unless a specific active release documents and verifies them.</p>
        <Link to="/privacy">Read the privacy notice</Link>
      </Section>

      <Section id="before-purchase" title="Before purchasing">
        <p>License scope, supported Windows versions, device rights, delivery and activation, support, update coverage, and refund terms must be finalized before payment opens. Square checkout remains disabled. No order, payment, license, or platform entitlement is created by saving a selection.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/cart">Review saved cart</Link>
          <Link className="btn btn-ghost" to="/faq">Read buying FAQs</Link>
          <Link className="btn btn-ghost" to="/checkout">Checkout status</Link>
        </div>
      </Section>
      <LaunchLinks />
    </LaunchPage>
  );
}
