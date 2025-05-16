
'use server';

import type { QueryFormData } from '@/components/query-form';
import type { SerpData, SerpResultItem } from '@/types/serp';

// Define a type for the SerpApi response structure (simplified for our needs)
interface SerpApiOrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  rich_snippet?: object; // Can be complex, we'll ignore for now or just check existence
  date?: string;
}

interface SerpApiAdResult {
  position?: number;
  block_position?: number; // top, bottom, right
  title: string;
  link: string;
  displayed_link?: string;
  tracking_link?: string;
  description?: string;
  snippet?: string; // Fallback if description is not present
  sitelinks?: object[]; // Can be complex
}

interface SerpApiAnswerBox {
  type?: string;
  title: string;
  link: string;
  answer?: string; // Often the direct answer
  snippet?: string; // Sometimes a snippet is provided instead of or with answer
  source?: {
    title?: string;
    link: string;
    displayed_link?: string;
  };
}

interface SerpApiRelatedQuestion {
  question: string;
  link?: string; // Link to the search for that question
  snippet?: string;
  title?: string; // Title of the source for the answer
  source?: {
    link?: string;
    displayed_link?: string;
  };
}

interface SerpApiResponse {
  search_parameters: {
    q: string;
    engine: string;
    location_requested?: string;
    num?: string; // Number of results requested
  };
  search_information?: {
    total_results?: number;
    organic_results_state?: string;
  };
  organic_results: SerpApiOrganicResult[];
  answer_box?: SerpApiAnswerBox;
  related_questions?: SerpApiRelatedQuestion[];
  ads?: SerpApiAdResult[];
  error?: string; // SerpApi returns an error message in the JSON body for API errors
}


export async function fetchSerpDataAction(formData: QueryFormData): Promise<SerpData> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.error("SERPAPI_API_KEY is not set in environment variables.");
    throw new Error("API key for SERP service is not configured. Please set SERPAPI_API_KEY in your .env file.");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    q: formData.query,
    engine: formData.searchEngine,
    num: formData.numResults.toString(),
    // hl: 'en', // You can specify language if needed
    // gl: 'us', // You can specify country if needed
  });

  if (formData.geoLocation) {
    // SerpApi uses 'location' parameter for geographic specificity
    params.append('location', formData.geoLocation);
  }

  const url = `https://serpapi.com/search.json?${params.toString()}`;

  console.log(`Fetching SERP data from SerpApi for query: "${formData.query}" using URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const serpApiResponse: SerpApiResponse = await response.json();

    if (!response.ok || serpApiResponse.error) {
      const errorMessage = serpApiResponse.error || `Failed to fetch SERP data. HTTP status: ${response.status}`;
      console.error("SerpApi Error:", errorMessage, "Response body:", serpApiResponse);
      throw new Error(`SerpApi Error: ${errorMessage}`);
    }
    
    // Transform SerpApi response to our SerpData structure
    const organicResults: SerpResultItem[] = serpApiResponse.organic_results?.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || "No snippet available.",
      position: item.position,
    })) || [];

    let featuredSnippet;
    if (serpApiResponse.answer_box) {
      featuredSnippet = {
        title: serpApiResponse.answer_box.title,
        link: serpApiResponse.answer_box.link || (serpApiResponse.answer_box.source?.link),
        snippet: serpApiResponse.answer_box.answer || serpApiResponse.answer_box.snippet || "No snippet available.",
      };
    }

    const peopleAlsoAsk: string[] = serpApiResponse.related_questions?.map(item => item.question) || [];
    
    const ads: SerpResultItem[] = serpApiResponse.ads?.map((item, index) => ({
      title: item.title,
      link: item.link, // Main ad link
      snippet: item.description || item.snippet || "No ad description available.",
      position: item.position || (typeof item.block_position === 'number' ? item.block_position : index + 1), // Use block_position if 'position' is not there
    })) || [];

    return {
      query: serpApiResponse.search_parameters?.q || formData.query,
      searchEngine: serpApiResponse.search_parameters?.engine || formData.searchEngine,
      numResults: formData.numResults, 
      geoLocation: serpApiResponse.search_parameters?.location_requested || formData.geoLocation,
      organicResults,
      featuredSnippet,
      peopleAlsoAsk,
      ads,
    };

  } catch (error) {
    console.error("Error fetching or processing SERP data from SerpApi:", error);
    if (error instanceof Error) {
      // Append more details if it's a SerpApi specific error not caught by the initial check
      if (error.message.startsWith("SerpApi Error:")) {
          throw error;
      }
      throw new Error(`Failed to process SERP data: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while fetching SERP data.");
  }
}
