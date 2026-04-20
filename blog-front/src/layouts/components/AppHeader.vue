<script setup lang="ts">
import { RouterLink } from 'vue-router';

import type { NovaThemeId } from '@/composables/useNovaTheme';
import AppThemeSwitch from '@/layouts/components/AppThemeSwitch.vue';

interface NavItem {
  name?: string;
  label: string;
  href?: string;
}

interface PortalItem {
  label: string;
  href: string;
  description: string;
  target?: '_self' | '_blank';
}

defineProps<{
  navItems: NavItem[];
  portalItems?: PortalItem[];
  activeNavKeys: string[];
  mobileMenuOpen: boolean;
  novaTheme: NovaThemeId;
}>();

defineEmits<{
  toggleMobileMenu: [];
  updateMobileMenu: [open: boolean];
  toggleNovaTheme: [];
  openPortalItem: [item: PortalItem];
}>();

const isNavActive = (name: string | undefined, keys: string[]) =>
  Boolean(name) && keys.includes(String(name));
</script>

<template>
  <header
    class="nova-app-header sticky top-0 z-20 border-b border-[color:color-mix(in_srgb,var(--nova-border)_85%,transparent)] bg-[color:var(--nova-nav-bg)] backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-300 ease-in-out"
  >
    <div class="mx-auto flex h-[60px] max-w-[1200px] items-center px-4 sm:px-6">
      <div class="hidden h-full w-full items-center gap-6 lg:flex">
        <RouterLink
          :to="{ name: 'home' }"
          class="nova-logo-link group flex shrink-0 items-center gap-2.5 no-underline"
        >
          <span
            class="nova-logo-mark flex h-9 w-9 items-center justify-center rounded-[11px] text-lg leading-none transition-[transform,box-shadow] duration-300 group-hover:scale-[1.03]"
            aria-hidden="true"
          >
            🍁
          </span>
          <span class="nova-logo-text text-[17px] font-semibold tracking-tight">枫叶小站</span>
        </RouterLink>

        <div class="flex min-w-0 flex-1 justify-center px-2">
          <nav class="nova-nav-bar" aria-label="主导航">
            <template v-for="item in navItems" :key="item.name ?? item.href ?? item.label">
              <a
                v-if="item.href"
                :href="item.href"
                class="nova-nav-link"
                rel="noopener noreferrer"
              >
                {{ item.label }}
              </a>
              <RouterLink
                v-else
                :to="{ name: item.name }"
                class="nova-nav-link"
                :class="{ 'nova-nav-link--active': isNavActive(item.name, activeNavKeys) }"
                :aria-current="isNavActive(item.name, activeNavKeys) ? 'page' : undefined"
              >
                {{ item.label }}
              </RouterLink>
            </template>
          </nav>
        </div>

        <a-dropdown
          v-if="portalItems?.length"
          placement="bottomRight"
          :trigger="['click']"
          overlay-class-name="nova-portal-dropdown"
        >
          <button type="button" class="nova-ai-menu-trigger shrink-0" aria-label="打开探索入口菜单">
            <svg
              class="nova-ai-menu-trigger__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              aria-hidden="true"
            >
              <path d="M12 3.5 14.3 9l5.7 2.3-5.7 2.3L12 19.5l-2.3-5.9L4 11.3 9.7 9 12 3.5Z" />
            </svg>
            <span>探索</span>
            <svg
              class="nova-ai-menu-trigger__chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              aria-hidden="true"
            >
              <path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <template #overlay>
            <a-menu :selectable="false" class="nova-portal-menu">
              <a-menu-item v-for="item in portalItems" :key="item.href" class="nova-portal-menu__entry">
                <button
                  type="button"
                  class="nova-portal-menu__link nova-portal-menu__button"
                  @click="$emit('openPortalItem', item)"
                >
                  <span class="nova-portal-menu__copy">
                    <span class="nova-portal-menu__title">{{ item.label }}</span>
                    <span class="nova-portal-menu__desc">{{ item.description }}</span>
                  </span>
                  <svg
                    class="nova-portal-menu__arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <AppThemeSwitch
          class="nova-header-theme-switch shrink-0"
          :checked="novaTheme === 'dark'"
          @toggle="$emit('toggleNovaTheme')"
        />
      </div>

      <div class="flex h-full w-full items-center justify-between lg:hidden">
        <RouterLink
          :to="{ name: 'home' }"
          class="nova-logo-link flex min-w-0 items-center gap-2 no-underline"
        >
          <span
            class="nova-logo-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-base"
            aria-hidden="true"
          >
            🍁
          </span>
          <span class="truncate text-[15px] font-semibold tracking-tight text-[color:var(--nova-text)]">
            枫叶小站
          </span>
        </RouterLink>
        <button
          type="button"
          class="nova-header-menu-btn shrink-0"
          :aria-expanded="mobileMenuOpen"
          aria-label="切换导航菜单"
          @click="$emit('toggleMobileMenu')"
        >
          <svg
            v-if="!mobileMenuOpen"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" stroke-width="2" stroke-linecap="round" />
          </svg>
          <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </header>
  <a-drawer
    :open="mobileMenuOpen"
    placement="right"
    width="300"
    class="nova-mobile-drawer lg:!hidden"
    title="导航"
    @update:open="$emit('updateMobileMenu', $event)"
  >
    <div class="mb-6">
      <p class="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--nova-text-muted)]">
        主题
      </p>
      <AppThemeSwitch :checked="novaTheme === 'dark'" @toggle="$emit('toggleNovaTheme')" />
    </div>
    <nav class="nova-drawer-nav" aria-label="主导航">
      <template v-for="item in navItems" :key="`drawer-${item.name ?? item.href ?? item.label}`">
        <a
          v-if="item.href"
          :href="item.href"
          class="nova-drawer-link"
          rel="noopener noreferrer"
          @click="$emit('updateMobileMenu', false)"
        >
          <span>{{ item.label }}</span>
          <span class="nova-drawer-link-chevron" aria-hidden="true">›</span>
        </a>
        <RouterLink
          v-else
          :to="{ name: item.name }"
          class="nova-drawer-link"
          :class="{ 'nova-drawer-link--active': isNavActive(item.name, activeNavKeys) }"
          :aria-current="isNavActive(item.name, activeNavKeys) ? 'page' : undefined"
          @click="$emit('updateMobileMenu', false)"
        >
          <span>{{ item.label }}</span>
          <span class="nova-drawer-link-chevron" aria-hidden="true">›</span>
        </RouterLink>
      </template>
      <template v-if="portalItems?.length">
        <div class="nova-drawer-section-title">探索入口</div>
        <button
          v-for="item in portalItems"
          :key="`portal-${item.href}`"
          type="button"
          class="nova-drawer-link nova-drawer-link--portal"
          @click="$emit('openPortalItem', item); $emit('updateMobileMenu', false)"
        >
          <span class="nova-drawer-link-copy">
            <span>{{ item.label }}</span>
            <small>{{ item.description }}</small>
          </span>
          <span class="nova-drawer-link-chevron" aria-hidden="true">›</span>
        </button>
      </template>
    </nav>
  </a-drawer>
