export interface OKRStats {
  fillRate: number
  fillRateChange: number
  alignRate: number
  alignRateChange: number
  lowQualityRate: number
  lowQualityRateChange: number
  avgProgress: number
  avgProgressChange: number
  updateRate: number
  updateRateChange: number
}

export interface DepartmentOKR {
  id: number
  department: string
  leader: string
  headCount: number
  goalCount: number
  krCount: number
  noProgressRate: number
  warningRate: number
  inProgressRate: number
  overExpectedRate: number
  reminderCount: number
  lastReminderTime: string
}

export interface DepartmentAlign {
  id: number
  department: string
  leader: string
  headCount: number
  unalignedCount: number
  alignRate: number
  reminderCount: number
  lastReminderTime: string
  children?: DepartmentAlign[]
}

export interface Collaborator {
  id: number
  name: string
  avatar: string
  department?: string
}

export interface Reminder {
  type: string
  label: string
}

export interface ActivityItem {
  id: number
  user: string
  action: string
  time: string
}

export interface WorkTask {
  id: number
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  taskType: 'todo' | 'kr' | 'project'
  priority: 'high' | 'normal' | 'low'
  assignee: string
  collaborators: Collaborator[]
  startTime: string
  deadline: string
  reminder?: Reminder
  recurrence?: string
  tags: string[]
  description: string
  visibility: 'all' | 'private'
  activities: ActivityItem[]
}

export interface OKRItem {
  id: number
  title: string
  owner: string
  ownerAvatar: string
  progress: number
  krCount: number
}

export interface RiskData {
  noProgress: number
  warning: number
  inProgress: number
  overExpected: number
  total: number
}

export interface TaskOverviewStats {
  total: number
  periodCompleted: number
  periodCreated: number
  uncompleted: number
  overdueUncompleted: number
}
