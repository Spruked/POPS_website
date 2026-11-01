import { Link } from "react-router-dom";
import { ContentSection as Section, LaunchLinks, LaunchPage } from "../components/LaunchContent";

type Form = { name: string; does: string; href?: string };

const COURT_FORMS = "https://www2.courts.mo.gov/page.jsp?id=103116";

function FormList({ forms }: { forms: Form[] }) {
  return (
    <ul className="mo-forms-list">
      {forms.map((form) => (
        <li key={form.name}>
          <strong>
            {form.href ? (
              <a href={form.href} target="_blank" rel="noopener noreferrer">{form.name}</a>
            ) : (
              form.name
            )}
          </strong>
          {" "}— {form.does}
        </li>
      ))}
    </ul>
  );
}

const PATHS: { situation: string; anchor: string; label: string }[] = [
  { situation: "Not married to the mother, and paternity is not established yet", anchor: "#establish-paternity", label: "Establish paternity" },
  { situation: "Paternity is established, but there is no custody order", anchor: "#custody-case", label: "Start a custody case" },
  { situation: "You have an order, and your time is being denied", anchor: "#enforce-order", label: "Enforce your order" },
  { situation: "Your order no longer fits your family", anchor: "#change-order", label: "Change your order" },
  { situation: "Your child or you are in danger", anchor: "#protection", label: "Protection orders" },
  { situation: "Filing fees are a barrier", anchor: "#supporting-forms", label: "Fee waiver and supporting forms" },
];

const VITAL_RECORDS: Form[] = [
  { name: "Affidavit Acknowledging Paternity", does: "Both parents sign, usually at the hospital. It is a legal finding of paternity, though either parent can rescind it within a limited window. It is not a custody order.", href: "https://health.mo.gov/data/vitalrecords/pdf/putativedads.pdf" },
  { name: "Notice of Intent to Claim Paternity (MO 580-2224)", does: "Puts your name on Missouri's Putative Father Registry and protects your right to notice of an adoption. Sign before a notary and mail it to the Bureau of Vital Records, 930 Wildwood Dr., Jefferson City, MO 65109. It records your claim; it does not establish legal paternity.", href: "https://Health.MO.Gov/IVrecords/580-2224.pdf" },
  { name: "Revocation of Notice of Intent to Claim Paternity", does: "Withdraws a registry notice. Notarized.", href: "https://Health.MO.Gov/IVrecords/revocation-of-notice.pdf" },
];

const PATERNITY_PACKET: Form[] = [
  { name: "CAFC301 Father's Petition for Declaration of Paternity, Custody and Support", does: "The main petition. Asks the court to declare you the legal father and set custody and support in one case.", href: "https://www.courts.mo.gov/file.jsp?id=114780" },
  { name: "CAFC501 Parenting Plan (Parts A and B)", does: "Your proposed schedule (Part A) and support terms (Part B)." },
  { name: "CAFC252 Statement of Income and Expenses", does: "Income and expenses for both parents." },
  { name: "CAFC242 Statement of Property and Debt", does: "Property and debts." },
  { name: "CAFC751 Petition, Consent and Order for Appointment as Next Friend", does: "Names someone to represent the children's interests. Children 14 or older sign it." },
  { name: "CAFC315-R Answer to Petition", does: "The other parent's response form, included with the papers you serve." },
  { name: "CAFC721 Notice of Hearing", does: "Puts your case on the court's docket." },
  { name: "CAFC370 Judgment of Paternity", does: "The proposed judgment you offer the court." },
  { name: "FI-10 Confidential Case Filing Information Sheet and GN320 Redaction Certification", does: "Filed with the petition to protect private identifiers." },
];

const CUSTODY_FORMS: Form[] = [
  { name: "CAFC201 Petition for Child Custody", does: "For fathers whose paternity is already established but who have no custody order. Filed in the court that entered the paternity order, if there is one.", href: "https://www.courts.mo.gov/page.jsp?id=38351" },
  { name: "CAFC501 Parenting Plan", does: "Your proposed schedule. Missouri courts begin from a presumption that equal or approximately equal parenting time is in the child's best interests." },
  { name: "Financial statements and Civil Procedure Form 14", does: "Income, expenses, property, debt, and Missouri's child support calculation." },
];

const ENFORCE_FORMS: Form[] = [
  { name: "FA10 Motion for Family Access Order", does: "Asks the court to remedy denied or interfered-with parenting time, including make-up time at least equal to the time you lost. The clerk issues a summons within five court days, and the court decides within 60 days of service unless waived.", href: "https://www.courts.mo.gov/file.jsp?id=701" },
  { name: "FA35 Response to Motion for Family Access Order", does: "The other parent's response form." },
  { name: "Verified motion for contempt", does: "A second enforcement route under RSMo 452.400. Your circuit clerk provides the local form." },
];

const MODIFY_FORMS: Form[] = [
  { name: "CAFC101 Motion to Modify Child Custody and Support", does: "Asks the court to change an existing order when circumstances have substantially changed.", href: "https://www.courts.mo.gov/page.jsp?id=38347" },
  { name: "CAFC111-R Answer to Motion to Modify", does: "The other parent's response form." },
  { name: "CAFC140 and CAFC150 Financial Statements", does: "Property, debt, income, and expenses for a modification." },
  { name: "CAFC501 Parenting Plan and CAFC170 Judgment for Modification", does: "Your proposed new schedule and proposed judgment." },
];

