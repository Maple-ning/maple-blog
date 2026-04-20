<script setup lang="ts">
import ProjectsPanel from "@/components/business/ProjectsPanel/index.vue";
import type { ProjectItem } from "@/types/content";

defineProps<{
  projects: ProjectItem[];
  statusBadge: (status: string) => { label: string; cls: string };
}>();

defineEmits<{
  save: [item: ProjectItem];
  remove: [id: string];
  "open-project-modal": [];
}>();
</script>

<template>
  <ProjectsPanel
    :projects="projects"
    :status-badge="statusBadge"
    @save="$emit('save', $event)"
    @remove="$emit('remove', $event)"
    @open-project-modal="$emit('open-project-modal')"
  />
</template>
