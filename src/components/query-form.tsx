"use client";

import type * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Loader2 } from 'lucide-react';

const queryFormSchema = z.object({
  query: z.string().min(3, "Search query must be at least 3 characters long."),
  searchEngine: z.enum(["google", "bing", "duckduckgo"]).default("google"),
  numResults: z.coerce.number().int().min(5).max(50).default(10),
  geoLocation: z.string().optional(),
});

export type QueryFormData = z.infer<typeof queryFormSchema>;

interface QueryFormProps {
  onSubmit: (data: QueryFormData) => void;
  isLoading: boolean;
}

export function QueryForm({ onSubmit, isLoading }: QueryFormProps) {
  const form = useForm<QueryFormData>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: {
      query: '',
      searchEngine: 'google',
      numResults: 10,
      geoLocation: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card rounded-lg shadow-lg">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="query" className="text-lg font-semibold">Search Query</FormLabel>
              <FormControl>
                <Input id="query" placeholder="e.g., 'best NextJS practices'" {...field} className="text-base" />
              </FormControl>
              <FormDescription>
                Enter the keyword or phrase you want to analyze.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="searchEngine"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="searchEngine">Search Engine</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} name="searchEngine">
                  <FormControl>
                    <SelectTrigger id="searchEngine">
                      <SelectValue placeholder="Select search engine" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="bing">Bing</SelectItem>
                    <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numResults"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="numResults">Number of Results</FormLabel>
                <FormControl>
                  <Input id="numResults" type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="geoLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="geoLocation">Geographic Location (Optional)</FormLabel>
                <FormControl>
                  <Input id="geoLocation" placeholder="e.g., 'New York, US'" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full md:w-auto text-lg py-3 px-6" disabled={isLoading} aria-label="Analyze SERP">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze SERP
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
