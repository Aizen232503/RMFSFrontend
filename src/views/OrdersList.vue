<template>
  <el-table ref="tableRef" :data="tableData" :row-key="getRowKey" max-height="800"
    style="width:90%;margin-top:100px;margin:auto" scrollbar-always-on header-align="center" stripe>

    <!-- <el-table-column type="selection" prop="selection" width="30" align="center" header-align="center"
      reserve-selection>
    </el-table-column> -->

    <el-table-column type="index" prop="index" label="序号" width="50" align="center" header-align="center">
    </el-table-column>


    <el-table-column prop="order_id" width="250" label="订单ID" align="center">
    </el-table-column>

    <el-table-column prop="priority" width="150" label="优先级" align="center">
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.priority, 'order_priority')">{{
          scope.row.priority
        }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="status" width="150" label="订单状态" align="center">
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.status, 'order_status')">{{
          scope.row.status
        }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="batch_id" width="150" label="批次" align="center">
    </el-table-column>

    <el-table-column prop="timestamp" label="创建时间" align="center">
      <template #default="scope">
        <el-icon>
          <Timer />
        </el-icon>
        <span style="margin-left: 10px">{{ scope.row.timestamp }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="SKU_detail" width="150" label="SKU详情" align="center">
    </el-table-column>

    <el-table-column prop="order_process" width="200" label="进度" align="center">
      <template v-slot="scope">
        <el-progress :percentage="parseInt(scope.row.order_process.replace('%', ''))" :text-inside="true"
          :stroke-width="22" :color="app.proxy.getProgressColor(parseInt(scope.row.order_process.replace('%', '')))">
        </el-progress>
      </template>
    </el-table-column>

    <el-table-column label="操作" align="center" width="150" fixed="right">
      <template #default="scope">
        <el-popover trigger="hover" placement="top" width="240px">
          <p>订单ID: {{ scope.row.order_id }}</p>
          <p>优先级: {{ scope.row.priority }}</p>
          <p>订单状态: {{ scope.row.status }}</p>
          <p>批次: {{ scope.row.batch_id }}</p>
          <p>SKU详情: {{ scope.row.SKU_detail }}</p>
          <p>创建时间: {{ scope.row.timestamp }}</p>
          <p>进度: {{ scope.row.order_process }}</p>
          <template #reference class="name-wrapper">
            <el-link type="primary" size="default">查看详情</el-link>
          </template>
        </el-popover>
      </template>
    </el-table-column>
  </el-table>


</template>

<script setup lang="ts" name="OrdersList">
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUpdate, onUnmounted } from "vue"
import { useUserStore } from "@/store/user";
import { useRouter, useRoute } from 'vue-router';
import CustomTag from '@/components/CustomTag.vue';

import * as api from "@/api/";
const app = getCurrentInstance() as any

const router = useRouter()
const route = useRoute()
// 定义Ref
const tableRef = ref(null)
const acceptRef = ref(null)
const replyRef = ref(null)
// 表格相关
const currentOrderType = ref("All");
const tableData = ref([]);

// 分页相关
const currentPage = ref(1);
// const pageSize = ref(100);
const itemsCount = ref(0);
// 编辑模式相关
const editingRow = ref(null);
const editingColumn = ref(null);
// 设定row_key方便多选
const getRowKey = (row) => (row.order_id)
// 获取所有订单
const getOrdersList = async () => {
  if (route.path === '/orders') {
    try {
      const data = await api.getOrdersData(
      );
      tableData.value = data.results;
      itemsCount.value = data.count;
    } catch (err) {
      tableData.value = [];
      app.proxy.$message({
        type: "error",
        message: "获取订单数据失败",
      });
    }
  }
}
let intervalId;
// 防抖函数，暂停轮询
const debounceFetchOrders = app.proxy.debounce(() => {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (!editingColumn.value && !editingRow.value) {
      getOrdersList();
    }
  }, 3000)
}, 3000);
// 定时获取订单数据
const fetchOrders = () => {
  if (!editingColumn.value && !editingRow.value) {
    clearInterval(intervalId); // 暂停轮询
    getOrdersList()
      .then(() => {
        debounceFetchOrders(1000); // 数据获取成功后重新启动轮询并防抖
      })
      .catch(() => {
        intervalId = setInterval(fetchOrders, 3000); // 数据获取失败后立即重新启动轮询
      });
  }
};

onMounted(() => {
  // 获取订单数据
  fetchOrders();

  // 当组件挂载时，设置定时器
  // intervalId = setInterval(fetchOrders, 3000);

});

onUnmounted(() => {
  // 当组件卸载时，清除定时器
  clearInterval(intervalId);
  // console.log('remove', intervalId)

});
// 更新数据前，对表格重新布局
onBeforeUpdate(() => {
  nextTick(() => {
    tableRef.value.doLayout();
  });
});
</script>

<style scoped lang="less">
.el-table th {
  display: table-cell !important;
}

.el-table {
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