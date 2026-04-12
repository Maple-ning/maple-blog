import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: { title: '概览' },
      },
      {
        path: 'posts/tech',
        redirect: { name: 'manage-posts' },
      },
      {
        path: 'posts/review',
        redirect: { name: 'manage-posts' },
      },
      {
        path: 'posts',
        name: 'manage-posts',
        component: () => import('@/pages/manage-posts/index.vue'),
        meta: { title: '博文管理' },
      },
      {
        path: 'projects',
        name: 'manage-projects',
        component: () => import('@/pages/manage-projects/index.vue'),
        meta: { title: '项目展示管理' },
      },
      {
        path: 'good-sites',
        name: 'manage-good-sites',
        component: () => import('@/pages/manage-good-sites/index.vue'),
        meta: { title: '好站管理' },
      },
      {
        path: 'about',
        name: 'manage-about',
        component: () => import('@/pages/manage-about/index.vue'),
        meta: { title: '关于我管理' },
      },
    ],
  },
];
