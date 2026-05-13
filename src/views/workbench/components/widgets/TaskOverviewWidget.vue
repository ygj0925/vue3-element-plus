<template>
  <div class="task-overview-widget">
    <div class="overview-info">
      <el-tooltip content="在当前所选周期和所选组织/部门内的OKR任务，显示任务的完成数量、逾期未完成数量等信息" placement="top">
        <span class="info-badge">在当前所选周期和所选组织/部门内的OKR任务，显示任务的完成数量、逾期未完成数量等信息</span>
      </el-tooltip>
    </div>

    <div class="overview-filters">
      <el-select v-model="selectedPeriod" size="small" style="width: 120px">
        <el-option label="选择周期" value="" />
        <el-option label="2026-04" value="2026-04" />
      </el-select>
      <el-select v-model="selectedDept" placeholder="选择部门" size="small" style="width: 120px">
        <el-option label="全部" value="" />
      </el-select>
      <el-button link type="primary">查看全部</el-button>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">总数</div>
        <div class="stat-value">{{ stats.total }}个</div>
        <div class="stat-bar blue"></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">周期完成</div>
        <div class="stat-value">{{ stats.periodCompleted }}个</div>
        <div class="stat-bar blue"></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">周期创建</div>
        <div class="stat-value">{{ stats.periodCreated }}个</div>
        <div class="stat-bar blue"></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">未完成</div>
        <div class="stat-value">{{ stats.uncompleted }}个</div>
        <div class="stat-bar red"></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">逾期未完成</div>
        <div class="stat-value">{{ stats.overdueUncompleted }}个</div>
        <div class="stat-bar green"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockTaskOverview } from '../../mock'

const stats = ref(mockTaskOverview)
const selectedPeriod = ref('')
const selectedDept = ref('')
</script>

<style scoped lang="scss">
.overview-info {
  margin-bottom: 12px;

  .info-badge {
    font-size: 12px;
    color: #fff;
    background: #333;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.overview-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  min-width: 80px;

  .stat-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 6px;
  }

  .stat-bar {
    height: 4px;
    width: 60px;
    border-radius: 2px;

    &.blue { background: var(--el-color-primary); }
    &.red { background: #ff4d4f; }
    &.green { background: #52c41a; }
  }
}
</style>
