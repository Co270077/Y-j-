---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/index.css
  - src/components/ui/Card.tsx
  - src/components/ui/FAB.tsx
  - src/components/ui/ProgressRing.tsx
  - src/components/ui/Button.tsx
  - src/components/ui/Input.tsx
  - src/components/ui/Toggle.tsx
  - src/components/ui/BottomSheet.tsx
  - src/components/ui/ConfirmDialog.tsx
  - src/components/ui/ErrorBoundary.tsx
  - src/components/ui/SwipeActionRow.tsx
  - src/components/ui/Toast.tsx
  - src/components/ui/Skeleton.tsx
  - src/components/layout/BottomNav.tsx
  - src/components/layout/Header.tsx
  - src/components/layout/AppShell.tsx
  - src/components/dashboard/StreakCard.tsx
  - src/components/dashboard/UpNextCard.tsx
  - src/components/dashboard/MealCard.tsx
  - src/components/dashboard/ProtocolCard.tsx
  - src/components/dashboard/TimelinePeek.tsx
  - src/components/dashboard/WeeklyAdherenceCard.tsx
  - src/components/schedule/TaskModal.tsx
  - src/components/schedule/TaskBlock.tsx
  - src/components/schedule/Timeline.tsx
  - src/components/schedule/SubtaskList.tsx
  - src/components/schedule/ScheduleSummary.tsx
  - src/components/schedule/DaySwitcher.tsx
  - src/components/schedule/TaskFilter.tsx
  - src/components/protocols/ProtocolList.tsx
  - src/components/protocols/ProtocolEditor.tsx
  - src/components/meals/MealTemplateEditor.tsx
  - src/components/meals/EatingWindowConfig.tsx
  - src/components/meals/MacroSummary.tsx
  - src/pages/DashboardPage.tsx
  - src/pages/SchedulePage.tsx
  - src/pages/ProtocolsPage.tsx
  - src/pages/MealsPage.tsx
  - src/pages/SettingsPage.tsx
autonomous: false

must_haves:
  truths:
    - "App background is true black (#000000) everywhere"
    - "All colored accents (green/bamboo, blue, orange) replaced with white or gray"
    - "Cards have 1px solid borders with minimal border-radius (4-8px)"
    - "FAB is solid white background with black plus icon"
    - "Bottom nav uses sharp geometric white indicator, not rounded pill"
    - "Progress rings use white fill on dark gray track"
    - "Typography uses Inter/Space Grotesk geometric sans-serif"
    - "Category colors replaced with monochrome variants (white/gray tones)"
  artifacts:
    - path: "src/index.css"
      provides: "Monochrome design system tokens and geometric CSS patterns"
      contains: "--color-surface: #000000"
  key_links:
    - from: "src/index.css"
      to: "all components"
      via: "Tailwind @theme CSS custom properties"
      pattern: "@theme"
---

<objective>
Overhaul the entire visual theme from the current warm Japanese (和風) aesthetic to a Monochrome Geometric / Cyber-Brutalist design system.

Purpose: Transform the app's visual identity to a stark black-and-white aesthetic with sharp geometric elements, removing all colored accents.
Output: Fully re-themed application with monochrome palette, geometric borders, updated typography, and CSS geometric flair patterns.
</objective>

<execution_context>
@/Users/samarceneaux/.claude/get-shit-done/workflows/execute-plan.md
@/Users/samarceneaux/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/index.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite design system tokens and global styles</name>
  <files>src/index.css</files>
  <action>
Completely rewrite the @theme block and global styles in index.css:

COLOR PALETTE — replace all existing color tokens:
- --color-black: #000000 (app background)
- --color-surface: #000000 (was #2C2C2C)
- --color-surface-raised: #111111 (was #3A3A3A — card backgrounds)
- --color-surface-overlay: #1A1A1A (was #4A4A4A)
- --color-white: #FFFFFF (primary accent, text)
- --color-gray-100: #E5E5E5
- --color-gray-300: #A1A1AA (secondary text, muted icons)
- --color-gray-500: #888888
- --color-gray-700: #333333 (borders)
- --color-gray-800: #222222 (progress track, subtle bg)
- --color-gray-900: #111111

Semantic tokens:
- --color-text-primary: #FFFFFF
- --color-text-secondary: #A1A1AA
- --color-text-muted: #888888
- --color-border: #333333
- --color-border-light: #222222
- --color-accent: #FFFFFF (replaces bamboo for active states)

Category colors — monochrome variants (differentiated by opacity/shade):
- --color-cat-supplement: #FFFFFF
- --color-cat-meal: #CCCCCC
- --color-cat-workout: #999999
- --color-cat-habit: #E5E5E5
- --color-cat-custom: #B3B3B3

Status colors — keep functional but desaturated:
- --color-success: #FFFFFF (was green)
- --color-warning: #A1A1AA (was orange)
- --color-danger: #888888 (was red)

REMOVE all old color tokens: charcoal, charcoal-light, charcoal-lighter, stone, stone-light, stone-dark, bamboo, bamboo-light, bamboo-dark, warm-white, warm-white-dim, ink, ink-light.

