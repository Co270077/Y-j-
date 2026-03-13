# Phase 3: UI Primitives + Animations - Research

**Researched:** 2026-03-13
**Domain:** Motion (motion/react v12) — tap feedback, spring-driven SVG, count-up hooks, stagger lists, CSS shimmer skeletons
**Confidence:** HIGH

## Summary

The codebase already has a complete Motion foundation: LazyMotion with `domAnimation` features, centralized `variants.ts` and `transitions.ts`, and the `m.` prefix pattern throughout. Phase 3 is entirely additive — no architectural changes, no new dependencies, no store changes. Every piece of work is either a component migration (plain element → `m.element`) or a new hook/component built on top of already-imported Motion primitives.

The stack is `motion` v12 (not `framer-motion`). The `useMotionValue` + `useSpring` + `useMotionValueEvent` APIs are the correct primitives for `useCountUp` and ProgressRing animation. Stagger is handled via `staggerChildren` in a parent variant — the pattern is already proven in the codebase. CSS `@keyframes` handles shimmer (not Motion) because it's a repeating loop animation that doesn't need spring physics.

The one verified concern from STATE.md — Recharts + Motion coexistence — is resolved: ProgressRing is custom SVG (no Recharts). No coexistence issue exists for this phase.

**Primary recommendation:** Migrate components in component-first order (Button → Toggle → ProgressRing → useCountUp → Skeleton → stagger layers), keeping each change isolated and testable.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tap Feedback Style**
- Uniform `tap` variant (scale: 0.97) with `snappy` transition on all interactive elements — buttons, toggles, checkboxes, cards with actions
- Button.tsx: migrate from plain `<button>` to `m.button` with `whileTap` — remove CSS `transition-colors duration-150`, let Motion handle
- Toggle.tsx: `m.button` wrapper with `whileTap` scale on the outer track; knob position animated with `snappy` spring (replace CSS `transition-transform`)
- Checkboxes (inline in TaskBlock, SubtaskList): wrap in `m.div` with `whileTap` scale + `completePulse` variant on check
- FAB.tsx: already uses `whileTap` — no changes needed
- Disabled elements: no tap animation (Motion's `whileTap` naturally won't fire on disabled buttons)
- No color shift on tap — scale-only keeps it clean and iOS-like

**Data Visualization Animation**
- ProgressRing.tsx: animate SVG `strokeDashoffset` with Motion's `m.circle` — spring from full offset (empty) to calculated offset on mount
- Re-animate on value change: use `useMotionValue` + `useSpring` for the offset, driven by the `progress` prop — automatic spring interpolation when prop changes
- Count-up effect on numbers: custom `useCountUp` hook using `useMotionValue` + `useSpring` + `useMotionValueEvent` — renders integer during animation, lands on exact value
- Count-up duration: driven by `gentle` spring (not time-based) — feels organic, settles in ~400ms
- Dashboard stat numbers (progress %, tasks completed, streak count, macro values): all use `useCountUp`
- ProgressCard bars: if any horizontal bars exist, animate width with `m.div` and `snappy` transition
- Trigger: animate on mount and on value change — no viewport-entry detection needed (dashboard is always visible when navigated to)
- Recharts concern: progress rings are custom SVG (no Recharts dependency) — no coexistence issue for this phase

**Staggered List Cascade**
- Use `staggerChildren` in a parent `m.div` variant — each child gets `slideUp` variant (fade + 20px upward)
- Stagger delay: 50ms between items — fast enough to feel snappy, slow enough to see the cascade
- Max stagger: first 10 items animate; items beyond 10 render immediately (prevents long lists from feeling slow)
- Apply to: Schedule timeline tasks, Protocol list items, Meal plan items, Dashboard card grid
- Dashboard grid: stagger cards with `scaleIn` variant instead of `slideUp` — cards feel like they "pop in"
- Re-entry: animate only on route entry (mount), not on data updates within the page — prevents cascade replay when completing a task
- Exit animation: none for list items (instant unmount) — exit animations on lists feel sluggish

