<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import NovaBookmarkPoolIcon from '@/components/nova/NovaBookmarkPoolIcon.vue';
import {
  getGoodSites,
  type GoodSiteCategoryNode,
  type GoodSiteItem,
} from '@/services/goodSites';

interface LinkSubCategory {
  key: string;
  label: string;
  description: string;
}

interface LinkPrimaryGroup {
  key: string;
  label: string;
  eyebrow: string;
  children: LinkSubCategory[];
}

const UNCATEGORIZED = '未分类';
const FALLBACK_PRIMARY_KEY = 'collection';

const sites = ref<GoodSiteItem[]>([]);
const categoryTree = ref<GoodSiteCategoryNode[]>([]);
const selectedPrimaryKey = ref<string>(FALLBACK_PRIMARY_KEY);
const selectedSecondaryKey = ref<string>('');
const loading = ref<boolean>(true);
const errorMessage = ref<string>('');

const primaryCategoryLabel = (site: GoodSiteItem): string =>
  site.primaryCategory?.trim() || '精选友链';

const secondaryCategoryLabel = (site: GoodSiteItem): string =>
  site.secondaryCategory?.trim() || site.category?.trim() || UNCATEGORIZED;

const availablePrimaryGroups = computed<LinkPrimaryGroup[]>(() => {
  const normalizedTree = categoryTree.value.length > 0
    ? categoryTree.value
    : [
        {
          id: 0,
          key: FALLBACK_PRIMARY_KEY,
          label: '精选友链',
          sortOrder: 0,
          children: [],
        },
      ];

  return normalizedTree.map((primaryNode) => {
    const secondaries: LinkSubCategory[] = [];

    for (const child of primaryNode.children) {
      secondaries.push({
        key: `${primaryNode.key}::${child.key}`,
        label: child.label || UNCATEGORIZED,
        description: `浏览「${primaryNode.label}」下「${child.label || UNCATEGORIZED}」分类的站点。`,
      });
    }

    return {
      key: primaryNode.key,
      label: primaryNode.label,
      eyebrow: 'THE COLLECTION',
      children: secondaries,
    };
  });
});

const currentPrimaryGroup = computed<LinkPrimaryGroup>(() => {
  return (
    availablePrimaryGroups.value.find((group) => group.key === selectedPrimaryKey.value) ??
    availablePrimaryGroups.value[0] ?? {
      key: FALLBACK_PRIMARY_KEY,
      label: '精选友链',
      eyebrow: 'THE COLLECTION',
      children: [],
    }
  );
});

const currentSecondaryGroup = computed<LinkSubCategory | null>(() => {
  return (
    currentPrimaryGroup.value.children.find((child) => child.key === selectedSecondaryKey.value) ??
    currentPrimaryGroup.value.children[0] ??
    null
  );
});

const filteredSites = computed<GoodSiteItem[]>(() => {
  const currentSecondary = currentSecondaryGroup.value;

  if (!currentSecondary) {
    return [];
  }

  const list = sites.value.filter(
    (site) =>
      primaryCategoryLabel(site) === currentPrimaryGroup.value.label &&
      secondaryCategoryLabel(site) === currentSecondary.label,
  );

  return [...list].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'zh-CN'),
  );
});

const isEmptyState = computed<boolean>(() => {
  return !loading.value && !errorMessage.value && filteredSites.value.length === 0;
});

const displayHost = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const selectPrimaryGroup = (key: string): void => {
  selectedPrimaryKey.value = key;
  const nextPrimary = availablePrimaryGroups.value.find((group) => group.key === key);
  selectedSecondaryKey.value = nextPrimary?.children[0]?.key ?? '';
};

const selectSecondaryGroup = (key: string): void => {
  selectedSecondaryKey.value = key;
};

const loadGoodSitesPage = async (): Promise<void> => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const data = await getGoodSites();
    sites.value = data.items;
    categoryTree.value = data.categoryTree;

    const defaultPrimary = availablePrimaryGroups.value[0];
    selectedPrimaryKey.value = defaultPrimary?.key ?? FALLBACK_PRIMARY_KEY;
    selectedSecondaryKey.value = defaultPrimary?.children[0]?.key ?? '';
  } catch (error: unknown) {
    console.error('[loadGoodSitesPage] failed to load good sites', {
      error,
      page: 'good-sites',
    });
    errorMessage.value = '友链数据加载失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadGoodSitesPage();
});
</script>

