# Architecture Research

**Domain:** Animation-heavy mobile PWA UX — React + Framer Motion integration
**Researched:** 2026-03-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Gesture Layer                          │
│  useSwipe  useDragControls  Reorder.Group  touch-action CSS │
├─────────────────────────────────────────────────────────────┤
│                    Animation Layer                          │
│  AnimatePresence  motion.*  layoutId  MotionConfig          │
├──────────────┬──────────────────────────┬───────────────────┤
│   AppShell   │      Page Components     │  UI Primitives    │
│  (layout +   │  Dashboard / Schedule /  │  Button / Card /  │
│  transitions)│  Protocols / Meals /     │  Modal / Toast    │
│              │  Settings                │                   │
├──────────────┴──────────────────────────┴───────────────────┤
│                    Routing Layer                            │
│         React Router v6 — BrowserRouter / Outlet           │
├─────────────────────────────────────────────────────────────┤
│                    State Layer                              │
│   scheduleStore  mealStore  protocolStore  settingsStore    │
├─────────────────────────────────────────────────────────────┤
│                 Persistence Layer                           │
│              Dexie (IndexedDB) — unchanged                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `AppShell` | Page transition orchestration, layout, scroll reset | React Router `location`, Framer `AnimatePresence` |
| `BottomNav` | Tab navigation, active indicator animation | React Router `location`, `navigate` |
| `motion.*` wrappers | Enter/exit/layout animations on individual elements | Parent `AnimatePresence`, sibling `layoutId` |
| `Reorder.Group` / `Reorder.Item` | Drag-to-reorder lists | Zustand store (write-back on reorder) |
| `useSwipe` | Horizontal swipe detection (existing, wire to FM gesture) | Page components |
| `MotionConfig` | Global animation config (reduced-motion, duration tokens) | All `motion.*` descendants |
| UI Primitives (Button, Card, Modal) | Micro-interaction animations, whileTap/whileHover | Framer motion props directly |

## Recommended Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # AnimatePresence + page transition wrapper
│   │   ├── BottomNav.tsx       # Animated tab indicator (layoutId)
│   │   └── PageTransition.tsx  # Reusable motion.div wrapper for pages
│   ├── ui/
│   │   ├── Button.tsx          # whileTap scale, whileHover lift
│   │   ├── Card.tsx            # layout animation, whileTap feedback
│   │   ├── Modal.tsx           # AnimatePresence enter/exit
│   │   └── ...
│   ├── dashboard/
│   │   └── ...                 # staggerChildren on DashboardGrid cards
│   ├── schedule/
│   │   ├── TaskBlock.tsx       # drag gesture + swipe-to-complete
│   │   └── Timeline.tsx        # Reorder.Group for drag-reorder
│   └── ...
├── hooks/
│   ├── useSwipe.ts             # existing — replace internals with FM pan gesture OR keep
│   ├── useReducedMotion.ts     # wraps FM's useReducedMotion, exports boolean
│   └── useDragControls.ts      # optional: wraps FM useDragControls
├── motion/
│   ├── variants.ts             # all shared animation variant definitions
│   ├── transitions.ts          # spring/tween presets
│   └── config.tsx              # MotionConfig provider + reduced-motion logic
└── ...
```

### Structure Rationale

- **`motion/` directory:** Centralizes all variant definitions and transitions. Pages/components import named variants rather than defining inline objects — this keeps animation behavior consistent and easy to tune globally.
- **`PageTransition.tsx`:** A single reusable wrapper component prevents each page from reimplementing the same `motion.div` + `variants` pattern.
- **`useReducedMotion.ts`:** One place to read `prefers-reduced-motion` so all components use the same source of truth without individually calling Framer's hook.

## Architectural Patterns

### Pattern 1: AnimatePresence on Outlet via Keyed motion.div

**What:** Wrap the `<Outlet />` in a `motion.div` keyed on `location.pathname` inside `AnimatePresence`. This is the only pattern that works correctly with React Router v6's Outlet — directly wrapping `<Outlet>` in AnimatePresence does not work because AnimatePresence only tracks its direct children.

**When to use:** All page-level transitions (slide in/out, fade).

**Trade-offs:** `mode="wait"` is slowest (sequential) but cleanest. `mode="popLayout"` is faster and feels more native — it removes the exiting page from layout flow immediately while it animates out. Use `mode="popLayout"` for the app.

**Example:**
```typescript
// AppShell.tsx
import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import PageTransition from './PageTransition'

