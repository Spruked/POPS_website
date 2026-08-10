import { useMemo, useState } from "react";
import PageSeo from "../components/PageSeo";
import estimatesCsv from "../../state-estimated-fathers-denied-visitation-50.csv?raw";

interface StateEstimate {
  state: string;
  estimated: string;
  numericEstimate: number;
}

function parseEstimates(csv: string): StateEstimate[] {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const match = line.match(/^([^,]+),"?~?([\d,]+)"?$/);

      if (!match) {
        return null;
      }

      const state = match[1].trim();
      const numberText = match[2].trim();
      const numericEstimate = Number(numberText.replace(/,/g, ""));

      return {
        state,
        estimated: `~${numberText}`,
        numericEstimate,
      };
    })
    .filter((row): row is StateEstimate => row !== null);
}

const estimates = parseEstimates(estimatesCsv);

export default function StateVisitationEstimatesPage() {
  const [query, setQuery] = useState("");

  const filteredEstimates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return estimates;
    }

    return estimates.filter((row) =>
      row.state.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const combinedEstimate = estimates.reduce(
    (total, row) => total + row.numericEstimate,
    0,
  );

  function downloadCsv() {
    const blob = new Blob([estimatesCsv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "state-estimated-fathers-denied-visitation-50.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageSeo
        title="State Visitation Estimates | POPS"
        description="Approximate state-by-state estimates of fathers denied visitation across the United States."
        path="/visitation-estimates"
      />

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: "880px", marginBottom: "32px" }}>
            <p
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 700,
                opacity: 0.72,
              }}
            >
              State-by-State Data
            </p>

            <h1>Estimated Fathers Denied Visitation</h1>

            <p style={{ fontSize: "1.08rem", lineHeight: 1.7 }}>
              The figures below are approximate estimates maintained by POPS
              for awareness, discussion, and planning. They should not be
              interpreted as official government counts or formal findings.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                padding: "22px",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.035)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "2rem",
                  marginBottom: "6px",
                }}
              >
                50
              </strong>
              <span>States represented</span>
            </div>

            <div
              style={{
                padding: "22px",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.035)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "2rem",
                  marginBottom: "6px",
                }}
              >
                ~{combinedEstimate.toLocaleString("en-US")}
              </strong>
              <span>Combined listed estimate</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <label
              htmlFor="state-estimate-search"
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
              }}
            >
              Search by state
            </label>

            <input
              id="state-estimate-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by state"
              style={{
                flex: "1 1 260px",
                minHeight: "44px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "inherit",
              }}
            />

            <button
              type="button"
              onClick={downloadCsv}
              style={{
                minHeight: "44px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.24)",
                background: "rgba(255,255,255,0.08)",
                color: "inherit",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Download CSV
            </button>
          </div>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "14px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "520px",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.07)" }}>
                  <th
                    scope="col"
                    style={{
                      textAlign: "left",
                      padding: "15px 18px",
                    }}
                  >
                    State
                  </th>

                  <th
                    scope="col"
                    style={{
                      textAlign: "right",
                      padding: "15px 18px",
                    }}
                  >
                    Estimated Fathers Denied Visitation
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEstimates.map((row) => (
                  <tr
                    key={row.state}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <th
                      scope="row"
                      style={{
                        textAlign: "left",
                        padding: "14px 18px",
                        fontWeight: 600,
                      }}
                    >
                      {row.state}
                    </th>

                    <td
                      style={{
                        textAlign: "right",
                        padding: "14px 18px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.estimated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEstimates.length === 0 && (
            <p style={{ marginTop: "20px" }}>
              No state matched that search.
            </p>
          )}

          <p
            style={{
              marginTop: "24px",
              fontSize: "0.92rem",
              lineHeight: 1.65,
              opacity: 0.74,
            }}
          >
            Methodology and source documentation should be reviewed before
            these estimates are cited in legal, academic, governmental, or
            statistical work.
          </p>
        </div>
      </section>
    </>
  );
}
