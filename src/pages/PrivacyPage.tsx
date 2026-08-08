import PageSeo from "../components/PageSeo";

export default function PrivacyPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <PageSeo
        title="POPS Privacy Notice | Local-First Records"
        description="Read the POPS privacy and operational notice covering local-first records, website forms, user control, and sensitive evidence boundaries."
        path="/privacy"
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="section-header">
            <span className="mono">POPS PRIVACY</span>
            <h1>Privacy and Operational Notice</h1>
            <p>
              What POPS handles, what stays under the user&apos;s control, and what
              should never be sent through general website forms.
            </p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h2>1. Privacy Principle</h2>
            <p>
              POPS is designed around a local-first principle:
              <strong>
                {" "}family records should remain under the user&apos;s control unless
                the user deliberately chooses to export, share, upload, submit, or
                transmit them.
              </strong>
            </p>
            <p>
              The POPS website and the POPS desktop application serve different
              functions. The website is a public information, support, and access
              channel. The desktop application is intended to help users organize
              their own case records locally.
            </p>
            <p>
              POPS does not promise automatic cloud backup, encrypted storage,
              attorney sharing, permanent evidence preservation, or remote access
              unless a specific active product feature clearly states that it is
              enabled and explains how it works.
            </p>

            <hr />

            <h2>2. Information POPS May Receive</h2>
            <p>
              POPS may receive information that a person voluntarily enters through
              a website form, purchase process, account process, support request,
              Open Door Access request, or Noted Counsel submission.
            </p>

            <h3>2.1 Information You May Provide</h3>
            <ul>
              <li>Name, email address, and contact message</li>
              <li>Purchase, license, or access-request information</li>
              <li>Support questions and product-feedback information</li>
              <li>Open Door Access information necessary to review an access request</li>
              <li>Noted Counsel Merit Recognition information submitted for review</li>
            </ul>

            <h3>2.2 Basic Technical Information</h3>
            <p>
              Website hosting, security, email, payment, and analytics providers may
              process limited technical information needed to deliver the website,
              prevent abuse, maintain security, diagnose technical problems, or
              measure basic site performance. This may include information such as
              browser type, device type, IP address, page request information,
              timestamps, and referral source.
            </p>
            <p>
              POPS does not use this information to build profiles about a user&apos;s
              private family case, child, court matter, medical situation, or legal
              dispute.
            </p>

            <hr />

            <h2>3. Information POPS Does Not Request Through General Forms</h2>
            <p>
              Do not send private case evidence through a general POPS contact form,
              social-media message, ordinary support email, Open Door request, or
              Noted Counsel submission.
            </p>

            <p>Unless POPS provides a clearly identified secure process, do not send:</p>

            <ul>
              <li>Child names, birth dates, addresses, or school identifiers</li>
              <li>Case numbers, court orders, pleadings, or attorney work product</li>
              <li>Medical records, school records, or therapy information</li>
              <li>Private texts, emails, screenshots, audio, video, or evidence files</li>
              <li>Passwords, account credentials, Social Security numbers, or bank information</li>
              <li>Emergency information or information requiring immediate legal action</li>
            </ul>

            <p>
              POPS may delete, redact, decline to process, or request removal of
              sensitive information submitted through an inappropriate channel.
            </p>

            <hr />

            <h2>4. Local Application Records</h2>
            <p>
              POPS is intended to help users organize timelines, communications,
              evidence references, incident notes, court-order details, and reports on
              their own device.
            </p>

            <p>
              Users remain responsible for protecting their device, operating-system
              account, passwords, exported files, backups, and any information they
              choose to share with an attorney, court, advocate, family member, cloud
              provider, or another person.
            </p>

            <h3>4.1 Export Is a User Decision</h3>
            <p>
              When POPS provides an export or report feature, the user decides what to
              export and where to send it. POPS does not control, monitor, retrieve,
              or delete files after they leave the user&apos;s device or are shared
              with another person or service.
            </p>

            <h3>4.2 Do Not Assume a Feature Exists</h3>
            <p>
              The specific POPS release in use controls which storage, backup, file,
              hash, export, sharing, and security functions are actually available.
              Users should review the active product documentation before relying on
              a feature for sensitive records.
            </p>

            <hr />

            <h2>5. How POPS Uses Information</h2>
            <p>POPS may use information it receives to:</p>

            <ul>
              <li>Operate and maintain the website and product-access processes</li>
              <li>Respond to support, purchase, and licensing requests</li>
              <li>Issue receipts, licenses, updates, and service communications</li>
              <li>Review Open Door Access requests under the published program rules</li>
              <li>Review and moderate Noted Counsel Merit Recognition submissions</li>
              <li>Prevent fraud, abuse, duplicate submissions, or security threats</li>
              <li>Meet legal, accounting, tax, recordkeeping, or compliance obligations</li>
              <li>Improve reliability, accessibility, and product clarity</li>
            </ul>

            <hr />

            <h2>6. Open Door Access Privacy</h2>
            <p>
              Open Door Access is a hardship-access path. POPS seeks to collect only
              the information reasonably needed to review the request, prevent abuse,
              track reserve availability, and issue an approved license.
            </p>

            <p>
              Applicants should not be required to disclose private court facts, child
              medical information, evidence, screenshots, or detailed personal trauma
              to request hardship access.
            </p>

            <p>
              Open Door Access decisions are based on available reserve capacity and
              program rules. They are not a judgment about a person&apos;s worth,
              parenthood, legal case, or hardship.
            </p>

            <hr />

            <h2>7. POPS Noted Counsel Privacy</h2>
            <p>
              POPS Noted Counsel submissions are private until reviewed. Only a POPS
              Noted User with a direct first-hand experience may submit a Merit
              Recognition.
            </p>

            <p>
              POPS may publish only a privacy-safe, edited commendation that the user
              authorized for publication. POPS may remove names, dates, locations, case
              details, and other identifying information before publication.
            </p>

            <h3>7.1 Positive-Only Merit Recognition</h3>
            <p>
              POPS Noted Counsel is a curated positive-only Merit Recognition program.
              It is not a complete review database, public complaint forum, ranking
              system, referral service, paid attorney directory, or guarantee of legal
              quality or case results.
            </p>

            <p>
              POPS does not publish star ratings, negative reviews, case accusations,
              private attorney-client communications, child information, court records,
              or claims that an attorney guaranteed an outcome.
            </p>

            <h3>7.2 No Payment for Recognition</h3>
            <p>
              Attorneys may not pay for recognition, placement, priority, visibility,
              commendations, or POPS user introductions. POPS Noted Users may not be
              paid, pressured, coached, or rewarded for submitting a Merit Recognition.
            </p>

            <hr />

            <h2>8. Sharing and Disclosure</h2>
            <p>
              POPS does not sell or rent personal information or private case
              information.
            </p>

            <p>POPS may share limited information only when reasonably necessary:</p>

            <ul>
              <li>With service providers that operate hosting, email, payment, security, or support systems</li>
              <li>When the user expressly authorizes a requested transmission or action</li>
              <li>To prevent fraud, abuse, security threats, or unlawful activity</li>
              <li>To comply with a valid legal obligation, subpoena, court order, or legal process</li>
              <li>To protect the rights, safety, property, or operations of POPS, users, or others</li>
            </ul>

            <p>
              POPS does not share a user&apos;s local case records unless the user takes
              an action that deliberately exports, uploads, or shares those records
              through an available feature.
            </p>

            <hr />

            <h2>9. Security Limits</h2>
            <p>
              POPS uses reasonable operational safeguards appropriate to the active
              website and product release. No website, device, email system, internet
              connection, browser, cloud provider, payment processor, or software
              product can guarantee absolute security.
            </p>

            <p>
              Users should use strong passwords, protect their device, keep software
              updated, preserve original records where possible, maintain appropriate
              backups, and avoid sending sensitive family information through
              unapproved channels.
            </p>

            <hr />

            <h2>10. Retention and Deletion</h2>
            <p>
              POPS retains website, support, access, license, payment-confirmation,
              fraud-prevention, and operational records only as long as reasonably
              necessary for the purpose they were collected, subject to legal,
              accounting, security, and contractual obligations.
            </p>

            <p>
              A person may request correction or deletion of personal information they
              submitted directly to POPS, subject to applicable obligations and
              legitimate recordkeeping needs.
            </p>

            <p>
              POPS cannot delete information stored on a user&apos;s own device, browser,
              email account, cloud drive, downloaded export, attorney&apos;s records,
              court filing, or any service outside POPS control.
            </p>

            <hr />

            <h2>11. Children</h2>
            <p>
              POPS is intended for adults, including parents, guardians, attorneys,
              advocates, and other authorized adults. POPS is not intended for children
              to create accounts, submit forms, purchase licenses, or use public POPS
              services.
            </p>

            <p>
              Users should use the minimum child-identifying information necessary for
              lawful documentation and should protect that information carefully.
            </p>

            <hr />

            <h2>12. Changes and Privacy Contact</h2>
            <p>
              POPS may update this Privacy and Operational Notice as the product,
              website, security practices, service providers, or legal requirements
              change. Material changes will be posted with a revised effective date.
            </p>

            <p>
              For privacy questions, correction requests, deletion requests, or Noted
              Counsel concerns, contact POPS through the privacy contact listed in the
              site footer.
            </p>

            <p>
              <strong>
                Do not include case evidence, child-identifying information, court
                documents, medical records, passwords, or emergency details in your
                first privacy-contact message.
              </strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
