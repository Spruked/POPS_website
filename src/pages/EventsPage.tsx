import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";

export default function EventsPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <PageSeo
        title="POPS Events | Updates and Q&A"
        description="POPS events, live Q&A sessions, community updates, and future registration information for fathers using Proof of Presence."
        path="/events"
      />
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Events</span>
            <h1>Events</h1>
            <p>
              No live sessions are scheduled on this page yet. Future announcements will identify the topic, date, time zone, participation link, and replay availability. A proposed product demonstration will use fictional records to show a practical Windows workflow; no launch date or giveaway is announced.
            </p>
          </div>

          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link to="/" className="btn btn-ghost">Back to Landing</Link>
            <Link to="/beta" className="btn btn-primary">Explore beta participation</Link><Link to="/see-pops-in-action" className="btn btn-ghost">Walkthrough recording status</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
