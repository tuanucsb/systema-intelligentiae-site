// Figures for Papers 1 to 5 on research.html, drawn from the rows build.py copies out of data/ (assets/paperdata.js).
// X.paperFigureSection(id) returns the Figures section's HTML; X.paperFigures(id) draws it. Every SVG is drawn at its
// own pixel width (and redrawn when that changes), so labels keep their size on phones.
(function () {
  'use strict';
  const X = window.SIX, esc = X.esc, D = window.SI_PAPERDATA || {};
  const f1 = n => (Math.round(n * 10) / 10).toFixed(1);
  const sig = (n, d) => +n.toPrecision(d || 2);
  const lg = Math.log10;
  // plain words for big counts: 257 billion, 71 million, 3,000
  const words = n => n >= 1e9 ? sig(n / 1e9, 3).toLocaleString('en-US') + ' billion' : n >= 1e6 ? sig(n / 1e6, 3).toLocaleString('en-US') + ' million' : sig(n, 3).toLocaleString('en-US');
  const times = r => r >= 1e6 ? X.sci(r) : sig(r, 2).toLocaleString('en-US');
  const pct = (a, b) => { const v = a / b * 100; return (v >= 10 ? sig(v, 3) : v >= 1 ? sig(v, 2) : v >= 0.1 ? sig(v, 1) : sig(v, 1)) + '%'; };
  const T = (cls, x, y, s, anchor) => '<text class="' + cls + '" x="' + f1(x) + '" y="' + f1(y) + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>';
  const L = (cls, x1, y1, x2, y2) => '<line class="' + cls + '" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '"/>';
  // text width in pixels, measured with the page's body font (13 px; px > 6.5 means bold)
  const ctx = document.createElement('canvas').getContext('2d'), bodyFont = getComputedStyle(document.body).fontFamily;
  const tw = (s, px) => { ctx.font = ((px || 6.7) > 6.5 ? '700 13px ' : '12.5px ') + bodyFont; return ctx.measureText(String(s)).width; };
  // split a label into lines that fit maxW pixels (about 6.4 px a character at 13 px)
  const wrap = (s, maxW, px) => { const out = []; let cur = ''; String(s).split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && tw(t, px || 6.6) > maxW) { out.push(cur); cur = w; } else cur = t; }); if (cur) out.push(cur); return out; };
  const TL = (cls, x, y, lines, lh, anchor) => lines.map((l, i) => T(cls, x, y + i * (lh || 16), l, anchor)).join('');
  const yearsAgo = t => { const y = Math.round(t * 1e6); return y === 0 ? 'today' : y >= 1e6 ? sig(y / 1e6, 3) + ' million years ago' : y.toLocaleString('en-US') + ' years ago'; };

  /* ---------- shared chart: one dot per row on a log axis ---------- */
  // rows: {name, v, cls, val, hollow} or {gap:[a,b], label}; lo/hi are powers of ten
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
      const lines = wrap(r.name, x1 - x0), cx = x(r.v), cy =y + 30 + (lines.length - 1) * 16;
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
      { name: 'AI chip waiting on its memory (Nvidia H100)', v: e('dram'), cls: 'sil', key: 'dram' },
      { name: 'Top AI chip doing maths (Nvidia H100)', v: e('h100'), cls: 'sil', key: 'h100' },
      { name: 'Laptop AI engine (Apple M4)', v: e('m4'), cls: 'sil', key: 'm4' },
      { name: 'One synapse in the brain’s cortex', v: e('synapse'), cls: 'nerve', key: 'synapse' },
      { gap: [e('h100'), e('synapse')], label: times(gapH100) + '× more than the H100' },
      { gap: [e('dram'), e('synapse')], label: times(gapDram) + '× more than a memory fetch' },
      { name: 'Superconducting chip, counting its cooling', v: e('aqfp_wall'), cls: 'cold', key: 'aqfp_wall' },
      { name: 'Superconducting chip alone, at −269 °C', v: e('aqfp_core'), cls: 'cold', key: 'aqfp_core' },
      { name: 'Physical limit at room temperature (calculated)', v: limit, hollow: true }
    ];
    rows.forEach(r => { if (!r.gap) r.val = X.sci(r.v); });
    const table = '<tr><th>System</th><th>Operations per joule</th><th>What one operation is</th></tr>' + rows.filter(r => !r.gap).map(r =>
      '<tr><td>' + esc(r.name) + '</td><td class="n">' + X.sci(r.v) + '</td><td>' + esc(r.key ? H[r.key].op_definition : 'Erasing one bit: k·T·ln 2 at 300 K') + '</td></tr>').join('');
    return {
      say: 'A brain synapse does about ' + Math.round(gapH100) + ' times more work per joule than a top AI chip, not 100,000 times.',
      sub: 'Each row is one system; the dot shows how many operations it gets from one joule of energy. Each step along the axis is ten times more. Pink: a synapse. Blue: everyday chips. Dark: superconducting lab chips. A synapse event and a chip’s 16-bit multiply are different kinds of operation.',
      aria: 'Operations per joule: an AI chip fetching memory ' + X.sci(e('dram')) + ', the H100 ' + X.sci(e('h100')) + ', the Apple M4 ' + X.sci(e('m4')) + ', a synapse ' + X.sci(e('synapse')) + ', about ' + Math.round(gapH100) + ' times the H100; superconducting logic higher still, below the physical limit.',
      draw: W => dotRows(W, { lo: 9, hi: 21, rows, step: 2, stepNarrow: 3 }),
      notes: [
        'The paper says the famous 100,000-fold gap comes from comparing a synapse with a memory fetch. With the data file’s numbers that comparison gives ' + times(gapDram) + '.',
        'The paper’s Table 1 gives the Apple M4 1.52×10¹³ operations per joule; the data file gives ' + X.sci(e('m4')) + '. This figure uses the data file.',
        'The paper calls the H100 the best room-temperature chip. In the data file the M4 (' + X.sci(e('m4')) + ') and the B200 (' + X.sci(e('b200')) + ') both do more per joule.'
      ],
      src: 'the project’s hardware benchmark table (33 brains, chips and lab devices). The physical limit is calculated from Landauer’s formula, k·T·ln 2 at 300 kelvin.',
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
    const table = '<tr><th>Signal</th><th>Speed (metres a second)</th><th>Time to cross one metre</th></tr>' + rows.map(r =>
      '<tr><td>' + esc(r.name) + '</td><td class="n">' + X.sci(v(r.key)) + '</td><td class="n">' + fmt(r.v) + '</td></tr>').join('');
    return {
      say: 'Across one metre, the fastest nerve in the table takes ' + sig(t('whale') * 1e3, 2) + ' thousandths of a second; light in a fibre takes ' + sig(t('fibre') * 1e9, 2) + ' billionths.',
      sub: 'How long each signal would take to cover one metre at the speed the table lists for it. Each step along the axis is ten times longer: s is a second, ms a thousandth, µs a millionth and ns a billionth of a second. Signals that spread by diffusion are left out, because diffusion slows with the square of the distance.',
      aria: 'Time to cross one metre: a calcium wave ' + fmt(t('dendrite')) + ', a squid nerve ' + fmt(t('squid')) + ', an insulated whale nerve ' + fmt(t('whale')) + ', copper on a chip ' + fmt(t('h100')) + ', light in fibre ' + fmt(t('fibre')) + '.',
      draw: W => dotRows(W, { lo: -9, hi: 1, rows, step: 3, stepNarrow: 3, tick }),
      notes: [],
      src: 'the project’s hardware benchmark table (signal speeds for each system).',
      table
    };
  }

  /* ---------- paper 2: where the neurons are (100% bars) ---------- */
  function p2Parts() {
    const C = D.cns, keys = ['dolphin', 'raven', 'mouse', 'human', 'elephant'];
    const name = { dolphin: 'Bottlenose dolphin', raven: 'Raven', mouse: 'House mouse', human: 'Human', elephant: 'African elephant' };
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
    const table = '<tr><th>Animal</th><th>All neurons</th><th>Cortex or pallium</th><th>Cerebellum</th><th>Rest of brain</th></tr>' + rows.map(r =>
      '<tr><td>' + esc(name[r.k]) + '</td><td class="n">' + words(r.c.total_neurons) + '</td><td class="n">' + words(r.c.cortex_pallium_neurons) + ' (' + pct(r.cx, 1) + ')</td><td class="n">' + words(r.c.cerebellum_neurons) + ' (' + pct(r.cb, 1) + ')</td><td class="n">' + words(r.c.brainstem_rest_neurons) + ' (' + pct(r.rest, 1) + ')</td></tr>').join('');
    return {
      say: 'An elephant keeps ' + pct(el.cb, 1) + ' of its ' + words(el.c.total_neurons) + ' neurons in its cerebellum.',
      sub: 'Each bar is one animal’s neurons, split by brain part, adding up to 100%. Pink: the cerebellum, at the back of the brain, which times and steadies movement. Dark grey: the cortex (in birds, the pallium), where most thinking happens. Light grey: the rest.',
      aria: 'Share of neurons in the cerebellum: dolphin ' + pct(dol.cb, 1) + ', raven ' + pct(rows[1].cb, 1) + ', mouse ' + pct(rows[2].cb, 1) + ', human ' + pct(rows[3].cb, 1) + ', elephant ' + pct(el.cb, 1) + '.',
      draw,
      notes: [
        'The paper calls a 70 to 80% share in the cerebellum a feature of all mammals. In the data file the dolphin has ' + pct(dol.cb, 1) + '.',
        'The paper says the elephant’s cortex has fewer neurons than a rhesus macaque’s. The data file gives the elephant ' + words(C.elephant.cortex_pallium_neurons) + ' cortical neurons and the macaque ' + words(C.macaque.cortex_pallium_neurons) + '.'
      ],
      src: 'the project’s brain-structure table (neuron counts by brain part for 54 animals).',
      table
    };
  }

  /* ---------- paper 2: packed tighter ---------- */
  function p2Density() {
    const C = D.cns, d = k => C[k].cortex_pallium_neurons / C[k].cortex_pallium_mass_g;
    const name = { parrot: 'African grey parrot', crow: 'New Caledonian crow', raven: 'Raven', human: 'Human', dog: 'Dog', pig: 'Pig', orca: 'Killer whale', elephant: 'African elephant' };
    const groups = [['Birds', ['parrot', 'crow', 'raven']], ['Mammals', ['human', 'dog', 'pig', 'orca', 'elephant']]];
    const all = groups.flatMap(g => g[1]), max = Math.max.apply(null, all.map(d));
    const brain = k => { const g = C[k].total_brain_mass_g; return g >= 1000 ? sig(g / 1000, 2) + ' kg brain' : sig(g, 3) + ' g brain'; };
    const birdsMax = Math.max.apply(null, groups[0][1].map(k => C[k].total_brain_mass_g)), mamMin = Math.min.apply(null, groups[1][1].map(k => C[k].total_brain_mass_g));
    const draw = W => {
      const VR = 84, PW = W - VR; let g = '', y = 0;
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
    const table = '<tr><th>Animal</th><th>Whole brain</th><th>Cortex or pallium</th><th>Its neurons</th><th>Neurons per gram</th></tr>' + all.map(k =>
      '<tr><td>' + esc(name[k]) + '</td><td class="n">' + sig(C[k].total_brain_mass_g, 3).toLocaleString('en-US') + ' g</td><td class="n">' + sig(C[k].cortex_pallium_mass_g, 3).toLocaleString('en-US') + ' g</td><td class="n">' + words(C[k].cortex_pallium_neurons) + '</td><td class="n">' + words(d(k)) + '</td></tr>').join('');
    const pig = C.pig, raven = C.raven;
    return {
      say: 'Gram for gram, a raven’s forebrain holds about ' + Math.round(d('raven') / d('human')) + ' times as many neurons as a human’s.',
      sub: 'Neurons in one gram of the brain’s thinking layer: the cortex in mammals, the pallium in birds. Bars start at zero and share one scale. The birds’ whole brains weigh ' + sig(birdsMax, 3) + ' g or less; the mammals’ weigh ' + sig(mamMin, 3) + ' g to ' + sig(C.elephant.total_brain_mass_g / 1000, 2) + ' kg.',
      aria: 'Neurons per gram of cortex or pallium: raven ' + words(d('raven')) + ', parrot ' + words(d('parrot')) + ', human ' + words(d('human')) + ', killer whale ' + words(d('orca')) + '.',
      draw,
      notes: [
        'The paper gives the raven 235 million neurons per gram of pallium; the data file gives ' + words(d('raven')) + '. This figure uses the data file.',
        'The paper gives the pig a 125 g brain with 1.05 billion neurons; the data file gives ' + sig(pig.total_brain_mass_g, 3) + ' g and ' + words(pig.total_neurons) + '. This figure uses the data file, so a raven has ' + sig(raven.total_neurons / pig.total_neurons, 2) + ' times a pig’s neurons, not more than double.'
      ],
      src: 'the project’s brain-structure table (brain masses and neuron counts for 54 animals).',
      table
    };
  }

  /* ---------- paper 4: more, but shorter (mirrored bars) ---------- */
  function p4Mirror() {
    const M = D.media, keys = ['clay', 'rag', 'pulp', 'tape', 'hdd', 'flash'];
    const name = { clay: 'Clay tablets and carved stone', rag: 'Rag-paper books', pulp: 'Cheap wood-pulp paper', tape: 'Magnetic tape', hdd: 'Hard disks', flash: 'Flash drives and SSDs' };
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
    const table = '<tr><th>Medium</th><th>Bits stored worldwide, 2026</th><th>Years it lasts with no upkeep</th><th>Bits per cm³</th></tr>' + keys.map(k =>
      '<tr><td>' + esc(name[k]) + '</td><td class="n">' + X.sci(M[k].bits) + '</td><td class="n">' + sig(M[k].life, 3).toLocaleString('en-US') + '</td><td class="n">' + X.sci(M[k].density) + '</td></tr>').join('');
    return {
      say: 'Each newer medium stores far more, and forgets sooner.',
      sub: 'Media in the order people started using them, oldest at the top. Left: how many bits of each are kept worldwide today; each step is ten times more, starting at a billion. Right: how many years the contents last if nobody copies or cares for them; each step is ten times longer, starting at one year. From clay to flash, the amount stored is ' + times(last.bits / first.bits) + ' times larger and the lifetime ' + times(first.life / last.life) + ' times shorter.',
      aria: 'Clay and stone: ' + X.sci(first.bits) + ' bits lasting ' + first.life.toLocaleString('en-US') + ' years. Flash drives: ' + X.sci(last.bits) + ' bits lasting ' + last.life + ' years. Paper, tape and disks fall between.',
      draw,
      notes: [
        'The paper says today’s digital store must be recopied every 15 years. The memory ledger’s average for tape, disks and flash, weighted by how much each holds, is ' + sig(M.total.life, 2) + ' years, which gives ' + sig(M.total.bit_years / 1e23, 3) + '×10²³ bit-years rather than the paper’s 1.8×10²⁴. This figure uses the ledger.',
        'The paper puts clay at about 100 bits per cubic centimetre and printed paper at about 100,000; the ledger gives ' + sig(M.clay.density, 2) + ' and ' + sig(M.rag.density, 2).toLocaleString('en-US') + ' (rag paper). Density is not drawn here; it is in the table.'
      ],
      src: 'the project’s memory-media ledger (how much each medium holds today and how long it lasts).',
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
      // brains
      g += '<path class="flat" d="M' + f1(x(human[1])) + ' ' + f1(y1(human[2])) + ' H' + f1(x(0)) + '"/>';
      Hm.forEach(h => { g += '<circle class="nerve" cx="' + f1(x(h[1])) + '" cy="' + f1(y1(h[2])) + '" r="4.5"/>'; });
      g += T('s', x(ardi[1]) - 4, y1(ardi[2]) + 20, 'Ardi, ' + ardi[2] + ' g, ' + yearsAgo(ardi[1]).replace(' years ago', '').replace(' million', ' Ma'));
      g += T('s', x(0), y1(human[2]) - 9, 'Modern humans, ' + human[2].toLocaleString('en-US') + ' g', 'end');
      // memory
      g += '<path class="exoline" d="' + E.map((e, i) => (i ? 'L' : 'M') + f1(x(e.t)) + ' ' + f1(y2(e.mexo))).join(' ') + '"/>';
      E.forEach(e => { g += '<circle class="exo" cx="' + f1(x(e.t)) + '" cy="' + f1(y2(e.mexo)) + '" r="3"/>'; });
      g += T('s', x(0) - 4, y2(now.mexo) - 12, 'Today: ' + X.sci(now.mexo) + ' bits', 'end');
      return { h: t2 + h2 + 24, svg: g };
    };
    const at = E.filter(e => e.t >= human[1]).pop() || E[0];
    const table = '<tr><th>Human ancestor</th><th>When (data file)</th><th>Brain mass</th></tr>' + Hm.map(h =>
      '<tr><td>' + esc(h[0]) + '</td><td class="n">' + yearsAgo(h[1]) + '</td><td class="n">' + h[2].toLocaleString('en-US') + ' g</td></tr>').join('') +
      '<tr><th>Moment</th><th>When</th><th>Bits outside bodies</th></tr>' + E.map(e => '<tr><td>' + esc(X.titleOf(X.IDX[e.id])) + '</td><td class="n">' + yearsAgo(e.t) + '</td><td class="n">' + X.sci(e.mexo) + '</td></tr>').join('');
    return {
      say: 'The brain stopped growing; the library did not.',
      sub: 'Top: brain size of fossil human relatives, one dot each. Bottom: bits of information kept outside living bodies, from stone tools to data centres. Time runs left to right on a squeezed scale: each step to the right is ten times closer to today, so the stretch from 1,000 to 100 years ago gets as much room as the stretch from 1 million to 100,000 years ago. Brain size stops rising about ' + yearsAgo(human[1]) + '. Outside memory held ' + X.sci(at.mexo) + ' bits ' + yearsAgo(at.t) + ' and holds ' + X.sci(now.mexo) + ' today.',
      aria: 'Brain size rises from ' + ardi[2] + ' grams ' + yearsAgo(ardi[1]) + ' to ' + human[2].toLocaleString('en-US') + ' grams ' + yearsAgo(human[1]) + ' and then stays flat, while bits stored outside bodies rise from ' + X.sci(E[0].mexo) + ' to ' + X.sci(now.mexo) + ' today.',
      draw, timeKey: true,
      notes: [
        'The paper dates Homo erectus to 1.0 million years ago and Neanderthals to 60,000 years ago; the data file gives ' + yearsAgo(Hm.find(h => /erectus/.test(h[0]))[1]).replace(' years ago', '') + ' and ' + yearsAgo(Hm.find(h => /Neanderthal/.test(h[0]))[1]) + '. Six dates differ in all; this figure uses the data file.',
        'The paper’s table lists 14 human relatives; ' + Hm.length + ' of them are in the data file, and only those are drawn. Its dates and body masses differ for several; the brain sizes match.'
      ],
      src: 'the project’s brain-structure table (fossil brain sizes) and the ' + X.N + '-moment census of Earth (memory kept outside bodies).',
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
    const table = '<tr><th>Stage</th><th>When</th><th>Group size</th><th>How information was kept or sent</th><th>Shared memory (bits)</th></tr>' + G.map(r =>
      '<tr><td>' + esc(r.plain) + '</td><td class="n">' + yearsAgo(r.t) + '</td><td class="n">' + words(r.size) + '</td><td>' + esc(r.store) + '</td><td class="n">' + X.sci(r.memory) + '</td></tr>').join('');
    return {
      say: 'Every jump in group size came with a new way to keep or send information.',
      sub: 'Eight stages of human society, oldest at the top. The bar is the size of a group that acts together; each step along the axis is ten times more people. Under each name: what the group used to store or pass on information. From ' + words(first.size) + ' people to ' + words(last.size) + ' is ' + times(last.size / first.size) + ' times more.',
      aria: 'Group sizes from ' + words(first.size) + ' people in forager clans to ' + words(last.size) + ' today, each stage paired with its way of storing information, from speech to writing to the internet.',
      draw,
      notes: [
        'The paper’s table gives forager bands 25 to 150 people; the data file says ' + esc(first.range.split(' - ').slice(0, 2).join(' to ').replace(/\s*\([^)]*\)/g, '')) + '. This figure uses the data file.',
        'The paper’s table puts shared memory in 2026 at 8×10²³ bits; the data file gives ' + X.sci(last.memory) + '. The table under the figure uses the data file.',
        'The ways of storing information are the data file’s own descriptions, shortened into plain words.'
      ],
      src: 'the project’s table of collective organization (22 kinds of group, from bacterial films to today).',
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
      g += '<path class="flat" d="M' + f1(x(0)) + ' ' + f1(y(1)) + ' H' + f1(x(N)) + '"/>' + T('s', x(N), y(1) - 8, 'Written down and read again', 'end');
      g += '<path class="say" d="' + hops.map(n => (n ? 'L' : 'M') + f1(x(n)) + ' ' + f1(y(share(n)))).join(' ') + '"/>';
      hops.forEach(n => { g += '<circle class="' + (n === 6 ? 'hl' : 'cpu') + '" cx="' + f1(x(n)) + '" cy="' + f1(y(share(n))) + '" r="' + (n === 6 ? 6 : 4) + '"/>'; });
      g += W < 480 ? T('t', x(6), y(six) + 26, Math.round(six * 100) + '% left after 6', 'middle') : T('t', x(6) + 10, y(six) - 10, Math.round(six * 100) + '% left after 6');
      g += T('s', x(0) + 8, y(0.42), 'Passed on by word of mouth');
      return { h: top + h + 42, svg: g };
    };
    const table = '<tr><th>Retellings</th><th>Share of the message still right (model)</th></tr>' + hops.map(n => '<tr><td class="n">' + n + '</td><td class="n">' + sig(share(n) * 100, 3) + '%</td></tr>').join('');
    return {
      say: 'Pass a message through six people and about ' + Math.round((1 - six) * 100) + '% of it is lost.',
      sub: 'A model, not a measurement. The paper assumes each retelling keeps ' + Math.round(KEEP * 100) + '% of what it was told, so after n retellings ' + KEEP + ' to the power n is left. The flat line is a written record, which the model treats as read back unchanged; real copying makes small errors too.',
      aria: 'In the paper’s model a spoken message keeps 80% at each retelling, so after six retellings ' + Math.round(six * 100) + '% is left, while a written record stays at 100%.',
      draw,
      notes: [],
      src: 'none; this is the paper’s own formula (share kept = 0.8 to the power of the number of retellings), drawn as stated.',
      table
    };
  }

  const FIGS = { 1: [p1Ladder, p1Metre], 2: [p2Parts, p2Density], 4: [p4Mirror, p4Library], 5: [p5Ladder, p5Whisper] };
  const INTRO = {
    1: 'Each figure is drawn from the project’s data, not from the manuscript’s tables. Where the two disagree, the figure follows the data and says so underneath.',
    2: 'Each figure is drawn from the project’s brain-structure table. Where the manuscript gives different numbers, the figure follows the data and says so underneath.',
    4: 'Each figure is drawn from the project’s data. Where the manuscript gives different numbers, the figure follows the data and says so underneath.',
    5: 'The first figure is drawn from the project’s data; the second draws the paper’s own formula and is labelled as a model.'
  };
  let built = [], ro = null;

  X.paperFigureSection = function (id) {
    if (id === 3) return '<section><h2>Figures</h2><p class="muted">No figures yet, because there is no data table to draw them from. The paper’s curves need, for each system (the rat, the crow, the bee swarm, people and the AI reasoning runs), how long it deliberated, how much energy it used and how often it was right. The project’s hardware table has 33 systems but no column for how often each one is right, and two of the paper’s three figures plot formulas typed into a script rather than measurements. The first figure to draw once that table exists: “Waiting makes you right”, accuracy before and after a pause for the rat, the crow and the bees.</p></section>';
    if (!FIGS[id] || !D.hw) return '<section><h2>Figures</h2><p class="muted">The figures for this paper could not be loaded.</p></section>';
    built = FIGS[id].map(fn => fn());
    return '<section><h2>Figures</h2><p class="muted">' + esc(INTRO[id]) + '</p>' + built.map((f, i) =>
      '<figure class="frame pfx"><p class="fig-say">' + esc(f.say) + '</p><p class="fig-sub">' + esc(f.sub) + '</p>' +
      '<div class="pfw"><svg class="pf" id="pfx' + i + '" role="img" aria-label="' + esc(f.aria) + '"></svg></div>' +
      (f.timeKey ? '<p class="time-key" data-time-key></p>' : '') +
      (f.notes.length ? '<div class="fig-note"><b>Where the paper and the data differ</b><ul>' + f.notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul></div>' : '') +
      '<p class="fig-src">Data: ' + esc(f.src) + '</p>' +
      '<details class="fig-nums"><summary>Show the numbers</summary><div class="pfx-tw"><table class="pfx-tbl">' + f.table + '</table></div></details></figure>').join('') + '</section>';
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
