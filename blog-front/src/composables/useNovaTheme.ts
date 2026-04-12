/** 展示顺序：深色组 → 浅色组 */
export const NOVA_THEMES = [
  'cyber',
  'aurora',
  'solar',
  'void',
  'ember',
  'moss',
  'ink',
  'sakura',
  'frost',
  'mono',
] as const;
export type NovaThemeId = (typeof NOVA_THEMES)[number];

/** 使用浅色底 + 不挂 `html.dark` 的主题 */
export const NOVA_LIGHT_THEMES = ['sakura', 'frost', 'mono'] as const;

export const NOVA_THEME_STORAGE_KEY = 'nova-theme';

export function isNovaLightTheme(theme: NovaThemeId): boolean {
  return (NOVA_LIGHT_THEMES as readonly string[]).includes(theme);
}

export function isNovaThemeId(value: string | null | undefined): value is NovaThemeId {
  return typeof value === 'string' && (NOVA_THEMES as readonly string[]).includes(value);
}

/** 同步到 <html>：dataset + Tailwind/Ant 用的 .dark */
export function applyNovaThemeToDocument(theme: NovaThemeId) {
  document.documentElement.dataset.novaTheme = theme;
  document.documentElement.classList.toggle('dark', !isNovaLightTheme(theme));
}

export function readStoredNovaTheme(): NovaThemeId | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(NOVA_THEME_STORAGE_KEY);
  return isNovaThemeId(raw) ? raw : null;
}

/** 首次进入：nova-theme → 旧 theme-mode → 默认深灰 ink */
export function resolveInitialNovaTheme(): NovaThemeId {
  const stored = readStoredNovaTheme();
  if (stored) return stored;

  if (typeof localStorage !== 'undefined') {
    const legacy = localStorage.getItem('theme-mode');
    if (legacy === 'light') return 'sakura';
    if (legacy === 'dark') return 'ink';
  }

  return 'ink';
}
