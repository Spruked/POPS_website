import { Shield, Fingerprint, Gavel, Eye, Database, Lock, FileCheck, CheckCircle } from "lucide-react";

const PILLARS = [
  {
    icon: <Shield size={22} />,
    title: "Presence",
    body: "Presence is not just standing in a place. Presence is the call made, the message sent, the arrival at the exchange, the request for records, the follow-up after silence, and the lawful attempt when the door does not open. POPS preserves those attempts so they cannot be erased.",
  },
  {
    icon: <Lock size={22} />,
    title: "Protection",
    body: "Protection means guarding the child, the truth, the record, and the lawful path forward. Not aggression. Not intimidation. Not chaos. Discipline. Standing watch over the facts.",
  },
  {
    icon: <Fingerprint size={22} />,
    title: "Proof",
    body: "A painful story is not enough in court. A pattern needs structure. An event needs a date. A claim needs evidence. A file needs a hash. A timeline needs custody. A report needs restraint. POPS turns scattered facts into organized proof.",
  },
  {
    icon: <Gavel size={22} />,
    title: "Restraint",
    body: "Pain can make a person speak in ways that hurt their own case. POPS does not erase the pain. It preserves the original words, then helps translate the record into court-safe language. The truth stays strong without becoming reckless.",
  },
];

