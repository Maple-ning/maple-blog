<script setup lang="ts">
import { computed } from 'vue';

/** 与根目录原型 `index.html` 中 projects 的 icon 集合一致，并略作扩充 */
const POOL = ['🤖', '⚡', '🎨', '🔐', '📊', '🌐', '🚀', '💡', '🛠', '📦', '✨', '🔮', '🎯', '🧠', '🍁'] as const;

const props = defineProps<{
  /** 用项目 id 在池内固定取一枚 */
  seed: number;
}>();

const icon = computed(() => POOL[Math.abs(props.seed) % POOL.length]);
</script>

<template>
  <span class="nova-p-icon" aria-hidden="true">{{ icon }}</span>
</template>
