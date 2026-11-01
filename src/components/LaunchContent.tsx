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
export function StatusNote({ children }: {children: ReactNode}) { return <aside className="launch-status"><strong>Product updates</strong><p>{children}</p></aside>; }
export function MissingCapture({ kind = 'screenshot', children }: {kind?: string; children: ReactNode}) {return <figure className="launch-capture"><span className="mono">Product preview</span><figcaption>{children}</figcaption></figure>;}
export function IntegrityExplanation() {return <><p>SHA-256 creates a fingerprint from a file’s contents. Comparing a later fingerprint with a previously recorded value helps check whether those contents have changed. A match does not independently establish who created the file, when an event happened, or whether the information is true.</p><p>Provenance records where material came from and how it was collected. Chain of custody documents its handling over time. A hash can support that history, but cannot replace it. Keep source material, record context accurately, and distinguish your own notes from system-recorded information.</p></>;}
