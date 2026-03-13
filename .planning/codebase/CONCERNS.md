# Codebase Concerns

**Analysis Date:** 2026-03-13

## Tech Debt

**Synchronization Race Conditions:**
- Issue: Multiple stores trigger cascade updates when protocols/meals change. No transaction guarantees.
- Files: `src/stores/protocolStore.ts` (lines 59-66, 92-96), `src/stores/scheduleStore.ts` (lines 45-57, 59-68)
- Impact: Rapid edits can leave database in inconsistent state; auto-generated tasks from protocols may duplicate or conflict with manual tasks
- Fix approach: Wrap multi-step DB operations in a single transaction using Dexie's transaction API. Add debouncing to store updates.

**State Initialization Race:**
- Issue: App.tsx loads all 4 stores in parallel without awaiting. No guarantee data loads before components render.
- Files: `src/App.tsx` (lines 25-30)
- Impact: Components may render before data is available; dailyLogs could be stale; tasks shown may be from previous app session
- Fix approach: Await all load() promises sequentially or use a Promise.all() with explicit error handling. Add isLoaded flag checks in critical components.

**JSON Import Without Validation:**
- Issue: SettingsPage imports user-provided JSON directly without schema validation.
- Files: `src/pages/SettingsPage.tsx` (lines 62-79)
- Impact: Malformed backup files can corrupt database. Missing required fields silently fail to bulkAdd(). No verification that imported IDs don't clash.
- Fix approach: Validate JSON structure before bulkAdd(). Generate new IDs on import to prevent collisions. Provide rollback on failure.

## Known Bugs

**Meal-Based Timing Approximation Issue:**
- Symptoms: Protocol supplements with "before_meal"/"after_meal" timing don't know actual meal times—only estimates based on wake/sleep
- Files: `src/utils/protocolSync.ts` (lines 77-81)
- Trigger: Create protocol with "Before breakfast" timing on supplement
- Workaround: Use "Specific time" instead; set manually
- Root cause: Meal times are not tracked independently. System assumes breakfast is always 2h after wake.
- Fix approach: Add meal time configuration to settings or infer from meal plan eating windows.

**Outdated Daily Logs on Midnight Boundary:**
- Symptoms: User completes tasks between 11:59 PM and midnight; logs appear on old date after page reload
- Files: `src/hooks/useDailyReset.ts` (lines 14-20), `src/utils/time.ts` (line 72)
- Trigger: Complete task at 11:58 PM, then reload app at 12:02 AM
- Root cause: getTodayString() uses local Date(), but component may render before midnight check completes
- Fix approach: Use server time or persist completion timestamps to ensure date consistency.

**Task Overlap Detection Doesn't Account for All Day:**
- Symptoms: User can create tasks that extend past midnight (e.g., 23:00 + 120 minutes = 01:00 next day)
- Files: `src/components/schedule/TaskModal.tsx` (lines 105-117)
- Trigger: Create task starting at 23:00 with 180 minute duration
- Workaround: Manually ensure start time + duration doesn't exceed 24:00
- Root cause: minutesSinceMidnight doesn't wrap; overlap calculation treats 1440+ as valid time
- Fix approach: Clamp duration or split multi-day tasks into separate day entries.

## Security Considerations

**Backup File Execution Risk:**
- Risk: Imported JSON could contain malicious JavaScript in description/notes fields if later evaluated
- Files: `src/pages/SettingsPage.tsx` (lines 54-87), `src/db/types.ts` (Task.description, SupplementEntry.notes)
- Current mitigation: Text fields are rendered as strings, not HTML
- Recommendations: Add HTML sanitization if ever moving to rich text. Validate all string fields on import. Consider encryption for sensitive backup files.

**No Data Encryption at Rest:**
- Risk: IndexedDB stores all data unencrypted. Private health/supplement data visible to any script with DB access.
- Files: `src/db/database.ts`
- Current mitigation: PWA is same-origin only; requires user's device
- Recommendations: For production, implement Dexie encryption addon. Mark backup files as sensitive.

