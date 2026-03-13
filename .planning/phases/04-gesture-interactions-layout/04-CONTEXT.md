# Phase 4: Gesture Interactions + Layout - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

High-friction flows are replaced with swipe gestures and bottom sheets. Users can swipe right to complete schedule tasks, swipe left to reveal delete on any list item with undo, add/edit items via bottom sheets instead of full-page navigation, and expand protocol/meal details inline without leaving the page. No new features — purely replacing existing interaction patterns with lower-friction alternatives.

</domain>

<decisions>
## Implementation Decisions

### Swipe Gesture Feel
- Replace existing `useSwipe.ts` (basic touch detection) with `@use-gesture/react` `useDrag` — already installed, provides velocity, direction, cancel, and spring-ready values
- Swipe-right-to-complete (schedule tasks): iOS Mail-style reveal — item slides right to expose a green "done" background with checkmark icon behind it
- Drag follows finger with 1:1 tracking during swipe; rubber-band resistance past threshold
- Completion threshold: 40% of item width — past threshold, background turns fully green and checkmark scales up to signal "release to complete"
- Below threshold on release: spring back to origin (snappy transition)
- Above threshold on release: item slides fully off-screen right, then collapses height with spring, then fires completion callback
- Haptic feedback (hapticSuccess) fires at threshold crossing, not on release — gives immediate tactile confirmation
- Swipe-left-to-delete: item slides left to expose a red "delete" background with trash icon — same threshold logic but in reverse
- No simultaneous left+right — gesture direction locks after 10px of horizontal movement
- Vertical scroll takes priority — if vertical movement > horizontal in first 10px, cancel gesture entirely (prevent scroll hijacking)

### Bottom Sheet Behavior
- Upgrade existing Modal.tsx to a unified BottomSheet component — Modal already has handle bar, slide-up animation, backdrop, scroll lock, and escape-to-close
- Add drag-to-dismiss via `@use-gesture/react` `useDrag` on the handle bar area — drag down past 30% of sheet height dismisses with spring animation
- Velocity-based dismiss: fast downward flick (velocity > 500px/s) dismisses regardless of position
- Sheet snaps to detents: "peek" (40% viewport), "half" (50%), "full" (90vh, current max) — default detent configurable per use case
- Add-task form: opens at "half" detent (enough for the form fields)
- Meal template editor: opens at "full" detent (complex form with food items)
- Protocol editor: opens at "full" detent (supplements list + timing rules)
- Quick-view detail sheets: open at "peek" or "half" depending on content
- Backdrop opacity interpolates with sheet position — fully transparent when closed, 50% black at full open
- Sheet content scrolls internally; drag-to-dismiss only activates when content is scrolled to top (prevents dismiss during scroll)
- Rename Modal.tsx to BottomSheet.tsx; update all imports — single component, not two competing patterns
- Keep existing props API (isOpen, onClose, title, children) and add optional `detent` prop

### Inline Expansion Style
- Protocol items: tap to expand card with AnimatePresence height animation — card grows to reveal supplement details, timing rules, and cycle pattern
- Collapsed state shows: protocol name, supplement count, cycle pattern summary, active/inactive badge (already present in ProtocolList.tsx)
- Expanded state adds: full supplement list with doses and timing, edit button, notes if any
- Meal template items: same pattern — collapsed shows name, food count, macro summary; expanded shows full food list with individual macros, edit button
- Animation: `m.div` with `initial={{ height: 0, opacity: 0 }}` → `animate={{ height: "auto", opacity: 1 }}` with `snappy` transition
- Only one item expanded at a time per list (accordion behavior) — expanding one collapses the previously expanded
- Tap expanded item again to collapse
- Expanded card gets a subtle elevated shadow to visually lift it from siblings

