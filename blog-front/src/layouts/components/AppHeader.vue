<script setup lang="ts">
import { BgColorsOutlined } from '@ant-design/icons-vue';
import { RouterLink } from 'vue-router';

import { isNovaThemeId, NOVA_THEMES, type NovaThemeId } from '@/composables/useNovaTheme';

interface NavItem {
  name?: string;
  label: string;
  href?: string;
}

defineProps<{
  navItems: NavItem[];
  aiPortalItem?: NavItem | null;
  activeNavKeys: string[];
  mobileMenuOpen: boolean;
  novaTheme: NovaThemeId;
}>();

const emit = defineEmits<{
  toggleMobileMenu: [];
  updateMobileMenu: [open: boolean];
  setNovaTheme: [id: NovaThemeId];
  openAiPortal: [];
}>();

const themeLabel: Record<NovaThemeId, string> = {
  cyber: '赛博蓝',
  aurora: '极光绿',
  solar: '太阳橙',
  void: '夜幕紫',
  ember: '余烬红',
  moss: '苔原绿',
  ink: '深灰',
  sakura: '樱花粉',
  frost: '霜青',
  mono: '黑白',
};

const themeDotClass = (id: NovaThemeId) => {
  const map: Record<NovaThemeId, string> = {
    cyber: 'nova-theme-dot--cyber',
    aurora: 'nova-theme-dot--aurora',
    solar: 'nova-theme-dot--solar',
    void: 'nova-theme-dot--void',
    ember: 'nova-theme-dot--ember',
    moss: 'nova-theme-dot--moss',
    ink: 'nova-theme-dot--ink',
    sakura: 'nova-theme-dot--sakura',
    frost: 'nova-theme-dot--frost',
    mono: 'nova-theme-dot--mono',
  };
  return map[id];
};

const isNavActive = (name: string | undefined, keys: string[]) =>
  Boolean(name) && keys.includes(String(name));

const onThemeMenuClick = (info: { key: string | number }) => {
  const key = String(info.key);
  if (isNovaThemeId(key)) emit('setNovaTheme', key);
};
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

        <button
          v-if="aiPortalItem?.href"
          type="button"
          class="nova-ai-portal-link shrink-0"
          @click="$emit('openAiPortal')"
        >
          {{ aiPortalItem.label }}
        </button>

        <a-dropdown
          :trigger="['hover', 'click']"
          placement="bottomRight"
          :mouse-enter-delay="0.08"
          :mouse-leave-delay="0.32"
          overlay-class-name="nova-theme-dropdown-shell"
        >
          <button
            type="button"
            class="nova-theme-trigger shrink-0"
            title="配色主题"
            aria-label="打开配色主题菜单"
            aria-haspopup="menu"
          >
            <BgColorsOutlined class="nova-theme-trigger-icon" />
            <span class="nova-theme-trigger-swatch" :class="themeDotClass(novaTheme)" aria-hidden="true" />
          </button>
          <template #overlay>
            <a-menu
              class="nova-theme-dropdown-menu"
              :selected-keys="[novaTheme]"
              @click="onThemeMenuClick"
            >
              <a-menu-item v-for="id in NOVA_THEMES" :key="id" class="nova-theme-menu-item">
                <div class="nova-theme-option">
                  <span
                    class="nova-theme-dot nova-theme-dot--menu"
                    :class="[themeDotClass(id), { 'nova-theme-dot--active': novaTheme === id }]"
                    aria-hidden="true"
                  />
                  <span class="nova-theme-option-title">{{ themeLabel[id] }}</span>
                </div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <div class="flex h-full w-full items-center justify-between lg:hidden">
        <RouterLink
          :to="{ name: 'home' }"
          class="nova-logo-link flex min-w-0 items-center gap-2 no-underline"
        >
          <span class="nova-logo-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-base" aria-hidden="true">
            🍁
          </span>
          <span class="truncate text-[15px] font-semibold tracking-tight text-[color:var(--nova-text)]">枫叶小站</span>
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
      <p class="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--nova-text-muted)]">主题</p>
      <div class="nova-theme-drawer-list">
        <button
          v-for="id in NOVA_THEMES"
          :key="`drawer-${id}`"
          type="button"
          class="nova-theme-drawer-option"
          :class="{ 'nova-theme-drawer-option--active': novaTheme === id }"
          :aria-pressed="novaTheme === id"
          :aria-label="`主题：${themeLabel[id]}`"
          @click="$emit('setNovaTheme', id)"
        >
          <span
            class="nova-theme-dot nova-theme-dot--menu shrink-0"
            :class="[themeDotClass(id), { 'nova-theme-dot--active': novaTheme === id }]"
            aria-hidden="true"
          />
          <span class="nova-theme-option-title">{{ themeLabel[id] }}</span>
        </button>
      </div>
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
      <button
        v-if="aiPortalItem?.href"
        type="button"
        class="nova-drawer-link nova-drawer-link--button"
        @click="$emit('openAiPortal'); $emit('updateMobileMenu', false)"
      >
        <span>{{ aiPortalItem.label }}</span>
        <span class="nova-drawer-link-chevron" aria-hidden="true">›</span>
      </button>
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

