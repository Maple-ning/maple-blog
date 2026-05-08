import { getGoodSitesApi } from '@/api/modules/goodSites';

export interface GoodSiteItem {
  id: number;
  title: string;
  url: string;
  description: string;
  primaryCategory: string;
  secondaryCategory: string;
  category: string;
  sortOrder: number;
}

export interface GoodSiteCategoryNode {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
  children: GoodSiteCategoryLeaf[];
}

export interface GoodSiteCategoryLeaf {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
}

export interface GoodSitesData {
  items: GoodSiteItem[];
  categoryTree: GoodSiteCategoryNode[];
}

export const getGoodSites = async (): Promise<GoodSitesData> => {
  const { items, categoryTree } = await getGoodSitesApi();
  return {
    items: items.map((item) => ({
      id: Number(item.id),
      title: String(item.title ?? ''),
      url: String(item.url ?? ''),
      description: String(item.description ?? ''),
      primaryCategory: String(item.primary_category ?? '精选友链'),
      secondaryCategory: String(item.secondary_category ?? item.category ?? ''),
      category: String(item.category ?? ''),
      sortOrder: Number(item.sort_order ?? 0),
    })),
    categoryTree: categoryTree.map((node) => ({
      id: Number(node.id),
      key: String(node.key),
      label: String(node.label),
      sortOrder: Number(node.sortOrder ?? 0),
      children: Array.isArray(node.children)
        ? node.children.map((child) => ({
            id: Number(child.id),
            key: String(child.key),
            label: String(child.label),
            sortOrder: Number(child.sortOrder ?? 0),
          }))
        : [],
    })),
  };
};