export default function AppShell() {
  const location = useLocation()
  return (
    <div className="flex flex-col min-h-dvh">
      <AnimatePresence mode="popLayout" initial={false}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}

// motion/variants.ts
export const pageVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
}

// components/layout/PageTransition.tsx
import { motion } from 'framer-motion'
import { pageVariants } from '../../motion/variants'
import { pageTransition } from '../../motion/transitions'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  )
}
```

---

### Pattern 2: layoutId for Shared Element / Active Indicator

**What:** Two components rendered at the same time share the same `layoutId` — Framer Motion automatically animates between their geometries. Use for the bottom nav active indicator pill: instead of showing/hiding a static element per tab, one `motion.div` with `layoutId="tab-indicator"` visually slides between tabs.

**When to use:** Nav indicator, card expand/collapse, any element that "moves" between positions across renders.

**Trade-offs:** Requires both elements to be simultaneously rendered (or AnimatePresence-wrapped for appear/disappear). The `layout` prop on parent containers is needed to avoid layout thrashing during sibling layout changes.

**Example:**
```typescript
// BottomNav.tsx
{isActive && (
  <motion.div
    layoutId="tab-indicator"
    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-bamboo"
    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
  />
)}
```

---

### Pattern 3: Stagger Children on List Mounts

**What:** Parent `motion.div` with `staggerChildren` in its `animate` variant causes child `motion.*` elements to animate in sequentially. Used for dashboard card grid, protocol list, meal list — content feels composed rather than popping in all at once.

**When to use:** Any list or grid that mounts with data. Keep stagger delay short (0.05–0.08s) or it feels sluggish.

**Trade-offs:** Stagger only fires on initial mount (or when the parent key changes). Subsequent data changes use `layout` animations, not stagger. Do not stagger on every re-render.

**Example:**
```typescript
// motion/variants.ts
export const listVariants = {
  animate: { transition: { staggerChildren: 0.06 } }
}
export const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

// DashboardGrid.tsx
<motion.div variants={listVariants} initial="initial" animate="animate">
  {cards.map(card => (
    <motion.div key={card.id} variants={itemVariants}>
      <ProgressCard {...card} />
    </motion.div>
  ))}
</motion.div>
```

---

### Pattern 4: Drag Gesture via Framer Motion (replace useSwipe)

**What:** Replace the existing touch-event-based `useSwipe` hook with Framer Motion's `drag` prop and `onDragEnd`. FM handles inertia, constraint clamping, and visual feedback during drag — `useSwipe` only fires at the end of a touch and has no visual tracking.

**When to use:** Swipe-to-complete on TaskBlock, drag-to-reorder on task lists (use `Reorder.Group`/`Reorder.Item`).

**Trade-offs:** FM drag requires `touch-action: none` on the draggable element, which breaks scroll unless carefully scoped (`dragDirectionLock` or `drag="x"`). Always set `drag="x"` not `drag={true}` unless you specifically need both axes.

**Example:**
```typescript
// TaskBlock.tsx — swipe-to-complete
<motion.div
  drag="x"
  dragDirectionLock
  dragConstraints={{ left: -120, right: 0 }}
  dragElastic={{ left: 0.2, right: 0 }}
  onDragEnd={(_, info) => {
    if (info.offset.x < -80) {
      hapticSuccess()
      completeTask(task.id)
    }
  }}
  style={{ touchAction: 'pan-y' }}
>
  {/* task content */}
