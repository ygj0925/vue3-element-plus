<template>
  <el-dialog
    v-model="visible"
    title="规划任务时间"
    width="640px"
    destroy-on-close
    :close-on-click-modal="false"
    class="task-plan-dialog"
  >
    <div class="plan-header">
      <div class="plan-header-left">
        <span class="task-count">共计{{ filteredTasks.length }}项</span>
        <span class="divider">|</span>
        <span class="add-task-link" @click="showInput = true">+ 添加任务</span>
      </div>
      <div class="plan-header-right">
        <el-input
          v-model="searchText"
          placeholder="搜索任务"
          :prefix-icon="Search"
          clearable
          size="small"
          class="task-search"
        />
        <el-dropdown trigger="click" @command="handleFilterChange">
          <span class="filter-trigger">
            <el-icon><Operation /></el-icon>
            {{ filterLabel }}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">显示全部</el-dropdown-item>
              <el-dropdown-item command="kr">显示KR任务</el-dropdown-item>
              <el-dropdown-item command="project">显示项目任务</el-dropdown-item>
              <el-dropdown-item command="todo">显示待办</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div v-if="showInput" class="task-input-area">
      <el-input
        ref="taskInputRef"
        v-model="newTaskName"
        placeholder="添加待办，例如：发送邮件给老板。回车即可保存"
        @keyup.enter="quickAddTask"
        class="task-input"
      />
      <div class="task-input-actions">
        <span class="action-btn" @click="toggleDeadlinePicker">
          <el-icon><Calendar /></el-icon>
          <template v-if="newTaskDeadline">{{ newTaskDeadline }}</template>
          <template v-else>设置截止时间</template>
        </span>
        <span class="action-btn" @click="openReminder">
          <el-icon><Bell /></el-icon> 提醒
        </span>
        <CollaboratorPopover
          :members="allMembers"
          :selected="newTaskCollaborators"
          @confirm="onCollabConfirm"
          @open-org-select="openMemberSelect"
        >
          <span class="action-btn">
            <el-icon><Plus /></el-icon> 添加协作人
            <span v-if="newTaskCollaborators.length" class="collab-count">
              ({{ newTaskCollaborators.length }}人)
            </span>
          </span>
        </CollaboratorPopover>
        <el-button type="primary" size="small" class="create-btn" @click="quickAddTask">
          新建
        </el-button>
      </div>
      <div v-if="showDeadlinePicker" class="deadline-picker-wrapper">
        <div class="deadline-panel">
          <div class="deadline-panel-header">
            <div class="deadline-date-input" @click="deadlineMode = 'date'">
              {{ deadlineDateDisplay || '选择日期' }}
            </div>
            <div class="deadline-time-input" @click="deadlineMode = 'time'">
              {{ deadlineTimeDisplay || '选择时间' }}
            </div>
          </div>
          <div v-if="deadlineMode === 'date'" class="deadline-calendar">
            <div class="calendar-nav">
              <span class="nav-btn" @click="changeYear(-1)">&lt;&lt;</span>
              <span class="nav-btn" @click="changeMonth(-1)">&lt;</span>
              <span class="calendar-title">{{ calendarYear }}年{{ calendarMonth }}月</span>
              <span class="nav-btn" @click="changeMonth(1)">&gt;</span>
              <span class="nav-btn" @click="changeYear(1)">&gt;&gt;</span>
            </div>
            <div class="calendar-weekdays">
              <span v-for="d in weekDays" :key="d">{{ d }}</span>
            </div>
            <div class="calendar-days">
              <span
                v-for="(day, idx) in calendarDays"
                :key="idx"
                class="calendar-day"
                :class="{
                  'other-month': !day.currentMonth,
                  'is-today': day.isToday,
                  'is-selected': day.isSelected,
                }"
                @click="selectDate(day)"
              >{{ day.day }}</span>
            </div>
          </div>
          <div v-else class="deadline-time-panel">
            <div class="time-columns">
              <div class="time-column">
                <div class="time-column-title">时</div>
                <div class="time-scroll">
                  <div
                    v-for="h in 24"
                    :key="h - 1"
                    class="time-cell"
                    :class="{ active: selectedHour === h - 1 }"
                    @click="selectedHour = h - 1"
                  >{{ String(h - 1).padStart(2, '0') }}</div>
                </div>
              </div>
              <div class="time-column">
                <div class="time-column-title">分</div>
                <div class="time-scroll">
                  <div
                    v-for="m in 60"
                    :key="m - 1"
                    class="time-cell"
                    :class="{ active: selectedMinute === m - 1 }"
                    @click="selectedMinute = m - 1"
                  >{{ String(m - 1).padStart(2, '0') }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="deadline-panel-footer">
            <el-button size="small" @click="setNow">此刻</el-button>
            <el-button type="primary" size="small" @click="confirmDeadline">确定</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="task-list-area">
      <template v-if="filteredTasks.length > 0">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-list-item"
        >
          <div class="task-main">
            <el-checkbox
              :model-value="false"
              class="task-checkbox"
            />
            <span class="task-item-name">{{ task.name }}</span>
          </div>
          <div class="task-meta">
            <span v-if="task.deadline" class="meta-tag deadline-tag">
              <el-icon><Calendar /></el-icon>
              {{ task.deadline }}
            </span>
            <span v-if="task.reminder && task.reminder.type !== 'none'" class="meta-tag reminder-tag">
              <el-icon><Bell /></el-icon>
              {{ getReminderLabel(task.reminder) }}
            </span>
            <div v-if="task.collaborators.length" class="collab-avatars">
              <span
                v-for="c in task.collaborators.slice(0, 3)"
                :key="c.id"
                class="mini-avatar"
                :title="c.name"
              >{{ c.name[0] }}</span>
              <span v-if="task.collaborators.length > 3" class="mini-avatar more">
                +{{ task.collaborators.length - 3 }}
              </span>
            </div>
            <el-icon class="delete-btn" @click="removeTask(task.id)"><Delete /></el-icon>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">
        <el-empty description="暂无内容" :image-size="80" />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>

    <ReminderDialog
      v-model="reminderVisible"
      :initial="currentReminder"
      @confirm="onReminderConfirm"
    />

    <MemberSelectDialog
      v-model="memberSelectVisible"
      :members="allMembers"
      :departments="allDepartments"
      :initial-selected="newTaskCollaborators"
      @confirm="onMemberSelectConfirm"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Calendar, Bell, Plus, Delete, Operation, Search } from '@element-plus/icons-vue'
