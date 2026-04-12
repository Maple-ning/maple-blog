import { ref } from 'vue';
import { siteIdentity } from '../site';

export interface PublicSiteProfile {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroIntro: string;
  contactEmail: string;
  updatedAt: string;
}

export interface PublicJourneyStage {
  id: string;
  name: string;
  sortOrder: number;
}

export interface PublicJourneyItem {
  id: string;
  stage: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  pinned: boolean;
  sortOrder: number;
  status: string;
  updatedAt: string;
}

export interface PublicInsightItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  pinned: boolean;
  sortOrder: number;
  publishedAt: string;
  status: string;
  updatedAt: string;
}

export interface PublicProjectItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  pinned: boolean;
  sortOrder: number;
  status: string;
  stack: string[];
  sourceUrl: string;
  githubUrl: string;
  updatedAt: string;
  /** 可选：后台 JSON 或未来接口写入后展示汇总星标 */
  githubStars?: number;
  /** 可选：仓库 Fork 数 */
  githubForks?: number;
}

export interface PublicTaxonomyData {
  insightCategories: string[];
  projectTags: string[];
  updatedAt: string;
}

/** 公开接口为 /api/public/*，开发环境需带 /api 前缀 */
const API_BASE =
  import.meta.env.VITE_PUBLIC_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3011/api' : '/api-ai');

const fallbackSiteProfile: PublicSiteProfile = {
  siteName: siteIdentity.name,
  tagline: siteIdentity.subtitle,
  heroTitle: 'AI 内容站点',
  heroIntro: '当前站点会展示后台已发布的学习、资讯和项目内容。',
  contactEmail: 'hello@ai-explore.local',
  updatedAt: '',
};

const fallbackJourney: PublicJourneyItem[] = [];

const fallbackInsights: PublicInsightItem[] = [];

const fallbackProjects: PublicProjectItem[] = [];
const fallbackTaxonomy: PublicTaxonomyData = {
  insightCategories: [],
  projectTags: [],
  updatedAt: '',
};

const siteProfile = ref<PublicSiteProfile>(fallbackSiteProfile);
const journeyItems = ref<PublicJourneyItem[]>(fallbackJourney);
const journeyStages = ref<PublicJourneyStage[]>([]);
const insightItems = ref<PublicInsightItem[]>(fallbackInsights);
const projectItems = ref<PublicProjectItem[]>(fallbackProjects);
const taxonomy = ref<PublicTaxonomyData>(fallbackTaxonomy);
const loading = ref(false);
const errorMessage = ref('');

let loaded = false;
let pendingPromise: Promise<void> | null = null;

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function loadContent(force = false) {
  if (loaded && !force) {
    return;
  }

  if (pendingPromise && !force) {
    return pendingPromise;
  }

  loading.value = true;
  errorMessage.value = '';

  pendingPromise = Promise.all([
    request<PublicSiteProfile>('/public/site-profile'),
    request<PublicJourneyItem[]>('/public/journey'),
    request<PublicInsightItem[]>('/public/insights'),
    request<PublicProjectItem[]>('/public/projects'),
    request<PublicTaxonomyData>('/public/taxonomy'),
  ])
    .then(async ([profile, journey, insights, projects, taxonomyData]) => {
      let stages: PublicJourneyStage[] = [];
      try {
        const data = await request<{ stages: PublicJourneyStage[] }>('/public/journey-stages');
        stages = data.stages || [];
      } catch {
        stages = [];
      }
      siteProfile.value = profile;
      journeyItems.value = journey;
      journeyStages.value = stages;
      insightItems.value = insights;
      projectItems.value = projects;
      taxonomy.value = taxonomyData;
      loaded = true;
    })
    .catch((error) => {
      errorMessage.value =
        error instanceof Error ? error.message : '公开接口暂时不可用，已回退到默认内容。';
      siteProfile.value = fallbackSiteProfile;
      journeyItems.value = fallbackJourney;
      journeyStages.value = [];
      insightItems.value = fallbackInsights;
      projectItems.value = fallbackProjects;
      taxonomy.value = fallbackTaxonomy;
    })
    .finally(() => {
      loading.value = false;
      pendingPromise = null;
    });

  return pendingPromise;
}

export function usePublicContent() {
  return {
    siteProfile,
    journeyItems,
    journeyStages,
    insightItems,
    projectItems,
    taxonomy,
    loading,
    errorMessage,
    loadContent,
  };
}
