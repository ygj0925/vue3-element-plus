<template>
  <el-drawer
    v-model="visible"
    title=""
    size="500px"
    :with-header="false"
    destroy-on-close
  >
    <div class="task-detail">
      <div class="detail-header">
        <div class="header-left">
          <el-button size="small" round>
            <el-icon><CircleCheck /></el-icon> 完成待办
          </el-button>
          <el-button size="small" round>
            <el-icon><Switch /></el-icon> 变更所属
          </el-button>
        </div>
        <div class="header-right">
          <el-icon class="action-icon"><Star /></el-icon>
          <el-icon class="action-icon"><MoreFilled /></el-icon>
          <el-icon class="action-icon" @click="visible = false"><Close /></el-icon>
        </div>
      </div>

      <div class="detail-body">
        <h2 class="task-name">{{ taskData.name || '未命名任务' }}</h2>

        <div class="detail-fields">
          <div class="field-row">
            <el-icon><User /></el-icon>
            <el-avatar :size="24" class="field-avatar">{{ taskData.assignee?.[0] || '?' }}</el-avatar>
            <span>{{ taskData.assignee || '未指定' }}</span>
          </div>
          <div class="field-row">
            <el-icon><Calendar /></el-icon>
            <span>{{ taskData.dateRange || '未设置时间' }}</span>
          </div>
          <div class="field-row actions-row">
            <el-button size="small" round><el-icon><Bell /></el-icon> 设置提醒</el-button>
            <el-button size="small" round><el-icon><RefreshRight /></el-icon> 设置重复</el-button>
            <el-button size="small" round>普通</el-button>
            <el-button size="small" round><el-icon><PriceTag /></el-icon> 添加标签</el-button>
          </div>
        </div>

        <div class="description-area">
          <h4>请添加描述说明</h4>
          <el-input
            type="textarea"
            :rows="4"
            placeholder="添加描述..."
            v-model="description"
          />
        </div>

        <div class="activity-section">
          <div class="activity-header" @click="showActivity = !showActivity">
            <span>所有动态</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <div v-if="showActivity" class="activity-list">
            <div class="empty-activity">暂无动态</div>
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <div class="comment-input">
          <el-input
            v-model="comment"
            placeholder="有什么想法或意见都可以提出来哦，@提及他人"
          >
            <template #suffix>
              <el-icon class="comment-action"><Picture /></el-icon>
              <el-icon class="comment-action"><Paperclip /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CircleCheck, Switch, Star, MoreFilled, Close,
  User, Calendar, Bell, RefreshRight, PriceTag,
  ArrowDown, Picture, Paperclip
} from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
  task: any
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const taskData = computed(() => props.task || {
  name: '平面设计',
  assignee: '屹起会',
  dateRange: '2026年04月24日 09:00 - 2026年04月30日 19:00',
})

const description = ref('')
const comment = ref('')
const showActivity = ref(true)
</script>

<style scoped lang="scss">
.task-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;

  .action-icon {
    font-size: 18px;
    color: #666;
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.task-name {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.detail-fields {
  margin-bottom: 24px;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  font-size: 14px;
  color: #333;

  .el-icon {
    color: #999;
    font-size: 16px;
  }
}

.field-avatar {
  background: #1890ff;
  color: #fff;
  font-size: 11px;
}

.actions-row {
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
}

.description-area {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: #999;
    font-weight: 400;
  }
}

.activity-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin-bottom: 12px;
}

.empty-activity {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 20px 0;
}

.detail-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
}

.comment-input {
  .comment-action {
    font-size: 16px;
    color: #999;
    cursor: pointer;
    margin-left: 8px;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
