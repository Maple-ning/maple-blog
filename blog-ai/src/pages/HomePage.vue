<script setup lang="ts">
import { computed } from 'vue';
import { usePublicContent } from '../composables/usePublicContent';
import { siteIdentity } from '../site';
import { openExternalLink } from '../utils/externalLink';

const { insightItems, journeyItems, projectItems, siteProfile } = usePublicContent();

const homeStats = computed(() => [
  { label: '学习笔记', value: journeyItems.value.length },
  { label: 'AI资讯', value: insightItems.value.length },
  { label: '项目分享', value: projectItems.value.length },
]);

const latestContent = computed(() => {
  const blocks = [
    {
      tagClass: 'tag--blue',
      label: '学习笔记',
      item: journeyItems.value[0],
      href: journeyItems.value[0] ? `#/journey/${journeyItems.value[0].id}` : '#/journey',
      emptyTitle: '还没有发布学习笔记',
      emptySummary: '后台保存并发布后，这里会自动展示最新学习内容。',
      meta: (value: string) => [formatDate(value), '内容同步中'],
    },
    {
      tagClass: 'tag--purple',
      label: 'AI资讯',
      item: insightItems.value[0],
      href: insightItems.value[0] ? `#/insights/${insightItems.value[0].id}` : '#/insights',
      emptyTitle: '还没有发布资讯',
      emptySummary: '已发布的 AI 资讯会直接展示在这里。',
      meta: (value: string) => [formatDate(value), '公开内容'],
    },
    {
      tagClass: 'tag--green',
      label: '项目分享',
      item: projectItems.value[0],
      href: projectItems.value[0]
        ? projectItems.value[0].sourceUrl || projectItems.value[0].githubUrl || '#/projects'
        : '#/projects',
      emptyTitle: '还没有发布项目',
      emptySummary: '项目发布后会自动进入前台展示。',
      meta: (value: string) => [formatDate(value), '项目卡片'],
    },
  ];

  return blocks.map((block) => ({
    tagClass: block.tagClass,
    label: block.label,
    href: block.href,
    isExternal: block.label === '项目分享' && /^https?:\/\//.test(block.href),
    title: block.item?.title || block.emptyTitle,
    excerpt: block.item?.summary || block.emptySummary,
    meta: block.meta(
      block.label === 'AI资讯'
        ? (block.item && 'publishedAt' in block.item ? block.item.publishedAt || block.item.updatedAt : '')
        : block.item?.updatedAt || '',
    ),
  }));
});

function formatDate(value: string) {
  if (!value) return '待更新';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function openMaybeExternal(item: { href: string; isExternal?: boolean; title: string }) {
  if (item.isExternal) {
    openExternalLink(item.href, item.title);
    return;
  }

  window.location.hash = item.href.replace(/^#/, '');
}

function openBlogHome() {
  openExternalLink(siteIdentity.blogHomeUrl, '博客首页');
}
</script>

<template>
  <div>
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-badge">✨ {{ siteProfile.tagline || siteIdentity.subtitle }}</div>
        <h1 class="hero-title">
          {{ siteProfile.heroTitle || siteIdentity.name }}
        </h1>
        <p class="hero-desc">
          {{ siteProfile.heroIntro || '这里记录 AI 学习、资讯整理和项目实践，所有内容都由后台统一维护。' }}
        </p>
        <div class="hero-actions">
          <a href="#/journey" class="btn btn--primary btn--lg">查看学习笔记</a>
          <a href="#/projects" class="btn btn--outline btn--lg">浏览项目</a>
        </div>
        <div class="hero-stats">
          <div v-for="(item, index) in homeStats" :key="item.label" class="stat-item">
            <span class="stat-num">{{ item.value }}</span>
            <span class="stat-label">{{ item.label }}</span>
            <div v-if="index < homeStats.length - 1" class="stat-divider"></div>
          </div>
        </div>
      </div>
      <div class="hero-bg">
        <div class="blob blob--1"></div>
        <div class="blob blob--2"></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">内容入口</h2>
            <p class="section-desc">围绕学习、资讯、项目三个方向持续更新</p>
          </div>
        </div>
        <div class="grid grid--4">
          <a href="#/journey" class="feature-card">
            <div class="feature-icon" style="background:var(--color-blue-soft)">📚</div>
            <h3 class="feature-title">学习历程</h3>
            <p class="feature-desc">按阶段整理笔记和实践总结，聚焦知识积累。</p>
            <span class="feature-link">进入学习历程 →</span>
          </a>
          <a href="#/insights" class="feature-card">
            <div class="feature-icon" style="background:var(--color-purple-soft)">📰</div>
            <h3 class="feature-title">AI资讯</h3>
            <p class="feature-desc">记录值得关注的 AI 动态和自己的观察。</p>
            <span class="feature-link">进入资讯列表 →</span>
          </a>
          <a href="#/projects" class="feature-card">
            <div class="feature-icon" style="background:var(--color-green-soft)">🚀</div>
            <h3 class="feature-title">项目分享</h3>
            <p class="feature-desc">展示项目卡片、技术栈和项目链接。</p>
            <span class="feature-link">进入项目列表 →</span>
          </a>
          <a href="" class="feature-card" @click.prevent="openBlogHome">
            <div class="feature-icon" style="background:var(--color-orange-soft)">⚙️</div>
            <h3 class="feature-title">博客首页</h3>
            <p class="feature-desc">返回主博客，查看更多公开内容与其它栏目。</p>
            <span class="feature-link">返回博客首页 →</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section section--gray">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新内容</h2>
        </div>
        <div class="grid grid--3">
          <a v-for="item in latestContent" :key="item.label" href="" class="post-card" @click.prevent="openMaybeExternal(item)">
            <div class="post-tag" :class="item.tagClass">{{ item.label }}</div>
            <h3 class="post-title">{{ item.title }}</h3>
            <p class="post-excerpt">{{ item.excerpt }}</p>
            <div class="post-meta">
              <span v-for="meta in item.meta" :key="meta">{{ meta }}</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最近学习记录</h2>
          <a href="#/journey" class="section-more">查看全部 →</a>
        </div>
        <div class="timeline">
          <div v-for="item in journeyItems.slice(0, 3)" :key="item.id" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">{{ item.stage }}</span>
              <h4><a :href="`#/journey/${item.id}`">{{ item.title }}</a></h4>
              <p>{{ item.summary }}</p>
            </div>
          </div>
          <div v-if="!journeyItems.length" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">等待内容发布</span>
              <h4>学习笔记将在这里展示</h4>
              <p>后台发布学习内容后，首页时间线会自动更新。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
