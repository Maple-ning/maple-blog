<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="sidebar.collapse"
      background-color="#fff"
      text-color="#333"
      active-text-color="#20a0ff"
      unique-opened
      router
    >
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-sub-menu :index="item.index" :key="item.index">
            <template #title>
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-sub-menu
                v-if="subItem.subs"
                :index="subItem.index"
                :key="subItem.index"
              >
                <template #title>{{ subItem.title }}</template>
                <el-menu-item
                  v-for="(threeItem, i) in subItem.subs"
                  :key="i"
                  :index="threeItem.index"
                >
                  {{ threeItem.title }}
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :key="subItem.index" :index="subItem.index">
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useSidebarStore } from "@/store/sidebar";

const items = [
  {
    icon: "Odometer",
    index: "/dashboard",
    title: "系统首页",
    permiss: "1",
  },
  {
    icon: "CoffeeCup",
    index: "/content",
    title: "内容管理",
    subs: [
      {
        index: "/content/publish",
        title: "我的发布",
        permiss: "2",
      },
      {
        index: "/content/draft",
        title: "我的草稿",
        permiss: "2",
      },
      {
        index: "/content/review",
        title: "我的评论",
        permiss: "2",
      },
    ],
  },
  {
    icon: "CoffeeCup",
    index: "/data",
    title: "我的数据",
    subs: [
      {
        index: "/data/article",
        title: "文章数据",
      },
      {
        index: "/data/weekend",
        title: "一周小结",
      },
    ],
  },
];

const route = useRoute();
const onRoutes = computed(() => {
  return route.path;
});
const sidebar = useSidebarStore();
</script>

<style scoped>
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 200px;
}
.sidebar > ul {
  height: 100%;
}
</style>
