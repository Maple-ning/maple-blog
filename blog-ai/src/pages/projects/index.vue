<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { usePublicContent } from "@/hooks/usePublicContent";
import type { PublicProjectItem } from "@/types/public-content";
import { openExternalLink } from "@/utils/externalLink";
import { formatDate } from "@/utils/format";

const { projectItems } = usePublicContent();

const VIEW_KEY = 'ai-projects-view';
const activeStack = ref('全部');
const viewMode = ref<'grid' | 'list'>('grid');

onMounted(() => {
  const saved = localStorage.getItem(VIEW_KEY);
  if (saved === 'list' || saved === 'grid') {
    viewMode.value = saved;
  }
});

watch(viewMode, (v) => {
  localStorage.setItem(VIEW_KEY, v);
});

const stackTabs = computed(() => {
  const set = new Set<string>();
  projectItems.value.forEach((p) => p.stack.forEach((t) => set.add(t)));
  const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  return ['全部', ...sorted];
});

const heroStats = computed(() => {
  const items = projectItems.value;
  let stars = 0;
  let forks = 0;
  for (const p of items) {
    if (typeof p.githubStars === 'number') {
      stars += p.githubStars;
    }
    if (typeof p.githubForks === 'number') {
      forks += p.githubForks;
    }
  }
  return {
    projects: items.length,
    stars: formatStatNumber(stars),
    forks: formatStatNumber(forks),
  };
});

