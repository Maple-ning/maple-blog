import DashboardPage from "@/pages/dashboard/index.vue";
import ConceptGraphPage from "@/pages/concept-graph/index.vue";
import InsightsPage from "@/pages/insights/index.vue";
import JourneyPage from "@/pages/journey/index.vue";
import ProjectsPage from "@/pages/projects/index.vue";
import SiteSettingsPage from "@/pages/site-settings/index.vue";
import type { AdminRouteRecord } from "@/types/router";

export const adminRoutes: AdminRouteRecord[] = [
  { path: "/", label: "首页", component: DashboardPage },
  { path: "/journey", label: "学习历程", component: JourneyPage },
  { path: "/insights", label: "AI资讯", component: InsightsPage },
  { path: "/projects", label: "项目分享", component: ProjectsPage },
  { path: "/concept-graph", label: "概念图谱", component: ConceptGraphPage },
  { path: "/site", label: "站点设置", component: SiteSettingsPage },
];
