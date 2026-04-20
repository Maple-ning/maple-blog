<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AdminLayout from "@/layouts/admin-layout/index.vue";
import { useHashRoute } from "@/router";
import { api } from "@/services/api";
import type {
  AdminPostEntry,
  ConceptGraphContent,
  InsightItem,
  JourneyItem,
  JourneyStage,
  ProjectItem,
  SiteProfile,
} from "@/types/content";
import { formatDate } from "@/utils/format";

type ProjectDraft = Omit<ProjectItem, "id" | "updatedAt">;
type PostCategory = "journey" | "insight" | "project";
type PostEditorPayload = {
  id: string;
  source: PostCategory;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  pinned: boolean;
  sortOrder: number;
  status: string;
  stage: string;
  stageId: string;
  category: string;
  publishedAt: string;
  stack: string;
  sourceUrl: string;
  githubUrl: string;
};

const { routes, currentPath, currentRoute, routeHref } = useHashRoute();

const loading = ref(true);
const errorMessage = ref("");
const notice = ref("");
const addProjectModalOpen = ref(false);

const siteProfile = ref<SiteProfile>({
  siteName: "",
  tagline: "",
  heroTitle: "",
  heroIntro: "",
  contactEmail: "",
  updatedAt: "",
});
const journeyItems = ref<JourneyItem[]>([]);
const journeyStages = ref<JourneyStage[]>([]);
const insightItems = ref<InsightItem[]>([]);
const projectItems = ref<ProjectItem[]>([]);
const conceptGraph = ref<ConceptGraphContent>({
  nodes: [],
  edges: [],
  updatedAt: "",
});

const projectForm = ref<ProjectDraft>({
  title: "",
  summary: "",
  body: "",
  coverImage: "",
  pinned: false,
  sortOrder: 0,
  status: "planned",
  stack: [],
  sourceUrl: "",
  githubUrl: "",
});

function sortAdminEntries(left: AdminPostEntry, right: AdminPostEntry) {
  if (left.raw.pinned !== right.raw.pinned) {
    return left.raw.pinned ? -1 : 1;
  }
  const orderDiff = left.raw.sortOrder - right.raw.sortOrder;
  if (orderDiff !== 0) {
    return orderDiff;
  }
  const leftTime = new Date(
    ("publishedAt" in left.raw ? left.raw.publishedAt : "") ||
      left.raw.updatedAt ||
      left.date,
  ).getTime();
  const rightTime = new Date(
    ("publishedAt" in right.raw ? right.raw.publishedAt : "") ||
      right.raw.updatedAt ||
      right.date,
  ).getTime();
  return rightTime - leftTime;
}

const journeyPosts = computed<AdminPostEntry[]>(() =>
  journeyItems.value
    .map((item) => ({
      id: `journey-${item.id}`,
      source: "journey" as const,
      raw: item,
      title: item.title,
      category: "学习笔记",
      categoryClass: "tag--blue",
      status: item.status,
      date: formatDate(item.updatedAt),
      description: item.summary,
    }))
    .sort(sortAdminEntries),
);

const insightPosts = computed<AdminPostEntry[]>(() =>
  insightItems.value
    .map((item) => ({
      id: `insight-${item.id}`,
      source: "insight" as const,
      raw: item,
      title: item.title,
      category: item.category || "AI资讯",
      categoryClass: "tag--purple",
      status: item.status,
      date: formatDate(item.publishedAt || item.updatedAt),
      description: item.summary,
    }))
    .sort(sortAdminEntries),
);

const projectAdminEntries = computed<AdminPostEntry[]>(() =>
  projectItems.value
    .map((item) => ({
      id: `project-${item.id}`,
      source: "project" as const,
      raw: item,
      title: item.title,
      category: "项目分享",
      categoryClass: "tag--green",
      status: item.status,
      date: formatDate(item.updatedAt),
      description: item.summary,
    }))
    .sort(sortAdminEntries),
);

