<template>
  <el-container>
    <el-aside class="aside" width="auto">
      <common-aside ref="aside"></common-aside>
    </el-aside>
    <el-container>
      <el-header class="header">
        <common-header ref="header" :style="{ height: '80px !important' }"></common-header>
      </el-header>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import CommonAside from "@/components/CommonAside.vue";
import CommonHeader from "@/components/CommonHeader.vue";
import { useUserStore } from "@/store/user";
import { useRoute, useRouter } from 'vue-router';
const userStore = useUserStore()
</script>

<style lang="less" scoped>
.el-container {
  height: 1080;
  padding: 0;
  margin: 0;
}

.aside {
  padding: 0;
  margin: 0;
  // height: 100vh;
  height: 1080;
  overflow: hidden;
}

.header {
  padding: 0;
  margin: 0;
}

.main {
  // height: calc(100vh-80px);
  height: 1000px;
  overflow-x: hidden;
}
</style>