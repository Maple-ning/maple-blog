<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type {
  AdminPostEntry,
  JourneyItem,
  JourneyPostEntry,
  InsightPostEntry,
  JourneyStage,
} from "@/types/content";
import { renderMarkdown } from "@/utils/markdown";

type PostEditorState = {
  id: string;
  source: "journey" | "insight";
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
  listKind: "journey" | "insight";
  posts: AdminPostEntry[];
  statusBadge: (status: string) => { label: string; cls: string };
  journeyStages?: JourneyStage[];
}>();

const pageCopy = computed(() =>
  props.listKind === "journey"
    ? {
        searchPlaceholder: "搜索标题或摘要…",
        emptyHint: "暂无学习笔记。可先添加阶段，再写笔记。",
      }
    : {
        searchPlaceholder: "搜索资讯…",
        emptyHint: "暂无资讯条目，可先添加一条 AI 资讯。",
      },
);

const emit = defineEmits<{
  publish: [id: string];
  save: [payload: PostEditorState];
  create: [payload: PostEditorState];
  remove: [id: string];
  "save-stages": [stages: JourneyStage[]];
}>();

const searchKeyword = ref("");
const activeFilter = ref<"all" | "published" | "draft">("all");
/** 学习历程：当前选中的阶段 id，或「全部」 */
const selectedStageId = ref<"all" | string>("all");

const draftStages = ref<JourneyStage[]>([]);

watch(
  () => props.journeyStages,
  (stages) => {
    draftStages.value = (stages || []).map((s) => ({ ...s }));
  },
  { immediate: true, deep: true },
);

watch(
  () => draftStages.value.map((s) => s.id).join(","),
  () => {
    const firstStageId = [...draftStages.value].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.id;
    if (!draftStages.value.length) {
      selectedStageId.value = "all";
      return;
    }
    if (!firstStageId) {
      selectedStageId.value = "all";
      return;
    }
    if (selectedStageId.value === "all") {
      selectedStageId.value = firstStageId;
      return;
    }
    if (!draftStages.value.some((s) => s.id === selectedStageId.value)) {
      selectedStageId.value = firstStageId;
    }
  },
  { immediate: true },
);

const sortedDraftStages = computed(() =>
  [...draftStages.value].sort((a, b) => a.sortOrder - b.sortOrder),
);

watch(
  sortedDraftStages,
  (stages) => {
    const firstStageId = stages[0]?.id;
    if (!firstStageId) {
      selectedStageId.value = "all";
      return;
    }
    if (selectedStageId.value === "all" || !stages.some((stage) => stage.id === selectedStageId.value)) {
      selectedStageId.value = firstStageId;
    }
  },
  { immediate: true, deep: true },
);

const sortedPropsStages = computed(() =>
  [...(props.journeyStages || [])].sort((a, b) => a.sortOrder - b.sortOrder),
);

const selectedDraftStage = computed(() =>
  selectedStageId.value === "all"
    ? null
    : sortedDraftStages.value.find(
        (stage) => stage.id === selectedStageId.value,
      ) || null,
);

const stageNameModalOpen = ref(false);
const stageNameModalMode = ref<"create" | "rename">("create");
const stageNameInput = ref("");
const editingStageId = ref("");

function journeyStageLabel(entry: JourneyPostEntry): string {
  const raw = entry.raw;
  if (raw.stageId && props.journeyStages?.length) {
    const s = props.journeyStages.find((x) => x.id === raw.stageId);
    if (s) return s.name;
  }
  return raw.stage?.trim() || "未命名阶段";
}

function matchesSelectedStage(entry: AdminPostEntry): boolean {
  if (props.listKind !== "journey") return true;
  if (selectedStageId.value === "all") return true;
  if (entry.source !== "journey") return false;
  const meta = draftStages.value.find((s) => s.id === selectedStageId.value);
  if (!meta) return true;
  const raw = entry.raw as JourneyItem;
  if (raw.stageId === meta.id) return true;
  const label = (raw.stage || "").trim() || "未命名阶段";
  return !raw.stageId && label === meta.name;
}

