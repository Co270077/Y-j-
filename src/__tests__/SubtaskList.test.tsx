import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SubtaskList from '../components/schedule/SubtaskList'
import type { Subtask } from '../db/types'

function makeSubtasks(count: number): Subtask[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `st-${i + 1}`,
    title: `Subtask ${i + 1}`,
    isComplete: false,
    order: i,
  }))
}

describe('SubtaskList', () => {
  test('renders nothing when subtasks array is empty', () => {
    const { container } = render(
      <SubtaskList subtasks={[]} completions={{}} onToggle={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders subtask buttons', () => {
    const subtasks = makeSubtasks(3)
    render(<SubtaskList subtasks={subtasks} completions={{}} onToggle={() => {}} />)
    expect(screen.getByText('Subtask 1')).toBeTruthy()
    expect(screen.getByText('Subtask 2')).toBeTruthy()
    expect(screen.getByText('Subtask 3')).toBeTruthy()
  })

  test('renders correct number of buttons', () => {
    const subtasks = makeSubtasks(4)
    render(<SubtaskList subtasks={subtasks} completions={{}} onToggle={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(4)
  })

  test('calls onToggle with subtask id when clicked', () => {
    const subtasks = makeSubtasks(2)
    const mockFn = vi.fn()
    render(<SubtaskList subtasks={subtasks} completions={{}} onToggle={mockFn} />)
    fireEvent.click(screen.getByText('Subtask 1').closest('button')!)
    expect(mockFn).toHaveBeenCalledWith('st-1')
  })

  test('completed subtask shows strikethrough text', () => {
    const subtasks = makeSubtasks(2)
    render(
      <SubtaskList
        subtasks={subtasks}
        completions={{ 'st-1': true }}
        onToggle={() => {}}
      />
    )
    const span = screen.getByText('Subtask 1')
    expect(span.className).toContain('line-through')
  })

  // INTR-01: checkbox buttons use m.button with whileTap — no CSS active:scale
  test('checkbox buttons have no CSS active:scale (Motion owns tap feedback)', () => {
    const subtasks = makeSubtasks(1)
    render(<SubtaskList subtasks={subtasks} completions={{}} onToggle={() => {}} />)
    const btn = screen.getAllByRole('button')[0]
    // After migration: no active:scale or transition-transform in className
    expect(btn.className).not.toContain('transition-transform')
    expect(btn.className).not.toContain('active:scale')
  })
})
