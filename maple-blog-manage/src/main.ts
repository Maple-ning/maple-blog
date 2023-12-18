import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"

import "@/styles/index.scss";
import "@/styles/constant.scss";
import "@/styles/variables.module.scss";


createApp(App).use(router).mount('#app')
