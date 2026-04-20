<script setup lang="ts">
import { siteIdentity } from "@/config/site";
import type { AppRouteMeta } from "@/types/router";

defineProps<{
  routes: readonly AppRouteMeta[];
  activePath: string;
  routeHref: (path: string) => string;
}>();
</script>

<template>
  <header class="topbar">
    <a class="brand" :href="routeHref('/')">
      <span class="brand-mark">ML</span>
      <div class="brand-copy">
        <p>{{ siteIdentity.subtitle }}</p>
        <strong>{{ siteIdentity.name }}</strong>
      </div>
    </a>

    <nav class="nav" aria-label="主导航">
      <a
        v-for="route in routes"
        :key="route.key"
        :href="routeHref(route.path)"
        :class="{ active: activePath === route.path }"
      >
        {{ route.label }}
      </a>
      <a href="/blog/">返回博客首页</a>
    </nav>
  </header>
</template>
