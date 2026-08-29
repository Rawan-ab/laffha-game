# V71 — UI reference match and persistent answer selection

## Root cause

The phone controller subscribed to both PostgreSQL updates and the V66 broadcast channel. Every broadcast called `renderGame()` and reset `selectedAnswer`, even when the incoming payload represented the same question, phase, team, and revision. Frequent host-side DOM mutations therefore caused duplicate state broadcasts that erased the local selection before confirmation.

## Controller fix

- Added a stable state identity built from revision, phase, current team, and question identity.
- Added `applyGameState()` as the single state-ingestion path for database polling, PostgreSQL realtime, and broadcast updates.
- Duplicate state packets now update the cached state without re-rendering the controller.
- The selected answer is tied to `selectedRevision`.
- Selection is cleared only when the state identity genuinely changes.
- Confirmation rejects a stale selection from an older revision.
- First-touch behavior remains enabled with `pointerdown`, `touch-action: manipulation`, and text-selection prevention.
- Failed sends preserve the selected option and re-enable confirmation for retry.

## Setup / landing page

- Added `setup-reference-v71.js` as a clean production entry point.
- Restored the two-column reference layout.
- Matched the reference controls, category cards, player distribution, team cards, play-mode selector, CTA, score preview, and assistance cards.
- Removed the extra instructions modal/button that changed the reference composition.
- Assistance copy matches the final reference:
  - Change question: same category and level.
  - Choices: converts to choices and halves 200/400/600 to 100/200/300.
  - Hint: reveals a useful clue.
  - +15 seconds: extends only the current question.
- Bumped production assets to V71 to avoid stale browser caches.

## QA scenarios

1. Select one answer and wait through repeated same-revision broadcasts — selection remains.
2. Rapidly switch between all options — only the last option remains selected.
3. Receive duplicate database and broadcast packets — no controller re-render.
4. Confirm during network delay — selection stays visible while controls are locked.
5. Simulated send failure — controls reopen and the selected option remains available for retry.
6. Move to result/new question — old selection clears.
7. Mobile long-press/tap — answer text is not selected by the browser.
8. Desktop reference layout and responsive mobile layout — visually checked after deployment.
