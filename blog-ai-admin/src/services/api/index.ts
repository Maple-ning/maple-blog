import type {
  ConceptGraphContent,
  DashboardData,
  InsightItem,
  JourneyItem,
  JourneyStage,
  ProjectItem,
  SiteProfile,
  TaxonomyData,
} from "@/types/content";

/** 与 blog-ai-server 一致：业务路由均在 /api 下（生产由 Nginx /api-ai/ 转到上游 /api/） */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3011/api' : '/api-ai');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<DashboardData>('/dashboard'),
  getSiteProfile: () => request<SiteProfile>('/site-profile'),
  getTaxonomy: () => request<TaxonomyData>('/taxonomy'),
  updateSiteProfile: (payload: SiteProfile) =>
    request<SiteProfile>('/site-profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateTaxonomy: (payload: TaxonomyData) =>
    request<TaxonomyData>('/taxonomy', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getJourneyStages: () => request<{ stages: JourneyStage[] }>('/journey-stages'),
  updateJourneyStages: (stages: JourneyStage[]) =>
    request<{ stages: JourneyStage[] }>('/journey-stages', {
      method: 'PUT',
      body: JSON.stringify({ stages }),
    }),
  getJourney: () => request<JourneyItem[]>('/journey'),
  createJourney: (payload: Omit<JourneyItem, 'id' | 'updatedAt'>) =>
    request<JourneyItem>('/journey', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateJourney: (id: string, payload: JourneyItem) =>
    request<JourneyItem>(`/journey/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteJourney: (id: string) =>
    request<{ ok: boolean; id: string }>(`/journey/${id}`, {
      method: 'DELETE',
    }),
  getInsights: () => request<InsightItem[]>('/insights'),
  createInsight: (payload: Omit<InsightItem, 'id' | 'updatedAt'>) =>
    request<InsightItem>('/insights', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateInsight: (id: string, payload: InsightItem) =>
    request<InsightItem>(`/insights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteInsight: (id: string) =>
    request<{ ok: boolean; id: string }>(`/insights/${id}`, {
      method: 'DELETE',
    }),
  getProjects: () => request<ProjectItem[]>('/projects'),
  createProject: (payload: Omit<ProjectItem, 'id' | 'updatedAt'>) =>
    request<ProjectItem>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProject: (id: string, payload: ProjectItem) =>
    request<ProjectItem>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProject: (id: string) =>
    request<{ ok: boolean; id: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
  getConceptGraph: () => request<ConceptGraphContent>('/concept-graph'),
  updateConceptGraph: (payload: ConceptGraphContent) =>
    request<ConceptGraphContent>('/concept-graph', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