**Shimmer Skeletons**
- New `Skeleton.tsx` component in `src/components/ui/` — renders a rounded rectangle with animated gradient shimmer
- Shimmer style: horizontal gradient sweep (left-to-right), not pulse — gradient feels more polished
- Gradient: `bg-surface-raised` base with a lighter `surface-overlay` sweep, subtle (not high contrast)
- Shape variants: `text` (short rounded bar), `circle` (for avatars/rings), `card` (full card placeholder), `block` (generic rectangle)
- Size: matches the element it replaces — skeleton for ProgressRing is a circle of same diameter, skeleton for a stat number is a short text bar
- Show immediately on mount — no delay. Content swaps in with `fadeIn` variant when data loads (AnimatePresence `mode="wait"`)
- Skeleton animation: pure CSS `@keyframes shimmer` (not Motion) — skeleton doesn't need spring physics, and CSS animation is cheaper for repeating loops
- Apply to: Dashboard page (cards show skeletons until stores load), any page where data is fetched asynchronously
- Layout stability: skeletons must match exact dimensions of real content to prevent layout shift

### Claude's Discretion
- Exact shimmer gradient colors and animation speed
- Whether to extract a `useAnimatedList` hook or keep stagger logic inline per page
- Spring tuning adjustments if tap feedback feels too subtle or too aggressive
- Whether ProgressRing animation needs a slight delay after route transition settles
- How to structure the `useCountUp` hook internals

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTR-01 | All buttons, checkboxes, and toggles show micro-interaction feedback on tap | `whileTap` on `m.button`/`m.div` with `tap` variant (scale: 0.97, `snappy` spring) — affects Button.tsx, Toggle.tsx, SubtaskList.tsx checkboxes, TaskBlock complete button |
| INTR-05 | All animations use spring physics instead of linear/ease curves | Remove all CSS `transition-*` from animated elements; replace with Motion spring transitions using `snappy`/`gentle`/`instant` presets already in transitions.ts |
| DATV-01 | Dashboard progress rings/bars animate on load and value change | `m.circle` with `useMotionValue` + `useSpring` driving `strokeDashoffset`; spring responds automatically when `progress` prop changes |
| DATV-02 | List items enter with staggered cascade animation | Parent `m.div` with `staggerChildren: 0.05` + `delayChildren` variant; children use `slideUp`/`scaleIn` variants; cap at 10 animated items |
| DATV-03 | Macro counters and dashboard stats animate with count-up effect | `useCountUp` hook using `useMotionValue` + `useSpring` + `useMotionValueEvent` to drive integer state from spring value |
| DATV-04 | Skeleton shimmer states display during initial data load | New `Skeleton.tsx` with CSS `@keyframes shimmer`; `AnimatePresence mode="wait"` swaps skeleton → real content with `fadeIn` variant |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.36.0 | All animation — tap, spring, stagger, MotionValue | Already installed; LazyMotion + domAnimation already configured |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion/react-m | (same) | Tree-shakeable `m.` elements | All animated elements; established pattern in codebase |
| motion/react AnimatePresence | (same) | Enter/exit orchestration | Skeleton → content swap; mode="wait" already established |
| CSS @keyframes | N/A | Repeating shimmer loop | Skeleton only — cheaper than Motion for infinite loops |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useMotionValue + useSpring | react-spring | Same concept, but motion is already the project dependency |
| CSS @keyframes shimmer | Motion `animate` with `repeat: Infinity` | Motion approach works but is heavier for a pure loop; CSS is cheaper |
| Inline stagger variants | useAnimatedList hook | Hook adds abstraction; inline is fine for 4 pages; only extract if pattern repeats 5+ times |

**Installation:** No new packages needed. All required APIs are in `motion` ^12.36.0.

---

## Architecture Patterns