const allPosts = computed<AdminPostEntry[]>(() =>
  [
    ...journeyPosts.value,
    ...insightPosts.value,
    ...projectAdminEntries.value,
  ].sort(sortAdminEntries),
);

const stats = computed(() => {
  const updatedTimes = allPosts.value
    .map((entry) => new Date(entry.raw.updatedAt).getTime())
    .filter((value) => !Number.isNaN(value));
  const latestTime = updatedTimes.length ? Math.max(...updatedTimes) : NaN;

  return [
    {
      icon: "📚",
      value: journeyItems.value.length,
      label: "学习笔记",
      color: "var(--color-primary)",
      bg: "var(--color-primary-soft)",
      trend: "真实数据同步",
      trendClass: "trend-up",
    },
    {
      icon: "📰",
      value: insightItems.value.length,
      label: "AI资讯",
      color: "#7c3aed",
      bg: "var(--color-purple-soft)",
      trend: "统一后台维护",
      trendClass: "trend-up",
    },
    {
      icon: "🚀",
      value: projectItems.value.length,
      label: "项目分享",
      color: "var(--color-success)",
      bg: "var(--color-green-soft)",
      trend: "前台卡片直出",
      trendClass: "trend-up",
    },
    {
      icon: "🕒",
      value: Number.isNaN(latestTime)
        ? "未更新"
        : formatDate(new Date(latestTime).toISOString()),
      label: "最近内容更新",
      color: "#ea580c",
      bg: "var(--color-orange-soft)",
      trend: "保存后立即生效",
      trendClass: "trend-up",
    },
  ];
});

const contentDistribution = computed(() => {
  const total =
    journeyItems.value.length +
    insightItems.value.length +
    projectItems.value.length;
  const resolveWidth = (count: number) =>
    `${Math.max(total ? (count / total) * 100 : 0, count ? 12 : 0)}%`;
  return [
    {
      label: "学习笔记",
      count: journeyItems.value.length,
      width: resolveWidth(journeyItems.value.length),
      color: "var(--color-primary)",
    },
    {
      label: "AI资讯",
      count: insightItems.value.length,
      width: resolveWidth(insightItems.value.length),
      color: "#7c3aed",
    },
    {
      label: "项目分享",
      count: projectItems.value.length,
      width: resolveWidth(projectItems.value.length),
      color: "var(--color-success)",
    },
  ];
});

const recentEntries = computed(() => allPosts.value.slice(0, 6));

watch(
  () => currentRoute.value.label,
  (value) => {
    document.title = `${value} · AI探索站后台`;
  },
  { immediate: true },
);

function openProjectModal() {
  addProjectModalOpen.value = true;
}

function closeProjectModal() {
  addProjectModalOpen.value = false;
}

function editEntry(entry: AdminPostEntry) {
  const path =
    entry.source === "journey"
      ? "/journey"
      : entry.source === "insight"
        ? "/insights"
        : "/projects";
  if (currentPath.value !== path) {
    window.location.hash = routeHref(path).replace("#", "");
  }
  window.setTimeout(() => {
    const editButton = document.querySelector(
      `[data-entry-id="${entry.id}"]`,
    ) as HTMLButtonElement | null;
    editButton?.click();
  }, 0);
}

function setNotice(message: string) {
  notice.value = message;
  window.setTimeout(() => {
    if (notice.value === message) notice.value = "";
  }, 2400);
}

function statusBadge(status: string) {
  if (status === "published") return { label: "已发布", cls: "badge--green" };
  if (status === "in-progress")
    return { label: "进行中", cls: "badge--orange" };
  if (status === "planned") return { label: "规划中", cls: "badge--orange" };
  return { label: "草稿", cls: "badge--orange" };
}

