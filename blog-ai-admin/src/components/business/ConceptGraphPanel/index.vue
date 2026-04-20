<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type {
  ConceptGraphContent,
  ConceptGraphEdge,
  ConceptGraphNode,
} from "@/types/content";
import { formatDateTime } from "@/utils/format";

const props = defineProps<{
  conceptGraph: ConceptGraphContent;
}>();

const emit = defineEmits<{
  saveConceptGraph: [payload: ConceptGraphContent];
}>();

const graphForm = reactive<ConceptGraphContent>({
  nodes: [],
  edges: [],
  updatedAt: "",
});

watch(
  () => props.conceptGraph,
  (value) => {
    graphForm.nodes = (value.nodes || []).map((node) => ({ ...node }));
    graphForm.edges = (value.edges || []).map((edge) => ({ ...edge }));
    graphForm.updatedAt = value.updatedAt;
  },
  { immediate: true, deep: true },
);

const nodeNameOptions = computed(() =>
  graphForm.nodes
    .map((node) => node.name.trim())
    .filter(Boolean),
);

function createEmptyNode(): ConceptGraphNode {
  return {
    name: "",
    category: "core",
    desc: "",
    example: "",
    symbolSize: undefined,
  };
}

function createEmptyEdge(): ConceptGraphEdge {
  return {
    source: "",
    target: "",
    relation: "",
    description: "",
  };
}

function addNode() {
  graphForm.nodes.push(createEmptyNode());
}

function removeNode(index: number) {
  graphForm.nodes.splice(index, 1);
}

function addEdge() {
  graphForm.edges.push(createEmptyEdge());
}

function removeEdge(index: number) {
  graphForm.edges.splice(index, 1);
}

function normalizeNode(node: ConceptGraphNode): ConceptGraphNode {
  const next: ConceptGraphNode = {
    name: node.name.trim(),
    category: node.category.trim() || "core",
    desc: node.desc.trim(),
    example: node.example.trim(),
  };

  if (typeof node.symbolSize === "number" && Number.isFinite(node.symbolSize)) {
    next.symbolSize = node.symbolSize;
  }

  return next;
}

function normalizeEdge(edge: ConceptGraphEdge): ConceptGraphEdge {
  return {
    source: edge.source.trim(),
    target: edge.target.trim(),
    relation: edge.relation.trim(),
    description: edge.description.trim(),
  };
}

function submit() {
  const nodes = graphForm.nodes.map(normalizeNode).filter((node) => node.name);
  const edges = graphForm.edges
    .map(normalizeEdge)
    .filter((edge) => edge.source && edge.target);

  emit("saveConceptGraph", {
    nodes,
    edges,
    updatedAt: graphForm.updatedAt,
  });
}
</script>

