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

        <!-- 负责人和协作人 -->
        <div class="info-row">
          <el-avatar :size="28" class="info-avatar">{{ localTask.assignee[0] }}</el-avatar>
          <span class="info-name">{{ localTask.assignee }}</span>
          <template v-for="c in localTask.collaborators" :key="c.id">
            <el-avatar :size="28" class="info-avatar collab-avatar">{{ c.name[0] }}</el-avatar>
          </template>
          <el-button size="small" round class="add-collab-btn">
            <el-icon><Plus /></el-icon>
            参与协作
          </el-button>
        </div>

        <!-- 时间 -->
        <div class="info-row">
          <el-icon class="info-icon"><Calendar /></el-icon>
          <div class="time-edit">
            <el-date-picker
              v-model="localTask.startTime"
              type="datetime"
              placeholder="开始时间"
              format="YYYY年MM月DD日 HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              size="small"
              style="width: 200px"
            />
            <span class="time-sep">-</span>
            <el-date-picker
              v-model="localTask.deadline"
              type="datetime"
              placeholder="截止时间"
              format="YYYY年MM月DD日 HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              size="small"
              style="width: 200px"
            />
          </div>
        </div>

        <!-- 设置按钮组 -->
        <div class="settings-row">
          <el-button size="small" round @click="reminderVisible = true">
            <el-icon><Bell /></el-icon>
            {{ localTask.reminder?.label || '设置提醒' }}
          </el-button>
          <el-button size="small" round @click="recurrenceVisible = true">
            <el-icon><RefreshRight /></el-icon>
            {{ localTask.recurrence || '设置重复' }}
          </el-button>
          <el-dropdown trigger="click" @command="handlePriorityChange">
            <el-button size="small" round>
              ||| {{ priorityLabel }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="high">紧急</el-dropdown-item>
                <el-dropdown-item command="normal">普通</el-dropdown-item>
                <el-dropdown-item command="low">低</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button size="small" round @click="addTagVisible = true">
            <el-icon><Plus /></el-icon>
            添加标签
          </el-button>
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
  Calendar, Bell, RefreshRight, Plus, ArrowDown,
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

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.info-avatar {
  background: #d4a437;
  color: #fff;
  font-size: 12px;
  flex-shrink: 0;

  &.collab-avatar {
    background: #666;
  }
}

.info-name {
  font-size: 14px;
  color: #333;
  margin-right: 4px;
}

.info-icon {
  font-size: 16px;
  color: #bbb;
}

.add-collab-btn {
  font-size: 12px;
  color: #999;
}

.time-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.time-sep {
  color: #ccc;
}

.settings-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
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
