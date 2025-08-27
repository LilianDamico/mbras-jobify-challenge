// src/components/ui/JobCard.tsx
import type { UiJob } from "@/lib/api";

type JobCardProps = {
  job: UiJob;
};

export default function JobCard({ job }: JobCardProps) {
  const {
    id,
    title,
    url,
    company,
    category,
    job_type,
    location,
    published_at,
    // is_favorite, // ← Remover esta linha
    tags,
  } = job;

  // defaults para renderização
  const companySafe = company ?? "";
  const categorySafe = category ?? "";
  const publishedSafe = published_at ?? "";

  return (
    <article className="card">
      <h3 className="font-semibold">
        <a href={url} target="_blank" rel="noopener noreferrer" className="link">
          {title}
        </a>
      </h3>

      <p className="text-sm text-[rgb(var(--muted))]">
        {companySafe}
        {companySafe && categorySafe ? " · " : ""}
        {categorySafe}
      </p>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[rgb(var(--muted))]">
        {job_type && <span className="chip">{job_type}</span>}
        {location && <span className="chip">{location}</span>}
        {publishedSafe && <span className="chip">{publishedSafe}</span>}
        {Array.isArray(tags) &&
          tags.slice(0, 3).map((t) => (
            <span key={`${id}-${t}`} className="chip">
              {t}
            </span>
          ))}
      </div>
    </article>
  );
}
