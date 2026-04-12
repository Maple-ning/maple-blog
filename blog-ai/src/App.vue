<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { Component } from 'vue';
import { useHashRoute } from './composables/useHashRoute';
import { usePublicContent } from './composables/usePublicContent';
import { openExternalLink } from './utils/externalLink';
import HomePage from './pages/HomePage.vue';
import InsightsPage from './pages/InsightsPage.vue';
import JourneyPage from './pages/JourneyPage.vue';
import ProjectsPage from './pages/ProjectsPage.vue';
import ContentDetailPage from './pages/ContentDetailPage.vue';
import type { RouteKey } from './site';
import { siteIdentity } from './site';

const { routes, currentItemId, currentPath, currentRoute, routeHref } = useHashRoute();
const { loadContent } = usePublicContent();

const viewMap: Record<RouteKey, Component> = {
  home: HomePage,
  journey: JourneyPage,
  insights: InsightsPage,
  projects: ProjectsPage,
};

const activeView = computed(() => {
  if (currentItemId.value) {
    return ContentDetailPage;
  }

  return viewMap[currentRoute.value.key];
});

const theme = ref<'light' | 'dark'>('light');
const navOpen = ref(false);
const appScroll = ref<HTMLElement | null>(null);

function applyTheme(nextTheme: 'light' | 'dark') {
  theme.value = nextTheme;
  document.documentElement.setAttribute('data-theme', nextTheme);
  window.localStorage.setItem('ai-explore-theme', nextTheme);
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

function toggleMenu() {
  navOpen.value = !navOpen.value;
}

function openBlogHome() {
  openExternalLink(siteIdentity.blogHomeUrl, '博客首页');
}

watch(
  currentRoute,
  (route, previousRoute) => {
    document.title = route.title;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    descriptionMeta?.setAttribute('content', route.description);

    navOpen.value = false;

    if (previousRoute && previousRoute.path !== route.path) {
      appScroll.value?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  },
  { immediate: true },
);

onMounted(() => {
  const savedTheme =
    window.localStorage.getItem('ai-explore-theme') as 'light' | 'dark' | null;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ?? (systemDark ? 'dark' : 'light'));
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
          <a
            href=""
            class="back-home-btn hide-mobile"
            title="返回博客首页"
            aria-label="返回博客首页"
            @click.prevent="openBlogHome"
          >
            <span class="back-home-btn__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 5L5 12l7 7" />
              </svg>
            </span>
            <span class="back-home-btn__label">博客</span>
          </a>
          <button
            id="themeToggle"
            class="btn-icon"
            type="button"
            title="切换主题"
            aria-label="切换主题"
            @click="toggleTheme"
          >
            <span class="btn-icon__glyph">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
          </button>
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
            <a v-for="route in routes" :key="route.key" :href="routeHref(route.path)">{{ route.label }}</a>
          </div>
          <div class="footer-copy">© 2026 AI探索站 · 用热爱驱动探索</div>
        </div>
      </footer>
    </div>
  </div>
</template>
