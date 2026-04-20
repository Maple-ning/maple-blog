<script setup lang="ts">
import { computed, defineAsyncComponent, defineComponent, h } from "vue";
import { siteIdentity } from "@/config/site";
import { usePublicContent } from "@/hooks/usePublicContent";
import { openExternalLink } from "@/utils/externalLink";
import { formatDate } from "@/utils/format";

const { conceptGraph, insightItems, journeyItems, projectItems } = usePublicContent();

const ConceptGraphFallback = defineComponent({
  name: "ConceptGraphFallback",
  setup() {
    return () =>
      h("div", { class: "home-graph-fallback" }, [
        h("div", { class: "home-graph-fallback__glow home-graph-fallback__glow--1" }),
        h("div", { class: "home-graph-fallback__glow home-graph-fallback__glow--2" }),
        h("div", { class: "home-graph-fallback__content" }, [
          h("span", { class: "home-graph-fallback__eyebrow" }, "AI 知识网络"),
          h("h1", { class: "home-graph-fallback__title" }, "概念图谱加载中"),
          h(
            "p",
            { class: "home-graph-fallback__desc" },
            "首页 Banner 正在连接远程组件，稍候会展示完整的 AI 概念网络。",
          ),
        ]),
      ]);
  },
});

const MapleRemoteConceptGraph = defineAsyncComponent({
  loader: () => import("mapleShares/ConceptGraph"),
  delay: 120,
  timeout: 8000,
  loadingComponent: ConceptGraphFallback,
  errorComponent: ConceptGraphFallback,
});

const latestContent = computed(() => {
  const blocks = [
    {
      tagClass: "tag--blue",
      label: "学习笔记",
      item: journeyItems.value[0],
      href: journeyItems.value[0]
        ? `#/journey/${journeyItems.value[0].id}`
        : "#/journey",
      emptyTitle: "还没有发布学习笔记",
      emptySummary: "后台保存并发布后，这里会自动展示最新学习内容。",
      meta: (value: string) => [formatDate(value), "内容同步中"],
    },
    {
      tagClass: "tag--purple",
      label: "AI资讯",
      item: insightItems.value[0],
      href: insightItems.value[0]
        ? `#/insights/${insightItems.value[0].id}`
        : "#/insights",
      emptyTitle: "还没有发布资讯",
      emptySummary: "已发布的 AI 资讯会直接展示在这里。",
      meta: (value: string) => [formatDate(value), "公开内容"],
    },
    {
      tagClass: "tag--green",
      label: "项目分享",
      item: projectItems.value[0],
      href: projectItems.value[0]
        ? projectItems.value[0].sourceUrl ||
          projectItems.value[0].githubUrl ||
          "#/projects"
        : "#/projects",
      emptyTitle: "还没有发布项目",
      emptySummary: "项目发布后会自动进入前台展示。",
      meta: (value: string) => [formatDate(value), "项目卡片"],
    },
  ];

  return blocks.map((block) => ({
    tagClass: block.tagClass,
    label: block.label,
    href: block.href,
    isExternal: block.label === "项目分享" && /^https?:\/\//.test(block.href),
    title: block.item?.title || block.emptyTitle,
    excerpt: block.item?.summary || block.emptySummary,
    meta: block.meta(
      block.label === "AI资讯"
        ? block.item && "publishedAt" in block.item
          ? block.item.publishedAt || block.item.updatedAt
          : ""
        : block.item?.updatedAt || "",
    ),
  }));
});

