---
phase: 02-navigation
plan: 02
subsystem: ui
tags: [motion, react, floating-action-button, scroll, timeline, tailwind]

requires:
  - phase: 02-navigation
    plan: 01
    provides: Motion variants (scaleIn, tap), hapticLight utility, NavigationContext, vitest setup

provides:
  - FAB.tsx reusable floating action button component with Motion animation
  - FABs on Schedule, Meals, Protocols pages triggering existing add flows
  - Timeline auto-scroll to current/next time block on route navigation
  - Bamboo left-border accent (3px) on scroll target task

affects: [03-data, 04-interactions]

tech-stack:
  added: []
  patterns:
    - "FAB pattern: motion/react-m button with scaleIn variant + whileTap inline for type safety"
    - "fixed bottom-[calc(4rem+16px+env(safe-area-inset-bottom,0px))] for thumb-zone positioning"
    - "Timeline scroll trigger: useEffect on [location.pathname, day] with 80ms delay"
    - "Scroll target logic: current > next upcoming > last (late night fallback)"

key-files:
  created:
    - src/components/ui/FAB.tsx
    - src/__tests__/FAB.test.tsx
    - src/__tests__/Timeline.test.tsx
  modified:
    - src/pages/SchedulePage.tsx
    - src/pages/MealsPage.tsx
    - src/pages/ProtocolsPage.tsx
    - src/components/schedule/Timeline.tsx

key-decisions:
  - "Use whileTap inline ({ scale: 0.97 }) instead of tap.whileTap spread — tap variant key is a prop not a state, TypeScript cleaner this way"
  - "Timeline tests: walk DOM ancestors to find border-bamboo class rather than querySelector on textContent (motion elements render as buttons, textContent empty on wrapper)"

patterns-established:
  - "FAB: import from ../components/ui/FAB, onClick triggers existing handler, keep Header rightAction as secondary access"
  - "Timeline scroll: scrollTargetRef replaces currentTimeRef, accent class on wrapper div"

requirements-completed: [NAV-02, NAV-03]

duration: 4min
completed: 2026-03-13
---

# Phase 02 Plan 02: FAB and Timeline Auto-Scroll Summary

**Floating action buttons on 3 action pages + Timeline smart auto-scroll with bamboo left-border accent on current/next time block**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T15:15:09Z
- **Completed:** 2026-03-13T15:18:56Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- FAB.tsx component with Motion scaleIn animation, haptic feedback, and safe-area-aware positioning
- FABs wired to existing add flows on Schedule, Meals, and Protocols (absent from Dashboard and Settings)
- Timeline auto-scrolls to current/next block on route navigation (not just day change) with 80ms debounce
- Bamboo 3px left-border accent visually anchors the scroll target task

## Task Commits

1. **Task 1: Create FAB component and add to Schedule, Meals, Protocols pages** - `00a4b64` (feat)
2. **Task 2: Enhance Timeline auto-scroll with route trigger and current-block accent** - `d572103` (feat)

## Files Created/Modified

- `src/components/ui/FAB.tsx` - Reusable FAB with Motion animation, haptics, safe-area positioning
- `src/pages/SchedulePage.tsx` - FAB added, triggers handleNewTask
- `src/pages/MealsPage.tsx` - FAB added, triggers template editor
- `src/pages/ProtocolsPage.tsx` - FAB added, triggers protocol editor
- `src/components/schedule/Timeline.tsx` - Route-triggered scroll, bamboo accent, smart target logic
- `src/__tests__/FAB.test.tsx` - 3 tests: aria-label, onClick, fixed positioning
- `src/__tests__/Timeline.test.tsx` - 4 tests: current block, next upcoming, late night, border classes

## Decisions Made

- Used `whileTap={{ scale: 0.97, transition: snappy }}` inline rather than `tap.whileTap` spread — the `tap` export uses a non-standard key (`whileTap`) that isn't a real Variants state, inline is cleaner for TypeScript.
- Timeline tests walk DOM ancestors to find `border-bamboo` class — motion elements render as plain HTML in jsdom, so `querySelector('[class*="border-bamboo"]').textContent` was empty on the wrapper. Ancestor traversal from `screen.queryByText()` is reliable.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `toBeInTheDocument()` from `@testing-library/jest-dom` not installed — used `.toBeTruthy()` pattern consistent with existing test files (BottomNav.test.tsx).
- FAB test initially used `toBeInTheDocument` which failed; fixed to `toBeTruthy()` inline (Rule 1 auto-fix, same commit).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FAB and Timeline enhancements complete; NAV-02 and NAV-03 satisfied
- Phase 03 data features can proceed; no blockers from this plan

---
*Phase: 02-navigation*
*Completed: 2026-03-13*
