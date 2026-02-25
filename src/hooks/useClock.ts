import { useState, useEffect } from 'react'
import { format } from 'date-fns'

/** Returns the current time string, updating every minute */
export function useClock() {
  const [time, setTime] = useState(() => format(new Date(), 'h:mm a'))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(format(new Date(), 'h:mm a'))
    }, 30_000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return time
}

/** Returns a tick that increments every minute, useful for re-rendering time-dependent UIs */
export function useMinuteTick() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  return tick
}
