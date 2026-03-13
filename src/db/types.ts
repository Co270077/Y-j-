// ===== 養生 (Yōjō) — Data Types =====

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type TaskCategory = 'supplement' | 'meal' | 'workout' | 'habit' | 'custom'

export interface Subtask {
  id: string
  title: string
  isComplete: boolean
  order: number
}

export interface Task {
  id?: number
  title: string
  description: string
  startTime: string        // HH:mm format
  durationMinutes: number
  days: DayOfWeek[]
  category: TaskCategory
  color: string
  isComplete: boolean
  subtasks: Subtask[]
  notify: boolean
  createdAt: Date
  /** Links this task to a protocol (auto-generated) */
  protocolId?: number
  /** Links this task to a meal plan (auto-generated) */
  mealPlanId?: number
}

// ===== Supplement Protocols =====

export type TimingRule =
  | { type: 'specific_time'; time: string }
  | { type: 'with_meal'; meal: 'breakfast' | 'lunch' | 'dinner' }
  | { type: 'before_meal'; meal: 'breakfast' | 'lunch' | 'dinner'; minutesBefore: number }
  | { type: 'after_meal'; meal: 'breakfast' | 'lunch' | 'dinner'; minutesAfter: number }
  | { type: 'on_wake' ; offsetMinutes: number }
  | { type: 'before_sleep'; offsetMinutes: number }

export interface SupplementEntry {
  id: string
  name: string
  dose: string            // e.g. "500mg", "2 capsules"
  timingRule: TimingRule
  withFood: boolean
  notes: string
}

export type CyclePattern =
  | { type: 'daily' }
  | { type: 'on_off'; daysOn: number; daysOff: number }
  | { type: 'specific_days'; days: DayOfWeek[] }

export interface Protocol {
  id?: number
  name: string
  supplements: SupplementEntry[]
  cyclePattern: CyclePattern
  startDate: string       // ISO date string
  isActive: boolean
  createdAt: Date
}

// ===== Meals =====

export interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number         // grams
  carbs: number           // grams
  fat: number             // grams
}

export interface MealTemplate {
  id?: number
  name: string
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  createdAt: Date
}

export type FastingProtocol = '16:8' | '18:6' | '20:4' | 'OMAD' | 'custom'

export interface EatingWindow {
  protocol: FastingProtocol
  windowStart: string     // HH:mm
  windowEnd: string       // HH:mm
}

export interface MealPlan {
  id?: number
  name: string
  days: DayOfWeek[]
  meals: MealPlanEntry[]
  eatingWindow: EatingWindow
  isActive: boolean
  createdAt: Date
}

export interface MealPlanEntry {
  id: string
  time: string            // HH:mm
  templateId?: number
  customName?: string
}

// ===== Settings =====

export interface AppSettings {
  id?: number
  wakeTime: string        // HH:mm
  sleepTime: string       // HH:mm
  notificationsEnabled: boolean
  notifyMinutesBefore: number
  onboardingComplete: boolean
  eatingWindow: EatingWindow | null
}

// ===== Daily Completion Log =====

export interface DailyLog {
  id?: number
  date: string            // YYYY-MM-DD
  taskId: number
  isComplete: boolean
  subtaskCompletions: Record<string, boolean>
  completedAt?: Date
}
