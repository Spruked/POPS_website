import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";

export default function AccountPortalPage() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div style={{ paddingTop: 88 }}>
      <PageSeo
        title="POPS Account Signup | Access and Updates"
        description="Create a POPS account to manage product access, downloads, release updates, and future account-connected services."
        path="/account"
        indexable={false}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="section-header">
            <span className="mono">Account and Open Door Access</span>
            <h1>Manage Your POPS Access</h1>
            <p>
              Use this page to create or manage the account connected to your POPS access, downloads, updates, and Open Door review.
            </p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <form onSubmit={onSubmit} className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input required placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required placeholder="Create password" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" required placeholder="Confirm password" />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center", textTransform: "none", letterSpacing: 0 }}>
                  <input type="checkbox" required />
                  I agree to the <Link to="/terms">Terms of Service</Link>.
                </label>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center", textTransform: "none", letterSpacing: 0 }}>
                  <input type="checkbox" required />
                  I agree to the <Link to="/privacy">Privacy Statement</Link>.
                </label>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center", textTransform: "none", letterSpacing: 0 }}>
                  <input type="checkbox" required />
                  I acknowledge the <Link to="/policies-procedures">Policies and Procedures</Link>.
                </label>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center", textTransform: "none", letterSpacing: 0 }}>
                  <input type="checkbox" />
                  Send product updates and release notifications.
                </label>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="submit" className="btn btn-primary">Create Account</button>
                <Link to="/pricing" className="btn btn-ghost">See Pricing</Link>
                <Link to="/" className="btn btn-ghost">Back to Landing</Link>
              </div>
            </form>

            {submitted && (
              <p style={{ marginTop: 16, color: "#10b981", fontWeight: 600 }}>
                This form is ready for connection to the POPS account service. No account has been created yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