<template>
  <section class="admin-panel-stack">
    <div class="panel">
      <div class="panel-header concept-graph-panel__header">
        <div>
          <span class="panel-title">首页概念图谱</span>
          <p class="concept-graph-panel__desc">
            这里维护 blog-ai 首页 banner 的节点和连线数据，保存后前台会直接读取最新内容。
          </p>
        </div>
        <span class="concept-graph-panel__updated-at">
          最近更新 {{ formatDateTime(conceptGraph.updatedAt) }}
        </span>
      </div>
      <div class="panel-body">
        <form class="admin-form concept-graph-panel" @submit.prevent="submit">
          <section class="concept-graph-panel__section">
            <div class="concept-graph-panel__section-head">
              <div>
                <h3>节点列表</h3>
                <p>节点名称必须唯一，分类会影响前台图谱颜色。</p>
              </div>
              <button type="button" class="btn btn--outline btn--sm" @click="addNode">
                添加节点
              </button>
            </div>

            <div v-if="graphForm.nodes.length" class="concept-graph-panel__list">
              <article
                v-for="(node, index) in graphForm.nodes"
                :key="`node-${index}`"
                class="concept-graph-panel__card"
              >
                <div class="concept-graph-panel__card-head">
                  <strong>节点 {{ index + 1 }}</strong>
                  <button
                    type="button"
                    class="btn btn--ghost btn--sm"
                    @click="removeNode(index)"
                  >
                    删除
                  </button>
                </div>

                <div class="concept-graph-panel__grid concept-graph-panel__grid--node">
                  <div class="form-group">
                    <label class="form-label">名称</label>
                    <input v-model="node.name" class="form-input" type="text" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">分类</label>
                    <select v-model="node.category" class="form-select">
                      <option value="core">core</option>
                      <option value="agent">agent</option>
                      <option value="tool">tool</option>
                      <option value="skill">skill</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">节点大小</label>
                    <input
                      v-model.number="node.symbolSize"
                      class="form-input"
                      type="number"
                      min="1"
                      placeholder="可选"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">说明</label>
                  <textarea v-model="node.desc" class="form-textarea form-textarea--compact" />
                </div>

                <div class="form-group">
                  <label class="form-label">示例</label>
                  <input v-model="node.example" class="form-input" type="text" />
                </div>
              </article>
            </div>

            <div v-else class="empty-state empty-state--compact">
              <div class="empty-title">还没有节点</div>
              <div class="empty-desc">点击“添加节点”后即可开始维护首页图谱。</div>
            </div>
          </section>

          <section class="concept-graph-panel__section">
            <div class="concept-graph-panel__section-head">
              <div>
                <h3>连线列表</h3>
                <p>连线的起点和终点需要对应已有节点名称。</p>
              </div>
              <button type="button" class="btn btn--outline btn--sm" @click="addEdge">
                添加连线
              </button>
            </div>

            <div v-if="graphForm.edges.length" class="concept-graph-panel__list">
              <article
                v-for="(edge, index) in graphForm.edges"
                :key="`edge-${index}`"
                class="concept-graph-panel__card"
              >
                <div class="concept-graph-panel__card-head">
                  <strong>连线 {{ index + 1 }}</strong>
                  <button
                    type="button"
                    class="btn btn--ghost btn--sm"
                    @click="removeEdge(index)"
                  >
                    删除
                  </button>
                </div>

                <div class="concept-graph-panel__grid">
                  <div class="form-group">
                    <label class="form-label">起点</label>
                    <input
                      v-model="edge.source"
                      class="form-input"
                      type="text"
                      list="concept-graph-node-options"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">终点</label>
                    <input
                      v-model="edge.target"
                      class="form-input"
                      type="text"
                      list="concept-graph-node-options"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">关系名称</label>
                    <input v-model="edge.relation" class="form-input" type="text" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">关系说明</label>
                  <textarea
                    v-model="edge.description"
                    class="form-textarea form-textarea--compact"
                  />
                </div>
              </article>
            </div>

            <div v-else class="empty-state empty-state--compact">
              <div class="empty-title">还没有连线</div>
              <div class="empty-desc">添加连线后，前台图谱会展示节点之间的关系。</div>
            </div>
          </section>

          <div class="concept-graph-panel__actions">
            <button type="submit" class="btn btn--primary">保存概念图谱</button>
          </div>
        </form>
      </div>
    </div>

    <datalist id="concept-graph-node-options">
      <option v-for="name in nodeNameOptions" :key="name" :value="name" />
    </datalist>
  </section>
</template>

<style scoped>
.concept-graph-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.concept-graph-panel__header {
  align-items: flex-start;
  gap: 1rem;
}

.concept-graph-panel__desc {
  margin-top: 0.4rem;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.concept-graph-panel__updated-at {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  white-space: nowrap;
}

.concept-graph-panel__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.concept-graph-panel__section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.concept-graph-panel__section-head h3 {
  font-size: 1rem;
}

.concept-graph-panel__section-head p {
  margin-top: 0.3rem;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.concept-graph-panel__list {
  display: grid;
  gap: 1rem;
}

.concept-graph-panel__card {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-soft);
}

.concept-graph-panel__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.concept-graph-panel__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.concept-graph-panel__grid--node {
  align-items: end;
}

.concept-graph-panel__actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state--compact {
  padding: 1.5rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-soft);
}

@media (max-width: 900px) {
  .concept-graph-panel__grid {
    grid-template-columns: 1fr;
  }

  .concept-graph-panel__actions {
    justify-content: stretch;
  }

  .concept-graph-panel__actions .btn {
    width: 100%;
  }
}
</style>
