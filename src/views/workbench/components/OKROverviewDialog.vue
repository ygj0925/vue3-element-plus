<template>
  <el-dialog
    v-model="visible"
    title=""
    width="80%"
    destroy-on-close
    class="okr-overview-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">
          OKR概况
          <el-tooltip content="查看全部OKR概况数据" placement="top">
            <el-icon class="info-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </span>
        <div class="dialog-filters">
          <el-select v-model="selectedPeriod" size="small" style="width: 140px">
            <el-option label="2027年2月" value="2027-02" />
            <el-option label="2026年4月" value="2026-04" />
            <el-option label="2026年3月" value="2026-03" />
          </el-select>
          <el-select v-model="selectedDept" placeholder="选择部门" size="small" style="width: 140px" multiple collapse-tags>
            <el-option label="产品部" value="产品部" />
            <el-option label="设计部" value="设计部" />
            <el-option label="人事部" value="人事部" />
          </el-select>
          <el-button link type="primary">查看全部</el-button>
        </div>
      </div>
    </template>

    <div class="overview-stats">
      <div class="stat-card">
        <div class="stat-label">填写率</div>
        <div class="stat-value">100%</div>
        <div class="stat-change up">较上周期 +100%</div>
        <div class="stat-bar"><div class="fill red" style="width: 100%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">对齐率</div>
        <div class="stat-value">0.0%</div>
        <div class="stat-change">较上周期 +0%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">低质量OKR占比率</div>
        <div class="stat-value">0.0%</div>
        <div class="stat-change">较上周期 +0%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">OKR平均进度</div>
        <div class="stat-value">-10%</div>
        <div class="stat-change down">较上周期 -10%</div>
        <div class="stat-bar"><div class="fill green" style="width: 100%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">进度更新率 (7天)</div>
        <div class="stat-value">0.0%</div>
        <div class="stat-change">较上周期 +0%</div>
      </div>
    </div>

    <div class="overview-chart" v-if="showChart">
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
          />
        </svg>
        <div class="donut-center">
          <div class="donut-value">200</div>
          <div class="donut-label">目标总数</div>
        </div>
      </div>
      <div class="chart-legend">
        <span v-for="item in legendItems" :key="item.label" class="legend-item">
          <span class="legend-dot" :style="{ background: item.color }"></span>
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="overview-actions">
      <el-button type="primary">批量提醒</el-button>
      <el-button>下载报表</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column type="selection" width="40" />
      <el-table-column prop="department" label="部门" min-width="100" />
      <el-table-column prop="leader" label="负责人" width="80" />
      <el-table-column prop="headCount" label="人数" width="60" />
      <el-table-column prop="unalignedCount" label="未对齐人数" width="100">
        <template #default="{ row }">
          <el-button link type="primary">{{ row.unalignedCount }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="alignRate" label="对齐率" width="80">
        <template #default="{ row }">{{ row.alignRate }}%</template>
      </el-table-column>
      <el-table-column prop="reminderCount" label="提醒次数" width="80" />
      <el-table-column prop="lastReminderTime" label="上次提醒时间" width="120" />
      <el-table-column label="操作" width="100">
        <template #default>
          <el-button link type="primary" size="small">提醒负责人</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { mockDepartmentAlign } from '../mock'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const selectedPeriod = ref('2027-02')
const selectedDept = ref<string[]>([])
const showChart = ref(true)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(4234)

const tableData = ref(mockDepartmentAlign)

const legendItems = [
  { label: '不在进度', color: '#4B7BEC' },
  { label: '预警', color: '#26C6DA' },
  { label: '进度中', color: '#66BB6A' },
  { label: '超预期', color: '#FFA726' },
]

const segments = computed(() => {
  const circumference = 2 * Math.PI * 80
  const values = [
    { value: 25, color: '#FFA726' },
    { value: 25, color: '#4B7BEC' },
    { value: 25, color: '#26C6DA' },
    { value: 25, color: '#66BB6A' },
  ]
  let offset = circumference * 0.25
  return values.map(v => {
    const len = (v.value / 100) * circumference
    const seg = {
      color: v.color,
      dashArray: `${len} ${circumference - len}`,
      offset: -offset,
    }
    offset += len
    return seg
  })
})
</script>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;

  .info-icon {
    font-size: 16px;
    color: #999;
  }
}

.dialog-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;

  &.up { color: #52c41a; }
  &.down { color: #ff4d4f; }
}

.stat-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;

  .fill {
    height: 100%;
    border-radius: 2px;
    &.red { background: #ff4d4f; }
    &.green { background: #52c41a; }
  }
}

.overview-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
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
  }
  .donut-label {
    font-size: 12px;
    color: #999;
  }
}

.chart-legend {
  display: flex;
  gap: 20px;
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

.overview-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
