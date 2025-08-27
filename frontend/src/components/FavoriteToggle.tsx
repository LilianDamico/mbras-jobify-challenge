"use client";

import { Heart } from "lucide-react";
import { Button } from "./ui/Button";
import { useFavorites, useToggleFavorite } from "@/hooks/favorites";

export function FavoriteToggle({ jobId }: { jobId: string }) {
  const { data: favs } = useFavorites();
  const mutate = useToggleFavorite();

  const isFav = !!favs?.some((j) => j.id === jobId);

  return (
    <Button
      variant={isFav ? "outline" : "ghost"}
      size="sm"
      onClick={() => mutate.mutate(jobId)} 
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className={`mr-2 size-4 ${isFav ? "fill-emerald-600 text-emerald-600" : ""}`} />
      {isFav ? "Favorito" : "Favoritar"}
    </Button>
  );
}
