import { useEffect, useRef } from 'react'
import { useOutlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import BottomNav from './BottomNav'
import ToastContainer from '../ui/Toast'
import { fadeIn, slideRight, slideLeft } from '../../motion/variants'
import { useNavigation } from '../../contexts/NavigationContext'

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()
  const mainRef = useRef<HTMLElement>(null)
  const { direction } = useNavigation()

  // Scroll to top on navigation
  // Skip /schedule (handles its own scroll) and drill-down directions
  useEffect(() => {
    const isTabSwitch = direction.current === 'tab'
    const isSchedule = location.pathname === '/schedule'
    if (isTabSwitch && !isSchedule) {
      mainRef.current?.scrollTo(0, 0)
    }
  }, [location.pathname, direction])

  const pageVariants =
    direction.current === 'tab'
      ? fadeIn
      : direction.current === 'forward'
        ? slideRight
        : slideLeft

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      <ToastContainer />
      <main ref={mainRef} className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] overflow-y-auto" style={{ overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch' }}>
        <AnimatePresence mode="popLayout">
          <m.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-full">
            {outlet}
          </m.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
