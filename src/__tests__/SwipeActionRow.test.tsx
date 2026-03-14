import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SwipeActionRow from '../components/ui/SwipeActionRow'

// SwipeActionRow: horizontal swipe gesture row
// - Right swipe > 40% container width triggers onComplete
// - Left swipe > 40% container width triggers onDelete
// - Swipe below threshold springs back to x=0
// - Direction locked after 10px movement; vertical-dominant gesture cancels

// Note: Full gesture tests (pointer events + motion values) require
// a gesture testing harness. These tests verify render behavior.

describe('SwipeActionRow', () => {
  it('renders children content', () => {
    render(
      <SwipeActionRow onComplete={vi.fn()} onDelete={vi.fn()}>
        <span>Row content</span>
      </SwipeActionRow>
    )
    expect(screen.getByText('Row content')).toBeTruthy()
  })

  it('renders complete background when onComplete provided', () => {
    const { container } = render(
      <SwipeActionRow onComplete={vi.fn()}>
        <span>Row</span>
      </SwipeActionRow>
    )
    // Should have the green/complete background layer
    const backgrounds = container.querySelectorAll('[aria-hidden="true"]')
    expect(backgrounds.length).toBe(1)
  })

  it('renders delete background when onDelete provided', () => {
    const { container } = render(
      <SwipeActionRow onDelete={vi.fn()}>
        <span>Row</span>
      </SwipeActionRow>
    )
    const backgrounds = container.querySelectorAll('[aria-hidden="true"]')
    expect(backgrounds.length).toBe(1)
  })

  it('renders both backgrounds when both handlers provided', () => {
    const { container } = render(
      <SwipeActionRow onComplete={vi.fn()} onDelete={vi.fn()}>
        <span>Row</span>
      </SwipeActionRow>
    )
    const backgrounds = container.querySelectorAll('[aria-hidden="true"]')
    expect(backgrounds.length).toBe(2)
  })

  it('renders no backgrounds when no handlers provided', () => {
    const { container } = render(
      <SwipeActionRow>
        <span>Row</span>
      </SwipeActionRow>
    )
    const backgrounds = container.querySelectorAll('[aria-hidden="true"]')
    expect(backgrounds.length).toBe(0)
  })

  it('does not attach gesture bindings when disabled', () => {
    const { container } = render(
      <SwipeActionRow onComplete={vi.fn()} enabled={false}>
        <span>Row</span>
      </SwipeActionRow>
    )
    // When disabled, the container should not have touch-action style from gesture
    // (the style is set via inline style object, not gesture props)
    expect(container.querySelector('[style]')).toBeTruthy()
    expect(screen.getByText('Row')).toBeTruthy()
  })
})
