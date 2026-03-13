# External Integrations

**Analysis Date:** 2026-03-13

## APIs & External Services

**Not detected** - No third-party API integrations (Stripe, Supabase, AWS, etc.)

All external services are browser-native APIs only.

## Data Storage

**Databases:**
- IndexedDB (browser native)
  - Client: Dexie 4.3.0
  - Database name: `FlowOfTimeDB`
  - No backend database required
  - Tables: `tasks`, `protocols`, `mealTemplates`, `mealPlans`, `settings`, `dailyLogs`
  - Located: `src/db/database.ts`

**File Storage:**
- Local filesystem only (no cloud storage)
- Export/import via JSON file download: `src/pages/SettingsPage.tsx` (lines 35-87)
- Backup filename format: `flow-of-time-backup-YYYY-MM-DD.json`

**Caching:**
- PWA service worker caching via Workbox
  - Configured in `vite.config.ts` (lines 60-62)
  - Caches: `**/*.{js,css,html,ico,png,svg,woff2}`
  - Strategy: Auto-update registration

## Authentication & Identity

**Auth Provider:**
- Custom - None required
- App is fully client-side with no user accounts
- Settings stored in IndexedDB per device/browser

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console logging only via `console.error()` in error handlers
- Example: `src/stores/scheduleStore.ts` (various error catch blocks)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (configured via base path in `vite.config.ts`)
- Can be deployed to any static host (Vercel, Netlify, Surge, etc.)

**CI Pipeline:**
- Not detected - No GitHub Actions, CircleCI, or similar configured

## Environment Configuration

**Required env vars:**
- None - App requires no environment configuration

**Optional env vars:**
- `BASE_URL` - Controls app base path for deployment (defaults to `/`)

**Secrets location:**
- No secrets used - App is fully client-side

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Browser APIs Used

**Notifications:**
- Web Notifications API
  - Permission check: `src/utils/notifications.ts`
  - Scheduling: `src/utils/notificationScheduler.ts`
  - Foreground notifications only (device notifications not used)

**Device Interaction:**
- Haptic Feedback (Vibration API)
  - Light vibration feedback: `src/utils/haptics.ts`
  - Examples: Button interactions, task completion

**Geolocation:**
- Not detected

**Camera/Microphone:**
- Not detected

## Data Export/Import

**Export Format:**
- JSON blob containing:
  - `tasks[]` - Schedule data
  - `protocols[]` - Supplement protocols
  - `mealTemplates[]` - Meal templates
  - `mealPlans[]` - Meal plans
  - `settings[]` - App settings
  - `dailyLogs[]` - Daily completion logs
  - `exportDate` - ISO timestamp
- Triggered manually from Settings page
- Downloaded as file to user's device

**Import Format:**
- Same JSON structure as export
- File selection dialog via File API
- Replaces all data (destructive import)
- Located: `src/pages/SettingsPage.tsx` (lines 54-87)

---

*Integration audit: 2026-03-13*
