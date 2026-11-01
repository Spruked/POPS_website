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
  const hasDesktop = items.some((item) => item.id === 'guardian');
  const membership = PRODUCTS.find((product) => product.id === 'membership')!;
  const guardian = PRODUCTS.find((product) => product.id === 'guardian')!;
  const sponsor = PRODUCTS.find((product) => product.id === 'sponsor')!;

  return (
    <LaunchPage
      title="POPS Access | POPS Desktop for Windows, Android Testing & iOS Plans"
      description="Compare POPS applications, the $99 POPS Desktop for Windows offer, Windows assistance routes, and separate lifetime membership. Purchasing opens after release preparation."
      path="/access"
      eyebrow="POPS applications & access"
      heading="We’re Excited to Bring P.O.P.S. to More Families."
      intro="We’re proud to introduce a practical way to bring parenting-time records together. Explore the Windows application, discover our Android testing program, and see what’s planned for iPhone."
    >
      <StatusNote>
        Explore POPS for Windows, see the demonstration, and review the current release path. Purchases and installer delivery will open after final release preparation. The completed Android app is included with a desktop purchase as soon as Google Play testing is complete. iOS remains planned.
      </StatusNote>

      <section id="platforms" className="launch-section" aria-labelledby="platforms-title">
        <h2 id="platforms-title">Discover the P.O.P.S. Family</h2>
        <div className="launch-grid">
          <article className="launch-card" data-orb-target="pops.access.standard">
            <span className="mono">Windows Desktop · Published offer</span>
            <h3>POPS Desktop</h3>
            <p>The downloadable Windows application has a published price of <strong>$99.00 one time</strong>. Lifetime POPS Membership is included.</p>
            <p>Explore a guided demonstration of the record-building experience, then review the Windows desktop application details.</p>
            <Link className="btn btn-primary" to="/desktop-app">POPS Desktop for Windows details</Link>
          </article>
          <article className="launch-card">
            <span className="mono">Android · Google Play testing</span>
            <h3>POPS Android</h3>
            <p>We’re proud to share that POPS Android is finished and completing Google Play testing. It will be included with your POPS desktop purchase once testing is complete.</p>
            <p>A POPS desktop purchase includes Android access when Google Play testing is completed. Android distribution will follow the approved Google Play release.</p>
            <Link className="btn btn-primary" to="/android">Android product status</Link>
          </article>
          <article className="launch-card">
            <span className="mono">iOS · Planned</span>
            <h3>POPS for iPhone</h3>
            <p>POPS for iPhone is on the roadmap. Release timing and options will be announced when confirmed.</p>
          </article>
        </div>
      </section>

      <section id="access-options" className="launch-section" data-orb-target="pops.access.options" aria-labelledby="access-options-title">
        <h2 id="access-options-title">Choose Your Path to P.O.P.S. for Windows</h2>
        <p>Explore POPS desktop access and support programs below. Your desktop purchase will include Android once Google Play testing is complete; iOS remains planned.</p>
        <div className="launch-grid">
          <article id="guardian-access" className="launch-card" data-orb-target={targets.guardian}>
            <span className="mono">Standard purchase</span>
            <h3>POPS Desktop Access</h3>
            <div className="launch-price">$99.00 one time</div>
            <p>A one-time Windows desktop license with lifetime POPS Membership and the completed Android app included when Google Play testing is finished. No mandatory recurring subscription is published for this offer.</p>
            <p>Windows purchase and delivery will open with verified release details, license terms, and installation instructions.</p>
            <button className="btn btn-primary" onClick={() => { addItem(guardian); navigate('/cart'); }}>
              Save Windows offer to cart
            </button>
          </article>
          <article id="opendoor-access" className="launch-card" data-orb-target={targets.opendoor}>
            <span className="mono">An open door for every father</span>
            <h3>Pay What You Can</h3>
            <p>We realize these situations can be trying and financially burdensome. That is why we are dedicated to helping every father we can through Pay What You Can. Create a POPS account and choose a contribution greater than zero.</p>
            <p>We believe careful records can help you remember important details, organize your experience for an attorney, recognize patterns you may have missed, and show the efforts you have made. Those records may help support your account when allegations or events are disputed. POPS helps preserve the facts; legal findings belong to the appropriate authorities. Pay What You Can enrollment will open with the approved purchase process.</p>
            <Link className="btn btn-ghost" to="/policies-procedures">Review program policy</Link>
          </article>
          <article id="sponsor-access" className="launch-card" data-orb-target={targets.sponsor}>
            <span className="mono">Sponsor-funded Windows access</span>
            <h3>Sponsor a Father</h3>
            <div className="launch-price">$25 contribution increments</div>
            <p>Sponsor contributions are intended to support approved Open Door capacity for POPS Desktop for Windows. A contribution does not itself grant the sponsor or another person an application license.</p>
            <p>Sponsorship enrollment will open alongside the Windows access program.</p>
            <button className="btn btn-ghost" onClick={() => { addItem(sponsor); navigate('/cart'); }}>
              Save sponsorship selection
            </button>
          </article>
        </div>
      </section>

      <Section id="website-vs-application" title="Explore the experience and the Windows application">
        <p>Preview the POPS workflow with fictional example records. The desktop application is where users manage their own private records.</p>
        <p>The Windows application will be delivered through the official release process when purchasing opens.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/product-demo">Explore the fictional browser demo</Link>
          <Link className="btn btn-ghost" to="/desktop-app">Read Windows product details</Link>
        </div>
      </Section>

      <section id="membership" className="launch-section" data-orb-target={targets.membership} aria-labelledby="membership-title">
        <h2 id="membership-title">Join the P.O.P.S. Community</h2>
        <p><strong>$12.99 one time</strong> for the published lifetime membership. Membership alone is not a Windows, Android, or iOS application license.</p>
        <p>POPS Desktop includes lifetime membership, so POPS Desktop buyers should not add membership separately. Community services and resources will be described as they become available.</p>
        <button className="btn btn-ghost" disabled={hasDesktop} onClick={() => { addItem(membership); navigate('/cart'); }}>
          {hasDesktop ? 'Membership included with POPS Desktop' : 'Save membership selection'}
        </button>
      </section>

      <section id="access-assistance" className="launch-section" data-orb-target="pops.access.activation" aria-labelledby="access-assistance-title">
        <h2 id="access-assistance-title">Pay What You Can. Pay It Forward.</h2>
        <p>All of us were once children. POPS is here for parents and their children, because every family's story deserves the chance to be documented. Pay what you can, share how POPS helps you, and when life has settled and you find the peace you and your children deserve, consider paying it forward by sponsoring the next father. God willing, better days are ahead. An account and a contribution greater than zero are the intended participation requirements; enrollment and payment are not yet active.</p>
        <p>Do not send private court details or family evidence to explain a financial need. Contact support for general availability information; that request is not an application or approval.</p>
        <div className="hero-actions">
          <Link className="btn btn-ghost" to="/policies-procedures">Read the existing program policy</Link>
          <Link className="btn btn-primary" to="/support">Get involved with POPS</Link>
        </div>
      </section>

      <Section id="private-records" title="Your documentation stays under your control">
        <p>POPS is designed around locally managed personal records. Website accounts and public forms are separate from private case documentation. Keep sensitive evidence within your own secure records.</p>
        <p>See the release documentation for supported storage, security, recovery, and export features.</p>
        <Link to="/privacy">Read the privacy notice</Link>
      </Section>

      <Section id="before-purchase" title="Release and purchase details">
        <p>The Windows purchase process will open with confirmed compatibility, licensing, delivery, activation, support, and refund information. For now, you can save an offer for reference; it is not a purchase.</p>
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
