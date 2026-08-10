import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  FileCheck,
  FileDown,
  FileSearch,
  Gavel,
  Hash,
  Lock,
  ShieldCheck,
} from "lucide-react";
import PageSeo from "../components/PageSeo";

const TRACKED_FIELDS = [
  "Monthly amount due",
  "Due date",
  "Amount paid",
  "Payment date",
  "Payment method",
  "State case number",
  "Confirmation or receipt number",
  "Current support versus arrears",
  "Uploaded receipts and agency statements",
  "SHA-256 hash of every imported record",
  "Corrections, disputes, and missed-payment claims",
  "Complete audit trail inside the Vault System",
];

const RECORD_STATUSES = [
  "User entered",
  "Bank corroborated",
  "Agency statement imported",
  "Agency certified",
  "Disputed",
  "Corrected",
];

export default function ChildSupportLedgerPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <PageSeo
        title="Child Support Payment Ledger | POPS Roadmap"
        description="POPS roadmap page for a local-first child-support payment ledger with payment tracking, official record imports, SHA-256 preservation, disputes, and court-ready exports."
        path="/child-support-ledger"
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 1080 }}>
          <div className="section-header">
            <span className="mono">Roadmap Module</span>
            <h1>Child Support Payment Ledger</h1>
            <p>
              A planned POPS module for preserving child-support payment records,
              comparing user records against agency statements, and building an
              auditable exhibit trail without pretending to replace the official
              state ledger.
            </p>
          </div>

          <div className="ledger-hero-grid">
            <article className="feature-card ledger-lead-card">
              <div className="feature-icon"><Banknote size={22} /></div>
              <h2>Layer 1: POPS Payment Tracker</h2>
              <p>
                This layer can work nationwide because it relies on user-entered
                records, uploaded receipts, imported statements, local storage,
                and Vault System audit history.
              </p>
            </article>

            <article className="feature-card ledger-lead-card">
              <div className="feature-icon"><Gavel size={22} /></div>
              <h2>Layer 2: Official Government Records</h2>
              <p>
                Official payment histories live with state child-support agencies
                or State Disbursement Units. Direct integrations would need to be
                approved and implemented state by state.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 1080 }}>
          <div className="section-header">
            <span className="mono">Production-Ready First</span>
            <h2>What POPS would track locally.</h2>
            <p>
              The first release does not need a government API. It needs a clear,
              honest ledger with source labels, receipts, imported originals, and
              tamper-evident history.
            </p>
          </div>

          <div className="ledger-field-grid">
            {TRACKED_FIELDS.map((field) => (
              <div className="ledger-field" key={field}>
                <ShieldCheck size={16} />
                <span>{field}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1080 }}>
          <div className="section-header">
            <span className="mono">Official Records</span>
            <h2>Three safe ways to add agency records.</h2>
            <p>
              POPS should preserve the official source document first, then
              convert a working copy into ledger entries with provenance and hash
              verification attached.
            </p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon"><FileDown size={22} /></div>
              <h3>Import Agency Statement</h3>
              <p>
                Add PDFs, CSV files, downloaded webpage reports, scanned
                certified statements, and agency balance notices.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><FileCheck size={22} /></div>
              <h3>Enter Payment Manually</h3>
              <p>
                Record a payment with receipt, confirmation number, date, method,
                and notes. Mark it user-entered until it is corroborated.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><FileSearch size={22} /></div>
              <h3>Request Official Records</h3>
              <p>
                Generate a state-specific checklist or request form, then import
                returned records into the Vault System when received.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 1080 }}>
          <div className="section-header">
            <span className="mono">Source Labels</span>
            <h2>Every entry needs a status.</h2>
            <p>
              The ledger should make the difference between a user memory, a bank
              record, an agency statement, and a certified agency record obvious.
            </p>
          </div>

          <div className="ledger-status-row">
            {RECORD_STATUSES.map((status) => (
              <span className="ledger-status" key={status}>{status}</span>
            ))}
          </div>

          <div className="card ledger-rule-card">
            <Hash size={24} />
            <div>
              <h3>Vault first, ledger second.</h3>
              <p>
                POPS should hash and preserve the original imported record before
                extracting payment rows. Corrections and disputes should create
                auditable revisions rather than overwriting history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1080 }}>
          <div className="section-header">
            <span className="mono">Integration Boundary</span>
            <h2>No hidden portal scraping.</h2>
            <p>
              POPS should not store government portal passwords or invisibly
              automate logins. The safer model keeps the user in control of the
              official portal session and preserves only the records the user
              chooses to import.
            </p>
          </div>

          <div className="ledger-flow">
            <div>User signs in to official state portal</div>
            <ArrowRight size={18} />
            <div>Downloads payment history</div>
            <ArrowRight size={18} />
            <div>Imports it into POPS</div>
            <ArrowRight size={18} />
            <div>POPS hashes and preserves the original</div>
            <ArrowRight size={18} />
            <div>Ledger and exhibit exports stay auditable</div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 1080 }}>
          <div className="section-header">
            <span className="mono">Government Context</span>
            <h2>Why this is state by state.</h2>
            <p>
              There is no simple public nationwide API for consumer apps. The
              federal portal is restricted to authorized users, while payment
              records are generally maintained through each state&apos;s child-support
              agency or payment center.
            </p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <h3>Federal Portal</h3>
              <p>
                The federal Child Support Portal describes access for states,
                tribes, employers, insurers, financial institutions, federal
                agencies, and other authorized users, not the general public.
              </p>
              <a className="inline-link" href="https://ocsp.acf.hhs.gov/csp/" target="_blank" rel="noopener">
                Child Support Portal <ArrowRight size={14} />
              </a>
            </article>
            <article className="feature-card">
              <h3>Missouri Example</h3>
              <p>
                Missouri law requires payment, disbursement, current-support,
                and past-due-support records to be maintained in the automated
                child-support system.
              </p>
              <a className="inline-link" href="https://revisor.mo.gov/main/OneSection.aspx?section=454.536" target="_blank" rel="noopener">
                Missouri Section 454.536 <ArrowRight size={14} />
              </a>
            </article>
            <article className="feature-card">
              <h3>Washington Example</h3>
              <p>
                Washington DSHS tells case participants they can view recent
                payment history online or use the KIDS phone system with case
                and identity information.
              </p>
              <a className="inline-link" href="https://www.dshs.wa.gov/esa/faq?field_topic_value=childreceive" target="_blank" rel="noopener">
                Washington DSHS FAQ <ArrowRight size={14} />
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1080 }}>
          <div className="card ledger-summary-card">
            <Lock size={28} />
            <div>
              <span className="mono">Product Principle</span>
              <h2>POPS preserves the evidence trail. It does not replace the state ledger.</h2>
              <p>
                The strongest version of this module compares the user&apos;s local
                payment record against official agency records, flags discrepancies,
                preserves originals, and produces an exportable court exhibit for
                qualified review.
              </p>
              <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: 22 }}>
                <Link to="/access" className="btn btn-primary">Get POPS</Link>
                <Link to="/counsel-handoff" className="btn btn-ghost">Counsel Handoff</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
