<template>
  <layout-header />
  <main>
    <layout-sidebar />
    <div class="content-box">
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <keep-alive>
              <component :is="Component"></component>
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import layoutHeader from "@/components/Layout/header.vue";
import layoutSidebar from "@/components/Layout/sidebar.vue";
</script>

<style scoped>
@import "@/assets/styles/layout.scss";
</style>
