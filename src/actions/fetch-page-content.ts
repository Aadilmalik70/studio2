'use server';

/**
 * @fileOverview Server action to fetch the HTML content of a given URL.
 */

interface FetchPageContentResult {
  url: string;
  content?: string;
  error?: string;
}

export async function fetchPageContentAction(url: string): Promise<FetchPageContentResult> {
  if (!url) {
    return { url, error: "URL is required." };
  }

  console.log(`Fetching content for URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        // Try to mimic a browser to avoid simple blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Add a timeout to prevent hanging indefinitely
      // Note: AbortSignal.timeout() is more modern but might not be available in all Node.js versions on all platforms easily.
      // For broader compatibility, a manual timeout approach or a library might be needed for robust production systems.
      // This basic fetch should work in most Next.js server environments.
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL ${url}. Status: ${response.status} ${response.statusText}`);
      return { url, error: `Failed to fetch URL. Status: ${response.status} ${response.statusText}` };
    }

    // Check content type - we are primarily interested in HTML
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      console.warn(`URL ${url} returned non-HTML content type: ${contentType}`);
      // We might still try to get text, but it could be binary data or something else.
      // For now, we'll proceed but this could be a point of failure or unexpected content.
    }

    const content = await response.text();
    return { url, content };

  } catch (error) {
    console.error(`Error fetching content for URL ${url}:`, error);
    if (error instanceof Error) {
      // Check for specific fetch errors if needed, e.g., network errors
      if (error.name === 'AbortError') {
         return { url, error: `Request to ${url} timed out.`};
      }
      return { url, error: `Error fetching content: ${error.message}` };
    }
    return { url, error: "An unexpected error occurred while fetching page content." };
  }
}
