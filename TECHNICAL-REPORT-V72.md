# Laffha V72 — Technical Report

**Date:** 2026-08-29  
**Release:** V72  
**Production:** https://laffha-game.vercel.app

## 1. Executive summary

V72 fixes multiplayer answer ownership, mobile lifeline visibility and activation, repeated realtime-render selection loss, and the delay between result feedback and the next turn. It also standardizes the Laffha logo to the mobile purple `#5F35A7` across setup/laptop, display, and controller/mobile views.

## 2. Root-cause analysis and applied fixes

### A. Result feedback appeared for the wrong team

**Root cause:** Result payloads did not carry an immutable answering-team identity. The controller inferred ownership from the current active team, which can already have advanced when the result packet arrives.

**Fix:**
- Added `answeredByTeam: base.teamNo` to result payloads in:
  - `multiplayer-fast-v66.js`
  - `multiplayer-v56.js`
  - `multiplayer-sync-v57.js`
- In `controller.html`, result rendering now resolves `answeredByTeam` before the generic active-team guard.
- Only the answering controller receives correct/incorrect feedback. Other teams remain in a waiting state.

### B. Result-to-next-turn delay

**Root cause:** A hard-coded 1050 ms post-result timeout delayed the next state transition.

**Fix:** Reduced the authoritative host transition to 450 ms in `multiplayer-fast-v66.js`.

**Measured production result:** 444 ms from feedback display to the next-turn state, within the requested 500 ms ceiling.

A cold secure-answer verification call measured 4.923 s before feedback. To reduce that network/cold-start component, `ui-speed-v63.js` now pre-authenticates and safely pre-warms the `laffha-answer` Edge Function before gameplay. This does not bypass server validation.

### C. Lifelines missing or not clickable on mobile

**Root cause:** The controller payload omitted per-team lifeline availability and there was no mobile action bridge for lifeline commands.

**Fix:**
- Question payloads now carry `lifelines`, `activeHint`, and current options.
- Added responsive mobile lifeline controls in `controller.html`.
- Added click handlers for `hint`, `time`, `change`, and `choices`.
- Added both Realtime broadcast and database fallback handlers.
- Updated action idempotency keys to include revision, action type, and lifeline subtype.
- Lifeline used/remaining status is broadcast immediately to all clients.
- Choice elimination is correctly unavailable where it is not applicable.

### D. Answer selection disappeared

**Root cause:** Duplicate Broadcast/Postgres packets rerendered an unchanged question. That rebuilt the options and cleared the local selection before explicit confirmation.

**Fix:**
- Introduced stable core/state identities.
- Duplicate packets update the cached state without rerendering.
- Legitimate lifeline updates may rerender while restoring the selected answer.
- Confirmation remains explicit and the selection persists during fast switching and delayed updates.

### E. Logo consistency

The logo color was standardized to the mobile brand purple:

- Hex: `#5F35A7`
- RGB: `rgb(95, 53, 167)`
- Updated: `setup-header-v23.css`, `styles.css`
- Controller/mobile already uses the same token.

## 3. Tests and results

| Scenario | Result |
|---|---|
| Team-scoped result payload and controller ownership | Passed |
| Mobile lifeline broadcast handler | Passed |
| Mobile lifeline database fallback | Passed |
| Used/remaining lifeline state refresh | Passed |
| Result transition <= 500 ms | Passed; measured 444 ms |
| Duplicate packets (10,000 identical updates) | Passed after QA null-state fixture correction |
| Answer remains selected after lifeline update | Passed in production browser |
| Rapid option switching | Passed; only final option remains selected |
| Six teams / 60,000 state events | Passed; 6,000 meaningful transitions |
| Purple logo computed style | Passed; rgb(95, 53, 167) |
| Vercel production build | Ready |

### Production browser evidence

- Selected answer remained highlighted after 6.2 seconds of repeated state traffic.
- After using the hint, the hint became disabled/used, the hint text appeared, and the selected answer stayed selected.
- Correct/incorrect feedback advanced to the next turn in 444 ms.

## 4. Main changed files

- `controller.html`
- `multiplayer-fast-v66.js`
- `multiplayer-v56.js`
- `multiplayer-sync-v57.js`
- `ui-speed-v63.js`
- `setup-header-v23.css`
- `styles.css`
- `secure-v62.html`
- `tools/build-production-v62.mjs`
- `qa-tests/multiplayer-v72.test.mjs`
- `.github/workflows/laffha-qa.yml`

## 5. Remaining risks and recommendations

1. The authenticated cloud browser shares one anonymous session across tabs, so the live test could not represent two truly independent device identities. Ownership logic is covered by unit/integration checks, but one final regression on two physical phones is recommended.
2. Secure answer verification remains dependent on Supabase region/network latency. Pre-warming reduces cold-start risk but cannot guarantee external network timing.
3. The repository currently deploys to three Vercel projects. Consolidating production ownership would reduce redundant deployments and configuration drift.
4. For competitive events, collect production p95/p99 latency over a full session and alert when feedback-to-next exceeds 500 ms.

## 6. Changelog

- Added immutable answering-team identity.
- Scoped result feedback to the answering team.
- Reduced post-result transition to 450 ms.
- Added mobile lifelines with realtime and DB fallback.
- Preserved answer selection through duplicate and lifeline state updates.
- Added secure-answer pre-warm.
- Standardized logo to `#5F35A7`.
- Added V72 unit, integration, and 60,000-event stress coverage.
