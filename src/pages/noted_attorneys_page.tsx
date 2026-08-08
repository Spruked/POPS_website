import { Link } from "react-router-dom";
import PageSeo from "../components/PageSeo";

export default function NotedAttorneysPage() {
  return (
    <div style={{ paddingTop: 88 }}>
      <PageSeo
        title="POPS Noted Counsel | Merit Recognition"
        description="POPS Noted Counsel is a positive-only merit recognition page for attorneys recognized by POPS users for professional, respectful, and useful help."
        path="/attorney-referral"
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="section-header">
            <span className="mono">POPS NOTED COUNSEL</span>
            <h1>Noted Counsel</h1>
            <p>
              Positive-only merit recognition from POPS Noted Users.
            </p>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h2>No Rank. No Referral. Only Merit.</h2>

            <p>
              POPS Noted Counsel is a positive-only merit-recognition page for
              attorneys who made a meaningful positive impression on a POPS user.
            </p>

            <p>
              Recognition may reflect professionalism, honesty, preparation,
              respectful treatment, clear communication, or meaningful service to
              a parent trying to stay present and organized for their child.
            </p>

            <hr />

            <h3>What This Is</h3>

            <p>
              POPS Noted Counsel exists to preserve and share carefully moderated
              positive recognition from real POPS users who had a direct,
              first-hand experience with an attorney.
            </p>

            <p>
              It is meant to recognize merit—not popularity, advertising budget,
              status, or influence.
            </p>

            <hr />

            <h3>What This Is Not</h3>

            <ul>
              <li>Not an attorney ranking system</li>
              <li>Not a star-rating or score-based review page</li>
              <li>Not a paid attorney directory</li>
              <li>Not a referral service or lead-generation program</li>
              <li>Not a “best attorney” list</li>
              <li>Not a public complaint board</li>
              <li>Not a guarantee that an attorney will accept a case or achieve a result</li>
            </ul>

            <hr />

            <h3>Recognition Rules</h3>

            <ul>
              <li>Only POPS Noted Users may submit a Merit Recognition.</li>
              <li>Attorneys cannot nominate themselves.</li>
              <li>Attorneys cannot buy recognition, placement, or visibility.</li>
              <li>There are no stars, scores, ranks, tiers, or “top attorney” labels.</li>
              <li>POPS does not publish negative reviews, attacks, or public disputes.</li>
              <li>Recognition must come from a real, first-hand positive experience.</li>
              <li>Private case information, child information, and outcome claims are not published.</li>
            </ul>

            <hr />

            <h3>What Merit Can Look Like</h3>

            <p>
              A POPS user may recognize an attorney for treating them with dignity,
              clearly explaining options, being honest about costs and limits,
              reviewing organized materials carefully, using a POPS timeline or
              packet effectively, or helping a parent understand what mattered next.
            </p>

            <p>
              A Noted Counsel recognition does not claim that an attorney is
              superior to another attorney. It does not promise a legal result,
              availability, affordability, or case acceptance.
            </p>

            <hr />

            <h3>Why POPS Built This</h3>

            <p>
              POPS helps fathers and parents arrive more prepared—with clearer
              timelines, preserved records, factual notes, and organized materials
              for professional review.
            </p>

            <p>
              When a POPS user is genuinely helped by an attorney who shows merit,
              that attorney may be recognized here with dignity and without turning
              the process into advertising, rankings, or referral money.
            </p>

            <p>
              <strong>
                Noted by users. Never bought. Never ranked. Recognized only for merit.
              </strong>
            </p>

            <div
              className="hero-actions"
              style={{ justifyContent: "center", marginTop: 28 }}
            >
              <Link to="/" className="btn btn-ghost">
                Back to Landing
              </Link>

              <Link to="/pricing" className="btn btn-primary">
                Get POPS
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
