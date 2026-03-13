---
phase: 03-ui-primitives-animations
plan: "03"
subsystem: ui-animation
tags: [stagger, count-up, skeleton, dashboard, timeline, protocols, meals]
dependency_graph:
  requires:
    - "03-01 (variants.ts, transitions.ts)"
    - "03-02 (useCountUp.ts, Skeleton.tsx)"
  provides:
    - "Animated list views on all 5 pages"
    - "Count-up stats on Dashboard and Meals"
    - "Skeleton loading state on Dashboard"
  affects:
    - "src/components/dashboard/*"
    - "src/components/schedule/Timeline.tsx"
    - "src/components/protocols/ProtocolList.tsx"
    - "src/pages/MealsPage.tsx"
    - "src/components/meals/MacroSummary.tsx"
tech_stack:
  added: []
  patterns:
    - "listStagger inline variant (staggerChildren: 0.05) defined per-component"
    - "gridStagger inline variant (staggerChildren: 0.06, delayChildren: 0.1) for dashboard"
    - "First 10 items animated with slideUp/scaleIn, rest render immediately"
    - "AnimatePresence mode=wait for skeleton->content swap with distinct keys"
    - "useCountUp on all numeric stats: progress%, completed, remaining, macros"
    - "Animated macro bars via m.div animate.width with snappy transition"
key_files:
  created: []
  modified:
    - src/components/schedule/Timeline.tsx
    - src/components/protocols/ProtocolList.tsx
    - src/pages/MealsPage.tsx
    - src/components/dashboard/DashboardGrid.tsx
    - src/components/dashboard/ProgressCard.tsx
    - src/components/dashboard/StreakCard.tsx
    - src/components/meals/MacroSummary.tsx
    - src/__tests__/Timeline.test.tsx
    - src/__tests__/ProtocolList.test.tsx
decisions:
  - "MealCard and WeeklyAdherenceCard display text/time strings not raw stats — no useCountUp applied"
  - "StreakCard: when remaining===0 renders literal '0' (not animated) since all-done state shows 'text-bamboo' — useCountUp still hooks but display is conditionally literal for color correctness"
  - "MealsPage: page-level cards (Eating Window, Daily Totals, Meal Templates section) stagger as children of outer listStagger; templates list has its own nested listStagger"
  - "DashboardGrid isLoaded derived from: tasks.length > 0 || protocols.length > 0 || settings !== null"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_modified: 9
---

# Phase 3 Plan 3: Stagger Cascades, Count-Up Stats, and Skeleton Loading Summary

**One-liner:** Wired motion primitives into all 5 pages — lists cascade with 50ms stagger, dashboard/meal numbers count up via spring, dashboard shimmers with skeleton before store data hydrates.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Stagger cascades to Timeline, ProtocolList, MealsPage | 6acb3c3 | Timeline.tsx, ProtocolList.tsx, MealsPage.tsx, 2 tests |
| 2 | Dashboard stagger, count-up stats, skeleton loading | 17b1a33 | DashboardGrid.tsx, ProgressCard.tsx, StreakCard.tsx, MacroSummary.tsx |

## What Was Built

### Task 1: List Stagger Cascades

**Timeline.tsx:** Outer `div` converted to `m.div` with `listStagger` variant (`staggerChildren: 0.05`). First 10 task items wrapped in `m.div variants={slideUp}`, items 11+ render as plain `div`. Ref for scroll target and bamboo accent class preserved on wrapper.

**ProtocolList.tsx:** Outer `div` converted to `m.div` with `listStagger`. First 10 protocol cards wrapped in `m.div variants={slideUp}` outer shells (Card key moved inside). Items 11+ render as plain `div`.

**MealsPage.tsx:** Page-level outer container converted to `m.div listStagger`. Eating Window Card, Daily Totals Card, and Meal Templates section each wrapped in `m.div variants={slideUp}` as stagger children. Templates list itself gets a nested `m.div listStagger` with each template card wrapped in `m.div variants={slideUp}` (first 10 only).

**Tests:** Unskipped `test.skip` stagger tests in both Timeline.test.tsx and ProtocolList.test.tsx — rewrote them with meaningful assertions verifying items render inside wrapper.

### Task 2: Dashboard Stagger, Count-Up, Skeleton

**ProgressCard.tsx:** `useCountUp(progress)` drives the `{progress}%` display inside ProgressRing. `useCountUp(completed)` drives the `{completed}/{total}` counter.

**StreakCard.tsx:** `useCountUp(remaining)` drives the remaining tasks count. Special case: when `remaining===0 && total > 0`, literal `'0'` still rendered (color switch to `text-bamboo`).

**MacroSummary.tsx:** All 4 macro values (cal, protein, carbs, fat) use `useCountUp`. Macro bar segments converted from `div style={{ width }}` with `transition-all` class to `m.div animate={{ width: '${pct}%' }} transition={snappy}` — Motion fully owns the bar width animation.

**DashboardGrid.tsx:** Added `AnimatePresence mode="wait"` wrapping three states:
1. `key="skeleton"` — shown when `!isLoaded`, renders `Skeleton variant="card"` shimmer grid
2. `key="welcome"` — shown when `isLoaded && isEmpty`, renders WelcomeCard
3. `key="content"` — shown when `isLoaded && !isEmpty`, renders full dashboard with `gridStagger` (`staggerChildren: 0.06, delayChildren: 0.1`) on the grid, each card wrapped in `m.div variants={scaleIn}`

## Deviations from Plan

None — plan executed exactly as written.

## Verification

Full test suite: 68/68 passed across 11 test files.

Success criteria met:
- [x] All 4 list views (Timeline, ProtocolList, MealsPage templates, DashboardGrid) have stagger parent variants
- [x] First 10 items animate, items beyond 10 render immediately
- [x] Dashboard uses scaleIn, other lists use slideUp
- [x] ProgressCard, StreakCard, MacroSummary display useCountUp-driven numbers
- [x] DashboardGrid shows skeleton when stores haven't hydrated
- [x] AnimatePresence swaps skeleton to content with fadeIn
- [x] Stagger only fires on mount (route entry), not on data updates
- [x] Full test suite passes

## Self-Check: PASSED

Files verified:
- src/components/schedule/Timeline.tsx — FOUND
- src/components/protocols/ProtocolList.tsx — FOUND
- src/pages/MealsPage.tsx — FOUND
- src/components/dashboard/DashboardGrid.tsx — FOUND
- src/components/dashboard/ProgressCard.tsx — FOUND
- src/components/dashboard/StreakCard.tsx — FOUND
- src/components/meals/MacroSummary.tsx — FOUND

Commits verified:
- 6acb3c3 — FOUND (feat(03-03): add stagger cascades)
- 17b1a33 — FOUND (feat(03-03): dashboard stagger, count-up stats)
