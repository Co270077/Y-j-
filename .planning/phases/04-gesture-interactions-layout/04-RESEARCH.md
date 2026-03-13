# Phase 4: Gesture Interactions + Layout - Research

**Researched:** 2026-03-13
**Domain:** Touch gesture handling (@use-gesture/react), animated bottom sheets (motion/react), inline accordion expansion
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Replace `useSwipe.ts` with `@use-gesture/react` `useDrag` — already installed, provides velocity, direction, cancel, and spring-ready values
- Swipe-right-to-complete (schedule tasks): iOS Mail-style reveal — item slides right to expose a green "done" background with checkmark icon
- Drag follows finger 1:1 during swipe; rubber-band resistance past threshold
- Completion threshold: 40% of item width — past threshold, background turns fully green, checkmark scales up
- Below threshold on release: spring back to origin (snappy transition)
- Above threshold on release: item slides fully off-screen right, then collapses height with spring, then fires completion callback
- `hapticSuccess` fires at threshold crossing, not on release
- Swipe-left-to-delete: same threshold logic but reversed, exposes red background with trash icon
- No simultaneous left+right — gesture direction locks after 10px of horizontal movement
- Vertical scroll takes priority — if vertical movement > horizontal in first 10px, cancel gesture entirely
- Upgrade existing `Modal.tsx` to unified `BottomSheet` component (rename to `BottomSheet.tsx`)
- Drag-to-dismiss via `useDrag` on handle bar — drag down past 30% of sheet height dismisses with spring animation
- Velocity-based dismiss: fast downward flick (velocity > 500px/s) dismisses regardless of position
- Sheet snaps to detents: "peek" (40% viewport), "half" (50%), "full" (90vh)
  - Add-task: "half", Meal template editor: "full", Protocol editor: "full", Quick-view: "peek" or "half"
- Backdrop opacity interpolates with sheet position
- Sheet content scrolls internally; drag-to-dismiss only activates when content scrolled to top
- Keep existing props API (isOpen, onClose, title, children) + add optional `detent` prop
- Protocol items: tap to expand card with AnimatePresence height animation (accordion, one at a time)
- Meal template items: same accordion pattern
- Animation: `m.div` with `initial={{ height: 0, opacity: 0 }}` → `animate={{ height: "auto", opacity: 1 }}` with `snappy` transition
- Swipe-delete applies to: schedule tasks, protocol items, meal template items — NOT dashboard cards
- On swipe-delete: item animates out, undo toast appears
- Undo toast: 5-second duration with countdown, positioned above bottom nav
- Soft-delete in UI; actual DB deletion fires after undo window expires or user navigates away
- Only one undo toast at a time — new swipe-delete commits previous deletion
- Toast uses existing `Toast.tsx` pattern with custom "undo" action button variant

### Claude's Discretion
- Exact gesture spring constants for swipe feedback
- BottomSheet detent snap animation tuning
- Whether to extract a reusable `useSwipeAction` hook or keep gesture logic per-component
- Skeleton/loading states for bottom sheet content
- Exact shadow values for expanded inline cards
- Whether BottomSheet needs keyboard-aware repositioning for form inputs

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTR-02 | User can swipe right on schedule tasks to complete them | `@use-gesture/react` `useDrag` with `axis: 'lock'`, `useMotionValue` for x offset, threshold at 40% width, `useTransform` for background color |
| INTR-03 | User can swipe left on items to reveal delete action with undo toast | Same `useDrag` wrapper, reverse direction; soft-delete state + toast timer; Toast.tsx extended with action button |
| INTR-04 | Bottom sheet slides up for adding tasks, meals, and viewing details | Modal.tsx → BottomSheet.tsx upgrade; `useDrag` on handle bar; `useMotionValue` y-position; detent snap via `animate()` |
| LAYT-01 | Full-page modals replaced with bottom sheet overlays where content is compact | All existing Modal consumers auto-upgrade after Modal→BottomSheet rename; `detent` prop added |
| LAYT-02 | User can tap protocol/meal items to expand details inline without navigating away | `AnimatePresence` + `m.div` height animation; accordion state (one open at a time); `onSelect` callback replaced |
</phase_requirements>

---

## Summary