const filteredPosts = computed(() =>
  props.posts.filter((entry) => {
    const matchesFilter =
      activeFilter.value === "all" ||
      (activeFilter.value === "published"
        ? entry.status === "published"
        : entry.status !== "published");
    const keyword = searchKeyword.value.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      entry.title.toLowerCase().includes(keyword) ||
      entry.description.toLowerCase().includes(keyword) ||
      (entry.source === "journey" &&
        journeyStageLabel(entry as JourneyPostEntry)
          .toLowerCase()
          .includes(keyword));
    return matchesFilter && matchesKeyword && matchesSelectedStage(entry);
  }),
);

const editorOpen = ref(false);
const editor = reactive<PostEditorState>({
  id: "",
  source: "journey",
  title: "",
  summary: "",
  body: "",
  coverImage: "",
  pinned: false,
  sortOrder: 0,
  status: "draft",
  stage: "",
  stageId: "",
  category: "",
  publishedAt: "",
  stack: "",
  sourceUrl: "",
  githubUrl: "",
});

const previewHtml = computed(() =>
  renderMarkdown(editor.body || editor.summary),
);

watch(
  filteredPosts,
  (entries) => {
    if (editor.id && !entries.some((entry) => entry.id === editor.id)) {
      editorOpen.value = false;
    }
  },
  { deep: true },
);

function reindexDraftStages() {
  const sorted = [...draftStages.value].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  sorted.forEach((s, i) => {
    s.sortOrder = i;
  });
  draftStages.value = sorted.map((s) => ({ ...s }));
}

function openCreateStageModal() {
  stageNameModalMode.value = "create";
  stageNameInput.value = "";
  editingStageId.value = "";
  stageNameModalOpen.value = true;
}

function openRenameStageModal(stage: JourneyStage) {
  if (stage.id === "unassigned") return;
  stageNameModalMode.value = "rename";
  stageNameInput.value = stage.name;
  editingStageId.value = stage.id;
  stageNameModalOpen.value = true;
}

function closeStageNameModal() {
  stageNameModalOpen.value = false;
  stageNameInput.value = "";
  editingStageId.value = "";
}

function submitStageNameModal() {
  const nextName = stageNameInput.value.trim();
  if (!nextName) return;

  if (stageNameModalMode.value === "create") {
    const maxOrder = draftStages.value.reduce(
      (m, s) => Math.max(m, s.sortOrder),
      -1,
    );
    const nextId = `st-${Date.now()}`;
    draftStages.value = [
      ...draftStages.value,
      { id: nextId, name: nextName, sortOrder: maxOrder + 1 },
    ];
    reindexDraftStages();
    selectedStageId.value = nextId;
  } else {
    const target = draftStages.value.find((stage) => stage.id === editingStageId.value);
    if (target) {
      target.name = nextName;
      draftStages.value = draftStages.value.map((stage) => ({ ...stage }));
    }
  }

  emitSaveStages();
  closeStageNameModal();
}

function removeSelectedStage() {
  const stage = selectedDraftStage.value;
  if (!stage) return;
  const n = journeyStageColumns.value.find((column) => column.stage.id === stage.id)?.entries.length || 0;
  if (n > 0) {
    window.alert(
      `「${stage.name}」下仍有 ${n} 条笔记。请先把笔记改到其他阶段，或删除笔记后再删除阶段。`,
    );
    return;
  }
  if (!window.confirm(`确定删除阶段「${stage.name}」？`)) return;
  draftStages.value = draftStages.value.filter((item) => item.id !== stage.id);
  reindexDraftStages();
  emitSaveStages();
}

function emitSaveStages() {
  const sorted = [...draftStages.value].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const next = sorted.map((s, idx) => ({ ...s, sortOrder: idx }));
  emit("save-stages", next);
}

