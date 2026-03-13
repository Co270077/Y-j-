---
phase: 04-gesture-interactions-layout
plan: 03
subsystem: ui
tags: [motion, react, swipe, accordion, AnimatePresence, undo-toast, gestures]

# Dependency graph
requires:
  - phase: 04-gesture-interactions-layout/04-01
    provides: BottomSheet with drag-to-dismiss, Toast with action (showToastWithAction)
  - phase: 04-gesture-interactions-layout/04-02
    provides: SwipeActionRow component with useSwipeAction hook

provides:
  - Swipe-right-to-complete on schedule tasks (TaskBlock wraps in SwipeActionRow)
  - Swipe-left-to-delete with 5s undo toast on schedule tasks, protocols, and meal templates
  - Accordion inline expansion for protocol cards (AnimatePresence height:auto)
  - Accordion inline expansion for meal template cards (AnimatePresence height:auto)
  - Only one item expanded at a time per list (accordion pattern)

affects: [all pages using TaskBlock, ProtocolList, MealsPage]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Undo-delete pattern: pendingDelete ref + hiddenIds Set + 5s setTimeout + showToastWithAction
    - Accordion expansion: expandedId state + AnimatePresence initial={false} height:auto with snappy transition
    - SwipeActionRow integration: wrap list items, onComplete only when not complete, onDelete always

key-files:
  created: []
  modified:
    - src/components/schedule/TaskBlock.tsx
    - src/components/schedule/Timeline.tsx
    - src/pages/SchedulePage.tsx
    - src/components/protocols/ProtocolList.tsx
    - src/pages/ProtocolsPage.tsx
    - src/pages/MealsPage.tsx
    - src/hooks/useSwipe.ts
    - src/__tests__/ProtocolList.test.tsx

key-decisions:
  - "onComplete={isComplete ? undefined : onToggleComplete} — SwipeActionRow only shows green reveal when onComplete provided, preventing right-swipe on completed tasks"
  - "pendingDelete stored in useRef (not useState) — avoids re-renders during timer lifecycle, commit on unmount via useEffect cleanup"
  - "hiddenIds soft-delete pattern — task disappears immediately, undo restores without re-fetch, commit fires on timer expiry or navigation"
  - "Remove useSwipe from SchedulePage entirely — page-level swipe conflicts with item-level SwipeActionRow gestures, DaySwitcher buttons replace it"
  - "Accordion expandedId in ProtocolList component state — single source of truth for one-at-a-time expansion"
  - "MealsPage editor onDelete triggers handleSwipeDeleteTemplate — reuses undo flow instead of ConfirmDialog, consistent UX"

patterns-established:
  - "Undo-delete: pendingDelete ref + hiddenIds Set + 5s timer + showToastWithAction on all list pages"
  - "Accordion: expandedId state + AnimatePresence initial={false} + height:0/auto + overflow:hidden"

requirements-completed: [INTR-02, INTR-03, LAYT-02]

# Metrics
duration: 12min
completed: 2026-03-13
---

# Phase 4 Plan 03: Integration — Swipe Actions and Accordion Expansion Summary

**SwipeActionRow wired into all list items with 5-second undo-delete, AnimatePresence accordion on protocol and meal template cards**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-13T16:30:00Z
- **Completed:** 2026-03-13T16:42:48Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 8

## Accomplishments
- Schedule tasks wrapped in SwipeActionRow: swipe right completes (disabled when already done), swipe left triggers undo-delete flow
- ProtocolList and MealsPage accordion expansion: AnimatePresence height:auto, one expanded at a time, Edit button inside expanded view calls onSelect
- Undo-delete pattern implemented on all three pages with 5s countdown toast, pendingDelete ref, hiddenIds Set soft-delete
- useSwipe removed from SchedulePage (conflicts with item swipes), replaced by DaySwitcher-only day navigation
- 10 ProtocolList tests pass including 4 new accordion behavior tests

## Task Commits

1. **Task 1: Wire swipe-to-complete and swipe-to-delete into schedule tasks** - `c3f97b1` (feat)
2. **Task 2: Add accordion expansion to ProtocolList and MealsPage with swipe-delete** - `71d74df` (feat)
3. **Task 3: Verify all gesture interactions** - auto-approved (77/77 tests pass)

## Files Created/Modified
- `src/components/schedule/TaskBlock.tsx` - Added onDelete prop, wraps content in SwipeActionRow
- `src/components/schedule/Timeline.tsx` - Passes onDeleteTask prop to TaskBlock
- `src/pages/SchedulePage.tsx` - Undo-delete flow, removes useSwipe, hiddenTaskIds soft-delete
- `src/components/protocols/ProtocolList.tsx` - Accordion expandedId, AnimatePresence, SwipeActionRow wrap
- `src/pages/ProtocolsPage.tsx` - Undo-delete flow for protocol swipe-delete
- `src/pages/MealsPage.tsx` - Accordion for meal templates, SwipeActionRow, undo-delete flow
- `src/hooks/useSwipe.ts` - Added @deprecated JSDoc comment
- `src/__tests__/ProtocolList.test.tsx` - Added accordion tests, updated onSelect test for new expansion pattern

## Decisions Made
- `onComplete={isComplete ? undefined : onToggleComplete}` — SwipeActionRow only shows green reveal when onComplete provided, so completed tasks cannot be right-swiped to "re-complete"
- `pendingDelete` stored as `useRef` (not state) — avoids render cycles during the 5s timer, commit on unmount via useEffect cleanup
- Page-level `useSwipe` removed from SchedulePage — it conflicts with item-level drag gestures from `@use-gesture/react` inside SwipeActionRow; DaySwitcher buttons are the only day navigation now
- MealsPage `onDelete` for the editor modal reuses `handleSwipeDeleteTemplate` instead of a ConfirmDialog — consistent undo UX pattern across the app

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added onDeleteTask prop to Timeline component**
- **Found during:** Task 1 (SchedulePage wiring)
- **Issue:** Plan specified wiring in SchedulePage/TaskBlock but Timeline sits between them and needed a pass-through prop
- **Fix:** Added optional `onDeleteTask?: (taskId: number) => void` to TimelineProps and threaded it to TaskBlock
- **Files modified:** src/components/schedule/Timeline.tsx
- **Verification:** TypeScript clean, onDelete flows from SchedulePage → Timeline → TaskBlock → SwipeActionRow
- **Committed in:** c3f97b1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing prop pass-through)
**Impact on plan:** Necessary intermediary step, zero scope creep.

## Issues Encountered
None — plan executed cleanly with one small pass-through addition.

## Next Phase Readiness
- All Phase 4 gesture interactions complete: swipe-to-complete, swipe-to-delete with undo, accordion expansion, bottom sheet, drag-to-dismiss
- Requirements INTR-02, INTR-03, LAYT-02 fulfilled
- App is ready for Phase 5 (if planned) or final polish pass

---
*Phase: 04-gesture-interactions-layout*
*Completed: 2026-03-13*
