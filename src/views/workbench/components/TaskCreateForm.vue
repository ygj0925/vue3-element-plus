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
          <div class="field-content time-content">
            <div class="time-display" @click="showTimePicker = !showTimePicker">
              <template v-if="form.startTime || form.deadline">
                {{ formatTimeDisplay(form.startTime) }} - {{ formatTimeDisplay(form.deadline) }}
                <span v-if="form.deadline" class="deadline-mark">截止</span>
              </template>
              <template v-else>
                <span class="placeholder-text">开始时间 - 截止时间</span>
              </template>
            </div>
            <span class="field-divider">|</span>
            <el-tooltip content="设置重复" placement="top">
              <el-icon class="field-action" @click="recurrenceVisible = true"><RefreshRight /></el-icon>
            </el-tooltip>
            <el-tooltip content="设置提醒" placement="top">
              <el-icon class="field-action" @click="reminderVisible = true"><Bell /></el-icon>
            </el-tooltip>
          </div>
        </div>

        <!-- 时间选择面板 -->
        <div v-if="showTimePicker" class="time-picker-panel">
          <div class="time-picker-row">
            <span class="time-picker-label">开始时间</span>
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY年MM月DD日 HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              size="small"
              style="width: 240px"
            />
          </div>
          <div class="time-picker-row">
            <span class="time-picker-label">截止时间</span>
            <el-date-picker
              v-model="form.deadline"
              type="datetime"
              placeholder="选择截止时间"
              format="YYYY年MM月DD日 HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              size="small"
              style="width: 240px"
            />
          </div>
          <div class="time-picker-actions">
            <el-button size="small" @click="showTimePicker = false">确定</el-button>
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
const showTimePicker = ref(false)
const showMore = ref(false)
const addTagVisible = ref(false)
const newTag = ref('')
const reminderVisible = ref(false)
const recurrenceVisible = ref(false)
const reminderType = ref('before_start')
const reminderValue = ref(1)
const reminderUnit = ref('分钟')
const recurrenceValue = ref('')

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

.time-content {
  gap: 12px;
}

.time-display {
  font-size: 13px;
  color: #333;
  cursor: pointer;
  padding: 4px 0;

  &:hover {
    color: var(--el-color-primary);
  }

  .placeholder-text {
    color: #ccc;
  }

  .deadline-mark {
    color: #999;
    font-size: 12px;
    margin-left: 4px;
  }
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

.time-picker-panel {
  padding: 12px 0 12px 48px;
  border-bottom: 1px solid #f5f5f5;
}

.time-picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.time-picker-label {
  font-size: 13px;
  color: #999;
  min-width: 60px;
}

.time-picker-actions {
  display: flex;
  justify-content: flex-end;
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