function formatStatNumber(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function sortProjects(items: PublicProjectItem[]) {
  return [...items].sort((a, b) => {
    const orderDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

const filteredProjects = computed(() => {
  let list = projectItems.value;
  if (activeStack.value !== '全部') {
    list = list.filter((p) => p.stack.includes(activeStack.value));
  }
  return sortProjects(list);
});

function projectHref(item: { sourceUrl: string; githubUrl: string }) {
  return item.sourceUrl || item.githubUrl || '';
}

function statusLabel(status: string) {
  if (status === 'published') return '已上线';
  if (status === 'in-progress') return '进行中';
  return '规划中';
}

function statusClass(status: string) {
  if (status === 'published') return 'badge--green';
  if (status === 'in-progress') return 'badge--orange';
  return 'badge--gray';
}

function openProjectLink(url: string, label: string) {
  openExternalLink(url, label);
}

function isDraftRow(status: string) {
  return status !== 'published';
}
</script>

<template>
  <div>
    <section class="page-banner page-banner--proj-row">
      <div class="container page-banner--proj-row__inner">
        <div class="page-banner--proj-row__left">
          <div class="proj-page__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.43 9.8 8.2 11.39.6.11.8-.26.8-.57v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.38-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.14 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.2.69.81.57C20.57 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"
              />
            </svg>
            <span class="proj-page__rocket" title="开源项目">🚀</span>
          </div>
          <div class="page-banner--proj-row__copy">
            <h1 class="page-banner-title">项目分享</h1>
            <p class="page-banner-desc">按技术栈筛选，支持网格或列表布局。</p>
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
              <path
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.projects }}</strong> 项目</span>
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
              <path
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.stars }}</strong> Stars</span>
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
              <circle cx="12" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9v1a2 2 0 01-2 2H8a2 2 0 01-2-2V9M12 12v3" />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.forks }}</strong> Forks</span>
          </span>
        </div>
      </div>
    </section>

    <section class="section section--projects">
      <div class="container projects-page__content">
        <template v-if="projectItems.length">
          <div class="panel projects-toolbar-panel">
            <div class="panel-body projects-toolbar-panel__row">
              <div
                class="projects-toolbar-panel__filters filter-bar projects-stack-filter"
                role="tablist"
                aria-label="按技术栈筛选"
              >
                <button
                  v-for="tab in stackTabs"
                  :key="tab"
                  type="button"
                  role="tab"
                  class="filter-btn"
                  :class="{ active: activeStack === tab }"
                  :aria-selected="activeStack === tab"
                  @click="activeStack = tab"
                >
                  {{ tab === '全部' ? `全部 (${projectItems.length})` : tab }}
                </button>
              </div>
              <div class="view-toggle" role="group" aria-label="视图切换">
                <button
                  type="button"
                  class="view-toggle__btn"
                  title="网格视图"
                  :aria-pressed="viewMode === 'grid'"
                  @click="viewMode = 'grid'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="view-toggle__btn"
                  title="列表视图"
                  :aria-pressed="viewMode === 'list'"
                  @click="viewMode = 'list'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="viewMode === 'grid' && filteredProjects.length" class="grid grid--3">
            <article
              v-for="item in filteredProjects"
              :key="item.id"
              class="post-card post-card--project project-card"
            >
              <img v-if="item.coverImage" :src="item.coverImage" alt="" class="card-cover" />
              <div v-else class="card-cover-placeholder" aria-hidden="true">📦</div>
              <div class="project-card__head">
                <div class="project-card__status-line">
                  <span class="badge" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
                </div>
                <div v-if="item.stack.length" class="project-card__stack-line">
                  <span v-for="tag in item.stack" :key="tag" class="post-tag tag--gray">{{ tag }}</span>
                </div>
              </div>
              <h3 class="post-title">
                <a v-if="projectHref(item)" href="" @click.prevent="openProjectLink(projectHref(item), item.title)">{{ item.title }}</a>
                <span v-else>{{ item.title }}</span>
              </h3>
              <p class="post-excerpt">{{ item.summary }}</p>
              <div class="post-meta">
                <span>{{ formatDate(item.updatedAt) }}</span>
              </div>
              <div class="project-card__actions">
                <a class="btn btn--outline btn--sm" :href="`#/projects/${item.id}`">详情</a>
                <button
                  v-if="item.sourceUrl"
                  type="button"
                  class="btn btn--ghost btn--sm"
                  @click="openProjectLink(item.sourceUrl, `${item.title} 项目网址`)"
                >
                  体验
                </button>
                <button
                  v-if="item.githubUrl"
                  type="button"
                  class="btn btn--ghost btn--sm"
                  @click="openProjectLink(item.githubUrl, `${item.title} GitHub`)"
                >
                  GitHub
                </button>
              </div>
            </article>
          </div>

          <div v-else-if="viewMode === 'grid' && !filteredProjects.length" class="panel">
            <div class="empty-state">
              <div class="empty-title">暂无符合条件的项目</div>
              <div class="empty-desc">请切换其他技术栈或选择「全部」。</div>
            </div>
          </div>

          <div v-else class="panel projects-panel">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>项目</th>
                    <th>技术栈</th>
                    <th>状态</th>
                    <th>更新</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in filteredProjects"
                    :key="item.id"
                    :class="{ 'projects-row--draft': isDraftRow(item.status) }"
                  >
                    <td class="projects-table__title-cell">
                      <div class="projects-table__title">
                        {{ item.title }}
                      </div>
                      <div class="projects-table__summary">
                        {{ item.summary }}
                      </div>
                    </td>
                    <td>
                      <div class="projects-table__stack">
                        <span v-for="tag in item.stack" :key="tag" class="badge badge--gray">{{ tag }}</span>
                        <span v-if="!item.stack.length" class="projects-table__empty">—</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
                    </td>
                    <td class="projects-table__date">
                      {{ formatDate(item.updatedAt) }}
                    </td>
                    <td>
                      <div class="projects-table__actions">
                        <a class="btn btn--ghost btn--sm" :href="`#/projects/${item.id}`">详情</a>
                        <button
                          v-if="item.sourceUrl"
                          type="button"
                          class="btn btn--ghost btn--sm"
                          @click="openProjectLink(item.sourceUrl, `${item.title} 体验`)"
                        >
                          体验
                        </button>
                        <button
                          v-if="item.githubUrl"
                          type="button"
                          class="btn btn--ghost btn--sm"
                          @click="openProjectLink(item.githubUrl, `${item.title} GitHub`)"
                        >
                          GitHub
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!filteredProjects.length">
                    <td colspan="5" class="projects-table__empty-row">
                      该技术栈下暂无项目
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <div v-else class="panel">
          <div class="empty-state">
            <div class="empty-title">暂无项目</div>
            <div class="empty-desc">在后台添加项目后，将按技术栈出现在这里。</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
