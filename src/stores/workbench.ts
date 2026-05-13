import { defineStore } from 'pinia'
import { ref } from 'vue'

export type RoleType = 'boss' | 'manager' | 'employee'

export interface WidgetConfig {
  id: string
  type: string
  title: string
  subtitle?: string
  col: number
}

const bossWidgets: WidgetConfig[] = [
  { id: 'w1', type: 'work-calendar', title: '工作日历', col: 0 },
  { id: 'w2', type: 'okr-overview', title: 'OKR概况', subtitle: '全公司', col: 1 },
  { id: 'w3', type: 'work-tasks', title: '工作任务', subtitle: '我委派的', col: 0 },
  { id: 'w4', type: 'okr-risk', title: 'OKR风险分布', subtitle: '全公司', col: 1 },
]

const managerWidgets: WidgetConfig[] = [
  { id: 'w1', type: 'work-calendar', title: '工作日历', col: 0 },
  { id: 'w2', type: 'okr', title: 'OKR', subtitle: '我的下级', col: 1 },
  { id: 'w3', type: 'work-tasks', title: '工作任务', subtitle: '我负责的', col: 0 },
  { id: 'w4', type: 'task-owner', title: '任务负责人分布', subtitle: '我的部门', col: 1 },
]

const employeeWidgets: WidgetConfig[] = [
  { id: 'w1', type: 'work-calendar', title: '工作日历', col: 0 },
  { id: 'w2', type: 'okr-overview', title: 'OKR概况', col: 1 },
  { id: 'w3', type: 'work-tasks', title: '工作任务', subtitle: '我负责的', col: 0 },
  { id: 'w4', type: 'okr-risk', title: 'OKR风险分布', col: 1 },
  { id: 'w5', type: 'my-focus', title: '我关注的', col: 0 },
  { id: 'w6', type: 'my-projects', title: '我的项目', col: 1 },
  { id: 'w7', type: 'okr', title: 'OKR', subtitle: '我的OKR', col: 0 },
  { id: 'w8', type: 'task-overview', title: '任务概览', col: 1 },
  { id: 'w9', type: 'insights', title: '洞察', col: 1 },
]

export const useWorkbenchStore = defineStore('workbench', () => {
  const currentRole = ref<RoleType>('employee')
  const widgets = ref<WidgetConfig[]>([...employeeWidgets])
  const isEditing = ref(false)

  function getDefaultWidgets(role: RoleType): WidgetConfig[] {
    switch (role) {
      case 'boss': return bossWidgets.map(w => ({ ...w }))
      case 'manager': return managerWidgets.map(w => ({ ...w }))
      case 'employee': return employeeWidgets.map(w => ({ ...w }))
    }
  }

  function switchRole(role: RoleType) {
    currentRole.value = role
    widgets.value = getDefaultWidgets(role)
  }

  function setEditing(val: boolean) {
    isEditing.value = val
  }

  function moveWidget(id: string, direction: 'up' | 'down' | 'left' | 'right') {
    const idx = widgets.value.findIndex(w => w.id === id)
    if (idx === -1) return

    if (direction === 'left' || direction === 'right') {
      widgets.value[idx].col = direction === 'left' ? 0 : 1
    } else {
      const sameCol = widgets.value.filter(w => w.col === widgets.value[idx].col)
      const colIdx = sameCol.findIndex(w => w.id === id)
      const swapIdx = direction === 'up' ? colIdx - 1 : colIdx + 1
      if (swapIdx >= 0 && swapIdx < sameCol.length) {
        const targetId = sameCol[swapIdx].id
        const targetGlobalIdx = widgets.value.findIndex(w => w.id === targetId)
        const temp = widgets.value[idx]
        widgets.value[idx] = widgets.value[targetGlobalIdx]
        widgets.value[targetGlobalIdx] = temp
      }
    }
  }

  function removeWidget(id: string) {
    widgets.value = widgets.value.filter(w => w.id !== id)
  }

  function saveLayout() {
    isEditing.value = false
  }

  function cancelEdit() {
    widgets.value = getDefaultWidgets(currentRole.value)
    isEditing.value = false
  }

  return {
    currentRole,
    widgets,
    isEditing,
    switchRole,
    setEditing,
    moveWidget,
    removeWidget,
    saveLayout,
    cancelEdit,
  }
})
