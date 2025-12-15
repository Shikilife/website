import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 1. 引入 css (維持你原本的路徑)
import './assets/main.css'
import "./styles/persona.css";

// ✅ 2. 新增：引入粒子特效套件
import Particles from "vue3-particles";

const app = createApp(App)

app.use(createPinia())
app.use(router)

// ✅ 3. 新增：註冊粒子特效插件
app.use(Particles);

app.mount('#app')