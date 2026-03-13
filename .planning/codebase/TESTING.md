# Testing Patterns

**Analysis Date:** 2026-03-13

## Test Framework

**Runner:**
- Not configured
- No test runner found in `package.json` (dependencies or devDependencies)
- No `jest.config.js`, `vitest.config.ts`, or similar config files

**Assertion Library:**
- Not applicable — testing framework not present

**Run Commands:**
```bash
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint check
npm run preview          # Preview built app
npm run serve            # Build and serve
```

## Test File Organization

**Status:** No test files in codebase

**Investigation:**
- Glob search for `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` in `src/` directory found no results
- Only test files located in `node_modules/` (dependency tests, not project tests)
- No `__tests__`, `tests/`, or `test/` directories in project structure

## Current Coverage

**Summary:** Zero test coverage — no test infrastructure implemented

**Implications:**
- All functionality is untested and unverified by automated tests
- Logic errors can only be caught through manual testing or user reports
- Database operations, state management, and utilities lack verification
- Components render without visual regression detection

## Testing Recommendations for Future Implementation

**Unit Tests - Priority High:**
- `src/utils/time.ts` — Time parsing, formatting, and calculation functions
  - Test `parseTime()`, `formatTime()`, `getEndTime()`, `minutesSinceMidnight()`
  - Test edge cases: midnight, 23:59, invalid input
- `src/utils/ids.ts` — ID generation
- `src/utils/notifications.ts` — Notification scheduling and permission handling
- `src/db/database.ts` — Database initialization and schema

**Integration Tests - Priority High:**
- Store actions (`settingsStore.ts`, `scheduleStore.ts`, etc.)
  - Test load, update, add, delete operations
  - Verify toast notifications on errors
  - Mock database with Dexie testing utilities
- Protocol sync (`src/utils/protocolSync.ts`) — Task generation from active protocols

**Component Tests - Priority Medium:**
- UI components: `Button.tsx`, `Input.tsx`, `Card.tsx`, `Modal.tsx`, `Toggle.tsx`
  - Prop variations (variant, size, disabled state)
  - Event handlers (onClick, onChange, onClose)
  - Accessibility attributes
- Toast system: `Toast.tsx` and `utils/toast.ts`
  - Toast display and auto-dismiss
  - Multiple toast queuing
  - Type variations (success, error, info)

**E2E Tests - Priority Medium:**
- Not configured; would require setup
- Candidate scenarios:
  - Create, edit, delete task
  - Toggle task completion
  - Import/export settings
  - Notification permission request

## Mocking Recommendations

**Framework:** Would use Vitest or Jest depending on choice

**Patterns to use:**
- Mock Dexie database for store tests
- Mock browser Notification API for notification tests
- Mock `date-fns` utilities for time-dependent tests
- Mock navigator/window APIs for device tests (haptics, notifications)

**Example mock pattern:**
```typescript
vi.mock('../db/database', () => ({
  db: {
    tasks: {
      add: vi.fn(),
      toArray: vi.fn(),
      update: vi.fn(),
    },
  },
}))
```

**What to Mock:**
- Database operations (Dexie)
- Async external APIs (Notification, Permission)
- Browser APIs (localStorage, sessionStorage)
- Time-dependent functions (use vi.useFakeTimers for intervals)

**What NOT to Mock:**
- React hooks (useState, useEffect, useRef, useId)
- Router navigation logic
- Zustand store creation (test actual stores)
- Tailwind CSS classes (styling test coverage not needed)

## Fixtures and Factories

**Test Data:**
Not applicable — no test infrastructure exists

**Recommendation for future:**
Create factories in `src/__tests__/factories/` for:
- Task creation: `createTask({ category, startTime, ... })`
- Protocol creation: `createProtocol({ name, supplements, ... })`
- Meal template creation: `createMealTemplate({ name, meals, ... })`
- Settings creation: `createSettings({ wakeTime, sleepTime, ... })`

## Coverage Strategy

**Requirements:** None enforced currently

**Recommendation for future:**
```bash
npm run test:coverage   # Generate coverage report
# Target: >70% statements, >65% branches, >70% functions, >70% lines
```

Would focus on:
- All utility functions in `src/utils/` (easier to test, high impact)
- All store actions in `src/stores/` (critical business logic)
- Components in `src/components/ui/` (reusable, should be stable)
- Lower priority: feature-specific components, pages

## Testing Architecture Notes

**Current Dependency Gaps:**
- No test runner (recommend: Vitest for speed, or Jest for ecosystem)
- No testing library (recommend: `@testing-library/react` for components)
- No mock library (recommend: `vitest` has built-in mocking)
- No database testing utilities (Dexie has testing examples)

**Setup Steps for Future:**

1. Install test runner:
   ```bash
   npm install -D vitest @vitest/ui
   ```

2. Create `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       globals: true,
     },
   })
   ```

3. Add npm script:
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui"
   ```

4. Create test files:
   ```
   src/__tests__/
   ├── utils/
   │   ├── time.test.ts
   │   ├── notifications.test.ts
   │   └── ids.test.ts
   ├── stores/
   │   ├── settingsStore.test.ts
   │   └── scheduleStore.test.ts
   └── components/
       └── ui/
           ├── Button.test.tsx
           └── Modal.test.tsx
   ```

**Example Test Structure:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { parseTime, formatTime } from '../utils/time'

describe('time utils', () => {
  describe('parseTime', () => {
    it('parses HH:mm format correctly', () => {
      const result = parseTime('14:30')
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })

    it('handles midnight', () => {
      const result = parseTime('00:00')
      expect(result.getHours()).toBe(0)
    })
  })

  describe('formatTime', () => {
    it('formats date to HH:mm', () => {
      const date = new Date()
      date.setHours(14, 30, 0)
      expect(formatTime(date)).toBe('14:30')
    })
  })
})
```

---

*Testing analysis: 2026-03-13*
