<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { api } from './api';
import { useHashRoute } from './composables/useHashRoute';
import type {
  AdminPostEntry,
  DashboardData,
  InsightItem,
  JourneyItem,
  JourneyStage,
  ProjectItem,
  SiteProfile,
} from './types';
import DashboardView from './components/DashboardView.vue';
import SiteSettingsView from './components/SiteSettingsView.vue';
import PostsView from './components/PostsView.vue';
import ProjectsView from './components/ProjectsView.vue';

type JourneyDraft = Omit<JourneyItem, 'id' | 'updatedAt'>;
type InsightDraft = Omit<InsightItem, 'id' | 'updatedAt'>;
type ProjectDraft = Omit<ProjectItem, 'id' | 'updatedAt'>;
type PostCategory = 'journey' | 'insight' | 'project';
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

const { currentPath, currentRoute, routeHref } = useHashRoute();

const loading = ref(true);
const errorMessage = ref('');
const notice = ref('');
const dashboard = ref<DashboardData | null>(null);
const sidebarOpen = ref(false);
const theme = ref<'light' | 'dark'>('light');
const writeModalOpen = ref(false);
const addProjectModalOpen = ref(false);

const siteProfile = ref<SiteProfile>({
  siteName: '',
  tagline: '',
  heroTitle: '',
  heroIntro: '',
  contactEmail: '',
  updatedAt: '',
});
const journeyItems = ref<JourneyItem[]>([]);
const journeyStages = ref<JourneyStage[]>([]);
const insightItems = ref<InsightItem[]>([]);
const projectItems = ref<ProjectItem[]>([]);

const sortedJourneyStages = computed(() =>
  [...journeyStages.value].sort((a, b) => a.sortOrder - b.sortOrder),
);

const writeForm = ref({
  category: 'journey' as PostCategory,
  title: '',
  stageId: '',
  insightCategory: '',
  summary: '',
  body: '',
  coverImage: '',
  pinned: false,
  sortOrder: 0,
  status: 'draft',
  publishedAt: '',
  stack: '',
  sourceUrl: '',
  githubUrl: '',
});
const projectForm = ref<ProjectDraft>({
  title: '',
  summary: '',
  body: '',
  coverImage: '',
  pinned: false,
  sortOrder: 0,
  status: 'planned',
  stack: [],
  sourceUrl: '',
  githubUrl: '',
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
    ('publishedAt' in left.raw ? left.raw.publishedAt : '') || left.raw.updatedAt || left.date,
  ).getTime();
  const rightTime = new Date(
    ('publishedAt' in right.raw ? right.raw.publishedAt : '') || right.raw.updatedAt || right.date,
  ).getTime();
  return rightTime - leftTime;
}

const journeyPosts = computed<AdminPostEntry[]>(() =>
  journeyItems.value
    .map((item) => ({
      id: `journey-${item.id}`,
      source: 'journey' as const,
      raw: item,
      title: item.title,
      category: '学习笔记',
      categoryClass: 'tag--blue',
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
      source: 'insight' as const,
      raw: item,
      title: item.title,
      category: item.category || 'AI资讯',
      categoryClass: 'tag--purple',
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
      source: 'project' as const,
      raw: item,
      title: item.title,
      category: '项目分享',
      categoryClass: 'tag--green',
      status: item.status,
      date: formatDate(item.updatedAt),
      description: item.summary,
    }))
    .sort(sortAdminEntries),
);

const allPosts = computed<AdminPostEntry[]>(() =>
  [...journeyPosts.value, ...insightPosts.value, ...projectAdminEntries.value].sort(sortAdminEntries),
);

const stats = computed(() => {
  const updatedTimes = allPosts.value
    .map((entry) => new Date(entry.raw.updatedAt).getTime())
    .filter((value) => !Number.isNaN(value));
  const latestTime = updatedTimes.length ? Math.max(...updatedTimes) : NaN;

  return [
    {
      icon: '📚',
      value: journeyItems.value.length,
      label: '学习笔记',
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-soft)',
      trend: '真实数据同步',
      trendClass: 'trend-up',
    },
    {
      icon: '📰',
      value: insightItems.value.length,
      label: 'AI资讯',
      color: '#7c3aed',
      bg: 'var(--color-purple-soft)',
      trend: '统一后台维护',
      trendClass: 'trend-up',
    },
    {
      icon: '🚀',
      value: projectItems.value.length,
      label: '项目分享',
      color: 'var(--color-success)',
      bg: 'var(--color-green-soft)',
      trend: '前台卡片直出',
      trendClass: 'trend-up',
    },
    {
      icon: '🕒',
      value: Number.isNaN(latestTime) ? '未更新' : formatDate(new Date(latestTime).toISOString()),
      label: '最近内容更新',
      color: '#ea580c',
      bg: 'var(--color-orange-soft)',
      trend: '保存后立即生效',
      trendClass: 'trend-up',
    },
  ];
});

