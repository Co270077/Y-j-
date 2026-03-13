---
phase: 02-navigation
plan: 01
subsystem: ui
tags: [motion, react-router, animation, navigation, context]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: fadeIn/variants pattern, motion infrastructure, AnimatePresence AppShell
provides:
  - NavigationContext with direction ref and navigateTo helper
  - slideRight and slideLeft variants for drill-down navigation
  - Direction-aware AppShell selecting variants at render time
  - layoutId pill indicator in BottomNav that slides between tabs
affects: [03-data, 04-interactions, phase-4-drill-down]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - NavigationContext using useRef for direction (not state) to avoid re-renders
    - direction.current read synchronously at render time for variant selection
    - layoutId="active-tab-indicator" for automatic Motion layout animation between tab switches
    - navigateTo(path, direction) sets ref then calls navigate — direction is always fresh at next render

key-files:
  created:
    - src/contexts/NavigationContext.tsx
    - src/__tests__/NavigationContext.test.tsx
    - src/__tests__/BottomNav.test.tsx
  modified:
    - src/motion/variants.ts
    - src/App.tsx
    - src/components/layout/AppShell.tsx
    - src/components/layout/BottomNav.tsx

key-decisions:
  - "Use useRef not useState for NavDirection — state causes unnecessary re-renders, ref read synchronously at render time"
  - "Exit offset 30% not 100% for slide variants — matches iOS feel where exiting page slides partially while entering slides fully"
  - "Skip scroll-to-top for /schedule and drill-down directions (forward/back) — schedule handles own scroll, drill-down shouldn't reset"
  - "layoutId pill is inset-x-1 inset-y-1 rounded-xl bg-bamboo/15 — rounded rect behind icon+label, not a 2px top bar"
  - "overflow-hidden on AppShell root div prevents horizontal scrollbar during slide transitions"

patterns-established:
  - "NavigationContext pattern: useRef direction + navigateTo replaces raw useNavigate for direction-aware navigation"
  - "Variant selection at render: compute pageVariants inline from direction.current, pass to m.div variants prop"
  - "BottomNav pill: m.div with layoutId inside conditional isActive block, icon/label as relative z-10 spans"

requirements-completed: [NAV-01, NAV-04]

# Metrics
duration: 15min
completed: 2026-03-13
---

# Phase 2 Plan 01: Navigation Transitions Summary

**Direction-aware cross-fade tab transitions and animated layoutId pill indicator via NavigationContext useRef pattern**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-13T11:10:00Z
- **Completed:** 2026-03-13T11:25:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- NavigationContext provides direction ref (tab/forward/back) and navigateTo helper — consumed by AppShell and BottomNav
- AppShell selects fadeIn/slideRight/slideLeft variants at render time based on direction.current
- BottomNav uses layoutId="active-tab-indicator" pill that Motion automatically animates between tab switches
- slideRight and slideLeft variants added to variants.ts with 30% exit offset for iOS-style feel
- All 6 vitest tests pass (3 NavigationContext + 3 BottomNav), build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Add slide variants and create NavigationContext** - `fd6dd92` (feat)
2. **Task 2: Wire NavigationProvider, direction-aware AppShell, layoutId pill BottomNav** - `a946abf` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/contexts/NavigationContext.tsx` - Direction ref context, NavigationProvider, useNavigation hook
- `src/motion/variants.ts` - Added slideRight and slideLeft variants
- `src/App.tsx` - Wrapped Routes in NavigationProvider inside BrowserRouter
- `src/components/layout/AppShell.tsx` - Direction-aware variant selection, scroll-to-top guard, overflow-hidden
- `src/components/layout/BottomNav.tsx` - layoutId pill with m.div, navigateTo replacing navigate
- `src/__tests__/NavigationContext.test.tsx` - 3 tests: default direction, navigateTo update, throw outside provider
- `src/__tests__/BottomNav.test.tsx` - 3 tests: pill renders on active tab, click updates active, all 4 tabs present

## Decisions Made
- useRef not useState for NavDirection — state would cause re-renders on every navigation; ref is read synchronously at render time
- 30% exit offset on slide variants (not 100%) — matches iOS navigation feel
- Skip scroll-to-top for /schedule route and drill-down directions (forward/back)
- layoutId pill as rounded rectangle (inset-x-1 inset-y-1) behind icon+label, not a 2px top bar

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test assertion using unavailable jest-dom matcher**
- **Found during:** Task 2 (BottomNav test writing)
- **Issue:** `toHaveAttribute` requires `@testing-library/jest-dom` which is not installed; used `.getAttribute()` instead
- **Fix:** Replaced `expect(el).toHaveAttribute('attr', 'val')` with `expect(el.getAttribute('attr')).toBe('val')`
- **Files modified:** src/__tests__/BottomNav.test.tsx
- **Verification:** All 3 BottomNav tests pass
- **Committed in:** a946abf (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Necessary correctness fix — test framework difference from assumption. No scope creep.

## Issues Encountered
- No `@testing-library/jest-dom` installed; jest-dom matchers unavailable. Used native DOM API `.getAttribute()` for aria-current assertion.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- NavigationContext and slide variants are wired and ready for Phase 4 drill-down to use `navigateTo(path, 'forward')` and `navigateTo(path, 'back')`
- Tab cross-fade and pill indicator complete for NAV-01 and NAV-04
- Ready for Plan 02-02 (next navigation plan)

---
*Phase: 02-navigation*
*Completed: 2026-03-13*
