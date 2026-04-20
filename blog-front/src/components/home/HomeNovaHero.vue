<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    displayName: string;
    intro: string;
    articleTotal: number;
    projectTotal: number;
    starsDisplay?: string;
    badgeText?: string;
    /** 首页背景图，可传外链或站内图片 */
    heroCoverSrc?: string | null;
  }>(),
  { starsDisplay: '—', badgeText: undefined, heroCoverSrc: null },
);

const defaultHeroImage =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=90&auto=format&fit=crop';

const heroBackgroundStyle = computed(() => {
  const raw = props.heroCoverSrc?.trim();
  return {
    backgroundImage: `url("${raw || defaultHeroImage}")`,
  };
});

const heroBadgeText = computed(() => props.badgeText?.trim() || '独立开发者 · 持续学习');
</script>

<template>
  <section class="nova-home-hero">
    <div class="nova-home-hero__bg" :style="heroBackgroundStyle" aria-hidden="true" />
    <div class="nova-home-hero__overlay" aria-hidden="true" />
    <div class="nova-home-hero__slash" aria-hidden="true" />
    <div class="nova-home-hero__glow" aria-hidden="true" />
    <div class="nova-home-hero__noise" aria-hidden="true" />

    <div class="nova-home-hero__content">
      <span class="nova-home-hero__badge">{{ heroBadgeText }}</span>

      <h1 class="nova-home-hero__title">
        <template v-if="displayName">{{ displayName }}<br /></template>
        <span class="nova-home-hero__title-accent">枫叶小站</span>
      </h1>

      <p class="nova-home-hero__subtitle">
        {{ intro }}
      </p>

      <div class="nova-home-hero__actions">
        <slot name="actions" />
      </div>
    </div>

    <div class="nova-home-hero__bottom-fade" aria-hidden="true" />
  </section>
</template>

<style scoped>
.nova-home-hero {
  position: relative;
  width: 100vw;
  min-height: 520px;
  margin-left: calc(50% - 50vw);
  overflow: hidden;
  background: color-mix(in srgb, var(--nova-page-bg) 20%, #0d1117);
}

.nova-home-hero__bg,
.nova-home-hero__overlay,
.nova-home-hero__slash,
.nova-home-hero__noise,
.nova-home-hero__bottom-fade {
  position: absolute;
  inset: 0;
}

.nova-home-hero__bg {
  background-color: color-mix(in srgb, var(--nova-page-bg) 20%, #0d1117);
  background-position: center 40%;
  background-repeat: no-repeat;
  background-size: cover;
  transform: scale(1.04);
  animation: hero-bg-zoom 20s ease-in-out infinite alternate;
}

.nova-home-hero__overlay {
  background: linear-gradient(
    105deg,
    rgb(8 10 20 / 0.92) 0%,
    rgb(8 10 20 / 0.82) 38%,
    rgb(8 10 20 / 0.4) 62%,
    rgb(8 10 20 / 0.15) 100%
  );
}

.nova-home-hero__slash {
  pointer-events: none;
  overflow: hidden;
}

.nova-home-hero__slash::before,
.nova-home-hero__slash::after {
  content: '';
  position: absolute;
  top: -20%;
  bottom: -20%;
  transform: skewX(-18deg);
}

.nova-home-hero__slash::before {
  right: 28%;
  width: 3px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgb(180 160 100 / 0.18) 30%,
    rgb(212 185 120 / 0.38) 50%,
    rgb(180 160 100 / 0.18) 70%,
    transparent 100%
  );
}

.nova-home-hero__slash::after {
  right: 32%;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgb(212 185 120 / 0.12) 40%,
    rgb(212 185 120 / 0.22) 50%,
    rgb(212 185 120 / 0.12) 60%,
    transparent 100%
  );
}

.nova-home-hero__glow {
  position: absolute;
  top: -150px;
  left: -100px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(212 185 120 / 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.nova-home-hero__noise {
  z-index: 1;
  pointer-events: none;
  opacity: 0.6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
}

.nova-home-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 520px;
  margin: 0 auto;
  padding: 84px 40px 128px;
  flex-direction: column;
  justify-content: center;
}

.nova-home-hero__badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 7px;
  margin-bottom: 20px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(212 185 120 / 0.75);
}

.nova-home-hero__badge::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #c9a84c;
  box-shadow: 0 0 6px #c9a84c;
  animation: hero-badge-pulse 2s infinite;
}

