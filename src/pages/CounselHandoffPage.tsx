import { Link } from "react-router-dom";

export default function CounselHandoffPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <section className="section">
        <div className="container" style={{ maxWidth: 1040 }}>
          <div className="section-header">
            <span className="mono">Counsel Handoff</span>
            <h1>Counsel Handoff</h1>
            <p>
              POPS is built to create records that can actually be handed to an attorney. Counsel Handoff explains how the desktop app
              turns structured records into export-ready packets while keeping the user in control of what leaves the local app.
            </p>
          </div>

          <div className="features-grid" style={{ marginBottom: 24 }}>
            <div className="feature-card">
              <h3>Attorney Packet Creation</h3>
              <p>
                The desktop workflow assembles timeline entries, incident logs, communication summaries, and linked evidence into a
                single attorney packet set designed for faster legal review.
              </p>
            </div>
            <div className="feature-card">
              <h3>Controlled Export Scope</h3>
              <p>
                Users select exactly what is exported: date range, event types, order references, selected evidence, and summary
                reports. Nothing is forced into a handoff bundle by default.
              </p>
            </div>
            <div className="feature-card">
              <h3>Verification Artifacts</h3>
              <p>
                Export bundles are designed to include hash verification and manifest detail so receiving counsel can validate evidence
                integrity and chain-of-custody context.
              </p>
            </div>
          </div>

          <section className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 12 }}>How POPS Builds the Counsel Packet</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
              Handoff starts in the desktop app after records are reviewed and organized. The user does not need to rebuild the case
              manually in separate folders.
            </p>
            <ol style={{ color: "var(--text-secondary)", paddingLeft: 18, lineHeight: 1.8, margin: 0 }}>
              <li>Select scope: time window, issues, court order references, and key incidents.</li>
              <li>Generate structured reports: timeline summary, incident summary, communication summary, and order/violation map.</li>
              <li>Attach supporting evidence files and evidence index.</li>
              <li>Generate manifest and hash verification set.</li>
              <li>Export to a user-selected destination for counsel handoff.</li>
            </ol>
          </section>

          <section className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 12 }}>What Gets Exported</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Core Reports</h3>
                <ul className="about-bullets" style={{ marginBottom: 0 }}>
                  <li>Master timeline</li>
                  <li>Incident log</li>
                  <li>Denied parenting-time summary</li>
                  <li>Communication summary</li>
                </ul>
              </div>
              <div className="feature-card">
                <h3>Evidence Set</h3>
                <ul className="about-bullets" style={{ marginBottom: 0 }}>
                  <li>Evidence index</li>
                  <li>Selected original files</li>
                  <li>Court order references</li>
                  <li>Source notes and tags</li>
                </ul>
              </div>
              <div className="feature-card">
                <h3>Integrity and Audit</h3>
                <ul className="about-bullets" style={{ marginBottom: 0 }}>
                  <li>SHA-256 hash report</li>
                  <li>Manifest file</li>
                  <li>Chain-of-custody context</li>
                  <li>Export metadata</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 12 }}>How Hashes and Manifests Work</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Each exported evidence file can be paired with its hash value in the verification report. The manifest acts as a packet map
              listing included files, report artifacts, and identifiers so counsel can verify completeness before substantive review.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              If a file changes after export, its hash no longer matches the original recorded value. This supports integrity checks
              during attorney intake and downstream court preparation.
            </p>
          </section>

          <section className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 12 }}>User Control and Local-First Handoff</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              POPS is designed so records stay local until the user decides to export. Users choose destination, scope, and shared
              artifacts. No automatic cloud-first transmission is required for counsel handoff.
            </p>
            <ul className="about-bullets" style={{ marginBottom: 0 }}>
              <li>User chooses what to export and what to withhold</li>
              <li>User chooses where the packet is saved</li>
              <li>User chooses how and when to deliver to counsel</li>
              <li>Local records remain local unless explicitly shared</li>
            </ul>
          </section>

          <section className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 12 }}>Future Counsel Portal Direction</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              POPS roadmap includes a Counsel Portal path for structured intake and verification workflows. The intended direction is a
              permissioned handoff model where users can authorize a specific counsel recipient and share packet revisions with clear
              version history.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              Until that layer is active, current handoff remains user-controlled through exported packet bundles and direct delivery.
            </p>
          </section>

          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link to="/" className="btn btn-ghost">Back to Landing</Link>
            <Link to="/pricing" className="btn btn-ghost">See Pricing</Link>
            <Link to="/attorney-referral" className="btn btn-ghost">Attorney Referral</Link>
            <Link to="/account" className="btn btn-primary">Account Portal</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
