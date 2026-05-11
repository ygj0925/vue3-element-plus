import type { Collaborator, Department } from './types'

export const mockDepartments: Department[] = [
  { id: 1, name: '运营部', abbr: '运', memberCount: 0 },
  { id: 2, name: '设计部', abbr: '设', memberCount: 0 },
  { id: 3, name: '产品部', abbr: '产', memberCount: 0 },
  { id: 4, name: '人事部', abbr: '人', memberCount: 0 },
  { id: 5, name: '行政部', abbr: '行', memberCount: 0 },
]

export const mockMembers: Collaborator[] = [
  { id: 1, name: '刘子龙', avatar: '', department: '运营部' },
  { id: 2, name: '张曼曼', avatar: '', department: '设计部' },
  { id: 3, name: '刘倩倩', avatar: '', department: '产品部' },
  { id: 4, name: '刘风', avatar: '', department: '人事部' },
]

export const reminderTypeOptions = [
  { label: '不提醒', value: 'none' },
  { label: '任务开始时', value: 'task_start' },
  { label: '任务开始前', value: 'before_start' },
  { label: '任务开始后', value: 'after_start' },
  { label: '任务截止时', value: 'task_deadline' },
  { label: '任务截止前', value: 'before_deadline' },
  { label: '任务截止后', value: 'after_deadline' },
  { label: '自定义时间', value: 'custom' },
]

export const reminderValueOptions = [1, 5, 10, 15, 20, 25, 30]

export const reminderUnitOptions = [
  { label: '分钟', value: 'minute' },
  { label: '小时', value: 'hour' },
  { label: '天', value: 'day' },
]