function openMaybeExternal(item: {
  href: string;
  isExternal?: boolean;
  title: string;
}) {
  if (item.isExternal) {
    openExternalLink(item.href, item.title);
    return;
  }

  window.location.hash = item.href.replace(/^#/, "");
}

function openBlogHome() {
  openExternalLink(siteIdentity.blogHomeUrl, "博客首页");
}
</script>

<template>
  <div>
    <section class="hero hero--graph">
      <div class="hero-graph-wrap">
        <MapleRemoteConceptGraph
          :data="conceptGraph"
          :show-header="false"
          :show-toolbox="false"
          :footer-tip="''"
          height="640px"
          initial-info-title="AI 概念网络"
          initial-info-text="悬浮节点或连线，查看 AI 能力之间的关系与协作方式。"
          initial-info-hint="聚焦模型、智能体、协议与工具链之间的连接。"
        />
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">内容入口</h2>
            <p class="section-desc">围绕学习、资讯、项目三个方向持续更新</p>
          </div>
        </div>
        <div class="grid grid--4">
          <a href="#/journey" class="feature-card">
            <div class="feature-icon feature-icon--blue">📚</div>
            <h3 class="feature-title">学习历程</h3>
            <p class="feature-desc">按阶段整理笔记和实践总结，聚焦知识积累。</p>
            <span class="feature-link">进入学习历程 →</span>
          </a>
          <a href="#/insights" class="feature-card">
            <div class="feature-icon feature-icon--purple">📰</div>
            <h3 class="feature-title">AI资讯</h3>
            <p class="feature-desc">记录值得关注的 AI 动态和自己的观察。</p>
            <span class="feature-link">进入资讯列表 →</span>
          </a>
          <a href="#/projects" class="feature-card">
            <div class="feature-icon feature-icon--green">🚀</div>
            <h3 class="feature-title">项目分享</h3>
            <p class="feature-desc">展示项目卡片、技术栈和项目链接。</p>
            <span class="feature-link">进入项目列表 →</span>
          </a>
          <a href="" class="feature-card" @click.prevent="openBlogHome">
            <div class="feature-icon feature-icon--orange">⚙️</div>
            <h3 class="feature-title">博客首页</h3>
            <p class="feature-desc">返回主博客，查看更多公开内容与其它栏目。</p>
            <span class="feature-link">返回博客首页 →</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section section--gray">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新内容</h2>
        </div>
        <div class="grid grid--3">
          <a
            v-for="item in latestContent"
            :key="item.label"
            href=""
            class="post-card"
            @click.prevent="openMaybeExternal(item)"
          >
            <div class="post-tag" :class="item.tagClass">{{ item.label }}</div>
            <h3 class="post-title">{{ item.title }}</h3>
            <p class="post-excerpt">{{ item.excerpt }}</p>
            <div class="post-meta">
              <span v-for="meta in item.meta" :key="meta">{{ meta }}</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最近学习记录</h2>
          <a href="#/journey" class="section-more">查看全部 →</a>
        </div>
        <div class="timeline">
          <div
            v-for="item in journeyItems.slice(0, 3)"
            :key="item.id"
            class="timeline-item"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">{{ item.stage }}</span>
              <h4>
                <a :href="`#/journey/${item.id}`">{{ item.title }}</a>
              </h4>
              <p>{{ item.summary }}</p>
            </div>
          </div>
          <div v-if="!journeyItems.length" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">等待内容发布</span>
              <h4>学习笔记将在这里展示</h4>
              <p>后台发布学习内容后，首页时间线会自动更新。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero--graph {
  padding: 0 0 2rem;
}

.hero-graph-wrap {
  position: relative;
  width: 100%;
}

.hero-graph-wrap :deep(.maple-concept-graph) {
  border-radius: 1.75rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.14),
    0 8px 24px rgba(15, 23, 42, 0.08);
}

.home-graph-fallback {
  position: relative;
  min-height: 640px;
  border-radius: 1.75rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background:
    radial-gradient(circle at 18% 20%, rgba(56, 189, 248, 0.18), transparent 30%),
    radial-gradient(circle at 82% 24%, rgba(129, 140, 248, 0.18), transparent 28%),
    linear-gradient(135deg, #0b1120 0%, #111c34 52%, #0f172a 100%);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.14),
    0 8px 24px rgba(15, 23, 42, 0.08);
}

.home-graph-fallback__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(72px);
  opacity: 0.42;
}

.home-graph-fallback__glow--1 {
  top: 8%;
  left: 8%;
  width: 220px;
  height: 220px;
  background: rgba(34, 211, 238, 0.34);
}

.home-graph-fallback__glow--2 {
  right: 10%;
  bottom: 12%;
  width: 240px;
  height: 240px;
  background: rgba(99, 102, 241, 0.3);
}

.home-graph-fallback__content {
  position: relative;
  z-index: 1;
  min-height: 640px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.home-graph-fallback__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.2);
  background: rgba(8, 15, 31, 0.42);
  color: rgba(186, 230, 253, 0.92);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-graph-fallback__title {
  font-size: clamp(2rem, 5vw, 3.75rem);
  line-height: 1.08;
  color: #f8fafc;
}

.home-graph-fallback__desc {
  max-width: 640px;
  color: rgba(226, 232, 240, 0.8);
  font-size: 1rem;
  line-height: 1.85;
}

@media (max-width: 768px) {
  .hero--graph {
    padding: 0 0 1.5rem;
  }

  .hero-graph-wrap :deep(.maple-concept-graph),
  .home-graph-fallback {
    border-radius: 1.25rem;
  }

  .home-graph-fallback,
  .home-graph-fallback__content {
    min-height: 520px;
  }
}
</style>