**Notification Permission Requests:**
- Risk: Permission denied users can't see notifications but no fallback UI
- Files: `src/pages/SettingsPage.tsx` (lines 139-143), `src/utils/notifications.ts`
- Current mitigation: UI shows denied state but doesn't explain how to re-enable
- Recommendations: Link to browser settings instructions. Fallback to toast notifications.

## Performance Bottlenecks

**Full Data Reload on Every Store Update:**
- Problem: Each store method (addTask, updateProtocol, etc.) reloads entire collection from DB
- Files: `src/stores/scheduleStore.ts` (lines 45-50, 59-67), `src/stores/protocolStore.ts` (lines 48-50, 64-66), `src/stores/mealStore.ts` (lines 42-44, 55-57)
- Cause: No incremental updates; always toArray() after each mutation
- Scaling limit: With 1000+ tasks, each CRUD operation becomes slow
- Improvement path: Update store state directly before/after mutation. Only query specific records. Implement pagination for large datasets.

**Schedule Recalculation on Component Render:**
- Problem: UpNextCard recalculates incompleteTasks, currentTask, nextTask on every render
- Files: `src/components/dashboard/UpNextCard.tsx` (lines 30-47)
- Cause: No useMemo() around derived data
- Scaling limit: 500+ tasks makes dashboard noticeably slower
- Improvement path: Wrap filtering/sorting in useMemo with dependency array. Memoize component itself.

**Notification Scheduler Reschedules on Every Update:**
- Problem: Any task change re-runs scheduleTaskNotifications() which clears all and rebuilds
- Files: `src/App.tsx` (lines 36-40), `src/utils/notificationScheduler.ts` (line 15)
- Cause: No incremental notification updates
- Scaling limit: With 100+ tasks, frequent edits cause UI lag
- Improvement path: Add/remove notifications incrementally. Cache scheduled notification IDs.

**Daily Logs Fetched Once at App Start:**
- Problem: DailyLog query doesn't auto-refresh across day boundaries within the same session
- Files: `src/hooks/useDailyReset.ts` (lines 22-24)
- Cause: Interval check runs every 60 seconds—misses minute-level changes
- Scaling limit: Users active past midnight may see stale data
- Improvement path: Use more frequent checks (10-30s) around midnight. Listen for system time changes.

## Fragile Areas

**ProtocolEditor State Management:**
- Files: `src/components/protocols/ProtocolEditor.tsx`
- Why fragile: 14 separate useState hooks for supplement form. Adding/editing supplements duplicates logic in editSupplement() and resetSupplementForm(). Line 81 dependency array is complex.
- Safe modification: Refactor supplement form state into a single useReducer or custom hook. Reduce useState count.
- Test coverage: No unit tests for timing rule building or cycle pattern handling.

**TaskModal Subtask Handling:**
- Files: `src/components/schedule/TaskModal.tsx` (lines 253-279)
- Why fragile: No drag-to-reorder support but code tracks subtask.order. Removing subtask recalculates order with side effect (line 80). No validation of subtask count limits.
- Safe modification: Make subtask ordering deterministic. Add max subtask limit validation.
- Test coverage: Gap in edge cases (empty subtasks array, removing all subtasks).

**Time Calculation Edge Cases:**
- Files: `src/utils/time.ts`, `src/utils/protocolSync.ts`
- Why fragile: minutesSinceMidnight() splits on ':' without validation. minutesToTime() uses % 24 but doesn't handle negative minutes.
- Safe modification: Add validation in minutesSinceMidnight() for invalid time strings. Handle negative minutes in minutesToTime().
- Test coverage: No unit tests for time utilities.

**Store Error Recovery:**
- Files: All store files (scheduleStore, protocolStore, mealStore, settingsStore)
- Why fragile: Errors caught and logged but state left partially updated. No rollback on failed bulkAdd() in import. Failed operations return -1 but callers may not check.
- Safe modification: Wrap critical operations in try-catch with explicit rollback. Make return types include success flag.
- Test coverage: No error scenario tests.

## Scaling Limits

