# Phase 2: Navigation - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

All 5 routes transition natively — tab switches cross-fade, drill-downs slide. The bottom nav active indicator animates as a sliding pill. Schedule auto-scrolls to the current time block. Primary actions are positioned within thumb-zone on all pages.

</domain>

<decisions>
## Implementation Decisions

### Page Transition Style
- Tab switches: cross-fade using existing `fadeIn` variant with `gentle` transition — already wired in AppShell's AnimatePresence
- Drill-down navigation (e.g., tapping into a detail view): slide right to enter, slide left to go back
- Need a navigation direction tracker (context or ref) so AnimatePresence can pick slide-right vs slide-left variants
- No directional cross-fades for tab switches — simple fade regardless of which tab is selected (4 tabs don't benefit from directional hints)
- Currently no drill-down routes exist — wire the pattern now so Phase 4 (bottom sheets, inline expansion) has it ready

### Active Tab Indicator
- Replace current static 2px top bar with an animated sliding pill background behind the active tab
- Use Motion's `layoutId` on the indicator element — automatic position interpolation between tabs
- Pill shape: subtle rounded rectangle behind icon+label, semi-transparent bamboo background
- Pill animates with `snappy` transition (fast, no overshoot — matches Phase 1 interaction feel)
- Keep the existing icon stroke-width change (1.5 → 2) for active state — pill is additive

### Schedule Auto-Scroll
- On mount/navigation to Schedule page: smooth scroll to the current or next upcoming time block
- "Current" = block whose time range includes now; "next" = first block after now if between blocks
- Late night (no remaining blocks): scroll to last completed block of the day
- Subtle left-border accent (bamboo color, 2-3px) on the current/next time block to visually anchor it
- Use `scrollIntoView({ behavior: 'smooth', block: 'start' })` — no custom scroll logic needed

### Primary Action Placement
- Floating action button (FAB) pattern for pages with "add" actions: Schedule (add task), Meals (log meal), Protocols (add protocol)
- FAB position: bottom-right, 16px above the bottom nav, 16px from right edge
- Single circular button with + icon — tapping opens the relevant add flow
- Dashboard: no FAB (read-only overview page)
- Settings: no FAB (configuration page, no "add" action)
- FAB uses `scaleIn` variant for entrance and `tap` variant for press feedback

### Claude's Discretion
- Exact FAB size and shadow styling
- Whether drill-down slide distance is 100% viewport width or partial
- Auto-scroll timing delay (immediate vs slight delay after route animation settles)
- Pill indicator opacity/blur values
- How to structure the navigation direction context/ref

</decisions>

<specifics>
## Specific Ideas

- User requested fully autonomous decisions — all areas are Claude's discretion within the success criteria
- Animation personality carries from Phase 1: iOS system animation feel, snappy, no bounce or overshoot
- Named transition presets (snappy, gentle, instant) already established — reuse, don't create new ones

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `motion/variants.ts`: fadeIn, slideUp, slideDown, scaleIn, tap, completePulse — fadeIn already used for page transitions
- `motion/transitions.ts`: snappy, gentle, instant spring presets
- `AppShell.tsx`: AnimatePresence with useOutlet() pattern — cross-fade already working
- `BottomNav.tsx`: 4 tabs with useNavigate, static active indicator div, hapticLight on tap

### Established Patterns
- AnimatePresence `mode="wait"` with `m.div` keyed by `location.pathname`
- BrowserRouter with flat Routes (no nested routes yet)
- Scroll-to-top on navigation via mainRef in AppShell
- Conditional rendering for active indicator (`{isActive && <div ... />}`)

### Integration Points
- `AppShell.tsx`: Page transition variants need to become direction-aware (replace static fadeIn)
- `BottomNav.tsx`: Active indicator needs layoutId pill, indicator div becomes m.div
- `SchedulePage.tsx`: Auto-scroll logic hooks into component mount/navigation
- `App.tsx`: May need route structure changes if drill-down routes are added
- Pages with add actions: need FAB component added to Schedule, Meals, Protocols pages

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-navigation*
*Context gathered: 2026-03-13*
