# Architecture

**Analysis Date:** 2026-03-13

## Pattern Overview

**Overall:** Layered client-side SPA with offline-first state management

**Key Characteristics:**
- React Router for page navigation with per-page components
- Zustand stores for global state (schedule, protocols, meals, settings)
- Dexie for local IndexedDB persistence
- Modular component structure by feature domain
- Cross-cutting concerns isolated in utils and hooks

## Layers

**Presentation (Page/Screen Layer):**
- Purpose: Route handlers that compose feature components into full pages
- Location: `src/pages/`
- Contains: Page components (`DashboardPage.tsx`, `SchedulePage.tsx`, `ProtocolsPage.tsx`, `MealsPage.tsx`, `SettingsPage.tsx`)
- Depends on: Stores (via hooks), route state, layout shell
- Used by: React Router in `App.tsx`

**Feature Components (Domain Layer):**
- Purpose: Self-contained UI modules for specific domains (schedule, meals, protocols, dashboard)
- Location: `src/components/` subdirectories (`schedule/`, `meals/`, `protocols/`, `dashboard/`)
- Contains: Feature-specific components that manage domain interactions
- Depends on: Stores, UI components, utils
- Used by: Page components

**UI Component Library:**
- Purpose: Reusable base components (buttons, modals, cards, inputs)
- Location: `src/components/ui/`
- Contains: Stateless or lightly-stateful presentational components
- Depends on: Tailwind CSS classes
- Used by: Feature components and pages

**Layout Shell:**
- Purpose: App wrapper providing consistent header, navigation, routing structure
- Location: `src/components/layout/` (`AppShell.tsx`, `Header.tsx`, `BottomNav.tsx`)
- Contains: Navigation structure, toast container, page outlet
- Depends on: React Router
- Used by: App root

**State Management (Store Layer):**
- Purpose: Centralized state for schedule, protocols, meals, and settings with Dexie persistence
- Location: `src/stores/`
- Contains: Four Zustand stores (`scheduleStore.ts`, `protocolStore.ts`, `mealStore.ts`, `settingsStore.ts`)
- Depends on: Database layer, toast notifications, utils
- Used by: All pages and components via hooks

**Database (Persistence Layer):**
- Purpose: IndexedDB schema and initialization via Dexie ORM
- Location: `src/db/`
- Contains: `database.ts` (Dexie class, table definitions), `types.ts` (domain types)
- Depends on: Dexie library
- Used by: All stores for CRUD operations

**Utilities (Cross-Cutting):**
- Purpose: Pure functions for time, notifications, protocol sync, IDs, haptics, toast
- Location: `src/utils/`
- Contains: `time.ts` (date formatting), `notificationScheduler.ts` (Notification API integration), `protocolSync.ts` (protocol-to-task conversion), `notifications.ts`, `ids.ts`, `haptics.ts`, `toast.ts`
- Depends on: date-fns, browser APIs
- Used by: Stores and components

**Custom Hooks:**
- Purpose: Encapsulate reactive logic for time, daily reset, gesture handling
- Location: `src/hooks/`
- Contains: `useClock.ts` (real-time clock), `useDailyReset.ts` (midnight reset), `useSwipe.ts` (touch gestures)
- Depends on: React, stores, utils
- Used by: Components and pages

## Data Flow

**Initialization Flow:**

1. App mounts in `src/main.tsx` → renders `App.tsx`
2. `App.tsx` calls store `.load()` methods on mount (load settings, schedule, protocols, meals)
3. Stores query Dexie database (`db.*`) and set local state
4. Components subscribe to stores via hooks (e.g., `useScheduleStore(s => s.tasks)`)
5. Routes render pages with hydrated state

**Task Completion Flow:**

1. User clicks task checkbox in schedule or dashboard
2. Component calls `toggleTaskComplete(taskId, date)` from schedule store
3. Store creates/updates `DailyLog` in Dexie database
4. Store updates local `dailyLogs` state
5. Components re-render with new completion status

**Protocol Sync Flow:**

1. User creates/activates protocol in ProtocolsPage
2. Protocol store calls `syncProtocolToSchedule(protocol)` utility
3. Utility transforms protocol (timing rules, supplements) into Task objects
4. Utility adds tasks to Dexie tasks table
5. Protocol store refreshes schedule store via dynamic import
6. Schedule components re-render with new auto-generated tasks