async function loadAll() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const [
      profileData,
      journeyStagesData,
      journeyData,
      insightsData,
      projectsData,
      conceptGraphData,
    ] = await Promise.all([
      api.getSiteProfile(),
      api.getJourneyStages(),
      api.getJourney(),
      api.getInsights(),
      api.getProjects(),
      api.getConceptGraph(),
    ]);
    siteProfile.value = profileData;
    journeyStages.value = journeyStagesData.stages || [];
    journeyItems.value = journeyData;
    insightItems.value = insightsData;
    projectItems.value = projectsData;
    conceptGraph.value = conceptGraphData;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error);
  } finally {
    loading.value = false;
  }
}

async function saveJourneyStages(stages: JourneyStage[]) {
  try {
    const { stages: next } = await api.updateJourneyStages(stages);
    journeyStages.value = next;
    journeyItems.value = await api.getJourney();
    setNotice("学习阶段已保存");
  } catch (error) {
    setNotice(error instanceof Error ? error.message : String(error));
  }
}

async function saveSiteProfile(payload: SiteProfile) {
  siteProfile.value = await api.updateSiteProfile(payload);
  setNotice("站点信息已保存");
}

async function saveConceptGraph(payload: ConceptGraphContent) {
  try {
    conceptGraph.value = await api.updateConceptGraph(payload);
    setNotice("概念图谱已保存");
  } catch (error) {
    setNotice(error instanceof Error ? error.message : String(error));
  }
}

async function submitProjectForm() {
  if (!projectForm.value.title.trim()) {
    setNotice("请先填写项目名称");
    return;
  }

  if (!projectForm.value.summary.trim()) {
    setNotice("请补充项目说明");
    return;
  }

  const nextItem = await api.createProject({
    ...projectForm.value,
    pinned: false,
  });
  projectItems.value = [nextItem, ...projectItems.value];
  projectForm.value = {
    title: "",
    summary: "",
    body: "",
    coverImage: "",
    pinned: false,
    sortOrder: 0,
    status: "planned",
    stack: [],
    sourceUrl: "",
    githubUrl: "",
  };
  closeProjectModal();
  setNotice("项目已添加");
}

