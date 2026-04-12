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

const articleTotal = computed(() => allPosts.value.length);
const projectTotal = computed(() => projects.value.length);

const heroLine1 = computed(() =>
  profile.value?.name?.trim() ? `你好，我是 ${profile.value.name.trim()}` : '欢迎来到',
);

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

const estReadMinutes = (post: PostItem) => Math.max(1, Math.ceil((post.content?.length ?? 0) / 1200));

const postMiniTag = (post: PostItem) => post.tags[0]?.trim() || '文章';

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

onMounted(async () => {
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
});
</script>

<template>
  <section class="nova-home-page">
    <HomeNovaHero
      :display-name="heroLine1"
      :intro="heroIntro"
      :article-total="articleTotal"
      :project-total="projectTotal"
      stars-display="—"
      :badge-text="heroBadge"
    >
      <template #actions>
        <RouterLink :to="{ name: 'posts' }" class="nova-btn-primary no-underline">✦ 开始探索</RouterLink>
        <RouterLink :to="{ name: 'projects' }" class="nova-btn-outline no-underline">⬡ 查看项目</RouterLink>
      </template>
    </HomeNovaHero>

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
        <div class="nova-home-stat-num nova-home-stat-num--text">—</div>
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
      <h2 class="nova-section-title">最新博文</h2>
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
  </section>
</template>
