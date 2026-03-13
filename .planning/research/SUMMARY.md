# Project Research Summary

**Project:** 時間の流れ — UX Overhaul
**Domain:** Mobile health/productivity PWA — animation, gesture, and micro-interaction layer
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

This is a UX overhaul of an existing offline-first React PWA — not a new product. The app already has correct data architecture (Zustand + Dexie/IndexedDB), routing (React Router v7), and Tailwind 4 styling. The work is entirely in the interaction layer: adding native-feeling animations, gesture-driven interactions, and tactile micro-interactions. The established approach for this class of work is `motion` (formerly Framer Motion) as the single animation primitive — it handles page transitions, layout animations, spring physics, and gesture-driven drag from one library with React 19 compatibility confirmed.

The recommended approach is foundational-first: install Motion with LazyMotion from day one to avoid a hard-to-fix 34kb bundle penalty, wire `MotionConfig` and a centralized `motion/variants.ts` before touching any UI, then build outward — page transitions first (validates the React Router integration), then UI primitive micro-interactions (reused everywhere), then gesture-driven features (swipe-to-complete, drag-to-reorder). The highest-leverage single component is a bottom sheet that replaces full-page add/detail flows across Schedule, Meals, and Protocols.

The primary risk is the compounding cost of getting the foundation wrong: using full `motion` imports instead of `LazyMotion`, placing `AnimatePresence` around `<Outlet>` instead of using `useOutlet()`, and animating layout properties instead of transforms are all mistakes that are invisible in dev but expensive to fix after they propagate across the codebase. All three must be addressed at setup, not discovered during polish.

## Key Findings

### Recommended Stack

The project already has React Router v7, Tailwind 4, Recharts, and Zustand — no replacements needed. Two packages are added: `motion` (v12.36.0, React 19 confirmed) and `@use-gesture/react` (v10.3.1, stable). `tailwindcss-animate` is optional for CSS-only enter/exit patterns where Motion is overkill. React Router's `viewTransition` prop is available for free (already installed) and handles simple cross-fades at the route level without additional dependencies.

**Core technologies:**
- `motion` (motion/react) v12.36.0: Page transitions, layout animations, spring micro-interactions, gesture drag — the single animation primitive for the entire overhaul
- `@use-gesture/react` v10.3.1: Low-level touch/mouse hooks for cases requiring finer gesture control; pairs with Motion's `useMotionValue`
- React Router `viewTransition` prop: Free route-level cross-fades via CSS View Transitions API — use for simple tab switches, `AnimatePresence` for directional slide transitions

**Do not use:** `framer-motion` (old package name — conflicts), `react-transition-group` (predecessor, no animation primitives), `react-use-gesture` (deprecated), `lottie-react` (wrong tool for programmatic animation).

### Expected Features

**Must have (table stakes) — v1 launch:**
- Page transitions (slide for drill-down, cross-fade for tab switches) — absence feels broken on mobile
- Micro-interactions on all tap targets (buttons, checkboxes, toggles) — every tap must have visual feedback
- Bottom sheet component — replaces full-page add flows; highest-leverage single component (reused across 3+ pages)
- Swipe-to-complete on schedule tasks — highest-friction daily action; tapping checkbox feels slow
- Staggered list entry animations — most visible quality signal per implementation effort
- Animated progress bars/rings on dashboard — data visualization upgrade, low effort

**Should have (differentiators) — v1.x:**
- Swipe-to-delete with undo toast — requires toast component; add once gesture core is proven
- Animated macro counters (spring tick-up on value change)
- Time-aware scroll on Schedule (auto-scroll to current time block on mount)
- Haptic feedback on key actions (Android Chrome only; opt-in)
- Spring physics tuning pass across all animated elements

**Defer (v2+):**
- Streak/momentum indicator — requires validating store has completion history data
- Shared element card transitions — high complexity, dedicated polish phase
- Contextual inline expansion — evaluate after v1; bottom sheet may cover the need

**Anti-features to avoid:** Swipe navigation between tabs (conflicts with scroll), parallax scrolling (motion sickness), animated splash screen (infuriating on repeated opens), auto-playing sounds, infinite scroll (data set is tiny).

### Architecture Approach

The architecture is additive — existing layers (Zustand, Dexie, React Router) are unchanged. Animation and gesture layers are added on top. The key structural decision is a `motion/` directory (`variants.ts`, `transitions.ts`, `config.tsx`) that centralizes all animation definitions — components import named variants rather than defining inline objects, ensuring global consistency and one-file tunability. `MotionConfig` wraps the app above the router, setting global spring defaults and `reducedMotion="user"`. A `PageTransition.tsx` wrapper component prevents each page from reimplementing the same pattern.