### Relevant Existing Structure
```
src/
├── motion/
│   ├── variants.ts          # tap, fadeIn, slideUp, scaleIn, completePulse — all reuse as-is
│   └── transitions.ts       # snappy, gentle, instant — no new presets needed
├── components/ui/
│   ├── Button.tsx           # <button> → <m.button> migration
│   ├── Toggle.tsx           # CSS transitions → Motion springs
│   ├── ProgressRing.tsx     # static SVG → m.circle with useSpring
│   ├── Card.tsx             # active:scale-[0.98] CSS → m.div whileTap (cards with onClick)
│   └── Skeleton.tsx         # NEW — CSS shimmer component
├── components/dashboard/
│   ├── DashboardGrid.tsx    # wrap grid div in m.div with stagger parent variant
│   ├── ProgressCard.tsx     # add useCountUp to progress% and completed/total
│   └── StreakCard.tsx       # add useCountUp to remaining count
├── components/schedule/
│   ├── Timeline.tsx         # wrap sortedTasks map in stagger parent
│   ├── TaskBlock.tsx        # migrate complete button to m.button with whileTap
│   └── SubtaskList.tsx      # migrate checkbox buttons to m.button with whileTap
├── components/protocols/
│   └── ProtocolList.tsx     # wrap sorted.map in stagger parent
├── components/meals/
│   └── MacroSummary.tsx     # add useCountUp to macro numbers (if numeric values rendered)
├── hooks/
│   └── useCountUp.ts        # NEW — useMotionValue + useSpring + useMotionValueEvent
└── index.css                # add @keyframes shimmer
```

### Pattern 1: m.button whileTap Migration
**What:** Replace plain `<button>` with `<m.button>` + `whileTap` prop. Remove any CSS `transition-transform` or `active:scale-*` that duplicates the animation.
**When to use:** Any interactive button that currently has no Motion. Disabled buttons are unaffected — Motion's `whileTap` won't fire on `disabled` elements naturally.

```typescript
// Source: established FAB.tsx pattern in codebase
import * as m from 'motion/react-m'
import { snappy } from '../../motion/transitions'

// Before
<button disabled={props.disabled} {...props}>

// After
<m.button
  whileTap={!props.disabled ? { scale: 0.97, transition: snappy } : undefined}
  disabled={props.disabled}
  {...props}
>
```

Note: For `forwardRef` components (Button.tsx), use `m.button` with `forwardRef` from motion/react. The correct import is:
```typescript
import { m } from 'motion/react'  // or * as m from 'motion/react-m'
```
Since Button uses `forwardRef`, cast: `const MotionButton = m.button` — then use `MotionButton` in the return, passing the ref through.

Actually the established pattern uses `* as m from 'motion/react-m'` and `m.button` directly with forwardRef — this works because `m.button` accepts a ref. Keep consistent with existing codebase import style.

### Pattern 2: useCountUp Hook
**What:** Custom hook that drives a displayed integer value through a spring animation when the source number changes.
**When to use:** Dashboard stat numbers — progress%, completed count, remaining count, macro totals.

```typescript
// Source: motion/react docs — useMotionValue + useSpring + useMotionValueEvent
import { useMotionValue, useSpring, useMotionValueEvent } from 'motion/react'
import { useState, useEffect } from 'react'
import { gentle } from '../motion/transitions'

export function useCountUp(target: number): number {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, gentle)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    motionValue.set(target)
  }, [target, motionValue])

  useMotionValueEvent(spring, 'change', (latest) => {
    setDisplay(Math.round(latest))
  })

  return display
}
```

Usage in StreakCard: `const displayRemaining = useCountUp(remaining)` — render `{displayRemaining}` instead of `{remaining}`.

### Pattern 3: ProgressRing Spring Animation
**What:** Replace static `strokeDashoffset` calculation with `useMotionValue` + `useSpring` driving the same value.
**When to use:** ProgressRing.tsx only.

