<template>
  <echartsInit :chartOption="state.chartOption"></echartsInit>
</template>
<script setup>
import * as api from '@/api'
const emits = defineEmits(['updateNow'])

const state = reactive({
  chartData: {
    title: "订单规划情况",
    legend: ['任务订单', '起降订单', '领航订单'],
    colors: [$c.aql4, $c.cyl4, $c.cbl3],
    colorsD: [$c.aql8, $c.cyl8, $c.bll8],
    data: [0, 0, 0],
    radius: ["50%", "50%", "50%"],
    position: [
      ['17%', '55%'],
      ['50%', '55%'],
      ['83%', '55%'],
    ],
  },
  chartOption: {}
})

const processData = () => {
  const { legend, colors, colorsD, data, radius, position } = state.chartData;
  let processedData = [],
    type = "bar",
    yAxisIndex = 0;
  legend.forEach((item, i) => {
    processedData.push({
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      center: position[i],
      radius: radius[i],
      pointer: { show: false },
      title: { fontSize: 14 },
      itemStyle: {
        color: colors[i],
        shadowColor: colors[i],
      },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {}
      },
      detail: {
        width: 50,
        height: 14,
        borderColor: 'inherit',
        borderRadius: 20,
        borderWidth: 0,
        formatter: function (value) {
          return '{value|' + value.toFixed(1) + '}{unit|%}';
        },
        rich: {
          value: { fontSize: 24, color: colors[i], fontWeight: 'bolder' },// color: '#999',
          unit: { fontSize: 12, color: $c.darken(colors[i], 1), }
        }
      },
      axisLine: {
        lineStyle: { color: [[1, $c.darken(colors[i], 4)]], width: 10 }
      },
      splitLine: { show: false, distance: 0, length: 10 },
      axisTick: { show: false },
      axisLabel: { show: false, distance: 50 },
      data: [
        {
          value: data[i],
          name: legend[i],
          title: { color: $c.lighten(colors[i], 1), offsetCenter: ['0%', '30%'] },
          detail: { valueAnimation: false, offsetCenter: ['0', '-30%'] }
        }
      ],
    })

  })
  state.chartOption.series = processedData;
}

const processOption = () => {
  state.chartOption = {
    update: false,
    series: []
  }
  processData()
}

const updateValue = async (dateRange, regionRange, isNow) => {
  await api.getOrderStatus(dateRange, regionRange).then(res => {
    // const caculateCount = (type) => Object.values(res[type]).reduce((a, b) => a + b, 0);
    const caculateCount = (type) => res[type]['总数']
    const caculateFinish = (type) => res[type]['已完成'] + res[type]['规划成功'];


    var data1 = caculateCount('Order') === 0 ? 0 : caculateFinish('Order') / caculateCount('Order') * 100

    var data2 = caculateCount('AttackOrder') + caculateCount('ReconOrder') === 0 ? 0 : (caculateFinish('AttackOrder') + caculateFinish('ReconOrder')) / (caculateCount('AttackOrder') + caculateCount('ReconOrder')) * 100

    var data3 = caculateCount('TkoffOrder') + caculateCount('NaviOrder') + caculateCount('LandOrder') === 0 ? 0 : (caculateFinish('TkoffOrder') + caculateFinish('NaviOrder') + caculateFinish('LandOrder')) / (caculateCount('TkoffOrder') + caculateCount('NaviOrder') + caculateCount('LandOrder')) * 100

    var data4 = caculateCount('NaviOrder') === 0 ? 0 : caculateFinish('NaviOrder') / (caculateCount('NaviOrder')) * 100

    var data = [data2, data3, data4]
    if (JSON.stringify(state.chartData.data) !== JSON.stringify(data) || isNow) {
      state.chartData.data = data
      processData();
      state.chartOption.update = true
    }
  })
}
onMounted(() => {
  processOption();
})

defineExpose({
  updateValue
})
</script>

<style lang="less"></style>
