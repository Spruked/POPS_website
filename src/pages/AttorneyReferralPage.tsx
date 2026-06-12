import { Link } from "react-router-dom";

export default function AttorneyReferralPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Attorney Referral</span>
            <h1>Attorney Referral</h1>
            <p>
              This page is a placeholder for upcoming attorney referral workflows.
              POPS will connect qualified users to counsel pathways as this layer is finalized.
            </p>
          </div>

          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link to="/" className="btn btn-ghost">Back to Landing</Link>
            <Link to="/pricing" className="btn btn-primary">Get POPS</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
