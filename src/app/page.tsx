"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { QueryForm, type QueryFormData } from '@/components/query-form';
import { ResultsDisplay } from '@/components/results-display';
import type { SerpData } from '@/types/serp';
import { analyzeSerp, type AnalyzeSerpOutput } from '@/ai/flows/analyze-serp';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Eye as EyeIconLucide } from "lucide-react"; // Renamed Eye to EyeIconLucide to avoid conflict
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageResults {
  serpData: SerpData;
  analysis: AnalyzeSerpOutput;
}

// Mock SERP data generation function
function generateMockSerpData(formData: QueryFormData): SerpData {
  const numOrganic = Math.min(formData.numResults, 10); // Cap mock organic results
  return {
    query: formData.query,
    searchEngine: formData.searchEngine,
    numResults: formData.numResults,
    geoLocation: formData.geoLocation,
    organicResults: Array.from({ length: numOrganic }, (_, i) => ({
      title: `Mock Organic Result ${i + 1} for "${formData.query}"`,
      link: `https://example.com/search?q=${encodeURIComponent(formData.query)}&result=${i + 1}`,
      snippet: `This is a mock snippet for organic result ${i + 1}. Search engine: ${formData.searchEngine}. Location: ${formData.geoLocation || 'N/A'}.`,
      position: i + 1,
    })),
    featuredSnippet: Math.random() > 0.5 ? {
      title: `Mock Featured Snippet for "${formData.query}"`,
      link: `https://example.com/featured?q=${encodeURIComponent(formData.query)}`,
      snippet: `This is a detailed mock featured snippet. It provides a quick answer to the query.`,
    } : undefined,
    peopleAlsoAsk: Math.random() > 0.3 ? [
      `What is ${formData.query}?`,
      `How to use ${formData.query}?`,
      `Best practices for ${formData.query}.`,
      `Compare ${formData.query} with alternatives.`,
    ].slice(0, Math.floor(Math.random() * 4) + 1) : undefined,
    ads: Math.random() > 0.6 ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
      title: `Ad: Top Solution for ${formData.query} - Offer ${i + 1}`,
      link: `https://example.com/ad?q=${encodeURIComponent(formData.query)}&id=${i + 1}`,
      snippet: `Limited time offer! Get the best deals for ${formData.query} now. This is ad number ${i + 1}.`,
      position: i + 1,
    })) : undefined,
  };
}


const LoadingSkeleton: React.FC = () => (
  <div className="mt-12 space-y-8">
    <Card className="shadow-xl">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-7 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);


export default function HomePage() {
  const [results, setResults] = useState<PageResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuerySubmit = async (data: QueryFormData) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Step 1 & 2: Mock SERP Fetching and Data Extraction
      const mockSerp: SerpData = generateMockSerpData(data);
      const serpDataString = JSON.stringify(mockSerp);

      // Step 3: SERP Analysis (GenAI)
      const analysisOutput = await analyzeSerp({
        query: data.query,
        serpData: serpDataString,
      });

      if (!analysisOutput || !analysisOutput.summary) {
        throw new Error("AI analysis did not return a summary.");
      }
      
      setResults({
        serpData: mockSerp,
        analysis: analysisOutput,
      });

      toast({
        title: "Analysis Complete",
        description: `SERP data for "${data.query}" analyzed successfully.`,
      });

    } catch (e) {
      console.error("Error processing SERP data:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to analyze SERP data: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="text-center mb-10 md:mb-16">
          <div className="inline-block mb-4">
            <Logo />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock powerful insights from Search Engine Results Pages. Enter your query below and let our AI provide a comprehensive analysis.
          </p>
        </header>

        <QueryForm onSubmit={handleQuerySubmit} isLoading={isLoading} />

        {error && (
           <Alert variant="destructive" className="mt-8">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Analysis Failed</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        
        {isLoading && <LoadingSkeleton />}

        {!isLoading && !error && results && (
          <ResultsDisplay serpData={results.serpData} analysis={results.analysis} />
        )}
        
        {!isLoading && !error && !results && (
          <Card className="mt-12 text-center p-10 bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Dive In?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Enter your search query above to begin your SERP analysis.
              </p>
              <EyeIllustration className="mx-auto mt-8 h-32 w-32 text-primary opacity-20" />
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="text-center py-8 border-t border-border mt-16">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SERP Eye. All rights reserved.
        </p>
      </footer>
    </div>
  );
}


// Simple SVG illustration for the placeholder card
const EyeIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="22" x2="12" y2="18" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="19.07" y1="4.93" x2="16" y2="8" />
    <line x1="4.93" y1="4.93" x2="8" y2="8" />
    <line x1="19.07" y1="19.07" x2="16" y2="16" />
    <line x1="4.93" y1="19.07" x2="8" y2="16" />
  </svg>
);

// Ensure Eye icon from lucide-react is also imported if it's used elsewhere, or rename one of the Eye components.
// For instance, if Eye from lucide-react is used in Logo.tsx, it's fine.
// If both were intended for this file, one needs renaming. I've assumed EyeIllustration is local and Eye in Logo is from lucide.
// If Eye from lucide-react was also meant to be used directly in this file, you'd import it like:
// import { Eye as LucideEye } from 'lucide-react';
// And then use <LucideEye />
