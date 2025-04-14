<template>
    <div class="card-wrapper">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>工况数据统计</span>
            </div>
            <el-table :data="workingConditionTable" style="width: 100%;margin-top:40px"
                :header-row-style="{ height: '100px', 'font-size': '24px', 'font-weight': 'bold' }"
                :row-style="{ height: '80px', 'font-size': '20px' }">
                <el-table-column prop="key" label="数据类型" align="center" width="auto">
                </el-table-column>
                <el-table-column prop="value" label="数值" align="center">
                </el-table-column>
            </el-table>
        </el-card>

        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>机器人阵列</span>
            </div>
            <div class="robot-grid">
                <div v-for="robot in robotsData" :key="robot.robot_id" class="robot-dot"
                    :style="{ backgroundColor: getRobotColor(robot.status) }"
                    @mouseover="(event) => showRobotDetails(robot, event)" @mouseleave="hideRobotDetails"></div>
            </div>
            <div v-if="hoveredRobot" class="robot-tooltip"
                :style="{ top: tooltipPosition.top, left: tooltipPosition.left }">
                <p>机器人ID: {{ hoveredRobot.robot_id }}</p>
                <p>机器人类型: {{ hoveredRobot.robot_type }}</p>
                <p>当前订单: {{ hoveredRobot.order_id }}</p>
                <p>所在站台: {{ hoveredRobot.station_id }}</p>
                <p>状态: {{ hoveredRobot.status }}</p>
                <p>最后刷新: {{ hoveredRobot.last_updated }}</p>
            </div>
            <el-row>
                <el-col :span="16" :offset="4">
                    <div class="flex justify-center mt-10"><el-pagination align="center" background
                            @current-change="handleCurrentPageChange" @size-change="handlePageSizeChange"
                            v-model:current-page="currentPage" :page-size="100" :pager-count="15"
                            layout="total, prev, pager, next, jumper" :total="itemsCount">
                        </el-pagination></div>
                </el-col>
            </el-row>

        </el-card>

    </div>
</template>

<script setup lang="ts" name="StatisticsAnalysis">
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUpdate, onUnmounted } from "vue"
import { useUserStore } from "@/store/user";
import eventBus from '@/utils/eventBus';
import { useRouter, useRoute } from 'vue-router';
import CustomTag from '@/components/CustomTag.vue';
import { useParamsStore } from '@/store/params'


const paramsStore = useParamsStore()
const { savedParams
} = storeToRefs(paramsStore)
import * as api from "@/api/";
const app = getCurrentInstance() as any

