<template>

  <el-tabs v-model="currentOrderType">
    <el-tab-pane v-for="orderType in validOrderTypes" :label="getOrderTypeLabel(orderType)"
      :name="orderType"></el-tab-pane>
  </el-tabs>

  <template v-if="savedParams.扰动类型 === '有'">
    <el-button type="primary" @click="handleEmergency('insert')">作业插入</el-button>
    <el-button type="danger" @click="handleEmergency('stuck')">作业故障</el-button>
    <el-button type="warning" @click="handleEmergency('modify')">作业修改</el-button>
    <el-button type="infoinfo" @click="handleEmergency('cancel')">作业取消</el-button>
  </template>

  <el-table ref="tableRef" :data="tableData" :row-key="getRowKey" max-height="800"
    style="width:90%;margin-top:100px;margin:auto" scrollbar-always-on header-align="center" stripe>

    <!-- <el-table-column type="selection" prop="selection" width="30" align="center" header-align="center"
      reserve-selection>
    </el-table-column> -->

    <el-table-column type="index" prop="index" label="序号" width="50" align="center" header-align="center">
      <template #default="scope">
        <p> {{ (scope.$index + 1) + pageSize * (currentPage - 1) }}</p>
      </template>
    </el-table-column>


    <el-table-column prop="order_id" width="250" label="订单ID" align="center">
    </el-table-column>

    <el-table-column prop="priority" width="50" label="优先级" align="center">
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.priority, 'order_priority')">{{
          scope.row.priority
        }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="status" width="100" label="订单状态" align="center">
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.status, 'order_status')">{{
          scope.row.status
        }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="batch_id" width="50" label="批次" align="center">
    </el-table-column>

    <el-table-column prop="timestamp" label="创建时间" align="center">
      <template #default="scope">
        <el-icon>
          <Timer />
        </el-icon>
        <span style="margin-left: 10px">{{ scope.row.timestamp }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="robot_id" width="90" label="机器人" align="center">
      <template v-slot="scope">
        <p>{{ scope.row.robot_id ?? '未分配' }}</p>
      </template>
    </el-table-column>

    <el-table-column prop="station_id" width="90" label="所在站台" align="center">
      <template v-slot="scope">
        <p>{{ scope.row.station_id ?? '未分配' }}</p>
      </template>
    </el-table-column>

    <el-table-column prop="SKU_detail" width="150" label="SKU详情" align="center">
    </el-table-column>

    <el-table-column prop="order_process" width="150" label="进度" align="center">
      <template v-slot="scope">
        <el-progress :percentage="parseInt(scope.row.order_process.replace('%', ''))" :text-inside="true"
          :stroke-width="22" :color="app.proxy.getProgressColor(parseInt(scope.row.order_process.replace('%', '')))">
        </el-progress>
      </template>
    </el-table-column>

    <el-table-column label="详情" align="center" width="150" fixed="right">
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

    <!-- <el-table-column label="操作" align="center" width="100" fixed="right">
      <template #default="scope">
        <el-button type="danger" size="small" @click="handleEmergency(scope.row)">紧急插单</el-button>
      </template>
    </el-table-column> -->
  </el-table>

  <div class="flex justify-center mt-4"><el-pagination align="center" background
      @current-change="handleCurrentPageChange" @size-change="handlePageSizeChange" v-model:current-page="currentPage"
      :page-size="pageSize" :page-sizes="[50, 100]" :pager-count="15" layout="total, sizes, prev, pager, next, jumper"
      :total="itemsCount">
    </el-pagination></div>

</template>

<script setup lang="ts" name="OrdersList">
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUpdate, onUnmounted } from "vue"
import { useUserStore } from "@/store/user";
import { useRouter, useRoute } from 'vue-router';
import CustomTag from '@/components/CustomTag.vue';

import { useParamsStore } from '@/store/params'
const paramsStore = useParamsStore()
const { savedParams
} = storeToRefs(paramsStore)
import * as api from "@/api/";
const app = getCurrentInstance() as any

