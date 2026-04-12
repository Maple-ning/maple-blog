<script setup lang="ts">
import { computed } from 'vue';
import { useHashRoute } from '../composables/useHashRoute';
import { usePublicContent } from '../composables/usePublicContent';
import { openExternalLink } from '../utils/externalLink';
import { renderMarkdown } from '../utils/markdown';

const { currentItemId, currentPath, routeHref } = useHashRoute();
const { insightItems, journeyItems, projectItems } = usePublicContent();

function sortItems<T extends { updatedAt: string; publishedAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    if (Boolean((left as { pinned?: boolean }).pinned) !== Boolean((right as { pinned?: boolean }).pinned)) {
      return (left as { pinned?: boolean }).pinned ? -1 : 1;
    }
    const orderDiff = Number((left as { sortOrder?: number }).sortOrder || 0) - Number((right as { sortOrder?: number }).sortOrder || 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    const leftTime = new Date((left.publishedAt || left.updatedAt) ?? '').getTime();
    const rightTime = new Date((right.publishedAt || right.updatedAt) ?? '').getTime();
    return rightTime - leftTime;
  });
}

function createNeighbors<T extends { id: string; title: string }>(items: T[], currentId: string, basePath: string) {
  const index = items.findIndex((entry) => entry.id === currentId);
  return {
    prev: index > 0 ? { title: items[index - 1].title, href: `#${basePath}/${items[index - 1].id}` } : null,
    next: index >= 0 && index < items.length - 1 ? { title: items[index + 1].title, href: `#${basePath}/${items[index + 1].id}` } : null,
  };
}

const detail = computed(() => {
  if (currentPath.value === '/journey') {
    const items = sortItems(journeyItems.value);
    const item = items.find((entry) => entry.id === currentItemId.value);
    const neighbors = createNeighbors(items, currentItemId.value, '/journey');
    return item
      ? {
          id: item.id,
          title: item.title,
          summary: item.summary,
          body: item.body || item.summary,
          coverImage: item.coverImage,
          meta: [item.stage, formatDate(item.updatedAt)],
          tag: '学习笔记',
          tagClass: 'tag--blue',
          backHref: routeHref('/journey'),
          backLabel: '返回学习历程',
          extraTags: [],
          neighbors,
        }
      : null;
  }

  if (currentPath.value === '/insights') {
    const items = sortItems(insightItems.value);
    const item = items.find((entry) => entry.id === currentItemId.value);
    const neighbors = createNeighbors(items, currentItemId.value, '/insights');
    return item
      ? {
          id: item.id,
          title: item.title,
          summary: item.summary,
          body: item.body || item.summary,
          coverImage: item.coverImage,
          meta: [item.category || 'AI资讯', formatDate(item.publishedAt || item.updatedAt)],
          tag: 'AI资讯',
          tagClass: 'tag--purple',
          backHref: routeHref('/insights'),
          backLabel: '返回资讯列表',
          extraTags: [],
          neighbors,
        }
      : null;
  }

  if (currentPath.value === '/projects') {
    const items = sortItems(projectItems.value);
    const item = items.find((entry) => entry.id === currentItemId.value);
    const neighbors = createNeighbors(items, currentItemId.value, '/projects');
    return item
      ? {
          id: item.id,
          title: item.title,
          summary: item.summary,
          body: item.body || item.summary,
          coverImage: item.coverImage,
          meta: [statusLabel(item.status), formatDate(item.updatedAt)],
          tag: '项目分享',
          tagClass: 'tag--green',
          backHref: routeHref('/projects'),
          backLabel: '返回项目列表',
          extraTags: item.stack,
          sourceUrl: item.sourceUrl,
          githubUrl: item.githubUrl,
          neighbors,
        }
      : null;
  }

  return null;
});

const renderedBody = computed(() => renderMarkdown(detail.value?.body || ''));

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

function statusLabel(status: string) {
  if (status === 'published') return '已上线';
  if (status === 'in-progress') return '进行中';
  return '规划中';
}

function openProjectLink(url: string, label: string) {
  openExternalLink(url, label);
}
</script>

<template>
  <div>
    <section class="page-banner">
      <div class="container">
        <h1 class="page-banner-title">{{ detail?.title || '内容不存在' }}</h1>
        <p class="page-banner-desc">{{ detail?.summary || '当前链接没有对应的公开内容。' }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div v-if="detail" class="panel">
          <div class="panel-body" style="display:flex;flex-direction:column;gap:1.5rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
              <div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;">
                <span class="post-tag" :class="detail.tagClass">{{ detail.tag }}</span>
                <span v-for="item in detail.meta" :key="item" style="font-size:var(--text-sm);color:var(--color-text-muted);">{{ item }}</span>
              </div>
              <a :href="detail.backHref" class="btn btn--ghost btn--sm">{{ detail.backLabel }}</a>
            </div>

            <div v-if="detail.extraTags.length" style="display:flex;gap:.5rem;flex-wrap:wrap;">
              <span v-for="tag in detail.extraTags" :key="tag" class="badge badge--gray">{{ tag }}</span>
            </div>

            <img v-if="detail.coverImage" :src="detail.coverImage" alt="" class="detail-cover" />

            <div class="detail-content markdown-body" v-html="renderedBody"></div>

            <div v-if="detail.sourceUrl || detail.githubUrl" style="display:flex;gap:.75rem;flex-wrap:wrap;padding-top:1rem;border-top:1px solid var(--color-border);">
              <a v-if="detail.sourceUrl" href="" class="btn btn--outline" @click.prevent="openProjectLink(detail.sourceUrl, `${detail.title} 项目网址`)">项目网址</a>
              <a v-if="detail.githubUrl" href="" class="btn btn--outline" @click.prevent="openProjectLink(detail.githubUrl, `${detail.title} GitHub`)">GitHub</a>
            </div>

            <div
              v-if="detail.neighbors.prev || detail.neighbors.next"
              style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;padding-top:1rem;border-top:1px solid var(--color-border);"
            >
              <a v-if="detail.neighbors.prev" :href="detail.neighbors.prev.href" class="detail-nav-card">
                <span class="detail-nav-label">上一篇</span>
                <strong>{{ detail.neighbors.prev.title }}</strong>
              </a>
              <div v-else></div>
              <a v-if="detail.neighbors.next" :href="detail.neighbors.next.href" class="detail-nav-card detail-nav-card--next">
                <span class="detail-nav-label">下一篇</span>
                <strong>{{ detail.neighbors.next.title }}</strong>
              </a>
            </div>
          </div>
        </div>

        <div v-else class="panel">
          <div class="empty-state">
            <div class="empty-title">未找到对应内容</div>
            <div class="empty-desc">可能是内容未发布、已删除，或链接地址已变更。</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
