import { Link } from "react-router-dom";
import { ArrowRight, Camera, FolderOpen, Lock, MapPin, MonitorSmartphone, ShieldCheck, Smartphone } from "lucide-react";
import PageSeo from "./PageSeo";
import { DEMO_NOTE, ScreenshotGallery, WorkflowSteps, WorkflowVideo, type Shot } from "./ProductMedia";

type Platform = "android" | "ios";

const COPY: Record<Platform, { name: string; device: string; store: string; storeNote: string; transfer: string; seoTitle: string }> = {
  android: {
    name: "Android",
    device: "Android phone",
    store: "Google Play",
    storeNote: "Internal testing is underway. The Google Play listing opens after review.",
    transfer: "USB cable, Google Drive or any cloud folder",
    seoTitle: "POPS for Android | Evidence Capture on Your Phone",
  },
  ios: {
    name: "iPhone",
    device: "iPhone",
    store: "the App Store",
    storeNote: "TestFlight beta and App Store release are being prepared.",
    transfer: "AirDrop, the Files app or iCloud Drive",
    seoTitle: "POPS for iPhone | Evidence Capture on iOS",
  },
};

const STEPS = [
  { title: "Open your case", text: "The dashboard shows the active case, orders, upcoming dates and open alerts." },
  { title: "Capture the moment", text: "Turn on Attach location, tap Capture Photo and take the picture with your camera." },
  { title: "Sealed on the device", text: "The original is stored unaltered, fingerprinted with SHA-256 and re-verified right away." },
  { title: "Log the exchange", text: "The calendar records the time, place, other party and every contact attempt." },
  { title: "Ask the ORB", text: "Quick actions for capturing evidence, logging parenting time and reviewing orders." },
  { title: "Bring your desktop vault", text: "Restore a .popsvault package from POPS Desktop. Every original is re-checked first." },
];

function shots(p: Platform): Shot[] {
  const base = `/media/${p}`;
  return [
    { src: `${base}/1-dashboard.webp`, title: "Case dashboard", caption: "Primary case, active orders, upcoming dates and alerts at a glance." },
    { src: `${base}/2-capture.webp`, title: "Capture Photo", caption: "One tap opens the camera. Attach location is off until you turn it on." },
    { src: `${base}/3-sealed-record.webp`, title: "Sealed record", caption: "Preserved file path, source description and the SHA-256 fingerprint." },
    { src: `${base}/4-evidence-location.webp`, title: "Capture location", caption: "Coordinates, accuracy and an optional map, stored with the evidence." },
    { src: `${base}/5-calendar.webp`, title: "Parenting-time calendar", caption: "A denied exchange with time, place, order link and contact attempts." },
    { src: `${base}/6-orb-assistant.webp`, title: "ORB assistant", caption: "Guided quick actions that never submit a record on their own." },
    { src: `${base}/7-vault-transfer.webp`, title: "Vault Transfer", caption: "Desktop vault restored and every original re-verified on the phone." },
  ];
}

export default function MobileAppPage({ platform }: { platform: Platform }) {
  const c = COPY[platform];
  const other = platform === "android" ? { to: "/ios", label: "POPS for iPhone" } : { to: "/android", label: "POPS for Android" };

  return (
    <div className="product-page">
      <PageSeo
        title={c.seoTitle}
        description={`POPS for ${c.name}: capture photo evidence sealed with SHA-256, attach capture location, log parenting time and carry your desktop vault, all stored on your ${c.device}.`}
        path={`/${platform}`}
      />

      <section className="section product-hero">
        <div className="container pm-hero-grid">
          <div>
            <span className="mono">POPS for {c.name}</span>
            <h1>Capture proof the moment it happens.</h1>
            <p>
              POPS for {c.name} puts the evidence vault in your pocket. Photograph what happened, seal the original with
              SHA-256, attach where it was taken, and keep it all on your {c.device}. Nothing is uploaded unless you
              export it yourself.
            </p>
            <div className="hero-actions">
              <span className="btn btn-primary pm-store-btn" aria-disabled="true"><Smartphone size={17} /> Coming soon to {c.store}</span>
              <a href="#workflow" className="btn btn-ghost">Watch the workflow</a>
            </div>
            <p className="pm-store-note">{c.storeNote}</p>
          </div>
          <div className="pm-phone pm-hero-phone"><img src={`/media/${platform}/2-capture.webp`} alt={`POPS for ${c.name} Capture Photo screen`} /></div>
        </div>
      </section>

      <section className="section section-alt" id="workflow">
        <div className="container">
          <div className="section-header">
            <span className="mono">The exact workflow</span>
            <h2>From the moment to a sealed record, in six steps.</h2>
            <p>{DEMO_NOTE}</p>
          </div>
          <div className="pm-workflow">
            <WorkflowVideo phone src={`/media/pops-${platform}-workflow.mp4`} poster={`/media/pops-${platform}-workflow.jpg`} label={`POPS for ${c.name} step-by-step workflow`} />
            <WorkflowSteps steps={STEPS} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Every screen</span>
            <h2>What you see on your {c.device}.</h2>
            <p>Tap any screen to enlarge it.</p>
          </div>
          <ScreenshotGallery phone shots={shots(platform)} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="mono">Permissions, in plain words</span>
            <h2>POPS asks only when you act.</h2>
          </div>
          <div className="pm-feature-grid">
            <div className="card"><Camera size={22} /><h3>Camera</h3><p>Used only when you tap Capture Photo. The original photo is saved unaltered and sealed with SHA-256.</p></div>
            <div className="card"><MapPin size={22} /><h3>Location</h3><p>Off by default. When you turn on Attach location, the position is saved with that one evidence record.</p></div>
            <div className="card"><FolderOpen size={22} /><h3>Files</h3><p>Used only when you choose a file to import or a Vault Transfer package to restore.</p></div>
            <div className="card"><Lock size={22} /><h3>Stays on your phone</h3><p>No account, no analytics and no tracking. Read the <Link to="/app-privacy">App Privacy Policy</Link>.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container product-included">
          <div>
            <span className="mono">Works with POPS Desktop</span>
            <h2>One vault, on your desk and in your pocket.</h2>
            <p>
              Create a Vault Transfer package in POPS Desktop and move it to your {c.device} by {c.transfer}. POPS checks the
              package manifest, shows what it contains and re-verifies every original against its recorded SHA-256 before
              anything is restored. A snapshot of the existing vault is kept first.
            </p>
          </div>
          <div className="included-list">
            <div><ShieldCheck size={18} /> <span>Every file fingerprinted when the package is made</span></div>
            <div><ShieldCheck size={18} /> <span>Altered packages are refused</span></div>
            <div><ShieldCheck size={18} /> <span>Mismatched originals are flagged in chain of custody</span></div>
            <div><MonitorSmartphone size={18} /> <span>Reports and attorney packets include capture locations</span></div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container product-cta">
          <h2>See the full workspace on desktop.</h2>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link to="/desktop-app" className="btn btn-primary">POPS Desktop <ArrowRight size={16} /></Link>
            <Link to={other.to} className="btn btn-ghost">{other.label}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
