// Intelligence formulas: six ways to add the census into one number, each drawn over the same 68 moments,
// and a mixer that weighs every ingredient. Every number on the page is computed here from the census.
(function () {
  'use strict';
  const X = window.SIX, E = X.E, N = X.N, esc = X.esc, sci = X.sci, sup = X.sup;
  X.chrome('intelligence');
  const $ = id => document.getElementById(id), f1 = n => n.toFixed(1);
  const KB = 1.380649e-23, YEAR = 3.156e7;                     // Boltzmann's constant (J/K); seconds in a year
  const lg = v => Math.log10(v), digits = v => (v >= 1 ? lg(v) : 0);

  /* ---------- the ingredients at each moment ---------- */
  const S = E.map((e, i) => {
    const T = e.temp + 273.15, bit = KB * T * Math.LN2;         // Landauer's price of one bit, in joules
    const P = e.pbio + e.ptech, B = P / bit;
    const R = e.cbio + (e.cbel || 0) + e.cneu + e.cdig;
    const K = e.hdiv + e.mexo;
    // Shannon entropy over the four ways of doing, on digit shares (on raw shares chemistry is all of it)
    const ways = [e.cbio, e.cneu, Math.max(0, e.cdig - (e.cai || 0)), e.cai || 0].map(digits), tot = ways.reduce((a, b) => a + b, 0);
    const H = tot ? -ways.reduce((a, d) => a + (d > 0 ? d / tot * Math.log2(d / tot) : 0), 0) : 0;
    const raw = [e.cbio, e.cneu, e.cdig].map(v => v / (e.cbio + e.cneu + e.cdig));
    const Hraw = -raw.reduce((a, p) => a + (p > 0 ? p * Math.log2(p) : 0), 0);
    return { T, bit, P, B, R, eta: R / B, K, D: Math.pow(2, H), Hraw, dK: NaN, L: NaN, lam: NaN };
  });
  // learning is the change in what is known between neighbouring moments, so it needs two of them
  for (let i = 1; i < N; i++) {
    const dt = (E[i - 1].t - E[i].t) * 1e6 * YEAR;
    if (dt > 0) { S[i].dK = (S[i].K - S[i - 1].K) / dt; S[i].L = S[i].dK / S[i].B; S[i].lam = S[i].dK / S[i].R; }
  }
  const now = S[N - 1], eNow = E[N - 1];
  const iCells = E.findIndex(e => e.cbio > 1e30);              // cells at planetary scale
  const iNerve = E.findIndex(e => e.cneu > 0);
  const iRef = E.findIndex(e => /Asteroid/.test(X.CRISIS[e.id] || '')) - 1;   // the moment before the asteroid
  const iOut = E.findIndex((e, i) => e.mexo > e.hdiv);         // outside memory passes unique DNA
  const i500 = E.findIndex(e => e.t * 1e6 <= 600);              // the last moment before the last 500 years
  const CRI = E.map(e => !!X.CRISIS[e.id]);

  /* ---------- formatting ---------- */
  const pct = v => (v >= 0.1 ? Math.round(v * 100) : +(v * 100).toPrecision(2)) + '%';
  const share = v => (v >= 0.001 ? pct(v) : '1 part in ' + sci(1 / v).replace(/^1×/, ''));
  const times = r => (r >= 10 ? '×' + sci(r) : r >= 1.95 ? '×' + f1(r) : r > 1 / 1.95 ? (r >= 1 ? '+' : '−') + Math.abs(Math.round((r - 1) * 100)) + '%' : '÷' + (1 / r >= 10 ? sci(1 / r) : f1(1 / r)));
  const when = i => X.fmtTime(E[i].t);
  const joules = v => sci(v) + ' J';
  const ways = v => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : f1(v));

  /* ---------- the six formulas ---------- */
  const FAM = { energy: { name: 'Energy', color: 'var(--c-power)' }, info: { name: 'Information', color: 'var(--c-store)' }, both: { name: 'Energy and information', color: 'var(--c-cpu)' } };
  const iPeakEta = S.reduce((b, s, i) => (s.eta > S[b].eta ? i : b), 0);
  const lost = S.map((s, i) => (s.dK < 0 ? i : -1)).filter(i => i >= 0);
  const F = [
    { k: 'budget', fam: 'energy', name: 'Energy budget', sym: '𝔹', unit: 'bit-operations a second', v: s => s.B,
      say: 'The most bit-operations a second that the planet’s power could pay for, at the lowest price physics allows.',
      eqn: '𝔹(t) = P(t) / (k<sub>B</sub> · T(t) · ln 2)',
      why: 'Landauer’s limit: erasing one bit costs at least k<sub>B</sub>·T·ln 2 of energy, about ' + joules(now.bit) + ' at today’s ' + Math.round(eNow.temp) + ' °C. Divide the power by that price.',
      ver: () => 'Life built this budget, then it levelled off: ' + times(now.B / S[iRef].B) + ' since the dinosaurs’ last day. Technology supplies ' + pct(eNow.ptech / now.P) + ' of it.' },
    { k: 'eff', fam: 'energy', name: 'Efficiency', sym: 'η', unit: 'of the budget', fmt: share, v: s => s.eta,
      say: 'The share of that budget that turns into events, counting each event as one bit.',
      eqn: 'η(t) = R(t) / 𝔹(t)',
      why: 'A value of 1 would mean every joule is spent at Landauer’s limit. Nothing real gets there.',
      ver: () => 'It peaked at ' + pct(S[iPeakEta].eta) + ' when microbes had the planet to themselves (' + when(iPeakEta) + ') and is ' + pct(now.eta) + ' today. Bodies, brains and chips spend far more energy on each event.' },
    { k: 'doing', fam: 'info', name: 'Doing', sym: 'R', unit: 'events a second', v: s => s.R,
      say: 'Every event a second, added up: reactions in cells, nerve signals and chip operations.',
      eqn: 'R(t) = C<sub>chem</sub> + C<sub>nerve</sub> + C<sub>silicon</sub>',
      why: 'Shannon’s rate of a channel, taking each event as at least one bit. Chemistry in cells is ' + (eNow.cbio / now.R > 0.999999 ? 'more than 99.9999%' : pct(eNow.cbio / now.R)) + ' of the total, so this formula barely notices brains or machines.',
      ver: () => 'Flat. Today’s total is ' + Math.abs(Math.round((now.R / S[iRef].R - 1) * 100)) + '% ' + (now.R >= S[iRef].R ? 'above' : 'below') + ' the day before the asteroid, 66 million years ago. Its only big moves are the falls at mass extinctions.' },
    { k: 'knowing', fam: 'info', name: 'Knowing', sym: 'K', unit: 'bits', v: s => s.K,
      say: 'What is stored, counting each thing once. A copy carries no new information, so a billion identical genomes count as one.',
      eqn: 'K(t) = H<sub>unique</sub> + M<sub>outside</sub>',
      why: 'Shannon’s entropy of a store: repeats add nothing. The census has a de-duplicated count for DNA but not for outside memory, which still includes copies here.',
      ver: () => 'Up ' + Math.round(lg(now.K / S[iRef].K)) + ' digits since the asteroid, ' + Math.round(lg(now.K / S[i500].K)) + ' of them since ' + when(i500) + '. By this count outside memory passed all of life’s unique DNA around ' + when(iOut) + '; because copies are still in the outside figure, the true crossing is later.' },
    { k: 'variety', fam: 'info', name: 'Variety', sym: 'D', unit: 'ways of doing', lin: true, fmt: v => ways(v), v: s => s.D, rise: 1.25,
      say: 'How many different ways of doing run side by side: chemistry, nerves, ordinary chips, neural nets.',
      eqn: 'D(t) = 2<sup>H</sup>,  H = −Σ p<sub>i</sub> · log<sub>2</sub> p<sub>i</sub>',
      why: 'Shannon’s entropy formula, turned into a count. Here p<sub>i</sub> is each way’s share of the digits, because on raw counts chemistry is everything and H is ' + now.Hraw.toFixed(7) + ' bits.',
      ver: () => 'Up, in steps: ' + ways(S[iCells].D) + ' way for ' + f1((E[iCells].t - E[iNerve].t) / 1000) + ' billion years, ' + ways(S[iRef].D) + ' once animals had nerves, ' + ways(now.D) + ' today. Each new way was added on top; none replaced an older one.' },
    { k: 'learning', fam: 'both', name: 'Learning share', sym: '𝕃', unit: 'of the budget', fmt: share, v: s => s.L,
      say: 'The share of the energy budget that ends up as new knowledge. It joins the two approaches in one number with no units.',
      eqn: '𝕃(t) = (dK/dt) · k<sub>B</sub> · T · ln 2 / P  =  η · λ',
      why: 'λ = (dK/dt) / R is the learning yield: how many events it takes to leave one new bit behind. Learning share is efficiency times yield. It is negative when knowledge is lost.',
      ver: () => 'Up ' + Math.round(lg(now.L / S[iRef].L)) + ' digits since the dinosaurs, and still tiny: ' + share(now.L) + '. It went negative ' + lost.length + ' times, each time unique DNA was lost faster than it was made.' }
  ];
  F.forEach(f => {
    const vals = S.map(f.v), a = vals[N - 1], peak = Math.max.apply(null, vals.filter(v => v > 0));
    f.vals = vals;
    f.tag = a < peak / 2 ? 'down' : a / vals[iRef] > (f.rise || 2) ? 'up' : 'flat';
  });
  const TAG = { up: ['↑', 'Rises'], flat: ['→', 'Flat'], down: ['↓', 'Falls'] };

  /* ---------- one chart for every panel ---------- */
  // drawn at the element's own pixel width, so labels keep their size in a narrow card
  const HT = 216, ML = 46, MR = 14, MT = 12, MB = 28, PH = HT - MT - MB;
  const XL = [0, iNerve, iRef, E.findIndex(e => e.t < 0.006), N - 1];
  const shortT = t => (t >= 1000 ? (t / 1000).toFixed(1) + ' Ga' : t >= 1 ? Math.round(t) + ' Ma' : X.fmtShort(t));
  let sel = N - 1;
  function draw(svg, vals, o) {
    const W = Math.max(260, Math.round(svg.clientWidth || 520)), PW = W - ML - MR, xx = i => ML + i / (N - 1) * PW;
    svg._w = W;
    const ok = vals.map(v => isFinite(v) && (o.lin || v > 0)), pv = vals.map((v, i) => (ok[i] ? (o.lin ? v : lg(v)) : NaN)), good = pv.filter(v => !isNaN(v));
    let lo = o.lin ? 0 : Math.floor(Math.min.apply(null, good)), hi = Math.ceil(Math.max.apply(null, good) - 1e-9);
    if (!o.lin && hi - lo < 3) { hi += 1; lo -= 1; }
    const step = Math.max(1, Math.ceil((hi - lo) / 5)), yy = v => MT + (1 - (v - lo) / (hi - lo)) * PH;
    let g = '';
    for (let d = lo; d <= hi + 1e-9; d += step) g += '<line class="grid" x1="' + ML + '" x2="' + (W - MR) + '" y1="' + f1(yy(d)) + '" y2="' + f1(yy(d)) + '"/><text class="tk" x="' + (ML - 8) + '" y="' + f1(yy(d) + 4) + '" text-anchor="end">' + (o.lin ? d : d === 0 ? '1' : '10' + sup(d)) + '</text>';
    const xl = W < 430 ? [XL[0], XL[2], XL[4]] : XL;
    xl.forEach((i, k) => { g += '<text class="tk" x="' + f1(xx(i)) + '" y="' + (HT - 8) + '" text-anchor="' + (k === 0 ? 'start' : k === xl.length - 1 ? 'end' : 'middle') + '">' + (i === N - 1 ? 'today' : shortT(E[i].t)) + '</text>'; });
    let d = '', pen = false;
    pv.forEach((v, i) => { if (isNaN(v)) { pen = false; return; } d += (pen ? 'L' : 'M') + f1(xx(i)) + ' ' + f1(yy(v)); pen = true; });
    g += '<path class="ln" d="' + d + '"/>';
    // crises on the baseline; a moment where the value went negative gets a mark inside the plot
    CRI.forEach((c, i) => { if (c) g += '<path class="cri" d="M' + f1(xx(i) - 4) + ' ' + (MT + PH + 7) + ' h8 l-4 -7 z"/>'; });
    vals.forEach((v, i) => { if (i && isFinite(v) && v < 0) g += '<path class="cri" d="M' + f1(xx(i) - 4) + ' ' + (MT + PH - 9) + ' h8 l-4 7 z"/>'; });
    g += '<line class="selx" x1="' + f1(xx(sel)) + '" x2="' + f1(xx(sel)) + '" y1="' + MT + '" y2="' + (MT + PH) + '"/>';
    if (!isNaN(pv[sel])) g += '<circle class="seld" cx="' + f1(xx(sel)) + '" cy="' + f1(yy(pv[sel])) + '" r="4.5"/>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + HT);
    svg.innerHTML = g;
  }
  function hook(svg) {
    const pick = ev => { const r = svg.getBoundingClientRect(), W = svg._w || r.width; setSel(Math.max(0, Math.min(N - 1, Math.round(((ev.clientX - r.left) / r.width * W - ML) / (W - ML - MR) * (N - 1))))); };
    svg.addEventListener('pointermove', pick); svg.addEventListener('pointerdown', pick);
  }
  const say = (f, i) => { const v = f.vals[i]; return !isFinite(v) ? 'needs two moments to measure' : v < 0 ? 'negative: knowledge was being lost' : (f.fmt ? f.fmt(v) : sci(v)) + ' ' + f.unit; };

  /* ---------- the cards ---------- */
  ['energy', 'info', 'both'].forEach(fam => {
    $('cards-' + fam).innerHTML = F.filter(f => f.fam === fam).map(f =>
      '<article class="iq-card" id="f-' + f.k + '" style="--k:' + FAM[fam].color + '"><header><h3>' + esc(f.name) + '<span class="iq-sym" aria-hidden="true">' + f.sym + '</span></h3><span class="iq-verdict">' + TAG[f.tag][0] + ' ' + TAG[f.tag][1] + '</span></header>' +
      '<p class="iq-say">' + esc(f.say) + '</p><div class="iq-eqn">' + f.eqn + '</div><p class="iq-why">' + f.why + '</p>' +
      '<div class="iq-plot"><svg class="iq" id="svg-' + f.k + '" role="img" aria-label="' + esc(f.name) + ' across the ' + N + ' moments of the census. The table at the end of the page gives the values."></svg></div>' +
      '<p class="iq-read" id="read-' + f.k + '"></p><p class="iq-ver">' + f.ver() + '</p></article>').join('');
  });
  F.forEach(f => hook($('svg-' + f.k)));

  /* ---------- the answer, in three groups ---------- */
  const groups = { up: 'Yes, it rises', flat: 'No change', down: 'It fell' };
  $('answer').innerHTML = Object.keys(groups).map(t => { const fs = F.filter(f => f.tag === t); return '<div><span class="sub">' + fs.length + ' of ' + F.length + ' formulas</span><b>' + TAG[t][0] + ' ' + groups[t] + '</b><ul>' + fs.map(f => '<li><a href="#f-' + f.k + '">' + esc(f.name) + '</a></li>').join('') + '</ul></div>'; }).join('');
  const tagOf = k => F.find(f => f.k === k).tag;
  if (tagOf('doing') === 'flat' && tagOf('budget') === 'flat' && tagOf('knowing') === 'up') $('answerSay').textContent = 'The planet does about as much as it did in the age of dinosaurs, on about the same energy. What has grown is how much of that activity is kept as new knowledge.';

  /* ---------- ingredients table ---------- */
  const ING_ROWS = [
    ['P', 'Power used by life and technology', X.watts(now.P), 'p_metabolic_watts'], ['T', 'Surface temperature', Math.round(eNow.temp) + ' °C', 'surface_temp_c'],
    ['C<sub>chem</sub>', 'Reactions in cells', sci(eNow.cbio) + ' a second', 'c_biochem_ops_sec'], ['C<sub>nerve</sub>', 'Nerve signals', sci(eNow.cneu) + ' a second', 'c_neural_ops_sec'], ['C<sub>silicon</sub>', 'Chip operations', sci(eNow.cdig) + ' a second', 'c_digital_ops_sec'],
    ['H<sub>DNA</sub>', 'DNA storage, every copy', sci(eNow.hcopy) + ' bits', 'h_copy_bits'], ['H<sub>unique</sub>', 'DNA storage, each sequence once', sci(eNow.hdiv) + ' bits', 'h_unique_bits'], ['M<sub>outside</sub>', 'Memory outside the body', sci(eNow.mexo) + ' bits', 'm_exo_installed_bits'],
    ['N<sub>group</sub>', 'Largest group acting as one', sci(eNow.grp) + ' individuals', 'max_collective_group_size'], ['C<sub>max</sub>', 'Most capable single thing', sci(eNow.cmax) + ' operations a second', 'c_max_entity_ops_sec']
  ];
  $('ingBody').innerHTML = ING_ROWS.map(r => '<tr><td class="iq-symc"><span class="iq-sym">' + r[0] + '</span></td><th scope="row">' + esc(r[1]) + '</th><td>' + X.numBtn(r[3], r[2]) + '</td></tr>').join('');

  /* ---------- the price of one event, today ---------- */
  const PRICE = [['Landauer’s floor for one bit', now.bit, ''], ['One reaction in a cell', eNow.pbio / eNow.cbio, 'all of life’s power ÷ all reactions'], ['One nerve signal', eNow.pani / eNow.cneu, 'upper bound: all animal metabolism ÷ nerve signals'], ['One chip operation', eNow.pit / eNow.cdig, 'all computing power ÷ all operations']];
  $('priceBody').innerHTML = PRICE.map(r => '<tr><th scope="row">' + esc(r[0]) + (r[2] ? '<small>' + esc(r[2]) + '</small>' : '') + '</th><td>' + joules(r[1]) + '</td><td>' + (r[1] === now.bit ? '1' : '×' + sci(r[1] / now.bit)) + '</td></tr>').join('');

  const near = r => { const e = Math.round(lg(r)); return e >= 9 ? plainBig(e) : e >= 6 ? 'millions of times' : 'about ' + Math.round(r) + ' times'; }, plainBig = e => (e >= 12 ? 'trillions of times' : 'about a billion times');
  $('priceSay').textContent = 'This is why efficiency fell. A reaction in a cell costs ' + near(PRICE[1][1] / now.bit) + ' the lowest price physics allows. A nerve signal costs ' + near(PRICE[2][1] / now.bit) + ' that price and a chip operation ' + near(PRICE[3][1] / now.bit) + '. By the energy yardstick alone, microbes are the most efficient thinkers Earth has had.';
  const gaps = E.slice(1).map((e, i) => (E[i].t - e.t) * 1e6).filter(g => g > 0);
  $('lastN').textContent = E.filter(e => e.t * 1e6 <= 5000).length;
  $('gapMin').textContent = Math.round(Math.min.apply(null, gaps)); $('gapMax').textContent = Math.round(Math.max.apply(null, gaps) / 1e6) + ' million';

  /* ---------- the chain at the selected moment ---------- */
  function chain(i) {
    const s = S[i], e = E[i], box = (t, v, u) => '<div class="box"><span class="sub">' + t + '</span><b>' + v + '</b><span>' + u + '</span></div>', via = (a, b) => '<div class="via"><span>' + a + '</span><b>' + b + '</b><i aria-hidden="true">→</i></div>';
    const learn = !isFinite(s.dK) ? ['—', 'needs two moments'] : s.dK < 0 ? ['−' + sci(-s.dK), 'bits a second, lost'] : [sci(s.dK), 'new bits a second'];
    $('chain').innerHTML = box('Power', X.watts(s.P), 'at ' + Math.round(e.temp) + ' °C') + via('÷ price of a bit', '') + box('Energy budget 𝔹', sci(s.B), 'bit-operations a second') + via('× efficiency η', share(s.eta)) +
      box('Doing R', sci(s.R), 'events a second') + via('× yield λ', isFinite(s.lam) && s.lam > 0 ? share(s.lam) : '—') + box('Learning dK/dt', learn[0], learn[1]) + via('adds up to', '') + box('Knowing K', sci(s.K), 'bits, each counted once');
  }

  /* ---------- the mixer: every ingredient, weighted ---------- */
  const ING = [{ k: 'bud', name: 'Energy budget', sym: '𝔹', color: 'var(--c-power)', v: i => S[i].B }]
    .concat(X.LAYERS.map(l => ({ k: l.k, name: l.name, sym: l.sym.replace(/_(\w+)/, '<sub>$1</sub>'), color: l.color, v: i => l.val(E[i]) })))
    .concat([{ k: 'peak', name: 'Most capable single thing', sym: 'C<sub>max</sub>', color: 'var(--ink-3)', v: i => E[i].cmax }]);
  ING.forEach(g => { g.d = E.map((e, i) => digits(g.v(i))); });
  const PRE = {
    stack: ['The site’s stack', ['chem', 'nerve', 'ai', 'sil', 'dna', 'exo', 'grp']], all: ['Everything', ING.map(g => g.k)], energy: ['Energy only', ['bud']],
    doing: ['Doing only', ['chem', 'nerve', 'ai', 'sil']], keeping: ['Keeping only', ['dna', 'exo']], peak: ['Peak only', ['peak']]
  };
  const wt = {};
  let mixVals = [];
  $('mixPre').innerHTML = Object.keys(PRE).map(k => '<button type="button" data-p="' + k + '" aria-pressed="false">' + esc(PRE[k][0]) + '</button>').join('');
  $('mixW').innerHTML = ING.map(g => '<label class="iq-w" style="--k:' + g.color + '"><span><i></i>' + esc(g.name) + '</span><input type="range" min="0" max="2" step="0.5" id="w-' + g.k + '" aria-label="Weight of ' + esc(g.name) + '"><output id="o-' + g.k + '"></output></label>').join('');
  function mix(preset) {
    if (preset) ING.forEach(g => { wt[g.k] = PRE[preset][1].indexOf(g.k) >= 0 ? 1 : 0; $('w-' + g.k).value = wt[g.k]; });
    Array.from($('mixPre').children).forEach(b => b.setAttribute('aria-pressed', b.dataset.p === preset));
    ING.forEach(g => { $('o-' + g.k).textContent = '×' + wt[g.k]; });
    mixVals = E.map((e, i) => ING.reduce((t, g) => t + wt[g.k] * g.d[i], 0));
    const on = ING.filter(g => wt[g.k] > 0);
    $('mixEqn').innerHTML = on.length ? '𝕀(t) = ' + on.map(g => (wt[g.k] === 1 ? '' : wt[g.k] + '·') + 'log<sub>10</sub> ' + g.sym).join(' + ') : 'Give at least one ingredient a weight.';
    let worst = 0, wi = -1; for (let i = 1; i < N; i++) { const dd = mixVals[i] - mixVals[i - 1]; if (dd < worst) { worst = dd; wi = i; } }
    const up = mixVals[N - 1] - mixVals[iRef], upN = mixVals[N - 1] - mixVals[iNerve];
    $('mixSay').innerHTML = !on.length ? '' : '<b>' + f1(mixVals[N - 1]) + ' digits today.</b> ' + (Math.abs(up) < 0.3 ? 'No real change' : (up > 0 ? 'Up ' : 'Down ') + f1(Math.abs(up)) + ' digits') + ' since the dinosaurs’ last day, ' + (upN >= 0 ? 'up ' : 'down ') + f1(Math.abs(upN)) + ' since the first nerves.' +
      (wi > 0 ? ' Its deepest fall is ' + f1(-worst) + ' digits at ' + when(wi) + (X.CRISIS[E[wi].id] ? ' (' + esc(X.CRISIS[E[wi].id]) + ')' : '') + '.' : ' It never falls.');
    paint();
  }
  $('mixPre').addEventListener('click', ev => { const b = ev.target.closest('button'); if (b) mix(b.dataset.p); });
  ING.forEach(g => $('w-' + g.k).addEventListener('input', ev => { wt[g.k] = +ev.target.value; mix(null); }));
  hook($('svg-mix'));

  /* ---------- side-by-side table ---------- */
  const COLS = [iCells, iNerve, iRef, N - 1];
  $('cmpHead').innerHTML = '<th scope="col">Formula</th>' + COLS.map(i => '<th scope="col">' + (i === N - 1 ? 'Today' : esc(when(i))) + '</th>').join('') + '<th scope="col">Verdict</th>';
  $('cmpBody').innerHTML = F.map(f => '<tr><th scope="row">' + esc(f.name) + '<small>' + esc(f.unit) + '</small></th>' + COLS.map(i => { const v = f.vals[i]; return '<td>' + (isFinite(v) && v > 0 ? (f.fmt ? f.fmt(v) : sci(v)) : v < 0 ? 'negative' : '—') + '</td>'; }).join('') + '<td>' + TAG[f.tag][0] + ' ' + TAG[f.tag][1] + '</td></tr>').join('');

  /* ---------- selection ---------- */
  const slider = $('pick');
  slider.max = N - 1;
  function paint() {
    F.forEach(f => { draw($('svg-' + f.k), f.vals, f); $('read-' + f.k).innerHTML = esc(when(sel)) + ': <b>' + esc(say(f, sel)) + '</b>'; });
    draw($('svg-mix'), mixVals, { lin: true });
    $('read-mix').innerHTML = esc(when(sel)) + ': <b>' + f1(mixVals[sel] || 0) + ' digits</b>';
    chain(sel);
    slider.value = sel; slider.setAttribute('aria-valuetext', X.momentText(sel));
    $('pickSay').textContent = X.momentText(sel);
    $('chainWhen').textContent = when(sel);
  }
  function setSel(i) { if (i !== sel) { sel = i; paint(); } }
  slider.addEventListener('input', () => setSel(+slider.value));
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(paint, 120); });
  mix('stack');
})();
