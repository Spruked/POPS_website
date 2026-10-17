import { ArrowRight, CheckCircle, MonitorDown, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";
import DesktopAppPreview from "../components/DesktopAppPreview";
import { DEMO_NOTE, ScreenshotGallery, WorkflowSteps, WorkflowVideo, type Shot } from "../components/ProductMedia";

const included = ["Windows desktop application", "Local case workspace and persistence", "Evidence preservation with SHA-256 hashing", "Events, timeline, court orders, and violations", "Reports and counsel handoff preparation", "Pops Assistant inside the workspace"];

const steps = [
  { title: "Case Command", text: "Primary case, active orders, upcoming dates and open alerts on one screen." },
  { title: "Evidence Vault", text: "Every item preserved unaltered and fingerprinted with SHA-256 at import." },
  { title: "Capture & seal", text: "Capture Photo with Attach location. POPS seals the original and re-verifies it." },
  { title: "Where it happened", text: "Device-reported location stored with the evidence, with an optional map." },
  { title: "Parenting-time calendar", text: "Scheduled, completed and denied exchanges tied to the order they fall under." },
  { title: "Orders & violations", text: "Order terms and recorded violations kept together with their evidence." },
  { title: "Attorney packet", text: "Evidence inventory, hashes and capture locations generated in one click." },
  { title: "Vault Transfer", text: "Package the full vault, file by file, to carry it to your phone." },
];

const shots: Shot[] = [
  { src: "/media/desktop/1-case-overview.webp", title: "Case Overview", caption: "Primary case, active orders, upcoming dates and open alerts." },
  { src: "/media/desktop/2-evidence-vault.webp", title: "Evidence Vault", caption: "Quick capture, communication import, camera capture and the vault list." },
  { src: "/media/desktop/3-sealed-record.webp", title: "Sealed record", caption: "Preserved file path, source description, SHA-256 fingerprint and capture location." },
  { src: "/media/desktop/4-evidence-location.webp", title: "Capture location", caption: "Coordinates, accuracy and map, followed by the chain of custody." },
  { src: "/media/desktop/5-parenting-calendar.webp", title: "Parenting Time & Exchanges", caption: "A denied exchange with location, other party, order link and contact attempts." },
  { src: "/media/desktop/6-court-orders.webp", title: "Court Orders", caption: "Order terms with the recorded violation, severity and status." },
  { src: "/media/desktop/7-attorney-packet.webp", title: "Attorney Packet", caption: "A reviewable packet generated locally from the case record." },
  { src: "/media/desktop/8-vault-transfer.webp", title: "Vault Transfer", caption: "Transfer package created with its file count and package fingerprint." },
  { src: "/media/desktop/9-orb-assistant.webp", title: "Pops Assistant", caption: "Guided quick actions inside the workspace. Nothing is submitted automatically." },
];

export default function DesktopAppPage() {
  return <div className="product-page"><PageSeo title="POPS Desktop App | Windows Beta" description="POPS Desktop is the Windows evidence workspace for preserving records, timelines, court orders, and reports." path="/desktop-app" />
    <section className="section product-hero"><div className="container product-hero-grid"><div><span className="mono">Desktop App</span><h1>POPS Desktop is the full evidence workspace.</h1><p>Use POPS on a Windows PC to preserve evidence, organize a case, review the timeline, and prepare a clearer record.</p><div className="hero-actions"><Link to="/access" className="btn btn-primary"><MonitorDown size={17} /> Download POPS for Windows</Link><a href="#desktop-workflow" className="btn btn-ghost">Watch the workflow</a></div></div><div className="beta-platform-notice"><strong>Windows Desktop Beta</strong><p>POPS Desktop is currently available for Windows PCs. POPS for Android and iPhone captures evidence on the go and shares the same vault through Vault Transfer.</p><div className="pm-platform-links"><Link to="/android" className="btn btn-ghost"><Smartphone size={16} /> Android</Link><Link to="/ios" className="btn btn-ghost"><Smartphone size={16} /> iPhone</Link></div></div></div></section>
    <section className="section section-alt" id="desktop-workflow"><div className="container"><div className="section-header"><span className="mono">The exact workflow</span><h2>From a moment to a sealed, reviewable record.</h2><p>{DEMO_NOTE}</p></div><div className="pm-workflow pm-workflow-desktop"><WorkflowVideo src="/media/pops-desktop-workflow.mp4" poster="/media/pops-desktop-workflow.jpg" label="POPS Desktop step-by-step workflow" /><WorkflowSteps steps={steps} /></div></div></section>
    <section className="section"><div className="container"><div className="section-header"><span className="mono">Inside the app</span><h2>Every screen in the workflow.</h2><p>Click any screen to enlarge it. Use the arrow keys to move between screens.</p></div><ScreenshotGallery shots={shots} /></div></section>
    <section className="section section-alt"><div className="container"><DesktopAppPreview /></div></section>
    <section className="section"><div className="container product-included"><div><span className="mono">What you receive</span><h2>A working local-first case workspace.</h2><p>POPS keeps the desktop work focused: preserve what happened, connect the pieces, and make the record easier to review.</p></div><div className="included-list">{included.map(item => <div key={item}><CheckCircle size={18} /> <span>{item}</span></div>)}</div></div></section>
    <section className="section section-alt"><div className="container product-cta"><h2>Choose your access path.</h2><Link to="/access" className="btn btn-primary">Get POPS <ArrowRight size={16} /></Link></div></section>
  </div>;
}
