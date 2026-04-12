<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    articleCount: number;
    projectCount: number;
    starsDisplay?: string;
    /** 封面图 URL；留空则用站点默认 `/hero-cover.svg`（随 Vite base） */
    coverSrc?: string | null;
  }>(),
  { starsDisplay: '—', coverSrc: null },
);

const displayArticles = ref(0);
const displayProjects = ref(0);

const resolvedCover = computed(() => {
  const raw = props.coverSrc?.trim();
  if (raw) return raw;
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}hero-cover.svg`;
});

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animateValue = (
  from: number,
  to: number,
  setter: (v: number) => void,
  durationMs: number,
) => {
  if (reducedMotion() || from === to) {
    setter(to);
    return;
  }
  const start = performance.now();
  const delta = to - from;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - (1 - t) * (1 - t);
    setter(Math.round(from + delta * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const applyPair = (fromA: number, fromP: number, toA: number, toP: number, durationMs: number) => {
  if (reducedMotion()) {
    displayArticles.value = toA;
    displayProjects.value = toP;
    return;
  }
  animateValue(fromA, toA, (v) => {
    displayArticles.value = v;
  }, durationMs);
  animateValue(fromP, toP, (v) => {
    displayProjects.value = v;
  }, durationMs);
};

watch(
  () => [props.articleCount, props.projectCount] as const,
  ([toA, toP], prev) => {
    if (!prev) {
      applyPair(0, 0, toA, toP, 720);
      return;
    }
    const [pA, pP] = prev;
    if (pA === toA && pP === toP) return;
    applyPair(displayArticles.value, displayProjects.value, toA, toP, 480);
  },
  { immediate: true },
);
</script>

<template>
  <div class="hero-visual-card">
    <div class="hero-visual-cover-wrap">
      <img
        class="hero-visual-cover-img"
        :src="resolvedCover"
        alt=""
        width="760"
        height="420"
        decoding="async"
        fetchpriority="high"
      />
      <div class="hero-visual-cover-scrim" aria-hidden="true" />
      <p class="hero-visual-cover-caption">
        <span class="hero-visual-cover-kicker">MAPLE</span>
        <span class="hero-visual-cover-dot">·</span>
        <span>学习 · 记录 · 项目</span>
      </p>
    </div>

    <div class="hero-visual-stats">
      <div class="hero-visual-stat">
        <div class="hero-visual-stat-num">{{ displayArticles }}</div>
        <div class="hero-visual-stat-label">博文</div>
      </div>
      <div class="hero-visual-stat">
        <div class="hero-visual-stat-num">{{ displayProjects }}</div>
        <div class="hero-visual-stat-label">项目</div>
      </div>
      <div class="hero-visual-stat">
        <div class="hero-visual-stat-num hero-visual-stat-num--muted">{{ starsDisplay }}</div>
        <div class="hero-visual-stat-label">Stars</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-visual-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--nova-radius);
  border: 1px solid var(--nova-border);
  background: var(--nova-card-bg);
  backdrop-filter: blur(20px);
  transition:
    border-color var(--nova-transition),
    box-shadow var(--nova-transition);
}

.hero-visual-card:hover {
  border-color: var(--nova-border-hover);
  box-shadow: var(--nova-glow);
}

.hero-visual-cover-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}

.hero-visual-cover-img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.hero-visual-cover-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(0 0 0 / 0) 0%,
    rgb(0 0 0 / 0.2) 55%,
    color-mix(in srgb, var(--nova-page-bg) 88%, black) 100%
  );
  pointer-events: none;
}

.hero-visual-cover-caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  margin: 0;
  padding: 14px 16px;
  font-size: 12px;
  color: rgb(255 255 255 / 0.88);
  text-shadow: 0 1px 8px rgb(0 0 0 / 0.45);
}

.hero-visual-cover-kicker {
  font-family: var(--font-family-mono);
  font-weight: 600;
  letter-spacing: 0.14em;
  color: rgb(186 230 253 / 0.95);
}

.hero-visual-cover-dot {
  margin: 0 0.25em;
  opacity: 0.7;
}

.hero-visual-stats {
  display: grid;
  flex-shrink: 0;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  border-top: 1px solid var(--nova-border);
  padding: 18px 16px 20px;
  background: color-mix(in srgb, var(--nova-bg2) 88%, transparent);
}

.hero-visual-stat {
  text-align: center;
}

.hero-visual-stat-num {
  font-family: var(--font-family-mono);
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--nova-accent);
}

.hero-visual-stat-num--muted {
  font-size: 18px;
  color: var(--nova-text-muted);
}

.hero-visual-stat-label {
  margin-top: 6px;
  font-size: 11px;
  color: var(--nova-text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .hero-visual-card {
    transition: border-color var(--nova-transition);
  }
}
</style>
