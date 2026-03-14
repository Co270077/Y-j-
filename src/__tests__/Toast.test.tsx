import { describe, it, expect, vi } from 'vitest'
import { registerToastHandler, unregisterToastHandler, showToast, showToastWithAction } from '../utils/toast'

// Toast utility: imperative toast API
// - registerToastHandler/unregisterToastHandler manage the handler
// - showToast and showToastWithAction delegate to registered handler
// - Safe to call when no handler registered (no-op)

describe('Toast utility', () => {
  it('calls registered handler on showToast', () => {
    const handler = vi.fn()
    registerToastHandler(handler)
    showToast('Hello', 'success')
    expect(handler).toHaveBeenCalledWith('Hello', 'success')
    unregisterToastHandler()
  })

  it('does not throw when no handler registered', () => {
    unregisterToastHandler()
    expect(() => showToast('No handler')).not.toThrow()
  })

  it('calls handler with action on showToastWithAction', () => {
    const handler = vi.fn()
    registerToastHandler(handler)
    const onAction = vi.fn()
    showToastWithAction('Deleted', 'Undo', onAction, 5000)
    expect(handler).toHaveBeenCalledWith('Deleted', 'info', { label: 'Undo', onAction }, 5000)
    unregisterToastHandler()
  })

  it('unregisterToastHandler clears the handler', () => {
    const handler = vi.fn()
    registerToastHandler(handler)
    unregisterToastHandler()
    showToast('After unregister')
    expect(handler).not.toHaveBeenCalled()
  })
})
