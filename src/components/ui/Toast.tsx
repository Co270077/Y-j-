import { useState, useEffect, useCallback } from 'react'
import * as m from 'motion/react-m'
import { AnimatePresence } from 'motion/react'
import { registerToastHandler, unregisterToastHandler } from '../../utils/toast'
import { slideDown } from '../../motion/variants'

// Re-export for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { showToast } from '../../utils/toast'

interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString(36)
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  useEffect(() => {
    registerToastHandler(addToast)
    return () => { unregisterToastHandler() }
  }, [addToast])

  return (
    <div className="fixed top-16 left-0 right-0 z-[300] flex flex-col items-center gap-2 px-5 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <m.div
            key={toast.id}
            variants={slideDown}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
              px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
              shadow-lg pointer-events-auto
              ${toast.type === 'success' ? 'bg-bamboo text-warm-white' :
                toast.type === 'error' ? 'bg-danger text-warm-white' :
                'bg-surface-raised text-text-primary border border-border'}
            `}
          >
            {toast.text}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
