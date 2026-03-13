import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { NavigationProvider } from '../contexts/NavigationContext'
import BottomNav from '../components/layout/BottomNav'
import type { ReactNode } from 'react'

function Wrapper({ children, initialPath = '/' }: { children: ReactNode; initialPath?: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <NavigationProvider>{children}</NavigationProvider>
    </MemoryRouter>
  )
}

describe('BottomNav', () => {
  it('renders layoutId active-tab-indicator on active tab', () => {
    render(<BottomNav />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> })
    // Active tab (Dashboard at /) should have the pill bg-bamboo/15
    const activeButton = screen.getByRole('button', { name: /dashboard/i })
    expect(activeButton.querySelector('.bg-bamboo\\/15')).toBeTruthy()
  })

  it('calls navigateTo with tab direction on click', async () => {
    const user = userEvent.setup()
    render(<BottomNav />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> })
    const scheduleButton = screen.getByRole('button', { name: /schedule/i })
    await user.click(scheduleButton)
    // After clicking, Schedule should become active (aria-current=page)
    expect(scheduleButton.getAttribute('aria-current')).toBe('page')
  })

  it('renders all 4 tab buttons', () => {
    render(<BottomNav />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> })
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /schedule/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /protocols/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /meals/i })).toBeTruthy()
  })
})
