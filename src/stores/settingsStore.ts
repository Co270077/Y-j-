import { create } from 'zustand'
import { db, initializeSettings } from '../db/database'
import type { AppSettings, EatingWindow } from '../db/types'
import { showToast } from '../components/ui/Toast'

interface SettingsState {
  settings: AppSettings | null
  isLoaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<AppSettings>) => Promise<void>
  setEatingWindow: (ew: EatingWindow | null) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoaded: false,

  load: async () => {
    try {
      const settings = await initializeSettings()
      set({ settings, isLoaded: true })
    } catch (err) {
      console.error('Failed to load settings:', err)
      showToast('Failed to load settings', 'error')
    }
  },

  update: async (patch) => {
    try {
      const { settings } = get()
      if (!settings?.id) return
      await db.settings.update(settings.id, patch)
      set({ settings: { ...settings, ...patch } })
    } catch (err) {
      console.error('Failed to update settings:', err)
      showToast('Failed to save settings', 'error')
    }
  },

  setEatingWindow: async (ew) => {
    const { update } = get()
    await update({ eatingWindow: ew })
  },
}))
