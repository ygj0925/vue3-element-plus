<template>
  <div class="okr-widget">
    <div class="okr-header">
      <el-select v-model="selectedPeriod" size="small" style="width: 100px">
        <el-option label="2026-04" value="2026-04" />
        <el-option label="2026-03" value="2026-03" />
      </el-select>
      <el-select v-model="selectedScope" size="small" style="width: 100px">
        <el-option label="我的OKR" value="mine" />
        <el-option label="全部" value="all" />
      </el-select>
      <el-button link type="primary">查看全部</el-button>
    </div>

    <div class="okr-list">
      <div v-for="item in okrItems" :key="item.id" class="okr-item">
        <div class="okr-item-header">
          <el-avatar :size="28" class="owner-avatar">{{ item.owner[0] }}</el-avatar>
          <span class="okr-title">{{ item.title }}</span>
        </div>
        <div class="okr-progress">
          <span class="owner-name">{{ item.owner }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: item.progress + '%', background: getProgressColor(item.progress) }"></div>
          </div>
          <span class="progress-label">KR</span>
        </div>
      </div>
      <div v-if="okrItems.length === 0" class="empty">
        <el-empty description="暂无OKR" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockOKRItems } from '../../mock'

const selectedPeriod = ref('2026-04')
const selectedScope = ref('mine')
const okrItems = ref(mockOKRItems)

function getProgressColor(progress: number) {
  if (progress >= 70) return '#52c41a'
  if (progress >= 40) return '#1890ff'
  return '#ff4d4f'
}
</script>

<style scoped lang="scss">
.okr-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.okr-list {
  min-height: 80px;
}

.okr-item {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child { border-bottom: none; }
}

.okr-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.owner-avatar {
  background: #1890ff;
  color: #fff;
  font-size: 12px;
  flex-shrink: 0;
}

.okr-title {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.okr-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 36px;
}

.owner-name {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-label {
  font-size: 11px;
  color: #ccc;
}

.empty {
  padding: 20px 0;
}
</style>
