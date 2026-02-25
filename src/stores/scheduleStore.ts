import { create } from 'zustand'
import { db } from '../db/database'
import type { Task, DayOfWeek, DailyLog } from '../db/types'
import { getTodayString } from '../utils/time'
import { showToast } from '../components/ui/Toast'

interface ScheduleState {
  tasks: Task[]
  dailyLogs: DailyLog[]
  isLoaded: boolean

  load: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<number>
  updateTask: (id: number, patch: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  duplicateTask: (id: number, toDays: DayOfWeek[]) => Promise<void>

  // Daily completion
  loadDailyLogs: (date?: string) => Promise<void>
  toggleTaskComplete: (taskId: number, date?: string) => Promise<void>
  toggleSubtaskComplete: (taskId: number, subtaskId: string, date?: string) => Promise<void>

  // Helpers
  getTasksForDay: (day: DayOfWeek) => Task[]
  getTaskCompletion: (taskId: number, date?: string) => DailyLog | undefined
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  tasks: [],
  dailyLogs: [],
  isLoaded: false,

  load: async () => {
    try {
      const tasks = await db.tasks.toArray()
      const today = getTodayString()
      const dailyLogs = await db.dailyLogs.where('date').equals(today).toArray()
      set({ tasks, dailyLogs, isLoaded: true })
    } catch (err) {
      console.error('Failed to load schedule:', err)
      showToast('Failed to load schedule', 'error')
    }
  },

  addTask: async (taskData) => {
    try {
      const task: Task = { ...taskData, createdAt: new Date() }
      const id = await db.tasks.add(task)
      const tasks = await db.tasks.toArray()
      set({ tasks })
      return id
    } catch (err) {
      console.error('Failed to add task:', err)
      showToast('Failed to save task', 'error')
      return -1
    }
  },

  updateTask: async (id, patch) => {
    try {
      await db.tasks.update(id, patch)
      const tasks = await db.tasks.toArray()
      set({ tasks })
    } catch (err) {
      console.error('Failed to update task:', err)
      showToast('Failed to update task', 'error')
    }
  },

  deleteTask: async (id) => {
    try {
      await db.tasks.delete(id)
      await db.dailyLogs.where('taskId').equals(id).delete()
      const tasks = await db.tasks.toArray()
      set({ tasks })
    } catch (err) {
      console.error('Failed to delete task:', err)
      showToast('Failed to delete task', 'error')
    }
  },

  duplicateTask: async (id, toDays) => {
    try {
      const original = await db.tasks.get(id)
      if (!original) return
      for (const day of toDays) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _dupId, ...rest } = original
        await db.tasks.add({ ...rest, days: [day], createdAt: new Date() })
      }
      const tasks = await db.tasks.toArray()
      set({ tasks })
    } catch (err) {
      console.error('Failed to duplicate task:', err)
      showToast('Failed to duplicate task', 'error')
    }
  },

  loadDailyLogs: async (date) => {
    try {
      const d = date || getTodayString()
      const dailyLogs = await db.dailyLogs.where('date').equals(d).toArray()
      set({ dailyLogs })
    } catch (err) {
      console.error('Failed to load daily logs:', err)
    }
  },

  toggleTaskComplete: async (taskId, date) => {
    try {
      const d = date || getTodayString()
      const existing = await db.dailyLogs.where({ date: d, taskId }).first()

      if (existing?.id) {
        await db.dailyLogs.update(existing.id, {
          isComplete: !existing.isComplete,
          completedAt: !existing.isComplete ? new Date() : undefined,
        })
      } else {
        await db.dailyLogs.add({
          date: d,
          taskId,
          isComplete: true,
          subtaskCompletions: {},
          completedAt: new Date(),
        })
      }

      const dailyLogs = await db.dailyLogs.where('date').equals(d).toArray()
      set({ dailyLogs })
    } catch (err) {
      console.error('Failed to toggle task completion:', err)
      showToast('Failed to update completion', 'error')
    }
  },

  toggleSubtaskComplete: async (taskId, subtaskId, date) => {
    try {
      const d = date || getTodayString()
      let existing = await db.dailyLogs.where({ date: d, taskId }).first()

      if (!existing) {
        const id = await db.dailyLogs.add({
          date: d,
          taskId,
          isComplete: false,
          subtaskCompletions: { [subtaskId]: true },
        })
        existing = await db.dailyLogs.get(id)
      } else if (existing.id) {
        const completions = { ...existing.subtaskCompletions }
        completions[subtaskId] = !completions[subtaskId]
        await db.dailyLogs.update(existing.id, { subtaskCompletions: completions })

        // Auto-complete parent if all subtasks done
        const task = get().tasks.find(t => t.id === taskId)
        if (task) {
          const allDone = task.subtasks.every(st => completions[st.id])
          if (allDone && existing.id) {
            await db.dailyLogs.update(existing.id, {
              isComplete: true,
              completedAt: new Date(),
            })
          }
        }
      }

      const dailyLogs = await db.dailyLogs.where('date').equals(d).toArray()
      set({ dailyLogs })
    } catch (err) {
      console.error('Failed to toggle subtask:', err)
      showToast('Failed to update subtask', 'error')
    }
  },

  getTasksForDay: (day) => {
    return get().tasks
      .filter(t => t.days.includes(day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  },

  getTaskCompletion: (taskId, date) => {
    const d = date || getTodayString()
    return get().dailyLogs.find(l => l.taskId === taskId && l.date === d)
  },
}))
