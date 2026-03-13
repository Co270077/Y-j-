---
phase: 04-gesture-interactions-layout
plan: 01
subsystem: ui
tags: [motion, use-gesture, bottom-sheet, toast, drag-to-dismiss, detents]

# Dependency graph
requires:
  - phase: 04-00
    provides: test stubs for BottomSheet and Toast with skip guards
  - phase: 03-ui-primitives-animations
    provides: motion patterns, transitions (snappy/gentle), variants (slideDown)
provides:
  - BottomSheet.tsx with useDrag handle, peek/half/full detents, velocity dismiss, backdrop interpolation
  - Toast with action button variant and countdown bar (showToastWithAction)
affects:
  - 04-02-swipe-delete (uses showToastWithAction for undo)
  - any new modals (use BottomSheet, not Modal)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useDrag from @use-gesture/react on handle bar only (not sheet body) — prevents content scroll conflict"
    - "useMotionValue(y) + animate() for open/close, y.set() during active drag — never animate() during drag"
    - "useTransform for backdrop opacity from sheet y position — declarative interpolation"
    - "Separate toast containers for regular (top-16) and action (bottom-20) toasts"
    - "ToastItem extracted as sub-component to isolate countdown bar useEffect per-toast"

key-files:
  created:
    - src/components/ui/BottomSheet.tsx
  modified:
    - src/components/ui/Modal.tsx (deleted)
    - src/components/schedule/TaskModal.tsx
    - src/components/meals/EatingWindowConfig.tsx
    - src/components/meals/MealTemplateEditor.tsx
    - src/components/protocols/ProtocolEditor.tsx
    - src/utils/toast.ts
    - src/components/ui/Toast.tsx

key-decisions:
  - "BottomSheet keeps identical props to Modal (isOpen, onClose, title, children) plus optional detent — zero-migration for consumers"
  - "Drag-to-dismiss only allowed when content scrollTop === 0 — prevents accidental dismiss during scroll"
  - "backdropOpacity via useTransform rather than AnimatePresence separate fade — stays in sync with sheet y during drag"
  - "Action toasts at bottom-20 (above nav) — regular toasts remain at top-16"
  - "ToastItem as sub-component with its own useEffect for countdown bar — correct requestAnimationFrame timing per toast"

patterns-established:
  - "BottomSheet pattern: useDrag on handle only, useMotionValue for y, animate() on open/close, y.set() during drag"
  - "Toast action pattern: showToastWithAction(text, label, callback, duration=5000)"

requirements-completed: [INTR-04, LAYT-01, INTR-03]

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 4 Plan 01: Gesture-Driven BottomSheet and Toast Actions Summary

**iOS-style drag-to-dismiss bottom sheet with snap detents via @use-gesture/react + useMotionValue, and toast extended with undo action button and countdown indicator**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-13T16:27:00Z
- **Completed:** 2026-03-13T16:35:35Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- BottomSheet.tsx replaces Modal.tsx with drag-to-dismiss (handle bar), peek/half/full detents, velocity-based dismiss (vy > 0.5), and backdrop opacity interpolation tracking sheet position
- All 4 Modal consumers (TaskModal, EatingWindowConfig, MealTemplateEditor, ProtocolEditor) updated to BottomSheet with appropriate detents
- showToastWithAction added to toast.ts with ToastAction interface; Toast renders inline action button + countdown bar; undo toasts positioned above bottom nav

## Task Commits

1. **Task 1: Upgrade Modal to BottomSheet** - `775c7b9` (feat)
2. **Task 2: Extend Toast with undo action button** - `52d9057` (feat)

## Files Created/Modified
- `src/components/ui/BottomSheet.tsx` - Gesture-driven bottom sheet with detents, drag-to-dismiss, backdrop interpolation
- `src/components/ui/Modal.tsx` - Deleted (replaced by BottomSheet)
- `src/components/schedule/TaskModal.tsx` - Updated import + component name, detent="half"
- `src/components/meals/EatingWindowConfig.tsx` - Updated import + component name, detent="half"
- `src/components/meals/MealTemplateEditor.tsx` - Updated import + component name, detent="full"
- `src/components/protocols/ProtocolEditor.tsx` - Updated import + component name, detent="full"
- `src/utils/toast.ts` - Added ToastAction interface, showToastWithAction, updated handler signature
- `src/components/ui/Toast.tsx` - ToastItem sub-component with action button + countdown bar, dual container layout

## Decisions Made
- BottomSheet keeps identical props to Modal — zero refactor needed for all 4 consumers, only import + tag name change
- Drag allowed only when content scrolled to top — prevents accidental dismiss mid-scroll
- Backdrop opacity via useTransform (not separate AnimatePresence fade) — stays in sync with sheet position during drag
- ToastItem extracted as a sub-component so each toast gets its own `useEffect` for the countdown bar `requestAnimationFrame`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- BottomSheet ready for use in any new modal components in Phase 4
- showToastWithAction ready for Plan 02 swipe-to-delete undo flow

---
*Phase: 04-gesture-interactions-layout*
*Completed: 2026-03-13*
