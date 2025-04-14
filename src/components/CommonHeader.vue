<template>
    <div class="header-container">
        <systemTitleA3 :config="titleConfig" style="left:1060px !important">{{ route.meta.title }}</systemTitleA3>
        <div class="title">

        </div>
        <!-- <div class="r-content">
            <el-dropdown trigger="click">
                <h3>{{ userStore.currentUser ?
                    `当前用户：${userStore.currentUser.info.apply_id}（${userStore.currentUser.info.apply_user_type}）` : "未登录"
                    }}
                </h3>
                <template #dropdown>
                    <div class="flex flex-col justify-center items-center">
                            <el-dropdown-item>
                                <h3>{{ userStore.currentUser ?
                                    `${userStore.currentUser.info.apply_user_type}${userStore.currentUser.info.apply_id}`
                                    : "未登录"
                                    }}
                                </h3>
                            </el-dropdown-item>
                        </div>
                </template>
</el-dropdown>
</div> -->
    </div>

</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/user";
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()
import * as api from "@/api/";
const app = getCurrentInstance() as any

const userStore = useUserStore()
const titleConfig = reactive(
    {
        scale: .8,
        gradientReverse: true,
        decoration: false,
        decorationColorAlt: true,
    }
)

</script>

<style lang="less" scoped>
:deep(.systemTitleA3) {
    left: 1080px
}

:deep(.system-name) {
    font-size: 30px;
    font-family: "AliHYAiHei";
}

.header-container {
    padding: 0 20px;
    height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .text {
        color: #fff;
        font-size: 14px;
        margin-left: 10px;
    }

    .r-content {
        display: flex;

        h3 {
            color: #fff;

            line-height: 40px;
            margin-right: 20px;
        }

        .user {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
    }
}
</style>