/* 现代顶栏常见形态：无外层「胶囊槽」，链接即导航（类似 Linear / Vercel / GitHub 顶栏） */
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

.nova-ai-portal-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
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

.nova-ai-portal-link:hover {
  border-color: color-mix(in srgb, var(--nova-accent) 44%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 14%, var(--nova-surface));
  color: var(--nova-accent);
}

.nova-ai-portal-link:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
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

.nova-drawer-link-chevron {
  font-size: 18px;
  font-weight: 300;
  color: var(--nova-text-muted);
  line-height: 1;
}

.nova-drawer-link--active .nova-drawer-link-chevron {
  color: var(--nova-accent);
}

.nova-theme-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  min-width: 40px;
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid var(--nova-border);
  background: color-mix(in srgb, var(--nova-surface) 88%, transparent);
  color: var(--nova-text-muted);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease;
}

.nova-theme-trigger:hover {
  border-color: color-mix(in srgb, var(--nova-accent) 28%, var(--nova-border));
  color: var(--nova-accent);
}

.nova-theme-trigger:focus-visible {
  outline: 2px solid var(--nova-accent);
  outline-offset: 2px;
}

.nova-theme-trigger-icon {
  font-size: 18px;
}

.nova-theme-trigger-swatch {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--nova-text) 18%, transparent);
}

.nova-theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.nova-theme-option-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--nova-text);
  line-height: 1.25;
}

.nova-theme-drawer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nova-theme-drawer-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid var(--nova-border);
  background: color-mix(in srgb, var(--nova-surface) 70%, transparent);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.nova-theme-drawer-option:hover {
  border-color: color-mix(in srgb, var(--nova-accent) 24%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 8%, var(--nova-surface));
}

.nova-theme-drawer-option--active {
  border-color: color-mix(in srgb, var(--nova-accent) 40%, var(--nova-border));
  background: color-mix(in srgb, var(--nova-accent) 12%, var(--nova-surface));
}

.nova-theme-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.nova-theme-dot--menu {
  flex-shrink: 0;
}

.nova-theme-drawer-option:hover .nova-theme-dot--menu {
  transform: scale(1.06);
}

.nova-theme-dot:hover {
  transform: scale(1.18);
}