<template>
  <section class="nova-links-page">
    <div class="nova-links-layout">
      <aside class="nova-links-sidebar">
        <div class="nova-links-sidebar__panel">
          <header class="nova-section-header nova-links-hero">
            <div class="nova-section-tag">{{ currentPrimaryGroup.eyebrow }}</div>
            <h1 class="nova-section-title">友链</h1>
          </header>

          <nav class="nova-links-tree" aria-label="友链分组导航">
            <div
              v-for="group in availablePrimaryGroups"
              :key="group.key"
              class="nova-links-tree__group"
            >
              <button
                type="button"
                class="nova-links-tree__primary"
                :class="{ 'nova-links-tree__primary--active': selectedPrimaryKey === group.key }"
                @click="selectPrimaryGroup(group.key)"
              >
                <span class="nova-links-tree__primary-icon" aria-hidden="true">⌘</span>
                <span>{{ group.label }}</span>
              </button>

              <div
                v-if="selectedPrimaryKey === group.key && group.children.length > 0"
                class="nova-links-tree__children"
              >
                <button
                  v-for="child in group.children"
                  :key="child.key"
                  type="button"
                  class="nova-links-tree__secondary"
                  :class="{ 'nova-links-tree__secondary--active': selectedSecondaryKey === child.key }"
                  @click="selectSecondaryGroup(child.key)"
                >
                  {{ child.label }}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <div class="nova-links-content">
        <div v-if="errorMessage" class="nova-links-feedback nova-links-feedback--error">
          {{ errorMessage }}
        </div>
        <div v-else-if="loading" class="nova-links-feedback">友链内容加载中...</div>
        <template v-else>
          <div v-if="filteredSites.length > 0" class="nova-links-grid">
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
              <div class="nova-bmark-tags">
                <span class="nova-bmark-tag">{{ primaryCategoryLabel(site) }}</span>
                <span class="nova-bmark-tag">{{ secondaryCategoryLabel(site) }}</span>
              </div>
            </a>
          </div>

          <div v-else-if="isEmptyState" class="nova-links-empty-state">
            <a-empty :description="sites.length > 0 ? '当前分类下暂无站点内容' : '暂无友链内容'" />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nova-links-page {
  width: 100%;
}

.nova-links-layout {
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

.nova-links-sidebar {
  position: sticky;
  top: 0;
  align-self: start;
}

.nova-links-sidebar__panel {
  padding: 0 14px 28px;
  max-height: 100dvh;
  overflow-y: auto;
  border-radius: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.nova-links-tree {
  margin-top: 10px;
}

.nova-links-tree__group + .nova-links-tree__group {
  margin-top: 6px;
}

.nova-links-tree__primary,
.nova-links-tree__secondary {
  width: 100%;
  border: none;
  background: transparent;
  color: #4b443d;
  text-align: left;
  cursor: pointer;
}

.nova-links-tree__primary {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 12px 10px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nova-links-tree__primary:hover,
.nova-links-tree__primary--active {
  background: rgba(177, 140, 72, 0.16);
  color: #7b5e2e;
}

.nova-links-tree__primary-icon {
  display: inline-flex;
  width: 18px;
  justify-content: center;
  color: #7b6a53;
  opacity: 1;
}

.nova-links-tree__children {
  margin: 6px 0 14px 34px;
  padding-left: 10px;
  border-left: 1px solid rgba(103, 84, 57, 0.16);
}

.nova-links-tree__secondary {
  position: relative;
  padding: 7px 0;
  font-size: 13px;
  color: #8b8074;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.nova-links-tree__secondary:hover,
.nova-links-tree__secondary--active {
  color: #7b5e2e;
  transform: translateX(2px);
}

.nova-links-tree__secondary--active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid #b18c48;
  transform: translateY(-50%);
}

.nova-links-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 360px;
}

.nova-links-hero {
  margin-bottom: 18px;
}

.nova-links-feedback {
  margin: 0 0 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--nova-surface) 88%, transparent);
  color: var(--nova-text-muted);
}

.nova-links-feedback--error {
  color: #d35f5f;
  background: color-mix(in srgb, #d35f5f 10%, var(--nova-surface));
}

.nova-links-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.nova-bmark-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.nova-links-empty-state {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1100px) {
  .nova-links-layout {
    grid-template-columns: 1fr;
  }

  .nova-links-sidebar {
    position: static;
  }

  .nova-links-sidebar__panel {
    padding: 0;
    max-height: none;
    overflow: visible;
  }

  .nova-links-grid {
    grid-template-columns: 1fr;
  }

  .nova-links-content,
  .nova-links-empty-state {
    min-height: 280px;
  }
}

/* Dark mode overrides */
:global(html.dark) .nova-links-tree__primary,
:global(html.dark) .nova-links-tree__secondary {
  color: rgba(244, 241, 234, 0.52);
}

:global(html.dark) .nova-links-tree__primary:hover,
:global(html.dark) .nova-links-tree__primary--active {
  background: rgba(240, 185, 11, 0.18);
  color: #f0b90b;
}

:global(html.dark) .nova-links-tree__primary-icon {
  color: rgba(244, 241, 234, 0.38);
}

:global(html.dark) .nova-links-tree__children {
  border-left-color: rgba(244, 241, 234, 0.1);
}

:global(html.dark) .nova-links-tree__secondary:hover,
:global(html.dark) .nova-links-tree__secondary--active {
  color: #f0b90b;
}

:global(html.dark) .nova-links-tree__secondary--active::before {
  border-left-color: #f0b90b;
}

:global(html.dark) .nova-links-feedback {
  background: color-mix(in srgb, var(--nova-surface) 88%, transparent);
  color: var(--nova-text-muted);
}

:global(html.dark) .nova-links-feedback--error {
  color: #e07373;
  background: color-mix(in srgb, #e07373 10%, var(--nova-surface));
}
</style>
