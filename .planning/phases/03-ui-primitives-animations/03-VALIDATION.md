---
phase: 3
slug: ui-primitives-animations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.0 + @testing-library/react ^16.3.2 |
| **Config file** | vite.config.ts (test block, globals:true, jsdom) |
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
| 03-00-01 | 00 | 0 | INTR-01 | unit stub | `npx vitest run src/__tests__/Button.test.tsx` | ❌ W0 | ⬜ pending |
| 03-00-02 | 00 | 0 | INTR-01 | unit stub | `npx vitest run src/__tests__/Toggle.test.tsx` | ❌ W0 | ⬜ pending |
| 03-00-03 | 00 | 0 | INTR-01 | unit stub | `npx vitest run src/__tests__/SubtaskList.test.tsx` | ❌ W0 | ⬜ pending |
| 03-00-04 | 00 | 0 | DATV-01 | unit stub | `npx vitest run src/__tests__/ProgressRing.test.tsx` | ❌ W0 | ⬜ pending |
| 03-00-05 | 00 | 0 | DATV-02 | unit stub | `npx vitest run src/__tests__/ProtocolList.test.tsx` | ❌ W0 | ⬜ pending |
| 03-00-06 | 00 | 0 | DATV-03 | unit stub | `npx vitest run src/__tests__/useCountUp.test.ts` | ❌ W0 | ⬜ pending |
| 03-00-07 | 00 | 0 | DATV-04 | unit stub | `npx vitest run src/__tests__/Skeleton.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/Button.test.tsx` — stubs for INTR-01 (whileTap present, disabled no scale)
- [ ] `src/__tests__/Toggle.test.tsx` — stubs for INTR-01 (m.button present, knob motion)
- [ ] `src/__tests__/SubtaskList.test.tsx` — stubs for INTR-01 (checkbox whileTap)
- [ ] `src/__tests__/ProgressRing.test.tsx` — stubs for DATV-01 (m.circle rendered)
- [ ] `src/__tests__/ProtocolList.test.tsx` — stubs for DATV-02 (stagger wrapper present)
- [ ] `src/__tests__/useCountUp.test.ts` — stubs for DATV-03 (hook behavior)
- [ ] `src/__tests__/Skeleton.test.tsx` — stubs for DATV-04 (aria-hidden, shimmer class)
- [ ] Extend `src/__tests__/Timeline.test.tsx` — stubs for DATV-02 (stagger wrapper)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Spring physics visual feel (no bounce/overshoot) | INTR-05 | Visual tuning — no numeric threshold | Tap buttons, toggle switches; visually confirm snappy scale without bounce |
| Shimmer gradient direction and speed | DATV-04 | CSS aesthetic tuning | Load dashboard; verify left-to-right gradient sweep on skeletons |
| Count-up settling feels organic | DATV-03 | Perceptual timing | Navigate to dashboard; verify numbers spring up and settle without overshoot |
| Stagger cascade timing feels snappy | DATV-02 | Perceptual timing | Navigate to Schedule; verify items cascade in ~500ms total |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
