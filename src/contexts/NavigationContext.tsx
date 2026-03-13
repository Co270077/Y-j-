import { createContext, useContext, useRef } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export type NavDirection = 'tab' | 'forward' | 'back'

interface NavigationContextValue {
  direction: React.MutableRefObject<NavDirection>
  navigateTo: (path: string, direction?: NavDirection) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const direction = useRef<NavDirection>('tab')
  const navigate = useNavigate()

  function navigateTo(path: string, dir: NavDirection = 'tab') {
    direction.current = dir
    navigate(path)
  }

  return (
    <NavigationContext.Provider value={{ direction, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext)
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return ctx
}
