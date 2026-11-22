(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('journey');
  const $ = id => document.getElementById(id);
  const esc = X.esc;

  let cur = 0;
  let selPart = null;
  let openMyth = null;
  let tourOnly = false;
  let allGauges = false;
  let cmpIdx = 0;
  let cmpOpen = false;

  document.querySelectorAll('.n-stops').forEach(el => { el.textContent = X.STOPS.length; });

  /* ---------- act rail ---------- */
  $('actRail').innerHTML = X.ACTS.map(a => {
    const stops = X.STOPS.filter(s => s.i >= a.i0 && s.i <= a.i1);
    return '<button type="button" class="act-seg" data-act="' + a.n + '" style="--ac:' + a.color + ';--w:' + Math.max(2, stops.length) + '" title="Act ' + a.n + ': ' + esc(a.name) + '" aria-label="Act ' + a.n + ': ' + esc(a.name) + '">' +
      '<span class="an">' + a.n + '<span class="full"> · ' + esc(a.name) + '</span></span><span class="dots">' + stops.map(s => '<i data-i="' + s.i + '"' + (s.tour ? ' data-tour="1"' : '') + '></i>').join('') + '</span></button>';
  }).join('');
  $('actRail').addEventListener('click', ev => {
    const dot = ev.target.closest('i[data-i]');
    if (dot) { ev.stopPropagation(); select(Number(dot.dataset.i), false, true); return; }
    const b = ev.target.closest('[data-act]'); if (!b) return;
    const a = X.ACTS.find(x => x.n === b.dataset.act);
    const pool = tourOnly ? X.TOUR : X.STOPS;
    const first = pool.find(s => s.i >= a.i0 && s.i <= a.i1);
    select(first ? first.i : a.i0, false, true);
  });

  /* ---------- chart ---------- */
  const READ = 'Click any column or drag the slider to jump there. Each step up is ten times more.';
  $('legend').innerHTML = X.LEGEND;
  const ch = X.chart($('chart'), {
    height: 260,
    slider: $('slider'),
    onPick: i => select(i, false, true),
    onSlide: (i, done) => select(i, true, done ? 'slide' : 'live'),
    onHover: i => { $('readout').textContent = i == null ? READ : X.fmtTime(X.E[i].t) + ' · ' + (X.STOP[X.E[i].id] ? X.STOP[X.E[i].id].who + ': ' : '') + X.titleOf(i); }
  });

  // When "Key milestones (24)" is active, compare board upgrades and deltas against the previous milestone
  function prevBaseIdx(i) {
    if (i <= 0) return -1;
    if (!tourOnly) return i - 1;
    const prev = X.TOUR.filter(s => s.i < i).pop();
    return prev ? prev.i : 0;
  }

  /* ---------- card pieces ---------- */
  function gaugeRow(g, i, pIdx) {
    const v = X.E[i][g.k], p = pIdx >= 0 ? X.E[pIdx][g.k] : null;
    const [lo, hi] = X.RANGE[g.k];
    const w = v > 0 ? Math.max(3, (Math.log10(v) - lo) / ((hi - lo) || 1) * 100) : 0;
    const d = X.delta(v, p);
    const cls = d.charAt(0) === '−' ? 'down' : (d.charAt(0) === '×' || d === 'new') ? 'up' : '';
    return '<div class="g-row"><div class="g-label">' + g.label + '<span class="sym x-only">' + g.sym + '</span></div>' +
      '<div class="g-val">' + (X.COLOF[g.k] ? X.numBtn(X.COLOF[g.k], (g.fmt ? g.fmt(v) : X.sci(v)) + (g.unit ? ' <span class="g-unit">' + g.unit + '</span>' : ''), i) : (g.fmt ? g.fmt(v) : X.sci(v))) + '</div>' +
      '<div class="g-bar"><span style="width:' + w.toFixed(1) + '%;background:' + g.color + '"></span></div><div class="g-delta ' + cls + '">' + (d === 'same' ? '' : d) + '</div></div>';
  }
  function moved(g, i, pIdx) {
    if (pIdx < 0 || i === pIdx) return 0;
    const v = X.E[i][g.k], p = X.E[pIdx][g.k];
    if (v > 0 && p > 0) return Math.abs(Math.log10(v / p));
    return (v > 0) !== (p > 0) ? 99 : 0;
  }
  function citations(e, i) {
    const set = new Set((e.cites.match(/\d+/g) || []).map(Number));
    if (i != null) X.newAt(i).forEach(u => (u.refs || []).forEach(r => set.add(Number(r))));
    const nums = Array.from(set).filter(Boolean).sort((a, b) => a - b);
    return nums.length ? '<ol class="refs">' + nums.map(n => '<li value="' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol>' : '';
  }
  function rawTable(i) {
    const CEN = window.SI_CENSUS;
    if (!CEN) return '<p class="note">Loading all 72 census columns…</p>';
    const row = CEN.rows[i];
    return '<details class="evid-disc"><summary>All ' + CEN.columns.length + ' census columns for this moment</summary><div class="raw" style="margin-top:8px"><table><tbody>' +
      CEN.columns.map((c, k) => '<tr><th scope="row">' + esc(c) + '</th><td>' + esc(row[k]) + '</td></tr>').join('') + '</tbody></table></div></details>';
  }
  function needRaw() {
    if (!document.body.classList.contains('expert') || window.SI_CENSUS) return;
    X.loadCensus(() => { const b = $('rawBox'); if (b) b.innerHTML = rawTable(cur); });
  }
  document.addEventListener('si:expert', needRaw);

  const norm = t => t.toLowerCase().replace(/[^a-z0-9 ]+/g, '');
  const proper = t => t.match(/\b[A-Z][a-z]{4,}\b/g) || [];
  function othersOf(e, st) {
    const names = [st.who, st.taxon].map(norm).filter(Boolean);
    const words = proper(st.taxon).concat(proper(st.who.replace(/^\S+/, ''))).map(w => new RegExp('\\b' + norm(w).replace(/s$/, '')));
    return e.clade.split(/,\s*(?![^()]*\))/).filter(c => {
      const n = norm(c);
      return n && !names.some(x => n.includes(x)) && !words.some(w => w.test(n));
    }).join(', ');
  }

  function miniBoard(i, label) {
    const e = X.E[i];
    return '<figure class="mini"><figcaption>' + label + '</figcaption>' +
      '<div class="mini-nums"><span><b>' + X.sci(e.cells) + '</b> cells</span><span><b>' + X.sci(e.cneu) + '</b> nerve/s</span><span><b>' + X.sci(e.mexo) + '</b> outside bits</span><span><b>' + X.watts(e.ptot) + '</b></span></div>' +
      '<div class="mini-board">' + X.ORDER.map(k => {
        const p = X.PK[k], s = X.stateAt(k, i);
        return '<span class="' + (s ? '' : 'off') + '" style="--pc:' + p.color + '" title="' + p.name + '">' + (s ? esc(s.label) : 'Not yet') + '</span>';
      }).join('') + '</div></figure>';
  }

  function fmtRadius(m) {
    if (!m || m <= 0) return '';
    if (m >= 1000) return X.plain(m / 1000) + ' km';
    if (m >= 1) return X.plain(m) + ' m';
    return X.plain(m * 100) + ' cm';
  }

  // Each milestone card shows its own date: it may sit at a stop a little before or after it.
  function whenOf(t) {
    if (!(t > 0)) return 'Today';
    return (t * 1e6 < 10000 ? 'In ' : 'About ') + X.fmtTime(t);
  }

  // How a milestone's date is known (N1): evidence type, range and note, in the Expert block.
  const EVID = { fossil: 'Fossil', molecular_clock: 'Gene clock', living_inference: 'Inferred from living species', measured: 'Measured', estimate: 'Estimate' };
  function dateHtml(r) {
    if (!r.ev) return '';
    const range = (r.lo > 0 && r.hi > 0 && r.lo !== r.hi) ? ', between ' + X.fmtTime(r.hi) + ' and ' + X.fmtTime(r.lo) : '';
    return '<p class="spot-src">Date: ' + esc(EVID[r.ev] || r.ev) + range + (r.dn ? '. ' + esc(r.dn) : '') + (r.ds ? ' (' + esc(r.ds) + ')' : '') + '</p>';
  }

  // Plain title, date and sentence for everyone (principle 1); the formal name, circuit, counts and source in Expert view.
  function spotCard(r, neural) {
    const pills = [];
    if (neural) {
      if (r.neu > 0) pills.push('<b>' + X.sci(r.neu) + '</b> neurons');
      if (r.syn > 0) pills.push('<b>' + X.sci(r.syn) + '</b> synapses');
      if (r.vel > 0) pills.push('<b>' + (r.vel >= 1e5 ? X.sci(r.vel) + ' m/s' : X.plain(r.vel) + ' m/s') + '</b> signal speed');
      if (r.comp > 1) pills.push('<b>' + X.plain(r.comp) + ':1</b> sensory compression');
      if (r.tau > 0) pills.push('<b>' + (r.tau >= 3600 ? X.plain(r.tau / 3600) + ' hr' : X.plain(r.tau) + ' s') + '</b> horizon');
    } else {
      if (r.size > 0) pills.push('<b>' + X.sci(r.size) + '</b> members' + (r.range ? ' (' + esc(r.range) + ')' : ''));
      if (r.neu > 0) pills.push('<b>' + X.sci(r.neu) + '</b> collective neurons');
      if (r.rad > 0) pills.push('<b>' + fmtRadius(r.rad) + '</b> reach');
      if (r.ops > 0) pills.push('<b>' + X.sci(r.ops) + '/s</b> collective ops');
    }
    const all = neural ? (X.SI.neural || []).length : (X.SI.networks || []).length;
    return '<div class="spot-card" style="--sc:var(--c-' + (neural ? 'cpu' : 'net') + ')">' +
      '<span class="sub">' + (neural ? 'Brains and senses · ' + esc(r.stage) : 'Groups that coordinate · ' + esc(r.cat)) + '</span>' +
      '<h3>' + esc(r.pt) + '</h3><p class="spot-when">' + whenOf(r.t) + '</p><p>' + esc(r.px) + '</p>' +
      '<div class="x-only spot-x"><p class="spot-sys">' + esc(r.name) + ' · <span>' + esc(r.sys) + '</span></p>' +
      '<p class="spot-sys"><span>' + (neural ? 'Circuit: ' + esc(r.motif) : 'Channel: ' + esc(r.chan)) + '</span></p>' +
      (pills.length ? '<div class="spot-pills">' + pills.map(p => '<span>' + p + '</span>').join('') + '</div>' : '') +
      '<p>' + esc(r.why) + '</p>' + dateHtml(r) + '<p class="spot-src">Source: ' + esc(r.src) + '</p></div>' +
      '<p class="spot-foot"><a href="data.html#' + (neural ? 'neural' : 'networks') + '">All ' + all + (neural ? ' brain and sense milestones' : ' group networks') + ' →</a></p></div>';
  }

  function renderSpotlights(ep) {
    const cards = (X.NEURAL[ep] || []).map(n => spotCard(n, true)).concat((X.NETWORKS[ep] || []).map(g => spotCard(g, false)));
    if (!cards.length) return '';
    const SHOW = 3;
    return '<div class="spotlights">' + cards.slice(0, SHOW).join('') + '</div>' +
      (cards.length > SHOW ? '<details class="evid-disc sm-disc spot-more"><summary>' + (cards.length - SHOW) + ' more from around this time</summary><div class="spotlights">' + cards.slice(SHOW).join('') + '</div></details>' : '');
  }

  function renderCompare(i) {
    const other = cmpIdx === i ? (i > 0 ? 0 : X.N - 1) : cmpIdx;
    const opts = X.E.map((ep, k) => {
      const s = X.STOP[ep.id];
      return '<option value="' + k + '"' + (k === other ? ' selected' : '') + '>' + esc(X.fmtShort(ep.t) + ' · ' + (s ? s.who : X.titleOf(k))) + '</option>';
    }).join('');
    return '<details class="evid-disc compare-disc"' + (cmpOpen ? ' open' : '') + '><summary>Compare this stop side by side with another moment</summary>' +
      '<div class="cmp-body"><div class="cmp-pick"><label for="cmpSel">Compare against</label><select id="cmpSel">' + opts + '</select></div>' +
      '<div class="then-now">' +
      miniBoard(other, esc((X.STOP[X.E[other].id] ? X.STOP[X.E[other].id].who : X.titleOf(other)) + ' · ' + X.fmtShort(X.E[other].t))) +
      miniBoard(i, esc((X.STOP[X.E[i].id] ? X.STOP[X.E[i].id].who : X.titleOf(i)) + ' · ' + X.fmtShort(X.E[i].t))) +
      '</div></div></details>';
  }

  function renderCard() {
    const i = cur, e = X.E[i], a = X.actOf(i), st = X.STOP[e.id], crisis = X.CRISIS[e.id];
    const pIdx = prevBaseIdx(i);
    const news = X.INV.filter(u => u.i > pIdx && u.i <= i).sort((p, q) => X.ORDER.indexOf(p.part) - X.ORDER.indexOf(q.part));
    if (news.length && (!selPart || !news.some(u => u.part === selPart))) selPart = news[0].part;
    if (!selPart) selPart = 'cpu';
    const epi = X.EPI[e.epi] || { label: e.epi, lvl: 0, about: '' };
    const meter = '<span class="meter" aria-hidden="true">' + [1, 2, 3, 4].map(n => '<i class="' + (n <= epi.lvl ? 'on' : '') + '"></i>').join('') + '</span>';
    const card = $('card');
    card.className = 'card' + (crisis ? ' is-crisis' : '');
    card.style.setProperty('--ac', a.color);

    const band = '<div class="card-band"><span class="eyebrow">Act ' + a.n + ' · ' + esc(a.name) + ' · ' + X.fmtTime(e.t) + '</span>' +
      '<h2>' + esc(st ? st.who : X.titleOf(i)) + '</h2>' +
      (st ? '<p class="formal k-only"><i>' + esc(st.taxon) + '</i> · ' + esc(st.scale) + '</p>' : '') +
      '<p class="formal x-only mono" style="font-size:13px">' + e.id + ' · ' + esc(e.name) + ' · ' + esc(e.period) + '</p>' +
      '<div class="chips"><span class="chip" title="' + esc(epi.about) + '">' + meter + 'How sure: ' + esc(epi.label) + '</span>' +
      (st && st.tour ? '<span class="chip">Key milestone</span>' : '') +
      (crisis ? '<span class="chip crisis">Crisis: ' + esc(crisis) + '</span>' : '') +
      '<button type="button" class="btn sm ghost share" data-share="' + e.id + '">Copy link</button></div></div>';

    const near = X.stopsAround(i), nx = near.next || near.prev;
    const others = st ? othersOf(e, st) : e.clade;
    const around = others ? '<p class="dom"><b>Also around:</b> ' + esc(others) + '</p>' : '';
    const plate = st
      ? '<figure class="plate" style="--g:' + (crisis ? 'var(--crisis)' : a.color) + '">' + X.plateArt(e.id, st.glyph, st.who, true) + '<figcaption>' + X.plateCredit(e.id) + around + '</figcaption></figure>'
      : '<figure class="plate between" style="--g:' + X.actOf(nx.i).color + '">' + X.plateArt(nx.epoch, nx.glyph, nx.who, true) + '<figcaption>' +
        '<span class="sub">' + (near.next ? 'Next stop' : 'Last stop') + ' · ' + X.fmtShort(X.E[nx.i].t) + '</span><span class="who">' + esc(nx.who) + '</span>' +
        X.plateCredit(nx.epoch) + around + '</figcaption></figure>';

    const newLabel = tourOnly && pIdx < i - 1 ? 'Upgraded since the last milestone' : 'New right now';
    const lead = '<div class="lead">' + plate + '<div class="lead-story"><p class="hook">' + esc(X.hookOf(i)) + '</p>' +
      (news.length ? '<div class="new-now"><span class="sub">' + newLabel + '</span><div class="new-list">' + news.map(u => '<a class="part-chip" href="tree.html#' + u.id + '" style="--pc:' + X.PK[u.part].color + '">' + X.icon(u.part) + esc(u.label) + '</a>').join('') + '</div></div>' : '') +
      '</div></div>';

    const board = '<div class="board-col"><span class="sub">The best parts on Earth right now</span><div class="board">' +
      X.ORDER.map(k => {
        const p = X.PK[k], s = X.stateAt(k, i), isNew = s && s.i > pIdx && s.i <= i;
        return '<button type="button" class="slot' + (s ? '' : ' off') + (isNew ? ' new' : '') + (selPart === k ? ' sel' : '') + '" data-part="' + k + '" aria-pressed="' + (selPart === k) + '" style="--pc:' + p.color + ';--po:' + p.on + '">' +
          '<span class="sn">' + X.icon(k) + p.name + '</span><span class="sv">' + (s ? esc(s.label) : 'Not yet') + '</span>' + (isNew ? '<span class="pill">New</span>' : '') + '</button>';
      }).join('') + '</div><div class="pp" id="pp"></div></div>';

    const ranked = X.GAUGES.map((g, k) => ({ g, k, m: moved(g, i, pIdx) })).sort((p, q) => q.m - p.m || p.k - q.k);
    const top = ranked.slice(0, 3).sort((p, q) => p.k - q.k), rest = ranked.slice(3).sort((p, q) => p.k - q.k);
    const sg = e.gould, pct = Math.max(0, Math.min(100, sg / 18 * 100));
    const sinceTxt = tourOnly && pIdx < i - 1 ? 'biggest changes since the last milestone' : 'biggest changes since the last moment';
    const planet = '<div class="planet"><span class="sub">Earth at this moment <span class="k-only" style="text-transform:none;letter-spacing:0;font-weight:400">· ' + sinceTxt + '</span></span>' +
      '<div class="gauges">' + top.map(x => gaugeRow(x.g, i, pIdx)).join('') + '</div>' +
      '<details class="more-g"' + (allGauges ? ' open' : '') + '><summary>Show all ' + X.GAUGES.length + ' numbers</summary><div class="gauges">' + rest.map(x => gaugeRow(x.g, i, pIdx)).join('') + '</div></details>' +
      '<div class="tail"><span class="sub">The long tail</span><div class="tail-track"><span class="tail-dot" style="left:' + pct.toFixed(1) + '%"></span></div>' +
      '<div class="tail-scale"><span>typical cell</span><span>10¹⁸× more</span></div>' +
      '<p>Most cells are still simple microbes doing about 850 operations a second. The most capable single thing alive does ' + X.sci(e.cmax) + (sg > 0 ? ', about ' + X.sci(Math.pow(10, sg)) + ' times more.' : ', no more than a typical microbe today.') + '<span class="x-only"> σ_Gould = ' + sg.toFixed(2) + ' dex.</span></p></div>' +
      '<dl class="world"><div><dt>Surface</dt><dd>' + X.numBtn('surface_temp_c', X.plain(e.temp) + ' °C', i) + '</dd></div><div><dt>Oxygen</dt><dd>' + X.numBtn('atm_o2_pct', X.sci(e.o2) + '%', i) + '</dd></div><div><dt>CO₂</dt><dd>' + X.numBtn('atm_co2_ppm', Math.round(e.co2).toLocaleString('en-US') + ' ppm', i) + '</dd></div>' +
      '<div class="wide"><dt>The map</dt><dd>' + esc(e.cont) + '</dd></div></dl></div>';

    const myths = X.MYTHS.filter(m => m.epochs.indexOf(e.id) >= 0);
    if (openMyth && !myths.some(m => m.id === openMyth)) openMyth = null;
    const evid = '<details class="evid-disc x-only"><summary>Evidence &amp; sources for this stop (' + esc(epi.label) + ')</summary>' +
      '<div class="evid-body"><p class="note"><b>What happened:</b> ' + esc(e.key) + (e.shock ? '<br><b>Context:</b> ' + esc(e.shock) : '') + '<br><b>Span:</b> ' + esc(e.dur) + ' · <b>How sure:</b> ' + esc(epi.label) + ' — ' + esc(epi.about) + '</p>' +
      citations(e, i) + '<p class="evid-links"><a href="data.html#' + e.id + '">Inspect this row in the Data Lab →</a></p></div></details>';

    const story = '<div class="story">' +
      renderSpotlights(e.id) +
      (myths.length ? '<div class="know"><span class="sub">Myth busters</span>' + myths.map(m => '<button type="button" class="myth-chip" data-myth="' + m.id + '" aria-expanded="' + (openMyth === m.id) + '">' + esc(m.title) + '</button>').join('') + '</div><div id="mythbox"></div>' : '') +
      renderCompare(i) +
      evid +
      '<div class="lab x-only"><h3><span class="tag">EXPERT</span>Derivation &amp; raw census row ' + e.id + '</h3>' +
      '<pre class="formula">' + esc(e.formula.split('; ').join('\n')) + '</pre><div id="rawBox">' + rawTable(i) + '</div></div></div>';

    const finale = i === X.N - 1
      ? '<section class="finale" aria-labelledby="finH"><h3 id="finH">You crossed 4.1 billion years across ' + (tourOnly ? X.TOUR.length + ' key milestones' : X.STOPS.length + ' stops') + '.</h3>' +
        '<p>The same nine parts, then and now. Every box on the right rests on something older on the left.</p>' +
        '<div class="then-now">' + miniBoard(0, 'Then · ' + X.fmtTime(X.E[0].t)) + miniBoard(i, 'Now · ' + X.fmtTime(e.t)) + '</div>' +
        '<div class="cta"><a class="btn" href="tree.html">Follow a guided path in the tree →</a><a class="btn ghost" href="how.html">Check our numbers</a></div></section>'
      : '';

    card.innerHTML = band + '<div class="card-body">' + lead + '<div class="card-grid">' + board + planet + '</div>' + story + '<div class="minds" id="minds" hidden></div>' + finale + '</div>';
    const sel = $('cmpSel');
    if (sel) sel.addEventListener('change', ev => { cmpIdx = Number(ev.target.value); cmpOpen = true; renderCard(); $('cmpSel').focus(); });
    renderMinds();
    renderPart();
    renderMyth();
    needRaw();
  }

  function renderMinds() {
    const at = cur;
    X.loadAtlas(A => {
      const box = $('minds');
      if (!A || !box || at !== cur) return;
      const a = X.actOf(cur), yr = t => Math.max(1, t * 1e6);
      const hi = yr(X.E[a.i0].t) * 1.0001, lo = a.i1 + 1 < X.N ? yr(X.E[a.i1 + 1].t) : 0;
      const here = Math.log10(yr(X.E[cur].t));
      const pick = A.systems.filter(d => d[1] <= hi && d[1] > lo)
        .sort((p, q) => (p[4] - q[4]) || (Math.abs(Math.log10(p[1]) - here) - Math.abs(Math.log10(q[1]) - here)))
        .slice(0, 3);
      if (!pick.length) return;
      box.hidden = false;
      box.innerHTML = '<span class="sub">Other minds from this act</span><ul>' + pick.map(d => '<li><i style="--k:' + X.KIND[d[3]].color + '"></i>' + esc(d[0]) + '<span>' + esc(X.yearsAgo(d[1])) + ' · ' + X.sci(d[2]) + ' operations a second</span></li>').join('') +
        '</ul><a href="atlas.html#kind=' + pick[0][3] + '">See all ' + A.systems.length + ' in the atlas of minds →</a>';
    });
  }

  function renderPart() {
    const k = selPart, p = X.PK[k], s = X.stateAt(k, cur);
    const pp = $('pp');
    pp.style.setProperty('--pc', p.color);
    const invRefs = s && s.refs && s.refs.length
      ? '<details class="evid-disc sm-disc x-only"><summary>Sources for ' + esc(s.label) + ' (' + s.refs.length + ')</summary><ol class="refs">' + s.refs.map(n => '<li value="' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol></details>'
      : '';
    pp.innerHTML = '<div class="pp-head"><strong>' + p.name + '</strong><span>' + p.question + '</span></div>' +
      '<p class="pp-detail">' + (s ? esc(s.detail) : 'Nothing on Earth has this part yet.') + '</p>' + X.invMore(s) +
      '<ol class="pp-hist" aria-label="History of this part">' + X.HIST[k].map(u => '<li><button type="button" data-jump="' + u.i + '" class="' + (u.i > cur ? 'future' : '') + (s === u ? ' now' : '') + '"><span class="when">' + X.fmtShort(X.E[u.i].t) + '</span>' + esc(u.label) + '</button></li>').join('') + '</ol>' +
      invRefs +
      (s ? '<a href="tree.html#' + s.id + '">Follow ' + esc(s.label) + ' in the tree →</a>' : '');
    document.querySelectorAll('.slot').forEach(b => { const on = b.dataset.part === k; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', String(on)); });
  }

  function renderMyth() {
    const box = $('mythbox'); if (!box) return;
    document.querySelectorAll('.myth-chip').forEach(b => b.setAttribute('aria-expanded', String(b.dataset.myth === openMyth)));
    const m = X.MYTHS.find(x => x.id === openMyth);
    box.innerHTML = m ? '<div class="mythbox"><div class="vs"><div><span class="sub">The popular estimate</span><p class="bad">' + esc(m.myth) + '</p></div><div><span class="sub">What the evidence says</span><p class="good">' + esc(m.measured) + '</p></div></div><p>' + esc(m.why) + '</p><a href="how.html#' + m.id + '">More on how we know →</a></div>' : '';
  }

  /* ---------- navigation ---------- */
  function posText() {
    if (tourOnly) {
      const idx = X.TOUR.findIndex(s => s.i === cur);
      return idx >= 0 ? 'Milestone ' + (idx + 1) + ' / ' + X.TOUR.length : 'Stop ' + (cur + 1) + ' / ' + X.N;
    }
    return 'Stop ' + (cur + 1) + ' / ' + X.STOPS.length;
  }
  function setMeta(prop, val) {
    const el = document.querySelector('meta[property="' + prop + '"], meta[name="' + prop + '"]');
    if (el) el.setAttribute('content', val);
  }
  function select(i, keepScroll, push) {
    cur = Math.max(0, Math.min(X.N - 1, i));
    renderCard(); ch.select(cur);
    $('pos').textContent = posText();
    $('prev').disabled = cur === 0; $('next').disabled = cur === X.N - 1;
    const a = X.actOf(cur), e = X.E[cur], st = X.STOP[e.id];
    const mTitle = (st ? st.who : X.titleOf(cur)) + ' (' + X.fmtShort(e.t) + ') · The Journey · Systema Intelligentiae';
    const mDesc = X.hookOf(cur);
    const mImg = 'assets/og/' + e.id + '.png';
    document.title = mTitle;
    setMeta('og:title', mTitle); setMeta('twitter:title', mTitle);
    setMeta('og:description', mDesc); setMeta('twitter:description', mDesc);
    setMeta('og:image', mImg); setMeta('twitter:image', mImg);
    document.querySelectorAll('.act-seg').forEach(b => b.classList.toggle('on', b.dataset.act === a.n));
    document.querySelectorAll('.act-seg .dots i').forEach(d => {
      d.classList.toggle('on', Number(d.dataset.i) === cur);
      d.classList.toggle('dim', tourOnly && !d.dataset.tour && Number(d.dataset.i) !== cur);
    });
    $('actNow').textContent = 'Act ' + a.n + ' · ' + a.name;
    const hash = '#' + X.E[cur].id;
    try {
      if (push === 'live') { /* wait for drag end */ }
      else if (push === 'slide') {
        if (history.state && history.state.slide) history.replaceState({ slide: true }, '', hash);
        else if (location.hash !== hash) history.pushState({ slide: true }, '', hash);
      }
      else if (push && location.hash !== hash) history.pushState(null, '', hash);
      else history.replaceState(null, '', hash);
    } catch (e) { /* ignore */ }
    X.writeLast(cur);
    if (!keepScroll) {
      const top = $('actRail').getBoundingClientRect().top;
      if (top < 0) window.scrollBy({ top: top - 12, behavior: 'auto' });
    }
  }
  function move(dir) {
    if (tourOnly) {
      const list = X.TOUR.map(s => s.i);
      const t = dir > 0 ? list.find(x => x > cur) : list.slice().reverse().find(x => x < cur);
      if (t !== undefined) select(t);
    } else select(cur + dir);
  }
  $('prev').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('first').addEventListener('click', () => select(0));
  $('today').addEventListener('click', () => select(X.N - 1));
  $('tourOnly').addEventListener('change', ev => { tourOnly = ev.target.checked; select(cur, true); });
  $('card').addEventListener('click', ev => {
    const slot = ev.target.closest('.slot'); if (slot) { selPart = slot.dataset.part; renderPart(); return; }
    const j = ev.target.closest('[data-jump]'); if (j) { select(Number(j.dataset.jump), true, true); return; }
    const m = ev.target.closest('.myth-chip'); if (m) { openMyth = openMyth === m.dataset.myth ? null : m.dataset.myth; renderMyth(); return; }
    const sh = ev.target.closest('[data-share]'); if (sh) copyLink(sh);
  });
  function copyLink(btn) {
    const url = new URL('s/' + btn.dataset.share + '.html', location.href).href;
    const done = ok => {
      $('shareMsg').textContent = ok ? 'Link copied' : 'Copy failed. The link is ' + url;
      btn.textContent = ok ? 'Link copied ✓' : 'Copy link';
      if (!ok) { try { window.prompt('Copy this link:', url); } catch (e) { /* prompts blocked */ } }
      setTimeout(() => { if (btn.isConnected) btn.textContent = 'Copy link'; }, 2200);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
    else done(false);
  }
  $('card').addEventListener('toggle', ev => {
    if (!ev.target.classList) return;
    if (ev.target.classList.contains('more-g')) allGauges = ev.target.open;
    if (ev.target.classList.contains('compare-disc')) cmpOpen = ev.target.open;
  }, true);
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    const ae = document.activeElement;
    if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
    ev.preventDefault(); move(ev.key === 'ArrowRight' ? 1 : -1);
  });
  window.addEventListener('popstate', () => {
    const k = X.IDX[(location.hash || '').slice(1)];
    if (k !== undefined && k !== cur) select(k, true);
  });

  const h = (location.hash || '').slice(1);
  const last = X.readLast();
  if (X.IDX[h] === undefined && last) {
    const r = $('resume');
    r.innerHTML = '<a href="#' + X.E[last].id + '">Continue at ' + esc(X.placeOf(last)) + ' →</a>';
    r.hidden = false;
    r.querySelector('a').addEventListener('click', ev => { ev.preventDefault(); r.hidden = true; select(last, false, true); });
  }
  select(X.IDX[h] !== undefined ? X.IDX[h] : 0, true);
})();
