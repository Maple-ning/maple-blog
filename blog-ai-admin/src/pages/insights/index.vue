<script setup lang="ts">
import PostsPanel from "@/components/business/PostsPanel/index.vue";
import type { AdminPostEntry } from "@/types/content";

defineProps<{
  posts: AdminPostEntry[];
  statusBadge: (status: string) => { label: string; cls: string };
}>();

defineEmits<{
  publish: [id: string];
  save: [payload: unknown];
  create: [payload: unknown];
  remove: [id: string];
}>();
</script>

<template>
  <PostsPanel
    list-kind="insight"
    :posts="posts"
    :status-badge="statusBadge"
    @publish="$emit('publish', $event)"
    @create="$emit('create', $event)"
    @save="$emit('save', $event)"
    @remove="$emit('remove', $event)"
  />
</template>