.nova-home-hero__title {
  max-width: 720px;
  margin: 0;
  color: #fff;
  font-size: clamp(36px, 5.5vw, 68px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.nova-home-hero__title-accent {
  background: linear-gradient(90deg, #e8cc80 0%, #f0dfa0 40%, #c9a84c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.nova-home-hero__subtitle {
  max-width: 460px;
  margin-top: 18px;
  margin-bottom: 36px;
  color: rgb(255 255 255 / 0.4);
  font-size: clamp(14px, 1.6vw, 18px);
  font-weight: 400;
  line-height: 1.7;
}

.nova-home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.nova-home-hero__actions :deep(.nova-btn-primary),
.nova-home-hero__actions :deep(.nova-btn-outline) {
  border-radius: 6px;
  padding: 12px 26px;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.nova-home-hero__actions :deep(.nova-btn-primary) {
  border: none;
  background: linear-gradient(135deg, #c9a84c 0%, #e8cc80 100%);
  color: #1a1400;
  box-shadow: 0 4px 20px rgb(201 168 76 / 0.35);
}

.nova-home-hero__actions :deep(.nova-btn-primary:hover) {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #c9a84c 0%, #e8cc80 100%);
  box-shadow: 0 8px 28px rgb(201 168 76 / 0.5);
}

.nova-home-hero__actions :deep(.nova-btn-outline) {
  border: 1px solid rgb(255 255 255 / 0.2);
  background: transparent;
  color: rgb(255 255 255 / 0.7);
  box-shadow: none;
}

.nova-home-hero__actions :deep(.nova-btn-outline:hover) {
  transform: translateY(-1px);
  border-color: rgb(212 185 120 / 0.5);
  background: rgb(212 185 120 / 0.06);
  color: rgb(212 185 120 / 0.9);
}

.nova-home-hero__bottom-fade {
  top: auto;
  height: 80px;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--nova-page-bg));
}

:global(html[data-nova-theme='light'] .nova-home-hero) {
  background:
    linear-gradient(180deg, rgb(248 244 236) 0%, rgb(246 246 246) 100%);
  box-shadow: inset 0 -1px 0 rgb(0 0 0 / 0.06);
}

:global(html[data-nova-theme='light'] .nova-home-hero__bg) {
  background-color: #f3ede2;
  filter: brightness(1.08) saturate(0.92) contrast(0.92);
}

:global(html[data-nova-theme='light'] .nova-home-hero__overlay) {
  background: linear-gradient(
    105deg,
    rgb(248 244 236 / 0.94) 0%,
    rgb(248 244 236 / 0.84) 38%,
    rgb(248 244 236 / 0.45) 62%,
    rgb(248 244 236 / 0.16) 100%
  );
}

:global(html[data-nova-theme='light'] .nova-home-hero__glow) {
  background: radial-gradient(circle, rgb(212 185 120 / 0.16) 0%, transparent 72%);
}

:global(html[data-nova-theme='light'] .nova-home-hero__noise) {
  opacity: 0.28;
}

:global(html[data-nova-theme='light'] .nova-home-hero__badge) {
  color: rgb(156 118 34 / 0.88);
}

:global(html[data-nova-theme='light'] .nova-home-hero__title) {
  color: #211a12;
}

:global(html[data-nova-theme='light'] .nova-home-hero__subtitle) {
  color: rgb(56 47 36 / 0.72);
}

:global(html[data-nova-theme='light'] .nova-home-hero__actions .nova-btn-outline) {
  border-color: rgb(32 26 18 / 0.16);
  background: rgb(255 255 255 / 0.46);
  color: rgb(32 26 18 / 0.78);
}

:global(html[data-nova-theme='light'] .nova-home-hero__actions .nova-btn-outline:hover) {
  border-color: rgb(156 118 34 / 0.36);
  background: rgb(212 185 120 / 0.1);
  color: rgb(156 118 34 / 0.96);
}

@keyframes hero-bg-zoom {
  from {
    transform: scale(1.04);
  }

  to {
    transform: scale(1.12);
  }
}

@keyframes hero-badge-pulse {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 6px #c9a84c;
  }

  50% {
    opacity: 0.5;
    box-shadow: 0 0 12px #c9a84c;
  }
}

@media (max-width: 768px) {
  .nova-home-hero {
    min-height: 480px;
  }

  .nova-home-hero__content {
    min-height: 480px;
    padding: 70px 24px 100px;
  }

  .nova-home-hero__slash::before,
  .nova-home-hero__slash::after {
    display: none;
  }
}

@media (max-width: 480px) {
  .nova-home-hero__title {
    font-size: 32px;
  }

  .nova-home-hero__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .nova-home-hero__actions :deep(.nova-btn-primary),
  .nova-home-hero__actions :deep(.nova-btn-outline) {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nova-home-hero__bg,
  .nova-home-hero__badge::before,
  .nova-home-hero__actions :deep(.nova-btn-primary),
  .nova-home-hero__actions :deep(.nova-btn-outline) {
    animation: none;
    transition: none;
  }
}
</style>