**Settings Persistence Flow:**

1. User changes setting in SettingsPage
2. Component calls `settingsStore.update(patch)`
3. Store updates Dexie settings record
4. Store updates local `settings` state
5. Clock hook or App re-schedules notifications via `scheduleTaskNotifications()`

**State Management:**
- All state updates flow through Zustand stores
- Stores are the single source of truth, backed by Dexie
- Components read state via store hooks (selectors reduce re-renders)
- No prop drilling; stores accessed directly where needed

## Key Abstractions

**Zustand Store Pattern:**
- Purpose: Global state container with built-in async actions
- Examples: `src/stores/scheduleStore.ts`, `src/stores/protocolStore.ts`, `src/stores/mealStore.ts`, `src/stores/settingsStore.ts`
- Pattern: `create<State>((set, get) => ({ ...state, ...actions }))`
- Allows: Lazy loading, optimistic updates, error handling via `showToast()`

**Dexie Table Abstraction:**
- Purpose: IndexedDB operations with type safety
- Examples: `db.tasks`, `db.protocols`, `db.dailyLogs`
- Pattern: Store actions call `db.table.add/update/delete/where()`
- Allows: Indexing (by date, taskId, category), querying, async persistence

**Protocol-to-Task Sync:**
- Purpose: Convert supplement protocol definitions into schedule tasks
- Location: `src/utils/protocolSync.ts`
- Pattern: Reads `Protocol` object, generates `Task` objects based on timing rules, supplements
- Allows: Non-manual task scheduling for recurring protocols

**Timing Rule Resolution:**
- Purpose: Calculate absolute times from relative rules (e.g., "30 mins after wake")
- Location: `src/db/types.ts` (type definition), `src/utils/protocolSync.ts` (execution)
- Pattern: `TimingRule` union type supports specific times, meal-relative, wake/sleep-relative
- Allows: Flexible supplement scheduling

## Entry Points

**App Root (`src/App.tsx`):**
- Location: Mounted in `src/main.tsx`
- Triggers: Page load
- Responsibilities:
  - Initialize all stores on mount
  - Set up daily reset hook
  - Configure notification scheduling
  - Render router with nested routes

**Main DOM Render (`src/main.tsx`):**
- Location: Vite entry point
- Triggers: Page load
- Responsibilities: Mount React app to DOM root with StrictMode

**Layout Shell (`src/components/layout/AppShell.tsx`):**
- Location: Wraps all routes via `<Route element={<AppShell />}>`
- Triggers: Route navigation
- Responsibilities:
  - Render header/footer structure
  - Manage toast notifications
  - Handle scroll-to-top on navigation
  - Outlet for page content

**Page Components (`src/pages/`):**
- Location: Rendered by Router per route
- Triggers: Route match (e.g., `/schedule` → `SchedulePage.tsx`)
- Responsibilities: Compose feature components, read stores, manage page-specific state

## Error Handling

**Strategy:** Fail-safe with user feedback via toast notifications

**Patterns:**
- All async store actions wrapped in try/catch
- Errors logged to console
- User-facing errors shown via `showToast(message, 'error')`
- State does not update if operation fails (remains stale but consistent)
- Database operations fail gracefully without crashing app

**Example from `scheduleStore.ts`:**
```typescript
addTask: async (taskData) => {
  try {
    const task: Task = { ...taskData, createdAt: new Date() }
    const id = await db.tasks.add(task)
    const tasks = await db.tasks.toArray()
    set({ tasks })
    return id
  } catch (err) {
    console.error('Failed to add task:', err)
    showToast('Failed to save task', 'error')
    return -1
  }
}
```

## Cross-Cutting Concerns

**Logging:** console.error for failures, no structured logging

**Validation:** Zod schema checking at store boundaries (protocol timing rules, task structure)

**Authentication:** Not applicable (offline PWA, no server)

**Notifications:**
- Browser Notification API integration in `src/utils/notificationScheduler.ts`
- Scheduled when tasks load or settings change
- Respects `settings.notificationsEnabled` flag

---

*Architecture analysis: 2026-03-13*
