import { createRouter, createWebHistory } from "vue-router";
import Ref from "@/pages/Ref/index.vue";
import Reactive from "@/pages/Reactive/index.vue";
import NotFound from "@/pages/error/404.vue";

const routes = [
  { path: "/", component: Ref },
  { path: "/reactive", component: Reactive },
  { path: "/:path(.*)", component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;