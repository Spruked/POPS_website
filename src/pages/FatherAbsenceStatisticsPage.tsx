import PageSeo from "../components/PageSeo";

export default function FatherAbsenceStatisticsPage() {
  return (
    <>
      <PageSeo
        title="Father Absence and Single-Mother Household Statistics | POPS"
        description="National household-composition statistics and the limits of available data concerning fathers denied visitation."
        path="/father-absence-statistics"
      />

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: "920px", margin: "0 auto" }}>
            <p
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 700,
                opacity: 0.72,
              }}
            >
              National Family Data
            </p>

            <h1>Father Absence and Single-Mother Household Statistics</h1>

            <p style={{ fontSize: "1.08rem", lineHeight: 1.75 }}>
              National household-composition data can measure whether a father
              lives in the home. It does not measure whether a father has been
              denied visitation, blocked from court-ordered parenting time, or
              prevented from maintaining contact with his child.
            </p>

            <section style={{ marginTop: "42px" }}>
              <h2>Single-Mother Households — U.S. Census Data</h2>

              <p>
                The U.S. Census Bureau provides authoritative national counts
                of single-parent and one-parent family households.
              </p>

              <ul style={{ lineHeight: 1.8 }}>
                <li>
                  There were approximately <strong>10.9 million</strong>{" "}
                  one-parent family groups with children under 18 in 2022.
                </li>
                <li>
                  Approximately <strong>80%</strong> of those family groups
                  were maintained by single mothers.
                </li>
                <li>
                  Among single mothers, approximately <strong>51%</strong>{" "}
                  were never married.
                </li>
                <li>
                  Approximately <strong>29%</strong> were divorced.
                </li>
                <li>
                  Broader multi-dataset social research has estimated that{" "}
                  <strong>85.7%</strong> of father-absent households are headed
                  by single mothers.
                </li>
              </ul>

              <p>
                These figures are comparatively well established because the
                Census directly measures household composition.
              </p>
            </section>

            <section style={{ marginTop: "42px" }}>
              <h2>Father Absence — National Statistics</h2>

              <p>
                These figures describe fathers who do not live in the child’s
                household. They do <strong>not</strong> measure visitation
                denial.
              </p>

              <ul style={{ lineHeight: 1.8 }}>
                <li>
                  Approximately <strong>23.6%</strong> of U.S. children under
                  18 live without their father in the household.
                </li>
                <li>
                  Approximately <strong>65%</strong> of father absence begins
                  when the parents never marry.
                </li>
                <li>
                  Approximately <strong>25%</strong> of father absence involves
                  a father who was never married to the mother.
                </li>
                <li>
                  Approximately <strong>10%</strong> of father absence is
                  attributed to the father’s death.
                </li>
              </ul>

              <p>
                These are broad demographic indicators, not measurements of
                custody disputes, visitation interference, or legal access.
              </p>
            </section>

            <section
              style={{
                marginTop: "42px",
                padding: "26px",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <h2>What the Government Does Not Track</h2>

              <p>
                There is currently no comprehensive national government
                statistic measuring:
              </p>

              <ul style={{ lineHeight: 1.8 }}>
                <li>Fathers denied visitation</li>
                <li>Fathers blocked from court-ordered parenting time</li>
                <li>Mothers withholding visitation</li>
                <li>The frequency of visitation interference</li>
                <li>
                  The percentage of fathers who want visitation but cannot
                  obtain it
                </li>
              </ul>

              <p>
                No federal dataset from the Census Bureau, CDC, DOJ, or HHS
                provides a national count of visitation denial. State court
                systems also do not aggregate these incidents into a single
                national statistic.
              </p>
            </section>

            <section style={{ marginTop: "42px" }}>
              <h2>Why the Distinction Matters</h2>

              <p style={{ lineHeight: 1.75 }}>
                A child living outside the father’s household does not, by
                itself, establish abandonment, disengagement, denial of access,
                or interference with parenting time. Household-composition
                statistics should not be presented as direct evidence of
                visitation denial.
              </p>

              <p style={{ lineHeight: 1.75 }}>
                POPS distinguishes between measurable demographic conditions
                and legal or interpersonal events that are not currently
                tracked through a comprehensive national reporting system.
              </p>
            </section>

            <p
              style={{
                marginTop: "40px",
                fontSize: "0.92rem",
                lineHeight: 1.65,
                opacity: 0.72,
              }}
            >
              These figures are presented for public education and discussion.
              Individual statistics should be verified against their original
              source before use in legal, governmental, academic, or formal
              statistical work.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
