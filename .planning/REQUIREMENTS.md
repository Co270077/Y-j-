# Requirements: 時間の流れ — Mobile UX Overhaul

**Defined:** 2026-03-13
**Core Value:** Every interaction feels effortless — users can manage their daily health routine without ever thinking about the UI.

## v1 Requirements

Requirements for the UX overhaul. Each maps to roadmap phases.

### Foundation

- [ ] **FOUN-01**: App uses LazyMotion with centralized animation config (variants, transitions, spring constants)
- [ ] **FOUN-02**: MotionConfig provider wraps app with consistent spring physics defaults
- [ ] **FOUN-03**: iOS safe area handling verified in PWA mode

### Navigation

- [ ] **NAV-01**: Page transitions animate between all routes (slide for drill-down, cross-fade for tab switches)
- [ ] **NAV-02**: Primary actions positioned within thumb-zone (lower 60% of screen) on all pages
- [ ] **NAV-03**: Schedule page auto-scrolls to current time block on open
- [ ] **NAV-04**: Bottom navigation active state animates smoothly during transitions

### Interactions

- [ ] **INTR-01**: All buttons, checkboxes, and toggles show micro-interaction feedback on tap
- [ ] **INTR-02**: User can swipe right on schedule tasks to complete them
- [ ] **INTR-03**: User can swipe left on items to reveal delete action with undo toast
- [ ] **INTR-04**: Bottom sheet slides up for adding tasks, meals, and viewing details
- [ ] **INTR-05**: All animations use spring physics instead of linear/ease curves

### Data Visualization

- [ ] **DATV-01**: Dashboard progress rings/bars animate on load and value change
- [ ] **DATV-02**: List items enter with staggered cascade animation
- [ ] **DATV-03**: Macro counters and dashboard stats animate with count-up effect
- [ ] **DATV-04**: Skeleton shimmer states display during initial data load

### Layout

- [ ] **LAYT-01**: Full-page modals replaced with bottom sheet overlays where content is compact
- [ ] **LAYT-02**: User can tap protocol/meal items to expand details inline without navigating away

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
| FOUN-01 | — | Pending |
| FOUN-02 | — | Pending |
| FOUN-03 | — | Pending |
| NAV-01 | — | Pending |
| NAV-02 | — | Pending |
| NAV-03 | — | Pending |
| NAV-04 | — | Pending |
| INTR-01 | — | Pending |
| INTR-02 | — | Pending |
| INTR-03 | — | Pending |
| INTR-04 | — | Pending |
| INTR-05 | — | Pending |
| DATV-01 | — | Pending |
| DATV-02 | — | Pending |
| DATV-03 | — | Pending |
| DATV-04 | — | Pending |
| LAYT-01 | — | Pending |
| LAYT-02 | — | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 0
- Unmapped: 18 ⚠️

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*
