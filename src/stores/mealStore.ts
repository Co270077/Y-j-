import { create } from 'zustand'
import { db } from '../db/database'
import type { MealTemplate, MealPlan } from '../db/types'
import { showToast } from '../components/ui/Toast'

interface MealState {
  templates: MealTemplate[]
  mealPlans: MealPlan[]
  isLoaded: boolean

  load: () => Promise<void>
  addTemplate: (tpl: Omit<MealTemplate, 'id' | 'createdAt'>) => Promise<number>
  updateTemplate: (id: number, patch: Partial<MealTemplate>) => Promise<void>
  deleteTemplate: (id: number) => Promise<void>

  addMealPlan: (plan: Omit<MealPlan, 'id' | 'createdAt'>) => Promise<number>
  updateMealPlan: (id: number, patch: Partial<MealPlan>) => Promise<void>
  deleteMealPlan: (id: number) => Promise<void>
  toggleMealPlanActive: (id: number) => Promise<void>
  getActiveMealPlans: () => MealPlan[]
}

export const useMealStore = create<MealState>((set, get) => ({
  templates: [],
  mealPlans: [],
  isLoaded: false,

  load: async () => {
    try {
      const templates = await db.mealTemplates.toArray()
      const mealPlans = await db.mealPlans.toArray()
      set({ templates, mealPlans, isLoaded: true })
    } catch (err) {
      console.error('Failed to load meals:', err)
      showToast('Failed to load meal data', 'error')
    }
  },

  addTemplate: async (data) => {
    try {
      const tpl: MealTemplate = { ...data, createdAt: new Date() }
      const id = await db.mealTemplates.add(tpl)
      const templates = await db.mealTemplates.toArray()
      set({ templates })
      return id
    } catch (err) {
      console.error('Failed to add template:', err)
      showToast('Failed to save template', 'error')
      return -1
    }
  },

  updateTemplate: async (id, patch) => {
    try {
      await db.mealTemplates.update(id, patch)
      const templates = await db.mealTemplates.toArray()
      set({ templates })
    } catch (err) {
      console.error('Failed to update template:', err)
      showToast('Failed to update template', 'error')
    }
  },

  deleteTemplate: async (id) => {
    try {
      await db.mealTemplates.delete(id)
      const templates = await db.mealTemplates.toArray()
      set({ templates })
    } catch (err) {
      console.error('Failed to delete template:', err)
      showToast('Failed to delete template', 'error')
    }
  },

  addMealPlan: async (data) => {
    try {
      const plan: MealPlan = { ...data, createdAt: new Date() }
      const id = await db.mealPlans.add(plan)
      const mealPlans = await db.mealPlans.toArray()
      set({ mealPlans })
      return id
    } catch (err) {
      console.error('Failed to add meal plan:', err)
      showToast('Failed to save meal plan', 'error')
      return -1
    }
  },

  updateMealPlan: async (id, patch) => {
    try {
      await db.mealPlans.update(id, patch)
      const mealPlans = await db.mealPlans.toArray()
      set({ mealPlans })
    } catch (err) {
      console.error('Failed to update meal plan:', err)
      showToast('Failed to update meal plan', 'error')
    }
  },

  deleteMealPlan: async (id) => {
    try {
      await db.mealPlans.delete(id)
      await db.tasks.where('mealPlanId').equals(id).delete()
      const mealPlans = await db.mealPlans.toArray()
      set({ mealPlans })
    } catch (err) {
      console.error('Failed to delete meal plan:', err)
      showToast('Failed to delete meal plan', 'error')
    }
  },

  toggleMealPlanActive: async (id) => {
    try {
      const plan = get().mealPlans.find(p => p.id === id)
      if (!plan) return
      await db.mealPlans.update(id, { isActive: !plan.isActive })
      const mealPlans = await db.mealPlans.toArray()
      set({ mealPlans })
    } catch (err) {
      console.error('Failed to toggle meal plan:', err)
      showToast('Failed to update meal plan', 'error')
    }
  },

  getActiveMealPlans: () => {
    return get().mealPlans.filter(p => p.isActive)
  },
}))
