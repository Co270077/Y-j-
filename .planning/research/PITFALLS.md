# Pitfalls Research

**Domain:** Mobile PWA UX overhaul — React animation, gesture, and polish layer
**Researched:** 2026-03-13
**Confidence:** HIGH (critical pitfalls verified against official docs and multiple sources)

---

## Critical Pitfalls

### Pitfall 1: AnimatePresence placement breaks exit animations with React Router Outlet

**What goes wrong:**
Exit animations never fire. Pages swap instantly with no outgoing transition despite AnimatePresence being present. Components unmount immediately because AnimatePresence is not a direct parent of the route component — React Router's Outlet renders through an intermediate `OutletContext.Provider`, making AnimatePresence unaware of route unmounting.

**Why it happens:**
Developers wrap `<Outlet />` in `<AnimatePresence>` directly, which is the intuitive approach but fails because Outlet's internal wrapper breaks the parent-child relationship AnimatePresence requires to intercept unmount.

**How to avoid:**
Use the `useOutlet()` hook instead of `<Outlet />` so the page component is a direct child of AnimatePresence. Pair with `location.pathname` as the `key` prop and `mode="wait"` (not the deprecated `exitBeforeEnter`).

```tsx
// AppShell.tsx — correct pattern
const outlet = useOutlet()
return (
  <AnimatePresence mode="wait">
    <motion.div key={location.pathname}>
      {outlet}
    </motion.div>
  </AnimatePresence>
)
```

The current AppShell uses `<div key={location.pathname} className="animate-fade-in">` with a CSS animation — migrating to the above pattern is required before adding Framer Motion page transitions.

**Warning signs:**
- Pages appear without outgoing animation
- Console log inside `exit` variant never fires
- AnimatePresence `onExitComplete` never triggers

**Phase to address:** Page Transitions phase (first animation phase)

---

### Pitfall 2: Swipe gestures conflict with vertical scroll

**What goes wrong:**
Horizontal swipe gestures (swipe-to-complete on task items, swipe-to-delete) fight with the browser's native vertical scroll. On iOS, diagonal swipes partially trigger both scroll and the custom gesture, creating a janky experience or a console warning: "Unable to preventDefault inside passive event listener."

**Why it happens:**
Browsers default touch listeners to `{ passive: true }` for scroll performance. Custom gesture handlers that need `preventDefault()` to stop scroll during horizontal swipes can't do so with passive listeners. Libraries that don't handle this automatically throw warnings and fail to prevent scroll.

**How to avoid:**
Use Framer Motion's `drag` with `dragDirectionLock` — it automatically handles the passive listener problem and locks drag axis after detecting initial direction. Set `dragConstraints` to limit how far items can travel. Alternatively, control `touch-action` CSS property dynamically: `touch-action: pan-y` normally, `touch-action: none` only during active horizontal drag initiation.

Do NOT use raw `touchstart`/`touchmove` event handlers without explicitly registering them as `{ passive: false }`.

**Warning signs:**
- "Unable to preventDefault inside passive event listener" in console
- Swipe gesture partially moves element while also scrolling the page
- Gesture only triggers on very deliberate horizontal-only drags

**Phase to address:** Gesture interactions phase

---

### Pitfall 3: Framer Motion bundle imported without LazyMotion — adds 34kb+ to initial load

**What goes wrong:**
The full `motion` import (`import { motion } from 'framer-motion'`) adds ~34kb (minified+gzipped) to the initial bundle — unavoidable because Framer Motion's declarative API prevents tree shaking. On a PWA that should load fast, this shows up in Lighthouse as "Avoid enormous network payloads."

**Why it happens:**
Default import looks clean and works fine in dev. Bundle size cost is invisible until a Lighthouse audit or prod build analysis.

**How to avoid:**
Use `LazyMotion` + `m` component pattern from day one. `domAnimation` feature set (~15kb) covers animations, variants, exit animations, tap/hover/focus gestures — sufficient for page transitions and micro-interactions. `domMax` (~25kb) adds drag/pan and layout animations — only load this where drag gestures are used.

```tsx
// App.tsx
import { LazyMotion, domAnimation } from 'framer-motion'
<LazyMotion features={domAnimation}>
  <App />
</LazyMotion>

// Components — use m instead of motion
import { m } from 'framer-motion'
<m.div animate={{ opacity: 1 }} />
```

For drag-heavy pages (schedule swipe-to-complete), lazy load `domMax` only on that page.

**Warning signs:**
- `import { motion } from 'framer-motion'` used anywhere in the codebase
- Lighthouse initial bundle > 200kb
- First Contentful Paint regression after adding animations

**Phase to address:** Foundation/setup phase (before any animation is added)

---

