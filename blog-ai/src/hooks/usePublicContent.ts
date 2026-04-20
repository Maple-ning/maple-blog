import { ref } from "vue";
import {
  fallbackConceptGraph,
  fallbackInsightItems,
  fallbackJourneyItems,
  fallbackJourneyStages,
  fallbackProjectItems,
  fallbackSiteProfile,
  fallbackTaxonomy,
  fetchPublicContentBundle,
} from "@/services/public-content";
import type {
  PublicConceptGraphContent,
  PublicInsightItem,
  PublicJourneyItem,
  PublicJourneyStage,
  PublicProjectItem,
  PublicSiteProfile,
  PublicTaxonomyData,
} from "@/types/public-content";

const siteProfile = ref<PublicSiteProfile>(fallbackSiteProfile);
const journeyItems = ref<PublicJourneyItem[]>(fallbackJourneyItems);
const journeyStages = ref<PublicJourneyStage[]>(fallbackJourneyStages);
const insightItems = ref<PublicInsightItem[]>(fallbackInsightItems);
const projectItems = ref<PublicProjectItem[]>(fallbackProjectItems);
const taxonomy = ref<PublicTaxonomyData>(fallbackTaxonomy);
const conceptGraph = ref<PublicConceptGraphContent>(fallbackConceptGraph);
const loading = ref(false);
const errorMessage = ref("");

let loaded = false;
let pendingPromise: Promise<void> | null = null;

async function loadContent(force = false) {
  if (loaded && !force) {
    return;
  }

  if (pendingPromise && !force) {
    return pendingPromise;
  }

  loading.value = true;
  errorMessage.value = "";

  pendingPromise = fetchPublicContentBundle()
    .then((bundle) => {
      siteProfile.value = bundle.siteProfile;
      journeyItems.value = bundle.journeyItems;
      journeyStages.value = bundle.journeyStages;
      insightItems.value = bundle.insightItems;
      projectItems.value = bundle.projectItems;
      taxonomy.value = bundle.taxonomy;
      conceptGraph.value = bundle.conceptGraph;
      loaded = true;
    })
    .catch((error) => {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : "公开接口暂时不可用，已回退到默认内容。";
      siteProfile.value = fallbackSiteProfile;
      journeyItems.value = fallbackJourneyItems;
      journeyStages.value = fallbackJourneyStages;
      insightItems.value = fallbackInsightItems;
      projectItems.value = fallbackProjectItems;
      taxonomy.value = fallbackTaxonomy;
      conceptGraph.value = fallbackConceptGraph;
    })
    .finally(() => {
      loading.value = false;
      pendingPromise = null;
    });

  return pendingPromise;
}

export function usePublicContent() {
  return {
    siteProfile,
    journeyItems,
    journeyStages,
    insightItems,
    projectItems,
    taxonomy,
    conceptGraph,
    loading,
    errorMessage,
    loadContent,
  };
}
