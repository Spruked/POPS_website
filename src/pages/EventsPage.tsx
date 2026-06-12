import { Link } from "react-router-dom";

export default function EventsPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Events</span>
            <h1>Events</h1>
            <p>
              This page is a placeholder for POPS events, live Q&amp;A sessions, and community updates.
              Event scheduling and registration modules will be added here.
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
