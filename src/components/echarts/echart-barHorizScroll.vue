<template>
  <echartsInit :chartOption="state.chartOption"></echartsInit>
</template>
<script setup>
import * as api from '@/api'
const emits = defineEmits(['updateNow'])
const base64Img = "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAMAAADWZboaAAAAZlBMVEUAAABe3uVe3+Vf3uVf3+Zf3uVg3+Zg3+Zf3+Vi4OZh4OZg3+Z86/Bh3+Zi4Odj4Odi4OZ86/B76/B86/Bj4ed56+9x5+xn4umB7/N87PB36e+A7/N+7fF/7vJ/7vJ+7fGA7/OB7/PReX+lAAAAIXRSTlMABQkVDREmIhk3MR10LEFFPHh7cUprXE35h2XnqMLAp+mHAG9cAAAB5ElEQVRIx83WjU7CMBQFYIoiKMqU/XUboHv/l/Tce7t2XamDNSacETEmX86tlK2rx4py150o+MstMBLwWRfHKo6JCVxLnvmFGBjFQ58oF1//sUZhGy/ClSTWObgnL4O+bkeN4nY2okfNMbkRt9/vtxz8InoTsWplJSCzFxPmO8+GpSIByX3YQAuGDWtRKhKjCnxDXhF6Z4yxnZ20Wgko7BMRDmxtSGVaI4kdTIgb+zTYoJQlIMlDlmUFgrcDWWC201qSayqlTkiCddWWeV62VU0YlnpRi9VOKaSUsiyq/N0krwq2Ugt7lVpZl5BfHNiytjagMi+XYp0kCR45hMlivVQrE/uU5pXSrCB5bM6d1t2lOZItMqmliT3q5uVxqxzyW/ccfYLNKx7ZTeykMvNyac2yt2Fbc61MHLSC0rwoxbiNdlQ3GBm1NLHQsHUrtEXppR/ljNpW6DbSCoqlFiVoN6YdaFlgsSFVPs1BdT8OaB5QyQzVcaqWDows/zepxR8ObLglTrdtCRVuRNj4Rrxh+//0ke2f8KVL+Kon3GCSbmsJN9OUW3j6g0Ns+LgCij2u0h+Sghc8mlMPBMgdx5DFh59VmOVHrvmDnoNxCz3J7MFWsMuaLyR089xz/xhlfijvwutR8gv3zk6BLUUeCgAAAABJRU5ErkJggg=="
const state = reactive({
  chartData: {
    // yAxis: ['待匹配', '匹配中', '执行中', '已完成', '已失败'],
    yAxis: ['未规划', '规划成功', '已完成', '已失败'],
    color: [$c.cyl4, $c.orl5, $c.rel5],
    data: [0, 0, 0, 0],
    order_count: 0
  },
  chartOption: {}
})


const fillArr = computed(() => {
  return (new Array(state.chartData.data.length)).fill(orderCount.value);
})

const getSymbolData = (data) => {
  let arr = [];
  for (var i = 0; i < data.length; i++) {
    arr.push({
      value: data[i],
      symbolPosition: 'end'
    })
  }
  return arr;
}

const processData = () => {
  let legend = state.chartData.legend,
    colors = state.chartData.colors,
    yAxis = state.chartData.yAxis,
    data = state.chartData.data,
    processedData = [];
  state.chartOption.yAxis.data = state.chartData.yAxis;
  state.chartOption.series[0].data = state.chartData.data;
  state.chartOption.series[1].data = fillArr;
  state.chartOption.series[2].data = getSymbolData(state.chartData.data);
  dataScroll();
}

