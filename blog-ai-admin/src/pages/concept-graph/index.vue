<script setup lang="ts">
import ConceptGraphPanel from "@/components/business/ConceptGraphPanel/index.vue";
import type { ConceptGraphContent } from "@/types/content";

defineProps<{
  conceptGraph: ConceptGraphContent;
}>();

defineEmits<{
  saveConceptGraph: [payload: ConceptGraphContent];
}>();
</script>

<template>
  <ConceptGraphPanel
    :concept-graph="conceptGraph"
    @save-concept-graph="$emit('saveConceptGraph', $event)"
  />
</template>
