# Requirements: 時間の流れ — Mobile UX Overhaul

**Defined:** 2026-03-13
**Core Value:** Every interaction feels effortless — users can manage their daily health routine without ever thinking about the UI.

## v1 Requirements

Requirements for the UX overhaul. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: App uses LazyMotion with centralized animation config (variants, transitions, spring constants)
- [x] **FOUN-02**: MotionConfig provider wraps app with consistent spring physics defaults
- [x] **FOUN-03**: iOS safe area handling verified in PWA mode

### Navigation

- [x] **NAV-01**: Page transitions animate between all routes (slide for drill-down, cross-fade for tab switches)
- [x] **NAV-02**: Primary actions positioned within thumb-zone (lower 60% of screen) on all pages
- [x] **NAV-03**: Schedule page auto-scrolls to current time block on open
- [x] **NAV-04**: Bottom navigation active state animates smoothly during transitions

### Interactions

- [x] **INTR-01**: All buttons, checkboxes, and toggles show micro-interaction feedback on tap
- [x] **INTR-02**: User can swipe right on schedule tasks to complete them
- [x] **INTR-03**: User can swipe left on items to reveal delete action with undo toast
- [x] **INTR-04**: Bottom sheet slides up for adding tasks, meals, and viewing details
- [x] **INTR-05**: All animations use spring physics instead of linear/ease curves

### Data Visualization

- [x] **DATV-01**: Dashboard progress rings/bars animate on load and value change
- [x] **DATV-02**: List items enter with staggered cascade animation
- [x] **DATV-03**: Macro counters and dashboard stats animate with count-up effect
- [x] **DATV-04**: Skeleton shimmer states display during initial data load

### Layout

- [x] **LAYT-01**: Full-page modals replaced with bottom sheet overlays where content is compact
- [x] **LAYT-02**: User can tap protocol/meal items to expand details inline without navigating away

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish

- **PLSH-01**: Streak/momentum visual indicator on dashboard
- **PLSH-02**: Shared element card transitions (hero card expands to detail)
- **PLSH-03**: Haptic feedback on key actions (Android progressive enhancement)
- **PLSH-04**: Dark mode theme

## Out of Scope

| Feature | Reason |
|---------|--------|
| Swipe tab navigation | Conflicts with scroll gestures, error-prone disambiguation |
| Parallax scrolling | Causes motion sickness, kills scroll performance |
| Animated splash screen | Users reopen app frequently — becomes annoying |
| Onboarding carousels | Existing personal app — user knows how it works |
| Sound effects | Phones often silent, immediately muted |
| Real-time sync / multi-device | Remains offline-first, no server infra |
| Data model changes | Visual layer only — stores and persistence unchanged |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| NAV-04 | Phase 2 | Complete |
| INTR-01 | Phase 3 | Complete |
| INTR-02 | Phase 4 | Complete |
| INTR-03 | Phase 4 | Complete |
| INTR-04 | Phase 4 | Complete |
| INTR-05 | Phase 3 | Complete |
| DATV-01 | Phase 3 | Complete |
| DATV-02 | Phase 3 | Complete |
| DATV-03 | Phase 3 | Complete |
| DATV-04 | Phase 3 | Complete |
| LAYT-01 | Phase 4 | Complete |
| LAYT-02 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation*
