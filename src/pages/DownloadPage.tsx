import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Shield, Lock, FileCheck, Clock, Zap, Copy, Check, ShoppingCart } from "lucide-react";
import PageSeo from "../components/PageSeo";
import { getProduct, useCart } from "../cart";

const TIERS = [
  {
    id: "guardian",
    name: "Guardian Access",
    price: "$99",
    period: "introductory one-time app license",
    desc: "Introductory access to the full POPS desktop app.",
    features: [
      "Evidence Vault with SHA-256 hashing",
      "Court Order & Violation tracking",
      "Timeline & Event logging",
      "Incident logging and record protection",
      "Download access and license activation",
      "Includes lifetime POPS Membership",
    ],
    cta: "Get POPS — $55",
    primary: false,
  },
  {
    id: "opendoor",
    name: "Open Door Access",
    price: "Contribute",
    period: "what you can",
    desc: "Open Door Access is for fathers who cannot carry the full license price today but are willing to contribute what they can.",
    features: [
      "No fixed minimum, but must be more than zero",
      "Requires signed-in POPS account and customer record",
      "Includes amount, explanation, urgency, and pro se status",
      "Reviewed personally to protect the license pool",
      "Approval code required before download/license activation",
      "If approved, same full POPS tool and same respect",
    ],
    cta: "Request Open Door Access",
    primary: true,
  },
  {
    id: "sponsor",
    name: "Sponsor a Father",
    price: "$25+",
    period: "support path",
    desc: "Help fund access for fathers using Open Door. Some requests may be partially or fully sponsor-covered after review.",
    features: [
      "Suggested amounts: $25, $50, $149, $300",
      "Custom sponsorship amount",
      "Supports sponsored license capacity",
      "Supports community access and education",
      "Supports future legal-resource partnerships",
      "Keeps Open Door pool protected",
    ],
    cta: "Sponsor a Father",
    primary: false,
  },
  {
    id: "membership",
    name: "POPS Membership",
    price: "$12.99",
    period: "one-time lifetime",
    desc: "POPS Membership is one-time $12.99 lifetime membership. Not monthly. Not yearly.",
    features: [
      "Newsletter",
      "Events and resource drops",
      "Blog posts and POPS updates",
      "Regional and national Q&A",
      "Ask Another Dad and community rooms",
      "POPS education and updates",
    ],
    cta: "Join POPS Membership — $12.99",
    primary: false,
  },
];

