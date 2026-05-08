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
  min-height: 560px;
  margin-left: calc(50% - 50vw);
  overflow: hidden;
  background: color-mix(in srgb, var(--nova-page-bg) 28%, #080808);
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
  background-color: color-mix(in srgb, var(--nova-page-bg) 28%, #080808);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: scale(1.03);
  animation: hero-bg-zoom 24s ease-in-out infinite alternate;
}

.nova-home-hero__overlay {
  background:
    linear-gradient(180deg, rgb(6 6 6 / 0.46) 0%, rgb(6 6 6 / 0.6) 100%),
    linear-gradient(90deg, rgb(6 6 6 / 0.7) 0%, rgb(6 6 6 / 0.18) 54%, rgb(6 6 6 / 0.72) 100%);
}

.nova-home-hero__slash {
  background:
    radial-gradient(circle at 14% 18%, rgb(240 185 11 / 0.14), transparent 28%),
    linear-gradient(180deg, rgb(255 255 255 / 0.06), transparent 24%),
    linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 0.03) 48%, transparent 100%);
  opacity: 0.9;
}

.nova-home-hero__glow {
  position: absolute;
  inset: auto auto -120px -120px;
  width: min(540px, 58vw);
  height: min(540px, 58vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgb(240 185 11 / 0.16) 0%, transparent 70%);
  pointer-events: none;
}

.nova-home-hero__noise {
  z-index: 1;
  pointer-events: none;
  opacity: 0.26;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
}

.nova-home-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 560px;
  margin: 0 auto;
  padding: 132px 40px 132px;
  flex-direction: column;
  justify-content: center;
}

.nova-home-hero__badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.12);
  background: rgb(255 255 255 / 0.05);
  backdrop-filter: blur(12px);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(242 225 172 / 0.92);
}

.nova-home-hero__badge::before {
  content: '';
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}

.nova-home-hero__title {
  max-width: 820px;
  margin: 0;
  color: #f7f2e8;
  font-size: clamp(42px, 6vw, 82px);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.nova-home-hero__title-accent {
  color: var(--nova-accent2);
}

.nova-home-hero__subtitle {
  max-width: 560px;
  margin-top: 24px;
  margin-bottom: 40px;
  color: rgb(247 242 232 / 0.72);
  font-size: clamp(15px, 1.7vw, 19px);
  font-weight: 400;
  line-height: 1.82;
}

.nova-home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.nova-home-hero__actions :deep(.nova-btn-primary),
.nova-home-hero__actions :deep(.nova-btn-outline) {
  min-height: 48px;
  border-radius: 999px;
  padding: 12px 28px;
  font-size: 14px;
  letter-spacing: 0;
}

.nova-home-hero__actions :deep(.nova-btn-primary) {
  border-color: rgb(255 214 106 / 0.48);
  box-shadow: 0 16px 34px rgb(240 185 11 / 0.22);
}

.nova-home-hero__actions :deep(.nova-btn-outline) {
  border-color: rgb(255 255 255 / 0.16);
  background: rgb(255 255 255 / 0.06);
  color: rgb(247 242 232 / 0.92);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

.nova-home-hero__bottom-fade {
  top: auto;
  height: 96px;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--nova-page-bg));
}

:global(html[data-nova-theme='light'] .nova-home-hero) {
  background: color-mix(in srgb, var(--nova-page-bg) 92%, #ebe2d2);
  box-shadow: inset 0 -1px 0 rgb(20 18 15 / 0.06);
}

:global(html[data-nova-theme='light'] .nova-home-hero__bg) {
  background-color: #ebe2d2;
  filter: brightness(1.02) saturate(0.9) contrast(0.96);
}

:global(html[data-nova-theme='light'] .nova-home-hero__overlay) {
  background:
    linear-gradient(180deg, rgb(246 241 232 / 0.38) 0%, rgb(246 241 232 / 0.6) 100%),
    linear-gradient(90deg, rgb(246 241 232 / 0.82) 0%, rgb(246 241 232 / 0.38) 52%, rgb(246 241 232 / 0.84) 100%);
}

:global(html[data-nova-theme='light'] .nova-home-hero__slash) {
  background:
    radial-gradient(circle at 14% 18%, rgb(216 155 0 / 0.12), transparent 28%),
    linear-gradient(180deg, rgb(255 255 255 / 0.42), transparent 24%),
    linear-gradient(90deg, transparent 0%, rgb(20 18 15 / 0.035) 48%, transparent 100%);
}

:global(html[data-nova-theme='light'] .nova-home-hero__glow) {
  background: radial-gradient(circle, rgb(216 155 0 / 0.12) 0%, transparent 70%);
}

:global(html[data-nova-theme='light'] .nova-home-hero__noise) {
  opacity: 0.16;
}

:global(html[data-nova-theme='light'] .nova-home-hero__badge) {
  border-color: rgb(20 18 15 / 0.08);
  background: rgb(255 252 247 / 0.58);
  color: rgb(136 92 0 / 0.88);
}

:global(html[data-nova-theme='light'] .nova-home-hero__title) {
  color: #17130d;
}

:global(html[data-nova-theme='light'] .nova-home-hero__subtitle) {
  color: rgb(31 25 18 / 0.72);
}

:global(html[data-nova-theme='light'] .nova-home-hero__actions .nova-btn-outline) {
  border-color: rgb(20 18 15 / 0.12);
  background: rgb(255 252 247 / 0.62);
  color: rgb(20 18 15 / 0.9);
}

@keyframes hero-bg-zoom {
  from {
    transform: scale(1.03);
  }

  to {
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .nova-home-hero {
    min-height: 500px;
  }

  .nova-home-hero__content {
    min-height: 500px;
    padding: 116px 24px 108px;
  }

  .nova-home-hero__title {
    font-size: clamp(36px, 10vw, 56px);
  }
}

@media (max-width: 480px) {
  .nova-home-hero__badge {
    letter-spacing: 0.12em;
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
  .nova-home-hero__actions :deep(.nova-btn-primary),
  .nova-home-hero__actions :deep(.nova-btn-outline) {
    animation: none;
    transition: none;
  }
}
</style>
