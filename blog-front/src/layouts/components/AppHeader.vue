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

const props = defineProps<{
  navItems: NavItem[];
  portalItems?: PortalItem[];
  activeNavKeys: string[];
  mobileMenuOpen: boolean;
  novaTheme: NovaThemeId;
  overlayMode: boolean;
}>();

defineEmits<{
  toggleMobileMenu: [];
  updateMobileMenu: [open: boolean];
  toggleNovaTheme: [];
  openPortalItem: [item: PortalItem];
}>();

const isNavActive = (name: string | undefined, keys: string[]): boolean =>
  Boolean(name) && keys.includes(String(name));
</script>

<template>
  <header
    class="nova-app-header z-20"
    :class="props.overlayMode ? 'nova-app-header--overlay' : 'nova-app-header--inline'"
  >
    <div class="nova-app-header__inner mx-auto flex h-[74px] w-full max-w-[1380px] items-center px-7 sm:px-9 lg:px-12">
      <div class="hidden h-full w-full lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
        <RouterLink
          :to="{ name: 'home' }"
          class="nova-logo-link flex min-w-0 items-center justify-self-start gap-2.5 no-underline"
        >
          <span
            class="nova-logo-mark flex h-8 w-8 items-center justify-center rounded-[10px] text-[17px] leading-none"
            aria-hidden="true"
          >
            🍁
          </span>
          <span class="nova-logo-text text-[18px] font-medium tracking-[-0.03em]">枫叶小站</span>
        </RouterLink>

        <div class="flex min-w-0 items-center justify-center">
          <nav class="nova-nav-bar" aria-label="主导航">
            <template v-for="item in navItems" :key="item.name ?? item.href ?? item.label">
              <a v-if="item.href" :href="item.href" class="nova-nav-link" rel="noopener noreferrer">
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

        <div class="flex min-w-0 items-center justify-self-end gap-3">
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
                <a-menu-item
                  v-for="item in portalItems"
                  :key="item.href"
                  class="nova-portal-menu__entry"
                >
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
          <span
            class="truncate text-[15px] font-semibold tracking-tight text-[color:var(--nova-text)]"
          >
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
          <svg
            v-else
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
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
      <p
        class="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--nova-text-muted)]"
      >
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
          @click="
            $emit('openPortalItem', item);
            $emit('updateMobileMenu', false);
          "
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
.nova-app-header {
  --nova-header-height: 74px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  border-bottom: none;
  background: color-mix(in srgb, var(--nova-page-bg) 90%, transparent);
  backdrop-filter: blur(18px);
}

.nova-app-header--overlay {
  position: fixed;
}

.nova-app-header--inline {
  position: fixed;
}

.nova-app-header__inner {
  transition: none;
}

.nova-app-header > div {
  background: transparent;
}

.nova-logo-mark {
  background: transparent;
  border: none;
  box-shadow: none;
}

.nova-logo-text {
  color: var(--nova-text);
  background: none;
  -webkit-background-clip: initial;
  background-clip: initial;
}

.nova-nav-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 34px;
  min-height: 74px;
}

.nova-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 74px;
  padding: 0;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: color-mix(in srgb, var(--nova-text) 54%, transparent);
  text-decoration: none;
  transition:
    color 0.18s ease,
    opacity 0.18s ease;
}

.nova-nav-link:hover {
  color: color-mix(in srgb, var(--nova-text) 78%, transparent);
}

.nova-nav-link:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-nav-link--active {
  color: var(--nova-text);
  font-weight: 500;
}

.nova-ai-menu-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  gap: 6px;
  padding: 0 10px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: color-mix(in srgb, var(--nova-text) 58%, transparent);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.nova-ai-menu-trigger:hover {
  color: var(--nova-text);
}

.nova-ai-menu-trigger:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-ai-menu-trigger__icon {
  width: 14px;
  height: 14px;
}

.nova-ai-menu-trigger__chevron {
  width: 12px;
  height: 12px;
  opacity: 0.55;
}

.nova-header-theme-switch {
  margin-left: 0;
}

.nova-header-menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
  background: color-mix(in srgb, #ffffff 5%, transparent);
  color: var(--nova-text);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.nova-header-menu-btn:hover {
  border-color: color-mix(in srgb, #ffffff 24%, transparent);
  background: color-mix(in srgb, #ffffff 10%, transparent);
  color: color-mix(in srgb, var(--nova-text) 94%, #ffffff);
  filter: brightness(1.08);
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
  background: color-mix(in srgb, #ffffff 7%, var(--nova-surface));
  filter: brightness(1.08);
}

.nova-drawer-link:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-drawer-link--active {
  border-color: color-mix(in srgb, var(--nova-accent) 35%, var(--nova-border));
  background: color-mix(in srgb, #ffffff 8%, var(--nova-surface));
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
  filter: brightness(1.08);
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
}
</style>
