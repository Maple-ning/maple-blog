export type RouteKey = 'home' | 'journey' | 'insights' | 'projects';

export interface AppRoute {
  key: RouteKey;
  label: string;
  path: string;
  title: string;
  description: string;
}

export const routes: AppRoute[] = [
  {
    key: 'home',
    label: '首页',
    path: '/',
    title: 'AI探索站 · 首页',
    description: '记录 AI 学习之旅、整理 AI 资讯、发布实战项目的个人 AI 探索站。',
  },
  {
    key: 'journey',
    label: '学习历程',
    path: '/journey',
    title: '学习历程 · AI探索站',
    description: '记录 AI 学习笔记、阶段进展和技能成长路线。',
  },
  {
    key: 'insights',
    label: 'AI资讯',
    path: '/insights',
    title: 'AI资讯 · AI探索站',
    description: '追踪模型发布、研究论文、产品动态和行业观察。',
  },
  {
    key: 'projects',
    label: '项目分享',
    path: '/projects',
    title: '项目分享 · AI探索站',
    description: '展示 AI 实战项目、源码链接与落地经验。',
  },
] as const;

export const siteIdentity = {
  name: 'AI探索站',
  subtitle: '记录 AI 学习之旅',
  slogan: '记录每一步，分享每一刻',
  blogHomeUrl: '/blog/',
  adminUrl: '/ai-admin/',
};

export const homeStats = [
  { value: '48', label: '学习笔记' },
  { value: '120+', label: 'AI资讯' },
  { value: '15', label: '实战项目' },
] as const;
