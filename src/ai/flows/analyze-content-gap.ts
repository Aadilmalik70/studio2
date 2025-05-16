'use server';
/**
 * @fileOverview Analyzes website content to identify gaps relative to a user's search query.
 *
 * - analyzeContentGap - A function that accepts a search query, page URL, and page content,
 *   and returns an analysis of content gaps, improvement suggestions, and keyword opportunities.
 * - AnalyzeContentGapInput - The input type for the analyzeContentGap function.
 * - AnalyzeContentGapOutput - The return type for the analyzeContentGap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeContentGapInputSchema = z.object({
  query: z.string().describe("The user's original search query."),
  pageUrl: z.string().url().describe("The URL of the webpage being analyzed."),
  pageContent: z.string().describe("The HTML content of the webpage."),
});
export type AnalyzeContentGapInput = z.infer<typeof AnalyzeContentGapInputSchema>;

const AnalyzeContentGapOutputSchema = z.object({
  gapSummary: z.string().describe("A brief paragraph summarizing the main content gaps found on the page relative to the query."),
  improvementSuggestions: z.array(z.string()).describe("A list of actionable suggestions to improve the content and fill these gaps."),
  keywordOpportunities: z.array(z.string()).describe("A short list of related keywords or phrases relevant to the query but underrepresented in the content."),
});
export type AnalyzeContentGapOutput = z.infer<typeof AnalyzeContentGapOutputSchema>;

export async function analyzeContentGap(input: AnalyzeContentGapInput): Promise<AnalyzeContentGapOutput> {
  return analyzeContentGapFlow(input);
}

const analyzeContentGapPrompt = ai.definePrompt({
  name: 'analyzeContentGapPrompt',
  input: {schema: AnalyzeContentGapInputSchema},
  output: {schema: AnalyzeContentGapOutputSchema},
  prompt: `You are an expert SEO Content Analyst. Your goal is to identify content gaps on the provided webpage in relation to the user's search query.
Analyze the main textual content from the following HTML for the page '{{pageUrl}}' based on the user's query: '{{query}}'. Ignore HTML tags, scripts, and styles; focus on the readable content.

HTML Content:
\`\`\`html
{{{pageContent}}}
\`\`\`

Please provide:
1.  **Content Gap Summary:** A brief paragraph summarizing the main content gaps. What key aspects of the query are not adequately addressed or are missing entirely from the page's textual content?
2.  **Specific Improvement Suggestions:** A list of 3-5 actionable suggestions to improve the content and fill these gaps. These could be new sections to add, questions to answer, or topics to expand upon.
3.  **Keyword Opportunities:** A short list of 2-3 related keywords or phrases that are relevant to the query but seem underrepresented in the textual content.
`,
  config: {
    safetySettings: [ // Loosen safety settings if content might be flagged
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE'},
    ]
  }
});

const analyzeContentGapFlow = ai.defineFlow(
  {
    name: 'analyzeContentGapFlow',
    inputSchema: AnalyzeContentGapInputSchema,
    outputSchema: AnalyzeContentGapOutputSchema,
  },
  async input => {
    // Basic check for excessively large content to prevent overly long LLM calls
    const MAX_CONTENT_LENGTH = 300000; // Approx 300k characters, adjust as needed
    if (input.pageContent.length > MAX_CONTENT_LENGTH) {
      console.warn(`Content for ${input.pageUrl} is very long (${input.pageContent.length} chars), truncating for analysis.`);
      input.pageContent = input.pageContent.substring(0, MAX_CONTENT_LENGTH);
    }

    const {output} = await analyzeContentGapPrompt(input);
    if (!output) {
        throw new Error("AI content gap analysis did not return a valid output.");
    }
    return output;
  }
);