</template>

<style scoped>
.nova-logo-mark {
  background: color-mix(in srgb, var(--nova-accent) 16%, var(--nova-surface));
  border: 1px solid color-mix(in srgb, var(--nova-accent) 35%, var(--nova-border));
  box-shadow: 0 1px 0 color-mix(in srgb, var(--nova-text) 6%, transparent);
}

.nova-logo-text {
  background: linear-gradient(135deg, var(--nova-text) 0%, var(--nova-text) 55%, var(--nova-accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

:global(html.dark) .nova-logo-text {
  filter: brightness(1.05);
}

.nova-nav-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 2px;
  max-width: min(100%, 640px);
}

.nova-nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--nova-text-muted);
  text-decoration: none;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.nova-nav-link:hover {
  color: var(--nova-text);
  background: color-mix(in srgb, var(--nova-text) 6%, transparent);
}

.nova-nav-link:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-nav-link--active {
  color: var(--nova-text);
  background: color-mix(in srgb, var(--nova-accent) 14%, transparent);
}

.nova-nav-link--active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: 18px;
  height: 2px;
  margin-left: -9px;
  border-radius: 2px;
  background: var(--nova-accent);
  opacity: 0.9;
}

.nova-ai-menu-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  gap: 8px;
  padding: 0 14px;
  margin-left: auto;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--nova-accent) 26%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 9%, var(--nova-surface));
  color: var(--nova-text);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.nova-ai-menu-trigger:hover {
  border-color: color-mix(in srgb, var(--nova-accent) 44%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 14%, var(--nova-surface));
  color: var(--nova-accent);
}

