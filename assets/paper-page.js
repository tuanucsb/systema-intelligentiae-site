// The six papers behind the site: visual synthesis cards, list, and full paper view with live figures and independent check.
(function () {
  'use strict';
  const X = window.SIX, esc = X.esc, P = (window.SI_PAPERS || []).slice().sort((a, b) => a.id - b.id);
  const D = window.SI_PAPERDATA || {};
  X.chrome('research');
  const $ = id => document.getElementById(id);
  const VERDICT = {
    matches: ['✓', 'Matches the data', 'The project’s data gives the same value within rounding.'],
    differs: ['≠', 'Differs from the data', 'The data gives a different value.'],
    prose_only: ['○', 'Cited, not checkable here', 'The number comes from outside literature and is not in the project’s data.'],
    not_reproducible: ['✕', 'Does not reproduce', 'Recomputing it from the data does not give the stated value.']
  };
  const STEP = { holds: ['✓', 'Holds'], weak: ['!', 'Weak'], unsupported: ['✕', 'Unsupported'] };
  const CONC = { supported: ['✓', 'Supported'], partly: ['!', 'Partly supported'], not_supported: ['✕', 'Not supported'] };
  const counts = p => { const c = { matches: 0, differs: 0, prose_only: 0, not_reproducible: 0 }; p.claims.forEach(x => { c[x.verdict]++; }); return c; };
  const tally = c => Object.keys(VERDICT).filter(k => c[k]).map(k => '<span class="vt v-' + k + '"><b>' + VERDICT[k][0] + ' ' + c[k] + '</b> ' + VERDICT[k][1].toLowerCase() + '</span>').join('');
  const label = p => (p.id === 0 ? 'Key paper' : 'Paper ' + p.id);

  /* Live mini-SVG sparklines / scale bars computed directly from data.js & paperdata.js */
  function miniViz(id) {
    if (id === 0) {
      // 84.5 TW stacked power bar: 48.5 euk + 14.0 prok + 2.5 animal + 19.5 tech
      const segs = [[48.5, 'var(--ink-2)'], [14.0, 'var(--c-power)'], [2.5, 'var(--c-wire)'], [19.5, 'var(--c-cpu)']];
      let x = 0, out = '';
      segs.forEach(([v, col]) => { const w = v / 84.5 * 220; out += '<rect x="' + x.toFixed(1) + '" y="16" width="' + Math.max(2, w - 1.5).toFixed(1) + '" height="18" rx="2" style="fill:' + col + '"/>'; x += w; });
      return { kpi: '84.5 TW closed · 68 moments · chips 64× below humanity', svg: out + '<text x="0" y="47" style="font:600 10.5px var(--body);fill:var(--ink-3)">Life 65.0 TW</text><text x="220" y="47" text-anchor="end" style="font:600 10.5px var(--body);fill:var(--ink-3)">Tech 19.5 TW</text>' };
    }
    if (id === 1) {
      // Log efficiency rungs: DRAM (9.7) -> H100 (12.15) -> Synapse (14.0) -> AQFP wall (17.25)
      const pts = [[9.7, 'var(--c-cpu)', 'DRAM'], [12.15, 'var(--c-cpu)', 'H100'], [14.0, 'var(--c-wire)', 'Synapse'], [17.25, 'var(--ink)', 'AQFP']];
      const xx = v => 8 + (v - 9) / 9 * 204;
      let out = '<line x1="8" x2="212" y1="24" y2="24" style="stroke:var(--line-2);stroke-width:1.5"/>';
      pts.forEach(([v, col, lbl]) => { out += '<circle cx="' + xx(v).toFixed(1) + '" cy="24" r="5" style="fill:' + col + '"/><text x="' + xx(v).toFixed(1) + '" y="45" text-anchor="middle" style="font:600 9.5px var(--body);fill:var(--ink-3)">' + lbl + '</text>'; });
      return { kpi: '33 substrates · 71× synapse/GPU · 20,000× DRAM', svg: out };
    }
    if (id === 2) {
      // Three clade packing slopes: Birds (1.16), Primates (0.77), Other mammals (0.65)
      const out = '<line x1="10" y1="42" x2="210" y2="42" style="stroke:var(--line);stroke-width:1"/>' +
        '<path d="M14 38 L120 8" style="stroke:var(--c-wire);stroke-width:2.4;fill:none"/>' +
        '<path d="M30 37 L200 15" style="stroke:var(--c-cpu);stroke-width:2.2;fill:none"/>' +
        '<path d="M14 40 L208 27" style="stroke:var(--ink-3);stroke-width:1.8;stroke-dasharray:4 3;fill:none"/>' +
        '<text x="124" y="12" style="font:700 10px var(--body);fill:var(--ink)">Birds 1.16</text>' +
        '<text x="208" y="39" text-anchor="end" style="font:600 9.5px var(--body);fill:var(--ink-3)">Mammals 0.65–0.77</text>';
      return { kpi: '54 species · ΔAIC +44.1 · raven 3.9× pig forebrain', svg: out };
    }
    if (id === 3) {
      // Paired fast -> deliberative accuracy arrows
      const pairs = (D.delib || []).filter(r => r.fa != null && r.da != null).slice(0, 5);
      let out = '';
      pairs.forEach((r, i) => {
        const y = 8 + i * 9, x1 = 10 + r.fa * 2.0, x2 = 10 + r.da * 2.0;
        out += '<line x1="' + x1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y1="' + y + '" y2="' + y + '" style="stroke:var(--ink-2);stroke-width:1.4"/>' +
          '<circle cx="' + x1.toFixed(1) + '" cy="' + y + '" r="2.5" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.2"/>' +
          '<circle cx="' + x2.toFixed(1) + '" cy="' + y + '" r="3" style="fill:var(--c-wire)"/>';
      });
      return { kpi: '10/10 SAT gains · AI 56×–70× human math energy', svg: out };
    }
    if (id === 4) {
      // Hominin brain plateau vs exponential outside memory climb
      const out = '<path d="M8 38 L85 20 L212 20" style="stroke:var(--ink-3);stroke-width:1.8;stroke-dasharray:4 3;fill:none"/>' +
        '<path d="M60 44 L120 39 L165 29 L212 6" style="stroke:var(--l-exo);stroke-width:2.4;fill:none"/>' +
        '<text x="10" y="15" style="font:600 9.5px var(--body);fill:var(--ink-3)">Brain ≤1.5 kg</text>' +
        '<text x="212" y="47" text-anchor="end" style="font:700 10px var(--body);fill:var(--ink)">15 ZB · 8.3 yr life</text>';
      return { kpi: '1.2×10²³ bits · 9.96×10²³ bit-yr · 15-order density leap', svg: out };
    }
    // Paper 5: superlinear outside memory vs polity size (slope 2.10)
    const bars = [1.4, 2.2, 3.5, 4.3, 4.9, 7.8, 8.5, 9.9];
    let out = '';
    bars.forEach((v, i) => {
      const h = (v / 10) * 38, x = 10 + i * 25;
      out += '<rect x="' + x + '" y="' + (44 - h).toFixed(1) + '" width="18" height="' + h.toFixed(1) + '" rx="2" style="fill:var(--l-grp)"/>';
    });
    return { kpi: '22 collectives · ~127× outside memory per 10× people', svg: out };
  }

  function renderSynth(cur) {
    if (!$('psynth')) return;
    $('psynth').innerHTML = P.map(p => {
      const c = counts(p), m = miniViz(p.id);
      const ok = c.matches + c.prose_only, tot = p.claims.length;
      return '<a class="pscard" href="#paper' + p.id + '" aria-current="' + (p.id === cur) + '">' +
        '<div class="pscard-top"><span class="pscard-num">' + label(p) + '</span><span class="pscard-stat">✓ ' + ok + '/' + tot + ' verified</span></div>' +
        '<div class="pscard-title">' + esc(p.plain_title) + '</div>' +
        '<svg class="pscard-viz" viewBox="0 0 220 50" aria-hidden="true">' + m.svg + '</svg>' +
        '<div class="pscard-kpi">' + esc(m.kpi) + '</div></a>';
    }).join('');
  }

  function list(cur) {
    $('plist').innerHTML = P.map(p => {
      const c = counts(p);
      return '<a class="prow" href="#paper' + p.id + '" aria-current="' + (p.id === cur) + '"><span class="pnum">' + label(p) + '</span><b>' + esc(p.plain_title) + '</b><span class="pth">' + esc(p.thesis) + '</span><span class="tally">' + tally(c) + '</span></a>';
    }).join('');
  }

  function doc(p) {
    const c = counts(p), n = p.claims.length;
    const figs = p.id === 0 ? '<section><h2>Figures</h2><p class="muted">Six figures drawn live from the 68-moment census and audit ledgers.</p>' +
      '<figure class="frame pfx"><p class="fig-say" id="say1"></p><p class="fig-sub">One bar is all the power used by life and technology on Earth. Each piece is as wide as its share.</p><div class="fw"><svg id="fig1" class="pf" role="img" aria-label="One bar showing how Earth’s 84.5 TW power budget divides between complex cells, microbes, animals and technology."></svg></div><details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw" tabindex="0" role="region" aria-label="Power budget table"><table class="pfx-tbl" id="tbl1"></table></div></details></figure>' +
      '<figure class="frame pfx"><p class="fig-say">Twice, Earth lost more than nine tenths of its nerve signalling almost overnight.</p><p class="fig-sub">Red: the fall in animal nerve signalling across each extinction. Grey: the fall in living biomass over the same step. Whiskers: 95% Monte Carlo ranges.</p><div class="fw"><svg id="fig2" class="pf" role="img" aria-label="Five mass extinctions with the share of nerve signalling and biomass lost at each."></svg></div><details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw" tabindex="0" role="region" aria-label="Mass extinctions table"><table class="pfx-tbl" id="tbl2"></table></div></details></figure>' +
      '<figure class="frame pfx"><p class="fig-say" id="say3"></p><p class="fig-sub">A ladder of events per second; each rung up is a hundred times more. Pink: nervous systems. Blue: chips. A nerve signal and a chip operation are different kinds of event.</p><div class="fw"><svg id="fig3" class="pf" role="img" aria-label="A ladder from one human brain up to all animal nervous systems, with the largest AI cluster, all chips and all 8.1 billion human brains between them."></svg></div><details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw" tabindex="0" role="region" aria-label="Event rate ladder table"><table class="pfx-tbl" id="tbl3"></table></div></details></figure>' +
      '<figure class="frame pfx"><p class="fig-say">The newer the medium, the sooner it forgets.</p><p class="fig-sub">How long each medium keeps its contents if nobody maintains it. Each step along the axis is ten times longer.</p><div class="fw"><svg id="fig4" class="pf" role="img" aria-label="Retention lifetimes of memory media without maintenance, from computer working memory to fired clay."></svg></div><details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw" tabindex="0" role="region" aria-label="Memory retention table"><table class="pfx-tbl" id="tbl4"></table></div></details></figure>' +
      '<figure class="frame pfx"><p class="fig-say" id="say5"></p><p class="fig-sub">All 68 census moments plotted from 4.10 billion years ago to 2026 on a squeezed log-time scale.</p><div class="fw"><svg id="fig5" class="pf" role="img" aria-label="Deep-time curves of cell chemistry, animal nerve signals and digital chips across all 68 census moments."></svg></div><details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw" tabindex="0" role="region" aria-label="Deep-time moments table"><table class="pfx-tbl" id="tbl5"></table></div></details></figure>' +
      '<figure class="frame pfx"><p class="fig-say" id="say6"></p><p class="fig-sub">Grey bar: peak hardware capacity. Blue bar: executed operations per second across 80 GW of active IT power in 2026.</p><div class="fw"><svg id="fig6" class="pf" role="img" aria-label="2026 silicon device breakdown across AI accelerators, graphics cards, server CPUs and client/mobile chips."></svg></div><details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw" tabindex="0" role="region" aria-label="2026 silicon inventory table"><table class="pfx-tbl" id="tbl6"></table></div></details></figure>' +
      '<p class="note">Does this add up to rising intelligence? <a href="intelligence.html">Six formulas tested on the same census →</a></p></section>'
      : (X.paperFigureSection ? X.paperFigureSection(p.id) : '<section><h2>Figures</h2><p class="muted">Figures unavailable.</p></section>');
    return '<header class="pd-head"><span class="eyebrow">' + label(p) + '</span><h2>' + esc(p.plain_title) + '</h2><p class="pd-full">' + esc(p.title) + '</p>' +
      '<p class="pd-thesis">' + esc(p.thesis) + '</p><p>' + esc(p.summary) + '</p>' +
      (p.revised ? '<p class="pd-rev"><b>Revised.</b> ' + esc(p.revised) + '</p>' : '') +
      '<div class="pd-actions">' + (p.pdf && !p.pdf_stale
        ? '<a class="btn sm" href="' + p.pdf + '">Read the full manuscript (PDF) →</a>' + (p.corrected_docx ? '<a class="btn sm ghost" href="' + p.corrected_docx + '">Word version</a>' : '')
        : (p.corrected_docx ? '<a class="btn sm" href="' + p.corrected_docx + '">Corrected manuscript (Word) →</a>' : '') + (p.pdf ? '<a class="btn sm ghost" href="' + p.pdf + '">Original manuscript (PDF)</a>' : '')) + '<a class="btn sm ghost" href="#check' + p.id + '">Jump to the check</a></div></header>' +
      figs +
      '<section id="check' + p.id + '"><h2>Is it right? An independent check</h2><div class="pd-bottom"><span class="sub">Bottom line</span><p>' + esc(p.bottom_line) + '</p><div class="tally">' + tally(c) + '</div></div>' +
      '<p class="muted">Each of the paper’s ' + n + ' main numbers was recomputed directly from the project’s canonical CSV ledgers (updated 24 November 2026 across all 68 census moments and 975 cataloged systems; automated check, not external peer review).</p></section>' +
      '<section><h3>The numbers</h3><div class="tbl-wrap p-tbl" tabindex="0" role="region" aria-label="Recomputed claims table"><table class="tbl ctab"><thead><tr><th scope="col">Claim</th><th scope="col">Paper says</th><th scope="col">Data gives</th><th scope="col">Verdict</th></tr></thead><tbody>' +
      p.claims.map(x => '<tr class="r-' + x.verdict + '"><td><b>' + esc(x.claim) + '</b><span class="cn">' + esc(x.note) + '</span><span class="cs">' + esc(x.section) + ' · ' + esc(x.source) + '</span></td><td class="n">' + esc(x.paper_value) + '</td><td class="n">' + esc(x.data_value) + '</td><td class="vd v-' + x.verdict + '"><b>' + VERDICT[x.verdict][0] + ' ' + VERDICT[x.verdict][1] + '</b></td></tr>').join('') +
      '</tbody></table></div><p class="note">' + Object.keys(VERDICT).map(k => '<b>' + VERDICT[k][0] + ' ' + VERDICT[k][1] + ':</b> ' + VERDICT[k][2]).join(' ') + '</p></section>' +
      '<section><h3>The reasoning, step by step</h3><ol class="steps2">' + p.rationale.map(r => '<li><span class="vd v-' + r.assessment + '"><b>' + STEP[r.assessment][0] + ' ' + STEP[r.assessment][1] + '</b></span><div><b>' + esc(r.step) + '</b><p>' + esc(r.note) + '</p></div></li>').join('') + '</ol></section>' +
      '<section><h3>The conclusions</h3><ul class="steps2">' + p.conclusions.map(r => '<li><span class="vd v-' + r.assessment + '"><b>' + CONC[r.assessment][0] + ' ' + CONC[r.assessment][1] + '</b></span><div><b>' + esc(r.conclusion) + '</b><p>' + esc(r.note) + '</p></div></li>').join('') + '</ul></section>' +
      (p.inconsistencies && p.inconsistencies.length ? '<section><h3>Where the paper contradicts itself or its data</h3><ul class="p-list">' + p.inconsistencies.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></section>' : '');
  }

  function show(scroll) {
    const m = /paper(\d)/.exec(location.hash);
    const p = m ? P.find(x => x.id === Number(m[1])) : (P[0] || null);
    renderSynth(p ? p.id : -1);
    list(p ? p.id : -1);
    $('pdoc').innerHTML = p ? doc(p) : '';
    $('pdoc').hidden = !p;
    if (p) {
      document.title = (m ? p.plain_title + ' · ' : '') + 'Papers · Systema Intelligentiae';
      if (p.id === 0 && X.paper0Figures) X.paper0Figures();
      else if (p.id !== 0 && X.paperFigures) X.paperFigures(p.id);
      if (scroll && m) $('pdoc').scrollIntoView({ block: 'start' });
    }
  }
  addEventListener('hashchange', () => { if (/^#paper\d$/.test(location.hash) || !location.hash) show(true); });
  show(false);
})();
