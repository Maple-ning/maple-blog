import HomePage from "@/pages/home/index.vue";
import InsightsPage from "@/pages/insights/index.vue";
import JourneyPage from "@/pages/journey/index.vue";
import ProjectsPage from "@/pages/projects/index.vue";
import type { AppRouteRecord } from "@/types/router";

export const appRoutes: AppRouteRecord[] = [
  {
    key: "home",
    label: "首页",
    path: "/",
    title: "AI探索站 · 首页",
    description: "记录 AI 学习之旅、整理 AI 资讯、发布实战项目的个人 AI 探索站。",
    component: HomePage,
  },
  {
    key: "journey",
    label: "学习历程",
    path: "/journey",
    title: "学习历程 · AI探索站",
    description: "记录 AI 学习笔记、阶段进展和技能成长路线。",
    component: JourneyPage,
  },
  {
    key: "insights",
    label: "AI资讯",
    path: "/insights",
    title: "AI资讯 · AI探索站",
    description: "追踪模型发布、研究论文、产品动态和行业观察。",
    component: InsightsPage,
  },
  {
    key: "projects",
    label: "项目分享",
    path: "/projects",
    title: "项目分享 · AI探索站",
    description: "展示 AI 实战项目、源码链接与落地经验。",
    component: ProjectsPage,
  },
];
