import { useState, useCallback, useEffect, useRef } from 'react'
import Header from '../components/layout/Header'
import ProtocolList from '../components/protocols/ProtocolList'
import ProtocolEditor from '../components/protocols/ProtocolEditor'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useProtocolStore } from '../stores/protocolStore'
import type { Protocol } from '../db/types'
import { showToast, showToastWithAction } from '../components/ui/Toast'
import FAB from '../components/ui/FAB'

export default function ProtocolsPage() {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hiddenProtocolIds, setHiddenProtocolIds] = useState<Set<number>>(new Set())
  const pendingDelete = useRef<{ protocolId: number; timer: ReturnType<typeof setTimeout> } | null>(null)

  const protocols = useProtocolStore(s => s.protocols)
  const addProtocol = useProtocolStore(s => s.addProtocol)
  const updateProtocol = useProtocolStore(s => s.updateProtocol)
  const deleteProtocol = useProtocolStore(s => s.deleteProtocol)
  const toggleActive = useProtocolStore(s => s.toggleActive)

  const activeCount = protocols.filter(p => p.isActive).length

  const handleSave = async (data: Omit<Protocol, 'id' | 'createdAt'>) => {
    if (editingProtocol?.id) {
      await updateProtocol(editingProtocol.id, data)
      showToast('Protocol updated')
    } else {
      await addProtocol(data)
      showToast('Protocol created — tasks added to schedule')
    }
    setEditingProtocol(null)
  }

  const handleDeleteRequest = () => {
    setConfirmDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (editingProtocol?.id) {
      await deleteProtocol(editingProtocol.id)
      showToast('Protocol deleted')
      setEditingProtocol(null)
      setEditorOpen(false)
      setConfirmDelete(false)
    }
  }

  const handleSelect = (protocol: Protocol) => {
    setEditingProtocol(protocol)
    setEditorOpen(true)
  }

  const handleToggleActive = async (id: number) => {
    const protocol = protocols.find(p => p.id === id)
    await toggleActive(id)
    if (protocol) {
      showToast(protocol.isActive ? 'Protocol deactivated' : 'Protocol activated — tasks synced')
    }
  }

  const handleSwipeDelete = useCallback((protocol: Protocol) => {
    if (!protocol.id) return

    // Commit any existing pending delete immediately
    if (pendingDelete.current) {
      clearTimeout(pendingDelete.current.timer)
      deleteProtocol(pendingDelete.current.protocolId)
      pendingDelete.current = null
    }

    const protocolId = protocol.id
    setHiddenProtocolIds(prev => new Set([...prev, protocolId]))

    const undoFn = () => {
      if (pendingDelete.current?.protocolId === protocolId) {
        clearTimeout(pendingDelete.current.timer)
        pendingDelete.current = null
      }
      setHiddenProtocolIds(prev => {
        const next = new Set(prev)
        next.delete(protocolId)
        return next
      })
    }

    const timer = setTimeout(() => {
      deleteProtocol(protocolId)
      pendingDelete.current = null
      setHiddenProtocolIds(prev => {
        const next = new Set(prev)
        next.delete(protocolId)
        return next
      })
    }, 5000)

    pendingDelete.current = { protocolId, timer }
    showToastWithAction('Protocol deleted', 'Undo', undoFn, 5000)
  }, [deleteProtocol])

  // Commit pending delete on unmount
  useEffect(() => {
    return () => {
      if (pendingDelete.current) {
        clearTimeout(pendingDelete.current.timer)
        deleteProtocol(pendingDelete.current.protocolId)
        pendingDelete.current = null
      }
    }
  }, [deleteProtocol])

  const visibleProtocols = protocols.filter(p => p.id == null || !hiddenProtocolIds.has(p.id))

  return (
    <>
      <Header
        title="Protocols"
        subtitle={`${activeCount} active`}
        rightAction={
          <button
            onClick={() => { setEditingProtocol(null); setEditorOpen(true) }}
            aria-label="Add new protocol"
            className="w-9 h-9 flex items-center justify-center rounded-sm bg-white text-black hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        }
      />

      <div className="px-5 py-4 max-w-lg mx-auto">
        <ProtocolList
          protocols={visibleProtocols}
          onSelect={handleSelect}
          onToggleActive={handleToggleActive}
          onDelete={handleSwipeDelete}
        />
      </div>

      <ProtocolEditor
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingProtocol(null) }}
        onSave={handleSave}
        onDelete={editingProtocol ? handleDeleteRequest : undefined}
        initial={editingProtocol}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Protocol"
        message={`Delete "${editingProtocol?.name}"? This will also remove all auto-generated tasks from your schedule.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />

      <FAB onClick={() => { setEditingProtocol(null); setEditorOpen(true) }} label="Add protocol" />
    </>
  )
}