```typescript
// Source: motion/react docs — useMotionValue, useSpring, MotionValue
import * as m from 'motion/react-m'
import { useMotionValue, useSpring, useEffect } from 'motion/react'
import { gentle } from '../../motion/transitions'

// Inside ProgressRing component:
const circumference = 2 * Math.PI * radius
const targetOffset = circumference - (Math.min(progress, 100) / 100) * circumference

const offsetValue = useMotionValue(circumference) // start at full offset = empty ring
const springOffset = useSpring(offsetValue, gentle)

useEffect(() => {
  offsetValue.set(targetOffset)
}, [targetOffset, offsetValue])

// Replace <circle ... strokeDashoffset={offset} className="transition-all duration-500">
// with:
<m.circle
  cx={size / 2}
  cy={size / 2}
  r={radius}
  fill="none"
  stroke={color}
  strokeWidth={strokeWidth}
  strokeLinecap="round"
  strokeDasharray={circumference}
  style={{ strokeDashoffset: springOffset }}
/>
```

Remove `className="transition-all duration-500"` — Motion owns this now. INTR-05 compliance.

### Pattern 4: Stagger List Cascade
**What:** Parent `m.div` with `staggerChildren` variant controls child animation timing. Children render `initial`/`animate` variants set to `slideUp` or `scaleIn`.
**When to use:** Timeline tasks, ProtocolList items, MealsPage templates, DashboardGrid cards.

```typescript
// Source: motion/react docs — variants with staggerChildren
import * as m from 'motion/react-m'
import { slideUp } from '../../motion/variants'
import { gentle } from '../../motion/transitions'

const listContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
}

// In Timeline render:
<m.div variants={listContainer} initial="initial" animate="animate">
  {sortedTasks.slice(0, 10).map((task) => (
    <m.div key={task.id} variants={slideUp}>
      <TaskBlock ... />
    </m.div>
  ))}
  {/* Items beyond 10 render without wrapper — immediate render */}
  {sortedTasks.slice(10).map((task) => (
    <div key={task.id}>
      <TaskBlock ... />
    </div>
  ))}
</m.div>
```

**Dashboard grid uses `scaleIn` instead of `slideUp`** — cards pop in, don't slide.

**CRITICAL:** The stagger parent must use `initial="initial"` + `animate="animate"` strings (variant names), NOT object syntax. This is what enables variant propagation to children.

### Pattern 5: Skeleton.tsx with CSS Shimmer
**What:** Component that renders a shape-matched placeholder with a CSS `@keyframes` gradient sweep. Swaps to real content via `AnimatePresence mode="wait"`.

