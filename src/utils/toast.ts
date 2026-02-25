type ToastType = 'success' | 'error' | 'info'

let addToastFn: ((text: string, type?: ToastType) => void) | null = null

/** Show a toast from anywhere in the app */
export function showToast(text: string, type: ToastType = 'success') {
  addToastFn?.(text, type)
}

/** Register the toast container's add function (called internally by ToastContainer) */
export function registerToastHandler(fn: (text: string, type?: ToastType) => void) {
  addToastFn = fn
}

/** Unregister the toast handler */
export function unregisterToastHandler() {
  addToastFn = null
}
