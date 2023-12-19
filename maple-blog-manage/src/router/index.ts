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
    children:[
      {
        path:'dashboard',
        name:'Dashboard',
        meta: {
          title:'系统首页'
        },
        component: () => import('@/pages/dashboard/index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router;