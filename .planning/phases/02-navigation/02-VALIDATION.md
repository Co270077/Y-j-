---
phase: 2
slug: navigation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (02-00-PLAN.md Wave 0 installs) |
| **Config file** | vite.config.ts (02-00-PLAN.md adds test block) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-00-01 | 00 | 0 | ALL | infra | `npx vitest run` | Wave 0 creates | ⬜ pending |
| 02-00-02 | 00 | 0 | ALL | stubs | `npx vitest run --reporter=verbose` | Wave 0 creates | ⬜ pending |
| 02-01-01 | 01 | 1 | NAV-01 | unit | `npx vitest run src/__tests__/NavigationContext.test.tsx` | Wave 0 stub, Plan 01 fills | ⬜ pending |
| 02-01-02 | 01 | 1 | NAV-04 | unit | `npx vitest run src/__tests__/BottomNav.test.tsx` | Wave 0 stub, Plan 01 fills | ⬜ pending |
| 02-02-01 | 02 | 2 | NAV-02 | unit | `npx vitest run src/__tests__/FAB.test.tsx` | Wave 0 stub, Plan 02 fills | ⬜ pending |
| 02-02-02 | 02 | 2 | NAV-03 | unit | `npx vitest run src/__tests__/Timeline.test.tsx` | Wave 0 stub, Plan 02 fills | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Addressed by **02-00-PLAN.md** (wave: 0, depends_on: []):

- [ ] `npm install -D vitest @testing-library/react @testing-library/user-event jsdom` — test framework
- [ ] `vite.config.ts` — add vitest test config block
- [ ] `src/__tests__/BottomNav.test.tsx` — stubs for NAV-04
- [ ] `src/__tests__/NavigationContext.test.tsx` — stubs for NAV-01
- [ ] `src/__tests__/FAB.test.tsx` — stubs for NAV-02
- [ ] `src/__tests__/Timeline.test.tsx` — stubs for NAV-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tab cross-fade animation smoothness | NAV-01 | Spring physics visual quality can't be asserted in unit tests | Switch tabs, observe cross-fade with gentle spring |
| Slide direction on drill-down | NAV-01 | Direction + animation correctness is visual | Navigate forward/back, verify slide direction matches |
| Pill indicator slides smoothly | NAV-04 | layoutId interpolation quality is visual | Tap between tabs, verify pill glides without jump |
| Auto-scroll positions correctly | NAV-03 | Scroll position relative to viewport is visual | Navigate to Schedule, verify current block is at top |
| FAB in thumb zone | NAV-02 | Lower-60% position depends on device viewport | Check FAB reachable on iPhone SE, iPhone 15 Pro Max |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (02-00-PLAN.md)
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (revision — Wave 0 plan added)
