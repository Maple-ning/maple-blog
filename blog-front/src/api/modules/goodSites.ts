import { http } from '../request';

import type { GoodSiteApiItem, GoodSiteCategoryTreeApiItem } from '../types';

export interface GoodSitesApiPayload {
  items: GoodSiteApiItem[];
  categoryTree: GoodSiteCategoryTreeApiItem[];
}

const unwrapBody = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    const inner = obj.data as Record<string, unknown>;
    if ('items' in inner || 'categoryOrder' in inner || 'category_order' in inner) return inner;
  }
  return raw;
};

export const getGoodSitesApi = async (): Promise<GoodSitesApiPayload> => {
  const { data } = await http.get<unknown>('/profile/good-sites');
  const body = unwrapBody(data);
  if (Array.isArray(body)) {
    return { items: body as GoodSiteApiItem[], categoryTree: [] };
  }
  if (!body || typeof body !== 'object') {
    return { items: [], categoryTree: [] };
  }
  const obj = body as Record<string, unknown>;
  const items = Array.isArray(obj.items) ? (obj.items as GoodSiteApiItem[]) : [];
  const rawTree = obj.categoryTree ?? obj.category_tree;
  const categoryTree = Array.isArray(rawTree) ? (rawTree as GoodSiteCategoryTreeApiItem[]) : [];
  return { items, categoryTree };
};
