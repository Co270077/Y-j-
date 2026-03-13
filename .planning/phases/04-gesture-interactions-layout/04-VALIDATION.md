---
phase: 4
slug: gesture-interactions-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + Testing Library 16.3.2 |
| **Config file** | `vite.config.ts` (test block, `globals: true`, `environment: 'jsdom'`) |
| **Quick run command** | `npx vitest run src/__tests__/SwipeActionRow.test.tsx src/__tests__/BottomSheet.test.tsx src/__tests__/ProtocolList.test.tsx src/__tests__/Toast.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/SwipeActionRow.test.tsx src/__tests__/BottomSheet.test.tsx src/__tests__/ProtocolList.test.tsx src/__tests__/Toast.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-00-01 | 00 | 0 | INTR-02 | unit | `npx vitest run src/__tests__/SwipeActionRow.test.tsx -t "calls onComplete"` | ❌ W0 | ⬜ pending |
| 04-00-02 | 00 | 0 | INTR-03 | unit | `npx vitest run src/__tests__/SwipeActionRow.test.tsx -t "calls onDelete"` | ❌ W0 | ⬜ pending |
| 04-00-03 | 00 | 0 | INTR-03 | unit | `npx vitest run src/__tests__/Toast.test.tsx -t "undo action"` | ❌ W0 | ⬜ pending |
| 04-00-04 | 00 | 0 | INTR-04 | unit | `npx vitest run src/__tests__/BottomSheet.test.tsx -t "renders when open"` | ❌ W0 | ⬜ pending |
| 04-00-05 | 00 | 0 | LAYT-01 | unit | `npx vitest run src/__tests__/BottomSheet.test.tsx -t "detent prop"` | ❌ W0 | ⬜ pending |
| 04-00-06 | 00 | 0 | LAYT-02 | unit | `npx vitest run src/__tests__/ProtocolList.test.tsx -t "accordion"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install @use-gesture/react` — required before any gesture implementation
- [ ] `src/__tests__/SwipeActionRow.test.tsx` — stubs for INTR-02, INTR-03 (swipe complete + swipe delete)
- [ ] `src/__tests__/BottomSheet.test.tsx` — stubs for INTR-04, LAYT-01 (render, backdrop dismiss, detent prop)
- [ ] `src/__tests__/Toast.test.tsx` (update existing or create) — stub for INTR-03 undo action variant
- [ ] `src/__tests__/ProtocolList.test.tsx` (update existing) — stubs for LAYT-02 accordion expand/collapse

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swipe gesture follows finger 1:1 during drag | INTR-02, INTR-03 | Requires real touch input; jsdom pointer events don't replicate finger tracking fidelity | On mobile: swipe right on task, verify position tracks finger smoothly |
| Bottom sheet drag-to-dismiss with velocity | INTR-04 | Velocity-based dismiss requires real gesture physics; pointer event simulation can't replicate flick | On mobile: flick sheet handle down quickly, verify it dismisses |
| Haptic feedback fires at threshold crossing | INTR-02 | Haptic API unavailable in jsdom | On Android device: swipe right past threshold, verify vibration at crossing point |
| Rubber-band resistance past swipe threshold | INTR-02 | Visual/physics quality not testable programmatically | On mobile: swipe right past threshold, verify resistance feel |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
