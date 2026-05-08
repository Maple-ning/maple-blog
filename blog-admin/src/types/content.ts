export type PostStatus = 'draft' | 'published';

export interface AdminPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  date: string;
  status: PostStatus;
}

export interface AdminProject {
  id: number;
  name: string;
  description: string;
  url: string;
  sourceCodeUrl: string;
  techStack: string[];
}

export interface AboutProfile {
  name: string;
  tagline: string;
  intro: string;
  focusPoints: string[];
  email: string;
  github: string;
  /** 前台「关于本站」面板正文 */
  siteAbout: string;
}

export interface AdminGoodSite {
  id: number;
  title: string;
  url: string;
  description: string;
  primaryCategory: string;
  secondaryCategory: string;
  category: string;
  sortOrder: number;
}

export interface AdminGoodSiteSecondaryCategory {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
}

export interface AdminGoodSitePrimaryCategory {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
  children: AdminGoodSiteSecondaryCategory[];
}
