# 時間の流れ — Mobile UX Overhaul

## What This Is

A full UX redesign of the 時間の流れ biohacking PWA — a personal health tracking app for scheduling tasks, managing supplement protocols, logging meals, and viewing daily progress. This milestone transforms the existing functional app into a zero-friction, beautifully animated mobile experience with clean minimal aesthetics.

## Core Value

Every interaction feels effortless — users can manage their daily health routine without ever thinking about the UI.

## Requirements

### Validated

- ✓ Task scheduling with time-based organization — existing
- ✓ Supplement protocol management with timing rules — existing
- ✓ Meal logging with macro tracking — existing
- ✓ Dashboard with daily progress overview — existing
- ✓ Settings with backup/restore and notification preferences — existing
- ✓ Offline-first data persistence via IndexedDB — existing
- ✓ PWA installable with service worker — existing

### Active

- [ ] Redesigned navigation that minimizes taps across all workflows
- [ ] Optimized information density — right amount of info at each level
- [ ] Smooth page transitions (slides, fades, shared elements)
- [ ] Micro-interactions on all interactive elements (buttons, checkboxes, toggles)
- [ ] Animated data visualizations (charts animate in, progress fills, counters tick)
- [ ] Gesture-driven interactions (swipe to complete, drag to reorder, pull to refresh)
- [ ] Clean minimal visual design (whitespace, sharp typography, subtle shadows)
- [ ] Reduced friction for task/meal creation flows
- [ ] Inline detail viewing without full-page drilldowns where possible
- [ ] Streamlined context switching between schedule, meals, and protocols

### Out of Scope

- New features or functionality — this is purely UX/UI improvement
- Backend/server integration — remains offline-first PWA
- Redesigning the data model or store architecture — visual layer only
- Dark theme — focus on one polished light theme first

## Context

- Existing React 19 + Vite 7 + Tailwind 4 + Zustand stack
- 5 pages: Dashboard, Schedule, Protocols, Meals, Settings
- Bottom navigation with header layout shell
- Current pain points: too many taps for everything (adding, completing, viewing, switching), information density feels off, no animations or transitions
- User wants it to feel like a native app — zero friction, aesthetically striking
- Animation library will likely be needed (Framer Motion or similar)

## Constraints

- **Stack**: Must stay within React/Vite/Tailwind ecosystem — no framework migration
- **Data**: All existing Zustand stores and Dexie persistence must continue working unchanged
- **PWA**: Must remain installable and offline-capable
- **Mobile-first**: All designs optimized for phone viewport, desktop is secondary

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full overhaul vs polish pass | User wants fundamental rethinking of interactions, not incremental fixes | — Pending |
| Clean minimal aesthetic | User preference — whitespace, typography, subtle shadows over glass/dark styles | — Pending |
| All animation categories | Page transitions + micro-interactions + data animations + gestures | — Pending |

---
*Last updated: 2026-03-13 after initialization*
