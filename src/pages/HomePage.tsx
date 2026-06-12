import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, Download, FileCheck, Gavel, Shield } from "lucide-react";
import PageSeo from "../components/PageSeo";

const FLOW = [
  {
    title: "What POPS Does",
    body: "POPS helps fathers preserve records around denied parenting time, court order issues, communication attempts, evidence files, and attorney-ready timelines.",
    href: "#what-pops-does",
  },
  {
    title: "Declaration",
    body: "The Declaration anchors the doctrine: presence, protection, duty, and the record.",
    href: "/declaration",
  },
  {
    title: "Pledge",
    body: "The Pledge turns the doctrine into commitment: Preserve. Protect. Prove.",
    href: "/pledge",
  },
  {
    title: "Lexicon",
    body: "The Lexicon teaches court-safe language and plain-English legal terms.",
    href: "/lexicon",
  },
];

export default function HomePage() {
  return (
    <div>
      <PageSeo
        title="POPS | Proof of Presence System for Fathers"
        description="POPS is a local-first evidence system for fathers documenting denied parenting time, timelines, records, and attorney-ready case packets."
        path="/"
      />

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="hero-badge">
            <span>Local-First Evidence Workstation</span>
          </div>

          <h1>
            Proof of Presence.<br />
            <span className="accent">A record that stands.</span>
          </h1>

          <p className="hero-subtitle">
            POPS helps fathers document presence, preserve evidence, organize timelines, and prepare court-safe records for attorney review.
          </p>

          <div className="hero-actions">
            <Link to="/access" className="btn btn-primary">
              <Download size={18} />
              Get POPS
            </Link>
            <Link to="/declaration" className="btn btn-ghost">
              Read the Declaration <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item"><Shield size={16} /><span>Local-first</span></div>
            <div className="hero-trust-item"><FileCheck size={16} /><span>SHA-256 hashing</span></div>
            <div className="hero-trust-item"><Gavel size={16} /><span>Court-safe records</span></div>
            <div className="hero-trust-item"><BookOpenCheck size={16} /><span>Lexicon guided</span></div>
          </div>
        </div>
      </section>

      <section id="what-pops-does" className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">What POPS Does</span>
            <h2>From scattered proof to structured record.</h2>
            <p>
              POPS is built for the moments when parenting time is blocked, messages go unanswered, orders are disputed, or proof is scattered across screenshots, receipts, PDFs, and memories.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Capture</h3>
              <p>Record incidents, denied exchanges, messages, files, dates, people, and court-order context.</p>
            </div>
            <div className="feature-card">
              <h3>Preserve</h3>
              <p>Keep originals, hash files with SHA-256, and maintain evidence integrity for later review.</p>
            </div>
            <div className="feature-card">
              <h3>Organize</h3>
              <p>Build timelines, evidence indexes, incident logs, communication summaries, and attorney-ready packets.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">Site Path</span>
            <h2>Doctrine, commitment, language, access.</h2>
            <p>The public website is short by design. The app and ORB carry the deeper working structure.</p>
          </div>

          <div className="features-grid">
            {FLOW.map((item) => (
              <Link to={item.href} className="feature-card feature-card-link" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="inline-link">Open <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Public Site vs App ORB</span>
            <h2>Two audiences. One doctrine.</h2>
            <p>
              The website explains POPS clearly. The desktop app applies POPS locally with the evidence vault, timeline tools, lexicon guidance, rewrite rules, and ORB support.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Website Lexicon</h3>
              <p>Core terms, court-safe highlights, rewrite examples, annotation labels, legal terms, constitutional terms, and FAQ-style education.</p>
            </div>
            <div className="feature-card">
              <h3>App / ORB Lexicon</h3>
              <p>Deeper working context for doctrine, rewrite rules, annotation labels, evidence terms, support terms, visitation terms, and risk classification.</p>
            </div>
            <div className="feature-card">
              <h3>Local Authority</h3>
              <p>The app remains local-first. Evidence storage, SQLite records, ORB runtime behavior, and exports stay with the downloadable desktop application.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="download-section">
        <div className="container">
          <h2 style={{ marginBottom: 16 }}>Proof of Presence requires a record.</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: 620, margin: "0 auto 32px", fontSize: 17, lineHeight: 1.6 }}>
            The Declaration and Pledge establish the standard. The desktop application helps preserve evidence, organize timelines, verify files, and prepare a court-safe record for attorney review.
          </p>
          <Link to="/access" className="btn btn-primary" style={{ padding: "16px 40px", fontSize: 16 }}>
            <Download size={18} />
            Get P.O.P.S.
          </Link>
        </div>
      </section>
    </div>
  );
}
