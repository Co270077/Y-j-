# Phase 1: Foundation - Research

**Researched:** 2026-03-13
**Domain:** Motion library setup, LazyMotion/MotionConfig wiring, iOS PWA safe areas
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Animation Personality**
- Smooth and snappy — no bounce or overshoot
- Default spring: fast response, no overshoot, elegant settle (stiffness ~300, damping ~30)
- Named transition presets: "snappy" (interactions), "gentle" (page transitions), "instant" (micro-feedback)
- All springs, no linear/ease curves anywhere

**CSS Animation Migration**
- Replace all 6 existing CSS keyframe animations (slide-up, fade-in, scale-in, check-draw, slide-down, complete-pulse) with Motion equivalents
- Remove the CSS `@keyframes` blocks and `.animate-*` classes from index.css after migration
- Single animation system from day one — no CSS/Motion split
- Keep the `@media (prefers-reduced-motion: reduce)` CSS rule as a fallback; MotionConfig `reducedMotion="user"` handles Motion-powered animations

**Variant Organization**
- `motion/variants.ts` — organized by animation type: enter, exit, tap, stagger, scale
- `motion/transitions.ts` — named transition presets: snappy, gentle, instant, with spring configs
- Flat exports, not nested objects — easy to import individual variants
- At least one existing component must import from these files to validate the pattern

**Safe Area Strategy**
- Add `viewport-fit=cover` to the HTML meta viewport tag and PWA manifest
- Verify `env(safe-area-inset-*)` vars are active in PWA standalone mode on iPhone X+
- Existing CSS support (`safe-area-bottom` class, `--spacing-safe-bottom/top` theme vars) is already correct — just needs the meta tag to activate

### Claude's Discretion
- Exact spring constant values (stiffness, damping, mass) — tune by feel
- LazyMotion feature bundle splitting strategy
- Internal file structure within `motion/` directory
- How to wire MotionConfig into the component tree (provider placement)
- AnimatePresence + useOutlet() wiring details

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | App uses LazyMotion with centralized animation config (variants, transitions, spring constants) | LazyMotion + domAnimation setup verified; `motion/react-m` import pattern confirmed; `src/motion/` module structure defined |
| FOUN-02 | MotionConfig provider wraps app with consistent spring physics defaults | MotionConfig `transition` default + `reducedMotion="user"` API confirmed; provider placement in main.tsx documented |
| FOUN-03 | iOS safe area handling verified in PWA mode | `viewport-fit=cover` already in index.html; PWA manifest missing it; CSS `env(safe-area-inset-*)` already wired; verification steps defined |
</phase_requirements>

---

## Summary

This phase wires the animation infrastructure before any visible animations are added. The three deliverables are: (1) install `motion`, set up LazyMotion + MotionConfig providers in `main.tsx`, and create `src/motion/` with centralized variants and transitions; (2) migrate away from all 6 CSS keyframe animations to a Motion-ready baseline; (3) confirm iOS safe areas work in PWA standalone mode.

The `motion` package (v12.36.0) is the only new dependency. Its peer deps explicitly support React 19. The LazyMotion pattern keeps the initial bundle delta under 20kb gzipped — critical for the bundle size success criterion. MotionConfig with `reducedMotion="user"` handles accessibility at the provider level.

Safe area status: `viewport-fit=cover` is already present in `index.html` (line 5). The PWA manifest in `vite.config.ts` does **not** include it. The CSS env vars and `.safe-area-bottom` class are already correct. The fix is one `"viewport_fit": "cover"` line in the manifest and a manual verification on physical device.

**Primary recommendation:** Install `motion`, wire LazyMotion + MotionConfig in `main.tsx`, create `src/motion/variants.ts` + `src/motion/transitions.ts`, migrate AppShell from CSS `.animate-fade-in` to Motion, remove the 6 CSS keyframe blocks, add `viewport_fit: "cover"` to the PWA manifest.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion (`motion/react`) | 12.36.0 | LazyMotion provider, MotionConfig, m component, AnimatePresence, variants | The animation library chosen in prior research. React 19 compatible. Hybrid Web Animations API + JS engine for 120fps. |

### Key Imports for This Phase

```typescript
// Providers — in main.tsx
import { LazyMotion, MotionConfig, domAnimation } from "motion/react"

// Components — everywhere else
import * as m from "motion/react-m"  // lightweight m component, not full motion
import { AnimatePresence } from "motion/react"
```

