import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import PageSeo from "../components/PageSeo";
import {
  WEBSITE_LEXICON,
  WEBSITE_LEXICON_RULES,
  WEBSITE_LEXICON_VALIDATION,
} from "../data/popsLexicon";
import { LEXICON_VALIDATION_FAILURE_MESSAGE } from "../data/validatePopsLexicon";

type QuickFilter =
  | "all"
  | "high_sensitivity"
  | "evidence"
  | "court_procedure"
  | "constitutional";

function formatCategory(category: string) {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function quickFilterLabel(filter: QuickFilter) {
  const labels: Record<QuickFilter, string> = {
    all: "All Terms",
    high_sensitivity: "High Sensitivity",
    evidence: "Evidence",
    court_procedure: "Court Procedure",
    constitutional: "Constitutional",
  };

  return labels[filter];
}

export default function LexiconPage() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const selectedEntry = slug
    ? WEBSITE_LEXICON.find((entry) => entry.slug === slug)
    : undefined;

  const title = selectedEntry
    ? `POPS Lexicon: ${selectedEntry.term}`
    : "POPS Lexicon | Court-Safe Evidence Language";

  const description = selectedEntry
    ? selectedEntry.metaDescription
    : "Search the POPS Lexicon for plain-English courtroom terms, evidence language, factual rewrite guidance, and court-safe recordkeeping explanations.";

  const path = selectedEntry ? `/lexicon/${selectedEntry.slug}` : "/lexicon";

  const image = selectedEntry
    ? `https://pops.spruked.com/og/lexicon-${selectedEntry.slug}.svg`
    : undefined;

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return WEBSITE_LEXICON.filter((entry) => {
      const matchesQuickFilter = (() => {
        switch (quickFilter) {
          case "high_sensitivity":
            return entry.sensitivity === "High";

          case "evidence":
            return entry.category === "evidence";

          case "court_procedure":
            return entry.category === "court_procedure";

          case "constitutional":
            return entry.category.startsWith("constitutional");

          case "all":
          default:
            return true;
        }
      })();

      if (!matchesQuickFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        entry.term,
        entry.slug,
        entry.category,
        entry.sensitivity,
        entry.meaning,
        entry.whyItMatters,
        entry.popsUse,
        entry.example,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [quickFilter, searchQuery]);

  const entriesToDisplay = selectedEntry ? [selectedEntry] : filteredEntries;

  const groupedEntries = entriesToDisplay.reduce<
    Record<string, (typeof WEBSITE_LEXICON)[number][]>
  >((groups, entry) => {
    groups[entry.category] = groups[entry.category] || [];
    groups[entry.category].push(entry);
    return groups;
  }, {});

  const clearSearch = () => {
    setSearchQuery("");
    setQuickFilter("all");
  };

  const hasActiveSearch = searchQuery.trim() !== "" || quickFilter !== "all";

  const quickFilters: QuickFilter[] = [
    "all",
    "high_sensitivity",
    "evidence",
    "court_procedure",
    "constitutional",
  ];

  return (
    <div className="document-page">
      <PageSeo title={title} description={description} path={path} image={image} />

      <section className="document-hero">
        <img src="/popsbadge.png" alt="POPS badge" className="document-crest" />
        <span className="mono">Court Language Guide</span>
        <h1>POPS Lexicon</h1>
        <p>
          Plain-English courtroom terms, evidence language, and factual rewrite
          guidance for parents building disciplined records.
        </p>
      </section>

      <section className="document-body">
        <div className="document-rule">
          <span>Core Court Terms</span>
        </div>

        <p className="document-lede">
          POPS helps users recognize courtroom language, understand it in plain
          English, and preserve facts in a clear, organized way.
        </p>

        <p>
          This guide is educational. It can help you understand terms you may
          encounter in court documents, hearings, attorney conversations, or
          case records. It does not replace legal advice or determine what
          should be filed in court.
        </p>

        <p>
          <strong>Rewrite guidance:</strong>{" "}
          {WEBSITE_LEXICON_RULES.rewrite_strategy.join(" ")}
        </p>

        {selectedEntry ? (
          <p style={{ marginTop: 28 }}>
            <Link to="/lexicon" className="inline-link">
              ← Back to the full POPS Lexicon
            </Link>
          </p>
        ) : (
          <section
            aria-label="Search POPS Lexicon"
            style={{
              marginTop: 30,
              marginBottom: 30,
              padding: 20,
              borderTop: "1px solid rgba(255,255,255,0.16)",
              borderBottom: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            <label
              htmlFor="lexicon-search"
              style={{
                display: "block",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              Search the POPS Lexicon
            </label>

            <input
              id="lexicon-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search a term or phrase..."
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 15px",
                borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.28)",
                background: "rgba(0,0,0,0.18)",
                color: "inherit",
                fontSize: "1rem",
              }}
            />

            <div
              aria-live="polite"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                marginTop: 14,
                color: "rgba(235,241,255,0.76)",
                fontSize: "0.94rem",
              }}
            >
              <strong style={{ color: "inherit" }}>
                Showing {filteredEntries.length} of {WEBSITE_LEXICON.length}
              </strong>
              <span>terms</span>
              <span aria-hidden="true">·</span>
              <span>Court-safe explanations</span>
              <span aria-hidden="true">·</span>
              <span>Educational only</span>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 9,
                marginTop: 17,
              }}
            >
              {quickFilters.map((filter) => {
                const isActive = quickFilter === filter;

                return (
                  <button
                    type="button"
                    key={filter}
                    onClick={() => setQuickFilter(filter)}
                    aria-pressed={isActive}
                    style={{
                      border: isActive
                        ? "1px solid rgba(86,127,255,0.95)"
                        : "1px solid rgba(255,255,255,0.16)",
                      borderRadius: 999,
                      background: isActive
                        ? "rgba(51,94,217,0.24)"
                        : "transparent",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: "0.86rem",
                      fontWeight: isActive ? 700 : 500,
                      padding: "8px 13px",
                    }}
                  >
                    {quickFilterLabel(filter)}
                  </button>
                );
              })}

              {hasActiveSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "rgba(163,190,255,0.95)",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    padding: "8px 5px",
                    textDecoration: "underline",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </section>
        )}

        {!WEBSITE_LEXICON_VALIDATION.ok && (
          <article className="lexicon-document-card">
            <p>
              <strong>{LEXICON_VALIDATION_FAILURE_MESSAGE}</strong>
            </p>

            <ul>
              {WEBSITE_LEXICON_VALIDATION.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </article>
        )}

        {!selectedEntry && filteredEntries.length === 0 && (
          <article className="lexicon-document-card">
            <h2>No Matching Term Found</h2>
            <p>
              Try a shorter phrase, another word, or clear the current search.
              POPS will continue expanding this guide with additional terms and
              practical examples.
            </p>

            <button
              type="button"
              onClick={clearSearch}
              className="btn btn-primary"
            >
              Show All Terms
            </button>
          </article>
        )}

        <div className="lexicon-document-list">
          {Object.entries(groupedEntries).map(([category, categoryEntries]) => (
            <section className="lexicon-document-group" key={category}>
              <div className="document-rule">
                <span>{formatCategory(category)}</span>
              </div>

              {categoryEntries.map((entry) => (
                <article className="lexicon-document-card" key={entry.slug}>
                  <div className="lexicon-document-heading">
                    <h2>
                      {selectedEntry ? (
                        entry.term
                      ) : (
                        <Link to={`/lexicon/${entry.slug}`}>{entry.term}</Link>
                      )}
                    </h2>

                    <span
                      className={`lexicon-sensitivity ${entry.sensitivity.toLowerCase()}`}
                    >
                      {entry.sensitivity} Sensitivity
                    </span>
                  </div>

                  <p>
                    <strong>Plain-English meaning:</strong> {entry.meaning}
                  </p>

                  <p>
                    <strong>Why it matters:</strong> {entry.whyItMatters}
                  </p>

                  <p>
                    <strong>POPS use:</strong> {entry.popsUse}
                  </p>

                  <p>
                    <strong>Court-safe example:</strong> {entry.example}
                  </p>

                  {!selectedEntry && (
                    <p style={{ marginBottom: 0 }}>
                      <Link to={`/lexicon/${entry.slug}`} className="inline-link">
                        Open direct definition →
                      </Link>
                    </p>
                  )}
                </article>
              ))}
            </section>
          ))}
        </div>

        {!selectedEntry && (
          <aside
            style={{
              marginTop: 36,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(235,241,255,0.78)",
            }}
          >
            <p style={{ marginBottom: 0 }}>
              <strong>Use this guide to understand a term—not to make a legal conclusion.</strong>{" "}
              Start with the plain-English meaning. Preserve the facts. Use dates,
              records, messages, and actions instead of labels or accusations.
            </p>
          </aside>
        )}
      </section>
    </div>
  );
}