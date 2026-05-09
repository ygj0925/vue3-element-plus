<template>
  <div class="work-calendar">
    <div class="calendar-header">
      <h2 class="calendar-title">工作日历</h2>
      <div class="calendar-actions">
        <div class="view-toggle">
          <button
            :class="['toggle-btn', { active: viewMode === 'week' }]"
            @click="viewMode = 'week'"
          >
            周
          </button>
          <button
            :class="['toggle-btn', { active: viewMode === 'month' }]"
            @click="viewMode = 'month'"
          >
            月
          </button>
        </div>
        <div class="date-nav">
          <button class="nav-btn" @click="navigatePrev">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <span class="date-range">{{ dateRangeText }}</span>
          <button class="nav-btn" @click="navigateNext">
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
        <button class="today-btn" @click="goToday">今天</button>
      </div>
    </div>

    <div v-if="viewMode === 'week'" class="week-view">
      <div class="week-header">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          :class="['week-header-cell', { today: day.isToday }]"
        >
          <span class="day-number" :class="{ 'today-number': day.isToday }">
            {{ day.date }}
          </span>
          <span class="day-label">({{ day.label }})</span>
        </div>
      </div>
      <div class="week-body">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          class="week-day-col"
        >
          <div class="task-list">
            <div
              v-for="task in getTasksForDate(day.dateStr)"
              :key="task.id"
              class="task-item"
              @click="editTask(task)"
            >
              <span class="task-dot">·</span>
              <span class="task-name">{{ task.name }}</span>
            </div>
          </div>
          <div class="add-task-btn" @click="openAddDialog(day.dateStr)">
            + 添加任务
          </div>
        </div>
      </div>
    </div>

    <div v-else class="month-view">
      <div class="month-header">
        <div v-for="label in weekLabels" :key="label" class="month-header-cell">
          {{ label }}
        </div>
      </div>
      <div class="month-body">
        <div
          v-for="(week, wIdx) in monthWeeks"
          :key="wIdx"
          class="month-row"
        >
          <div
            v-for="day in week"
            :key="day.dateStr"
            :class="['month-cell', { today: day.isToday, 'other-month': !day.isCurrentMonth }]"
          >
            <div class="month-cell-header">
              <span class="day-number" :class="{ 'today-number': day.isToday }">
                {{ day.date }}
              </span>
            </div>
            <div class="month-cell-body">
              <div
                v-for="task in getTasksForDate(day.dateStr).slice(0, 3)"
                :key="task.id"
                class="task-tag"
                @click="editTask(task)"
              >
                {{ task.name }}
              </div>
              <div
                v-if="getTasksForDate(day.dateStr).length > 3"
                class="task-more"
              >
                +{{ getTasksForDate(day.dateStr).length - 3 }}更多
              </div>
            </div>
            <div
              class="month-add-btn"
              @click="openAddDialog(day.dateStr)"
            >
              +
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑任务' : '添加任务'"
      width="420px"
      destroy-on-close
    >
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务日期">
          <el-date-picker
            v-model="taskForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="isEditing" type="danger" @click="deleteTask" style="margin-right: auto">
            删除
          </el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTask">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

interface Task {
  id: number
  name: string
  date: string
  description: string
}

const viewMode = ref<'week' | 'month'>('week')
const currentDate = ref(new Date())
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<number | null>(null)

const taskForm = ref({
  name: '',
  date: '',
  description: '',
})

let nextId = 2
const tasks = ref<Task[]>([
  { id: 1, name: '平面设计', date: formatDate(new Date()), description: '' },
])

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
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
      isToday: isSameDay(d, today),
    }
  })
})

const monthWeeks = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const today = new Date()

  let dayOfWeek = firstDay.getDay()
  if (dayOfWeek === 0) dayOfWeek = 7
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - (dayOfWeek - 1))

  const weeks: Array<
    Array<{
      date: number
      dateStr: string
      isToday: boolean
      isCurrentMonth: boolean
    }>
  > = []

  const cursor = new Date(startDate)
  for (let w = 0; w < 6; w++) {
    const week: typeof weeks[0] = []
    for (let d = 0; d < 7; d++) {
      week.push({
        date: cursor.getDate(),
        dateStr: formatDate(cursor),
        isToday: isSameDay(cursor, today),
        isCurrentMonth: cursor.getMonth() === month,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor.getMonth() !== month && cursor.getDay() === 1) break
  }

  return weeks
})

const dateRangeText = computed(() => {
  if (viewMode.value === 'week') {
    const monday = getMonday(currentDate.value)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const mStr = `${String(monday.getMonth() + 1).padStart(2, '0')}/${String(monday.getDate()).padStart(2, '0')}`
    const sStr = `${String(sunday.getMonth() + 1).padStart(2, '0')}/${String(sunday.getDate()).padStart(2, '0')}`
    return `${mStr}-${sStr}`
  }
  const y = currentDate.value.getFullYear()
  const m = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  return `${y}年${m}月`
})

