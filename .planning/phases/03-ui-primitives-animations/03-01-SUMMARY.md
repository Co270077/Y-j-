---
phase: 03-ui-primitives-animations
plan: "01"
subsystem: ui-primitives
tags: [motion, spring-physics, tap-feedback, INTR-01, INTR-05]
dependency_graph:
  requires: [src/motion/transitions.ts, src/motion/variants.ts]
  provides: [Button.tsx m.button, Toggle.tsx m.button+m.span, Card.tsx m.div, SubtaskList.tsx m.button, TaskBlock.tsx m.button]
  affects: [all pages using Button/Toggle/Card/SubtaskList/TaskBlock]
tech_stack:
  added: []
  patterns: [m.button whileTap inline, m.span animate x for knob, m.div completePulse on done, Motion animate for color transitions]
key_files:
  created: [src/__tests__/Button.test.tsx, src/__tests__/Toggle.test.tsx, src/__tests__/SubtaskList.test.tsx]
  modified: [src/components/ui/Button.tsx, src/components/ui/Toggle.tsx, src/components/ui/Card.tsx, src/components/schedule/SubtaskList.tsx, src/components/schedule/TaskBlock.tsx]
decisions:
  - "whileTap inline object (not spread from tap variant) — consistent with FAB pattern, cleaner TypeScript"
  - "Toggle knob position via animate={x} not CSS translate classes — Motion fully owns transform"
  - "Toggle bg color via animate={backgroundColor} not CSS conditional classes — Motion fully owns color on this element"
  - "Card: m.div only when onClick present, plain div otherwise — no Motion overhead for static cards"
  - "SubtaskList checkbox pulse via animate={scale:[1,1.08,1]} — completePulse pattern without importing variant"
metrics:
  duration: "2m 26s"
  completed: "2026-03-13"
  tasks_completed: 2
  files_modified: 8
---

# Phase 3 Plan 01: UI Primitives Motion Migration Summary

All interactive UI primitives migrated from CSS transitions to Motion spring-physics tap feedback using `m.button`/`m.div` with `whileTap` and `snappy` spring config.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Migrate Button, Toggle, Card to Motion | d1834d7 | Button.tsx, Toggle.tsx, Card.tsx, Button.test.tsx, Toggle.test.tsx, SubtaskList.test.tsx |
| 2 | Migrate SubtaskList and TaskBlock complete button | c0067ee | SubtaskList.tsx, TaskBlock.tsx |

## What Was Built

**Button.tsx:** `<button>` replaced with `<m.button whileTap={{ scale: 0.97, transition: snappy }}>`. Disabled guard prevents whileTap on disabled buttons. `transition-colors` kept (Motion doesn't own color on Button). `forwardRef<HTMLButtonElement>` works directly on `m.button`.

**Toggle.tsx:** Track `<button>` -> `<m.button>` with `animate={{ backgroundColor }}` (Motion-driven color, removed conditional `bg-*` classes and `transition-colors`). Knob `<span>` -> `<m.span animate={{ x: checked ? 20 : 0 }}>` (spring-driven position, removed `transition-transform` and `translate-x-*` classes). `whileTap={{ scale: 0.97 }}` on track.

**Card.tsx:** Clickable cards use `<m.div whileTap={{ scale: 0.98 }}>`. Static cards use plain `<div>`. Removed `active:scale-[0.98] transition-transform`.

**SubtaskList.tsx:** Each subtask `<button>` -> `<m.button whileTap={{ scale: 0.97 }}>`. Removed `transition-colors`. Checkbox `<div>` -> `<m.div animate={isDone ? { scale: [1,1.08,1] } : { scale: 1 }}>` for completePulse effect. Removed `transition-all`.

**TaskBlock.tsx:** Complete circle button: removed `active:scale-90 transition-all`, added `<m.button whileTap={{ scale: 0.9 }}>` (0.9 matches previous active:scale-90 feel). Edit and Duplicate buttons: `<button>` -> `<m.button whileTap={{ scale: 0.97 }}>`.

## Test Results

64 tests passing, 1 skipped (pre-existing ProtocolList stagger test, unrelated to this plan). All INTR-01 migration assertions unskipped and passing.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- src/components/ui/Button.tsx: FOUND
- src/components/ui/Toggle.tsx: FOUND
- src/components/ui/Card.tsx: FOUND
- src/components/schedule/SubtaskList.tsx: FOUND
- src/components/schedule/TaskBlock.tsx: FOUND
- Commit d1834d7: FOUND
- Commit c0067ee: FOUND
