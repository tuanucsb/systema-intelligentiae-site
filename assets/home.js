(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('home');
  const $ = id => document.getElementById(id);

  document.querySelectorAll('.n-stops').forEach(el => { el.textContent = X.STOPS.length; });
  document.querySelectorAll('.n-inv').forEach(el => { el.textContent = X.INV.length; });

  // Detailed evidence view: the original stack and its linked readout remain available below the story.
  const E = X.E, N = X.N, esc = X.esc;
  const TEACH = {
    ord: 'Each layer is as thick as its number has digits: 10²⁶ is 26 digits thick. Each column is one moment in Earth’s history, not one year, so the last six columns cover only 80 years.',
    time: 'The same stack with every year given equal width. The first three billion years fill the chart, and everything since the first stone tools is thinner than one pixel. That is why the other view gives each moment its own column.'
  };
  function readout(i) {
    const e = E[i], st = X.STOP[e.id], a = X.actOf(i);
    $('rWhen').textContent = X.fmtTime(e.t) + ' · Act ' + a.n + ', ' + a.name;
    $('rTitle').textContent = st ? st.who + ': ' + X.titleOf(i) : X.titleOf(i);
    $('rBody').innerHTML = X.LAYERS.map(l => {
      const v = l.val(e), d = X.DIGITS[i][l.k];
      return '<tr class="' + (d ? '' : 'zero') + '"><th scope="row"><i style="--k:' + l.color + '"></i>' + esc(l.name) + '<span class="x-only mono" style="font-size:12px;color:var(--ink-3)"> · ' + l.sym + '</span></th><td>' + (d ? X.sci(v) + ' ' + l.unit : v > 0 ? 'under one a second' : 'not yet') + '</td><td>' + (d ? Math.round(d) + ' digits' : '') + '</td></tr>';
    }).join('');
    $('rFoot').innerHTML = '<tr><th scope="row">Stack height</th><td></td><td>' + Math.round(X.stackHeight(i)) + ' digits</td></tr>';
  }
  const ch = X.stack($('heroChart'), {
    drawIn: false,
    slider: $('heroSlider'),
    onSelect: i => { $('heroGo').href = 'journey.html#' + E[i].id; readout(i); },
    onHover: i => { readout(i == null ? ch.selected : i); }
  });
  function setMode(m) { $('mOrd').setAttribute('aria-pressed', m === 'ord'); $('mTime').setAttribute('aria-pressed', m === 'time'); $('heroRead').textContent = TEACH[m]; ch.setMode(m); }
  $('mOrd').addEventListener('click', () => setMode('ord'));
  $('mTime').addEventListener('click', () => setMode('time'));
  ch.select(N - 1);
  // A chart initialized inside a closed disclosure needs its width checked on opening.
  $('homeEvidence').addEventListener('toggle', () => {
    if ($('homeEvidence').open) dispatchEvent(new Event('resize'));
  });

  // the legend is always present and doubles as the highlight control
  $('heroKeys').innerHTML = X.LAYERS.map(l => '<button type="button" class="key" data-k="' + l.k + '" aria-pressed="false" style="--k:' + l.color + '"><i></i>' + esc(l.name) + '</button>').join('');
  function setFocus(keys, fromThread) {
    if (fromThread) $('homeEvidence').open = true;
    document.querySelectorAll('#heroKeys .key').forEach(b => b.setAttribute('aria-pressed', !!(!fromThread && keys && keys.length === 1 && keys[0] === b.dataset.k)));
    ch.setFocus(keys);
  }
  $('heroKeys').addEventListener('click', ev => {
    const b = ev.target.closest('.key'); if (!b) return;
    const on = b.getAttribute('aria-pressed') === 'true';
    closeThread(); setFocus(on ? null : [b.dataset.k]);
  });

  /* ---------- questions: the layers that answer each one, a paragraph built from the census, the stops where it happened ---------- */
  const now = E[N - 1], dg = v => (v >= 1 ? Math.log10(v) : 0);
  const yearOf = e => 2026 - e.t * 1e6;
  const aiPts = E.filter(e => e.cai > 0).map(e => [yearOf(e), e.cai]);
  const aiLast = aiPts[aiPts.length - 1];
  const rate = Math.pow(aiLast[1] / aiPts[0][1], 1 / (aiLast[0] - aiPts[0][0]));
  const crossYear = 2026 + Math.log(now.cneu / aiLast[1]) / Math.log(rate);
  // the deepest fall in nerve signals between two neighbouring moments
  let worst = { i: 1, f: 1 };
  E.forEach((e, i) => { if (i && E[i - 1].cneu > 0 && e.cneu > 0 && e.cneu / E[i - 1].cneu < worst.f) worst = { i, f: e.cneu / E[i - 1].cneu }; });
  const firstMachine = E.findIndex((e, i) => i && e.cmax > E[i - 1].cmax * 10 && e.cdig > 0 && e.cmax > 1e15);
  const brain = firstMachine > 0 ? E[firstMachine - 1].cmax : 1.5e14;
  const THREADS = [
    { id: 'neural', q: 'When do chips out-fire the animals?', keys: ['nerve', 'ai'], blurb: 'Brains and AI are two generations of one layer.', inset: true, stops: ['EP08a', 'EP11a', 'EP31b', 'EP32b'],
      text: 'Every animal nervous system on Earth fires about ' + X.sci(now.cneu) + ' signals a second, and that number has barely moved in 300 million years. Artificial neural nets started near ' + X.sci(aiPts[0][1]) + ' operations a second in ' + Math.round(aiPts[0][0]) + ' and reached ' + X.sci(aiLast[1]) + ' in 2026: about ×' + rate.toFixed(1) + ' every year. If that pace held, the two bands would be equally thick around ' + Math.round(crossYear) + '. Nothing in the census says the pace will hold.' },
    { id: 'memory', q: 'When did memory leave the body?', keys: ['dna', 'exo'], blurb: 'Stone, clay, paper, disks: the layer under the line.', stops: ['EP21a', 'EP25a', 'EP27a', 'EP31a'],
      text: 'For four billion years everything Earth kept was written in DNA: ' + X.sci(now.hcopy) + ' bits today, counting every copy in every cell. Outside memory began 3.3 million years ago as the shape of a stone tool and now holds ' + X.sci(now.mexo) + ' bits. It is the fastest-growing layer in the stack, and it is still ' + Math.round(dg(now.hcopy) - dg(now.mexo)) + ' digits thinner than the DNA above it.' },
    { id: 'chem', q: 'Is most thinking still chemistry?', keys: ['chem'], blurb: 'The oldest layer is still the thickest.', stops: ['EP01a', 'EP03a', 'EP08a', 'EP32b'],
      text: 'Yes. The chemistry inside living cells runs ' + X.sci(now.cbio) + ' reactions a second. That is ' + Math.round(dg(now.cbio) - dg(now.cneu)) + ' digits more than every nerve signal on Earth and ' + Math.round(dg(now.cbio) - dg(now.cdig)) + ' digits more than every chip. The newer layers do different things, faster and with longer reach, but they sit on top of the first one. They did not replace it.' },
    { id: 'crises', q: 'What did the worst crisis cost?', keys: ['chem', 'nerve'], blurb: 'A mass extinction, measured in digits.', stops: Object.keys(X.CRISIS).filter(id => X.STOP[id]).slice(0, 5),
      text: 'The deepest fall in the record is ' + X.titleOf(worst.i).toLowerCase().replace(/^the /, 'the ') + ', ' + X.fmtTime(E[worst.i].t) + ': nerve signals dropped ' + Math.round((1 - worst.f) * 100) + '% from one moment to the next. On the stack that is about ' + Math.log10(1 / worst.f).toFixed(1) + ' digits, a notch you can barely see. Counting in digits is what lets one chart hold four billion years, and it is also why a catastrophe looks small on it. Open the stop to see what was lost.' },
    { id: 'biggest', q: 'Who is the biggest single thinker?', keys: ['nerve', 'ai', 'sil'], blurb: 'One body, one brain, one machine at a time.', stops: ['EP08a', 'EP17a', 'EP23a', 'EP31b', 'EP32b'],
      text: 'The layers count everyone together. The record for one thinker is a different number. It began near ' + X.sci(E[0].cmax) + ' operations a second in a single protocell. For most of the last 300,000 years the record holder was a human brain, at about ' + X.sci(brain) + ' signals a second. ' + (firstMachine > 0 ? 'Around ' + Math.round(yearOf(E[firstMachine])) + ' a machine took the record, and today’s largest AI cluster runs ' + X.sci(now.cmax) + ' operations a second.' : 'Today’s largest machine runs ' + X.sci(now.cmax) + ' operations a second.') },
    { id: 'reach', q: 'How many can act as one?', keys: ['grp'], blurb: 'From a film of cells to eight billion people.', stops: ['EP02a', 'EP17a', 'EP25a', 'EP29a', 'EP32b'],
      text: 'The thin strip under the stack is reach: the largest group that coordinates as one. It starts with about ' + X.sci(E[0].grp) + ' protocells sharing one rock pore and ends with ' + X.sci(now.grp) + ' people on one network. It is the thinnest layer, only ' + Math.round(dg(now.grp)) + ' digits, because it counts individuals, not their operations. Every jump in it needed a new way to pass a message: chemicals, scent trails, speech, writing, wires.' }
  ];
  let open = null;
  $('threads').innerHTML = THREADS.map(t => '<button type="button" class="thread-q" data-t="' + t.id + '" aria-pressed="false" aria-controls="threadOut"><span class="ks" aria-hidden="true">' + t.keys.map(k => '<i style="--k:' + X.LK[k].color + '"></i>').join('') + '</span><b>' + esc(t.q) + '</b><span>' + esc(t.blurb) + '</span></button>').join('');
  function closeThread() {
    if (!open) return;
    open = null;
    document.querySelectorAll('.thread-q').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('threadOut').hidden = true;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
  }
  function openThread(id, scroll) {
    const t = THREADS.find(x => x.id === id);
    if (!t) return;
    if (open === id) { closeThread(); setFocus(null); return; }
    open = id;
    document.querySelectorAll('.thread-q').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === id));
    const out = $('threadOut'); out.hidden = false;
    out.innerHTML = '<h3>' + esc(t.q) + '</h3><p>' + t.text + '</p>' +
      (t.inset ? '<div class="inset"><svg id="inset" role="img" aria-label="Nerve signals and artificial neural net operations a second, 2005 to 2045. Nets reach the nerve-signal level around ' + Math.round(crossYear) + ' if the 2012 to 2026 pace held."></svg></div>' : '') +
      '<div><span class="sub">Stops on this question</span><div class="stops" style="margin-top:8px">' + t.stops.filter(s => X.IDX[s] !== undefined).map(s => { const i = X.IDX[s], st = X.STOP[s]; return '<a class="btn sm ghost" href="journey.html#' + s + '">' + esc(st ? st.who : X.titleOf(i)) + ' · ' + X.fmtShort(E[i].t) + '</a>'; }).join('') + '</div></div>';
    if (t.inset) drawInset();
    setFocus(t.keys, true);
    try { history.replaceState(null, '', '#thread=' + id); } catch (e) { /* ignore */ }
    if (scroll) $('questions').scrollIntoView({ block: 'start' });
  }
  $('threads').addEventListener('click', ev => { const b = ev.target.closest('.thread-q'); if (b) openThread(b.dataset.t); });

  // two generations of neural computing on one axis; anything past the last census moment is dashed
  function drawInset() {
    const s = $('inset'), w = 900, h = 300, l = 60, r = 190, t = 22, b = 36, f1 = n => n.toFixed(1);
    s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); s.classList.add('stk', 'ins');
    const y0 = 2005, y1 = Math.max(2045, Math.ceil(crossYear / 5) * 5 + 5), v0 = 14, v1 = 28;
    const xx = y => l + (y - y0) / (y1 - y0) * (w - l - r), yy = v => t + (v1 - Math.log10(v)) / (v1 - v0) * (h - t - b);
    let g = '';
    [14, 18, 22, 26].forEach(v => { g += '<line class="grid" x1="' + l + '" x2="' + (w - r) + '" y1="' + f1(yy(Math.pow(10, v))) + '" y2="' + f1(yy(Math.pow(10, v))) + '"/><text class="tick" x="' + (l - 8) + '" y="' + f1(yy(Math.pow(10, v)) + 4) + '" text-anchor="end">10' + X.sup(v) + '</text>'; });
    for (let y = 2010; y < y1; y += 10) g += '<text class="tick" x="' + f1(xx(y)) + '" y="' + (h - 10) + '" text-anchor="middle">' + y + '</text>';
    g += '<line class="actline" x1="' + f1(xx(2026)) + '" x2="' + f1(xx(2026)) + '" y1="' + t + '" y2="' + (h - b) + '"/><text class="tick" x="' + f1(xx(2026) + 5) + '" y="' + (t + 10) + '">today</text>';
    g += '<path class="ln" style="stroke:var(--l-nerve)" d="M' + f1(xx(y0)) + ' ' + f1(yy(now.cneu)) + ' H' + f1(xx(2026)) + '"/><path class="ln dash" style="stroke:var(--l-nerve)" d="M' + f1(xx(2026)) + ' ' + f1(yy(now.cneu)) + ' H' + f1(xx(y1)) + '"/>';
    g += '<path class="ln" style="stroke:var(--s-neuro);opacity:.55" d="' + aiPts.map((p, k) => (k ? 'L' : 'M') + f1(xx(p[0])) + ' ' + f1(yy(p[1]))).join('') + '"/>';
    g += '<path class="ln dash" style="stroke:var(--s-neuro);opacity:.55" d="M' + f1(xx(aiLast[0])) + ' ' + f1(yy(aiLast[1])) + ' L' + f1(xx(crossYear)) + ' ' + f1(yy(now.cneu)) + '"/>';
    aiPts.forEach(p => { g += '<circle class="pt" style="fill:var(--l-ai);stroke:var(--s-neuro)" cx="' + f1(xx(p[0])) + '" cy="' + f1(yy(p[1])) + '" r="5"/>'; });
    g += '<circle class="pt" style="fill:var(--surface);stroke:var(--ink)" cx="' + f1(xx(crossYear)) + '" cy="' + f1(yy(now.cneu)) + '" r="5.5"/>';
    g += '<text class="lab" x="' + (w - r + 12) + '" y="' + f1(yy(now.cneu) - 2) + '">Nerve signals</text><text class="labv" x="' + (w - r + 12) + '" y="' + f1(yy(now.cneu) + 13) + '">all animals, ' + X.sci(now.cneu) + ' a second</text>';
    g += '<text class="lab" x="' + f1(xx(aiLast[0]) + 12) + '" y="' + f1(yy(aiLast[1]) + 16) + '">Artificial neural nets</text><text class="labv" x="' + f1(xx(aiLast[0]) + 12) + '" y="' + f1(yy(aiLast[1]) + 31) + '">×' + rate.toFixed(1) + ' a year since ' + Math.round(aiPts[0][0]) + '</text>';
    g += '<text class="note" x="' + f1(xx(crossYear) - 10) + '" y="' + f1(yy(now.cneu) - 12) + '" text-anchor="end">if the pace held: about ' + Math.round(crossYear) + '</text>';
    s.innerHTML = g;
  }

  // a returning reader's journey door picks up where they stopped
  const last = X.readLast();
  if (last) {
    $('journeyDoor').href = 'journey.html#' + E[last].id;
    $('journeyGo').textContent = 'Continue at ' + X.placeOf(last) + ' →';
  }

  // today's numbers
  $('stats').innerHTML = [
    [X.sci(now.cells), 'living cells on Earth today', 'N_cells', 'chem'],
    [X.sci(now.cneu), 'nerve signals fired every second', 'C_neural', 'neuro'],
    [X.sci(now.cdig), 'silicon operations every second', 'C_digital,exec', 'silicon']
  ].map(s => '<div class="stat" style="--sc:var(--s-' + s[3] + ')"><b>' + s[0] + '</b><span>' + s[1] + '<span class="x-only mono"> · ' + s[2] + '</span></span></div>').join('');

  // one thread
  const thread = ['vent-gradient', 'ribosome', 'four-second-memory', 'mitochondria', 'neurons', 'myelin', 'neocortex', 'speaking', 'cuneiform', 'printing', 'telegraph', 'electronic-computers', 'ai-clusters'];
  $('thread').innerHTML = thread.map((id, n) => {
    const u = X.INVK[id];
    return (n ? '<span class="arrow" aria-hidden="true">→</span>' : '') +
      '<a href="tree.html#' + id + '" style="--pc:' + X.PK[u.part].color + '"><span class="when">' + X.fmtShort(X.E[u.i].t) + '</span><b>' + X.esc(u.label) + '</b></a>';
  }).join('');
  // fade the right edge while more steps wait off-screen
  const th = $('thread');
  const fade = () => th.classList.toggle('more', th.scrollLeft + th.clientWidth < th.scrollWidth - 4);
  th.addEventListener('scroll', fade, { passive: true });
  addEventListener('resize', fade);
  fade();

  // nine parts: one spec sheet, read across to compare three thinkers
  $('parts').insertAdjacentHTML('beforeend', '<thead><tr><th scope="col">Part</th><th scope="col">Bacterium</th><th scope="col">You</th><th scope="col">Laptop</th><th scope="col"><span class="sr-only">Upgrades</span></th></tr></thead><tbody>' +
    X.PARTS.map(p => {
      const h = X.HIST[p.key];
      return '<tr style="--pc:' + p.color + '"><th scope="row"><span class="pn">' + X.icon(p.key) + p.name + '</span><span class="q">' + p.question + '</span></th>' +
        '<td data-l="Bacterium">' + X.esc(p.bacterium) + '</td><td data-l="You">' + X.esc(p.you) + '</td><td data-l="Laptop">' + X.esc(p.laptop) + '</td>' +
        '<td class="up"><a href="tree.html#lane-' + p.key + '" title="From ' + X.esc(h[0].label) + ' to ' + X.esc(h[h.length - 1].label) + '">' + h.length + ' upgrades →</a></td></tr>';
    }).join('') + '</tbody>');

  // the seven acts: one panel each, opening the journey at that act's first stop
  $('actRule').innerHTML = X.ACTS.map(a => '<i style="--w:' + (a.i1 - a.i0 + 1) + ';--ac:' + a.color + '"></i>').join('');
  const acts = $('acts');
  acts.innerHTML = X.ACTS.map(a => {
    const stops = X.STOPS.filter(s => s.i >= a.i0 && s.i <= a.i1), s0 = stops[0];
    const star = stops.find(s => X.PLATES[s.epoch] && X.PLATES[s.epoch].file) || s0;
    const label = 'Act ' + a.n + ': ' + a.name + ', ' + a.span + ', ' + stops.length + ' stops';
    return '<a class="act-card" href="journey.html#' + s0.epoch + '" style="--ac:' + a.color + '" aria-label="' + X.esc(label) + '">' +
      '<span class="art">' + X.plateThumb(star.epoch, star.glyph) + '</span><span class="num">Act ' + a.n + '</span><b>' + X.esc(a.name) + '</b>' +
      '<span class="meta">' + X.esc(a.span) + '<span>' + stops.length + (stops.length === 1 ? ' stop' : ' stops') + ' · ' + X.esc(star.who) + '</span></span></a>';
  }).join('');
  const actsFade = () => acts.classList.toggle('more', acts.scrollWidth > acts.clientWidth + 4 && acts.scrollLeft + acts.clientWidth < acts.scrollWidth - 4);
  acts.addEventListener('scroll', actsFade, { passive: true });
  addEventListener('resize', actsFade);
  actsFade();

  // index.html#thread=neural opens that question on arrival
  const m = /thread=([\w-]+)/.exec(location.hash); if (m) openThread(m[1], true);
  // a floor in the hero links to its question with a plain #thread= link
  addEventListener('hashchange', () => { const h = /thread=([\w-]+)/.exec(location.hash); if (h && open !== h[1]) openThread(h[1], true); });
})();
