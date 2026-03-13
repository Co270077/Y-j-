# Coding Conventions

**Analysis Date:** 2026-03-13

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Modal.tsx`, `Button.tsx`, `ProgressRing.tsx`)
- Utilities: camelCase (e.g., `notificationScheduler.ts`, `protocolSync.ts`, `time.ts`)
- Stores: camelCase (e.g., `settingsStore.ts`, `scheduleStore.ts`, `mealStore.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useDailyReset.ts`, `useClock.ts`)
- Pages: PascalCase with `Page` suffix (e.g., `DashboardPage.tsx`, `SettingsPage.tsx`)

**Functions:**
- Exported functions: camelCase (e.g., `parseTime`, `formatTime`, `scheduleNotification`)
- React components: PascalCase (e.g., `Modal`, `Button`, `Card`)
- Hook functions: camelCase with `use` prefix (e.g., `useDailyReset`, `useSwipe`)
- Utility functions: camelCase (e.g., `getTodayString`, `getCurrentDay`, `minutesSinceMidnight`)

**Variables:**
- Constants: camelCase for most values, UPPER_SNAKE_CASE for literal collections
  - Example: `const settings = useSettingsStore(s => s.settings)`
  - Example: `export const DAY_LABELS = { mon: 'Mon', ... }`
  - Example: `export const DAYS_ORDERED = ['mon', 'tue', ...]`
- React state: camelCase (e.g., `const [toasts, setToasts]`)
- Refs: camelCase with `Ref` suffix (e.g., `const overlayRef`, `const dialogRef`)

**Types:**
- Interface names: PascalCase (e.g., `ButtonProps`, `ModalProps`, `CardProps`)
- Type unions: PascalCase (e.g., `type Variant = 'primary' | 'secondary' | 'ghost'`)
- Generic parameters: Single uppercase letter (e.g., `T`, `K`, `V`)
- Database entity types: PascalCase (e.g., `Task`, `Protocol`, `AppSettings`)

## Code Style

**Formatting:**
- Tool: Tailwind CSS for styling (CSS-in-JS with className strings)
- Line length: No strict limit enforced, but generally concise
- Indentation: 2 spaces (inferred from Vite/ESLint defaults)
- Semicolons: Used at end of statements
- Quotes: Single quotes for strings (not enforced by config, but convention followed)

**Linting:**
- Tool: ESLint 9.39.1 with TypeScript support
- Config: `eslint.config.js` (flat config format)
- Key rules:
  - `react-hooks/set-state-in-effect: 'off'` — Allows setState in effects for modal form initialization
  - Extends `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
  - React Hooks plugin enforces dependency arrays and Hook rules
  - React Refresh plugin ensures fast refresh compatibility

**TypeScript Strict Mode:**
- Enabled in `tsconfig.app.json`
- `noUnusedLocals: true` — Flags unused local variables
- `noUnusedParameters: true` — Flags unused function parameters
- `noFallthroughCasesInSwitch: true` — Prevents missing break statements
- `strict: true` — Full strict mode including null/undefined checks
- `noUncheckedSideEffectImports: true` — Warns about side-effect imports

## Import Organization

**Order:**
1. React/external libraries (`import { useState } from 'react'`, `import { create } from 'zustand'`)
2. Components from project (`import Button from '../components/ui/Button'`)
3. Hooks from project (`import { useSettingsStore } from '../stores/settingsStore'`)
4. Utils/helpers (`import { parseTime } from '../utils/time'`)
5. Database/types (`import { db } from '../db/database'`, `import type { Task } from '../db/types'`)
6. Type imports: Use explicit `type` keyword (`import type { TaskProps } from '...'`)

**Path conventions:**
- Relative paths used throughout (e.g., `../components/ui/Button`)
- No path aliases configured
- Consistent `src/` as root for imports

