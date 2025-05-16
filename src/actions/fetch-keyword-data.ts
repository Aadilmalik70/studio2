
'use server';

import type { KeywordResearchData, KeywordIdea } from '@/types/serp';

const API_KEY = process.env.SERPAPI_API_KEY;

interface SerpApiGoogleTrendsRelatedQueryItem {
  query: string;
  value: number; // Interest score
  extracted_value?: number; // Sometimes present
}

interface SerpApiGoogleTrendsRelatedQueries {
  top: SerpApiGoogleTrendsRelatedQueryItem[];
  rising: SerpApiGoogleTrendsRelatedQueryItem[];
}

interface SerpApiGoogleTrendsResponse {
  search_parameters: {
    q: string;
    engine: string;
  };
  related_queries?: SerpApiGoogleTrendsRelatedQueries;
  error?: string;
  // other fields from trends API like interest_over_time, geo_map_data etc.
}


export async function fetchKeywordDataAction(seedKeyword: string): Promise<KeywordResearchData> {
  if (!API_KEY) {
    console.error("SERPAPI_API_KEY is not set in environment variables.");
    throw new Error("API key for SerpApi service is not configured.");
  }

  if (!seedKeyword || seedKeyword.trim().length < 1) { // Google Trends allows single character queries
    throw new Error("Seed keyword must be at least 1 character long.");
  }

  console.log(`Fetching Google Trends data for: "${seedKeyword}" from SerpApi.`);

  const params = new URLSearchParams({
    api_key: API_KEY,
    q: seedKeyword,
    engine: 'google_trends',
    data_type: 'TIMESERIES', // This data_type includes related_queries
    // You can add other parameters like 'date' for time range, 'geo' for location, etc.
    // For example: 'date:today 12-m' for last 12 months
    // 'geo:US' for United States
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    const trendsApiResponse: SerpApiGoogleTrendsResponse = await response.json();

    if (!response.ok || trendsApiResponse.error) {
      const errorMessage = trendsApiResponse.error || `Failed to fetch Google Trends data. HTTP status: ${response.status}`;
      console.error("SerpApi Google Trends Error:", errorMessage, "Response body:", trendsApiResponse);
      throw new Error(`SerpApi Google Trends Error: ${errorMessage}`);
    }

    const relatedKeywords: KeywordIdea[] = [];
    const questions: string[] = [];

    if (trendsApiResponse.related_queries) {
      trendsApiResponse.related_queries.top?.forEach(item => {
        const keywordIdea: KeywordIdea = {
          keyword: item.query,
          interestScore: item.extracted_value !== undefined ? item.extracted_value : item.value,
          type: 'top',
        };
        relatedKeywords.push(keywordIdea);
        if (item.query.endsWith('?')) {
          questions.push(item.query);
        }
      });
      trendsApiResponse.related_queries.rising?.forEach(item => {
        const keywordIdea: KeywordIdea = {
          keyword: item.query,
          interestScore: item.extracted_value !== undefined ? item.extracted_value : item.value,
          type: 'rising',
        };
        relatedKeywords.push(keywordIdea);
        if (item.query.endsWith('?')) {
          questions.push(item.query);
        }
      });
    }
    
    // Remove duplicate questions if any
    const uniqueQuestions = Array.from(new Set(questions));

    return {
      seedKeyword: trendsApiResponse.search_parameters?.q || seedKeyword,
      relatedKeywords,
      questions: uniqueQuestions,
    };

  } catch (error) {
    console.error("Error fetching or processing Google Trends data from SerpApi:", error);
    if (error instanceof Error) {
      if (error.message.startsWith("SerpApi Google Trends Error:")) {
        throw error;
      }
      throw new Error(`Failed to process Google Trends data: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while fetching Google Trends data.");
  }
}
