<script setup lang="ts">
import { computed } from 'vue';

/** 友链卡图标：按 id 固定取一枚，避免首字雷同、中文首字在渐变块里难看 */
const POOL = [
  '🔗',
  '🌐',
  '📎',
  '🧭',
  '✦',
  '⬡',
  '📡',
  '🗂️',
  '🎯',
  '💎',
  '🔖',
  '📌',
  '🌿',
  '⚙',
  '🧩',
  '🔭',
  '🎧',
  '📖',
  '🛰',
  '📧',
  '🔑',
  '🎨',
  '💻',
  '📊',
  '🍁',
  '🧪',
  '🎮',
  '📝',
] as const;

const props = defineProps<{
  /** 使用站点 id，保证每条友链稳定且多不重复 */
  seed: number;
}>();

const icon = computed(() => POOL[Math.abs(props.seed) % POOL.length]);
</script>

<template>
  <span class="nova-bmark-favicon" aria-hidden="true">{{ icon }}</span>
</template>
