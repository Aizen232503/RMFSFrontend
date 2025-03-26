<template>
  <div id="root-techui" class="root-BG">
    <el-config-provider :value-on-clear="null" :empty-values="[undefined, null]">
      <adaptivePanel :config="{ width: 1920, height: 1080, backgroundName: 'A1', loading: false }">
        <router-view></router-view>
      </adaptivePanel>
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import { storeToRefs } from "pinia"
defineComponent({
  name: "App",
});
</script>

<style lang="less">
html,
body,
#app,
#root-techui {
  max-width: 3440px;
  height: 100%;
  margin: 0;
  padding: 0;
}

html,
body,
p,
h3 {
  margin: 0;
  padding: 0;
}

// 修复文字选择和复制
.adaptivePanel>.adaptiveObject.userSelect-dis {
  user-select: auto !important;
}

input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0;
  appearance: textfield;
  -moz-appearance: textfield;
}

// 去除此刻
.el-button.el-button--small.is-text.el-picker-panel__link-btn {
  display: none !important;
}
</style>