### Bundle Size Facts (HIGH confidence — official docs)
| Import style | Gzipped size |
|---|---|
| `import { motion } from "motion/react"` | ~34kb |
| `LazyMotion` shell only (no features loaded) | ~4.6kb |
| `domAnimation` feature bundle (async loaded) | ~15kb |
| `domMax` feature bundle (drag + layout) | ~25kb |

Using LazyMotion + domAnimation keeps Phase 1's bundle addition well under the 20kb gzipped success criterion.

**Installation:**
```bash
npm install motion
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── motion/
│   ├── variants.ts      # Animation variants by type: enter, exit, tap, stagger, scale
│   └── transitions.ts   # Named spring presets: snappy, gentle, instant
├── main.tsx             # LazyMotion + MotionConfig providers added here
└── components/
    └── layout/
        └── AppShell.tsx # animate-fade-in → m.div with fadeIn variant
```

### Pattern 1: Provider Stack in main.tsx

**What:** LazyMotion wraps the entire app; MotionConfig sets global defaults and reducedMotion policy.

**When to use:** Always — providers must be in place before any `m.*` component is used.

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <MotionConfig
        reducedMotion="user"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <App />
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
)
```

**Why LazyMotion outside MotionConfig:** LazyMotion loads the feature bundle; MotionConfig configures behavior. Order doesn't technically matter, but LazyMotion outermost is the conventional pattern.

### Pattern 2: Centralized Transitions

**What:** Named spring presets in `motion/transitions.ts`. All components import from here — never inline spring constants.

```typescript
// src/motion/transitions.ts
import type { Transition } from 'motion/react'

export const snappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 1,
}

export const gentle: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
  mass: 1,
}

export const instant: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 40,
  mass: 0.8,
}
```

**Note:** Exact spring values are Claude's discretion (per CONTEXT.md). Values above are starting points — tune to feel iOS-snappy with no overshoot. Test with `stiffness / (2 * sqrt(stiffness * mass))` to verify critically damped or overdamped.

### Pattern 3: Centralized Variants

**What:** Named animation variants in `motion/variants.ts`. Flat exports — import individual variants, not nested objects.

```typescript
// src/motion/variants.ts
import type { Variants } from 'motion/react'
import { snappy, gentle } from './transitions'

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: gentle },
  exit: { opacity: 0, transition: snappy },
}

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: gentle },
  exit: { opacity: 0, y: 10, transition: snappy },
}

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: gentle },
  exit: { opacity: 0, y: -10, transition: snappy },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: snappy },
  exit: { opacity: 0, scale: 0.95, transition: snappy },
}

export const tap = {
  whileTap: { scale: 0.97 },
  transition: snappy,
}

export const completePulse: Variants = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.05, 1], transition: snappy },
}
```

**Note:** `check-draw` (SVG stroke animation) requires `pathLength` in Motion, not `stroke-dashoffset`. See Code Examples below.

### Pattern 4: AppShell Migration (CSS → Motion)

**What:** Replace `<div key={location.pathname} className="animate-fade-in">` with Motion equivalent. This also wires the AnimatePresence + useOutlet pattern needed by Phase 2.

```tsx
// src/components/layout/AppShell.tsx
import { useEffect, useRef } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { fadeIn } from '../../motion/variants'
import BottomNav from './BottomNav'
import ToastContainer from '../ui/Toast'

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-charcoal">
      <ToastContainer />
      <main ref={mainRef} className="flex-1 pb-20 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          <m.div
            key={location.pathname}
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {outlet}
          </m.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
