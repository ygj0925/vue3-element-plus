<template>
  <div class="insights-widget">
    <div class="insights-header">
      <el-button link type="primary" size="small">
        <el-icon><Document /></el-icon>
        预警提醒历史
      </el-button>
    </div>
    <div class="insights-content">
      <el-empty description="暂无内容" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.insights-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.insights-content {
  min-height: 80px;
  padding: 20px 0;
}
</style>
