<template>
  <div class="okr-risk-widget">
    <div class="risk-header">
      <el-select v-model="selectedMonth" size="small" style="width: 120px">
        <el-option label="2026年3月" value="2026-03" />
        <el-option label="2026年4月" value="2026-04" />
      </el-select>
      <el-select v-model="selectedDept" placeholder="选择部门" size="small" style="width: 120px">
        <el-option label="全部" value="" />
        <el-option label="销售部" value="销售部" />
      </el-select>
      <el-button link type="primary">查看全部</el-button>
    </div>

    <div class="risk-info">
      <el-tooltip content="当前所选周期和所选组织/部门内，各个状态的目标数量" placement="top">
        <span class="risk-info-text">当前所选周期和所选组织/部门内，各个状态的目标数量</span>
      </el-tooltip>
    </div>

    <div class="chart-area">
      <div class="donut-chart">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e8e8e8" stroke-width="24" />
          <circle
            v-for="(seg, i) in segments"
            :key="i"
            cx="100" cy="100" r="80"
            fill="none"
            :stroke="seg.color"
            stroke-width="24"
            :stroke-dasharray="seg.dashArray"
            :stroke-dashoffset="seg.offset"
            stroke-linecap="round"
          />
        </svg>
        <div class="donut-center">
          <div class="donut-value">{{ riskData.total }}</div>
          <div class="donut-label">目标总数</div>
        </div>
      </div>

      <div class="chart-labels">
        <div v-for="item in labelItems" :key="item.label" class="label-item">
          {{ item.label }} {{ item.percent }}%
        </div>
      </div>
    </div>

    <div class="legend">
      <span v-for="item in legendItems" :key="item.label" class="legend-item">
        <span class="legend-dot" :style="{ background: item.color }"></span>
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockRiskData } from '../../mock'

const riskData = ref(mockRiskData)
const selectedMonth = ref('2026-03')
const selectedDept = ref('')

const legendItems = [
  { label: '不在进度', color: '#4B7BEC' },
  { label: '预警', color: '#26C6DA' },
  { label: '进度中', color: '#66BB6A' },
  { label: '超预期', color: '#FFA726' },
]

const segments = computed(() => {
  const total = riskData.value.total
  if (total === 0) return []
  const circumference = 2 * Math.PI * 80
  const values = [
    { value: riskData.value.overExpected, color: '#FFA726' },
    { value: riskData.value.noProgress, color: '#4B7BEC' },
    { value: riskData.value.warning, color: '#26C6DA' },
    { value: riskData.value.inProgress, color: '#66BB6A' },
  ]
  let offset = circumference * 0.25
  return values.map(v => {
    const len = (v.value / total) * circumference
    const seg = {
      color: v.color,
      dashArray: `${len} ${circumference - len}`,
      offset: -offset,
    }
    offset += len
    return seg
  })
})

const labelItems = computed(() => {
  const total = riskData.value.total
  if (total === 0) return []
  return [
    { label: '超预期', percent: Math.round(riskData.value.overExpected / total * 100) },
    { label: '不在进度', percent: Math.round(riskData.value.noProgress / total * 100) },
    { label: '进度中', percent: Math.round(riskData.value.inProgress / total * 100) },
    { label: '预警', percent: Math.round(riskData.value.warning / total * 100) },
  ]
})
</script>

<style scoped lang="scss">
.risk-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.risk-info {
  margin-bottom: 16px;

  .risk-info-text {
    font-size: 12px;
    color: #999;
    background: #333;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
  }
}

.chart-area {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 16px 0;
}

.donut-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 16px;

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;

  .donut-value {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .donut-label {
    font-size: 12px;
    color: #999;
  }
}

.chart-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;

  .label-item {
    font-size: 12px;
    color: #666;
  }
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
