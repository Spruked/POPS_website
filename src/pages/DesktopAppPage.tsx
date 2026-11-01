import { Link } from "react-router-dom";
import { ContentSection as Section, LaunchLinks, LaunchPage, StatusNote } from "../components/LaunchContent";

export default function DesktopAppPage() {
  return (
    <LaunchPage
      title="POPS Desktop for Windows | $99 Desktop Application"
      description="POPS Desktop is the published $99 one-time Windows desktop offer with lifetime POPS Membership included. Checkout and app delivery remain disabled."
      path="/desktop-app"
      eyebrow="POPS Desktop · Windows Desktop"
      heading="A clearer record of parental involvement."
      intro="POPS Desktop is a Windows application designed to organize parenting-time notes, supporting material, and a chronological history for personal review and appropriate professional discussions."
    >
      <StatusNote>
        The website and its fictional browser demonstration are separate from the downloadable Windows application. No POPS Desktop installer is currently provided here, and checkout is disabled while release, license, and delivery details are finalized.
      </StatusNote>

      <Section id="windows-benefits" title="Keep the details together">
        <div className="launch-grid">
          <article className="launch-card">
            <h3>Record involvement</h3>
            <p>Organize dated events and notes into a chronology you can return to and review.</p>
          </article>
          <article className="launch-card">
            <h3>Connect supporting material</h3>
            <p>Keep relevant files associated with an event and preserve context about what you recorded.</p>
          </article>
          <article className="launch-card">
            <h3>Prepare for review</h3>
            <p>Use an organized history as a starting point for personal review or discussion with counsel.</p>
          </article>
        </div>
        <p>POPS organizes information a parent records. It does not independently prove a disputed event, provide legal advice, or guarantee a custody outcome. Specific file handling and report features depend on the verified release.</p>
        <Link to="/how-you-use-it">See a fictional five-step example</Link>
      </Section>

      <Section id="windows-offer" title="The published Windows offer">
        <div className="launch-card">
          <div className="launch-price">$99.00 one time</div>
          <p>POPS Desktop Access is a Windows application license with lifetime POPS Membership included. Membership alone is not an application license, and POPS Desktop buyers should not add membership separately.</p>
          <p>Checkout is unavailable, so saving a cart selection does not create an order or license. Installer delivery, activation, refund terms, and final release details must be confirmed before purchases open.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/access">Review access options</Link>
            <Link className="btn btn-ghost" to="/faq">Read buying FAQs</Link>
          </div>
        </div>
      </Section>

      <Section id="windows-privacy" title="Your private entries stay outside website tracking">
        <p>POPS does not track users’ private documentation entries. Website accounts and forms are separate from records in the Windows application.</p>
        <p>Do not assume encryption, automatic backup, or cloud synchronization; confirm storage and recovery behavior for the specific release.</p>
        <div className="hero-actions">
          <Link className="btn btn-ghost" to="/privacy">Read the privacy notice</Link>
          <Link className="btn btn-ghost" to="/installation">Installation preparation</Link>
        </div>
      </Section>

      <Section id="other-platforms" title="Other POPS platforms">
        <p>Android is progressing through Google Play testing and is not publicly available or ready to purchase. iOS is planned. Neither platform is included with the Windows license.</p>
        <Link to="/access#platforms">See platform release status</Link>
      </Section>
      <LaunchLinks />
    </LaunchPage>
  );
}
