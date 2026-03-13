# Phase 1: Foundation - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the animation infrastructure (`motion` library, LazyMotion, MotionConfig, centralized variants/transitions) and verify iOS safe areas so all subsequent phases build on a safe, performant base. No UI changes — pure plumbing.

</domain>

<decisions>
## Implementation Decisions

### Animation Personality
- Smooth and snappy — no bounce or overshoot
- Health/biohacking app demands precise, confident motion (think iOS system animations)
- Default spring: fast response, no overshoot, elegant settle (e.g., stiffness ~300, damping ~30)
- Named transition presets: "snappy" (interactions), "gentle" (page transitions), "instant" (micro-feedback)
- All springs, no linear/ease curves anywhere

### CSS Animation Migration
- Replace all 6 existing CSS keyframe animations (slide-up, fade-in, scale-in, check-draw, slide-down, complete-pulse) with Motion equivalents
- Remove the CSS `@keyframes` blocks and `.animate-*` classes from index.css after migration
- Single animation system from day one — no CSS/Motion split
- Keep the `@media (prefers-reduced-motion: reduce)` CSS rule as a fallback; MotionConfig `reducedMotion="user"` handles Motion-powered animations

### Variant Organization
- `motion/variants.ts` — organized by animation type: enter, exit, tap, stagger, scale
- `motion/transitions.ts` — named transition presets: snappy, gentle, instant, with spring configs
- Flat exports, not nested objects — easy to import individual variants
- At least one existing component must import from these files to validate the pattern

### Safe Area Strategy
- Add `viewport-fit=cover` to the HTML meta viewport tag and PWA manifest
- Verify `env(safe-area-inset-*)` vars are active in PWA standalone mode on iPhone X+
- Existing CSS support (`safe-area-bottom` class, `--spacing-safe-bottom/top` theme vars) is already correct — just needs the meta tag to activate

### Claude's Discretion
- Exact spring constant values (stiffness, damping, mass) — tune by feel
- LazyMotion feature bundle splitting strategy
- Internal file structure within `motion/` directory
- How to wire MotionConfig into the component tree (provider placement)
- AnimatePresence + useOutlet() wiring details

</decisions>

<specifics>
## Specific Ideas

- Animation feel should be like iOS system animations — fast, precise, no playfulness
- The app is a personal health tool used multiple times daily — animations must never feel slow or get in the way
- "Snappy" is the single word that should define the motion system

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.css`: Has 6 CSS keyframe animations to replace — slide-up, fade-in, scale-in, check-draw, slide-down, complete-pulse
- `index.css`: Already has `@media (prefers-reduced-motion: reduce)` blanket rule
- `index.css`: Theme vars `--spacing-safe-bottom` and `--spacing-safe-top` use `env(safe-area-inset-*)`
- `AppShell.tsx`: Uses `animate-fade-in` class on route transitions — needs Motion replacement
- `BottomNav.tsx`: Uses `safe-area-bottom` class — safe area already wired in CSS

### Established Patterns
- React 19 + Vite 7 + Tailwind 4 + Zustand stack
- BrowserRouter with flat Routes (not data router) — AnimatePresence needs useOutlet() adaptation
- Component-level CSS classes for animations (`.animate-fade-in`, `.animate-slide-up`)
- No existing provider pattern beyond StrictMode in main.tsx

### Integration Points
- `main.tsx`: LazyMotion + MotionConfig providers wrap App here
- `AppShell.tsx`: AnimatePresence wraps route outlet for page transitions
- `index.css`: CSS keyframe blocks to remove after Motion migration
- `index.html` or PWA manifest: viewport-fit=cover meta tag addition
- `vite.config.ts`: PWA manifest config for any safe area related changes

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-13*
