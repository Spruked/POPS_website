export interface WebsiteLexiconEntry {
  term: string;
  sensitivity: "High" | "Medium";
  meaning: string;
  popsUse: string;
  example: string;
}

export const WEBSITE_LEXICON: WebsiteLexiconEntry[] = [
  {
    term: "Culpable",
    sensitivity: "High",
    meaning: "Legally or morally responsible for an act, failure, violation, or wrongdoing.",
    popsUse: "Use carefully. Keep statements tied to facts, records, orders, communications, and attorney review.",
    example: "The records show the scheduled parenting time did not occur, and the child was not made available on the dates listed.",
  },
  {
    term: "Exculpatory",
    sensitivity: "Medium",
    meaning: "Evidence that may help show a person did not do something wrong, complied with an order, or made a good-faith effort.",
    popsUse: "Preserve receipts, messages, location records, attempted contact logs, payment proof, witness notes, court orders, and records showing lawful conduct.",
    example: "This record may be exculpatory because it shows I appeared at the scheduled exchange location at the ordered time.",
  },
  {
    term: "Pro se",
    sensitivity: "Medium",
    meaning: "Representing yourself in court without an attorney.",
    popsUse: "POPS can help organize facts, timelines, evidence, support records, and attorney-ready packets, but it does not replace legal counsel.",
    example: "I am appearing pro se and have organized the attached records for the Court's review.",
  },
  {
    term: "Prima facie",
    sensitivity: "High",
    meaning: "Something appears sufficient on its face or at first view, unless disproven or challenged by other evidence.",
    popsUse: "A documented pattern may help form a preliminary factual showing, but legal effect belongs with an attorney or court.",
    example: "The attached timeline and records may show a prima facie pattern of scheduled parenting time not occurring as ordered.",
  },
  {
    term: "Estoppel",
    sensitivity: "High",
    meaning: "A principle that may prevent someone from taking a position that contradicts earlier words, actions, promises, or conduct when another person reasonably relied on them.",
    popsUse: "Track communications, agreements, promises, consent, changed positions, and reliance for attorney review.",
    example: "The message records show an agreement to the exchange time, followed by my reliance on that agreement and my appearance at the location.",
  },
  {
    term: "Habeas corpus",
    sensitivity: "High",
    meaning: "A legal procedure used to challenge unlawful detention or restraint.",
    popsUse: "Define only. In parent-rights contexts, flag this term for attorney review before use.",
    example: "This term involves serious legal procedure and should be reviewed with an attorney or appropriate legal authority before use.",
  },
  {
    term: "Fifth Amendment",
    sensitivity: "High",
    meaning: "U.S. constitutional protections related to due process and the right against self-incrimination.",
    popsUse: "Sensitive statements involving accusations, police contact, investigations, admissions, recordings, threats, or allegations should be reviewed before export.",
    example: "Statements involving possible criminal exposure, accusations, admissions, or investigations should be reviewed by counsel before filing or sharing.",
  },
  {
    term: "Fourteenth Amendment",
    sensitivity: "High",
    meaning: "U.S. constitutional due process and equal protection principles, often discussed around parental rights, notice, hearings, fairness, and government action.",
    popsUse: "Document notice, opportunity to be heard, access to records, consistent treatment, and attempts to participate in the child's life.",
    example: "My records are organized to show notice received, appearances made, communication attempts, and the factual history of my efforts to participate.",
  },
  {
    term: "Due process",
    sensitivity: "Medium",
    meaning: "Fair legal procedure, including notice and a meaningful opportunity to be heard before important rights are affected.",
    popsUse: "Track notices, hearing dates, service records, court filings, appearances, missed notices, and procedural fairness facts.",
    example: "The attached records show the dates I received notice, the steps I took to respond, and the records I preserved.",
  },
  {
    term: "Equal protection",
    sensitivity: "Medium",
    meaning: "The government must apply the law fairly and not treat similarly situated people differently without a lawful reason.",
    popsUse: "Preserve factual comparisons, agency actions, court records, communications, and treatment patterns for attorney review.",
    example: "Equal protection concerns should be supported by specific facts, dates, records, and comparable treatment examples.",
  },
];
