// src/lib/api.ts
import axios, { AxiosError } from "axios";

/**
 * Base URL do backend (FastAPI).
 * Em dev, defina em .env.local:
 *   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
 * Em produção, usa o backend do Render por padrão.
 */
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://backend-py-fu8j.onrender.com").replace(
  /\/$/,
  ""
);

/** Prefixo real dos endpoints da FastAPI */
const API_PREFIX = "/api";
const p = (path: string) => `${API_PREFIX}${path}`;

/** Cliente Axios compartilhado */
export const api = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20_000,
});

// --------- Tipos usados pela UI ---------

export type UiJob = {
  id: string;
  title: string;
  company?: string | null;
  category?: string | null;
  job_type?: string | null;
  location?: string | null;
  url: string;
  published_at?: string | null;
  is_favorite?: boolean;
  tags?: string[];
};

export type JobsList = {
  items: UiJob[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

// --------- Tipos “brutos” vindos do backend/Remotive ---------

export type RawJob = {
  id?: string | number;
  remotive_id?: string | number;

  title?: string;

  company?: string | null;
  company_name?: string | null;

  category?: string | null;
  job_type?: string | null;
  location?: string | null;

  url?: string | null;
  job_url?: string | null;

  published_at?: string | null;
  created_at?: string | null;
  posted_at?: string | null;

  is_favorite?: boolean;
  tags?: string[];
  skills?: string[];
};

export type JobsApiResponse = {
  items: RawJob[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type FavoritesApiObj = { items: RawJob[] };
export type FavoritesApiResponse = FavoritesApiObj | RawJob[];

// --------- Type guards ---------

function isRawJob(value: unknown): value is RawJob {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    "title" in v ||
    "remotive_id" in v ||
    "id" in v ||
    "company" in v ||
    "company_name" in v
  );
}

function isFavoritesObj(value: unknown): value is FavoritesApiObj {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as FavoritesApiObj).items)
  );
}

// --------- Normalização ---------

function toStringOrEmpty(v: string | number | undefined | null): string {
  if (v === undefined || v === null) return "";
  return String(v);
}

function normalizeJob(j: RawJob): UiJob {
  const id = toStringOrEmpty(j.id ?? j.remotive_id);
  const title = toStringOrEmpty(j.title);
  const url = toStringOrEmpty(j.url ?? j.job_url);

  const company = j.company ?? j.company_name ?? null;
  const category = j.category ?? null;
  const job_type = j.job_type ?? null;
  const location = j.location ?? null;

  const published_at = j.published_at ?? j.created_at ?? j.posted_at ?? null;
  const is_favorite = Boolean(j.is_favorite ?? false);
  const tags = (j.tags ?? j.skills ?? []).slice();

  return {
    id,
    title,
    company,
    category,
    job_type,
    location,
    url: url || "#",
    published_at,
    is_favorite,
    tags,
  };
}

// --------- Helpers ---------

function raise(message: string, err?: unknown): never {
  if (err && axios.isAxiosError(err)) {
    const ax = err as AxiosError;
    const more =
      typeof ax.response?.data === "string"
        ? ` — ${ax.response.data}`
        : ax.response?.status
        ? ` — HTTP ${ax.response.status}`
        : "";
    throw new Error(`${message}${more}`);
  }
  throw new Error(message);
}

// --------- Chamadas de API ---------

export async function fetchJobs(params: {
  q?: string | null;
  category?: string | null;
  page?: number;
  per_page?: number;
}): Promise<JobsList> {
  try {
    const { data } = await api.get<JobsApiResponse>(p("/jobs"), {
      params: {
        q: params.q ?? undefined,
        category: params.category ?? undefined,
        page: params.page ?? 1,
        per_page: params.per_page ?? undefined,
      },
    });

    const normalizedItems: UiJob[] = (data.items ?? [])
      .filter(isRawJob)
      .map(normalizeJob);

    return {
      items: normalizedItems,
      total: typeof data.total === "number" ? data.total : normalizedItems.length,
      page: typeof data.page === "number" ? data.page : 1,
      per_page:
        typeof data.per_page === "number" ? data.per_page : normalizedItems.length,
      total_pages: typeof data.total_pages === "number" ? data.total_pages : 1,
    };
  } catch (err) {
    return raise("Falha ao buscar vagas", err);
  }
}

export async function fetchJobById(id: string): Promise<UiJob> {
  try {
    const { data } = await api.get<RawJob>(p(`/jobs/${encodeURIComponent(id)}`));
    if (!isRawJob(data)) {
      throw new Error("Formato inesperado ao buscar vaga por id");
    }
    return normalizeJob(data);
  } catch (err) {
    return raise("Falha ao buscar vaga por id", err);
  }
}

export async function fetchFavorites(): Promise<UiJob[]> {
  try {
    const { data } = await api.get<FavoritesApiResponse>(p("/favorites"));

    const rawList: RawJob[] = isFavoritesObj(data)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];

    return rawList.filter(isRawJob).map(normalizeJob);
  } catch (err) {
    return raise("Falha ao buscar favoritos", err);
  }
}

export async function favoriteAdd(job_id: string): Promise<void> {
  try {
    await api.post(p("/favorites"), { job_id });
  } catch (err) {
    return raise("Falha ao adicionar favorito", err);
  }
}

export async function favoriteRemove(job_id: string): Promise<void> {
  try {
    await api.delete(p(`/favorites/${encodeURIComponent(job_id)}`));
  } catch (err) {
    return raise("Falha ao remover favorito", err);
  }
}
