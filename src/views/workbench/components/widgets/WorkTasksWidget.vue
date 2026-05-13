<template>
  <div class="work-tasks-widget">
    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task-row">
        <el-checkbox :model-value="task.status === 'completed'" class="task-check" />
        <span class="task-name">{{ task.name }}</span>
        <span :class="['task-priority', task.priority]">
          {{ priorityLabel(task.priority) }}
        </span>
      </div>
      <div v-if="tasks.length === 0" class="empty">
        <el-empty description="暂无任务" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockWorkTasks } from '../../mock'

const tasks = ref(mockWorkTasks)

function priorityLabel(p: string) {
  const map: Record<string, string> = { high: '紧急', normal: '普通', low: '低' }
  return map[p] || p
}
</script>

<style scoped lang="scss">
.task-list {
  min-height: 100px;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child { border-bottom: none; }
}

.task-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-priority {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;

  &.high { background: #fff2f0; color: #ff4d4f; }
  &.normal { background: #f0f0f0; color: #666; }
  &.low { background: #f6ffed; color: #52c41a; }
}

.empty {
  padding: 20px 0;
}
</style>
