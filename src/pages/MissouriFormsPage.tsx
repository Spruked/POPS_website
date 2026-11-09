import { Link } from "react-router-dom";
import { ContentSection as Section, LaunchLinks, LaunchPage } from "../components/LaunchContent";

type Form = { name: string; does: string; href?: string; linkLabel?: string };

const COURT_FORMS = "https://www.courts.mo.gov/page.jsp?id=103116";

function FormList({ forms }: { forms: Form[] }) {
  return (
    <ul className="mo-forms-list">
      {forms.map((form) => (
        <li key={form.name}>
          <strong>
            {form.href ? (
              <a href={form.href} target="_blank" rel="noopener noreferrer">{form.name}{form.linkLabel ? ` (${form.linkLabel})` : ""}</a>
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
  { name: "Affidavit Acknowledging Paternity", does: "Both parents sign, usually at the hospital. It is a legal finding of paternity, though either parent can rescind it within a limited window. It is not a custody order.", href: "https://health.mo.gov/vital-records-registries/vital-records/correctamend-vital-record" },
  { name: "Notice of Intent to Claim Paternity (MO 580-2224)", does: "Registers a claim of possible paternity; it does not itself establish legal paternity or guarantee notice or participation in an adoption. Adoption-related deadlines can be as short as 15 days after birth, and registration alone may be insufficient: Missouri law also specifies paternity-action and other requirements, with limited exceptions. If adoption is possible, seek Missouri legal assistance immediately. See RSMo 453.030 and 192.016.", href: "https://health.mo.gov/form-library?page=2" },
  { name: "Revocation of Notice of Intent to Claim Paternity", does: "Withdraws a registry notice. Notarized.", href: "https://health.mo.gov/vital-records-registries/vital-records/correctamend-vital-record" },
];

const PATERNITY_PACKET: Form[] = [
  { name: "Father’s paternity forms packet", does: "Official Missouri Courts packet; check its current instructions and required forms with the court.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf" },
  { name: "CAFC301 Father's Petition for Declaration of Paternity, Custody and Support", does: "The main petition. Asks the court to declare you the legal father and set custody and support in one case.", href: "https://www.courts.mo.gov/file.jsp?id=114780" },
  { name: "CAFC501 Parenting Plan (Parts A and B)", does: "Your proposed schedule (Part A) and support terms (Part B).", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet or forms page" },
  { name: "CAFC250 Income and Expense Statement", does: "Income and expenses for both parents.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet or forms page" },
  { name: "CAFC240 Property and Debt Statement", does: "Property and debts.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet or forms page" },
  { name: "Additional forms for children or presumed fathers", does: "Confirm with the court whether any additional forms are needed for children or other legally presumed fathers; these requirements vary.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet or forms page" },
  { name: "CAFC311 Answer to Father’s Paternity Petition", does: "The other parent's response form, included with the papers you serve.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet or forms page" },
  { name: "CAFC721 Notice of Hearing", does: "Gives parties notice of a hearing after the court has provided a date under local scheduling procedures; filing this form does not itself schedule a hearing.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet or forms page" },
  { name: "CAFC370 Proposed Paternity Judgment", does: "The proposed judgment you offer the court.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet or forms page" },
  { name: "FI-10 Confidential Case Filing Information Sheet and GN320 Redaction Certification", does: "Confidential filing and redaction requirements may apply; consult the court’s current instructions.", href: "https://www.courts.mo.gov/page.jsp?id=103116", linkLabel: "official packet or forms page" },
];

const CUSTODY_FORMS: Form[] = [
  { name: "CAFC201 Petition for Child Custody", does: "For fathers whose paternity is already established but who have no custody order. Filed in the court that entered the paternity order, if there is one.", href: "https://www.courts.mo.gov/page.jsp?id=38351" },
  { name: "CAFC501 Parenting Plan", does: "Your proposed parenting schedule. Missouri law includes a rebuttable presumption favoring equal or approximately equal parenting time, subject to statutory exceptions and the child’s best interests.", href: "https://www.courts.mo.gov/file/FathersPaternityPetitionPackage-v3bs.pdf", linkLabel: "official packet" },
  { name: "Financial statements and Civil Procedure Form 14", does: "Income, expenses, property, debt, and applicable child support calculation forms. Confirm which are required for your case.", href: "https://www.courts.mo.gov/page.jsp?id=103116", linkLabel: "official forms page" },
];

const ENFORCE_FORMS: Form[] = [
  { name: "FA10 Motion for Family Access Order", does: "Asks the court to remedy denied or interfered-with parenting time, including make-up time at least equal to the time you lost. The clerk issues a summons within five court days, and the court decides within 60 days of service unless waived.", href: "https://www.courts.mo.gov/file.jsp?id=701" },
  { name: "FA35 Response to Motion for Family Access Order", does: "The other parent’s response form; check the current family-access packet.", href: "https://www.courts.mo.gov/page.jsp?id=103116", linkLabel: "official forms page" },
  { name: "Verified motion for contempt", does: "A possible enforcement route; ask your circuit clerk or a Missouri attorney about locally applicable requirements.", href: "https://www.courts.mo.gov/page.jsp?id=103116", linkLabel: "official forms page" },
];

const MODIFY_FORMS: Form[] = [
  { name: "CAFC101 Motion to Modify Child Custody and Support", does: "Asks the court to change an existing order when circumstances have substantially changed.", href: "https://www.courts.mo.gov/page.jsp?id=38347" },
  { name: "CAFC111-R Answer to Motion to Modify", does: "The other parent's response form.", href: "https://www.courts.mo.gov/file.jsp?id=45462", linkLabel: "official modification packet" },
  { name: "CAFC140 and CAFC150 Financial Statements", does: "Property, debt, income, and expenses for a modification.", href: "https://www.courts.mo.gov/file.jsp?id=45462", linkLabel: "official modification packet" },
  { name: "CAFC501 Parenting Plan and CAFC170 Judgment for Modification", does: "Your proposed new schedule and proposed judgment.", href: "https://www.courts.mo.gov/file.jsp?id=45462", linkLabel: "official modification packet" },
];

const PROTECTION_FORMS: Form[] = [
  { name: "Petition for a Court Order of Protection – Child (CP40)", does: "Filed on behalf of a child to stop abuse, stalking, or sexual assault.", href: "https://www.courts.mo.gov/page.jsp?id=383" },
  { name: "Petition for a Court Order of Protection – Adult (AA40)", does: "Protection from another adult. It can also ask for temporary custody of children.", href: "https://www.courts.mo.gov/page.jsp?id=533" },
  { name: "Motions for renewal (AA25 / CP25)", does: "Request renewal of an eligible full order of protection; confirm the current court form and deadline.", href: "https://www.courts.mo.gov/page.jsp?id=103116", linkLabel: "official forms page" },
];

const SUPPORTING_FORMS: Form[] = [
  { name: "GN10 Motion and Affidavit to Proceed as a Poor Person", does: "Asks the court to waive filing fees.", href: "https://www.courts.mo.gov/file.jsp?id=84216" },
  { name: "Litigant Awareness Program certificate", does: "Required for certain self-represented family proceedings, including cases specified by Missouri Rule 88.09 and relevant court packets. Not a prerequisite to seeking an emergency protection order. Check the requirements for your specific case.", href: "https://www.courts.mo.gov/page.jsp?id=5240" },
  { name: "FI-10, GN320 and GN325", does: "The confidential filing sheet, redaction certification, and motion to correct a redaction.", href: "https://www.courts.mo.gov/page.jsp?id=103116", linkLabel: "official forms page" },
];

export default function MissouriFormsPage() {
  return (
    <LaunchPage
      title="Missouri Court Forms for Fathers | Paternity, Custody & Parenting Time | POPS"
      description="A guide to Missouri paternity, custody, parenting-time, modification, and protection forms, with links to official court resources."
      path="/missouri-forms"
      eyebrow="Know your path • Missouri"
      heading="Find Missouri court forms for your situation."
      intro="Missouri provides official self-representation forms for many family-law matters. Required forms, filing procedures, and local court rules can vary. Find your situation and check the current court instructions before filing."
    >
      <aside className="mo-forms-state-note" aria-labelledby="other-states-title">
        <h2 id="other-states-title">Not in Missouri? We'll help you find your forms.</h2>
        <p>
          Family laws and court forms are different in every state. This page covers Missouri. If you live somewhere else
          and need help finding your state's matching forms or documents, contact POPS and we'll help where we can.
        </p>
        <Link className="btn btn-primary" to="/support">Contact POPS</Link>
      </aside>

      <Section id="find-your-path" title="Find your path">
        <ul className="mo-forms-paths">
          {PATHS.map((path) => (
            <li key={path.anchor}>
              {path.situation} → <a href={path.anchor}>{path.label}</a>
            </li>
          ))}
        </ul>
        <p>
          Representing yourself? The Litigant Awareness Program applies to certain proceedings; confirm whether your case requires it. Official forms are
          available at <a href={COURT_FORMS} target="_blank" rel="noopener noreferrer">courts.mo.gov</a> and from your
          circuit clerk.
        </p>
      </Section>

      <Section id="establish-paternity" title="Establish paternity">
        <p>
          Legal paternity and custody are separate legal questions. An acknowledgment of paternity does not by itself establish custody or parenting time.
        </p>
        <h3>With the Bureau of Vital Records</h3>
        <FormList forms={VITAL_RECORDS} />
        <p className="mo-forms-note">For adoption-related claims, read <a href="https://revisor.mo.gov/main/OneSection.aspx?section=453.030" target="_blank" rel="noopener noreferrer">RSMo 453.030</a> and <a href="https://revisor.mo.gov/main/OneSection.aspx?section=192.016" target="_blank" rel="noopener noreferrer">RSMo 192.016</a>. Do not assume submitting a registry notice alone preserves your rights.</p>
        <h3>In court: the Father's Paternity Forms packet</h3>
        <FormList forms={PATERNITY_PACKET} />
      </Section>

      <Section id="custody-case" title="Start a custody case">
        <p>
          After legal paternity is established, you may need a separate custody or parenting-time order. Missouri law includes
          a rebuttable presumption favoring equal or approximately equal parenting time, subject to statutory exceptions and the child’s best interests.
        </p>
        <FormList forms={CUSTODY_FORMS} />
        <p>
          Depending on the circumstances, temporary custody or parenting-time orders may be available while a case is pending. Married fathers
          who are separated use the dissolution or legal separation forms on the same Missouri Courts page.
        </p>
      </Section>

      <Section id="enforce-order" title="Enforce your order">
        <p>
          If court-ordered parenting time is denied, a motion for a family access order may be available. Review the eligibility rules and filing instructions before using it.
        </p>
        <FormList forms={ENFORCE_FORMS} />
        <p>Your circuit clerk can confirm that your order qualifies and explain local filing steps.</p>
      </Section>

      <Section id="change-order" title="Change your order">
        <FormList forms={MODIFY_FORMS} />
      </Section>

      <Section id="protection" title="Protection orders">
        <p>
          If anyone is in immediate danger, call 911. Missouri provides protection-order procedures for qualifying allegations of abuse, stalking, or sexual assault. You may apply without an attorney; filing fees are generally waived for these petitions.
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
          Form numbers and links refer to Missouri Courts and the Department of Health and Senior Services. Some links open official packets or forms directories rather than an individual document. Confirm current forms, deadlines, service, and local court requirements before filing. This page provides general information, not legal advice.
        </p>
      </Section>
      <LaunchLinks />
    </LaunchPage>
  );
}
