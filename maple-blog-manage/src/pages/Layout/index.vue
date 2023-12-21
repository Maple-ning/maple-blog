<template>
  <layout-header />
  <main>
    <layout-sidebar />
    <div class="content-box" :class="{ 'content-collapse': sidebar.collapse }">
      <layoutTags />
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <keep-alive :include="tags.nameList">
              <component :is="Component"></component>
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSidebarStore } from '@/store/sidebar.ts';
import { useTagsStore } from '@/store/tags.ts';
import layoutHeader from "@/components/Layout/header.vue";
import layoutSidebar from "@/components/Layout/sidebar.vue";
import layoutTags from "@/components/Tags/index.vue";

const sidebar = useSidebarStore();
const tags = useTagsStore();
</script>

<style scoped>
@import "@/assets/styles/layout.scss";
</style>
