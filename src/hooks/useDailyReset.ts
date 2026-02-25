import { useEffect, useRef } from 'react'
import { getTodayString } from '../utils/time'
import { useScheduleStore } from '../stores/scheduleStore'

/**
 * Monitors for day change (midnight rollover).
 * When the date changes, reloads daily logs for the new day.
 */
export function useDailyReset() {
  const loadDailyLogs = useScheduleStore(s => s.loadDailyLogs)
  const dateRef = useRef(getTodayString())

  useEffect(() => {
    const check = () => {
      const now = getTodayString()
      if (now !== dateRef.current) {
        dateRef.current = now
        loadDailyLogs(now)
      }
    }

    // Check every minute
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [loadDailyLogs])
}