**Type imports:**
- Separated with `type` keyword for clarity: `import type { AppSettings } from '../db/types'`
- Mixed imports group with interface declaration: `interface SettingsState { ... }`

## Error Handling

**Patterns:**
- Try/catch blocks wrap async operations in stores and utilities
- Catches log to console with contextual message: `console.error('Failed to load settings:', err)`
- User feedback via `showToast()` on errors: `showToast('Failed to save settings', 'error')`
- Database operations wrapped in try/catch (e.g., in `scheduleStore.ts`, `protocolStore.ts`)
- Component-level operations silently handle missing state with guards: `if (!settings?.id) return`

**Error flow:**
```typescript
try {
  const result = await db.tasks.add(task)
  set({ tasks })
} catch (err) {
  console.error('Failed to add task:', err)
  showToast('Failed to save task', 'error')
}
```

## Logging

**Framework:** `console` directly (no logger abstraction)

**Patterns:**
- `console.error()` for error conditions with prefixed message
- Message format: `'Failed to [action]: [additional context]'`
- No console.log() used in production code (logs only errors)
- Toast messages provide user-facing feedback (see `Toast.tsx` and `utils/toast.ts`)

**Example:**
```typescript
console.error('Failed to load settings:', err)
showToast('Failed to load settings', 'error')
```

## Comments

**When to Comment:**
- Function descriptions for exported utilities: Single-line JSDoc comment above function
- Complex logic or non-obvious behavior: Inline comments explaining "why"
- Component state/effects: Comments explain side effect purpose (seen in `Modal.tsx`, `useDailyReset.ts`)
- Skip obvious code — no comments needed for straightforward assignments

**JSDoc/TSDoc:**
- Single-line format: `/** Description */`
- Used for exported utility functions: `export function parseTime(time: string): Date`
- Rarely used for React components (props documented via TypeScript interfaces)
- Example from `utils/time.ts`:
  ```typescript
  /** Parse "HH:mm" string to a Date (today) */
  export function parseTime(time: string): Date
  ```

## Function Design

**Size:**
- Most functions 10-40 lines
- Longer functions in stores (async operations with complex state updates)
- Utilities kept small and focused (5-15 lines typical)

**Parameters:**
- Spread operator used to forward HTML attributes: `{ ...props }` in components
- Destructuring in function signatures: `function Button({ variant, size, ...props })`
- Type props explicitly: `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`

**Return Values:**
- Components return JSX (implicit React.ReactElement)
- Utilities return typed values: `string`, `number`, `Date`, `boolean`
- Async functions return `Promise<void>` or `Promise<Type>`
- Guards with early returns prevent null/undefined issues

**React Component Patterns:**
- Functional components with hooks only (no class components)
- Props interface extends HTML element types for native attributes
- Default parameters for optional props: `variant = 'primary'`
- `forwardRef` used for UI components needing ref forwarding (see `Button.tsx`)
- Fragment used implicitly (no explicit `<>` seen in examined files)

## Module Design

**Exports:**
- Named exports for utilities and types
- Default export for React components
- Type exports separated with `type` keyword

**Barrel Files:**
- Not observed in codebase
- Each component/module imported directly from its file

**Store Design:**
- Zustand stores use `create<StateInterface>` pattern
- State interface defines all methods and properties
- Store initialized with object containing state and actions
- Selectors used on component side: `const value = useStore(s => s.property)`

**Example store pattern:**
```typescript
interface SettingsState {
  settings: AppSettings | null
  isLoaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoaded: false,
  load: async () => { ... },
  update: async (patch) => { ... },
}))
```

## Accessibility

**Patterns:**
- Modal dialogs use `role="dialog"` and `aria-modal="true"` and `aria-labelledby`
- Input labels connected via `htmlFor` attribute
- Close buttons have `aria-label="Close"`
- Escape key handled for modals
- Auto-focus first input when modal opens
- Body scroll locked when modal open

---

*Convention analysis: 2026-03-13*
