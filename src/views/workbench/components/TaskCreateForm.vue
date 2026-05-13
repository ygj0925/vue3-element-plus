<template>
  <div class="task-create-form">
    <div class="form-card">
      <div class="form-header">
        <span class="form-label">创建</span>
        <el-dropdown trigger="click" @command="handleTypeChange">
          <span class="type-badge">
            {{ taskTypeLabel }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="todo">待办任务</el-dropdown-item>
              <el-dropdown-item command="kr">KR任务</el-dropdown-item>
              <el-dropdown-item command="project">项目任务</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span v-if="showMore" class="more-label">更多界面</span>
      </div>

      <el-input
        ref="nameInputRef"
        v-model="form.name"
        type="textarea"
        :rows="3"
        placeholder="请输入具体的工作任务(例：每天拜访50个客户/每周邀约面试30人)"
        class="task-name-input"
      />

      <div class="form-fields">
        <!-- 负责人 -->
        <div class="field-row">
          <div class="field-icon">
            <el-icon><User /></el-icon>
          </div>
          <span class="field-label">负责人</span>
          <div class="field-content">
            <el-avatar :size="28" class="assignee-avatar">{{ form.assignee[0] }}</el-avatar>
            <span class="assignee-name">{{ form.assignee }}</span>
          </div>
        </div>

        <!-- 时间 -->
        <div class="field-row">
          <div class="field-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <span class="field-label">时间</span>
          <div class="field-content">
            <span class="time-text" :class="{ placeholder: !form.startTime, active: pickerVisible && pickerTarget === 'start' }" @click="openPicker('start')">
              {{ form.startTime ? formatTimeDisplay(form.startTime) : '开始时间' }}
            </span>
            <span class="time-sep">-</span>
            <span class="time-text" :class="{ placeholder: !form.deadline, active: pickerVisible && pickerTarget === 'end' }" @click="openPicker('end')">
              {{ form.deadline ? formatTimeDisplay(form.deadline) : '截止时间' }}
            </span>
            <span class="field-divider">|</span>
            <el-tooltip content="设置重复" placement="top">
              <el-icon class="field-action" @click.stop="recurrenceVisible = true"><RefreshRight /></el-icon>
            </el-tooltip>
            <el-tooltip content="设置提醒" placement="top">
              <el-icon class="field-action" @click.stop="reminderVisible = true"><Bell /></el-icon>
            </el-tooltip>
          </div>
        </div>
        <div v-if="pickerVisible" class="datetime-panel-wrap">
          <div class="datetime-panel">
            <div class="dp-header">
              <span :class="['dp-tab-btn', { active: pickerMode === 'date' }]" @click="pickerMode = 'date'">
                {{ pickerSelectedDate ? `${pickerYear}-${pad(pickerMonth)}-${pad(pickerDay)}` : '选择日期' }}
              </span>
              <span :class="['dp-tab-btn', { active: pickerMode === 'time' }]" @click="pickerMode = 'time'">
                {{ pickerSelectedDate ? `${pad(pickerHour)}:${pad(pickerMinute)}` : '选择时间' }}
              </span>
            </div>
            <template v-if="pickerMode === 'date'">
              <div class="dp-nav">
                <span class="dp-nav-btn" @click="changeCalYear(-1)">&laquo;</span>
                <span class="dp-nav-btn" @click="changeCalMonth(-1)">&lsaquo;</span>
                <span class="dp-nav-title">{{ calViewYear }}年 {{ calViewMonth }}月</span>
                <span class="dp-nav-btn" @click="changeCalMonth(1)">&rsaquo;</span>
                <span class="dp-nav-btn" @click="changeCalYear(1)">&raquo;</span>
              </div>
              <div class="dp-weekdays">
                <span v-for="w in calWeekLabels" :key="w">{{ w }}</span>
              </div>
              <div class="dp-days">
                <span
                  v-for="(d, i) in calDays"
                  :key="i"
                  :class="['dp-day', { 'other-month': !d.current, 'is-today': d.isToday, 'is-selected': d.isSelected }]"
                  @click="pickDate(d)"
                >{{ d.day }}</span>
              </div>
            </template>
            <template v-else>
              <div class="dp-time-cols">
                <div class="dp-time-col">
                  <div class="dp-time-col-title">时</div>
                  <div class="dp-time-scroll">
                    <div v-for="h in 24" :key="h - 1" :class="['dp-time-cell', { active: pickerHour === h - 1 }]" @click="pickerHour = h - 1">{{ pad(h - 1) }}</div>
                  </div>
                </div>
                <div class="dp-time-col">
                  <div class="dp-time-col-title">分</div>
                  <div class="dp-time-scroll">
                    <div v-for="m in 60" :key="m - 1" :class="['dp-time-cell', { active: pickerMinute === m - 1 }]" @click="pickerMinute = m - 1">{{ pad(m - 1) }}</div>
                  </div>
                </div>
              </div>
            </template>
            <div class="dp-footer">
              <el-button link type="primary" @click="setPickerNow">此刻</el-button>
              <el-button type="primary" size="small" @click="confirmPicker">确定</el-button>
            </div>
          </div>
        </div>

        <!-- 更多字段（展开后显示） -->
        <template v-if="showMore">
          <!-- 标签 -->
          <div class="field-row">
            <div class="field-icon">
              <el-icon><PriceTag /></el-icon>
            </div>
            <span class="field-label">标签</span>
            <div class="field-content">
              <el-tag
                v-for="tag in form.tags"
                :key="tag"
                closable
                size="small"
                @close="removeTag(tag)"
              >{{ tag }}</el-tag>
              <el-icon class="add-tag-btn" @click="addTagVisible = true"><CirclePlus /></el-icon>
              <el-input
                v-if="addTagVisible"
                v-model="newTag"
                size="small"
                placeholder="输入标签"
                style="width: 100px"
                @keyup.enter="addTag"
                @blur="addTag"
              />
            </div>
          </div>

          <!-- 优先级 -->
          <div class="field-row">
            <div class="field-icon">
              <el-icon><SetUp /></el-icon>
            </div>
            <span class="field-label">优先级</span>
            <div class="field-content">
              <el-dropdown trigger="click" @command="handlePriorityChange">
                <el-tag :type="priorityTagType" size="default" class="priority-tag">
                  {{ priorityLabel }}
                </el-tag>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="high">紧急</el-dropdown-item>
                    <el-dropdown-item command="normal">普通</el-dropdown-item>
                    <el-dropdown-item command="low">低</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <!-- 更多按钮 -->
        <div v-if="!showMore" class="field-row more-row" @click="showMore = true">
          <div class="field-icon">
            <el-icon><MoreFilled /></el-icon>
          </div>
          <span class="more-link">更多</span>
        </div>
      </div>

      <div class="form-footer">
        <span class="visibility-label">
          <el-icon><View /></el-icon>
          全员可见
        </span>
        <div class="form-actions">
          <el-button @click="$emit('close')">取 消</el-button>
          <el-button @click="handleCreateAndNext">完成并创建下一个</el-button>
          <el-button type="primary" @click="handleCreate">完 成</el-button>
        </div>
      </div>
    </div>

    <!-- 提醒设置弹窗 -->
    <el-dialog v-model="reminderVisible" title="设置提醒" width="400px" append-to-body destroy-on-close>
      <div class="reminder-form">
        <el-select v-model="reminderType" style="flex: 1.5">
          <el-option label="不提醒" value="none" />
          <el-option label="任务开始时" value="task_start" />
          <el-option label="任务开始前" value="before_start" />
          <el-option label="任务截止时" value="task_deadline" />
          <el-option label="任务截止前" value="before_deadline" />
        </el-select>
        <el-select v-model="reminderValue" :disabled="['none','task_start','task_deadline'].includes(reminderType)" style="flex: 1">
          <el-option v-for="v in [1,5,10,15,30]" :key="v" :label="v" :value="v" />
        </el-select>
        <el-select v-model="reminderUnit" :disabled="['none','task_start','task_deadline'].includes(reminderType)" style="flex: 1">
          <el-option label="分钟" value="分钟" />
          <el-option label="小时" value="小时" />
          <el-option label="天" value="天" />
        </el-select>
      </div>
      <template #footer>
        <el-button @click="reminderVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReminder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重复设置弹窗 -->
    <el-dialog v-model="recurrenceVisible" title="设置重复" width="360px" append-to-body destroy-on-close>
      <el-select v-model="recurrenceValue" style="width: 100%">
        <el-option label="不重复" value="" />
        <el-option label="每天" value="每天" />
        <el-option label="每周" value="每周" />
        <el-option label="每月" value="每月" />
        <el-option label="每年" value="每年" />
        <el-option label="工作日" value="工作日" />
      </el-select>
      <template #footer>
        <el-button @click="recurrenceVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRecurrence">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import {
  ArrowDown, User, Calendar, RefreshRight, Bell,
  PriceTag, SetUp, CirclePlus, MoreFilled, View
} from '@element-plus/icons-vue'
import type { WorkTask } from '../types'

const emit = defineEmits<{
  close: []
  create: [task: WorkTask]
}>()

const nameInputRef = ref()
const showMore = ref(false)
const addTagVisible = ref(false)
const newTag = ref('')
const reminderVisible = ref(false)
const recurrenceVisible = ref(false)
const reminderType = ref('before_start')
const reminderValue = ref(1)
const reminderUnit = ref('分钟')
const recurrenceValue = ref('')

const pickerVisible = ref(false)
const pickerMode = ref<'date' | 'time'>('date')
const pickerTarget = ref<'start' | 'end'>('start')
const pickerSelectedDate = ref(false)
const pickerYear = ref(new Date().getFullYear())
const pickerMonth = ref(new Date().getMonth() + 1)
const pickerDay = ref(new Date().getDate())
const pickerHour = ref(new Date().getHours())
const pickerMinute = ref(new Date().getMinutes())
const calViewYear = ref(new Date().getFullYear())
const calViewMonth = ref(new Date().getMonth() + 1)

const calWeekLabels = ['日', '一', '二', '三', '四', '五', '六']

const calDays = computed(() => {
  const y = calViewYear.value
  const m = calViewMonth.value
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const daysInPrev = new Date(y, m - 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const selectedStr = pickerSelectedDate.value ? `${pickerYear.value}-${pad(pickerMonth.value)}-${pad(pickerDay.value)}` : ''
  const cells: { day: number; current: boolean; isToday: boolean; isSelected: boolean; year: number; month: number }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const pm = m - 1 <= 0 ? 12 : m - 1
    const py = m - 1 <= 0 ? y - 1 : y
    const ds = `${py}-${pad(pm)}-${pad(d)}`
    cells.push({ day: d, current: false, isToday: ds === todayStr, isSelected: ds === selectedStr, year: py, month: pm })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${pad(m)}-${pad(d)}`
    cells.push({ day: d, current: true, isToday: ds === todayStr, isSelected: ds === selectedStr, year: y, month: m })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nm = m + 1 > 12 ? 1 : m + 1
    const ny = m + 1 > 12 ? y + 1 : y
    const ds = `${ny}-${pad(nm)}-${pad(d)}`
    cells.push({ day: d, current: false, isToday: ds === todayStr, isSelected: ds === selectedStr, year: ny, month: nm })
  }
  return cells
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function openPicker(target: 'start' | 'end') {
  pickerTarget.value = target
  pickerMode.value = 'date'
  const timeStr = target === 'start' ? form.value.startTime : form.value.deadline
  if (timeStr) {
    const [datePart, timePart] = timeStr.split(' ')
    const [y, m, d] = datePart.split('-').map(Number)
    const [h, min] = timePart.split(':').map(Number)
    pickerYear.value = y
    pickerMonth.value = m
    pickerDay.value = d
    pickerHour.value = h
    pickerMinute.value = min
    calViewYear.value = y
    calViewMonth.value = m
    pickerSelectedDate.value = true
  } else {
    const now = new Date()
    pickerYear.value = now.getFullYear()
    pickerMonth.value = now.getMonth() + 1
    pickerDay.value = now.getDate()
    pickerHour.value = now.getHours()
    pickerMinute.value = now.getMinutes()
    calViewYear.value = now.getFullYear()
    calViewMonth.value = now.getMonth() + 1
    pickerSelectedDate.value = false
  }
  pickerVisible.value = true
}

function pickDate(d: { day: number; year: number; month: number }) {
  pickerYear.value = d.year
  pickerMonth.value = d.month
  pickerDay.value = d.day
  pickerSelectedDate.value = true
}

function changeCalYear(delta: number) {
  calViewYear.value += delta
}

function changeCalMonth(delta: number) {
  let m = calViewMonth.value + delta
  let y = calViewYear.value
  if (m > 12) { m = 1; y++ }
  if (m < 1) { m = 12; y-- }
  calViewMonth.value = m
  calViewYear.value = y
}

function setPickerNow() {
  const now = new Date()
  pickerYear.value = now.getFullYear()
  pickerMonth.value = now.getMonth() + 1
  pickerDay.value = now.getDate()
  pickerHour.value = now.getHours()
  pickerMinute.value = now.getMinutes()
  calViewYear.value = now.getFullYear()
  calViewMonth.value = now.getMonth() + 1
  pickerSelectedDate.value = true
}

function confirmPicker() {
  const val = `${pickerYear.value}-${pad(pickerMonth.value)}-${pad(pickerDay.value)} ${pad(pickerHour.value)}:${pad(pickerMinute.value)}`
  if (pickerTarget.value === 'start') {
    form.value.startTime = val
  } else {
    form.value.deadline = val
  }
  pickerVisible.value = false
}

const form = ref({
  name: '',
  taskType: 'todo' as 'todo' | 'kr' | 'project',
  priority: 'normal' as 'high' | 'normal' | 'low',
  assignee: '余着',
  startTime: '',
  deadline: '',
  tags: [] as string[],
  reminder: undefined as { type: string; label: string } | undefined,
  recurrence: '',
  description: '',
  visibility: 'all' as 'all' | 'private',
})

const taskTypeLabel = computed(() => {
  const map: Record<string, string> = { todo: '待办任务', kr: 'KR任务', project: '项目任务' }
  return map[form.value.taskType]
})

const priorityLabel = computed(() => {
  const map: Record<string, string> = { high: '紧急', normal: '普通', low: '低' }
  return map[form.value.priority]
})

const priorityTagType = computed(() => {
  const map: Record<string, string> = { high: 'danger', normal: 'info', low: 'success' }
  return map[form.value.priority] as any
})

function handleTypeChange(type: string) {
  form.value.taskType = type as 'todo' | 'kr' | 'project'
}

function handlePriorityChange(priority: string) {
  form.value.priority = priority as 'high' | 'normal' | 'low'
}

function formatTimeDisplay(time: string) {
  if (!time) return '开始时间'
  const [date, hm] = time.split(' ')
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日 ${hm}`
}

function addTag() {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
  }
  newTag.value = ''
  addTagVisible.value = false
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function confirmReminder() {
  if (reminderType.value === 'none') {
    form.value.reminder = undefined
  } else {
    const typeLabels: Record<string, string> = {
      task_start: '任务开始时',
      before_start: '任务开始前',
      task_deadline: '任务截止时',
      before_deadline: '任务截止前',
    }
    const base = typeLabels[reminderType.value] || reminderType.value
    const needsUnit = !['none', 'task_start', 'task_deadline'].includes(reminderType.value)
    const label = needsUnit ? `${base} ${reminderValue.value} ${reminderUnit.value}` : base
    form.value.reminder = { type: reminderType.value, label }
  }
  reminderVisible.value = false
}

function confirmRecurrence() {
  form.value.recurrence = recurrenceValue.value
  recurrenceVisible.value = false
}

function buildTask(): WorkTask {
  return {
    id: Date.now(),
    name: form.value.name.trim(),
    status: 'pending',
    taskType: form.value.taskType,
    priority: form.value.priority,
    assignee: form.value.assignee,
    collaborators: [],
    startTime: form.value.startTime,
    deadline: form.value.deadline,
    reminder: form.value.reminder,
    recurrence: form.value.recurrence || undefined,
    tags: [...form.value.tags],
    description: form.value.description,
    visibility: form.value.visibility,
    activities: [
      { id: 1, user: form.value.assignee, action: '创建了任务', time: new Date().toLocaleString('zh-CN') },
    ],
  }
}

function resetForm() {
  form.value.name = ''
  form.value.startTime = ''
  form.value.deadline = ''
  form.value.tags = []
  form.value.reminder = undefined
  form.value.recurrence = ''
  form.value.description = ''
}

function handleCreate() {
  if (!form.value.name.trim()) return
  emit('create', buildTask())
  emit('close')
}

function handleCreateAndNext() {
  if (!form.value.name.trim()) return
  emit('create', buildTask())
  resetForm()
  nextTick(() => nameInputRef.value?.focus())
}

onMounted(() => {
  nextTick(() => nameInputRef.value?.focus())
})
</script>

<style scoped lang="scss">
.task-create-form {
  margin-top: 12px;
}

.form-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .form-label {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border: 1px solid var(--el-color-primary);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-color-primary);
    cursor: pointer;
    background: #fff;
  }

  .more-label {
    margin-left: auto;
    font-size: 13px;
    color: var(--el-color-primary);
  }
}

.task-name-input {
  margin-bottom: 16px;

  :deep(.el-textarea__inner) {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    resize: none;

    &:focus {
      border-color: var(--el-color-primary);
    }
  }
}

.form-fields {
  margin-bottom: 20px;
}

.field-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.field-icon {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  margin-right: 12px;
  font-size: 16px;
}

.field-label {
  font-size: 14px;
  color: #999;
  min-width: 50px;
  margin-right: 16px;
}

.field-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.assignee-avatar {
  background: #d4a437;
  color: #fff;
  font-size: 12px;
}

.assignee-name {
  font-size: 14px;
  color: #333;
}

.time-text {
  font-size: 13px;
  color: #333;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }

  &.placeholder {
    color: #ccc;
  }

  &.active {
    color: var(--el-color-primary);
  }
}

.time-sep {
  color: #ccc;
  font-size: 13px;
}

.datetime-panel-wrap {
  padding: 0 0 0 48px;
  border-bottom: 1px solid #f5f5f5;
}

.datetime-panel {
  width: 320px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 8px 0;
}

.dp-header {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.dp-tab-btn {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  transition: all 0.2s;

  &.active {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}

.dp-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  gap: 8px;
}

.dp-nav-btn {
  cursor: pointer;
  color: #999;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
}

.dp-nav-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 100px;
  text-align: center;
}

.dp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 8px;

  span {
    text-align: center;
    font-size: 12px;
    color: #999;
    padding: 4px 0;
  }
}

