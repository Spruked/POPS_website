import {
  CalendarDays,
  FileCheck2,
  FileText,
  FolderLock,
  Gavel,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navItems = [
  [LayoutDashboard, "Dashboard"],
  [FolderLock, "Evidence Vault"],
  [CalendarDays, "Events & Timeline"],
  [Gavel, "Court Orders"],
  [FileText, "Reports"],
] as const;

export default function DesktopAppPreview() {
  return (
    <div className="app-preview-frame" aria-label="Representative POPS desktop app preview">
      <div className="app-preview-windowbar">
        <span className="app-preview-brand">P.O.P.S. Desktop</span>
        <span className="app-preview-local"><ShieldCheck size={13} /> LOCAL WORKSPACE</span>
      </div>
      <div className="app-preview-body">
        <aside className="app-preview-sidebar">
          <span className="app-preview-sidebar-label">CASE WORKSPACE</span>
          {navItems.map(([Icon, label]) => (
            <div className={`app-preview-nav-item ${label === "Dashboard" ? "is-selected" : ""}`} key={label}>
              <Icon size={15} /> {label}
            </div>
          ))}
          <div className="app-preview-nav-item"><MessageCircle size={15} /> Pops Assistant</div>
        </aside>
        <div className="app-preview-content">
          <div className="app-preview-heading">
            <div><span className="app-preview-eyebrow">DEMO DATA</span><h3>Case Workspace</h3><p>Example case · Local record</p></div>
            <button type="button" className="app-preview-capture"><FileCheck2 size={14} /> Quick Capture</button>
          </div>
          <div className="app-preview-metrics">
            <div><span>Evidence</span><strong>24</strong></div>
            <div><span>Timeline</span><strong>17</strong></div>
            <div><span>Orders</span><strong>2</strong></div>
            <div><span>Reports</span><strong>3</strong></div>
          </div>
          <div className="app-preview-columns">
            <div className="app-preview-panel">
              <div className="app-preview-panel-title"><span>Recent activity</span><span className="app-preview-muted">View timeline</span></div>
              <div className="app-preview-event"><span className="app-preview-dot" /><div><strong>Exchange documented</strong><small>Today · Evidence attached</small></div></div>
              <div className="app-preview-event"><span className="app-preview-dot" /><div><strong>Message preserved</strong><small>Yesterday · SHA-256 recorded</small></div></div>
              <div className="app-preview-event"><span className="app-preview-dot" /><div><strong>Court order added</strong><small>May 18 · Order reference linked</small></div></div>
            </div>
            <div className="app-preview-panel app-preview-assistant"><div className="app-preview-panel-title"><span><Sparkles size={14} /> Pops Assistant</span><span className="app-preview-live">READY</span></div><p>Ask about this workspace, find a record, or explain the next step.</p><div className="app-preview-prompt">“Show my latest evidence”</div></div>
          </div>
        </div>
      </div>
      <div className="app-preview-caption">Representative product preview — example data only</div>
    </div>
  );
}