const PROTECTION_FORMS: Form[] = [
  { name: "Petition for a Court Order of Protection – Child (CP40)", does: "Filed on behalf of a child to stop abuse, stalking, or sexual assault.", href: "https://www.courts.mo.gov/page.jsp?id=383" },
  { name: "Petition for a Court Order of Protection – Adult (AA40)", does: "Protection from another adult. It can also ask for temporary custody of children.", href: "https://www.courts.mo.gov/page.jsp?id=533" },
  { name: "Motions for renewal (AA25 / CP25)", does: "Extend an existing full order of protection." },
];

const SUPPORTING_FORMS: Form[] = [
  { name: "GN10 Motion and Affidavit to Proceed as a Poor Person", does: "Asks the court to waive filing fees.", href: "https://www.courts.mo.gov/file.jsp?id=84216" },
  { name: "Litigant Awareness Program certificate", does: "Required for anyone representing himself in a Missouri family case. Complete the free program online first.", href: "https://www2.courts.mo.gov/page.jsp?id=5240" },
  { name: "FI-10, GN320 and GN325", does: "The confidential filing sheet, redaction certification, and motion to correct a redaction." },
];

export default function MissouriFormsPage() {
  return (
    <LaunchPage
      title="Missouri Court Forms for Fathers | Paternity, Custody & Parenting Time | POPS"
      description="Every Missouri court form a father needs to establish paternity, file for custody, enforce parenting time, change an order, or request protection, with links to the official forms."
      path="/missouri-forms"
      eyebrow="Know your path • Missouri"
      heading="Every form you need to stand in your place."
      intro="Missouri gives fathers free, official court forms, and every circuit court accepts them when they are filled out correctly. Find your situation, take the next step, and bring your record with you."
    >
      <Section id="find-your-path" title="Find your path">
        <ul className="mo-forms-paths">
          {PATHS.map((path) => (
            <li key={path.anchor}>
              {path.situation} → <a href={path.anchor}>{path.label}</a>
            </li>
          ))}
        </ul>
        <p>
          Representing yourself? Start with Missouri's free online Litigant Awareness Program. Official forms are always
          available at <a href={COURT_FORMS} target="_blank" rel="noopener noreferrer">courts.mo.gov</a> and from your
          circuit clerk.
        </p>
      </Section>

      <Section id="establish-paternity" title="Establish paternity">
        <p>
          The law protects a father's bond most strongly once he is the legal father. These steps make it official.
        </p>
        <h3>With the Bureau of Vital Records</h3>
        <FormList forms={VITAL_RECORDS} />
        <h3>In court: the Father's Paternity Forms packet</h3>
        <FormList forms={PATERNITY_PACKET} />
      </Section>

      <Section id="custody-case" title="Start a custody case">
        <p>
          Once paternity is established, a custody order gives you a schedule the court will enforce. Missouri starts
          every custody decision from equal or approximately equal parenting time.
        </p>
        <FormList forms={CUSTODY_FORMS} />
        <p>
          You can usually ask the court for temporary custody and visitation while your case is pending. Married fathers
          who are separated use the dissolution or legal separation forms on the same Missouri Courts page.
        </p>
      </Section>

      <Section id="enforce-order" title="Enforce your order">
        <p>
          When your court-ordered time is denied, Missouri's family access motion is built for you to file yourself, and
          the court must act quickly.
        </p>
        <FormList forms={ENFORCE_FORMS} />
        <p>Your circuit clerk can confirm that your order qualifies and explain local filing steps.</p>
      </Section>

      <Section id="change-order" title="Change your order">
        <FormList forms={MODIFY_FORMS} />
      </Section>

      <Section id="protection" title="Protection orders">
        <p>
          If anyone is in immediate danger, call 911. Missouri charges no filing fee for an order of protection, and you
          do not need a lawyer. These orders are for real danger: abuse, stalking, or sexual assault.
        </p>
        <FormList forms={PROTECTION_FORMS} />
      </Section>

      <Section id="supporting-forms" title="Fee waiver and supporting forms">
        <FormList forms={SUPPORTING_FORMS} />
        <p>
          Many circuits also require a parenting education class or mediation. Your circuit clerk can tell you what your
          court requires.
        </p>
      </Section>

      <Section id="bring-your-record" title="Bring your record with you">
        <p>
          Every one of these forms asks the same question in a different way: what happened, and when? P.O.P.S. keeps
          your answers dated, organized, and ready, from the first visit you record to the day you stand before a judge.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/desktop-app">Explore POPS Desktop</Link>
          <Link className="btn btn-ghost" to="/lexicon">Learn the language of the court</Link>
        </div>
        <p className="mo-forms-note">
          Form numbers and links come from Missouri Courts and the Department of Health and Senior Services. Forms are
          revised from time to time, so download the current version before filing. This page is general information,
          not legal advice.
        </p>
      </Section>
      <LaunchLinks />
    </LaunchPage>
  );
}
