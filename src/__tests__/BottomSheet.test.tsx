import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BottomSheet from '../components/ui/BottomSheet'

// BottomSheet: modal sheet anchored to bottom of screen
// - Renders at detent sizes: peek (~40%), half (~50%), full (~90%)
// - Backdrop click closes sheet
// - Title rendered in header
// - Focus trap and escape key handling

describe('BottomSheet', () => {
  it('renders children and title when open', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} title="Test Sheet">
        <p>Sheet content</p>
      </BottomSheet>
    )
    expect(screen.getByText('Sheet content')).toBeTruthy()
    expect(screen.getByText('Test Sheet')).toBeTruthy()
  })

  it('does not render children when closed', () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()} title="Test Sheet">
        <p>Sheet content</p>
      </BottomSheet>
    )
    expect(screen.queryByText('Sheet content')).toBeNull()
  })

  it('renders backdrop when open', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} title="Test Sheet">
        <p>Content</p>
      </BottomSheet>
    )
    expect(screen.getByTestId('sheet-backdrop')).toBeTruthy()
  })

  it('renders dialog with correct ARIA attributes', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} title="My Title">
        <p>Content</p>
      </BottomSheet>
    )
    const dialog = screen.getByTestId('sheet-panel')
    expect(dialog.getAttribute('role')).toBe('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
  })

  it('renders close button with accessible label', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} title="Sheet">
        <p>Content</p>
      </BottomSheet>
    )
    expect(screen.getByLabelText('Close')).toBeTruthy()
  })
})