const router = useRouter()
const route = useRoute()
// 定义Ref
const tableRef = ref(null)
const acceptRef = ref(null)
const replyRef = ref(null)
// 表格相关
const currentOrderType = ref("unassigned");
const tableData = ref([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(100);
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
      const data = await api.getOrdersData(currentOrderType.value, currentPage.value, pageSize.value
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
// 页码变化
const handleCurrentPageChange = (val) => {
  currentPage.value = val;
  fetchOrders();
}
// 分页大小变化
const handlePageSizeChange = (val) => {
  pageSize.value = val;
  fetchOrders();
}
// 订单类型选项卡
const validOrderTypes = ref(['unassigned', 'assigned'])
// 订单类型选项标签
const getOrderTypeLabel = (orderType) => {
  switch (orderType) {
    // case 'all':
    //   return '全部订单';
    case 'unassigned':
      return '未分配订单';
    case 'assigned':
      return '已分配订单';
    default:
      return orderType;
  }
}
// 当订单类型变化时，清空排序、筛选、页码、多选
watch(currentOrderType, () => {
  router.push({ query: { type: currentOrderType.value } })
  currentPage.value = 1;
  itemsCount.value = 0
  tableData.value = [];
  fetchOrders();
});
onMounted(() => {
  // 获取路由中的订单类型参数
  const type = route.query.type as any;
  if (type) {
    currentOrderType.value = type;
  }
  else {
    currentOrderType.value = "unassigned";
    router.push({ query: { type: currentOrderType.value } })
  }
  // 获取订单数据
  fetchOrders();

  // 当组件挂载时，设置定时器
  // intervalId = setInterval(fetchOrders, 3000);

});
const generateOrderId = () => {
  const currentDate = new Date();
  const datePart = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`; // 当前日期部分
  const orderId = `O-${datePart}-1${String(Math.floor(Math.random() * 10000) + 1).padStart(5, '0')}`; // 格式化订单ID
  return orderId;
};

const generateRobotId = () => {
  const orderId = `R-1${String(Math.floor(Math.random() * 100000) + 1).padStart(5, '0')}`; // 格式化机器人ID
  return orderId;
};

const generateStationId = () => {
  const orderId = `S-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`; // 格式化拣选站ID
  return orderId;
};
// 处理紧急插单
const handleEmergency = (type) => {
  let confirm = '', message1 = '', message2 = ''
  const orderId = generateOrderId();
  const robotId = generateRobotId();
  const stationId = generateStationId();

  switch (type) {
    case 'insert':
      confirm = `是否进行作业插入`
      message1 = `正在进行作业插入，已生成优先度为紧急的订单，订单编号${orderId}`
      message2 = `订单${orderId}已经被成功分配并优先处理，对应拣选站为${stationId}，机器人为${robotId}`;
      break

    case 'stuck':
      confirm = `是否进行作业故障`
      message1 = `正在进行作业故障，订单${orderId}的执行机器人${robotId}出现故障`
      message2 = `订单${orderId}已经被成功二次分配，对应拣选站为${stationId}，机器人为${generateRobotId()}`;
      break
    case 'modify':
      confirm = `是否进行作业修改`
      message1 = `正在进行作业修改，订单${orderId}的内容SKU种类已经改变`
      message2 = `订单${orderId}已经被成功二次分配，增加机器人${robotId}来完成订单`;
      break
    case 'cancel':
      confirm = `是否进行作业取消`
      message1 = `正在进行作业取消，将取消订单${orderId}的执行`
      message2 = `订单${orderId}已经被成功取消，执行该订单的机器人${robotId}和拣选站${stationId}，对应时段已经被释放`;
      break
  }

  app.proxy.$confirm(confirm, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 生成订单ID
    app.proxy.$message({
      type: 'info',
      message: message1,
      duration: 2000

    });
    // 模拟成功提示，过3秒
    setTimeout(() => {
      app.proxy.$message({
        type: 'success',
        message: message2,
        duration: 4000
      });
    }, 3000);

  }).catch(() => {
    app.proxy.$message({
      type: 'info',
      message: '已取消紧急插单'
    });
  });
}
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