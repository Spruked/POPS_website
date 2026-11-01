import { Link } from "react-router-dom";
import { ContentSection as Section, LaunchPage, LaunchLinks } from "../components/LaunchContent";

const custodyUrl = "https://revisor.mo.gov/main/OneSection.aspx?section=452.375";
const parentageUrl = "https://revisor.mo.gov/main/OneChapterRng.aspx?tb1=210.817+through+210.852";

function ResearchNavigation({ current }: { current: "custody" | "parentage" }) {
  const other = current === "custody"
    ? { href: "/missouri-fathers-rights/paternity-enforcement", label: "Part 2: Paternity, enforcement & related rights" }
    : { href: "/missouri-fathers-rights", label: "Part 1: Custody law & selected decisions" };
  return <nav className="missouri-research-nav" aria-label="Missouri fathers’ rights research pages">
    <span>{current === "custody" ? "Part 1 of 2" : "Part 2 of 2"}</span>
    <Link className="btn btn-ghost" to={other.href}>{other.label}</Link>
  </nav>;
}

function SourcesNote() {
  return <p className="missouri-source-note">Research checked November 1, 2026 against the linked Missouri Revisor of Statutes and court opinions. Statutes and case law can change; check the current text and subsequent history before relying on a decision.</p>;
}

export function MissouriCustodyPage() {
  return <LaunchPage
    title="Missouri Fathers’ Rights: Custody Law & Selected Decisions | P.O.P.S."
    description="An educational overview of Missouri’s parenting-time presumption, custody factors, written findings, and selected Missouri appellate decisions."
    path="/missouri-fathers-rights"
    eyebrow="Missouri family-law research · Part 1 of 2"
    heading="Missouri Custody Law and Selected Decisions"
    intro="A source-linked overview of Missouri custody law, the equal or approximately equal parenting-time presumption, and selected court decisions. The statutes apply to parents without regard to gender; individual outcomes depend on the facts and current law."
  >
    <ResearchNavigation current="custody" />
    <Section id="missouri-custody-presumption" title="The parenting-time presumption">
      <p>Missouri Revised Statutes § 452.375 directs courts to decide custody according to the child’s best interests and establishes a rebuttable presumption that equal or approximately equal parenting time is in the child’s best interests. The presumption may be rebutted by a preponderance of the evidence under the relevant statutory factors. The statute also addresses agreements on all custody issues and findings of a pattern of domestic violence.</p>
      <p>This is a starting presumption in the statutory analysis, not an automatic guarantee of a 50/50 schedule. The court must apply the statute to the circumstances, including the child’s needs and safety.</p>
      <ul>
        <li><strong>Joint physical custody</strong> means each parent has significant, though not necessarily equal, periods of care.</li>
        <li><strong>Joint legal custody</strong> means shared decision-making authority about the child’s health, education, and welfare, subject to how a court allocates those responsibilities.</li>
        <li>Relevant factors include each parent’s ability and willingness to perform parental functions and which parent is more likely to support the child’s continuing relationship with the other parent.</li>
        <li>When custody is contested, the statute requires written findings addressing the relevant factors and explaining the arrangement selected.</li>
      </ul>
      <p><a href={custodyUrl} target="_blank" rel="noreferrer">Read current RSMo § 452.375 at the Missouri Revisor of Statutes</a>.</p>
    </Section>

    <Section id="missouri-custody-decisions" title="Selected Missouri appellate decisions">
      <p>These decisions illustrate legal questions that have arisen in custody and parentage cases. They are not a prediction of how another case will be decided. Read the full opinion, check its procedural posture, and compare the statute in effect at the time with current law.</p>
      <div className="missouri-case-list">
        <article>
          <h3>Speer v. Colon, 155 S.W.3d 60 (Mo. banc 2005)</h3>
          <p>The Supreme Court of Missouri addressed the written findings required in a contested custody decision and rejected “primary physical custody” as a separate statutory custody category.</p>
          <a href="https://law.justia.com/cases/missouri/supreme-court/2005/sc-86321-1.html" target="_blank" rel="noreferrer">Read the opinion</a>
        </article>
        <article>
          <h3>Bowers v. Bowers, No. SC96545 (Mo. banc 2018)</h3>
          <p>The case involved a mother, a biological father, and a former spouse who had signed a paternity acknowledgment and acted as a parent. The court affirmed a third-party custody judgment on that case’s specific facts; it does not establish that caregiving alone makes someone a legal parent.</p>
          <a href="https://law.justia.com/cases/missouri/supreme-court/2018/sc96545.html" target="_blank" rel="noreferrer">Read the opinion</a>
        </article>
        <article>
          <h3>In the Interest of M.D.R., 124 S.W.3d 469 (Mo. banc 2004)</h3>
          <p>A parental-rights termination case discussing constitutional protections and the statutory process for termination. Termination proceedings use a different legal framework from an ordinary custody dispute.</p>
          <a href="https://law.justia.com/cases/missouri/supreme-court/2004/sc-85208-1.html" target="_blank" rel="noreferrer">Read the opinion</a>
        </article>
        <article>
          <h3>Weigand v. Edwards, 296 S.W.3d 453 (Mo. banc 2009)</h3>
          <p>The Supreme Court upheld the then-current statutory bond requirement for a parent with more than $10,000 in past-due support seeking custody modification. This is a historical ruling on the statute then in effect; check current law before relying on it.</p>
          <a href="https://law.justia.com/cases/missouri/supreme-court/2009/33686.html" target="_blank" rel="noreferrer">Read the opinion</a>
        </article>
      </div>
    </Section>

    <Section id="missouri-custody-case-index" title="More decisions to review">
      <ul>
        <li><em>Sewell-Davis v. Franklin</em>, 174 S.W.3d 58 (Mo. App. W.D. 2005) — custody findings and statutory factors.</li>
        <li><a href="https://law.justia.com/cases/missouri/court-of-appeals/2020/ed107697.html" target="_blank" rel="noreferrer"><em>T.J.E. v. M.R.M.</em>, 592 S.W.3d 399 (Mo. App. E.D. 2020)</a> — custody findings in a modification proceeding originating from a paternity action.</li>
        <li><em>Reno v. Gonzales</em>, 489 S.W.3d 900 (Mo. App. W.D. 2016) — custody standards in a paternity action.</li>
        <li><a href="https://www.courts.mo.gov/file.jsp?id=220831" target="_blank" rel="noreferrer"><em>J.W. by K.C.G. v. N.R.W.</em>, 695 S.W.3d 231 (Mo. App. W.D. 2024)</a> — paternity judgment, custody, and decision-making provisions.</li>
        <li><a href="https://caselaw.findlaw.com/court/mo-court-of-appeals/116696780.html" target="_blank" rel="noreferrer"><em>Irving v. Angstrom</em>, No. WD86648 (Mo. App. W.D. 2024)</a> — custody and parenting plan issues in a paternity action.</li>
        <li><em>Jefferson v. Jefferson</em>, No. ED83583 (Mo. App. E.D. 2004) — limits on treating a non-biological, non-adoptive caregiver as a legal parent.</li>
      </ul>
      <p>Older opinions may interpret earlier versions of § 452.375. For example, the current section reflects amendments effective August 28, 2024. Do not assume an older opinion states the current rule without checking later statutes and cases.</p>
      <p><a href="https://revisor.mo.gov/main/OneSection.aspx?section=452.375" target="_blank" rel="noreferrer">Check the current statute and its annotations</a>.</p>
    </Section>

    <SourcesNote />
    <ResearchNavigation current="custody" />
    <LaunchLinks />
  </LaunchPage>;
}

