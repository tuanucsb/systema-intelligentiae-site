# Systema Intelligentiae: design and information flow review

12 November 2026 · Main website in `site/`

The current home page is easier to enter than the original numerical stack, but it still asks one figure to explain too many things. The five-floor building introduces a historical sequence, a hierarchy, a compressed clock, present-day quantities and navigation at once. The next revision should give each visual one question to answer and make the route from a claim to its evidence explicit.

**Recommended opening story:** New ways of storing and processing information appeared over time. Older ways continued alongside them. Their activity can be estimated, but those counts describe different processes and do not establish a common scale of intelligence.

This review covers the current Home, Journey, Tree, Atlas, How we know, Data Lab, Papers and Research desk. It continues the November 6 and 8 reviews but evaluates the newer five-floor home page. The previously exported influence dashboard is a separate artifact. No website files were changed for this review.

## What is working

The opening question is memorable, and named examples make the subject approachable. Moving the numerical stack into “Explore the numbers behind the story” creates useful separation between orientation and detailed inspection. The floor caption explicitly warns against interpreting height as intelligence or quantity. Those are improvements worth keeping.

The site also has the foundations of a strong evidence experience: Journey stops display evidence classes; Data Lab supports row links and downloads; the Atlas distinguishes individual estimates from class estimates; and the Papers page discloses that its AI review is not peer review. The main problem is that these distinctions appear inconsistently or too far from the claims they qualify.

## Findings and priorities

P1 means address before the next broad design review or public demonstration. P2 means address in the following usability pass. Source locations below refer to the files reviewed on this date. Expected reader effects are design judgments, not results from user testing.

### 1. P1 — Selected milestones become universal historical claims

The home lede says Earth learned to think “five times” and that each new way arrived faster. Only the small caption explains that these are five selected developments. The supporting script treats the first positive census entry as a floor's arrival. That establishes when the model starts counting a category, not necessarily its historical origin. The first two selected epochs are themselves labelled “Deep-Time Conditional Scenario” in the bundled data.

The machine floor adds a concrete error: it says chips followed instructions and “for 67 years that was all they did,” before the 2012 learning floor. Machine learning predates 2012; Samuel's checkers work was published in 1959. [Original paper, IBM Journal of Research and Development](https://ieeexplore.ieee.org/abstract/document/5392560/similar).

**Change:** Introduce “five developments this project follows.” Name 2012 as the selected deep-learning milestone. Put “scenario,” “reconstruction” or “modern estimate” beside the relevant date or quantity. Present shorter intervals as a pattern in the selected milestones, with no implied law of accelerating intelligence.

Evidence: [Home lede and caption](index.html:33), [floor dates and stories](assets/home-story.js:5).

### 2. P1 — The building and clock use incompatible spatial meanings

The floors have equal visual height and run from oldest at the bottom to newest at the top. The clock beside them is proportional to elapsed time. Consequently, a vertical position means sequence in one element and time in the other. Their adjacency invites alignment even though the layouts do not correspond. The caption explains the mismatch after the reader has already interpreted the image.

The subtitle also calls the 4.1-billion-year interval “all of Earth's history.” It is the project's chosen interval; Earth's age is approximately 4.54 billion years. The clock arithmetic can remain unchanged if its label becomes “the 4.1 billion years covered by this project.” [USGS, Precambrian](https://pubs.usgs.gov/fs/2007/3004/pdf/FS07-3004_508.pdf).

**Change:** Use a simple, explicitly schematic sequence to introduce the developments and show that each continues today. Give the proportional timeline its own heading and space. It should answer “How recent are these developments?” rather than serve as an axis for equal floors.

Evidence: [figure structure](index.html:39), [building and clock styles](assets/home-story.css:12), [clock and zoom calculations](assets/home-story.js:77).

### 3. P1 — Interpretive headlines contradict the measurement caveats

