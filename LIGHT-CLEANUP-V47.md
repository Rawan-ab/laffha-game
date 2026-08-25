# Laffha — Light Cleanup V47

This is a safe organizational cleanup only. No gameplay logic was intentionally changed.

## What changed
- Organized `index.html` and `play-v12.html` into clear load sections.
- Standardized cache-busting to `v=47`.
- Added a visible internal version meta tag: `laffha-version=47`.
- Preserved the exact JavaScript load order used by V46 to avoid regressions.
- Kept all compatibility patches in place; no risky deletions or merges yet.

## Current production load groups
1. Base question banks
2. Core runtime + legacy compatibility patches
3. Bank cleanup + content expansion
4. Question history, fairness, diversity and quality rules
5. UI/setup/ordering/assistance behavior

## Do NOT remove yet
These families overlap but may depend on load order. They are candidates for the final cleanup, not this light cleanup:
- `game-patch-v2.js`, `game-patch-v3.js`, `game-patch-v4.js`, `spin-fix.js`, `combined-draw-v8.js`
- `question-diversity-v27.js`, `question-diversity-v38.js`, `question-diversity-v39.js`, `entertainment-bias-v44.js`
- `question-quality-v34.js`, `question-audit-v37.js`, `question-quality-v42.js`, `difficulty-hardening-v45.js`
- `logos-v38.js`, `logos-v39.js`
- UI feature patches loaded at the end: `setup-design-v15.js`, `ordering-rank-v37.js`, `assistance-cost-v43.js`

## Final cleanup later
When features are frozen:
- Merge selection/history/fairness logic into one question engine.
- Merge quality/difficulty/audit rules into one validation pipeline.
- Merge logo logic into one module.
- Merge setup/team/ordering/assistance UI behavior into a smaller set of files.
- Remove superseded patches only after regression testing on mobile + laptop + TV layouts.
- Keep a production version and a QA/dev version separately.
