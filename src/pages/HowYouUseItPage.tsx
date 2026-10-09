import { ArrowRight, ClipboardEdit, FileCheck2, FolderTree, SearchCheck, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";

const steps: [LucideIcon, string, string][] = [[ClipboardEdit, "1. Capture", "Add evidence, events, messages, documents, and notes while the details are available."], [FileCheck2, "2. Preserve", "Keep originals and record evidence history so later review starts from what was actually collected."], [FolderTree, "3. Organize", "Connect evidence to events, people, court orders, and violations inside one case workspace."], [SearchCheck, "4. Review", "Read the case chronologically, find patterns, and understand what the record currently supports."], [Send, "5. Report", "Prepare organized material for your own review, counsel, or court preparation. POPS does not replace legal advice."]];

export default function HowYouUseItPage() {
  return <div className="product-page"><PageSeo title="How You Use POPS | P.O.P.S." description="Learn the five-part POPS workflow: capture, preserve, organize, review, and report." path="/how-you-use-it" />
    <section className="section product-hero"><div className="container product-hero-narrow"><span className="mono">How You Use It</span><h1>Move from a moment to a record.</h1><p>POPS gives the work a repeatable path, so important details do not remain scattered across phones, folders, messages, and memory.</p></div></section>
    <section className="section section-alt"><div className="container"><div className="workflow-grid">{steps.map(([Icon, title, body]) => <div className="workflow-step" key={title}><div className="workflow-icon"><Icon size={22} /></div><span className="mono">{title}</span><p>{body}</p></div>)}</div></div></section>
    <section className="section"><div className="container product-cta"><span className="mono">See the workspace</span><h2>Now see what those steps look like inside POPS.</h2><Link to="/see-pops-in-action" className="btn btn-primary">See POPS in Action <ArrowRight size={16} /></Link></div></section>
  </div>;
}
