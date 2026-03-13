# Codebase Structure

**Analysis Date:** 2026-03-13

## Directory Layout

```
時間の流れ/
├── src/
│   ├── assets/                    # SVG/icon assets
│   ├── components/                # React components by feature domain
│   │   ├── dashboard/             # Dashboard cards and widgets
│   │   ├── layout/                # App shell, header, navigation
│   │   ├── meals/                 # Meal planning and templates UI
│   │   ├── protocols/             # Protocol creation and management UI
│   │   ├── schedule/              # Task scheduling and timeline UI
│   │   └── ui/                    # Base UI components (buttons, modals, inputs)
│   ├── db/                        # Database layer (Dexie + types)
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Page components (route handlers)
│   ├── stores/                    # Zustand state stores
│   ├── utils/                     # Utility functions (time, notifications, sync)
│   ├── App.tsx                    # Root router component
│   ├── main.tsx                   # DOM mount point
│   └── index.css                  # Global Tailwind styles
├── public/
│   ├── icons/                     # PWA icons (192x192, 512x512)
│   └── rootCA.pem                 # HTTPS certificate for local dev
├── dist/                          # Build output (generated)
├── node_modules/                  # Dependencies (generated)
├── .planning/
│   └── codebase/                  # This directory; documentation
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite + PWA + TailwindCSS config
├── tsconfig.json                  # TypeScript root config
├── tsconfig.app.json              # App-specific TS config
├── tsconfig.node.json             # Node (build) TS config
└── index.html                     # HTML entry point
```

## Directory Purposes

**`src/assets/`:**
- Purpose: Project images, icons, SVG assets
- Contains: Images referenced in component JSX
- Key files: None currently (empty or minimal)

**`src/components/`:**
- Purpose: All React UI components organized by feature domain
- Contains: Functional components using hooks, props, and store connections
- Key subdirectories: `dashboard/`, `layout/`, `meals/`, `protocols/`, `schedule/`, `ui/`

**`src/components/dashboard/`:**
- Purpose: Dashboard page widgets and cards
- Contains: Components like `UpNextCard.tsx`, `ProgressCard.tsx`, `StreakCard.tsx`, `WeeklyAdherenceCard.tsx`, `ProtocolCard.tsx`, `MealCard.tsx`, `WelcomeCard.tsx`, `DashboardGrid.tsx`, `TimelinePeek.tsx`
- Pattern: Self-contained card components that read stores and display summary info

**`src/components/layout/`:**
- Purpose: App-level layout structure
- Contains: `AppShell.tsx` (main wrapper), `Header.tsx` (top bar), `BottomNav.tsx` (navigation tabs)
- Key responsibility: Provides consistent header, navigation, and outlet for route content

**`src/components/meals/`:**
- Purpose: Meal planning and template UI
- Contains: Components for creating/editing meal templates and plans
- Dependencies: `useMealStore` hook

**`src/components/protocols/`:**
- Purpose: Supplement protocol creation and management
- Contains: Protocol editor, timing rule selector, cycle pattern UI
- Dependencies: `useProtocolStore` hook

**`src/components/schedule/`:**
- Purpose: Task scheduling, timeline, and completion tracking
- Contains: `Timeline.tsx` (visual schedule), `TaskBlock.tsx` (individual task), `TaskModal.tsx` (editor), `SubtaskList.tsx`, `DaySwitcher.tsx`, `TaskFilter.tsx`, `ScheduleSummary.tsx`
- Pattern: Heavily interconnected; timeline visualizes tasks, modal edits, filter controls view

**`src/components/ui/`:**
- Purpose: Reusable base components (design system)
- Contains: `Button.tsx`, `Input.tsx`, `Card.tsx`, `Modal.tsx`, `Toast.tsx`, `Toggle.tsx`, `ProgressRing.tsx`, `ConfirmDialog.tsx`
- Pattern: Headless, stateless or minimal state; styled with Tailwind

**`src/db/`:**
- Purpose: Database schema and type definitions
- Contains: `database.ts` (Dexie class, schema), `types.ts` (all domain types)
- Key responsibility: Single source of truth for data shapes and persistence layer

**`src/hooks/`:**
- Purpose: Custom React hooks for reactive logic
- Contains: `useClock.ts` (real-time updates), `useDailyReset.ts` (midnight reset trigger), `useSwipe.ts` (touch gesture detection)
- Pattern: Encapsulate side effects and state subscriptions

**`src/pages/`:**
- Purpose: Route handlers that compose pages
- Contains: `DashboardPage.tsx`, `SchedulePage.tsx`, `ProtocolsPage.tsx`, `MealsPage.tsx`, `SettingsPage.tsx`
- Pattern: Top-level components for each main route; compose feature components

