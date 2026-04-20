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
  githubStars?: number;
  githubForks?: number;
}

export interface PublicConceptGraphNode {
  name: string;
  category: string;
  desc: string;
  example: string;
  symbolSize?: number;
}

export interface PublicConceptGraphEdge {
  source: string;
  target: string;
  relation: string;
  description: string;
}

export interface PublicConceptGraphContent {
  nodes: PublicConceptGraphNode[];
  edges: PublicConceptGraphEdge[];
  updatedAt: string;
}

export interface PublicTaxonomyData {
  insightCategories: string[];
  projectTags: string[];
  updatedAt: string;
}

export interface PublicContentBundle {
  siteProfile: PublicSiteProfile;
  journeyItems: PublicJourneyItem[];
  journeyStages: PublicJourneyStage[];
  insightItems: PublicInsightItem[];
  projectItems: PublicProjectItem[];
  taxonomy: PublicTaxonomyData;
  conceptGraph: PublicConceptGraphContent;
}
