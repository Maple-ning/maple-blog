<script setup lang="ts">
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';

import { getPostBySlug } from '@/services/posts';

const route = useRoute();
const post = ref<Awaited<ReturnType<typeof getPostBySlug>>>(undefined);

type TocItem = {
  id: string;
  text: string;
  level: 1 | 2 | 3;
};

const tocItems = ref<TocItem[]>([]);
const activeTocId = ref('');
const tocScrollContainer = ref<HTMLElement | null>(null);

const backRouteName = 'posts' as const;

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const htmlContent = computed(() => {
  const md = post.value?.content ?? '';
  const rawHtml = marked.parse(md, { async: false }) as string;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${rawHtml}</div>`, 'text/html');
  const container = doc.body.firstElementChild as HTMLDivElement | null;
  if (!container) return '';

  const usedIds = new Set<string>();
  const toc: TocItem[] = [];
  container.querySelectorAll('h1, h2, h3').forEach((node) => {
    const heading = node as HTMLHeadingElement;
    const level = Number(heading.tagName.replace('H', '')) as 1 | 2 | 3;
    const text = heading.textContent?.trim() ?? '';
    if (!text) return;

    const base = slugify(text) || 'section';
    let id = base;
    let i = 2;
    while (usedIds.has(id)) {
      id = `${base}-${i}`;
      i += 1;
    }
    usedIds.add(id);
    heading.id = id;
    toc.push({ id, text, level });
  });
  tocItems.value = toc;

  return DOMPurify.sanitize(container.innerHTML, { ADD_ATTR: ['target', 'rel', 'id'] });
});

const loadPost = async () => {
  const slug = String(route.params.slug ?? '');
  post.value = await getPostBySlug(slug);
};

const resolveScrollContainer = () =>
  document.querySelector<HTMLElement>('[data-app-scroll-container="true"]');

const updateActiveToc = () => {
  const headings = Array.from(
    document.querySelectorAll('.markdown-body h1[id], .markdown-body h2[id], .markdown-body h3[id]')
  ) as HTMLHeadingElement[];
  if (headings.length === 0) {
    activeTocId.value = '';
    return;
  }
  const container = tocScrollContainer.value;
  const checkpoint = container ? container.getBoundingClientRect().top + 110 : window.scrollY + 140;
  let current: HTMLHeadingElement | null = headings[0] ?? null;
  if (!current) {
    activeTocId.value = '';
    return;
  }
  for (const heading of headings) {
    const top = container ? heading.getBoundingClientRect().top : heading.getBoundingClientRect().top + window.scrollY;
    if (top <= checkpoint) {
      current = heading;
    } else {
      break;
    }
  }
  activeTocId.value = current.id;
};

let rafId = 0;
const onScrollOrResize = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    updateActiveToc();
    rafId = 0;
  });
};

const bindTocSpy = () => {
  tocScrollContainer.value = resolveScrollContainer();
  if (tocScrollContainer.value) {
    tocScrollContainer.value.addEventListener('scroll', onScrollOrResize, { passive: true });
  } else {
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
  }
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  onScrollOrResize();
};

const unbindTocSpy = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  if (tocScrollContainer.value) {
    tocScrollContainer.value.removeEventListener('scroll', onScrollOrResize);
    tocScrollContainer.value = null;
  } else {
    window.removeEventListener('scroll', onScrollOrResize);
  }
  window.removeEventListener('resize', onScrollOrResize);
};

const handleTocClick = (id: string) => {
  const heading = document.getElementById(id);
  if (!heading) return;
  const container = tocScrollContainer.value ?? resolveScrollContainer();
  if (container) {
    const cRect = container.getBoundingClientRect();
    const hRect = heading.getBoundingClientRect();
    const targetTop = container.scrollTop + (hRect.top - cRect.top) - 20;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  } else {
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  activeTocId.value = id;
};

onMounted(loadPost);
watch(() => route.params.slug, loadPost);
watch(
  htmlContent,
  async () => {
    await nextTick();
    unbindTocSpy();
    if (tocItems.value.length > 0) {
      bindTocSpy();
    } else {
      activeTocId.value = '';
    }
  },
  { flush: 'post' }
);
onBeforeUnmount(unbindTocSpy);
</script>

<template>
  <section v-if="post" class="nova-post-detail space-y-4">
    <div class="nova-post-detail__crumb">
      <RouterLink :to="{ name: backRouteName }">博文</RouterLink>
      <span class="nova-post-detail__crumb-sep">/</span>
      <span class="nova-post-detail__crumb-current">{{ post.title }}</span>
    </div>
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
      <a-card class="nova-post-card">
        <h1 class="nova-post-detail__title">{{ post.title }}</h1>
        <p class="nova-post-detail__date">{{ post.date }}</p>
        <div class="nova-post-detail__tags mt-3 flex flex-wrap gap-2">
          <a-tag v-for="tag in post.tags" :key="tag">{{ tag }}</a-tag>
        </div>
        <article class="markdown-body nova-post-detail__body mt-6" v-html="htmlContent" />
      </a-card>

      <div
        v-if="tocItems.length > 0"
        class="hidden xl:block xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-7rem)] xl:overflow-auto"
      >
        <a-card class="nova-post-card" title="目录">
          <div class="post-toc">
            <a
              v-for="item in tocItems"
              :key="item.id"
              :href="`#${item.id}`"
              class="post-toc-link"
              @click.prevent="handleTocClick(item.id)"
              :class="{
                'post-toc-l1': item.level === 1,
                'post-toc-l2': item.level === 2,
                'post-toc-l3': item.level === 3,
                'post-toc-active': activeTocId === item.id,
              }"
            >
              {{ item.text }}
            </a>
          </div>
        </a-card>
      </div>
    </div>
  </section>

  <a-result v-else status="404" title="博文不存在" sub-title="请检查博文链接是否正确。">
    <template #extra>
      <RouterLink :to="{ name: 'home' }">
        <a-button type="primary">返回首页</a-button>
      </RouterLink>
    </template>
  </a-result>
</template>

<style scoped>
.post-toc-link {
  display: block;
  margin: 0.35rem 0;
  overflow: hidden;
  color: var(--nova-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.post-toc-link:hover {
  color: var(--nova-accent);
}

.post-toc-active {
  color: var(--nova-accent);
  font-weight: 600;
}

.post-toc-l1 {
  padding-left: 0;
  font-weight: 600;
}

.post-toc-l2 {
  padding-left: 0.8rem;
  font-size: 0.92rem;
}

.post-toc-l3 {
  padding-left: 1.4rem;
  font-size: 0.88rem;
}

.markdown-body :deep(h1[id]),
.markdown-body :deep(h2[id]),
.markdown-body :deep(h3[id]) {
  scroll-margin-top: 6rem;
}

.nova-post-detail__tags :deep(.ant-tag) {
  border-color: var(--nova-border);
  color: var(--nova-text-muted);
  background: color-mix(in srgb, var(--nova-surface) 85%, transparent);
}
</style>
