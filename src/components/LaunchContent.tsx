import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageSeo from './PageSeo';

export function LaunchPage({ title, description, path, eyebrow, heading, intro, children, indexable = true }: {title: string; description: string; path: string; eyebrow: string; heading: string; intro: string; children: ReactNode; indexable?: boolean}) {
  return <article className="launch-page"><PageSeo title={title} description={description} path={path} indexable={indexable}/><header className="launch-intro container"><span className="mono">{eyebrow}</span><h1>{heading}</h1><p className="launch-lede">{intro}</p></header><div className="container launch-body">{children}</div></article>;
}
export function ContentSection({ id, title, children }: {id: string; title: string; children: ReactNode}) {
  return <section id={id} className="launch-section" aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{title}</h2>{children}</section>;
}
export function LaunchLinks() {
  return <nav className="launch-links" aria-label="Product and launch information"><Link to="/desktop-app">Windows software</Link><Link to="/android">Android testing</Link><Link to="/access#platforms">iOS (planned)</Link><Link to="/beta">Beta participation</Link><Link to="/early-adopters">First 100 customers</Link><Link to="/faq">Buying FAQs</Link><Link to="/support">Contact & support</Link></nav>;
}
export function StatusNote({ children }: {children: ReactNode}) { return <section className="launch-information" style={{background:"linear-gradient(120deg, rgba(54,125,160,.13), rgba(54,125,160,.035))",border:"1px solid rgba(113,165,188,.23)",borderRadius:16,padding:"22px 26px",margin:"22px 0 28px",boxShadow:"0 8px 28px rgba(0,0,0,.07)"}}><div style={{fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",fontSize:12,opacity:.75,marginBottom:10}}>From the POPS team</div><div style={{lineHeight:1.7}}>{children}</div></section>; }
export function MissingCapture({ children }: {kind?: string; children: ReactNode}) {return <figure className="launch-preview" style={{borderRadius:16,background:"linear-gradient(135deg, rgba(96,122,146,.14), rgba(96,122,146,.04))",padding:"28px 30px",margin:"24px 0",border:"1px solid rgba(133,158,179,.2)"}}><figcaption style={{fontSize:16,lineHeight:1.65}}>{children}</figcaption></figure>;}
export function IntegrityExplanation() {return <><p>SHA-256 creates a fingerprint from a file’s contents. Comparing a later fingerprint with a previously recorded value helps check whether those contents have changed. A match does not independently establish who created the file, when an event happened, or whether the information is true.</p><p>Provenance records where material came from and how it was collected. Chain of custody documents its handling over time. A hash can support that history, but cannot replace it. Keep source material, record context accurately, and distinguish your own notes from system-recorded information.</p></>;}
