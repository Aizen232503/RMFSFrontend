<template>
  <echartsInit :chartOption="state.chartOption"></echartsInit>
</template>
<script setup>
import * as api from '@/api'
const emits = defineEmits(['updateNow'])

const state = reactive({
  chartData: {
    legend: ['数量', '平均处理时间'],
    yAxis: ['打击订单', '侦察订单', '起飞订单', '降落订单', '领航订单'],
    colors: ['#f56c6c', '#e6a23c', '#409eff', '#909399',
      '#67c23a'],
    data: [
      [320, 302, 341, 374, 354],
      [-320, -302, -341, -374, -354],
    ],
  },
  chartOption: {}
})

const processData = () => {
  let { legend, colors, yAxis, data } = state.chartData,
    processedData = [];
  legend.forEach((item, i) => {
    processedData.push({
      name: legend[i],
      type: 'bar',
      barWidth: 10,
      stack: 'Total',
      label: {
        color: "#fff",
        show: true,
        formatter: function (params) {
          return Math.abs(params.value).toString().replace(/(\.\d{1,2})\d*$/, '$1'); // 返回绝对值
        },
      },
      emphasis: {
        focus: 'series'
      },
      data: data[i].map((value, index) => ({
        value: value,
        itemStyle: {
          color: colors[index],
          borderRadius: 3
        }
      }))
    })
  })
  state.chartOption.legend.data = legend;
  state.chartOption.series = processedData;
  state.chartOption.yAxis.data = yAxis;
}

const processOption = () => {
  state.chartOption = {
    update: false,
    // title:{ text:"barA", left:200, top:0, textStyle:{ color:$c.gyl3, fontSize:16, fontWeight:"normal" }, },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        let result = '';
        params.forEach(item => {
          let value = Math.abs(item.value).toString().replace(/(\.\d{1,2})\d*$/, '$1');
          let unit = item.value < 0 ? '秒' : '';
          result += `${item.seriesName}: ${value}${unit}<br/>`;
        });
        return result;
      }
    },
    legend: {
      right: '10',
      top: '10',
      show: false,
    },
    // legend: {
    //   right: '10',
    //   top: '10',
    //   show: true,
    //   data: [
    //     { name: '数量', icon: 'rect' },
    //     { name: '平均处理时间（秒）', icon: 'rect' }
    //   ]
    // },
    grid: {
      left: '5%',
      right: '10%',
      bottom: '8%',
      top: "15%",
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        align: 'center',
        interval: 0, formatter: function (value) {
          return Math.abs(value); // 返回绝对值
        },
      }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      axisTick: {
        show: false
      },
      data: [],
      axisLabel: {
        formatter: '{value}',
        align: 'right'
      }
    }

  }
  processData();
}

const updateValue = async (dateRange, regionRange, isNow) => {
  try {
    const [res1, res2] = await Promise.all([
      api.getOrderSum(dateRange, regionRange),
      api.getProcessTime(dateRange, regionRange)
    ]);

    var data = [
      [res1['AttackOrder'], res1['ReconOrder'], res1['TkoffOrder'], res1['LandOrder'], res1['NaviOrder']],
      [-res2['任务'], - res2['任务'], -res2['起飞'], -res2['降落'], - res2['领航']]
    ];

    if (JSON.stringify(state.chartData.data) !== JSON.stringify(data) || isNow) {
      state.chartData.data = data;
      processData();
      state.chartOption.update = true;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
  // await api.getOrderSum(dateRange, regionRange).then(res => {
  //   var data = [
  //     [res['TkoffOrder'], res['NaviOrder'], res['AttackOrder'], res['ReconOrder'], res['LandOrder']
  //     ]]
  //   if (JSON.stringify(state.chartData.data) !== JSON.stringify(data) || isNow) {
  //     state.chartData.data = data
  //     processData();
  //     state.chartOption.update = true
  //   }
  // })
}
onMounted(() => {
  processOption();
})

defineExpose({
  updateValue
})
</script>
<style lang="less"></style>
