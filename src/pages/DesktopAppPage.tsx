import { Link } from "react-router-dom";
import { ContentSection as Section, LaunchLinks, LaunchPage, StatusNote } from "../components/LaunchContent";

export default function DesktopAppPage() {
  return (
    <LaunchPage
      title="POPS Desktop for Windows | $99 Desktop Application"
      description="Organize parenting-time records with POPS Desktop for Windows. Explore the one-time license and release information."
      path="/desktop-app"
      eyebrow="POPS Desktop · Windows Desktop"
      heading="A clearer record of parental involvement."
      intro="POPS Desktop is a Windows application designed to organize parenting-time notes, supporting material, and a chronological history for personal review and appropriate professional discussions."
    >
      <StatusNote>
        Explore the guided demonstration now. Official Windows download and purchase options will follow the verified release.
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
        <p>POPS brings your records into a clearer history for personal review and conversations with counsel. It supports factual organization rather than making legal determinations. Available workflows are described in each release.</p>
        <Link to="/how-you-use-it">Explore a five-step demonstration</Link>
      </Section>

      <Section id="windows-offer" title="The published Windows offer">
        <div className="launch-card">
          <div className="launch-price">$99.00 one time</div>
          <p>POPS Desktop Access is a Windows application license with lifetime POPS Membership included. Membership alone is not an application license, and POPS Desktop buyers should not add membership separately.</p>
          <p>Purchasing will open with verified installation, activation, licensing, and refund information. You can explore the application and save the published offer for reference in the meantime.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/access">Review access options</Link>
            <Link className="btn btn-ghost" to="/faq">Read buying FAQs</Link>
          </div>
        </div>
      </Section>

      <Section id="windows-privacy" title="Private records, in your control">
        <p>Your personal case documentation belongs in your local POPS workspace, separate from website accounts and general forms.</p>
        <p>See the release notes for supported security, backup, and recovery features.</p>
        <div className="hero-actions">
          <Link className="btn btn-ghost" to="/privacy">Read the privacy notice</Link>
          <Link className="btn btn-ghost" to="/installation">Installation preparation</Link>
        </div>
      </Section>

      <Section id="other-platforms" title="Other POPS platforms">
        <p>POPS Android is in Google Play testing, and an iPhone edition is planned. Each platform will have its own published release and access details.</p>
        <Link to="/access#platforms">See platform release status</Link>
      </Section>
      <LaunchLinks />
    </LaunchPage>
  );
}
