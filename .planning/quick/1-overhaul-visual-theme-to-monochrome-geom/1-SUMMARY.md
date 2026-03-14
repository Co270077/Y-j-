---
phase: quick
plan: 1
subsystem: design-system
tags: [theme, css, monochrome, brutalist, geometric]
dependency_graph:
  requires: []
  provides: [monochrome-design-system, geometric-css-patterns]
  affects: [all-components, dashboard, schedule, protocols, meals, settings]
tech_stack:
  added: []
  patterns: [monochrome-palette, geometric-border-radius, css-custom-properties, tailwind-backward-compat-aliases]
key_files:
  created: []
  modified:
    - src/index.css
    - src/components/ui/Card.tsx
    - src/components/ui/FAB.tsx
    - src/components/ui/ProgressRing.tsx
    - src/components/ui/Button.tsx
    - src/components/ui/Input.tsx
    - src/components/ui/Toggle.tsx
    - src/components/ui/BottomSheet.tsx
    - src/components/ui/ConfirmDialog.tsx
    - src/components/ui/SwipeActionRow.tsx
    - src/components/ui/Toast.tsx
    - src/components/layout/BottomNav.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/AppShell.tsx
    - src/components/dashboard/DashboardGrid.tsx
    - src/components/dashboard/StreakCard.tsx
    - src/components/dashboard/UpNextCard.tsx
    - src/components/dashboard/MealCard.tsx
    - src/components/dashboard/WeeklyAdherenceCard.tsx
    - src/components/dashboard/TimelinePeek.tsx
    - src/components/schedule/TaskModal.tsx
    - src/components/schedule/TaskBlock.tsx
    - src/components/schedule/Timeline.tsx
    - src/components/schedule/SubtaskList.tsx
    - src/components/schedule/DaySwitcher.tsx
    - src/components/schedule/TaskFilter.tsx
    - src/components/protocols/ProtocolList.tsx
    - src/components/protocols/ProtocolEditor.tsx
    - src/components/meals/MealTemplateEditor.tsx
    - src/components/meals/EatingWindowConfig.tsx
    - src/components/meals/MacroSummary.tsx
    - src/pages/DashboardPage.tsx
    - src/pages/SchedulePage.tsx
    - src/pages/ProtocolsPage.tsx
    - src/pages/MealsPage.tsx
decisions:
  - "Backward-compat CSS aliases added (charcoal, bamboo, warm-white etc) so old Tailwind classes keep resolving without mass-renaming across codebase"
  - "category color tokens (cat-supplement, cat-meal etc) now map to gray shades — no class changes needed in components"
  - "SwipeActionRow reveals use gray-700 (complete) and gray-500 (delete) instead of green/red"
  - "Toggle knob changed from rounded-full to rounded-sm with black bg for geometric consistency"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-14"
  tasks: 2
  files_modified: 35
---

# Quick Task 1: Monochrome Geometric / Cyber-Brutalist Theme Overhaul

Complete visual theme transformation from warm Japanese (和風) aesthetic to stark monochrome geometric / cyber-brutalist design — true black backgrounds, white/gray palette, sharp edges, geometric borders.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Rewrite design system tokens and global styles in index.css | 0c1f698 |
| 2 | Update all 35 components to monochrome geometric styling | 0793c84 |

## What Was Built

**Design system (index.css):**
- True black (#000000) app background, #111111 raised surfaces, #1A1A1A overlays
- Full monochrome text scale: white → #A1A1AA → #888888
- Border tokens: #333333 / #222222
- Category colors mapped to gray shades (white → #E5E5E5 → #CCCCCC → #999999 → #B3B3B3)
- Status colors desaturated: success=white, warning=#A1A1AA, danger=#888888
- Backward-compat aliases for all old token names (bamboo, charcoal, warm-white, stone, ink)
- Border radius minimized: 4/6/8/8px (was 6/10/16/24px)
- Typography: Inter + Space Grotesk geometric sans-serif stack
- Geometric pattern classes: `.geo-pattern-grid`, `.geo-pattern-dots`, `.geo-pattern-diagonal`

**Key component changes:**
- **FAB**: solid white bg + black icon + rounded-lg (not circular)
- **BottomNav**: black bg, white active text, sharp `bg-white/10` geometric indicator (no rounded pill)
- **ProgressRing**: white arc on gray-800 track (replaces green on charcoal)
- **Button primary**: bg-white text-black (replaces bamboo green)
- **Toggle**: white active track + black square knob (geometric, replaces green + white circle)
- **Cards**: border-gray-700, rounded-md 6px, no shadows
- **SwipeActionRow**: gray-700 complete reveal, gray-500 delete reveal
- **Toast**: surface-raised with gray-700 border (no colored backgrounds)
- **DashboardGrid**: geo-pattern-grid applied for subtle texture

## Deviations from Plan

None - plan executed exactly as written. All specified changes applied; build passes clean.

## Self-Check

### Created Files
- `.planning/quick/1-overhaul-visual-theme-to-monochrome-geom/1-SUMMARY.md` — this file

### Commits Verified
- 0c1f698 — feat(quick-1): rewrite design system to monochrome geometric palette
- 0793c84 — feat(quick-1): update all components to monochrome geometric styling

## Self-Check: PASSED