Phase 4 replaces two high-friction interaction patterns: (1) tap-to-confirm actions that interrupt context (checkbox to complete, modal navigation to add/edit), and (2) full-screen overlays for compact forms. The implementation has three distinct subsystems: swipe gesture wrappers around list items, an upgraded bottom sheet component, and accordion inline expansion for detail cards.

`@use-gesture/react` v10.3.1 is NOT currently installed (it's referenced in CONTEXT.md as "already installed" but `package.json` and `node_modules` do not contain it). It must be installed as a first task. It is compatible with React 19 (peer dep `>= 16.8.0`). The `motion` package is at v12.36.0 — `useMotionValue`, `useTransform`, and `animate` are available and sufficient for all gesture-driven animation needs without a separate library.

The architecture centers on three new/upgraded abstractions: `SwipeActionRow` (reusable gesture wrapper), `BottomSheet` (upgraded Modal), and the accordion pattern baked into `ProtocolList` and `MealsPage` card items. The Toast system needs one surgical extension: an optional `action` button with callback on the toast message type.

**Primary recommendation:** Install `@use-gesture/react`, implement `SwipeActionRow` as a reusable hook + wrapper component (not per-component), upgrade Modal→BottomSheet with `useMotionValue`-driven y position, and extend Toast with an undo action variant.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@use-gesture/react` | 10.3.1 | Touch/mouse gesture recognition with velocity, axis locking, cancel | Industry standard for React gesture handling; handles pointer capture, prevents scroll hijacking, provides rich state (velocity, direction, swipe) |
| `motion` (already installed) | 12.36.0 | `useMotionValue`, `useTransform`, `animate()` for gesture-driven animation | `useMotionValue` + `useTransform` enables declarative color/opacity interpolation from drag offset without re-renders |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `motion/react-m` (already used) | 12.36.0 | Animated DOM elements | `m.div` for swipe container, sheet, expanded cards |
| `AnimatePresence` (already used) | 12.36.0 | Mount/unmount animations | Height collapse after swipe-delete, inline card expansion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@use-gesture/react` | `motion` built-in `drag` prop | Motion's drag is layout-constrained and doesn't provide axis locking or velocity-based dismiss without custom math. `@use-gesture` is the correct tool for gesture recognition separate from animation. |
| `useMotionValue` y-position | CSS `transform` + state | CSS approach causes layout recalculation; `useMotionValue` updates bypass React render cycle entirely |
| Custom undo timer | Third-party toast library | Existing `Toast.tsx` system is minimal and already wired; extension is 10 lines |

**Installation:**
```bash
npm install @use-gesture/react
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/ui/
│   ├── BottomSheet.tsx      # Renamed+upgraded Modal.tsx (drag-to-dismiss, detents)
│   ├── SwipeActionRow.tsx   # Reusable swipe gesture wrapper component
│   └── Toast.tsx            # Extended with undo action variant
├── hooks/
│   └── useSwipeAction.ts    # Extracted useDrag logic (shared by TaskBlock, ProtocolList, MealsPage)
└── utils/
    └── toast.ts             # Extended: showToastWithAction(text, actionLabel, onAction)
```

### Pattern 1: SwipeAction Hook + Wrapper

**What:** A `useSwipeAction` hook encapsulates `useDrag` from `@use-gesture/react` and returns `bind()` props + `motionX` value for the parent container. A `SwipeActionRow` wrapper component renders the colored background reveal layer underneath, clips it, and applies the drag bind to the item content.

**When to use:** Any deletable list item (TaskBlock, ProtocolList items, MealTemplate items)

**Why extract a hook instead of per-component:** Three separate components need identical gesture logic. Per-component duplication creates three sites where spring constants, threshold percentages, and axis-lock behavior must be kept in sync. A single hook tests once.

```typescript
// Source: @use-gesture/react docs + motion/react docs
import { useDrag } from '@use-gesture/react'
import { useMotionValue, useTransform, animate } from 'motion/react'
import { useRef } from 'react'

interface UseSwipeActionOptions {
  onComplete?: () => void   // swipe-right callback
  onDelete?: () => void     // swipe-left callback
  itemWidth: number         // used to compute 40% threshold
}

export function useSwipeAction({ onComplete, onDelete, itemWidth }: UseSwipeActionOptions) {
  const x = useMotionValue(0)
  const THRESHOLD = itemWidth * 0.4
  const directionLocked = useRef<'left' | 'right' | null>(null)

  // Background color: green (right) or red (left) interpolated from x
  const rightBgOpacity = useTransform(x, [0, THRESHOLD], [0, 1])
  const leftBgOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0])

  const bind = useDrag(
    ({ active, movement: [mx, my], velocity: [vx], direction: [dx], cancel }) => {
      // Lock direction after 10px movement
      if (!directionLocked.current && Math.abs(mx) > 10) {
        // Cancel if vertical dominant (scroll hijack prevention)
        if (Math.abs(my) > Math.abs(mx)) { cancel(); return }
        directionLocked.current = dx > 0 ? 'right' : 'left'
      }

      if (!directionLocked.current) return

      // Apply rubber-band resistance past threshold
      const raw = mx
      const clamped = raw > 0
        ? Math.min(raw, THRESHOLD + (raw - THRESHOLD) * 0.3)  // right: rubber band
        : Math.max(raw, -THRESHOLD + (raw + THRESHOLD) * 0.3)  // left: rubber band

      x.set(active ? clamped : 0)

      if (!active) {
        const crossed = Math.abs(raw) >= THRESHOLD
        if (crossed && directionLocked.current === 'right' && onComplete) {
          // Fly off right then collapse — handled in component
          onComplete()
        } else if (crossed && directionLocked.current === 'left' && onDelete) {
          onDelete()
        } else {
          animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
        }
        directionLocked.current = null
      }
    },
    {
      axis: 'lock',
      filterTaps: true,
      pointer: { capture: false },  // allow scroll to take over
    }
  )

  return { bind, x, rightBgOpacity, leftBgOpacity }
}
```

### Pattern 2: BottomSheet with Detents

**What:** Upgrade `Modal.tsx` → `BottomSheet.tsx`. Replace the static `slideUp` variant with a `useMotionValue` y-position driven by both `useDrag` on the handle and programmatic `animate()` calls. Detents are percentage-of-viewport heights translated to pixel y-offsets from the bottom.

**When to use:** All add/edit flows, quick-view detail sheets (all existing Modal consumers)

```typescript
// Source: motion/react docs — useMotionValue + useDrag integration
import { useMotionValue, animate } from 'motion/react'
import { useDrag } from '@use-gesture/react'

// Detent pixel offsets from the bottom of the screen (positive = lower = more closed)
const DETENTS = {
  peek: window.innerHeight * 0.6,    // 40% visible
  half: window.innerHeight * 0.5,    // 50% visible
  full: window.innerHeight * 0.1,    // 90% visible (10% from top)
}

// y = 0 means sheet is at its maximum open height (top)
// y = window.innerHeight means fully off-screen (closed)
const y = useMotionValue(window.innerHeight)

// Open: animate y to detent position
function openSheet(detent: 'peek' | 'half' | 'full') {
  animate(y, DETENTS[detent], { type: 'spring', stiffness: 180, damping: 24 })
}

// Drag handle bind
const bind = useDrag(
  ({ active, movement: [, my], velocity: [, vy], last }) => {
    // Only activate drag when content is scrolled to top (checked via contentRef.scrollTop)
    if (contentRef.current?.scrollTop > 0) return

    const newY = currentDetentY + my
    y.set(active ? Math.max(DETENTS.full, newY) : currentDetentY)

    if (last) {
      const pastThreshold = my > (window.innerHeight * 0.3)
      const fastFlick = vy > 0.5  // velocity in px/ms — 500px/s = 0.5px/ms
      if (pastThreshold || fastFlick) {
        onClose()  // animate y to window.innerHeight
      } else {
        animate(y, currentDetentY, { type: 'spring', stiffness: 180, damping: 24 })
      }
    }
  },
  { axis: 'y', filterTaps: true }
)

// Backdrop opacity interpolated from y position
const backdropOpacity = useTransform(y, [DETENTS.full, window.innerHeight], [0.5, 0])
```

**Critical constraint:** `useTransform` and `useMotionValue` are from `motion/react`, NOT `motion/react-m`. Import from `'motion/react'` directly.

### Pattern 3: Accordion Inline Expansion

**What:** Single expanded ID tracked in local page state. Cards render a `m.div` wrapping the expanded content inside `AnimatePresence`. Height animates from 0 to "auto" via `initial={{ height: 0, opacity: 0 }}` → `animate={{ height: 'auto', opacity: 1 }}`.

**When to use:** ProtocolList, MealsPage template list

```typescript
// Source: motion/react AnimatePresence docs
const [expandedId, setExpandedId] = useState<number | null>(null)

function toggleExpand(id: number) {
  setExpandedId(prev => prev === id ? null : id)
}

// In the card render:
<AnimatePresence initial={false}>
  {expandedId === protocol.id && (
    <m.div
      key="expanded"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1, transition: snappy }}
      exit={{ height: 0, opacity: 0, transition: snappy }}
      style={{ overflow: 'hidden' }}
    >
      {/* expanded content */}
    </m.div>
  )}
</AnimatePresence>
```

**`initial={false}` on AnimatePresence:** prevents height animation from firing on initial list mount (only animates on expand/collapse user action). This is the correct flag for accordion patterns.

### Pattern 4: Undo Toast Extension

**What:** Extend `toast.ts` with `showToastWithAction(text, actionLabel, onAction, duration)`. Extend `Toast.tsx` to render an inline action button when the toast message includes an action. Add a countdown bar (CSS width transition from 100% to 0 over 5s).

```typescript
// Extension to utils/toast.ts
interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
  action?: { label: string; onAction: () => void }
  duration?: number
}

export function showToastWithAction(
  text: string,
  actionLabel: string,
  onAction: () => void,
  duration = 5000
) {
  addToastFn?.(text, 'info', { label: actionLabel, onAction }, duration)
}
```

### Anti-Patterns to Avoid

- **Wrapping `<div {...bind()}>` in a `<m.div style={{ x }}>` sibling:** The `bind()` from `useDrag` must go on the element that receives DOM events. The motion value `x` goes on the `m.div` that visually moves. These are two different elements — the outer container gets `bind()`, the inner `m.div` gets `style={{ x }}`.
- **Using `motion`'s built-in `drag` prop for swipe-to-complete:** Motion's `drag` constraint system is for bounded drag (cards, sliders). It cannot trigger callbacks at velocity thresholds or integrate with the axis-lock + scroll-cancel pattern required here. Use `@use-gesture/react` for gesture recognition and `useMotionValue` + `animate()` for the animation.
- **Calling `animate(y, ...)` inside `useDrag` on every frame during drag:** Only call `animate()` when the gesture ends (`last: true`). During active drag, call `y.set(newValue)` directly — `animate()` starts a spring that fights with the drag.
- **Applying `axis: 'lock'` globally when mixing swipe-delete + scroll:** `axis: 'lock'` on `useDrag` is per-gesture. It locks the axis for the duration of one gesture. It does not prevent the page from scrolling because scroll is handled by the browser's default behavior — controlled via `pointer: { capture: false }`.
- **Height: 'auto' animation without `overflow: hidden`:** AnimatePresence cannot animate to `height: 'auto'` without the parent having `overflow: hidden` — otherwise content flashes at full height during the opening frame.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gesture velocity + axis detection | Custom `touchstart/touchmove/touchend` state machine | `@use-gesture/react useDrag` | Pointer capture, passive event handling, multi-touch disambiguation, scroll conflict resolution are all handled. Custom implementations miss edge cases (e.g., rapid direction reversal, stylus input, browser's passive listener opt-in). |
| Background color interpolation from drag offset | Manual lerp in drag handler → setState → re-render | `useTransform(x, [0, threshold], [color1, color2])` | `useTransform` updates at animation frame rate without re-rendering the React tree. Color lerp via setState fires 60 React renders/second. |
| Sheet snap-point physics | Manual spring equation | `animate(y, target, { type: 'spring', stiffness, damping })` | Correct critical damping requires solving a second-order ODE. Motion's spring engine handles this correctly including interruption (velocity preservation when a new animation starts mid-gesture). |
| Accordion height animation | `max-height` CSS transition | `AnimatePresence` + `height: 'auto'` | `max-height` requires knowing the maximum height value. `height: 'auto'` animation in Motion uses ResizeObserver to measure actual content height and animates to it correctly. |

**Key insight:** Gesture recognition and animation are separate concerns. `@use-gesture` owns "what the user is doing" (velocity, direction, threshold). Motion owns "how it looks" (spring physics, interpolation). Mixing them (using Motion's `drag` for gesture logic, or custom touch handlers for animation) breaks both concerns.

---

## Common Pitfalls

### Pitfall 1: Scroll Hijacking on Mobile
**What goes wrong:** Swipe-left/right gesture intercepts vertical scroll — user cannot scroll the task list.
**Why it happens:** Touch events are captured by the gesture handler before the browser scroll system can claim them.
**How to avoid:**
- `pointer: { capture: false }` in `useDrag` options — tells the browser to retain default scroll behavior
- In the handler: check if `|my| > |mx|` in the first 10px of movement, call `cancel()` if true
- This is the "vertical scroll takes priority" decision from CONTEXT.md — implement both guards
**Warning signs:** Testers report that scrolling the task list feels "sticky" or jumps sideways.

### Pitfall 2: `useMotionValue` / `useTransform` Server-Side or Test Environment
**What goes wrong:** Tests that render `BottomSheet` or `SwipeActionRow` fail because `window.innerHeight` is 0 in jsdom, producing `DETENTS.full = 0`, causing divide-by-zero or unexpected animation states.
**Why it happens:** jsdom has `window.innerHeight = 0` by default.
**How to avoid:** Guard detent calculations: `const vh = window.innerHeight || 600`. Set `window.innerHeight = 800` in test setup files when testing BottomSheet.
**Warning signs:** Tests pass individually but fail when BottomSheet is open state.

### Pitfall 3: Soft-Delete Race Condition
**What goes wrong:** User swipes to delete item A, undo timer starts. User swipes to delete item B. Item A's deletion fires immediately (correct), but item B's undo toast replaces A's toast without committing A first.
**Why it happens:** The undo state (pending deletion item + timer) is not committed before being replaced.
**How to avoid:** The undo state must be a single slot. When a new swipe-delete fires: (1) immediately commit the previous pending deletion to DB, (2) clear old timer, (3) set new pending deletion with new timer.
**Warning signs:** Deleted items reappear after navigating away, or items that should have been deleted persist.

### Pitfall 4: `AnimatePresence initial={false}` Missing
**What goes wrong:** Every time the protocol list mounts (page navigation), all collapsed items animate as if expanding from height 0 even though they start collapsed.
**Why it happens:** AnimatePresence without `initial={false}` runs exit/enter animations on initial render.
**How to avoid:** Always use `<AnimatePresence initial={false}>` on accordion wrappers. This flag tells AnimatePresence to skip animations on the first render.
**Warning signs:** All cards appear to "blink" or expand/collapse briefly when navigating to ProtocolsPage.

### Pitfall 5: BottomSheet Drag vs. Content Scroll Conflict
**What goes wrong:** User tries to scroll tall content inside the sheet and instead dismisses the sheet.
**Why it happens:** `useDrag` on the sheet container captures all vertical pointer events, including scrolling.
**How to avoid:** The drag bind must be applied ONLY to the handle bar element, not the content container. Check `contentRef.current.scrollTop === 0` before allowing dismiss — if content is not scrolled to top, `cancel()` the gesture.
**Warning signs:** Users on long-form sheets (MealTemplateEditor) accidentally dismiss when scrolling.

### Pitfall 6: `height: 'auto'` with AnimatePresence exit
**What goes wrong:** Card collapses instantly (no animation) when closing via AnimatePresence exit.
**Why it happens:** During exit, Motion measures `height: 'auto'` as 0 if the element is already being removed from layout.
**How to avoid:** The exiting element must have `overflow: hidden` applied. Use `style={{ overflow: 'hidden' }}` on the `m.div`, not a className (Motion needs the inline style for measurement).
**Warning signs:** Expanded cards snap closed instead of animating.

---

## Code Examples

### useDrag State Properties (authoritative)
```typescript
// Source: https://use-gesture.netlify.app/docs/state/
// In useDrag callback:
({
  active,          // boolean — true while gesture is ongoing
  movement,        // [mx, my] — displacement from gesture start
  offset,          // [ox, oy] — cumulative offset
  velocity,        // [vx, vy] — momentum in px/ms
  direction,       // [dx, dy] — -1, 0, or 1 per axis
  swipe,           // [sx, sy] — -1, 0, or 1 indicating swipe detection
  tap,             // boolean — true if displacement < 3px (filterTaps: true)
  cancel,          // function — imperatively cancel gesture
  last,            // boolean — true on final event (equivalent to !active)
  memo,            // value returned from previous invocation
})
```

### Connecting @use-gesture/react with motion/react
```typescript
// Source: motion/react docs + @use-gesture/react docs
import { useDrag } from '@use-gesture/react'
import { useMotionValue, useTransform } from 'motion/react'  // NOT motion/react-m
import * as m from 'motion/react-m'

// x is a MotionValue — updating it does NOT trigger React re-render
const x = useMotionValue(0)

// useTransform creates a derived MotionValue — also zero re-renders
const bgOpacity = useTransform(x, [0, threshold], [0, 1])

const bind = useDrag(({ active, movement: [mx] }) => {
  x.set(active ? mx : 0)
})

return (
  <div {...bind()}>          {/* gesture bind on outer container */}
    <m.div style={{ x }}>   {/* motion value drives transform */}
      {children}
    </m.div>
  </div>
)
```

### Animate to value after gesture ends
```typescript
// Source: motion/react docs — animate() imperative API
import { animate } from 'motion/react'

// Spring back to origin
animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })

// Fly to completion (off-screen right)
animate(x, window.innerWidth, { type: 'spring', stiffness: 400, damping: 28, mass: 1 })
```

### Height: auto AnimatePresence accordion
```typescript
// Source: motion/react AnimatePresence docs
<AnimatePresence initial={false}>
  {isExpanded && (
    <m.div
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={snappy}
      style={{ overflow: 'hidden' }}  // required for height: auto measurement
    >
      {expandedContent}
    </m.div>
  )}
</AnimatePresence>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `touchstart/touchmove/touchend` manually | `@use-gesture/react useDrag` | ~2020 | Pointer capture, passive events, multi-device handled automatically |
| CSS `transition: max-height` for accordion | Motion `height: 'auto'` via AnimatePresence | Motion v6+ | No need to know max content height; spring physics instead of linear |
| `transform: translateY` + state → re-render | `useMotionValue` + `useTransform` | Motion v4+ | Zero React re-renders during animation |
| `window.innerHeight` detents calculated once | Calculate at gesture time or use `vh` units | Always | Recalculate on resize; iOS safari changes `innerHeight` on scroll |

**Deprecated/outdated:**
- `useSwipe.ts` (current hook): touch-start/end only, no velocity, no axis lock, fires on release only — will be replaced by `@use-gesture/react`
- `ConfirmDialog.tsx` for list item deletion: replaced by swipe-left-to-delete + undo toast for items in TaskBlock, ProtocolList, MealsPage

---

## Open Questions

1. **`domMax` vs `domAnimation` for gesture-heavy pages**
   - What we know: Phase 1 decision: `domMax` designated for gesture-heavy pages; `domAnimation` globally
   - What's unclear: Whether `useDrag` from `@use-gesture/react` (rather than Motion's built-in drag) requires `domMax` features or if `domAnimation` is sufficient for swipe wrappers
   - Recommendation: Start with existing `domAnimation` global. If gesture-triggered spring animations are choppy, add `domMax` to SchedulePage, ProtocolsPage, MealsPage. Motion's `domMax` adds layout animations and advanced features — not required for `useMotionValue`+`animate()`.

2. **Keyboard-aware repositioning for BottomSheet forms**
   - What we know: Listed as Claude's discretion; iOS Safari raises `visualViewport` when keyboard appears
   - What's unclear: Whether existing forms in `TaskModal`, `MealTemplateEditor` are currently broken when keyboard appears (inputs hidden behind keyboard)
   - Recommendation: Implement if testing shows forms are keyboard-obscured. Use `visualViewport.addEventListener('resize', ...)` to adjust sheet y position. Low risk to defer to verification.

3. **`@use-gesture/react` is NOT currently installed**
   - What we know: `package.json` does not list it; `node_modules/@use-gesture` does not exist
   - What's unclear: CONTEXT.md states it is "already installed" — this was incorrect at time of research
   - Recommendation: Wave 0 task must `npm install @use-gesture/react` before any gesture work. This is the install blocker for the entire phase.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + Testing Library 16.3.2 |
| Config file | `vite.config.ts` (test block, `globals: true`, `environment: 'jsdom'`) |
| Quick run command | `npx vitest run src/__tests__/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTR-02 | SwipeActionRow calls `onComplete` when x offset exceeds 40% threshold | unit | `npx vitest run src/__tests__/SwipeActionRow.test.tsx -t "calls onComplete"` | Wave 0 |
| INTR-02 | SwipeActionRow springs back when released below threshold | unit | `npx vitest run src/__tests__/SwipeActionRow.test.tsx -t "springs back"` | Wave 0 |
| INTR-03 | SwipeActionRow calls `onDelete` on left swipe past threshold | unit | `npx vitest run src/__tests__/SwipeActionRow.test.tsx -t "calls onDelete"` | Wave 0 |
| INTR-03 | Undo toast appears after swipe-delete with action button | unit | `npx vitest run src/__tests__/Toast.test.tsx -t "undo action"` | Wave 0 |
| INTR-04 | BottomSheet renders when isOpen=true | unit | `npx vitest run src/__tests__/BottomSheet.test.tsx -t "renders when open"` | Wave 0 |
| INTR-04 | BottomSheet calls onClose when backdrop clicked | unit | `npx vitest run src/__tests__/BottomSheet.test.tsx -t "backdrop dismisses"` | Wave 0 |
| LAYT-01 | BottomSheet accepts detent prop and renders children | unit | `npx vitest run src/__tests__/BottomSheet.test.tsx -t "detent prop"` | Wave 0 |
| LAYT-02 | ProtocolList expands item on tap and collapses on second tap | unit | `npx vitest run src/__tests__/ProtocolList.test.tsx -t "accordion"` | Wave 0 |
| LAYT-02 | Only one protocol item expanded at a time | unit | `npx vitest run src/__tests__/ProtocolList.test.tsx -t "one expanded"` | Wave 0 |

**Note on gesture tests in jsdom:** `@use-gesture/react` gesture tests require simulating `pointerdown`/`pointermove`/`pointerup` events, not `touchstart`/`touchend`. jsdom supports pointer events. Use `fireEvent.pointerDown`, `fireEvent.pointerMove`, `fireEvent.pointerUp` with `clientX` values. Set `window.innerHeight = 800` in test setup for BottomSheet tests.

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/SwipeActionRow.test.tsx src/__tests__/BottomSheet.test.tsx src/__tests__/ProtocolList.test.tsx src/__tests__/Toast.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/SwipeActionRow.test.tsx` — covers INTR-02, INTR-03
- [ ] `src/__tests__/BottomSheet.test.tsx` — covers INTR-04, LAYT-01
- [ ] `src/__tests__/Toast.test.tsx` — covers INTR-03 undo variant
- [ ] `src/__tests__/ProtocolList.test.tsx` (update existing) — covers LAYT-02 accordion
- [ ] `npm install @use-gesture/react` — required before any gesture implementation

---

## Sources

### Primary (HIGH confidence)
- [use-gesture.netlify.app/docs/state/](https://use-gesture.netlify.app/docs/state/) — useDrag state properties (movement, velocity, direction, cancel, last)
- [use-gesture.netlify.app/docs/options/](https://use-gesture.netlify.app/docs/options/) — axis, axisThreshold, filterTaps, pointer.capture options
- [motion.dev/docs/react-use-drag-controls](https://motion.dev/docs/react-use-drag-controls) — useDragControls pattern
- [motion.dev/docs/react-motion-value](https://motion.dev/docs/react-motion-value) — useMotionValue, useTransform

### Secondary (MEDIUM confidence)
- [motion.dev/docs/react-animation](https://motion.dev/docs/react-animation) — AnimatePresence height:auto pattern
- npm show @use-gesture/react — verified v10.3.1 is latest, peer dep `>= 16.8.0` (React 19 compatible)
- Direct node_modules inspection — confirmed motion@12.36.0 installed, @use-gesture/react NOT installed

### Tertiary (LOW confidence)
- None — all critical claims verified against official sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — @use-gesture/react version verified via npm, React 19 compat verified via peer deps, motion version verified via node_modules
- Architecture: HIGH — useDrag + useMotionValue pattern is the documented integration; AnimatePresence height:auto is official API
- Pitfalls: HIGH — scroll hijacking and soft-delete race condition are well-documented failure modes; jsdom innerHeight=0 verified by test environment inspection
- Install blocker: HIGH — directly verified @use-gesture/react is absent from node_modules

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (@use-gesture/react is stable/unmaintained; motion API stable)
