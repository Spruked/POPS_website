export default function PrivacyPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="section-header">
            <span className="mono">Legal</span>
            <h1>Privacy Statement</h1>
            <p>How POPS handles website and account information.</p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3>1. Data We Collect</h3>
            <p>Website account data may include name, email, and submitted form details necessary to provide services.</p>

            <h3>2. Local-First Product Data</h3>
            <p>Desktop case records are designed to remain local unless the user chooses to export or share them.</p>

            <h3>3. How We Use Data</h3>
            <p>Data is used to operate services, manage access paths, communicate updates, and improve product reliability.</p>

            <h3>4. Sharing and Disclosure</h3>
            <p>POPS does not sell personal data. Data is shared only where required by law or authorized by the user.</p>

            <h3>5. Security</h3>
            <p>Reasonable safeguards are used for service security, but no system can guarantee absolute security.</p>

            <h3>6. Retention</h3>
            <p>Website account data is retained as needed for operations, legal obligations, and support continuity.</p>

            <h3>7. User Choices</h3>
            <p>Users may request account updates or deletion subject to legal and operational constraints.</p>

            <h3>8. Policy Updates</h3>
            <p>This statement may be updated periodically. Continued use after updates indicates acceptance.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
