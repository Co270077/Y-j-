# Phase 2: Navigation - Research

**Researched:** 2026-03-13
**Domain:** Motion/React AnimatePresence, layoutId, React context, scrollIntoView, FAB pattern
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Tab switches: cross-fade using existing `fadeIn` variant with `gentle` transition — already wired in AppShell's AnimatePresence
- Drill-down navigation: slide right to enter, slide left to go back
- Navigation direction tracker (context or ref) so AnimatePresence can pick slide-right vs slide-left variants
- No directional cross-fades for tab switches — simple fade regardless of tab selected
- Wire drill-down pattern now even though no drill-down routes exist yet (Phase 4 readiness)
- Active indicator: animated sliding pill using Motion `layoutId` — replaces static 2px top bar
- Pill: subtle rounded rectangle behind icon+label, semi-transparent bamboo background
- Pill animates with `snappy` transition (fast, no overshoot)
- Keep existing icon stroke-width change (1.5 → 2) for active state — pill is additive
- Auto-scroll: `scrollIntoView({ behavior: 'smooth', block: 'start' })` on Schedule mount/navigation
- "Current" = block whose range includes now; "next" = first block after now; late night = last completed block
- Left-border accent (bamboo color, 2-3px) on current/next time block
- FAB: bottom-right, 16px above bottom nav, 16px from right edge, circular + icon
- FAB on: Schedule (add task), Meals (log meal), Protocols (add protocol)
- FAB off: Dashboard (read-only), Settings (no add action)
- FAB uses `scaleIn` variant for entrance, `tap` variant for press feedback

### Claude's Discretion
- Exact FAB size and shadow styling
- Whether drill-down slide distance is 100% viewport width or partial (recommendation: 100vw — matches iOS native feel)
- Auto-scroll timing delay (recommendation: 80ms delay after mount so route transition settles first)
- Pill indicator opacity/blur values (recommendation: bg-bamboo/15, no blur — clean on dark bg)
- How to structure the navigation direction context/ref

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Page transitions animate between all routes (slide for drill-down, cross-fade for tab switches) | Direction context pattern, conditional variants in AppShell, existing AnimatePresence infrastructure |
| NAV-02 | Primary actions positioned within thumb-zone (lower 60% of screen) on all pages | FAB pattern at fixed bottom-right position; Header add buttons on Schedule/Meals/Protocols are already in header (top 40%) — FAB replaces or supplements |
| NAV-03 | Schedule page auto-scrolls to current time block on open | Timeline.tsx already has auto-scroll logic; needs enhancement for "next" block and navigation-triggered re-scroll |
| NAV-04 | Bottom navigation active state animates smoothly during transitions | layoutId pill on m.div in BottomNav.tsx — Motion handles interpolation automatically |
</phase_requirements>

## Summary

All four navigation requirements build directly on Phase 1's motion infrastructure. No new libraries are needed — this phase is entirely about wiring existing Motion APIs into the right places.

**NAV-04 (layoutId pill)** is the cleanest win: convert the conditional `<div>` active indicator in BottomNav.tsx to an `<m.div>` with a shared `layoutId="active-tab-indicator"` — Motion auto-interpolates position between tabs. The pill always renders inside the active button, so layoutId handles the cross-button animation transparently.

**NAV-01 (direction-aware transitions)** requires a navigation direction tracker. The pattern is a React ref (not context) on the router level: before navigating, compare current pathname against the tab order to determine direction. AppShell reads this ref and chooses between `fadeIn` (tabs) vs `slideRight`/`slideLeft` (drill-down). Since no drill-down routes exist yet, the slide variants get wired but only activate when `isTabSwitch` is false.

**NAV-03 (auto-scroll)** already partially exists in Timeline.tsx — it scrolls to `currentTimeRef` on `day` change. The gap is: it only fires on `day` change, not route navigation; it targets `block: 'center'` not `block: 'start'`; and it doesn't handle "next upcoming" block when between tasks. The fix is a `useEffect` keyed to `location.pathname` that triggers scroll after a short delay.

