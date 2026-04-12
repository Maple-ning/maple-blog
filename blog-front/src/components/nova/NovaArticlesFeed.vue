<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getAllPublishedPosts, type PostItem } from '@/services/posts';

withDefaults(
  defineProps<{
    /** 博文列表页 h1「博文」；首页 h2，与顶部 Hero 的 h1 区分 */
    titleTag?: 'h1' | 'h2';
    /** 博文列表页卡片标题 h2；首页在 h2 区块下用 h3 */
    articleTitleTag?: 'h2' | 'h3';
  }>(),
  { titleTag: 'h1', articleTitleTag: 'h2' },
);

const keyword = ref('');
const posts = ref<PostItem[]>([]);
const router = useRouter();

type FilterPill = { kind: 'all' } | { kind: 'tag'; tag: string };

const activePill = ref<FilterPill>({ kind: 'all' });

const allTags = computed(() => {
  const set = new Set<string>();
  for (const post of posts.value) {
    for (const tag of post.tags) {
      if (tag) set.add(tag);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
});

const filteredPosts = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return posts.value.filter((post) => {
    const matchText =
      q.length === 0 ||
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q);

    if (!matchText) return false;

    const pill = activePill.value;
    if (pill.kind === 'all') return true;
    return post.tags.includes(pill.tag);
  });
});

const articleCountLabel = computed(() => `${filteredPosts.value.length} 篇`);

const estReadMinutes = (post: PostItem) => Math.max(1, Math.ceil((post.content?.length ?? 0) / 1200));

onMounted(async () => {
  posts.value = await getAllPublishedPosts();
});

const goDetail = (slug: string) => {
  void router.push({ name: 'post-detail', params: { slug } });
};

const setPillAll = () => {
  activePill.value = { kind: 'all' };
};

const setPillTag = (tag: string) => {
  activePill.value = { kind: 'tag', tag };
};

const isPillAll = computed(() => activePill.value.kind === 'all');

const isPillTag = (tag: string) => activePill.value.kind === 'tag' && activePill.value.tag === tag;
</script>

<template>
  <div class="nova-articles-feed">
    <div class="nova-section-header">
      <div class="nova-section-tag">ARTICLES</div>
      <component :is="titleTag" class="nova-section-title">博文</component>
      <p class="nova-section-desc">记录成长路上的每一步，统一为文章，按需用标签归类。</p>
    </div>

    <div class="nova-search-bar">
      <span class="select-none text-[color:var(--nova-text-muted)]" aria-hidden="true">🔍</span>
      <input
        v-model="keyword"
        class="nova-search-bar-input"
        type="search"
        placeholder="搜索博文..."
        autocomplete="off"
        aria-label="搜索博文"
      />
      <span class="nova-search-bar-count">{{ articleCountLabel }}</span>
    </div>

    <div class="nova-tag-filters" role="tablist" aria-label="博文筛选">
      <button
        type="button"
        role="tab"
        class="nova-tag-filter"
        :class="{ 'nova-tag-filter--active': isPillAll }"
        :aria-selected="isPillAll"
        @click="setPillAll"
      >
        全部
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        type="button"
        role="tab"
        class="nova-tag-filter"
        :class="{ 'nova-tag-filter--active': isPillTag(tag) }"
        :aria-selected="isPillTag(tag)"
        @click="setPillTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div class="nova-articles-list">
      <article
        v-for="post in filteredPosts"
        :key="post.slug"
        class="nova-article-card"
        tabindex="0"
        role="link"
        @click="goDetail(post.slug)"
        @keydown.enter.prevent="goDetail(post.slug)"
      >
        <div class="min-w-0">
          <div class="nova-article-tags">
            <span v-for="tag in post.tags" :key="`${post.slug}-${tag}`" class="nova-article-tag">
              {{ tag }}
            </span>
            <span v-if="post.tags.length === 0" class="nova-article-tag">未打标签</span>
          </div>
          <component :is="articleTitleTag" class="nova-article-title">{{ post.title }}</component>
          <p class="nova-article-excerpt">{{ post.summary }}</p>
          <div class="nova-article-meta">
            <span>📅 {{ post.date }}</span>
            <span>⏱ 约 {{ estReadMinutes(post) }} 分钟</span>
            <span>查看文章</span>
          </div>
        </div>
        <div class="nova-article-arrow" aria-hidden="true">›</div>
      </article>
    </div>

    <a-empty v-if="filteredPosts.length === 0" description="没有匹配的博文" />
  </div>
</template>
