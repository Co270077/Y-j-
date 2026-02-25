import { format, parse, addMinutes, differenceInMinutes, isAfter, isBefore } from 'date-fns'

/** Parse "HH:mm" string to a Date (today) */
export function parseTime(time: string): Date {
  return parse(time, 'HH:mm', new Date())
}

/** Format a Date to "HH:mm" */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}

/** Format "HH:mm" to "6:00 AM" display */
export function formatTimeDisplay(time: string): string {
  const date = parseTime(time)
  return format(date, 'h:mm a')
}

/** Get end time from start + duration */
export function getEndTime(startTime: string, durationMinutes: number): string {
  const start = parseTime(startTime)
  const end = addMinutes(start, durationMinutes)
  return formatTime(end)
}

/** Get end time as display string */
export function getEndTimeDisplay(startTime: string, durationMinutes: number): string {
  return formatTimeDisplay(getEndTime(startTime, durationMinutes))
}

/** Format duration in minutes to human readable */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Minutes elapsed since midnight */
export function minutesSinceMidnight(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Convert minutes since midnight to "HH:mm" */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Check if current time is within a time range */
export function isTimeInRange(current: string, start: string, end: string): boolean {
  const c = parseTime(current)
  const s = parseTime(start)
  const e = parseTime(end)
  return (isAfter(c, s) || c.getTime() === s.getTime()) && isBefore(c, e)
}

/** Get current time as "HH:mm" */
export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm')
}

/** Get current day of week */
export function getCurrentDay(): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
  return days[new Date().getDay()] as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
}

/** Get today as YYYY-MM-DD */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Calculate minutes between two "HH:mm" times */
export function minutesBetween(start: string, end: string): number {
  return differenceInMinutes(parseTime(end), parseTime(start))
}

/** Day labels */
export const DAY_LABELS: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

export const DAYS_ORDERED = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
