<template>

    <el-menu :default-active="activeMenuIndex" class="el-menu-vertical-demo" router>
        <aYinTechBorderB2 :config="borderConfig">
            <!-- 插入校徽 -->

            <p class="title">移动机器人履约<br>订单分配系统</p>
            <div class="logo-container">
                <img class='logo' src="@/assets/校徽.png" alt="校徽" />
                <span class='text'>上海交通大学<br>复杂网络与控制实验室</span>
            </div>
            <template :index="item.path" v-for="item in menuData">
                <template v-if="item?.children">
                    <el-sub-menu class="menu-item" :index="item.path">
                        <template #title>
                            <el-icon>
                                <Component :is="item.icon" />
                            </el-icon><span class="item-label">{{ item.label }}</span>
                        </template>
                        <el-menu-item :index="child.path" v-for="child in item.children">
                            <el-icon class="child-icon">
                                <Component :is="child.icon" />
                            </el-icon><span class="child-label">{{ child.label }}</span>
                        </el-menu-item>
                    </el-sub-menu>

                </template>
                <template v-else>
                    <el-menu-item class="menu-item" :index="item.path">
                        <el-icon>
                            <Component :is="item.icon" />
                        </el-icon><span class="item-label">{{ item.label }}</span>
                    </el-menu-item>
                </template>
            </template>
        </aYinTechBorderB2>
    </el-menu>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from "@/store/user";

const activeMenuIndex = computed(() => route.path)
const titleConfig = reactive(
    {
        scale: .4,
        gradientReverse: true,
        decoration: false,
        decorationColorAlt: true,
    }
)
const borderConfig = reactive(
    {
        borderWidth: 3,
        decoration: false,
        // border: false
    })
const buttonConfig = reactive(
    {
        decorationColorAlt: true,
        scaleAction: false,
        decorationLength: 19,
        glow: true,
        caretDistance: 5,
        caretWidth: 5,
        normal: { fc: "#ffffff" },
        active: { fc: "#75d1f0" }
    }
)
const route = useRoute()
const menuData = [
    {
        path: "/settings",
        name: "ParameterSettings",
        label: "初始化",
        icon: "Setting",
    },
    {
        name: "StatisticsCollection",
        label: "数据收集",
        icon: "Collection",
        path: "/collection",
        children: [
            {
                path: "/orders",
                name: "OrdersList",
                label: "订单列表",
                icon: "Document",
            },
            {
                path: "/robots",
                name: "RobotsList",
                label: "机器人列表",
                icon: "Van",
            },
            {
                path: "/stations",
                name: "StationsList",
                label: "拣选站列表",
                icon: "OfficeBuilding",
            }
        ]
    },
    {
        path: "/statistics",
        name: "StatisticsAnalysis",
        label: "数据分析",
        icon: "Histogram",
    },
]
const currentUser = useUserStore().currentUser
// const validMenuData = computed(() => {
//     // 检查 currentUser.access 是否存在且不为空数组
//     if (currentUser.access && currentUser.access.length > 0) {
//         return menuData.filter(item => currentUser.access.includes(item.name));
//     } else {
//         // 如果 currentUser.access 不存在或为空数组，则返回空数组
//         return [];
//     }
// })
</script>

<style lang="less" scoped>
.title {
    font-size: 24px;
    line-height: 1.5;
    font-family: "AliHYAiHei";
    text-align: center;
    margin-top: 20px;
    margin-bottom: 20px;
    font-weight: bold;
}

.logo-container {
    display: flex;
    /* 使用 flexbox 布局 */
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
    margin: 0 0;

    .logo {
        width: 80px;
        /* 校徽宽度 */
        height: auto;
        margin-right: 5px;
        /* 校徽与文字之间的间距 */
    }

    .text {
        white-space: normal;
        /* 允许文字换行 */
    }
}

.el-menu {
    h3 {
        text-align: center;
        line-height: 40px;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    border-right: 0;
}

.item-icon {
    font-size: 16px;
}

.item-label {
    font-size: 16px;
    font-family: 'AliHYAiHei';

    &.is-active {
        font-weight: bold;
    }
}

.child-icon {
    font-size: 14px;
}

.child-label {
    font-size: 14px;
    font-family: 'AliHYAiHei';

    &.is-active {
        font-weight: bold;
    }
}

.el-submenu {
    height: auto;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 240px;
    height: 100vh;
    min-height: 400px;
}

.el-menu--collapse {
    height: 100vh;
}


.menu-item:not(:first-child) {
    margin-top: 40px;
}

.menu-item:first-of-type {
    margin-top: 40px;
}
</style>