```typescript
// Skeleton component
type SkeletonVariant = 'text' | 'circle' | 'card' | 'block'

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  className?: string
}

export default function Skeleton({ variant = 'block', width, height, className = '' }: SkeletonProps) {
  const shapeClass = {
    text: 'rounded-full',
    circle: 'rounded-full',
    card: 'rounded-[var(--radius-lg)]',
    block: 'rounded-[var(--radius-md)]',
  }[variant]

  return (
    <div
      className={`skeleton-shimmer ${shapeClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
```

CSS in `index.css`:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface-raised) 25%,
    var(--color-surface-overlay) 50%,
    var(--color-surface-raised) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
```

Usage pattern with AnimatePresence:
```typescript
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { fadeIn } from '../../motion/variants'
import Skeleton from '../ui/Skeleton'

// isLoaded = stores have populated
<AnimatePresence mode="wait">
  {!isLoaded ? (
    <m.div key="skeleton" variants={fadeIn} initial="initial" animate="animate" exit="exit">
      <Skeleton variant="card" width="100%" height={88} />
    </m.div>
  ) : (
    <m.div key="content" variants={fadeIn} initial="initial" animate="animate">
      {/* real content */}
    </m.div>
  )}
</AnimatePresence>
```

### Anti-Patterns to Avoid

- **Mixing CSS transitions with Motion on the same property:** If Motion animates `transform: scale`, remove `transition-transform` CSS. If both coexist, they fight and create jank. Verified: Button.tsx has `transition-colors duration-150` — keep `transition-colors` (Motion doesn't animate color here), remove only `transition-transform` / `active:scale-*`.
- **Spreading variant objects onto whileTap:** `whileTap={tap.whileTap}` where `tap` is a Variants object won't work as expected — use inline object: `whileTap={{ scale: 0.97, transition: snappy }}`. Established in STATE.md: "Use whileTap inline instead of tap.whileTap spread".
- **Wrapping `<Outlet>` with AnimatePresence directly:** Documented in STATE.md. Irrelevant for Phase 3 but good to remember.
- **Using `animate` object syntax on stagger parent instead of variant strings:** `animate={{ opacity: 1 }}` on parent doesn't propagate to children. Must use variant name strings: `animate="animate"`.
- **Animating stagger on data updates:** Stagger should only fire on route mount. Use a stable `key` tied to route, not data. Otherwise completing a task replays the cascade.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animating numeric values through a spring | Custom requestAnimationFrame loop, setInterval counter | `useMotionValue` + `useSpring` + `useMotionValueEvent` | Handles spring physics, cancelation, and value settling automatically |
| Stagger timing calculations | Manual `animationDelay` style per index | `staggerChildren` in variant | Handles cascading without per-item delay math; respects reduced-motion |
| Shimmer animation | Motion `animate` with `repeat: Infinity` | CSS `@keyframes` | CSS repeating loops have no JS cost; better for battery on mobile |
| SVG path animation (checkmark) | CSS stroke-dasharray hack | `m.polyline` with `pathLength: 0 → 1` | Already implemented in TaskBlock.tsx; reuse pattern |

---

## Common Pitfalls

### Pitfall 1: forwardRef + m.button TypeScript Conflict
**What goes wrong:** `m.button` inside a `forwardRef` component may have type mismatch on `ref` — TypeScript complains about `HTMLButtonElement` vs Motion's ref type.
**Why it happens:** Motion wraps native elements; ref type is slightly different in older setups.
**How to avoid:** Keep the `forwardRef<HTMLButtonElement, ButtonProps>` signature, but cast `ref` if needed. In practice with motion v12 and React 19, `m.button` accepts `HTMLButtonElement` ref directly — no cast required.
**Warning signs:** `Type 'ForwardedRef<HTMLButtonElement>' is not assignable to...` in Button.tsx.

### Pitfall 2: useSpring Initial Value Mismatch
**What goes wrong:** ProgressRing animates from 0 on re-renders caused by parent state changes unrelated to `progress` prop, creating unexpected replays.
**Why it happens:** `useMotionValue(circumference)` creates a new MotionValue on every render if not memoized.
**How to avoid:** `useMotionValue` and `useSpring` are stable across renders — they only reinitialize on component unmount/remount. The `useEffect` that calls `offsetValue.set(targetOffset)` correctly tracks `[targetOffset]`. No memoization needed.
**Warning signs:** Ring resets to empty on every parent re-render.

### Pitfall 3: Stagger Replay on Data Updates
**What goes wrong:** When a task is completed (store updates), the Timeline re-renders and the stagger cascade replays.
**Why it happens:** The parent `m.div` re-mounts if its `key` changes, or if `initial`/`animate` are recalculated.
**How to avoid:** Keep `initial="initial"` and `animate="animate"` as static strings. The stagger parent must not remount on data changes — it only fires on mount. Since the component stays mounted across task completions, stagger plays once and stops. The `AnimatePresence` pattern for stagger is NOT needed here.
**Warning signs:** Cascade replays every time a checkbox is tapped.

### Pitfall 4: CSS Shimmer + Tailwind Background Conflict
**What goes wrong:** Tailwind's `bg-surface-raised` class and the `.skeleton-shimmer` CSS `background` conflict — Tailwind's class wins due to specificity, shimmer has no visible gradient.
**Why it happens:** Both set `background` property. Tailwind inline class overrides `.skeleton-shimmer` CSS gradient.
**How to avoid:** Do NOT apply any `bg-*` Tailwind class to the skeleton element that also has `.skeleton-shimmer`. The CSS class sets all background properties needed. Use `className` for shape/size only.
**Warning signs:** Skeleton renders as a solid `#3A3A3A` block with no shimmer motion.

### Pitfall 5: AnimatePresence key Collision
**What goes wrong:** Skeleton and real content share the same component key, causing AnimatePresence to not detect the switch.
**Why it happens:** Without explicit `key` props, React keeps the same DOM node, AnimatePresence never triggers exit/enter.
**How to avoid:** Always provide `key="skeleton"` and `key="content"` (or data-based key) on the direct children of `AnimatePresence`.
**Warning signs:** Skeleton and content flicker or content appears without `fadeIn`.

---

## Code Examples

Verified patterns from existing codebase:

### Existing whileTap Pattern (FAB.tsx — reference implementation)
```typescript
// Source: src/components/ui/FAB.tsx
import * as m from 'motion/react-m'
import { snappy } from '../../motion/transitions'

<m.button
  whileTap={{ scale: 0.97, transition: snappy }}
  ...
>
```

### Existing pathLength Animation (TaskBlock.tsx — reference implementation)
```typescript
// Source: src/components/schedule/TaskBlock.tsx
import * as m from 'motion/react-m'
import { snappy } from '../../motion/transitions'

<m.polyline
  points="20 6 9 17 4 12"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={snappy}
/>
```

### Existing variants + transitions (reference)
```typescript
// Source: src/motion/variants.ts, src/motion/transitions.ts
export const tap: Variants = {
  whileTap: { scale: 0.97, transition: snappy },
}
export const snappy: Transition = {
  type: 'spring', stiffness: 400, damping: 28, mass: 1,
}
export const gentle: Transition = {
  type: 'spring', stiffness: 180, damping: 24, mass: 1,
}
```

### AnimatePresence mode="wait" Pattern (established)
```typescript
// Source: STATE.md + existing Modal usage
import { AnimatePresence } from 'motion/react'
// Always render; gate with condition inside AnimatePresence
<AnimatePresence mode="wait">
  {condition && <m.div key="..." variants={fadeIn} initial="initial" animate="animate" exit="exit">...</m.div>}
</AnimatePresence>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| CSS `transition-transform duration-200` on toggle knob | Motion `useSpring` driving transform | Spring physics; INTR-05 compliance |
| CSS `transition-all duration-500` on ProgressRing circle | `m.circle` with `style={{ strokeDashoffset: springOffset }}` | Spring physics; re-animates on value change |
| CSS `active:scale-[0.98]` on Card.tsx | `m.div` with `whileTap` | Consistent with all other tap targets; removes CSS fallback |
| Plain `<button>` in SubtaskList checkboxes | `m.button` with `whileTap` | INTR-01 coverage on subtask interactions |

**Deprecated/outdated in this codebase after Phase 3:**
- `transition-colors duration-150` on Button.tsx: keep for color (Motion doesn't own it), remove if it covered transform
- `active:scale-[0.98] transition-transform duration-100` on Card.tsx: remove entirely, replace with Motion `whileTap`
- `transition-all duration-200` on Toggle.tsx knob span: remove, Motion owns the transform now
- `className="transition-all duration-500"` on ProgressRing foreground circle: remove

---

## Open Questions

1. **Dashboard "isLoaded" signal for skeletons**
   - What we know: Stores use Zustand + IndexedDB (dexie-based). The `DashboardGrid` reads from `useScheduleStore`, `useProtocolStore`, `useSettingsStore`.
   - What's unclear: Do stores expose a loading state? The current store reads appear to be synchronous selectors with no `isLoading` flag visible in the dashboard components.
   - Recommendation: Check store implementations. If no loading flag exists, derive `isLoaded` from data presence (e.g., `tasks !== undefined`). If stores always return empty arrays synchronously before hydration, skeleton may only flash briefly — acceptable. The planner should decide whether to add `isLoading` to stores or derive from data.

2. **Card.tsx stagger participation**
   - What we know: Dashboard cards are rendered from `DashboardGrid.tsx` as direct JSX children (not a mapped array). The stagger parent needs `m.div` children.
   - What's unclear: Wrapping each card in `m.div variants={scaleIn}` inside DashboardGrid adds wrapper divs that could affect the CSS grid layout (grid-cols-2).
   - Recommendation: Wrap each card's `<ProgressCard>`, `<StreakCard>`, etc. with `<m.div variants={scaleIn} className="contents">` or simply accept the wrapper div and ensure grid layout still works. Test visually.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 + @testing-library/react ^16.3.2 |
| Config file | vite.config.ts (test block, globals:true, jsdom) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTR-01 | Button renders as m.button with whileTap prop present | unit | `npx vitest run src/__tests__/Button.test.tsx -t "whileTap"` | ❌ Wave 0 |
| INTR-01 | Toggle knob animates via Motion (no CSS transition on transform) | unit | `npx vitest run src/__tests__/Toggle.test.tsx` | ❌ Wave 0 |
| INTR-01 | SubtaskList checkbox buttons have whileTap | unit | `npx vitest run src/__tests__/SubtaskList.test.tsx` | ❌ Wave 0 |
| INTR-05 | No `transition-transform` CSS on animated elements | unit/lint | manual inspection + vitest structural test | ❌ Wave 0 |
| DATV-01 | ProgressRing renders m.circle element | unit | `npx vitest run src/__tests__/ProgressRing.test.tsx` | ❌ Wave 0 |
| DATV-02 | Timeline wraps items in m.div with variants | unit | existing `src/__tests__/Timeline.test.tsx` (extend) | ✅ extend |
| DATV-02 | ProtocolList wraps items in m.div with variants | unit | `npx vitest run src/__tests__/ProtocolList.test.tsx` | ❌ Wave 0 |
| DATV-03 | useCountUp returns 0 initially, approaches target | unit | `npx vitest run src/__tests__/useCountUp.test.ts` | ❌ Wave 0 |
| DATV-04 | Skeleton renders with aria-hidden and shimmer class | unit | `npx vitest run src/__tests__/Skeleton.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/Button.test.tsx` — covers INTR-01 (whileTap present, disabled no scale)
- [ ] `src/__tests__/Toggle.test.tsx` — covers INTR-01 (m.button present, knob motion)
- [ ] `src/__tests__/SubtaskList.test.tsx` — covers INTR-01 (checkbox whileTap)
- [ ] `src/__tests__/ProgressRing.test.tsx` — covers DATV-01 (m.circle rendered)
- [ ] `src/__tests__/ProtocolList.test.tsx` — covers DATV-02 (stagger wrapper present)
- [ ] `src/__tests__/useCountUp.test.ts` — covers DATV-03 (hook behavior)
- [ ] `src/__tests__/Skeleton.test.tsx` — covers DATV-04 (aria-hidden, shimmer class)

Note: Motion's `useSpring` and `useMotionValue` require mocking in jsdom — use `vi.mock('motion/react', ...)` to return controlled values in hook tests. Alternatively, test structural DOM output (element type, class names, aria attributes) rather than spring animation values.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/motion/variants.ts`, `transitions.ts`, `FAB.tsx`, `TaskBlock.tsx`, `ProgressRing.tsx`, `Button.tsx`, `Toggle.tsx`, `DashboardGrid.tsx`, `Timeline.tsx`, `SubtaskList.tsx`, `ProtocolList.tsx`
- `src/__tests__/` — existing test patterns (FAB.test.tsx, Timeline.test.tsx)
- `.planning/phases/03-ui-primitives-animations/03-CONTEXT.md` — locked decisions
- `.planning/STATE.md` — accumulated decisions including whileTap inline pattern
- `package.json` — confirmed motion ^12.36.0, vitest ^4.1.0, React 19

### Secondary (MEDIUM confidence)
- motion/react v12 API: `useMotionValue`, `useSpring`, `useMotionValueEvent`, `m.circle`, `staggerChildren` — verified against established patterns in codebase that already use these APIs successfully in Phase 1/2

### Tertiary (LOW confidence)
- None — all claims verified against actual codebase files

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — motion v12 already installed and working; no new dependencies
- Architecture: HIGH — all patterns verified against existing codebase code
- Pitfalls: HIGH — derived from actual code inspected (CSS transition conflicts, existing whileTap inline note in STATE.md)
- Validation: MEDIUM — test structure matches existing tests; wave 0 files don't exist yet

**Research date:** 2026-03-13
**Valid until:** 2026-04-12 (motion v12 is stable; no fast-moving dependencies)
