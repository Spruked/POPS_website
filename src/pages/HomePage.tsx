import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, Download, FileCheck, Gavel, MonitorPlay, Shield } from "lucide-react";
import PageSeo from "../components/PageSeo";
import { ContentSection, LaunchLinks, StatusNote } from "../components/LaunchContent";

const FLOW = [
  {
    title: "Discover What P.O.P.S. Can Do",
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
        description="POPS helps fathers organize records of parenting-time involvement. Explore the POPS Desktop for Windows app, Android Google Play testing, and planned iOS application."
        path="/"
      />

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="hero-badge">
            <span>Introducing P.O.P.S. — Proof of Presence</span>
          </div>

          <h1>
            We’re Proud to Introduce P.O.P.S.<br />
            <span className="accent">Preserve. Protect. Prove.</span>
          </h1>

          <p className="hero-subtitle">
            We’re excited to introduce Proof of Presence, a new way to bring your parenting-time records together. Capture important moments, organize supporting material, and build a chronological history you can revisit with confidence. Discover the POPS Windows experience, see it in action, and join us as the mobile editions take shape.
          </p>

          <div className="hero-actions">
            <Link to="/access" className="btn btn-primary">
              <Download size={18} />
              Explore POPS
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

      <section id="home-beta-opportunity" className="home-overview-feature container" aria-labelledby="home-beta-opportunity-title">
        <figure className="home-overview-video">
          <video
            controls
            playsInline
            preload="metadata"
            poster="/media/pops-narrated-overview.jpg"
            aria-label="POPS beta and Android tester invitation"
            aria-describedby="home-overview-caption"
            width={1920}
            height={1080}
          >
            <source src="/media/pops-narrated-overview.mp4" type="video/mp4" />
            Your browser does not support embedded video. <a href="/media/pops-narrated-overview.mp4">Watch the narrated overview</a>.
          </video>
          <figcaption id="home-overview-caption">Beta and Android tester invitation · Press Play to begin.</figcaption>
        </figure>
        <div className="home-overview-copy">
          <span className="mono">Android testing · Beta recruitment</span>
          <h2 id="home-beta-opportunity-title">We’re Excited to Invite You In</h2>
          <h3>Help Shape the Future of P.O.P.S.</h3>
          <p>We're inviting <strong>20 Android testers and up to 50 beta testers</strong> to help us evaluate, refine, and prepare P.O.P.S. for its wider release.</p>
          <p>Your participation is an opportunity to experience the system firsthand, provide meaningful feedback, and help shape a product built to make a difference for parents and families.</p>
          <p><strong>Watch the video to learn about the opportunity and how you can get involved.</strong></p>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="home-app-family-title">
        <div className="container">
          <div className="section-header">
            <span className="mono">Meet the P.O.P.S. Application Family</span>
            <h2 id="home-app-family-title">We’re Building P.O.P.S. for the Way You Live.</h2>
            <p>Discover how POPS works, explore an interactive demonstration, and find the version that fits your needs.</p>
          </div>
          <div className="launch-grid">
            <article className="launch-card">
              <span className="mono">Windows Desktop · Published offer</span>
              <h3>POPS Desktop</h3>
              <p>Organize important events, supporting files, and records in one Windows desktop workspace. The published one-time offer is $99 with POPS Membership included. Explore the application ahead of its purchase release.</p>
              <Link to="/desktop-app" className="btn btn-primary">Explore POPS Desktop for Windows</Link>
            </article>
            <article className="launch-card" id="home-android-status">
              <span className="mono">Android · Google Play testing</span>
              <h3>POPS Android</h3>
              <p>We’re excited to announce that the POPS Android app is complete and in Google Play testing. Once testing is finished, Android access will be included with your POPS desktop purchase.</p>
              <Link to="/android" className="btn btn-primary">See Android status</Link>
            </article>
            <article className="launch-card">
              <span className="mono">iOS · Planned</span>
              <h3>POPS for iPhone</h3>
              <p>POPS for iPhone is planned. Follow product updates as the mobile family grows.</p>
              <Link to="/access#platforms" className="btn btn-ghost">View platform plans</Link>
            </article>
          </div>
        </div>
      </section>

      <div className="launch-home"><div className="container">
        <ContentSection id="home-product-purpose" title="Your presence matters. Give the details a place to stay.">
          <p>A missed exchange is more than a date on a calendar. There may be an unanswered message, a receipt from the trip, a photo, or a note about what you personally observed. When those pieces stay scattered, preparing for a conversation means searching again and relying on memory.</p>
          <p>P.O.P.S. — Proof of Presence System — helps organize a parent’s record of involvement: record an event, preserve supporting material, and review a chronological history in context. Use your organized history for personal review or conversations with a legal professional. POPS is a recordkeeping tool, not a legal decision-maker.</p>
          <div className="launch-grid">
            <div className="launch-card"><h3>Organize involvement</h3><p>Bring dates, event notes, people, and relevant context together for a clearer personal review.</p><Link to="/desktop-app">Explore POPS Desktop for Windows</Link></div>
            <div className="launch-card"><h3>Keep supporting material connected</h3><p>Associate files with the records they relate to and review them in chronological context. Keep related material and its context connected for easier review.</p><Link to="/how-you-use-it">See the documented workflow</Link></div>
            <div className="launch-card"><h3>See the practical steps</h3><p>Explore an illustrative missed-exchange scenario, from the initial note to supporting files and a chronological record.</p><Link to="/how-you-use-it">Follow the record-building workflow</Link></div>
          </div>
        </ContentSection>
        <ContentSection id="home-private-records" title="Your records. Your control.">
          <p>Your personal documentation belongs in your local POPS workspace, separate from public website forms and accounts. Keep sensitive material in your secure records.</p>
          <p>The desktop experience is designed around local records and user-controlled review. Release notes explain the storage and recovery features available.</p>
          <Link to="/privacy">Read the privacy notice</Link>
        </ContentSection>
        <ContentSection id="home-practical-example" title="A missed exchange becomes an organized record.">
          <p>Record the scheduled exchange and what you observed. Associate a relevant photo or message with that event. Keep the source and collection context. Review related entries in date order, then prepare the material supported by your release for your own review or discussion with counsel.</p>
          <p>POPS helps organize the evidence and context you provide. Legal conclusions and court decisions remain with the appropriate professionals and authorities.</p>
        </ContentSection>
        <ContentSection id="home-participate" title="We’d Love for You to Be Part of P.O.P.S.">
          <p>POPS Desktop Access is the published $99 one-time Windows desktop license and includes lifetime POPS Membership and the Android app upon completion of Google Play testing. Our Pay What You Can option is designed to let fathers create an account and contribute any amount greater than zero. When you can, pay it forward by sponsoring another father. Enrollment will open with the purchase process. The desktop purchase includes the completed Android app once Google Play testing is complete. iOS remains a separate future release. Purchase and fulfillment options will open with the verified release. Until then, you can explore the offers and save a selection for reference.</p>
          <StatusNote>We are seeking interest toward 50 active beta participants. The founding-customer program targets the first 100 qualifying paying customers, with special benefits still awaiting approval. Neither a signup nor a saved cart reserves paid-customer status.</StatusNote>
          <LaunchLinks/>
        </ContentSection>
      </div></div>

      <section id="what-pops-does" className="section" data-orb-target="pops.home.what-is-pops">
        <div className="container">
          <div className="section-header">
            <span className="mono">Discover What P.O.P.S. Can Do</span>
            <h2>Important Moments Deserve an Organized Record.</h2>
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
              <p>Connect event notes and supporting material in a chronology. Available reporting and export capabilities are identified in each release.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">Site Path</span>
            <h2>Doctrine, commitment, language, access.</h2>
            <p>Start with what POPS can help you accomplish, then explore the principles and tools behind it.</p>
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
              The website introduces POPS and its practical workflows. The desktop application brings the recordkeeping experience into a local workspace.
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
            Build a clearer history of your involvement with dated records, supporting material, and tools designed for factual review.
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
