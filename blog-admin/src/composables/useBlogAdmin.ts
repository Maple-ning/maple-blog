import { ref } from 'vue';

import {
  createPrimaryGoodSiteCategoryApi,
  createSecondaryGoodSiteCategoryApi,
  createGoodSiteApi,
  deletePrimaryGoodSiteCategoryApi,
  deleteSecondaryGoodSiteCategoryApi,
  deleteGoodSiteApi,
  getGoodSiteCategoriesApi,
  getGoodSitesApi,
  updateGoodSiteApi,
  updateGoodSiteCategoryOrderApi,
} from '@/api/modules/goodSites';
import { createPostApi, deletePostApi, getPostsApi, updatePostApi } from '@/api/modules/posts';
import { getProfileApi, saveProfileApi } from '@/api/modules/profile';
import {
  createProjectApi,
  deleteProjectApi,
  getProjectsApi,
  updateProjectApi,
} from '@/api/modules/projects';
import type {
  AboutProfile,
  AdminGoodSite,
  AdminGoodSitePrimaryCategory,
  AdminPost,
  AdminProject,
  PostStatus,
} from '@/types/content';

const posts = ref<AdminPost[]>([]);
const projects = ref<AdminProject[]>([]);
const goodSites = ref<AdminGoodSite[]>([]);
const goodSiteCategoryTree = ref<AdminGoodSitePrimaryCategory[]>([]);
const about = ref<AboutProfile>({
  name: '',
  tagline: '',
  intro: '',
  focusPoints: [],
  email: '',
  github: '',
  siteAbout: '',
});
const initialized = ref(false);
let pendingInit: Promise<void> | null = null;

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizePost = (item: unknown): AdminPost => {
  const o = item as Record<string, unknown>;
  return {
    id: Number(o.id),
    title: String(o.title ?? ''),
    summary: String(o.summary ?? ''),
    content: String(o.content ?? ''),
    tags: toStringArray(o.tags),
    date: String(o.date ?? '').slice(0, 10),
    status: o.status === 'published' ? 'published' : 'draft',
  };
};

const normalizeProject = (item: unknown): AdminProject => {
  const o = item as Record<string, unknown>;
  return {
    id: Number(o.id),
    name: String(o.name ?? ''),
    description: String(o.description ?? ''),
    url: String(o.url ?? ''),
    sourceCodeUrl: String(o.source_code_url ?? o.sourceCodeUrl ?? ''),
    techStack: toStringArray(o.tech_stack),
  };
};

const loadAll = async () => {
  const [postsRes, projectsRes, profileRes, goodSitesRes] = await Promise.all([
    getPostsApi(),
    getProjectsApi(),
    getProfileApi(),
    getGoodSitesApi(),
  ]);
  posts.value = postsRes.map(normalizePost);
  projects.value = projectsRes.map(normalizeProject);
  goodSites.value = Array.isArray(goodSitesRes.items) ? goodSitesRes.items : [];
  goodSiteCategoryTree.value = Array.isArray(goodSitesRes.categoryTree)
    ? goodSitesRes.categoryTree
    : [];

  if (profileRes) {
    const p = profileRes as unknown as Record<string, unknown>;
    about.value = {
      name: String(p.name ?? ''),
      tagline: String(p.tagline ?? ''),
      intro: String(p.intro ?? ''),
      focusPoints: toStringArray(p.focus_points ?? p.focusPoints),
      email: String(p.email ?? ''),
      github: String(p.github ?? ''),
      siteAbout: String(p.site_about ?? p.siteAbout ?? ''),
    };
  }
};

const ensureInit = async () => {
  if (initialized.value) return;
  if (pendingInit) return pendingInit;
  pendingInit = loadAll().finally(() => {
    pendingInit = null;
  });
  await pendingInit;
  initialized.value = true;
};

export const useBlogAdmin = () => {
  const init = () => ensureInit();

  const upsertPost = async (payload: Omit<AdminPost, 'id'> & { id?: number }) => {
    if (payload.id) {
      await updatePostApi(payload.id, payload);
    } else {
      await createPostApi(payload);
    }
    await loadAll();
  };

  const deletePost = async (id: number) => {
    await deletePostApi(id);
    await loadAll();
  };

  const upsertProject = async (payload: Omit<AdminProject, 'id'> & { id?: number }) => {
    if (payload.id) {
      await updateProjectApi(payload.id, payload);
    } else {
      await createProjectApi(payload);
    }
    await loadAll();
  };

  const deleteProject = async (id: number) => {
    await deleteProjectApi(id);
    await loadAll();
  };

  const upsertGoodSite = async (payload: Omit<AdminGoodSite, 'id'> & { id?: number }) => {
    if (payload.id) {
      await updateGoodSiteApi(payload.id, payload);
    } else {
      await createGoodSiteApi(payload);
    }
    await loadAll();
  };

  const deleteGoodSite = async (id: number) => {
    await deleteGoodSiteApi(id);
    await loadAll();
  };

  const deletePrimaryGoodSiteCategory = async (id: number) => {
    await deletePrimaryGoodSiteCategoryApi(id);
    await loadAll();
  };

  const deleteSecondaryGoodSiteCategory = async (id: number) => {
    await deleteSecondaryGoodSiteCategoryApi(id);
    await loadAll();
  };

  const createPrimaryGoodSiteCategory = async (label: string) => {
    await createPrimaryGoodSiteCategoryApi(label);
    await loadAll();
  };

  const createSecondaryGoodSiteCategory = async (primaryCategory: string, label: string) => {
    await createSecondaryGoodSiteCategoryApi(primaryCategory, label);
    await loadAll();
  };

  const saveGoodSiteCategoryOrder = async (payload: {
    primaryOrder: string[];
    secondaryOrder: Array<{ primaryCategory: string; order: string[] }>;
  }) => {
    await updateGoodSiteCategoryOrderApi(payload);
    await loadAll();
  };

  const refreshGoodSiteCategories = async () => {
    goodSiteCategoryTree.value = await getGoodSiteCategoriesApi();
  };

  const saveAbout = async (payload: AboutProfile) => {
    await saveProfileApi(payload);
    await loadAll();
  };

  const postsByStatus = (status: PostStatus) =>
    posts.value.filter((item) => item.status === status);

  return {
    posts,
    projects,
    goodSites,
    goodSiteCategoryTree,
    about,
    init,
    loadAll,
    postsByStatus,
    upsertPost,
    deletePost,
    upsertProject,
    deleteProject,
    upsertGoodSite,
    deleteGoodSite,
    deletePrimaryGoodSiteCategory,
    deleteSecondaryGoodSiteCategory,
    createPrimaryGoodSiteCategory,
    createSecondaryGoodSiteCategory,
    saveGoodSiteCategoryOrder,
    refreshGoodSiteCategories,
    saveAbout,
  };
};
