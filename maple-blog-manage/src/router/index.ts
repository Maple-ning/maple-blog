import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Layout from '@/pages/Layout/index.vue';


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: {
          title: '系统首页'
        },
        component: () => import('@/pages/dashboard/index.vue'),
      },
      {
        path: 'content',
        name: 'Content',
        meta: {
          title: '内容管理',
        },
        children: [
          {
            path: '/content/publish',
            name: 'Publish',
            meta: {
              title: '我的发布',
            },
            component: () => import('@/pages/content/publish/index.vue'),
          },
          {
            path: '/content/draft',
            name: 'Draft',
            meta: {
              title: '我的草稿',
            },
            component: () => import('@/pages/content/draft/index.vue'),
          },
          {
            path: '/content/review',
            name: 'Review',
            meta: {
              title: '我的评论',
            },
            component: () => import('@/pages/content/review/index.vue'),
          },
        ]
      },
      {
        path: '404',
        name: '404',
        meta: {
          title: '页面未找到',
        },
        component: () => import('@/pages/NotFound/index.vue'),
      }
    ],
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录页'
    },
    component: () => import('@/pages/login/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | 枫叶Home`;
  const role = localStorage.getItem('username');
  if (!role && to.path !== '/login') {
    next('/login');
  } else if (to.matched.length === 0) {
    next('/404');
  } else {
    next();
  }
});

export default router;