<template>
  <panelTitleA1 style="z-index:11" :config="{ width: 160 }">{{ selectedTitle }}
    <el-icon @click="showChoices = !showChoices">
      <ArrowDown />
    </el-icon>
    <template v-if="showChoices">
      <template v-for="title in titles">
        <div v-if="title !== selectedTitle" @click="handleSelect" class="bg-black bg-opacity-50">{{ title }}</div>
      </template>
    </template>
  </panelTitleA1>
  <echartsInit :chartOption="state.chartOption" class="py-6"></echartsInit>
</template>
<script setup>
import * as api from '@/api'
const emits = defineEmits(['updateNow'])
const titles = reactive(['订单统计预测', '需求统计预测'])
const selectedTitle = ref('需求统计预测')
const showChoices = ref(false)
const handleSelect = (e) => {
  selectedTitle.value = e.target.innerText
  showChoices.value = false
  emits('updateNow')
}
// 当selectedTitle更改时更新数据
watchEffect(() => {
  // if (selectedTitle.value === '新增订单情况') {
  //   state.chartData.data = [[123, 76, 23, 34, 86, 97, 43, 12], [256, 189, 215, 198, 234, 210, 220, 201], [236, 13, 213, 18, 234, 20, 220, 201], [236, 183, 23, 198, 214, 215, 250, 111], [256, 139, 212, 158, 22, 210, 20, 101]]
  //   state.chartData.legend = ['起飞', '领航', '打击', '侦察', '降落']
  //   state.chartOption.update = true
  //   processData()
  // }
  // if (selectedTitle.value === '新增任务情况') {
  //   state.chartData.data = [[230, 210, 220, 179, 123, 120, 132, 135], [301, 334, 390, 330, 300, 240, 235, 336]]
  //   state.chartData.legend = ['订单', '需求']
  //   state.chartOption.update = true
  //   processData()
  // }
})

// watchEffect(() => {
//   if (selectedTitle.value === '新增订单情况') {
//     state.chartData.data[0] = [123, 76, 23, 34, 86, 97, 43, 12]
//     state.chartData.data[1] = [256, 189, 215, 198, 234, 210, 220, 201];
//     state.chartData.data[2] = [236, 13, 213, 18, 234, 20, 220, 201];
//     state.chartData.data[3] = [236, 183, 23, 198, 214, 215, 250, 111];
//     state.chartData.data[4] = [256, 139, 212, 158, 22, 210, 20, 101];
//     state.chartData.legend = ['起飞', '领航', '打击', '侦察', '降落']
//     state.chartOption.update = true
//     processData()
//   }
//   if (selectedTitle.value === '新增任务情况') {
//     state.chartData.data[0] = [230, 210, 220, 179, 123, 120, 132, 135]
//     state.chartData.data[1] = [301, 334, 390, 330, 300, 240, 235, 336];
//     state.chartData.legend = ['订单', '需求', '打击', '侦察', '降落']
//     state.chartOption.update = true
//     processData()
//   }
// })
const state = reactive({
  chartData: {
    legend: ['起飞', '领航', '打击', '侦察', '降落'],
    xAxis: ['02-12', '02-13', '02-14', '02-15', '02-16', '02-17', '02-18', '预测'],
    colors: ['#409eff',
      '#67c23a', '#f56c6c', '#e6a23c', '#909399'],
    data: [
      [230, 210, 220, 179, 123, 120, 132, 135],
      [301, 334, 390, 330, 300, 240, 235, 336],
      [301, 334, 390, 330, 300, 240, 235, 136], [301, 334, 390, 330, 300, 240, 235, 336],
      [301, 334, 390, 330, 300, 240, 235, 136],
    ],
  },
  chartOption: {}
})