**IndexedDB Single-Origin Limit:**
- Current capacity: Typically 50-500MB depending on browser
- Limit: Storing 10+ years of daily logs (3650+ records) + thousands of tasks could approach limit
- Scaling path: Implement archival strategy—move old logs to file export. Add data retention settings.

**Notification Scheduler Linear Search:**
- Current capacity: Efficient up to ~500 tasks
- Limit: With 5000+ tasks across 7 days, iterating all tasks daily becomes noticeable
- Scaling path: Index tasks by day. Use binary search for time ranges instead of filter().

**Calendar/Timeline Rendering:**
- Current capacity: Smooth for 50-100 tasks per view
- Limit: Large protocol sets or month views with 1000s of events cause frame drops
- Scaling path: Implement virtual scrolling. Lazy-load weeks/months.

## Dependencies at Risk

**React 19.2.0 - Early Adoption:**
- Risk: React 19 is relatively new. Some third-party libs may lag in compatibility.
- Current usage: Core; no workarounds possible
- Affected: All components
- Migration plan: Monitor ecosystem. Pin to 18.3 if issues arise. No urgent action needed.

**Zustand 5.0.11 - Peer Dependency Updates:**
- Risk: No middleware for logging/debugging store changes. Hard to trace state mutations.
- Current usage: All 4 stores depend on it
- Affected: State management and debugging
- Migration plan: Add zustand logger middleware before upgrading major versions. Consider Redux Toolkit if complex state needed.

**Dexie 4.3.0 - IndexedDB Quirks:**
- Risk: Dexie abstracts IDB but schema migrations require careful version handling. Current code has only v1.
- Current usage: All database operations
- Affected: Any schema changes require careful migration planning
- Migration plan: Document schema version strategy. Test migrations with data. Consider Prisma if schema becomes complex.

## Missing Critical Features

**Data Backup Encryption:**
- Problem: Backups stored as plaintext JSON. No password protection or encryption option.
- Blocks: Sharing backups between devices without exposing data. Compliance with privacy regulations.
- Impact: High (user data at rest security)

**Notification Fallback:**
- Problem: Browser notifications only. No email, SMS, or in-app toast for denied permission.
- Blocks: Users on restricted browsers can't receive any alerts.
- Impact: Medium (usability)

**Task Templates/Recurrence:**
- Problem: Must manually re-enter same task every week. No template or copy-to-next-week feature.
- Blocks: Efficiency for biohacking routines that repeat weekly.
- Impact: Medium (UX friction)

**Meal Plan Meal Time Syncing:**
- Problem: Meal plans and protocols don't share timing. Creates dual maintenance burden.
- Blocks: Unified supplement + meal schedule view.
- Impact: Medium (coherence)

**Offline-First Sync:**
- Problem: No service worker for offline mode. App requires network to load.
- Blocks: Using app on airplane or in areas without connectivity.
- Impact: Low-Medium (PWA incomplete)

## Test Coverage Gaps

**Time Utility Functions:**
- What's not tested: Edge cases in `src/utils/time.ts` (midnight boundary, DST, invalid formats)
- Files: `src/utils/time.ts`
- Risk: Time calculation bugs go undetected until production
- Priority: High

**Protocol Sync Logic:**
- What's not tested: On/off cycle approximation, meal timing fallbacks
- Files: `src/utils/protocolSync.ts`
- Risk: Synced tasks may not reflect user intent
- Priority: High

**Store Error Scenarios:**
- What's not tested: DB failures, bulkAdd rollback, partial update failures
- Files: All store files
- Risk: Data corruption on network/quota errors
- Priority: High

**Component Edge Cases:**
- What's not tested: Empty states (no tasks, no protocols), boundary conditions (23:59 tasks, 1440min durations)
- Files: `src/components/schedule/TaskModal.tsx`, `src/components/protocols/ProtocolEditor.tsx`
- Risk: Crashes or silent failures in edge cases
- Priority: Medium

**JSON Import Validation:**
- What's not tested: Malformed backups, schema mismatches, circular references
- Files: `src/pages/SettingsPage.tsx` (import handler)
- Risk: Invalid data corrupts database
- Priority: High

---

*Concerns audit: 2026-03-13*
