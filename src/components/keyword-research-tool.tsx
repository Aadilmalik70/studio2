
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, AlertTriangle, HelpCircle, ListChecks, TrendingUp, CheckCircle } from 'lucide-react'; // Replaced icons
import { Badge } from "@/components/ui/badge"; // Added Badge import

import { fetchKeywordDataAction } from '@/actions/fetch-keyword-data';
import type { KeywordResearchData, KeywordIdea } from '@/types/serp';
import { useToast } from '@/hooks/use-toast';

const keywordResearchFormSchema = z.object({
  seedKeyword: z.string().min(1, "Seed keyword must be at least 1 character long."), // Google Trends allows single char
});

type KeywordResearchFormData = z.infer<typeof keywordResearchFormSchema>;

const LoadingSkeleton: React.FC = () => (
  <div className="mt-8 space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" /> 
      </CardContent>
    </Card>
  </div>
);


export function KeywordResearchTool() {
  const [results, setResults] = useState<KeywordResearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<KeywordResearchFormData>({
    resolver: zodResolver(keywordResearchFormSchema),
    defaultValues: {
      seedKeyword: '',
    },
  });

  const handleKeywordResearchSubmit = async (data: KeywordResearchFormData) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      toast({
        title: "Starting Keyword Research...",
        description: `Fetching Google Trends data for "${data.seedKeyword}".`,
      });
      const fetchedData = await fetchKeywordDataAction(data.seedKeyword);
      setResults(fetchedData);
      toast({
        title: "Keyword Research Complete",
        description: `Google Trends data for "${data.seedKeyword}" fetched successfully.`,
      });
    } catch (e) {
      console.error("Error fetching keyword data:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Keyword Research Failed",
        description: `Could not fetch data: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Keyword Trends & Ideas</CardTitle>
          <CardDescription>
            Enter a seed keyword to discover related queries and questions from Google Trends via SerpApi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleKeywordResearchSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="seedKeyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="seedKeyword" className="text-base">Seed Keyword</FormLabel>
                    <FormControl>
                      <Input id="seedKeyword" placeholder="e.g., 'ai content creation'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching Trends...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Research Trends
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && <LoadingSkeleton />}

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Research Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && results && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" />
                Related Queries for "{results.seedKeyword}"
              </CardTitle>
              <CardDescription>
                Explore related queries and their relative interest score (0-100) from Google Trends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.relatedKeywords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-right">
                        <span className="flex items-center justify-end gap-1">
                           <TrendingUp className="h-4 w-4" /> Interest Score
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className="flex items-center justify-end gap-1">
                           <CheckCircle className="h-4 w-4" /> Type
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.relatedKeywords.map((idea) => (
                      <TableRow key={`${idea.keyword}-${idea.type}`}>
                        <TableCell className="font-medium">{idea.keyword}</TableCell>
                        <TableCell className="text-right">{idea.interestScore !== undefined ? idea.interestScore : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {idea.type === 'top' && <Badge variant="secondary">Top</Badge>}
                          {idea.type === 'rising' && <Badge variant="outline" className="text-accent border-accent">Rising</Badge>}
                          {!idea.type && 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No related queries found for this term in Google Trends.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Potential Questions
              </CardTitle>
              <CardDescription>
                Queries phrased as questions related to "{results.seedKeyword}", derived from Google Trends data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.questions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {results.questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No related queries phrased as questions found in Google Trends.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
