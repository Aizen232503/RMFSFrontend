<template>
  <div class="screenA-counterGrid">
    <aYinTechBorderB3 :config="borderConfig(index)" v-for="(value, key, index) in state.data">
      <div class="inner-content">
        <div class="block-title">{{ key }} <span v-if="key.unit">({{ key.unit }})</span></div>
        <div class="total">
          <!-- <i :class="[key.icon, 'icon']"></i> -->
          <!-- <DigitalTransform class="numbers" :value="123210"  :interval="$vuex.state.globalConfig.ani?3000:0"></DigitalTransform> -->
          <DigitalTransform class="numbers" :value="value" :useGrouping="true" :interval="3000">
          </DigitalTransform>
          <!-- <span class="unit">{{key.unit}}</span> -->
        </div>
      </div>
    </aYinTechBorderB3>
    <!-- <div class="block" > <div class="bdTechBottom"></div> </div> -->
  </div>
</template>
<script setup>

import * as api from '@/api'
const emits = defineEmits(['updateNow'])

const state = reactive({
  data: {
    '任务需求': 0,
    '分段任务需求': 0,
    '部署需求': 0,
    '返航降落': 0,
  }
})

const borderConfig = (index) => {
  let rotate
  if (index == 0) {
    rotate = "x";
  } else if (index == 1) {
    rotate = "all";
  } else if (index == 2) {
    rotate = null;
  } else if (index == 3) {
    rotate = "y";
  }
  return {
    dur: 3,
    opacity: 0.7,
    // decoration: false,
    rotate
  }
}
const updateValue = async (dateRange, regionRange, isNow) => {
  // await api.getDemandType(dateRange, regionRange).then(res => {
  //   var data = res
  //   if (JSON.stringify(state.data) !==  JSON.stringify(data)||isNow) {
  //     state.data = data
  //   }
  await api.demandTypeCount(dateRange, regionRange).then(res => {
    var data = {

      '任务需求': res['打击需求'] + res['侦察需求'] + res['机场无人机打击'] + res['机场无人机侦察'] + res['待战区无人机打击'] + res['待战区无人机侦察'],
      '分段任务需求': res['机场无人机打击'] + res['机场无人机侦察'] + res['待战区无人机打击'] + res['待战区无人机侦察'],
      '部署需求': res['部署'] + res['地空部署'] + res['空空部署'],
      '返航降落': res['就近降落'] + res['远距降落'] + res['降落需求'],
      // 任务需求: res['打击需求'] + res['侦察需求'] + res['机场无人机打击'] + res['机场无人机侦察'] + res['待战区无人机打击'] + res['待战区无人机侦察'],
      // 部署需求: res['部署'] + res['地空部署'] + res['空空部署'],
      // 返航降落: res['就近降落'] + res['远距降落'] + res['降落需求'],
      // 其他需求: res['近距转场任务'] + res['远距转场任务'] + res['在地待战机调整'] + res['在空待战机调整'] + res['起飞需求'] + res['领航需求'],
    }
    if (JSON.stringify(state.data) !== JSON.stringify(data) || isNow) {
      state.data = data
    }
  })
}
onMounted(() => {
})

defineExpose({
  updateValue
})
</script>
<style lang="less">
.screenA-counterGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  height: 100%;
  grid-template-rows: repeat(2, 1fr);
  grid-gap: 12px;
  position: relative;

  .aYinTechBorderB3 {
    padding: 0;
    position: relative;

    //&:nth-child(1){ grid-area: 1 / 1 / 2 / 3;  }
    .inner-content {
      .block-title {
        position: absolute;
        .ff("AliHYAiHei");
        left: 0;
        right: 0;
        text-align: center;
        top: 10px;
        .fc(var(--font-normal));
        font-size: 14px;
      }

      .total {
        margin: 0;
        text-align: center;
        line-height: 30px;
        .poa;
        left: 0;
        right: 0;
        top: 60%;
        .fixc("y");

        i {
          display: inline-block;
          font-size: 32px;
          vertical-align: text-top;
          margin-right: 10px;
          .fc(var(--font-normal));
        }

        .numbers {
          display: inline-block;
          text-align: center;
          font-size: 32px;
          .ff("AliHYAiHei");
          position: relative;
          vertical-align: text-top;
          .fc(var(--font-strong));

          .badge {
            position: absolute;
            left: 100%;
            top: -10px;
            font-size: 14px;
            width: 30px;
            height: 30px;
            padding: 0;
            line-height: 1;
          }
        }

        .unit {
          font-size: 14px;
          margin: 0 0 0 10px;
          .fc(var(--font-strong));
        }
      }
    }
  }
}
</style>