export function MissouriParentagePage() {
  return <LaunchPage
    title="Missouri Fathers’ Rights: Paternity & Parenting-Time Enforcement | P.O.P.S."
    description="An educational guide to Missouri paternity establishment, parenting-time enforcement, modification, relocation notice, and related parental protections."
    path="/missouri-fathers-rights/paternity-enforcement"
    eyebrow="Missouri family-law research · Part 2 of 2"
    heading="Paternity, Parenting-Time Enforcement and Related Rights"
    intro="Legal fatherhood, a parenting-time order, and day-to-day involvement are related but distinct. This page links to Missouri statutes addressing paternity, enforcement, modification, relocation, and school information."
  >
    <ResearchNavigation current="parentage" />
    <Section id="missouri-paternity" title="Establishing the father-child relationship">
      <p>For unmarried parents, biological evidence, a signed acknowledgment, a court judgment, and an existing custody order are not interchangeable. The Missouri Uniform Parentage Act describes how a legal parent-child relationship may be established and challenged.</p>
      <ul>
        <li><a href="https://revisor.mo.gov/main/OneSection.aspx?section=210.818" target="_blank" rel="noreferrer">§ 210.818</a> states that the parent-child relationship is not dependent on the parents’ marriage.</li>
        <li><a href="https://revisor.mo.gov/main/OneSection.aspx?section=210.822" target="_blank" rel="noreferrer">§ 210.822</a> describes circumstances creating a presumption of paternity and how it may be rebutted.</li>
        <li><a href="https://revisor.mo.gov/main/OneSection.aspx?section=210.823" target="_blank" rel="noreferrer">§ 210.823</a> treats a signed acknowledgment as a legal finding of paternity, with a limited rescission period and later challenges on specified grounds.</li>
        <li><a href="https://revisor.mo.gov/main/OneSection.aspx?section=210.826" target="_blank" rel="noreferrer">§ 210.826</a> identifies who may bring an action to determine a father-child relationship, including a man alleging himself to be the father, subject to statutory requirements.</li>
        <li><a href="https://revisor.mo.gov/main/OneSection.aspx?section=210.834" target="_blank" rel="noreferrer">§ 210.834</a> addresses genetic testing in paternity proceedings.</li>
      </ul>
      <p>After parentage is established, custody and parenting time are determined under the applicable statutes and orders. Competing legal presumptions, prior acknowledgments, deadlines, and service requirements can change the analysis.</p>
      <p><a href={parentageUrl} target="_blank" rel="noreferrer">Browse the Missouri Uniform Parentage Act, §§ 210.817–210.852</a>.</p>
    </Section>

    <Section id="missouri-enforcement" title="Enforcing an existing parenting-time order">
      <p>RSMo § 452.400 provides procedures for addressing interference with court-ordered custody or visitation. A family access motion must identify specific facts showing a violation of the judgment. The remedies below are available only when statutory requirements are met and the court makes the required findings.</p>
      <ul>
        <li>Compensatory parenting time at least equal to the period denied.</li>
        <li>Counseling, a fine of up to $500 payable to the aggrieved party, or a bond or security requirement.</li>
        <li>Reasonable expenses and attorney fees may be assessed under the conditions in the statute.</li>
        <li>The statute generally calls for final disposition within 60 days after service, subject to waiver or a determination that more time is in the child’s best interest.</li>
      </ul>
      <p>A missed exchange or disagreement does not by itself establish a violation or prove that a parent acted without good cause. Read the order and the complete statute before taking action.</p>
      <p><a href="https://revisor.mo.gov/main/OneSection.aspx?section=452.400" target="_blank" rel="noreferrer">Read current RSMo § 452.400</a>.</p>
    </Section>

    <Section id="missouri-modification-relocation" title="Modification, relocation and school information">
      <h3>Custody modification · § 452.410</h3>
      <p>A court generally may modify a prior custody decree when it has jurisdiction and finds, based on new or previously unknown facts, a change in the circumstances of the child or custodian and that modification is necessary to serve the child’s best interests. The statute has additional terms and exceptions.</p>
      <p><a href="https://revisor.mo.gov/main/OneSection.aspx?section=452.410" target="_blank" rel="noreferrer">Read § 452.410</a>.</p>
      <h3>Relocation · § 452.377</h3>
      <p>For a qualifying relocation of a child’s principal residence for 90 days or more, the statute generally requires written notice at least 60 days in advance. A parent seeking to prevent the move generally must file a motion within 30 days after receiving notice. The statute provides specific required notice content, procedures, and exceptions.</p>
      <p><a href="https://revisor.mo.gov/main/OneSection.aspx?section=452.377" target="_blank" rel="noreferrer">Read § 452.377</a>.</p>
      <h3>School progress reports · § 452.376</h3>
      <p>Qualifying noncustodial parents and parents with joint custody may request school progress reports, subject to the statutory conditions and exceptions.</p>
      <p><a href="https://revisor.mo.gov/main/OneSection.aspx?section=452.376" target="_blank" rel="noreferrer">Read § 452.376</a>.</p>
    </Section>

    <Section id="missouri-constitutional-cases" title="Federal constitutional decisions">
      <p>These U.S. Supreme Court decisions address parental interests in different legal contexts. They do not create an automatic custody schedule or replace Missouri’s statutes:</p>
      <ul>
        <li><a href="https://supreme.justia.com/cases/federal/us/405/645/" target="_blank" rel="noreferrer"><em>Stanley v. Illinois</em>, 405 U.S. 645 (1972)</a> — individualized process before the state separates an unmarried father from his children.</li>
        <li><a href="https://supreme.justia.com/cases/federal/us/455/745/" target="_blank" rel="noreferrer"><em>Santosky v. Kramer</em>, 455 U.S. 745 (1982)</a> — evidentiary standard in state termination-of-parental-rights proceedings.</li>
        <li><a href="https://supreme.justia.com/cases/federal/us/463/248/" target="_blank" rel="noreferrer"><em>Lehr v. Robertson</em>, 463 U.S. 248 (1983)</a> — constitutional protections for an unmarried biological father depend in part on the opportunity to develop a relationship and his actions to assume parental responsibility.</li>
        <li><a href="https://supreme.justia.com/cases/federal/us/530/57/" target="_blank" rel="noreferrer"><em>Troxel v. Granville</em>, 530 U.S. 57 (2000)</a> — recognizes the fundamental liberty interest of fit parents in the care, custody, and control of their children in the context of a nonparent visitation law.</li>
      </ul>
    </Section>

    <Section id="missouri-recordkeeping" title="What a careful record can and cannot do">
      <p>A dated chronology can help someone review scheduled exchanges, communications, notices, and what the parent personally observed. Keep original source material where possible, distinguish firsthand observations from assumptions, and record uncertainty honestly.</p>
      <p>Documentation does not decide whether an order was violated, establish that a claim is true, or guarantee a court outcome. POPS is a recordkeeping tool, not legal advice or a substitute for a Missouri attorney.</p>
    </Section>

    <SourcesNote />
    <ResearchNavigation current="parentage" />
    <LaunchLinks />
  </LaunchPage>;
}
