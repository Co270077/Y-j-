# Feature Research

**Domain:** Mobile health/productivity PWA — UX overhaul
**Researched:** 2026-03-13
**Confidence:** HIGH (stack-specific patterns), MEDIUM (gesture/animation specifics)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or amateurish.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Page transition animations | Every native iOS/Android app has slide/fade between views — absence feels broken | MEDIUM | Framer Motion `AnimatePresence` + route-keyed variants. Slide for drill-down, fade for tab switches. |
| Micro-interactions on tap targets | Buttons/checkboxes/toggles that don't respond visually feel broken on mobile | LOW | Scale + opacity press feedback via Framer Motion `whileTap`. CSS `active:scale-95` works too. |
| Bottom sheet for quick actions | Native standard for contextual actions without leaving current context | MEDIUM | For add forms, filter options, item detail. Replaces full-page modals where content is <50% screen height. |
| Smooth scroll with momentum | Browsers provide this but must not be broken by overflow settings or touch handlers | LOW | Ensure `overflow-y: auto` with `-webkit-overflow-scrolling: touch` or equivalent is not overridden. |
| Loading/skeleton states | Blank content areas feel broken — even IndexedDB has async reads | LOW | Shimmer skeleton for list items during initial load. Most reads are instant after first hydration. |
| Clear active state on nav | Users need to know where they are — highlighted bottom nav item | LOW | Already exists but must survive animation/transition refactor without flash. |
| Thumb-zone optimized layout | Primary actions within reach of thumb — not at top of screen | MEDIUM | Add/complete/navigate buttons must be in lower 60% of screen. Affects layout of all 5 pages. |
| Swipe-to-complete on tasks | iOS/Android health apps universally support this — tapping checkbox feels slow | MEDIUM | Framer Motion drag + threshold detection. Reveal green action on swipe right, red on left. |
| Animated progress indicators | Static progress bars feel like desktop apps — animated fill is expected on mobile | LOW | CSS transitions or Framer Motion `animate` on width/strokeDashoffset. Animates on mount + value change. |
| Pull-to-refresh | Standard mobile refresh pattern — missing it forces users to find a button | MEDIUM | Requires disabling browser overscroll (`overscroll-behavior: none`) and custom touch handler. Not needed if data doesn't stale — log entries are local writes, but useful for perceived freshness. |

---

### Differentiators (Competitive Advantage)

Features that elevate beyond "functional" into "delightful." Align with the core value: every interaction feels effortless.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Staggered list animations on enter | Lists that cascade in feel alive vs appearing all at once — premium signal | LOW | Framer Motion `staggerChildren` on list container with `y: 20 → 0` + `opacity: 0 → 1`. |
| Swipe-to-delete with undo toast | Faster than tap-confirm-delete flows — 1 gesture vs 3 taps | MEDIUM | Left swipe reveals delete, action triggers dismissal animation + undo toast with 4s timer. |
| Animated macro counters | Numbers that tick up when meals are logged feel responsive and satisfying | MEDIUM | Framer Motion `useMotionValue` + spring physics. Triggers on value change, not on mount. |
| Contextual inline expansion | Tap a protocol/meal item to expand details inline instead of navigating away | HIGH | Framer Motion `layout` prop + `AnimatePresence` for smooth height animation. Avoids creating new route. |
| Shared element-style card transition | Hero card expands to detail view — spatial context preserved | HIGH | True shared element transitions are React Native only. Web alternative: fixed-position clone animation. Framer Motion `layoutId` achieves this with same-component morphing. |
| Spring physics on all interactive elements | Springs feel more tactile than linear/ease curves — subconscious quality signal | LOW | Replace `duration` easing with `type: "spring"` + `stiffness`/`damping` configs in Framer Motion. |
| Haptic feedback on key actions | Task completion, protocol dose logged — satisfying confirmation | LOW | Web Vibration API (`navigator.vibrate(50)`). iOS Safari does NOT support — Android Chrome only. Must be opt-in. |
| Streak/momentum visual indicator | Visual streak counter on dashboard reinforces habit consistency | MEDIUM | Requires streak calculation from existing store data. Animated flame or dot-calendar display. |
| Time-aware content ordering | Schedule page auto-scrolls to current time block on open | LOW | Scroll `scrollIntoView` on the element matching current hour on page mount. |
| Count-up animation on dashboard stats | Daily totals that animate from 0 on page enter feel dynamic vs static | LOW | Framer Motion `useSpring` or custom RAF-based counter. Triggers once per session. |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Complex swipe navigation between tabs | "Native apps do it" | Conflicts with scroll; horizontal swipe vs vertical scroll requires gesture disambiguation that is error-prone and frustrating | Keep bottom nav for tab switching. Reserve horizontal swipe for list item actions only. |
| Parallax scrolling | Looks impressive in demos | Causes motion sickness on mobile, kills scroll performance, contributes nothing to information architecture | Subtle fade-in on scroll (IntersectionObserver) is safer and equally polished. |
| Animated splash screen / logo intro | Feels premium at first | Users reopen the app dozens of times a day — a 2-second logo animation becomes infuriating fast | Use skeleton state for < 500ms perceived load, instant content for IndexedDB hydration. |
| Full-screen onboarding carousels | Expected for new apps | This is an existing personal app — the user knows how it works | Skip entirely. |
| Auto-playing sound effects | "Satisfying completion sounds" | Phones are often on silent, or in quiet environments — it's immediately muted and code remains dead weight | Use haptics (where supported) + visual micro-interaction instead. |
| Dark mode toggle | "Everyone expects it" | Scope constraint in PROJECT.md — one polished light theme first | Build the CSS token structure (custom properties) so dark mode can be layered in later without rework. |
| Infinite scroll / lazy pagination | "Scales better" | This is a personal productivity app — data sets are small (tens of items, not thousands). Adds complexity for zero user benefit. | Simple flat lists with skeleton state on initial load. |
| Real-time sync / multi-device | "Better data safety" | Out of scope — remains offline-first. Adds auth, conflict resolution, server infra. | Focus on backup/restore UX (already in Settings) and ensure export is obvious. |

