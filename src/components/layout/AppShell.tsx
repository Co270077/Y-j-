import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import ToastContainer from '../ui/Toast'

export default function AppShell() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // Scroll to top on navigation
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-charcoal">
      <ToastContainer />
      <main ref={mainRef} className="flex-1 pb-20 overflow-y-auto overscroll-contain">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