function navigatePrev() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    d.setDate(d.getDate() - 7)
  } else {
    d.setMonth(d.getMonth() - 1)
  }
  currentDate.value = d
}

function navigateNext() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    d.setDate(d.getDate() + 7)
  } else {
    d.setMonth(d.getMonth() + 1)
  }
  currentDate.value = d
}

function goToday() {
  currentDate.value = new Date()
}

function getTasksForDate(dateStr: string): Task[] {
  return tasks.value.filter((t) => t.date === dateStr)
}

function openAddDialog(dateStr: string) {
  isEditing.value = false
  editingTaskId.value = null
  taskForm.value = { name: '', date: dateStr, description: '' }
  dialogVisible.value = true
}

function editTask(task: Task) {
  isEditing.value = true
  editingTaskId.value = task.id
  taskForm.value = { name: task.name, date: task.date, description: task.description }
  dialogVisible.value = true
}

function saveTask() {
  if (!taskForm.value.name.trim()) {
    ElMessage.warning('请输入任务名称')
    return
  }
  if (!taskForm.value.date) {
    ElMessage.warning('请选择任务日期')
    return
  }

  if (isEditing.value && editingTaskId.value !== null) {
    const idx = tasks.value.findIndex((t) => t.id === editingTaskId.value)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...taskForm.value }
    }
    ElMessage.success('任务已更新')
  } else {
    tasks.value.push({
      id: nextId++,
      name: taskForm.value.name,
      date: taskForm.value.date,
      description: taskForm.value.description,
    })
    ElMessage.success('任务已添加')
  }
  dialogVisible.value = false
}

function deleteTask() {
  if (editingTaskId.value !== null) {
    tasks.value = tasks.value.filter((t) => t.id !== editingTaskId.value)
    ElMessage.success('任务已删除')
    dialogVisible.value = false
  }
}
</script>

<style scoped lang="scss">
.work-calendar {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: calc(100vh - 140px);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.calendar-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.calendar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  .toggle-btn {
    padding: 6px 16px;
    border: none;
    background: #fff;
    color: #606266;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: var(--el-color-primary);
      color: #fff;
    }

    &:hover:not(.active) {
      color: var(--el-color-primary);
    }
  }
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 8px;

  .nav-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    color: #606266;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }

  .date-range {
    font-size: 14px;
    color: #303133;
    min-width: 100px;
    text-align: center;
  }
}

.today-btn {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}

// Week view
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

.week-header-cell {
  padding: 16px 8px;
  text-align: center;
  font-size: 15px;
  color: #303133;
  border-right: 1px solid #e4e7ed;

  &:last-child {
    border-right: none;
  }

  &.today {
    .day-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  .day-number {
    font-weight: 600;
    margin-right: 2px;

    &.today-number {
      background: var(--el-color-primary);
      color: #fff;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
  }

  .day-label {
    color: #909399;
    font-size: 13px;
  }
}

.week-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 400px;
}

.week-day-col {
  border-right: 1px solid #e4e7ed;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  position: relative;

  &:last-child {
    border-right: none;
  }
}

.task-list {
  flex: 1;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: #ecf5ff;
  color: var(--el-color-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #d9ecff;
  }

  .task-dot {
    font-size: 18px;
    margin-right: 4px;
    font-weight: bold;
  }

  .task-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.add-task-btn {
  margin-top: auto;
  padding: 8px;
  text-align: center;
  color: var(--el-color-primary);
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;

  &:hover {
    background: #f5f7fa;
  }
}

.week-day-col:hover .add-task-btn {
  opacity: 1;
}

// Month view
.month-view {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;

  .month-header-cell {
    padding: 10px;
    text-align: center;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    border-right: 1px solid #e4e7ed;

    &:last-child {
      border-right: none;
    }
  }
}

.month-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e4e7ed;

  &:last-child {
    border-bottom: none;
  }
}

.month-cell {
  min-height: 100px;
  padding: 8px;
  border-right: 1px solid #e4e7ed;
  position: relative;

  &:last-child {
    border-right: none;
  }

  &.other-month {
    background: #fafafa;

    .day-number {
      color: #c0c4cc;
    }
  }

  &.today .day-number.today-number {
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

  .month-cell-header {
    margin-bottom: 4px;

    .day-number {
      font-size: 14px;
      color: #303133;
    }
  }

  .month-add-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-primary);
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .month-add-btn {
    opacity: 1;
  }
}

.task-tag {
  padding: 2px 6px;
  margin-bottom: 2px;
  background: #ecf5ff;
  color: var(--el-color-primary);
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: #d9ecff;
  }
}

.task-more {
  font-size: 12px;
  color: #909399;
  padding: 2px 0;
}

// Dialog footer
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
