# Design review: Stories, Atlas, Theories (24 Nov 2026)

Reviewed from the working folder at http://127.0.0.1:8770. No mockups were made because the image tool has no API key. Calibrated against `DESIGN.md`.

Initial overall rating: **4/10**, the lowest of the three pages:
- Stories: 3/10 in the working copy, 7/10 for the live version.
- Atlas: 5/10.
- Theories: 4/10.

## Decisions made (approved by the owner)

1. **Stories: hybrid design.** Antigravity's nine collector cards become the story picker at the top of the page. Each card shows a picture and one line. The chosen story and its evidence cards open on the page below, with no popup, and its three new tracks (networks, replication, off-world) are kept. Note: the working `stories.html` is half-built (its deck has no script behind it) and was still being edited during this review. Do not publish it until the hybrid is built.
2. **Atlas: search first.** New order: the title, then search and the six group filters in one row, then the scatter map, then the table. The calculation method cards and the neuron chart move into a fold below the table, opened by default in Expert view.
3. **Theories: a table and a jump bar.** Reuse the How we know jump bar for the five parts. The eight schools become one comparison table with columns for school, core claim, key equation, what the census tests and verdict. Each row expands into its full write-up.
4. **Atlas search: empty message and paging.** With no match, show "No systems match "X"" and a Clear button. Show 50 rows at a time with "Show 50 more", and a count line ("Showing 50 of 703").
5. **Stories: first visit.** DNA is open by default, so the page is never empty. The URL remembers the reader's pick.
6. **Atlas class-rate bands (D1 / Pass 3).** Draw the ~40% rounded class-rate rows (`10^6`, `10^8`, `10^9`, `10^10` ops/s) as open rings (`fill: var(--surface)`, group-colored stroke) while keeping individually measured units as solid dots; add a two-item shape key (`Measured unit` vs `Class-level estimate`), one plain sentence in `#atNote`, and a `"Class estimate"` tag in the readout and table.

---

## Pass 1: Information Architecture (`4/10 -> 10/10`)

Constraint worship (if each page can only show three things in the first screen):
- **Stories (`stories.html`):** (1) Title + one-line framing, (2) 9-card visual story picker (picture + 1 line per track), (3) Active story header + inline timeline strip & milestone evidence cards (DNA open on arrival).
- **Atlas (`atlas.html`):** (1) Title + single-unit framing, (2) One-row toolbar with search input + 6 group filter pills + live count, (3) Log-log complexity scatter map (`#atlas`) directly wired to the paged table below.
- **Theories (`theories.html`):** (1) Title + equal-lenses lead, (2) Sticky/inline 5-part jump bar reused from `how.html`, (3) Single 8-school expandable comparison table (`School | Core claim | Key equation | What the census tests | Verdict`).

```text
stories.html                              atlas.html                                theories.html
+--------------------------------------+  +--------------------------------------+  +--------------------------------------+
| Header + Explore/Expert switch       |  | Header + Explore/Expert switch       |  | Header + Explore/Expert switch       |
+--------------------------------------+  +--------------------------------------+  +--------------------------------------+
| Eyebrow + H1 + 1-sentence lead       |  | Eyebrow + H1 + 1-sentence lead       |  | Eyebrow + H1 + 1-sentence lead       |
+--------------------------------------+  +--------------------------------------+  | Jump bar: [Schools][Crossroads]      |
| 9 Collector Cards (Picker Grid)      |  | [Search input] [6 Group Pills] Count |  |   [Audit][Thermodynamics][Indices]   |
| [DNA*] [Brains] [Tech] [Sensors] ... |  +--------------------------------------+  +--------------------------------------+
+--------------------------------------+  | #atlas Scatter (solid=measured,      |  | Part 1: 8-School Comparison Table    |
| Inline Active Story (#storiesList)   |  |   open ring=class estimate)          |  |   Row click -> expands full write-up |
| - Eyebrow, H2, <details> full essay  |  | + Persistent dot/row readout bar     |  +--------------------------------------+
| - 68-moment 7-act dot strip          |  +--------------------------------------+  | Part 2: 12 Crossroads (<details>)    |
| - View toggle + Milestone cards      |  | #sysTable (50/page + "Show 50 more") |  +--------------------------------------+
+--------------------------------------+  +--------------------------------------+  | Part 3: Census Audit Visuals & Table |
| Books & Crossroads (<details> fold)  |  | <details> Calculation rules &        |  +--------------------------------------+
+--------------------------------------+  |   neuron scaling (open in Expert)    |  | Part 4: Landauer & Maxwell's Demon   |
                                          +--------------------------------------+  +--------------------------------------+
                                          | Coverage heatmap -> Data Lab link    |  | Part 5: Candidate Synthesis Index    |
                                          +--------------------------------------+  |   (linked as 1 lens w/ intelligence) |
                                                                                    +--------------------------------------+
```

---

## Pass 2: Interaction State Coverage (`3/10 -> 10/10`)

