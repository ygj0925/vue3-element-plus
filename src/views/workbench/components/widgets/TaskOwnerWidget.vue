<template>
  <div class="task-owner-widget">
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
          />
        </svg>
        <div class="donut-center">
          <div class="donut-value">{{ total }}</div>
          <div class="donut-label">总任务</div>
        </div>
      </div>
    </div>

    <div class="legend">
      <span v-for="item in data" :key="item.name" class="legend-item">
        <span class="legend-dot" :style="{ background: item.color }"></span>
        {{ item.name }} ({{ item.count }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const data = [
  { name: '张曼曼', count: 3, color: '#4B7BEC' },
  { name: '刘子龙', count: 2, color: '#26C6DA' },
  { name: '刘倩倩', count: 4, color: '#66BB6A' },
  { name: '刘风', count: 1, color: '#FFA726' },
]

const total = computed(() => data.reduce((sum, d) => sum + d.count, 0))

const segments = computed(() => {
  const circumference = 2 * Math.PI * 80
  let offset = circumference * 0.25
  return data.map(d => {
    const len = (d.count / total.value) * circumference
    const seg = {
      color: d.color,
      dashArray: `${len} ${circumference - len}`,
      offset: -offset,
    }
    offset += len
    return seg
  })
})
</script>

<style scoped lang="scss">
.chart-area {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.donut-chart {
  position: relative;
  width: 160px;
  height: 160px;

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
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .donut-label {
    font-size: 11px;
    color: #999;
  }
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
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
