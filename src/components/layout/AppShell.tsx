import { useEffect, useRef } from 'react'
import { useOutlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import BottomNav from './BottomNav'
import ToastContainer from '../ui/Toast'
import { fadeIn } from '../../motion/variants'

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()
  const mainRef = useRef<HTMLElement>(null)

  // Scroll to top on navigation
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-charcoal">
      <ToastContainer />
      <main ref={mainRef} className="flex-1 pb-20 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          <m.div key={location.pathname} variants={fadeIn} initial="initial" animate="animate" exit="exit">
            {outlet}
          </m.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
