import { useState, useEffect, useMemo, useRef } from 'react'
import BottomSheet from '../ui/BottomSheet'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Toggle from '../ui/Toggle'
import type { Task, TaskCategory, DayOfWeek, Subtask } from '../../db/types'
import { DAYS_ORDERED, DAY_LABELS, minutesSinceMidnight } from '../../utils/time'
import { generateId } from '../../utils/ids'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void
  onDelete?: () => void
  initialTask?: Task | null
  existingTasks?: Task[]
}

const CATEGORIES: { value: TaskCategory; label: string; color: string }[] = [
  { value: 'supplement', label: 'Supplement', color: 'var(--color-cat-supplement)' },
  { value: 'meal', label: 'Meal', color: 'var(--color-cat-meal)' },
  { value: 'workout', label: 'Workout', color: 'var(--color-cat-workout)' },
  { value: 'habit', label: 'Habit', color: 'var(--color-cat-habit)' },
  { value: 'custom', label: 'Custom', color: 'var(--color-cat-custom)' },
]

export default function TaskModal({ isOpen, onClose, onSave, onDelete, initialTask, existingTasks = [] }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [days, setDays] = useState<DayOfWeek[]>([])
  const [category, setCategory] = useState<TaskCategory>('custom')
  const [notify, setNotify] = useState(true)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const savingRef = useRef(false)

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title)
      setDescription(initialTask.description)
      setStartTime(initialTask.startTime)
      setDurationMinutes(initialTask.durationMinutes)
      setDays(initialTask.days)
      setCategory(initialTask.category)
      setNotify(initialTask.notify)
      setSubtasks(initialTask.subtasks)
    } else {
      setTitle('')
      setDescription('')
      setStartTime('08:00')
      setDurationMinutes(30)
      setDays([])
      setCategory('custom')
      setNotify(true)
      setSubtasks([])
    }
    setNewSubtask('')
    savingRef.current = false
  }, [initialTask, isOpen])

  const toggleDay = (day: DayOfWeek) => {
    setDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const addSubtask = () => {
    const trimmed = newSubtask.trim()
    if (!trimmed) return
    setSubtasks(prev => [
      ...prev,
      { id: generateId(), title: trimmed, isComplete: false, order: prev.length },
    ])
    setNewSubtask('')
  }

  const removeSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id).map((st, i) => ({ ...st, order: i })))
  }

  const handleSave = () => {
    if (!title.trim() || days.length === 0) return
    if (savingRef.current) return
    savingRef.current = true
    onSave({
      title: title.trim(),
      description: description.trim(),
      startTime,
      durationMinutes,
      days,
      category,
      color: CATEGORIES.find(c => c.value === category)?.color || '',
      isComplete: false,
      subtasks,
      notify,
    })
    onClose()
  }

  const isEditing = !!initialTask

  // Time overlap detection
  const overlaps = useMemo(() => {
    if (days.length === 0) return []
    const newStart = minutesSinceMidnight(startTime)
    const newEnd = newStart + durationMinutes
    return existingTasks
      .filter(t => {
        if (initialTask && t.id === initialTask.id) return false
        return t.days.some(d => days.includes(d))
      })
      .filter(t => {
        const tStart = minutesSinceMidnight(t.startTime)
        const tEnd = tStart + t.durationMinutes
        return newStart < tEnd && newEnd > tStart
      })
  }, [existingTasks, days, startTime, durationMinutes, initialTask])

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'New Task'} detent="half">
      <div className="flex flex-col gap-5">
        {/* Title */}
        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Take morning supplements"
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Additional notes..."
            rows={2}
            className="w-full px-3 py-2.5 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted outline-none focus:border-bamboo/60 transition-colors resize-none"
          />
        </div>

        {/* Time + Duration row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Duration</label>
            <select
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary outline-none focus:border-bamboo/60 transition-colors"
            >
              <option value={5}>5 min</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>
        </div>

        {/* Days of week */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-2">Days</label>
          <div className="flex gap-1.5">
            {DAYS_ORDERED.map(day => {
              const selected = days.includes(day)
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`
                    flex-1 py-2 rounded-[var(--radius-sm)] text-xs font-medium
                    transition-all duration-150 cursor-pointer
                    ${selected
                      ? 'bg-bamboo text-warm-white'
                      : 'bg-surface-overlay text-text-muted hover:text-text-secondary'
                    }
                  `}
                >
                  {DAY_LABELS[day]}
                </button>
              )
            })}
          </div>
          {/* Quick select all / weekdays */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setDays([...DAYS_ORDERED])}
              className="text-[10px] text-text-muted hover:text-bamboo transition-colors cursor-pointer"
            >
              All days
            </button>
            <button
              onClick={() => setDays(['mon', 'tue', 'wed', 'thu', 'fri'])}
              className="text-[10px] text-text-muted hover:text-bamboo transition-colors cursor-pointer"
            >
              Weekdays
            </button>
            <button
              onClick={() => setDays(['sat', 'sun'])}
              className="text-[10px] text-text-muted hover:text-bamboo transition-colors cursor-pointer"
            >
              Weekends
            </button>
            <button
              onClick={() => setDays([])}
              className="text-[10px] text-text-muted hover:text-bamboo transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-150 cursor-pointer border
                  ${category === cat.value
                    ? 'border-transparent text-warm-white'
                    : 'border-border text-text-muted hover:text-text-secondary'
                  }
                `}
                style={category === cat.value ? { backgroundColor: cat.color } : undefined}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-2">Subtasks</label>
          {subtasks.map(st => (
            <div key={st.id} className="flex items-center gap-2 mb-1.5">
              <span className="text-sm text-text-secondary flex-1">{st.title}</span>
              <button
                onClick={() => removeSubtask(st.id)}
                className="text-text-muted hover:text-danger transition-colors cursor-pointer p-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubtask()}
              placeholder="Add subtask..."
              className="flex-1 px-3 py-2 text-sm bg-surface-raised border border-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted outline-none focus:border-bamboo/60 transition-colors"
            />
            <Button variant="secondary" size="sm" onClick={addSubtask}>
              Add
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <Toggle
          checked={notify}
          onChange={setNotify}
          label="Notify before start"
        />

        {/* Time overlap warning */}
        {overlaps.length > 0 && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-warning/10 border border-warning/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-warning mt-0.5 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-xs text-warning font-medium">Time overlap</p>
              <p className="text-[10px] text-text-muted mt-0.5">
                Overlaps with: {overlaps.map(t => t.title).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isEditing && onDelete && (
            <Button variant="danger" size="md" onClick={onDelete}>
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!title.trim() || days.length === 0}
          >
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
