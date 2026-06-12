import popsLexicon from "./popslexicon.json";
import { validatePopsLexicon, type PopsLexiconData } from "./validatePopsLexicon";

export interface WebsiteLexiconEntry {
  term: string;
  slug: string;
  sensitivity: "High" | "Medium" | "Low";
  category: string;
  meaning: string;
  whyItMatters: string;
  popsUse: string;
  example: string;
  metaDescription: string;
}

function slugify(term: string) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const WEBSITE_LEXICON_VALIDATION = validatePopsLexicon(popsLexicon);

const validatedLexicon = WEBSITE_LEXICON_VALIDATION.ok ? (popsLexicon as PopsLexiconData) : null;

export const WEBSITE_LEXICON: WebsiteLexiconEntry[] = validatedLexicon ? validatedLexicon.terms.map((entry) => ({
  term: entry.term,
  slug: slugify(entry.term),
  sensitivity: titleCase(entry.sensitivity) as WebsiteLexiconEntry["sensitivity"],
  category: entry.category,
  meaning: entry.plain_english,
  whyItMatters: entry.why_it_matters,
  popsUse: entry.app_guidance,
  example: entry.court_safe_example,
  metaDescription: `POPS Lexicon definition of ${entry.term} with plain-English meaning, court-safe evidence language, and attorney-review guidance.`,
})) : [];

export const WEBSITE_LEXICON_RULES = validatedLexicon
  ? validatedLexicon.global_rules
  : { high_sensitivity_terms: [], flag_message: "", rewrite_strategy: [] };
