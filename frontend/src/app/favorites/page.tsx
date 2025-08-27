// src/app/favorites/page.tsx
"use client";

import JobCard from "@/components/ui/JobCard";
import JobCardSkeleton from "@/components/ui/JobCardSkeleton";
import { useFavorites } from "@/hooks/favorites";
import type { UiJob } from "@/lib/api";

/** Usar o mesmo tipo UiJob que o JobCard espera */
type CardJob = UiJob;

/** Possível forma da resposta do backend */
type ApiList<T> = { items: T[] };

/** Um “objeto desconhecido” sem any */
type UnknownRecord = Record<string, unknown>;

/* ---------------- utils seguras (sem any) ---------------- */

const toStringStrict = (v: unknown): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : "";

const toStringOrNull = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = toStringStrict(v);
  return s === "" ? null : s;
};

const toStringArrayOrUndef = (v: unknown): string[] | undefined => {
  if (!Array.isArray(v)) return undefined;
  const onlyStrings = v.filter((x): x is string => typeof x === "string");
  return onlyStrings.length ? onlyStrings : undefined;
};

/** ID estável caso nada venha no payload */
function stableId(): string {
  try {
    // browsers modernos
    return crypto.randomUUID();
  } catch {
    // fallback bem improvável de colidir
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

/** Type guard: dado é { items: [...] } ? */
function isApiList(x: unknown): x is ApiList<UnknownRecord> {
  return typeof x === "object" && x !== null && Array.isArray((x as ApiList<UnknownRecord>).items);
}

/** Normaliza QUALQUER objeto recebido para o formato CardJob */
function normalizeJob(src: UnknownRecord): CardJob {
  const id =
    toStringStrict(src.id) ||
    toStringStrict(src.remotive_id) ||
    toStringStrict(src.uuid) ||
    toStringStrict(src.slug) ||
    stableId();

  const title =
    toStringStrict(src.title) ||
    toStringStrict(src.position) ||
    "Vaga";

  // Corrigir: company pode ser null/undefined
  const company =
    toStringStrict(src.company) ||
    toStringStrict(src.company_name) ||
    toStringStrict(src.companyName) ||
    null; // Mudança aqui: null em vez de ""

  // Corrigir: category pode ser null/undefined  
  const category =
    toStringStrict(src.category) ||
    toStringStrict(src.job_category) ||
    null; // Mudança aqui: null em vez de ""

  const job_type =
    (toStringOrNull(src.job_type) ?? toStringOrNull(src.type)) || null;

  const location =
    (toStringOrNull(src.location) ??
      toStringOrNull(src.candidate_required_location) ??
      toStringOrNull(src.country)) || null;

  const url =
    toStringStrict(src.url) ||
    toStringStrict(src.job_url) ||
    toStringStrict(src.href) ||
    "#";

  const published_at =
    toStringOrNull(src.published_at) ??
    toStringOrNull(src.created_at) ??
    toStringOrNull(src.publication_date);

  // como essa página lista FAVORITOS, deixar true por padrão é ok
  const is_favorite = Boolean(src.is_favorite ?? true);

  const tags =
    toStringArrayOrUndef(src.tags) ??
    toStringArrayOrUndef(src.keywords);

  return {
    id,
    title,
    company,
    category,
    job_type,
    location,
    url,
    published_at,
    is_favorite,
    tags,
  };
}

export default function FavoritesPage() {
  const { data, isLoading, isError, refetch } = useFavorites();

  // Aceita tanto { items: T[] } quanto T[]
  const itemsRaw: UnknownRecord[] = isApiList(data)
    ? data.items
    : Array.isArray(data)
    ? (data as unknown[]).filter(
        (x): x is UnknownRecord => typeof x === "object" && x !== null
      )
    : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Favoritos</h2>
        <div className="card">
          <p className="text-sm text-red-600 mb-3">
            Não foi possível carregar os favoritos.
          </p>
          <button className="btn btn--outline" onClick={() => refetch()}>
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  if (itemsRaw.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Favoritos</h2>
        <p className="text-sm text-neutral-600">Nenhuma vaga favoritada.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Favoritos</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itemsRaw.map((raw) => {
          const job = normalizeJob(raw);
          return <JobCard key={job.id} job={job} />;
        })}
      </div>
    </section>
  );
}
