import { createRouter, createWebHistory } from "vue-router"

import { pinia } from '@/main';
import { useUserStore } from "@/store/user";

//将路由与组件进行映射
const routes = [
    // {
    //     path: '/login',
    //     component: () => import('@/views/LogInPage.vue'),
    //     meta: { title: "登录" }
    // },
    {
        path: '/',
        redirect: '/settings', // 添加重定向规则
        component: () => import('@/views/MainPage.vue'),
        // 路由页面，格式为{path: '路径', component: 组件},meta为路由元信息，用于存储路由的额外信息
        // title为页面标题，access为页面需要的用户权限
        children: [
            { path: 'settings', component: () => import('@/views/ParameterSettings.vue'), meta: { title: "初始化", name: "RMFS-初始化" } },
            { path: 'orders', component: () => import('@/views/OrdersList.vue'), meta: { title: "订单列表", name: "RMFS-订单列表" } },
            { path: 'robots', component: () => import('@/views/RobotsList.vue'), meta: { title: "机器人列表", name: "RMFS-机器人列表" } },
            { path: 'stations', component: () => import('@/views/StationsList.vue'), meta: { title: "拣选站列表", name: "RMFS-拣选站列表" } },
            { path: 'statistics', component: () => import('@/views/StatisticsAnalysis.vue'), meta: { title: "数据分析", name: "RMFS-数据分析" } },
            { path: 'status', component: () => import('@/views/RunningStatus.vue'), meta: { title: "0号仓运行实况", name: "RMFS-0号仓运行实况" } },
            { path: 'test', component: () => import('@/views/Test.vue'), meta: { title: "测试", name: "测试" } }]
    }

]

const router = createRouter({
    history: createWebHistory(),
    // @ts-ignore
    routes: routes
})

// // 路由守卫
// router.beforeEach((to, _, next) => {
//     const userStore = useUserStore(pinia);
//     // 检查用户是否已登录，这里假设未登录时currentUser为null
//     const isLoggedIn = userStore.currentUser.token !== null;
//     // 仅在生产环境强制登录
//     const needLogIn = import.meta.env.VITE_NEED_LOG_IN === 'true' ? true : false;



//     // 如果用户未登录，且不在登录页面，重定向到登录页面
//     if (needLogIn && !isLoggedIn && to.path !== "/login") {
//         // alert('请先登录!');
//         // next('/login');
//         next();

//     }
//     // else if (to.path !== "/creation" && to.meta.access && !userStore.currentUser.access.includes(to.meta.access as string)) {
//     //     // 如果用户试图访问需要特定权限的页面，但没有这些权限，重定向到creation页面
//     //     // console.log(userStore.currentUser.access, to.meta.access);
//     //     // alert('你没有权限访问这个页面。');
//     //     // next('/creation');
//     //     next();

//     // }
//     else {
//         // 如果没有上述情况，正常导航
//         next();
//         if (to.meta.title) {
//             document.title = to.meta.name as string;
//         }
//     }
// });

export default router
