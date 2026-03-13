import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Timeline from '../components/schedule/Timeline'
import type { Task, DailyLog } from '../db/types'

// Mock getCurrentTime so we control "now" in tests
vi.mock('../utils/time', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/time')>()
  return {
    ...actual,
    getCurrentTime: vi.fn(() => '10:00'), // default: 10:00 AM
  }
})

// Mock scrollIntoView — not available in jsdom
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

function makeTask(id: number, startTime: string, durationMinutes: number): Task {
  return {
    id,
    title: `Task ${id}`,
    description: '',
    startTime,
    durationMinutes,
    days: ['mon'],
    category: 'habit',
    color: '#6B8E6B',
    isComplete: false,
    subtasks: [],
    notify: false,
    createdAt: new Date(),
  }
}

const noop = () => {}

function renderTimeline(tasks: Task[], logs: DailyLog[] = []) {
  return render(
    <MemoryRouter initialEntries={['/schedule']}>
      <Timeline
        tasks={tasks}
        day="mon"
        dailyLogs={logs}
        onToggleComplete={noop}
        onToggleSubtask={noop}
        onEditTask={noop}
      />
    </MemoryRouter>
  )
}

/** Check that the element containing the given task title has the bamboo accent class */
function taskHasBambooAccent(taskTitle: string): boolean {
  const taskEl = screen.queryByText(taskTitle)
  if (!taskEl) return false
  // Walk up DOM to find the wrapper div with border-bamboo
  let el: Element | null = taskEl
  while (el && el !== document.body) {
    if (el.className && el.className.includes('border-bamboo')) return true
    el = el.parentElement
  }
  return false
}

describe('Timeline structure', () => {
  test('timeline container wraps task items', () => {
    const tasks = [
      makeTask(1, '09:00', 60),
      makeTask(2, '10:00', 60),
    ]
    const { container } = renderTimeline(tasks)
    // Timeline renders a scrollable container wrapping task blocks
    const taskTitles = container.querySelectorAll('[class*="text-sm"]')
    expect(taskTitles.length).toBeGreaterThan(0)
  })

  test('renders one task block per task', () => {
    const tasks = [
      makeTask(1, '09:00', 60),
      makeTask(2, '10:00', 60),
      makeTask(3, '11:00', 60),
    ]
    renderTimeline(tasks)
    expect(screen.getByText('Task 1')).toBeTruthy()
    expect(screen.getByText('Task 2')).toBeTruthy()
    expect(screen.getByText('Task 3')).toBeTruthy()
  })

  // Unskip after Plan 03 migration: timeline uses stagger parent variant
  test.skip('list wrapper has stagger variant for cascade animation after migration', () => {
    // After Plan 03: Timeline wraps tasks in m.div with staggerChildren variant
  })
})

describe('Timeline auto-scroll', () => {
  test('applies bamboo left-border accent to current time block', () => {
    // getCurrentTime returns '10:00' — task 2 spans 09:00-11:00 (current)
    const tasks = [
      makeTask(1, '07:00', 60),  // 07:00-08:00 (past)
      makeTask(2, '09:00', 120), // 09:00-11:00 (current at 10:00)
      makeTask(3, '12:00', 60),  // 12:00-13:00 (future)
    ]
    renderTimeline(tasks)

    expect(taskHasBambooAccent('Task 2')).toBe(true)
    expect(taskHasBambooAccent('Task 1')).toBe(false)
    expect(taskHasBambooAccent('Task 3')).toBe(false)
  })

  test('scrolls to next upcoming block when current time is between tasks', () => {
    // At 10:00: task 2 ends 08:30, task 3 starts 11:00 — task 3 is next upcoming
    const tasks = [
      makeTask(1, '07:00', 60),  // 07:00-08:00 (past at 10:00)
      makeTask(2, '08:00', 30),  // 08:00-08:30 (past at 10:00)
      makeTask(3, '11:00', 60),  // 11:00-12:00 (next upcoming at 10:00)
    ]
    renderTimeline(tasks)

    expect(taskHasBambooAccent('Task 3')).toBe(true)
    expect(taskHasBambooAccent('Task 1')).toBe(false)
    expect(taskHasBambooAccent('Task 2')).toBe(false)
  })

  test('scrolls to last block in late night scenario (all tasks in past)', () => {
    // All tasks end before 10:00 — fallback to last task
    const tasks = [
      makeTask(1, '06:00', 60),  // 06:00-07:00 (past at 10:00)
      makeTask(2, '07:00', 60),  // 07:00-08:00 (past at 10:00)
      makeTask(3, '08:00', 30),  // 08:00-08:30 (past at 10:00, last in sort order)
    ]
    renderTimeline(tasks)

    expect(taskHasBambooAccent('Task 3')).toBe(true)
    expect(taskHasBambooAccent('Task 1')).toBe(false)
    expect(taskHasBambooAccent('Task 2')).toBe(false)
  })

  test('applies border-l-[3px] and border-bamboo classes to scroll target', () => {
    const tasks = [makeTask(1, '09:00', 120)] // spans 10:00 (current)
    renderTimeline(tasks)

    const target = document.querySelector('[class*="border-l"]')
    expect(target).toBeTruthy()
    expect(target?.className).toContain('border-bamboo')
  })
})
