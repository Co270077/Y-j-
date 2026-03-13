# Roadmap: 時間の流れ — Mobile UX Overhaul

## Overview

Four phases transform an existing functional PWA into a native-feeling mobile app. Foundation establishes the animation layer correctly before anything touches UI. Navigation wires page transitions so every route switch feels immediate. UI primitives and animations make every tap target tactile and every data display alive. Gesture interactions replace full-page flows with bottom sheets and swipe actions. Each phase delivers a coherent, testable capability before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Animation infrastructure correctly wired before any UI touches it
- [ ] **Phase 2: Navigation** - All routes transition natively; bottom nav active state animates
- [ ] **Phase 3: UI Primitives + Animations** - Every tap target has feedback; data comes alive on screen
- [ ] **Phase 4: Gesture Interactions + Layout** - Swipe gestures and bottom sheets replace high-friction flows

## Phase Details

### Phase 1: Foundation
**Goal**: Animation infrastructure is correctly wired so all subsequent phases build on a safe, performant base
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03
**Success Criteria** (what must be TRUE):
  1. App bundle size does not increase by more than 20kb gzipped after Motion is added (LazyMotion confirmed)
  2. iOS safe areas are correct in PWA mode — bottom nav does not overlap the home indicator on iPhone X+
  3. A centralized `motion/variants.ts` and `motion/transitions.ts` exist and at least one component imports from them
  4. MotionConfig wraps the app and `reducedMotion="user"` is set — animations are suppressed when OS reduce-motion is enabled
**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Install motion, create animation config, wire providers, migrate AppShell, fix PWA manifest
- [ ] 01-02-PLAN.md — Migrate all component CSS animations to Motion, remove CSS keyframes

### Phase 2: Navigation
**Goal**: Navigating between all 5 pages feels native — transitions animate, the active tab indicator slides
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04
**Success Criteria** (what must be TRUE):
  1. Switching tabs cross-fades; drilling into a detail view slides right; back navigation slides left
  2. The active tab indicator in the bottom nav slides as an animated pill — it does not jump
  3. Opening the Schedule page auto-scrolls to the current time block without user action
  4. Primary action buttons (add task, log meal, etc.) are reachable without stretching — positioned in the lower 60% of the screen on all pages
**Plans**: TBD

### Phase 3: UI Primitives + Animations
**Goal**: Every tap target gives tactile feedback and every data visualization animates — nothing on screen is static
**Depends on**: Phase 2
**Requirements**: INTR-01, INTR-05, DATV-01, DATV-02, DATV-03, DATV-04
**Success Criteria** (what must be TRUE):
  1. Tapping any button, checkbox, or toggle produces a visible spring-physics response (no linear/ease animations anywhere)
  2. Dashboard progress rings and bars animate from zero on load and re-animate on value change
  3. Macro counters and dashboard stat numbers animate with a count-up effect when values change
  4. List items on all pages enter the screen with a staggered cascade (not all at once)
  5. Content that hasn't loaded yet shows a shimmer skeleton — no blank areas or layout jumps
**Plans**: TBD

### Phase 4: Gesture Interactions + Layout
**Goal**: High-friction flows are replaced with swipe gestures and bottom sheets — users never leave context to complete a common action
**Depends on**: Phase 3
**Requirements**: INTR-02, INTR-03, INTR-04, LAYT-01, LAYT-02
**Success Criteria** (what must be TRUE):
  1. User can swipe right on a schedule task to complete it — no tap on a checkbox required
  2. User can swipe left on any list item to reveal a delete action; tapping undo reverses the deletion
  3. Adding a task, logging a meal, or adding a protocol opens a bottom sheet — not a full-page navigation
  4. Tapping a protocol or meal item expands its details inline — the user stays on the current page
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planning complete | - |
| 2. Navigation | 0/TBD | Not started | - |
| 3. UI Primitives + Animations | 0/TBD | Not started | - |
| 4. Gesture Interactions + Layout | 0/TBD | Not started | - |
