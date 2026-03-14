---
phase: quick
plan: 3
subsystem: ui
tags: [react, cleanup, navigation, routing]

requires: []
provides:
  - Protocols section fully removed from app (route, tab, dashboard card, store, files)
affects: [dashboard, navigation, settings]

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/layout/BottomNav.tsx
    - src/components/dashboard/DashboardGrid.tsx
    - src/components/dashboard/WelcomeCard.tsx
    - src/pages/SettingsPage.tsx

key-decisions:
  - "Keep db.protocols table in database.ts — removing Dexie schema requires version migration; dormant table is harmless"

patterns-established: []

requirements-completed: [QUICK-3]

duration: 5min
completed: 2026-03-13
---

# Quick Task 3: Remove Protocols Section Summary

**Deleted 7 protocol files, removed /protocols route, Protocols nav tab, ProtocolCard from dashboard, and all protocolStore references from dashboard and settings**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2
- **Files modified:** 5
- **Files deleted:** 7

## Accomplishments

- Removed 7 protocol-specific files (page, components, store, util, test)
- Bottom nav reduced from 4 tabs to 3 (Dashboard, Schedule, Meals)
- /protocols route removed; navigating there redirects to /
- ProtocolCard removed from DashboardGrid; isEmpty/isLoaded logic simplified
- WelcomeCard "Set up protocol" button removed
- SettingsPage: no more protocolStore usage, protocol count removed from data summary, protocol data excluded from export/import/clear operations

## Task Commits

1. **Task 1: Delete protocol files and remove route/nav/store references** - `0f1cf5a` (feat)
2. **Task 2: Clean up dashboard and settings protocol references** - `4c3956b` (feat)

## Files Created/Modified

- `src/App.tsx` - Removed ProtocolsPage lazy import, protocolStore import, loadProtocols call, /protocols route
- `src/components/layout/BottomNav.tsx` - Removed Protocols tab entry and ProtocolIcon function
- `src/components/dashboard/DashboardGrid.tsx` - Removed ProtocolCard, protocolStore import, updated isEmpty/isLoaded
- `src/components/dashboard/WelcomeCard.tsx` - Removed "Set up protocol" button
- `src/pages/SettingsPage.tsx` - Removed protocolStore, protocol count, protocol data from export/import/clear

**Deleted:**
- `src/pages/ProtocolsPage.tsx`
- `src/components/protocols/ProtocolList.tsx`
- `src/components/protocols/ProtocolEditor.tsx`
- `src/components/dashboard/ProtocolCard.tsx`
- `src/stores/protocolStore.ts`
- `src/utils/protocolSync.ts`
- `src/__tests__/ProtocolList.test.tsx`

## Decisions Made

- Left `db.protocols` table definition in `database.ts` and `Protocol` type in `types.ts` — removing a Dexie table requires a schema version bump; the dormant table causes no issues.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Self-Check: PASSED

- All 7 protocol files deleted: confirmed via `git rm`
- Commits exist: `0f1cf5a`, `4c3956b`
- `npx tsc --noEmit` passes with no errors
- `npx vite build` completes successfully
- `grep -r "protocolStore|ProtocolCard..."` returns empty (excluding db/types and db/database)

---
*Phase: quick*
*Completed: 2026-03-13*
