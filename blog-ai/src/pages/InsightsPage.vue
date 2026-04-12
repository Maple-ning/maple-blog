<script setup lang="ts">
import { computed } from 'vue';
import { usePublicContent } from '../composables/usePublicContent';

const { insightItems } = usePublicContent();

const sortedInsights = computed(() =>
  [...insightItems.value].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
      return a.pinned ? -1 : 1;
    }
    const orderDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    if (orderDiff !== 0) return orderDiff;
    const ta = new Date(a.publishedAt || a.updatedAt).getTime();
    const tb = new Date(b.publishedAt || b.updatedAt).getTime();
    return tb - ta;
  }),
);

const publishedCount = computed(() => sortedInsights.value.filter((i) => i.status === 'published').length);

const heroStats = computed(() => ({
  total: insightItems.value.length,
  published: publishedCount.value,
  latest: formatDate(insightItems.value[0]?.publishedAt || insightItems.value[0]?.updatedAt || ''),
}));

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
</script>

<template>
  <div>
    <section class="page-banner page-banner--proj-row">
      <div class="container page-banner--proj-row__inner">
        <div class="page-banner--proj-row__left">
          <div class="proj-page__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            <span class="proj-page__rocket" title="资讯">📰</span>
          </div>
          <div class="page-banner--proj-row__copy">
            <h1 class="page-banner-title">AI资讯</h1>
            <p class="page-banner-desc">已发布资讯以卡片展示，分类显示在每张卡片上。</p>
          </div>
        </div>
        <div class="page-banner-meta page-banner--proj-row__stats">
          <span class="page-banner-chip">
            <svg
              class="page-banner-chip__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.total }}</strong> 资讯</span>
          </span>
          <span class="page-banner-chip">
            <svg
              class="page-banner-chip__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.published }}</strong> 已发布</span>
          </span>
          <span class="page-banner-chip">
            <svg
              class="page-banner-chip__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.latest }}</strong> 最近</span>
          </span>
        </div>
      </div>
    </section>

    <section class="section section--projects">
      <div class="container projects-page__content">
        <div v-if="sortedInsights.length" class="grid grid--1">
          <article v-for="item in sortedInsights" :key="item.id" class="post-card post-card--insight" style="cursor: default">
            <img v-if="item.coverImage" :src="item.coverImage" alt="" class="card-cover" />
            <div v-else class="card-cover-placeholder" aria-hidden="true">📰</div>
            <div class="insight-card__meta-row">
              <span class="post-tag tag--purple">{{ item.category || '未分类' }}</span>
              <span class="badge" :class="item.status === 'published' ? 'badge--green' : 'badge--orange'">
                {{ item.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </div>
            <h3 class="post-title">
              <a :href="`#/insights/${item.id}`">{{ item.title }}</a>
            </h3>
            <p class="post-excerpt">{{ item.summary }}</p>
            <div class="post-meta">
              <span>{{ formatDate(item.publishedAt || item.updatedAt) }}</span>
            </div>
            <div>
              <a :href="`#/insights/${item.id}`" class="section-more">查看详情 →</a>
            </div>
          </article>
        </div>

        <div v-else class="panel">
          <div class="empty-state">
            <div class="empty-title">暂无资讯内容</div>
            <div class="empty-desc">在后台发布 AI 资讯后，会以卡片形式展示在这里。</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
