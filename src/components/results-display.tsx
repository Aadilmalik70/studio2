
"use client";

import type { SerpData, SerpResultItem, ContentAnalysisData } from '@/types/serp';
import type { AnalyzeSerpOutput } from '@/ai/flows/analyze-serp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Newspaper, Star, HelpCircle, Megaphone, Sparkles, ExternalLink, BrainCircuit, Loader2, AlertTriangle } from 'lucide-react';

interface ResultsDisplayProps {
  serpData: SerpData;
  analysis: AnalyzeSerpOutput;
  onAnalyzeContent: (url: string, query: string) => void;
  analysisByUrl: Record<string, ContentAnalysisData | null>;
  loadingAnalysisUrl: string | null;
  errorAnalysisByUrl: Record<string, string | null>;
}

const ResultItemCard: React.FC<{ 
  item: SerpResultItem; 
  index: number;
  query: string;
  onAnalyzeContent: (url: string, query: string) => void;
  analysisData: ContentAnalysisData | null;
  isLoading: boolean;
  error: string | null;
}> = ({ item, index, query, onAnalyzeContent, analysisData, isLoading, error }) => (
  <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden">
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between mb-1 gap-2">
        <CardTitle className="text-lg text-primary leading-tight">{`${index + 1}. ${item.title}`}</CardTitle>
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center shrink-0">
          Visit <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground truncate ">{item.link}</p>
    </CardHeader>
    <CardContent className="pb-3 pt-1">
      <p className="text-sm">{item.snippet}</p>
    </CardContent>
    <CardFooter className="flex-col items-start gap-3 pt-0 pb-4 px-6">
       <Button 
        onClick={() => onAnalyzeContent(item.link, query)} 
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Content...
          </>
        ) : (
          <>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Analyze Content Gaps
          </>
        )}
      </Button>
      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      {analysisData && !isLoading && !error && (
        <Card className="w-full mt-3 bg-background/50 p-0">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Content Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm px-4 pb-4">
            <div className="mb-2">
              <h4 className="font-semibold text-primary/90">Gap Summary:</h4>
              <p className="text-xs">{analysisData.gapSummary}</p>
            </div>
            <div className="mb-2">
              <h4 className="font-semibold text-primary/90">Improvement Suggestions:</h4>
              <ul className="list-disc pl-4 text-xs space-y-0.5">
                {analysisData.improvementSuggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary/90">Keyword Opportunities:</h4>
              <ul className="list-disc pl-4 text-xs space-y-0.5">
                {analysisData.keywordOpportunities.map((keyword, i) => (
                  <li key={i}>{keyword}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </CardFooter>
  </Card>
);

export function ResultsDisplay({ 
  serpData, 
  analysis, 
  onAnalyzeContent,
  analysisByUrl,
  loadingAnalysisUrl,
  errorAnalysisByUrl 
}: ResultsDisplayProps) {
  return (
    <div className="mt-12 space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl gap-2">
            <Sparkles className="h-7 w-7 text-accent" />
            AI SERP Analysis Summary
          </CardTitle>
          <CardDescription>
            AI-generated overview of the SERP landscape for your query: "{serpData.query}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["organic-results"]} className="w-full space-y-4">
        {serpData.featuredSnippet && (
          <AccordionItem value="featured-snippet">
             <Card className="overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-xl hover:no-underline bg-primary/10">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Featured Snippet
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-1">{serpData.featuredSnippet.title}</h3>
                <a href={serpData.featuredSnippet.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center mb-2">
                  {serpData.featuredSnippet.link} <ExternalLink className="ml-1 h-4 w-4" />
                </a>
                <p className="text-base">{serpData.featuredSnippet.snippet}</p>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}

        {serpData.organicResults && serpData.organicResults.length > 0 && (
          <AccordionItem value="organic-results">
            <Card className="overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-xl hover:no-underline">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-6 w-6 text-primary" />
                  Organic Results <Badge variant="secondary" className="ml-2">{serpData.organicResults.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6">
                {serpData.organicResults.map((item, index) => (
                  <ResultItemCard 
                    key={`organic-${index}-${item.link}`} 
                    item={item} 
                    index={index}
                    query={serpData.query}
                    onAnalyzeContent={onAnalyzeContent}
                    analysisData={analysisByUrl[item.link] || null}
                    isLoading={loadingAnalysisUrl === item.link}
                    error={errorAnalysisByUrl[item.link] || null}
                  />
                ))}
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}

        {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
          <AccordionItem value="paa">
            <Card className="overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-xl hover:no-underline">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-blue-500" />
                  People Also Ask <Badge variant="secondary" className="ml-2">{serpData.peopleAlsoAsk.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6">
                <ul className="list-disc pl-5 space-y-2">
                  {serpData.peopleAlsoAsk.map((question, index) => (
                    <li key={`paa-${index}`} className="text-base">{question}</li>
                  ))}
                </ul>
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}

        {serpData.ads && serpData.ads.length > 0 && (
          <AccordionItem value="ads">
            <Card className="overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-xl hover:no-underline">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-green-500" />
                  Advertisements <Badge variant="secondary" className="ml-2">{serpData.ads.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6">
                {serpData.ads.map((item, index) => (
                   <ResultItemCard 
                    key={`ad-${index}-${item.link}`} 
                    item={item} 
                    index={index}
                    query={serpData.query} // Ads might not be suitable for content gap analysis, but pass query for consistency
                    onAnalyzeContent={onAnalyzeContent}
                    analysisData={analysisByUrl[item.link] || null}
                    isLoading={loadingAnalysisUrl === item.link}
                    error={errorAnalysisByUrl[item.link] || null}
                  />
                ))}
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}