**NAV-02 (thumb-zone FAB)** requires a new reusable `FAB.tsx` component. The existing add buttons are in the Header (top of screen) on Schedule, Meals, and Protocols — those buttons can stay as secondary actions or be removed. The FAB at `bottom-right` with `16px` from right and `bottom-nav-height + 16px` from bottom puts the + action squarely in the lower 60% thumb zone.

**Primary recommendation:** Build in order — NAV-04 (isolated, no side effects) → NAV-01 (direction context) → NAV-02 (new FAB component) → NAV-03 (scroll enhancement).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | ^12.36.0 | AnimatePresence, m.div, layoutId | Already installed, Phase 1 foundation |
| react-router-dom | ^7.13.1 | useLocation, useNavigate, pathname | Already installed, routing layer |

### No New Dependencies
This phase introduces zero new packages. All animation capabilities needed (layoutId, AnimatePresence, variants) are in the existing `motion` ^12.36.0 install.

## Architecture Patterns

### Recommended Project Structure (additions only)
```
src/
├── contexts/
│   └── NavigationContext.tsx   # direction tracker (isTabSwitch, direction)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # modified: direction-aware variant selection
│   │   └── BottomNav.tsx       # modified: layoutId pill
│   └── ui/
│       └── FAB.tsx             # new: floating action button
├── motion/
│   └── variants.ts             # modified: add slideLeft, slideRight variants
```

### Pattern 1: layoutId Active Tab Pill
**What:** A single `m.div` with `layoutId="active-tab-indicator"` renders inside whichever tab button is active. When the active tab changes, Motion detects two renders with the same layoutId and interpolates position/size automatically.
**When to use:** Any indicator that moves between sibling elements.
**Key constraint:** The `m.div` must be a sibling or child within each button (not a separate absolute-positioned element) for layoutId to work correctly across DOM positions.

```typescript
// Source: motion/react layoutId docs — verified pattern
// In BottomNav.tsx — replace static active indicator div
{isActive && (
  <m.div
    layoutId="active-tab-indicator"
    className="absolute inset-x-1 inset-y-1 rounded-xl bg-bamboo/15"
    transition={snappy}
  />
)}
```

The `layoutId` element must be inside a component that always renders all tabs — since BottomNav always renders all 4 tab buttons, this works without any AnimatePresence wrapping needed.

### Pattern 2: Direction-Aware Navigation Context
**What:** A `useRef`-backed context that records navigation direction before each route change. AppShell reads it to select the correct page transition variant.
**When to use:** Any time AnimatePresence needs to animate differently based on navigation intent.

```typescript
// src/contexts/NavigationContext.tsx
import { createContext, useContext, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

type NavDirection = 'tab' | 'forward' | 'back'

const NavigationContext = createContext<{
  direction: React.MutableRefObject<NavDirection>
  navigateTo: (path: string, direction?: NavDirection) => void
} | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const direction = useRef<NavDirection>('tab')
  const navigate = useNavigate()

  const navigateTo = useCallback((path: string, dir: NavDirection = 'tab') => {
    direction.current = dir
    navigate(path)
  }, [navigate])

  return (
    <NavigationContext.Provider value={{ direction, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be inside NavigationProvider')
  return ctx
}
```

**Placement:** `NavigationProvider` wraps children inside `BrowserRouter` in App.tsx. BottomNav and any drill-down link call `navigateTo` instead of `navigate` directly.

### Pattern 3: Direction-Conditional Variants in AppShell
**What:** AppShell reads direction ref and selects the correct variant set at render time.

```typescript
// src/components/layout/AppShell.tsx
import { useNavigation } from '../../contexts/NavigationContext'
import { fadeIn, slideRight, slideLeft } from '../../motion/variants'

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()
  const mainRef = useRef<HTMLElement>(null)
  const { direction } = useNavigation()

  const pageVariants = direction.current === 'tab'
    ? fadeIn
    : direction.current === 'forward'
      ? slideRight
      : slideLeft

  // Scroll to top on navigation (existing — keep for tab switches)
  useEffect(() => {
    if (direction.current === 'tab') {
      mainRef.current?.scrollTo(0, 0)
    }
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-charcoal overflow-hidden">
      <ToastContainer />
      <main ref={mainRef} className="flex-1 pb-20 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          <m.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {outlet}
          </m.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
```

