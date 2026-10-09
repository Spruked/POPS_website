import { ArrowRight, CalendarDays, FileText, FolderLock, Gavel, LayoutDashboard, MessageCircle, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";
import DesktopAppPreview from "../components/DesktopAppPreview";

const areas: [LucideIcon, string, string][] = [
  [LayoutDashboard, "Dashboard", "See the state of a case at a glance: evidence, events, orders, and next actions."],
  [FolderLock, "Evidence Vault", "Preserve originals, file details, and SHA-256 integrity records in one local workspace."],
  [CalendarDays, "Events & Timeline", "Turn scattered dates and incidents into a chronological, reviewable record."],
  [Gavel, "Court Orders & Violations", "Connect order language, observed events, and supporting evidence for review."],
  [UserRound, "Case Profile", "Keep people, context, and case information organized alongside the record."],
  [FileText, "Reports", "Prepare structured material for your own review, counsel, or court preparation."],
  [MessageCircle, "Pops Assistant", "Ask questions about the workspace while you remain in control of the record."],
];

export default function ProductDemoPage() {
  return <div className="product-page"><PageSeo title="See POPS in Action | P.O.P.S." description="See the POPS Windows desktop evidence workspace before you download it." path="/see-pops-in-action" />
    <section className="product-hero section"><div className="container product-hero-grid"><div><span className="mono">See POPS in Action</span><h1>This is what you get when you download POPS.</h1><p>A Windows desktop evidence workspace for preserving records, building timelines, and preparing organized material for review.</p><div className="hero-actions"><Link to="/access" className="btn btn-primary">Get POPS <ArrowRight size={16} /></Link><Link to="/how-you-use-it" className="btn btn-ghost">How you use it</Link></div></div><div className="product-hero-note"><span className="mono">Windows Desktop Beta</span><strong>Built for the work that should stay organized.</strong><p>The website explains POPS. The desktop application is where the case workspace lives.</p></div></div></section>
    <section className="section section-alt"><div className="container"><DesktopAppPreview /></div></section>
    <section className="section"><div className="container"><div className="section-header"><span className="mono">Inside the workspace</span><h2>One place for the record.</h2><p>These are the major areas the POPS desktop application is designed to bring together.</p></div><div className="features-grid product-areas-grid">{areas.map(([Icon, title, body]) => <div className="feature-card" key={title}><Icon size={22} className="product-area-icon" /><h3>{title}</h3><p>{body}</p></div>)}</div></div></section>
    <section className="section section-alt"><div className="container product-cta"><span className="mono">Ready when you are</span><h2>Start with the Windows Desktop Beta.</h2><p>Choose an access path, then receive the desktop application and activation instructions according to your purchase or approved access request.</p><Link to="/access" className="btn btn-primary">View access options <ArrowRight size={16} /></Link></div></section>
  </div>;
}
