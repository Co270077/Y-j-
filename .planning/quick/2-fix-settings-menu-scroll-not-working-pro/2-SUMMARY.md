---
phase: quick
plan: 2
subsystem: layout
tags: [scroll, viewport, appshell, fix]
dependency_graph:
  requires: []
  provides: [working-scroll-all-pages]
  affects: [SettingsPage, DashboardPage, SchedulePage, ProtocolsPage]
tech_stack:
  added: []
  patterns: [h-screen h-dvh exact-height constraint]
key_files:
  created: []
  modified:
    - src/components/layout/AppShell.tsx
decisions:
  - "h-screen h-dvh (exact height) instead of min-h-screen min-h-dvh — forces flex-1 main to respect bounds and activate overflow-y-auto"
metrics:
  duration: "~2 minutes"
  completed: "2026-03-14T01:56:36Z"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 2: Fix Settings Menu Scroll Not Working Summary

**One-liner:** Replaced `min-h-screen min-h-dvh` with `h-screen h-dvh` on AppShell outer div to constrain flex column to exact viewport height, activating `overflow-y-auto` scroll on all pages.

## What Was Done

Single-line change in `AppShell.tsx` line 34: outer container class changed from `min-h-screen min-h-dvh` to `h-screen h-dvh`.

**Root cause:** `min-h-*` sets a floor but no ceiling. The flex column was growing to fit all content rather than being constrained to the viewport. This meant `overflow-y-auto` on `<main>` never triggered because the parent had infinite room to expand. With `h-screen h-dvh` (exact height = viewport), `<main>` with `flex-1` is bounded and correctly scrolls its overflow.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix AppShell viewport height constraint | 896d403 | src/components/layout/AppShell.tsx |

## Verification

- TypeScript compiles without errors
- AppShell outer div: `h-screen h-dvh` (confirmed)
- main element unchanged: `flex-1 pb-[...] overflow-y-auto overscroll-contain`
- motion div unchanged: `min-h-full`

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/components/layout/AppShell.tsx` modified
- [x] Commit `896d403` exists
- [x] TypeScript passes clean
