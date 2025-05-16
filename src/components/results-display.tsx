"use client";

import type { SerpData, SerpResultItem } from '@/types/serp';
import type { AnalyzeSerpOutput } from '@/ai/flows/analyze-serp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Star, HelpCircle, Megaphone, Sparkles, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface ResultsDisplayProps {
  serpData: SerpData;
  analysis: AnalyzeSerpOutput;
}

const ResultItemCard: React.FC<{ item: SerpResultItem, index: number }> = ({ item, index }) => (
  <div className="mb-4 p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow bg-background">
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-lg font-semibold text-primary">{`${index + 1}. ${item.title}`}</h3>
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center">
        Visit <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    </div>
    <p className="text-sm text-muted-foreground truncate ">{item.link}</p>
    <p className="mt-2 text-sm">{item.snippet}</p>
  </div>
);

export function ResultsDisplay({ serpData, analysis }: ResultsDisplayProps) {
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

      <Accordion type="multiple" collapsible className="w-full space-y-4">
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
                  <ResultItemCard key={`organic-${index}`} item={item} index={index}/>
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
                   <ResultItemCard key={`ad-${index}`} item={item} index={index}/>
                ))}
              </AccordionContent>
            </Card>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