const processData = () => {
  let legend = state.chartData.legend,
    colors = state.chartData.colors,
    xAxis = state.chartData.xAxis,
    data = state.chartData.data,
    processedData = []
  legend.forEach((item, i) => {
    let lastDataPoint = data[i][data[i].length - 1];
    processedData.push({
      name: legend[i],
      type: 'line',
      itemStyle: {
        color: colors[i],
        borderRadius: 5
      },
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: $c.fade(colors[i], .9)
        }, {
          offset: 0.8,
          color: $c.fade(colors[i], .1)
        }], false),
        shadowcolor: $c.fade(colors[i], .3),
        shadowBlur: 10
      },
      markPoint: {
        data: [
          {
            xAxis: data[i].length - 1, yAxis: lastDataPoint, name: '预测值', label: {
              show: true,
              formatter: function (params) {
                return params.data.yAxis
              },
              position: 'inside'
            }
          }]
      },
      data: data[i]
    })
  })
  state.chartOption.series = processedData;
  state.chartOption.xAxis.data = xAxis;
  state.chartOption.legend.data = legend;
}

const processOption = () => {
  state.chartOption = {
    update: false,
    animation: true, // 开启动画
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      show: true,
      data: [],
      top: "5",
      right: 10,
    },
    grid: {
      left: '1%',
      right: '10%',
      bottom: '5%',
      top: "15%",
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: { align: 'right' },
      splitLine: {
        show: true
      },
      boundaryGap: ['0%', '0%']
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLabel: { interval: 0, align: 'center' },
      axisLine: {
        show: true
      },
      axisTick: {
        show: true,
        alignWithLabel: true
      },
      splitLine: {
        show: true
      }
    },
    series: []
  }
  processData()
}

const updateValue = async (dateRange, regionRange, isNow) => {
  var data = []

  if (selectedTitle.value === '订单统计预测') {
    await api.getOrderCreation(dateRange, regionRange).then(res => {
      const attackOrderValues = Object.values(res.AttackOrder).map(value => parseFloat(value.toFixed(2)))
      const reconOrderValues = Object.values(res.ReconOrder).map(value => parseFloat(value.toFixed(2)))
      const tkoffOrderValues = Object.values(res.TkoffOrder).map(value => parseFloat(value.toFixed(2)))
      const landOrderValues = Object.values(res.LandOrder).map(value => parseFloat(value.toFixed(2)))
      const naviOrderValues = Object.values(res.NaviOrder).map(value => parseFloat(value.toFixed(2)))

      state.chartData.xAxis = Object.keys(res.AttackOrder).map(date => {
        // 如果日期有"1天"，就去掉这两个字
        if (date.includes('1天')) {
          date = date.replace('1天', '')
        }
        // 如果有横杠，就去掉第一个横杠及以前的部分
        if (date.includes('-')) {
          date = date.substring(date.indexOf('-') + 1)
        }
        return date
      })
      data = [tkoffOrderValues, naviOrderValues, attackOrderValues, reconOrderValues, landOrderValues]
      state.chartData.legend = ['起飞', '领航', '打击', '侦察', '降落']

      if (JSON.stringify(state.chartData.data) !== JSON.stringify(data) || isNow) {
        state.chartData.data = data
        processData();
        state.chartOption.update = true
      }
    })
  }
  if (selectedTitle.value === '需求统计预测') {
    await api.getDemandCreation(dateRange, regionRange).then(res => {
      const taskDemandValues = Object.values(res['任务类']).map(value => parseFloat(value.toFixed(2)))
      const dispatchDemandValues = Object.values(res['调度类']).map(value => parseFloat(value.toFixed(2)))

      state.chartData.xAxis = Object.keys(res['任务类']).map(date => {
        // 如果日期有"1天"，就去掉这两个字
        if (date.includes('1天')) {
          date = date.replace('1天', '')
        }
        // 如果有横杠，就去掉第一个横杠及以前的部分
        if (date.includes('-')) {
          date = date.substring(date.indexOf('-') + 1)
        }
        return date
      })
      data = [taskDemandValues, dispatchDemandValues]
      state.chartData.legend = ['任务类', '调度类']

      if (JSON.stringify(state.chartData.data) !== JSON.stringify(data) || isNow) {
        state.chartData.data = data
        processData();
        state.chartOption.update = true
      }
    })
  }

}
onMounted(() => {
  processOption();
})

defineExpose({
  updateValue
})
</script>

<style lang="less">
.panelTitleA1 .block-text {
  padding: 0
}
</style>