### Swipe-Delete Targets + Undo
- Swipe-left-to-delete applies to: schedule tasks, protocol items, and meal template items — all deletable list items
- Dashboard cards: NO swipe-delete (read-only summary cards, not user-created items)
- On swipe-delete: item animates out (slide left + height collapse), then undo toast appears
- Undo toast: 5 second duration with countdown indicator, positioned above bottom nav
- During undo window: item is removed from UI but NOT deleted from database — soft delete via local state flag
- Tapping "Undo" restores item with reverse animation (slide back in from left + height expand)
- After undo window expires: actual database deletion fires
- If user navigates away during undo window: deletion commits immediately (no dangling soft-deletes)
- Only one undo toast active at a time — new swipe-delete replaces previous undo toast and commits the previous deletion
- Toast uses existing Toast.tsx pattern but with custom "undo" action button variant

### Claude's Discretion
- Exact gesture spring constants for swipe feedback
- BottomSheet detent snap animation tuning
- Whether to extract a reusable `useSwipeAction` hook or keep gesture logic per-component
- Skeleton/loading states for bottom sheet content
- Exact shadow values for expanded inline cards
- Whether BottomSheet needs keyboard-aware repositioning for form inputs

</decisions>

<specifics>
## Specific Ideas

- User requested fully autonomous decisions — all areas are Claude's discretion within the success criteria
- Animation personality carries from Phase 1: iOS system animation feel, snappy, no bounce or overshoot
- Named transition presets (snappy, gentle, instant) already established — reuse, don't create new ones
- Swipe gestures should feel like iOS Mail (swipe-to-archive/delete) — the gold standard for mobile swipe UX
- Bottom sheet should feel like iOS share sheet / Apple Maps — drag handle, snap points, velocity dismiss

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useSwipe.ts`: Basic touch-start/end hook — will be replaced by `@use-gesture/react` `useDrag` for proper gesture tracking
- `Modal.tsx`: Already a bottom-sheet visually (handle bar, slide-up, backdrop, scroll lock) — upgrade path, not rebuild
- `motion/variants.ts`: `slideUp`, `fadeIn`, `scaleIn`, `tap`, `completePulse` — slideUp reusable for sheet animation
- `motion/transitions.ts`: `snappy`, `gentle`, `instant` spring presets — snappy for gestures, gentle for sheet
- `Toast.tsx` + `toast.ts`: Existing toast system — extend with undo action variant
- `haptics.ts`: `hapticSuccess`, `hapticLight` — hapticSuccess for swipe-complete threshold
- `Card.tsx`: Used by ProtocolList and MealsPage for item cards — will need to support expanded state
- `ConfirmDialog.tsx`: Currently used for delete confirmation — swipe-delete + undo replaces this pattern for list items

### Established Patterns
- `@use-gesture/react` installed but not yet used — `useDrag` is the primary hook needed
- Motion `m.` components with `whileTap`, `AnimatePresence`, spring-based animations
- LazyMotion `domAnimation` globally; `domMax` designated for gesture-heavy pages (Phase 1 decision)
- Zustand stores with `showToast()` for user feedback
- `forwardRef` pattern on UI components (Button, Input)

### Integration Points
- `TaskBlock.tsx`: Add swipe-right-to-complete and swipe-left-to-delete gesture wrapper
- `ProtocolList.tsx`: Add swipe-left-to-delete + inline expansion on tap (replace `onSelect` navigation)
- `MealsPage.tsx`: Add swipe-left-to-delete on templates + inline expansion (replace opening MealTemplateEditor modal for viewing)
- `Modal.tsx` → `BottomSheet.tsx`: Rename and upgrade with drag-to-dismiss + detents
- `TaskModal.tsx`, `MealTemplateEditor.tsx`, `EatingWindowConfig.tsx`, `ProtocolEditor.tsx`: Already use Modal — will automatically get BottomSheet behavior after Modal upgrade
- `SchedulePage.tsx`, `ProtocolsPage.tsx`, `MealsPage.tsx`: Pages where FAB opens add flows — FAB now triggers BottomSheet
- `Toast.tsx`: Extend with undo action button for swipe-delete flow
- `LazyMotion`: Gesture-heavy pages may need `domMax` features — evaluate during implementation

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-gesture-interactions-layout*
*Context gathered: 2026-03-13*
