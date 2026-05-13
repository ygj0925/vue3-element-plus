<template>
  <div class="calendar-widget">
    <div class="cal-controls">
      <div class="view-toggle">
        <span :class="['toggle-btn', { active: viewMode === 'week' }]" @click="viewMode = 'week'">周</span>
        <span :class="['toggle-btn', { active: viewMode === 'month' }]" @click="viewMode = 'month'">月</span>
      </div>
      <div class="date-nav">
        <el-icon class="nav-btn" @click="navigatePrev"><ArrowLeft /></el-icon>
        <span class="date-range">{{ dateRangeText }}</span>
        <el-icon class="nav-btn" @click="navigateNext"><ArrowRight /></el-icon>
      </div>
      <span class="today-link" @click="goToday">今天</span>
    </div>

    <div class="week-view">
      <div class="week-header">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          :class="['week-cell', { today: day.isToday }]"
        >
          <span :class="['day-num', { 'today-num': day.isToday }]">{{ day.date }}</span>
          <span class="day-label">({{ day.label }})</span>
        </div>
      </div>
      <div class="week-body">
        <div v-for="day in weekDays" :key="day.dateStr" class="week-col">
          <div
            v-for="task in getTasksForDate(day.dateStr)"
            :key="task.id"
            class="task-item"
          >
            <span class="dot">·</span>{{ task.name }}
          </div>
          <div v-if="hasNoTasks(day.dateStr) && day.isToday" class="no-plan">
            <p>本月还没有规划工作任务</p>
            <el-button type="primary" size="small" @click="showTaskCreate = true">规划任务</el-button>
          </div>
          <div class="add-btn" @click="showTaskCreate = true">+ 添加任务</div>
        </div>
      </div>
    </div>

    <TaskCreateForm v-if="showTaskCreate" @close="showTaskCreate = false" @create="onCreateTask" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { mockCalendarTasks } from '../../mock'
import TaskCreateForm from '../TaskCreateForm.vue'

const viewMode = ref<'week' | 'month'>('week')
const currentDate = ref(new Date())
const showTaskCreate = ref(false)
const tasks = ref([...mockCalendarTasks])

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  date.setHours(0, 0, 0, 0)
  return date
}

const weekDays = computed(() => {
  const monday = getMonday(currentDate.value)
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      date: d.getDate(),
      label: weekLabels[i],
      dateStr: formatDate(d),
      isToday: formatDate(d) === formatDate(today),
    }
  })
})

const dateRangeText = computed(() => {
  const monday = getMonday(currentDate.value)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return `${String(monday.getMonth() + 1).padStart(2, '0')}/${String(monday.getDate()).padStart(2, '0')}-${String(sunday.getMonth() + 1).padStart(2, '0')}/${String(sunday.getDate()).padStart(2, '0')}`
})

function navigatePrev() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 7)
  currentDate.value = d
}

function navigateNext() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 7)
  currentDate.value = d
}

function goToday() {
  currentDate.value = new Date()
}

function getTasksForDate(dateStr: string) {
  return tasks.value.filter(t => t.date === dateStr)
}

function hasNoTasks(dateStr: string) {
  return getTasksForDate(dateStr).length === 0
}

function onCreateTask(task: { name: string }) {
  tasks.value.push({ id: Date.now(), name: task.name, date: formatDate(currentDate.value), type: 'todo' })
  showTaskCreate.value = false
}
</script>

<style scoped lang="scss">
.cal-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.view-toggle {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  .toggle-btn {
    padding: 4px 12px;
    font-size: 13px;
    cursor: pointer;
    color: #606266;
    background: #fff;

    &.active {
      background: var(--el-color-primary);
      color: #fff;
    }
  }
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 8px;

  .nav-btn {
    cursor: pointer;
    color: #606266;
    font-size: 14px;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .date-range {
    font-size: 13px;
    color: #333;
    min-width: 90px;
    text-align: center;
  }
}

.today-link {
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}

.week-view {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e4e7ed;
}

.week-cell {
  padding: 10px 4px;
  text-align: center;
  font-size: 13px;
  border-right: 1px solid #e4e7ed;

  &:last-child { border-right: none; }

  .day-num {
    font-weight: 600;
    margin-right: 2px;

    &.today-num {
      background: var(--el-color-primary);
      color: #fff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
  }

  .day-label {
    color: #999;
    font-size: 12px;
  }
}

.week-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 200px;
}

.week-col {
  border-right: 1px solid #e4e7ed;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  position: relative;

  &:last-child { border-right: none; }
}

.task-item {
  padding: 4px 6px;
  margin-bottom: 4px;
  background: #ecf5ff;
  color: var(--el-color-primary);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .dot {
    font-weight: bold;
    margin-right: 2px;
  }
}

.no-plan {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;

  p {
    margin: 0 0 8px;
    text-align: center;
  }
}

.add-btn {
  margin-top: auto;
  text-align: center;
  color: var(--el-color-primary);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.week-col:hover .add-btn {
  opacity: 1;
}
</style>
