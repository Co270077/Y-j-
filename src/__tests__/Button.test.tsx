import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from '../components/ui/Button'

describe('Button', () => {
  test('renders as a button element', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy()
  })

  test('disabled button is visually dimmed', () => {
    render(<Button disabled>Click me</Button>)
    const btn = screen.getByRole('button', { name: 'Click me' })
    expect(btn.className).toContain('disabled:opacity-40')
    expect(btn).toBeTruthy()
  })

  test('preserves primary variant class', () => {
    render(<Button variant="primary">Primary</Button>)
    const btn = screen.getByRole('button', { name: 'Primary' })
    expect(btn.className).toContain('bg-bamboo')
  })

  test('preserves secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button', { name: 'Secondary' })
    expect(btn.className).toContain('bg-surface-raised')
  })

  test('preserves danger variant class', () => {
    render(<Button variant="danger">Delete</Button>)
    const btn = screen.getByRole('button', { name: 'Delete' })
    expect(btn.className).toContain('bg-danger')
  })

  test('sm size applies correct classes', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button', { name: 'Small' })
    expect(btn.className).toContain('px-3')
  })

  test('lg size applies correct classes', () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole('button', { name: 'Large' })
    expect(btn.className).toContain('px-6')
  })

  test('fullWidth adds w-full class', () => {
    render(<Button fullWidth>Full</Button>)
    const btn = screen.getByRole('button', { name: 'Full' })
    expect(btn.className).toContain('w-full')
  })

  // INTR-01: Button migrated from <button> to <m.button>
  test('renders as m.button — no CSS transition-transform (Motion owns tap)', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: 'Click me' })
    // transition-colors is kept for color hover; no transition-transform since Motion owns scale
    expect(btn.className).not.toContain('transition-transform')
    expect(btn.className).not.toContain('active:scale')
  })

  // INTR-01: Disabled button
  test('disabled button is accessible and renders correctly', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button', { name: 'Disabled' })
    expect(btn).toBeTruthy()
    expect(btn).toHaveProperty('disabled', true)
  })
})
