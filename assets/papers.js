// Research desk: state a thesis about the census, check it against the data, and write it up as a working paper.
// Every number in a paper is recomputed from the census on load, so a paper cannot drift from its data.
(function () {
  'use strict';
  const X = window.SIX, E = X.E, N = X.N, esc = X.esc, LED = window.SI_LEDGERS || {};
  X.chrome('papers');
  const $ = id => document.getElementById(id);

  /* ---------- quantities a thesis can be about ---------- */
  // fam = unit family (ratios across families are meaningless); kind = what one unit is (ratios across kinds need a caveat)
  const Q = {
    cbio: { pl: true, name: 'Chemical reactions in cells', unit: 'reactions a second', fam: 'rate', kind: 'chemical reactions', col: 'c_biochem_ops_sec', unc: 'C_biochem (' },
    cneu: { pl: true, name: 'Nerve signals', unit: 'signals a second', fam: 'rate', kind: 'nerve signals', col: 'c_neural_ops_sec', unc: 'C_neural (' },
    cdig: { pl: true, name: 'Chip operations', unit: 'operations a second', fam: 'rate', kind: 'chip operations', col: 'c_digital_ops_sec', unc: 'C_digital (' },
    cai: { pl: true, name: 'Neural-net operations', unit: 'operations a second', fam: 'rate', kind: 'chip operations', col: 'c_digital_ai_ops_sec' },
    cmax: { name: 'Biggest single thinker', unit: 'operations a second', fam: 'rate', kind: 'operations of one system', col: 'c_max_entity_ops_sec' },
    hcopy: { name: 'DNA storage', unit: 'bits', fam: 'bits', kind: 'bits', col: 'h_copy_bits' },
    mexo: { name: 'Memory outside the body', unit: 'bits', fam: 'bits', kind: 'bits', col: 'm_exo_installed_bits' },
    mact: { name: 'Working memory', unit: 'bits', fam: 'bits', kind: 'bits', col: 'm_active_bits' },
    cells: { pl: true, name: 'Living cells', unit: 'cells', fam: 'count', kind: 'cells', col: 'total_cells', unc: 'N_prok' },
    neurons: { pl: true, name: 'Neurons', unit: 'neurons', fam: 'count', kind: 'neurons', col: 'n_neurons_global' },
    grp: { name: 'Largest group acting as one', unit: 'individuals', fam: 'count', kind: 'individuals', col: 'max_collective_group_size' },
    pbio: { name: 'Power used by life', unit: 'watts', fam: 'power', kind: 'watts', col: 'p_bio_watts' },
    ptech: { name: 'Power used by technology', unit: 'watts', fam: 'power', kind: 'watts', col: 'p_tech_primary_watts' }
  };
  const QK = Object.keys(Q);
  const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
  const yearOf = e => 2026 - e.t * 1e6;
  const whenOf = i => (E[i].t === 0 ? 'in 2026' : E[i].t * 1e6 < 2000 ? 'in ' + Math.round(yearOf(E[i])) : X.fmtTime(E[i].t).replace(' yrs ago', ' years ago'));
  const momentName = i => (X.STOP[E[i].id] ? X.STOP[E[i].id].who : X.titleOf(i));
  const fix = (n, d) => String(+n.toPrecision(d || 2));
  function factorText(f) {
    if (f >= 1e6) return X.sci(f) + ' times';
    if (f >= 100) return Math.round(+f.toPrecision(2)).toLocaleString('en') + ' times';
    return fix(f) + ' times';
  }
  const orders = f => Math.abs(Math.log10(f));

  /* ---------- uncertainty: 95% ranges from the Monte Carlo ledger (today's values and two extinction drops) ---------- */
  const UNC = (LED.uncertainty ? LED.uncertainty.rows : []).map(r => ({ name: String(r[0]), lo: Number(r[3]), hi: Number(r[5]) }));
  const uncFind = token => UNC.find(u => u.name.indexOf(token) >= 0);
  function rangeOf(k, i) { if (i !== N - 1 || !Q[k].unc) return null; const u = uncFind(Q[k].unc); return u ? [u.lo, u.hi] : null; }
  // per-number sources: the footnotes that the census cites at that moment AND that stand behind that column,
  // plus the audited key sources for the column (content/number_sources.csv)
  const NR = X.SI.numrefs || {};
  const citeNums = i => (E[i].cites.match(/\d+/g) || []).map(Number);
  function footFor(k, i) { const own = (NR[Q[k].col] || {}).f || [], here = citeNums(i); return own.filter(n => here.indexOf(n) >= 0); }
  function keySources(k) {
    const L = LED.sources, ids = (NR[Q[k].col] || {}).s || []; if (!L) return [];
    const c = L.columns, iRef = c.indexOf('primary_reference'), iCon = c.indexOf('verified_empirical_constraint'), iAud = c.indexOf('reconciliation_and_audit_status');
    return ids.map(id => { const r = L.rows.find(x => x[0] === id); return r ? { id, k, ref: r[iRef], says: r[iCon], audit: r[iAud] } : null; }).filter(Boolean);
  }
  const basisOf = k => (NR[Q[k].col] || {}).basis || '';

  /* ---------- the three thesis forms ---------- */
  // each returns { ok, sentence, value, valueText, method, eq, rows:[{k,i}], extra }
  const FORMS = {
    compare: {
      label: 'Compare two quantities', needs: ['a', 'b', 'm2'],
      run(t) {
        const A = Q[t.a], B = Q[t.b], i = t.m2, va = E[i][t.a], vb = E[i][t.b];
        if (!(va > 0) || !(vb > 0)) return { ok: false, rows: [{ k: t.a, i }, { k: t.b, i }], sentence: A.name + ' compared with ' + lower(B.name) + ' ' + whenOf(i) + '.' };
        const f = va / vb, big = f >= 1;
        return {
          ok: true, value: f, rows: [{ k: t.a, i }, { k: t.b, i }],
          valueText: big ? '×' + (f >= 1e6 ? X.sci(f) : factorText(f).replace(' times', '')) : '1/' + (1 / f >= 1e6 ? X.sci(1 / f) : factorText(1 / f).replace(' times', '')),
          sentence: big ? A.name + ' exceeded ' + lower(B.name) + ' by a factor of about ' + factorText(f).replace(' times', '') + ' ' + whenOf(i) + '.'
            : A.name + (A.pl ? ' were about ' : ' was about ') + factorText(1 / f) + ' smaller than ' + lower(B.name) + ' ' + whenOf(i) + '.',
          method: 'Divide the first quantity by the second, both read from the same moment of the census.',
          eq: 'ratio = ' + A.col + ' / ' + B.col + '   at ' + E[i].id + '\n      = ' + X.sci(va) + ' / ' + X.sci(vb) + ' = ' + X.sci(f)
        };
      }
    },
    change: {
      label: 'Measure a change over time', needs: ['a', 'm1', 'm2'],
      run(t) {
        const A = Q[t.a], i1 = Math.min(t.m1, t.m2), i2 = Math.max(t.m1, t.m2), v1 = E[i1][t.a], v2 = E[i2][t.a];
        const rows = [{ k: t.a, i: i1 }, { k: t.a, i: i2 }];
        if (!(v1 > 0) || !(v2 > 0) || i1 === i2) return { ok: false, rows, sentence: A.name + ' between ' + whenOf(i1) + ' and ' + whenOf(i2) + '.' };
        const f = v2 / v1, yrs = (E[i1].t - E[i2].t) * 1e6, perYear = Math.pow(f, 1 / yrs);
        let s, vt;
        if (f < 1) { vt = '−' + fix((1 - f) * 100) + '%'; s = A.name + ' fell by about ' + fix((1 - f) * 100) + '% between ' + whenOf(i1).replace(/^in /, '') + ' and ' + whenOf(i2).replace(/^in /, '') + '.'; }
        else if (yrs <= 500) { vt = '×' + fix(perYear) + ' a year'; s = A.name + ' grew about ' + factorText(f).replace(' times', '-fold') + ' between ' + Math.round(yearOf(E[i1])) + ' and ' + Math.round(yearOf(E[i2])) + ', about ' + fix(perYear) + ' times every year.'; }
        else { vt = '×' + (f >= 1e6 ? X.sci(f) : factorText(f).replace(' times', '')); s = A.name + ' grew about ' + factorText(f).replace(' times', '-fold') + ' between ' + whenOf(i1).replace(/^in /, '') + ' and ' + whenOf(i2).replace(/^in /, '') + '.'; }
        return {
          ok: true, value: f, rows, valueText: vt, sentence: s, years: yrs, perYear,
          method: 'Divide the later value by the earlier one. For spans under 500 years the yearly pace is the ratio raised to one over the number of years.',
          eq: 'change = ' + A.col + '(' + E[i2].id + ') / ' + A.col + '(' + E[i1].id + ')\n       = ' + X.sci(v2) + ' / ' + X.sci(v1) + ' = ' + X.sci(f) + (yrs <= 500 ? '\npace   = change^(1/' + Math.round(yrs) + ' yr) = ' + fix(perYear, 3) + ' per year' : '')
        };
      }
    },
    project: {
      label: 'Project a trend forward', needs: ['a', 'b', 'm1', 'm2'],
      run(t) {
        const A = Q[t.a], B = Q[t.b], i1 = Math.min(t.m1, t.m2), i2 = Math.max(t.m1, t.m2), v1 = E[i1][t.a], v2 = E[i2][t.a], target = E[i2][t.b];
        const rows = [{ k: t.a, i: i1 }, { k: t.a, i: i2 }, { k: t.b, i: i2 }];
        const yrs = (E[i1].t - E[i2].t) * 1e6, rate = v1 > 0 && v2 > 0 && yrs > 0 ? Math.pow(v2 / v1, 1 / yrs) : 0;
        if (!(rate > 1) || !(target > v2)) return { ok: false, rows, sentence: 'A projection of ' + lower(A.name) + ' toward ' + lower(B.name) + ' needs a rising trend that starts below its target.' };
        const year = yearOf(E[i2]) + Math.log(target / v2) / Math.log(rate);
        return {
          ok: true, value: year, rows, valueText: 'about ' + Math.round(year), rate, years: yrs, points: E.slice(i1, i2 + 1).filter(e => e[t.a] > 0).length,
          sentence: 'If ' + lower(A.name) + ' kept growing at the ' + Math.round(yearOf(E[i1])) + ' to ' + Math.round(yearOf(E[i2])) + ' pace of about ' + fix(rate) + ' times a year, ' + (A.pl ? 'they' : 'it') + ' would reach the ' + Math.round(yearOf(E[i2])) + ' level of ' + lower(B.name) + ' around ' + Math.round(year) + '.',
          method: 'Fit one constant yearly pace through the first and last value of the rising quantity, then count the years that pace needs to close the gap to the target.',
          eq: 'pace  = (' + X.sci(v2) + ' / ' + X.sci(v1) + ')^(1/' + Math.round(yrs) + ' yr) = ' + fix(rate, 3) + ' per year\nyears = ln(' + X.sci(target) + ' / ' + X.sci(v2) + ') / ln(pace) = ' + fix(Math.log(target / v2) / Math.log(rate), 3) + '\nyear  = ' + Math.round(yearOf(E[i2])) + ' + years = ' + Math.round(year)
        };
      }
    }
  };

  /* ---------- verification: every check states what it looked at ---------- */
  function verify(t, r) {
    const c = [], add = (s, name, text) => c.push({ s, name, text });
    const used = r.rows, missing = used.filter(u => !(E[u.i][u.k] > 0));
    if (missing.length || !r.ok) {
      add('fail', 'Data present', missing.length ? 'The census has no value above zero for ' + missing.map(u => lower(Q[u.k].name) + ' at ' + whenOf(u.i).replace(/^in /, '')).join(' or ') + '.' : 'The census values do not allow this calculation.');
      return { checks: c, verdict: 'fail' };
    }
    add('pass', 'Data present', 'All ' + used.length + ' values exist in the census and are above zero.');
    // units
    if (t.form !== 'change') {
      const A = Q[t.a], B = Q[t.b];
      if (A.fam !== B.fam) add('fail', 'Units', 'The two quantities have different units (' + A.unit + ' and ' + B.unit + '), so their ratio has no meaning.');
      else if (A.kind !== B.kind) add('warn', 'Units', 'Both are counted per second, but one counts ' + A.kind + ' and the other ' + B.kind + '. The comparison is between how often two different kinds of event happen. It is not a measure of which is cleverer.');
      else add('pass', 'Units', 'Both values are in ' + A.unit + '.');
    } else add('pass', 'Units', 'One quantity compared with itself, in ' + Q[t.a].unit + '.');
    // evidence level
    const lv = used.map(u => X.EPI[E[u.i].epi] || { lvl: 0, label: E[u.i].epi }), low = lv.reduce((p, q) => (q.lvl < p.lvl ? q : p));
    if (low.lvl >= 4) add('pass', 'Evidence level', 'Every value comes from the calibrated modern inventory (measured today).');
    else if (low.lvl === 3) add('pass', 'Evidence level', 'The weakest value rests on the historical and archaeological record.');
    else add('warn', 'Evidence level', 'The weakest value is labelled “' + low.label + '”. It is a constrained scenario, not a measurement.');
    // uncertainty
    let range = null;
    if (t.form === 'compare') {
      const joint = (t.a === 'cdig' && t.b === 'cneu') || (t.a === 'cneu' && t.b === 'cdig') ? uncFind('C_digital/C_neural') : null;
      const ra = rangeOf(t.a, t.m2), rb = rangeOf(t.b, t.m2);
      if (joint && t.m2 === N - 1) range = t.a === 'cdig' ? [joint.lo, joint.hi] : [1 / joint.hi, 1 / joint.lo];
      else if (ra && rb) range = [ra[0] / rb[1], ra[1] / rb[0]];
      if (range) {
        const same = (range[0] > 1 && range[1] > 1) || (range[0] < 1 && range[1] < 1);
        add(same ? 'pass' : 'warn', 'Uncertainty', 'The 95% range of the ratio is ' + X.sci(range[0]) + ' to ' + X.sci(range[1]) + (joint ? ' (joint Monte Carlo, 10,000 draws)' : ' (independent ranges combined, a conservative bound)') + '. ' + (same ? 'The whole range lies on the same side of 1, so the direction of the claim holds.' : 'The range crosses 1, so the direction of the claim is not settled.'));
      } else if (orders(r.value) >= 2) add('pass', 'Uncertainty', 'No Monte Carlo range exists for these values. The gap is ' + fix(orders(r.value)) + ' orders of magnitude; the largest 95% range in the census is about one order, so the direction of the claim holds.');
      else add('warn', 'Uncertainty', 'No Monte Carlo range exists for these values, and the gap is under two orders of magnitude. Treat the size of the ratio as approximate.');
    } else if (t.form === 'change') {
      const i1 = Math.min(t.m1, t.m2), i2 = Math.max(t.m1, t.m2);
      const led = t.a === 'cneu' && Math.abs(E[i1].t - 253) < 0.6 && Math.abs(E[i2].t - 251.9) < 0.2 ? uncFind('End-Permian') : t.a === 'cneu' && Math.abs(E[i1].t - 66.05) < 0.03 && Math.abs(E[i2].t - 66) < 0.03 ? uncFind('K-Pg') : null;
      if (led) { range = [led.lo, led.hi]; add('pass', 'Uncertainty', 'The Monte Carlo ledger gives a 95% range of ' + fix(led.lo, 3) + '% to ' + fix(led.hi, 3) + '% for this drop.'); }
      else if (orders(r.value) >= 1) add('pass', 'Uncertainty', 'No Monte Carlo range exists for this change. It spans ' + fix(orders(r.value)) + ' orders of magnitude, more than the uncertainty of either value.');
      else add('warn', 'Uncertainty', 'No Monte Carlo range exists for this change, and it is smaller than one order of magnitude. Its direction is likely right; its size is approximate.');
    }
    // sources: each number must have at least one of its own
    const per = used.map(u => ({ u, foot: footFor(u.k, u.i), keys: keySources(u.k) }));
    const bare = per.filter(x => !x.foot.length && !x.keys.length), thin = per.filter(x => x.foot.length + x.keys.length === 1);
    const nums = [...new Set(per.flatMap(x => x.foot))], keys = [...new Set(used.map(u => u.k))].flatMap(keySources);
    if (bare.length) add('warn', 'Sources', 'No source is recorded specifically for ' + [...new Set(bare.map(x => lower(Q[x.u.k].name)))].join(' or ') + '. The census lists general references for the moment, but none is tied to this number.');
    else if (thin.length) add('warn', 'Sources', 'Every number has a source of its own, but ' + [...new Set(thin.map(x => lower(Q[x.u.k].name)))].join(' and ') + ' rests on a single one.');
    else add('pass', 'Sources', 'Every number has at least two sources of its own: ' + nums.length + ' cited reference' + (nums.length === 1 ? '' : 's') + ' and ' + new Set(keys.map(k => k.id)).size + ' audited key source' + (new Set(keys.map(k => k.id)).size === 1 ? '' : 's') + ' in all.');
    // extrapolation
    if (t.form === 'project') add('warn', 'Extrapolation', 'The result lies beyond the last census moment. The pace is fitted through ' + r.points + ' census value' + (r.points > 1 ? 's' : '') + ' over ' + Math.round(r.years) + ' years, and nothing in the census says it will continue.');
    const verdict = c.some(x => x.s === 'fail') ? 'fail' : c.some(x => x.s === 'warn') ? 'warn' : 'pass';
    return { checks: c, verdict, range, nums, keys, per };
  }
  const VERDICT = { pass: ['Supported', 'The census supports this thesis as stated.'], warn: ['Supported with caveats', 'The census supports the calculation; read the cautions before quoting it.'], fail: ['Not supported', 'The census cannot support this thesis as stated.'] };
  const TAG = { pass: '✓ Pass', warn: '! Caution', fail: '✕ Fail' };

  /* ---------- populated working papers ---------- */
  const idx = id => X.IDX[id];
  const at = t => E.findIndex(e => Math.abs(e.t - t) < 0.06);
  const PAPERS = [
    { id: 'nerves-vs-chips', form: 'compare', a: 'cneu', b: 'cdig', m2: N - 1,
      title: 'Animal nervous systems still out-signal every chip on Earth by four orders of magnitude',
      intro: 'Public discussion of artificial intelligence often assumes that the world’s computers already rival its brains. This paper tests that assumption at planetary scale by counting events: every synaptic signal fired by every animal, and every operation executed by every chip, in one second of 2026.',
      discussion: 'The gap is dominated by small animals. Insects, worms and marine invertebrates hold most of the planet’s neurons, so the result says little about human brains in particular. It also compares event counts, and a synaptic event and a floating-point operation are not equivalent units of work.' },
    { id: 'neural-nets-pace', form: 'project', a: 'cai', b: 'cneu', m1: idx('EP31b'), m2: N - 1,
      title: 'Neural-net computing has grown about 2.4-fold a year since 2012',
      intro: 'Chips running neural networks are the newest substrate in the census. This paper measures how fast their executed operations have grown since the first deep-learning moment, and asks when that pace, if it held, would reach the signalling rate of all animal nervous systems.',
      discussion: 'The projected year is an arithmetic consequence of one fitted pace, not a forecast. Energy supply, chip fabrication and demand all bound the trend, and the census has only three values on it. The measured part of the claim is the growth to date.' },
    { id: 'dna-vs-outside-memory', form: 'compare', a: 'hcopy', b: 'mexo', m2: N - 1,
      title: 'DNA still stores fourteen orders of magnitude more than every archive and disk',
      intro: 'Human culture is often described as an information explosion. This paper places it beside the oldest store on the planet: the DNA in every living cell, counted with every copy at two bits per base pair, against all installed memory outside bodies.',
      discussion: 'Almost all of that DNA is redundant copies of microbial genomes, so the comparison is about raw storage, not unique knowledge. On unique content the ordering is different, and the census reports the unique library separately.' },
    { id: 'great-dying', form: 'change', a: 'cneu', m1: at(253), m2: at(251.9),
      title: 'The end-Permian extinction cut global nerve signalling by about 94%',
      intro: 'Mass extinctions are usually measured in species lost. This paper measures one in computation: the change in the total rate of nerve signalling across the end-Permian crisis, the largest extinction in the fossil record.',
      discussion: 'Both values are proxy-constrained scenarios built from biomass and body-size reconstructions, so the percentage carries the wide range shown in the verification. The qualitative result, a collapse of more than four fifths, holds across that range.' },
    { id: 'chemistry-largest', form: 'compare', a: 'cbio', b: 'cneu', m2: N - 1,
      title: 'Cell chemistry remains the largest computation on the planet',
      intro: 'Nervous systems and computers are the visible information processors. This paper asks how they compare, in events per second, with the regulated chemical reactions inside all living cells, the process that has run without interruption for about four billion years.',
      discussion: 'A regulated reaction is a much smaller step than a nerve signal, which is why this comparison carries a units caution. The result is best read as a statement about where most of the planet’s information-bearing events happen, which is still inside microbes.' }
  ];
  const PK = {}; PAPERS.forEach(p => { PK[p.id] = p; });

  /* ---------- state and URL ---------- */
  let T = Object.assign({}, PAPERS[0]);
  function readHash() {
    const h = new URLSearchParams((location.hash || '').slice(1));
    if (h.get('p') && PK[h.get('p')]) return Object.assign({}, PK[h.get('p')]);
    if (h.get('t') && FORMS[h.get('t')]) {
      const t = { form: h.get('t'), a: Q[h.get('a')] ? h.get('a') : 'cneu', b: Q[h.get('b')] ? h.get('b') : 'cdig', m1: X.IDX[h.get('m1')], m2: X.IDX[h.get('m2')] };
      if (t.m2 === undefined) t.m2 = N - 1; if (t.m1 === undefined) t.m1 = Math.max(0, t.m2 - 1);
      return t;
    }
    return null;
  }
  function writeHash() {
    const h = T.id ? 'p=' + T.id : 't=' + T.form + '&a=' + T.a + (FORMS[T.form].needs.indexOf('b') >= 0 ? '&b=' + T.b : '') + (FORMS[T.form].needs.indexOf('m1') >= 0 ? '&m1=' + E[T.m1].id : '') + '&m2=' + E[T.m2].id;
    try { history.replaceState(null, '', '#' + h); } catch (e) { /* ignore */ }
  }

  /* ---------- builder ---------- */
  const opt = (v, label, sel) => '<option value="' + v + '"' + (sel ? ' selected' : '') + '>' + esc(label) + '</option>';
  const momentOpts = sel => E.map((e, i) => opt(i, X.fmtShort(e.t) + ' · ' + momentName(i), i === sel)).join('');
  function drawBuilder() {
    const need = FORMS[T.form].needs;
    $('formSeg').innerHTML = Object.keys(FORMS).map(k => '<button type="button" data-form="' + k + '" aria-pressed="' + (k === T.form) + '">' + FORMS[k].label + '</button>').join('');
    const field = (id, label, html) => '<label class="fld"><span>' + label + '</span><select id="' + id + '">' + html + '</select></label>';
    $('fields').innerHTML =
      field('fA', T.form === 'project' ? 'Rising quantity' : 'Quantity', QK.map(k => opt(k, Q[k].name + ' (' + Q[k].unit + ')', k === T.a)).join('')) +
      (need.indexOf('b') >= 0 ? field('fB', T.form === 'project' ? 'Target it would reach' : 'Compared with', QK.map(k => opt(k, Q[k].name + ' (' + Q[k].unit + ')', k === T.b)).join('')) : '') +
      (need.indexOf('m1') >= 0 ? field('fM1', 'From moment', momentOpts(T.m1)) : '') +
      field('fM2', need.indexOf('m1') >= 0 ? 'To moment' : 'At moment', momentOpts(T.m2));
  }
  function fromBuilder() {
    T = { form: T.form, a: $('fA').value, b: $('fB') ? $('fB').value : T.b, m1: $('fM1') ? Number($('fM1').value) : T.m1, m2: Number($('fM2').value) };
    render(false);
  }
  $('formSeg').addEventListener('click', ev => {
    const b = ev.target.closest('[data-form]'); if (!b) return;
    T = { form: b.dataset.form, a: T.a, b: T.b || 'cdig', m1: T.m1 === undefined ? N - 3 : T.m1, m2: T.m2 === undefined ? N - 1 : T.m2 };
    if (T.form === 'project') { T.a = 'cai'; T.b = 'cneu'; T.m1 = idx('EP31b'); T.m2 = N - 1; }
    drawBuilder(); render(false);
  });
  $('fields').addEventListener('change', fromBuilder);

  /* ---------- the paper ---------- */
  function seriesChart(keys, marks) {
    const W = 760, H = 220, L = 52, R = 150, Tp = 14, B = 30, f1 = n => n.toFixed(1);
    const vals = keys.flatMap(k => E.map(e => e[k]).filter(v => v > 0)), lo = Math.floor(Math.log10(Math.min(...vals))), hi = Math.ceil(Math.log10(Math.max(...vals)));
    const xx = i => L + i / (N - 1) * (W - L - R), yy = v => Tp + (hi - Math.log10(v)) / (hi - lo || 1) * (H - Tp - B);
    let g = '';
    const step = Math.max(1, Math.round((hi - lo) / 4));
    for (let v = lo; v <= hi; v += step) g += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + f1(yy(Math.pow(10, v))) + '" y2="' + f1(yy(Math.pow(10, v))) + '"/><text class="tick" x="' + (L - 8) + '" y="' + f1(yy(Math.pow(10, v)) + 4) + '" text-anchor="end">' + (v ? '10' + X.sup(v) : '1') + '</text>';
    [['EP01a', '4.1 Ga'], ['EP08a', '541 Ma'], ['EP21a', '3.3 Ma'], ['EP32b', '2026']].forEach(([id, lbl]) => { const i = X.IDX[id]; g += '<text class="tick" x="' + f1(xx(i)) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle') + '">' + lbl + '</text>'; });
    const dash = ['', '6 4'];
    keys.forEach((k, n) => {
      let d = '', pen = false, last = null;
      E.forEach((e, i) => { const v = e[k]; if (v > 0) { d += (pen ? 'L' : 'M') + f1(xx(i)) + ' ' + f1(yy(v)); pen = true; last = [xx(i), yy(v)]; } else pen = false; });
      g += '<path class="pl" d="' + d + '" stroke-dasharray="' + dash[n % 2] + '"/>';
      if (last) g += '<text class="lab" x="' + f1(last[0] + 10) + '" y="' + f1(last[1] + (n ? 14 : -4)) + '">' + esc(Q[k].name) + '</text>';
    });
    marks.forEach(m => { const v = E[m.i][m.k]; if (v > 0) g += '<circle class="pm" cx="' + f1(xx(m.i)) + '" cy="' + f1(yy(v)) + '" r="5.5"/>'; });
    return '<div class="inset"><svg class="stk pch" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(keys.map(k => Q[k].name).join(' and ')) + ' across the 64 census moments, log scale; the values used are circled. The data table above gives the numbers.">' + g + '</svg></div>';
  }
  function paperHTML(t) {
    const r = FORMS[t.form].run(t), v = verify(t, r), VD = VERDICT[v.verdict];
    const keys = [...new Set(r.rows.map(u => u.k))];
    const title = t.title || r.sentence.replace(/\.$/, '');
    const rowsHTML = r.rows.map(u => {
      const e = E[u.i], q = Q[u.k], rg = rangeOf(u.k, u.i), ep = X.EPI[e.epi] || { label: e.epi };
      return '<tr><th scope="row">' + esc(q.name) + '<span class="x-only mono"> · ' + q.col + '</span></th><td>' + esc(X.fmtShort(e.t)) + ' · ' + esc(momentName(u.i)) + '<span class="x-only mono"> · ' + e.id + '</span></td><td class="n">' + (e[u.k] > 0 ? X.sci(e[u.k]) : '0') + ' ' + q.unit + '</td><td class="n">' + (rg ? X.sci(rg[0]) + ' to ' + X.sci(rg[1]) : 'not available') + '</td><td>' + esc(ep.label) + '</td><td class="srcs">' + (footFor(u.k, u.i).map(n => '<a href="#ref-' + n + '">[' + n + ']</a>').concat(keySources(u.k).map(z => '<a href="#key-' + z.id + '">' + z.id + '</a>')).join(' ') || 'none recorded') + '</td></tr>';
    }).join('');
    const moments = [...new Set(r.rows.map(u => u.i))];
    const deriv = moments.map(i => '<details class="more-g"><summary>How the census derives its values for ' + esc(X.fmtShort(E[i].t)) + '</summary><pre class="formula">' + esc(E[i].formula || 'No derivation recorded for this moment.') + '</pre></details>').join('');
    const supports = id => [...new Set((v.keys || []).filter(z => z.id === id).map(z => lower(Q[z.k].name)))].join(', ');
    const ks = (v.keys || []).filter((k, n, a) => a.findIndex(z => z.id === k.id) === n);
    const refFor = n => [...new Set((v.per || []).filter(x => x.foot.indexOf(n) >= 0).map(x => lower(Q[x.u.k].name)))].join(', ');
    const basis = keys.map(k => basisOf(k) ? '<li><b>' + esc(Q[k].name) + '.</b> ' + esc(basisOf(k)) + '</li>' : '').join('');
    const refs = (v.nums || []).sort((p, q) => p - q);
    const limits = v.checks.filter(c => c.s !== 'pass').map(c => '<li>' + esc(c.text) + '</li>').join('') +
      '<li>The census is a model: values before the modern inventory are reconstructions, and all values are central estimates unless a range is shown.</li>' +
      '<li>This is a working paper generated from the data. It has not been peer reviewed.</li>';
    const url = location.href.split('#')[0] + location.hash;
    const abstract = (t.intro ? t.intro.split('. ')[0] + '. ' : '') + 'Using the Systema Intelligentiae census, we find that ' + lower(r.sentence) + ' ' + (v.range && t.form === 'compare' ? 'The 95% range of the ratio is ' + X.sci(v.range[0]) + ' to ' + X.sci(v.range[1]) + '. ' : v.range ? 'The 95% range is ' + fix(v.range[0], 3) + '% to ' + fix(v.range[1], 3) + '%. ' : '') + 'Automatic verification returns “' + VD[0].toLowerCase() + '” with ' + v.checks.filter(c => c.s === 'warn').length + ' caution' + (v.checks.filter(c => c.s === 'warn').length === 1 ? '' : 's') + '.';
    return '<header class="p-head"><span class="eyebrow">Working paper · ' + (t.id ? 'Systema Intelligentiae' : 'built by you') + ' · census of 8 Nov 2026</span>' +
      '<h2>' + esc(title) + '</h2>' +
      '<div class="p-verdict v-' + v.verdict + '"><b>' + TAG[v.verdict].split(' ')[0] + ' ' + VD[0] + '</b><span>' + VD[1] + '</span></div></header>' +
      '<section><h3>Abstract</h3><p>' + esc(abstract) + '</p></section>' +
      '<section><h3>1. Thesis</h3>' + (t.intro ? '<p>' + esc(t.intro) + '</p>' : '') + '<p class="p-thesis">' + esc(r.sentence) + '</p></section>' +
      '<section><h3>2. Data</h3><p>The values below are read directly from the 64-moment census. Open any derivation to see the arithmetic behind a moment.</p><div class="tbl-wrap p-tbl"><table class="tbl"><thead><tr><th>Quantity</th><th>Moment</th><th>Value</th><th>95% range</th><th>Evidence level</th><th>Sources</th></tr></thead><tbody>' + rowsHTML + '</tbody></table></div>' + deriv +
      (basis ? '<div class="p-keys"><span class="sub">What each number rests on</span><ul class="p-list">' + basis + '</ul></div>' : '') +
      (ks.length ? '<div class="p-keys"><span class="sub">Key sources that pin these numbers</span><ul>' + ks.map(k => '<li id="key-' + k.id + '"><b>' + k.id + ' · ' + esc(k.ref) + '</b><span>' + esc(k.says) + '</span><span class="for">Supports: ' + esc(supports(k.id)) + '</span><span class="x-only">' + esc(k.audit) + '</span></li>').join('') + '</ul></div>' : '') +
      '<p class="note"><a href="data.html">Open the full census and ledgers in the Data Lab →</a></p></section>' +
      '<section><h3>3. Method</h3><p>' + esc(r.method || 'No calculation was possible.') + '</p>' + (r.eq ? '<pre class="formula">' + esc(r.eq) + '</pre>' : '') + '</section>' +
      '<section><h3>4. Result</h3>' + (r.ok ? '<p class="p-result"><b>' + r.valueText + '</b><span>' + esc(r.sentence) + '</span></p>' + seriesChart(keys, r.rows) : '<p>' + esc(r.sentence) + '</p>') + '</section>' +
      '<section><h3>5. Verification</h3><ul class="checks">' + v.checks.map(c => '<li class="c-' + c.s + '"><span class="tagc">' + TAG[c.s] + '</span><div><b>' + esc(c.name) + '</b><p>' + esc(c.text) + '</p></div></li>').join('') + '</ul></section>' +
      (t.discussion ? '<section><h3>6. Discussion</h3><p>' + esc(t.discussion) + '</p></section>' : '') +
      '<section><h3>' + (t.discussion ? '7' : '6') + '. Limitations</h3><ul class="p-list">' + limits + '</ul></section>' +
      '<section><h3>References</h3>' + (refs.length ? '<ol class="refs">' + refs.map(n => '<li value="' + n + '" id="ref-' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + ' <span class="for">Supports: ' + esc(refFor(n)) + '.</span></li>').join('') + '</ol>' : '<p>The census cites no numbered reference for these particular numbers. See the key sources listed under Data.</p>') + '</section>' +
      '<section class="p-cite"><h3>Cite this paper</h3><p id="pCite">Systema Intelligentiae (2026). <i>' + esc(title) + '.</i> Working paper generated from the census of 8 November 2026. ' + esc(url) + '</p><div class="p-actions"><button type="button" class="btn sm ghost" id="pCopy">Copy citation</button><button type="button" class="btn sm ghost" id="pPrint">Print or save as PDF</button><span class="sr-only" id="pMsg" aria-live="polite"></span></div></section>';
  }
  function render(scroll) {
    writeHash();
    $('thesisLine').textContent = FORMS[T.form].run(T).sentence;
    $('paper').innerHTML = paperHTML(T);
    document.title = (T.title || 'Custom thesis') + ' · Working paper · Systema Intelligentiae';
    document.querySelectorAll('#library .lib-row').forEach(a => a.setAttribute('aria-current', a.dataset.p === T.id ? 'true' : 'false'));
    $('pPrint').addEventListener('click', () => window.print());
    $('pCopy').addEventListener('click', () => {
      const text = $('pCite').textContent.replace(/\s+/g, ' ').trim(), done = ok => { $('pMsg').textContent = ok ? 'Citation copied' : 'Copy failed: select the line and copy it'; $('pCopy').textContent = ok ? 'Copied ✓' : 'Copy citation'; setTimeout(() => { if ($('pCopy')) $('pCopy').textContent = 'Copy citation'; }, 2000); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); else done(false);
    });
    if (scroll) $('paper').scrollIntoView({ block: 'start' });
  }

  // source links inside a paper jump to the entry without replacing the paper's own address in the URL
  $('paper').addEventListener('click', ev => {
    const l = ev.target.closest('a[href^="#ref-"], a[href^="#key-"]'); if (!l) return;
    ev.preventDefault();
    const el = document.getElementById(l.getAttribute('href').slice(1)); if (!el) return;
    el.scrollIntoView({ block: 'center' });
    el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 1800);
  });

  /* ---------- library of populated papers ---------- */
  $('library').innerHTML = PAPERS.map(p => {
    const r = FORMS[p.form].run(p), v = verify(p, r);
    return '<a class="lib-row" data-p="' + p.id + '" href="#p=' + p.id + '"><span class="lib-v v-' + v.verdict + '">' + TAG[v.verdict].split(' ')[0] + ' ' + VERDICT[v.verdict][0] + '</span><b>' + esc(p.title) + '</b><span class="lib-n">' + (r.ok ? r.valueText : '') + '</span></a>';
  }).join('');
  function fromHash(scroll) { const t = readHash(); if (t) { T = t; drawBuilder(); render(scroll); } }
  addEventListener('hashchange', () => fromHash(true));
  const first = readHash();
  if (first) T = first;
  drawBuilder(); render(false);
})();
