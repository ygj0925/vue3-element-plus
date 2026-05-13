<template>
  <div class="my-focus-widget">
    <div class="tab-bar">
      <span
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @click="activeTab = tab.value"
      >{{ tab.label }}</span>
    </div>

    <div class="focus-content">
      <template v-if="activeTab === 'okr'">
        <div v-if="okrList.length === 0" class="empty-state">
          <el-empty description="暂无内容，可在OKR里面添加" :image-size="60" />
        </div>
        <div v-else v-for="item in okrList" :key="item.id" class="okr-item">
          {{ item.title }}
        </div>
      </template>
      <template v-else-if="activeTab === 'task'">
        <el-empty description="暂无内容" :image-size="60" />
      </template>
      <template v-else>
        <el-empty description="暂无内容" :image-size="60" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('okr')
const tabs = [
  { label: 'OKR', value: 'okr' },
  { label: '任务', value: 'task' },
  { label: '项目', value: 'project' },
]

const okrList = ref<any[]>([])
</script>

<style scoped lang="scss">
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.tab-item {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f7ff;
    color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary);
    color: #fff;
  }
}

.focus-content {
  min-height: 100px;
}

.empty-state {
  padding: 20px 0;
}

.okr-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
  color: #333;
}
</style>
