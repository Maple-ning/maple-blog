<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import HomeNovaHero from '@/components/home/HomeNovaHero.vue';
import { getGoodSites } from '@/services/goodSites';
import { getAllPublishedPosts, type PostItem } from '@/services/posts';
import type { ProjectItem } from '@/services/projects';
import { getProjects } from '@/services/projects';
import { getProfile } from '@/services/profile';

const router = useRouter();
const allPosts = ref<PostItem[]>([]);
const projects = ref<ProjectItem[]>([]);
const goodSitesCount = ref(0);
const profile = ref<Awaited<ReturnType<typeof getProfile>>>(null);
const homeLoading = ref<boolean>(true);
const homeError = ref<string>('');

const articleTotal = computed(() => allPosts.value.length);
const projectTotal = computed(() => projects.value.length);
const githubStarsDisplay = '5';

const heroLine1 = computed(() => '');

const heroIntro = computed(
  () =>
    profile.value?.intro?.trim() ||
    '探索学习与工程实践，记录代码与想法。这里是枫叶的个人空间——文章与项目。',
);

const heroBadge = computed(() => {
  const t = profile.value?.tagline?.trim();
  return t && t.length > 0 ? t : undefined;
});

const recentPosts = computed(() =>
  [...allPosts.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
);

const projectSortValue = (project: ProjectItem) => {
  const timestamp = Date.parse(String(project.updatedAt || project.createdAt || ''));
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const recentProjects = computed(() =>
  [...projects.value]
    .sort((a, b) => projectSortValue(b) - projectSortValue(a) || b.id - a.id)
    .slice(0, 4),
);

const estReadMinutes = (post: PostItem) => Math.max(1, Math.ceil((post.content?.length ?? 0) / 1200));

const postMiniTag = (post: PostItem) => post.tags[0]?.trim() || '文章';

const projectMiniTag = (project: ProjectItem) => project.techStack[0]?.trim() || '项目';

const toComparableUrl = (url?: string) => String(url || '').trim().replace(/\/+$/, '').toLowerCase();

const hasProjectLiveLink = (project: ProjectItem) => /^https?:\/\//i.test(String(project.url || '').trim());

const hasProjectSourceLink = (project: ProjectItem) => {
  const source = toComparableUrl(project.sourceCodeUrl);
  if (!source || !/^https?:\/\//i.test(source)) return false;
  return source !== toComparableUrl(project.url);
};

const projectStatusLabel = (project: ProjectItem) => (hasProjectLiveLink(project) ? '已发布' : '开发中');

const projectUpdatedLabel = (project: ProjectItem) => {
  const value = String(project.updatedAt || project.createdAt || '').trim();
  return value ? `更新于 ${value.slice(0, 10)}` : `项目 #${project.id}`;
};

const projectTechSummary = (project: ProjectItem) =>
  project.techStack.slice(0, 3).join(' · ') || '持续迭代中';

const goPost = (slug: string) => {
  void router.push({ name: 'post-detail', params: { slug } });
};

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animateValue = (
  from: number,
  to: number,
  setter: (v: number) => void,
  durationMs: number,
) => {
  if (reducedMotion() || from === to) {
    setter(to);
    return;
  }
  const start = performance.now();
  const delta = to - from;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - (1 - t) * (1 - t);
    setter(Math.round(from + delta * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const statArticles = ref(0);
const statProjects = ref(0);
const statSites = ref(0);

const runBigStatAnim = () => {
  const a = articleTotal.value;
  const p = projectTotal.value;
  const s = goodSitesCount.value;
  if (reducedMotion()) {
    statArticles.value = a;
    statProjects.value = p;
    statSites.value = s;
    return;
  }
  statArticles.value = 0;
  statProjects.value = 0;
  statSites.value = 0;
  const d = 900;
  animateValue(0, a, (v) => {
    statArticles.value = v;
  }, d);
  animateValue(0, p, (v) => {
    statProjects.value = v;
  }, d);
  animateValue(0, s, (v) => {
    statSites.value = v;
  }, d);
};

const loadHomePageData = async (): Promise<void> => {
  homeLoading.value = true;
  homeError.value = '';

  try {
    const [posts, projectList, sitesData, profileInfo] = await Promise.all([
      getAllPublishedPosts(),
      getProjects(),
      getGoodSites(),
      getProfile(),
    ]);
    allPosts.value = posts;
    projects.value = projectList;
    goodSitesCount.value = sitesData.items.length;
    profile.value = profileInfo;
    runBigStatAnim();
  } catch (error: unknown) {
    console.error('[loadHomePageData] failed to load home data', {
      error,
      routeName: 'home',
    });
    homeError.value = '首页数据加载失败，请稍后重试。';
  } finally {
    homeLoading.value = false;
  }
};

onMounted(async () => {
  await loadHomePageData();
});
</script>

<template>
  <section class="nova-home-page">
    <HomeNovaHero
      :display-name="heroLine1"
      :intro="heroIntro"
      :article-total="articleTotal"
      :project-total="projectTotal"
      :stars-display="githubStarsDisplay"
      :badge-text="heroBadge"
    >
      <template #actions>
        <RouterLink :to="{ name: 'posts' }" class="nova-btn-primary no-underline">✦ 开始探索</RouterLink>
        <RouterLink :to="{ name: 'projects' }" class="nova-btn-outline no-underline">⬡ 查看项目</RouterLink>
      </template>
    </HomeNovaHero>

    <div v-if="homeError" class="nova-home-feedback nova-home-feedback--error">
      {{ homeError }}
    </div>
    <div v-else-if="homeLoading" class="nova-home-feedback">首页内容加载中...</div>

    <div class="nova-home-stats-grid">
      <div class="nova-home-stat-card">
        <div class="nova-home-stat-icon" aria-hidden="true">📝</div>
        <div class="nova-home-stat-num">{{ statArticles }}</div>
        <div class="nova-home-stat-label">篇博文</div>
      </div>
      <div class="nova-home-stat-card">
        <div class="nova-home-stat-icon" aria-hidden="true">🚀</div>
        <div class="nova-home-stat-num">{{ statProjects }}</div>
        <div class="nova-home-stat-label">个开源项目</div>
      </div>
      <div class="nova-home-stat-card">
        <div class="nova-home-stat-icon" aria-hidden="true">⭐</div>
        <div class="nova-home-stat-num nova-home-stat-num--text">{{ githubStarsDisplay }}</div>
        <div class="nova-home-stat-label">GitHub Stars</div>
      </div>
      <div class="nova-home-stat-card">
        <div class="nova-home-stat-icon" aria-hidden="true">🌍</div>
        <div class="nova-home-stat-num">{{ statSites }}</div>
        <div class="nova-home-stat-label">条友链</div>
      </div>
    </div>

    <header class="nova-section-header nova-home-latest-head">
      <div class="nova-section-tag">LATEST</div>
      <div class="nova-home-section-headline">
        <h2 class="nova-section-title">最新博文</h2>
        <RouterLink :to="{ name: 'posts' }" class="nova-home-latest-link no-underline">
          查看全部
        </RouterLink>
      </div>
      <p class="nova-section-desc">最近写下来的内容都放在这里，方便快速浏览和继续阅读。</p>
    </header>

    <div class="nova-posts-mini-grid">
      <article
        v-for="post in recentPosts"
        :key="post.slug"
        class="nova-post-mini-card"
        tabindex="0"
        role="link"
        @click="goPost(post.slug)"
        @keydown.enter.prevent="goPost(post.slug)"
      >
        <div class="nova-post-mini-tag">{{ postMiniTag(post) }}</div>
        <h3 class="nova-post-mini-title">{{ post.title }}</h3>
        <div class="nova-post-mini-meta">
          <span>{{ post.date }}</span>
          <span>· 约 {{ estReadMinutes(post) }} 分钟</span>
          <span>· 查看文章</span>
        </div>
      </article>
    </div>

    <a-empty v-if="recentPosts.length === 0" class="!mt-6" description="暂无博文" />

    <header class="nova-section-header nova-home-projects-head">
      <div class="nova-section-tag">PROJECTS</div>
      <div class="nova-home-section-headline">
        <h2 class="nova-section-title">最近项目</h2>
        <RouterLink :to="{ name: 'projects' }" class="nova-home-latest-link no-underline">
          查看全部
        </RouterLink>
      </div>
      <p class="nova-section-desc">把最近更新和在推进的项目单独收一块，和文章分开看会更清楚。</p>
    </header>

    <div class="nova-projects-mini-grid">
      <article v-for="project in recentProjects" :key="project.id" class="nova-project-mini-card">
        <div class="nova-project-mini-top">
          <div class="nova-project-mini-tag">{{ projectMiniTag(project) }}</div>
          <span
            class="nova-project-mini-status"
            :class="
              hasProjectLiveLink(project)
                ? 'nova-project-mini-status--active'
                : 'nova-project-mini-status--wip'
            "
          >
            {{ projectStatusLabel(project) }}
          </span>
        </div>

        <h3 class="nova-project-mini-title">{{ project.name }}</h3>
        <p class="nova-project-mini-desc">{{ project.description }}</p>

        <div class="nova-project-mini-meta">
          <span>{{ projectUpdatedLabel(project) }}</span>
          <span>{{ projectTechSummary(project) }}</span>
        </div>

        <div class="nova-project-mini-links">
          <a
            v-if="hasProjectLiveLink(project)"
            class="nova-project-mini-link nova-project-mini-link--primary"
            :href="project.url"
            target="_blank"
            rel="noreferrer noopener"
          >
            查看项目
          </a>
          <a
            v-if="hasProjectSourceLink(project)"
            class="nova-project-mini-link"
            :href="project.sourceCodeUrl"
            target="_blank"
            rel="noreferrer noopener"
          >
            查看源码
          </a>
          <RouterLink
            v-if="!hasProjectLiveLink(project) && !hasProjectSourceLink(project)"
            :to="{ name: 'projects' }"
            class="nova-project-mini-link"
          >
            浏览项目列表
          </RouterLink>
        </div>
      </article>
    </div>

    <a-empty v-if="recentProjects.length === 0" class="!mt-6" description="暂无项目" />
  </section>
</template>

<style scoped>
.nova-home-feedback {
  margin: 24px 0 12px;
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid var(--nova-border);
  background: color-mix(in srgb, var(--nova-card-bg) 92%, transparent);
  color: var(--nova-text-muted);
  font-size: 14px;
}

.nova-home-feedback--error {
  border-color: color-mix(in srgb, #ef4444 28%, var(--nova-border));
  color: color-mix(in srgb, #ef4444 76%, var(--nova-text));
}
</style>
