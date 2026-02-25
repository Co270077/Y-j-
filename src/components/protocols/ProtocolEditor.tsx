import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { Protocol, SupplementEntry, CyclePattern, TimingRule, DayOfWeek } from '../../db/types'
import { DAYS_ORDERED, DAY_LABELS } from '../../utils/time'
import { generateId } from '../../utils/ids'

interface ProtocolEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (protocol: Omit<Protocol, 'id' | 'createdAt'>) => void
  onDelete?: () => void
  initial?: Protocol | null
}

const TIMING_TYPES = [
  { value: 'specific_time', label: 'Specific time' },
  { value: 'with_meal', label: 'With meal' },
  { value: 'before_meal', label: 'Before meal' },
  { value: 'after_meal', label: 'After meal' },
  { value: 'on_wake', label: 'After waking' },
  { value: 'before_sleep', label: 'Before sleep' },
]

const MEALS = ['breakfast', 'lunch', 'dinner'] as const

export default function ProtocolEditor({ isOpen, onClose, onSave, onDelete, initial }: ProtocolEditorProps) {
  const [name, setName] = useState('')
  const [supplements, setSupplements] = useState<SupplementEntry[]>([])
  const [cycleType, setCycleType] = useState<'daily' | 'on_off' | 'specific_days'>('daily')
  const [daysOn, setDaysOn] = useState(5)
  const [daysOff, setDaysOff] = useState(2)
  const [specificDays, setSpecificDays] = useState<DayOfWeek[]>([])
  const [isActive, setIsActive] = useState(true)

  // Supplement being added/edited
  const [editingSupplement, setEditingSupplement] = useState(false)
  const [suppName, setSuppName] = useState('')
  const [suppDose, setSuppDose] = useState('')
  const [suppTimingType, setSuppTimingType] = useState<TimingRule['type']>('specific_time')
  const [suppTime, setSuppTime] = useState('08:00')
  const [suppMeal, setSuppMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast')
  const [suppOffset, setSuppOffset] = useState(30)
  const [suppWithFood, setSuppWithFood] = useState(false)
  const [suppNotes, setSuppNotes] = useState('')
  const [editingSuppId, setEditingSuppId] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setSupplements(initial.supplements)
      setCycleType(initial.cyclePattern.type)
      if (initial.cyclePattern.type === 'on_off') {
        setDaysOn(initial.cyclePattern.daysOn)
        setDaysOff(initial.cyclePattern.daysOff)
      }
      if (initial.cyclePattern.type === 'specific_days') {
        setSpecificDays(initial.cyclePattern.days)
      }
      setIsActive(initial.isActive)
    } else {
      setName('')
      setSupplements([])
      setCycleType('daily')
      setDaysOn(5)
      setDaysOff(2)
      setSpecificDays([])
      setIsActive(true)
    }
    setEditingSupplement(false)
    setSuppName('')
    setSuppDose('')
    setSuppTimingType('specific_time')
    setSuppTime('08:00')
    setSuppMeal('breakfast')
    setSuppOffset(30)
    setSuppWithFood(false)
    setSuppNotes('')
    setEditingSuppId(null)
  }, [initial, isOpen])

  const resetSupplementForm = () => {
    setEditingSupplement(false)
    setSuppName('')
    setSuppDose('')
    setSuppTimingType('specific_time')
    setSuppTime('08:00')
    setSuppMeal('breakfast')
    setSuppOffset(30)
    setSuppWithFood(false)
    setSuppNotes('')
    setEditingSuppId(null)
  }

  const buildTimingRule = (): TimingRule => {
    switch (suppTimingType) {
      case 'specific_time': return { type: 'specific_time', time: suppTime }
      case 'with_meal': return { type: 'with_meal', meal: suppMeal }
      case 'before_meal': return { type: 'before_meal', meal: suppMeal, minutesBefore: suppOffset }
      case 'after_meal': return { type: 'after_meal', meal: suppMeal, minutesAfter: suppOffset }
      case 'on_wake': return { type: 'on_wake', offsetMinutes: suppOffset }
      case 'before_sleep': return { type: 'before_sleep', offsetMinutes: suppOffset }
    }
  }

  const saveSupplement = () => {
    if (!suppName.trim() || !suppDose.trim()) return

    const entry: SupplementEntry = {
      id: editingSuppId || generateId(),
      name: suppName.trim(),
      dose: suppDose.trim(),
      timingRule: buildTimingRule(),
      withFood: suppWithFood,
      notes: suppNotes.trim(),
    }

    if (editingSuppId) {
      setSupplements(prev => prev.map(s => s.id === editingSuppId ? entry : s))
    } else {
      setSupplements(prev => [...prev, entry])
    }
    resetSupplementForm()
  }

  const editSupplement = (s: SupplementEntry) => {
    setEditingSupplement(true)
    setEditingSuppId(s.id)
    setSuppName(s.name)
    setSuppDose(s.dose)
    setSuppTimingType(s.timingRule.type)
    setSuppWithFood(s.withFood)
    setSuppNotes(s.notes)
    if (s.timingRule.type === 'specific_time') setSuppTime(s.timingRule.time)
    if ('meal' in s.timingRule) setSuppMeal(s.timingRule.meal)
    if ('minutesBefore' in s.timingRule) setSuppOffset(s.timingRule.minutesBefore)
    if ('minutesAfter' in s.timingRule) setSuppOffset(s.timingRule.minutesAfter)
    if ('offsetMinutes' in s.timingRule) setSuppOffset(s.timingRule.offsetMinutes)
  }

  const removeSupplement = (id: string) => {
    setSupplements(prev => prev.filter(s => s.id !== id))
  }

  const handleSave = () => {
    if (!name.trim() || supplements.length === 0) return

    const cyclePattern: CyclePattern =
      cycleType === 'daily' ? { type: 'daily' } :
      cycleType === 'on_off' ? { type: 'on_off', daysOn, daysOff } :
      { type: 'specific_days', days: specificDays }

    onSave({
      name: name.trim(),
      supplements,
      cyclePattern,
      startDate: new Date().toISOString().slice(0, 10),
      isActive,
    })
    onClose()
  }

  const getTimingLabel = (rule: TimingRule): string => {
    switch (rule.type) {
      case 'specific_time': return `at ${rule.time}`
      case 'with_meal': return `with ${rule.meal}`
      case 'before_meal': return `${rule.minutesBefore}min before ${rule.meal}`
      case 'after_meal': return `${rule.minutesAfter}min after ${rule.meal}`
      case 'on_wake': return `${rule.offsetMinutes}min after wake`
      case 'before_sleep': return `${rule.offsetMinutes}min before sleep`
    }
  }

  const needsMealSelect = ['with_meal', 'before_meal', 'after_meal'].includes(suppTimingType)
  const needsOffset = ['before_meal', 'after_meal', 'on_wake', 'before_sleep'].includes(suppTimingType)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Protocol' : 'New Protocol'}>
      <div className="flex flex-col gap-5">
        <Input label="Protocol Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Stack" />

        {/* Supplements list */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-2">
            Supplements ({supplements.length})
          </label>

          {supplements.map(s => (
            <div key={s.id} className="flex items-center gap-2 mb-2 p-2.5 bg-charcoal rounded-[var(--radius-md)]">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium">{s.name}</p>
                <p className="text-[10px] text-text-muted">{s.dose} · {getTimingLabel(s.timingRule)}{s.withFood ? ' · with food' : ''}</p>
              </div>
              <button onClick={() => editSupplement(s)} className="text-text-muted hover:text-bamboo transition-colors cursor-pointer p-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button onClick={() => removeSupplement(s.id)} className="text-text-muted hover:text-danger transition-colors cursor-pointer p-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add/edit supplement form */}
          {editingSupplement ? (
            <div className="p-3 bg-charcoal rounded-[var(--radius-md)] flex flex-col gap-3 mt-2">
              <div className="flex gap-2">
                <div className="flex-1"><Input placeholder="Name" value={suppName} onChange={e => setSuppName(e.target.value)} /></div>
                <div className="w-28"><Input placeholder="Dose" value={suppDose} onChange={e => setSuppDose(e.target.value)} /></div>
              </div>

              {/* Timing type */}
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Timing</label>
                <select
                  value={suppTimingType}
                  onChange={e => setSuppTimingType(e.target.value as TimingRule['type'])}
                  className="w-full px-3 py-2 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary outline-none"
                >
                  {TIMING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {suppTimingType === 'specific_time' && (
                <Input type="time" value={suppTime} onChange={e => setSuppTime(e.target.value)} />
              )}

              {needsMealSelect && (
                <select
                  value={suppMeal}
                  onChange={e => setSuppMeal(e.target.value as typeof suppMeal)}
                  className="w-full px-3 py-2 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary outline-none"
                >
                  {MEALS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              )}

              {needsOffset && (
                <Input type="number" value={suppOffset} onChange={e => setSuppOffset(Number(e.target.value))} placeholder="Minutes" />
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={suppWithFood} onChange={e => setSuppWithFood(e.target.checked)} className="accent-bamboo" />
                <span className="text-xs text-text-secondary">Take with food</span>
              </label>

              <Input placeholder="Notes (optional)" value={suppNotes} onChange={e => setSuppNotes(e.target.value)} />

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={resetSupplementForm}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={saveSupplement} disabled={!suppName.trim() || !suppDose.trim()}>
                  {editingSuppId ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditingSupplement(true)} fullWidth className="mt-2">
              + Add Supplement
            </Button>
          )}
        </div>

        {/* Cycle pattern */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-2">Cycle Pattern</label>
          <div className="flex gap-2">
            {(['daily', 'on_off', 'specific_days'] as const).map(type => (
              <button
                key={type}
                onClick={() => setCycleType(type)}
                className={`flex-1 py-2 rounded-[var(--radius-md)] text-xs font-medium transition-all cursor-pointer ${
                  cycleType === type ? 'bg-bamboo text-warm-white' : 'bg-surface-overlay text-text-muted'
                }`}
              >
                {type === 'daily' ? 'Daily' : type === 'on_off' ? 'On/Off' : 'Specific'}
              </button>
            ))}
          </div>

          {cycleType === 'on_off' && (
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <label className="text-[10px] text-text-muted block mb-1">Days On</label>
                <input type="number" min={1} max={30} value={daysOn} onChange={e => setDaysOn(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-text-muted block mb-1">Days Off</label>
                <input type="number" min={1} max={30} value={daysOff} onChange={e => setDaysOff(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary outline-none" />
              </div>
            </div>
          )}

          {cycleType === 'specific_days' && (
            <div className="flex gap-1.5 mt-3">
              {DAYS_ORDERED.map(day => (
                <button
                  key={day}
                  onClick={() => setSpecificDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                  className={`flex-1 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-all cursor-pointer ${
                    specificDays.includes(day) ? 'bg-bamboo text-warm-white' : 'bg-surface-overlay text-text-muted'
                  }`}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {initial && onDelete && (
            <Button variant="danger" size="md" onClick={onDelete}>Delete</Button>
          )}
          <div className="flex-1" />
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={!name.trim() || supplements.length === 0}>
            {initial ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
