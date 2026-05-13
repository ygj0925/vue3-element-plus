<template>
  <div class="okr-overview-widget">
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">填写率</div>
        <div class="stat-value">{{ stats.fillRate }}%</div>
        <div :class="['stat-change', stats.fillRateChange >= 0 ? 'up' : 'down']">
          较上周期 {{ stats.fillRateChange >= 0 ? '+' : '' }}{{ stats.fillRateChange }}%
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill red" :style="{ width: stats.fillRate + '%' }"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">对齐率</div>
        <div class="stat-value">{{ stats.alignRate }}%</div>
        <div :class="['stat-change', stats.alignRateChange >= 0 ? 'up' : 'down']">
          较上周期 {{ stats.alignRateChange >= 0 ? '+' : '' }}{{ stats.alignRateChange }}%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">低质量OKR占比率</div>
        <div class="stat-value">{{ stats.lowQualityRate }}%</div>
        <div :class="['stat-change', stats.lowQualityRateChange >= 0 ? 'up' : 'down']">
          较上周期 {{ stats.lowQualityRateChange >= 0 ? '+' : '' }}{{ stats.lowQualityRateChange }}%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">OKR平均进度</div>
        <div class="stat-value">{{ stats.avgProgress }}%</div>
        <div :class="['stat-change', stats.avgProgressChange >= 0 ? 'up' : 'down']">
          较上周期 {{ stats.avgProgressChange >= 0 ? '+' : '' }}{{ stats.avgProgressChange }}%
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill green" style="width: 100%"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">进度更新率 (7天)</div>
        <div class="stat-value">{{ stats.updateRate }}%</div>
        <div :class="['stat-change', stats.updateRateChange >= 0 ? 'up' : 'down']">
          较上周期 {{ stats.updateRateChange >= 0 ? '+' : '' }}{{ stats.updateRateChange }}%
        </div>
      </div>
    </div>

    <div class="overview-filters">
      <el-select v-model="selectedPeriod" placeholder="选择周期" size="small" style="width: 120px">
        <el-option label="2026-04" value="2026-04" />
        <el-option label="2026-03" value="2026-03" />
      </el-select>
      <el-select v-model="selectedDept" placeholder="选择部门" size="small" style="width: 120px">
        <el-option label="全部" value="" />
        <el-option label="产品部" value="产品部" />
        <el-option label="设计部" value="设计部" />
      </el-select>
      <el-button link type="primary" @click="overviewVisible = true">查看全部</el-button>
    </div>

    <OKROverviewDialog v-model="overviewVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockOKRStats } from '../../mock'
import OKROverviewDialog from '../OKROverviewDialog.vue'

const stats = ref(mockOKRStats)
const selectedPeriod = ref('2026-04')
const selectedDept = ref('')
const overviewVisible = ref(false)
</script>

<style scoped lang="scss">
.stats-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 100px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 11px;
  margin-bottom: 6px;

  &.up { color: #52c41a; }
  &.down { color: #ff4d4f; }
}

.stat-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;

  .stat-bar-fill {
    height: 100%;
    border-radius: 2px;

    &.red { background: #ff4d4f; }
    &.green { background: #52c41a; }
    &.blue { background: var(--el-color-primary); }
  }
}

.overview-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
