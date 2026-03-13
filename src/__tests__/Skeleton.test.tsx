import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Skeleton from '../components/ui/Skeleton'

describe('Skeleton', () => {
  it('renders with skeleton-shimmer class', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('skeleton-shimmer')
  })

  it('has aria-hidden="true" for accessibility', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('applies rounded-[var(--radius-md)] for block variant (default)', () => {
    const { container } = render(<Skeleton variant="block" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-[var(--radius-md)]')
  })

  it('applies rounded-full for text variant', () => {
    const { container } = render(<Skeleton variant="text" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-full')
  })

  it('applies rounded-full for circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-full')
  })

  it('applies rounded-[var(--radius-lg)] for card variant', () => {
    const { container } = render(<Skeleton variant="card" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-[var(--radius-lg)]')
  })

  it('applies custom width and height via style', () => {
    const { container } = render(<Skeleton width={120} height={40} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('40px')
  })

  it('applies string width and height', () => {
    const { container } = render(<Skeleton width="100%" height="2rem" />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('100%')
    expect(el.style.height).toBe('2rem')
  })

  it('applies additional className', () => {
    const { container } = render(<Skeleton className="w-full h-4" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('w-full')
    expect(el.className).toContain('h-4')
  })

  it('does not contain any bg-* Tailwind class (shimmer class handles background)', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    // Should not have inline bg-* Tailwind classes from the component itself
    expect(el.className).not.toMatch(/\bbg-\w/)
  })
})
