// arquivo: src/app/page.tsx  (Server Component)
import Link from "next/link";
import LatestJobs from "@/components/LatestJobs";

export const metadata = {
  title: "Jobify — Encontre vagas remotas",
  description:
    "Busque vagas por palavra-chave, filtre por categoria e salve favoritos. Dados atualizados da Remotive via backend próprio.",
};

const CATEGORIES = [
  "Software Development",
  "Customer Support",
  "Design",
  "DevOps",
  "Data",
  "Product",
] as const;

export default function HomePage() {
  return (
    <div className="container py-8">
      <section className="card">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Coluna esquerda — Hero / Busca rápida */}
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Encontre vagas remotas com o perfil do seu próximo passo
            </h1>

            <p className="mt-3 text-[rgb(var(--muted))]">
              Busque por palavra-chave, filtre por categoria e salve seus favoritos.
              Os dados vêm da Remotive através do nosso backend (FastAPI).
            </p>

            <form
              action="/jobs"
              method="get"
              className="mt-4 flex items-center gap-2"
              aria-label="Busca de vagas por palavra-chave"
            >
              <input
                name="q"
                placeholder="ex.: react, golang, data science..."
                className="chip w-full md:w-96"
                aria-label="Pesquisar por palavra-chave"
              />
              <button type="submit" className="btn btn--brand">
                Buscar
              </button>
            </form>

            <nav className="mt-3 flex flex-wrap gap-2" aria-label="Categorias populares">
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/jobs?category=${encodeURIComponent(c)}&page=1`}
                  className="chip"
                  prefetch={false}
                >
                  {c}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex items-center gap-3">
              <Link href="/jobs" className="btn btn--brand" prefetch={false}>
                Ver vagas
              </Link>
              <Link href="/favorites" className="link" prefetch={false}>
                Favoritos
              </Link>
            </div>
          </div>

          {/* Coluna direita — Últimas vagas por tópicos (client component com React Query) */}
          <aside className="space-y-4" aria-label="Destaques recentes">
            <LatestJobs />
          </aside>
        </div>
      </section>
    </div>
  );
}
