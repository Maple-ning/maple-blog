<script setup lang="ts">
import SiteSettingsPanel from "@/components/business/SiteSettingsPanel/index.vue";
import type { SiteProfile } from "@/types/content";

defineProps<{
  siteProfile: SiteProfile;
}>();

defineEmits<{
  saveSiteProfile: [payload: SiteProfile];
}>();
</script>

<template>
  <SiteSettingsPanel
    :site-profile="siteProfile"
    @save-site-profile="$emit('saveSiteProfile', $event)"
  />
</template>
