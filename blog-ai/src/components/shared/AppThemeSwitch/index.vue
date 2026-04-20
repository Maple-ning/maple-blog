<script setup lang="ts">
import { defineAsyncComponent, defineComponent, h } from "vue";

const props = defineProps<{
  checked: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const MapleSwitchFallback = defineComponent({
  name: "MapleSwitchFallback",
  props: {
    checked: {
      type: Boolean,
      required: true,
    },
  },
  setup(localProps) {
    return () =>
      h(
        "button",
        {
          type: "button",
          class: ["ai-theme-switch-fallback", { "is-checked": localProps.checked }],
          role: "switch",
          "aria-checked": String(localProps.checked),
        },
        [h("span", { class: "ai-theme-switch-fallback__thumb" })],
      );
  },
});

const MapleRemoteSwitch = defineAsyncComponent({
  loader: () => import("mapleShares/Switch"),
  delay: 120,
  timeout: 8000,
  loadingComponent: defineComponent({
    name: "MapleSwitchLoading",
    props: {
      checked: {
        type: Boolean,
        required: true,
      },
    },
    setup(localProps) {
      return () => h(MapleSwitchFallback, { checked: localProps.checked });
    },
  }),
  errorComponent: defineComponent({
    name: "MapleSwitchError",
    props: {
      checked: {
        type: Boolean,
        required: true,
      },
    },
    setup(localProps) {
      return () => h(MapleSwitchFallback, { checked: localProps.checked });
    },
  }),
});

function onToggle() {
  emit("toggle");
}
</script>

<template>
  <MapleRemoteSwitch
    :checked="checked"
    size="md"
    :title="checked ? '切换为浅色主题' : '切换为深色主题'"
    @click="onToggle"
  >
    <svg
      class="maple-switch__sun"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3" />
    </svg>
    <svg class="maple-switch__moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.7 3.2a8.8 8.8 0 1 0 6.1 15.7A9.7 9.7 0 0 1 14.7 3.2Z" />
    </svg>
  </MapleRemoteSwitch>
</template>

<style scoped>
:deep(.ai-theme-switch-fallback) {
  position: relative;
  display: block;
  width: 40px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg-gray);
  color: var(--color-text);
  cursor: pointer;
}

:deep(.ai-theme-switch-fallback:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

:deep(.ai-theme-switch-fallback__thumb) {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-text);
  transition: transform 0.25s ease;
}

:deep(.ai-theme-switch-fallback.is-checked .ai-theme-switch-fallback__thumb) {
  transform: translateX(18px);
}
</style>
