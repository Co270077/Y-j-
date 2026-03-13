import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock motion/react to provide controlled values
const mockSet = vi.fn()
let mockChangeCallback: ((v: number) => void) | null = null

vi.mock('motion/react', () => ({
  useMotionValue: vi.fn(() => ({
    set: mockSet,
  })),
  useSpring: vi.fn((motionValue) => ({
    on: vi.fn(),
  })),
  useMotionValueEvent: vi.fn((_spring, _event, callback) => {
    mockChangeCallback = callback
  }),
}))

import { useCountUp } from '../hooks/useCountUp'

describe('useCountUp', () => {
  beforeEach(() => {
    mockSet.mockClear()
    mockChangeCallback = null
  })

  it('returns 0 as initial display value', () => {
    const { result } = renderHook(() => useCountUp(100))
    expect(result.current).toBe(0)
  })

  it('calls motionValue.set with the target value', () => {
    renderHook(() => useCountUp(75))
    expect(mockSet).toHaveBeenCalledWith(75)
  })

  it('rounds the latest spring value to nearest integer', () => {
    const { result } = renderHook(() => useCountUp(100))

    act(() => {
      if (mockChangeCallback) mockChangeCallback(42.7)
    })

    expect(result.current).toBe(43)
  })

  it('rounds down correctly', () => {
    const { result } = renderHook(() => useCountUp(100))

    act(() => {
      if (mockChangeCallback) mockChangeCallback(42.2)
    })

    expect(result.current).toBe(42)
  })

  it('re-sets motionValue when target changes', () => {
    const { rerender } = renderHook(({ target }) => useCountUp(target), {
      initialProps: { target: 50 },
    })
    expect(mockSet).toHaveBeenCalledWith(50)

    rerender({ target: 80 })
    expect(mockSet).toHaveBeenCalledWith(80)
  })
})
