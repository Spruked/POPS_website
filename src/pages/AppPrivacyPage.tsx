import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";

export default function AppPrivacyPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <PageSeo
        title="POPS App Privacy Policy | Android, iOS and Desktop"
        description="Privacy policy for the POPS apps on Android, iOS, Windows, macOS and Linux: local-first storage, camera and location permissions, and how your records stay on your device."
        path="/app-privacy"
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="section-header">
            <span className="mono">POPS APP PRIVACY</span>
            <h1>App Privacy Policy</h1>
            <p>
              Effective date: October 16, 2026. Applies to the P.O.P.S. apps for
              Android, iOS, Windows, macOS and Linux. For the website, see the{" "}
              <Link to="/privacy">Privacy and Operational Notice</Link>.
            </p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <p>
              <strong>
                In short: P.O.P.S. is a local-first app. Your case records, evidence,
                photos, locations and notes are stored only on your device. The app
                does not send your data to POPS servers. The app has no accounts, no
                analytics, no advertising and no tracking, and POPS does not sell or
                share your information.
              </strong>
            </p>

            <hr />

            <h2>1. Information the App Stores on Your Device</h2>
            <p>
              Everything you enter or capture is saved in the app&apos;s private
              storage on your device, in a local database and vault folder. This
              includes case details, contacts and dossiers, calendar entries, court
              orders, events, members records, reports, and evidence files.
            </p>
            <p>
              Each evidence file gets a SHA-256 fingerprint, and the app keeps a
              chain-of-custody log and an audit ledger. This information is never
              sent to POPS.
            </p>

            <hr />

            <h2>2. Device Permissions</h2>
            <ul>
              <li>
                <strong>Camera</strong>: used to photograph evidence. The original
                photo is saved unaltered and sealed with SHA-256. Used only when you
                tap Capture Photo.
              </li>
              <li>
                <strong>Photos / files</strong>: used to import photos, documents and
                message exports into your evidence vault, and to choose Vault Transfer
                packages. Used only when you choose a file.
              </li>
              <li>
                <strong>Location (approximate and precise)</strong>: used to record
                where an evidence photo was taken. The location is stored with that
                evidence record on your device. Used only if you turn on
                &quot;Attach location&quot;, which is off by default.
              </li>
              <li>
                <strong>Microphone</strong>: used for desktop dictation into your
                notes, only when you start dictation.
              </li>
            </ul>
            <p>
              You can deny or withdraw any permission in your device settings. The
              rest of the app keeps working.
            </p>

            <hr />

            <h2>3. Network Connections</h2>
            <p>The app works offline. It only connects to the internet when you:</p>
            <ul>
              <li>
                Tap <strong>Show map</strong> on an evidence item. Map images load from
                OpenStreetMap, whose servers receive the requested map area and your
                IP address under the OpenStreetMap Foundation privacy policy.
                Coordinates are shown without a map until you tap Show map.
              </li>
              <li>
                Use <strong>Open in maps</strong> or contact research links (Google
                Search and Google News). These open in your web browser, and those
                sites&apos; own privacy policies apply.
              </li>
            </ul>
            <p>
              On desktop, the optional ORB assistant services (local AI model, OCR,
              voice) run on your own computer and do not leave it.
            </p>

            <hr />

            <h2>4. Moving and Sharing Your Data</h2>
            <p>
              Data only leaves your device when you export it yourself: reports, the
              Full Case Bundle, or a Vault Transfer package (.popsvault). You choose
              where those files go. A Vault Transfer package holds a full copy of your
              vault, so store and share it carefully.
            </p>

            <hr />

            <h2>5. Data Retention and Deletion</h2>
            <p>
              Your data stays until you delete it in the app or uninstall the app.
              Uninstalling removes the app&apos;s private storage on your device.
              Copies you exported yourself are not affected. POPS cannot recover or
              delete app data for you, because POPS never receives it.
            </p>

            <hr />

            <h2>6. Security</h2>
            <p>
              Data is protected by your device&apos;s app sandbox and device security
              (screen lock and device encryption where your device supports it).
              Evidence integrity is protected by SHA-256 fingerprints, re-verification,
              and a hash-linked audit ledger. Keep your device and any exported files
              secure.
            </p>

            <hr />

            <h2>7. Children</h2>
            <p>
              P.O.P.S. is intended for adults managing their own family or legal
              records. It is not directed at children under 13 and does not knowingly
              collect information from children.
            </p>

            <hr />

            <h2>8. Your Rights</h2>
            <p>
              Your app information is kept only on your device and under your control,
              so you can view, correct, export or delete it directly in the app. For a
              privacy question or request under laws such as the GDPR or CCPA, use the
              contact below.
            </p>

            <hr />

            <h2>9. Changes to This Policy</h2>
            <p>
              If this policy changes, POPS will update this page and its effective
              date. Material changes will also be noted in the app&apos;s release notes.
            </p>

            <hr />

            <h2>10. Contact</h2>
            <p>
              P.O.P.S. – Proof of Presence · www.popsproof.com
              <br />
              Email: <a href="mailto:privacy@popsproof.com">privacy@popsproof.com</a>
            </p>
            <p>
              <strong>
                Do not include case evidence, child-identifying information, court
                documents, medical records, passwords, or emergency details in your
                first privacy-contact message. P.O.P.S. is a record-keeping tool and
                does not provide legal advice.
              </strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