```text
FEATURE                     | LOADING                         | EMPTY                                              | ERROR                                            | SUCCESS                                         | PARTIAL
----------------------------|---------------------------------|----------------------------------------------------|--------------------------------------------------|-------------------------------------------------|--------------------------------------------------
Stories 9-card picker &     | Static H1 + skeleton/noscript   | Never empty: DNA track opens on first visit when   | <noscript> banner links to Journey & Data Lab    | Selected card shows active border + aria-current| Deep link (#brains&pic=EP08a) filters to single
inline story (#storiesList) | fallback before stories.js runs | URL has no hash                                    | CSVs; missing plate falls back to neutral frame  | and updates URL hash without page jump          | picture with "<- All N pictures" reset button
Atlas search + 6 group      | Table shell + "Loading 703      | "No systems match 'X'" + primary "Clear filters"   | <noscript> links directly to                     | "Showing 50 of N systems" (or "All N" <= 50) +  | Group pill + search query active together; both
filters + #sysTable         | systems..." status              | button + resets search & group pill together       | data/tracked_systems_catalog.csv download        | scatter dims non-matching dots to 0.10 opacity  | badges shown next to "Reset filters"
Atlas #atlas scatter &      | Reserved aspect-ratio box       | Zero-match filter keeps axes + grid and shows      | Rows missing rate/date excluded from SVG with    | Solid dot = measured, open ring = class rate;   | Clicking a dot highlights & scrolls to row (auto-
readout bar                 | (.stack-wrap) prevents CLS      | centered SVG note "0 matching systems on map"      | exact count in #atNote ("698 plotted of 703")    | hover/focus/tap updates persistent readout bar  | expands paging if row >50)
Theories 8-school table     | Semantic <table> shell rendered | Filter pill "All 8 schools" always has 8 rows;     | If SI_LEDGERS missing, falls back to X.SI counts | Row click or Enter/Space toggles inline detail  | Multiple rows can stay expanded side-by-side for
expansion                   | immediately on script init      | category pills always match >=2 schools            | without throwing (theories.js:9)                 | drawer with thesis, equation, critique & links  | comparing two schools
Theories 5-pillar explorer  | Default canonical curve drawn   | All 5 sliders set to 0 -> inline notice "All       | Out-of-range slider index clamped to [0, N-1]    | Live R^2, slope, moment breakdown & stacked SVG | "Biology only" mode dims digital/AI pillars and
(#svgDeep + weight sliders) | at t=Today (selIdx = N-1)       | weights set to 0; reset to equal weights" button   |                                                  | update in <16ms with tabular-nums stability     | updates legend note
```

---

## Pass 3: User Journey & Emotional Arc (`4/10 -> 10/10`)

```text
STEP | HORIZON            | USER DOES                                    | USER FEELS                                  | PLAN SPECIFIES
-----|--------------------|----------------------------------------------|---------------------------------------------|-------------------------------------------------------------------
1    | 5-sec visceral     | Lands on Stories, Atlas, or Theories         | Oriented and curious, not gated or stalled  | Stories opens DNA immediately; Atlas shows search + map; Theories shows H1 + 5-part jump bar
2    | 1-min scan         | Picks a track, types "octopus", or scans     | In control: instant visual feedback without | Inline story swap (no modal); live scatter dimming + 50-row table; single 8-school table
     |                    | the 8 theoretical schools                    | losing scroll context                       |
3    | 5-min behavioral   | Notices horizontal dot bands on Atlas or     | Trust in scientific honesty instead of      | D1: open rings for class-level rate estimates + legend + readout tag; expandable school critiques
     |                    | expands two rival theories to compare        | suspecting fake or broken numbers           |
4    | 5-year reflective  | Shares a deep link or cites a system/school  | Confidence that every claim is auditable    | Stable URL hashes (#dna, ?q=octopus, #schrodinger) + clickable X.numBtn provenance pills
```

## Findings not yet decided

6. **Atlas plain names.** Rows like "Roman & Han Continental Agrarian Mega-Empire" and "Tenstorrent Blackhole Standalone RISC-V Tensix Processor" should get plain names by default, with the formal name in Expert view.
7. **Theories stat tiles.** The four stat tiles at the top of the page are a generic AI-template pattern. Proposed: drop them.
8. **Theories type size.** 79 of its 94 paragraphs are under 15 px; DESIGN.md sets body text at 17.5 px. Proposed: raise its prose to body size, with card text no smaller than 15 px.
9. **Theories headline index.** The title "…grow exponentially" and the "unified exponential metric" put one index forward as the headline. That contradicts the owner's decision of 13 Nov: six formulas with equal weight and no headline formula. Proposed: retitle the page and present the metric as one measure among several, linked to `intelligence.html`.
10. **Atlas table overlap.** System names overlap the Group column at 1280 px. Proposed: let names wrap, fix the column widths, and stack each row on phones.
11. **Atlas neuron chart labels.** The labels collide. Proposed: reuse the label placer from `data-lab.js`.
12. **Stories picker on phones.** How the nine cards behave on a phone is not specified: a sideways scroll row, or a two-column grid.

Prior learning that applies to the Atlas: about 40% of systems carry rounded class rates, so the scatter shows horizontal bands.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | issues_open (stopped at Pass 2 by the usage limit) | score: 4/10 → not re-rated, 5 decisions |

- **OUTSIDE COVERAGE:** skipped at the owner's choice.
- **VERDICT:** not cleared. Passes 3–7 have not been run.

**UNRESOLVED DECISIONS:**
- Findings 6 to 12 above, not yet asked.
