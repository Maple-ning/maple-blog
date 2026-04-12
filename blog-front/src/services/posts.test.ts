import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPublishedPostsApi } from '@/api/modules/posts';
import { getPostBySlug, loadPosts } from '@/services/posts';

vi.mock('@/api/modules/posts', () => ({
  getPublishedPostsApi: vi.fn(),
}));

describe('posts service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes payload and reuses cache', async () => {
    vi.mocked(getPublishedPostsApi).mockResolvedValue([
      {
        id: 2,
        title: 'second',
        summary: 's2',
        content: 'c2',
        tags: ['book'],
        date: '2026-01-01T10:00:00.000Z',
        status: 'published',
      },
      {
        id: 1,
        title: 'first',
        summary: 's1',
        content: 'c1',
        tags: '["vue","ts"]',
        date: '2026-02-01T10:00:00.000Z',
        status: 'published',
      },
    ]);

    const allPosts = await loadPosts();
    const post = await getPostBySlug('1');

    expect(getPublishedPostsApi).toHaveBeenCalledTimes(1);
    expect(allPosts.map((item) => item.id)).toEqual([1, 2]);
    expect(allPosts.find((p) => p.id === 1)?.tags).toEqual(['vue', 'ts']);
    expect(post?.title).toBe('first');
  });
});
