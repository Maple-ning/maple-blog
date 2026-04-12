<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { AdminPostEntry, JourneyItem, JourneyPostEntry, InsightPostEntry, JourneyStage } from '../types';
import { renderMarkdown } from '../utils/markdown';

type PostEditorState = {
  id: string;
  source: 'journey' | 'insight';
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  pinned: boolean;
  sortOrder: number;
  status: string;
  stage: string;
  stageId: string;
  category: string;
  publishedAt: string;
  stack: string;
  sourceUrl: string;
  githubUrl: string;
};

const props = defineProps<{
  listKind: 'journey' | 'insight';
  posts: AdminPostEntry[];
  statusBadge: (status: string) => { label: string; cls: string };
  journeyStages?: JourneyStage[];
}>();

const pageCopy = computed(() =>
  props.listKind === 'journey'
    ? {
        title: '学习历程',
        desc: '左侧维护「学习阶段」名称与顺序（保存后前台 #/journey 按此顺序分组）；右侧管理各阶段下的笔记，编辑时从下拉选择所属阶段。',
        searchPlaceholder: '搜索标题或摘要…',
        emptyHint: '暂无学习笔记。可先添加阶段，再写笔记。',
      }
    : {
        title: 'AI资讯',
        desc: '对应前台「AI资讯」（#/insights）。在此只维护资讯条目，不包含学习历程或项目。',
        searchPlaceholder: '搜索资讯…',
        emptyHint: '暂无资讯条目，可先添加一条 AI 资讯。',
      },
);

const emit = defineEmits<{
  publish: [id: string];
  save: [payload: PostEditorState];
  remove: [id: string];
  'save-stages': [stages: JourneyStage[]];
}>();

const searchKeyword = ref('');
const activeFilter = ref<'all' | 'published' | 'draft'>('all');
/** 学习历程：当前选中的阶段 id，或「全部」 */
const selectedStageId = ref<'all' | string>('all');

const draftStages = ref<JourneyStage[]>([]);

watch(
  () => props.journeyStages,
  (stages) => {
    draftStages.value = (stages || []).map((s) => ({ ...s }));
  },
  { immediate: true, deep: true },
);

watch(
  () => draftStages.value.map((s) => s.id).join(','),
  () => {
    if (selectedStageId.value !== 'all' && !draftStages.value.some((s) => s.id === selectedStageId.value)) {
      selectedStageId.value = 'all';
    }
  },
);

const sortedDraftStages = computed(() =>
  [...draftStages.value].sort((a, b) => a.sortOrder - b.sortOrder),
);

const sortedPropsStages = computed(() =>
  [...(props.journeyStages || [])].sort((a, b) => a.sortOrder - b.sortOrder),
);

function stagePostCount(stage: JourneyStage): number {
  return props.posts.filter((e) => {
    if (e.source !== 'journey') return false;
    const raw = e.raw as JourneyItem;
    if (raw.stageId === stage.id) return true;
    const label = (raw.stage || '').trim() || '未命名阶段';
    return !raw.stageId && label === stage.name;
  }).length;
}

function journeyStageLabel(entry: JourneyPostEntry): string {
  const raw = entry.raw;
  if (raw.stageId && props.journeyStages?.length) {
    const s = props.journeyStages.find((x) => x.id === raw.stageId);
    if (s) return s.name;
  }
  return raw.stage?.trim() || '未命名阶段';
}

function matchesSelectedStage(entry: AdminPostEntry): boolean {
  if (props.listKind !== 'journey' || selectedStageId.value === 'all') return true;
  if (entry.source !== 'journey') return false;
  const meta = draftStages.value.find((s) => s.id === selectedStageId.value);
  if (!meta) return true;
  const raw = entry.raw as JourneyItem;
  if (raw.stageId === meta.id) return true;
  const label = (raw.stage || '').trim() || '未命名阶段';
  return !raw.stageId && label === meta.name;
}

const filteredPosts = computed(() =>
  props.posts.filter((entry) => {
    const matchesFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'published' ? entry.status === 'published' : entry.status !== 'published');
    const keyword = searchKeyword.value.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      entry.title.toLowerCase().includes(keyword) ||
      entry.description.toLowerCase().includes(keyword) ||
      (entry.source === 'journey' && journeyStageLabel(entry as JourneyPostEntry).toLowerCase().includes(keyword));
    return matchesFilter && matchesKeyword && matchesSelectedStage(entry);
  }),
);

const editorOpen = ref(false);
const editor = reactive<PostEditorState>({
  id: '',
  source: 'journey',
  title: '',
  summary: '',
  body: '',
  coverImage: '',
  pinned: false,
  sortOrder: 0,
  status: 'draft',
  stage: '',
  stageId: '',
  category: '',
  publishedAt: '',
  stack: '',
  sourceUrl: '',
  githubUrl: '',
});

