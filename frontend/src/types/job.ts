// Tipos mínimos para o app compilar bem.
// Ajuste/estenda conforme os campos reais do seu backend.

export interface Job {
  id: number;
  title: string;
  company_name: string;
  category: string;
  url: string;
  location?: string | null;
  salary?: string | null;
  description?: string | null;
  // se vier do Remotive e você guarda esse campo:
  remotive_id?: number | null;
}

export interface JobsResponse {
  // sua API deve devolver neste formato
  items: Job[];
  page: number;
  total_pages: number;
  total: number;
}
