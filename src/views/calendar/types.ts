export interface Collaborator {
  id: number
  name: string
  avatar: string
  department?: string
}

export interface Department {
  id: number
  name: string
  abbr: string
  memberCount: number
}

export interface Reminder {
  type: string
  value: number
  unit: string
}

export interface Task {
  id: number
  name: string
  date: string
  description: string
  deadline?: string
  reminder?: Reminder
  collaborators: Collaborator[]
  taskType: 'kr' | 'project' | 'todo'
}