const route = useRoute()
const hoveredRobot = ref(null); // 当前悬浮的机器人
const tooltipPosition = ref({ top: "0px", left: "0px" }); // 工具提示位置
// 分页相关
const currentPage = ref(1);
const pageSize = ref(100);
const itemsCount = ref(0);
// 定义Ref
const robotsData = ref([]);
const workingConditionData = ref(
    {
        generateSpeed: 0,
        robotCount: 0,
        totalOrders: 0,
        workingRobots: 0,
        workingRobotsPeak: 0,
        stationCount: 0,
        assignSpeed: 0,
    }
)
const handleCurrentPageChange = (val) => {
    currentPage.value = val;
    getRobotsList();
}
// 分页大小变化
const handlePageSizeChange = (val) => {
    pageSize.value = val;
    getRobotsList();
}
// 将工况数据转换为表格格式
const workingConditionTable = computed(() => {
    return [
        { key: "任务生成速率", value: workingConditionData.value.generateSpeed },
        { key: "任务总数量", value: workingConditionData.value.totalOrders },
        { key: "机器人总数量", value: workingConditionData.value.robotCount },
        { key: "工作状态机器人数量", value: workingConditionData.value.workingRobots },
        { key: "工作状态机器人数量峰值", value: workingConditionData.value.workingRobotsPeak },
        { key: "仓储区域数量", value: workingConditionData.value.stationCount },
        { key: "任务分配速率", value: workingConditionData.value.assignSpeed },
    ];
});
// 根据机器人状态返回颜色
const getRobotColor = (status) => {
    switch (status) {
        case "空闲":
            return "#67c23a"; // 绿色
        case "忙碌":
            return "#e6a23c"; // 橙色
        case "故障":
            return "#f56c6c"; // 红色
        default:
            return "#909399"; // 灰色
    }
};
// 获取所有机器人
const getRobotsList = async () => {
    if (route.path === '/statistics') {
        try {
            const data = await api.getRobotsData(currentPage.value, pageSize.value
            );
            robotsData.value = data.results;
            itemsCount.value = data.count;
        } catch (err) {
            robotsData.value = [];
            app.proxy.$message({
                type: "error",
                message: "获取机器人数据失败",
            });
        }
    }
}
// 获取工况数据
const getWorkingCondition = async () => {
    if (route.path === '/statistics') {
        try {
            const data = await api.getWorkingConditionData(
            );
            workingConditionData.value = data.results;
            console.log('获取到的工况信息', data.results)
        } catch (err) {
            workingConditionData.value = null;
            app.proxy.$message({
                type: "error",
                message: "获取工况数据失败",
            });
        }
    }
}
// 显示机器人详情
const showRobotDetails = (robot, event) => {
    hoveredRobot.value = robot;
    tooltipPosition.value = {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`,
    };
};

// 隐藏机器人详情
const hideRobotDetails = () => {
    hoveredRobot.value = null;
};
let pollingInterval = null;
// 定时器轮询逻辑
const startPolling = () => {
    // 每隔3秒获取数据
    pollingInterval = setInterval(async () => {
        await getRobotsList();
        await getWorkingCondition();
    }, 3000);
};

// 清除定时器
const stopPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
};

// 生命周期钩子
onMounted(() => {
    // 初始化时获取数据
    getRobotsList();
    getWorkingCondition();
    // 启动轮询
    startPolling();
});

onUnmounted(() => {
    // 组件卸载时清除定时器
    stopPolling();
});
</script>

<style scoped lang="less">
.card-wrapper {
    display: flex;
    /* 使用 flexbox 布局 */
    justify-content: space-between;
    /* 子元素之间的间距 */
    align-items: flex-start;
    /* 子元素顶部对齐 */
    flex-wrap: wrap;
    /* 如果空间不足，允许换行 */
    gap: 20px;
    /* 卡片之间的间距 */
}

.box-card {
    width: 700px;
    height: 800px; // 设置卡片的高度
    margin: 20px auto;
    padding: 30px; // 增大内边距
    background: rgba(255, 255, 255, 0.1);
    background-clip: padding-box;
    box-decoration-break: clone;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 15px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.3s ease;

}


.clearfix {
    font-size: 2.5em;
    font-family: 'AliHYAiHei';
    font-weight: bold;
    color: #fff;
    margin-bottom: 30px;
}

.robot-grid {
    display: grid;
    grid-template-columns: repeat(10, 36px);
    /* 每行固定显示 10 个点，点宽度为 36px */
    gap: 24px;
    /* 设置行间距和列间距相等 */
    justify-content: center;
    /* 水平居中 */
    margin-top: 70px;
}

.robot-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.robot-dot:hover {
    transform: scale(1.2);
    /* 鼠标悬浮时放大 */
}

.robot-tooltip {
    position: fixed;
    background: rgba(44, 44, 44, 0.8);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    pointer-events: none;
    z-index: 1000;
    width: 300px;
}

.statistics-bar {
    height: auto
}

.el-table th {
    display: table-cell !important;
}

.el-table {
    --el-table-header-bg-color: rgba(1, 10, 18, 0.05);
    --el-table-tr-bg-color: rgba(1, 10, 18, 0.05);
}

.el-table :deep(.cell) {
    padding: 0 !important
}

:deep(.el-collapse) {
    border: none;
    box-shadow: none;
}

:deep(.el-collapse-item__header) {
    border: none;
    outline: none
}

:deep(.el-collapse-item__header:focus) {
    border: none;
    outline: none
}

:deep(.el-collapse-item__content) {
    padding-top: 5px;
    padding-bottom: 5px;
}

:deep(.centered-input .el-input__inner) {
    text-align: center;
}

:deep(tr td.el-table-fixed-column--left),
:deep(tr td.el-table-fixed-column--right) {
    background-color: rgba(1, 10, 18, 1) !important
}
</style>