import type { Task, Reminder, Collaborator } from '../types'
import { mockMembers, mockDepartments, reminderTypeOptions } from '../mock'
import ReminderDialog from './ReminderDialog.vue'
import MemberSelectDialog from './MemberSelectDialog.vue'
import CollaboratorPopover from './CollaboratorPopover.vue'

const props = defineProps<{
  modelValue: boolean
  date: string
  tasks: Task[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:tasks': [tasks: Task[]]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const localTasks = ref<Task[]>([])
const searchText = ref('')
const filterType = ref<'all' | 'kr' | 'project' | 'todo'>('all')
const showInput = ref(true)
const newTaskName = ref('')
const newTaskDeadline = ref('')
const newTaskCollaborators = ref<Collaborator[]>([])
const currentReminder = ref<Reminder>({ type: 'before_start', value: 1, unit: 'minute' })
const showDeadlinePicker = ref(false)
const deadlineMode = ref<'date' | 'time'>('date')
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth() + 1)
const selectedDate2 = ref<{ year: number; month: number; day: number } | null>(null)
const selectedHour = ref(0)
const selectedMinute = ref(0)
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const deadlineDateDisplay = computed(() => {
  if (!selectedDate2.value) return ''
  const { year, month, day } = selectedDate2.value
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
})

const deadlineTimeDisplay = computed(() => {
  if (!selectedDate2.value) return ''
  return `${String(selectedHour.value).padStart(2, '0')}:${String(selectedMinute.value).padStart(2, '0')}`
})

const calendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
  const today = new Date()
  const days: Array<{ day: number; currentMonth: boolean; isToday: boolean; isSelected: boolean; year: number; month: number }> = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = month === 1 ? 12 : month - 1
    const y = month === 1 ? year - 1 : year
    days.push({ day: d, currentMonth: false, isToday: false, isSelected: false, year: y, month: m })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === i
    const isSelected = selectedDate2.value?.year === year && selectedDate2.value?.month === month && selectedDate2.value?.day === i
    days.push({ day: i, currentMonth: true, isToday, isSelected, year, month })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const m = month === 12 ? 1 : month + 1
    const y = month === 12 ? year + 1 : year
    days.push({ day: i, currentMonth: false, isToday: false, isSelected: false, year: y, month: m })
  }

  return days
})

