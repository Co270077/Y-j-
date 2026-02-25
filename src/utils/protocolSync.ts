import { db } from '../db/database'
import type { Protocol, Task, SupplementEntry, DayOfWeek } from '../db/types'
import { DAYS_ORDERED, minutesSinceMidnight } from './time'

/**
 * Sync active protocols to schedule tasks.
 * When a protocol is active, creates tasks for each supplement dose.
 * When deactivated, removes the auto-generated tasks.
 */
export async function syncProtocolToSchedule(protocol: Protocol): Promise<void> {
  if (!protocol.id) return

  // Remove existing auto-generated tasks for this protocol
  await db.tasks.where('protocolId').equals(protocol.id).delete()

  if (!protocol.isActive) return

  // Load user settings for accurate wake/sleep times
  const settings = await db.settings.toArray()
  const userSettings = settings[0]
  const wakeMinutes = userSettings ? minutesSinceMidnight(userSettings.wakeTime) : 360
  const sleepMinutes = userSettings ? minutesSinceMidnight(userSettings.sleepTime) : 1320

  // Determine which days this protocol runs on
  const activeDays = getProtocolDays(protocol)

  // Create a task for each supplement
  for (const supplement of protocol.supplements) {
    const startTime = getSupplementTime(supplement, wakeMinutes, sleepMinutes)
    if (!startTime) continue

    const task: Omit<Task, 'id'> = {
      title: `${supplement.name} — ${supplement.dose}`,
      description: buildDescription(supplement, protocol.name),
      startTime,
      durationMinutes: 5,
      days: activeDays,
      category: 'supplement',
      color: 'var(--color-cat-supplement)',
      isComplete: false,
      subtasks: [],
      notify: true,
      protocolId: protocol.id,
      createdAt: new Date(),
    }

    await db.tasks.add(task)
  }
}

function getProtocolDays(protocol: Protocol): DayOfWeek[] {
  const { cyclePattern } = protocol
  switch (cyclePattern.type) {
    case 'daily':
      return [...DAYS_ORDERED]
    case 'specific_days':
      return cyclePattern.days
    case 'on_off':
      // For on/off, approximate by distributing across the week
      return DAYS_ORDERED.slice(0, Math.min(cyclePattern.daysOn, 7)) as DayOfWeek[]
  }
}

function getSupplementTime(supplement: SupplementEntry, wakeMinutes: number, sleepMinutes: number): string | null {
  const { timingRule } = supplement
  switch (timingRule.type) {
    case 'specific_time':
      return timingRule.time
    case 'on_wake':
      return minutesToTime(wakeMinutes + timingRule.offsetMinutes)
    case 'before_sleep':
      return minutesToTime(sleepMinutes - timingRule.offsetMinutes)
    case 'with_meal':
    case 'before_meal':
    case 'after_meal': {
      // Space meals relative to eating window
      const mealTimes = {
        breakfast: wakeMinutes + 120, // 2h after wake
        lunch: Math.round((wakeMinutes + sleepMinutes) / 2), // midday
        dinner: sleepMinutes - 180, // 3h before sleep
      }
      const base = mealTimes[timingRule.meal]
      if (timingRule.type === 'before_meal') return minutesToTime(base - timingRule.minutesBefore)
      if (timingRule.type === 'after_meal') return minutesToTime(base + timingRule.minutesAfter)
      return minutesToTime(base)
    }
  }
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function buildDescription(supplement: SupplementEntry, protocolName: string): string {
  const parts = [`Protocol: ${protocolName}`]
  if (supplement.withFood) parts.push('Take with food')
  if (supplement.notes) parts.push(supplement.notes)
  return parts.join(' · ')
}
