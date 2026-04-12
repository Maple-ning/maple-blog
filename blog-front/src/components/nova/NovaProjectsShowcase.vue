<script setup lang="ts">
import { computed } from 'vue';

import NovaProjectPoolIcon from '@/components/nova/NovaProjectPoolIcon.vue';
import type { ProjectItem } from '@/services/projects';

const props = withDefaults(
  defineProps<{
    projects: ProjectItem[];
    titleTag?: 'h1' | 'h2';
  }>(),
  { titleTag: 'h1' },
);

const sortedProjects = computed(() =>
  [...props.projects].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
);

const normalizeComparableUrl = (url?: string) => {
  const value = String(url || '').trim();
  if (!value) return '';
  return value.replace(/\/+$/, '').toLowerCase();
};

/** 有有效源码链接且与体验地址不同才展示「查看源码」 */
const showSourceLink = (project: ProjectItem) => {
  const source = normalizeComparableUrl(project.sourceCodeUrl);
  if (!source) return false;
  const live = normalizeComparableUrl(project.url);
  return source !== live;
};

const showLiveLink = (project: ProjectItem) => {
  const u = String(project.url || '').trim();
  if (!u) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const showProjectFooter = (project: ProjectItem) => showSourceLink(project) || showLiveLink(project);

const isWip = (project: ProjectItem) => !showLiveLink(project);
</script>

<template>
  <div class="nova-projects-showcase">
    <div class="nova-section-header">
      <div class="nova-section-tag">PROJECTS</div>
      <component :is="titleTag" class="nova-section-title">项目</component>
      <p class="nova-section-desc">从想法到落地，实践是检验真理的唯一标准。</p>
    </div>

    <div class="nova-projects-grid">
      <article v-for="project in sortedProjects" :key="project.id" class="nova-p-card">
        <div class="nova-p-preview">
          <div class="nova-p-preview-bg" />
          <div class="nova-p-preview-lines" />
          <NovaProjectPoolIcon :seed="project.id" />
        </div>
        <div class="nova-p-body">
          <div class="nova-p-header">
            <a-tooltip :title="project.name" placement="topLeft" overlay-class-name="text-ellipsis-tooltip">
              <h2 class="nova-p-name line-clamp-2">{{ project.name }}</h2>
            </a-tooltip>
            <span
              class="nova-p-status"
              :class="isWip(project) ? 'nova-p-status--wip' : 'nova-p-status--active'"
            >
              {{ isWip(project) ? '⚙ 开发中' : '✓ 已发布' }}
            </span>
          </div>
          <a-tooltip :title="project.description" placement="topLeft" overlay-class-name="text-ellipsis-tooltip">
            <p class="nova-p-desc line-clamp-3">{{ project.description }}</p>
          </a-tooltip>
          <div class="nova-p-techs">
            <span v-for="tech in project.techStack" :key="tech" class="nova-p-tech">{{ tech }}</span>
          </div>
          <div v-if="showProjectFooter(project)" class="nova-p-footer">
            <a
              v-if="showSourceLink(project)"
              class="nova-p-link"
              :href="project.sourceCodeUrl"
              target="_blank"
              rel="noreferrer noopener"
            >
              查看源码
            </a>
            <a
              v-if="showLiveLink(project)"
              class="nova-p-link nova-p-link--primary"
              :href="project.url"
              target="_blank"
              rel="noreferrer noopener"
            >
              查看项目
            </a>
          </div>
        </div>
      </article>
    </div>

    <a-empty v-if="sortedProjects.length === 0" description="暂无内容" />
  </div>
</template>
