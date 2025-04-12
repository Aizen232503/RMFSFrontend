<template>
  <div>
    <div class="params-title">初始化配置</div>
    <el-row style="margin-top:50px">
      <el-col :span="8" v-for="title in paramsTitles">
        <parameters-board :title="title" :info="paramsInfo[title]"
          style="width:400px;height:250px;margin:auto"></parameters-board>
      </el-col>
    </el-row>
  </div>
  <div style="margin-top:50px;display:flex;justify-content: center;gap:200px;">
    <techButtonA2 :config="buttonConfig" @click="updateParams" type="primary">保存配置</techButtonA2>
    <techButtonA2 :config="buttonConfig" @click="getParams" type="info">取消更改</techButtonA2>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import axios from 'axios'
import eventBus from '@/utils/eventBus';

import { useUserStore } from "@/store/user";
import { useParamsStore } from '@/store/params'

import ParametersBoard from '@/components/ParametersBoard.vue'
import { initializeSystem } from '../../mock/index.ts'

const userStore = useUserStore()

const paramsStore = useParamsStore()
const { params, savedParams, paramsInfo
} = storeToRefs(paramsStore)

// 计算标题
const paramsTitles = ref(Object.keys(paramsInfo.value))
const app = getCurrentInstance() as any
import * as api from "@/api/";
const getParams = async () => {
  // console.log('当前参数', params.value, '保存的参数', savedParams.value)

  params.value = JSON.parse(JSON.stringify(savedParams.value))
  // try {
  //   const data = await api.getParams(
  //   );
  //   params.value = data
  // } catch (err) {
  //   app.proxy.$message({
  //     type: "error",
  //     message: "获取参数失败",
  //   });
  // }
}
const buttonConfig = reactive(
  {
    decorationColorAlt: true,
    scaleAction: false,
    decorationLength: 19,
    glow: true,
    caretDistance: 5,
    caretWidth: 5,
    normal: { fc: "#ffffff" }
  }
)
// 进入页面时自动获取参数
onMounted(() => {
  getParams()
})

const updateParams = async () => {
  // console.log('当前参数', params.value, '保存的参数', savedParams.value)
  savedParams.value = JSON.parse(JSON.stringify(params.value))
  app.proxy.$message({
    type: "success",
    message: "初始化配置成功",
  });
  eventBus.emit('initializeSystem', { orderCount: 0, robotCount: 10000 });
  // console.log(params.value)
  // try {
  //   await api.updateParams(params.value)
  //   app.proxy.$message({
  //     type: "success",
  //     message: "更新参数成功",
  //   });
  // } catch (err) {
  //   app.proxy.$message({
  //     type: "error",
  //     message: "更新参数失败",
  //   });
  // }
  // getParams()
}
</script>

<style scoped lang="less">
.params-title {
  text-align: center;
  /* 文本居左 */
  font-size: 20px;
  /* 字体大小 */
  font-weight: bold;
  /* 字体加粗 */
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>