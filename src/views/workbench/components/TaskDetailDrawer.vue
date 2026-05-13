<template>
  <el-drawer
    v-model="visible"
    :size="520"
    :with-header="false"
    destroy-on-close
    class="task-detail-drawer"
  >
    <div class="task-detail">
      <!-- 顶部状态栏 -->
      <div class="detail-top-bar">
        <div class="top-left">
          <el-button
            :type="localTask.status === 'completed' ? 'success' : 'default'"
            size="small"
            round
            @click="toggleStatus"
          >
            <el-icon><CircleCheck /></el-icon>
            {{ localTask.status === 'completed' ? '已完成' : '完成待办' }}
          </el-button>
          <el-button size="small" round>
            <el-icon><Switch /></el-icon>
            变更所属
          </el-button>
        </div>
        <div class="top-right">
          <el-icon class="top-action" @click="localTask.starred = !localTask.starred">
            <StarFilled v-if="localTask.starred" />
            <Star v-else />
          </el-icon>
          <el-dropdown trigger="click">
            <el-icon class="top-action"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>删除任务</el-dropdown-item>
                <el-dropdown-item>复制任务</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-icon class="top-action close-btn" @click="handleClose"><Close /></el-icon>
        </div>
      </div>

      <!-- 滚动内容区域 -->
      <div class="detail-scroll">
        <!-- 任务名称 -->
        <div class="task-name-section">
          <el-input
            v-model="localTask.name"
            class="task-name-input"
            :class="{ completed: localTask.status === 'completed' }"
            placeholder="输入任务名称"
          />
        </div>

        <!-- 信息标签行1：负责人 + 协作人 + 时间 -->
        <div class="detail-pills-row">
          <span class="detail-pill assignee-pill">
            <el-avatar :size="20" class="pill-avatar">{{ localTask.assignee[0] }}</el-avatar>
            {{ localTask.assignee }}
          </span>
          <template v-for="c in localTask.collaborators" :key="c.id">
            <span class="detail-pill collab-pill">
              <el-avatar :size="20" class="pill-avatar pill-avatar-collab">{{ c.name[0] }}</el-avatar>
            </span>
          </template>
          <span class="detail-pill action-pill" @click="() => {}">
            <el-icon><Plus /></el-icon>
            参与协作
          </span>
          <span class="detail-pill time-pill">
            <el-icon><Clock /></el-icon>
            <span class="time-click" @click="openPicker('start')">{{ localTask.startTime ? formatTimeDisplay(localTask.startTime) : '开始时间' }}</span>
            <span class="time-dash">-</span>
            <span class="time-click" @click="openPicker('end')">{{ localTask.deadline ? formatTimeDisplay(localTask.deadline) : '截止时间' }}</span>
          </span>
        </div>

        <!-- 时间选择面板 -->
        <div v-if="dpVisible" class="datetime-panel-wrap">
          <div class="datetime-panel">
            <div class="dp-header">
              <span :class="['dp-tab-btn', { active: dpMode === 'date' }]" @click="dpMode = 'date'">
                {{ dpHasDate ? `${dpYear}-${dpPad(dpMonth)}-${dpPad(dpDay)}` : '选择日期' }}
              </span>
              <span :class="['dp-tab-btn', { active: dpMode === 'time' }]" @click="dpMode = 'time'">
                {{ dpHasDate ? `${dpPad(dpHour)}:${dpPad(dpMinute)}` : '选择时间' }}
              </span>
            </div>
            <template v-if="dpMode === 'date'">
              <div class="dp-nav">
                <span class="dp-nav-btn" @click="dpViewYear--">&laquo;</span>
                <span class="dp-nav-btn" @click="dpChangeMonth(-1)">&lsaquo;</span>
                <span class="dp-nav-title">{{ dpViewYear }}年 {{ dpViewMonth }}月</span>
                <span class="dp-nav-btn" @click="dpChangeMonth(1)">&rsaquo;</span>
                <span class="dp-nav-btn" @click="dpViewYear++">&raquo;</span>
              </div>
              <div class="dp-weekdays"><span v-for="w in dpWeeks" :key="w">{{ w }}</span></div>
              <div class="dp-days">
                <span v-for="(d, i) in dpCalDays" :key="i" :class="['dp-day', { 'other-month': !d.current, 'is-today': d.isToday, 'is-selected': d.isSelected }]" @click="dpPickDate(d)">{{ d.day }}</span>
              </div>
            </template>
            <template v-else>
              <div class="dp-time-cols">
                <div class="dp-time-col"><div class="dp-time-col-title">时</div><div class="dp-time-scroll"><div v-for="h in 24" :key="h-1" :class="['dp-time-cell', { active: dpHour === h-1 }]" @click="dpHour = h-1">{{ dpPad(h-1) }}</div></div></div>
                <div class="dp-time-col"><div class="dp-time-col-title">分</div><div class="dp-time-scroll"><div v-for="m in 60" :key="m-1" :class="['dp-time-cell', { active: dpMinute === m-1 }]" @click="dpMinute = m-1">{{ dpPad(m-1) }}</div></div></div>
              </div>
            </template>
            <div class="dp-footer">
              <el-button link type="primary" @click="dpSetNow">此刻</el-button>
              <el-button type="primary" size="small" @click="dpConfirm">确定</el-button>
            </div>
          </div>
        </div>

        <!-- 信息标签行2：提醒 + 重复 + 优先级 + 标签 -->
        <div class="detail-pills-row">
          <span class="detail-pill action-pill" @click="reminderVisible = true">
            <el-icon><Bell /></el-icon>
            {{ localTask.reminder?.label || '设置提醒' }}
          </span>
          <span class="detail-pill action-pill" @click="recurrenceVisible = true">
            <el-icon><RefreshRight /></el-icon>
            {{ localTask.recurrence || '设置重复' }}
          </span>
          <el-dropdown trigger="click" @command="handlePriorityChange">
            <span class="detail-pill action-pill">
              ||| {{ priorityLabel }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="high">紧急</el-dropdown-item>
                <el-dropdown-item command="normal">普通</el-dropdown-item>
                <el-dropdown-item command="low">低</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span class="detail-pill action-pill" @click="addTagVisible = true">
            <el-icon><Plus /></el-icon>
            添加标签
          </span>
        </div>

        <!-- 标签显示 -->
        <div v-if="localTask.tags.length > 0" class="tags-display">
          <el-tag
            v-for="tag in localTask.tags"
            :key="tag"
            closable
            size="small"
            @close="removeTag(tag)"
          >{{ tag }}</el-tag>
        </div>

        <!-- 描述/富文本编辑器 -->
        <div class="description-section">
          <div class="editor-toolbar">
            <el-icon class="toolbar-btn"><EditPen /></el-icon>
            <el-icon class="toolbar-btn"><Picture /></el-icon>
            <el-icon class="toolbar-btn"><Link /></el-icon>
            <el-icon class="toolbar-btn"><Calendar /></el-icon>
            <span class="toolbar-sep">|</span>
            <span class="toolbar-btn text-btn"><b>B</b></span>
            <span class="toolbar-btn text-btn"><i>I</i></span>
            <span class="toolbar-btn text-btn"><u>U</u></span>
            <span class="toolbar-btn text-btn"><s>S</s></span>
          </div>
          <el-input
            v-model="localTask.description"
            type="textarea"
            :rows="6"
            placeholder="添加描述说明..."
            class="description-input"
          />
          <div class="description-actions">
            <el-button size="small" @click="localTask.description = originalDescription">取消</el-button>
            <el-button type="primary" size="small" @click="saveDescription">确定</el-button>
          </div>
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 动态区域 -->
        <div class="activity-section">
          <div class="activity-header" @click="activityExpanded = !activityExpanded">
            <span class="activity-title">所有动态</span>
            <el-icon :class="{ rotated: !activityExpanded }"><ArrowDown /></el-icon>
          </div>

          <div v-if="activityExpanded" class="activity-list">
            <div v-if="localTask.activities.length === 0" class="empty-activity">暂无动态</div>
            <div v-for="act in localTask.activities" :key="act.id" class="activity-item">
              <div class="activity-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="activity-content">
                <span class="activity-text">{{ act.user }}{{ act.action }}</span>
              </div>
              <span class="activity-time">{{ act.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部评论 -->
      <div class="detail-footer">
        <div class="comment-area">
          <el-input
            v-model="comment"
            placeholder="想法，意见都可以提出来哦，@提及他人 ↵"
            class="comment-input"
          />
          <div class="comment-actions">
            <el-icon class="comment-btn"><Picture /></el-icon>
            <el-icon class="comment-btn"><Paperclip /></el-icon>
            <div class="comment-right">
              <el-dropdown split-button type="primary" size="small" @click="submitComment">
                发布
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>仅自己可见</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
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
        <el-option label="工作日" value="工作日" />
      </el-select>
      <template #footer>
        <el-button @click="recurrenceVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRecurrence">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加标签弹窗 -->
    <el-dialog v-model="addTagVisible" title="添加标签" width="360px" append-to-body destroy-on-close>
      <el-input v-model="newTag" placeholder="输入标签名" @keyup.enter="addTag" />
      <template #footer>
        <el-button @click="addTagVisible = false">取消</el-button>
        <el-button type="primary" @click="addTag">确定</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  CircleCheck, Switch, Star, StarFilled, MoreFilled, Close,
  Calendar, Bell, RefreshRight, Plus, ArrowDown, Clock,
  EditPen, Picture, Link, Paperclip
} from '@element-plus/icons-vue'
import type { WorkTask } from '../types'

const props = defineProps<{
  modelValue: boolean
  task: WorkTask | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'update:task': [task: WorkTask]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const localTask = ref<WorkTask & { starred?: boolean }>({
  id: 0, name: '', status: 'pending', taskType: 'todo', priority: 'normal',
  assignee: '余着', collaborators: [], startTime: '', deadline: '',
  tags: [], description: '', visibility: 'all', activities: [],
})

const originalDescription = ref('')
const comment = ref('')
const activityExpanded = ref(true)
const reminderVisible = ref(false)
const recurrenceVisible = ref(false)
const addTagVisible = ref(false)
const newTag = ref('')
const reminderType = ref('before_start')
const reminderValue = ref(1)
const reminderUnit = ref('分钟')
const recurrenceValue = ref('')

const dpVisible = ref(false)
const dpMode = ref<'date' | 'time'>('date')
const dpTarget = ref<'start' | 'end'>('start')
const dpHasDate = ref(false)
const dpYear = ref(new Date().getFullYear())
const dpMonth = ref(new Date().getMonth() + 1)
const dpDay = ref(new Date().getDate())
const dpHour = ref(new Date().getHours())
const dpMinute = ref(new Date().getMinutes())
const dpViewYear = ref(new Date().getFullYear())
const dpViewMonth = ref(new Date().getMonth() + 1)
const dpWeeks = ['日', '一', '二', '三', '四', '五', '六']

function dpPad(n: number) { return String(n).padStart(2, '0') }

const dpCalDays = computed(() => {
  const y = dpViewYear.value, m = dpViewMonth.value
  const firstDay = new Date(y, m - 1, 1).getDay()
  const dim = new Date(y, m, 0).getDate()
  const dip = new Date(y, m - 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${dpPad(today.getMonth() + 1)}-${dpPad(today.getDate())}`
  const selStr = dpHasDate.value ? `${dpYear.value}-${dpPad(dpMonth.value)}-${dpPad(dpDay.value)}` : ''
  const cells: { day: number; current: boolean; isToday: boolean; isSelected: boolean; year: number; month: number }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = dip - i, pm = m - 1 <= 0 ? 12 : m - 1, py = m - 1 <= 0 ? y - 1 : y
    const ds = `${py}-${dpPad(pm)}-${dpPad(d)}`
    cells.push({ day: d, current: false, isToday: ds === todayStr, isSelected: ds === selStr, year: py, month: pm })
  }
  for (let d = 1; d <= dim; d++) {
    const ds = `${y}-${dpPad(m)}-${dpPad(d)}`
    cells.push({ day: d, current: true, isToday: ds === todayStr, isSelected: ds === selStr, year: y, month: m })
  }
  const rem = 42 - cells.length
  for (let d = 1; d <= rem; d++) {
    const nm = m + 1 > 12 ? 1 : m + 1, ny = m + 1 > 12 ? y + 1 : y
    const ds = `${ny}-${dpPad(nm)}-${dpPad(d)}`
    cells.push({ day: d, current: false, isToday: ds === todayStr, isSelected: ds === selStr, year: ny, month: nm })
  }
  return cells
})

function openPicker(target: 'start' | 'end') {
  dpTarget.value = target
  dpMode.value = 'date'
  const timeStr = target === 'start' ? localTask.value.startTime : localTask.value.deadline
  if (timeStr) {
    const [datePart, timePart] = timeStr.split(' ')
    const [y, m, d] = datePart.split('-').map(Number)
    const [h, min] = timePart.split(':').map(Number)
    dpYear.value = y; dpMonth.value = m; dpDay.value = d
    dpHour.value = h; dpMinute.value = min
    dpViewYear.value = y; dpViewMonth.value = m
    dpHasDate.value = true
  } else {
    const now = new Date()
    dpYear.value = now.getFullYear(); dpMonth.value = now.getMonth() + 1; dpDay.value = now.getDate()
    dpHour.value = now.getHours(); dpMinute.value = now.getMinutes()
    dpViewYear.value = now.getFullYear(); dpViewMonth.value = now.getMonth() + 1
    dpHasDate.value = false
  }
  dpVisible.value = true
}

function dpPickDate(d: { day: number; year: number; month: number }) {
  dpYear.value = d.year; dpMonth.value = d.month; dpDay.value = d.day; dpHasDate.value = true
}

function dpChangeMonth(delta: number) {
  let m = dpViewMonth.value + delta, y = dpViewYear.value
  if (m > 12) { m = 1; y++ } else if (m < 1) { m = 12; y-- }
  dpViewMonth.value = m; dpViewYear.value = y
}

function dpSetNow() {
  const now = new Date()
  dpYear.value = now.getFullYear(); dpMonth.value = now.getMonth() + 1; dpDay.value = now.getDate()
  dpHour.value = now.getHours(); dpMinute.value = now.getMinutes()
  dpViewYear.value = now.getFullYear(); dpViewMonth.value = now.getMonth() + 1
  dpHasDate.value = true
}

function dpConfirm() {
  const val = `${dpYear.value}-${dpPad(dpMonth.value)}-${dpPad(dpDay.value)} ${dpPad(dpHour.value)}:${dpPad(dpMinute.value)}`
  if (dpTarget.value === 'start') { localTask.value.startTime = val } else { localTask.value.deadline = val }
  dpVisible.value = false
}

function formatTimeDisplay(time: string) {
  if (!time) return ''
  const [date, hm] = time.split(' ')
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日 ${hm}`
}

watch(() => props.modelValue, (val) => {
  if (val && props.task) {
    localTask.value = {
      ...props.task,
      collaborators: [...props.task.collaborators],
      tags: [...props.task.tags],
      activities: [...props.task.activities],
      starred: false,
    }
    originalDescription.value = props.task.description
    if (props.task.reminder) {
      const parts = props.task.reminder.label.match(/(.+?)(\d+)?\s*(分钟|小时|天)?$/)
      if (parts) {
        reminderType.value = props.task.reminder.type
        reminderValue.value = parts[2] ? parseInt(parts[2]) : 1
        reminderUnit.value = parts[3] || '分钟'
      }
    }
    recurrenceValue.value = props.task.recurrence || ''
  }
})

const priorityLabel = computed(() => {
  const map: Record<string, string> = { high: '紧急', normal: '普通', low: '低' }
  return map[localTask.value.priority]
})

function toggleStatus() {
  localTask.value.status = localTask.value.status === 'completed' ? 'pending' : 'completed'
  const action = localTask.value.status === 'completed'
    ? '修改了任务状态为「已完成」'
    : '修改了任务状态为「待办」'
  localTask.value.activities.unshift({
    id: Date.now(),
    user: localTask.value.assignee,
    action,
    time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
  })
}

function handlePriorityChange(priority: string) {
  localTask.value.priority = priority as 'high' | 'normal' | 'low'
}

function removeTag(tag: string) {
  localTask.value.tags = localTask.value.tags.filter(t => t !== tag)
}

function addTag() {
  if (newTag.value.trim() && !localTask.value.tags.includes(newTag.value.trim())) {
    localTask.value.tags.push(newTag.value.trim())
  }
  newTag.value = ''
  addTagVisible.value = false
}

function confirmReminder() {
  if (reminderType.value === 'none') {
    localTask.value.reminder = undefined
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
    localTask.value.reminder = { type: reminderType.value, label }
  }
  reminderVisible.value = false
}

function confirmRecurrence() {
  localTask.value.recurrence = recurrenceValue.value || undefined
  recurrenceVisible.value = false
}

function saveDescription() {
  originalDescription.value = localTask.value.description
}

function submitComment() {
  if (!comment.value.trim()) return
  localTask.value.activities.unshift({
    id: Date.now(),
    user: localTask.value.assignee,
    action: `评论：${comment.value}`,
    time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
  })
  comment.value = ''
}

function handleClose() {
  emit('update:task', { ...localTask.value })
  visible.value = false
}
</script>

<style scoped lang="scss">
.task-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.top-left {
  display: flex;
  gap: 8px;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.top-action {
  font-size: 18px;
  color: #666;
  cursor: pointer;

  &:hover { color: var(--el-color-primary); }

  &.close-btn:hover { color: #999; }
}

.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.task-name-section {
  margin-bottom: 20px;
}

.task-name-input {
  :deep(.el-input__inner) {
    border: none;
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    padding: 0;
  }

  &.completed :deep(.el-input__inner) {
    text-decoration: line-through;
    color: #999;
  }
}

.detail-pills-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
  background: #fff;
  white-space: nowrap;
  height: 30px;
  box-sizing: border-box;
}

.assignee-pill {
  padding-left: 4px;
}

.collab-pill {
  padding: 3px;
}

.pill-avatar {
  background: #d4a437;
  color: #fff;
  font-size: 10px;
  flex-shrink: 0;

  &.pill-avatar-collab {
    background: #666;
  }
}

.action-pill {
  cursor: pointer;
  transition: all 0.2s;

  .el-icon {
    font-size: 14px;
    color: #909399;
  }

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);

    .el-icon {
      color: var(--el-color-primary);
    }
  }
}

.time-pill {
  .el-icon {
    font-size: 14px;
    color: #909399;
  }
}

.time-click {
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.time-dash {
  color: #c0c4cc;
  margin: 0 2px;
}

.datetime-panel-wrap {
  padding: 0 0 0 24px;
  margin-bottom: 12px;
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

  &:hover { background: #f5f5f5; color: #333; }
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

  span { text-align: center; font-size: 12px; color: #999; padding: 4px 0; }
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

  &:hover { background: #f0f5ff; }
  &.other-month { color: #ccc; }
  &.is-today { color: var(--el-color-primary); font-weight: 600; }
  &.is-selected { background: var(--el-color-primary); color: #fff; font-weight: 500; &:hover { background: var(--el-color-primary); } }
}

.dp-time-cols {
  display: flex;
  height: 220px;
  border-top: 1px solid #f0f0f0;
}

.dp-time-col {
  flex: 1;
  &:first-child { border-right: 1px solid #f0f0f0; }
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

  &:hover { background: #f0f5ff; }
  &.active { color: var(--el-color-primary); font-weight: 600; background: #ecf5ff; }
}

.dp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #eee;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.description-section {
  margin-bottom: 16px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #eee;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.toolbar-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-size: 14px;

  &:hover {
    background: #eee;
    color: #333;
  }
}

.text-btn {
  font-size: 13px;
}

.toolbar-sep {
  color: #e0e0e0;
  margin: 0 4px;
}

.description-input {
  :deep(.el-textarea__inner) {
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #eee;
    resize: none;
    font-size: 14px;
    padding: 12px 16px;
  }
}

.description-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.activity-section {
  margin-top: 8px;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin-bottom: 16px;

  .activity-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .el-icon {
    transition: transform 0.2s;
    color: #999;

    &.rotated {
      transform: rotate(-90deg);
    }
  }
}

.activity-list {
  padding-left: 4px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;

  &:last-child { border-bottom: none; }
}

.activity-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 14px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 13px;
  color: #666;
}

.activity-time {
  font-size: 12px;
  color: #ccc;
  white-space: nowrap;
  flex-shrink: 0;
}

.empty-activity {
  text-align: center;
  color: #ccc;
  font-size: 13px;
  padding: 16px 0;
}

.detail-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.comment-area {
  .comment-input {
    margin-bottom: 8px;
  }
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-btn {
  font-size: 18px;
  color: #bbb;
  cursor: pointer;

  &:hover { color: var(--el-color-primary); }
}

.comment-right {
  margin-left: auto;
}

.reminder-form {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
