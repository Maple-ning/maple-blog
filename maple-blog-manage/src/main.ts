import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from "./router"
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';

import 'element-plus/dist/index.css';
import "@/assets/styles/index.scss";
import "@/assets/styles/constant.scss";
import "@/assets/styles/variables.module.scss";

const app = createApp(App);

// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(router);
app.use(createPinia());
app.use(ElementPlus);
app.mount('#app')
