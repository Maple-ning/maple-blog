/** 与 blog-ai 前台 hash 路由一一对应：/ → 首页，/journey、/insights、/projects；/site 为全站配置 */
export const adminRoutes = [
  { path: '/', label: '首页' },
  { path: '/journey', label: '学习历程' },
  { path: '/insights', label: 'AI资讯' },
  { path: '/projects', label: '项目分享' },
  { path: '/site', label: '站点设置' },
] as const;

export type AdminRoutePath = (typeof adminRoutes)[number]['path'];
