---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed — build-time + manual |
| **Config file** | None — no test framework needed for this phase |
| **Quick run command** | `npm run lint && npx tsc --noEmit` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npx tsc --noEmit`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must succeed + manual PWA verification
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUN-01 | build | `npm run build` — no TS errors | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUN-01 | build analysis | `npm run build` + check dist/ chunk sizes < 20kb gzipped | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUN-02 | manual | Enable OS Reduce Motion → verify no animations | ❌ Manual | ⬜ pending |
| 01-03-01 | 03 | 1 | FOUN-03 | manual | Install as PWA on iPhone X+ → verify no overlap | ❌ Manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Bundle size verification script: after `npm run build`, check dist/ for motion chunk size < 20kb gzipped
- [ ] No test framework install needed — validation is structural/build/manual for this phase

*Existing build infrastructure (`npm run build`, `tsc`) covers automated verification needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| MotionConfig reducedMotion="user" | FOUN-02 | OS-level preference requires physical device | 1. Enable Reduce Motion in iOS/macOS settings. 2. Open app. 3. Verify AppShell fade transition is suppressed. |
| Bottom nav clears home indicator | FOUN-03 | PWA safe area requires physical iPhone X+ | 1. Install as PWA on iPhone X+. 2. Open app. 3. Verify bottom nav does not overlap home indicator bar. |
| AppShell uses Motion fade transition | FOUN-01 | Visual verification of animation | 1. Navigate between tabs. 2. Verify smooth fade transition (not CSS keyframe). |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