The evidence disclosure correctly says reactions, nerve signals and digital operations do not measure a shared quantity of intelligence. Yet “Is most thinking still chemistry?” answers “Yes” using event counts. “Who is the biggest single thinker?” awards a record across brains and machines. The opening floor's “busiest” label has the same ambiguity.

The reader can reasonably infer a ranking that the methods section explicitly disclaims. “Ten separately measured quantities” also overstates a dataset containing reconstructed and scenario-dependent values.

**Change:** Ask “Which processes account for the most counted events?” and “How do estimated event rates differ across systems?” Keep event types and scope visible. Use “estimated or reconstructed quantities.” Remove claims of cognitive superiority unless a separate, defensible measure supports them. A caveat inside a closed disclosure cannot repair a stronger public headline.

Evidence: [event-count caveat](index.html:68), [question narratives](assets/home.js:66), [researcher introduction](index.html:132).

### 4. P1 — The site changes conceptual frameworks without explaining their relationship

Readers encounter five floors, seven chart layers, nine parts, ten quantities and seven acts. These describe different things, but the site introduces them with similar authority and visual emphasis. A reader moving from a floor to the evidence chart must discover that “Machines that compute” counts all digital work in its detail, while the chart's “Other silicon” excludes the AI share.

**Change:** Keep one organizing structure on Home and explain the other views at the point of entry.

| Structure | What it organizes | Best location |
|---|---|---|
| Five selected developments | The opening story | Home |
| Seven acts | Chapters in the historical narrative | Journey |
| Nine parts | A functional comparison framework | Journey and Tree |
| Seven plotted series | Selected quantities in the evidence chart | Detailed chart |
| Ten state-vector quantities | The underlying measurement framework | Methods and Data Lab |

Add a small mapping beside the detailed chart: cells relate to chemistry and DNA; animals to nerve activity; external records to outside memory; digital computation to AI plus other silicon. Explain group size separately. Describe the nine parts as a comparison framework rather than the universal assertion “Every thinking thing has nine parts.”

Evidence: [Home sections](index.html:126), [chart series definitions](assets/common.js:368).

### 5. P1 — Opening a question separates its answer from its evidence

The questions sit below the closed evidence section. Selecting one opens that section above, changes its highlighted layers, and puts the narrative answer below the questions. A normal question click does not move to the changed chart. A floor's question link scrolls to the questions rather than to the chart. Readers have to discover and reconnect two changing regions.

**Change:** Put a compact, question-specific figure directly beside or below the answer. Follow it with “Inspect these estimates,” linking to the relevant data and full chart. If the existing layout is retained temporarily, provide an explicit “View highlighted chart” control and announce the change. Avoid silently expanding a large section above the reader.

Evidence: [section order](index.html:65), [question interaction](assets/home.js:89).

### 6. P1 — Some confidence labels exceed what the checks establish

The Research desk can mark uncertainty “Pass” when no range exists, based on a large numerical gap and ranges from other values. That does not establish uncertainty for the selected comparison. It can then display “Supported” or “Supported with caveats,” which readers may interpret as validation of the scientific thesis.

There is a related display inconsistency in the home chart. The code uses `log10(v)` for values at least one and zero otherwise; the prose calls this a digit count. For example, 10²⁶ has 27 decimal digits, while its base-ten logarithm is 26. The displayed logarithm-of-products formula is also undefined at early epochs with zero-valued categories, unlike the implemented clipping rule.

**Change:** Separate “Calculation reproduced,” “Sources linked,” “Uncertainty assessed” and “Scientific interpretation reviewed.” Missing uncertainty should remain “Not assessed.” Name the chart transform accurately and document zero handling. Prefer separate plots with meaningful units over emphasizing the sum of transformed, heterogeneous quantities.

The Papers page's existing AI-review disclosure should stay; it does not fix the Research desk's separate verdict logic.

