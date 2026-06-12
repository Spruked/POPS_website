import { Link, useParams } from "react-router-dom";
import PageSeo from "../components/PageSeo";
import { WEBSITE_LEXICON } from "../data/popsLexicon";

export default function LexiconPage() {
  const { slug } = useParams();
  const selectedEntry = slug ? WEBSITE_LEXICON.find((entry) => entry.slug === slug) : undefined;
  const entries = selectedEntry ? [selectedEntry] : WEBSITE_LEXICON;
  const title = selectedEntry ? `POPS Lexicon: ${selectedEntry.term}` : "POPS Lexicon | Court-Safe Evidence Language";
  const description = selectedEntry
    ? selectedEntry.metaDescription
    : "The POPS Lexicon explains court-safe evidence language, key legal terms, annotations, highlights, and factual wording.";
  const path = selectedEntry ? `/lexicon/${selectedEntry.slug}` : "/lexicon";
  const image = selectedEntry ? `https://pops.spruked.com/og/lexicon-${selectedEntry.slug}.svg` : undefined;

  return (
    <div className="document-page">
      <PageSeo title={title} description={description} path={path} image={image} />
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

        {selectedEntry && (
          <p>
            <Link to="/lexicon" className="inline-link">Back to full Lexicon</Link>
          </p>
        )}

        <div className="lexicon-document-list">
          {entries.map((entry) => (
            <article className="lexicon-document-card" key={entry.term}>
              <div className="lexicon-document-heading">
                <h2>{selectedEntry ? entry.term : <Link to={`/lexicon/${entry.slug}`}>{entry.term}</Link>}</h2>
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