.dp-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 8px 8px;
}

.dp-day {
  text-align: center;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  color: #333;
  transition: all 0.15s;

  &:hover {
    background: #f0f5ff;
  }

  &.other-month {
    color: #ccc;
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

.dp-time-cols {
  display: flex;
  height: 220px;
  border-top: 1px solid #f0f0f0;
}

.dp-time-col {
  flex: 1;

  &:first-child {
    border-right: 1px solid #f0f0f0;
  }
}

.dp-time-col-title {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 8px 0 4px;
  border-bottom: 1px solid #f5f5f5;
}

.dp-time-scroll {
  height: 180px;
  overflow-y: auto;
}

.dp-time-cell {
  text-align: center;
  padding: 4px 0;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s;

  &:hover {
    background: #f0f5ff;
  }

  &.active {
    color: var(--el-color-primary);
    font-weight: 600;
    background: #ecf5ff;
  }
}

.dp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #eee;
}

.field-divider {
  color: #e8e8e8;
  margin: 0 4px;
}

.field-action {
  font-size: 16px;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.add-tag-btn {
  font-size: 18px;
  color: #ccc;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}

.priority-tag {
  cursor: pointer;
}

.more-row {
  cursor: pointer;

  &:hover .more-link {
    color: var(--el-color-primary);
  }
}

.more-link {
  font-size: 14px;
  color: #999;
  transition: color 0.2s;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.visibility-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.reminder-form {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