Evidence: [uncertainty and verdict logic](assets/papers.js:110), [paper review disclosure](assets/paper-page.js:41), [chart transform](assets/common.js:379), [displayed formula](index.html:85).

### 7. P2 — Evidence should be a nearby action, not an expertise setting

Journey already shows a useful “How sure” label. However, its detailed citations and row link are inside Expert-only content. Tree invention sources are similarly gated. The global control carries a “PhD” tag, although checking a source is a normal reader task. Home's present-day floor quantities link to a story or question rather than directly to their calculation.

**Change:** Give each substantial claim an ordinary “Evidence and assumptions” disclosure. Include the estimate, unit, date, scope, evidence class, source and calculation. Reserve the global technical view for symbols and extra columns. Keep sources available to everyone.

Evidence: [global switch](assets/common.js:217), [Journey evidence block](assets/journey.js:156), [Tree sources](assets/tree.js:178).

### 8. P2 — Keyboard and mobile readers have incomplete inspection paths

The floor DOM runs oldest to newest while CSS reverses the visual order. Keyboard focus therefore travels upward through the visible building. Selecting “Next floor” replaces the detail and moves focus to the corresponding floor with scrolling suppressed; its behavior needs a live keyboard check.

Atlas dots expose detail through `mousemove` only, without individual focusable controls. Data Lab sorting uses click handlers on table headings, while exact values rely on title hover and plot values on mouse movement. The Atlas coverage table is not a text alternative for individual plotted systems. These are concrete implementation gaps, although their complete assistive-technology impact has not been tested.

**Change:** Match visual and reading order; support click, tap and keyboard selection; make sort headings buttons; offer exact-value inspection and a searchable system list. Keep the selected detail near its control on narrow screens. Verify the horizontally scrolling timeline separately: its minimum width is 760 pixels.

Evidence: [floor layout](assets/home-story.css:13), [floor focus handling](assets/home-story.js:56), [Atlas tooltip](assets/atlas-page.js:30), [Data Lab controls](assets/data-lab.js:38).

## Proposed home page and figure

The opening should let a visitor answer three questions in order: **What changed? What continued? How do we know?**

| Page section | Story to tell | Visual and next action |
|---|---|---|
| Opening | Information processing took new forms over time | Five numbered examples in normal reading order; one sentence each; “Start the journey” |
| Continuity | Older forms remain active today | Five aligned tracks extending to a shared “Today” endpoint; explicitly schematic, with dates printed rather than implied by spacing |
| Time | The selected technological milestones are very recent within the project's interval | A separate proportional timeline with clearly labelled close-ups |
| Relationships | Particular developments enabled, supported or influenced others | One selected path of 3–5 nodes; labelled connections; “Explore related developments” |
| Evidence | Every quantity has a definition and a degree of uncertainty | One worked example with units, assumptions and sources; “Inspect the data” |
| Further exploration | Readers can continue by interest | Journey, Tree, Atlas, Methods and Research links grouped by purpose |

For the main figure, the visible takeaway should be **“New forms appeared; older forms continued.”** Use one concrete example per row: a cell, an animal, an external record, a computer and a learning system. Show an explicit “Still present today” endpoint. Label the five examples as selected developments and label the date convention. Distinguish machine learning as a use of computing, so the separate story row does not imply an independent physical substrate.

Selecting a row should reveal only a short explanation of the new capability, one example and an evidence link. Present-day event-rate ratios belong in the evidence view, where their units and meaning can be explained. The clock should not sit against these schematic rows as though it were their axis.

Move the full nine-part comparison into Journey or a dedicated explanation. Home currently repeats entry points through its hero buttons, floor actions, questions, four doors, invention thread and act strip. Keep a primary journey action, a clearly marked evidence route and one compact exploration section.

## Where the influence-graph approach fits

The StockAnalysis-style influence approach is most useful after the visitor understands the examples. This recommendation interprets the earlier request as a graph that connects an item to its influences and consequences; the reference dashboard itself was not inspected in this review.

