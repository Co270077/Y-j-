import { create } from 'zustand'
import { db } from '../db/database'
import type { Protocol } from '../db/types'
import { syncProtocolToSchedule } from '../utils/protocolSync'
import { showToast } from '../components/ui/Toast'

interface ProtocolState {
  protocols: Protocol[]
  isLoaded: boolean

  load: () => Promise<void>
  addProtocol: (protocol: Omit<Protocol, 'id' | 'createdAt'>) => Promise<number>
  updateProtocol: (id: number, patch: Partial<Protocol>) => Promise<void>
  deleteProtocol: (id: number) => Promise<void>
  toggleActive: (id: number) => Promise<void>
  getActiveProtocols: () => Protocol[]
}

/**
 * Refresh the schedule store after protocol sync.
 * Import lazily to avoid circular dependency.
 */
async function refreshSchedule() {
  const { useScheduleStore } = await import('./scheduleStore')
  await useScheduleStore.getState().load()
}

export const useProtocolStore = create<ProtocolState>((set, get) => ({
  protocols: [],
  isLoaded: false,

  load: async () => {
    try {
      const protocols = await db.protocols.toArray()
      set({ protocols, isLoaded: true })
    } catch (err) {
      console.error('Failed to load protocols:', err)
      showToast('Failed to load protocols', 'error')
    }
  },

  addProtocol: async (data) => {
    try {
      const protocol: Protocol = { ...data, createdAt: new Date() }
      const id = await db.protocols.add(protocol)
      const saved = await db.protocols.get(id)
      if (saved) await syncProtocolToSchedule(saved)
      const protocols = await db.protocols.toArray()
      set({ protocols })
      await refreshSchedule()
      return id
    } catch (err) {
      console.error('Failed to add protocol:', err)
      showToast('Failed to save protocol', 'error')
      return -1
    }
  },

  updateProtocol: async (id, patch) => {
    try {
      await db.protocols.update(id, patch)
      const updated = await db.protocols.get(id)
      if (updated) await syncProtocolToSchedule(updated)
      const protocols = await db.protocols.toArray()
      set({ protocols })
      await refreshSchedule()
    } catch (err) {
      console.error('Failed to update protocol:', err)
      showToast('Failed to update protocol', 'error')
    }
  },

  deleteProtocol: async (id) => {
    try {
      await db.protocols.delete(id)
      await db.tasks.where('protocolId').equals(id).delete()
      const protocols = await db.protocols.toArray()
      set({ protocols })
      await refreshSchedule()
    } catch (err) {
      console.error('Failed to delete protocol:', err)
      showToast('Failed to delete protocol', 'error')
    }
  },

  toggleActive: async (id) => {
    try {
      const protocol = get().protocols.find(p => p.id === id)
      if (!protocol) return
      const newState = !protocol.isActive
      await db.protocols.update(id, { isActive: newState })
      const updated = await db.protocols.get(id)
      if (updated) await syncProtocolToSchedule(updated)
      const protocols = await db.protocols.toArray()
      set({ protocols })
      await refreshSchedule()
    } catch (err) {
      console.error('Failed to toggle protocol:', err)
      showToast('Failed to update protocol', 'error')
    }
  },

  getActiveProtocols: () => {
    return get().protocols.filter(p => p.isActive)
  },
}))
