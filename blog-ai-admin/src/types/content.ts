export interface SiteProfile {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroIntro: string;
  contactEmail: string;
  updatedAt: string;
}

/** 学习历程阶段：独立维护顺序与名称，笔记通过 stageId / stage 关联 */
export interface JourneyStage {
  id: string;
  name: string;
  sortOrder: number;
}

export interface JourneyItem {
  id: string;
  stage: string;
  /** 与 journeyStages 中 id 对应；旧数据可能为空，由名称回退 */
  stageId?: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  pinned: boolean;
  sortOrder: number;
  status: string;
  updatedAt: string;
}

export interface InsightItem {
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

export interface ProjectItem {
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
}

export interface ConceptGraphNode {
  name: string;
  category: string;
  desc: string;
  example: string;
  symbolSize?: number;
}

export interface ConceptGraphEdge {
  source: string;
  target: string;
  relation: string;
  description: string;
}

export interface ConceptGraphContent {
  nodes: ConceptGraphNode[];
  edges: ConceptGraphEdge[];
  updatedAt: string;
}

export interface DashboardData {
  siteName: string;
  counts: {
    journey: number;
    insights: number;
    projects: number;
  };
  latest: {
    journey: JourneyItem[];
    insights: InsightItem[];
    projects: ProjectItem[];
  };
  updatedAt: string;
}

export interface TaxonomyData {
  insightCategories: string[];
  projectTags: string[];
  updatedAt: string;
}

export type ContentSource = 'journey' | 'insight' | 'project';

export type ContentItem = JourneyItem | InsightItem | ProjectItem;

export interface JourneyPostEntry {
  id: string;
  source: 'journey';
  raw: JourneyItem;
  title: string;
  category: string;
  categoryClass: string;
  status: string;
  date: string;
  description: string;
}

export interface InsightPostEntry {
  id: string;
  source: 'insight';
  raw: InsightItem;
  title: string;
  category: string;
  categoryClass: string;
  status: string;
  date: string;
  description: string;
}

export interface ProjectPostEntry {
  id: string;
  source: 'project';
  raw: ProjectItem;
  title: string;
  category: string;
  categoryClass: string;
  status: string;
  date: string;
  description: string;
}

export type AdminPostEntry = JourneyPostEntry | InsightPostEntry | ProjectPostEntry;
