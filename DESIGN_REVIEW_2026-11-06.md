# Design review: Systema Intelligentiae site (6 Nov 2026)

Scope: the static site in `site/` (Home, Journey, Tree, How we know, Data Lab), reviewed against `site/DESIGN.md`. Pages were rendered at 800 px (dark) and 375 px (light). `web/` and `web_high_school/` are out of scope.

Step 0 rating: **7/10**. Strong system (tokens, on-colour text, three named faces, depth layers, deep links; P1 fixes 1–5 done). Missing: reading order on the Journey card, an intentional phone header, missing-script states, and the open P2 items.

Mockups: not generated (the design tool has no OpenAI API key). Outside voices: declined.

## Decisions (each approved individually)

| # | Pass | Decision |
|---|---|---|
| 1A | Info architecture | Journey card order: band (act, time, creature name, taxon, size, How sure) → plate beside **story sentence** + "New right now" pills → the board → part history strip → **3 headline gauges** with "Show all 10 numbers" → long tail, world, myths. |
| 1B | Info architecture | Say each thing once: creature name and taxon only in the band; plate keeps the drawing, size and "Also around" (star taxon removed from that list); drop the "Stop N of 40" chip (the controls show it). |
| 2A | States | Header and nav written into every HTML page; JS only adds the Expert switch and the active state. Home counts (40 stops, 97 inventions) are real text in the HTML. Interactive areas carry a `<noscript>` line. |
| 2B | States | Data Lab filter with no matches: one full-width row "No moments match “x”. Try a period (Cambrian) or an epoch ID (EP14)." plus a "Clear filter" button. |
| 3A | Journey | With no hash, the Journey opens at stop 1 (EP01a). Deep links unchanged. |
| 3B | Journey | Finale panel at the last moment: "You crossed 4.1 billion years in 40 stops", first vs. last board side by side, two next steps (Tree, How we know). |
| 3C | Journey | `pushState` when a stop is picked from the act rail, chart, slider or cast/tree link; Next/Back/Beginning/Today keep `replaceState`. `popstate` restores the stop. |
| 3D | Journey | Last stop saved in `localStorage` (`si-last`). Home's journey door and the Journey intro show "Continue at stop N: Creature →". Hidden when storage is empty or blocked, or the last stop is stop 1. |
| 4A | AI slop | Home "nine parts" becomes a spec-sheet table: rows are parts (colour chip, name, question), columns Bacterium / You / Laptop, last column the upgrade count linking to the tree. Under 680 px each part is a compact row with the three values stacked and labelled. |
| 4B | AI slop | One authored motion moment: the hero chart's lines draw left to right over ~1.2 s, ease-out, on first load only; static under `prefers-reduced-motion`. Hover lift kept only on the four doors. |
| 4C | AI slop | Theme browser surfaces: `::selection` violet tint, `scrollbar-color` from `--line-2`/`--surface-2`, `caret-color: var(--c-cpu)`, muted violet for visited in-text links. |
| 5A | Design system | `--ink-3` light #868ca6 → **#656b87** (4.9:1 on bg, 5.2:1 on surface); dark #7c82a3 → **#8d93b3** (6.2:1 / 5.7:1). |
| 5B | Design system | Self-host the three fonts as Latin woff2 in `site/assets/fonts/` with `font-display: swap`; remove Google Fonts links. (Download needs the owner's OK.) |
| 6A | Responsive | Phone header (≤ 680 px): row 1 brand + compact Expert switch (no PhD tag); row 2 the four links on one line, sideways scroll if needed, 44 px targets. ~100 px total. No hamburger. |
| 6B | Accessibility | A styled `<input type="range">` (0–63) under every deep-time chart, synced both ways; `aria-valuetext` like "555 million years ago: First worm". |
| 6C | Responsive | Act rail segments ≥ 64 px; labels that don't fit show the numeral with the full name as a tooltip; on phones a line under the rail names the current act. |
| 6D | Performance | `census.js` loads on the Journey only when Expert view is on (or turns on); expert block shows "Loading all 72 columns…" until it arrives. Data Lab unchanged. |
| 7A | Decisions | The 3 headline gauges are the three with the largest log change since the previous moment; ties fall back to the fixed gauge order. |

## Journey storyboard (after fixes)

```
STEP | USER DOES                  | USER FEELS        | SUPPORTED BY
1    | Lands on Home              | Curious           | Question headline, chart draws in (4B)
2    | Clicks "Start the journey" | Oriented          | Opens at stop 1, the vent (3A)
3    | Steps Next, Next…          | Discovery, rhythm | Story beside creature (1A), board lights up, 3 moving gauges (7A)
4    | Jumps via rail, presses Back | In control      | Back returns to the previous stop (3C)
5    | Reaches Today              | Accomplishment    | Finale panel with two next steps (3B)
6    | Returns next week          | Recognised        | "Continue at stop N" on Home (3D)
```

## NOT in scope

- P2 #8 source data disagreements (content fix, not design).
- P2 #9 per-invention references (content work).
- P2 #14 real creature illustrations (needs an illustrator or PhyloPic licensing).
- P3 #15, 16, 18–21 (quiz, guided threads, word help, compare, teacher page, sharing): already listed in DESIGN.md §11.
- The Tree's ~150 px sideways scroll with the panel open at 1280 px (accepted in DESIGN.md).

## What already exists (reuse)

- Tokens and on-colour text tokens in `assets/site.css`; `--focus` ring; `prefers-reduced-motion` reset.
- `common.js`: header/footer builder, Expert switch (`si-expert`, `si:expert` event), deep-time chart with `select()`, glyphs, formatting.
- Journey `select()`/`move()`, the board and slot markup, gauge renderer.
- Tree search empty state (pattern for 2B).

## Implementation Tasks

- [x] **T1 (P1, human ~3h / CC ~20min)** Journey: reorder card, remove repeats, 3 moving gauges + "Show all", start at stop 1. Files: `assets/journey.js`, `assets/site.css`. Verify: render EP01a and EP07b at 1280 and 375.
- [x] **T2 (P1, human ~2h / CC ~10min)** Static header/nav in all 5 pages, real counts on Home, noscript notes. Files: `*.html`, `assets/common.js`. Verify: load with JS blocked.
- [x] **T3 (P1, human ~1h / CC ~5min)** `--ink-3` tokens + browser surfaces. Files: `assets/site.css`. Verify: contrast script.
- [x] **T4 (P2, human ~2h / CC ~10min)** Phone header + act rail min width and current-act line. Files: `assets/site.css`, `assets/journey.js`. Verify: 375 px.
- [x] **T5 (P2, human ~2h / CC ~10min)** Chart range slider + pushState history + popstate. Files: `assets/common.js`, `assets/journey.js`, `assets/home.js`. Verify: keyboard only; Back after rail jump.
- [x] **T6 (P2, human ~2h / CC ~10min)** Finale panel and resume link. Files: `assets/journey.js`, `assets/home.js`, `index.html`, `journey.html`. Verify: stop 40; revisit Home.
- [x] **T7 (P2, human ~2h / CC ~10min)** Home spec-sheet table + chart draw-in + hover lift only on doors. Files: `assets/home.js`, `assets/site.css`. Verify: 1280 and 375, reduced motion.
- [x] **T8 (P2, human ~30min / CC ~5min)** Data Lab empty filter state. Files: `assets/data-lab.js`. Verify: filter "dinosaur".
- [x] **T9 (P2, human ~30min / CC ~5min)** Lazy census.js on Journey. Files: `journey.html`, `assets/journey.js`. Verify: network panel with Expert off/on.
- [x] **T10 (P2, human ~1h / CC ~10min)** Self-host fonts (latin, latin-ext, greek woff2 in `assets/fonts/`). Files: `assets/fonts/`, `assets/site.css`, `*.html`.

## Design Review Completion Summary

```
  +====================================================================+
  |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | DESIGN.md present; 5 pages in scope         |
  | Step 0               | 7/10; all 7 passes                          |
  | Pass 1  (Info Arch)  | 6/10 → 8/10 after fixes                     |
  | Pass 2  (States)     | 5/10 → 8/10 after fixes                     |
  | Pass 3  (Journey)    | 5/10 → 9/10 after fixes                     |
  | Pass 4  (AI Slop)    | 7/10 → 9/10 after fixes                     |
  | Pass 5  (Design Sys) | 7/10 → 9/10 after fixes                     |
  | Pass 6  (Responsive) | 6/10 → 9/10 after fixes                     |
  | Pass 7  (Decisions)  | 1 resolved, 0 deferred                      |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (5 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 0 items proposed (all already in DESIGN.md) |
  | Approved Mockups     | 0 generated (no API key), 0 approved        |
  | Decisions made       | 18 added to plan                            |
  | Decisions deferred   | 0                                           |
  | Overall design score | 5/10 → 8/10                                 |
  +====================================================================+
```

Unresolved decisions: none.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Outside Review | none | Independent 2nd opinion | 0 | skipped | declined by owner |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | issues_open → fixes approved | score: 5/10 → 8/10, 18 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE COVERAGE:** skipped (owner declined outside voices).
- **VERDICT:** Design review complete with all fixes approved; eng review not run (static site, no git repo).

NO UNRESOLVED DECISIONS
