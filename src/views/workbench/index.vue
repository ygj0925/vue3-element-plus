<template>
  <div class="workbench">
    <RoleSwitcher v-if="showRoleSwitcher" @close="showRoleSwitcher = false" />

    <template v-else>
      <div class="workbench-header">
        <h2 v-if="!store.isEditing" class="greeting">{{ greeting }}{{ userName }}</h2>
        <h2 v-else class="greeting">编辑工作台</h2>

        <div v-if="!store.isEditing" class="header-actions">
          <el-button type="primary" @click="store.setEditing(true)">编辑工作台</el-button>
        </div>
        <div v-else class="header-actions">
          <el-button @click="showRoleSwitcher = true">切换角色</el-button>
          <el-button @click="store.cancelEdit()">取消</el-button>
          <el-button type="primary" @click="store.saveLayout()">保存工作台</el-button>
        </div>
      </div>

      <div class="widget-grid">
        <div class="widget-col widget-col-left">
          <WidgetCard
            v-for="widget in leftWidgets"
            :key="widget.id"
            :widget="widget"
            :editing="store.isEditing"
            @move="(dir) => store.moveWidget(widget.id, dir)"
            @remove="store.removeWidget(widget.id)"
          >
            <component :is="getWidgetComponent(widget.type)" :widget="widget" @open-task="openTaskDetail" />
          </WidgetCard>
        </div>
        <div class="widget-col widget-col-right">
          <WidgetCard
            v-for="widget in rightWidgets"
            :key="widget.id"
            :widget="widget"
            :editing="store.isEditing"
            @move="(dir) => store.moveWidget(widget.id, dir)"
            @remove="store.removeWidget(widget.id)"
          >
            <component :is="getWidgetComponent(widget.type)" :widget="widget" @open-task="openTaskDetail" />
          </WidgetCard>
        </div>
      </div>
    </template>

    <TaskDetailDrawer v-model="taskDetailVisible" :task="selectedTask" @update:task="onTaskUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkbenchStore } from '@/stores/workbench'
import WidgetCard from './components/WidgetCard.vue'
import RoleSwitcher from './components/RoleSwitcher.vue'
import TaskDetailDrawer from './components/TaskDetailDrawer.vue'
import WorkCalendarWidget from './components/widgets/WorkCalendarWidget.vue'
import OKROverviewWidget from './components/widgets/OKROverviewWidget.vue'
import OKRRiskWidget from './components/widgets/OKRRiskWidget.vue'
import WorkTasksWidget from './components/widgets/WorkTasksWidget.vue'
import MyFocusWidget from './components/widgets/MyFocusWidget.vue'
import OKRWidget from './components/widgets/OKRWidget.vue'
import InsightsWidget from './components/widgets/InsightsWidget.vue'
import TaskOverviewWidget from './components/widgets/TaskOverviewWidget.vue'
import MyProjectsWidget from './components/widgets/MyProjectsWidget.vue'
import TaskOwnerWidget from './components/widgets/TaskOwnerWidget.vue'
import type { WorkTask } from './types'

const store = useWorkbenchStore()
const showRoleSwitcher = ref(false)
const taskDetailVisible = ref(false)
const selectedTask = ref<WorkTask | null>(null)

const userName = computed(() => '屹起会')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好！'
  if (hour < 12) return '上午好！'
  if (hour < 18) return '下午好！'
  return '晚上好！'
})

const leftWidgets = computed(() => store.widgets.filter(w => w.col === 0))
const rightWidgets = computed(() => store.widgets.filter(w => w.col === 1))

const widgetMap: Record<string, any> = {
  'work-calendar': WorkCalendarWidget,
  'okr-overview': OKROverviewWidget,
  'okr-risk': OKRRiskWidget,
  'work-tasks': WorkTasksWidget,
  'my-focus': MyFocusWidget,
  'okr': OKRWidget,
  'insights': InsightsWidget,
  'task-overview': TaskOverviewWidget,
  'my-projects': MyProjectsWidget,
  'task-owner': TaskOwnerWidget,
}

function getWidgetComponent(type: string) {
  return widgetMap[type] || 'div'
}

function openTaskDetail(task: WorkTask) {
  selectedTask.value = task
  taskDetailVisible.value = true
}

function onTaskUpdate(task: WorkTask) {
  selectedTask.value = task
}
</script>

<style scoped lang="scss">
.workbench {
  min-height: calc(100vh - 120px);
}

.workbench-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.greeting {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.widget-grid {
  display: flex;
  gap: 20px;
}

.widget-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
</style>
