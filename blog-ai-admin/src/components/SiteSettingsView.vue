<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { SiteProfile } from '../types';

const props = defineProps<{
  siteProfile: SiteProfile;
}>();

const emit = defineEmits<{
  saveSiteProfile: [payload: SiteProfile];
}>();

const profileForm = reactive<SiteProfile>({
  siteName: '',
  tagline: '',
  heroTitle: '',
  heroIntro: '',
  contactEmail: '',
  updatedAt: '',
});

watch(
  () => props.siteProfile,
  (value) => {
    profileForm.siteName = value.siteName;
    profileForm.tagline = value.tagline;
    profileForm.heroTitle = value.heroTitle;
    profileForm.heroIntro = value.heroIntro;
    profileForm.contactEmail = value.contactEmail;
    profileForm.updatedAt = value.updatedAt;
  },
  { immediate: true, deep: true },
);

function submitProfile() {
  emit('saveSiteProfile', { ...profileForm });
}

function formatDateTime(value: string) {
  if (!value) return '未更新';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
</script>

<template>
  <section style="display:flex;flex-direction:column;gap:1.5rem;">
    <div>
      <h2 style="font-size:var(--text-2xl);font-weight:800;">站点设置</h2>
      <p style="color:var(--color-text-muted);margin-top:.35rem;">
        维护站点名称与首页展示文案。学习笔记阶段、资讯分类、项目技术栈均在各内容编辑表单中直接填写，不再在此集中配置。
      </p>
    </div>

    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">站点信息</span>
        <span style="font-size:var(--text-xs);color:var(--color-text-muted);">
          最近更新 {{ formatDateTime(siteProfile.updatedAt) }}
        </span>
      </div>
      <div class="panel-body">
        <form class="admin-form" @submit.prevent="submitProfile">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <div class="form-group">
              <label class="form-label">站点名称</label>
              <input v-model="profileForm.siteName" class="form-input" type="text" />
            </div>
            <div class="form-group">
              <label class="form-label">联系邮箱</label>
              <input v-model="profileForm.contactEmail" class="form-input" type="email" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">副标题</label>
            <input v-model="profileForm.tagline" class="form-input" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label">首页主标题</label>
            <input v-model="profileForm.heroTitle" class="form-input" type="text" />
          </div>
          <div class="form-group">
            <label class="form-label">首页介绍</label>
            <textarea v-model="profileForm.heroIntro" class="form-textarea" style="min-height:160px;"></textarea>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <button type="submit" class="btn btn--primary">保存站点信息</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
