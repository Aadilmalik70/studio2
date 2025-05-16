
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

// Updated types for Keyword Research
export interface KeywordIdea {
  keyword: string;
  interestScore?: number; // Interest score from Google Trends (e.g., 0-100)
  type?: 'top' | 'rising'; // Indicates if the query is 'top' or 'rising'
  // Kept original metrics as optional in case of future integration with other APIs
  volume?: number; 
  difficulty?: number;
  cpc?: number; 
  competition?: number;
}

export interface KeywordResearchData {
  seedKeyword: string;
  relatedKeywords: KeywordIdea[];
  questions: string[];
}
