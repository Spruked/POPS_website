import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";

const ARTICLES = [
  {
    number: "Article I",
    title: "On the Origin of the Charge",
    body: "The duty of a man to protect his household is not granted by any government, council, or institution of man. It precedes them all. It was given at the founding of the family itself, and it answers to a higher authority than any badge or statute. What the State formalizes as protective services, the home has always practiced as the first and oldest service of all.",
  },
  {
    number: "Article II",
    title: "On the Nature of Presence",
    body: "Protection is not an event. It is a condition. A man does not become a protector in the moment of crisis. He either was one in every ordinary moment before it, or he was not. Proof of Presence is not proof that he showed up when it mattered. It is proof that he never left.",
  },
  {
    number: "Article III",
    title: "On the Limits of Outside Help",
    body: "We do not despise the C.O.P.S. We honor them, we call them, we cooperate with them. But we do not outsource the charge to them. There is a gap between the call and the arrival, between the danger and the response, and in that gap a family is either covered or it is not. The P.O.P.S. exists in that gap. Always has. Always will.",
  },
  {
    number: "Article IV",
    title: "On Rights Inseparable from Responsibility",
    body: "The right to protect one's household is inseparable from the responsibility to do so. A right not exercised becomes a duty unmet. We claim no privilege we are not also prepared to discharge in full: in vigilance, in provision, in defense, and in sacrifice if it is asked of us.",
  },
  {
    number: "Article V",
    title: "On Record and Witness",
    body: "What is unrecorded is too easily denied, and what is undefended is too easily forgotten. The P.O.P.S. system exists not to glorify the watchman, but to ensure that his presence, his diligence, his decisions, and his care can be proven when proof is needed. Truth protected. Evidence verified. Integrity that does not depend on anyone's memory but stands on its own record.",
  },
  {
    number: "Article VI",
    title: "On the Permanence of the Office",
    body: "Titles change. Employers change. Circumstances change. The office of protector, once accepted, does not retire, resign, or expire. A man may lay down many things in life. This is not one of them.",
  },
];

export default function DeclarationPage() {
  return (
    <div className="document-page">
      <PageSeo
        title="The POPS Declaration | First Order of Protection"
        description="The POPS Declaration defines fathers as the First Order of Protection through presence, evidence, guardianship, and record keeping."
        path="/declaration"
      />
      <section className="document-hero">
        <img src="/popsbadge.png" alt="POPS badge" className="document-crest" />
        <span className="mono">Proof of Presence System</span>
        <h1>The P.O.P.S. Declaration</h1>
        <p>First Order of Protection and Service</p>
      </section>

      <section className="document-body">
        <section className="document-framing">
          <div className="document-rule"><span>Mission Statement</span></div>
          <p className="document-lede">
            POPS - the Proof of Presence System - exists to restore men to their God-given appointment as the First Order of Protection in the home.
          </p>
          <p>
            It equips fathers with the discipline, record-keeping, and truth-preserving tools needed to stand watch over their families, remain accountable in conflict, and protect what has been entrusted to them. POPS strengthens the man, safeguards the record, and preserves the truth when presence is questioned, challenged, or denied.
          </p>
          <p>
            POPS is not a support group. It is a <strong>support machine</strong> - built to keep a man aligned, sober-minded, and anchored to his calling, even in the hardest seasons of fatherhood.
          </p>

          <div className="document-rule"><span>About This Declaration</span></div>
          <p>
            <strong>The P.O.P.S. Declaration is the foundational document of the First Order of Protection.</strong> It is not a policy, a slogan, or a motivational speech. It is the formal articulation of what men have always been in the home: the first responder, the first defender, the first witness, and the first line of protection long before institutions existed.
          </p>
          <p>
            This Declaration defines the charge, the duty, and the office of the father - not as a cultural role, but as a God-given appointment. It affirms the rights, responsibilities, and presence of the man who stands between his family and the dark, and calls that role by its true name: <strong>P.O.P.S. - Proof of Presence System.</strong>
          </p>
        </section>

        <div className="document-rule"><span>Preamble</span></div>

        <p className="document-lede">
          When in the course of a family's life, danger does not announce itself, when the call for help cannot wait for sirens, when the wolf is at the door and the door is the only thing between the wolf and the children, there must stand, in that gap, a man.
        </p>

        <p>Not a badge. Not a uniform. A father.</p>

        <p>
          Before there were Courts of Protection Services, before there were County Officers of Public Safety, before any institution wore the name of guardian, there was the man of the house, standing watch, armed with nothing but resolve and the authority given to him by his Creator.
        </p>

        <p>
          We call this what it has always been: <strong>P.O.P.S. - Proof of Presence System. The First Order of Protection and Service.</strong>
        </p>

        <p>
          This is not a replacement for law. This is the foundation law was built upon. When the C.O.P.S. cannot get there in time, and there will be moments they cannot, the P.O.P.S. is already there. He was never not there. That is the whole of the charge.
        </p>

        <blockquote>
          We hold these truths to be self-evident, God-given, and undeniable: that every father is entrusted with rights, privileges, and responsibilities that no government granted and no government may revoke; that presence is not passive but is itself a duty; and that a man who stands watch over his household stands in an office older than nations.
        </blockquote>

        <div className="document-rule"><span>The Articles</span></div>

        <div className="article-list">
          {ARTICLES.map((article) => (
            <article className="declaration-article" key={article.number}>
              <span>{article.number}</span>
              <h2>{article.title}</h2>
              <p>{article.body}</p>
            </article>
          ))}
        </div>

        <div className="document-signature">
          Filed under the authority of every man who has ever stood between his family and the dark, and called it nothing more than Tuesday.
        </div>

        <section className="doctrine-cta">
          <p className="eyebrow">From Philosophy to Practice</p>
          <h2>Proof of Presence requires a record.</h2>
          <p>
            The P.O.P.S. Declaration establishes the standard. The desktop application helps preserve evidence, organize timelines, verify files with SHA-256 integrity, and prepare a court-safe record for attorney review.
          </p>
          <Link className="btn btn-primary" to="/access">Get P.O.P.S.</Link>
        </section>
      </section>
    </div>
  );
}
