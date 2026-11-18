(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('how');
  const $ = id => document.getElementById(id);
  const esc = X.esc;
  const colors = ['io', 'store', 'ram', 'power', 'cpu', 'wire', 'backup', 'net'];

  $('myths').innerHTML = X.MYTHS.map((m, k) => '<article class="myth" id="' + m.id + '" style="--mc:var(--c-' + colors[k % colors.length] + ');--mo:var(--on-' + colors[k % colors.length] + ')">' +
    '<span class="n">Myth ' + (k + 1) + '</span><h3>' + esc(m.title) + '</h3>' +
    '<div class="vs"><div><span class="sub">The popular estimate</span><p class="bad">' + esc(m.myth) + '</p></div><div><span class="sub">What the evidence says</span><p class="good">' + esc(m.measured) + '</p></div></div>' +
    '<p>' + esc(m.why) + '</p>' +
    '<div class="links">' + m.epochs.map(id => { const i = X.IDX[id], st = X.STOP[id]; return '<a href="journey.html#' + id + '">See it at ' + X.fmtShort(X.E[i].t) + ' (' + esc(st ? st.who : X.titleOf(i)) + ') →</a>'; }).join('') + '</div>' +
    '<p class="src">Sources: ' + esc(m.sources) + '</p></article>').join('');

  $('levels').innerHTML = Object.keys(X.EPI).map(key => {
    const lv = X.EPI[key];
    const rows = X.E.filter(e => e.epi === key);
    const range = rows.length ? X.fmtShort(rows[0].t) + (rows.length > 1 ? ' → ' + X.fmtShort(rows[rows.length - 1].t) : '') + ' · ' + rows.length + (rows.length === 1 ? ' moment' : ' moments') : '';
    return '<div class="level"><span class="meter" aria-hidden="true">' + [1, 2, 3, 4].map(n => '<i class="' + (n <= lv.lvl ? 'on' : '') + '"></i>').join('') + '</span>' +
      '<h3>' + lv.label + '</h3><p>' + lv.about + '</p><span class="range">' + range + '</span><code class="x-only mono" style="font-size:12px;color:var(--ink-3)">' + esc(key) + '</code></div>';
  }).join('');

  const GL = {
    cells: 'Every living cell on Earth: bacteria, archaea, plant, fungus and animal cells. Dead wood is not counted.',
    hcopy: 'All the DNA letters in all living cells, counting every copy. Two bits per letter.',
    hdiv: 'Only the unique genetic code, with repeated copies of the same genes removed. Like counting different books, not printed copies.',
    mact: 'Short-lived memory that disappears in seconds to minutes without power: protein switches, nerve firing, computer RAM.',
    cbio: 'Chemical reactions inside cells that process information, per second.',
    cneu: 'Signals passed between nerve cells across all animals, per second.',
    cdig: 'Operations computers actually carry out per second, not their advertised peak.',
    mexo: 'Information stored outside living bodies: stone tools, clay, books, hard drives.',
    ptot: 'All power used by life plus all power used by human technology.',
    grp: 'The largest group that coordinates as one: a biofilm, an ant colony, a city, a planet.'
  };
  $('gloss').innerHTML = X.GAUGES.map(g => '<div class="gloss"><b><span class="dot" style="background:' + g.color + ';margin-right:8px"></span>' + g.label + '</b><p>' + GL[g.k] + '</p><code class="x-only">' + g.sym + (g.unit ? ' · ' + g.unit : '') + '</code></div>').join('');

  const EQ = [
    ['State of the planet', 'Ψ(t) = ( H_copy, H_div, H_sel, M_active, M_passive, C_biochem, C_neural, C_digital,exec, P_total, Φ_persist )', 'Ten quantities in four unit families, never summed into one score.'],
    ['Carbon closure', 'B_total = B_prok + B_wood + B_euk,act + B_animal\n2026:  550 = 77.5 + 380.0 + 90.5 + 2.0   Gt C', 'Wood is closed as its own compartment, so dead tissue is never divided into cells.'],
    ['Microbe census', 'm̄_C,prok = f_deep·m_deep + f_oligo·m_oligo + f_surf·m_surf = 25 fg C/cell\n(f = 0.2226, 0.6274, 0.1500)\nN_prok = B_prok / m̄_C,prok = 7.75×10¹⁶ g / 2.5×10⁻¹⁴ g = 3.10×10³⁰ cells', 'Three habitats: deep subsurface, starved soil and dark ocean, active surface.'],
    ['DNA: copies, selected, unique', 'H_copy = N_prok·b_prok + N_euk·b_euk = 3.60×10³⁷ bits\nH_sel  = 0.88·H_copy,prok + 0.115·H_copy,euk = 1.84×10³⁷ bits\nH_div  = Σ_clusters(70% identity) 2·L_c·Φ_sel,c = 3.80×10¹² bits\nH_div ≪ H_sel ≤ H_copy   (holds at all 64 epochs)', 'b_prok = 6.0×10⁶ bits per cell; b_euk = 1.92×10⁸ bits per cell.'],
    ['Nerve signaling', 'C_neural = N_synapses · f̄ = 3.00×10²⁷ × 0.10 Hz = 3.0×10²⁶ events/s', 'Summed bottom-up over nematodes, insects, copepods, fish, birds and mammals; the mean rate is capped by metabolism.'],
    ['Executed silicon', 'C_digital,exec = Σ_families n_f · peak_f · u_f = 1.89×10²² ops/s\nC_digital,exec / C_neural = 6.3×10⁻⁵', 'u_f is real utilization (for example ~0.6 for AI accelerators, far lower for phones).'],
    ['Power closure', 'P_total = P_bio + P_tech = 65.0 + 19.5 = 84.5 TW\nP_bio = Σ over 11 compartments ≤ gross primary production (~220–250 TW)', 'The budget must close under what photosynthesis captures.'],
    ['Long tail (Gould)', 'σ(t) = log₁₀( C_max,entity(t) / C_modal ),  C_modal ≈ 846 events/s/cell\nR(t) = log₁₀( (C_total/N_cells) / C_modal ) ≈ +0.02 dex in 2026', 'The most capable entity moves right; the typical cell barely moves.'],
    ['Persistence', 'Φ = Σ_media M_m · τ_m   split into Φ_bio,lineage, Φ_bio,unpowered, Φ_exo,unpowered', 'Living repair, fossil decay and unpowered archives follow different physics.'],
    ['Uncertainty', 'UF₉₅(Y) = P₉₇.₅(Y) / P₂.₅(Y)   from 10,000 joint draws over shared drivers', 'Example: N_prok 95% interval 1.57–6.20×10³⁰ cells (UF₉₅ = 3.95).']
  ];
  $('eqs').innerHTML = EQ.map(q => '<div class="eq"><h3>' + q[0] + '</h3><pre>' + esc(q[1]) + '</pre><p>' + q[2] + '</p></div>').join('');

  const key = ['2', '3', '4', '5', '6'];
  const want = /Bar-On|Whitman|Kallmeyer|Magnabosco|Landenmark|Herculano|Olkowicz|Caspar|Coup|Hilbert|MacIver|Lane|Bennett|Gould/;
  const refs = X.SI.refs;
  const nums = Object.keys(refs).map(Number).sort((a, b) => a - b);
  const keyNums = nums.filter(n => want.test(refs[n])).slice(0, 14);
  $('keySrc').innerHTML = (keyNums.length ? keyNums : key.map(Number)).map(n => '<li value="' + n + '">' + esc(refs[n]) + '</li>').join('');
  $('allSrc').innerHTML = nums.map(n => '<li value="' + n + '">' + esc(refs[n]) + '</li>').join('');

  /* ---------- test today's numbers: two estimates make each headline number ---------- */
  // inputs are the 2026 model values; each output's shaded range is the 95% band from the Monte Carlo ledger
  const IN = {
    biomass: { name: 'Carbon in bacteria and archaea', v: 77.5, unit: 'Gt C', kind: 'Measured', sym: 'B_prok',
      note: 'All the carbon held in microbes, from a global census of life. It is a modern estimate, not a count of every cell.', src: 'Bar-On, Phillips & Milo (2018)', sid: 'S1', tab: 'sources' },
    mass: { name: 'Carbon in one typical cell', v: 25, unit: 'fg C', kind: 'Model assumption', sym: 'm_cell',
      note: 'One average cell size stands in for every microbe. Real cells vary by habitat: under the seafloor they hold about 14 fg each.', src: 'Kallmeyer et al. (2012) for the seafloor value', sid: 'S3', tab: 'sources' },
    synapses: { name: 'Synapses in all animals', v: 3e27, unit: 'synapses', kind: 'Model estimate', sym: 'N_syn',
      note: 'Built from how many worms, insects and other animals there are, their neurons, and synapses per neuron. Each step has its own uncertainty.', src: 'van den Hoogen et al. (2019), Rosenberg et al. (2023), Herculano-Houzel (2016)', sid: 'S5, S6, S17', tab: 'sources' },
    rate: { name: 'Signals per synapse each second', v: 0.1, unit: 'per second', kind: 'Model assumption', sym: 'f_syn',
      note: 'How often an average synapse fires. With the synapse count fixed, 10% more firing means 10% more nerve signals.' },
    peak: { name: 'Top speed of every chip', v: 7.6e22, unit: 'ops/s', kind: 'Inventory', sym: 'P_peak',
      note: 'The peak speed of every AI accelerator, graphics card, server, PC and phone, added up. Different chips count operations differently.', src: 'Epoch AI (2025) and the device inventory', sid: 'S12', tab: 'devices' },
    util: { name: 'Share of time chips are busy', v: 0.249, unit: '', kind: 'Model assumption', sym: 'u',
      note: 'On average chips run at about a quarter of their top speed: AI chips in data centers near 60%, phones and PCs near 15%.', tab: 'devices' }
  };
  const MC = (window.SI_LEDGERS && window.SI_LEDGERS.uncertainty) || { rows: [] };
  const band = re => { const r = MC.rows.find(x => re.test(x[0])); return r ? [Number(r[3]), Number(r[5])] : null; };
  const OUT = [
    { k: 'cells', name: 'Bacteria and archaea cells', a: 'biomass', b: 'mass', op: '÷', f: (a, b) => a * 1e30 / b, unit: 'cells', color: 'var(--s-chem)', range: band(/Prokaryotic Cell Census/), sym: 'N = B × 10³⁰ ÷ m',
      note: 'Biomass divided by the carbon in one cell. Double the biomass and the count doubles; double the cell size and it halves.', ex: 'Elasticity +1 on biomass, −1 on cell mass.' },
    { k: 'neural', name: 'Nerve signals every second', a: 'synapses', b: 'rate', op: '×', f: (a, b) => a * b, unit: 'per second', color: 'var(--s-neuro)', range: band(/Neural Event Rate/), sym: 'C_neural = N_syn × f_syn',
      note: 'Synapses times how often each one fires. These are signals between nerve cells, not thoughts, and not the same thing as computer operations.', ex: 'Elasticity +1 on both inputs.' },
    { k: 'digital', name: 'Chip operations every second', a: 'peak', b: 'util', op: '×', f: (a, b) => a * b, unit: 'ops/s', color: 'var(--s-silicon)', range: band(/Executed Digital Throughput/), sym: 'C_digital = P_peak × u',
      note: 'Top speed times the share of time chips are busy. Chip work and nerve signals are different kinds of events, so they cannot be compared one to one.', ex: 'Elasticity +1 on both inputs.' }
  ];
  const OK = {}; OUT.forEach(o => { OK[o.k] = o; });
  const outOf = k => OUT.find(o => o.a === k || o.b === k);
  const showIn = (k, v) => k === 'util' ? (v * 100).toFixed(1) + '%' : (v >= 1e4 ? X.sci(v) : X.plain(v)) + (IN[k].unit ? ' ' + IN[k].unit : '');
  let pick = 'rate', shown = 'rate', pct = 0;

  const tester = $('tester');
  if (tester) {
    tester.innerHTML = '<div class="t-rows">' + OUT.map(o => '<div class="t-row" style="--tc:' + o.color + '">' +
      [o.a, o.b].map((k, n) => (n ? '<span class="t-op" aria-hidden="true">' + o.op + '</span>' : '') +
        '<button type="button" class="t-box t-in" data-k="' + k + '" aria-pressed="false"><span class="t-name">' + IN[k].name + '</span><span class="t-val" id="tv-' + k + '"></span></button>').join('') +
      '<span class="t-op" aria-hidden="true">=</span>' +
      '<button type="button" class="t-box t-out" data-k="' + o.k + '" aria-pressed="false"><span class="t-name">' + o.name + '</span><span class="t-val" id="tv-' + o.k + '"></span><span class="t-chg" id="tc-' + o.k + '"></span></button>' +
      '<div class="t-band" aria-hidden="true"><span class="t-zone" id="tz-' + o.k + '"></span><span class="t-mid" id="tm-' + o.k + '"></span><span class="t-dot" id="td-' + o.k + '"></span></div>' +
      '<p class="t-range" id="tr-' + o.k + '"></p><p class="t-sym x-only mono">' + o.sym + '</p></div>').join('') + '</div>' +
      '<div class="t-ctl"><label for="tSlide">Change <b id="tWhat"></b> by <output id="tPct" for="tSlide">0%</output></label>' +
      '<input type="range" class="time-slider" id="tSlide" min="-50" max="50" step="5" value="0"><button type="button" class="btn sm ghost" id="tReset">Reset</button></div>' +
      '<p class="t-read" id="tRead" aria-live="polite"></p><div class="t-note" id="tNote"></div>';
    tester.addEventListener('click', ev => {
      const b = ev.target.closest('.t-box'); if (!b) return;
      if (IN[b.dataset.k] && b.dataset.k !== pick) { pick = b.dataset.k; pct = 0; }
      shown = b.dataset.k; drawTest();
    });
    $('tSlide').addEventListener('input', ev => { pct = Number(ev.target.value); shown = pick; drawTest(); });
    $('tReset').addEventListener('click', () => { pct = 0; drawTest(); });
    drawTest();
  }
  function drawTest() {
    const val = {}; Object.keys(IN).forEach(k => { val[k] = IN[k].v * (k === pick ? 1 + pct / 100 : 1); });
    const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n).toFixed(Math.abs(n) < 10 && n % 1 ? 1 : 0) + '%';
    Object.keys(IN).forEach(k => { $('tv-' + k).textContent = showIn(k, val[k]); });
    tester.querySelectorAll('.t-box').forEach(b => { b.classList.toggle('on', b.dataset.k === pick); b.classList.toggle('shown', b.dataset.k === shown); b.setAttribute('aria-pressed', String(b.dataset.k === pick || b.dataset.k === shown)); });
    let reading = '';
    OUT.forEach(o => {
      const base = o.f(IN[o.a].v, IN[o.b].v), v = o.f(val[o.a], val[o.b]), ch = (v / base - 1) * 100;
      $('tv-' + o.k).textContent = X.sci(v) + ' ' + o.unit;
      $('tc-' + o.k).textContent = Math.abs(ch) < 0.05 ? '' : sign(ch);
      // the band spans a quarter of the low end to four times the high end, on a log scale
      const r = o.range;
      if (r) {
        const lo = Math.log10(r[0] / 4), hi = Math.log10(r[1] * 4), at = x => ((Math.log10(x) - lo) / (hi - lo) * 100).toFixed(1) + '%';
        const z = $('tz-' + o.k); z.style.left = at(r[0]); z.style.width = 'calc(' + at(r[1]) + ' - ' + at(r[0]) + ')';
        $('tm-' + o.k).style.left = at(base); $('td-' + o.k).style.left = at(v);
        const inside = v >= r[0] && v <= r[1];
        $('td-' + o.k).classList.toggle('out', !inside);
        $('tr-' + o.k).innerHTML = 'Range we allow for: ' + X.sci(r[0]) + ' to ' + X.sci(r[1]) + '<span class="x-only"> (95%, 10,000 draws)</span>';
        if (o === outOf(pick)) reading = o.name + ': ' + X.sci(v) + ' ' + o.unit + (pct ? ' (' + sign(ch) + ')' : '') + '. ' +
          (!pct ? 'Move the slider to change ' + IN[pick].name.toLowerCase() + '.' : inside ? 'Still inside the range we already allow for.' : 'Outside the range we allow for. If this input were really that far off, our range would be too narrow.');
      }
    });
    $('tWhat').textContent = IN[pick].name.toLowerCase();
    $('tPct').textContent = pct > 0 ? '+' + pct + '%' : pct < 0 ? '−' + -pct + '%' : '0%';
    $('tSlide').value = pct; $('tSlide').setAttribute('aria-valuetext', (pct > 0 ? '+' : '') + pct + ' percent');
    $('tRead').textContent = reading + ' Only one input changes at a time.';
    // the note explains whichever box was picked last: what kind of number it is and where it comes from
    const isOut = OK[shown], d = isOut ? OK[shown] : IN[shown];
    const kind = isOut ? 'Calculated' : d.kind;
    $('tNote').innerHTML = '<span class="chip">' + kind + '</span> <b>' + esc(d.name) + '</b><p>' + esc(d.note) + (isOut ? '<span class="x-only"> ' + esc(d.ex) + '</span>' : '') + '</p>' +
      (d.src ? '<p class="t-src">Source: ' + esc(d.src) + '<span class="x-only mono"> · ' + d.sid + ' · ' + d.sym + '</span>' + (d.tab ? ' · <a href="data.html#' + d.tab + '">See it in the Data Lab →</a>' : '') + '</p>'
        : d.tab ? '<p class="t-src"><a href="data.html#' + d.tab + '">See it in the Data Lab →</a></p>' : '');
  }
})();
