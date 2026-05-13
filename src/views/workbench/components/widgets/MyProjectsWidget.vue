<template>
  <div class="my-projects-widget">
    <div class="projects-header">
      <el-button link type="primary">查看全部</el-button>
    </div>
    <div class="projects-content">
      <el-empty description="暂无内容" :image-size="60">
        <el-button type="primary" size="small">创建项目</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.projects-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.projects-content {
  min-height: 80px;
  padding: 20px 0;
}
</style>
