<template>
  <el-table ref="tableRef" :data="tableData" :row-key="getRowKey" max-height="800"
    style="width:90%;margin-top:100px;margin:auto" scrollbar-always-on header-align="center"
    :row-style="{ height: '90px' }" stripe>

    <!-- <el-table-column type="selection" prop="selection" width="30" align="center" header-align="center"
      reserve-selection>
    </el-table-column> -->

    <el-table-column type="index" prop="index" label="序号" width="50" align="center" header-align="center">
      <template #default="scope">
        <p> {{ (scope.$index + 1) + pageSize * (currentPage - 1) }}</p>
      </template>
    </el-table-column>


    <el-table-column prop="station_id" width="250" label="拣选站ID" align="center">
    </el-table-column>

    <el-table-column prop="status" width="150" label="状态" align="center">
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.status, 'station_status')">{{
          scope.row.status
        }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="order_id" width="250" label="当前订单" align="center">
    </el-table-column>

    <el-table-column prop="last_updated" label="最后刷新时间" align="center">
      <template #default="scope">
        <el-icon>
          <Timer />
        </el-icon>
        <span style="margin-left: 10px">{{ scope.row.last_updated }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="waiting_queue" width="400" label="等待队列" align="center">
    </el-table-column>

    <el-table-column label="操作" align="center" width="150" fixed="right">
      <template #default="scope">
        <el-popover trigger="hover" placement="top" width="240px">
          <p>站台ID: {{ scope.row.station_id }}</p>
          <p>状态: {{ scope.row.status }}</p>
          <p>当前订单: {{ scope.row.order_id }}</p>
          <p>等待队列: {{ scope.row.waiting_queue }}</p>
          <p>最后刷新: {{ scope.row.last_updated }}</p>
          <template #reference class="name-wrapper">
            <el-link type="primary" size="default">查看详情</el-link>
          </template>
        </el-popover>
      </template>
    </el-table-column>
  </el-table>


  <div class="flex justify-center mt-4"><el-pagination align="center" background
      @current-change="handleCurrentPageChange" @size-change="handlePageSizeChange" v-model:current-page="currentPage"
      :page-size="pageSize" :page-sizes="[5, 10, 20]" :pager-count="15" layout="total, sizes, prev, pager, next, jumper"
      :total="itemsCount">
    </el-pagination></div>
</template>

<script setup lang="ts" name="StationsList">
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
const pageSize = ref(10);
const itemsCount = ref(0);
// 编辑模式相关
const editingRow = ref(null);
const editingColumn = ref(null);
// 设定row_key方便多选
const getRowKey = (row) => (row.order_id)
// 获取所有拣选站
const getStationsList = async () => {
  if (route.path === '/stations') {
    try {
      const data = await api.getStationsData(
      );
      console.log(111)
      tableData.value = data.results;
      itemsCount.value = data.count;
    } catch (err) {
      tableData.value = [];
      app.proxy.$message({
        type: "error",
        message: "获取拣选站数据失败",
      });
    }
  }
}
let intervalId;
// 防抖函数，暂停轮询
const debounceFetchStations = app.proxy.debounce(() => {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (!editingColumn.value && !editingRow.value) {
      getStationsList();
    }
  }, 3000)
}, 3000);
// 定时获取订单数据
const fetchStations = () => {
  if (!editingColumn.value && !editingRow.value) {
    clearInterval(intervalId); // 暂停轮询
    getStationsList()
      .then(() => {
        debounceFetchStations(1000); // 数据获取成功后重新启动轮询并防抖
      })
      .catch(() => {
        intervalId = setInterval(fetchStations, 3000); // 数据获取失败后立即重新启动轮询
      });
  }
};
// 页码变化
const handleCurrentPageChange = (val) => {
  currentPage.value = val;
  fetchStations();
}
// 分页大小变化
const handlePageSizeChange = (val) => {
  pageSize.value = val;
  fetchStations();
}
onMounted(() => {
  // 获取订单数据
  fetchStations();

  // 当组件挂载时，设置定时器
  // intervalId = setInterval(fetchStations, 3000);

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