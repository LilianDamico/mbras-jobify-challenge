// arquivo: src/components/CategoryFilter.tsx
"use client";

import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Propriedades do filtro de categorias. */
export type CategoryFilterProps = {
  /** Categoria selecionada. Use "" quando nenhuma estiver selecionada. */
  value: string;
  /** Dispara quando o usuário seleciona ou limpa uma categoria. Passe `undefined` para limpar. */
  onChange: (value?: string) => void;
  /** Lista de categorias para exibir. Se omitida, busca do backend (/api/categories). */
  categories?: string[];
  /** Se `true`, usa um espaçamento mais compacto. */
  dense?: boolean;
};

/** Resposta padrão do backend /api/categories */
type CategoryApiItem = { value: string; label: string };

/** Utilitário: classes condicionais. */
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Botão “chip” acessível. */
function ChipButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx("chip", active && "chip--active")}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={active}
      title={label}
    >
      {label}
    </button>
  );
}

/** Busca categorias do backend. */
async function fetchCategories(): Promise<string[]> {
  const { data } = await api.get<CategoryApiItem[]>("/api/categories");
  // aceita tanto [{value,label}] quanto array vazio
  const arr = Array.isArray(data) ? data : [];
  // mapeia para string única (value), deduplica mantendo ordem
  const list = arr.map((c) => c.value || c.label).filter(Boolean);
  return Array.from(new Set(list));
}

function CategoryFilterBase({
  value,
  onChange,
  categories,
  dense,
}: CategoryFilterProps) {
  // Se o caller NÃO passou categories, buscamos do backend
  const { data: fetched, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: !categories,          // só busca se não veio por props
    staleTime: 10 * 60_000,        // 10 min fresh
    gcTime: 60 * 60_000,           // 1h no cache
    retry: 1,                      // evita flood
    refetchOnWindowFocus: false,
  });

  // Decide a lista final (props > fetch > vazia)
  const list = useMemo<string[]>(() => {
    if (categories && categories.length > 0) {
      return Array.from(new Set(categories));
    }
    if (fetched && fetched.length > 0) {
      return fetched;
    }
    return [];
  }, [categories, fetched]);

  return (
    <div
      className={cx("flex flex-wrap items-center", dense ? "gap-1" : "gap-2")}
      role="group"
      aria-label="Filtrar por categoria"
    >
      {/* Botão “Todas” sempre disponível */}
      <ChipButton active={!value} label="Todas" onClick={() => onChange(undefined)} />

      {/* Loading: shimmer de alguns chips */}
      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="chip skeleton w-28 h-[36px]" />
        ))}

      {/* Erro: avisa discretamente, mas mantém controle funcionando */}
      {isError && (
        <span className="text-xs text-[rgb(var(--muted))] ml-2">
          categorias indisponíveis no momento
        </span>
      )}

      {/* Lista real (se houver) */}
      {list.map((cat) => (
        <ChipButton
          key={cat}
          active={value === cat}
          label={cat}
          onClick={() => onChange(cat)}
        />
      ))}
    </div>
  );
}

const CategoryFilter = memo(CategoryFilterBase);
CategoryFilter.displayName = "CategoryFilter";

export default CategoryFilter;
