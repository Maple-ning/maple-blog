import { getPublishedPostsApi } from '@/api/modules/posts';

export interface PostItem {
  id: number;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  status: 'draft' | 'published';
  summary: string;
  content: string;
}

let postsCache: PostItem[] | null = null;

const sortByDateDesc = (items: PostItem[]): PostItem[] =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

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

export const loadPosts = async (): Promise<PostItem[]> => {
  if (postsCache) return postsCache;

  const payload = await getPublishedPostsApi();
  const entries = payload.map(
    (item) =>
      ({
        id: Number(item.id),
        title: String(item.title ?? ''),
        slug: String(item.id),
        date: String(item.date ?? '').slice(0, 10),
        tags: toStringArray(item.tags),
        status: item.status === 'published' ? 'published' : 'draft',
        summary: String(item.summary ?? ''),
        content: String(item.content ?? ''),
      }) satisfies PostItem
  );

  postsCache = sortByDateDesc(entries);
  return postsCache;
};

export const getAllPublishedPosts = async (): Promise<PostItem[]> => loadPosts();

export const getPostBySlug = async (slug: string): Promise<PostItem | undefined> => {
  const posts = await loadPosts();
  return posts.find((post) => post.slug === slug);
};
