<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import AppThemeSwitch from "@/components/shared/AppThemeSwitch/index.vue";
import { siteIdentity } from "@/config/site";
import { usePublicContent } from "@/hooks/usePublicContent";
import ContentDetailPage from "@/pages/content-detail/index.vue";
import { useHashRoute } from "@/router";

const { routes, currentItemId, currentPath, currentRoute, routeHref } =
  useHashRoute();
const { loadContent } = usePublicContent();

const activeView = computed(() =>
  currentItemId.value ? ContentDetailPage : currentRoute.value.component,
);

const theme = ref<"light" | "dark">("light");
const navOpen = ref(false);
const appScroll = ref<HTMLElement | null>(null);

function applyTheme(nextTheme: "light" | "dark") {
  theme.value = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);
  window.localStorage.setItem("ai-explore-theme", nextTheme);
}

function toggleTheme() {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

function toggleMenu() {
  navOpen.value = !navOpen.value;
}

watch(
  currentRoute,
  (route, previousRoute) => {
    document.title = route.title;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    descriptionMeta?.setAttribute("content", route.description);

    navOpen.value = false;

    if (previousRoute && previousRoute.path !== route.path) {
      appScroll.value?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  },
  { immediate: true },
);

onMounted(() => {
  const savedTheme = window.localStorage.getItem("ai-explore-theme") as
    | "light"
    | "dark"
    | null;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme ?? (systemDark ? "dark" : "light"));
  loadContent();
});
</script>

<template>
  <div class="app-shell">
    <header class="navbar">
      <div class="container nav-inner">
        <a :href="routeHref('/')" class="logo">
          <span class="logo-icon">🤖</span>
          <span class="logo-text">{{ siteIdentity.name }}</span>
        </a>

        <nav id="navLinks" class="nav-links" :class="{ open: navOpen }">
          <a
            v-for="route in routes"
            :key="route.key"
            :href="routeHref(route.path)"
            class="nav-link"
            :class="{ active: currentPath === route.path }"
          >
            {{ route.label }}
          </a>
        </nav>

        <div class="nav-actions">
          <AppThemeSwitch :checked="theme === 'dark'" @toggle="toggleTheme" />
          <button
            id="menuToggle"
            class="btn-icon menu-toggle"
            type="button"
            aria-label="菜单"
            @click="toggleMenu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>

    <div ref="appScroll" class="app-scroll">
      <main class="page-shell">
        <component :is="activeView" />
      </main>

      <footer class="footer">
        <div class="container footer-inner">
          <div class="footer-brand">
            <span class="logo-icon">🤖</span>
            <span class="logo-text">{{ siteIdentity.name }}</span>
            <p class="footer-slogan">{{ siteIdentity.slogan }}</p>
          </div>
          <div class="footer-links">
            <a
              v-for="route in routes"
              :key="route.key"
              :href="routeHref(route.path)"
            >
              {{ route.label }}
            </a>
          </div>
          <div class="footer-copy">© 2026 AI探索站 · 用热爱驱动探索</div>
        </div>
      </footer>
    </div>
  </div>
</template>