const contentDistribution = computed(() => {
  const total = journeyItems.value.length + insightItems.value.length + projectItems.value.length;
  const resolveWidth = (count: number) => `${Math.max(total ? (count / total) * 100 : 0, count ? 12 : 0)}%`;
  return [
    { label: '学习笔记', count: journeyItems.value.length, width: resolveWidth(journeyItems.value.length), color: 'var(--color-primary)' },
    { label: 'AI资讯', count: insightItems.value.length, width: resolveWidth(insightItems.value.length), color: '#7c3aed' },
    { label: '项目分享', count: projectItems.value.length, width: resolveWidth(projectItems.value.length), color: 'var(--color-success)' },
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

function applyTheme(nextTheme: 'light' | 'dark') {
  theme.value = nextTheme;
  document.documentElement.setAttribute('data-theme', nextTheme);
  window.localStorage.setItem('ai-admin-theme', nextTheme);
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function openWriteModal() {
  if (currentPath.value === '/insights') {
    writeForm.value.category = 'insight';
  } else {
    writeForm.value.category = 'journey';
    writeForm.value.stageId = sortedJourneyStages.value[0]?.id || '';
  }
  writeModalOpen.value = true;
}

function closeWriteModal() {
  writeModalOpen.value = false;
}

function openProjectModal() {
  addProjectModalOpen.value = true;
}

function closeProjectModal() {
  addProjectModalOpen.value = false;
}

function editEntry(entry: AdminPostEntry) {
  const path =
    entry.source === 'journey' ? '/journey' : entry.source === 'insight' ? '/insights' : '/projects';
  if (currentPath.value !== path) {
    window.location.hash = routeHref(path).replace('#', '');
  }
  window.setTimeout(() => {
    const editButton = document.querySelector(`[data-entry-id="${entry.id}"]`) as HTMLButtonElement | null;
    editButton?.click();
  }, 0);
}

function setNotice(message: string) {
  notice.value = message;
  window.setTimeout(() => {
    if (notice.value === message) notice.value = '';
  }, 2400);
}

function formatDate(value: string) {
  if (!value) return '未设置';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function statusBadge(status: string) {
  if (status === 'published') return { label: '已发布', cls: 'badge--green' };
  if (status === 'in-progress') return { label: '进行中', cls: 'badge--orange' };
  if (status === 'planned') return { label: '规划中', cls: 'badge--orange' };
  return { label: '草稿', cls: 'badge--orange' };
}

async function refreshDashboard() {
  dashboard.value = await api.getDashboard();
}

async function loadAll() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [dashboardData, profileData, journeyStagesData, journeyData, insightsData, projectsData] =
      await Promise.all([
        api.getDashboard(),
        api.getSiteProfile(),
        api.getJourneyStages(),
        api.getJourney(),
        api.getInsights(),
        api.getProjects(),
      ]);
    dashboard.value = dashboardData;
    siteProfile.value = profileData;
    journeyStages.value = journeyStagesData.stages || [];
    journeyItems.value = journeyData;
    insightItems.value = insightsData;
    projectItems.value = projectsData;
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
    setNotice('学习阶段已保存');
  } catch (error) {
    setNotice(error instanceof Error ? error.message : String(error));
  }
}

async function saveSiteProfile(payload: SiteProfile) {
  siteProfile.value = await api.updateSiteProfile(payload);
  await refreshDashboard();
  setNotice('站点信息已保存');
}

async function submitWriteForm() {
  if (!writeForm.value.title.trim()) {
    setNotice('请先填写标题');
    return;
  }

  if (!writeForm.value.summary.trim()) {
    setNotice('请补充摘要或说明');
    return;
  }

  if (writeForm.value.category === 'journey') {
    if (!sortedJourneyStages.value.length) {
      setNotice('请先在左侧添加并保存学习阶段，再创建笔记');
      return;
    }
    if (!writeForm.value.stageId) {
      setNotice('请选择学习阶段');
      return;
    }
    const payload: JourneyDraft = {
      stageId: writeForm.value.stageId,
      stage: '',
      title: writeForm.value.title.trim(),
      summary: writeForm.value.summary.trim(),
      body: writeForm.value.body.trim() || writeForm.value.summary.trim(),
      coverImage: writeForm.value.coverImage.trim(),
      pinned: writeForm.value.pinned,
      sortOrder: writeForm.value.sortOrder,
      status: writeForm.value.status,
    };
    journeyItems.value = [await api.createJourney(payload), ...journeyItems.value];
  } else {
    const payload: InsightDraft = {
      category: writeForm.value.insightCategory.trim() || 'AI资讯',
      title: writeForm.value.title.trim(),
      summary: writeForm.value.summary.trim(),
      body: writeForm.value.body.trim() || writeForm.value.summary.trim(),
      coverImage: writeForm.value.coverImage.trim(),
      pinned: writeForm.value.pinned,
      sortOrder: writeForm.value.sortOrder,
      publishedAt: writeForm.value.publishedAt,
      status: writeForm.value.status,
    };
    insightItems.value = [await api.createInsight(payload), ...insightItems.value];
  }

  writeForm.value = {
    category: 'journey',
    title: '',
    stageId: '',
    insightCategory: '',
    summary: '',
    body: '',
    coverImage: '',
    pinned: false,
    sortOrder: 0,
    status: 'draft',
    publishedAt: '',
    stack: '',
    sourceUrl: '',
    githubUrl: '',
  };
  closeWriteModal();
  await refreshDashboard();
  setNotice('内容已创建');
}

async function submitProjectForm() {
  if (!projectForm.value.title.trim()) {
    setNotice('请先填写项目名称');
    return;
  }

  if (!projectForm.value.summary.trim()) {
    setNotice('请补充项目说明');
    return;
  }

  const nextItem = await api.createProject({
    ...projectForm.value,
    pinned: false,
  });
  projectItems.value = [nextItem, ...projectItems.value];
  projectForm.value = { title: '', summary: '', body: '', coverImage: '', pinned: false, sortOrder: 0, status: 'planned', stack: [], sourceUrl: '', githubUrl: '' };
  closeProjectModal();
  await refreshDashboard();
  setNotice('项目已添加');
}

function updateProjectFormStack(value: string) {
  projectForm.value.stack = value.split(',').map((item) => item.trim()).filter(Boolean);
}

async function publishEntry(id: string) {
  const entry = allPosts.value.find((item) => item.id === id);
  if (!entry) return;

  if (entry.source === 'journey') {
    const updated = await api.updateJourney(entry.raw.id, { ...entry.raw, status: 'published' });
    journeyItems.value = journeyItems.value.map((item) => (item.id === updated.id ? updated : item));
  } else if (entry.source === 'insight') {
    const updated = await api.updateInsight(entry.raw.id, {
      ...entry.raw,
      status: 'published',
      publishedAt: entry.raw.publishedAt || new Date().toISOString().slice(0, 10),
    });
    insightItems.value = insightItems.value.map((item) => (item.id === updated.id ? updated : item));
  } else {
    const updated = await api.updateProject(entry.raw.id, { ...entry.raw, status: 'published' });
    projectItems.value = projectItems.value.map((item) => (item.id === updated.id ? updated : item));
  }

  await refreshDashboard();
  setNotice('内容已发布');
}

async function savePost(payload: PostEditorPayload) {
  if (!payload.title.trim()) {
    setNotice('标题不能为空');
    return;
  }

  if (payload.source === 'journey') {
    const current = journeyItems.value.find((item) => `journey-${item.id}` === payload.id);
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
    journeyItems.value = journeyItems.value.map((item) => (item.id === updated.id ? updated : item));
  } else if (payload.source === 'insight') {
    const current = insightItems.value.find((item) => `insight-${item.id}` === payload.id);
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
    insightItems.value = insightItems.value.map((item) => (item.id === updated.id ? updated : item));
  } else {
    const current = projectItems.value.find((item) => `project-${item.id}` === payload.id);
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
      stack: payload.stack.split(',').map((item) => item.trim()).filter(Boolean),
      sourceUrl: payload.sourceUrl.trim(),
      githubUrl: payload.githubUrl.trim(),
    });
    projectItems.value = projectItems.value.map((item) => (item.id === updated.id ? updated : item));
  }

  await refreshDashboard();
  setNotice('内容已保存');
}

async function removePost(id: string) {
  const entry = allPosts.value.find((item) => item.id === id);
  if (!entry) return;

  if (entry.source === 'journey') {
    await api.deleteJourney(entry.raw.id);
    journeyItems.value = journeyItems.value.filter((item) => item.id !== entry.raw.id);
  } else if (entry.source === 'insight') {
    await api.deleteInsight(entry.raw.id);
    insightItems.value = insightItems.value.filter((item) => item.id !== entry.raw.id);
  } else {
    await api.deleteProject(entry.raw.id);
    projectItems.value = projectItems.value.filter((item) => item.id !== entry.raw.id);
  }

  await refreshDashboard();
  setNotice('内容已删除');
}

async function saveProject(item: ProjectItem) {
  const updated = await api.updateProject(item.id, item);
  projectItems.value = projectItems.value.map((entry) => (entry.id === updated.id ? updated : entry));
  await refreshDashboard();
  setNotice('项目已保存');
}

async function removeProject(id: string) {
  await api.deleteProject(id);
  projectItems.value = projectItems.value.filter((item) => item.id !== id);
  await refreshDashboard();
  setNotice('项目已删除');
}

function updateProjectStack(item: ProjectItem, value: string) {
  item.stack = value.split(',').map((entry) => entry.trim()).filter(Boolean);
}

onMounted(() => {
  const savedTheme = window.localStorage.getItem('ai-admin-theme') as 'light' | 'dark' | null;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ?? (systemDark ? 'dark' : 'light'));
  loadAll();
});
</script>