const STEPS = [
  {
    icon: <Fingerprint size={18} />,
    title: "Capture",
    desc: "Record what happened or upload a document, image, message export, receipt, court order, photo, screenshot, or other evidence.",
  },
  {
    icon: <Lock size={18} />,
    title: "Preserve",
    desc: "The original file is copied into protected local storage and hashed with SHA-256 so the system can later verify whether it changed.",
  },
  {
    icon: <Eye size={18} />,
    title: "Extract",
    desc: "When possible, POPS reads documents, images, screenshots, message exports, and court records to pull out dates, times, names, messages, case numbers, order language, and event details automatically.",
  },
  {
    icon: <CheckCircle size={18} />,
    title: "Review",
    desc: "The system presents what it found. The user reviews, corrects, and confirms. POPS does not silently replace the user's judgment.",
  },
  {
    icon: <Database size={18} />,
    title: "Seal",
    desc: "Once confirmed, the record is sealed, hashed, logged, and preserved in the Evidence Vault and audit ledger.",
  },
  {
    icon: <FileCheck size={18} />,
    title: "Report",
    desc: "The system helps generate timelines, evidence indexes, chain-of-custody reports, hash verification reports, attorney packets, and court-safe summaries.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="about-hero">
        <div className="container">
          <span className="mono" style={{ color: "var(--forge-blue)", display: "block", marginBottom: 16 }}>
            The Doctrine
          </span>
          <h1>Protect the Record.<br />Preserve the Truth.</h1>
          <p>
            P.O.P.S. - Proof of Presence System is not a support group. It is a support machine.
            It was built for the father who is being denied access to his child and needs to move through the system with discipline, proof, and restraint.
          </p>
        </div>
      </section>

      <div className="about-content">
        <section className="doctrine-block doctrine-stroke-1">
          <h3>The Doctrine</h3>
          <p><strong>POPS is not a support group.</strong></p>
          <p><strong>It is a support machine.</strong></p>
          <p>
            It was built for the father who is being denied access to his child and needs to move through the system with discipline,
            proof, and restraint.
          </p>
          <p>Not panic. Not revenge. Not desperation. A record.</p>
          <p>
            POPS exists because when a father's presence is questioned, emotion is not enough. Memory is not enough. Pain is not enough.
          </p>
          <p><strong>The record has to stand.</strong></p>
        </section>

        <section className="doctrine-block doctrine-stroke-2">
          <h3>The Mission</h3>
          <p>
            There is a place in a father that does not need to be taught. The instinct to protect. The duty to stand between harm and
            the child. The responsibility to show up, provide, guard, and remain accountable even when nobody is watching.
          </p>
          <p>
            That duty is not created by a court order. It is older than that. It lives in conscience, in blood, in faith, and in the
            charge placed inside a man to protect what has been entrusted to him.
          </p>
          <p>So when a father is separated from his child, that calling does not disappear. It becomes trapped.</p>
          <p>
            He is still a protector, but the door is locked. He is still responsible, but his hands are tied. He is still called a
            father, but treated like a visitor. He still carries the duty, but is denied the place to perform it.
          </p>
          <p><strong>POPS was built for that place.</strong></p>
          <p>Not to attack. Not to inflame. Not to spy. Not to turn pain into revenge.</p>
          <p><strong>POPS exists to help a father preserve the truth when the truth is being contested.</strong></p>
        </section>

        <section className="doctrine-block doctrine-stroke-3">
          <h3>The Four Pillars</h3>
          <div className="features-grid" style={{ marginTop: 20 }}>
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="feature-card">
                <div className="feature-icon">{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="doctrine-block doctrine-stroke-4">
          <h3>How the System Thinks</h3>
          <p>POPS follows a disciplined six-step path. No revenge. No chaos. No guessing. Just proof.</p>
          <div className="about-steps">
            {STEPS.map((step) => (
              <div key={step.title} className="about-step-card">
                <div className="about-step-icon">{step.icon}</div>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20 }}>
            The goal is simple: when it is time to speak, the user does not walk in with scattered fragments. He walks in with a
            record.
          </p>
        </section>

        <section className="doctrine-block doctrine-stroke-1">
          <h3>The Promise</h3>
          <p>Every attempt matters. Every lawful effort matters. Every message matters. Every date matters. Every piece of evidence deserves protection.</p>
          <ul className="about-bullets">
            <li>POPS is not a lawyer.</li>
            <li>It is not therapy.</li>
            <li>It is not a social network.</li>
            <li>It is not a revenge tool.</li>
            <li>It is not a surveillance system.</li>
            <li>It does not guarantee admissibility.</li>
          </ul>
          <p><strong>POPS is a disciplined evidence system.</strong></p>
          <p>
            It helps a parent say: I showed up. I tried. I stayed lawful. I preserved the evidence. I documented the truth.
          </p>
          <p><strong>When presence is questioned, the record speaks.</strong></p>
        </section>

        <section className="doctrine-block doctrine-stroke-2">
          <h3>Built for the Hardest Days</h3>
          <p>
            This app is built for the parking lot after a missed exchange. The unanswered message. The medical appointment learned
            about too late. The school record no one sent. The court order nobody seems to follow. The receipt that proves the trip was
            made. The screenshot that needs context. The long thread that shows the pattern.
          </p>
          <p>The quiet moment where a man wonders if anyone will ever believe how hard he tried.</p>
          <p>
            POPS does not pretend that pain is small. It does not tell a father to stop feeling what he feels. It gives him something
            better to do with it. It gives the pain a disciplined path. It gives the protector a post to stand at again.
          </p>
        </section>

        <section className="doctrine-block doctrine-stroke-3">
          <h3>Technical Foundation</h3>
          <p>
            POPS is built as a local-first evidence workstation. The desktop app is designed around local records, local storage, and
            user-controlled export.
          </p>
          <p>
            Evidence files are preserved, hashed with SHA-256, and connected to timelines, incidents, court orders, communications, and
            reports.
          </p>
          <p><strong>The system is designed to support:</strong></p>
          <ul className="about-bullets about-bullets-two-col">
            <li>Local SQLite record storage</li>
            <li>Evidence preservation</li>
            <li>SHA-256 file verification</li>
            <li>Chain-of-custody logging</li>
            <li>Court-safe summaries</li>
            <li>Attorney packet exports</li>
            <li>Hash verification reports</li>
            <li>Structured timeline building</li>
            <li>Document and image extraction where possible</li>
            <li>Encrypted backup and export paths as the security layer matures</li>
          </ul>
          <p>POPS is built to be auditable, portable, and court-friendly.</p>
          <p>The user controls what leaves the machine. Local records stay local until the user chooses to export or share them.</p>
        </section>

        <section className="about-signoff doctrine-block doctrine-stroke-4">
          <h3>Proof of Presence</h3>
          <p><strong>Protect the record.</strong></p>
          <p><strong>Preserve the truth.</strong></p>
        </section>
      </div>
    </div>
  );
}
