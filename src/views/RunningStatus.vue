<template>
  <div class="gif-container">
    <img src="../../0_status.gif" alt="运行状态" />
  </div>
</template>

<script setup>
</script>

<style scoped lang="less">
.gif-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* 让内容垂直居中 */
  background-color: #f5f5f5;
  /* 可选：设置背景颜色 */
}

img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 确保 GIF 图片适应容器 */
}
</style>