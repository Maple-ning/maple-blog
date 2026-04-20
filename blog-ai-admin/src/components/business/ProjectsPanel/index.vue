<script setup lang="ts">
import { reactive, ref } from "vue";
import type { ProjectItem } from "@/types/content";
import { openExternalLink } from "@/utils/externalLink";
import { formatDate } from "@/utils/format";

const props = defineProps<{
  projects: ProjectItem[];
  statusBadge: (status: string) => { label: string; cls: string };
}>();

const emit = defineEmits<{
  save: [item: ProjectItem];
  remove: [id: string];
  openProjectModal: [];
}>();

const editorOpen = ref(false);
const editor = reactive<ProjectItem>({
  id: '',
  title: '',
  summary: '',
  body: '',
  coverImage: '',
  pinned: false,
  sortOrder: 0,
  status: 'planned',
  stack: [],
  sourceUrl: '',
  githubUrl: '',
  updatedAt: '',
});

const stackText = ref("");

function openEditor(item: ProjectItem) {
  editor.id = item.id;
  editor.title = item.title;
  editor.summary = item.summary;
  editor.body = item.body;
  editor.coverImage = item.coverImage;
  editor.pinned = false;
  editor.sortOrder = item.sortOrder;
  editor.status = item.status;
  editor.stack = [...item.stack];
  editor.sourceUrl = item.sourceUrl;
  editor.githubUrl = item.githubUrl;
  editor.updatedAt = item.updatedAt;
  stackText.value = item.stack.join(', ');
  editorOpen.value = true;
}

function closeEditor() {
  editorOpen.value = false;
}

function updateStack(value: string) {
  stackText.value = value;
  editor.stack = value.split(',').map((item) => item.trim()).filter(Boolean);
}

function handleSave() {
  emit('save', { ...editor, pinned: false, stack: [...editor.stack] });
  closeEditor();
}

function openProjectLink(url: string, label: string) {
  openExternalLink(url, label);
}
</script>

<template>
  <section class="admin-panel-stack">
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">项目列表</span>
        <button class="btn btn--primary btn--sm" type="button" @click="$emit('openProjectModal')">
          添加项目
        </button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>项目名称</th><th>状态</th><th>技术栈</th><th>更新时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in projects" :key="item.id">
              <td class="projects-panel__title-cell">
                <div class="projects-panel__title"><span>{{ item.title }}</span></div>
                <div class="projects-panel__summary">{{ item.summary }}</div>
              </td>
              <td><span class="badge" :class="statusBadge(item.status).cls">{{ statusBadge(item.status).label }}</span></td>
              <td>
                <div class="projects-panel__stack">
                  <span v-for="tag in item.stack" :key="tag" class="badge badge--gray">{{ tag }}</span>
                  <span v-if="!item.stack.length" class="projects-panel__empty">未设置</span>
                </div>
              </td>
              <td class="projects-panel__date">{{ formatDate(item.updatedAt) }}</td>
              <td>
                <div class="projects-panel__actions">
                  <button class="btn btn--ghost btn--sm" type="button" @click="openEditor(item)">编辑</button>
                  <button class="btn btn--ghost btn--sm projects-panel__danger" type="button" @click="$emit('remove', item.id)">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!projects.length">
              <td colspan="5" class="projects-panel__empty-row">当前还没有项目内容</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: editorOpen }">
      <div class="modal modal--projects-editor">
        <div class="modal-header">
          <h3 class="modal-title">编辑项目</h3>
          <button class="modal-close" type="button" @click="closeEditor">×</button>
        </div>
        <form v-if="editor.id" class="modal-stack admin-form" @submit.prevent="handleSave">
          <div class="modal-body modal-body--split">
            <div class="modal-split">
              <div class="modal-split__form">
                <div class="form-group">
                  <label class="form-label">项目名称</label>
                  <input v-model="editor.title" class="form-input" type="text" />
                </div>
                <div class="modal-grid-2">
                  <div class="form-group">
                    <label class="form-label">排序值</label>
                    <input v-model.number="editor.sortOrder" class="form-input" type="number" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">状态</label>
                    <select v-model="editor.status" class="form-select">
                      <option value="planned">规划中</option>
                      <option value="in-progress">进行中</option>
                      <option value="published">已上线</option>
                    </select>
                  </div>
                </div>
                <div class="modal-grid-2">
                  <div class="form-group">
                    <label class="form-label">项目网址</label>
                    <input v-model="editor.sourceUrl" class="form-input" type="url" placeholder="https://..." />
                  </div>
                  <div class="form-group">
                    <label class="form-label">GitHub 地址</label>
                    <input v-model="editor.githubUrl" class="form-input" type="url" placeholder="https://github.com/..." />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">项目说明</label>
                  <textarea v-model="editor.summary" class="form-textarea form-textarea--medium"></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">技术栈</label>
                  <input class="form-input" :value="stackText" list="projects-editor-tag-options" type="text" @input="updateStack(($event.target as HTMLInputElement).value)" />
                </div>
              </div>

              <div class="modal-split__preview">
                <div class="panel">
                  <div class="panel-header"><span class="panel-title">项目链接预览</span></div>
                  <div class="panel-body">
                    <a v-if="editor.sourceUrl" href="" class="btn btn--outline" @click.prevent="openProjectLink(editor.sourceUrl, `${editor.title || '当前项目'} 项目网址`)">打开项目网址</a>
                    <a v-if="editor.githubUrl" href="" class="btn btn--outline" @click.prevent="openProjectLink(editor.githubUrl, `${editor.title || '当前项目'} GitHub`)">打开 GitHub</a>
                    <div v-if="!editor.sourceUrl && !editor.githubUrl" class="projects-panel__preview-empty">项目网址和 GitHub 地址会显示在这里。</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn--ghost" @click="closeEditor">取消</button>
            <button class="btn btn--primary" type="submit">保存项目</button>
          </div>
        </form>
      </div>
    </div>

  </section>
</template>
