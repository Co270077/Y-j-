import Dexie, { type Table } from 'dexie'
import type { Task, Protocol, MealTemplate, MealPlan, AppSettings, DailyLog } from './types'

export class FlowOfTimeDB extends Dexie {
  tasks!: Table<Task, number>
  protocols!: Table<Protocol, number>
  mealTemplates!: Table<MealTemplate, number>
  mealPlans!: Table<MealPlan, number>
  settings!: Table<AppSettings, number>
  dailyLogs!: Table<DailyLog, number>

  constructor() {
    super('FlowOfTimeDB')

    this.version(1).stores({
      tasks: '++id, category, protocolId, mealPlanId',
      protocols: '++id, isActive',
      mealTemplates: '++id',
      mealPlans: '++id, isActive',
      settings: '++id',
      dailyLogs: '++id, date, taskId, [date+taskId]',
    })
  }
}

export const db = new FlowOfTimeDB()

/** Ensure default settings exist */
export async function initializeSettings(): Promise<AppSettings> {
  const existing = await db.settings.toCollection().first()
  if (existing) return existing

  const defaults: AppSettings = {
    wakeTime: '06:00',
    sleepTime: '22:00',
    notificationsEnabled: false,
    notifyMinutesBefore: 5,
    onboardingComplete: false,
    eatingWindow: null,
  }
  const id = await db.settings.add(defaults)
  return { ...defaults, id }
}
