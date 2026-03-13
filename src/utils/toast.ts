type ToastType = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  onAction: () => void
}

let addToastFn: ((text: string, type?: ToastType, action?: ToastAction, duration?: number) => void) | null = null

/** Show a toast from anywhere in the app */
export function showToast(text: string, type: ToastType = 'success') {
  addToastFn?.(text, type)
}

/** Show a toast with an action button (e.g. Undo) */
export function showToastWithAction(text: string, actionLabel: string, onAction: () => void, duration = 5000) {
  addToastFn?.(text, 'info', { label: actionLabel, onAction }, duration)
}

/** Register the toast container's add function (called internally by ToastContainer) */
export function registerToastHandler(fn: (text: string, type?: ToastType, action?: ToastAction, duration?: number) => void) {
  addToastFn = fn
}

/** Unregister the toast handler */
export function unregisterToastHandler() {
  addToastFn = null
}
