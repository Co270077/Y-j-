import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NavigationProvider, useNavigation } from '../contexts/NavigationContext'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <NavigationProvider>{children}</NavigationProvider>
    </MemoryRouter>
  )
}

describe('NavigationContext', () => {
  it('provides direction ref defaulting to tab', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })
    expect(result.current.direction.current).toBe('tab')
  })

  it('navigateTo updates direction ref before navigating', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper })
    act(() => {
      result.current.navigateTo('/schedule', 'forward')
    })
    expect(result.current.direction.current).toBe('forward')
  })

  it('useNavigation throws when used outside NavigationProvider', () => {
    const consoleError = console.error
    console.error = () => {}
    expect(() => {
      renderHook(() => useNavigation())
    }).toThrow('useNavigation must be used within a NavigationProvider')
    console.error = consoleError
  })
})