const journeyStageColumns = computed(() => {
  const visibleJourneyPosts = filteredPosts.value.filter(
    (entry): entry is JourneyPostEntry => entry.source === "journey",
  );
  const columns = sortedDraftStages.value.map((stage, index) => {
    const entries = visibleJourneyPosts.filter((entry) => {
      const raw = entry.raw as JourneyItem;
      if (raw.stageId === stage.id) return true;
      const label = (raw.stage || "").trim() || "未命名阶段";
      return !raw.stageId && label === stage.name;
    });
    return {
      stage,
      index,
      entries,
    };
  });

  const extraEntries = visibleJourneyPosts.filter((entry) => {
    const label = journeyStageLabel(entry);
    return !columns.some((column) => column.stage.name === label);
  });

  if (extraEntries.length) {
    columns.push({
      stage: {
        id: "unassigned",
        name: "未归类阶段",
        sortOrder: columns.length,
      },
      index: columns.length,
      entries: extraEntries,
    });
  }

  return columns;
});

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
  if (entry.source === "journey") {
    const ji = entry.raw as JourneyItem;
    editor.stage = ji.stage;
    editor.stageId =
      ji.stageId ||
      sortedPropsStages.value.find((s) => s.name === (ji.stage || "").trim())
        ?.id ||
      sortedPropsStages.value[0]?.id ||
      "";
  } else {
    editor.stage = "";
    editor.stageId = "";
  }
  editor.category = entry.source === "insight" ? entry.raw.category : "";
  editor.publishedAt = entry.source === "insight" ? entry.raw.publishedAt : "";
  editor.stack = "";
  editor.sourceUrl = "";
  editor.githubUrl = "";
}

function openCreatePost() {
  let nextSortOrder = 0;
  let stageName = "";
  let stageId = "";

  if (props.listKind === "journey") {
    const selectedStage = selectedDraftStage.value;
    const stageEntries =
      selectedStage
        ? journeyStageColumns.value.find((column) => column.stage.id === selectedStage.id)?.entries || []
        : [];
    nextSortOrder =
      stageEntries.reduce(
        (max, entry) => Math.max(max, entry.raw.sortOrder),
        -1,
      ) + 1;
    stageName = selectedStage?.name || "";
    stageId = selectedStage?.id || sortedPropsStages.value[0]?.id || "";
  } else {
    nextSortOrder =
      props.posts.reduce(
        (max, entry) => Math.max(max, entry.raw.sortOrder),
        -1,
      ) + 1;
  }

  editor.id = "";
  editor.source = props.listKind;
  editor.title = "";
  editor.summary = "";
  editor.body = "";
  editor.coverImage = "";
  editor.pinned = false;
  editor.sortOrder = Math.max(0, nextSortOrder);
  editor.status = "draft";
  editor.stage = stageName;
  editor.stageId = stageId;
  editor.category = props.listKind === "insight" ? "AI资讯" : "";
  editor.publishedAt = "";
  editor.stack = "";
  editor.sourceUrl = "";
  editor.githubUrl = "";
  editorOpen.value = true;
}

function openEditor(entry: AdminPostEntry) {
  if (entry.source !== "journey" && entry.source !== "insight") return;
  fillEditor(entry);
  editorOpen.value = true;
}

function closeEditor() {
  editorOpen.value = false;
}

function handleSave() {
  if (editor.source === "journey") {
    const st = sortedPropsStages.value.find((s) => s.id === editor.stageId);
    if (st) {
      editor.stage = st.name;
    }
  }
  if (editor.id) {
    emit("save", { ...editor });
  } else {
    emit("create", { ...editor });
  }
  closeEditor();
}
</script>

