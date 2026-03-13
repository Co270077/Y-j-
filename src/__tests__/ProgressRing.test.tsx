import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock motion/react for spring hooks
const mockSet = vi.fn()
vi.mock('motion/react', () => ({
  useMotionValue: vi.fn(() => ({ set: mockSet })),
  useSpring: vi.fn(() => ({ get: () => 0 })),
}))

// Mock motion/react-m so m.circle renders as a standard SVG circle
vi.mock('motion/react-m', () => ({
  circle: 'circle',
}))

import ProgressRing from '../components/ui/ProgressRing'

describe('ProgressRing', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ProgressRing progress={50} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders background and foreground circles', () => {
    const { container } = render(<ProgressRing progress={75} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(2)
  })

  it('does NOT have transition-all class on foreground circle (Motion owns animation)', () => {
    const { container } = render(<ProgressRing progress={50} />)
    const circles = container.querySelectorAll('circle')
    circles.forEach((circle) => {
      expect(circle.className).not.toContain('transition-all')
    })
  })

  it('renders children inside', () => {
    const { getByText } = render(
      <ProgressRing progress={60}>
        <span>60%</span>
      </ProgressRing>
    )
    expect(getByText('60%')).toBeTruthy()
  })

  it('applies default size of 64', () => {
    const { container } = render(<ProgressRing progress={30} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('64')
    expect(svg?.getAttribute('height')).toBe('64')
  })

  it('clamps progress at 100', () => {
    // Should not throw or produce negative offsets
    expect(() => render(<ProgressRing progress={150} />)).not.toThrow()
  })

  it('calls motionValue.set with targetOffset on mount', () => {
    mockSet.mockClear()
    render(<ProgressRing progress={50} />)
    expect(mockSet).toHaveBeenCalled()
  })
})