</motion.div>
```

---

### Pattern 5: MotionConfig Provider for Global Tokens

**What:** Wrap the app in `<MotionConfig>` to set global `transition` defaults and `reducedMotion` behavior. This avoids repeating transition objects on every component and automatically respects `prefers-reduced-motion`.

**When to use:** Always — install at root, above `BrowserRouter`.

**Example:**
```typescript
// main.tsx or App.tsx
import { MotionConfig } from 'framer-motion'

<MotionConfig
  reducedMotion="user"
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  <BrowserRouter>...</BrowserRouter>
</MotionConfig>
```

## Data Flow

### Animation State Flow

```
User Interaction (tap / drag / swipe)
    ↓
Framer Motion gesture handler (onTap, onDragEnd, onPanEnd)
    ↓
Haptic feedback (haptics.ts) [side effect, no state]
    ↓
Zustand action (completeTask, reorderTasks, etc.)
    ↓
Zustand store state update
    ↓
React re-render → Framer Motion layout animations reflow
    ↓
Dexie persistence (async, non-blocking)
```

### Page Transition Flow

```
User taps BottomNav tab
    ↓
navigate(path) [React Router]
    ↓
location.pathname changes
    ↓
AnimatePresence detects key change on PageTransition wrapper
    ↓
Old page: animate to exit variant (opacity 0, x -16)
New page: mount → animate to animate variant (opacity 1, x 0)
    [mode="popLayout": these overlap; old exits while new enters]
    ↓
AppShell scroll reset (existing useEffect on location)
```

### Key Data Flows

1. **Drag-to-reorder:** `Reorder.Item` drag → `onReorder` callback → Zustand `reorderTasks()` → optimistic UI (FM layout animation) → Dexie write
2. **Modal open/close:** local boolean state toggle → `AnimatePresence` on Modal → `motion.div` scale/fade in/out → no Zustand involvement
3. **Dashboard cards mount:** page transition completes → stagger variants fire on `DashboardGrid` → cards animate in sequentially
4. **Tab indicator:** `location.pathname` change → `isActive` boolean flips → `layoutId="tab-indicator"` div re-mounts on new tab → FM animates position

## Scaling Considerations

This is a personal-use offline PWA. Scaling in the traditional sense is not a concern. Animation performance is the relevant "scale" axis.

| Device Class | Risk | Mitigation |
|---|---|---|
| Modern iOS/Android | None | Default Framer Motion settings are fine |
| Mid-range Android | Jank on layout animations | Prefer `transform`/`opacity` only; avoid `layout` on large lists |
| Low-end / older devices | `prefers-reduced-motion` may be set | `MotionConfig reducedMotion="user"` handles this automatically |

### Performance Priorities

1. **First bottleneck:** Layout animations on large task lists — `Reorder.Group` + `layout` on many items causes reflow. Cap visible list length or virtualize before enabling layout animations.
2. **Second bottleneck:** `willChange: transform` on too many elements simultaneously — browsers cap GPU layer count. Only apply `willChange` to actively animating elements.

## Anti-Patterns

### Anti-Pattern 1: Wrapping Outlet Directly in AnimatePresence

**What people do:**
```typescript
<AnimatePresence>
  <Outlet /> {/* WRONG */}
