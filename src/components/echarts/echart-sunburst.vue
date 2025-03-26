<template>
  <panelTitleA1 style="z-index:11" :config="{ width: 160 }">订单主题统计
  </panelTitleA1>
  <echartsInit :chartOption="state.chartOption"></echartsInit>
</template>
<script setup>
import * as api from '@/api'
const emits = defineEmits(['updateNow'])

const { proxy } = getCtx();
const state = reactive({
  fontColor: '#ff0000',
  subFontColor: $c.cbl3,
  chartData: {
    title: "分主题统计",
    colors: [$c.grl4, $c.cyl4, $c.inl4, $c.pil4, $c.rel4],
    data: [
      {
        name: '打击',
        children: [
          {
            name: '计划式', value: 123,
          },
          {
            name: '临机式', value: 90,
          }
        ]
      },
      {
        name: '起飞', children: [
          {
            name: '日常执勤', value: 230,
          },
          {
            name: '应急疏散', value: 55,
          },
          {
            name: '前出待命', value: 55,
          },
          {
            name: '前出待战', value: 55,
          },
          {
            name: '近距空中支援', value: 55
          },
          {
            name: '拦截空中目标', value: 55
          },
          {
            name: '打击时敏目标', value: 55
          },
          {
            name: '打击固定目标', value: 55
          }
        ]
      },
      {
        name: '领航', children: [
          {
            name: '出航',
            children: [
              {
                name: '日常执勤', value: 10,
              },
              {
                name: '应急疏散', value: 20,
              },
              {
                name: '前出待命', value: 27,
              },
              {
                name: '前出待战', value: 33,
              },
              {
                name: '近距空中支援', value: 55
              },
              {
                name: '拦截空中目标', value: 35
              },
              {
                name: '打击时敏目标', value: 25
              },
              {
                name: '打击固定目标', value: 25
              }
            ]
          },
          {
            name: '返航', children: [
              {
                name: '执勤返航', value: 12,
              },
              {
                name: '返航降落', value: 15,
              },
              {
                name: '应急降落', value: 12,
              },
              {
                name: '补充燃油', value: 12,
              },
              {
                name: '补充弹药', value: 1
              },
              {
                name: '换装', value: 3
              }
            ]
          }
        ]
      },
      {
        name: '侦察', children: [
          {
            name: '计划式', value: 230,
          },
          {
            name: '临机式', value: 55,
          }
        ]
      },
      {
        name: '降落', children: [
          {
            name: '执勤返航', value: 230,
          },
          {
            name: '返航降落', value: 55,
          },
          {
            name: '应急降落', value: 55,
          },
          {
            name: '补充燃油', value: 55,
          },
          {
            name: '补充弹药', value: 55
          },
          {
            name: '换装', value: 55
          }
        ]
      }
    ],
    // dataMax: 300
  },
  chartOption: {},
  dataOri: []
})

const { dataOri, fontColor, subFontColor } = toRefs(state)

const mapLinkAction = (data, time) => {
  const { chartData } = state
  data.forEach((item, i) => {
    if (time == 1 && item.value) {
      let rmdval = i * proxy.randomNumber(time * 10, 100)
      item.value = rmdval
      chartData.dataMax += rmdval
    } else if (item.value) {
      delete item.value
    }
    if (item.children && item.children.length > 0) {
      const num = time - 1
      mapLinkAction(item.children, num)
    }
  })
}

const processData = () => {
  const { colors, data } = state.chartData;
  let processedData = [],
    type = "bar",
    yAxisIndex = 0;
  processedData.push({
    type: 'sunburst',
    data: data,
    radius: [20, '90%'],
    center: ['53%', '53%'],
    itemStyle: {
      borderRadius: 7,
      borderWidth: 2,
      borderColor: $c.bll9,
    },
    label: {
      show: true,
      color: fontColor,
      fontSize: 12,
      rotate: 'radial'//文字旋转
      // formatter: function (param) {
      //   return param.name+'\n'+param.value
      // }
    },
    emphasis: {
      label: {
        show: true,
        fontSize: '16',
        color: $c.wh,
        formatter: function (param) {
          return param.name + '\n' + param.value
        }
      }
    },
    levels: [{
      label: { rotate: 'radial' }, // 第一层的标签沿着半径方向竖直排列
    },
    {
      label: { rotate: 'tangential' }, // 第二层的标签沿着边缘方向排列
    }, {
      label: { rotate: 'radial' }, // 第二层的标签沿着边缘方向排列
    },
    {
      label: { rotate: 'radial' }, // 第二层的标签沿着边缘方向排列
    }]
  })
  state.chartOption.series = processedData;
}

const processOption = () => {
  const { dataMax, colors } = state.chartData
  state.chartOption = {
    update: false,
    title: {
      text: "点击数据可下钻", subtext: "", right: 20, bottom: 0,
      textStyle: { color: subFontColor, fontSize: 12, fontWeight: "normal" },
    },

    series: []
  }
  processData();
}

const updateValue = async (dateRange, regionRange, isNow) => {
  await api.getOrderType(dateRange, regionRange).then(res => {
    var data = res
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
