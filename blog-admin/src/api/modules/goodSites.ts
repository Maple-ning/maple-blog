import type {
  AdminGoodSite,
  AdminGoodSitePrimaryCategory,
} from '@/types/content';

import { http } from '../request';

export interface GoodSitesListPayload {
  items: AdminGoodSite[];
  categoryTree: AdminGoodSitePrimaryCategory[];
}

export interface UpdateGoodSiteCategoryOrderPayload {
  primaryOrder: string[];
  secondaryOrder: Array<{
    primaryCategory: string;
    order: string[];
  }>;
}

const unwrapGoodSitesBody = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>;
    if ('items' in d || 'categoryTree' in d || 'category_tree' in d) return inner;
  }
  return raw;
};

const mapRow = (row: Record<string, unknown>): AdminGoodSite => ({
  id: Number(row.id),
  title: String(row.title ?? ''),
  url: String(row.url ?? ''),
  description: String(row.description ?? ''),
  primaryCategory: String(row.primary_category ?? row.primaryCategory ?? '精选友链'),
  secondaryCategory: String(row.secondary_category ?? row.secondaryCategory ?? row.category ?? ''),
  category: String(row.category ?? ''),
  sortOrder: Number(row.sort_order ?? 0),
});

const mapCategoryTree = (raw: unknown): AdminGoodSitePrimaryCategory[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((node) => {
    const row = node as Record<string, unknown>;
    const childrenRaw = Array.isArray(row.children) ? row.children : [];
    return {
      id: Number(row.id),
      key: String(row.key ?? ''),
      label: String(row.label ?? ''),
      sortOrder: Number(row.sortOrder ?? row.sort_order ?? 0),
      children: childrenRaw.map((child) => {
        const childRow = child as Record<string, unknown>;
        return {
          id: Number(childRow.id),
          key: String(childRow.key ?? ''),
          label: String(childRow.label ?? ''),
          sortOrder: Number(childRow.sortOrder ?? childRow.sort_order ?? 0),
        };
      }),
    };
  });
};

export const getGoodSitesApi = async (): Promise<GoodSitesListPayload> => {
  const { data } = await http.get<unknown>('/profile/good-sites');
  const body = unwrapGoodSitesBody(data);
  if (Array.isArray(body)) {
    return {
      items: body.map((row) => mapRow(row as Record<string, unknown>)),
      categoryTree: [],
    };
  }
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    const rawItems = o.items;
    const items = Array.isArray(rawItems)
      ? rawItems.map((row) => mapRow(row as Record<string, unknown>))
      : [];
    const rawTree = o.categoryTree ?? o.category_tree;
    const categoryTree = mapCategoryTree(rawTree);
    return { items, categoryTree };
  }
  return { items: [], categoryTree: [] };
};

export const getGoodSiteCategoriesApi = async (): Promise<AdminGoodSitePrimaryCategory[]> => {
  const { data } = await http.get<unknown>('/profile/good-sites/categories');
  const body = unwrapGoodSitesBody(data);
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const o = body as Record<string, unknown>;
    return mapCategoryTree(o.items ?? o.categoryTree ?? o.category_tree);
  }
  return [];
};

export const updateGoodSiteCategoryOrderApi = async (
  payload: UpdateGoodSiteCategoryOrderPayload,
) => {
  const { data } = await http.put('/profile/good-sites/category-order', payload);
  return data;
};

export const createPrimaryGoodSiteCategoryApi = async (label: string) => {
  const { data } = await http.post('/profile/good-sites/categories/primary', { label });
  return data;
};

export const createSecondaryGoodSiteCategoryApi = async (
  primaryCategory: string,
  label: string,
) => {
  const { data } = await http.post('/profile/good-sites/categories/secondary', {
    primaryCategory,
    label,
  });
  return data;
};

export const deletePrimaryGoodSiteCategoryApi = async (id: number) => {
  const { data } = await http.delete(`/profile/good-sites/categories/primary/${id}`);
  return data;
};

export const deleteSecondaryGoodSiteCategoryApi = async (id: number) => {
  const { data } = await http.delete(`/profile/good-sites/categories/secondary/${id}`);
  return data;
};

export const createGoodSiteApi = async (payload: Omit<AdminGoodSite, 'id'>) => {
  const { data } = await http.post('/profile/good-sites', payload);
  return data;
};

export const updateGoodSiteApi = async (id: number, payload: Omit<AdminGoodSite, 'id'>) => {
  const { data } = await http.put(`/profile/good-sites/${id}`, payload);
  return data;
};

export const deleteGoodSiteApi = async (id: number) => {
  const { data } = await http.delete(`/profile/good-sites/${id}`);
  return data;
};
