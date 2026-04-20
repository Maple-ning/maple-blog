<script setup lang="ts">
import { reactive, watch } from "vue";
import type { SiteProfile } from "@/types/content";
import { formatDateTime } from "@/utils/format";

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

</script>

<template>
  <section class="admin-panel-stack">
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">站点信息</span>
        <span class="site-settings__updated-at">
          最近更新 {{ formatDateTime(siteProfile.updatedAt) }}
        </span>
      </div>
      <div class="panel-body">
        <form class="admin-form" @submit.prevent="submitProfile">
          <div class="site-settings__grid">
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
            <textarea v-model="profileForm.heroIntro" class="form-textarea form-textarea--large"></textarea>
          </div>
          <div class="site-settings__actions">
            <button type="submit" class="btn btn--primary">保存站点信息</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