**Major components:**
1. `AppShell.tsx` — `AnimatePresence` + `useOutlet()` for page transition orchestration; `mode="popLayout"` for native feel
2. `BottomNav.tsx` — `layoutId="tab-indicator"` animated pill; `location.pathname` drives active state
3. `PageTransition.tsx` — reusable `motion.div` wrapper with shared page variants; all pages use this
4. `motion/variants.ts` + `motion/transitions.ts` — single source of truth for all animation definitions
5. `TaskBlock.tsx` — `drag="x"` + `dragDirectionLock` + `touch-action: pan-y` for swipe-to-complete
6. UI primitives (Button, Card, Modal) — `whileTap`, `whileHover`, `AnimatePresence` on Modal; done once, inherited everywhere

**Data flow:** User gesture → FM handler → haptic side effect → Zustand action → store update → React re-render → FM layout animation reflow → Dexie write (async, non-blocking). Zustand state never drives animation values directly — only triggers re-renders that FM responds to via `layout` prop.

### Critical Pitfalls

1. **AnimatePresence wrapped around `<Outlet>` instead of `useOutlet()`** — exit animations never fire; AnimatePresence can't see through React Router's internal context wrapper. Fix: use `useOutlet()` hook, render result as direct child of AnimatePresence. Must be done at setup — this is the first thing to build.

2. **Full `motion` import instead of `LazyMotion + m`** — adds 34kb gzipped to initial bundle; invisible in dev but Lighthouse-visible in prod and hard to refactor after it spreads. Fix: set up `LazyMotion` with `domAnimation` (~15kb) globally, `domMax` (~25kb) only on gesture-heavy pages. Do this before any animation code.

3. **Animating layout properties (width, height, top, left) instead of transform/opacity** — triggers browser layout on every frame, causes jank on mid-range Android. Fix: only animate `x`/`y`/`scale`/`opacity`. Use `scaleY` instead of `height` for expansions. Enforce as a coding standard from day one.

4. **`drag={true}` without `touch-action: pan-y`** — captures both axes, breaks vertical scroll in scroll containers on iOS. Fix: always `drag="x"` with `style={{ touchAction: 'pan-y' }}` on all horizontal swipe targets.

5. **Animating every element on mount** — creates choreographed chaos; 15+ simultaneous animations feel slow and busy. Fix: animate only the page container on route transition; reserve element-level animation for state changes. Cap stagger at 3-5 items, 50-80ms delay maximum.

6. **iOS bottom nav safe area missing** — bottom nav overlaps home indicator on iPhone X+; bottom-most tap target triggers iOS home swipe instead. Fix: `padding-bottom: env(safe-area-inset-bottom)` + `viewport-fit=cover` in meta tag. Verify on physical device in PWA mode before animation work begins.

7. **React 19 Strict Mode double-mount breaks animation dev testing** — exit animations appear broken in dev server but work correctly in production builds. Fix: verify animations with `npm run preview`, not dev server. Do not disable Strict Mode.

## Implications for Roadmap

Based on dependencies and pitfall prevention order, suggest 5 phases:

### Phase 1: Foundation
**Rationale:** Everything else depends on this being correct. Wrong choices here (bundle size, AnimatePresence placement, animation property discipline) compound across the entire codebase. Must be done first, before any visible UI changes.
**Delivers:** LazyMotion configured, `MotionConfig` wired, `motion/variants.ts` + `motion/transitions.ts` created, iOS safe area verified, Strict Mode behavior documented, `useReducedMotion` hook in place.
**Addresses:** 0 visible features — this is infrastructure.
**Avoids:** LazyMotion bundle pitfall (Pitfall 3), iOS safe area (Pitfall 6), Strict Mode confusion (Pitfall 7), animation property discipline established as standard.

### Phase 2: Page Transitions and Navigation Chrome
**Rationale:** Validates the FM + React Router v7 integration before touching individual pages. High visible payoff (every navigation immediately feels native), isolated risk. `BottomNav` `layoutId` indicator is also here — isolated, low-risk, validates the `layoutId` pattern before it's used in more complex contexts.
**Delivers:** All 5 pages slide/fade between each other. Bottom nav active indicator animates as a sliding pill. Tab switches feel native.
**Addresses:** Page transitions (P1 table stakes), active nav state animation.
**Avoids:** AnimatePresence + Outlet pitfall (Pitfall 1) — addressed directly here. Page transition direction matches navigation hierarchy (UX pitfall from PITFALLS.md).

### Phase 3: UI Primitives and Micro-interactions
**Rationale:** Button, Card, Modal are used on every page — polishing these early means all subsequent work inherits correct micro-interactions automatically. Doing this before page-specific work avoids going back and retrofitting.
**Delivers:** All buttons have `whileTap` spring feedback. Cards have tap feedback. Modals have AnimatePresence enter/exit. Spring physics applied globally. Staggered list entry on Dashboard.
**Addresses:** Micro-interactions on tap targets (P1 table stakes), staggered list animations (P1 differentiator), animated progress bars on Dashboard (P1), spring physics config (P1).
**Avoids:** Choreographed chaos (Pitfall 6) — animation budget established here before page-specific work.

