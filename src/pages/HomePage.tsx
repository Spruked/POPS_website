import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, Lock, FileCheck, Clock, Download, ArrowRight, 
  CheckCircle, Fingerprint, Gavel, Eye, Database, Zap
} from "lucide-react";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Splash animation on load
    const hero = heroRef.current;
    if (!hero) return;
    hero.style.opacity = "0";
    hero.style.transform = "translateY(20px)";
    requestAnimationFrame(() => {
      hero.style.transition = "opacity 1.2s ease, transform 1.2s ease";
      hero.style.opacity = "1";
      hero.style.transform = "translateY(0)";
    });

    document.title = "POPS | Proof of Presence System for Fathers Denied Parenting Time";
    const content = "POPS is a local-first evidence and timeline system for fathers documenting denied parenting time, court order violations, messages, photos, records, and attorney-ready case packets.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = content;
  }, []);

  return (
    <div>
      {/* ─── HERO / SPLASH ─── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="hero-badge">
            <span>Forensic-Grade Case Management</span>
          </div>

          <h1>
            Protect the Record.<br />
            <span className="accent">Preserve the Truth.</span>
          </h1>

          <p className="hero-subtitle">
            POPS is a local-first evidence system built for fathers who are being denied access to their children and need a
            disciplined way to document what happened.
            <br />
            <br />
            When parenting time is blocked, messages go unanswered, court orders are ignored, or medical and school access is
            withheld, scattered proof is not enough.
            <br />
            <br />
            POPS helps you capture the moment, preserve the evidence, organize the timeline, and prepare a court-safe record for
            attorney review.
            <br />
            <br />
            Not panic.
            <br />
            Not revenge.
            <br />
            Not a support group.
            <br />
            <br />
            A record.
          </p>

          <div className="hero-actions">
            <Link to="/download" className="btn btn-primary">
              <Download size={18} />
              Get POPS
            </Link>
            <a href="#how-pops-works" className="btn btn-ghost">
              See How POPS Works <ArrowRight size={16} />
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <Shield size={16} />
              <span>Local-first storage</span>
            </div>
            <div className="hero-trust-item">
              <Lock size={16} />
              <span>SHA-256 evidence hashing</span>
            </div>
            <div className="hero-trust-item">
              <Clock size={16} />
              <span>Timeline and violation tracking</span>
            </div>
            <div className="hero-trust-item">
              <FileCheck size={16} />
              <span>Attorney-ready reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT POPS DOES ─── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">What POPS Does</span>
            <h2>What POPS Does</h2>
            <p>
              POPS helps fathers turn scattered evidence into a structured case record.
            </p>
            <p>
              Use POPS to document denied visits, missed exchanges, blocked communication, court order issues, school or medical
              exclusion, support and license impacts, good-faith efforts, and the paper trail that proves you showed up.
            </p>
            <p>
              Upload photos, screenshots, message exports, receipts, court orders, PDFs, videos, and documents. POPS preserves the
              original file, hashes it, links it to the timeline, and helps organize the facts into a court-safe record.
            </p>
            <p>
              The goal is simple:
              <br />
              Show what happened.
              <br />
              Preserve the proof.
              <br />
              Protect the record.
            </p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 14 }}>What POPS Helps You Document</h3>
            <ul className="about-bullets about-bullets-two-col" style={{ marginBottom: 0 }}>
              <li>Denied parenting time</li>
              <li>Late or missed exchanges</li>
              <li>Blocked calls or unanswered messages</li>
              <li>Parenting-app communication issues</li>
              <li>Medical or school exclusion</li>
              <li>Court order violations</li>
              <li>Support and license impact records</li>
              <li>Good-faith attempts to comply</li>
              <li>Messages, photos, receipts, videos, court orders, PDFs, and documents</li>
              <li>Attorney-ready custody packet preparation</li>
            </ul>
            <p style={{ marginTop: 14, color: "var(--text-secondary)" }}>
              Each record can be connected to evidence, dates, people, court orders, and timeline events so the pattern does not stay
              buried in scattered files.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Fingerprint size={22} /></div>
              <h3>Evidence Vault</h3>
              <p>Upload photos, messages, receipts, court orders. Every file gets SHA-256 hashed so its integrity can be verified in court. No tampering. No doubt.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Gavel size={22} /></div>
              <h3>Court Order Tracking</h3>
              <p>Store full order text, track effective dates, and log violations with severity ratings. Link evidence directly to specific order clauses.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Eye size={22} /></div>
              <h3>Violation Mapping</h3>
              <p>Every denial, every blocked exchange, every missed communication — logged with date, severity, and linked evidence. Patterns become visible.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Clock size={22} /></div>
              <h3>Timeline Engine</h3>
              <p>Medical visits, school events, support payments, visitation attempts — all chronologically ordered. The record speaks when emotions can't.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Database size={22} /></div>
              <h3>Local-First, Always</h3>
              <p>Your data lives on your machine, not in someone else's cloud. SQLite database. No subscriptions. No data mining. Your case is yours.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Zap size={22} /></div>
              <h3>Attorney Packets</h3>
              <p>Generate formatted reports in seconds — timeline summaries, evidence indexes, violation reports, court-ready summaries. Professional. Disciplined.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">Proof, Not Noise</span>
            <h2>Built for Fathers Who Need Proof, Not Noise</h2>
            <p>
              A father can show up, call, message, wait, and try to stay lawful and still be accused of being absent. POPS exists for
              that gap between what happened and what can be proven.
            </p>
            <p>
              The system helps turn painful, chaotic moments into organized records: what was supposed to happen, what actually
              happened, when it happened, who was involved, what evidence supports it, what follow-up was attempted, what court order
              may apply, and what the attorney needs to review.
            </p>
            <p>The goal is not to make accusations louder. The goal is to make the record clearer.</p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-pops-works" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">The POPS Process</span>
            <h2>The POPS Process</h2>
            <p>
              POPS follows a disciplined six-step path. No revenge. No chaos. No guessing. Just proof.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <h4>Capture</h4>
              <p>Record what happened or upload evidence such as photos, screenshots, message exports, receipts, court orders, PDFs, school records, medical records, or exchange proof.</p>
            </div>
            <div className="step">
              <h4>Preserve</h4>
              <p>POPS preserves the original file and computes a SHA-256 hash so the record can later be checked for changes.</p>
            </div>
            <div className="step">
              <h4>Extract</h4>
              <p>Where possible, POPS extracts dates, times, names, message details, case numbers, order language, and event information from uploaded documents and images.</p>
            </div>
            <div className="step">
              <h4>Review</h4>
              <p>The user reviews and corrects extracted details before anything becomes part of the final case record.</p>
            </div>
            <div className="step">
              <h4>Seal</h4>
              <p>Confirmed records can be sealed into the Evidence Vault with audit details and chain-of-custody history.</p>
            </div>
            <div className="step">
              <h4>Report</h4>
              <p>POPS helps generate timelines, evidence indexes, hash reports, communication summaries, incident logs, and attorney-ready packets.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Evidence & Records</span>
            <h2>Evidence Vault</h2>
            <p>
              The Evidence Vault stores and organizes the files that support your case record. POPS is built to preserve the original,
              not just create another note.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card"><h3>Vault Fields</h3><p>Title, description, date, source notes, tags, risk flags, file hash, and chain-of-custody details.</p></div>
            <div className="feature-card"><h3>Supported Material</h3><p>Photos, screenshots, message exports, PDFs, court orders, receipts, videos, school records, medical documents, and communication files.</p></div>
            <div className="feature-card"><h3>Court-Focused Structure</h3><p>Each evidence item can be linked to timeline events, people, incidents, and court order clauses.</p></div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">Timeline Builder</span>
            <h2>Timeline Builder</h2>
            <p>
              Family-court disputes often become confusing because facts are scattered across dates, messages, screenshots, missed
              exchanges, calls, and court orders. POPS helps turn those scattered events into a clear timeline.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card"><h3>Event Patterning</h3><p>Track denied visits, late exchanges, blocked messages, court dates, medical and school events, support/license impacts, and good-faith efforts in sequence.</p></div>
            <div className="feature-card"><h3>Context Links</h3><p>Link events to evidence, people involved, date confidence, and relevant court order terms so each claim has context.</p></div>
            <div className="feature-card"><h3>Court-Safe Summaries</h3><p>Prepare clean timeline summaries so attorneys and judges can see the pattern faster.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Attorney Workflow</span>
            <h2>Attorney-Ready by Design</h2>
            <p>
              POPS is not a lawyer and does not provide legal advice. It is built to help users prepare better records for the attorney
              they already have or the attorney they may need.
            </p>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <ul className="about-bullets about-bullets-two-col" style={{ marginBottom: 0 }}>
              <li>Master timeline</li>
              <li>Evidence index</li>
              <li>Incident log</li>
              <li>Denied visit summary</li>
              <li>Communication summary</li>
              <li>Court order violation map</li>
              <li>Chain-of-custody report</li>
              <li>Hash verification report</li>
              <li>Selected evidence files</li>
              <li>Questions for attorney</li>
            </ul>
            <p style={{ marginTop: 14, color: "var(--text-secondary)" }}>
              The user controls what is exported and shared. Local records stay local until the user chooses to hand them off.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Privacy</span>
            <h2>Local-First Privacy</h2>
            <p>
              POPS is built as a local-first desktop evidence workstation. Case records are designed to live on the user's machine, not
              inside a cloud-first public platform.
            </p>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <ul className="about-bullets about-bullets-two-col" style={{ marginBottom: 0 }}>
              <li>Local SQLite records</li>
              <li>User-controlled exports</li>
              <li>SHA-256 file verification</li>
              <li>Evidence preservation</li>
              <li>Audit logging</li>
              <li>Chain-of-custody tracking</li>
              <li>Offline operation after activation</li>
              <li>No cloud-first case storage</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">Boundaries</span>
            <h2>What POPS Is Not</h2>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <ul className="about-bullets" style={{ marginBottom: 0 }}>
              <li>POPS is not legal advice.</li>
              <li>POPS is not therapy.</li>
              <li>POPS is not a social network.</li>
              <li>POPS is not a revenge tool.</li>
              <li>POPS is not a surveillance system.</li>
              <li>POPS does not guarantee admissibility in court.</li>
            </ul>
            <p style={{ marginTop: 14, color: "var(--text-secondary)" }}>
              POPS is a disciplined evidence system: I showed up. I tried. I stayed lawful. I preserved the evidence. I documented the
              truth.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">POPS Lexicon</span>
            <h2>POPS Lexicon and Court-Safe Highlights</h2>
            <p>
              Court-safe words matter. POPS helps move emotional statements toward factual records that can be reviewed,
              organized, and preserved.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Core Terms</h3>
              <ul className="about-bullets" style={{ marginBottom: 0 }}>
                <li>Denied parenting time: scheduled access did not occur</li>
                <li>Good-faith attempt: documented lawful effort to comply</li>
                <li>Chain of custody: how evidence was handled and preserved</li>
                <li>Metadata: file date, source, device, and origin detail</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>Highlight and Rewrite Guidance</h3>
              <p><strong>Instead of:</strong> She keeps stealing my time.</p>
              <p><strong>Use:</strong> Parenting time did not occur as scheduled.</p>
              <p><strong>Instead of:</strong> She ignored the order.</p>
              <p><strong>Use:</strong> The scheduled exchange did not occur according to the order dated __.</p>
            </div>

            <div className="feature-card">
              <h3>Annotation Labels</h3>
              <ul className="about-bullets" style={{ marginBottom: 0 }}>
                <li>Court-safe</li>
                <li>Risk word</li>
                <li>Needs evidence</li>
                <li>Date needed</li>
                <li>Source needed</li>
                <li>Order link needed</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>Core Legal and Constitutional Terms</h3>
              <ul className="about-bullets" style={{ marginBottom: 0 }}>
                <li>prima facie</li>
                <li>habeas corpus</li>
                <li>pro se</li>
                <li>culpable</li>
                <li>exculpatory</li>
                <li>estoppel</li>
                <li>Fifth Amendment</li>
                <li>Fourteenth Amendment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">FAQ</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card"><h3>What is POPS?</h3><p>POPS stands for Proof of Presence System. It is a local-first evidence and timeline system for fathers documenting denied parenting time, court order issues, communication records, and attorney-ready case materials.</p></div>
            <div className="feature-card"><h3>Is POPS legal advice?</h3><p>No. POPS does not provide legal advice and does not replace an attorney. It helps users organize evidence, timelines, records, and reports for clearer attorney review.</p></div>
            <div className="feature-card"><h3>Can POPS help document denied visitation?</h3><p>Yes. POPS is designed to document denied parenting time, late exchanges, missed visits, blocked communication, and related evidence such as messages, photos, receipts, and witness notes.</p></div>
            <div className="feature-card"><h3>Does POPS store my case in the cloud?</h3><p>The POPS desktop app is designed as a local-first evidence workstation. Case records are stored locally unless the user chooses to export or share them.</p></div>
            <div className="feature-card"><h3>Can I send my POPS records to an attorney?</h3><p>Yes. POPS is designed to generate attorney-ready packets, evidence indexes, timelines, chain-of-custody reports, and hash verification reports that can be exported and shared by the user.</p></div>
            <div className="feature-card"><h3>Can POPS read documents and screenshots?</h3><p>POPS is designed to extract useful information from documents, images, screenshots, message exports, and court records where possible. The user reviews and confirms extracted information.</p></div>
            <div className="feature-card"><h3>Does POPS work for mothers too?</h3><p>POPS can help any parent who needs to document presence, evidence, and lawful efforts. The brand mission is father-centered because many fathers face unique barriers in denied-access situations.</p></div>
            <div className="feature-card"><h3>Is POPS a surveillance tool?</h3><p>No. POPS is not a surveillance system. It is an evidence organization and record-preservation tool. Users are responsible for following the law in their jurisdiction.</p></div>
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD CTA ─── */}
      <section className="download-section">
        <div className="container">
          <div className="download-badge">
            <CheckCircle size={14} />
            <span>Version 1.0 — Available Now</span>
          </div>
          <h2 style={{ marginBottom: 16 }}>Ready to Stand Watch?</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto 32px", fontSize: 17, lineHeight: 1.6 }}>
            Download P.O.P.S. for Windows, macOS, or Linux. Activate with your license key. 
            Your data stays local. Your case stays yours.
          </p>
          <Link to="/download" className="btn btn-primary" style={{ padding: "16px 40px", fontSize: 16 }}>
            <Download size={18} />
            Download P.O.P.S.
          </Link>

          <div className="download-platforms">
            <div className="platform-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <div>
                <strong>Windows</strong>
                <span>10 / 11</span>
              </div>
            </div>
            <div className="platform-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20c0-4.4-3.6-8-8-8s-8 3.6-8 8" transform="translate(4,0)" />
                <path d="M12 12c0-2.2-1.8-4-4-4s-4 1.8-4 4" transform="translate(4,0)" />
              </svg>
              <div>
                <strong>macOS</strong>
                <span>Intel & Apple Silicon</span>
              </div>
            </div>
            <div className="platform-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <div>
                <strong>Linux</strong>
                <span>.deb / .AppImage</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