function toggleDeadlinePicker() {
  showDeadlinePicker.value = !showDeadlinePicker.value
  if (showDeadlinePicker.value) {
    deadlineMode.value = 'date'
    if (newTaskDeadline.value) {
      const parts = newTaskDeadline.value.split(' ')
      const [y, m, d] = parts[0].split('-').map(Number)
      const [h, min] = parts[1].split(':').map(Number)
      calendarYear.value = y
      calendarMonth.value = m
      selectedDate2.value = { year: y, month: m, day: d }
      selectedHour.value = h
      selectedMinute.value = min
    } else {
      const now = new Date()
      calendarYear.value = now.getFullYear()
      calendarMonth.value = now.getMonth() + 1
      selectedDate2.value = null
      selectedHour.value = now.getHours()
      selectedMinute.value = now.getMinutes()
    }
  }
}

function changeYear(delta: number) {
  calendarYear.value += delta
}

function changeMonth(delta: number) {
  calendarMonth.value += delta
  if (calendarMonth.value > 12) {
    calendarMonth.value = 1
    calendarYear.value++
  } else if (calendarMonth.value < 1) {
    calendarMonth.value = 12
    calendarYear.value--
  }
}

function selectDate(day: { day: number; year: number; month: number }) {
  selectedDate2.value = { year: day.year, month: day.month, day: day.day }
  calendarYear.value = day.year
  calendarMonth.value = day.month
}

function setNow() {
  const now = new Date()
  selectedDate2.value = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
  calendarYear.value = now.getFullYear()
  calendarMonth.value = now.getMonth() + 1
}

