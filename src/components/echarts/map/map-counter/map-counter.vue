<template>
  <div class="map-counter-wrap">
    <div class=" font-[AliHYAiHei] text-3xl">
      <span class=" mr-4">{{ currentDate }}</span>
      <span class=" mr-4">{{ currentWeekday }}</span>
      <div class=" mt-4">{{ currentTime }}</div>
    </div>
    <p class=" mt-1" v-if="!dateRange">统计时间：所有时间</p>
    <p class=" mt-1" v-if="dateRange">统计时间:{{ dateRange[0] }}至{{
      dateRange[1] }}
    </p>
    <p class=" mt-1" v-if="!ifRegion()">统计区域：所有区域</p>
    <p class=" mt-1" v-if="ifRegion()">统计区域：已设置</p>
  </div>
</template>
<script setup lang="ts">
// import echartLine from "./echart-line.vue"
import { ref, onMounted, onUnmounted } from 'vue';
import { useStatisticsStore } from "@/store/statistics";
import { useTimeStore } from "@/store/time";

import { storeToRefs } from 'pinia';

const timeStore = useTimeStore()
const { currentWeekday, currentDate, currentTime
} = storeToRefs(timeStore);

const app = getCurrentInstance() as any
const statisticsStore = useStatisticsStore();
const {
  create_time_before,
  create_time_after,
  dateRange,
  polygon_vertx1_longitude,
  polygon_vertx1_latitude,
  polygon_vertx2_longitude,
  polygon_vertx2_latitude,
  polygon_vertx3_longitude,
  polygon_vertx3_latitude,
  polygon_vertx4_longitude,
  polygon_vertx4_latitude,
  circle_longitude,
  circle_latitude,
  circle_radius,
} = storeToRefs(statisticsStore);
const ifRegion = () => {
  if (polygon_vertx3_longitude.value) {
    return true
  } else {
    return false
  }

}

const state = reactive({
  counterList: [
    { name: "软件年盈利", num: 394, unit: "万元", barColor: $c.rel3 },
    { name: "硬件年盈利", num: 42558, unit: "万元", barColor: $c.yel3 },
    { name: "服务年盈利", num: 50262, unit: "万元" },
    { name: "安全年盈利", num: 50262, unit: "万元" },
  ]
})

</script>
<style lang="less">
.counter-item-re() {
  .bgc(fade(@red9, 90%));

  .name {
    .fc(@rer4);

    .unit {
      .fc(@rer4);
    }
  }

  .content {

    .num,
    .num .plus {
      .fc(@rer4);
    }
  }
}

.counter-item-ye() {
  .bgc(fade(@yed9, 90%));

  .name {
    .fc(@yer5);

    .unit {
      .fc(@yer5);
    }
  }

  .content {

    .num,
    .num .plus {
      .fc(@yer5);
    }
  }
}


.map-counter-wrap {
  .poa;
  left: 44%;
  .fixc("x");
  top: 3%;
  z-index: 10;

  .counter-item {
    width: 190px;
    display: inline-block;
    .bgc(fade(@bll9, 80%));
    height: 60px;
    margin: 0 20px 0 0;
    padding: 10px 0 0 10px;
    position: relative;
    .bdr(5px);

    .name {
      .fc(var(--font-normal));
      font-size: 12px;
      .ff("AliHYAiHei");
      z-index: 1;
      .poa;
      left: 5px;
      top: 5px;

      .unit {
        font-size: 12px;
      }
    }

    .content {
      .fc(var(--font-normal));
      .poa;
      right: 5px;
      top: 5px;

      .num {
        font-size: 18px;
        .por;
        .ff(impact);
        .fc(var(--font-normal));

        .plus {
          .poa;
          left: 101%;
          top: -5px;
          font-size: 12px;
          .fc(var(--font-normal));
          font-weight: normal;
          .ff("arial");
        }
      }
    }

    .echartsInit-wrap {
      .poa !important;
      left: 0;
      right: 0;
      bottom: 0;
      height: 25px !important;
      min-height: 25px !important;
    }

    &:nth-child(1) {
      .counter-item-re;
    }

    &:nth-child(2) {
      .counter-item-ye;
    }

    &:nth-child(3) {}

    &:last-child {
      margin: 0;
    }
  }
}
</style>
