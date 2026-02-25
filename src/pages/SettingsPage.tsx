import { useState } from 'react'
import { showToast } from '../components/ui/Toast'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Toggle from '../components/ui/Toggle'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useSettingsStore } from '../stores/settingsStore'
import { useScheduleStore } from '../stores/scheduleStore'
import { useProtocolStore } from '../stores/protocolStore'
import { useMealStore } from '../stores/mealStore'
import { requestNotificationPermission, getNotificationPermission } from '../utils/notifications'
import { db } from '../db/database'

export default function SettingsPage() {
  const [confirmClear, setConfirmClear] = useState(false)

  const settings = useSettingsStore(s => s.settings)
  const update = useSettingsStore(s => s.update)
  const tasks = useScheduleStore(s => s.tasks)
  const protocols = useProtocolStore(s => s.protocols)
  const templates = useMealStore(s => s.templates)

  if (!settings) return null

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission()
      if (!granted) return
    }
    await update({ notificationsEnabled: enabled })
  }

  const handleExport = async () => {
    const tasksData = await db.tasks.toArray()
    const protocolsData = await db.protocols.toArray()
    const mealTemplates = await db.mealTemplates.toArray()
    const mealPlans = await db.mealPlans.toArray()
    const settingsData = await db.settings.toArray()
    const dailyLogs = await db.dailyLogs.toArray()

    const data = { tasks: tasksData, protocols: protocolsData, mealTemplates, mealPlans, settings: settingsData, dailyLogs, exportDate: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flow-of-time-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup exported')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        // Clear and re-import
        await db.tasks.clear()
        await db.protocols.clear()
        await db.mealTemplates.clear()
        await db.mealPlans.clear()
        await db.dailyLogs.clear()

        if (data.tasks) await db.tasks.bulkAdd(data.tasks)
        if (data.protocols) await db.protocols.bulkAdd(data.protocols)
        if (data.mealTemplates) await db.mealTemplates.bulkAdd(data.mealTemplates)
        if (data.mealPlans) await db.mealPlans.bulkAdd(data.mealPlans)
        if (data.dailyLogs) await db.dailyLogs.bulkAdd(data.dailyLogs)

        window.location.reload()
      } catch {
        showToast('Invalid backup file', 'error')
      }
    }
    input.click()
  }

  const handleClearData = async () => {
    try {
      await db.tasks.clear()
      await db.protocols.clear()
      await db.mealTemplates.clear()
      await db.mealPlans.clear()
      await db.dailyLogs.clear()
      setConfirmClear(false)
      showToast('All data cleared')
      window.location.reload()
    } catch {
      showToast('Failed to clear data', 'error')
    }
  }

  const notifPermission = getNotificationPermission()
  const totalItems = tasks.length + protocols.length + templates.length

  return (
    <>
      <Header title="Settings" />
      <div className="px-5 py-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Schedule */}
        <Card>
          <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Schedule</h3>
          <div className="flex flex-col gap-3">
            <Input
              label="Wake Time"
              type="time"
              value={settings.wakeTime}
              onChange={e => update({ wakeTime: e.target.value })}
            />
            <Input
              label="Sleep Time"
              type="time"
              value={settings.sleepTime}
              onChange={e => update({ sleepTime: e.target.value })}
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Notifications</h3>
          <div className="flex flex-col gap-3">
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={handleNotificationToggle}
              label="Enable notifications"
            />
            {notifPermission === 'denied' && (
              <p className="text-xs text-danger">Notifications are blocked in your browser settings</p>
            )}
            {notifPermission === 'unsupported' && (
              <p className="text-xs text-text-muted">Notifications not supported in this browser</p>
            )}
            {settings.notificationsEnabled && (
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">Notify minutes before</label>
                <select
                  value={settings.notifyMinutesBefore}
                  onChange={e => update({ notifyMinutesBefore: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary outline-none"
                >
                  <option value={1}>1 minute</option>
                  <option value={2}>2 minutes</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Data */}
        <Card>
          <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Data</h3>
          <p className="text-[10px] text-text-muted mb-3">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {protocols.length} protocol{protocols.length !== 1 ? 's' : ''} · {templates.length} template{templates.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="md" fullWidth onClick={handleExport}>
              Export Backup
            </Button>
            <Button variant="secondary" size="md" fullWidth onClick={handleImport}>
              Import Backup
            </Button>
            {totalItems > 0 && (
              <Button variant="danger" size="md" fullWidth onClick={() => setConfirmClear(true)}>
                Clear All Data
              </Button>
            )}
          </div>
        </Card>

        {/* About */}
        <Card>
          <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">About</h3>
          <p className="text-sm text-text-primary font-semibold">時間の流れ</p>
          <p className="text-xs text-text-muted">Flow of Time · v1.0.0</p>
          <p className="text-xs text-text-muted mt-1">Biohacker Daily Optimization PWA</p>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmClear}
        title="Clear All Data"
        message="This will permanently delete all tasks, protocols, meal templates, and daily logs. This cannot be undone. Consider exporting a backup first."
        confirmLabel="Clear Everything"
        variant="danger"
        onConfirm={handleClearData}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  )
}
