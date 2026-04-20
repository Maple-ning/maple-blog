<script setup lang="ts">
import type { AdminPostEntry } from "@/types/content";

defineProps<{
  stats: Array<{ icon: string; value: string | number; label: string; color: string; bg: string; trend: string; trendClass: string }>;
  contentDistribution: Array<{ label: string; count: number; width: string; color: string }>;
  recentEntries: AdminPostEntry[];
  routeHref: (path: string) => string;
}>();

const emit = defineEmits<{
  editEntry: [entry: AdminPostEntry];
}>();
</script>

<template>
  <section class="admin-panel-stack">
    <div class="stats-grid">
      <div v-for="item in stats" :key="item.label" class="stat-card">
        <div class="stat-card-icon" :style="{ background: item.bg }">{{ item.icon }}</div>
        <div class="stat-card-info">
          <div class="stat-card-num" :style="{ color: item.color }">{{ item.value }}</div>
          <div class="stat-card-label">{{ item.label }}</div>
          <div class="stat-card-trend" :class="item.trendClass">{{ item.trend }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">最近更新</span></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>标题</th><th>分类</th><th>状态</th><th>更新时间</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="entry in recentEntries.slice(0, 8)" :key="entry.id">
                <td class="dashboard-table__title">{{ entry.title || '未命名内容' }}</td>
                <td><span class="post-tag" :class="entry.categoryClass">{{ entry.category }}</span></td>
                <td><span class="badge" :class="entry.status === 'published' ? 'badge--green' : 'badge--orange'">{{ entry.status === 'published' ? '已发布' : '草稿' }}</span></td>
                <td class="dashboard-table__date">{{ entry.date }}</td>
                <td><button class="btn btn--ghost btn--sm" type="button" @click="emit('editEntry', entry)">编辑</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-panel-stack">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">前台三块内容数量</span></div>
          <div class="panel-body dashboard-distribution">
            <div v-for="item in contentDistribution" :key="item.label">
              <div class="dashboard-distribution__head">
                <span>{{ item.label }}</span>
                <span class="dashboard-distribution__count">{{ item.count }}</span>
              </div>
              <div class="dashboard-distribution__track">
                <div :style="`width:${item.width};height:100%;background:${item.color};border-radius:9999px;`"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><span class="panel-title">进入对应后台页</span></div>
          <div class="panel-body dashboard-links">
            <a :href="routeHref('/journey')" class="btn btn--outline dashboard-links__item">学习历程（#/journey）</a>
            <a :href="routeHref('/insights')" class="btn btn--outline dashboard-links__item">AI资讯（#/insights）</a>
            <a :href="routeHref('/projects')" class="btn btn--outline dashboard-links__item">项目分享（#/projects）</a>
            <a :href="routeHref('/site')" class="btn btn--primary dashboard-links__item">站点设置（全站）</a>
            <a href="/ai/" target="_blank" class="btn btn--ghost dashboard-links__item">打开 AI探索站前台</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
