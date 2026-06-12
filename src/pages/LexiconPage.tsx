import { WEBSITE_LEXICON } from "../data/popsLexicon";

export default function LexiconPage() {
  return (
    <div className="document-page">
      <section className="document-hero">
        <img src="/popsbadge.png" alt="POPS badge" className="document-crest" />
        <span className="mono">Court Language Guide</span>
        <h1>POPS Lexicon</h1>
        <p>Plain-English courtroom terms for disciplined records and court-safe language.</p>
      </section>

      <section className="document-body">
        <div className="document-rule"><span>Core Court Terms</span></div>
        <p className="document-lede">
          POPS helps users recognize courtroom language, understand it in plain English, and preserve facts in a clear, organized way.
        </p>
        <p>
          Some terms may carry legal significance and should be reviewed carefully before they are used in a report, packet, or filing.
        </p>

        <div className="lexicon-document-list">
          {WEBSITE_LEXICON.map((entry) => (
            <article className="lexicon-document-card" key={entry.term}>
              <div className="lexicon-document-heading">
                <h2>{entry.term}</h2>
                <span className={`lexicon-sensitivity ${entry.sensitivity.toLowerCase()}`}>{entry.sensitivity} Sensitivity</span>
              </div>
              <p><strong>Plain-English meaning:</strong> {entry.meaning}</p>
              <p><strong>POPS use:</strong> {entry.popsUse}</p>
              <p><strong>Court-safe example:</strong> {entry.example}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
