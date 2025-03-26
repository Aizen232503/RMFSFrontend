import { createApp } from 'vue'
import './tailwind.css'
import './style.css'
import './assets/fonts/fonts.css'

import '../mock/index.ts'
import { setupProdMockServer } from '../src/mockProdServer.ts'

import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import fitPlugin from 'v-fit-columns';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import locale from 'element-plus/es/locale/lang/zh-cn';
import * as echarts from 'echarts';
window.echarts = echarts;
// 引入TechUI
// @ts-ignore
import techUILite from "techui-vue3-lite"
import vue3api from './plugins/vue3api'
import common from './plugins/common'


import 'element-plus/theme-chalk/dark/css-vars.css'
import "element-plus/theme-chalk/el-message-box.css";
import "element-plus/theme-chalk/el-message.css";

// 引入全局函数
import global from './utils/global.ts'
// 处理Chrome事件报错
// import 'default-passive-events'
const app = createApp(App)
export const pinia = createPinia().use(piniaPluginPersistedstate)
const globalFunctions = app.use(global)

// @ts-ignore
techUILite(app).then(() => {
    if (process.env.NODE_ENV === 'production') {
        setupProdMockServer();
    }
    app.use(router)
    app.use(fitPlugin)
    app.use(pinia)
    app.use(vue3api)
    app.use(common)
    app.use(ElementPlus, { locale })
    //全局组件
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
    }
    app.mount('#app')
})
export { globalFunctions }