ADD Tailwind aliases so `bg-charcoal` etc. still resolve (map old names to new values to avoid breaking classes during migration):
- charcoal -> #000000
- charcoal-light -> #111111
- charcoal-lighter -> #1A1A1A
- stone -> #888888
- stone-light -> #A1A1AA
- bamboo -> #FFFFFF
- bamboo-light -> #E5E5E5
- bamboo-dark -> #CCCCCC
- warm-white -> #FFFFFF
- warm-white-dim -> #E5E5E5
- ink -> #000000
- ink-light -> #111111

BORDER RADIUS — make minimal:
- --radius-sm: 4px (was 6px)
- --radius-md: 6px (was 10px)
- --radius-lg: 8px (was 16px)
- --radius-xl: 8px (was 24px)

TYPOGRAPHY — update font stack:
- --font-sans: 'Inter', 'Space Grotesk', system-ui, sans-serif
- ADD --font-heading: 'Space Grotesk', 'Inter', system-ui, sans-serif

Update html/body background to #000000.

Update :focus-visible outline to use --color-accent (white) instead of bamboo.

Update .skeleton-shimmer gradient to use #111111/#1A1A1A/#111111.

Update .card-shadow to remove the warm tint: `box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);`

ADD geometric pattern CSS classes:
```css
.geo-pattern-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.geo-pattern-dots {
  background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 20px 20px;
}

.geo-pattern-diagonal {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 20px,
    rgba(255,255,255,0.02) 20px,
    rgba(255,255,255,0.02) 21px
  );
}
```

Update select dropdown arrow SVG stroke color from #8C8C7A to #888888.
  </action>
  <verify>
    <automated>cd /Users/samarceneaux/Desktop/EVO/Biohacking_CLAUDE_DEV/Dabbling_DEV/時間の流れ && npx vite build 2>&1 | tail -5</automated>
  </verify>
  <done>All CSS custom properties updated to monochrome palette. No references to old green/bamboo/warm colors remain in index.css. Geometric pattern classes added. Border radius minimized. Typography updated to Inter/Space Grotesk.</done>
</task>

<task type="auto">
  <name>Task 2: Update all components to monochrome geometric styling</name>
  <files>
    src/components/ui/Card.tsx
    src/components/ui/FAB.tsx
    src/components/ui/ProgressRing.tsx
    src/components/ui/Button.tsx
    src/components/ui/Input.tsx
    src/components/ui/Toggle.tsx
    src/components/ui/BottomSheet.tsx
    src/components/ui/ConfirmDialog.tsx
    src/components/ui/ErrorBoundary.tsx
    src/components/ui/SwipeActionRow.tsx
    src/components/ui/Toast.tsx
    src/components/ui/Skeleton.tsx
    src/components/layout/BottomNav.tsx
    src/components/layout/Header.tsx
    src/components/layout/AppShell.tsx
    src/components/dashboard/StreakCard.tsx
    src/components/dashboard/UpNextCard.tsx
    src/components/dashboard/MealCard.tsx
    src/components/dashboard/ProtocolCard.tsx
    src/components/dashboard/TimelinePeek.tsx
    src/components/dashboard/WeeklyAdherenceCard.tsx
    src/components/schedule/TaskModal.tsx
    src/components/schedule/TaskBlock.tsx
    src/components/schedule/Timeline.tsx
    src/components/schedule/SubtaskList.tsx
    src/components/schedule/ScheduleSummary.tsx
    src/components/schedule/DaySwitcher.tsx
    src/components/schedule/TaskFilter.tsx
    src/components/protocols/ProtocolList.tsx
    src/components/protocols/ProtocolEditor.tsx
    src/components/meals/MealTemplateEditor.tsx
    src/components/meals/EatingWindowConfig.tsx
    src/components/meals/MacroSummary.tsx
    src/pages/DashboardPage.tsx
    src/pages/SchedulePage.tsx
    src/pages/ProtocolsPage.tsx
    src/pages/MealsPage.tsx
    src/pages/SettingsPage.tsx
  </files>
  <action>
Read each file listed above and update Tailwind classes and inline styles to match the new monochrome geometric theme. Key changes per component type:

CRITICAL UI COMPONENTS (specific changes required):