.nova-theme-dot--active {
  border-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

:global(html[data-nova-theme='sakura']) .nova-theme-dot--active {
  border-color: #2d1a26;
  box-shadow: 0 0 0 2px rgba(224, 92, 153, 0.45);
}

:global(html[data-nova-theme='frost']) .nova-theme-dot--active {
  border-color: #0f172a;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4);
}

:global(html[data-nova-theme='mono']) .nova-theme-dot--active {
  border-color: #171717;
  box-shadow: 0 0 0 2px rgba(23, 23, 23, 0.28);
}

.nova-theme-dot--cyber {
  background: linear-gradient(135deg, #00d2ff, #7b2fff);
}

.nova-theme-dot--aurora {
  background: linear-gradient(135deg, #78dc9a, #40e0d0);
}

.nova-theme-dot--solar {
  background: linear-gradient(135deg, #ff9f1c, #ff4d6d);
}

.nova-theme-dot--sakura {
  background: linear-gradient(135deg, #e05c99, #9b5de5);
}

.nova-theme-dot--void {
  background: linear-gradient(135deg, #a78bfa, #6366f1);
}

.nova-theme-dot--ember {
  background: linear-gradient(135deg, #f87171, #fb923c);
}

.nova-theme-dot--moss {
  background: linear-gradient(135deg, #4ade80, #2dd4bf);
}

.nova-theme-dot--frost {
  background: linear-gradient(135deg, #0284c7, #38bdf8);
}

.nova-theme-dot--mono {
  background: linear-gradient(135deg, #171717, #a3a3a3);
}

.nova-theme-dot--ink {
  background: linear-gradient(135deg, #f5f5f5, #525252);
}

@media (prefers-reduced-motion: reduce) {
  .nova-nav-link,
  .nova-drawer-link,
  .nova-header-menu-btn,
  .nova-theme-dot,
  .nova-theme-trigger,
  .nova-logo-mark {
    transition: none;
  }

  .nova-logo-link.group:hover .nova-logo-mark {
    transform: none;
  }

  .nova-theme-drawer-option:hover .nova-theme-dot--menu {
    transform: none;
  }
}
</style>

<style>
/* 下拉挂载在 body，需非 scoped */
.nova-theme-dropdown-shell .ant-dropdown-menu {
  margin-top: 6px;
  padding: 6px;
  min-width: 200px;
  max-height: min(420px, 70vh);
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--nova-border) 90%, transparent);
  background: color-mix(in srgb, var(--nova-surface) 94%, transparent);
  backdrop-filter: blur(16px);
  box-shadow:
    0 12px 40px color-mix(in srgb, #000 45%, transparent),
    0 0 0 1px color-mix(in srgb, var(--nova-text) 4%, transparent);
}

html[data-nova-theme='sakura'] .nova-theme-dropdown-shell .ant-dropdown-menu {
  box-shadow:
    0 12px 36px color-mix(in srgb, #2d1a26 12%, transparent),
    0 0 0 1px color-mix(in srgb, var(--nova-border) 80%, transparent);
}

html[data-nova-theme='frost'] .nova-theme-dropdown-shell .ant-dropdown-menu {
  box-shadow:
    0 12px 36px color-mix(in srgb, #0f172a 10%, transparent),
    0 0 0 1px color-mix(in srgb, var(--nova-border) 80%, transparent);
}

html[data-nova-theme='mono'] .nova-theme-dropdown-shell .ant-dropdown-menu {
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.06);
}

.nova-theme-dropdown-shell .ant-dropdown-menu-item {
  height: auto !important;
  line-height: 1.25 !important;
  padding: 8px 12px !important;
  border-radius: 8px !important;
}

.nova-theme-dropdown-shell .ant-dropdown-menu-item-active,
.nova-theme-dropdown-shell .ant-dropdown-menu-item:hover {
  background: color-mix(in srgb, var(--nova-accent) 10%, var(--nova-surface)) !important;
}

.nova-theme-dropdown-shell .ant-dropdown-menu-item-selected {
  background: color-mix(in srgb, var(--nova-accent) 14%, var(--nova-surface)) !important;
}

.nova-theme-dropdown-shell .ant-dropdown-menu-item:hover .nova-theme-dot--menu {
  transform: scale(1.06);
}
</style>
