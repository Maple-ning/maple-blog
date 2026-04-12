<script setup lang="ts">
import { computed } from 'vue';
import { usePublicContent } from '../composables/usePublicContent';

const { journeyItems, journeyStages } = usePublicContent();

const groupedJourney = computed(() => {
  const map = new Map<string, typeof journeyItems.value>();
  journeyItems.value.forEach((item) => {
    const key = item.stage || '未分类阶段';
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  });
  const entries = Array.from(map.entries()).map(([stage, items]) => ({ stage, items }));
  const orderNames = [...journeyStages.value]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => s.name);
  if (!orderNames.length) {
    entries.sort((a, b) => a.stage.localeCompare(b.stage, 'zh-CN'));
    return entries;
  }
  entries.sort((a, b) => {
    const ia = orderNames.indexOf(a.stage);
    const ib = orderNames.indexOf(b.stage);
    const ra = ia === -1 ? 1000 : ia;
    const rb = ib === -1 ? 1000 : ib;
    if (ra !== rb) return ra - rb;
    return a.stage.localeCompare(b.stage, 'zh-CN');
  });
  return entries;
});

const heroStats = computed(() => ({
  notes: journeyItems.value.length,
  stages: groupedJourney.value.length,
  latest: formatDate(journeyItems.value[0]?.updatedAt || ''),
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
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            <span class="proj-page__rocket" title="学习笔记">📚</span>
          </div>
          <div class="page-banner--proj-row__copy">
            <h1 class="page-banner-title">学习历程</h1>
            <p class="page-banner-desc">按学习阶段整理的笔记与实践记录。</p>
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
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.notes }}</strong> 笔记</span>
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
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.stages }}</strong> 阶段</span>
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span class="page-banner-chip__stat-text"><strong>{{ heroStats.latest }}</strong> 最近</span>
          </span>
        </div>
      </div>
    </section>

    <section class="section section--projects">
      <div class="container projects-page__content">
        <template v-if="groupedJourney.length">
          <section v-for="group in groupedJourney" :key="group.stage" class="panel">
            <div class="panel-header">
              <span class="panel-title">{{ group.stage }}</span>
              <span style="font-size:var(--text-xs);color:var(--color-text-muted);">{{ group.items.length }} 条记录</span>
            </div>
            <div class="panel-body" style="display:flex;flex-direction:column;gap:1rem;">
              <article v-for="item in group.items" :key="item.id" class="post-card" style="cursor:default;">
                <img v-if="item.coverImage" :src="item.coverImage" alt="" class="card-cover" />
                <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap;">
                  <div>
                    <h3 class="post-title"><a :href="`#/journey/${item.id}`">{{ item.title }}</a></h3>
                    <div class="post-meta" style="margin-top:.35rem;">
                      <span>{{ formatDate(item.updatedAt) }}</span>
                      <span>{{ item.status === 'published' ? '已发布' : '草稿' }}</span>
                    </div>
                  </div>
                  <span class="badge" :class="item.status === 'published' ? 'badge--green' : 'badge--orange'">
                    {{ item.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
                <p class="post-excerpt">{{ item.summary }}</p>
                <div><a :href="`#/journey/${item.id}`" class="section-more">查看详情 →</a></div>
              </article>
            </div>
          </section>
        </template>

        <div v-else class="panel">
          <div class="empty-state">
            <div class="empty-title">暂无学习笔记</div>
            <div class="empty-desc">后台发布学习内容后，这里会自动生成阶段列表。</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
