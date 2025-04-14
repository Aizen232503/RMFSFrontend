<template>
  <!-- <button @click="getOrdersList">12341</button> -->
  <el-drawer v-model="drawer" size="75%" :before-close="handleDrawerClose" destroy-on-close>
    <template #header>
      <h3 class="text-2xl" v-if="drawerType === 1">编辑订单</h3>
      <h3 class="text-2xl" v-if="drawerType === 3">添加关联</h3>
    </template>
    <template #footer>
      <el-button v-if="drawerType === 1" type="primary" @click="handleOrdersSubmit">提交订单</el-button>
      <el-button v-if="drawerType === 3" type="success" @click="handleManualRelate">关联订单</el-button>
    </template>
    <!-- 编辑订单 -->
    <div v-if="drawerType === 1">
      <PublicOrder ref="publicRef" :defaultForm="operateOrderForm" expandAll />
      <component :is="operateOrderType" ref="orderRef" :defaultForm="operateOrderForm" expandAll />

    </div>
    <!-- 手动关联 -->
    <div v-if="drawerType === 3" class="flex flex-col items-center">
      <p class="text-xl">请拖动调整关联后两个订单的次序</p>
      <draggable v-model="tableSelection" class="flex flex-wrap gap-2 mt-10" @start="drag = true" @end="drag = false"
        item-key="index">
        <template #item="{ element, index }">
          <OrderIcon :index="drag ? null : index + 1" :orderType="app.proxy.translateOrderType(element.order_type)">
            <template #default>
              <p class="mt-4">ID：{{ element.order_id }}</p>
              <p class="mt-4">创建时间：{{ element.create_time }}</p>
            </template>
          </OrderIcon>
        </template>
      </draggable>
      <div class="mt-10">
        <p class="text-xl">关联订单时间范围</p>
        <el-date-picker :default-value="now_date" class="mt-4" v-model="relate_time" type="datetimerange"
          :shortcuts="shortcuts" value-format="YYYY-MM-DD HH:mm:ss" />
      </div>
    </div>
  </el-drawer>
  <el-tabs v-model="currentOrderType">
    <el-tab-pane label="全部订单" name="All"></el-tab-pane>
    <el-tab-pane v-for="orderType in validOrderTypes" :label="getOrderTypeLabel(orderType)"
      :name="orderType"></el-tab-pane>
  </el-tabs>
  <!-- <el-collapse v-model="filterCollapse">
    <el-collapse-item name="filter">
      <template #title>
        <div>11</div>
      </template> -->
  <common-filter ref="filterRef" :orderType="currentOrderType" @filter-submit="handleFilterChange"></common-filter>
  <!-- </el-collapse-item>
  </el-collapse> -->
  <div class="flex justify-start my-4">
    <el-button @click="handleBulkTop()" type="primary">置顶</el-button>
    <el-button @click="handleBulkCancelTop()" type="info">重置优先级</el-button>
    <el-button @click="handleBulkClose()" type="warning">关闭</el-button>
    <el-button @click="handleBulkDelete()" type="danger">删除</el-button>
    <el-button v-if="ordersSelection.length === 2" @click="handleOrdersRelate()" type="success">添加关联</el-button>
    <el-button class=" float-left" @click="handleClearDemands()" type="danger">清空</el-button>

  </div>
  <el-table ref="tableRef" :data="tableData" :row-key="getRowKey" style="width: 100%"
    @selection-change="handleSelectionChange" max-height="600" scrollbar-always-on @row-dblclick="handleRowDblclick"
    @header-click="handleHeaderClick" @sort-change="handleSortChange">
    <!-- 此处为始终显示的表项，排在开头 -->

    <el-table-column type="selection" prop="selection" width="30" align="center" header-align="center" reserve-selection
      fixed>
    </el-table-column>

    <el-table-column type="index" prop="index" lable="序号" width="30" align="center" header-align="center"
      reserve-selection fixed>
      <template #default="scope">
        <p> {{ (scope.$index + 1) + 30 * (currentPage - 1) }}</p>
      </template>
    </el-table-column>

    <!-- <el-table-column prop="id" lable="序号" width="60" align="center" header-align="center" reserve-selection fixed>
      <template #default="scope">
        <el-text :type="app.proxy.getTagType(scope.row.order_type, 'order_type')"> {{
          scope.row.id }}</el-text>
      </template>
    </el-table-column> -->

    <el-table-column prop="order_name" width="220" label="订单名称" align="center" fixed>
      <template #default="scope">
        <el-popover trigger="hover" placement="top" width="auto">
          <p>订单ID: {{ scope.row.order_id }}</p>
          <template #reference class="name-wrapper">
            <div>
              <el-text :type="app.proxy.getTagType(scope.row.order_type, 'order_type')"> {{
                scope.row.order_name.split('-')[0] }}</el-text>
              <el-text>-</el-text>
              <el-text type="success"> {{ scope.row.order_name.split('-')[1] }}</el-text>
              <el-text>-</el-text>
              <el-text type="primary"> {{ scope.row.order_name.split('-')[2].slice(0, 8) }}</el-text>
              <el-text> {{ scope.row.order_name.split('-')[2].slice(8) }}</el-text>
            </div>
          </template>
        </el-popover>
      </template>
    </el-table-column>

    <!-- <el-table-column prop="order_id" width="160" label="订单ID" align="center" show-overflow-tooltip fixed>
    </el-table-column> -->

    <el-table-column prop="order_type" label="订单类型" width="60" align="center" fixed>
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.order_type, 'order_type')">{{ scope.row.order_type
          }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="create_time" label="创建时间" width="180" align="center" sortable="custom">
      <template #default="scope">
        <el-icon>
          <Timer />
        </el-icon>
        <span style="margin-left: 10px">{{ scope.row.create_time }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="order_status" label="订单状态" width="100" align="center" sortable="custom">
      <template v-slot="scope">
        <custom-tag :type="app.proxy.getTagType(scope.row.order_status, 'order_status')">{{
          app.proxy.transferOrderStatus(scope.row.order_status)
        }}</custom-tag>
      </template>
    </el-table-column>

    <!-- <el-table-column prop="sort_value" label="优先级函数值" width="160" align="center" sortable="custom">
      <template v-slot="scope">
        <p v-if="scope.row.sort_value">{{ parseFloat(scope.row.sort_value.toFixed(6)) }}</p>
      </template>
    </el-table-column> -->

    <!-- <el-table-column prop="sort_sequence_number" :show-overflow-tooltip="false" label="重要度" width="130" align="center"
      sortable="custom" v-if="currentOrderType !== 'All'">
      <template #default="scope">
        <el-popover trigger="hover" placement="top" width="auto">
          <p v-if="scope.row.sort_value">优先级函数值: {{ scope.row.sort_value }}</p>
          <template #reference class="name-wrapper">
            <p>{{ scope.row.sort_sequence_number }}</p>
          </template>
        </el-popover>
      </template>
    </el-table-column> -->

    <el-table-column prop="sort_topvalue" :show-overflow-tooltip="false" label="优先级" width="190" align="left"
      header-align="center" v-if="currentOrderType !== 'All'" sortable="custom">
      <template #default="scope">
        <span v-if="scope.row.sort_topvalue >= 6" class="text-[#ff9900]">已置顶</span>
        <el-rate v-else v-model="scope.row.sort_topvalue" @change="value => handleSortValueChange(scope.row, value)"
          show-score text-color="#ff9900" :max="6" clearable />
      </template>
    </el-table-column>

    <el-table-column prop="accept_id" label="受理人" width="60" align="center">
      <template #default="scope">
        <span v-if="!isEditing(scope.row, scope.column)">{{ scope.row.accept_id }}</span>
        <el-input v-else class="centered-input" size="small" v-model="scope.row.accept_id"
          @change="value => handleAcceptChange(scope.row, value)" ref="acceptRef" />
      </template>
    </el-table-column>

    <el-table-column prop="accept_type" label="受理人类型" width="100" align="center" sortable="custom">
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.accept_type, 'dispatch_center')">{{ scope.row.accept_type
          }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="accept_reply" label="受理人批复" width="100" align="center" show-overflow-tooltip>
      <template #default="scope">
        <span v-if="!isEditing(scope.row, scope.column)">{{ scope.row.accept_reply }}</span>
        <el-input v-else class="centered-input" size="small" v-model="scope.row.accept_reply"
          @change="value => handleReplyChange(scope.row, value)" ref="replyRef" />
      </template>
    </el-table-column>

    <el-table-column prop="apply_id" label="申请人" width="60" align="center">
    </el-table-column>

    <el-table-column prop="apply_user_type" label="申请人类型" width="100" align="center" sortable="custom">
      <template v-slot="scope">
        <el-tag :type="app.proxy.getTagType(scope.row.apply_user_type, 'dispatch_center')">{{ scope.row.apply_user_type
          }}</el-tag>
      </template>
    </el-table-column>


    <!-- <el-table-column prop="apply_priority" label="申请人优先级" width="130" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="apply_expected_priority" label="申请人期望优先级" width="180" align="center" sortable="custom">
      </el-table-column> -->

    <el-table-column label="申请人位置" width="90" align="center">
      <template #default="scope">
        <el-popover trigger="hover" placement="top" width="auto">
          <p>申请人经度: {{ scope.row.apply_longitude }}°E</p>
          <p>申请人纬度: {{ scope.row.apply_latitude }}°N</p>
          <p>申请人高度: {{ scope.row.apply_height }}米</p>
          <template #reference class="name-wrapper">
            <el-link type="primary" size="default">查看详情</el-link>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <!-- 此处为不分类型查看订单时显示的表项 -->
    <template v-if="currentOrderType === 'All'">


    </template>

    <!-- 此处为查看起飞订单时显示的表项 -->
    <template v-if="currentOrderType === 'TkoffOrder'">
      <el-table-column prop="tkoff_ASAP" label="尽快" width="40" align="center">
        <template #default="scope">
          <span style="margin-left: 10px">{{ scope.row.tkoff_ASAP ? '是' : '否' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="tkoff_type" label="起飞类型" width="120" align="center">
      </el-table-column>


      <el-table-column prop="tkoff_time" label="起飞时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.tkoff_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="tkoff_airport" label="起飞机场" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tkoff_runaway" label="起飞跑道" width="60" align="center">
      </el-table-column>

      <el-table-column label="交接点" width="70" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>起飞交接点经度: {{ scope.row.tkoff_TOP_longitude }}°E</p>
            <p>起飞交接点纬度: {{ scope.row.tkoff_TOP_latitude }}°N</p>
            <p>起飞交接点高度: {{ scope.row.tkoff_TOP_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="tkoff_start_time" label="预约起飞开始时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.tkoff_start_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="tkoff_end_time" label="预约起飞结束时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.tkoff_end_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="tkoff_airport_prioirity" label="优先机场" width="70" align="center">
      </el-table-column>

      <el-table-column label="预约交接点" width="100" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>预约起飞交接点经度: {{ scope.row.tkoff_bTOP_longitude }}°E</p>
            <p>预约起飞交接点纬度: {{ scope.row.tkoff_bTOP_latitude }}°N</p>
            <p>预约起飞交接点高度: {{ scope.row.tkoff_bTOP_height }}米</p>
            <p>预约起飞交接点半径: {{ scope.row.tkoff_TOP_radius }}米</p>
            <p>预约起飞控制点编号: {{ scope.row.tkoff_CP_id }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="弹药信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>弹药1型号: {{ scope.row.tkoff_ammunition_type1 }}</p>
            <p>弹药1数量:{{ scope.row.tkoff_ammunition_number1 }}</p>
            <p>弹药2型号: {{ scope.row.tkoff_ammunition_type2 }}</p>
            <p>弹药2数量:{{ scope.row.tkoff_ammunition_number2 }}</p>
            <p>弹药3型号: {{ scope.row.tkoff_ammunition_type3 }}</p>
            <p>弹药3数量:{{ scope.row.tkoff_ammunition_number3 }}</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="燃油信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>燃油1型号: {{ scope.row.tkoff_oil_type1 }}</p>
            <p>燃油1数量:{{ scope.row.tkoff_oil_number1 }}</p>
            <p>燃油2型号: {{ scope.row.tkoff_oil_type2 }}</p>
            <p>燃油2数量:{{ scope.row.tkoff_oil_number2 }}</p>
            <p>燃油3型号: {{ scope.row.tkoff_oil_type3 }}</p>
            <p>燃油3数量:{{ scope.row.tkoff_oil_number3 }}</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <!-- <el-table-column prop="schedule_id" label="起飞计划ID" width="330" align="center">
      </el-table-column> -->
    </template>

    <!-- 此处为查看领航订单时显示的表项 -->
    <template v-if="currentOrderType === 'NaviOrder'">

      <el-table-column prop="navi_isout" label="出航/返航" width="90" align="center" sortable="custom">
        <template #default="scope">
          <span>{{ scope.row.navi_isout ? '出航' : '返航' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="navi_type" label="领航类型" width="120" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="navi_pipe" label="航路管道" width="60" align="center">
      </el-table-column>

      <el-table-column label="起点信息" width="70" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>起点经度: {{ scope.row.navi_qidian_longitude }}°E</p>
            <p>起点纬度: {{ scope.row.navi_qidian_latitude }}°N</p>
            <p>起点高度: {{ scope.row.navi_qidian_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="navi_qidian_takeover_time" label="起点交接时刻" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.navi_qidian_takeover_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="navi_qidian_takeover_timewindow" label="起点时间窗口" width="90" align="center">
        <template #default="scope">
          <span>{{ scope.row.navi_qidian_takeover_timewindow }}秒</span>
        </template>
      </el-table-column>

      <el-table-column label="终点信息" width="70" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>终点经度: {{ scope.row.navi_zhongdian_longitude }}°E</p>
            <p>终点纬度: {{ scope.row.navi_zhongdian_latitude }}°N</p>
            <p>终点高度: {{ scope.row.navi_zhongdian_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="navi_zhongdian_takeover_time" label="终点交接时刻" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.navi_zhongdian_takeover_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="navi_zhongdian_takeover_timewindow" label="终点时间窗口" width="90" align="center">
        <template #default="scope">
          <span>{{ scope.row.navi_zhongdian_takeover_timewindow }}秒</span>
        </template>
      </el-table-column>

      <el-table-column prop="navi_pipe_priority" label="优先航路管道" width="120" align="center">
      </el-table-column>

      <el-table-column label="预约起点" width="70" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>预约起点经度: {{ scope.row.navi_bQidian_longitude }}°E</p>
            <p>预约起点纬度: {{ scope.row.navi_bQidian_latitude }}°N</p>
            <p>预约起点高度: {{ scope.row.navi_bQidian_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="navi_bQidian_takeover_time" label="预约起点交接时刻" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.navi_bQidian_takeover_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="navi_bQidian_takeover_timewindow" label="预约起点时间窗口" width="90" align="center"
        sortable="custom">
        <template #default="scope">
          <span>{{ scope.row.navi_bQidian_takeover_timewindow }}秒</span>
        </template>
      </el-table-column>

      <el-table-column label="预约终点" width="70" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>预约终点经度: {{ scope.row.navi_bZhongdian_longitude }}°E</p>
            <p>预约终点纬度: {{ scope.row.navi_bZhongdian_latitude }}°N</p>
            <p>预约终点高度: {{ scope.row.navi_bZhongdian_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="navi_bZhongdian_takeover_time" label="预约终点交接时刻" width="180" align="center"
        sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.navi_bZhongdian_takeover_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="navi_bZhongdian_takeover_timewindow" label="预约终点时间窗口" width="90" align="center"
        sortable="custom">
        <template #default="scope">
          <span>{{ scope.row.navi_bZhongdian_takeover_timewindow }}秒</span>
        </template>
      </el-table-column>

      <el-table-column prop="navi_drone_value" label="价值" width="60" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="navi_drone_fault" label="是否故障" width="60" align="center" sortable="custom">
      </el-table-column>

    </template>

    <!-- 此处为查看打击订单时显示的表项 -->
    <template v-if="currentOrderType === 'AttackOrder'">

      <el-table-column prop="attack_ASAP" label="尽快" width="40" align="center">
        <template #default="scope">
          <span style="margin-left: 10px">{{ scope.row.attack_ASAP ? '是' : '否' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="attack_type" label="打击类型" width="110" align="center" sortable="custom"
        show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="target_type" label="目标类型" width="110" align="center" sortable="custom"
        show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="target_threat_level" label="威胁等级" width="80" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="target_precision" label="目标精度" width="80" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="target_number" label="目标数" width="70" align="center" sortable="custom">
      </el-table-column>

      <el-table-column label="目标信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>目标经度: {{ scope.row.target_longitude }}°E</p>
            <p>目标纬度: {{ scope.row.target_latitude }}°N</p>
            <p>目标高度: {{ scope.row.target_height }}米</p>
            <p>目标运动速度: {{ scope.row.target_move_speed }}米/秒</p>
            <p>目标运动方向: {{ scope.row.target_move_direction }}°</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="IP点信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>IP点经度:{{ scope.row.tactic_IP_longitude }}°E</p>
            <p>IP点纬度: {{ scope.row.tactic_IP_latitude }}°N</p>
            <p>IP点高度: {{ scope.row.tactic_IP_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="CP点信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>CP点经度:{{ scope.row.tactic_CP_longitude }}°E</p>
            <p>CP点纬度: {{ scope.row.tactic_CP_latitude }}°N</p>
            <p>CP点高度: {{ scope.row.tactic_CP_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="EP点信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>EP点经度:{{ scope.row.tactic_EP_longitude }}°E</p>
            <p>EP点纬度: {{ scope.row.tactic_EP_latitude }}°N</p>
            <p>EP点高度: {{ scope.row.tactic_EP_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="attack_start_time" label="打击开始时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.attack_start_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="attack_end_time" label="打击结束时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.attack_end_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="attack_duration" label="打击时长" width="80" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="attack_damage" label="毁伤要求" width="110" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="attack_constraint" label="打击约束" width="60" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="attack_part" label="打击部位" width="60" align="center" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="tactic_guide" label="引导类型" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_guider" label="引导员" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_frequency_point1" label="主频点" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_frequency_point2" label="备用频点" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_command_control" label="指挥控制" width="100" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="tactic_command_leave" label="指挥脱离" width="100" align="center" show-overflow-tooltip>
      </el-table-column>
    </template>

    <!-- 此处为查看侦察订单时显示的表项 -->
    <template v-if="currentOrderType === 'ReconOrder'">

      <el-table-column prop="recon_ASAP" label="尽快" width="40" align="center">
        <template #default="scope">
          <span style="margin-left: 10px">{{ scope.row.recon_ASAP ? '是' : '否' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="recon_type" label="侦察类型" width="110" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="interest_location_terrain" label="兴趣位置属性" width="100" align="center">
      </el-table-column>

      <el-table-column prop="estimated_target_type" label="预计目标类型" width="120" align="center" sortable="custom"
        show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="estimated_target_threat_level" label="预计威胁等级" width="120" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="estimated_target_number" label="预计目标数" width="100" align="center" sortable="custom">
      </el-table-column>

      <el-table-column label="兴趣位置" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>兴趣位置类型: {{ scope.row.interest_location_type }}</p>
            <div v-if="scope.row.interest_location_type === '兴趣点'">
              <p>兴趣点经度:{{ scope.row.interest_point_longitude }}°E</p>
              <p>兴趣点纬度: {{ scope.row.interest_point_latitude }}°N</p>
              <p>兴趣点高度: {{ scope.row.interest_point_height }}米</p>
              <p>兴趣点推荐进入方位角: {{ scope.row.interest_point_entry_angle_suggestion }}°</p>
            </div>
            <div v-if="scope.row.interest_location_type === '兴趣圆'">
              <p>兴趣圆圆心经度:{{ scope.row.interest_circle_longitude }}°E</p>
              <p>兴趣圆圆心纬度: {{ scope.row.interest_circle_latitude }}°N</p>
              <p>兴趣圆圆心高度: {{ scope.row.interest_circle_height }}米</p>
              <p>兴趣圆圆心推荐进入方位角: {{ scope.row.interest_circle_entry_angle_suggestion }}°</p>
            </div>
            <div v-if="scope.row.interest_location_type === '兴趣多边形'">
              <p>兴趣多边形顶点1经度:{{ scope.row.interest_polygon_vertx1_longitude }}°E</p>
              <p>兴趣多边形顶点1纬度: {{ scope.row.interest_polygon_vertx1_latitude }}°N</p>
              <p>兴趣多边形顶点1高度: {{ scope.row.interest_polygon_vertx1_height }}米</p>
              <p>兴趣多边形顶点2经度:{{ scope.row.interest_polygon_vertx2_longitude }}°E</p>
              <p>兴趣多边形顶点2纬度: {{ scope.row.interest_polygon_vertx2_latitude }}°N</p>
              <p>兴趣多边形顶点2高度: {{ scope.row.interest_polygon_vertx2_height }}米</p>
              <p>兴趣多边形顶点3经度:{{ scope.row.interest_polygon_vertx3_longitude }}°E</p>
              <p>兴趣多边形顶点3纬度: {{ scope.row.interest_polygon_vertx3_latitude }}°N</p>
              <p>兴趣多边形顶点3高度: {{ scope.row.interest_polygon_vertx3_height }}米</p>
              <p>兴趣多边形顶点4经度:{{ scope.row.interest_polygon_vertx4_longitude }}°E</p>
              <p>兴趣多边形顶点4纬度: {{ scope.row.interest_polygon_vertx4_latitude }}°N</p>
              <p>兴趣多边形顶点4高度: {{ scope.row.interest_polygon_vertx4_height }}米</p>
            </div>

            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="CP点信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>CP点经度:{{ scope.row.tactic_CP_longitude }}°E</p>
            <p>CP点纬度: {{ scope.row.tactic_CP_latitude }}°N</p>
            <p>CP点高度: {{ scope.row.tactic_CP_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="EP点信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>EP点经度:{{ scope.row.tactic_EP_longitude }}°E</p>
            <p>EP点纬度: {{ scope.row.tactic_EP_latitude }}°N</p>
            <p>EP点高度: {{ scope.row.tactic_EP_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="recon_start_time" label="侦察开始时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.recon_start_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="recon_end_time" label="侦察结束时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.recon_end_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="recon_duration" label="侦察时长" width="80" align="center" sortable="custom"><template
          #default="scope">
          <span style="margin-left: 10px">{{ scope.row.recon_duration }}分钟</span>
        </template>
      </el-table-column>


      <el-table-column prop="tactic_guide" label="引导类型" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_guider" label="引导员" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_frequency_point1" label="主频点" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_frequency_point2" label="备用频点" width="60" align="center">
      </el-table-column>

      <el-table-column prop="tactic_command_control" label="指挥控制" width="100" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="tactic_command_leave" label="指挥脱离" width="100" align="center" show-overflow-tooltip>
      </el-table-column>
    </template>

    <!-- 此处为查看降落订单时显示的表项 -->
    <template v-if="currentOrderType === 'LandOrder'">

      <el-table-column prop="land_ASAP" label="尽快" width="40" align="center">
        <template #default="scope">
          <span style="margin-left: 10px">{{ scope.row.land_ASAP ? '是' : '否' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="land_type" label="降落类型" width="110" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="land_start_time" label="预约降落开始时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.land_start_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="land_end_time" label="预约降落结束时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.land_end_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="land_airport_prioirity" label="优先机场" width="70" align="center">
      </el-table-column>

      <el-table-column label="弹药信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>弹药1型号: {{ scope.row.land_ammunition_type1 }}</p>
            <p>弹药1数量:{{ scope.row.land_ammunition_number1 }}</p>
            <p>弹药2型号: {{ scope.row.land_ammunition_type2 }}</p>
            <p>弹药2数量:{{ scope.row.land_ammunition_number2 }}</p>
            <p>弹药3型号: {{ scope.row.land_ammunition_type3 }}</p>
            <p>弹药3数量:{{ scope.row.land_ammunition_number3 }}</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="燃油信息" width="60" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>燃油1型号: {{ scope.row.land_oil_type1 }}</p>
            <p>燃油1数量:{{ scope.row.land_oil_number1 }}</p>
            <p>燃油2型号: {{ scope.row.land_oil_type2 }}</p>
            <p>燃油2数量:{{ scope.row.land_oil_number2 }}</p>
            <p>燃油3型号: {{ scope.row.land_oil_type3 }}</p>
            <p>燃油3数量:{{ scope.row.land_oil_number3 }}</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="land_time" label="降落时间" width="180" align="center" sortable="custom">
        <template #default="scope">
          <el-icon>
            <Timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.land_time }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="land_airport" label="降落机场" width="60" align="center">
      </el-table-column>

      <el-table-column prop="land_runway" label="降落跑道" width="60" align="center">
      </el-table-column>

      <el-table-column label="降落机场" width="70" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>降落机场经度: {{ scope.row.land_airport_longitude }}°E</p>
            <p>降落机场纬度: {{ scope.row.land_airport_latitude }}°N</p>
            <p>降落机场高度: {{ scope.row.land_airport_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="交接点" width="70" align="center">
        <template #default="scope">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>降落交接点经度: {{ scope.row.land_TOP_longitude }}°E</p>
            <p>降落交接点纬度: {{ scope.row.land_TOP_latitude }}°N</p>
            <p>降落交接点高度: {{ scope.row.land_TOP_height }}米</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="land_drone_value" label="价值" width="60" align="center" sortable="custom">
      </el-table-column>

      <el-table-column prop="land_drone_fault" label="是否故障" width="60" align="center" sortable="custom">
      </el-table-column>
    </template>

    <!-- 此处为始终显示的表项，排在末尾 -->
    <el-table-column label="关联信息" width="80" align="center"
      v-if="currentOrderType === 'AttackOrder' || currentOrderType === 'ReconOrder'">
      <template #default="scope">
        <div v-if="scope.row.relate_order_id">
          <el-popover trigger="hover" placement="top" width="auto">
            <p>关联订单类型: {{ scope.row.relate_order_type }}</p>
            <p>关联订单ID:{{ scope.row.relate_order_id }}</p>
            <p>关联订单开始时刻: {{ scope.row.relate_start_time }}</p>
            <p>关联订单结束时刻: {{ scope.row.relate_end_time }}</p>
            <template #reference class="name-wrapper">
              <el-link type="primary" size="default">查看详情</el-link>
            </template>
          </el-popover>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="remark" label="备注" width="110" align="center" show-overflow-tooltip>
    </el-table-column>


    <el-table-column prop="schedule_id" label="计划ID" width="120" align="center" show-overflow-tooltip>
    </el-table-column>

    <el-table-column prop="drone1_id" label="无人机信息" width="100" align="center" sortable="custom">
      <template #default="scope">
        <el-popover trigger="hover" placement="top" width="auto" v-if="scope.row.drone_sum">
          <p v-if="scope.row.drone1_id">无人机ID1: {{ scope.row.drone1_id }}</p>
          <p v-if="scope.row.drone_type1">无人机机型1: {{ scope.row.drone_type1 }}</p>
          <p v-if="scope.row.drone2_id">无人机ID2: {{ scope.row.drone2_id }}</p>
          <p v-if="scope.row.drone_type2">无人机机型2: {{ scope.row.drone_type2 }}</p>
          <p v-if="scope.row.drone3_id">无人机ID3: {{ scope.row.drone3_id }}</p>
          <p v-if="scope.row.drone_type3">无人机机型3: {{ scope.row.drone_type3 }}</p>
          <template #reference class="name-wrapper">
            <p type="primary" size="default" v-if="!scope.row.drone_sum">无</p>
            <p type="primary" size="default" v-if="scope.row.drone_sum === 1">{{
              scope.row.drone1_id
            }}</p>
            <el-link type="primary" size="default" v-if="scope.row.drone_sum > 1">共{{
              scope.row.drone_sum }}条</el-link>
          </template>
        </el-popover>
      </template>
    </el-table-column>

    <el-table-column prop="dispatch_drone1_id" label="匹配结果" width="100" align="center" sortable="custom">
      <template #default="scope">
        <el-popover trigger="hover" placement="top" width="auto" v-if="scope.row.dispatch_drone_sum">
          <p v-if="scope.row.dispatch_drone1_id">无人机ID1: {{ scope.row.dispatch_drone1_id }}</p>
          <!-- <p v-if="scope.row.dispatch_drone_type1">无人机机型1: {{ scope.row.dispatch_drone_type1 }}</p> -->
          <p v-if="scope.row.dispatch_drone2_id">无人机ID2: {{ scope.row.dispatch_drone2_id }}</p>
          <!-- <p v-if="scope.row.dispatch_drone_type2">无人机机型2: {{ scope.row.dispatch_drone_type2 }}</p> -->
          <p v-if="scope.row.dispatch_drone3_id">无人机ID3: {{ scope.row.dispatch_drone3_id }}</p>
          <!-- <p v-if="scope.row.dispatch_drone_type3">无人机机型3: {{ scope.row.dispatch_drone_type3 }}</p> -->
          <template #reference class="name-wrapper">
            <p type="primary" size="default" v-if="!scope.row.dispatch_drone_sum">无</p>
            <p type="primary" size="default" v-if="scope.row.dispatch_drone_sum === 1">{{
              scope.row.dispatch_drone1_id
            }}</p>
            <el-link type="primary" size="default" v-if="scope.row.dispatch_drone_sum > 1">共{{
              scope.row.dispatch_drone_sum }}条</el-link>
          </template>
        </el-popover>
      </template>
    </el-table-column>

    <el-table-column prop="demand_id" width="70" label="需求ID" align="center">
    </el-table-column>

    <!-- <el-table-column prop="demand_order_count" label="需求订单总数" width="40" align="center">
    </el-table-column>

    <el-table-column prop="demand_sequence_number" label="需求中序号" width="40" align="center">
    </el-table-column> -->



    <el-table-column label="操作" align="center" width="200" fixed="right"
      v-if="currentOrderType === 'AttackOrder' || currentOrderType === 'ReconOrder'">
      <template #default="scope">
        <el-button type="primary" size="small" @click="handleOrdersEdit(scope.row)">编辑</el-button>
        <el-button type="danger" size="small" @click="handleOrdersDelete(scope.row)">删除</el-button>
        <el-button type="warning" size="small" @click="handleOrdersHighlight(scope.row)">高亮</el-button>
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center" width="150" fixed="right" v-else>
      <template #default="scope">
        <el-button type="primary" size="small" @click="handleOrdersEdit(scope.row)">编辑</el-button>
        <el-button type="danger" size="small" @click="handleOrdersDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <div class="flex justify-center mt-4"><el-pagination align="center" background
      @current-change="handleCurrentPageChange" v-model:current-page="currentPage" :page-size="30" :pager-count="15"
      layout="total, prev, pager, next, jumper" :total="itemsCount">
    </el-pagination></div>

</template>

<script setup lang="ts" name="OrdersList">
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUpdate, onUnmounted } from "vue"
import { useUserStore } from "@/store/user";
import { useTimeStore } from "@/store/time";
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from "pinia"
import draggable from 'vuedraggable'
import CustomTag from '@/components/CustomTag.vue';

import CommonFilter from "@/components/CommonFilter.vue";
import * as api from "@/api/";
import PublicOrder from "@/components/PublicOrder.vue";
const app = getCurrentInstance() as any

const timeStore = useTimeStore()
const { now_date } = storeToRefs(timeStore);
const router = useRouter()
const route = useRoute()
// 定义Ref
const tableRef = ref(null)
const orderRef = ref(null)
const publicRef = ref(null)
const filterRef = ref(null)
const acceptRef = ref(null)
const replyRef = ref(null)
// 编辑输入框状态
const inputStatus = ref(false)
// 表格相关
const getOrdersFailCount = ref(0)
const currentOrderType = ref("All");
const tableData = ref([]);
const loading = ref(false)
// 选框和批量操作相关
const tableSelection = ref([]);
const ordersSelection = ref([]);
const selectionCount = ref(null);
// 排序和筛选相关
const filterCollapse = ref([])
const filterObject = ref({});
const orderingQuery = ref("");
// 分页相关
const currentPage = ref(1);
// const pageSize = ref(100);
const itemsCount = ref(0);
// 抽屉相关
const drawer = ref(false)
const drawerType = ref(0); //弹窗类型，0：新增，1：编辑，2：查看，3：关联
const operateOrderForm: any = ref({});
const operateOrderType = ref("");
const drag = ref(false)
// 编辑模式相关
const editingRow = ref(null);
const editingColumn = ref(null);
// 手动关联相关
const relate_time = ref([])
// 时间快速选项
const shortcuts = [
  {
    text: '近一周',
    value: () => {
      const end = new Date(now_date.value.getTime());
      const start = new Date(now_date.value.getTime())
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '近一个月',
    value: () => {
      const end = new Date(now_date.value.getTime());
      const start = new Date(now_date.value.getTime())
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '近三个月',
    value: () => {
      const end = new Date(now_date.value.getTime());
      const start = new Date(now_date.value.getTime())
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]
const currentUser = useUserStore().currentUser
// 计算用户能查看的订单类型
const validOrderTypes = computed(() => {
  return currentUser?.permission || []
})
// 获取订单的中文名
const getOrderTypeLabel = (orderType) =>
  app.proxy.interpretOrderType(orderType) + "订单"

// 设定row_key方便多选
const getRowKey = (row) => (row.order_id)
// 获取所有订单
const getOrdersList = async () => {
  if (route.path === '/orders') {
    try {
      const data = await api.getOrdersData(
        currentOrderType.value,
        orderingQuery.value,
        filterObject.value, currentPage.value
      );
      tableData.value = data.results;
      itemsCount.value = data.count;
      getOrdersFailCount.value = 0
    } catch (err) {
      getOrdersFailCount.value = (getOrdersFailCount.value + 1) % 1000000
      if (getOrdersFailCount.value >= 3) {
        tableData.value = [];
        app.proxy.$message({
          type: "error",
          message: "获取订单数据失败",
        });
      }
    }
  }
}
// 获取单个订单
const getCurrentOrder = async (order_id, type) => {
  try {
    const data = await api.getOrder(order_id, type);
    operateOrderForm.value = data;
    // console.log("单个订单", operateOrderForm.value.target_type);
  } catch (err) {
    operateOrderForm.value = [];
    app.proxy.$message({
      type: "error",
      message: "获取订单数据失败",
    });
    throw err;
  }
}
let intervalId;
// 防抖函数，暂停轮询
const debounceFetchOrders = app.proxy.debounce(() => {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (!drawer.value && !editingColumn.value && !editingRow.value) {
      getOrdersList();
    }
  }, 3000)
}, 3000);
// 定时获取订单数据
const fetchOrders = () => {
  if (!drawer.value && !editingColumn.value && !editingRow.value) {
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
  // 获取路由中的订单类型参数
  const type = route.query.type as any;
  if (type) {
    currentOrderType.value = type;
  }
  else {
    currentOrderType.value = "All";
    router.push({ query: { type: currentOrderType.value } })
  }
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
// 当订单类型变化时，清空排序、筛选、页码、多选
watch(currentOrderType, () => {
  clearSort();
  clearSelection();
  clearFilter();
  router.push({ query: { type: currentOrderType.value } })
  editingRow.value = null;
  editingColumn.value = null;
  currentPage.value = 1;
  itemsCount.value = 0
  tableData.value = [];
  fetchOrders();
});
// 排序变化
const handleSortChange = (sort) => {
  var { prop, order } = sort;
  if (order === "ascending") orderingQuery.value = prop;
  if (order === "descending") orderingQuery.value = "-" + prop;
  if (order === null) orderingQuery.value = "";
  fetchOrders();
}
// 筛选变化
const handleFilterChange = (filter) => {
  filterObject.value = filter;
  currentPage.value = 1;
  itemsCount.value = 0
  tableData.value = [];
  fetchOrders();
}
// 页码变化
const handleCurrentPageChange = (val) => {
  currentPage.value = val;
  fetchOrders();
}
// 多选变化
const handleSelectionChange = (selection) => {
  tableSelection.value = selection;
  ordersSelection.value = selection.map(item => item.order_id);
  selectionCount.value = selection.length;
}
// 清空排序
const clearSort = () => {
  tableRef.value.clearSort();
}
// 清空多选
const clearSelection = () => {
  tableRef.value.clearSelection();
}
// 清空筛选
const clearFilter = () => {
  filterRef.value.resetFilterForm();
  currentPage.value = 1;
  fetchOrders
}
// 点击表头
const handleHeaderClick = (column) => {
  console.log(column)
}
// 关闭抽屉
const handleDrawerClose = () => {
  if (drawerType.value === 1) {
    orderRef.value.resetOrderForm();
    publicRef.value.resetOrderForm();
  }
  if (drawerType.value === 3) {
    relate_time.value = []
  }
  drawer.value = false;
}
// 点击手动关联按钮
const handleOrdersRelate = async () => {
  operateOrderForm.value = {}
  // operateOrderType.value = app.proxy.translateOrderType(row.order_type)
  try {
    // await getCurrentOrder(row.order_id, operateOrderType.value);
    drawerType.value = 3;
    drawer.value = true;
  } catch {
    operateOrderForm.value = {};
  }
}
// 提交手动关联
const handleManualRelate = async () => {

  if (drawerType.value === 3) {
    var selection = tableSelection.value.map(item => ({ order_id: item.order_id, order_type: item.order_type }))
    try {
      await api.manualRelate(selection, relate_time.value);
      app.proxy.$message({
        type: "success",
        message: "操作成功",
      });
      fetchOrders();
      handleDrawerClose();
    }
    catch (err) {
      app.proxy.$message({
        type: "error",
        message: "添加关联",
      });
      console.log(err)
    }
  }
}
// 点击编辑订单按钮
async function handleOrdersEdit(row) {
  operateOrderForm.value = {};
  operateOrderType.value = app.proxy.translateOrderType(row.order_type);
  try {
    await getCurrentOrder(row.order_id, operateOrderType.value);
    drawerType.value = 1;
    drawer.value = true;
  } catch {
    operateOrderForm.value = {};
  }
}
// 提交订单
const handleOrdersSubmit = async () => {

  if (drawerType.value === 1) {
    // 检查公共订单是否通过了验证
    const publicResult = await publicRef.value.submitOrderForm()
    if (publicResult === false) {
      console.log('公共订单没有通过验证')
    }
    const orderResult = await orderRef.value.submitOrderForm()
    if (orderResult === false) {
      console.log('订单没有通过验证')
    }
    // 所有订单通过前端验证
    if (orderResult && publicResult) {
      console.log('前端验证通过')
      Object.assign(operateOrderForm.value, orderResult, publicResult)
      console.log("提交编辑的订单", operateOrderForm.value)
      try {
        await api.editOrders(operateOrderForm.value.order_id, operateOrderForm.value, operateOrderType.value);
        app.proxy.$message({
          type: "success",
          message: "操作成功",
        });
        fetchOrders();
        handleDrawerClose();
      }
      catch (err) {
        app.proxy.handleErrors(err);
      }

    }
  }
}

// 点击删除订单按钮
const handleOrdersDelete = async (row) => {
  try {
    await app.proxy.$confirm("是否确定删除该订单", "删除订单", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    app.proxy.$message({
      type: "info",
      message: "已取消删除",
    });
    return;
  }

  try {
    operateOrderType.value = app.proxy.translateOrderType(row.order_type);
    await api.deleteOrders(row.order_id, operateOrderType.value);

    app.proxy.$message({
      type: "success",
      message: "删除成功!",
    });
  } catch (err) {
    app.proxy.$message({
      type: "error",
      message: err.detail,
    });
  } finally {
    fetchOrders();
  }
}
// 高亮订单
const handleOrdersHighlight = async (row) => {

  try {
    await api.highlightOnMap(row.order_type, row.order_id);

  } catch (err) {
    app.proxy.$message({
      type: "error",
      message: "操作失败",
    });
  }
}
// 批量置顶
const handleBulkTop = async () => {
  // 检查是否有选中的订单
  if (ordersSelection.value.length === 0) {
    app.proxy.$message({
      type: "info",
      message: "请至少选择一个订单",
    });
    return;
  }
  try {
    await api.bulkTopOrders(ordersSelection.value);
    app.proxy.$message({
      type: "success",
      message: "置顶成功!",
    });
    clearSelection();
  } catch {
    app.proxy.$message({
      type: "error",
      message: "置顶失败",
    });
  } finally {
    fetchOrders();
  }
}
// 批量取消置顶
const handleBulkCancelTop = async () => {
  // 检查是否有选中的订单
  if (ordersSelection.value.length === 0) {
    app.proxy.$message({
      type: "info",
      message: "请至少选择一个订单",
    });
    return;
  }
  try {
    await api.bulkCancelTopOrders(ordersSelection.value);
    app.proxy.$message({
      type: "success",
      message: "已重置所选订单优先级!",
    });
    clearSelection();
  } catch {
    app.proxy.$message({
      type: "error",
      message: "操作失败",
    });
  } finally {
    fetchOrders();
  }
}
// 批量关闭
const handleBulkClose = async () => {
  // 检查是否有选中的订单
  if (ordersSelection.value.length === 0) {
    app.proxy.$message({
      type: "info",
      message: "请至少选择一个订单",
    });
    return;
  }
  try {
    await api.bulkCloseOrders(ordersSelection.value);
    app.proxy.$message({
      type: "success",
      message: "关闭订单成功!",
    });
    clearSelection();
  } catch {
    app.proxy.$message({
      type: "error",
      message: "操作失败",
    });
  } finally {
    fetchOrders();
  }
}
// 批量删除
const handleBulkDelete = async () => {
  // 检查是否有选中的订单
  if (ordersSelection.value.length === 0) {
    app.proxy.$message({
      type: "info",
      message: "请至少选择一个订单",
    });
    return;
  }
  try {
    await app.proxy.$confirm("是否确定删除这些订单", "批量删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    app.proxy.$message({
      type: "info",
      message: "已取消删除",
    });
    return;
  }

  try {
    await api.bulkDeleteOrders(ordersSelection.value);
    app.proxy.$message({
      type: "success",
      message: "删除成功!",
    });
    clearSelection();
  } catch {
    app.proxy.$message({
      type: "error",
      message: "删除失败",
    });
  } finally {
    fetchOrders();
  }
}
// 清空需求
const handleClearDemands = async () => {
  try {
    await app.proxy.$confirm("是否确定清空所有订单", "清空订单", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    app.proxy.$message({
      type: "info",
      message: "已取消操作",
    });
    return;
  }

  try {
    await api.clearDemands();
    app.proxy.$message({
      type: "success",
      message: "清空成功!",
    });
    clearSelection();
  } catch {
    app.proxy.$message({
      type: "error",
      message: "操作失败",
    });
  } finally {
    currentPage.value = 1;
    fetchOrders();
  }
}
// 改变优先级
const handleSortValueChange = async (row, value) => {
  operateOrderType.value = app.proxy.translateOrderType(row.order_type)
  try { await api.topOrders(row.order_id, operateOrderType.value, value) }
  catch {
    app.proxy.$message({
      type: "error",
      message: "修改优先级失败",
    });
  } finally {
    fetchOrders();
  }
}
// 改变受理人ID
const handleAcceptChange = async (row, value) => {
  acceptRef.value.blur();
  inputStatus.value = false
  console.log(row.order_id, "的受理人变为", value)
  exitEditing();
  operateOrderType.value = app.proxy.translateOrderType(row.order_type)
  try { await api.changeAcceptOrders(row.order_id, operateOrderType.value, value) }
  catch {
    app.proxy.$message({
      type: "error",
      message: "发送订单失败",
    });
  } finally {
    fetchOrders();
  }
}
// 改变受理人批复
const handleReplyChange = async (row, value) => {
  replyRef.value.blur();
  inputStatus.value = false
  console.log(row.order_id, "的批复变为", value)
  exitEditing();
  operateOrderType.value = app.proxy.translateOrderType(row.order_type)
  try { await api.changeReplyOrders(row.order_id, operateOrderType.value, row.accept_id, value) }
  catch {
    app.proxy.$message({
      type: "error",
      message: "批复失败",
    });
  } finally {
    fetchOrders();
  }
}
// 进入编辑模式
let editTimeout = null;

// 进入编辑模式
const enterEditing = (row, column) => {
  editingRow.value = row.order_id;
  editingColumn.value = column.property;
  nextTick(() => {
    if (column.property === 'accept_reply') {
      replyRef.value.focus();
      inputStatus.value = true;
    }
    if (column.property === 'accept_id') {
      acceptRef.value.focus();
      inputStatus.value = true;
    }
  });
  clearTimeout(editTimeout); // 清除计时器
  editTimeout = setTimeout(() => {
    if (row.order_id === editingRow.value && column.property === editingColumn.value) {
      exitEditing();
    }
  }, 3000);
}
// 退出编辑模式
const exitEditing = () => {
  if (!inputStatus.value) {
    editingRow.value = null;
    editingColumn.value = null;
    console.log('退出编辑模式')
    // fetchOrders();
  }

};
// 判断是否为编辑模式
const isEditing = (row, column) => {
  return editingRow.value === row.order_id && editingColumn.value === column.property;
};

// 双击表格
const handleRowDblclick = async (row, column, event) => {
  // 若为允许的列，进入编辑模式
  if (column.property === 'accept_reply' || column.property === 'accept_id' || column.property === 'sort_topvalue') {
    enterEditing(row, column);
  }
  // 双击订单类型，在控制台输出订单
  if (column.property === 'order_type') {
    console.log(row);
  }
  // 双击订单状态，在控制台输出订单JSON
  if (column.property === 'order_status') {
    console.log(JSON.stringify(row));
  }
  // 双击订单名称复制
  if (column.property === 'order_name') {
    try {
      // await navigator.clipboard.writeText(row.order_id);
      const textArea = document.createElement('textarea');
      textArea.value = row.order_id;
      textArea.style.position = 'fixed';  // 避免影响页面布局
      textArea.style.opacity = '0';  // 隐藏文本区域
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      app.proxy.$message({
        type: "success",
        message: "已复制订单ID到剪贴板",
      });
      document.body.removeChild(textArea);
    } catch (err) {
      app.proxy.$message({
        type: "error",
        message: "复制订单ID失败",
      });
    }
  }
  // // 双击优先级，进入编辑模式
  // if (column.property === 'sort_topvalue') {
  //   isEditing.value = true
  //   console.log("bianjimoshi", isEditing.value)
  // }
};
</script>

<style scoped lang="less">
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