"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UiJob } from "@/lib/api"; // ✅ Usar UiJob ao invés de Job

/**
 * Lista favoritos do backend.
 * Aceita dois formatos de resposta:
 *   - UiJob[]
 *   - { items: UiJob[] }
 */
export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await api.get<UiJob[] | { items?: UiJob[] }>("/favorites");
      const items = Array.isArray(data) ? data : data.items ?? [];
      return items as UiJob[];
    },
    staleTime: 30_000,
  });
}

/**
 * Alterna favorito de uma vaga.
 * Endpoint esperado: POST /api/favorites/:jobId/toggle
 */
export function useToggleFavorite() {
  const qc = useQueryClient();

  return useMutation({
    // ✅ Corrigir para aceitar apenas string
    mutationFn: async (jobId: string) => {
      const { data } = await api.post(`/favorites/${encodeURIComponent(jobId)}/toggle`);
      return data as { is_favorite: boolean };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