<template>
  <div class="admin-body">
    <aside id="sidebar" class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <a href="/ai/" class="logo"><span class="logo-icon">🤖</span><span class="logo-text">AI探索站</span></a>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-title">前台页面（一一对应）</div>
          <a :href="routeHref('/')" class="sidebar-link" :class="{ active: currentPath === '/' }"><span class="link-icon">🏠</span> 首页</a>
          <a :href="routeHref('/journey')" class="sidebar-link" :class="{ active: currentPath === '/journey' }"><span class="link-icon">📚</span> 学习历程</a>
          <a :href="routeHref('/insights')" class="sidebar-link" :class="{ active: currentPath === '/insights' }"><span class="link-icon">📰</span> AI资讯</a>
          <a :href="routeHref('/projects')" class="sidebar-link" :class="{ active: currentPath === '/projects' }"><span class="link-icon">🚀</span> 项目分享</a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-title">全站</div>
          <a :href="routeHref('/site')" class="sidebar-link" :class="{ active: currentPath === '/site' }"><span class="link-icon">⚙️</span> 站点设置</a>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info-mini"><div class="avatar">A</div><div><div class="user-name">Admin</div><div class="user-role">站点管理员</div></div></div>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-topbar">
        <div style="display:flex;align-items:center;gap:.75rem;">
          <button class="btn-icon" id="sidebarToggle" type="button" @click="toggleSidebar">☰</button>
        </div>
        <div class="topbar-actions">
          <button class="btn-icon" id="themeToggle" type="button" @click="toggleTheme">{{ theme === 'dark' ? '☀️' : '🌙' }}</button>
          <button
            v-if="currentPath === '/journey' || currentPath === '/insights'"
            class="btn btn--primary btn--sm"
            type="button"
            @click="openWriteModal"
          >
            {{ currentPath === '/insights' ? '添加资讯' : '添加学习笔记' }}
          </button>
          <button v-else-if="currentPath === '/projects'" class="btn btn--primary btn--sm" type="button" @click="openProjectModal">添加项目</button>
          <a href="/ai/" class="btn btn--outline btn--sm">查看 AI探索站</a>
        </div>
      </div>

      <div class="admin-content">
        <div v-if="loading" class="panel"><div class="panel-body">正在加载后台数据...</div></div>
        <div v-else-if="errorMessage" class="panel"><div class="panel-body">{{ errorMessage }}</div></div>
        <template v-else>
          <DashboardView
            v-if="currentPath === '/'"
            :stats="stats"
            :content-distribution="contentDistribution"
            :recent-entries="recentEntries"
            :route-href="routeHref"
            @edit-entry="editEntry"
          />
          <SiteSettingsView
            v-else-if="currentPath === '/site'"
            :site-profile="siteProfile"
            @save-site-profile="saveSiteProfile"
          />
          <PostsView
            v-else-if="currentPath === '/journey'"
            list-kind="journey"
            :posts="journeyPosts"
            :journey-stages="journeyStages"
            :status-badge="statusBadge"
            @publish="publishEntry"
            @save="savePost"
            @remove="removePost"
            @save-stages="saveJourneyStages"
          />
          <PostsView
            v-else-if="currentPath === '/insights'"
            list-kind="insight"
            :posts="insightPosts"
            :status-badge="statusBadge"
            @publish="publishEntry"
            @save="savePost"
            @remove="removePost"
          />
          <ProjectsView
            v-else-if="currentPath === '/projects'"
            :projects="projectItems"
            :status-badge="statusBadge"
            @save="saveProject"
            @remove="removeProject"
            @update-stack="updateProjectStack"
            @open-project-modal="openProjectModal"
          />
        </template>
      </div>
    </main>

    <div class="modal-overlay" :class="{ open: writeModalOpen }">
      <div class="modal" style="max-width:680px;">
        <div class="modal-header">
          <h3 class="modal-title">{{ writeForm.category === 'insight' ? '添加 AI 资讯' : '添加学习笔记' }}</h3>
          <button class="modal-close" type="button" @click="closeWriteModal">×</button>
        </div>
        <form class="admin-form" @submit.prevent="submitWriteForm">
          <div class="modal-grid-2">
            <div class="form-group">
              <label class="form-label">状态</label>
              <select v-model="writeForm.status" class="form-select">
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">排序值</label>
              <input v-model.number="writeForm.sortOrder" class="form-input" type="number" />
            </div>
          </div>
          <label class="checkbox-row">
            <input v-model="writeForm.pinned" type="checkbox" />
            <span>置顶内容</span>
          </label>
          <div class="form-group"><label class="form-label">标题</label><input v-model="writeForm.title" class="form-input" type="text" /></div>
          <div v-if="writeForm.category === 'journey'" class="form-group">
            <label class="form-label">学习阶段</label>
            <select v-if="sortedJourneyStages.length" v-model="writeForm.stageId" class="form-select">
              <option v-for="st in sortedJourneyStages" :key="st.id" :value="st.id">{{ st.name }}</option>
            </select>
            <p v-else class="form-hint">请在学习历程页左侧添加并保存阶段后，再创建笔记。</p>
          </div>
          <div v-if="writeForm.category === 'insight'" class="modal-grid-2">
            <div class="form-group">
              <label class="form-label">资讯分类</label>
              <input v-model="writeForm.insightCategory" class="form-input" type="text" placeholder="直接填写，如：行业动态" />
            </div>
            <div class="form-group">
              <label class="form-label">发布日期</label>
              <input v-model="writeForm.publishedAt" class="form-input" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">封面图地址</label>
            <input v-model="writeForm.coverImage" class="form-input" type="url" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label class="form-label">摘要</label>
            <textarea v-model="writeForm.summary" class="form-textarea" style="min-height:160px;"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">正文内容</label>
            <textarea v-model="writeForm.body" class="form-textarea" style="min-height:220px;"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn--ghost" @click="closeWriteModal">取消</button>
            <button type="submit" class="btn btn--primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: addProjectModalOpen }">
      <div class="modal" style="max-width:600px;">
        <div class="modal-header"><h3 class="modal-title">添加项目</h3><button class="modal-close" type="button" @click="closeProjectModal">×</button></div>
        <form class="admin-form" @submit.prevent="submitProjectForm">
          <div class="form-group"><label class="form-label">项目名称</label><input v-model="projectForm.title" class="form-input" type="text" /></div>
          <div class="form-group"><label class="form-label">项目说明</label><textarea v-model="projectForm.summary" class="form-textarea" style="min-height:90px;"></textarea></div>
          <div class="modal-grid-2">
            <div class="form-group">
              <label class="form-label">排序值</label>
              <input v-model.number="projectForm.sortOrder" class="form-input" type="number" />
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
              <input v-model="projectForm.sourceUrl" class="form-input" type="url" placeholder="https://..." />
            </div>
            <div class="form-group">
              <label class="form-label">GitHub 地址</label>
              <input v-model="projectForm.githubUrl" class="form-input" type="url" placeholder="https://github.com/..." />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">技术栈</label>
            <input
              class="form-input"
              :value="projectForm.stack.join(', ')"
              type="text"
              placeholder="逗号分隔，如：Python, LangChain"
              @input="updateProjectFormStack(($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn--ghost" @click="closeProjectModal">取消</button>
            <button type="submit" class="btn btn--primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="notice" class="toast show">{{ notice }}</div>
  </div>
</template>
