import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, MonitorPlay, ShieldCheck } from "lucide-react";
import PageSeo from "../components/PageSeo";

export default function SeePopsInActionPage() {
  const [videoAvailable, setVideoAvailable] = useState(true);

  return (
    <div>
      <PageSeo
        title="See POPS in Action | Proof of Presence System"
        description="Watch a guided click-through of the POPS desktop application: case command, evidence preservation, timelines, records, reports, and local-first workflows."
        path="/see-pops-in-action"
      />

      <section className="section" style={{ paddingTop: 150 }}>
        <div className="container">
          <div className="section-header" style={{ maxWidth: 820 }}>
            <span className="mono">Desktop Walkthrough</span>
            <h1 style={{ marginBottom: 18 }}>See POPS in Action</h1>
            <p>
              A real click-through of the Proof of Presence desktop application showing how records,
              evidence, timelines, people, court information, reports, and the local assistant fit
              together inside one local-first case command system.
            </p>
          </div>

          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: 18,
              border: "1px solid var(--border-glow)",
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(145deg, var(--gunmetal), var(--obsidian))",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {videoAvailable ? (
              <video
                controls
                preload="metadata"
                poster="/popsbanner1600.png"
                onError={() => setVideoAvailable(false)}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "var(--radius-lg)",
                  background: "#000",
                  aspectRatio: "16 / 9",
                }}
              >
                <source src="/media/pops-in-action.mp4" type="video/mp4" />
                <track
                  kind="captions"
                  src="/media/pops-in-action.vtt"
                  srcLang="en"
                  label="English"
                />
                Your browser does not support HTML video.
              </video>
            ) : (
              <div
                style={{
                  aspectRatio: "16 / 9",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  padding: 36,
                  borderRadius: "var(--radius-lg)",
                  background:
                    "radial-gradient(circle at center, rgba(30, 96, 255, 0.15), rgba(7, 10, 15, 0.96) 62%)",
                }}
              >
                <div style={{ maxWidth: 560 }}>
                  <MonitorPlay size={54} style={{ color: "var(--forge-blue)", marginBottom: 18 }} />
                  <h2 style={{ marginBottom: 12 }}>Walkthrough recording is being prepared.</h2>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    This player is wired for the official POPS desktop click-through. The recording
                    will appear here without changing the page once the final MP4 is published.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">What the walkthrough covers</span>
            <h2>From an event to a reviewable record.</h2>
            <p>
              The demonstration is focused on the actual working application rather than a
              marketing mockup.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Case Command</h3>
              <p>
                Dashboard, related case information, contacts, dates, court orders, incidents,
                parenting-time records, and operational records.
              </p>
            </div>
            <div className="feature-card">
              <h3>Evidence & Integrity</h3>
              <p>
                Original-file preservation, SHA-256 verification, evidence metadata,
                chain-of-custody records, and Glyph Trace visibility.
              </p>
            </div>
            <div className="feature-card">
              <h3>Review & Export</h3>
              <p>
                Timeline organization, reports, attorney-facing packets, case bundles, and a local
                assistant that works from supplied POPS context rather than inventing case facts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="download-section">
        <div className="container">
          <ShieldCheck size={34} style={{ color: "var(--forge-blue)", marginBottom: 16 }} />
          <h2 style={{ marginBottom: 16 }}>The working record stays with the desktop application.</h2>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: 700,
              margin: "0 auto 30px",
              fontSize: 17,
              lineHeight: 1.65,
            }}
          >
            The public website explains POPS. The downloadable application is the working
            environment for local records, evidence preservation, case organization, and export.
          </p>
          <div className="hero-actions">
            <Link to="/access" className="btn btn-primary">
              <Download size={18} />
              Get POPS
            </Link>
            <Link to="/about" className="btn btn-ghost">
              How POPS Works <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