```

**Why useOutlet() not `<Outlet />`:** AnimatePresence requires direct children to detect mount/unmount. React Router's `<Outlet>` wraps content in `OutletContext.Provider`, breaking AnimatePresence detection. Using `useOutlet()` returns the element directly — AnimatePresence can see it. (See Pitfalls.)

### Anti-Patterns to Avoid

- **`import { motion } from 'motion/react'` in components:** Bypasses LazyMotion tree shaking. Always use `import * as m from 'motion/react-m'` in components.
- **Inline spring constants:** `transition={{ type: 'spring', stiffness: 400 }}` in components. Import from `motion/transitions.ts` instead.
- **Nested variant objects:** `export const variants = { enter: { ... }, exit: { ... } }`. Use flat named exports.
- **Wrapping `<Outlet>` in AnimatePresence:** Exit animations will never fire. Use `useOutlet()`.
- **Animating `left`/`top`/`height`/`margin` properties:** These trigger browser layout recalc every frame. Only animate `x`, `y`, `scale`, `opacity`, `rotate`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reduced motion detection | `useReducedMotion()` hook + manual conditional | `MotionConfig reducedMotion="user"` | Provider-level — zero per-component work |
| Spring physics math | Custom easing functions | Motion spring type with stiffness/damping | Motion's spring solver handles frame-rate independence correctly |
| CSS keyframe → JS animation | CSS animation + JS listener combo | Motion variants with initial/animate/exit | Variants are coordinated, interruptible, and respect reduced motion |
| SVG path drawing animation | `stroke-dashoffset` CSS animation | Motion `pathLength` 0→1 | Motion handles SVG path measurement automatically |

---

## Common Pitfalls

### Pitfall 1: AnimatePresence won't fire exit animations with `<Outlet>`
**What goes wrong:** Pages swap instantly — exit animation never runs.
**Why it happens:** `<Outlet>` wraps content in `OutletContext.Provider`. AnimatePresence sees the Provider (which never unmounts), not the page component.
**How to avoid:** Use `useOutlet()` hook. The returned element is a direct child of AnimatePresence.
**Warning signs:** `onExitComplete` never fires; page appears without outgoing animation.

### Pitfall 2: `motion` component used instead of `m` inside LazyMotion
**What goes wrong:** Bundle size doesn't shrink — 34kb penalty despite LazyMotion setup.
**Why it happens:** `motion.div` self-loads features regardless of LazyMotion context.
**How to avoid:** In every component file, use `import * as m from 'motion/react-m'` and `<m.div>`. Only `main.tsx` uses the full `motion/react` import for providers.
**Warning signs:** `npm run build` shows motion in main chunk; bundle size > 20kb after Phase 1.

### Pitfall 3: `viewport-fit=cover` missing from PWA manifest
**What goes wrong:** `env(safe-area-inset-bottom)` returns `0px` in installed PWA mode on iOS — bottom nav sits flush against home indicator.
**Why it happens:** The meta viewport tag is correct (`index.html` already has `viewport-fit=cover`), but the PWA manifest in `vite.config.ts` doesn't include `"viewport_fit": "cover"`. When launched from home screen in standalone mode, iOS uses the manifest.
**How to avoid:** Add `"viewport_fit": "cover"` to the manifest object in `vite.config.ts`. Verify on physical iPhone in PWA mode.
**Warning signs:** Bottom nav spacing correct in browser but wrong after Add to Home Screen.

### Pitfall 4: React 19 Strict Mode double-fires animation lifecycle
**What goes wrong:** Exit animations don't run in dev; enter animations appear twice.
**Why it happens:** Strict Mode intentionally mounts-unmounts-remounts components in dev. Animation libraries use mount/unmount to trigger enter/exit sequences — double mount defeats detection.
**How to avoid:** Test animations in `npm run preview` (production build), not `npm run dev`. Do NOT remove StrictMode.
**Warning signs:** Animation works in preview but not dev — that's expected and fine.

### Pitfall 5: SVG check-draw can't use CSS `stroke-dashoffset` approach with Motion
**What goes wrong:** CSS `stroke-dashoffset` animation on the checkmark icon doesn't coordinate with Motion's reduced motion policy.
**Why it happens:** CSS animations run outside Motion's control — `MotionConfig reducedMotion="user"` only suppresses Motion-managed animations, not CSS keyframes.
**How to avoid:** Use Motion's `pathLength` prop: `<m.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />`. Motion measures path length automatically.

---

## Code Examples

### LazyMotion + MotionConfig provider setup
```tsx
// src/main.tsx — source: motion.dev/docs/react-lazy-motion
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'

<LazyMotion features={domAnimation}>
  <MotionConfig
    reducedMotion="user"
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <App />
  </MotionConfig>
</LazyMotion>
```

### m component usage (inside LazyMotion boundary)
```tsx
// Any component — source: motion.dev/docs/react-lazy-motion
import * as m from 'motion/react-m'
import { fadeIn } from '../../motion/variants'

<m.div variants={fadeIn} initial="initial" animate="animate" exit="exit">
  {children}