### Pitfall 4: Animating layout properties instead of transform/opacity

**What goes wrong:**
Animations stutter at low frame rates, especially on mid-range Android devices. The animation visibly drops frames during complex list transitions or when multiple elements animate simultaneously.

**Why it happens:**
Animating `width`, `height`, `top`, `left`, `margin`, or `padding` triggers browser layout recalculation on every frame. This is GPU-hostile. `transform` and `opacity` only trigger the composite step — they run on the GPU and never cause layout.

**How to avoid:**
Only animate `transform` (translate, scale, rotate) and `opacity`. For entrance/exit: slide with `x`/`y` instead of `left`/`top`. For size reveals: use `scaleY` instead of `height`. Use Framer Motion's `layout` prop only when absolutely necessary (it handles layout animation internally via transforms), and never apply it to every list item indiscriminately.

```tsx
// Good — GPU-accelerated
animate={{ x: 0, opacity: 1 }}
initial={{ x: 20, opacity: 0 }}

// Bad — causes layout thrash
animate={{ left: 0, marginLeft: 0 }}
```

**Warning signs:**
- Chrome DevTools Performance panel shows purple "Layout" bars during animation
- FPS drops below 60 during transitions on test device
- "Long frame" warnings in React DevTools

**Phase to address:** All animation phases — enforce as a coding standard from the start

---

### Pitfall 5: iOS PWA bottom navigation eaten by home indicator

**What goes wrong:**
The fixed bottom nav sits directly on the home indicator bar on modern iPhones. Tap targets in the nav overlap with the iOS system gesture area, making the bottom-most nav item hard to tap and causing accidental home swipes.

**Why it happens:**
Standard CSS `height: 64px` for the nav doesn't account for `env(safe-area-inset-bottom)` (34px on most modern iPhones). The viewport meta tag must include `viewport-fit=cover` or the environment variables return 0.

The current `BottomNav` uses `safe-area-bottom` class — this must be implemented as `padding-bottom: env(safe-area-inset-bottom)` in the stylesheet. If the class only adds static padding, it will be wrong on some devices.

**How to avoid:**
Verify `<meta name="viewport" content="..., viewport-fit=cover">` is set. In CSS:
```css
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(64px + env(safe-area-inset-bottom));
}
```
Also ensure `main` content's `pb-20` is sufficient — it must account for nav height including safe area, not just the base nav height.

**Warning signs:**
- Bottom nav partially obscured on iPhone X and later in PWA mode (full-screen)
- Tapping the bottom nav item triggers iOS swipe-home gesture instead
- `safe-area-inset-bottom` returns 0 in CSS (missing `viewport-fit=cover`)

**Phase to address:** Foundation/layout phase, verified before any animation work

---

### Pitfall 6: Animating every element on mount creates "choreographed chaos"

**What goes wrong:**
Every card, list item, and icon has an entrance animation. When a page loads, 15+ elements are all animating simultaneously with different delays, creating visual noise. The UI feels busy and slow rather than polished. Users wait longer for content to be interactable because everything is mid-animation.

**Why it happens:**
Adding animations is addictive. Each animation looks great in isolation. The mistake is evaluating animations component-by-component rather than evaluating the page holistically when all components load together.

**How to avoid:**
Animate only what communicates state change. Use `staggerChildren` sparingly — maximum 3-5 items staggered, delay capped at 50-80ms. Page entrance animation should be a single fade/slide on the page container, not on every child. Reserve item-level animation for state changes (completing a task, adding a meal) not initial mount.

Hierarchy rule: Page transition animates the page. State changes animate the element. Never both simultaneously.

**Warning signs:**
- More than 3 different `initial`/`animate` variants visible simultaneously on first load
- Page feels "busy" on first impression
- Time-to-interactive feels longer after adding animations

**Phase to address:** Micro-interactions phase — establish animation budget before implementing

---

### Pitfall 7: React 19 Strict Mode double-invocation breaks animation libraries

**What goes wrong:**
In React 19 + Strict Mode (which Vite dev mode enables), components mount-unmount-mount in development. AnimatePresence's exit detection and react-spring's `useTransition` are both known to break under this double-mount: exit animations don't run, or enter animations appear twice.

**Why it happens:**
Animation libraries use mount/unmount lifecycle to trigger enter/exit sequences. Strict Mode's intentional double-mount defeats this detection in development, causing false negatives during testing.

**How to avoid:**
Test animations in production builds (`npm run build && npm run preview`) not dev server. Don't disable Strict Mode as a fix — it's protecting you from real bugs. Framer Motion 10+ has improved Strict Mode compatibility but still has edge cases. When an animation "works" in prod but not dev, that's expected behavior, not a bug.

