import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, Download, FileCheck, Gavel, MonitorPlay, Shield } from "lucide-react";
import PageSeo from "../components/PageSeo";
import { ContentSection, LaunchLinks, StatusNote } from "../components/LaunchContent";

const FLOW = [
  {
    title: "What POPS Does",
    body: "POPS helps fathers organize parenting-time records, court-order context, communication attempts, supporting files, and a chronology for review.",
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
        description="Explore P.O.P.S. Windows software for fathers organizing parenting-time notes, supporting files, and timelines. Learn about Android plans, beta testing, and access."
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
            Installable Windows software for fathers documenting parenting-time experiences. Bring event notes, supporting files, and a chronological record together for personal review and discussions with counsel.
          </p>

          <div className="hero-actions">
            <Link to="/access" className="btn btn-primary">
              <Download size={18} />
              Get POPS
            </Link>
            <Link to="/see-pops-in-action" className="btn btn-ghost">
              <MonitorPlay size={18} />
              See POPS in Action
            </Link>
            <Link to="/declaration" className="btn btn-ghost">
              Read the Declaration <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item"><Shield size={16} /><span>Local-first</span></div>
            <div className="hero-trust-item"><FileCheck size={16} /><span>SHA-256 hashing</span></div>
            <div className="hero-trust-item"><Gavel size={16} /><span>Factual recordkeeping</span></div>
            <div className="hero-trust-item"><BookOpenCheck size={16} /><span>Lexicon guided</span></div>
          </div>
        </div>
      </section>

      <div className="launch-home"><div className="container">
        <ContentSection id="home-product-purpose" title="Your presence matters. Give the details a place to stay.">
          <p>A missed exchange is more than a date on a calendar. There may be an unanswered message, a receipt from the trip, a photo, or a note about what you personally observed. When those pieces stay scattered, preparing for a conversation means searching again and relying on memory.</p>
          <p>P.O.P.S. — Proof of Presence System — is designed to make that work repeatable. Document an event, connect its supporting material, and review it in context. The purpose remains personal: presence, accountability, and a factual record. Preserve. Protect. Prove.</p>
          <div className="launch-grid">
            <div className="launch-card"><h3>Windows is the workspace</h3><p>Understand how the Evidence Vault, events, timelines, and case context are intended to work together, and which release details still need verification.</p><Link to="/desktop-app">Explore the Windows software</Link></div>
            <div className="launch-card"><h3>Android is being prepared</h3><p>Mobile capture, photo and location provenance, offline work, and synchronization are development or validation work. Android availability and license inclusion are not announced.</p><Link to="/android">Read Android development status</Link></div>
            <div className="launch-card"><h3>See the practical steps</h3><p>Follow a fictional missed exchange from an event note through supporting files and a chronology. Representative examples are labeled; actual release captures are still needed.</p><Link to="/how-you-use-it">Follow the record-building workflow</Link></div>
          </div>
        </ContentSection>
        <ContentSection id="home-practical-example" title="A missed exchange becomes an organized record.">
          <p>Record the scheduled exchange and what you observed. Associate a relevant photo or message with that event. Keep the source and collection context. Review related entries in date order, then prepare the material supported by your release for your own review or discussion with counsel.</p>
          <p>The software organizes what you supply. It does not independently establish that an event occurred or decide whether a court order was violated. File integrity checks support the record; they do not guarantee admissibility or a legal result.</p>
        </ContentSection>
        <ContentSection id="home-participate" title="Choose how you take part.">
          <p>The published Guardian offer describes a one-time Windows license with lifetime P.O.P.S. Membership included and no mandatory recurring subscription. Checkout is unavailable while commercial delivery and release details are finalized. Saving a cart selection does not place an order.</p>
          <StatusNote>We are seeking interest toward 50 active beta participants. The founding-customer program targets the first 100 qualifying paying customers, with special benefits still awaiting approval. Neither a signup nor a saved cart reserves paid-customer status.</StatusNote>
          <LaunchLinks/>
        </ContentSection>
      </div></div>

      <section id="what-pops-does" className="section" data-orb-target="pops.home.what-is-pops">
        <div className="container">
          <div className="section-header">
            <span className="mono">What POPS Does</span>
            <h2>From scattered proof to structured record.</h2>
            <p>
              POPS is built for the moments when parenting time is blocked, messages go unanswered, orders are disputed, or proof is scattered across screenshots, receipts, PDFs, and memories.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card" data-orb-target="pops.home.capture">
              <h3>Capture</h3>
              <p>Record incidents, denied exchanges, messages, files, dates, people, and court-order context.</p>
            </div>
            <div className="feature-card" data-orb-target="pops.home.evidence-vault">
              <h3>Preserve</h3>
              <p>Preserve source context and compare file contents with recorded SHA-256 hashes where supported by the release.</p>
            </div>
            <div className="feature-card" data-orb-target="pops.home.records">
              <h3>Organize</h3>
              <p>Connect event notes and supporting material in a chronology. Specific reports and attorney handoff exports remain subject to release verification.</p>
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
            <div className="feature-card" data-orb-target="pops.home.local-first">
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