</m.div>
```

### AnimatePresence + useOutlet (React Router pattern)
```tsx
// source: motion.dev docs + react-router pitfall docs (verified pattern)
import { useOutlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'

const outlet = useOutlet()
const location = useLocation()

<AnimatePresence mode="wait">
  <m.div key={location.pathname} variants={fadeIn} initial="initial" animate="animate" exit="exit">
    {outlet}
  </m.div>
</AnimatePresence>
```

### SVG path animation (replaces CSS check-draw)
```tsx
// source: motion.dev — pathLength animation
import * as m from 'motion/react-m'

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <m.path
    d="M5 13l4 4L19 7"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={snappy}
  />
</svg>
```

### MotionConfig reducedMotion behavior
```
reducedMotion="user"  → reads OS prefers-reduced-motion media query
  When ON:  transform + layout animations disabled; opacity/color animations persist
  When OFF: animations run normally

reducedMotion="always"  → debugging only — always disable
reducedMotion="never"   → override user preference — don't use
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import { motion } from 'framer-motion'` | `import * as m from 'motion/react-m'` | motion v11 (2024) | Bundle reduced from 34kb to ~4.6kb initial + 15kb async |
| `framer-motion` npm package | `motion` npm package | 2024 — renamed | Both still on npm; `framer-motion` re-exports from `motion`; use `motion` |
| `exitBeforeEnter` prop | `mode="wait"` on AnimatePresence | framer-motion v6 | `exitBeforeEnter` removed |
| CSS `@keyframes` for animation | Motion variants | N/A — project migration | Unified system, respects reducedMotion |

---

## Open Questions

1. **Spring constant tuning**
   - What we know: stiffness ~300, damping ~30 is the starting point; "snappy" is the design goal
   - What's unclear: exact values that feel iOS-like on physical device; depends on subjective evaluation
   - Recommendation: Implement with estimated values, test on iPhone, adjust — low risk to defer final tuning

2. **domMax for Phase 2**
   - What we know: `domAnimation` covers enter/exit/variants/tap/hover; `domMax` adds drag + layout animations
   - What's unclear: Phase 2 (page transitions) may need `domMax` for slide direction animations using layout
   - Recommendation: Start with `domAnimation` globally; upgrade to `domMax` on gesture-heavy pages if needed in Phase 4

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run lint` (ESLint only) |
| Full suite command | `npm run build` (TypeScript + Vite) |

**Note:** No test infrastructure exists. Validation for this phase is manual + build-time checks.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | LazyMotion + m component in use; variants.ts + transitions.ts exist and imported | Build smoke | `npm run build` — no TS errors | ❌ Wave 0 |
| FOUN-01 | Bundle delta < 20kb gzipped | Build analysis | `npm run build` + check dist/ chunk sizes | ❌ Wave 0 |
| FOUN-02 | MotionConfig wraps app with reducedMotion="user" | Manual | Enable OS Reduce Motion → verify no animations | ❌ Manual |
| FOUN-03 | Bottom nav clears home indicator in PWA mode | Manual | Install as PWA on iPhone X+, verify no overlap | ❌ Manual |

### Sampling Rate
- **Per task:** `npm run lint && npx tsc --noEmit` — catches import errors immediately
- **Per wave:** `npm run build` — verifies bundle size and TypeScript compilation
- **Phase gate:** Manual PWA install + Reduce Motion verification before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test framework — validation is build-time + manual for this phase
- [ ] Bundle size verification: after `npm run build`, check `.vite/` or `dist/` for motion chunk size
- [ ] Manual test checklist needed: (1) PWA install on iPhone, (2) OS Reduce Motion toggle, (3) AppShell fade transition visible

*(No automated test files needed for this phase — all validation is structural/build/manual)*

---

## Sources

### Primary (HIGH confidence)
- `npm view motion version peerDependencies` — v12.36.0, React 19 peer dep confirmed
- [motion.dev/docs/react-lazy-motion](https://motion.dev/docs/react-lazy-motion) — LazyMotion, domAnimation, m component pattern
- [motion.dev/docs/react-reduce-bundle-size](https://motion.dev/docs/react-reduce-bundle-size) — bundle size figures
- [motion.dev/docs/react-motion-config](https://motion.dev/docs/react-motion-config) — MotionConfig, reducedMotion values
- Project codebase inspection — index.html, index.css, AppShell.tsx, vite.config.ts, main.tsx

### Secondary (MEDIUM confidence)
- WebSearch: AnimatePresence + useOutlet pattern (multiple community sources, consistent with known AnimatePresence behavior)
- WebSearch: `motion/react-m` vs `m from motion/react` — official entry point confirmed as `motion/react-m`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — version verified from npm registry, peer deps confirmed
- Architecture: HIGH — official Motion docs patterns; useOutlet pitfall well-documented
- Safe area status: HIGH — direct inspection of index.html confirmed viewport-fit=cover present; manifest inspection confirmed it's missing
- Pitfalls: HIGH — drawn from prior project research (PITFALLS.md) + current code inspection

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (motion releases frequently but LazyMotion API is stable; safe area and PWA manifest patterns are stable)
