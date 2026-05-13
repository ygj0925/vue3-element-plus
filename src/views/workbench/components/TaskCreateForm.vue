<template>
  <div class="task-create-form">
    <div class="form-card">
      <div class="form-header">
        <span class="form-badge">创建</span>
        <el-dropdown size="small">
          <span class="status-badge">
            待办任务 <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>待办任务</el-dropdown-item>
              <el-dropdown-item>KR任务</el-dropdown-item>
              <el-dropdown-item>项目任务</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-input
        v-model="form.name"
        type="textarea"
        :rows="3"
        placeholder="请输入具体的工作任务(例：每天拜访50个客户/每周邀约面试30人)"
        class="task-input"
      />

      <div class="form-fields">
        <div class="field-row">
          <el-icon><User /></el-icon>
          <span class="field-label">负责人</span>
          <el-avatar :size="24" class="field-avatar">{{ assignee[0] }}</el-avatar>
          <span class="field-value">{{ assignee }}</span>
        </div>

        <div class="field-row">
          <el-icon><Calendar /></el-icon>
          <span class="field-label">时间</span>
          <span class="field-value">{{ dateRange }}</span>
          <el-icon class="field-action" @click="showRecurrence = !showRecurrence"><RefreshRight /></el-icon>
          <el-icon class="field-action" @click="showReminder = !showReminder"><Bell /></el-icon>
        </div>

        <div class="field-row">
          <el-icon><PriceTag /></el-icon>
          <span class="field-label">标签</span>
          <el-icon class="field-action"><Plus /></el-icon>
        </div>

        <div class="field-row">
          <el-icon><SetUp /></el-icon>
          <span class="field-label">优先级</span>
          <el-tag size="small" type="info">普通</el-tag>
        </div>
      </div>

      <div class="form-footer">
        <span class="visibility">
          <el-icon><View /></el-icon> 全员可见
        </span>
        <div class="form-actions">
          <el-button size="small" @click="$emit('close')">取消</el-button>
          <el-button size="small" @click="handleCreateAndNext">完成并创建下一个</el-button>
          <el-button size="small" type="primary" @click="handleCreate">完成</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowDown, User, Calendar, RefreshRight, Bell, PriceTag, SetUp, Plus, View } from '@element-plus/icons-vue'

const emit = defineEmits<{
  close: []
  create: [task: { name: string }]
}>()

const form = reactive({
  name: '',
  taskType: 'todo',
  priority: 'normal',
})

const assignee = '屹起会'
const dateRange = '2026年04月24日 09:00 - 2026年04月30日 19:00 截止'
const showRecurrence = ref(false)
const showReminder = ref(false)

function handleCreate() {
  if (form.name.trim()) {
    emit('create', { name: form.name.trim() })
    form.name = ''
  }
}

function handleCreateAndNext() {
  if (form.name.trim()) {
    emit('create', { name: form.name.trim() })
    form.name = ''
  }
}
</script>

<style scoped lang="scss">
.task-create-form {
  margin-top: 12px;
}

.form-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.form-badge {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.task-input {
  margin-bottom: 16px;

  :deep(.el-textarea__inner) {
    border: none;
    background: #f9f9f9;
    border-radius: 8px;
    resize: none;
  }
}

.form-fields {
  margin-bottom: 16px;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #666;

  &:last-child { border-bottom: none; }

  .el-icon {
    color: #999;
  }
}

.field-label {
  color: #999;
  min-width: 50px;
}

.field-value {
  color: #333;
  flex: 1;
}

.field-avatar {
  width: 24px;
  height: 24px;
  background: #1890ff;
  color: #fff;
  font-size: 11px;
}

.field-action {
  cursor: pointer;
  color: #999;

  &:hover {
    color: var(--el-color-primary);
  }
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.visibility {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 8px;
}
</style>
