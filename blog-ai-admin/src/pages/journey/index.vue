<script setup lang="ts">
import PostsPanel from "@/components/business/PostsPanel/index.vue";
import type { AdminPostEntry, JourneyStage } from "@/types/content";

defineProps<{
  posts: AdminPostEntry[];
  journeyStages: JourneyStage[];
  statusBadge: (status: string) => { label: string; cls: string };
}>();

defineEmits<{
  publish: [id: string];
  save: [payload: unknown];
  create: [payload: unknown];
  remove: [id: string];
  "save-stages": [stages: JourneyStage[]];
}>();
</script>

<template>
  <PostsPanel
    list-kind="journey"
    :posts="posts"
    :journey-stages="journeyStages"
    :status-badge="statusBadge"
    @publish="$emit('publish', $event)"
    @create="$emit('create', $event)"
    @save="$emit('save', $event)"
    @remove="$emit('remove', $event)"
    @save-stages="$emit('save-stages', $event)"
  />
</template>
