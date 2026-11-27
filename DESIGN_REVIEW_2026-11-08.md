# Design review, 8 Nov 2026: professional finish

Target: the static site in `site/` (Home, Journey, Tree, How we know, Data Lab), measured against `site/DESIGN.md`.
Goal: make it read as a professional natural-history publication, not a classroom app, without losing the teen audience.
Method: `/plan-design-review`, all 7 passes, text-only (no image generator key, so no mockups). 15 decisions, each approved individually.
Earlier rounds: `DESIGN_REVIEW_2026-11-06.md` (18 decisions), QA 7 Nov, live audits 8 Nov (DESIGN.md §11, items 22–33).
Image collection, licensing and credits are with Antigravity (separate hand-off); this plan specifies how plates are framed and credited once they arrive.

## Decisions

| # | Area | Decision |
|---|---|---|
| 1A | Home IA | Replace the 40-tile "Meet the cast" grid with a **seven-acts strip**: one panel per act (act colour key, name, dates, one star creature, "N stops"), each opening Journey at that act's first stop. Journey keeps all 40. |
| 1B | Trust | New **About page** (`about.html`): purpose, who made it, method in five lines, how to cite (one copyable line), data licence, image credits, last updated, contact. Linked from the footer, not the main nav. |
| 2A | Plates | **Fixed 4:3 frame + glyph fallback.** Loading: act-tinted mat with the line glyph at low opacity. Error or no licensed image: the glyph stays. Every real image has a 12 px credit line under it ("Photo: Author, CC BY-SA 4.0", linked). Below-the-fold plates lazy-load. Alt text from the catalog subject. |
| 2B | 404 | **Branded `404.html`**: site header, one line ("This page isn't in the record."), the four doors as links, and the Tree search. |
| 3A | Sharing | **Live tab titles + share pages.** Journey's tab title follows the stop ("The Great Dying · 252 Ma · Systema Intelligentiae"). `build.py` writes 40 share pages (`s/EP14a.html`) with that stop's title, hook and plate as the link preview, forwarding to `journey.html#EP14a`. A "Copy link" button on each stop uses them. |
| 4A | Colour | **Colour = data only.** Surfaces are neutral. Colour appears as data marks: part colour on board tiles and tree lanes, chart lines, act colour on time bands and keys, red for crisis. Doors, myth tags, chips and surprises become neutral with a small coloured key mark (8 px square or 3 px rule). |
| 4B | Cards | **Cards only when you can open them**: doors, myths, thread steps, act strip, the journey stop. "What we count" and "How sure are we?" become ruled two-column lists (hairline rows). "Things that surprised us" becomes a ruled four-column figure band: big number, hairline, text. No boxes. |
| 4C | Hero | **"think?" in ink, with an act-colour rule**: a thin 7-segment bar under the word, segment widths proportional to each act's span, the same bar used on the chart. No gradient text. |
| 4D | Body type | **Source Sans 3** (OFL, self-hosted) replaces Atkinson Hyperlegible for body: plain zero, tabular and lining figures, true italics. Bricolage Grotesque stays for display. |
| 4E | Mono | **Mono for data only**: Data Lab tables and column names, Expert symbols and equations. Dates, stop counters, readouts, ranges and chart ticks use Source Sans 3 with `font-variant-numeric: tabular-nums`. Sentences are never mono. |
| 5A | Identity | Keep the nine-parts grid as the mark, redrawn tighter (1 px gap, 2 px radius squares). Export `favicon.svg`, a 32 px PNG and `apple-touch-icon.png`; one 1200×630 share card (wordmark, the question, the three chart lines); title, description and Open Graph tags on every page. |
| 5B | Footer | **Three-column colophon.** 1: mark, one-line description, "Last updated 8 Nov 2026". 2: Explore (Journey, Tree, How we know, Data Lab). 3: About, How to cite, Image credits, Data licence, Download data. No placeholder apology. |
| 5C | Shape | **Radius scale 4 / 8 / 12**: `--r-sm` 4 px (chips, tags, inputs), `--r-md` 8 px (buttons, tiles, plates), `--r-lg` 12 px (panels, stop card, drawer). Pills only for the Expert switch and filter chips. Nested radius = outer minus gap. |
| 6A | Print | **Print stylesheet**: light theme forced; header, controls, sliders and Expert switch hidden; one column; data colour kept; link URLs printed after body links; no page break inside a myth or stop card; a last line with the page URL and "Printed from Systema Intelligentiae". |
| 7A | Board | **Only new tiles are solid.** Parts upgraded at this stop get the full part colour with on-colour text and the "New" tag. Unchanged parts: light tint, 4 px colour bar, coloured icon. "Not yet": dashed outline. Saturation now means "changed here". |

## Pages after this plan