.nova-ai-menu-trigger:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-ai-menu-trigger__icon {
  width: 16px;
  height: 16px;
}

.nova-ai-menu-trigger__chevron {
  width: 14px;
  height: 14px;
  opacity: 0.75;
}

.nova-header-theme-switch {
  margin-left: 12px;
}

.nova-header-menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--nova-border);
  background: color-mix(in srgb, var(--nova-surface) 88%, transparent);
  color: var(--nova-text);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.nova-header-menu-btn:hover {
  border-color: color-mix(in srgb, var(--nova-accent) 28%, var(--nova-border));
  color: var(--nova-accent);
}

.nova-header-menu-btn:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nova-drawer-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 15px;
  font-weight: 500;
  color: var(--nova-text);
  text-decoration: none;
  background: color-mix(in srgb, var(--nova-surface) 55%, transparent);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
  cursor: pointer;
}

.nova-drawer-link:hover {
  border-color: color-mix(in srgb, var(--nova-accent) 22%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 8%, var(--nova-surface));
}

.nova-drawer-link:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-drawer-link--active {
  border-color: color-mix(in srgb, var(--nova-accent) 35%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 12%, var(--nova-surface));
  color: var(--nova-accent);
}

.nova-drawer-link--button {
  width: 100%;
  cursor: pointer;
  text-align: left;
}

.nova-drawer-link--portal {
  align-items: flex-start;
}

.nova-drawer-link-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.nova-drawer-link-copy small {
  font-size: 12px;
  line-height: 1.45;
  color: var(--nova-text-muted);
}

.nova-drawer-link-chevron {
  font-size: 18px;
  font-weight: 300;
  color: var(--nova-text-muted);
  line-height: 1;
}

.nova-drawer-link--active .nova-drawer-link-chevron {
  color: var(--nova-accent);
}

.nova-drawer-section-title {
  margin: 14px 0 8px;
  padding: 0 2px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--nova-text-muted);
}

:global(.nova-portal-dropdown .ant-dropdown-menu) {
  min-width: 260px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid var(--nova-border);
  background: color-mix(in srgb, var(--nova-surface) 96%, transparent);
  box-shadow:
    0 16px 40px -24px color-mix(in srgb, var(--nova-text) 24%, transparent),
    0 6px 18px -12px color-mix(in srgb, var(--nova-text) 18%, transparent);
  backdrop-filter: blur(18px);
}

:global(.nova-portal-dropdown .ant-dropdown-menu-item) {
  padding: 0;
  border-radius: 12px;
}

:global(.nova-portal-dropdown .ant-dropdown-menu-title-content) {
  display: block;
}

:global(.nova-portal-dropdown .ant-dropdown-menu-item:hover) {
  background: transparent;
}

:global(.nova-portal-dropdown .ant-dropdown-menu-item:not(:last-child)) {
  margin-bottom: 6px;
}

:global(.nova-portal-menu__link) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--nova-text);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

:global(.nova-portal-menu__button) {
  width: 100%;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

:global(.nova-portal-menu__link:hover) {
  border-color: color-mix(in srgb, var(--nova-accent) 24%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 8%, var(--nova-surface));
  color: var(--nova-accent);
}

:global(.nova-portal-menu__copy) {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

:global(.nova-portal-menu__title) {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}

:global(.nova-portal-menu__desc) {
  font-size: 12px;
  line-height: 1.45;
  color: var(--nova-text-muted);
}

:global(.nova-portal-menu__arrow) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.72;
}

@media (prefers-reduced-motion: reduce) {
  .nova-nav-link,
  .nova-drawer-link,
  .nova-header-menu-btn,
  .nova-ai-menu-trigger,
  .nova-logo-mark {
    transition: none;
  }

  .nova-logo-link.group:hover .nova-logo-mark {
    transform: none;
  }
}
</style>
