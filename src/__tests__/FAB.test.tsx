import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FAB from '../components/ui/FAB'

describe('FAB', () => {
  test('renders with correct aria-label', () => {
    render(<FAB onClick={() => {}} label="Add new task" />)
    expect(screen.getByRole('button', { name: 'Add new task' })).toBeTruthy()
  })

  test('calls onClick handler when clicked', () => {
    const mockFn = vi.fn()
    render(<FAB onClick={mockFn} label="Add new task" />)
    fireEvent.click(screen.getByRole('button', { name: 'Add new task' }))
    expect(mockFn).toHaveBeenCalledOnce()
  })

  test('has fixed positioning above bottom nav', () => {
    render(<FAB onClick={() => {}} label="Add new task" />)
    const btn = screen.getByRole('button', { name: 'Add new task' })
    expect(btn.className).toContain('fixed')
    expect(btn.className).toContain('bottom-[calc')
  })
})