**`src/stores/`:**
- Purpose: Global state management via Zustand
- Contains: `scheduleStore.ts`, `protocolStore.ts`, `mealStore.ts`, `settingsStore.ts`
- Pattern: Each store handles one domain; actions perform DB operations and update state

**`src/utils/`:**
- Purpose: Pure utility functions and cross-cutting concerns
- Contains:
  - `time.ts` — Date/time helpers, formatting
  - `notificationScheduler.ts` — Browser Notification API scheduling
  - `protocolSync.ts` — Transform protocols into schedule tasks
  - `notifications.ts` — Notification payload helpers
  - `ids.ts` — ID/UUID generation
  - `haptics.ts` — Haptic feedback wrappers
  - `toast.ts` — Toast notification API

**`public/`:**
- Purpose: Static assets served at `/`
- Contains: PWA icons, HTTPS certificates for local dev
- `public/icons/` — Icon assets for PWA manifest

**`dist/`:**
- Purpose: Build output directory
- Generated: By `npm run build` (Vite output)
- Committed: No (in .gitignore)

**`.planning/codebase/`:**
- Purpose: Architectural documentation (this directory)
- Contains: ARCHITECTURE.md, STRUCTURE.md, and generated analysis docs

## Key File Locations

**Entry Points:**
- `src/main.tsx` — DOM mount point; calls `createRoot()` and renders `<App />`
- `index.html` — HTML template with `<div id="root">`
- `src/App.tsx` — Router and store initialization; renders `<BrowserRouter>` with routes

**Configuration:**
- `package.json` — Dependency management, build scripts
- `vite.config.ts` — Vite build config, PWA plugin, TailwindCSS, HTTPS setup
- `tsconfig.json` — TypeScript project references
- `tsconfig.app.json` — App TypeScript settings

**Core Logic:**
- `src/db/database.ts` — Dexie schema and database instance
- `src/db/types.ts` — All domain types (Task, Protocol, Meal, DailyLog, Settings)
- `src/stores/*.ts` — State management for each domain

**Testing:**
- No test files currently in codebase

## Naming Conventions

**Files:**
- Page components: `PascalCase.tsx` (e.g., `DashboardPage.tsx`, `SchedulePage.tsx`)
- Feature components: `PascalCase.tsx` (e.g., `TaskBlock.tsx`, `ProtocolCard.tsx`)
- Utility/store files: `camelCase.ts` (e.g., `scheduleStore.ts`, `protocolSync.ts`)
- Hook files: `camelCase.ts` starting with `use` (e.g., `useClock.ts`, `useDailyReset.ts`)

**Directories:**
- Feature domains: `lowercase` (e.g., `schedule/`, `protocols/`, `meals/`, `dashboard/`)
- Core logic: `lowercase` (e.g., `db/`, `hooks/`, `stores/`, `utils/`)

**Components:**
- Exported as named exports or default; file name matches component name

## Where to Add New Code

**New Feature (e.g., Water Intake Tracker):**
- Primary code: Create `src/components/water/` directory with feature components
- Store: Add `src/stores/waterStore.ts` following `scheduleStore.ts` pattern
- Types: Extend `src/db/types.ts` with new types
- Database: Add table to `src/db/database.ts` schema
- Page: Create `src/pages/WaterPage.tsx` to render feature
- Route: Add route to `src/App.tsx` BrowserRouter

**New Utility Function:**
- Location: `src/utils/[domain].ts` (e.g., `src/utils/waterCalculations.ts`)
- Pattern: Pure function, no side effects if possible
- Export: Named export, used by stores and components

**New Custom Hook:**
- Location: `src/hooks/useWaterTracking.ts`
- Pattern: Follow `useClock.ts` or `useDailyReset.ts`
- Use: From components or pages that need reactive logic

**New UI Component:**
- Location: `src/components/ui/WaterCard.tsx`
- Pattern: Stateless or lightly-stateful, styled with Tailwind, reusable
- Use: From feature components

**New Database Table:**
- Schema: Update `src/db/database.ts` version and stores definition
- Types: Add interface to `src/db/types.ts`
- Store: Create corresponding store in `src/stores/` with load/add/update/delete actions

## Special Directories

**`src/assets/`:**
- Purpose: Static imports for images/icons
- Generated: No
- Committed: Yes

**`dist/`:**
- Purpose: Build output
- Generated: Yes (by Vite during build)
- Committed: No

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by npm/yarn install)
- Committed: No

**`public/`:**
- Purpose: Static files copied to build root
- Generated: No (manually maintained)
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD documentation
- Generated: By mapping tools
- Committed: Yes

---

*Structure analysis: 2026-03-13*
