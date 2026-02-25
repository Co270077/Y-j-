import type { Task, AppSettings } from '../db/types'
import { minutesSinceMidnight, getCurrentTime, getCurrentDay } from './time'
import { clearAllScheduledNotifications, scheduleNotification } from './notifications'

/**
 * Schedule foreground notifications for all upcoming tasks today.
 * Called on app load and when tasks change.
 */
export function scheduleTaskNotifications(
  tasks: Task[],
  settings: AppSettings | null,
) {
  if (!settings?.notificationsEnabled) return

  clearAllScheduledNotifications()

  const today = getCurrentDay()
  const currentMinutes = minutesSinceMidnight(getCurrentTime())
  const notifyBefore = settings.notifyMinutesBefore || 5

  const todayTasks = tasks
    .filter(t => t.days.includes(today) && t.notify)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  for (const task of todayTasks) {
    const taskMinutes = minutesSinceMidnight(task.startTime)
    const notifyAt = taskMinutes - notifyBefore
    const minutesFromNow = notifyAt - currentMinutes

    if (minutesFromNow > 0) {
      scheduleNotification(
        task.title,
        `Starting in ${notifyBefore} minutes`,
        minutesFromNow,
      )
    }
  }
}
