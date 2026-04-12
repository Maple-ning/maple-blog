<script setup lang="ts">
import HomeHeroVisualPanel from '@/components/home/HomeHeroVisualPanel.vue';

withDefaults(
  defineProps<{
    displayName: string;
    intro: string;
    articleTotal: number;
    projectTotal: number;
    starsDisplay?: string;
    badgeText?: string;
    /** 首页右侧封面图，可传外链或 `/blog/xxx.jpg` */
    heroCoverSrc?: string | null;
  }>(),
  { starsDisplay: '—', badgeText: undefined, heroCoverSrc: null },
);
</script>

<template>
  <!-- 首屏非卡片；右侧为概览卡（无代码块） -->
  <div class="nova-home-hero">
    <div class="nova-home-hero-grid" aria-hidden="true" />
    <div class="nova-home-hero-orbs" aria-hidden="true">
      <span class="nova-home-hero-orb nova-home-hero-orb--1" />
      <span class="nova-home-hero-orb nova-home-hero-orb--2" />
    </div>

    <div class="nova-home-hero-inner">
      <div class="nova-home-hero-content min-w-0 flex-1">
        <div class="nova-hero-badge">
          <span class="nova-hero-badge-dot" />
          <span class="font-mono text-[11px] tracking-[0.18em] sm:text-xs">{{ badgeText ?? 'MAPLE · BLOG' }}</span>
        </div>

        <h1 class="nova-hero-title mt-6">
          <span class="nova-hero-title-line1 block">{{ displayName }}</span>
          <span class="nova-hero-title-line2 block">枫叶小站</span>
        </h1>

        <p class="nova-hero-subtitle mt-5 max-w-[30rem] text-[17px] leading-[1.7]">
          {{ intro }}
        </p>

        <div class="nova-hero-actions mt-9 flex flex-wrap gap-4">
          <slot name="actions" />
        </div>
      </div>

      <div class="nova-home-hero-visual">
        <div class="nova-home-hero-visual-box">
          <HomeHeroVisualPanel
            :article-count="articleTotal"
            :project-count="projectTotal"
            :stars-display="starsDisplay"
            :cover-src="heroCoverSrc"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nova-home-hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  padding: 40px 0;
  overflow: hidden;
}

.nova-home-hero-grid {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(var(--nova-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--nova-border) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 85% 70% at 50% 45%, black 18%, transparent 72%);
  pointer-events: none;
}

.nova-home-hero-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.nova-home-hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(64px);
  opacity: 0.12;
}

.nova-home-hero-orb--1 {
  width: 200px;
  height: 200px;
  background: var(--nova-accent);
  top: -40px;
  right: 10%;
}

.nova-home-hero-orb--2 {
  width: 160px;
  height: 160px;
  background: var(--nova-accent2);
  bottom: 10%;
  left: 5%;
  opacity: 0.08;
}

.nova-home-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 2.5rem;
}

@media (min-width: 901px) {
  .nova-home-hero-inner {
    flex-direction: row;
    align-items: center;
    gap: 60px;
  }
}

.nova-home-hero-visual {
  display: none;
  flex: 0 0 380px;
  width: 100%;
  max-width: 380px;
}

@media (min-width: 901px) {
  .nova-home-hero-visual {
    display: block;
  }
}

.nova-home-hero-visual-box {
  position: relative;
  height: 380px;
  width: 100%;
}

.nova-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--nova-border);
  background: var(--nova-surface);
  color: var(--nova-accent);
  backdrop-filter: blur(10px);
}

.nova-hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--nova-accent);
  animation: nova-hero-blink 1.5s ease-in-out infinite;
}

@keyframes nova-hero-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nova-hero-badge-dot {
    animation: none;
  }
}

.nova-hero-title-line1 {
  font-size: clamp(2.625rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
  color: var(--nova-text);
}

.nova-hero-title-line2 {
  margin-top: 6px;
  font-size: clamp(2.625rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--nova-accent), var(--nova-accent2), var(--nova-accent3));
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: nova-hero-grad 4s ease infinite;
}

@keyframes nova-hero-grad {
  0% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nova-hero-title-line2 {
    animation: none;
  }
}

.nova-hero-subtitle {
  color: var(--nova-text-muted);
}
</style>