function confirmDeadline() {
  if (selectedDate2.value) {
    const { year, month, day } = selectedDate2.value
    newTaskDeadline.value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(selectedHour.value).padStart(2, '0')}:${String(selectedMinute.value).padStart(2, '0')}`
  }
  showDeadlinePicker.value = false
}
const reminderVisible = ref(false)
const memberSelectVisible = ref(false)
const taskInputRef = ref()

const allMembers = computed(() => mockMembers)
const allDepartments = computed(() => mockDepartments)

const filterLabel = computed(() => {
  const map: Record<string, string> = {
    all: '显示全部',
    kr: '显示KR任务',
    project: '显示项目任务',
    todo: '显示待办',
  }
  return map[filterType.value]
})

const filteredTasks = computed(() => {
  let result = localTasks.value.filter((t) => t.date === props.date)
  if (filterType.value !== 'all') {
    result = result.filter((t) => t.taskType === filterType.value)
  }
  if (searchText.value) {
    result = result.filter((t) => t.name.includes(searchText.value))
  }
  return result
})

watch(() => props.modelValue, (val) => {
  if (val) {
    localTasks.value = props.tasks.map((t) => ({ ...t, collaborators: [...t.collaborators] }))
    newTaskName.value = ''
    newTaskDeadline.value = ''
    newTaskCollaborators.value = []
    currentReminder.value = { type: 'before_start', value: 1, unit: 'minute' }
    showDeadlinePicker.value = false
    searchText.value = ''
    filterType.value = 'all'
    showInput.value = true
    nextTick(() => {
      taskInputRef.value?.focus()
    })
  }
})

let nextId = 100

function getNextId() {
  const maxId = localTasks.value.reduce((max, t) => Math.max(max, t.id), 0)
  nextId = Math.max(nextId, maxId + 1)
  return nextId++
}

function handleFilterChange(cmd: string) {
  filterType.value = cmd as typeof filterType.value
}

function quickAddTask() {
  if (!newTaskName.value.trim()) return
  const task: Task = {
    id: getNextId(),
    name: newTaskName.value.trim(),
    date: props.date,
    description: '',
    deadline: newTaskDeadline.value || undefined,
    reminder: currentReminder.value.type !== 'none' ? { ...currentReminder.value } : undefined,
    collaborators: [...newTaskCollaborators.value],
    taskType: 'todo',
  }
  localTasks.value.push(task)
  newTaskName.value = ''
  newTaskDeadline.value = ''
  newTaskCollaborators.value = []
  currentReminder.value = { type: 'before_start', value: 1, unit: 'minute' }
  showDeadlinePicker.value = false
}

function removeTask(id: number) {
  localTasks.value = localTasks.value.filter((t) => t.id !== id)
}

function openReminder() {
  reminderVisible.value = true
}

function onReminderConfirm(reminder: Reminder) {
  currentReminder.value = reminder
}

function onCollabConfirm(members: Collaborator[]) {
  newTaskCollaborators.value = members
}

function openMemberSelect() {
  memberSelectVisible.value = true
}

function onMemberSelectConfirm(members: Collaborator[]) {
  newTaskCollaborators.value = members
}

function getReminderLabel(reminder: Reminder): string {
  const typeOpt = reminderTypeOptions.find((o) => o.value === reminder.type)
  if (!typeOpt) return ''
  if (['none', 'task_start', 'task_deadline'].includes(reminder.type)) {
    return typeOpt.label
  }
  const unitMap: Record<string, string> = { minute: '分钟', hour: '小时', day: '天' }
  return `${typeOpt.label} ${reminder.value}${unitMap[reminder.unit] || ''}`
}

function handleCancel() {
  visible.value = false
}

function handleConfirm() {
  emit('update:tasks', [...localTasks.value])
  visible.value = false
}
</script>

<style scoped lang="scss">
.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.plan-header-left {
  display: flex;
  align-items: center;
  gap: 8px;

  .task-count {
    font-size: 14px;
    color: #606266;
  }

  .divider {
    color: #dcdfe6;
  }

  .add-task-link {
    font-size: 14px;
    color: var(--el-color-primary);
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}

.plan-header-right {
  display: flex;
  align-items: center;
  gap: 12px;

  .task-search {
    width: 180px;
  }

  .filter-trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.task-input-area {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.task-input {
  margin-bottom: 10px;

  :deep(.el-input__inner) {
    border: none;
    background: transparent;
    font-size: 14px;
  }
}

.task-input-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }

    .collab-count {
      color: var(--el-color-primary);
    }
  }

  .create-btn {
    margin-left: auto;
  }
}

.deadline-picker-wrapper {
  margin-top: 10px;
  position: relative;
}

.deadline-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  width: 320px;
}

.deadline-panel-header {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;

  .deadline-date-input,
  .deadline-time-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;

  .nav-btn {
    cursor: pointer;
    color: #606266;
    font-size: 13px;
    padding: 2px 4px;
    user-select: none;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .calendar-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    min-width: 100px;
    text-align: center;
  }
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;

  span {
    font-size: 12px;
    color: #909399;
    padding: 4px 0;
  }
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.calendar-day {
  padding: 6px 0;
  font-size: 13px;
  color: #303133;
  cursor: pointer;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2px auto;
  transition: all 0.2s;

  &:hover {
    background: #f0f2f5;
  }

  &.other-month {
    color: #c0c4cc;
  }

  &.is-today {
    color: var(--el-color-primary);
    font-weight: 600;
  }

  &.is-selected {
    background: var(--el-color-primary);
    color: #fff;
    font-weight: 500;

    &:hover {
      background: var(--el-color-primary);
    }
  }
}

.deadline-time-panel {
  .time-columns {
    display: flex;
    gap: 12px;
  }

  .time-column {
    flex: 1;

    .time-column-title {
      text-align: center;
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }

    .time-scroll {
      height: 200px;
      overflow-y: auto;
      border: 1px solid #ebeef5;
      border-radius: 4px;
    }

    .time-cell {
      padding: 6px 0;
      text-align: center;
      font-size: 13px;
      color: #606266;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f0f2f5;
      }

      &.active {
        color: var(--el-color-primary);
        font-weight: 600;
        background: #ecf5ff;
      }
    }
  }
}

.deadline-panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.task-list-area {
  min-height: 200px;
  max-height: 360px;
  overflow-y: auto;
}

.task-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.task-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.task-checkbox {
  flex-shrink: 0;
}

.task-item-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 3px;
}

.collab-avatars {
  display: flex;
  gap: 2px;
}

.mini-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #c0c4cc;
  color: #fff;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.more {
    background: #dcdfe6;
    color: #606266;
    font-size: 9px;
  }
}

.delete-btn {
  font-size: 16px;
  color: #c0c4cc;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;

  .task-list-item:hover & {
    opacity: 1;
  }

  &:hover {
    color: #f56c6c;
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
