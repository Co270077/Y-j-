import { useState, useEffect, useCallback, useRef } from 'react'
import * as m from 'motion/react-m'
import { AnimatePresence } from 'motion/react'
import { registerToastHandler, unregisterToastHandler } from '../../utils/toast'
import type { ToastAction } from '../../utils/toast'
import { slideDown } from '../../motion/variants'

// Re-export for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { showToast, showToastWithAction } from '../../utils/toast'

interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
  action?: ToastAction
  duration?: number
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const duration = toast.duration ?? 2500
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barRef.current) return
    // Start at full width, transition to 0 on next frame
    requestAnimationFrame(() => {
      if (barRef.current) {
        barRef.current.style.width = '0%'
      }
    })
  }, [])

  const handleAction = () => {
    toast.action?.onAction()
    onRemove(toast.id)
  }

  const hasAction = !!toast.action

  return (
    <m.div
      key={toast.id}
      variants={slideDown}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`
        relative px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
        shadow-lg pointer-events-auto overflow-hidden
        ${toast.type === 'success' ? 'bg-bamboo text-warm-white' :
          toast.type === 'error' ? 'bg-danger text-warm-white' :
          'bg-surface-raised text-text-primary border border-border'}
      `}
    >
      <div className="flex items-center">
        <span>{toast.text}</span>
        {hasAction && (
          <button
            onClick={handleAction}
            className="text-bamboo font-semibold ml-3 uppercase text-xs cursor-pointer"
          >
            {toast.action!.label}
          </button>
        )}
      </div>
      {hasAction && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div
            ref={barRef}
            className="h-full bg-bamboo/50 rounded-full w-full"
            style={{ transition: `width ${duration}ms linear` }}
          />
        </div>
      )}
    </m.div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'success', action?: ToastAction, duration?: number) => {
    const id = Date.now().toString(36)
    const effectiveDuration = duration ?? 2500
    setToasts(prev => [...prev, { id, text, type, action, duration: effectiveDuration }])
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      timersRef.current.delete(id)
    }, effectiveDuration)
    timersRef.current.set(id, timer)
  }, [])

  useEffect(() => {
    registerToastHandler(addToast)
    return () => {
      unregisterToastHandler()
      // Clear all pending timers on unmount
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [addToast])

  // Separate regular toasts (top) from action toasts (above bottom nav)
  const regularToasts = toasts.filter(t => !t.action)
  const actionToasts = toasts.filter(t => !!t.action)

  return (
    <>
      {/* Regular toasts at top (below header + safe area) */}
      <div className="fixed left-0 right-0 z-[300] flex flex-col items-center gap-2 px-5 pointer-events-none" style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        <AnimatePresence>
          {regularToasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
      {/* Action (undo) toasts above bottom nav */}
      <div className="fixed left-0 right-0 z-[300] flex flex-col items-center gap-2 px-5 pointer-events-none" style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <AnimatePresence>
          {actionToasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
