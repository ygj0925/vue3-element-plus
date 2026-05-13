import type {
  OKRStats,
  DepartmentOKR,
  DepartmentAlign,
  WorkTask,
  OKRItem,
  RiskData,
  TaskOverviewStats,
} from './types'

export const mockOKRStats: OKRStats = {
  fillRate: 100,
  fillRateChange: 100,
  alignRate: 0,
  alignRateChange: 0,
  lowQualityRate: 0,
  lowQualityRateChange: 0,
  avgProgress: -10,
  avgProgressChange: -10,
  updateRate: 0,
  updateRateChange: 0,
}

export const mockDepartmentOKR: DepartmentOKR[] = [
  { id: 1, department: '未分部门', leader: '未设置', headCount: 2, goalCount: 2, krCount: 2, noProgressRate: 0, warningRate: 0, inProgressRate: 0, overExpectedRate: 0, reminderCount: 2, lastReminderTime: '' },
  { id: 2, department: '未分部门', leader: '未设置', headCount: 2, goalCount: 2, krCount: 2, noProgressRate: 0, warningRate: 0, inProgressRate: 0, overExpectedRate: 0, reminderCount: 2, lastReminderTime: '' },
  { id: 3, department: '未分部门', leader: '未设置', headCount: 2, goalCount: 2, krCount: 2, noProgressRate: 0, warningRate: 0, inProgressRate: 0, overExpectedRate: 0, reminderCount: 2, lastReminderTime: '' },
  { id: 4, department: '未分部门', leader: '未设置', headCount: 2, goalCount: 2, krCount: 2, noProgressRate: 0, warningRate: 0, inProgressRate: 0, overExpectedRate: 0, reminderCount: 2, lastReminderTime: '' },
  { id: 5, department: '未分部门', leader: '未设置', headCount: 2, goalCount: 2, krCount: 2, noProgressRate: 0, warningRate: 0, inProgressRate: 0, overExpectedRate: 0, reminderCount: 2, lastReminderTime: '' },
  { id: 6, department: '未分部门', leader: '未设置', headCount: 2, goalCount: 2, krCount: 2, noProgressRate: 0, warningRate: 0, inProgressRate: 0, overExpectedRate: 0, reminderCount: 2, lastReminderTime: '' },
]

export const mockDepartmentAlign: DepartmentAlign[] = [
  { id: 1, department: '未分配部门', leader: '未设置', headCount: 2, unalignedCount: 2, alignRate: 0, reminderCount: 0, lastReminderTime: '' },
  { id: 2, department: '产品部', leader: '未设置', headCount: 2, unalignedCount: 0, alignRate: 0, reminderCount: 0, lastReminderTime: '', children: [
    { id: 21, department: '某', leader: '未设置', headCount: 2, unalignedCount: 0, alignRate: 0, reminderCount: 0, lastReminderTime: '' },
  ]},
  { id: 3, department: '设计部', leader: '未设置', headCount: 2, unalignedCount: 0, alignRate: 0, reminderCount: 0, lastReminderTime: '' },
  { id: 4, department: '人事部', leader: '未设置', headCount: 2, unalignedCount: 0, alignRate: 0, reminderCount: 0, lastReminderTime: '' },
  { id: 5, department: '未分配部门', leader: '未设置', headCount: 2, unalignedCount: 0, alignRate: 0, reminderCount: 0, lastReminderTime: '' },
  { id: 6, department: '未分配部门', leader: '未设置', headCount: 2, unalignedCount: 0, alignRate: 0, reminderCount: 0, lastReminderTime: '' },
]

export const mockWorkTasks: WorkTask[] = [
  {
    id: 1, name: '完成Q2产品路线图', status: 'in_progress', taskType: 'todo', priority: 'high',
    assignee: '余着', collaborators: [{ id: 1, name: '屹起会', avatar: '', department: '产品部' }],
    startTime: '2026-05-01 09:00', deadline: '2026-05-15 19:00',
    reminder: { type: 'before_start', label: '任务开始前 1 分钟' },
    tags: [], description: '', visibility: 'all',
    activities: [
      { id: 1, user: '余着', action: '创建了任务', time: '2026-05-01 09:00' },
    ],
  },
  {
    id: 2, name: '用户调研报告', status: 'pending', taskType: 'todo', priority: 'normal',
    assignee: '余着', collaborators: [],
    startTime: '', deadline: '2026-05-20 19:00',
    tags: [], description: '', visibility: 'all',
    activities: [],
  },
  {
    id: 3, name: 'okr', status: 'completed', taskType: 'kr', priority: 'normal',
    assignee: '余着', collaborators: [{ id: 1, name: '屹起会', avatar: '', department: '产品部' }],
    startTime: '', deadline: '2026-05-05 19:00',
    reminder: { type: 'before_start', label: '任务开始前 1 分钟' },
    tags: [], description: '', visibility: 'all',
    activities: [
      { id: 1, user: '余着', action: '修改了任务状态为「已完成」', time: '2026-05-13 15:13' },
    ],
  },
]

export const mockOKRItems: OKRItem[] = [
  { id: 1, title: '示例目标欢迎来到OKR，学习与实践OKR推进企业目标落地...', owner: '屹起会', ownerAvatar: '', progress: 40, krCount: 2 },
  { id: 2, title: '示例目标欢迎来到OKR，学习与实践OKR推进企业目标落地...', owner: '屹起会', ownerAvatar: '', progress: 25, krCount: 2 },
]

export const mockRiskData: RiskData = {
  noProgress: 50,
  warning: 50,
  inProgress: 50,
  overExpected: 50,
  total: 200,
}

export const mockTaskOverview: TaskOverviewStats = {
  total: 1,
  periodCompleted: 0,
  periodCreated: 0,
  uncompleted: 1,
  overdueUncompleted: 0,
}

export const mockCalendarTasks = [
  { id: 1, name: '平面设计', date: '2026-04-23', type: 'todo' as const },
]
