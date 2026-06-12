export default function PoliciesProceduresPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="section-header">
            <span className="mono">Legal</span>
            <h1>Policies and Procedures</h1>
            <p>Operational standards and user-facing procedures for POPS services.</p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3>1. Acceptable Use Policy</h3>
            <p>Users must operate POPS lawfully and may not use the platform for harassment, surveillance abuse, or unlawful access.</p>

            <h3>2. Evidence Handling Procedure</h3>
            <p>Evidence should be uploaded in original form when possible and reviewed for accurate date and context metadata.</p>

            <h3>3. Record Correction Procedure</h3>
            <p>Users are expected to correct extracted data where needed before sealing or exporting records.</p>

            <h3>4. Access Review Procedure</h3>
            <p>Open Door and sponsored paths may require manual review and are subject to available capacity and program rules.</p>

            <h3>5. Incident and Violation Logging Standard</h3>
            <p>Incident entries should be factual, date-based, and linked to supporting evidence where available.</p>

            <h3>6. Export and Handoff Procedure</h3>
            <p>Users control export scope and are responsible for secure handling of attorney packets and shared records.</p>

            <h3>7. Moderation and Enforcement</h3>
            <p>POPS may restrict access for policy violations, abuse, fraud, or behavior that threatens platform integrity.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
