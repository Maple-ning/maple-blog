<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { AdminRouteMeta, AdminRoutePath } from "@/types/router";

const props = defineProps<{
  routes: readonly AdminRouteMeta[];
  currentPath: AdminRoutePath;
  currentLabel: string;
  routeHref: (path: string) => string;
}>();

const theme = ref<"light" | "dark">("light");
const sidebarOpen = ref(false);

function applyTheme(nextTheme: "light" | "dark") {
  theme.value = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);
  window.localStorage.setItem("ai-admin-theme", nextTheme);
}

function toggleTheme() {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

onMounted(() => {
  const savedTheme = window.localStorage.getItem("ai-admin-theme") as
    | "light"
    | "dark"
    | null;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme ?? (systemDark ? "dark" : "light"));
});
</script>

<template>
  <div class="admin-body">
    <aside id="sidebar" class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <a href="/ai/" class="logo">
          <span class="logo-icon">🤖</span>
          <span class="logo-text">AI探索站</span>
        </a>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <a
            v-for="route in props.routes.filter((item) => item.path !== '/site')"
            :key="route.path"
            :href="routeHref(route.path)"
            class="sidebar-link"
            :class="{ active: currentPath === route.path }"
          >
            <span class="link-icon">
              {{
                route.path === "/"
                  ? "🏠"
                  : route.path === "/journey"
                    ? "📚"
                    : route.path === "/insights"
                      ? "📰"
                      : route.path === "/projects"
                        ? "🚀"
                        : "🕸️"
              }}
            </span>
            {{ route.label }}
          </a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-title">全站</div>
          <a
            :href="routeHref('/site')"
            class="sidebar-link"
            :class="{ active: currentPath === '/site' }"
          >
            <span class="link-icon">⚙️</span>
            站点设置
          </a>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info-mini">
          <div class="avatar">A</div>
          <div>
            <div class="user-name">Admin</div>
            <div class="user-role">站点管理员</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-topbar">
        <div class="admin-topbar__title-group">
          <button
            class="btn-icon"
            id="sidebarToggle"
            type="button"
            @click="toggleSidebar"
          >
            ☰
          </button>
          <h1 class="topbar-title">{{ currentLabel }}</h1>
        </div>
        <div class="topbar-actions">
          <button
            class="btn-icon"
            id="themeToggle"
            type="button"
            @click="toggleTheme"
          >
            {{ theme === "dark" ? "☀️" : "🌙" }}
          </button>
          <a href="/ai/" class="btn btn--outline btn--sm">查看 AI探索站</a>
        </div>
      </div>

      <div class="admin-content">
        <slot />
      </div>
    </main>

    <slot name="after-shell" />
  </div>
</template>
