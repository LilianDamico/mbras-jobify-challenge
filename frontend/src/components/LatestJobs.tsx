// arquivo: src/components/LatestJobs.tsx
"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Tipo enxuto esperado dos itens do backend */
type JobItem = {
  id?: string | number;
  title?: string;
  company?: string | null;
  company_name?: string | null;
  url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  category?: string | null;
};

type JobsApiResponse = {
  items: JobItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

type LatestJobsProps = {
  /** termos de exemplo exibidos em cards (default: react/python/design) */
  topics?: readonly string[];
  /** quantas vagas por card */
  perTopic?: number;
};

/** Busca N vagas para um termo via backend */
async function fetchSample(q: string, limit: number): Promise<JobItem[]> {
  const { data } = await api.get<JobsApiResponse>("/api/jobs", {
    params: { q, page: 1, per_page: limit },
  });
  return Array.isArray(data?.items) ? data.items : [];
}

export default function LatestJobs({
  topics = ["react", "python", "design"] as const,
  perTopic = 3,
}: LatestJobsProps) {
  // 1 query por tópico, independentes e cacheadas
  const queries = useQueries({
    queries: topics.map((topic) => ({
      queryKey: ["landing", "sample", topic, perTopic] as const,
      queryFn: () => fetchSample(topic, perTopic),
      staleTime: 60_000,          // 1 min “fresh”
      gcTime: 5 * 60_000,         // 5 min no cache
      retry: 1,                   // menos agressivo em prod
      refetchOnWindowFocus: false,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: topics.length }).map((_, i) => (
          <div key={i} className="card skeleton h-28" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card">
        <p className="text-sm text-[rgb(var(--muted))]">
          Não foi possível carregar as vagas agora. Tente novamente em instantes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {queries.map((q, idx) => {
        const list = q.data ?? [];
        const topic = topics[idx];

        return (
          <section key={topic} className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold capitalize">{topic}</h3>
              <Link
                className="link text-sm"
                href={`/jobs?q=${encodeURIComponent(topic)}&page=1`}
                prefetch={false}
              >
                ver mais
              </Link>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-[rgb(var(--muted))]">Sem resultados.</p>
            ) : (
              <ul className="space-y-2">
                {list.map((job, i) => {
                  const id = job.id !== undefined && job.id !== null ? String(job.id) : "";
                  const title = job.title ?? "Vaga";
                  const company = job.company ?? job.company_name ?? "";
                  const url = job.url ?? "";

                  // Preferimos página interna se houver id; caso contrário, abrimos a URL externa.
                  const internalHref = id
                    ? `/jobs/${encodeURIComponent(id)}?url=${encodeURIComponent(url)}`
                    : null;

                  return (
                    <li key={`${topic}-${id || url || i}`} className="text-sm">
                      {internalHref ? (
                        <Link className="link" href={internalHref} prefetch={false}>
                          {title}
                        </Link>
                      ) : (
                        <a
                          className="link"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {title}
                        </a>
                      )}

                      {company && (
                        <span className="ml-2 text-[rgb(var(--muted))]">— {company}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