### Pattern 4: Slide Variants for Drill-Down
**What:** Two new variants in `variants.ts` for directional slide transitions.

```typescript
// src/motion/variants.ts — additions
export const slideRight: Variants = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0, transition: gentle },
  exit: { opacity: 0, x: '-30%', transition: snappy },
}

export const slideLeft: Variants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: 0, transition: gentle },
  exit: { opacity: 0, x: '30%', transition: snappy },
}
```

Exit uses 30% offset (not 100%) — the exiting page slides out partially while the entering page slides fully in. This matches iOS navigation feel without the exiting page fully offscreen before settle.

### Pattern 5: FAB Component
**What:** Fixed-position circular button with entrance animation, positioned above bottom nav.

```typescript
// src/components/ui/FAB.tsx
import * as m from 'motion/react-m'
import { scaleIn, tap } from '../../motion/variants'
import { snappy } from '../../motion/transitions'
import { hapticLight } from '../../utils/haptics'

interface FABProps {
  onClick: () => void
  label: string
}

export default function FAB({ onClick, label }: FABProps) {
  return (
    <m.button
      variants={scaleIn}
      initial="initial"
      animate="animate"
      {...tap}
      onClick={() => { hapticLight(); onClick() }}
      aria-label={label}
      className="fixed bottom-[calc(4rem+16px+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 rounded-full bg-bamboo text-warm-white shadow-lg shadow-black/30 flex items-center justify-center cursor-pointer"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </m.button>
  )
}
```

**FAB bottom offset formula:** `4rem` (bottom nav h-16) + `16px` gap + `env(safe-area-inset-bottom)`. This keeps the FAB above the nav on both standard and notched devices.

### Pattern 6: Schedule Auto-Scroll Enhancement
**What:** Timeline.tsx currently scrolls to current task on `day` change. Need to also trigger on route navigation and handle "next upcoming" task.

```typescript
// Enhancement to Timeline.tsx
// Add location import and pathname to effect deps
import { useLocation } from 'react-router-dom'

// Inside Timeline component:
const location = useLocation()
const nextTaskRef = useRef<HTMLDivElement>(null)

// Find current or next task
const scrollTargetTask = sortedTasks.find(task => {
  const start = minutesSinceMidnight(task.startTime)
  const end = start + task.durationMinutes
  return start <= currentMinutes && end > currentMinutes  // current
}) ?? sortedTasks.find(task => {
  return minutesSinceMidnight(task.startTime) > currentMinutes  // next upcoming
}) ?? sortedTasks[sortedTasks.length - 1]  // last (late night fallback)

useEffect(() => {
  const timer = setTimeout(() => {
    nextTaskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 80)  // delay so route transition settles
  return () => clearTimeout(timer)
}, [location.pathname, day])
```

The 80ms delay gives the `gentle` spring transition (stiffness 180, damping 24) time to start before scroll fires — avoids scroll fighting the page entrance animation.

### Anti-Patterns to Avoid
- **Wrapping `<Outlet>` directly in AnimatePresence:** The established pattern uses `useOutlet()` + manual render. Do not change this.
- **Using state for navigation direction:** State causes re-renders on every navigation which can double-fire animations. Use a ref — reads are synchronous and side-effect-free.
- **Putting layoutId pill outside the button container:** If the indicator lives in a separate absolutely-positioned div, layoutId works but the pill must cross z-index boundaries. Keep it inside each button.
- **Keying FAB by page:** FAB should animate in once per page mount via `scaleIn`. Do not wrap in AnimatePresence — the page's AnimatePresence already handles the containing page's enter/exit.
- **scrollIntoView on every render:** Gate with `useEffect` on pathname + day deps only. The existing `day` dep in Timeline is insufficient — route navigation to `/schedule` from another tab won't change `day`, so the scroll won't fire.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab indicator position interpolation | Manual position calculation with JS | `layoutId` on `m.div` | Motion tracks DOM layout changes; handles resize, safe-area, font-scale automatically |
| Slide animation easing curves | Custom CSS keyframes | `slideRight`/`slideLeft` variants + spring transitions | Spring physics self-terminate; no hardcoded duration needed |
| Scroll position detection | Manual `getBoundingClientRect` loops | `scrollIntoView` | Browser-native; respects reduce-motion; no rAF loop needed |