### Phase 4: Gesture Interactions
**Rationale:** Most complex phase — drag gestures require careful touch-action scoping to not break scroll. Building swipe-to-complete on TaskBlock first validates the `drag="x"` + `pan-y` pattern in isolation before applying to other list items. Drag-to-reorder (`Reorder.Group`) is the most complex gesture (requires Zustand write-back + layoutId simultaneously) — done last within this phase.
**Delivers:** Swipe-to-complete on schedule tasks. Swipe-to-delete with undo toast. Bottom sheet component (reused across Schedule, Meals, Protocols add flows). Drag-to-reorder on task timeline.
**Addresses:** Swipe-to-complete (P1), bottom sheet (P1), swipe-to-delete with undo (P2).
**Avoids:** Swipe/scroll conflict (Pitfall 2), `will-change` memory pressure (Pitfall 8), drag={true} axis capture.

### Phase 5: Polish and Delight
**Rationale:** Layer on differentiators once the core interaction model is solid. These are lower-risk (no gesture complexity) but highest perceived quality impact on second-use impressions.
**Delivers:** Animated macro counters on Meals. Count-up animation on Dashboard stats. Time-aware scroll on Schedule. Haptic feedback on completion actions. `prefers-reduced-motion` audit pass. Performance verification on 30+ task lists.
**Addresses:** Animated macro counters (P2), count-up stats (P2), time-aware scroll (P1 low-effort), haptics (P2), WCAG 2.3.3 compliance.
**Avoids:** `prefers-reduced-motion` UX pitfall — final audit ensures all phases' animations are accessibility-compliant.

### Phase Ordering Rationale

- Foundation before everything because LazyMotion setup and AnimatePresence placement can't be retrofitted cheaply
- Page transitions before page-specific components because it validates the FM + React Router integration once rather than debugging it per-page
- UI primitives before gesture work because primitives are used inside gesture components — polished first, composed second
- Gesture work isolated into one phase to keep scroll-conflict testing contained
- Polish last because it requires stable underlying interaction layer to tune against

### Research Flags

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 1 (Foundation):** LazyMotion and MotionConfig patterns are directly from official Motion docs — HIGH confidence, no additional research needed
- **Phase 2 (Transitions):** AnimatePresence + useOutlet pattern is documented and confirmed — no additional research needed
- **Phase 3 (Micro-interactions):** whileTap/whileHover/stagger are the most documented Motion patterns — no additional research needed

Phases that may benefit from research-phase during planning:
- **Phase 4 (Gesture Interactions):** Bottom sheet implementation has multiple viable approaches (portal-based, drawer library, custom FM drag). Worth a focused research pass on the specific swipe-to-complete + scroll disambiguation pattern before implementation.
- **Phase 5 (Polish):** Streak indicator requires validating whether `scheduleStore` / `taskCompletionStore` has the required history data. Brief store audit needed before committing to that feature.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified from npm registry; React 19 peer dep compatibility confirmed for all packages |
| Features | HIGH (table stakes), MEDIUM (gesture specifics) | Table stakes from NN/G and established mobile patterns; gesture implementation details from Motion tutorials |
| Architecture | HIGH | Patterns verified against official Motion docs and multiple implementation articles; AppShell pattern confirmed against React Router integration discussion |
| Pitfalls | HIGH | Critical pitfalls verified against official docs and real-world issues (GitHub issues, W3C WCAG) |

**Overall confidence:** HIGH

### Gaps to Address

- **Bottom sheet implementation approach:** Multiple viable patterns exist (custom FM drag, headless UI drawer, purpose-built library). Research-phase on Phase 4 should resolve this before planning begins.
- **Streak indicator data availability:** Need to audit `scheduleStore` to confirm whether task completion history is persisted in a queryable form. Determines if this feature is low or high effort.
- **Recharts + FM coexistence:** PITFALLS.md flags a known conflict (Recharts' own animation system vs FM layout wrappers). Exact implementation approach for animated chart entrance needs a quick prototype to validate before committing to an approach.

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`) — motion@12.36.0, @use-gesture/react@10.3.1, React 19 compat confirmed
- [motion.dev docs](https://motion.dev/docs/react) — LazyMotion, AnimatePresence, variants, gestures API
- [React Router v7 view transitions](https://reactrouter.com/how-to/view-transitions) — viewTransition prop
- [WCAG 2.1 SC 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) — reduced motion requirement
- [NN/G bottom sheet guidelines](https://www.nngroup.com/articles/bottom-sheet/) — UX patterns
- [web.dev animations guide](https://web.dev/animations-guide/) — transform vs layout animation performance

### Secondary (MEDIUM confidence)
- [Animating React pages with Outlet + AnimatePresence](https://medium.com/@antonio.falcescu/animating-react-pages-with-react-router-dom-outlet-and-framer-motion-animatepresence-bd5438b3433b) — useOutlet pattern
- [Mastering Layout Animations — Maxime Heckel](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/) — layoutId patterns
- WebSearch: framer-motion vs react-spring 2025 comparison — stack selection rationale
- WebSearch: mobile UX design trends 2026 — feature prioritization

### Tertiary (LOW confidence)
- Community sources on View Transitions API baseline (Oct 2025) — support is confirmed but long-term behavior may evolve

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