export default function DownloadPage() {
  const [selectedTier, setSelectedTier] = useState("opendoor");
  const [copied, setCopied] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [showReview, setShowReview] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();

  function handleTierAction(id: string) {
    const product = getProduct(id);

    if (!product) {
      return;
    }

    if (product.requiresReview) {
      setSelectedTier(id);
      setShowReview(true);
      return;
    }

    addItem(product);
    navigate("/cart");
  }

  function handleCopyKey() {
    const key = "POPS-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setLicenseKey(key);
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ paddingTop: 72 }}>
      <PageSeo
        title="Get POPS | Local-First Evidence System"
        description="Get POPS, the local-first evidence system for documenting presence, preserving records, and preparing attorney-ready packets."
        path="/access"
      />
      {/* ─── CHOOSE TIER ─── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono access-kicker">Get P.O.P.S.</span>
            <h1>Choose Your POPS Access</h1>
            <p>
              POPS has one product. Guardian pays the full license. Open Door contributes what they can. Sponsors help carry the rest. POPS Membership is one-time $12.99 lifetime access.
            </p>
          </div>

          <div className="pricing-grid">
            {TIERS.map(t => (
              <div 
                key={t.id}
                id={t.id === "opendoor" ? "opendoor-access" : t.id === "sponsor" ? "sponsor-access" : undefined}

                className={`pricing-card ${t.id === "guardian" ? "guardian-card" : ""} ${t.primary ? "featured" : ""} ${t.id === "membership" ? "pricing-membership-row" : ""} ${selectedTier === t.id ? "" : ""}`}
                onClick={() => setSelectedTier(t.id)}
                style={{ 
                  cursor: "pointer",
                  borderColor: selectedTier === t.id ? (t.id === "guardian" ? "#22c55e" : t.primary ? "var(--forge-blue)" : "var(--border-glow)") : undefined,
                  boxShadow: selectedTier === t.id && t.primary ? "var(--shadow-glow)" : undefined,
                }}
              >
                <div className="pricing-tier">{t.name}</div>
                {t.id === "guardian" ? (
                  <div className="guardian-access-block">
                    <div className="pricing-price guardian-price-stack">
                      <span className="guardian-regular-price">Regular price $139</span>
                      <strong className="guardian-intro-price">$99 introductory price</strong>
                      <span className="guardian-license-note">One-time app license</span>
                    </div>
                    <p className="pricing-desc">{t.desc}</p>
                    <button
                      className="btn btn-ghost guardian-action-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTierAction("guardian-intro");
                      }}
                    >
                      <ShoppingCart size={16} />
                      Get Guardian Access - $99
                    </button>
                    <div className="guardian-plan-block">
                      <strong>
                        Payment plan option: $8.74 per month for 12 months
                      </strong>
                      <span>
                        $99 introductory price + $5.88 processing fee =
                        $104.88 total.
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="pricing-price">
                      {t.price}
                      {t.period && <span> {t.period}</span>}
                    </div>
                    <p className="pricing-desc">{t.desc}</p>
                  </>
                )}
                {t.id === "guardian" && (
                  <div className="guardian-beta-block">
                    <span className="guardian-beta-label">Beta Tester Access</span>
                    <strong>Beta tester price $55</strong>
                    <p>
                      Beta testers receive the complete Guardian license for $55. This is not a reduced
                      product and not a subscription. Beta testers are expected to use POPS during the
                      launch window, report bugs or confusing screens, give practical feedback, and allow
                      follow-up contact so the production release can be tightened.
                    </p>
                    <button
                      className="btn btn-ghost guardian-action-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTierAction("guardian");
                      }}
                    >
                      <ShoppingCart size={16} />
                      Get Beta Tester Access - $55
                    </button>
                  </div>
                )}
                <ul className="pricing-features">
                  {t.features.map((f, i) => (
                    <li key={i}><CheckCircle size={16} />{f}</li>
                  ))}
                </ul>
                {t.id !== "guardian" && (
                  <button
                    className={t.primary ? "btn btn-primary" : "btn btn-ghost"}
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTierAction(t.id);
                    }}
                  >
                    {t.id === "membership" || t.id === "sponsor" ? <ShoppingCart size={16} /> : null}
                    {t.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ACTIVATE / DOWNLOAD ─── */}
      {showReview && (
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 640 }}>
            <div className="section-header">
              <span className="mono">Open Door Policy</span>
              <h2>Request Review Required</h2>
            </div>

            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--forge-blue), #4a7fff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 4px 24px rgba(30, 96, 255, 0.3)",
              }}>
                <CheckCircle size={32} color="white" />
              </div>

              <h3 style={{ marginBottom: 8 }}>Signed Account Required</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
                Open Door Access is not anonymous pay-what-you-want and not instant untracked download.
                It requires a signed-in POPS account, customer record, contribution amount greater than zero,
                and manual review.
              </p>

              <div style={{
                background: "var(--obsidian)",
                border: "1px solid var(--border-dim)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 32,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
              }}>
                <span style={{ color: "var(--text-dim)", flex: 1, textAlign: "left" }}>
                  {licenseKey || "APPROVAL-CODE-REQUIRED"}
                </span>
                <button 
                  onClick={handleCopyKey}
                  style={{ background: "none", border: "none", color: "var(--forge-blue)", cursor: "pointer", padding: 4 }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Create or sign in to POPS website account",
                  "Provide customer/contact information",
                  "Choose Open Door and enter contribution amount (> 0)",
                  "Submit explanation, urgency, and pro se status",
                  "Receive manual review outcome",
                  "If approved, use approval code for payment/download/license activation",
                ].map((line) => (
                  <button 
                    key={line}
                    className="btn btn-ghost"
                    style={{ justifyContent: "flex-start", padding: "14px 20px" }}
                  >
                    <CheckCircle size={18} />
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <strong style={{ color: "var(--text-primary)", fontSize: 14, display: "block" }}>
                        {line}
                      </strong>
                    </div>
                    <Zap size={16} color="var(--forge-blue)" />
                  </button>
                ))}
              </div>

              <div style={{
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
                textAlign: "left",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Shield size={16} color="#10b981" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>Activation Steps</span>
                </div>
                <ol style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                  <li>Requests are reviewed manually.</li>
                  <li>Approval depends on available license pool capacity.</li>
                  <li>Some Open Door requests may be partially or fully sponsor-covered after review.</li>
                  <li>Everyone approved receives the same tool.</li>
                </ol>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
                <Link to="/account" className="btn btn-primary">
                  <Lock size={16} />
                  Start Open Door Review
                </Link>
                <button className="btn btn-ghost" onClick={() => handleTierAction("sponsor")}>
                  <ShoppingCart size={16} />
                  Sponsor Instead
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY LOCAL-FIRST ─── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="mono">Security</span>
            <h2>Your Case is Yours</h2>
            <p>
              P.O.P.S. is built local-first. Your data never leaves your machine unless you choose to export it.
            </p>
          </div>

          <div className="features-grid security-stroke-grid">
            <div className="feature-card">
              <div className="feature-icon"><Lock size={22} /></div>
              <h3>Local-Only Storage</h3>
              <p>SQLite database on your machine. No cloud sync. No remote servers holding your evidence. Your case files stay where they belong.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FileCheck size={22} /></div>
              <h3>SHA-256 Verification</h3>
              <p>Every evidence file is hashed before storage. If a file is altered, the hash won't match. Tamper-evident by design.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Shield size={22} /></div>
              <h3>Encrypted Backup</h3>
              <p>Guardian and approved Open Door users can use encrypted exports for USB backup, trusted cloud backup of choice, or attorney handoff.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Clock size={22} /></div>
              <h3>Offline Operation</h3>
              <p>After activation, P.O.P.S. works entirely offline. No internet required. No dependency on our servers. Your case proceeds regardless.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
