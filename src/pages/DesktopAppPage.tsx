import { ArrowRight, CheckCircle, MonitorDown } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";
import DesktopAppPreview from "../components/DesktopAppPreview";

const included = ["Windows desktop application", "Local case workspace and persistence", "Evidence preservation with SHA-256 hashing", "Events, timeline, court orders, and violations", "Reports and counsel handoff preparation", "Pops Assistant inside the workspace"];

export default function DesktopAppPage() {
  return <div className="product-page"><PageSeo title="POPS Desktop App | Windows Beta" description="POPS Desktop is the Windows evidence workspace for preserving records, timelines, court orders, and reports." path="/desktop-app" />
    <section className="section product-hero"><div className="container product-hero-grid"><div><span className="mono">Desktop App</span><h1>POPS Desktop is the full evidence workspace.</h1><p>Use POPS on a Windows PC to preserve evidence, organize a case, review the timeline, and prepare a clearer record.</p><div className="hero-actions"><Link to="/access" className="btn btn-primary"><MonitorDown size={17} /> Download POPS for Windows</Link><Link to="/see-pops-in-action" className="btn btn-ghost">See it in action</Link></div></div><div className="beta-platform-notice"><strong>Windows Desktop Beta</strong><p>POPS Desktop is currently available for Windows PCs. You can browse the POPS website and manage your account from mobile, but the full evidence application currently runs on desktop. Mobile access is planned.</p></div></div></section>
    <section className="section section-alt"><div className="container"><DesktopAppPreview /></div></section>
    <section className="section"><div className="container product-included"><div><span className="mono">What you receive</span><h2>A working local-first case workspace.</h2><p>POPS keeps the desktop work focused: preserve what happened, connect the pieces, and make the record easier to review.</p></div><div className="included-list">{included.map(item => <div key={item}><CheckCircle size={18} /> <span>{item}</span></div>)}</div></div></section>
    <section className="section section-alt"><div className="container product-cta"><h2>Choose your access path.</h2><Link to="/access" className="btn btn-primary">Get POPS <ArrowRight size={16} /></Link></div></section>
  </div>;
}
