import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'posts',
        name: 'posts',
        component: () => import('@/pages/posts-list/index.vue'),
        meta: { title: '博文' },
      },
      {
        path: 'posts/tech',
        redirect: { name: 'posts' },
      },
      {
        path: 'posts/review',
        redirect: { name: 'posts' },
      },
      {
        path: 'post/:slug',
        name: 'post-detail',
        component: () => import('@/pages/post-detail/index.vue'),
        meta: { title: '博文详情' },
      },
      {
        path: 'ai-note',
        name: 'ai-note',
        component: () => import('@/pages/ai-note/index.vue'),
        meta: { title: 'AI' },
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/pages/projects/index.vue'),
        meta: { title: '项目' },
      },
      {
        path: 'good-sites',
        name: 'good-sites',
        component: () => import('@/pages/good-sites/index.vue'),
        meta: { title: '友链' },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/pages/about/index.vue'),
        meta: { title: '简介' },
      },
    ],
  },
];