---

## Feature Dependencies

```
Page Transitions
    └──requires──> Consistent route/key structure (App.tsx already uses routes)
    └──requires──> AnimatePresence wrapper at router level

Swipe-to-Complete (tasks)
    └──requires──> Framer Motion drag API
    └──enhances──> Haptic Feedback (triggers vibrate on swipe threshold)

Swipe-to-Delete with Undo Toast
    └──requires──> Framer Motion drag API
    └──requires──> Toast/notification component (none currently exists)
    └──conflicts with──> Swipe-to-Complete (same gesture direction — must use different axes)

Bottom Sheet
    └──requires──> Portal/overlay system
    └──enables──> Inline add forms (Schedule, Meals, Protocols)
    └──enables──> Item detail expansion (alternative to full-page)

Contextual Inline Expansion
    └──requires──> Framer Motion layout animations
    └──conflicts with──> Shared Element Transition (pick one per view — don't do both)

Animated Macro Counters
    └──requires──> Stable access to current macro totals (already in Zustand store)
    └──enhances──> Dashboard count-up animation

Spring Physics (global)
    └──enhances──> All Framer Motion animated components
    └──requires──> Consistent animation config object (share via constants file)

Streak Indicator
    └──requires──> Streak calculation from task completion history (check if store supports)

Time-aware Scroll
    └──requires──> Page mount lifecycle (useEffect on SchedulePage)
    └──requires──> Time-stamped schedule items (already exists)
```

### Dependency Notes

- **Swipe-to-Complete conflicts with Swipe-to-Delete:** Both use horizontal drag. Resolve by assigning right-swipe = complete (green), left-swipe = delete reveal (red). This is the iOS Mail / Things 3 pattern and is learnable.
- **Bottom Sheet enables multiple flows:** Build this component once and reuse across Schedule (add task), Meals (add meal/log entry), Protocols (dose log). Highest leverage single component.
- **Framer Motion is the central dependency:** Swipe gestures, page transitions, layout animations, spring physics, stagger lists — all route through it. Install once, configure globally.
- **Inline Expansion vs Shared Element:** Both solve "view detail without navigating away." Pick inline expansion (lower complexity) for list items with moderate detail. Reserve any shared element treatment for only the highest-value single transition (e.g., dashboard hero card → detail).

---

## MVP Definition

This is a UX overhaul, not a new product. MVP = the minimum set of UX changes that make the app feel native.

### Launch With (v1)

- [ ] Framer Motion installed + animation config established — unlocks everything else
- [ ] Page transitions (slide for drill-down, cross-fade for tab switches) — immediate perceived quality lift
- [ ] Micro-interactions on all tap targets (buttons, checkboxes, toggles) — makes every tap satisfying
- [ ] Staggered list entry animations — most visible change per effort
- [ ] Bottom sheet component — replaces multiple full-page add flows
- [ ] Swipe-to-complete on schedule tasks — highest-friction daily action eliminated
- [ ] Animated progress bars/rings on dashboard — data visualization upgrade

