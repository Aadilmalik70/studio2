'use server';
/**
 * @fileOverview Analyzes SERP data to provide a concise summary of the search landscape.
 *
 * - analyzeSerp - A function that accepts a search query and SERP data, and returns a summary of the SERP landscape.
 * - AnalyzeSerpInput - The input type for the analyzeSerp function, including the search query and SERP data.
 * - AnalyzeSerpOutput - The return type for the analyzeSerp function, providing a summary of the SERP landscape.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSerpInputSchema = z.object({
  query: z.string().describe('The search query entered by the user.'),
  serpData: z.string().describe('The extracted SERP data in JSON format.'),
});
export type AnalyzeSerpInput = z.infer<typeof AnalyzeSerpInputSchema>;

const AnalyzeSerpOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the SERP landscape, highlighting key themes, dominant websites, and common questions asked.'),
});
export type AnalyzeSerpOutput = z.infer<typeof AnalyzeSerpOutputSchema>;

export async function analyzeSerp(input: AnalyzeSerpInput): Promise<AnalyzeSerpOutput> {
  return analyzeSerpFlow(input);
}

const analyzeSerpPrompt = ai.definePrompt({
  name: 'analyzeSerpPrompt',
  input: {schema: AnalyzeSerpInputSchema},
  output: {schema: AnalyzeSerpOutputSchema},
  prompt: `You are an expert SEO analyst. Analyze the following SERP data for the query "{{query}}" and provide a concise summary of the SERP landscape, highlighting key themes, dominant websites, and common questions asked.  Use the provided JSON data to create the summary.\n\nSERP Data: {{{serpData}}} `,
});

const analyzeSerpFlow = ai.defineFlow(
  {
    name: 'analyzeSerpFlow',
    inputSchema: AnalyzeSerpInputSchema,
    outputSchema: AnalyzeSerpOutputSchema,
  },
  async input => {
    const {output} = await analyzeSerpPrompt(input);
    return output!;
  }
);
