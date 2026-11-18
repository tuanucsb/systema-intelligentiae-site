# Paper check files

One JSON file per manuscript (`paper0.json` … `paper5.json`), bundled by `build.py` into `assets/papers-data.js`.
Every text field is plain English for a general reader: no catalog ids (SYS…, SRC…, OBS…, EP…), no LaTeX, numbers written like 1.41×10¹² or "71 times".

```
{
  "id": 1,
  "title": "<the manuscript's full title>",
  "plain_title": "<at most 9 plain words>",
  "thesis": "<one plain sentence>",
  "summary": "<3 or 4 plain sentences: what the paper does and how>",
  "claims": [            // 6 to 10 of the paper's most important quantitative claims
    { "claim": "<the finding in one plain sentence, without the number>",
      "section": "<section name or number in the manuscript>",
      "paper_value": "<the number as the manuscript states it, with unit>",
      "data_value": "<what the project's data gives when you recompute, with unit; or 'not in the data'>",
      "source": "<data file name and what you computed, or the literature source the paper cites>",
      "verdict": "matches | differs | prose_only | not_reproducible",
      "note": "<one sentence: what you did and what you found>" }
  ],
  "rationale": [          // 3 to 5 steps of the paper's argument
    { "step": "<one step of the reasoning in plain words>", "assessment": "holds | weak | unsupported", "note": "<one sentence why>" }
  ],
  "conclusions": [        // the paper's 2 to 4 main conclusions
    { "conclusion": "<plain sentence>", "assessment": "supported | partly | not_supported", "note": "<one sentence why>" }
  ],
  "inconsistencies": [ "<places where the manuscript contradicts itself, its figures or its data; plain sentences>" ],
  "bottom_line": "<one or two sentences: what a careful reader can rely on, and what not yet>"
}
```

Verdicts: `matches` = recomputed from the project's data within rounding. `differs` = the data gives a different value (say which).
`prose_only` = the number exists only in the manuscript's text, cited to outside literature, so it cannot be checked against project data.
`not_reproducible` = a recomputation was attempted and does not give the stated value.
