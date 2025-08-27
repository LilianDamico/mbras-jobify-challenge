// src/app/jobs/[id]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type JobDetail = {
  id: string;
  title: string;
  company: string | null; // ✅ Permitir null
  category: string | null; // ✅ Permitir null
  job_type?: string | null;
  location?: string | null;
  url: string;
  published_at?: string | null;
  description?: string | null;
  tags?: string[] | null;
};

export const metadata: Metadata = {
  title: "Detalhes da vaga • Jobify",
};

export const dynamic = "force-dynamic";

async function fetchJob(id: string): Promise<JobDetail | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const res = await fetch(`${base}/api/jobs/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as JobDetail;
  } catch {
    return null;
  }
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Promise<{ url?: string }>;
}) {
  const sp = await searchParams;
  const job = await fetchJob(params.id);

  if (!job) {
    if (sp?.url) redirect(sp.url);
    notFound();
  }

  return (
    <main className="container py-8">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-[rgb(var(--muted))]">
              {job.company} • {job.location ?? "Remoto"}
            </p>
          </div>
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn--brand"
          >
            Ver vaga original
          </a>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.category && <span className="chip">{job.category}</span>}
          {job.job_type && <span className="chip">{job.job_type}</span>}
          {job.tags?.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        {job.published_at && (
          <p className="mt-4 text-xs text-[rgb(var(--muted))]">
            Publicada em{" "}
            {new Date(job.published_at).toLocaleDateString("pt-BR")}
          </p>
        )}

        <div className="mt-6 prose max-w-none">
          {job.description ? (
            <div dangerouslySetInnerHTML={{ __html: job.description }} />
          ) : (
            <p className="text-[rgb(var(--muted))]">
              Sem descrição disponível. Acesse a vaga original.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