**Warning signs:**
- Exit animations only work in prod, not dev
- Enter animation fires twice on first load in dev
- Removing `<StrictMode>` from main.tsx "fixes" animation issues

**Phase to address:** All phases — establish this as a known development constraint early

---

### Pitfall 8: `will-change` overuse causes memory pressure on mobile

**What goes wrong:**
Applying `will-change: transform` to many elements simultaneously causes the browser to allocate GPU layers for each one. On mobile devices with limited VRAM, this creates memory pressure and causes the browser to drop frames or crash the tab.

**Why it happens:**
Developers see `will-change` as a performance optimization and apply it broadly. Framer Motion applies it automatically to animated elements — but if animating 30+ list items with `m.div`, all 30 get GPU layers simultaneously.

**How to avoid:**
Never statically apply `will-change` in CSS to list items or repeated components. Let Framer Motion manage it dynamically (it applies/removes `will-change` during animation automatically). For long lists (schedule timeline with 20+ tasks), virtualize the list so off-screen items don't consume GPU layers. Limit simultaneous animated elements to < 10.

**Warning signs:**
- Chrome DevTools Layers panel shows > 20 compositor layers active
- Performance degrades on page with long lists when animations are added
- iOS Safari crashes or reloads page after navigating between pages

**Phase to address:** Gesture interactions phase (when swipe animations touch list items)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `import { motion }` instead of `LazyMotion + m` | Simpler code | 34kb initial bundle penalty that's hard to refactor away later | Never — set up LazyMotion at project start |
| CSS `animate-fade-in` class instead of Framer Motion | No new dependency | Can't coordinate with gesture state, exit animations impossible | During prototyping only — replace before shipping |
| Animate `height` for accordion/expand | Simple to implement | Layout jank on every frame, can't use GPU | Never — use `scaleY` or Framer Motion `layout` |
| `will-change: transform` on all list items | Smooth first animation | Memory exhaustion on lists > 15 items | Never statically — let Framer Motion manage dynamically |
| Hardcoded pixel values for bottom nav height | Fast to implement | Breaks on iPhone X+ safe areas in PWA mode | Never — always use `env(safe-area-inset-bottom)` |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-----------------|
| Framer Motion + React Router 7 | Wrapping `<Outlet>` directly in `<AnimatePresence>` | Use `useOutlet()` hook, pass result as direct child |
| Framer Motion + Zustand | Triggering store updates inside animation callbacks | Use `onAnimationComplete` not inline animation values; store updates cause re-renders mid-animation |
| Framer Motion + Tailwind 4 | Using Tailwind classes for animated properties | Let Framer Motion own animated properties; Tailwind for static styles only |
| Gesture drag + `overscroll-contain` | Drag gesture fires parent scroll simultaneously | Set `touch-action: none` on draggable element's CSS, not the parent |
| Recharts + animation | Recharts has its own animation system that conflicts with Framer Motion wrappers | Use Recharts' built-in `isAnimationActive` prop; don't wrap chart elements in `motion.div` with layout animations |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `layoutId` shared element on every nav tab | Purple layout bars in DevTools, janky tab switch | Only use `layoutId` for the active indicator, not tab content | Immediately on first nav tap |
| Animating Recharts chart on every render | Charts re-animate every time any state updates | Memoize chart data; use `React.memo` on chart components | When Zustand store updates frequently (macro tracking) |
| `motion.div` on every list item in schedule (20+ tasks) | Memory pressure, jank on scroll | Virtualize list; animate only visible items | > 15 items in DOM simultaneously |
| Page transition + modal open simultaneously | Overlapping animations create visual chaos | Cancel page transition when modal opens; use `AnimatePresence` mode carefully | Any time modal opens during navigation |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No `prefers-reduced-motion` support | Users with vestibular disorders experience nausea; WCAG 2.1 SC 2.3.3 violation | Wrap all Framer Motion variants with `useReducedMotion()` hook; disable or minimize animation when true |
| Gesture threshold too sensitive | Accidental task completion when scrolling task list | Set minimum swipe distance (80px) and velocity threshold before triggering action; provide undo |
| Gesture threshold too high | Gesture feels unresponsive; users don't discover it | 80-120px drag is the right range; add visual affordance (subtle drag handle indicator) |
| Page transition direction doesn't match navigation hierarchy | Disorienting — back goes right, forward goes right | Forward navigation: slide left. Back navigation: slide right. Tab switch: fade only (no directional implication) |
| Haptics fire on animation completion instead of gesture initiation | Feedback feels delayed and disconnected | Fire haptic at gesture confirmation (swipe threshold hit), not when animation completes |
| Micro-interaction on disabled buttons | Implies interactability; confuses users | No press animation on `disabled` or `aria-disabled` elements |

---

## "Looks Done But Isn't" Checklist

