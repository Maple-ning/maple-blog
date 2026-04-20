export interface PostApiItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  tags: unknown;
  date: string;
  status: 'draft' | 'published';
}

export interface ProfileApiItem {
  name: string;
  tagline?: string;
  intro: string;
  focus_points?: unknown;
  email: string;
  github: string;
  site_about?: string | null;
}

export interface ProjectApiItem {
  id: number;
  name: string;
  description: string;
  tech_stack: unknown;
  url: string;
  source_code_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GoodSiteApiItem {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  sort_order: number;
}
