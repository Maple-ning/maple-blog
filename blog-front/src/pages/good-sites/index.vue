<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import NovaBookmarkPoolIcon from '@/components/nova/NovaBookmarkPoolIcon.vue';
import { getGoodSites, type GoodSiteItem } from '@/services/goodSites';

const ALL = '__all__';

const sites = ref<GoodSiteItem[]>([]);
const categoryOrder = ref<string[]>([]);
const selectedCategory = ref<string>(ALL);

const categoryLabel = (site: GoodSiteItem) => site.category?.trim() || '未分类';

const categoryPills = computed(() => {
  const set = new Set<string>();
  for (const site of sites.value) {
    set.add(categoryLabel(site));
  }
  const ordered = categoryOrder.value.filter((c) => set.has(c));
  const missing = [...set].filter((c) => !ordered.includes(c));
  missing.sort((a, b) => a.localeCompare(b, 'zh-CN'));
  return [{ value: ALL, label: '全部' }, ...[...ordered, ...missing].map((c) => ({ value: c, label: c }))];
});

const filteredSites = computed(() => {
  const cur = selectedCategory.value;
  const list =
    cur === ALL ? sites.value : sites.value.filter((s) => categoryLabel(s) === cur);
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'zh-CN'));
});

const displayHost = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};

onMounted(async () => {
  const data = await getGoodSites();
  sites.value = data.items;
  categoryOrder.value = data.categoryOrder;
});
</script>

<template>
  <section class="nova-bookmarks-page">
    <div class="nova-section-header">
      <div class="nova-section-tag">LINKS</div>
      <h1 class="nova-section-title">友链</h1>
      <p class="nova-section-desc">友情链接与常用站点收录。</p>
    </div>

    <div class="nova-bookmark-categories" role="tablist" aria-label="分类筛选">
      <button
        v-for="pill in categoryPills"
        :key="pill.value"
        type="button"
        role="tab"
        class="nova-tag-filter"
        :class="{ 'nova-tag-filter--active': selectedCategory === pill.value }"
        :aria-selected="selectedCategory === pill.value"
        @click="selectedCategory = pill.value"
      >
        {{ pill.label }}
      </button>
    </div>

    <div class="nova-bookmarks-grid">
      <a
        v-for="site in filteredSites"
        :key="site.id"
        :href="site.url"
        target="_blank"
        rel="noreferrer noopener"
        class="nova-bmark-card"
      >
        <span class="nova-bmark-arrow" aria-hidden="true">↗</span>
        <div class="nova-bmark-header">
          <NovaBookmarkPoolIcon :seed="site.id" />
          <div class="nova-bmark-headlines">
            <a-tooltip :title="site.title" placement="topLeft" overlay-class-name="text-ellipsis-tooltip">
              <p class="nova-bmark-name line-clamp-2">{{ site.title }}</p>
            </a-tooltip>
            <p class="nova-bmark-url" :title="site.url">{{ displayHost(site.url) }}</p>
          </div>
        </div>
        <a-tooltip
          v-if="site.description"
          :title="site.description"
          placement="topLeft"
          overlay-class-name="text-ellipsis-tooltip"
        >
          <p class="nova-bmark-desc line-clamp-3">{{ site.description }}</p>
        </a-tooltip>
        <p v-else class="nova-bmark-desc line-clamp-3 opacity-60">暂无描述</p>
        <span class="nova-bmark-tag">{{ categoryLabel(site) }}</span>
      </a>
    </div>

    <a-empty v-if="filteredSites.length === 0" :description="sites.length > 0 ? '该分类下暂无站点' : '暂无内容'" />
  </section>
</template>