- [ ] **Page transitions:** Verify exit animation fires on BACK navigation, not just forward — test with hardware back button and swipe back on iOS
- [ ] **Swipe-to-complete:** Verify behavior when swipe is cancelled mid-way (item should snap back, no state change)
- [ ] **Bottom nav safe area:** Test on physical iPhone in PWA mode (add to home screen) — simulator doesn't accurately reflect home indicator behavior
- [ ] **Reduced motion:** Test with "Reduce Motion" enabled in iOS Settings > Accessibility — all animations should be disabled or replaced with instant transitions
- [ ] **Recharts animation:** Verify charts don't re-animate on every store update (e.g., when a task is completed, macro chart shouldn't replay entrance animation)
- [ ] **Modal + page transition:** Open a modal immediately after navigating — verify page entrance animation and modal entrance don't conflict
- [ ] **Long list performance:** Add 30+ tasks to schedule and verify swipe gesture still hits 60fps
- [ ] **Bundle size:** Run `npm run build` and check chunk sizes — Framer Motion should not appear in the main chunk if LazyMotion is set up correctly

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Full `motion` imports instead of LazyMotion | MEDIUM | Global find/replace `motion.` with `m.`; wrap app with `LazyMotion`; one-time migration |
| AnimatePresence in wrong place | LOW | Refactor AppShell to use `useOutlet()` — isolated to one file |
| Gesture/scroll conflict | MEDIUM | Add `touch-action` CSS rules to draggable items; test each gesture direction |
| `will-change` memory pressure | LOW | Remove static `will-change` from CSS; Framer Motion handles dynamically |
| iOS safe area missing | LOW | Add `viewport-fit=cover` to meta tag; update nav padding — CSS-only fix |
| Animation-induced jank (wrong properties) | HIGH | Audit all animated properties; replace layout animations with transform equivalents — can require component redesigns |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| AnimatePresence + Router placement | Page Transitions (Phase 1 of animation work) | Exit animation fires on back navigation |
| LazyMotion setup | Setup/Foundation (before any animation) | Bundle analysis shows < 20kb Framer Motion in main chunk |
| iOS safe area | Layout foundation (before animations) | Physical device test in PWA mode |
| Swipe/scroll conflict | Gesture Interactions phase | All 4 scroll directions work while horizontal swipe detects correctly |
| `will-change` overuse | Gesture Interactions phase | Chrome Layers panel shows < 10 compositor layers on schedule page |
| Animating wrong properties | All phases — coding standard | DevTools shows no purple Layout bars during any transition |
| Strict Mode animation issues | Setup phase — document as known dev behavior | Animations verified correct in `npm run preview` not dev server |
| Choreographed chaos | Micro-interactions phase — before implementing | Page load feels instant; max 3 elements animate simultaneously on mount |
| No `prefers-reduced-motion` | Final polish phase | Verified with iOS Accessibility > Reduce Motion enabled |

---

## Sources

- [Motion (Framer Motion) — Reduce Bundle Size](https://motion.dev/docs/react-reduce-bundle-size) — official, HIGH confidence
- [Motion — LazyMotion](https://motion.dev/docs/react-lazy-motion) — official, HIGH confidence
- [Animating React Pages with react-router-dom Outlet and Framer Motion](https://medium.com/@antonio.falcescu/animating-react-pages-with-react-router-dom-outlet-and-framer-motion-animatepresence-bd5438b3433b) — MEDIUM confidence, verified against known AnimatePresence behavior
- [Framer Motion + Strict Mode issue](https://github.com/pmndrs/react-spring/issues/1790) — known issue, MEDIUM confidence (react-spring, same pattern applies to Framer Motion)
- [iOS PWA safe area bottom navigation](https://github.com/actualbudget/actual/issues/4967) — real-world issue, HIGH confidence
- [iOS swipe-back conflicts PWA](https://forum.ionicframework.com/t/swipe-back-gesture-on-ios-pwa-with-react-mixing-up/180024) — HIGH confidence (well-documented platform issue)
- [Passive event listener scroll conflict](https://www.xjavascript.com/blog/added-non-passive-event-listener-to-a-scroll-blocking-touchstart-event/) — HIGH confidence
- [WCAG 2.1 SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) — official W3C, HIGH confidence
- [CSS transform vs layout animation performance](https://web.dev/animations-guide/) — HIGH confidence
- [React 19 Concurrency and animation libraries](https://dev.to/a1guy/react-19-concurrency-deep-dive-mastering-usetransition-and-starttransition-for-smoother-uis-51eo) — MEDIUM confidence

---
*Pitfalls research for: Mobile PWA UX overhaul — React animation, gesture, and polish layer*
*Researched: 2026-03-13*
