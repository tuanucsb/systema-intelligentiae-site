// Figures for Papers 1 to 5 on research.html, drawn from the rows build.py copies out of data/ (assets/paperdata.js).
// X.paperFigureSection(id) returns the Figures section's HTML; X.paperFigures(id) draws it. Every SVG is drawn at its
// own pixel width (and redrawn when that changes), so labels keep their size on phones.
(function () {
  'use strict';
  const X = window.SIX, esc = X.esc, D = window.SI_PAPERDATA || {};
  const f1 = n => (Math.round(n * 10) / 10).toFixed(1);
  const sig = (n, d) => +n.toPrecision(d || 2);
  const lg = Math.log10;
  const words = n => n >= 1e12 ? sig(n / 1e12, 3).toLocaleString('en-US') + ' trillion' : n >= 1e9 ? sig(n / 1e9, 3).toLocaleString('en-US') + ' billion' : n >= 1e6 ? sig(n / 1e6, 3).toLocaleString('en-US') + ' million' : sig(n, 3).toLocaleString('en-US');
  const times = r => r >= 1e6 ? X.sci(r) : sig(r, 2).toLocaleString('en-US');
  const pct = (a, b) => { const v = a / b * 100; return (v >= 10 ? sig(v, 3) : v >= 1 ? sig(v, 2) : sig(v, 1)) + '%'; };
  const T = (cls, x, y, s, anchor) => '<text class="' + cls + '" x="' + f1(x) + '" y="' + f1(y) + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>';
  const L = (cls, x1, y1, x2, y2) => '<line class="' + cls + '" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '"/>';
  const ctx = document.createElement('canvas').getContext('2d'), bodyFont = getComputedStyle(document.body).fontFamily;
  const tw = (s, px) => { ctx.font = ((px || 6.7) > 6.5 ? '700 13px ' : '12.5px ') + bodyFont; return ctx.measureText(String(s)).width; };
  const wrap = (s, maxW, px) => { const out = []; let cur = ''; String(s).split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && tw(t, px || 6.6) > maxW) { out.push(cur); cur = w; } else cur = t; }); if (cur) out.push(cur); return out; };
  const TL = (cls, x, y, lines, lh, anchor) => lines.map((l, i) => T(cls, x, y + i * (lh || 16), l, anchor)).join('');
  const yearsAgo = t => { const y = Math.round(t * 1e6); return y === 0 ? 'today' : y >= 1e6 ? sig(y / 1e6, 3) + ' million years ago' : y.toLocaleString('en-US') + ' years ago'; };

  /* ---------- shared chart: one dot per row on a log axis ---------- */
  function dotRows(W, o) {
    const Lm = 10, R = 12, x0 = Lm, x1 = W - R, x = v => x0 + (lg(v) - o.lo) / (o.hi - o.lo) * (x1 - x0);
    const step = W < 420 ? o.stepNarrow || 3 : o.step || 2, RH = 46, GH = 34, top = 30;
    let g = '', y = top, body = '';
    o.rows.forEach(r => {
      if (r.gap) {
        const a = x(r.gap[0]), b = x(r.gap[1]), lw = tw(r.label, 6.6), right = b + 8 + lw < W - 2, left = a - 8 - lw > 2, ym = right || left ? y + 16 : y + 30;
        body += '<path class="gapl" d="M' + f1(a) + ' ' + (ym - 5) + ' V' + (ym + 5) + ' M' + f1(a) + ' ' + ym + ' H' + f1(b) + ' M' + f1(b) + ' ' + (ym - 5) + ' V' + (ym + 5) + '"/>';
        body += right ? T('t', b + 8, ym + 4, r.label) : left ? T('t', a - 8, ym + 4, r.label, 'end') : T('t', x0, y + 14, r.label);
        y += right || left ? GH : GH + 12; return;
      }
      const lines = wrap(r.name, x1 - x0), cx = x(r.v), cy = y + 30 + (lines.length - 1) * 16;
      body += TL('t', x0, y + 14, lines) + L('trk', x0, cy, x1, cy);
      body += r.hollow ? '<circle class="hollow" cx="' + f1(cx) + '" cy="' + cy + '" r="6"/>' : '<circle class="' + r.cls + '" cx="' + f1(cx) + '" cy="' + cy + '" r="6.5"/>';
      body += cx + 12 + tw(r.val, 6.6) < W ? T('s', cx + 12, cy + 4.5, r.val) : T('s', cx - 12, cy + 4.5, r.val, 'end');
      y += RH + (lines.length - 1) * 16;
    });
    for (let p = Math.ceil(o.lo); p <= o.hi; p++) {
      if ((p - Math.ceil(o.lo)) % step) continue;
      const xx = x(Math.pow(10, p));
      g += L('grid', xx, 20, xx, y) + T('tk', xx, 13, o.tick ? o.tick(p) : '10' + X.sup(p), xx < 20 ? 'start' : xx > W - 20 ? 'end' : 'middle');
    }
    return { h: y + 4, svg: g + body };
  }

  /* ---------- paper 1: efficiency ladder ---------- */
  function p1Ladder() {
    const H = D.hw, k = 1.380649e-23, Tk = 300, limit = 1 / (k * Tk * Math.LN2);
    const e = key => H[key].efficiency_ops_per_j;
    const gapH100 = e('synapse') / e('h100'), gapDram = e('synapse') / e('dram');
    const rows = [
      { name: 'AI chip fetching off-chip memory (HBM3 DRAM)', v: e('dram'), cls: 'sil', key: 'dram' },
      { name: 'Top AI chip doing 16-bit maths (Nvidia H100)', v: e('h100'), cls: 'sil', key: 'h100' },
      { name: 'Next-gen AI chip (Nvidia B200)', v: e('b200'), cls: 'sil', key: 'b200' },
      { name: 'Laptop neural engine (Apple M4, 5 W)', v: e('m4'), cls: 'sil', key: 'm4' },
      { name: 'One local synapse in the brain’s cortex (0.01 pJ)', v: e('synapse'), cls: 'nerve', key: 'synapse' },
      { gap: [e('h100'), e('synapse')], label: times(gapH100) + '× more than H100 compute' },
      { gap: [e('dram'), e('synapse')], label: times(gapDram) + '× more than a DRAM fetch' },
      { name: 'Superconducting AQFP chip, counting 400× cooling', v: e('aqfp_wall'), cls: 'cold', key: 'aqfp_wall' },
      { name: 'Superconducting AQFP chip alone at 4.2 kelvin', v: e('aqfp_core'), cls: 'cold', key: 'aqfp_core' },
      { name: 'Landauer physical floor at 300 K (k·T·ln 2)', v: limit, hollow: true }
    ];
    rows.forEach(r => { if (!r.gap) r.val = X.sci(r.v); });
    const table = '<thead><tr><th scope="col">System</th><th scope="col">Operations per joule</th><th scope="col">What one operation is</th></tr></thead><tbody>' + rows.filter(r => !r.gap).map(r =>
      '<tr><td>' + esc(r.name) + '</td><td class="n">' + X.sci(r.v) + '</td><td>' + esc(r.key ? H[r.key].op_definition : 'Erasing one bit: k·T·ln 2 at 300 K') + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'A local brain synapse gets 71 times more events per joule than an H100 arithmetic unit — and 20,000 times more than an off-chip DRAM fetch.',
      sub: 'Each dot is how many operations one joule of energy buys across biological, silicon and cryogenic substrates. Each grid step is 100×. Pink: cortical synapse. Blue: room-temperature CMOS. Dark: 4.2 K superconducting logic.',
      aria: 'Operations per joule from HBM3 DRAM (' + X.sci(e('dram')) + ') and Nvidia H100 (' + X.sci(e('h100')) + ') to cortical synapses (' + X.sci(e('synapse')) + '), cooled AQFP (' + X.sci(e('aqfp_wall')) + ') and the Landauer limit.',
      draw: W => dotRows(W, { lo: 9, hi: 21, rows, step: 2, stepNarrow: 3 }),
      notes: [
        'Local postsynaptic current costs 0.01 pJ (10¹⁴ events/J, 70.9× above H100); amortising the whole 20 W human brain across 1.5×10¹⁴ synaptic events/s gives 0.133 pJ (7.5×10¹²/J, 5.3× above H100 and on par with Apple M4 at 7.6×10¹²/J).',
        'Wall-plug 4.2 K AQFP logic (1.79×10¹⁷/J) leads Apple M4 by 23,600×, Nvidia B200 by 39,800×, and Nvidia H100 by 127,000×.'
      ],
      src: 'the 33-substrate hardware benchmark table (cleaned_hardware_benchmarks.csv).',
      table
    };
  }

  /* ---------- paper 1: one metre ---------- */
  function p1Metre() {
    const H = D.hw, v = key => H[key].conduction_velocity_m_s, t = key => 1 / v(key);
    const fmt = s => s >= 1 ? sig(s, 2) + ' s' : s >= 1e-3 ? sig(s * 1e3, 2) + ' ms' : s >= 1e-6 ? sig(s * 1e6, 2) + ' µs' : sig(s * 1e9, 2) + ' ns';
    const rows = [
      { name: 'Calcium wave along a brain-cell branch', key: 'dendrite', cls: 'nerve' },
      { name: 'Dragonfly’s target-tracking nerve cell', key: 'dragonfly', cls: 'nerve' },
      { name: 'Squid giant nerve fibre, no insulation', key: 'squid', cls: 'nerve' },
      { name: 'Blue whale nerve, insulated with myelin', key: 'whale', cls: 'nerve' },
      { name: 'Copper wire inside an AI chip (H100)', key: 'h100', cls: 'sil' },
      { name: 'Light in an optical fibre', key: 'fibre', cls: 'sil' }
    ].map(r => Object.assign(r, { v: t(r.key), val: fmt(t(r.key)) }));
    const tick = p => ({ 0: '1 s', '-3': '1 ms', '-6': '1 µs', '-9': '1 ns' }[p] || '10' + X.sup(p) + ' s');
    const table = '<thead><tr><th scope="col">Signal</th><th scope="col">Speed (m/s)</th><th scope="col">Time to cross 1 m</th></tr></thead><tbody>' + rows.map(r =>
      '<tr><td>' + esc(r.name) + '</td><td class="n">' + X.sci(v(r.key)) + '</td><td class="n">' + fmt(r.v) + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'Across one metre, the fastest myelinated nerve takes ' + sig(t('whale') * 1e3, 2) + ' milliseconds; light in optical fibre takes ' + sig(t('fibre') * 1e9, 2) + ' nanoseconds.',
      sub: 'Transit time across one metre at each substrate’s measured propagation speed (ballistic and cable signals; passive molecular diffusion scales with distance squared).',
      aria: 'Time to cross one metre from dendritic calcium waves (' + fmt(t('dendrite')) + ') down to optical fibre (' + fmt(t('fibre')) + ').',
      draw: W => dotRows(W, { lo: -9, hi: 1, rows, step: 3, stepNarrow: 3, tick }),
      notes: [],
      src: 'the 33-substrate hardware benchmark table.',
      table
    };
  }

  /* ---------- paper 1 NEW fig 3: all 33 substrates length vs latency ---------- */
  function p1SpaceTime() {
    const A = (D.allHw || []).filter(r => r.len > 0 && r.t > 0);
    const draw = W => {
      const Lm = 54, R = 18, top = 20, h = 230, PW = W - Lm - R;
      const x = len => Lm + (lg(len) - (-9)) / (2 - (-9)) * PW;
      const y = lat => top + (5 - lg(lat)) / (5 - (-12)) * h;
      let g = '';
      [-11, -8, -5, -2, 1, 4].forEach(p => {
        const yy = y(Math.pow(10, p));
        g += L('grid', Lm, yy, W - R, yy) + T('tk', Lm - 6, yy + 4, '10' + X.sup(p) + 's', 'end');
      });
      [[-9, '1 nm'], [-6, '1 µm'], [-3, '1 mm'], [0, '1 m']].forEach(([p, lbl]) => {
        const xx = x(Math.pow(10, p));
        g += L('grid', xx, top, xx, top + h) + T('tk', xx, top + h + 16, lbl, 'middle');
      });
      g += L('ax', Lm, top + h, W - R, top + h);
      // speed-of-light-in-fibre (2e8 m/s) and fast myelinated nerve (100 m/s) bounds
      g += '<path class="flat" d="M' + f1(x(1e-4)) + ' ' + f1(y(1e-4 / 2e8)) + ' L' + f1(x(100)) + ' ' + f1(y(100 / 2e8)) + '"/>';
      g += T('tk', x(10), y(10 / 2e8) - 6, 'Light in fibre (2×10⁸ m/s)', 'end');
      g += '<path class="flat" d="M' + f1(x(1e-6)) + ' ' + f1(y(1e-6 / 100)) + ' L' + f1(x(30)) + ' ' + f1(y(30 / 100)) + '"/>';
      g += T('tk', x(8), y(8 / 100) - 6, 'Myelinated nerve (100 m/s)', 'end');
      A.forEach(r => {
        const isBio = /Bio|Neural|Cell|Molecular/i.test(r.cat) && !/DNA Fountain/i.test(r.name);
        const cls = /Cryo|Supercond|Quantum|Photonic/i.test(r.cat) ? 'cold' : isBio ? 'nerve' : 'sil';
        g += '<circle class="' + cls + '" cx="' + f1(x(r.len)) + '" cy="' + f1(y(r.t)) + '" r="5"><title>' + esc(r.name + ': L=' + X.sci(r.len) + ' m, τ=' + X.sci(r.t) + ' s') + '</title></circle>';
      });
      return { h: top + h + 26, svg: g };
    };
    const table = '<thead><tr><th scope="col">Substrate</th><th scope="col">Category</th><th scope="col">Length scale (m)</th><th scope="col">Total latency (s)</th><th scope="col">Ops per joule</th></tr></thead><tbody>' +
      A.map(r => '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.cat) + '</td><td class="n">' + X.sci(r.len) + '</td><td class="n">' + X.sci(r.t) + '</td><td class="n">' + X.sci(r.eff) + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'Across all 33 benchmarked substrates, operational latency spans 14.8 orders of magnitude from 21 picoseconds to 3.8 hours.',
      sub: 'Every row of Table 1 plotted by physical size (horizontal) and total operation latency (vertical). Pink: biological cells and circuits. Blue: room-temperature silicon. Dark: photonic, quantum and 4.2 K superconducting hardware. Hover any dot for exact values.',
      aria: 'Log-log map of all 33 substrates spanning 1 nanometre to 30 metres and 2.13×10⁻¹¹ seconds to 1.36×10⁴ seconds, bounded below by optical and axonal propagation speeds.',
      draw,
      notes: [],
      src: 'all 33 rows of cleaned_hardware_benchmarks.csv.',
      table
    };
  }

  /* ---------- paper 2: where the neurons are (100% bars) ---------- */
  function p2Parts() {
    const C = D.cns, keys = ['dolphin', 'raven', 'mouse', 'human', 'elephant'];
    const name = { dolphin: 'Bottlenose dolphin', raven: 'Common raven', mouse: 'House mouse', human: 'Human', elephant: 'African elephant' };
    const rows = keys.map(k => { const c = C[k], tot = c.cortex_pallium_neurons + c.cerebellum_neurons + c.brainstem_rest_neurons; return { k, c, tot, cx: c.cortex_pallium_neurons / tot, cb: c.cerebellum_neurons / tot, rest: c.brainstem_rest_neurons / tot }; });
    const el = rows.find(r => r.k === 'elephant'), dol = rows.find(r => r.k === 'dolphin');
    const first = k => (k === 'raven' ? 'Pallium' : 'Cortex');
    const draw = W => {
      const Lm = 0, PW = W, RH = 78; let g = '', y = 0;
      rows.forEach(r => {
        const nw = tw(name[r.k], 6.6) + 8, two = nw + tw(words(r.c.total_neurons) + ' neurons', 6.4) > W;
        g += T('t', Lm, y + 15, name[r.k]) + (two ? T('s', Lm, y + 31, words(r.c.total_neurons) + ' neurons') : T('s', Lm + nw, y + 15, words(r.c.total_neurons) + ' neurons'));
        if (two) y += 16;
        let x = Lm;
        [['n3', r.cx], ['nerve', r.cb], ['n1', r.rest]].forEach(([cls, share]) => { const w = share * PW; g += '<rect class="seg ' + cls + '" x="' + f1(x) + '" y="' + (y + 24) + '" width="' + f1(Math.max(w, 0.5)) + '" height="24"/>'; x += w; });
        const pl = wrap(first(r.k) + ' ' + pct(r.cx, 1) + ' · Cerebellum ' + pct(r.cb, 1) + ' · Other ' + pct(r.rest, 1), W, 6.2);
        g += TL('s', Lm, y + 66, pl);
        y += RH + (pl.length - 1) * 16;
      });
      return { h: y - 6, svg: g };
    };
    const table = '<thead><tr><th scope="col">Animal</th><th scope="col">All neurons</th><th scope="col">Cortex or pallium</th><th scope="col">Cerebellum</th><th scope="col">Rest of brain</th></tr></thead><tbody>' + rows.map(r =>
      '<tr><td>' + esc(name[r.k]) + '</td><td class="n">' + words(r.c.total_neurons) + '</td><td class="n">' + words(r.c.cortex_pallium_neurons) + ' (' + pct(r.cx, 1) + ')</td><td class="n">' + words(r.c.cerebellum_neurons) + ' (' + pct(r.cb, 1) + ')</td><td class="n">' + words(r.c.brainstem_rest_neurons) + ' (' + pct(r.rest, 1) + ')</td></tr>').join('') + '</tbody>';
    return {
      say: 'An African elephant places ' + pct(el.cb, 1) + ' of its ' + words(el.c.total_neurons) + ' neurons in its cerebellum — while a raven puts 55% in its forebrain pallium.',
      sub: 'Each bar splits one species’ total brain neurons across associative forebrain (dark grey), cerebellum (pink) and brainstem/rest (light grey).',
      aria: 'Share of neurons in the cerebellum: dolphin ' + pct(dol.cb, 1) + ', raven ' + pct(rows[1].cb, 1) + ', mouse ' + pct(rows[2].cb, 1) + ', human ' + pct(rows[3].cb, 1) + ', elephant ' + pct(el.cb, 1) + '.',
      draw,
      notes: [
        'Terrestrial non-proboscidean mammals allocate ~70–80% of neurons to the cerebellum (human 80.2%), whereas cetaceans drop to 22.4–30.6% and the elephant rises to 97.5%.',
        'Elephant cerebral cortex (5.60 billion neurons) holds 3.27× more cortical neurons than rhesus macaque cortex (1.71 billion), while remaining below chimpanzee (6.20 billion) and human (16.3 billion).'
      ],
      src: 'the 54-species central-nervous-system table (cns_structural_evolution.csv).',
      table
    };
  }

  /* ---------- paper 2: packed tighter ---------- */
  function p2Density() {
    const C = D.cns, d = k => C[k].cortex_pallium_neurons / C[k].cortex_pallium_mass_g;
    const name = { parrot: 'African grey parrot', crow: 'New Caledonian crow', raven: 'Common raven', human: 'Human', dog: 'Domestic dog', pig: 'Domestic pig', orca: 'Killer whale', elephant: 'African elephant' };
    const groups = [['Birds (pallium)', ['parrot', 'crow', 'raven']], ['Mammals (cerebral cortex)', ['human', 'dog', 'pig', 'orca', 'elephant']]];
    const all = groups.flatMap(g => g[1]), max = Math.max.apply(null, all.map(d));
    const brain = k => { const g = C[k].total_brain_mass_g; return g >= 1000 ? sig(g / 1000, 2) + ' kg brain' : sig(g, 3) + ' g brain'; };
    const draw = W => {
      const VR = 92, PW = W - VR; let g = '', y = 0;
      groups.forEach(([head, ks]) => {
        g += T('gh', 0, y + 14, head.toUpperCase()); y += 24;
        ks.forEach(k => {
          const w = d(k) / max * PW;
          const nw = tw(name[k], 6.6) + 8, two = nw + tw(brain(k), 6.4) > W;
          g += T('t', 0, y + 13, name[k]) + (two ? T('s', 0, y + 29, brain(k)) : T('s', nw, y + 13, brain(k)));
          if (two) y += 16;
          g += '<rect class="nerve" x="0" y="' + (y + 20) + '" width="' + f1(Math.max(w, 1.5)) + '" height="16" rx="2"/>' + T('s', w + 8, y + 33, words(d(k)));
          y += 46;
        });
        y += 8;
      });
      return { h: y - 8, svg: g };
    };
    const table = '<thead><tr><th scope="col">Animal</th><th scope="col">Whole brain</th><th scope="col">Cortex or pallium</th><th scope="col">Forebrain neurons</th><th scope="col">Neurons per gram</th></tr></thead><tbody>' + all.map(k =>
      '<tr><td>' + esc(name[k]) + '</td><td class="n">' + sig(C[k].total_brain_mass_g, 3).toLocaleString('en-US') + ' g</td><td class="n">' + sig(C[k].cortex_pallium_mass_g, 3).toLocaleString('en-US') + ' g</td><td class="n">' + words(C[k].cortex_pallium_neurons) + '</td><td class="n">' + words(d(k)) + '</td></tr>').join('') + '</tbody>';
    const pig = C.pig, raven = C.raven;
    return {
      say: 'Gram for gram, a raven’s forebrain packs ' + Math.round(d('raven') / d('human')) + ' times as many neurons as a human cortex — and 3.9 times the total forebrain neurons of a pig.',
      sub: 'Neurons per gram across whole telencephalon (birds) and cerebral cortex (mammals), drawn on one linear scale starting at zero.',
      aria: 'Neurons per gram of cortex or pallium: parrot ' + words(d('parrot')) + ', crow ' + words(d('crow')) + ', raven ' + words(d('raven')) + ', human ' + words(d('human')) + ', pig ' + words(d('pig')) + '.',
      draw,
      notes: [
        'Whole-telencephalon density in the CSV is 1.22×10⁸/g for raven, 1.35×10⁸/g for New Caledonian crow and 1.56×10⁸/g for grey parrot (dissected songbird pallial sub-zones reach 2.78×10⁸/g in Olkowicz et al. 2016).',
        'A 14.5 g raven brain houses ' + words(raven.cortex_pallium_neurons) + ' forebrain neurons versus ' + words(pig.cortex_pallium_neurons) + ' in the 180 g adult pig row (3.87×; and 3.92× against Kazu et al.’s 64.2 g / 3.07×10⁸ cortical pig assay).'
      ],
      src: 'cns_structural_evolution.csv (54 species).',
      table
    };
  }

  /* ---------- paper 2 NEW fig 3: clade cellular scaling lines ---------- */
  function p2Grades() {
    const A = (D.allCns || []).filter(r => r.fmass > 0 && r.forebrain > 0 && /Aves|Mammalia|Primate|Hominini/i.test(r.clade));
    const draw = W => {
      const Lm = 54, R = 18, top = 20, h = 230, PW = W - Lm - R;
      const x = m => Lm + (lg(m) - (-1)) / (4 - (-1)) * PW;
      const y = n => top + (11 - lg(n)) / (11 - 6.5) * h;
      let g = '';
      [7, 8, 9, 10, 11].forEach(p => {
        const yy = y(Math.pow(10, p));
        g += L('grid', Lm, yy, W - R, yy) + T('tk', Lm - 6, yy + 4, '10' + X.sup(p), 'end');
      });
      [[-1, '0.1 g'], [0, '1 g'], [1, '10 g'], [2, '100 g'], [3, '1 kg'], [4, '10 kg']].forEach(([p, lbl]) => {
        const xx = x(Math.pow(10, p));
        g += L('grid', xx, top, xx, top + h) + T('tk', xx, top + h + 16, lbl, 'middle');
      });
      g += L('ax', Lm, top + h, W - R, top + h);
      // Empirical OLS lines from Paper 2: Birds (b=1.1600, a=7.9391), Primates (b=0.7727, a=7.8642), Non-primate mammals (b=0.6471, a=7.4879)
      const line = (a, b, m0, m1, cls) => '<path class="' + cls + '" d="M' + f1(x(m0)) + ' ' + f1(y(Math.pow(10, a + b * lg(m0)))) + ' L' + f1(x(m1)) + ' ' + f1(y(Math.pow(10, a + b * lg(m1)))) + '"/>';
      g += line(7.9391, 1.1600, 0.3, 12, 'neuline');
      g += line(7.8642, 0.7727, 4.5, 1400, 'digline');
      g += line(7.4879, 0.6471, 0.15, 4600, 'flat');
      A.forEach(r => {
        const isBird = /Aves/i.test(r.clade), isPrim = /Primate|Hominini/i.test(r.clade);
        const cls = isBird ? 'nerve' : isPrim ? 'sil' : 'hollow';
        g += '<circle class="' + cls + '" cx="' + f1(x(r.fmass)) + '" cy="' + f1(y(r.forebrain)) + '" r="4.8"><title>' + esc(r.name + ': ' + sig(r.fmass, 3) + ' g forebrain, ' + words(r.forebrain) + ' neurons') + '</title></circle>';
      });
      g += T('t', x(9), y(Math.pow(10, 7.9391 + 1.16 * lg(9))) - 10, 'Birds (slope 1.16)', 'end');
      g += T('t', x(900), y(Math.pow(10, 7.8642 + 0.7727 * lg(900))) - 10, 'Primates & hominins (0.77)', 'end');
      g += T('s', x(2500), y(Math.pow(10, 7.4879 + 0.6471 * lg(2500))) + 18, 'Other mammals (0.65)', 'end');
      return { h: top + h + 26, svg: g };
    };
    const table = '<thead><tr><th scope="col">Clade</th><th scope="col">Taxa (N)</th><th scope="col">Slope ± SE</th><th scope="col">Intercept</th><th scope="col">R²</th></tr></thead><tbody>' +
      '<tr><td>Birds (pallium)</td><td class="n">6</td><td class="n">1.1600 ± 0.1674</td><td class="n">7.9391</td><td class="n">0.9231</td></tr>' +
      '<tr><td>Primates &amp; hominins (all)</td><td class="n">15</td><td class="n">0.7727 ± 0.0271</td><td class="n">7.8642</td><td class="n">0.9843</td></tr>' +
      '<tr><td>Primates (living only, no fossil imputation)</td><td class="n">5</td><td class="n">0.7897 ± 0.0313</td><td class="n">7.8500</td><td class="n">0.9953</td></tr>' +
      '<tr><td>Non-primate mammals (cortex)</td><td class="n">16</td><td class="n">0.6471 ± 0.0331</td><td class="n">7.4879</td><td class="n">0.9646</td></tr></tbody>';
    return {
      say: 'Birds, primates and other mammals follow three separate neuron-packing power laws across four orders of forebrain mass.',
      sub: 'Forebrain mass (g) versus forebrain neuron count across all 37 birds, primates and non-primate mammals in the dataset, with exact ordinary-least-squares lines (ΔAIC = +44.1 on the same 43-vertebrate sample).',
      aria: 'Log-log plot of forebrain neurons against forebrain mass showing birds rising with slope 1.16 above primates (slope 0.77) and non-primate mammals (slope 0.65).',
      draw,
      notes: [],
      src: 'cns_structural_evolution.csv (6 birds, 15 primates + hominins, 16 non-primate mammals).',
      table
    };
  }

  /* ---------- paper 3: waiting makes you right ---------- */
  const fmtDur = s => s >= 3600 ? sig(s / 3600, 2) + ' h' : s >= 60 ? sig(s / 60, 2) + ' min' : s >= 0.1 ? sig(s, 2) + ' s' : sig(s * 1e3, 2) + ' ms';
  function p3Waiting() {
    const rows = (D.delib || []).filter(r => r.fa != null && r.da != null);
    const draw = W => {
      const Lm = 10, R = 14, x0 = Lm, x1 = W - R, x = pctVal => x0 + (pctVal / 100) * (x1 - x0);
      let g = '', y = 30, body = '';
      rows.forEach(r => {
        const isSil = /Silicon/i.test(r.cat), cls = isSil ? 'sil' : 'nerve';
        const label = r.name + ' (' + fmtDur(r.ft) + ' → ' + fmtDur(r.dt) + ')';
        const lines = wrap(label, x1 - x0), cy = y + 30 + (lines.length - 1) * 16;
        const xa = x(r.fa), xb = x(r.da);
        body += TL('t', x0, y + 14, lines) + L('trk', x0, cy, x1, cy);
        body += L('gapl', xa + 6, cy, Math.max(xa + 6, xb - 8), cy);
        if (xb - xa > 14) body += '<polygon points="' + f1(xb - 7) + ',' + (cy - 3.8) + ' ' + f1(xb - 1) + ',' + cy + ' ' + f1(xb - 7) + ',' + (cy + 3.8) + '" fill="currentColor" opacity="0.55"/>';
        body += '<circle class="hollow" cx="' + f1(xa) + '" cy="' + cy + '" r="5.5"/>';
        body += '<circle class="' + cls + '" cx="' + f1(xb) + '" cy="' + cy + '" r="6.5"/>';
        const valTxt = sig(r.fa, 3) + '% → ' + sig(r.da, 3) + '%';
        body += xb + 11 + tw(valTxt, 6.6) < W ? T('s', xb + 11, cy + 4.5, valTxt) : xa - 11 - tw(valTxt, 6.6) > 0 ? T('s', xa - 11, cy + 4.5, valTxt, 'end') : T('s', x1, cy - 9, valTxt, 'end');
        y += 48 + (lines.length - 1) * 16;
      });
      [0, 25, 50, 75, 100].forEach(p => {
        const xx = x(p);
        g += L('grid', xx, 20, xx, y) + T('tk', xx, 13, p + '%', p === 0 ? 'start' : p === 100 ? 'end' : 'middle');
      });
      return { h: y + 4, svg: g + body };
    };
    const table = '<thead><tr><th scope="col">System &amp; task</th><th scope="col">Fast time</th><th scope="col">Fast accuracy</th><th scope="col">Deliberative time</th><th scope="col">Deliberative accuracy</th><th scope="col">Study</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + esc(r.name) + '</td><td class="n">' + fmtDur(r.ft) + '</td><td class="n">' + sig(r.fa, 3) + '%</td><td class="n">' + fmtDur(r.dt) + '</td><td class="n">' + sig(r.da, 3) + '%</td><td>' + esc(r.src) + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'Across all 10 paired experiments — from fruit flies, rats and crows to ant quorums, humans and reasoning AI — pausing longer lifts accuracy on the exact same task.',
      sub: 'Hollow circle: fast response. Filled circle: deliberative response on the identical benchmark (pink: nervous systems and colonies; blue: silicon AI).',
      aria: 'Accuracy before and after pausing across 10 paired biological and AI experiments, with 10 out of 10 showing positive accuracy gains.',
      draw,
      notes: [
        'All 10 paired benchmarks show positive accuracy gains (sign test p = 9.8×10⁻⁴), including Taylor et al.’s (2007) New Caledonian crow metatool inspection (3.9 s → 29.6 s, 0% → 57.1% spontaneous first-trial success).'
      ],
      src: 'deliberation_speed_accuracy_energy.csv (10 paired speed-accuracy curves).',
      table
    };
  }

  /* ---------- paper 3: energy per decision ---------- */
  function p3Energy() {
    const all = D.delib || [];
    const pickRow = re => all.find(r => re.test(r.name));
    const ant = pickRow(/Trap-jaw/), fly = pickRow(/Blowfly/), bee = pickRow(/Bumblebee/), rat = pickRow(/^Rat /),
      mac = pickRow(/Macaque/), crow = pickRow(/New Caledonian/), col = pickRow(/Rock ant/),
      hFast = pickRow(/perceptual/), hBat = pickRow(/System-1/), hMath = pickRow(/competition math/),
      o1 = pickRow(/OpenAI o1/), r1 = pickRow(/DeepSeek-R1/), swarm = pickRow(/Honeybee scout/);
    const eOf = r => r ? (r.de != null ? r.de : r.fe) : null;
    const tOf = r => r ? (r.dt != null ? r.dt : r.ft) : null;
    const list = [
      { label: 'Trap-jaw ant hair-trigger reflex', r: ant, cls: 'nerve' },
      { label: 'Blowfly gyroscopic wing reflex', r: fly, cls: 'nerve' },
      { label: 'Bumblebee careful flower choice', r: bee, cls: 'nerve' },
      { label: 'Rat one-second click accumulation', r: rat, cls: 'nerve' },
      { label: 'Macaque accurate visual search', r: mac, cls: 'nerve' },
      { label: 'New Caledonian crow 30 s tool inspection', r: crow, cls: 'nerve' },
      { label: 'Human cautious perceptual choice', r: hFast, cls: 'nerve' },
      { label: 'Rock-ant colony 9.4 h nest quorum', r: col, cls: 'nerve' },
      { label: 'Human 18 s bat-and-ball reflection', r: hBat, cls: 'nerve' },
      { label: 'Human 10 min competition maths problem (20 W)', r: hMath, cls: 'nerve' },
      { label: 'OpenAI o1 2 min maths reasoning (8×H100, 5.6 kW)', r: o1, cls: 'sil' },
      { gap: [eOf(hMath), eOf(o1)], label: times(eOf(o1) / eOf(hMath)) + '× human maths energy (1.75 orders)' },
      { label: 'DeepSeek-R1 2.5 min maths reasoning (8×H100, 5.6 kW)', r: r1, cls: 'sil' },
      { label: 'Honeybee swarm 16 h cavity decision (20 W cluster)', r: swarm, cls: 'nerve' }
    ].filter(x => x.gap || (x.r && eOf(x.r) > 0));
    const rows = list.map(x => x.gap ? x : { name: x.label, v: eOf(x.r), cls: x.cls, val: X.sci(eOf(x.r)) + ' J', raw: x.r });
    const gapMath = o1 && hMath ? Math.round(eOf(o1) / eOf(hMath)) : 56;
    const table = '<thead><tr><th scope="col">Decision</th><th scope="col">Time</th><th scope="col">Active power</th><th scope="col">Energy per decision</th><th scope="col">Study</th></tr></thead><tbody>' +
      rows.filter(r => !r.gap).map(r => '<tr><td>' + esc(r.name) + '</td><td class="n">' + fmtDur(tOf(r.raw)) + '</td><td class="n">' + X.watts(r.raw.w) + '</td><td class="n">' + X.sci(r.v) + ' J</td><td>' + esc(r.raw.src) + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'On competition maths problems, an 8×H100 AI reasoning run spends ' + gapMath + ' to 70 times as much energy as a human brain (672–840 kJ vs 12 kJ).',
      sub: 'Total energy per reflex or deliberation (active power × decision duration) across 14 orders of magnitude from nanojoules to megajoules.',
      aria: 'Energy per decision from trap-jaw ant reflex up to human competition math (1.2×10⁴ J), OpenAI o1 (6.72×10⁵ J, 56× human), DeepSeek-R1 (8.4×10⁵ J, 70× human) and honeybee swarm (1.15×10⁶ J).',
      draw: W => dotRows(W, { lo: -8, hi: 7, rows, step: 3, stepNarrow: 3, tick: p => '10' + X.sup(p) + ' J' }),
      notes: [
        'Standardised on an 8×H100 node (8 × 700 W = 5.60 kW TDP): 120 s = 672 kJ (~82 J/token) for OpenAI o1 and 150 s = 840 kJ for DeepSeek-R1, versus 600 s × 20 W = 12.0 kJ for a human solver.'
      ],
      src: 'deliberation_speed_accuracy_energy.csv.',
      table
    };
  }

  /* ---------- paper 3 NEW fig 3: log-odds accuracy gain vs thinking-time ratio ---------- */
  function p3LogOdds() {
    const pairs = (D.delib || []).filter(r => r.fa > 0 && r.da < 100 && r.ft > 0 && r.dt > 0).map(r => {
      const pf = r.fa / 100, pd = r.da / 100;
      return { name: r.name, cat: r.cat, ratio: r.dt / r.ft, dlo: Math.log(pd / (1 - pd)) - Math.log(pf / (1 - pf)), de: (r.de || 0) - (r.fe || 0) };
    });
    const draw = W => {
      const Lm = 48, R = 18, top = 20, h = 210, PW = W - Lm - R;
      const x = rt => Lm + lg(rt) / 3.2 * PW;
      const y = dlo => top + (4.2 - dlo) / 4.2 * h;
      let g = '';
      [0, 1, 2, 3, 4].forEach(v => {
        const yy = y(v);
        g += L('grid', Lm, yy, W - R, yy) + T('tk', Lm - 6, yy + 4, '+' + v, 'end');
      });
      [[1, '1×'], [10, '10×'], [100, '100×'], [1000, '1,000×']].forEach(([v, lbl]) => {
        const xx = x(v);
        g += L('grid', xx, top, xx, top + h) + T('tk', xx, top + h + 16, lbl, 'middle');
      });
      g += L('ax', Lm, top + h, W - R, top + h);
      // OLS fit: dlo = 0.5725 + 0.5395 * ln(ratio)
      const xA = 1.5, xB = 1400;
      g += '<path class="digline" d="M' + f1(x(xA)) + ' ' + f1(y(0.5725 + 0.5395 * Math.log(xA))) + ' L' + f1(x(xB)) + ' ' + f1(y(0.5725 + 0.5395 * Math.log(xB))) + '"/>';
      pairs.forEach(p => {
        const cls = /Silicon/i.test(p.cat) ? 'sil' : 'nerve';
        g += '<circle class="' + cls + '" cx="' + f1(x(p.ratio)) + '" cy="' + f1(y(p.dlo)) + '" r="5.5"><title>' + esc(p.name + ': ' + sig(p.ratio, 3) + '× longer, +' + p.dlo.toFixed(2) + ' log-odds') + '</title></circle>';
      });
      g += T('s', x(900), y(0.5725 + 0.5395 * Math.log(900)) - 10, 'OLS slope 0.54 (R² = 0.67)', 'end');
      return { h: top + h + 26, svg: g };
    };
    const table = '<thead><tr><th scope="col">Paired experiment</th><th scope="col">Time multiplier (T_slow ÷ T_fast)</th><th scope="col">Log-odds accuracy gain (nats)</th><th scope="col">Extra energy spent (J)</th></tr></thead><tbody>' +
      pairs.map(p => '<tr><td>' + esc(p.name) + '</td><td class="n">' + sig(p.ratio, 3) + '×</td><td class="n">+' + p.dlo.toFixed(2) + '</td><td class="n">' + X.sci(p.de) + ' J</td></tr>').join('') + '</tbody>';
    return {
      say: 'Multiplying deliberation time yields a systematic log-odds accuracy gain (slope 0.54 ± 0.14, R² = 0.67) across brains, swarms and silicon.',
      sub: 'Horizontal axis: how many times longer the deliberative mode thinks than the fast mode. Vertical axis: gain in log-odds of a correct answer across the 9 interior probability pairs.',
      aria: 'Scatter and regression line of log-odds accuracy gain against time ratio across 9 paired biological and AI experiments, rising with slope 0.54 and R² = 0.67.',
      draw,
      notes: [],
      src: 'ordinary least squares on the paired rows of deliberation_speed_accuracy_energy.csv.',
      table
    };
  }

  /* ---------- paper 4: more, but shorter (mirrored bars) ---------- */
  function p4Mirror() {
    const M = D.media, keys = ['clay', 'rag', 'pulp', 'tape', 'hdd', 'flash'];
    const name = { clay: 'Clay tablets and carved stone', rag: 'Rag-paper books', pulp: 'Modern wood-pulp paper', tape: 'Magnetic archival tape', hdd: 'Hard disk drives', flash: '3D NAND flash SSDs' };
    const cls = { clay: 'exo', rag: 'exo', pulp: 'exo', tape: 'sil', hdd: 'sil', flash: 'sil' };
    const life = v => (v >= 100 ? sig(v, 2).toLocaleString('en-US') : sig(v, 2)) + ' yrs';
    const draw = W => {
      const VW = W < 480 ? 52 : 70, cx = W / 2, half = cx - VW - 4;
      const bL = v => (lg(v) - 9) / (24 - 9) * half, bR = v => lg(v) / 4 * half;
      let g = T('t', cx - 6, 14, 'Amount stored', 'end') + T('t', cx + 6, 14, 'How long it lasts', 'start') +
        T('tk', cx - 6, 30, 'worldwide, 2026', 'end') + T('tk', cx + 6, 30, 'with no upkeep', 'start');
      let y = 44;
      keys.forEach(k => {
        const m = M[k], a = bL(m.bits), b = bR(m.life);
        g += T('s', cx, y + 13, name[k], 'middle');
        g += '<rect class="' + cls[k] + '" x="' + f1(cx - 2 - a) + '" y="' + (y + 20) + '" width="' + f1(Math.max(a, 1.5)) + '" height="16" rx="2"/>';
        g += '<rect class="' + cls[k] + '" x="' + f1(cx + 2) + '" y="' + (y + 20) + '" width="' + f1(Math.max(b, 1.5)) + '" height="16" rx="2"/>';
        g += T('s', cx - 2 - a - 6, y + 33, X.sci(m.bits), 'end') + T('s', cx + 2 + b + 6, y + 33, life(m.life)) + L('ax', cx, y + 18, cx, y + 38);
        y += 46;
      });
      return { h: y + 2, svg: g };
    };
    const first = M.clay, last = M.flash;
    const table = '<thead><tr><th scope="col">Medium</th><th scope="col">Bits stored worldwide, 2026</th><th scope="col">Unpowered lifetime (yr)</th><th scope="col">Bits per cm³</th></tr></thead><tbody>' + keys.map(k =>
      '<tr><td>' + esc(name[k]) + '</td><td class="n">' + X.sci(M[k].bits) + '</td><td class="n">' + sig(M[k].life, 3).toLocaleString('en-US') + '</td><td class="n">' + X.sci(M[k].density) + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'Each newer medium stores vastly more bits, and forgets much sooner without electricity.',
      sub: 'Left: bits stored worldwide in 2026 (log scale). Right: mean unpowered physical retention in years (log scale). Across tape, hard disks and flash (1.20×10²³ bits), the capacity-weighted unpowered mean is 8.30 years (9.96×10²³ bit-years).',
      aria: 'Clay and stone hold ' + X.sci(first.bits) + ' bits lasting ' + first.life.toLocaleString('en-US') + ' years, while flash SSDs hold ' + X.sci(last.bits) + ' bits lasting ' + last.life + ' years unpowered.',
      draw,
      notes: [
        'Sustaining the 15-zettabyte (1.20×10²³-bit) digital stock beyond its 8.30-year unpowered horizon requires 20.0 GW of continuous maintenance power (9.0 GW storage scrubbing + 11.0 GW DRAM refresh).'
      ],
      src: 'paper0_memory_persistence_ledger.csv.',
      table
    };
  }

  /* ---------- paper 4: the brain stopped growing; the library did not ---------- */
  function p4Library() {
    const Hm = D.hominins, E = X.E.filter(e => e.t <= 3.5 && e.mexo > 0), now = X.E[X.N - 1];
    const human = Hm.find(h => /Modern Human/i.test(h[0])), ardi = Hm.find(h => /Ardi/i.test(h[0]));
    const yrs = t => Math.max(t * 1e6, 1);
    const draw = W => {
      const Lm = W < 480 ? 46 : 58, R = 14, PW = W - Lm - R, x = t => Lm + (lg(5e6) - lg(yrs(t))) / lg(5e6) * PW;
      const st = wrap('Bits kept outside bodies (each step up is 10× more)', W - Lm, 6.6), t1 = 22, h1 = 130, t2 = t1 + h1 + 52 + (st.length - 1) * 16, h2 = 180, y1 = g => t1 + h1 - g / 1800 * h1, y2 = b => t2 + h2 - (lg(b) - 3) / 24 * h2;
      const ticks = (W < 480 ? [[1, '1 Ma'], [0.01, '10 ka'], [1e-4, '100 yrs'], [0, '2026']] : [[1, '1 Ma'], [0.1, '100 ka'], [0.01, '10 ka'], [0.001, '1 ka'], [1e-4, '100 yrs'], [1e-5, '10 yrs'], [0, '2026']]);
      let g = T('t', Lm, t1 - 8, 'Brain size of human ancestors (grams)') + TL('t', Lm, t2 - 8 - (st.length - 1) * 16, st);
      [0, 500, 1000, 1500].forEach(v => { g += L('grid', Lm, y1(v), W - R, y1(v)) + T('tk', Lm - 6, y1(v) + 4, v.toLocaleString('en-US'), 'end'); });
      [3, 9, 15, 21].forEach(p => { g += L('grid', Lm, y2(Math.pow(10, p)), W - R, y2(Math.pow(10, p))) + T('tk', Lm - 6, y2(Math.pow(10, p)) + 4, '10' + X.sup(p), 'end'); });
      ticks.forEach(([t, lbl]) => { const xx = x(t); g += L('grid', xx, t1, xx, t1 + h1) + L('grid', xx, t2, xx, t2 + h2) + T('tk', xx, t2 + h2 + 16, lbl, xx > W - 30 ? 'end' : 'middle'); });
      g += L('ax', Lm, t1 + h1, W - R, t1 + h1) + L('ax', Lm, t2 + h2, W - R, t2 + h2);
      g += '<path class="flat" d="M' + f1(x(human[1])) + ' ' + f1(y1(human[2])) + ' H' + f1(x(0)) + '"/>';
      Hm.forEach(h => { g += '<circle class="nerve" cx="' + f1(x(h[1])) + '" cy="' + f1(y1(h[2])) + '" r="4.5"/>'; });
      g += T('s', x(ardi[1]) - 4, y1(ardi[2]) + 20, 'Ardi, ' + ardi[2] + ' g, ' + yearsAgo(ardi[1]).replace(' years ago', '').replace(' million', ' Ma'));
      g += T('s', x(0), y1(human[2]) - 9, 'Modern humans, ' + human[2].toLocaleString('en-US') + ' g', 'end');
      g += '<path class="exoline" d="' + E.map((e, i) => (i ? 'L' : 'M') + f1(x(e.t)) + ' ' + f1(y2(e.mexo))).join(' ') + '"/>';
      E.forEach(e => { g += '<circle class="exo" cx="' + f1(x(e.t)) + '" cy="' + f1(y2(e.mexo)) + '" r="3"/>'; });
      g += T('s', x(0) - 4, y2(now.mexo) - 12, 'Today: ' + X.sci(now.mexo) + ' bits', 'end');
      return { h: t2 + h2 + 24, svg: g };
    };
    const table = '<thead><tr><th scope="col">Human ancestor or moment</th><th scope="col">When</th><th scope="col">Brain mass or outside bits</th></tr></thead><tbody>' + Hm.map(h =>
      '<tr><td>' + esc(h[0]) + '</td><td class="n">' + yearsAgo(h[1]) + '</td><td class="n">' + h[2].toLocaleString('en-US') + ' g</td></tr>').join('') +
      E.map(e => '<tr><td>' + esc(X.titleOf(X.IDX[e.id])) + '</td><td class="n">' + yearsAgo(e.t) + '</td><td class="n">' + X.sci(e.mexo) + ' bits</td></tr>').join('') + '</tbody>';
    return {
      say: 'Hominin brain size plateaued around 1,500 grams while external cultural memory climbed 18 orders of magnitude.',
      sub: 'Top: brain mass of all 11 hominin taxa in cns_structural_evolution.csv. Bottom: external stored bits across the 68-moment census on a shared log-time axis.',
      aria: 'Brain size rises from ' + ardi[2] + ' g to ' + human[2].toLocaleString('en-US') + ' g and plateaus, while external memory climbs to ' + X.sci(now.mexo) + ' bits in 2026.',
      draw, timeKey: true,
      notes: [],
      src: 'cns_structural_evolution.csv (11 hominin rows) and the ' + X.N + '-moment census.',
      table
    };
  }

  /* ---------- paper 4 NEW fig 3: volumetric storage density ladder ---------- */
  function p4Density() {
    const M = D.media;
    const rows = [
      { name: 'Bulk inscribed clay tablets & carved stone', v: M.clay.density, cls: 'exo' },
      { name: 'Engraved Blombos ochre plaque (~75 ka)', v: 75, cls: 'exo' },
      { name: 'Printed rag-paper books (Gutenberg era)', v: M.rag.density, cls: 'exo' },
      { name: 'Magnetic archival tape (LTO Ultrium)', v: M.tape.density, cls: 'sil' },
      { name: 'Enterprise hard disk drives (HDD)', v: M.hdd.density, cls: 'sil' },
      { name: '3D NAND flash solid-state drives (SSD)', v: M.flash.density, cls: 'sil' },
      { gap: [M.clay.density, M.flash.density], label: times(M.flash.density / M.clay.density) + '× denser from clay to flash' },
      { name: 'Experimental synthetic DNA Fountain (Erlich & Zielinski 2017)', v: 2.32e18, cls: 'cold' },
      { name: 'Anhydrous duplex chromosomal B-DNA packing limit', v: M.dna ? M.dna.density : 2.4e21, hollow: true }
    ];
    rows.forEach(r => { if (!r.gap) r.val = X.sci(r.v) + ' bits/cm³'; });
    const table = '<thead><tr><th scope="col">Storage medium</th><th scope="col">Volumetric density (bits per cm³)</th></tr></thead><tbody>' +
      rows.filter(r => !r.gap).map(r => '<tr><td>' + esc(r.name) + '</td><td class="n">' + X.sci(r.v) + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'Deployed human storage media compressed information 15 orders of magnitude from clay tablets (0.23 bits/cm³) to 3D NAND flash (1.8×10¹⁴ bits/cm³) — and 19 orders to synthetic DNA.',
      sub: 'Bits packed into one cubic centimetre of physical volume, from incised stone and clay up to 200-layer flash dies, DNA Fountain droplets and chromosomal B-DNA.',
      aria: 'Volumetric density ladder from 0.23 bits per cm³ in clay tablets to 8,000 in rag paper, 1.8×10¹⁴ in flash SSDs, 2.32×10¹⁸ in experimental DNA Fountain and 2.4×10²¹ in chromosomal DNA.',
      draw: W => dotRows(W, { lo: -1, hi: 22, rows, step: 3, stepNarrow: 4 }),
      notes: [],
      src: 'paper0_memory_persistence_ledger.csv and Erlich & Zielinski (2017, 215 PB/g at 1.35 g/cm³).',
      table
    };
  }

  /* ---------- paper 5: the group-size ladder ---------- */
  const STAGE = [
    ['Hunter-Gatherer', 'Forager bands and clans', 'Speech, fireside stories, ochre and beads'],
    ['Neolithic', 'First farming villages', 'Speech, clay counting tokens, shrines'],
    ['Chiefdom', 'Chiefdoms', 'Stamp seals and tally tokens'],
    ['City-State', 'First cities and states', 'Writing on clay tablets and papyrus'],
    ['Empire', 'Empires such as Rome and Han China', 'Roads and relay riders, coins, paper archives'],
    ['Industrial', 'Industrial nations', 'Telegraph cables, railways, daily newspapers'],
    ['Multilateral', 'Worldwide institutions', 'Satellites, radio and TV, mainframe computers'],
    ['8.1-Billion', 'Today’s planet-wide civilization', 'Optical fibre, satellites, phones, the internet']
  ];
  function p5Ladder() {
    const G = D.groups.map(g => { const s = STAGE.find(s => g.name.indexOf(s[0]) >= 0) || [g.name, g.name, g.channel]; return Object.assign({ plain: s[1], store: s[2] }, g); });
    const draw = W => {
      const VR = 120, PW = W - VR, x = v => lg(v) / 10 * PW; let g = '', y = 26;
      const tks = W < 480 ? [[0, '1'], [4, '10,000'], [8, '100 million']] : [[0, '1'], [2, '100'], [4, '10,000'], [6, '1 million'], [8, '100 million'], [10, '10 billion']];
      G.forEach(r => {
        const nl = wrap(r.plain, W, 6.6), sl = wrap(yearsAgo(r.t).replace(/^today$/, 'Today') + ' · ' + r.store, W, 6.2), dy = (nl.length + sl.length - 2) * 16;
        g += TL('t', 0, y + 13, nl) + TL('s', 0, y + 30 + (nl.length - 1) * 16, sl);
        g += '<rect class="grp" x="0" y="' + (y + 38 + dy) + '" width="' + f1(x(r.size)) + '" height="14" rx="2"/>' + T('s', x(r.size) + 8, y + 50 + dy, words(r.size) + ' people');
        y += 66 + dy;
      });
      let a = '';
      tks.forEach(([p, lbl]) => { const xx = p / 10 * PW; a += L('grid', xx, 18, xx, y - 8) + T('tk', xx, 12, lbl, p === 0 ? 'start' : 'middle'); });
      return { h: y - 6, svg: a + g };
    };
    const first = G[0], last = G[G.length - 1];
    const table = '<thead><tr><th scope="col">Stage</th><th scope="col">When</th><th scope="col">Group size</th><th scope="col">Coordination &amp; memory channel</th><th scope="col">Total bio + outside memory (bits)</th></tr></thead><tbody>' + G.map(r =>
      '<tr><td>' + esc(r.plain) + '</td><td class="n">' + yearsAgo(r.t) + '</td><td class="n">' + words(r.size) + '</td><td>' + esc(r.store) + '</td><td class="n">' + X.sci(r.memory) + '</td></tr>').join('') + '</tbody>';
    return {
      say: 'Every tenfold jump in human polity size required roughly a 127-fold (population²·¹⁰) expansion in durable external memory.',
      sub: 'Eight stages of human society from 150-person bands (L = 1) to 8.1 billion people across 10–11 nested coordination tiers (150 × 7^(L−1)).',
      aria: 'Group sizes from ' + words(first.size) + ' people in forager clans to ' + words(last.size) + ' today, paired with each stage’s communication and external storage medium.',
      draw,
      notes: [
        'Regressing external cultural storage on polity population across the 8 stages gives slope 2.10 ± 0.28 (R² = 0.901, ~127× external storage per 10× population), whereas pooling biological brain memory + outside storage gives slope 0.920 (R² = 0.990).'
      ],
      src: 'collective_organization_evolution.csv and outside_memory_by_moment.csv.',
      table
    };
  }

  /* ---------- paper 5: whisper chain (a model) ---------- */
  function p5Whisper() {
    const KEEP = 0.8, N = 8, hops = Array.from({ length: N + 1 }, (_, n) => n), share = n => Math.pow(KEEP, n), six = share(6);
    const draw = W => {
      const Lm = 40, R = W < 480 ? 16 : 24, top = 16, h = 200, PW = W - Lm - R, x = n => Lm + n / N * PW, y = v => top + (1 - v) * h;
      let g = '';
      [0, 0.25, 0.5, 0.75, 1].forEach(v => { g += L('grid', Lm, y(v), W - R, y(v)) + T('tk', Lm - 6, y(v) + 4, Math.round(v * 100) + '%', 'end'); });
      hops.forEach(n => { g += T('tk', x(n), top + h + 16, n, 'middle'); });
      g += T('tk', Lm + PW / 2, top + h + 34, 'Number of retellings', 'middle');
      g += L('ax', Lm, top + h, W - R, top + h);
      g += '<path class="flat" d="M' + f1(x(0)) + ' ' + f1(y(1)) + ' H' + f1(x(N)) + '"/>' + T('s', x(N), y(1) - 8, 'Written record read back directly', 'end');
      g += '<path class="say" d="' + hops.map(n => (n ? 'L' : 'M') + f1(x(n)) + ' ' + f1(y(share(n)))).join(' ') + '"/>';
      hops.forEach(n => { g += '<circle class="' + (n === 6 ? 'hl' : 'cpu') + '" cx="' + f1(x(n)) + '" cy="' + f1(y(share(n))) + '" r="' + (n === 6 ? 6 : 4) + '"/>'; });
      g += W < 480 ? T('t', x(6), y(six) + 26, Math.round(six * 100) + '% left after 6', 'middle') : T('t', x(6) + 10, y(six) - 10, Math.round(six * 100) + '% left after 6');
      g += T('s', x(0) + 8, y(0.42), 'Unchecked word-of-mouth relay (0.8ⁿ)');
      return { h: top + h + 42, svg: g };
    };
    const table = '<thead><tr><th scope="col">Retellings</th><th scope="col">Surviving fidelity (illustrative model)</th></tr></thead><tbody>' + hops.map(n => '<tr><td class="n">' + n + '</td><td class="n">' + sig(share(n) * 100, 3) + '%</td></tr>').join('') + '</tbody>';
    return {
      say: 'Pass an unchecked spoken message across six serial hops at 20% loss per hop and 74% of it is lost.',
      sub: 'Illustrative serial-reproduction bound (0.8ⁿ) showing why multi-tier hierarchies beyond Dunbar’s ~148-person face-to-face limit require external tokens, tallies and writing.',
      aria: 'Model curve showing surviving message fidelity dropping as 0.8 to the power n down to 26% after 6 hops.',
      draw,
      notes: [],
      src: 'illustrative communication-channel model in Section 2.4.',
      table
    };
  }

  /* ---------- paper 5 NEW fig 3: insect superorganisms & swarms vs single mammal brains ---------- */
  function p5Superorganisms() {
    const O = D.allOrgs || [], C = D.cns || {};
    const pickO = re => O.find(r => re.test(r.name));
    const bee = pickO(/Honeybee/i), term = pickO(/Termite/i), leaf = pickO(/Leafcutter/i), star = pickO(/Starling/i), herr = pickO(/Herring/i), wild = pickO(/Wildebeest/i);
    const rows = [
      { name: 'Single dog brain (reference mammal)', v: C.dog ? C.dog.total_neurons : 2.25e9, hollow: true },
      { name: 'Single rhesus macaque brain (reference primate)', v: C.macaque ? C.macaque.total_neurons : 6.37e9, hollow: true },
      { name: 'Honeybee hive (50,000 workers)', v: bee ? bee.neurons : 4.8e10, cls: 'grp' },
      { name: 'Single human brain (reference)', v: C.human ? C.human.total_neurons : 8.6e10, hollow: true },
      { name: 'Cathedral termite mound (2 million workers)', v: term ? term.neurons : 5.0e11, cls: 'grp' },
      { name: 'Mature leafcutter ant colony (8 million workers)', v: leaf ? leaf.neurons : 2.0e12, cls: 'grp' },
      { gap: [C.human ? C.human.total_neurons : 8.6e10, leaf ? leaf.neurons : 2.0e12], label: '23.3× a human brain (2,630× a cat)' },
      { name: 'Starling murmuration (100,000 birds, k ≈ 7 neighbours)', v: star ? star.neurons : 1.9e13, cls: 'nerve' },
      { name: 'Atlantic herring school (100 million fish)', v: herr ? herr.neurons : 1.0e14, cls: 'nerve' },
      { name: 'Serengeti wildebeest migration (1.5 million animals)', v: wild ? wild.neurons : 3.75e15, cls: 'nerve' }
    ];
    rows.forEach(r => { if (!r.gap) r.val = words(r.v) + ' neurons'; });
    const table = '<thead><tr><th scope="col">Collective or single brain</th><th scope="col">Total neurons</th><th scope="col">Multiple of one human brain</th></tr></thead><tbody>' +
      rows.filter(r => !r.gap).map(r => '<tr><td>' + esc(r.name) + '</td><td class="n">' + X.sci(r.v) + '</td><td class="n">' + sig(r.v / 8.6e10, 3) + '×</td></tr>').join('') + '</tbody>';
    return {
      say: 'A single mature leafcutter ant colony pools 2 trillion neurons — 23 times a human brain and 2,630 times a cat brain.',
      sub: 'Total neurons across eusocial insect colonies (purple), egalitarian vertebrate swarms (pink) and single reference mammal brains (hollow rings) on a shared logarithmic axis.',
      aria: 'Collective neuron counts from a honeybee hive (48 billion) and termite mound (500 billion) to a leafcutter colony (2 trillion, 23.3× human) and vertebrate swarms up to 3.75 quadrillion.',
      draw: W => dotRows(W, { lo: 9, hi: 16, rows, step: 2, stepNarrow: 2 }),
      notes: [],
      src: 'collective_organization_evolution.csv and cns_structural_evolution.csv.',
      table
    };
  }

  const FIGS = {
    1: [p1Ladder, p1Metre, p1SpaceTime],
    2: [p2Parts, p2Density, p2Grades],
    3: [p3Waiting, p3Energy, p3LogOdds],
    4: [p4Mirror, p4Library, p4Density],
    5: [p5Ladder, p5Superorganisms, p5Whisper]
  };
  const INTRO = {
    1: 'Three live figures drawn directly from the 33-substrate hardware benchmark table across 14.8 orders of latency and 14.2 orders of energy efficiency.',
    2: 'Three live figures drawn directly from the 54-species central-nervous-system evolution table.',
    3: 'Three live figures drawn directly from the 17-benchmark deliberation speed-accuracy-energy ledger.',
    4: 'Three live figures drawn directly from the memory persistence ledger, hominin table and 68-moment census.',
    5: 'Two empirical figures drawn directly from the 22-milestone collective organization ledger, plus the illustrative serial-relay model.'
  };
  let built = [], ro = null;

  X.paperFigureSection = function (id) {
    if (!FIGS[id] || !D.hw) return '<section><h2>Figures</h2><p class="muted">The figures for this paper could not be loaded.</p></section>';
    built = FIGS[id].map(fn => fn());
    return '<section><h2>Figures</h2><p class="muted">' + esc(INTRO[id]) + '</p>' + built.map((f, i) =>
      '<figure class="frame pfx"><p class="fig-say">' + esc(f.say) + '</p><p class="fig-sub">' + esc(f.sub) + '</p>' +
      '<div class="pfw"><svg class="pf" id="pfx' + i + '" role="img" aria-label="' + esc(f.aria) + '"></svg></div>' +
      (f.timeKey ? '<p class="time-key" data-time-key></p>' : '') +
      (f.notes.length ? '<div class="fig-note"><b>Calibration &amp; scope notes</b><ul>' + f.notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul></div>' : '') +
      '<p class="fig-src">Data: ' + esc(f.src) + '</p>' +
      '<details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw" tabindex="0" role="region" aria-label="' + esc(f.say) + ' data table"><table class="pfx-tbl">' + f.table + '</table></div></details></figure>').join('') + '</section>';
  };

  X.paperFigures = function () {
    if (ro) { ro.disconnect(); ro = null; }
    const draw = (svg, f) => {
      const W = Math.floor(svg.parentNode.clientWidth); if (!W || svg._w === W) return;
      svg._w = W; const out = f.draw(W);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Math.ceil(out.h)); svg.setAttribute('width', W); svg.setAttribute('height', Math.ceil(out.h));
      svg.innerHTML = out.svg;
    };
    built.forEach((f, i) => { const svg = document.getElementById('pfx' + i); if (svg) draw(svg, f); });
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => built.forEach((f, i) => { const svg = document.getElementById('pfx' + i); if (svg) draw(svg, f); }));
      document.querySelectorAll('.pfx .pfw').forEach(el => ro.observe(el));
    }
    if (X.timeKeys) X.timeKeys();
  };
})();