### Add After Core Is Working (v1.x)

- [ ] Swipe-to-delete with undo toast — requires toast component; add once swipe core is proven
- [ ] Animated macro counters — nice to have, add to Meals page second pass
- [ ] Time-aware scroll on Schedule — low effort, high perceived intelligence
- [ ] Haptic feedback — one-line addition per action once gesture layer is done
- [ ] Spring physics tuning pass — refine after initial animations are visible

### Future Consideration (v2+)

- [ ] Streak/momentum indicator — requires validating store has needed history data
- [ ] Shared element card transitions — high complexity, reserve for a dedicated polish phase
- [ ] Contextual inline expansion — evaluate after v1 ships; may not be needed if bottom sheet covers the need

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Page transitions | HIGH | LOW | P1 |
| Micro-interactions on tap targets | HIGH | LOW | P1 |
| Bottom sheet component | HIGH | MEDIUM | P1 |
| Swipe-to-complete tasks | HIGH | MEDIUM | P1 |
| Staggered list animations | HIGH | LOW | P1 |
| Animated progress on dashboard | HIGH | LOW | P1 |
| Spring physics global config | MEDIUM | LOW | P1 |
| Time-aware scroll on schedule | MEDIUM | LOW | P1 |
| Swipe-to-delete with undo | HIGH | MEDIUM | P2 |
| Animated macro counters | MEDIUM | MEDIUM | P2 |
| Haptic feedback | LOW | LOW | P2 |
| Count-up animation on stats | MEDIUM | LOW | P2 |
| Streak indicator | MEDIUM | HIGH | P3 |
| Shared element transitions | MEDIUM | HIGH | P3 |
| Contextual inline expansion | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for this milestone to feel complete
- P2: Should have, add in second pass within this milestone
- P3: Nice to have, defer or make a separate milestone

---

## Competitor Feature Analysis

| Feature | iOS Health / Streaks | Things 3 / Fantastical | Our Approach |
|---------|----------------------|------------------------|--------------|
| Tab navigation | Tab bar at bottom | Bottom bar or sidebar | Bottom nav (already exists, needs animation) |
| Task completion | Tap checkbox + spring animation | Tap with confetti burst | Swipe right (faster) + spring micro-interaction |
| Add new item | FAB or + in nav bar → sheet slides up | Keyboard-driven quick entry | Bottom sheet slide up from FAB or nav |
| Detail view | Card expands in-place or new screen slides in | Full screen slides in from right | Bottom sheet for simple detail, slide for complex |
| Progress | Ring animations fill on load | Progress bars in sidebar | Animated rings on dashboard, counters on meals page |
| Empty states | Illustrated with soft copy | Clean minimal with action | Minimal illustration + primary CTA — not designed yet |

---

## Sources

- [12 Mobile App UI/UX Design Trends for 2026](https://www.designstudiouiux.com/blog/mobile-app-ui-ux-design-trends/)
- [7 Mobile UX/UI Design Patterns Dominating 2026](https://www.sanjaydey.com/mobile-ux-ui-design-patterns-2026-data-backed/)
- [UI/UX Evolution 2026: Micro-Interactions & Motion](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/)
- [Bottom Sheets: Definition and UX Guidelines — NN/G](https://www.nngroup.com/articles/bottom-sheet/)
- [When to Use Bottom Sheets vs. Full Screens](https://medium.com/@sammi121313/when-to-use-bottom-sheets-vs-full-screens-a5a2393878c5)
- [Motion for React: Swipe Actions Tutorial](https://motion.dev/tutorials/react-swipe-actions)
- [Making Your Web App Feel Native](https://www.gfor.rest/blog/making-pwas-feel-native)
- [Vibration API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Haptic Feedback in Web Design](https://medium.com/@officialsafamarva/haptic-feedback-in-web-design-ux-you-can-feel-10e1a5095cee)
- [Skeleton Screens 101 — NN/G](https://www.nngroup.com/articles/skeleton-screens/)
- [Best Practices for Animated Progress Indicators — Smashing Magazine](https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/)
- [Chrome Overscroll Behavior — Developer Blog](https://developer.chrome.com/blog/overscroll-behavior)

---
*Feature research for: Mobile health PWA UX overhaul (時間の流れ)*
*Researched: 2026-03-13*