<template>
  <section class="posts-view-root">
    <!-- 学习历程：头部流图 + 单阶段列表 -->
    <template v-if="listKind === 'journey'">
      <div class="journey-admin-layout journey-lab-shell">
        <section class="panel journey-stage-top-panel journey-tech-panel">
          <div class="panel-body journey-stage-top-panel__body">
            <div class="journey-stage-board-frame">
              <div class="journey-stage-board-shell">
                <div class="journey-stage-board" aria-label="学习阶段流图">
                  <article
                    v-for="column in journeyStageColumns"
                    :key="column.stage.id"
                    class="journey-stage-flow-item"
                    :class="{
                      'journey-stage-flow-item--active':
                        selectedStageId === column.stage.id,
                    }"
                  >
                    <button
                      type="button"
                      class="journey-stage-flow-item__button"
                      @click="selectedStageId = column.stage.id"
                    >
                      <span class="journey-stage-flow-item__step"
                        >第 {{ column.index + 1 }} 步</span
                      >
                      <span class="journey-stage-flow-item__node"></span>
                      <span class="journey-stage-flow-item__label">{{
                        column.stage.name
                      }}</span>
                    </button>
                  </article>
                  <article
                    class="journey-stage-flow-item journey-stage-flow-item--adder"
                  >
                    <button
                      type="button"
                      class="journey-stage-flow-item__button journey-stage-flow-item__button--adder"
                      @click="openCreateStageModal"
                    >
                      <span class="journey-stage-flow-item__step">新增阶段</span>
                      <span
                        class="journey-stage-flow-item__node journey-stage-flow-item__node--adder"
                      ></span>
                      <span
                        class="journey-stage-flow-item__label journey-stage-flow-item__label--adder"
                        >点击新增阶段</span
                      >
                    </button>
                  </article>
                </div>
                <aside class="journey-stage-side-actions">
                  <button
                    type="button"
                    class="journey-stage-side-actions__btn"
                    :disabled="!selectedDraftStage"
                    @click="selectedDraftStage && openRenameStageModal(selectedDraftStage)"
                  >
                    修改
                  </button>
                  <button
                    type="button"
                    class="journey-stage-side-actions__btn journey-stage-side-actions__btn--danger"
                    :disabled="!selectedDraftStage"
                    @click="removeSelectedStage"
                  >
                    删除
                  </button>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section class="panel journey-stage-list-panel">
          <div class="panel-body journey-stage-list-panel__body">
            <div
              v-if="selectedDraftStage"
              class="journey-stage-list-head"
            >
              <div class="journey-stage-list-head__title-wrap">
                <div class="journey-stage-list-head__title" :title="selectedDraftStage.name">
                  {{ selectedDraftStage.name }}
                </div>
                <div class="journey-stage-list-head__meta">
                  当前阶段共 {{ filteredPosts.length }} 条内容
                </div>
              </div>
              <button
                type="button"
                class="journey-stage-list-head__primary"
                @click="openCreatePost"
              >
                新增内容
              </button>
            </div>
            <div
              v-if="selectedDraftStage && filteredPosts.length"
              class="journey-table-shell"
            >
              <div class="table-wrap">
                <table class="data-table data-table--fixed">
                  <colgroup>
                    <col class="posts-panel__col-title" />
                    <col class="posts-panel__col-summary" />
                    <col class="posts-panel__col-status" />
                    <col class="posts-panel__col-date" />
                    <col class="posts-panel__col-actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>标题</th>
                      <th>摘要</th>
                      <th>状态</th>
                      <th>更新时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="entry in filteredPosts" :key="entry.id">
                      <td>
                        <div
                          class="table-cell-title"
                          :title="entry.title || '未命名内容'"
                        >
                          <span class="cell-ellipsis">{{
                            entry.title || "未命名内容"
                          }}</span>
                          <span
                            v-if="entry.raw.pinned"
                            class="badge badge--blue"
                            >置顶</span
                          >
                        </div>
                      </td>
                      <td>
                        <div
                          class="table-cell-muted cell-ellipsis"
                          :title="entry.description || '暂无摘要'"
                        >
                          {{ entry.description || "暂无摘要" }}
                        </div>
                      </td>
                      <td>
                        <span
                          class="badge"
                          :class="statusBadge(entry.status).cls"
                          >{{ statusBadge(entry.status).label }}</span
                        >
                      </td>
                      <td class="table-cell-muted">
                        {{ entry.date }}
                      </td>
                      <td>
                        <div class="table-row-actions">
                          <button
                            class="btn btn--ghost btn--sm"
                            type="button"
                            :data-entry-id="entry.id"
                            @click="openEditor(entry)"
                          >
                            编辑
                          </button>
                          <button
                            class="btn btn--ghost btn--sm btn--danger-text"
                            type="button"
                            @click="emit('remove', entry.id)"
                          >
                            删除
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
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else class="empty-state posts-panel__empty-state">
              <div class="empty-title">
                {{
                  !sortedDraftStages.length
                    ? pageCopy.emptyHint
                    : selectedDraftStage
                      ? "当前筛选条件下暂无内容"
                      : "请先从上方选择一个阶段"
                }}
              </div>
              <div class="empty-desc">
                上方负责阶段，下方只显示当前阶段的内容列表。
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- AI 资讯：单栏表格 -->
    <template v-else>
      <div class="journey-stage-list-head insights-list-head">
        <div class="journey-stage-list-head__title-wrap">
          <div class="journey-stage-list-head__title">AI 资讯</div>
          <div class="journey-stage-list-head__meta">
            共 {{ posts.length }} 条，筛选后 {{ filteredPosts.length }} 条
          </div>
        </div>
        <button
          type="button"
          class="journey-stage-list-head__primary"
          @click="openCreatePost"
        >
          新增资讯
        </button>
      </div>
      <div class="filter-bar posts-panel__filter-bar">
        <button
          class="filter-btn"
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          全部 ({{ posts.length }})
        </button>
        <button
          class="filter-btn"
          :class="{ active: activeFilter === 'published' }"
          @click="activeFilter = 'published'"
        >
          已发布
        </button>
        <button
          class="filter-btn"
          :class="{ active: activeFilter === 'draft' }"
          @click="activeFilter = 'draft'"
        >
          草稿 / 规划中
        </button>
      </div>

      <div class="panel">
        <div class="table-wrap">
          <table class="data-table data-table--fixed">
            <colgroup>
              <col class="posts-panel__col-summary" />
              <col class="posts-panel__col-category" />
              <col class="posts-panel__col-status" />
              <col class="posts-panel__col-date" />
              <col class="posts-panel__col-actions" />
            </colgroup>
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
                  <div
                    class="table-cell-title"
                    :title="entry.title || '未命名内容'"
                  >
                    <span class="cell-ellipsis">{{
                      entry.title || "未命名内容"
                    }}</span>
                    <span v-if="entry.raw.pinned" class="badge badge--blue"
                      >置顶</span
                    >
                  </div>
                  <div
                    class="table-cell-subtext cell-ellipsis"
                    :title="entry.description"
                  >
                    {{ entry.description }}
                  </div>
                </td>
                <td>
                  <span class="post-tag" :class="entry.categoryClass">{{
                    entry.category
                  }}</span>
                </td>
                <td>
                  <span class="badge" :class="statusBadge(entry.status).cls">{{
                    statusBadge(entry.status).label
                  }}</span>
                </td>
                <td
                  class="table-cell-muted"
                >
                  {{ entry.date }}
                </td>
                <td>
                  <div class="table-row-actions">
                    <button
                      class="btn btn--ghost btn--sm"
                      type="button"
                      :data-entry-id="entry.id"
                      @click="openEditor(entry)"
                    >
                      编辑
                    </button>
                    <button
                      class="btn btn--ghost btn--sm btn--danger-text"
                      type="button"
                      @click="emit('remove', entry.id)"
                    >
                      删除
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
                <td colspan="5" class="posts-panel__empty-row">
                  {{
                    posts.length ? "当前筛选条件下暂无内容" : pageCopy.emptyHint
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div class="modal-overlay" :class="{ open: stageNameModalOpen }">
      <div class="modal modal--stage-editor">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ stageNameModalMode === "create" ? "新增阶段" : "修改阶段名" }}
          </h3>
          <button class="modal-close" type="button" @click="closeStageNameModal">
            ×
          </button>
        </div>
        <form class="modal-stack admin-form" @submit.prevent="submitStageNameModal">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">阶段名称</label>
              <input
                v-model="stageNameInput"
                class="form-input"
                type="text"
                placeholder="请输入阶段名称"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn--ghost" @click="closeStageNameModal">
              取消
            </button>
            <button type="submit" class="btn btn--primary" :disabled="!stageNameInput.trim()">
              确认
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: editorOpen }">
      <div class="modal modal--posts-editor">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editor.id ? "编辑" : "新增" }}{{ listKind === "journey" ? "学习笔记" : "资讯" }}
          </h3>
          <button class="modal-close" type="button" @click="closeEditor">
            ×
          </button>
        </div>
        <form class="modal-stack admin-form" @submit.prevent="handleSave">
          <div class="modal-body modal-body--split">
            <div
              class="modal-split"
              :class="{ 'modal-split--insight': editor.source === 'insight' }"
            >
              <div class="modal-split__form">
                <div class="form-group">
                  <label class="form-label">标题</label>
                  <input v-model="editor.title" class="form-input" type="text" />
                </div>
                <div v-if="editor.source === 'journey'" class="form-group">
                  <label class="form-label">所属学习阶段</label>
                  <select
                    v-if="sortedPropsStages.length"
                    v-model="editor.stageId"
                    class="form-select"
                  >
                    <option
                      v-for="st in sortedPropsStages"
                      :key="st.id"
                      :value="st.id"
                    >
                      {{ st.name }}
                    </option>
                  </select>
                  <p v-else class="form-hint">
                    请先在左侧添加并「保存阶段配置」，再为笔记选择阶段。
                  </p>
                  <div v-if="sortedPropsStages.length" class="form-hint">
                    选项来自已保存的阶段配置；改名请用左栏并保存。
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">封面图地址</label>
                  <input
                    v-model="editor.coverImage"
                    class="form-input"
                    type="url"
                    placeholder="https://..."
                  />
                </div>
                <div class="posts-panel__form-grid">
                  <label class="checkbox-row">
                    <input v-model="editor.pinned" type="checkbox" />
                    <span>置顶内容</span>
                  </label>
                  <div class="form-group">
                    <label class="form-label">排序值</label>
                    <input
                      v-model.number="editor.sortOrder"
                      class="form-input"
                      type="number"
                    />
                  </div>
                </div>
                <div class="posts-panel__form-grid">
                  <div v-if="editor.source === 'insight'" class="form-group">
                    <label class="form-label">分类</label>
                    <input
                      v-model="editor.category"
                      class="form-input"
                      type="text"
                      placeholder="直接填写，如：行业动态"
                    />
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
                  <input
                    v-model="editor.publishedAt"
                    class="form-input"
                    type="date"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">摘要</label>
                  <textarea
                    v-model="editor.summary"
                    class="form-textarea form-textarea--medium"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">正文内容</label>
                  <textarea
                    v-model="editor.body"
                    class="form-textarea form-textarea--xlarge"
                  ></textarea>
                </div>
              </div>

              <div class="modal-split__preview">
                <div class="panel">
                  <div class="panel-header">
                    <span class="panel-title">预览</span>
                  </div>
                  <div class="panel-body">
                    <img
                      v-if="editor.coverImage"
                      :src="editor.coverImage"
                      alt=""
                      class="preview-cover"
                    />
                    <div
                      class="markdown-preview markdown-body"
                      v-html="previewHtml"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="modal-footer"
            :class="
              editor.id ? 'modal-footer--between' : 'modal-footer--end'
            "
          >
            <button
              v-if="editor.id"
              type="button"
              class="btn btn--ghost posts-panel__danger-btn"
              @click="
                emit('remove', editor.id);
                closeEditor();
              "
            >
              删除
            </button>
            <div class="posts-panel__modal-actions">
              <button type="button" class="btn btn--ghost" @click="closeEditor">
                取消
              </button>
              <button type="submit" class="btn btn--primary">
                {{ editor.id ? "保存修改" : "创建" }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
