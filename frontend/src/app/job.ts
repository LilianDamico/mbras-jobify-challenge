export interface Job {
  id: string;
  remotive_id: string | null;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  posted_at: string | null; 
  description: string | null;
  category_slug?: string | null;
}

export interface JobsResponse {
  items: Job[];
  page: number;
  page_size: number;
  total?: number;
}
