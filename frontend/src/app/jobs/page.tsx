// src/app/jobs/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useJobs } from "@/hooks/jobs";
import type { UiJob } from "@/lib/api";
import JobCard from "@/components/ui/JobCard";

function useQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = (patch: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams(searchParams?.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === "" || v === null) sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push(`${pathname}?${sp.toString()}`);
  };

  return { searchParams, set };
}

function JobsContent() {
  const { searchParams, set } = useQueryState();

  const q = searchParams?.get("q") ?? "";
  const page = Number(searchParams?.get("page") ?? "1");

  const [term, setTerm] = useState<string>(q);

  // Sem filtro de categoria – passamos undefined
  const { data, isLoading, isError, isFetching, refetch } = useJobs({
    q,
    category: undefined,
    page,
  });

  const jobs: UiJob[] = data?.items ?? [];
  const totalPages: number = data?.total_pages ?? 1;

  const subtitle = useMemo(() => {
    return q ? `(busca: "${q}")` : "";
  }, [q]);

  return (
    <div className="space-y-6">
      {/* Header / Busca */}
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vagas {subtitle}</h1>
            <p className="text-sm text-[rgb(var(--muted))]">
              Busque por palavra-chave e marque suas favoritas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="ex.: react, golang, data science..."
              className="chip w-72"
            />
            <button
              className="btn btn--brand"
              onClick={() => set({ q: term || undefined, page: 1 })}
            >
              Buscar
            </button>
            {q && (
              <button
                className="btn btn--ghost"
                onClick={() => set({ q: undefined, page: 1 })}
                title="Limpar busca"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          {isFetching && (
            <span className="text-xs text-[rgb(var(--muted))]">Atualizando…</span>
          )}
        </div>
      </div>

      {/* Resultado */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton h-40" />
          ))}
        </div>
      ) : isError ? (
        <div className="card">
          <p className="text-red-600 text-sm mb-3">
            Não foi possível carregar as vagas.
          </p>
          <button className="btn btn--outline" onClick={() => refetch()}>
            Tentar novamente
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card">
          <p className="text-sm text-[rgb(var(--muted))]">
            Nenhuma vaga encontrada para os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn btn--outline"
            disabled={page <= 1}
            onClick={() => set({ page: Math.max(1, page - 1) })}
          >
            ‹ Anterior
          </button>
          <span className="text-sm text-[rgb(var(--muted))]">
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn--outline"
            disabled={page >= totalPages}
            onClick={() => set({ page: Math.min(totalPages, page + 1) })}
          >
            Próxima ›
          </button>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="card skeleton h-40" />}>
      <JobsContent />
    </Suspense>
  );
}
