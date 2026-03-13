import { useState } from 'react'
import Header from '../components/layout/Header'
import ProtocolList from '../components/protocols/ProtocolList'
import ProtocolEditor from '../components/protocols/ProtocolEditor'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useProtocolStore } from '../stores/protocolStore'
import type { Protocol } from '../db/types'
import { showToast } from '../components/ui/Toast'
import FAB from '../components/ui/FAB'

export default function ProtocolsPage() {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  return (
    <>
      <Header
        title="Protocols"
        subtitle={`${activeCount} active`}
        rightAction={
          <button
            onClick={() => { setEditingProtocol(null); setEditorOpen(true) }}
            aria-label="Add new protocol"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-bamboo text-warm-white hover:bg-bamboo-dark transition-colors cursor-pointer"
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
          protocols={protocols}
          onSelect={handleSelect}
          onToggleActive={handleToggleActive}
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
