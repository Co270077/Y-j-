import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import DaySwitcher from '../components/schedule/DaySwitcher'
import ScheduleSummary from '../components/schedule/ScheduleSummary'
import TaskFilter from '../components/schedule/TaskFilter'
import Timeline from '../components/schedule/Timeline'
import TaskModal from '../components/schedule/TaskModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useScheduleStore } from '../stores/scheduleStore'
import { useMinuteTick } from '../hooks/useClock'
import type { Task, DayOfWeek, TaskCategory } from '../db/types'
import { getCurrentDay } from '../utils/time'
import { showToast, showToastWithAction } from '../components/ui/Toast'
import FAB from '../components/ui/FAB'

export default function SchedulePage() {
  const location = useLocation()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDay())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<number>>(new Set())
  const pendingDelete = useRef<{ taskId: number; timer: ReturnType<typeof setTimeout> } | null>(null)

  useMinuteTick()

  useEffect(() => {
    if ((location.state as { openNewTask?: boolean })?.openNewTask) {
      setEditingTask(null)
      setModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const tasks = useScheduleStore(s => s.tasks)
  const dailyLogs = useScheduleStore(s => s.dailyLogs)
  const addTask = useScheduleStore(s => s.addTask)
  const updateTask = useScheduleStore(s => s.updateTask)
  const deleteTask = useScheduleStore(s => s.deleteTask)
  const toggleTaskComplete = useScheduleStore(s => s.toggleTaskComplete)
  const toggleSubtaskComplete = useScheduleStore(s => s.toggleSubtaskComplete)

  const dayTasks = useMemo(
    () => tasks.filter(t => t.days.includes(selectedDay)),
    [tasks, selectedDay]
  )

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of dayTasks) {
      counts[t.category] = (counts[t.category] || 0) + 1
    }
    return counts
  }, [dayTasks])

  // Apply category filter and hide soft-deleted tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => t.id == null || !hiddenTaskIds.has(t.id))
    if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter)
    return result
  }, [tasks, categoryFilter, hiddenTaskIds])

  const handleSave = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask?.id) {
      await updateTask(editingTask.id, taskData)
      showToast('Task updated')
    } else {
      await addTask(taskData)
      showToast('Task created')
    }
    setEditingTask(null)
  }

  const handleDeleteRequest = () => {
    setConfirmDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (editingTask?.id) {
      await deleteTask(editingTask.id)
      showToast('Task deleted')
      setEditingTask(null)
      setModalOpen(false)
      setConfirmDelete(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const handleSwipeDelete = useCallback((taskId: number) => {
    // Commit any existing pending delete immediately
    if (pendingDelete.current) {
      clearTimeout(pendingDelete.current.timer)
      deleteTask(pendingDelete.current.taskId)
      pendingDelete.current = null
    }

    // Soft-hide the task
    setHiddenTaskIds(prev => new Set([...prev, taskId]))

    const undoFn = () => {
      if (pendingDelete.current?.taskId === taskId) {
        clearTimeout(pendingDelete.current.timer)
        pendingDelete.current = null
      }
      setHiddenTaskIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }

    const timer = setTimeout(() => {
      deleteTask(taskId)
      pendingDelete.current = null
      setHiddenTaskIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }, 5000)

    pendingDelete.current = { taskId, timer }
    showToastWithAction('Task deleted', 'Undo', undoFn, 5000)
  }, [deleteTask])

  // Commit pending delete on unmount
  useEffect(() => {
    return () => {
      if (pendingDelete.current) {
        clearTimeout(pendingDelete.current.timer)
        deleteTask(pendingDelete.current.taskId)
        pendingDelete.current = null
      }
    }
  }, [deleteTask])

  const handleDuplicate = async (task: Task) => {
    await addTask({
      title: `${task.title} (copy)`,
      description: task.description,
      startTime: task.startTime,
      durationMinutes: task.durationMinutes,
      days: task.days,
      category: task.category,
      color: task.color,
      isComplete: false,
      subtasks: task.subtasks,
      notify: task.notify,
    })
    showToast('Task duplicated')
  }

  return (
    <>
      <Header
        title="Schedule"
        subtitle={`${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}`}
        rightAction={
          <button
            onClick={handleNewTask}
            aria-label="Add new task"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-bamboo text-warm-white hover:bg-bamboo-dark transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        }
      />

      <DaySwitcher selectedDay={selectedDay} onDayChange={setSelectedDay} />

      <ScheduleSummary tasks={tasks} day={selectedDay} />

      {dayTasks.length > 3 && (
        <TaskFilter
          activeFilter={categoryFilter}
          onFilterChange={setCategoryFilter}
          taskCounts={taskCounts}
        />
      )}

      <Timeline
        tasks={filteredTasks}
        day={selectedDay}
        dailyLogs={dailyLogs}
        onToggleComplete={toggleTaskComplete}
        onToggleSubtask={toggleSubtaskComplete}
        onEditTask={handleEdit}
        onDuplicateTask={handleDuplicate}
        onDeleteTask={handleSwipeDelete}
      />

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null) }}
        onSave={handleSave}
        onDelete={editingTask ? handleDeleteRequest : undefined}
        initialTask={editingTask}
        existingTasks={tasks}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Task"
        message={`Delete "${editingTask?.title}"? This will remove it from all scheduled days.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />

      <FAB onClick={handleNewTask} label="Add new task" />
    </>
  )
}
