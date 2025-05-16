export interface SerpResultItem {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerpData {
  query: string;
  searchEngine: string;
  numResults: number;
  geoLocation?: string;
  organicResults: SerpResultItem[];
  featuredSnippet?: {
    title: string;
    link: string;
    snippet: string;
  };
  peopleAlsoAsk?: string[];
  ads?: SerpResultItem[];
}

export interface ContentAnalysisData {
  gapSummary: string;
  improvementSuggestions: string[];
  keywordOpportunities: string[];
}

// New types for Keyword Research
export interface KeywordIdea {
  keyword: string;
  volume?: number; // Monthly search volume
  difficulty?: number; // SEO difficulty (e.g., 0-100)
  cpc?: number; // Cost Per Click (USD)
  competition?: number; // Competition level (e.g., 0-1, where 1 is high)
}

export interface KeywordResearchData {
  seedKeyword: string;
  relatedKeywords: KeywordIdea[];
  questions: string[];
  // You can add more fields here as needed, like trend data, etc.
}