## Common Pitfalls

### Pitfall 1: layoutId Pill Flickers on First Render
**What goes wrong:** On initial mount, the pill appears without animation (correct behavior) but sometimes flickers if AnimatePresence wraps the nav.
**Why it happens:** layoutId uses layout animation which requires a previous render position. On first render there is none — this is normal.
**How to avoid:** Do not wrap BottomNav in AnimatePresence. The nav is always mounted; only page content transitions.
**Warning signs:** Pill jumps on initial page load but not on subsequent tab switches.

### Pitfall 2: Direction Ref Is Stale When AnimatePresence Reads It
**What goes wrong:** AnimatePresence renders the new page's `m.div` — if direction is read inside the variant object (computed once at module level), it won't reflect the latest navigation.
**Why it happens:** Variants in Motion are evaluated at animation start, not at component definition.
**How to avoid:** Read `direction.current` inside the render function of AppShell (as shown in Pattern 3), not in a static variant object. The variant selection happens at render time, which is after the ref is updated.

### Pitfall 3: Auto-Scroll Fires Before Page Transition Completes
**What goes wrong:** Scroll fires immediately, but the page is mid-fade-in. On slower devices the scroll and animation fight.
**Why it happens:** `useEffect` fires synchronously after paint, before spring animation settles.
**How to avoid:** Use an 80ms `setTimeout` inside the effect. The `gentle` spring (stiffness 180, damping 24) takes approximately 400ms to fully settle, but scroll feels natural if it starts after ~80ms.

### Pitfall 4: FAB Covered by Bottom Nav on Safe Area Devices
**What goes wrong:** Bottom nav has `safe-area-bottom` class. FAB uses fixed `bottom` offset without accounting for it.
**Why it happens:** `env(safe-area-inset-bottom)` adds to the nav height but isn't automatically applied to the FAB.
**How to avoid:** FAB bottom offset must include `env(safe-area-inset-bottom)`: `bottom: calc(4rem + 16px + env(safe-area-inset-bottom))`. Use inline style or Tailwind's arbitrary value `bottom-[calc(4rem+16px+env(safe-area-inset-bottom,0px))]`.

### Pitfall 5: Scroll-to-Top Conflicts with Schedule Auto-Scroll
**What goes wrong:** AppShell has `mainRef.current?.scrollTo(0, 0)` on every pathname change. When navigating to `/schedule`, this fires and then Timeline's auto-scroll fires — they race.
**Why it happens:** Both effects listen to `location.pathname` with no coordination.
**How to avoid:** Guard the scroll-to-top in AppShell to skip when `location.pathname === '/schedule'`. Schedule auto-scroll handles its own position.

## Code Examples

### Verified: layoutId Usage in Motion/React
```typescript
// Motion layoutId — two elements with same layoutId animate between each other's positions
// When isActive changes, Motion detects the layout change and springs the indicator to new position
{isActive && (
  <m.div
    layoutId="active-tab-indicator"
    transition={snappy}  // { type: 'spring', stiffness: 400, damping: 28, mass: 1 }
  />
)}
```

### Verified: AnimatePresence mode="wait" with useOutlet (existing, unchanged)
```typescript
// AppShell.tsx — this pattern is locked, do not change the AnimatePresence structure
<AnimatePresence mode="wait">
  <m.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {outlet}
  </m.div>
</AnimatePresence>
```

