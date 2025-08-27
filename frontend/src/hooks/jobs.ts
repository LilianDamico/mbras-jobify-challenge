// src/hooks/jobs.ts
import { useQuery } from "@tanstack/react-query";
import { fetchJobs, type UiJob } from "@/lib/api";

type Params = {
  q?: string | null;
  category?: string | null;
  page?: number;
  per_page?: number;
};

export type JobsResult = {
  items: UiJob[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export function useJobs({ q, category, page = 1, per_page = 20 }: Params) {
  return useQuery<JobsResult>({
    queryKey: ["jobs", { q: q ?? null, category: category ?? null, page, per_page }],
    queryFn: () => fetchJobs({ q, category, page, per_page }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
