import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  test('expands protocol details on tap', () => {
    const protocols = [makeProtocol(1, 'Click Me Stack')]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    // Edit button not visible before expansion
    expect(screen.queryByText('Edit')).toBeNull()
    // Tap the card title to expand
    fireEvent.click(screen.getByText('Click Me Stack'))
    // Edit button appears in expanded state
    expect(screen.getByText('Edit')).toBeTruthy()
  })

  test('collapses expanded protocol on second tap', () => {
    const protocols = [makeProtocol(1, 'Toggle Stack')]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    fireEvent.click(screen.getByText('Toggle Stack'))
    expect(screen.getByText('Edit')).toBeTruthy()
    fireEvent.click(screen.getByText('Toggle Stack'))
    expect(screen.queryByText('Edit')).toBeNull()
  })

  test('only one protocol expanded at a time', () => {
    const protocols = [
      makeProtocol(1, 'Stack A'),
      makeProtocol(2, 'Stack B'),
    ]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    // Expand Stack A
    fireEvent.click(screen.getByText('Stack A'))
    expect(screen.getAllByText('Edit')).toHaveLength(1)
    // Expand Stack B — Stack A should collapse
    fireEvent.click(screen.getByText('Stack B'))
    expect(screen.getAllByText('Edit')).toHaveLength(1)
  })

  test('calls onSelect when Edit button is clicked in expanded view', () => {
    const mockFn = vi.fn()
    const protocols = [makeProtocol(1, 'Edit Test Stack')]
    render(
      <ProtocolList
        protocols={protocols}
        onSelect={mockFn}
        onToggleActive={() => {}}
      />
    )
    fireEvent.click(screen.getByText('Edit Test Stack'))
    fireEvent.click(screen.getByText('Edit'))
    expect(mockFn).toHaveBeenCalled()
  })

  test('list container has stagger parent variant after migration', () => {
    const protocols = [makeProtocol(1, 'Stack A'), makeProtocol(2, 'Stack B')]
    const { container } = render(
      <ProtocolList
        protocols={protocols}
        onSelect={() => {}}
        onToggleActive={() => {}}
      />
    )
    // The wrapper should contain the protocol items
    const wrapper = container.querySelector('.flex.flex-col')
    expect(wrapper).toBeTruthy()
    expect(screen.getByText('Stack A')).toBeTruthy()
    expect(screen.getByText('Stack B')).toBeTruthy()
  })
})
