# Stack Research

**Domain:** React PWA animation / gesture / micro-interaction layer
**Researched:** 2026-03-13
**Confidence:** HIGH (versions verified from npm registry; React 19 peer dep compatibility confirmed)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| motion (`motion/react`) | 12.36.0 | Page transitions, micro-interactions, layout animations, gesture-driven spring physics | The dominant React animation library (30M+ downloads/month). v12 explicitly supports React `^18.0.0 \|\| ^19.0.0`. Hybrid engine uses Web Animations API for 120fps where possible, falls back to JS for spring physics. Formerly "Framer Motion" — same library, renamed. |
| @use-gesture/react | 10.3.1 | Low-level touch/mouse gesture hooks (drag, swipe, pinch, scroll) | Pairs perfectly with Motion for physics-driven drag and swipe-to-complete. Platform-agnostic since v10. Peer dep `react >= 16.8.0` — no issues with React 19. Last release 2 years ago but stable and widely used. |
| React Router v7 viewTransition prop | 7.13.1 (already installed) | Native CSS View Transitions API for route changes | Already in the project. Adding `viewTransition` prop to `<Link>` or `<NavLink>` wraps navigation in `document.startViewTransition()` — zero additional deps for page-level cross-fades. Baseline Newly Available as of Oct 2025. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss-animate | 1.0.7 | CSS keyframe animation utilities for Tailwind — `animate-in`, `animate-out`, `fade-in`, `slide-in-from-bottom`, etc. | For simple enter/exit patterns on modals, drawers, and list items where Motion is overkill. Pairs with Tailwind 4 `@theme` directive. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Chrome DevTools Performance tab | Profile animation frame budget on mobile-class CPU throttling | Use 4x or 6x CPU slowdown to simulate mid-range Android. Target 60fps on throttled. |
| Lighthouse PWA audit | Verify PWA installability and performance scores remain intact post-animation work | Run before and after each phase to catch regressions. |

## Installation

```bash
# Core animation + gesture
npm install motion @use-gesture/react

# Tailwind enter/exit utilities (optional, for CSS-only micro-interactions)
npm install -D tailwindcss-animate
```

React Router v7 (already installed) — no additional install needed for View Transitions.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `motion` (motion/react) | `react-spring` v10.0.3 | React Spring is physics-first and has no declarative `<motion.div>` equivalent. Better if you're already using react-spring and need to minimize new deps. For greenfield animation work, Motion's layout animation and gesture integration story is stronger. |
| `motion` (motion/react) | `@react-spring/web` + `@use-gesture` (pmndrs ecosystem) | Only choose this combo if you specifically want react-spring's physics model (mass, tension, friction) over Motion's spring syntax. Adds two packages vs one. |
| React Router viewTransition | Motion `AnimatePresence` for route transitions | Use `AnimatePresence` when you need complex enter/exit choreography beyond cross-fade (e.g., slide left/right based on nav direction). Both can be used together. |
| `tailwindcss-animate` | Custom CSS `@keyframes` in Tailwind `@theme` | Only use custom `@keyframes` when tailwindcss-animate doesn't cover your animation vocabulary — it adds complexity without benefit for standard enter/exit patterns. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `framer-motion` (old package name) | Deprecated import path. The `framer-motion` npm package still publishes but imports from `motion/react` is the current canonical API. The two can conflict if both are installed. | `motion` package, import from `"motion/react"` |
| `react-transition-group` | Predecessor-era library. No animation primitives — only lifecycle hooks. Requires writing all CSS manually. Motion's `AnimatePresence` replaces it entirely. | `motion` (`AnimatePresence` + `motion.div`) |
| CSS `transition` on `height: auto` | `height: auto` cannot be transitioned with CSS alone — a common trap for accordion/drawer animations. Always results in janky jumps. | Motion's `layout` prop on the container — handles height-auto expansion natively via layout animations |
| `lottie-react` (2.4.1) | Lottie files are heavy JSON and require designer tooling to produce. Not appropriate for programmatic micro-interactions. | Motion for all programmatic animation. Only consider Lottie if specific brand/illustration animations are added later. |
| `react-use-gesture` | Old package name, superseded by `@use-gesture/react`. Still on npm but no longer maintained. | `@use-gesture/react` |

## Stack Patterns by Variant

**For page transitions (route changes):**
- Use React Router `viewTransition` prop for simple cross-fade
- Add `AnimatePresence` + `motion.div` with `key={location.pathname}` when slide direction matters (e.g., forward = slide left, back = slide right)
- Both can coexist: viewTransition for the shell, AnimatePresence for the page content

**For micro-interactions (buttons, checkboxes, toggles):**
- Use `motion.button` / `motion.div` with `whileTap={{ scale: 0.97 }}` and `whileHover`
- Keep scale values conservative (0.95–0.98) — mobile "feels right" at subtle values
- Use `transition={{ type: "spring", stiffness: 400, damping: 25 }}` for snappy tactile feel

**For gesture-driven interactions (swipe to complete, drag to reorder):**
- Combine `useDrag` from `@use-gesture/react` with `useMotionValue` + `useAnimate` from `motion/react`
- Set `touch-action: pan-y` on horizontal swipe targets to allow vertical scroll to pass through
- Use `useSpring` with `stiffness: 300, damping: 20` for rubber-band snap-back

**For data visualizations (charts animate in, counters tick):**
- `recharts` (already installed) has built-in `isAnimationActive` and animation easing — enable it
- Use `useMotionValue` + `useTransform` for custom counter/progress animations
- Wrap recharts containers in `motion.div` with `initial={{ opacity: 0, y: 10 }}` for entrance

**For bundle size optimization:**
- Use `LazyMotion` + `domAnimation` feature set for pages where full Motion features aren't needed
- `m` component (from `motion/react`) instead of `motion` component inside `LazyMotion` boundary
- Full `motion` component (34kb) is fine for the main interaction-heavy pages — it code-splits naturally

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| motion@12.36.0 | react@19.2.0 | Peer dep explicitly: `react: "^18.0.0 \|\| ^19.0.0"` — confirmed |
| @use-gesture/react@10.3.1 | react@19.2.0 | Peer dep: `react: ">= 16.8.0"` — confirmed |
| tailwindcss-animate@1.0.7 | tailwindcss@4.x | Works via `@plugin` directive in Tailwind 4 config |
| React Router viewTransition | react-router-dom@7.13.1 | Already in project, zero additional setup |

## Sources

- npm registry (`npm view motion version peerDependencies`) — motion@12.36.0, React 19 compat confirmed — HIGH confidence
- npm registry (`npm view @use-gesture/react version peerDependencies`) — 10.3.1, React >=16.8.0 — HIGH confidence
- npm registry (`npm view tailwindcss-animate version`) — 1.0.7 — HIGH confidence
- [motion.dev docs](https://motion.dev/docs/react) — `motion/react` import path, LazyMotion optimization — HIGH confidence
- [React Router view transitions](https://reactrouter.com/how-to/view-transitions) — `viewTransition` prop API — HIGH confidence
- [motion bundle size guide](https://motion.dev/docs/react-reduce-bundle-size) — LazyMotion / m component strategy — HIGH confidence
- WebSearch: framer-motion vs react-spring 2025 comparison — MEDIUM confidence (community sources)
- WebSearch: View Transitions API baseline status Oct 2025 — MEDIUM confidence

---
*Stack research for: React PWA animation / gesture layer (時間の流れ UX overhaul)*
*Researched: 2026-03-13*
