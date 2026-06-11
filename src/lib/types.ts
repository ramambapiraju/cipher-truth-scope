export type Confidence = "high" | "medium" | "low";

export interface Claim {
  text: string;
  exact_quote: string;
  source_index: number;
  confidence: Confidence;
}

export interface Section {
  heading: string;
  body_markdown: string;
  claims: Claim[];
}

export interface Contradiction {
  topic: string;
  positions: { source_index: number; claim: string; exact_quote: string }[];
}

export interface SourceCard {
  index: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  confidence: Confidence;
}

export interface ResearchReport {
  query: string;
  truth_index: {
    consensus: string;
    score: number; // 0-100
    bullets: string[];
  };
  sections: Section[];
  contradictions: Contradiction[];
  sources: SourceCard[];
  search_queries: string[];
  generated_at: number;
  deep_research: boolean;
  model: string;
  grounded: boolean;
  notes?: string[];
}

export interface ResearchInput {
  query: string;
  deepResearch: boolean;
  stealth: boolean;
  userApiKey?: string;
  niche?: "quantum" | "cybersecurity" | "electronics" | "biotech" | "general";
}