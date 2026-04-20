<script setup lang="ts">
import DashboardPanel from "@/components/business/DashboardPanel/index.vue";
import type { AdminPostEntry } from "@/types/content";

defineProps<{
  stats: Array<{
    icon: string;
    value: string | number;
    label: string;
    color: string;
    bg: string;
    trend: string;
    trendClass: string;
  }>;
  contentDistribution: Array<{
    label: string;
    count: number;
    width: string;
    color: string;
  }>;
  recentEntries: AdminPostEntry[];
  routeHref: (path: string) => string;
}>();

defineEmits<{
  editEntry: [entry: AdminPostEntry];
}>();
</script>

<template>
  <DashboardPanel
    :stats="stats"
    :content-distribution="contentDistribution"
    :recent-entries="recentEntries"
    :route-href="routeHref"
    @edit-entry="$emit('editEntry', $event)"
  />
</template>
