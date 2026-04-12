<script setup lang="ts">
import { onMounted, ref } from 'vue';

import NovaProjectsShowcase from '@/components/nova/NovaProjectsShowcase.vue';
import { getProjects, type ProjectItem } from '@/services/projects';

const projects = ref<ProjectItem[]>([]);

onMounted(async () => {
  projects.value = await getProjects();
});
</script>

<template>
  <section class="nova-projects-page">
    <NovaProjectsShowcase :projects="projects" title-tag="h1" />
  </section>
</template>
