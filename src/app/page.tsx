
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { QueryForm, type QueryFormData } from '@/components/query-form';
import { ResultsDisplay } from '@/components/results-display';
import type { SerpData, ContentAnalysisData } from '@/types/serp';
import { analyzeSerp, type AnalyzeSerpOutput } from '@/ai/flows/analyze-serp';
import { analyzeContentGap } from '@/ai/flows/analyze-content-gap';
import { fetchSerpDataAction } from '@/actions/fetch-serp-data';
import { fetchPageContentAction } from '@/actions/fetch-page-content';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Eye as EyeIconLucide } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


interface PageResults {
  serpData: SerpData;
  analysis: AnalyzeSerpOutput;
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

  const [analysisByUrl, setAnalysisByUrl] = useState<Record<string, ContentAnalysisData | null>>({});
  const [loadingAnalysisUrl, setLoadingAnalysisUrl] = useState<string | null>(null);
  const [errorAnalysisByUrl, setErrorAnalysisByUrl] = useState<Record<string, string | null>>({});


  const handleQuerySubmit = async (data: QueryFormData) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setAnalysisByUrl({}); // Reset individual content analyses
    setLoadingAnalysisUrl(null);
    setErrorAnalysisByUrl({});

    try {
      const fetchedSerpData = await fetchSerpDataAction(data);
      
      if (!fetchedSerpData) {
        throw new Error("Failed to fetch SERP data from the server.");
      }
      
      const serpDataString = JSON.stringify(fetchedSerpData);

      const analysisOutput = await analyzeSerp({
        query: data.query,
        serpData: serpDataString,
      });

      if (!analysisOutput || !analysisOutput.summary) {
        throw new Error("AI analysis did not return a summary.");
      }
      
      setResults({
        serpData: fetchedSerpData,
        analysis: analysisOutput,
      });

      toast({
        title: "SERP Analysis Complete",
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

  const handleAnalyzeContent = async (url: string, query: string) => {
    setLoadingAnalysisUrl(url);
    setErrorAnalysisByUrl(prev => ({ ...prev, [url]: null }));
    setAnalysisByUrl(prev => ({ ...prev, [url]: null })); // Clear previous analysis for this URL

    try {
      toast({
        title: "Fetching Page Content...",
        description: `Attempting to retrieve content from ${url}`,
      });
      const pageContentResult = await fetchPageContentAction(url);

      if (pageContentResult.error || !pageContentResult.content) {
        throw new Error(pageContentResult.error || "Failed to fetch page content or content is empty.");
      }

      toast({
        title: "Analyzing Content Gaps...",
        description: `AI is analyzing content from ${url} for query "${query}".`,
      });
      const contentAnalysis = await analyzeContentGap({
        query,
        pageUrl: url,
        pageContent: pageContentResult.content,
      });

      if (!contentAnalysis) {
        throw new Error("AI content gap analysis did not return any data.");
      }

      setAnalysisByUrl(prev => ({ ...prev, [url]: contentAnalysis }));
      toast({
        title: "Content Analysis Complete",
        description: `Gap analysis for ${url} finished.`,
      });

    } catch (e) {
      console.error(`Error analyzing content for ${url}:`, e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during content analysis.";
      setErrorAnalysisByUrl(prev => ({ ...prev, [url]: errorMessage }));
      toast({
        variant: "destructive",
        title: "Content Analysis Failed",
        description: `Could not analyze ${url}: ${errorMessage}`,
      });
    } finally {
      setLoadingAnalysisUrl(null);
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
            Unlock powerful insights from Search Engine Results Pages. Enter your query and let AI provide a comprehensive analysis, then dive deeper by analyzing individual page content.
          </p>
        </header>

        <QueryForm onSubmit={handleQuerySubmit} isLoading={isLoading} />

        {error && (
           <Alert variant="destructive" className="mt-8">
             <Terminal className="h-4 w-4" />
             <AlertTitle>SERP Analysis Failed</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        
        {isLoading && <LoadingSkeleton />}

        {!isLoading && !error && results && (
          <ResultsDisplay 
            serpData={results.serpData} 
            analysis={results.analysis}
            onAnalyzeContent={handleAnalyzeContent}
            analysisByUrl={analysisByUrl}
            loadingAnalysisUrl={loadingAnalysisUrl}
            errorAnalysisByUrl={errorAnalysisByUrl}
          />
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
          &copy; {new Date().getFullYear()} SERP Eye. All rights reserved. <br />
          Content analysis is AI-generated and may require verification. Fetched page content is raw HTML.
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
