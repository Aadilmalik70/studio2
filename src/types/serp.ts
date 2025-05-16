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
