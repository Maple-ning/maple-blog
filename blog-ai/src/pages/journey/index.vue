<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { usePublicContent } from "@/hooks/usePublicContent";
import { formatDate } from "@/utils/format";

const { journeyItems, journeyStages } = usePublicContent();

type JourneyStageSection = {
  id: string;
  name: string;
  items: typeof journeyItems.value;
  noteCount: number;
};

const orderedJourneyItems = computed(() =>
  [...journeyItems.value].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
);

const stageSections = computed<JourneyStageSection[]>(() => {
  const groups = new Map<string, typeof journeyItems.value>();

  journeyItems.value.forEach((item) => {
    const key = (item.stage || '').trim() || '未命名阶段';
    const list = groups.get(key) || [];
    list.push(item);
    groups.set(key, list);
  });

  const ordered = [...journeyStages.value]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((stage) => ({
      id: stage.id,
      name: stage.name,
      items: [...(groups.get(stage.name) || [])].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
      noteCount: (groups.get(stage.name) || []).length,
    }));

  const extras = Array.from(groups.entries())
    .filter(([name]) => !ordered.some((stage) => stage.name === name))
    .map(([name, items], index) => ({
      id: `extra-${index}`,
      name,
      items: [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      noteCount: items.length,
    }));

  return [...ordered, ...extras];
});

const selectedStageId = ref<'all' | string>('all');
const focusPanelRef = ref<HTMLElement | null>(null);

watch(
  stageSections,
  (sections) => {
    if (!sections.length) {
      selectedStageId.value = 'all';
      return;
    }
    if (selectedStageId.value === 'all') {
      selectedStageId.value = sections[0].id;
      return;
    }
    if (!sections.some((section) => section.id === selectedStageId.value)) {
      selectedStageId.value = sections[0].id;
    }
  },
  { immediate: true },
);

const activeStage = computed(() =>
  stageSections.value.find((section) => section.id === selectedStageId.value) || stageSections.value[0] || null,
);

const activeStageIndex = computed(() =>
  activeStage.value ? stageSections.value.findIndex((section) => section.id === activeStage.value?.id) : -1,
);

const latestJourneyItem = computed(() => orderedJourneyItems.value[0] || null);
const pinnedNotes = computed(() => journeyItems.value.filter((item) => item.pinned).length);

const heroStats = computed(() => ({
  notes: journeyItems.value.length,
  stages: stageSections.value.length,
  latest: formatDate(latestJourneyItem.value?.updatedAt || ''),
}));

const heroCards = computed(() => [
  {
    label: '阶段节点',
    value: String(heroStats.value.stages).padStart(2, '0'),
    hint: '按学习路径编排',
  },
  {
    label: '公开笔记',
    value: String(heroStats.value.notes).padStart(2, '0'),
    hint: '前台实时同步展示',
  },
  {
    label: '重点专题',
    value: String(pinnedNotes.value).padStart(2, '0'),
    hint: '置顶内容优先追踪',
  },
]);

const activeStageLatest = computed(() => formatDate(activeStage.value?.items[0]?.updatedAt || ''));
const activeStageShare = computed(() => {
  if (!activeStage.value || !journeyItems.value.length) return 0;
  return Math.round((activeStage.value.noteCount / journeyItems.value.length) * 100);
});
const activeStagePublished = computed(
  () => activeStage.value?.items.filter((item) => item.status === 'published').length || 0,
);
const activeStagePinned = computed(() => activeStage.value?.items.filter((item) => item.pinned).length || 0);
const activeStageFocusItems = computed(() => activeStage.value?.items.slice(0, 3) || []);
const activeStagePreview = computed(
  () =>
    activeStage.value?.items[0]?.summary ||
    '切换不同阶段节点，查看这一阶段沉淀下来的学习笔记、摘要和持续追踪记录。',
);
const activeStageIndexLabel = computed(() =>
  activeStageIndex.value >= 0 ? formatStageIndex(activeStageIndex.value) : 'Phase --',
);

function formatStageIndex(index: number) {
  return `Phase ${String(index + 1).padStart(2, '0')}`;
}

function getStageShare(noteCount: number) {
  if (!journeyItems.value.length) return 0;
  return Math.round((noteCount / journeyItems.value.length) * 100);
}

function getStageDensity(noteCount: number) {
  if (noteCount >= 5) return '高密度输入';
  if (noteCount >= 3) return '持续推进';
  if (noteCount >= 1) return '探索记录';
  return '等待接入';
}

function selectStage(stageId: string, options: { scroll?: boolean } = {}) {
  selectedStageId.value = stageId;
  if (options.scroll) {
    nextTick(() => {
      focusPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function scrollToFocus() {
  if (!stageSections.value.length) return;
  if (!activeStage.value) {
    selectStage(stageSections.value[0].id, { scroll: true });
    return;
  }
  nextTick(() => {
    focusPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
</script>

<template>
  <div class="section section--projects journey-page">
    <div class="container projects-page__content">
      <section class="journey-command">
        <div class="journey-command__grid">
          <div class="journey-command__main">
            <div class="journey-command__eyebrow">AI Learning Orbit</div>
            <h1 class="journey-command__title">学习历程</h1>
            <p class="journey-command__desc">
              把学习笔记组织成一条可追踪的知识链路，用更像 AI 控制台的方式查看阶段推进、内容密度与当前聚焦主题。
            </p>

            <div class="journey-command__actions">
              <button type="button" class="btn btn--primary btn--lg" @click="scrollToFocus">进入当前阶段</button>
              <a v-if="latestJourneyItem" :href="`#/journey/${latestJourneyItem.id}`" class="btn btn--outline btn--lg">
                查看最近更新
              </a>
            </div>

            <div class="journey-command__metrics">
              <article v-for="card in heroCards" :key="card.label" class="journey-metric-card">
                <span class="journey-metric-card__label">{{ card.label }}</span>
                <strong class="journey-metric-card__value">{{ card.value }}</strong>
                <span class="journey-metric-card__hint">{{ card.hint }}</span>
              </article>
            </div>
          </div>

          <aside class="journey-command__visual">
            <div class="journey-orbit">
              <div class="journey-orbit__label">Neural Overview</div>
              <div class="journey-orbit__title">{{ activeStage?.name || '等待内容接入' }}</div>
              <p class="journey-orbit__desc">{{ activeStagePreview }}</p>

              <div class="journey-orbit__latest">
                <span class="journey-orbit__latest-label">最近更新</span>
                <strong>{{ latestJourneyItem ? latestJourneyItem.title : '暂无学习笔记' }}</strong>
                <span>{{ heroStats.latest }}</span>
              </div>

              <div v-if="stageSections.length" class="journey-orbit__nodes">
                <button
                  v-for="(section, index) in stageSections.slice(0, 4)"
                  :key="section.id"
                  type="button"
                  class="journey-orbit__node"
                  :class="{ active: activeStage?.id === section.id }"
                  @click="selectStage(section.id, { scroll: true })"
                >
                  <span>{{ formatStageIndex(index) }}</span>
                  <strong>{{ section.name }}</strong>
                  <em>{{ section.noteCount }} 条内容</em>
                </button>
              </div>

              <div v-else class="journey-orbit__empty">发布学习内容后，这里会自动生成 AI 路径图。</div>
            </div>
          </aside>
        </div>
      </section>

      <section v-if="stageSections.length" class="journey-network">
        <div class="journey-network__header">
          <div>
            <div class="journey-network__eyebrow">Path Nodes</div>
            <h2 class="journey-network__title">阶段网络</h2>
          </div>
          <p class="journey-network__desc">点击任意节点切换当前聚焦阶段，进度条表示该阶段内容占全部学习笔记的比例。</p>
        </div>

        <div class="journey-network__grid">
          <button
            v-for="(section, index) in stageSections"
            :key="section.id"
            type="button"
            class="journey-node"
            :class="{ active: activeStage?.id === section.id }"
            @click="selectStage(section.id)"
          >
            <div class="journey-node__top">
              <span class="journey-node__index">{{ formatStageIndex(index) }}</span>
              <span class="journey-node__count">{{ section.noteCount }} 条</span>
            </div>
            <div class="journey-node__name">{{ section.name }}</div>
            <div class="journey-node__meta">
              <span>{{ getStageDensity(section.noteCount) }}</span>
              <span>{{ getStageShare(section.noteCount) }}%</span>
            </div>
            <div class="journey-node__bar">
              <span :style="{ width: `${getStageShare(section.noteCount)}%` }"></span>
            </div>
          </button>
        </div>
      </section>

      <section v-if="activeStage" ref="focusPanelRef" class="journey-focus">
        <div class="journey-focus__header">
          <div>
            <div class="journey-focus__eyebrow">Current Focus</div>
            <h2 class="journey-focus__title">{{ activeStage.name }}</h2>
            <p class="journey-focus__desc">
              当前阶段收录 {{ activeStage.noteCount }} 条笔记，占全部内容 {{ activeStageShare }}%，最近一次同步时间为
              {{ activeStageLatest }}。
            </p>
          </div>

          <div class="journey-focus__summary">
            <span class="journey-focus__summary-label">{{ activeStageIndexLabel }}</span>
            <strong class="journey-focus__summary-value">{{ activeStageLatest }}</strong>
            <span class="journey-focus__summary-meta">内容正在持续累积中</span>
          </div>
        </div>

        <div class="journey-focus__signal-grid">
          <article class="journey-signal-card">
            <span class="journey-signal-card__label">内容占比</span>
            <strong class="journey-signal-card__value">{{ activeStageShare }}%</strong>
          </article>
          <article class="journey-signal-card">
            <span class="journey-signal-card__label">已发布</span>
            <strong class="journey-signal-card__value">{{ activeStagePublished }}</strong>
          </article>
          <article class="journey-signal-card">
            <span class="journey-signal-card__label">置顶内容</span>
            <strong class="journey-signal-card__value">{{ activeStagePinned }}</strong>
          </article>
          <article class="journey-signal-card">
            <span class="journey-signal-card__label">阶段笔记</span>
            <strong class="journey-signal-card__value">{{ activeStage.noteCount }}</strong>
          </article>
        </div>

        <div v-if="activeStageFocusItems.length" class="journey-focus__topics">
          <span class="journey-focus__topics-label">Focus Topics</span>
          <div class="journey-focus__topic-list">
            <a
              v-for="item in activeStageFocusItems"
              :key="item.id"
              :href="`#/journey/${item.id}`"
              class="journey-focus__topic-chip"
            >
              {{ item.title }}
            </a>
          </div>
        </div>

        <div v-if="activeStage.items.length" class="journey-note-list">
          <article v-for="(item, itemIndex) in activeStage.items" :key="item.id" class="journey-note-card">
            <div class="journey-note-card__top">
              <span class="journey-note-card__serial">{{ String(itemIndex + 1).padStart(2, '0') }}</span>
              <div class="journey-note-card__badges">
                <span v-if="item.pinned" class="journey-chip journey-chip--accent">置顶</span>
                <span
                  class="journey-chip"
                  :class="item.status === 'published' ? 'journey-chip--success' : 'journey-chip--warning'"
                >
                  {{ item.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </div>
            </div>

            <div class="journey-note-card__meta">
              <span>{{ activeStage.name }}</span>
              <span>{{ formatDate(item.updatedAt) }}</span>
            </div>

            <h3 class="journey-note-card__title">
              <a :href="`#/journey/${item.id}`">{{ item.title }}</a>
            </h3>
            <p class="journey-note-card__summary">{{ item.summary }}</p>

            <div class="journey-note-card__footer">
              <span class="journey-note-card__footer-text">Knowledge Packet</span>
              <a :href="`#/journey/${item.id}`" class="journey-note-card__link">查看详情</a>
            </div>
          </article>
        </div>

        <div v-else class="journey-empty-shell journey-empty-shell--inner">
          <div class="journey-empty-shell__title">该阶段暂时还没有内容</div>
          <div class="journey-empty-shell__desc">可以先切换其他节点查看，或在后台为这一阶段补充学习笔记。</div>
        </div>
      </section>

      <div v-if="!stageSections.length" class="journey-empty-shell">
        <div class="journey-empty-shell__title">暂无学习笔记</div>
        <div class="journey-empty-shell__desc">后台发布学习内容后，这里会自动生成 AI 风格的学习路径与阶段节点。</div>
      </div>
    </div>
  </div>
</template>