```
HOME (Read + front door)
  1 Question + "think?" act rule        | today's 3 numbers (wide screens)
  2 Deep-time chart + slider
  3 Four doors (cards: clickable)
  4 One thread (scrolling steps)
  5 Nine parts spec table
  6 Seven acts strip  -> Journey at act start          [1A]
  7 Things that surprised us (ruled figure band)       [4B]
  Footer colophon (3 columns)                          [5B]

ABOUT (Read)          purpose · method · cite · licence · credits · updated · contact   [1B]
404                   header · "This page isn't in the record." · four doors · search   [2B]
s/<moment>.html       preview card -> journey.html#<moment>                              [3A]
```

## Journey storyboard (unchanged from 6 Nov, plus 3A)

| Step | User does | User feels | Plan specifies |
|---|---|---|---|
| 1 | Lands on Home | Curious: a big question and a living chart | Hero, ink headline with act rule, numbers beside it |
| 2 | Opens Journey | Oriented | Act rail with names, stop 1 |
| 3 | Moves stop to stop | Momentum; "it just changed" | Solid tiles only on upgrades (7A) |
| 4 | Hits a crisis | Jolt | Red band, crisis tag |
| 5 | Reaches today | Perspective | Finale: then and now |
| 6 | Shares a stop | Pride: "look at this" | Tab title + share page with the stop's own preview (3A) |
| 7 | Teacher checks it | Trust | About, cite line, credits, print (1B, 5B, 6A) |

## Responsive and accessibility for the new parts

- Seven-acts strip: 7 columns on desktop; sideways-scrolling row with a right-edge fade on phones (same treatment as the thread); each panel a 44 px+ target with an `aria-label` "Act V: Extinctions and warm brains, 252–7 million years ago, 9 stops".
- Surprises band: 4 columns, then 2×2 under 1000 px, then 1 column under 560 px.
- Footer: 3 columns, then 1 column under 680 px; link targets 44 px on phones.
- About and 404: one reading column, max 68ch.
- Plates: `alt` from the catalog subject; credit line is real text, not part of the image; fixed ratio prevents layout shift.
- "Copy link": a button with `aria-live` confirmation ("Link copied").
- Board (7A): state is never colour-only; the "New" tag and the dashed "Not yet" carry it too.

## NOT in scope

- Collecting, licensing and processing images: Antigravity's hand-off (tasks 1–6).
- Data fixes, plain-language census rewrites, invention sources: Antigravity's hand-off (tasks 7–10).
- A new logo concept (5A option C was not chosen).
- Main navigation changes: About stays out of the top nav on purpose.

## What already exists

