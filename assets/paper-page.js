// The papers behind the site: a list, then one paper with its check (numbers, rationale, conclusions, contradictions).
(function () {
  'use strict';
  const X = window.SIX, esc = X.esc, P = (window.SI_PAPERS || []).slice().sort((a, b) => a.id - b.id);
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

  function list(cur) {
    $('plist').innerHTML = P.map(p => {
      const c = counts(p);
      return '<a class="prow" href="#paper' + p.id + '" aria-current="' + (p.id === cur) + '"><span class="pnum">' + label(p) + '</span><b>' + esc(p.plain_title) + '</b><span class="pth">' + esc(p.thesis) + '</span><span class="tally">' + tally(c) + '</span></a>';
    }).join('') + (P.length < 6 ? '<p class="note">' + (6 - P.length) + ' more ' + (6 - P.length === 1 ? 'paper is' : 'papers are') + ' still being checked.</p>' : '');
  }

  function doc(p) {
    const c = counts(p), n = p.claims.length;
    const figs = p.id === 0 ? '<section><h2>Figures</h2><p class="muted">Each figure says one of the paper’s four findings and is drawn from its ledgers, so it changes if the data does.</p>' +
      '<div class="frame"><p class="fig-say" id="say1"></p><p class="fig-sub">One bar is all the power used by life and technology on Earth. Each piece is as wide as its share.</p><div class="fw"><svg id="fig1" class="pf" role="img" aria-label="One bar showing how Earth’s power divides between complex cells, microbes, animals and technology."></svg></div></div>' +
      '<div class="frame"><p class="fig-say">Twice, Earth lost more than nine tenths of its nerve signalling almost overnight.</p><p class="fig-sub">Red: the fall in animal nerve signalling across each extinction. Grey: the fall in living biomass over the same step. Whiskers: 95% ranges, where the paper gives one.</p><div class="fw"><svg id="fig2" class="pf" role="img" aria-label="Five mass extinctions with the share of nerve signalling and biomass lost at each."></svg></div></div>' +
      '<div class="frame"><p class="fig-say" id="say3"></p><p class="fig-sub">A ladder of events per second; each rung up is a hundred times more. Pink: nervous systems. Blue: chips. A nerve signal and a chip operation are different kinds of event.</p><div class="fw"><svg id="fig3" class="pf" role="img" aria-label="A ladder from one human brain up to all animal nervous systems, with the largest AI cluster, all chips and all human brains between them."></svg></div></div>' +
      '<div class="frame"><p class="fig-say">The newer the medium, the sooner it forgets.</p><p class="fig-sub">How long each medium keeps its contents if nobody maintains it. Each step along the axis is ten times longer.</p><div class="fw"><svg id="fig4" class="pf" role="img" aria-label="Retention lifetimes of memory media without maintenance, from computer working memory to fired clay."></svg></div></div><p class="note">Does this add up to rising intelligence? <a href="intelligence.html">Six formulas tested on the same census →</a></p></section>'
      : (X.paperFigureSection ? X.paperFigureSection(p.id) : '<section><h2>Figures</h2><p class="muted">New figures for this paper wait on the corrections listed below: a figure must be drawn from the project’s data, and here the data and the manuscript do not yet agree.</p></section>');
    return '<header class="pd-head"><span class="eyebrow">' + label(p) + '</span><h2>' + esc(p.plain_title) + '</h2><p class="pd-full">' + esc(p.title) + '</p>' +
      '<p class="pd-thesis">' + esc(p.thesis) + '</p><p>' + esc(p.summary) + '</p>' +
      (p.revised ? '<p class="pd-rev"><b>Revised.</b> ' + esc(p.revised) + '</p>' : '') +
      '<div class="pd-actions">' + (p.pdf && !p.pdf_stale
        ? '<a class="btn sm" href="' + p.pdf + '">Read the full manuscript (PDF) →</a>' + (p.corrected_docx ? '<a class="btn sm ghost" href="' + p.corrected_docx + '">Word version</a>' : '')
        : (p.corrected_docx ? '<a class="btn sm" href="' + p.corrected_docx + '">Corrected manuscript (Word) →</a>' : '') + (p.pdf ? '<a class="btn sm ghost" href="' + p.pdf + '">Original manuscript (PDF, before correction)</a>' : '')) + '<a class="btn sm ghost" href="#check' + p.id + '">Jump to the check</a></div></header>' +
      figs +
      '<section id="check' + p.id + '"><h2>Is it right? An independent check</h2><div class="pd-bottom"><span class="sub">Bottom line</span><p>' + esc(p.bottom_line) + '</p><div class="tally">' + tally(c) + '</div></div>' +
      '<p class="muted">Each of the paper’s ' + n + ' main numbers was recomputed from the project’s data where the data exists. The check was made on 9 November 2026 by an AI reviewer working from the manuscript and the data files; it is not peer review, and the authors have not yet responded.</p></section>' +
      '<section><h3>The numbers</h3><div class="tbl-wrap p-tbl"><table class="tbl ctab"><thead><tr><th>Claim</th><th>Paper says</th><th>Data gives</th><th>Verdict</th></tr></thead><tbody>' +
      p.claims.map(x => '<tr class="r-' + x.verdict + '"><td><b>' + esc(x.claim) + '</b><span class="cn">' + esc(x.note) + '</span><span class="cs">' + esc(x.section) + ' · ' + esc(x.source) + '</span></td><td class="n">' + esc(x.paper_value) + '</td><td class="n">' + esc(x.data_value) + '</td><td class="vd v-' + x.verdict + '"><b>' + VERDICT[x.verdict][0] + ' ' + VERDICT[x.verdict][1] + '</b></td></tr>').join('') +
      '</tbody></table></div><p class="note">' + Object.keys(VERDICT).map(k => '<b>' + VERDICT[k][0] + ' ' + VERDICT[k][1] + ':</b> ' + VERDICT[k][2]).join(' ') + '</p></section>' +
      '<section><h3>The reasoning, step by step</h3><ol class="steps2">' + p.rationale.map(r => '<li><span class="vd v-' + r.assessment + '"><b>' + STEP[r.assessment][0] + ' ' + STEP[r.assessment][1] + '</b></span><div><b>' + esc(r.step) + '</b><p>' + esc(r.note) + '</p></div></li>').join('') + '</ol></section>' +
      '<section><h3>The conclusions</h3><ul class="steps2">' + p.conclusions.map(r => '<li><span class="vd v-' + r.assessment + '"><b>' + CONC[r.assessment][0] + ' ' + CONC[r.assessment][1] + '</b></span><div><b>' + esc(r.conclusion) + '</b><p>' + esc(r.note) + '</p></div></li>').join('') + '</ul></section>' +
      (p.inconsistencies && p.inconsistencies.length ? '<section><h3>Where the paper contradicts itself or its data</h3><ul class="p-list">' + p.inconsistencies.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></section>' : '');
  }

  function show(scroll) {
    const m = /paper(\d)/.exec(location.hash), p = m ? P.find(x => x.id === Number(m[1])) : null;
    list(p ? p.id : -1);
    $('pdoc').innerHTML = p ? doc(p) : '';
    $('pdoc').hidden = !p;
    if (p) {
      document.title = p.plain_title + ' · Papers · Systema Intelligentiae';
      if (p.id === 0 && X.paper0Figures) X.paper0Figures();
      else if (p.id !== 0 && X.paperFigures) X.paperFigures(p.id);
      if (scroll) $('pdoc').scrollIntoView({ block: 'start' });
    } else document.title = 'Papers · Systema Intelligentiae';
  }
  addEventListener('hashchange', () => { if (/^#paper\d$/.test(location.hash) || !location.hash) show(true); });
  show(false);
})();
