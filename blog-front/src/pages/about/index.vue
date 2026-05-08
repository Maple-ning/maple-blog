<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { getProfile } from '@/services/profile';

const profile = ref<Awaited<ReturnType<typeof getProfile>>>(null);
const isProfileLoading = ref<boolean>(true);
const profileError = ref<string>('');
const displayName = computed(() => profile.value?.name?.trim() || '');
const displayTagline = computed(() => profile.value?.tagline?.trim() || '');
const displayIntro = computed(() => profile.value?.intro?.trim() || '');
const displayFocusPoints = computed(() => profile.value?.focusPoints ?? []);
const displayEmail = computed(() => profile.value?.email?.trim() || '');
const displayGithub = computed(() => profile.value?.github?.trim() || '');
const displaySiteAbout = computed(() => profile.value?.siteAbout?.trim() || '');

const defaultSiteAbout = '枫叶小站聚合文章与项目；内容来自后台配置，欢迎阅读与交流。';

/** 支持填写 github.com/foo 或完整 https URL */
const githubHref = (raw: string): string => {
  const u = raw.trim();
  if (!u) return '#';
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
};

onMounted(async (): Promise<void> => {
  try {
    isProfileLoading.value = true;
    profileError.value = '';
    profile.value = await getProfile();
  } catch (error: unknown) {
    profileError.value = '资料加载失败，请稍后再试。';
    console.error('[about/index.vue:onMounted] getProfile failed', {
      error,
      page: 'about',
    });
  } finally {
    isProfileLoading.value = false;
  }
});
</script>

<template>
  <section class="nova-about-page">
    <div class="nova-about-hero">
      <div class="nova-about-hero-glow" aria-hidden="true" />
      <div class="nova-about-hero-inner">
        <div class="nova-about-hero-copy">
          <span class="nova-about-kicker">PROFILE</span>
          <a-tooltip :title="displayName || '简介'" placement="topLeft">
            <h1 class="nova-about-name">{{ displayName || '简介' }}</h1>
          </a-tooltip>
          <p v-if="isProfileLoading" class="nova-about-intro nova-about-intro--muted">
            资料加载中...
          </p>
          <p v-else-if="profileError" class="nova-about-intro nova-about-intro--muted">
            {{ profileError }}
          </p>
          <p v-if="displayTagline" class="nova-about-tagline">{{ displayTagline }}</p>
          <p v-if="displayIntro" class="nova-about-intro">{{ displayIntro }}</p>
          <p
            v-else-if="!isProfileLoading && !profileError && !displayTagline"
            class="nova-about-intro nova-about-intro--muted"
          >
            暂无简介，可在后台完善个人资料。
          </p>
          <div v-if="displayEmail || displayGithub" class="nova-about-actions">
            <a v-if="displayEmail" class="nova-about-action" :href="`mailto:${displayEmail}`">
              邮箱
            </a>
            <a
              v-if="displayGithub"
              class="nova-about-action"
              :href="githubHref(displayGithub)"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>

    <div
      class="nova-about-panels"
      :class="{ 'nova-about-panels--no-focus': displayFocusPoints.length === 0 }"
    >
      <article v-if="displayFocusPoints.length" class="nova-about-panel nova-about-panel--focus">
        <header class="nova-about-panel-head">
          <span class="nova-about-panel-kicker">FOCUS</span>
          <h2 class="nova-about-panel-title">我在做什么</h2>
        </header>
        <ul class="nova-about-focus-list">
          <li v-for="(item, i) in displayFocusPoints" :key="i">{{ item }}</li>
        </ul>
      </article>

      <article class="nova-about-panel nova-about-panel--contact">
        <header class="nova-about-panel-head">
          <span class="nova-about-panel-kicker">CONTACT</span>
          <h2 class="nova-about-panel-title">联系我</h2>
        </header>
        <dl class="nova-about-dl">
          <div class="nova-about-dl-row">
            <dt>邮箱</dt>
            <dd>
              <template v-if="displayEmail">
                <a class="nova-about-link" :href="`mailto:${displayEmail}`">{{ displayEmail }}</a>
              </template>
              <span v-else class="nova-about-dl-empty">暂未公开</span>
            </dd>
          </div>
          <div class="nova-about-dl-row">
            <dt>GitHub</dt>
            <dd>
              <template v-if="displayGithub">
                <a
                  class="nova-about-link"
                  :href="githubHref(displayGithub)"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {{ displayGithub }}
                </a>
              </template>
              <span v-else class="nova-about-dl-empty">暂未公开</span>
            </dd>
          </div>
        </dl>
      </article>

      <article class="nova-about-panel nova-about-panel--site">
        <header class="nova-about-panel-head">
          <span class="nova-about-panel-kicker">SITE</span>
          <h2 class="nova-about-panel-title">关于本站</h2>
        </header>
        <p class="nova-about-site-text">
          {{ displaySiteAbout || defaultSiteAbout }}
        </p>
      </article>
    </div>
  </section>
</template>