### Verified: NavigationProvider placement in App.tsx
```typescript
// Must be inside BrowserRouter (NavigationProvider uses useNavigate internally)
<BrowserRouter basename={...}>
  <NavigationProvider>
    <Routes>
      <Route element={<AppShell />}>
        {/* routes */}
      </Route>
    </Routes>
  </NavigationProvider>
</BrowserRouter>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS transition on active indicator | Motion layoutId | Motion v10+ (2022) | Automatic DOM position interpolation — no manual coordinate tracking |
| `framer-motion` package | `motion` package | Motion v11 (2024) | Already migrated in Phase 1 — import paths are `motion/react` and `motion/react-m` |
| Wrapping Outlet in AnimatePresence | useOutlet() pattern | React Router v6.4+ | Required for AnimatePresence to detect enter/exit properly |

## Open Questions

1. **FAB vs Header add button duplication**
   - What we know: Schedule, Meals, Protocols all have `+` buttons in the Header (top of screen). NAV-02 requires lower 60%.
   - What's unclear: Should Header add buttons be removed, kept as-is, or kept but styled differently?
   - Recommendation: Keep Header buttons for accessibility (some users use top-of-screen). FAB is the primary thumb-zone action. They trigger the same handler.

2. **Drill-down route structure for Phase 4**
   - What we know: No drill-down routes exist yet; wire pattern now.
   - What's unclear: Phase 4 adds detail views — should they be nested routes (`/schedule/:id`) or same-level (`/task/:id`)?
   - Recommendation: Wire the navigation context direction to support `forward`/`back` calls. Leave route structure for Phase 4 to decide — direction context works regardless.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None — Wave 0 gap |
| Quick run command | N/A — see Wave 0 Gaps |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Direction context provides correct `NavDirection` value | unit | `vitest run src/__tests__/NavigationContext.test.tsx` | ❌ Wave 0 |
| NAV-02 | FAB renders on Schedule/Meals/Protocols, absent on Dashboard/Settings | unit | `vitest run src/__tests__/FAB.test.tsx` | ❌ Wave 0 |
| NAV-03 | Auto-scroll fires on route navigation to /schedule | unit | `vitest run src/__tests__/Timeline.test.tsx` | ❌ Wave 0 |
| NAV-04 | layoutId indicator present in BottomNav | unit | `vitest run src/__tests__/BottomNav.test.tsx` | ❌ Wave 0 |

**Note:** NAV-01 and NAV-04 are primarily visual/animation behaviors — automated tests cover structural correctness (does the element exist with layoutId, does direction context update), not animation correctness. Animation correctness is verified manually.

### Sampling Rate
- **Per task commit:** Visual verification in browser (no automated test runner yet)
- **Per wave merge:** Manual smoke test — tab through all 5 pages, verify pill slides, verify FAB present on 3 pages
- **Phase gate:** All 4 NAV requirements visually confirmed before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Install vitest + @testing-library/react: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom`
- [ ] `src/__tests__/NavigationContext.test.tsx` — covers NAV-01 direction tracking
- [ ] `src/__tests__/BottomNav.test.tsx` — covers NAV-04 layoutId presence
- [ ] `src/__tests__/FAB.test.tsx` — covers NAV-02 conditional rendering
- [ ] `src/__tests__/Timeline.test.tsx` — covers NAV-03 scroll trigger
- [ ] `vite.config.ts` — add vitest test config block

*(Given this is a visual animation phase with no test infrastructure, Wave 0 test setup is a significant prerequisite. If the planner determines test setup cost outweighs benefit for a purely visual phase, manual verification is the fallback.)*

## Sources

### Primary (HIGH confidence)
- Codebase direct inspection — AppShell.tsx, BottomNav.tsx, variants.ts, transitions.ts, Timeline.tsx (all read in this session)
- Motion/React layoutId — behavior verified from existing Phase 1 usage patterns + established Motion API knowledge
- React Router v7 useLocation, useNavigate — verified from existing codebase usage

### Secondary (MEDIUM confidence)
- scrollIntoView `block: 'start'` behavior — browser API, stable across all modern browsers
- `env(safe-area-inset-bottom)` in CSS calc — PWA/iOS standard, already used in project (`safe-area-bottom` Tailwind class in BottomNav)

### Tertiary (LOW confidence)
- 80ms scroll delay timing — empirical recommendation; actual optimal delay depends on device rendering speed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new deps
- Architecture: HIGH — all patterns directly observed from existing code
- Pitfalls: HIGH — most derived from reading actual code conflicts (AppShell scroll-to-top vs Timeline scroll, ref vs state for direction)
- Test validation: MEDIUM — no test infrastructure exists; vitest setup is standard for Vite projects

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable APIs — motion layoutId, scrollIntoView, React context are not fast-moving)
