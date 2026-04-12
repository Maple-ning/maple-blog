<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { ConfigProvider, Modal, theme as antdTheme } from 'ant-design-vue';
import { RouterView, useRoute } from 'vue-router';

import { appConfig } from '@/config';
import { routes } from '@/config/routes';
import {
  applyNovaThemeToDocument,
  isNovaLightTheme,
  isNovaThemeId,
  type NovaThemeId,
  NOVA_THEME_STORAGE_KEY,
  resolveInitialNovaTheme,
} from '@/composables/useNovaTheme';

function readThemeFromDom(): NovaThemeId | null {
  if (typeof document === 'undefined') return null;
  const raw = document.documentElement.dataset.novaTheme;
  return isNovaThemeId(raw) ? raw : null;
}
import AppHeader from '@/layouts/components/AppHeader.vue';

type NavItem = { name?: string; label: string; href?: string };

const route = useRoute();
const novaTheme = ref<NovaThemeId>(readThemeFromDom() ?? resolveInitialNovaTheme());
const mobileMenuOpen = ref(false);
const contentScrollRef = ref<HTMLElement | null>(null);
const particlesRef = ref<HTMLElement | null>(null);

const isDark = computed(() => !isNovaLightTheme(novaTheme.value));

const antTheme = computed(() => ({
  algorithm: isDark.value ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
}));

const navItems = computed<NavItem[]>(() => {
  const internalItems = routes
    .filter((item) => item.path === '/')
    .flatMap((item) => item.children ?? [])
    .filter((item) => typeof item.path === 'string' && !item.path.includes(':') && item.name)
    .filter((item) => String(item.name) !== 'ai-note')
    .map(
      (item): NavItem => ({
        name: String(item.name),
        label: (item.meta?.title as string) || String(item.name),
      }),
    );

  return internalItems;
});

const aiPortalItem = computed<NavItem>(() => ({ label: 'AI门户', href: appConfig.aiPortalUrl }));

const activeNavKeys = computed((): string[] => {
  const path = route.path;
  if (path.startsWith('/post/')) {
    return [];
  }

  const current = route.name as string | undefined;
  const found = navItems.value.find((item) => item.name === current);
  if (found?.name) {
    return [found.name];
  }

  if (path === '/' || path === '') {
    return ['home'];
  }
  if (path === '/posts' || path.startsWith('/posts/')) {
    if (!path.startsWith('/post/')) {
      return ['posts'];
    }
  }
  if (path.startsWith('/projects')) {
    return ['projects'];
  }
  if (path.startsWith('/good-sites')) {
    return ['good-sites'];
  }
  if (path.startsWith('/about')) {
    return ['about'];
  }

  return [];
});

const currentPageTitle = computed(() => {
  const metaTitle = route.meta?.title;
  if (typeof metaTitle === 'string' && metaTitle) return metaTitle;
  const current = route.name as string | undefined;
  const matched = navItems.value.find((item) => item.name === current);
  return matched?.label || '页面';
});

const setNovaTheme = (id: NovaThemeId) => {
  novaTheme.value = id;
};

const rebuildParticles = () => {
  const el = particlesRef.value;
  if (!el) return;
  el.innerHTML = '';
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = reduced ? 0 : 20;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'nova-particle';
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDuration = `${8 + Math.random() * 12}s`;
    p.style.animationDelay = `${Math.random() * 12}s`;
    p.style.setProperty('--tx', `${Math.random() * 100 - 50}px`);
    const s = 1 + Math.random() * 2;
    p.style.width = `${s}px`;
    p.style.height = `${s}px`;
    el.appendChild(p);
  }
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const isExternalHttpUrl = (href: string) => {
  try {
    const url = new URL(href, window.location.origin);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== window.location.origin;
  } catch {
    return false;
  }
};

const onRootClickCapture = (event: MouseEvent) => {
  if (event.defaultPrevented) return;
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || !isExternalHttpUrl(href)) return;

  event.preventDefault();
  event.stopPropagation();

  const resolved = new URL(href, window.location.origin).toString();
  const nextTarget = anchor.target || '_self';
  Modal.confirm({
    title: '即将跳转外部网站',
    content: resolved,
    okText: '继续访问',
    cancelText: '取消',
    onOk: () => {
      if (nextTarget === '_blank') {
        const opened = window.open(resolved, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
        return;
      }
      window.location.assign(resolved);
    },
  });
};

const openAiPortal = () => {
  Modal.confirm({
    title: '是否前往AI门户？',
    content: appConfig.aiPortalUrl,
    okText: '前往',
    cancelText: '取消',
    onOk: () => {
      window.location.assign(appConfig.aiPortalUrl);
    },
  });
};

onMounted(() => {
  applyNovaThemeToDocument(novaTheme.value);
  localStorage.setItem(NOVA_THEME_STORAGE_KEY, novaTheme.value);
  void nextTick(() => rebuildParticles());
});

watch(novaTheme, (id) => {
  localStorage.setItem(NOVA_THEME_STORAGE_KEY, id);
  applyNovaThemeToDocument(id);
  void nextTick(() => rebuildParticles());
});

watch(
  () => route.fullPath,
  async () => {
    mobileMenuOpen.value = false;
    document.title = `${currentPageTitle.value} - ${appConfig.appTitle}`;
    await nextTick();
    contentScrollRef.value?.scrollTo({ top: 0, behavior: 'auto' });
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="nova-app-root relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[color:var(--nova-page-bg)] transition-[background-color] duration-300 ease-in-out"
    @click.capture="onRootClickCapture"
  >
    <div ref="particlesRef" class="nova-particles" aria-hidden="true" />
    <div class="nova-bg-canvas" aria-hidden="true">
      <div class="nova-bg-grid" />
      <div class="nova-bg-orb nova-bg-orb-1" />
      <div class="nova-bg-orb nova-bg-orb-2" />
      <div class="nova-bg-orb nova-bg-orb-3" />
    </div>
    <ConfigProvider :theme="antTheme">
      <AppHeader
        :nav-items="navItems"
        :ai-portal-item="aiPortalItem"
        :active-nav-keys="activeNavKeys"
        :mobile-menu-open="mobileMenuOpen"
        :nova-theme="novaTheme"
        @toggle-mobile-menu="toggleMobileMenu"
        @update-mobile-menu="mobileMenuOpen = $event"
        @set-nova-theme="setNovaTheme"
        @open-ai-portal="openAiPortal"
      />
      <main
        ref="contentScrollRef"
        data-app-scroll-container="true"
        class="relative z-[1] min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div class="blog-shell mx-auto w-full max-w-[1200px] px-6 py-10 md:px-6 md:py-12">
          <RouterView v-slot="{ Component, route: currentRoute }">
            <Transition name="page-switch" mode="out-in">
              <component :is="Component" :key="currentRoute.fullPath" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </ConfigProvider>
  </div>
</template>

<style scoped>
.page-switch-enter-active,
.page-switch-leave-active {
  transition: opacity 0.26s ease;
}

.page-switch-enter-from,
.page-switch-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-switch-enter-active,
  .page-switch-leave-active {
    transition: opacity 0.01s linear;
  }
}
</style>