</AnimatePresence>
```

**Why it's wrong:** AnimatePresence can only track exit animations on its direct children. `<Outlet />` renders a stable component shell — its key never changes from AnimatePresence's perspective, so exit animations never fire.

**Do this instead:** Wrap a `motion.div` with `key={location.pathname}` inside AnimatePresence, then render `<Outlet />` inside that div.

---

### Anti-Pattern 2: Defining Variant Objects Inline

**What people do:**
```typescript
<motion.div animate={{ opacity: 0, x: -16 }} exit={{ opacity: 1, x: 0 }} />
```
on every component, repeated everywhere.

**Why it's wrong:** Variants become inconsistent across the app, animation timing drifts between components, and tuning requires touching dozens of files.

**Do this instead:** Define named variants in `src/motion/variants.ts`, import and reference them by name. One file to tune, consistent behavior everywhere.

---

### Anti-Pattern 3: Using drag={true} on Elements Inside Scroll Containers

**What people do:** Apply `drag` to list items inside a scrolling `<main>` without scoping the drag axis.

**Why it's wrong:** `drag={true}` captures both X and Y touch events, preventing vertical scroll. On iOS this causes the whole page to stop scrolling when touching a draggable item.

**Do this instead:** Always use `drag="x"` with `style={{ touchAction: 'pan-y' }}` for horizontal swipe gestures inside scroll containers.

---

### Anti-Pattern 4: Animating on Every Zustand Re-render

**What people do:** Place stagger or mount animations on components that re-render frequently due to Zustand subscriptions (e.g., a clock tick or progress update).

**Why it's wrong:** `initial`/`animate` only fires once on mount — but if `key` props change (e.g., keying a list item by index instead of ID), components re-mount and re-animate on every data update, causing constant jitter.

**Do this instead:** Always key list items by stable entity ID (`task.id`, `meal.id`), never by array index. Layout changes (reorder, add, remove) use `layout` prop, not re-mounts.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `AppShell` ↔ `AnimatePresence` | `location.pathname` as key | `initial={false}` on AnimatePresence prevents animation on first load |
| `motion.*` ↔ Zustand stores | One-way: gesture handlers call Zustand actions | Zustand state never directly drives animation values — only triggers re-renders that FM responds to via `layout` |
| `Reorder.Group` ↔ `scheduleStore` | `onReorder` callback → `reorderTasks()` | FM handles the visual; Zustand holds source of truth |
| `MotionConfig` ↔ all `motion.*` | React context propagation | Must be an ancestor of all animated components; place above Router |
| `useSwipe` (existing) ↔ FM gestures | Replace or coexist | For swipe-to-complete on TaskBlock, replace with FM `drag`. For page-level swipe navigation (if added), FM `onPanEnd` on the PageTransition wrapper. |

### Suggested Build Order (Phase Dependencies)

1. **MotionConfig + variants.ts + transitions.ts** — install the foundation. All later work imports from here. No UI changes yet.
2. **PageTransition + AnimatePresence in AppShell** — page transitions work immediately for all 5 pages. Validates the FM + React Router integration before touching individual pages.
3. **BottomNav layoutId indicator** — isolated, low-risk, high visual payoff. Validates layoutId pattern.
4. **UI Primitives (Button, Card, Modal) micro-interactions** — whileTap, whileHover, AnimatePresence on Modal. These are used everywhere; doing them early means all subsequent work inherits polished primitives.
5. **Dashboard stagger + data visualization animations** — read-only, no gesture complexity.
6. **TaskBlock swipe-to-complete (FM drag="x")** — first real gesture. Validate touch-action + scroll compatibility here before replicating to other lists.
7. **Timeline/Protocol Reorder.Group** — most complex gesture; drag-to-reorder requires Zustand write-back and layoutId on items simultaneously.
8. **Pull-to-refresh, inline panels, remaining micro-interactions** — polish pass once all main gestures are solid.

## Sources

- [Animating React Pages with react-router-dom Outlet and framer-motion AnimatePresence](https://medium.com/@antonio.falcescu/animating-react-pages-with-react-router-dom-outlet-and-framer-motion-animatepresence-bd5438b3433b)
- [Framer Motion layout animations official docs](https://www.framer.com/motion/layout-animations/)
- [Framer Motion gestures official docs](https://www.framer.com/motion/gestures/)
- [Reorder component docs](https://motion.dev/docs/react-reorder)
- [Animation performance guide — Motion](https://motion.dev/docs/performance)
- [React Router + Framer Motion integration discussion](https://github.com/remix-run/react-router/discussions/10411)
- [Mastering Layout Animations — Maxime Heckel](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/)

---
*Architecture research for: Animation-heavy mobile PWA UX — 時間の流れ*
*Researched: 2026-03-13*
