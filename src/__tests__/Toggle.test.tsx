import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toggle from '../components/ui/Toggle'

describe('Toggle', () => {
  test('renders track as a switch role element', () => {
    render(<Toggle checked={false} onChange={() => {}} />)
    expect(screen.getByRole('switch')).toBeTruthy()
  })

  test('aria-checked reflects checked state (false)', () => {
    render(<Toggle checked={false} onChange={() => {}} />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl.getAttribute('aria-checked')).toBe('false')
  })

  test('aria-checked reflects checked state (true)', () => {
    render(<Toggle checked={true} onChange={() => {}} />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl.getAttribute('aria-checked')).toBe('true')
  })

  test('calls onChange when clicked', () => {
    const mockFn = vi.fn()
    render(<Toggle checked={false} onChange={mockFn} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(mockFn).toHaveBeenCalledWith(true)
  })

  test('renders optional label text', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Dark mode" />)
    expect(screen.getByText('Dark mode')).toBeTruthy()
  })

  // INTR-01: knob position is Motion-driven — no CSS translate classes
  test('knob has no CSS transition-transform (Motion spring drives position)', () => {
    render(<Toggle checked={false} onChange={() => {}} />)
    const switchEl = screen.getByRole('switch')
    const knob = switchEl.querySelector('span')
    expect(knob?.className).not.toContain('transition-transform')
    expect(knob?.className).not.toContain('translate-x-5')
    expect(knob?.className).not.toContain('translate-x-0')
  })

  // INTR-01: track wrapper is m.button — no CSS transition-colors for bg
  test('track has no CSS transition-colors (Motion animate drives bg)', () => {
    render(<Toggle checked={false} onChange={() => {}} />)
    const switchEl = screen.getByRole('switch')
    expect(switchEl.className).not.toContain('transition-colors')
    expect(switchEl.className).not.toContain('bg-bamboo')
    expect(switchEl.className).not.toContain('bg-surface-overlay')
  })
})
