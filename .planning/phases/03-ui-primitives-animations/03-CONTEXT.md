# Phase 3: UI Primitives + Animations - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Every tap target gives tactile spring-physics feedback and every data visualization animates on screen. Buttons, checkboxes, and toggles respond to touch. Progress rings/bars animate from zero. Stat numbers count up. List items cascade in with stagger. Skeleton shimmers replace blank loading states. No gesture interactions (Phase 4) or new layout patterns — purely adding motion to existing UI primitives.

</domain>

<decisions>
## Implementation Decisions

### Tap Feedback Style
- Uniform `tap` variant (scale: 0.97) with `snappy` transition on all interactive elements — buttons, toggles, checkboxes, cards with actions
- Button.tsx: migrate from plain `<button>` to `m.button` with `whileTap` — remove CSS `transition-colors duration-150`, let Motion handle
- Toggle.tsx: `m.button` wrapper with `whileTap` scale on the outer track; knob position animated with `snappy` spring (replace CSS `transition-transform`)
- Checkboxes (inline in TaskBlock, SubtaskList): wrap in `m.div` with `whileTap` scale + `completePulse` variant on check
- FAB.tsx: already uses `whileTap` — no changes needed
- Disabled elements: no tap animation (Motion's `whileTap` naturally won't fire on disabled buttons)
- No color shift on tap — scale-only keeps it clean and iOS-like

### Data Visualization Animation
- ProgressRing.tsx: animate SVG `strokeDashoffset` with Motion's `m.circle` — spring from full offset (empty) to calculated offset on mount
- Re-animate on value change: use `useMotionValue` + `useSpring` for the offset, driven by the `progress` prop — automatic spring interpolation when prop changes
- Count-up effect on numbers: custom `useCountUp` hook using `useMotionValue` + `useSpring` + `useMotionValueEvent` — renders integer during animation, lands on exact value
- Count-up duration: driven by `gentle` spring (not time-based) — feels organic, settles in ~400ms
- Dashboard stat numbers (progress %, tasks completed, streak count, macro values): all use `useCountUp`
- ProgressCard bars: if any horizontal bars exist, animate width with `m.div` and `snappy` transition
- Trigger: animate on mount and on value change — no viewport-entry detection needed (dashboard is always visible when navigated to)
- Recharts concern: progress rings are custom SVG (no Recharts dependency) — no coexistence issue for this phase

### Staggered List Cascade
- Use `staggerChildren` in a parent `m.div` variant — each child gets `slideUp` variant (fade + 20px upward)
- Stagger delay: 50ms between items — fast enough to feel snappy, slow enough to see the cascade
- Max stagger: first 10 items animate; items beyond 10 render immediately (prevents long lists from feeling slow)
- Apply to: Schedule timeline tasks, Protocol list items, Meal plan items, Dashboard card grid
- Dashboard grid: stagger cards with `scaleIn` variant instead of `slideUp` — cards feel like they "pop in"
- Re-entry: animate only on route entry (mount), not on data updates within the page — prevents cascade replay when completing a task
- Exit animation: none for list items (instant unmount) — exit animations on lists feel sluggish

### Shimmer Skeletons
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

</decisions>

<specifics>
## Specific Ideas

- User requested fully autonomous decisions — all areas are Claude's discretion within the success criteria
- Animation personality carries from Phase 1: iOS system animation feel, snappy, no bounce or overshoot
- Named transition presets (snappy, gentle, instant) already established — reuse, don't create new ones
- Consistency principle: every interactive element should feel the same — uniform tap scale, no per-element special cases

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `motion/variants.ts`: `tap` (scale: 0.97), `fadeIn`, `slideUp`, `scaleIn`, `completePulse` — all directly usable
- `motion/transitions.ts`: `snappy`, `gentle`, `instant` spring presets — no new presets needed
- `Button.tsx`: forwardRef pattern with variant/size system — needs `m.button` migration
- `Toggle.tsx`: simple component — straightforward Motion migration
- `ProgressRing.tsx`: custom SVG with `strokeDashoffset` math — ready for `m.circle` upgrade
- `FAB.tsx`: already uses Motion `whileTap` — no changes needed
- `Card.tsx`: static wrapper — may need `m.div` for stagger children

### Established Patterns
- Motion components use `m.` prefix (LazyMotion `domAnimation` features)
- Variants imported from centralized `motion/variants.ts`
- Transitions imported from centralized `motion/transitions.ts`
- AnimatePresence with `mode="wait"` for enter/exit orchestration

### Integration Points
- `Button.tsx`: `<button>` → `<m.button>` with `whileTap`
- `Toggle.tsx`: CSS transitions → Motion springs for knob and track
- `ProgressRing.tsx`: static SVG → `m.circle` with spring-driven `strokeDashoffset`
- `ProgressCard.tsx`, `StreakCard.tsx`, `MealCard.tsx`, etc.: add `useCountUp` for stat numbers
- `DashboardGrid.tsx`: add stagger parent variant for card cascade
- `SchedulePage.tsx`, `ProtocolsPage.tsx`, `MealsPage.tsx`: add stagger to list containers
- New `Skeleton.tsx` in `src/components/ui/`
- `index.css`: add `@keyframes shimmer` for skeleton animation

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ui-primitives-animations*
*Context gathered: 2026-03-13*
