# لفّها — QA Report V46

## Scope
- Static audit of the active question-bank pipeline and game-selection logic.
- Logic simulation equivalent to 15 matches, 2 teams, 7 rounds per team (210 turns total).
- Mobile/browser click automation is not included; this report tests the underlying game logic and active bank rules.

## Overall assessment
**8.3 / 10 — Shareable beta, but the question bank still needs ongoing editorial QA.**

### Strong areas
- Shared category deck avoids immediate category repetition until all active categories cycle.
- Question history protects up to 100 distinct questions per category across separate games.
- TV/movie selector actively rotates market, country/region, format and subject.
- Cartoon selector limits franchise concentration and prevents Detective Conan from dominating.
- Assistance scoring is consistent: normal help caps at 100; Add Choices caps at 50.
- V45 raises the minimum quality of 200-point questions and removes many giveaway nationality/emoji prompts.

## Critical issue found and fixed in V46
### Unequal point opportunity in 7-round games
Previous behavior:
- Team A could receive 3×200 + 2×400 + 2×600 = 2600 maximum points.
- Team B could receive 2×200 + 3×400 + 2×600 = 2800 maximum points.

V46 behavior:
- Every team receives the same difficulty mix.
- 5 rounds: 2 easy + 1 medium + 2 hard = 2000 maximum.
- 7 rounds: 2 easy + 3 medium + 2 hard = 2800 maximum.
- 10 rounds: 3 easy + 4 medium + 3 hard = 4000 maximum.
- 15 rounds: 5 easy + 5 medium + 5 hard = 6000 maximum.
- Order remains random per team.

## 15-match logic simulation
Configuration: 2 teams × 7 rounds × 15 matches.

Results after V46 fairness fix:
- 105 questions per team.
- Each team receives exactly 30 easy, 45 medium and 30 hard questions across the 15-match sample.
- Maximum available points are identical for both teams in every match: 2800.
- No adjacent category repetition occurred because the category deck completes a cycle before reusing a category.
- Category frequency stays near even over a long run; exact counts vary because the deck is reshuffled each cycle.

## Remaining QA risks
1. **Editorial correctness** — facts and distractors still need human review. Code can detect duplicates and obvious giveaways, but cannot guarantee every factual answer is correct.
2. **Distractor quality** — some old questions may still have three technically related but unevenly plausible options.
3. **Difficulty calibration** — objective difficulty varies by audience. 200/400/600 should continue to be tuned from real play feedback.
4. **Format balance** — varied formats exist, but availability depends on the category/difficulty pool. Some sessions may still lean heavily toward MCQ if another format runs out.
5. **Image/logo reliability** — broken logo images are filtered, but third-party image hosting can still change in the future.
6. **Patch layering** — the project currently loads many historical patch files that override `pickQuestion`, `setup`, and other functions. It works, but increases regression risk and makes future QA harder.

## V46 automated QA checker
`qa-audit-v46.js` now scans the final active `QUESTIONS` array for:
- duplicate question IDs;
- duplicate question+answer content;
- missing required fields;
- MCQs with fewer than three distractors;
- duplicate answer choices;
- answers visible inside the prompt;
- answers leaked by the hint;
- giveaway country-flag emoji prompts at easy level;
- short song-fill questions;
- excessive concentration of one franchise/region inside a category.

The report is available at runtime in the browser console as:
`window.LAFFHA_QA_REPORT`

## Recommended next step
Before calling the game "final", run 3–5 real group sessions and log every question that players classify as:
- too easy for its points;
- too hard for its points;
- ambiguous;
- factually wrong;
- weak distractors.

Use that feedback to create a curated V47 question-bank cleanup rather than adding more patches.
