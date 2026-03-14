---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/components/layout/BottomNav.tsx
  - src/components/dashboard/DashboardGrid.tsx
  - src/components/dashboard/WelcomeCard.tsx
  - src/pages/SettingsPage.tsx
  - src/db/database.ts
  - src/db/types.ts
autonomous: true
requirements: [QUICK-3]

must_haves:
  truths:
    - "Protocols tab no longer appears in bottom navigation"
    - "No /protocols route exists — navigating there redirects to /"
    - "Dashboard renders without ProtocolCard"
    - "App builds and runs without errors"
  artifacts: []
  key_links: []
---

<objective>
Remove the Protocols section entirely from the app. The schedule section covers everything protocols does, making it redundant.

Purpose: Simplify navigation and reduce feature surface area.
Output: Clean app with no protocol page, tab, dashboard card, store, or components.
</objective>

<execution_context>
@/Users/samarceneaux/.claude/get-shit-done/workflows/execute-plan.md
@/Users/samarceneaux/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/App.tsx
@src/components/layout/BottomNav.tsx
@src/components/dashboard/DashboardGrid.tsx
@src/components/dashboard/WelcomeCard.tsx
@src/pages/SettingsPage.tsx
@src/db/database.ts
@src/db/types.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Delete protocol files and remove route/nav/store references</name>
  <files>
    src/pages/ProtocolsPage.tsx (DELETE)
    src/components/protocols/ProtocolList.tsx (DELETE)
    src/components/protocols/ProtocolEditor.tsx (DELETE)
    src/components/dashboard/ProtocolCard.tsx (DELETE)
    src/stores/protocolStore.ts (DELETE)
    src/utils/protocolSync.ts (DELETE)
    src/__tests__/ProtocolList.test.tsx (DELETE)
    src/App.tsx
    src/components/layout/BottomNav.tsx
  </files>
  <action>
    1. Delete these files:
       - src/pages/ProtocolsPage.tsx
       - src/components/protocols/ProtocolList.tsx
       - src/components/protocols/ProtocolEditor.tsx
       - src/components/dashboard/ProtocolCard.tsx
       - src/stores/protocolStore.ts
       - src/utils/protocolSync.ts
       - src/__tests__/ProtocolList.test.tsx

    2. In src/App.tsx:
       - Remove `import { useProtocolStore }` and `const ProtocolsPage = lazy(...)` lines
       - Remove `const loadProtocols = useProtocolStore(s => s.load)` and its call in the useEffect
       - Remove the `<Route path="/protocols" ...>` line
       - Remove `loadProtocols` from the useEffect dependency array

    3. In src/components/layout/BottomNav.tsx:
       - Remove the `{ path: '/protocols', label: 'Protocols', icon: ProtocolIcon }` entry from the tabs array
       - Remove the `ProtocolIcon` function definition (lines ~74-86)
  </action>
  <verify>
    <automated>cd /Users/samarceneaux/Desktop/EVO/Biohacking_CLAUDE_DEV/Dabbling_DEV/時間の流れ && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>All protocol-specific files deleted. App.tsx has no protocol route or store loading. BottomNav shows 3 tabs (Dashboard, Schedule, Meals).</done>
</task>

<task type="auto">
  <name>Task 2: Clean up dashboard and settings protocol references</name>
  <files>
    src/components/dashboard/DashboardGrid.tsx
    src/components/dashboard/WelcomeCard.tsx
    src/pages/SettingsPage.tsx
  </files>
  <action>
    1. In src/components/dashboard/DashboardGrid.tsx:
       - Remove `import ProtocolCard from './ProtocolCard'`
       - Remove `import { useProtocolStore } from '../../stores/protocolStore'`
       - Remove `const protocols = useProtocolStore(s => s.protocols)`
       - Remove `protocols.length` from the `isEmpty` and `isLoaded` conditions:
         - isEmpty: `tasks.length === 0` (just tasks)
         - isLoaded: `tasks.length > 0 || settings !== null`
       - Remove the entire `<m.div variants={scaleIn}>` block containing `<ProtocolCard .../>` (lines ~107-112)

    2. In src/components/dashboard/WelcomeCard.tsx:
       - Remove the "Set up protocol" Button and its navigate('/protocols') call (lines 20-22)
       - Keep the "Add first task" button

    3. In src/pages/SettingsPage.tsx:
       - Remove `import { useProtocolStore } from '../stores/protocolStore'`
       - Remove `const protocols = useProtocolStore(s => s.protocols)`
       - Remove `protocols.length` from the totalItems calculation: `const totalItems = tasks.length + templates.length`
       - Remove the protocol count from the data summary text: change to `{tasks.length} task{tasks.length !== 1 ? 's' : ''} · {templates.length} template{templates.length !== 1 ? 's' : ''}`
       - In handleExport: remove `const protocolsData = await db.protocols.toArray()` and remove `protocols: protocolsData` from the data object
       - In handleImport: remove `await db.protocols.clear()` and `if (data.protocols) await db.protocols.bulkAdd(data.protocols)`
       - In handleClearData: remove `await db.protocols.clear()`
       - Update the ConfirmDialog message to remove "protocols" from the list: "This will permanently delete all tasks, meal templates, and daily logs."

    NOTE: Keep `db.protocols` table definition in database.ts and the `Protocol` type in types.ts — removing the Dexie schema would require a version migration. The table can sit dormant. The `protocolId` field on Task type is also harmless to leave.
  </action>
  <verify>
    <automated>cd /Users/samarceneaux/Desktop/EVO/Biohacking_CLAUDE_DEV/Dabbling_DEV/時間の流れ && npx tsc --noEmit && npx vite build 2>&1 | tail -5</automated>
  </verify>
  <done>Dashboard renders without ProtocolCard. WelcomeCard has no protocol button. Settings page has no protocol store references. App builds cleanly.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- `npx vite build` completes successfully
- No remaining imports of deleted files: `grep -r "protocolStore\|ProtocolCard\|ProtocolList\|ProtocolEditor\|ProtocolsPage\|protocolSync" src/ --include="*.tsx" --include="*.ts" | grep -v "db/types\|db/database"` returns empty
- Bottom nav shows exactly 3 tabs
</verification>

<success_criteria>
- Protocols tab gone from bottom nav
- /protocols route removed
- ProtocolCard removed from dashboard grid
- All 7 protocol files deleted
- App builds and type-checks cleanly
- No dangling imports to deleted files
</success_criteria>

<output>
After completion, create `.planning/quick/3-remove-protocols-section-from-app-redund/3-SUMMARY.md`
</output>
