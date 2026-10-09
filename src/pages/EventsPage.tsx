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
              This page is the public calendar for POPS education, live Q&amp;A sessions, community updates, and future registration information.
            </p>
          </div>

          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link to="/" className="btn btn-ghost">Back to Landing</Link>
            <Link to="/about" className="btn btn-primary">About POPS</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