const previewHtml = computed(() => renderMarkdown(editor.body || editor.summary));

watch(
  filteredPosts,
  (entries) => {
    if (!entries.some((entry) => entry.id === editor.id)) {
      editorOpen.value = false;
    }
  },
  { deep: true },
);

function reindexDraftStages() {
  const sorted = [...draftStages.value].sort((a, b) => a.sortOrder - b.sortOrder);
  sorted.forEach((s, i) => {
    s.sortOrder = i;
  });
  draftStages.value = sorted.map((s) => ({ ...s }));
}

function moveStageUp(index: number) {
  const list = sortedDraftStages.value;
  if (index <= 0) return;
  const a = list[index];
  const b = list[index - 1];
  const ai = draftStages.value.findIndex((s) => s.id === a.id);
  const bi = draftStages.value.findIndex((s) => s.id === b.id);
  if (ai < 0 || bi < 0) return;
  const t = draftStages.value[ai].sortOrder;
  draftStages.value[ai].sortOrder = draftStages.value[bi].sortOrder;
  draftStages.value[bi].sortOrder = t;
  reindexDraftStages();
}

function moveStageDown(index: number) {
  const list = sortedDraftStages.value;
  if (index >= list.length - 1) return;
  moveStageUp(index + 1);
}

function addDraftStage() {
  const maxOrder = draftStages.value.reduce((m, s) => Math.max(m, s.sortOrder), -1);
  draftStages.value = [
    ...draftStages.value,
    { id: `st-${Date.now()}`, name: '新阶段', sortOrder: maxOrder + 1 },
  ];
  reindexDraftStages();
}

function removeDraftStage(stage: JourneyStage) {
  const n = stagePostCount(stage);
  if (n > 0) {
    window.alert(`「${stage.name}」下仍有 ${n} 条笔记。请先把笔记改到其他阶段，或删除笔记后再删除阶段。`);
    return;
  }
  if (!window.confirm(`确定删除阶段「${stage.name}」？`)) return;
  draftStages.value = draftStages.value.filter((s) => s.id !== stage.id);
  reindexDraftStages();
  if (selectedStageId.value === stage.id) {
    selectedStageId.value = 'all';
  }
}

function emitSaveStages() {
  const sorted = [...draftStages.value].sort((a, b) => a.sortOrder - b.sortOrder);
  const next = sorted.map((s, idx) => ({ ...s, sortOrder: idx }));
  emit('save-stages', next);
}

type JourneyOrInsightEntry = JourneyPostEntry | InsightPostEntry;

function fillEditor(entry: JourneyOrInsightEntry) {
  editor.id = entry.id;
  editor.source = entry.source;
  editor.title = entry.title;
  editor.summary = entry.raw.summary;
  editor.body = entry.raw.body;
  editor.coverImage = entry.raw.coverImage;
  editor.pinned = entry.raw.pinned;
  editor.sortOrder = entry.raw.sortOrder;
  editor.status = entry.raw.status;
  if (entry.source === 'journey') {
    const ji = entry.raw as JourneyItem;
    editor.stage = ji.stage;
    editor.stageId =
      ji.stageId ||
      sortedPropsStages.value.find((s) => s.name === (ji.stage || '').trim())?.id ||
      sortedPropsStages.value[0]?.id ||
      '';
  } else {
    editor.stage = '';
    editor.stageId = '';
  }
  editor.category = entry.source === 'insight' ? entry.raw.category : '';
  editor.publishedAt = entry.source === 'insight' ? entry.raw.publishedAt : '';
  editor.stack = '';
  editor.sourceUrl = '';
  editor.githubUrl = '';
}

function openEditor(entry: AdminPostEntry) {
  if (entry.source !== 'journey' && entry.source !== 'insight') return;
  fillEditor(entry);
  editorOpen.value = true;
}

function closeEditor() {
  editorOpen.value = false;
}

function handleSave() {
  if (!editor.id) return;
  if (editor.source === 'journey') {
    const st = sortedPropsStages.value.find((s) => s.id === editor.stageId);
    if (st) {
      editor.stage = st.name;
    }
  }
  emit('save', { ...editor });
  closeEditor();
}
</script>

