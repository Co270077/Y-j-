import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtocolList from '../components/protocols/ProtocolList'
import type { Protocol } from '../db/types'

function makeProtocol(id: number, name: string, isActive = true): Protocol {
  return {
    id,
    name,
    supplements: [
      {
        id: `sup-${id}-1`,
        name: 'Vitamin D',
        dose: '2000IU',
        timingRule: { type: 'specific_time', time: '08:00' },
        withFood: true,
        notes: '',
      },
    ],
    cyclePattern: { type: 'daily' },
    startDate: '2026-01-01',
    isActive,
    createdAt: new Date(),
  }
}

describe('ProtocolList', () => {
  test('renders empty state when protocols array is empty', () => {
    render(
      <ProtocolList
        protocols={[]}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    expect(screen.getByText('No protocols yet')).toBeTruthy()
  })

  test('renders protocol items matching input count', () => {
    const protocols = [
      makeProtocol(1, 'Morning Stack'),
      makeProtocol(2, 'Evening Stack'),
      makeProtocol(3, 'Workout Stack'),
    ]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    expect(screen.getByText('Morning Stack')).toBeTruthy()
    expect(screen.getByText('Evening Stack')).toBeTruthy()
    expect(screen.getByText('Workout Stack')).toBeTruthy()
  })

  test('list container wraps items in flex column', () => {
    const protocols = [makeProtocol(1, 'Stack A')]
    const { container } = render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    const wrapper = container.querySelector('.flex.flex-col')
    expect(wrapper).toBeTruthy()
  })

  test('renders active badge for active protocol', () => {
    const protocols = [makeProtocol(1, 'Active Stack', true)]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    expect(screen.getByText('Active')).toBeTruthy()
  })

  test('renders inactive badge for inactive protocol', () => {
    const protocols = [makeProtocol(1, 'Inactive Stack', false)]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    expect(screen.getByText('Inactive')).toBeTruthy()
  })

  test('calls onSelect when protocol card is clicked', () => {
    const mockFn = vi.fn()
    const protocols = [makeProtocol(1, 'Click Me Stack')]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={mockFn}
        onToggleActive={() => {}}
      />
    )
    screen.getByText('Click Me Stack').click()
    expect(mockFn).toHaveBeenCalled()
  })

  // Unskip after Plan 03 migration: protocol list items use stagger wrapper
  test.skip('list container has stagger parent variant after migration', () => {
    // After Plan 03: wrapper div uses m.div with staggerChildren variant
    // Each Card child gets slideUp variant
  })
})