- Tokens for part, act, chart and on-colour text in `assets/site.css`; browser-surface theming; `SI Sup` exponent face.
- The act-span data used for the chart's act bands (reuse for the 4C rule and the 1A strip).
- The thread strip's sideways scroll and fade (reuse for the act strip on phones).
- `build.py` output pipeline (extend for share pages and About's credits table).
- Line glyphs in `common.js` (the 2A fallback).
- `content/plates.csv` from Antigravity (40 rows: `file`, `credit`, `licence`, `licence_url`, `credit_url`, `caption`, `phylopic`): the input for T10. `caption` becomes the alt text; `credit` + `credit_url` + `licence_url` form the credit line.

## TODOS.md updates

None proposed. Every approved decision is an implementation task below; image work is already handed to Antigravity.

## Implementation Tasks

Effort assumes front-end features at ~30× human ÷ CC.

- [x] **T1 (P1, human: ~3h / CC: ~10min)** — tokens — Radius scale 4/8/12 and neutral surfaces
  - Surfaced by: 5C radius; 4A colour = data only
  - Files: `assets/site.css`
  - Verify: no `border-radius` above 12 px except pills on the Expert switch and filter chips; doors, chips, myth tags and surprises show no coloured fill
- [x] **T2 (P1, human: ~2h / CC: ~10min)** — type — Source Sans 3 body, tabular figures, mono for data only
  - Surfaced by: 4D, 4E
  - Files: `assets/fonts/` (download Source Sans 3 woff2 subsets, OFL: needs your OK at build time), `assets/site.css`
  - Verify: no slashed zero in body text; `.readout`, `.t-range`, `.when`, `.pos` and chart ticks are not mono; Data Lab cells still mono
- [x] **T3 (P1, human: ~2h / CC: ~10min)** — journey board — Solid only on upgrade
  - Surfaced by: 7A
  - Files: `assets/journey.js`, `assets/site.css`
  - Verify: stop 1 shows 8 solid tiles; a mid-journey stop shows only its new parts solid; tags readable at 4.5:1
- [x] **T4 (P1, human: ~1h / CC: ~5min)** — home hero — Ink "think?" with act-span rule
  - Surfaced by: 4C
  - Files: `index.html`, `assets/home.js`, `assets/site.css`
  - Verify: no `background-clip: text`; rule segments match the chart's act bands
- [x] **T5 (P1, human: ~3h / CC: ~15min)** — home — Seven-acts strip replaces the cast grid
  - Surfaced by: 1A
  - Files: `index.html`, `assets/home.js`, `assets/site.css`
  - Verify: 7 panels; each opens Journey at its act's first stop; Home height drops by ~1,500 px; phone row scrolls with fade
- [x] **T6 (P1, human: ~2h / CC: ~10min)** — how + home — Ruled lists and figure band instead of cards
  - Surfaced by: 4B
  - Files: `how.html`, `assets/how.js`, `index.html`, `assets/home.js`, `assets/site.css`
  - Verify: "What we count", "How sure" and surprises have no boxes; 4 → 2 → 1 columns
- [x] **T7 (P1, human: ~3h / CC: ~15min)** — chrome — Colophon footer, About page, 404
  - Surfaced by: 5B, 1B, 2B
  - Files: `assets/common.js` (footer), new `about.html`, new `404.html`, `assets/site.css`
  - Verify: no "placeholders" text anywhere; footer links all resolve; 404 shows doors and search
- [x] **T8 (P2, human: ~3h / CC: ~15min)** — identity — Mark, favicon set, share card, meta tags
  - Surfaced by: 5A
  - Files: new `assets/mark.svg`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `assets/share.png`; `<head>` of every page
  - Verify: tab icon shows; every page has title, description, `og:title`, `og:description`, `og:image`
- [x] **T9 (P2, human: ~4h / CC: ~15min)** — sharing — Live tab titles, share pages, Copy link
  - Surfaced by: 3A
  - Files: `assets/journey.js`, `build.py` (writes `s/*.html`)
  - Verify: tab title follows the stop; `s/EP14a.html` has the stop's preview tags and forwards to `journey.html#EP14a`; "Link copied" is announced
- [x] **T10 (P2, human: ~2h / CC: ~10min)** — plates — Frame, states and credit line
  - Surfaced by: 2A
  - Files: `build.py` (bundle `content/plates.csv`), `assets/journey.js`, `assets/home.js`, `assets/site.css`
  - Verify: with no plates CSV the glyph shows in a 4:3 frame; with one image it loads lazily with a credit line; a broken path falls back to the glyph without a broken-image icon
- [x] **T11 (P2, human: ~1.5h / CC: ~10min)** — print — Print stylesheet
  - Surfaced by: 6A
  - Files: `assets/site.css`
  - Verify: print preview of How we know and a Journey stop: light, one column, no controls, URLs after links, no split myth cards
- [x] **T12 (P1, human: ~1h / CC: ~10min)** — verify — Full visual QA after T1–T11
  - Surfaced by: all passes
  - Files: none
  - Verify: `/design-review` on all pages at desktop and phone, light and dark; no console errors, no overflow; DESIGN.md updated

## Design Review Completion Summary

```
  +====================================================================+
  |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | DESIGN.md current; 5 pages; no favicon,     |
  |                      | OG, 404 or print; no mockups (no API key)   |
  | Step 0               | 6/10 for a professional finish; all 7 passes|
  | Pass 1  (Info Arch)  | 7/10 → 9/10 after fixes                     |
  | Pass 2  (States)     | 8/10 → 10/10 after fixes                    |
  | Pass 3  (Journey)    | 8/10 → 10/10 after fixes                    |
  | Pass 4  (AI Slop)    | 5/10 → 9/10 after fixes                     |
  | Pass 5  (Design Sys) | 7/10 → 10/10 after fixes                    |
  | Pass 6  (Responsive) | 8/10 → 10/10 after fixes                    |
  | Pass 7  (Decisions)  | 1 resolved, 0 deferred                      |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (4 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 0 items proposed                            |
  | Approved Mockups     | 0 generated, 0 approved                     |
  | Decisions made       | 15 added to plan                            |
  | Decisions deferred   | 0                                           |
  | Overall design score | 5/10 → 9/10                                 |
  +====================================================================+
```

Pass 1 stays at 9 until real plates land in the seven-acts strip; Pass 4 stays at 9 until the placeholder drawings are replaced (Antigravity).

### Unresolved Decisions

None.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Outside Review | — | Independent 2nd opinion | 0 | skipped | Declined by user; Codex unavailable (no git repo) |
| Eng Review | `/autoplan` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 2 | clean | score: 5/10 → 9/10, 15 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE COVERAGE:** design phase skipped by the user; Codex unavailable here (not a git repo).
- **VERDICT:** Design review complete (9/10, 0 unresolved); not CLEARED, eng review required.

NO UNRESOLVED DECISIONS