1. **Card.tsx**: Change `rounded-[var(--radius-lg)]` to `rounded-[var(--radius-md)]`. Replace `border-border-light` with `border-gray-700`. Remove `card-shadow` class (borders are the visual separation now, not shadows). Background stays `bg-surface-raised` (now maps to #111111).

2. **FAB.tsx**: Change from `bg-bamboo text-warm-white` to `bg-white text-black`. This makes the FAB solid white with black icon per requirements. Remove `shadow-lg shadow-black/30` (no shadows in brutalist). Change `rounded-full` to `rounded-lg` (geometric, not circular).

3. **BottomNav.tsx**:
   - Change `bg-charcoal border-t border-border` to `bg-black border-t border-gray-700`
   - Active tab: change `text-bamboo` to `text-white`
   - Inactive tab: change `text-stone hover:text-stone-light` to `text-gray-500 hover:text-gray-300`
   - Replace the rounded pill indicator (`rounded-xl bg-bamboo/15`) with a sharp white geometric indicator: remove `rounded-xl`, change to `bg-white/10` with sharp corners, OR replace with a small white square dot below the icon (e.g., a 4px white square `w-1 h-1 bg-white` below the label)

4. **ProgressRing.tsx**: Change default `color` prop from `var(--color-bamboo)` to `var(--color-accent)` (now white). Change default `bgColor` from `var(--color-charcoal-lighter)` to `var(--color-gray-800)`.

5. **Header.tsx**: Update any bamboo/green references. If using `glass-header`, keep it but ensure bg references black. Add `geo-pattern-diagonal` class to header background if appropriate.

6. **Toggle.tsx**: Replace any green/bamboo active state colors with white.

7. **Button.tsx**: Primary variant should use `bg-white text-black` instead of any colored variant. Secondary/ghost variants should use `border-gray-700 text-white`.

8. **SwipeActionRow.tsx**: Replace green reveal color with white, red reveal with gray-500.

9. **Toast.tsx**: Replace colored backgrounds with `bg-surface-raised border border-gray-700`.

ALL OTHER COMPONENTS — systematic find-and-replace in each file:
- `text-bamboo` -> `text-white`
- `bg-bamboo` -> `bg-white` and add `text-black` where text is on that bg
- `bamboo/15` or `bamboo/10` opacity variants -> `white/10` or `white/5`
- `text-warm-white` -> `text-white`
- `text-stone` -> `text-gray-500`
- `text-stone-light` -> `text-gray-300`
- `bg-charcoal` -> `bg-black`
- `bg-surface` -> `bg-black` (surface is now #000000)
- `border-border` -> `border-gray-700`
- `border-border-light` -> `border-gray-800`
- `rounded-xl` on cards -> `rounded-md` or `rounded-lg` (max 8px)
- `rounded-2xl` -> `rounded-lg`
- Any remaining `rounded-[var(--radius-xl)]` or `rounded-[var(--radius-lg)]` will auto-resolve via CSS token changes

For category color classes (cat-supplement, cat-meal, etc.) — these now map to gray shades via CSS tokens; no class changes needed in components unless hardcoded hex values exist.

Add `geo-pattern-grid` class to DashboardPage main container background for subtle geometric texture.

Do NOT change: component structure, props, event handlers, motion animations, or any logic. This is purely a visual/styling pass.
  </action>
  <verify>
    <automated>cd /Users/samarceneaux/Desktop/EVO/Biohacking_CLAUDE_DEV/Dabbling_DEV/時間の流れ && npx vite build 2>&1 | tail -5</automated>
  </verify>
  <done>All 38+ component files updated. No references to bamboo, warm-white, stone, charcoal as visual colors remain (old token aliases exist only as Tailwind compatibility mappings in index.css). FAB is white-on-black. BottomNav has sharp geometric indicator. Cards have minimal border-radius with 1px borders. Progress rings use white on dark track.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete monochrome geometric / cyber-brutalist theme overhaul across the entire application — color palette, typography, borders, FAB, bottom nav, progress rings, cards, and geometric patterns.</what-built>
  <how-to-verify>
    1. Run `npm run dev` and open the app in browser
    2. Verify Dashboard: true black background, white text, cards with thin 1px borders and minimal corner radius, geometric grid pattern visible
    3. Verify FAB: solid white square-ish button with black plus icon (not green, not circular)
    4. Verify Bottom Nav: black background, white active tab indicator (sharp geometric, not rounded pill), gray inactive icons
    5. Verify Progress Rings: white fill arcs on dark gray tracks (not green)
    6. Navigate through Schedule, Protocols, Meals, Settings pages — confirm no green, blue, orange, or colored accents remain
    7. Verify category-colored elements (task blocks, protocol cards) use monochrome gray tones
    8. Check typography feels clean and geometric (Inter/Space Grotesk stack)
  </how-to-verify>
  <resume-signal>Type "approved" or describe specific issues to fix</resume-signal>
</task>

</tasks>

<verification>
- `npx vite build` completes without errors
- No references to old hex values (#6B8E6B, #8AAE8A, #4E6E4E, #F5F0E8, #E8E3DA, #1A1A2E, #2C2C2C, #8C8C7A, #A8A893, #7B9ACC, #CC9B6B, #CC6B6B, #9B7BCC, #6BCCB0) remain in any src/ file
- Visual inspection confirms monochrome aesthetic
</verification>

<success_criteria>
- App is entirely monochrome black/white/gray — zero colored accents
- FAB is white bg with black icon
- Cards have 1px solid borders, max 8px border-radius
- Bottom nav has sharp geometric active indicator
- Progress rings are white on dark gray
- Geometric CSS patterns are available and applied to dashboard
- Build passes clean
</success_criteria>

<output>
After completion, create `.planning/quick/1-overhaul-visual-theme-to-monochrome-geom/1-SUMMARY.md`
</output>
