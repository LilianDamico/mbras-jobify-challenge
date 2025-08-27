// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { Providers } from "./providers";

export const metadata = {
  title: "Jobify",
  description: "Painel de vagas - MBrás challenge",
};

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
  >
    {children}
  </Link>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* flex + min-h-screen para o footer ficar colado no final */}
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          {/* HEADER */}
          <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] glass">
            <div className="container h-16 flex items-center gap-6">
              <Link href="/jobs" className="flex items-center gap-2 group">
                <div className="size-8 rounded-xl" style={{ background: `rgb(var(--brand))` }} />
                <span className="font-bold tracking-tight text-lg group-hover:opacity-90">
                  Jobify
                </span>
              </Link>

              <nav className="ml-auto hidden sm:flex items-center text-sm text-[rgb(var(--muted))]">
                <NavLink href="/jobs">Vagas</NavLink>
                <NavLink href="/favorites">Favoritos</NavLink>
                <Link className="btn btn--brand ml-3" href="/jobs?q=react">
                  Explorar
                </Link>
              </nav>
            </div>
          </header>

          {/* CONTEÚDO */}
          <main className="container py-8 flex-1">{children}</main>

          {/* FOOTER */}
          <footer className="mt-auto border-t border-[rgb(var(--border))] py-10 text-sm text-[rgb(var(--muted))]">
            <div className="container flex items-center justify-between">
              <span>© {new Date().getFullYear()} Jobify</span>
              <span>
                Feito com <span className="text-[rgb(var(--brand))]">FastAPI</span> + Next.js
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
