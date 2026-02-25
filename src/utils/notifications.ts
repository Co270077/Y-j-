/** Foreground-only notification scheduler for 時間の流れ */

let scheduledTimers: ReturnType<typeof setTimeout>[] = []

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function showNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  })
}

/** Schedule a notification for a future time (minutes from now) */
export function scheduleNotification(title: string, body: string, minutesFromNow: number) {
  if (minutesFromNow <= 0) return
  const ms = minutesFromNow * 60 * 1000
  const timer = setTimeout(() => showNotification(title, body), ms)
  scheduledTimers.push(timer)
}

/** Clear all scheduled notification timers */
export function clearAllScheduledNotifications() {
  scheduledTimers.forEach(clearTimeout)
  scheduledTimers = []
}
