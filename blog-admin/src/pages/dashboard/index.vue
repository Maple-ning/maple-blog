<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useBlogAdmin } from '@/composables/useBlogAdmin';

const { posts, postsByStatus, projects, goodSites, about, init } = useBlogAdmin();
const postTotal = computed(() => posts.value.length);
const publishedCount = computed(() => postsByStatus('published').length);
const draftCount = computed(() => postsByStatus('draft').length);

onMounted(() => {
  init();
});
</script>

<template>
  <section class="space-y-6">
    <a-card class="overflow-hidden">
      <div class="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-6 text-white">
        <p class="text-sm/6 text-slate-200">内容管理总览</p>
        <p class="mt-1 text-2xl font-semibold">今天也来维护一下你的小站内容</p>
      </div>
    </a-card>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <a-card>
        <p class="text-sm text-slate-500">博文总数</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ postTotal }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-slate-500">已发布</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ publishedCount }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-slate-500">项目展示</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ projects.length }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-slate-500">好站收藏</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ goodSites.length }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-slate-500">草稿文章</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ draftCount }}</p>
      </a-card>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <a-card title="关于我预览">
        <p class="text-lg font-semibold text-slate-900">{{ about.name || '未设置昵称' }}</p>
        <p class="mt-2 line-clamp-4 text-slate-600">{{ about.intro || '未设置个人介绍' }}</p>
      </a-card>

      <a-card title="维护建议">
        <ul class="space-y-2 text-sm text-slate-600">
          <li>在「博文管理」中维护文章与草稿。</li>
          <li>优先清理长期草稿，保持内容新鲜。</li>
          <li>项目与好站建议补充描述，提升前台可读性。</li>
        </ul>
      </a-card>
    </div>
  </section>
</template>