<template>
  <section class="posts-view-root">
    <div class="posts-view-header">
      <div>
        <h2 style="font-size: var(--text-2xl); font-weight: 800">{{ pageCopy.title }}</h2>
        <p style="color: var(--color-text-muted); margin-top: 0.35rem">{{ pageCopy.desc }}</p>
      </div>
      <div class="search-bar" style="max-width: 280px">
        <span>🔍</span>
        <input v-model="searchKeyword" type="text" :placeholder="pageCopy.searchPlaceholder" />
      </div>
    </div>

    <!-- 学习历程：双栏（阶段维护 | 笔记列表） -->
    <template v-if="listKind === 'journey'">
      <div class="journey-admin-layout">
        <aside class="panel journey-stages-aside">
          <div class="panel-header">
            <span class="panel-title">学习阶段</span>
          </div>
          <div class="panel-body journey-stages-aside__body">
            <p class="form-hint" style="margin-top: 0; margin-bottom: var(--space-4)">
              名称与顺序保存后，前台按此顺序展示分组。重命名会同步到该阶段下所有笔记。
            </p>
            <button type="button" class="btn btn--outline btn--sm journey-stages-aside__add" @click="addDraftStage">
              + 添加阶段
            </button>
            <nav class="journey-stage-nav" aria-label="按阶段筛选笔记">
              <button
                type="button"
                class="journey-stage-nav__item"
                :class="{ active: selectedStageId === 'all' }"
                @click="selectedStageId = 'all'"
              >
                <span class="journey-stage-nav__name">全部笔记</span>
                <span class="journey-stage-nav__count">{{ posts.length }}</span>
              </button>
              <div
                v-for="(st, idx) in sortedDraftStages"
                :key="st.id"
                class="journey-stage-editor-row"
                :class="{ 'journey-stage-editor-row--active': selectedStageId === st.id }"
                role="button"
                tabindex="0"
                @click="selectedStageId = st.id"
                @keydown.enter.prevent="selectedStageId = st.id"
              >
                <input
                  v-model="st.name"
                  class="form-input journey-stage-editor-row__input"
                  type="text"
                  :aria-label="`阶段 ${idx + 1} 名称`"
                  placeholder="阶段名称"
                  @click.stop
                />
                <span class="journey-stage-nav__count">{{ stagePostCount(st) }}</span>
                <div class="journey-stage-editor-row__actions" @click.stop>
                  <button type="button" class="btn btn--ghost btn--sm" :disabled="idx === 0" title="上移" @click="moveStageUp(idx)">
                    ↑
                  </button>
                  <button
                    type="button"
                    class="btn btn--ghost btn--sm"
                    :disabled="idx >= sortedDraftStages.length - 1"
                    title="下移"
                    @click="moveStageDown(idx)"
                  >
                    ↓
                  </button>
                  <button type="button" class="btn btn--ghost btn--sm" title="删除阶段" @click="removeDraftStage(st)">删</button>
                </div>
              </div>
            </nav>
            <button type="button" class="btn btn--primary journey-stages-aside__save" @click="emitSaveStages">
              保存阶段配置
            </button>
          </div>
        </aside>

        <div class="journey-admin-main">
          <div class="filter-bar" style="margin: 0">
            <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
              全部 ({{ posts.length }})
            </button>
            <button class="filter-btn" :class="{ active: activeFilter === 'published' }" @click="activeFilter = 'published'">
              已发布
            </button>
            <button class="filter-btn" :class="{ active: activeFilter === 'draft' }" @click="activeFilter = 'draft'">
              草稿 / 规划中
            </button>
          </div>

          <div class="panel">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>标题</th>
                    <th>学习阶段</th>
                    <th>状态</th>
                    <th>更新时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in filteredPosts" :key="entry.id">
                    <td>
                      <div style="font-weight: 600; display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap">
                        <span>{{ entry.title || '未命名内容' }}</span>
                        <span v-if="entry.raw.pinned" class="badge badge--blue">置顶</span>
                      </div>
                      <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 0.2rem">
                        {{ entry.description }}
                      </div>
                    </td>
                    <td>
                      <span class="post-tag tag--blue">{{ journeyStageLabel(entry as JourneyPostEntry) }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="statusBadge(entry.status).cls">{{ statusBadge(entry.status).label }}</span>
                    </td>
                    <td style="color: var(--color-text-muted); font-size: var(--text-sm)">{{ entry.date }}</td>
                    <td>
                      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
                        <button class="btn btn--ghost btn--sm" type="button" :data-entry-id="entry.id" @click="openEditor(entry)">
                          编辑
                        </button>
                        <button
                          v-if="entry.status !== 'published'"
                          class="btn btn--primary btn--sm"
                          type="button"
                          @click="emit('publish', entry.id)"
                        >
                          发布
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!filteredPosts.length">
                    <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 2rem 1rem">
                      {{ posts.length ? '当前筛选条件下暂无内容' : pageCopy.emptyHint }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- AI 资讯：单栏表格 -->
    <template v-else>
      <div class="filter-bar" style="margin: 0">
        <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
          全部 ({{ posts.length }})
        </button>
        <button class="filter-btn" :class="{ active: activeFilter === 'published' }" @click="activeFilter = 'published'">
          已发布
        </button>
        <button class="filter-btn" :class="{ active: activeFilter === 'draft' }" @click="activeFilter = 'draft'">
          草稿 / 规划中
        </button>
      </div>

      <div class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in filteredPosts" :key="entry.id">
                <td>
                  <div style="font-weight: 600; display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap">
                    <span>{{ entry.title || '未命名内容' }}</span>
                    <span v-if="entry.raw.pinned" class="badge badge--blue">置顶</span>
                  </div>
                  <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 0.2rem">
                    {{ entry.description }}
                  </div>
                </td>
                <td>
                  <span class="post-tag" :class="entry.categoryClass">{{ entry.category }}</span>
                </td>
                <td>
                  <span class="badge" :class="statusBadge(entry.status).cls">{{ statusBadge(entry.status).label }}</span>
                </td>
                <td style="color: var(--color-text-muted); font-size: var(--text-sm)">{{ entry.date }}</td>
                <td>
                  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
                    <button class="btn btn--ghost btn--sm" type="button" :data-entry-id="entry.id" @click="openEditor(entry)">
                      编辑
                    </button>
                    <button
                      v-if="entry.status !== 'published'"
                      class="btn btn--primary btn--sm"
                      type="button"
                      @click="emit('publish', entry.id)"
                    >
                      发布
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredPosts.length">
                <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 2rem 1rem">
                  {{ posts.length ? '当前筛选条件下暂无内容' : pageCopy.emptyHint }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div class="modal-overlay" :class="{ open: editorOpen }">
      <div class="modal" style="max-width: 880px">
        <div class="modal-header">
          <h3 class="modal-title">编辑{{ listKind === 'journey' ? '学习笔记' : '资讯' }}</h3>
          <button class="modal-close" type="button" @click="closeEditor">×</button>
        </div>
        <div
          v-if="editor.id"
          class="modal-split"
          :class="{ 'modal-split--insight': editor.source === 'insight' }"
        >
          <form
            class="admin-form"
            :class="{ 'admin-form--scroll': editor.source === 'insight' }"
            @submit.prevent="handleSave"
          >
            <div class="form-group">
              <label class="form-label">标题</label>
              <input v-model="editor.title" class="form-input" type="text" />
            </div>
            <div v-if="editor.source === 'journey'" class="form-group">
              <label class="form-label">所属学习阶段</label>
              <select v-if="sortedPropsStages.length" v-model="editor.stageId" class="form-select">
                <option v-for="st in sortedPropsStages" :key="st.id" :value="st.id">{{ st.name }}</option>
              </select>
              <p v-else class="form-hint">请先在左侧添加并「保存阶段配置」，再为笔记选择阶段。</p>
              <div v-if="sortedPropsStages.length" class="form-hint">选项来自已保存的阶段配置；改名请用左栏并保存。</div>
            </div>
            <div class="form-group">
              <label class="form-label">封面图地址</label>
              <input v-model="editor.coverImage" class="form-input" type="url" placeholder="https://..." />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
              <label class="checkbox-row">
                <input v-model="editor.pinned" type="checkbox" />
                <span>置顶内容</span>
              </label>
              <div class="form-group">
                <label class="form-label">排序值</label>
                <input v-model.number="editor.sortOrder" class="form-input" type="number" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
              <div v-if="editor.source === 'insight'" class="form-group">
                <label class="form-label">分类</label>
                <input v-model="editor.category" class="form-input" type="text" placeholder="直接填写，如：行业动态" />
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select v-model="editor.status" class="form-select">
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="in-progress">进行中</option>
                  <option value="planned">规划中</option>
                </select>
              </div>
            </div>
            <div v-if="editor.source === 'insight'" class="form-group">
              <label class="form-label">发布日期</label>
              <input v-model="editor.publishedAt" class="form-input" type="date" />
            </div>
            <div class="form-group">
              <label class="form-label">摘要</label>
              <textarea v-model="editor.summary" class="form-textarea" style="min-height: 140px"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">正文内容</label>
              <textarea v-model="editor.body" class="form-textarea" style="min-height: 220px"></textarea>
            </div>
            <div class="modal-footer" style="justify-content: space-between">
              <button type="button" class="btn btn--ghost" style="color: var(--color-danger)" @click="emit('remove', editor.id); closeEditor()">
                删除
              </button>
              <div style="display: flex; gap: 0.75rem">
                <button type="button" class="btn btn--ghost" @click="closeEditor">取消</button>
                <button type="submit" class="btn btn--primary">保存修改</button>
              </div>
            </div>
          </form>

          <div class="panel" style="overflow: hidden">
            <div class="panel-header"><span class="panel-title">预览</span></div>
            <div
              class="panel-body"
              :class="{ 'modal-preview-scroll': editor.source === 'insight' }"
            >
              <img v-if="editor.coverImage" :src="editor.coverImage" alt="" class="preview-cover" />
              <div class="markdown-preview markdown-body" v-html="previewHtml"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