Use it to answer a specific question such as “What helped make external knowledge possible?” Begin with a selected node and its immediate connections, not the entire network. Each connection should have a readable verb, a short explanation, a source and a status such as documented dependency, proposed influence or analogy. A relationship inferred from the project's narrative should be labelled accordingly. Dates alone do not establish causation.

The current Tree already offers relationship traversal, search and a reader's trail, making it a better foundation than adding a second full graph to Home. Its “direct causes” and “direct results” wording should become “linked predecessors” and “linked developments” until each edge supports a causal interpretation. See [Tree relationship labels](assets/tree.js:200).

Node size should carry no quantitative meaning by default. If an optional size encoding is introduced, state the quantity and unit and restrict it to compatible comparisons. Use a list of the same relationships on mobile and for keyboard access.

## Information flow across the site

| Destination | Preserve | Next improvement |
|---|---|---|
| Journey | Act navigation, concrete examples, evidence-class labels, shareable stops | Lead each stop with “What changed?” and make evidence available without Expert mode |
| Tree | Search, selectable relationships and the reader's trail | Explain edge meanings and confidence; provide a short guided path |
| Atlas | Distinction between class and individual estimates; coverage display | State whether each point represents an organism, device, class or group; expose a selectable record and source |
| How we know | Sensitivity controls, evidence classes and definitions | Lead with counting rules and limitations; place “myths” after the method that supports the correction |
| Data Lab | Downloads, row links and column presets | Add plain-language column definitions, accessible inspection and links back to the originating claim |
| Papers / Research desk | Manuscript access and disclosed review status | Label the tasks distinctly: “Read papers” and “Explore calculations”; narrow verdict wording |

A useful evidence route is: **claim → definition and assumptions → calculation → source record → download**. Preserve the selected claim or epoch along that route and offer a clear return link.

Atlas and both research destinations are in the footer rather than the primary header. That is not a broken link, but Home needs clearer introductions to those tasks. The shared footer also still says “Last updated 8 Nov 2026” despite later review content; use a reliable content/build date or identify exactly what that date refers to. See [shared navigation and footer](assets/common.js:217).

## Verification and limits

The repository validator passed for its declared checks: plates and licence metadata, plain-language epochs, preview cards, references and selected ledger/headline consistency. All 16 JavaScript files in `site/assets` passed syntax checks. A static scan found no missing local file targets among 645 references across 78 non-draft HTML pages. The broader scan found 28 missing relative targets in an archived four-chapter draft; that draft should remain outside the published site.

These checks do not establish scientific validity, successful interaction, valid dynamic URL fragments or accessibility compliance. Browser control was disabled in Work settings, so this is a source, content and information-flow review. Desktop and mobile rendering, contrast, focus behavior, screen-reader announcements and print output remain unverified. The scientific points above are targeted checks of claims communicated by the design, not a new audit of every model and dataset.

## Next revision and acceptance criteria

First, settle the opening story and correct milestone, measurement and confidence wording. Then prototype the sequence, continuity figure and separate timeline. Next, repair the question-to-evidence path and accessible inspection controls. Reuse the Tree for a small influence example after its edge semantics are defined.

Before calling the revision complete:

1. In a short comprehension test, a first-time reader can explain what changed and what continued without interpreting height, node size or event count as intelligence.
2. Readers understand that the five developments are selected examples, that 2012 is a milestone, and that the clock covers the project's 4.1-billion-year interval.
3. Every opening claim has a nearby evidence route with its unit, scope, date and uncertainty status.
4. Selecting a question keeps its answer and relevant figure together; Back returns to an understandable prior state.
5. Keyboard and touch users can inspect every plotted record and exact value available to mouse users.
6. The experience is checked at narrow-phone and desktop widths, with enlarged text, both themes and keyboard navigation. Record observed results rather than assigning an untested design score.