const processOption = () => {
  state.chartOption = {
    update: false,
    title: {
      show: false,
      // text: '实时流速图2',
      textStyle: {
        color: $c.cbl5,
        fontSize: 16,
        fontWeight: "normal"
      },
    },
    grid: {
      top: '15%',
      left: '18%',
      right: '18%',
      bottom: '5%'
    },
    tooltip: { show: false },
    xAxis: {
      type: 'value',
      min: 0,
      max: state.chartData.order_count,
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false }
    },
    dataZoom: {
      yAxisIndex: 0,
      show: false,
      type: "slider",
      startValue: 0,
      endValue: 5,
    },
    yAxis: {
      //show: false,
      type: 'category',
      inverse: true,
      splitLine: { show: false, },
      axisLine: { show: false },
      axisLabel: {
        show: true,
        interval: 0,
        margin: 10,
        fontSize: 12,
        width: 50,
        lineHeight: 14,
        overflow: "breakAll",
        fontWeight: 'normal',
      },
      axisTick: { show: false },
      data: []
    },
    series: [
      {
        type: 'bar',
        barWidth: '40%',
        animationDuration: 500,
        itemStyle: {
          borderWidth: 0,
          borderRadius: 10,
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [{ offset: 0, color: $c.cyl8, }, { offset: 1, color: $c.cyl4, }]
          }
        },
        label: { show: false, },
        data: [],
        z: 0
      },
      {
        type: 'bar',
        barWidth: '40%',
        barGap: '-100%',
        animation: false,
        itemStyle: {
          borderWidth: 0,
          borderRadius: 5,
          color: 'rgba(0,202,255,0.2)'
        },
        label: {
          show: true,
          position: ['101%', '20%'],
          color: "#e89d41",
          fontSize: 14,
          fontWeight: 'normal',
          formatter: (params) => {
            return ' ' + (state.chartData.data[params.dataIndex]) + ' / ' + state.chartData.order_count;
          }
        },
        data: [],
        z: 0
      },
      {
        type: 'pictorialBar',
        animation: true,
        // animationThreshold: 3000 ,
        animationDuration: 1000,
        // animationDurationUpdate:500,
        symbol: base64Img,
        symbolSize: [50, 50],
        symbolOffset: [0, 0],
        z: 12,
        itemStyle: {
          color: '#fff'
        },
        data: []
      },
    ]
  }
  processData();
}
const { proxy } = getCtx();
const dataScroll = () => {
  // proxy.$timer("dataScrollBarHorizA", () => {
  //   let { data } = state.chartData
  //   let { dataZoom } = state.chartOption
  //   if (dataZoom.endValue == data.length) {
  //     dataZoom.endValue = 5;
  //     dataZoom.startValue = 0;
  //   } else {
  //     dataZoom.endValue++;
  //     dataZoom.startValue++;
  //   }
  //   state.chartOption.update = true
  //   dataScroll()
  // }, 5000)
}
const updateDataZoom = () => {
  let { data } = state.chartData
  let { dataZoom } = state.chartOption
  if (dataZoom.endValue == data.length) {
    dataZoom.endValue = 5;
    dataZoom.startValue = 0;
  } else {
    dataZoom.endValue++;
    dataZoom.startValue++;
  }
  state.chartOption.update = true
}
const orderCount = ref(100)
const updateValue = async (dateRange, regionRange, isNow) => {
  await api.getDemandStatus(dateRange, regionRange).then(res => {
    // const caculateCount = (type) => Object.values(res[type]).reduce((a, b) => a + b, 0);
    // var order_count = caculateCount('Order')
    // var data = Object.values(res['Order'])
    var data = [res['待规划'], res['规划成功'], res['已完成'], res['已失败']]
    // var data = [110, 20, 30, 40]
    var order_count = data.reduce((a, b) => a + b, 0)
    if (JSON.stringify(state.chartData.data) !== JSON.stringify(data) || isNow) {
      state.chartData.data = data
      orderCount.value = order_count
      state.chartData.order_count = order_count
      state.chartOption.xAxis.max = order_count
      processData();
      state.chartOption.update = true
      updateDataZoom()
    }
  })
}
onMounted(() => {
  processOption();
})

defineExpose({
  updateValue
})
onBeforeMount(() => {
  // proxy.$timer("dataScrollBarHorizA")
})
</script>
<style lang="less"></style>