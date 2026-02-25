import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { EatingWindow, FastingProtocol } from '../../db/types'
import { minutesSinceMidnight } from '../../utils/time'

interface EatingWindowConfigProps {
  isOpen: boolean
  onClose: () => void
  onSave: (window: EatingWindow) => void
  current: EatingWindow | null
}

const PROTOCOLS: { value: FastingProtocol; label: string; start: string; end: string }[] = [
  { value: '16:8', label: '16:8', start: '12:00', end: '20:00' },
  { value: '18:6', label: '18:6', start: '12:00', end: '18:00' },
  { value: '20:4', label: '20:4', start: '14:00', end: '18:00' },
  { value: 'OMAD', label: 'OMAD', start: '18:00', end: '19:00' },
  { value: 'custom', label: 'Custom', start: '08:00', end: '20:00' },
]

export default function EatingWindowConfig({ isOpen, onClose, onSave, current }: EatingWindowConfigProps) {
  const [protocol, setProtocol] = useState<FastingProtocol>('16:8')
  const [windowStart, setWindowStart] = useState('12:00')
  const [windowEnd, setWindowEnd] = useState('20:00')

  useEffect(() => {
    if (current) {
      setProtocol(current.protocol)
      setWindowStart(current.windowStart)
      setWindowEnd(current.windowEnd)
    }
  }, [current, isOpen])

  const handleProtocolChange = (p: FastingProtocol) => {
    setProtocol(p)
    const preset = PROTOCOLS.find(pr => pr.value === p)
    if (preset && p !== 'custom') {
      setWindowStart(preset.start)
      setWindowEnd(preset.end)
    }
  }

  const handleSave = () => {
    onSave({ protocol, windowStart, windowEnd })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eating Window">
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-2">Fasting Protocol</label>
          <div className="flex flex-wrap gap-2">
            {PROTOCOLS.map(p => (
              <button
                key={p.value}
                onClick={() => handleProtocolChange(p.value)}
                className={`px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium transition-all cursor-pointer ${
                  protocol === p.value ? 'bg-bamboo text-warm-white' : 'bg-surface-overlay text-text-muted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Window Opens" type="time" value={windowStart} onChange={e => setWindowStart(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Window Closes" type="time" value={windowEnd} onChange={e => setWindowEnd(e.target.value)} />
          </div>
        </div>

        <WindowSummary windowStart={windowStart} windowEnd={windowEnd} />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave} fullWidth>Save</Button>
        </div>
      </div>
    </Modal>
  )
}

function WindowSummary({ windowStart, windowEnd }: { windowStart: string; windowEnd: string }) {
  const startMin = minutesSinceMidnight(windowStart)
  const endMin = minutesSinceMidnight(windowEnd)
  const eatingMinutes = endMin > startMin ? endMin - startMin : 0
  const fastingMinutes = 1440 - eatingMinutes

  const eatingHours = Math.floor(eatingMinutes / 60)
  const eatingMins = eatingMinutes % 60
  const fastingHours = Math.floor(fastingMinutes / 60)
  const fastingMins = fastingMinutes % 60

  if (eatingMinutes <= 0) return null

  const eatingPct = (eatingMinutes / 1440) * 100

  return (
    <div className="p-3 bg-charcoal rounded-[var(--radius-md)]">
      <div className="flex justify-between text-xs mb-2">
        <span className="text-bamboo font-medium">
          Eating: {eatingHours}h{eatingMins > 0 ? ` ${eatingMins}m` : ''}
        </span>
        <span className="text-text-muted font-medium">
          Fasting: {fastingHours}h{fastingMins > 0 ? ` ${fastingMins}m` : ''}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-surface-overlay">
        <div className="bg-bamboo rounded-full transition-all duration-300" style={{ width: `${eatingPct}%` }} />
      </div>
    </div>
  )
}