function updateProjectFormStack(value: string) {
  projectForm.value.stack = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function publishEntry(id: string) {
  const entry = allPosts.value.find((item) => item.id === id);
  if (!entry) return;

  if (entry.source === "journey") {
    const updated = await api.updateJourney(entry.raw.id, {
      ...entry.raw,
      status: "published",
    });
    journeyItems.value = journeyItems.value.map((item) =>
      item.id === updated.id ? updated : item,
    );
  } else if (entry.source === "insight") {
    const updated = await api.updateInsight(entry.raw.id, {
      ...entry.raw,
      status: "published",
      publishedAt:
        entry.raw.publishedAt || new Date().toISOString().slice(0, 10),
    });
    insightItems.value = insightItems.value.map((item) =>
      item.id === updated.id ? updated : item,
    );
  } else {
    const updated = await api.updateProject(entry.raw.id, {
      ...entry.raw,
      status: "published",
    });
    projectItems.value = projectItems.value.map((item) =>
      item.id === updated.id ? updated : item,
    );
  }

  setNotice("内容已发布");
}

async function savePost(payload: PostEditorPayload) {
  if (!payload.title.trim()) {
    setNotice("标题不能为空");
    return;
  }

  if (payload.source === "journey") {
    const current = journeyItems.value.find(
      (item) => `journey-${item.id}` === payload.id,
    );
    if (!current) return;
    const updated = await api.updateJourney(current.id, {
      ...current,
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      body: payload.body.trim() || payload.summary.trim(),
      coverImage: payload.coverImage.trim(),
      pinned: payload.pinned,
      sortOrder: payload.sortOrder,
      status: payload.status || current.status,
      stageId: payload.stageId,
      stage: payload.stage.trim() || current.stage,
    });
    journeyItems.value = journeyItems.value.map((item) =>
      item.id === updated.id ? updated : item,
    );
  } else if (payload.source === "insight") {
    const current = insightItems.value.find(
      (item) => `insight-${item.id}` === payload.id,
    );
    if (!current) return;
    const updated = await api.updateInsight(current.id, {
      ...current,
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      body: payload.body.trim() || payload.summary.trim(),
      coverImage: payload.coverImage.trim(),
      pinned: payload.pinned,
      sortOrder: payload.sortOrder,
      status: payload.status || current.status,
      category: payload.category.trim() || current.category,
      publishedAt: payload.publishedAt,
    });
    insightItems.value = insightItems.value.map((item) =>
      item.id === updated.id ? updated : item,
    );
  } else {
    const current = projectItems.value.find(
      (item) => `project-${item.id}` === payload.id,
    );
    if (!current) return;
    const updated = await api.updateProject(current.id, {
      ...current,
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      body: payload.body.trim() || payload.summary.trim(),
      coverImage: payload.coverImage.trim(),
      pinned: false,
      sortOrder: payload.sortOrder,
      status: payload.status || current.status,
      stack: payload.stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      sourceUrl: payload.sourceUrl.trim(),
      githubUrl: payload.githubUrl.trim(),
    });
    projectItems.value = projectItems.value.map((item) =>
      item.id === updated.id ? updated : item,
    );
  }

  setNotice("内容已保存");
}

async function createPost(payload: PostEditorPayload) {
  if (!payload.title.trim()) {
    setNotice("标题不能为空");
    return;
  }

  if (payload.source === "journey") {
    if (!payload.stageId) {
      setNotice("请先选择学习阶段");
      return;
    }
    const created = await api.createJourney({
      stageId: payload.stageId,
      stage: payload.stage.trim(),
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      body: payload.body.trim() || payload.summary.trim(),
      coverImage: payload.coverImage.trim(),
      pinned: payload.pinned,
      sortOrder: payload.sortOrder,
      status: payload.status || "draft",
    });
    journeyItems.value = [created, ...journeyItems.value];
  } else if (payload.source === "insight") {
    const created = await api.createInsight({
      category: payload.category.trim() || "AI资讯",
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      body: payload.body.trim() || payload.summary.trim(),
      coverImage: payload.coverImage.trim(),
      pinned: payload.pinned,
      sortOrder: payload.sortOrder,
      publishedAt: payload.publishedAt,
      status: payload.status || "draft",
    });
    insightItems.value = [created, ...insightItems.value];
  }

  setNotice("内容已创建");
}

async function removePost(id: string) {
  const entry = allPosts.value.find((item) => item.id === id);
  if (!entry) return;

  if (entry.source === "journey") {
    await api.deleteJourney(entry.raw.id);
    journeyItems.value = journeyItems.value.filter(
      (item) => item.id !== entry.raw.id,
    );
  } else if (entry.source === "insight") {
    await api.deleteInsight(entry.raw.id);
    insightItems.value = insightItems.value.filter(
      (item) => item.id !== entry.raw.id,
    );
  } else {
    await api.deleteProject(entry.raw.id);
    projectItems.value = projectItems.value.filter(
      (item) => item.id !== entry.raw.id,
    );
  }

  setNotice("内容已删除");
}

async function saveProject(item: ProjectItem) {
  const updated = await api.updateProject(item.id, item);
  projectItems.value = projectItems.value.map((entry) =>
    entry.id === updated.id ? updated : entry,
  );
  setNotice("项目已保存");
}

async function removeProject(id: string) {
  await api.deleteProject(id);
  projectItems.value = projectItems.value.filter((item) => item.id !== id);
  setNotice("项目已删除");
}

const currentPageProps = computed(() => {
  if (currentPath.value === "/") {
    return {
      stats: stats.value,
      contentDistribution: contentDistribution.value,
      recentEntries: recentEntries.value,
      routeHref,
    };
  }

  if (currentPath.value === "/site") {
    return {
      siteProfile: siteProfile.value,
    };
  }

  if (currentPath.value === "/concept-graph") {
    return {
      conceptGraph: conceptGraph.value,
    };
  }

  if (currentPath.value === "/journey") {
    return {
      posts: journeyPosts.value,
      journeyStages: journeyStages.value,
      statusBadge,
    };
  }

  if (currentPath.value === "/insights") {
    return {
      posts: insightPosts.value,
      statusBadge,
    };
  }

  return {
    projects: projectItems.value,
    statusBadge,
  };
});

const currentPageListeners = computed(() => {
  if (currentPath.value === "/") {
    return {
      editEntry,
    };
  }

  if (currentPath.value === "/site") {
    return {
      saveSiteProfile,
    };
  }

  if (currentPath.value === "/concept-graph") {
    return {
      saveConceptGraph,
    };
  }

  if (currentPath.value === "/journey") {
    return {
      publish: publishEntry,
      create: createPost,
      save: savePost,
      remove: removePost,
      "save-stages": saveJourneyStages,
    };
  }

  if (currentPath.value === "/insights") {
    return {
      publish: publishEntry,
      create: createPost,
      save: savePost,
      remove: removePost,
    };
  }

  return {
    save: saveProject,
    remove: removeProject,
    "open-project-modal": openProjectModal,
  };
});

loadAll();
</script>

<template>
  <AdminLayout
    :routes="routes"
    :current-path="currentPath"
    :current-label="currentRoute.label"
    :route-href="routeHref"
  >
    <div v-if="loading" class="panel">
      <div class="panel-body">正在加载后台数据...</div>
    </div>
    <div v-else-if="errorMessage" class="panel">
      <div class="panel-body">{{ errorMessage }}</div>
    </div>
    <component
      :is="currentRoute.component"
      v-else
      v-bind="currentPageProps"
      v-on="currentPageListeners"
    />

    <template #after-shell>
      <div class="modal-overlay" :class="{ open: addProjectModalOpen }">
        <div class="modal modal--project-create">
          <div class="modal-header">
            <h3 class="modal-title">添加项目</h3>
            <button
              class="modal-close"
              type="button"
              @click="closeProjectModal"
            >
              ×
            </button>
          </div>
          <form
            class="modal-stack admin-form"
            @submit.prevent="submitProjectForm"
          >
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">项目名称</label>
                <input
                  v-model="projectForm.title"
                  class="form-input"
                  type="text"
                />
              </div>
              <div class="form-group">
                <label class="form-label">项目说明</label>
                <textarea
                  v-model="projectForm.summary"
                  class="form-textarea form-textarea--compact"
                ></textarea>
              </div>
              <div class="modal-grid-2">
                <div class="form-group">
                  <label class="form-label">排序值</label>
                  <input
                    v-model.number="projectForm.sortOrder"
                    class="form-input"
                    type="number"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">项目状态</label>
                  <select v-model="projectForm.status" class="form-select">
                    <option value="planned">规划中</option>
                    <option value="in-progress">进行中</option>
                    <option value="published">已上线</option>
                  </select>
                </div>
              </div>
              <div class="modal-grid-2">
                <div class="form-group">
                  <label class="form-label">项目网址</label>
                  <input
                    v-model="projectForm.sourceUrl"
                    class="form-input"
                    type="url"
                    placeholder="https://..."
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">GitHub 地址</label>
                  <input
                    v-model="projectForm.githubUrl"
                    class="form-input"
                    type="url"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">技术栈</label>
                <input
                  class="form-input"
                  :value="projectForm.stack.join(', ')"
                  type="text"
                  placeholder="逗号分隔，如：Python, LangChain"
                  @input="
                    updateProjectFormStack(
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />
              </div>
            </div>
            <div class="modal-footer modal-footer--end">
              <button
                type="button"
                class="btn btn--ghost"
                @click="closeProjectModal"
              >
                取消
              </button>
              <button type="submit" class="btn btn--primary">保存</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="notice" class="toast show">{{ notice }}</div>
    </template>
  </AdminLayout>
</template>
