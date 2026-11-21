(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('journey');
  const $ = id => document.getElementById(id);
  const esc = X.esc;

  let cur = 0;
  let selPart = null;
  let openMyth = null;
  let stopsOnly = true;
  let allGauges = false;

  document.querySelectorAll('.n-stops').forEach(el => { el.textContent = X.STOPS.length; });

  /* ---------- act rail ---------- */
  $('actRail').innerHTML = X.ACTS.map(a => {
    const stops = X.STOPS.filter(s => s.i >= a.i0 && s.i <= a.i1);
    return '<button type="button" class="act-seg" data-act="' + a.n + '" style="--ac:' + a.color + ';--w:' + Math.max(2, stops.length) + '" title="Act ' + a.n + ': ' + esc(a.name) + '" aria-label="Act ' + a.n + ': ' + esc(a.name) + '">' +
      '<span class="an">' + a.n + '<span class="full"> · ' + esc(a.name) + '</span></span><span class="dots">' + stops.map(s => '<i data-i="' + s.i + '"></i>').join('') + '</span></button>';
  }).join('');
  $('actRail').addEventListener('click', ev => {
    const b = ev.target.closest('[data-act]'); if (!b) return;
    const a = X.ACTS.find(x => x.n === b.dataset.act);
    const first = X.STOPS.find(s => s.i >= a.i0 && s.i <= a.i1);
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

  /* ---------- card pieces ---------- */
  function gaugeRow(g, i) {
    const v = X.E[i][g.k], p = i > 0 ? X.E[i - 1][g.k] : null;
    const [lo, hi] = X.RANGE[g.k];
    const w = v > 0 ? Math.max(3, (Math.log10(v) - lo) / ((hi - lo) || 1) * 100) : 0;
    const d = X.delta(v, p);
    const cls = d.charAt(0) === '−' ? 'down' : (d.charAt(0) === '×' || d === 'new') ? 'up' : '';
    return '<div class="g-row"><div class="g-label">' + g.label + '<span class="sym x-only">' + g.sym + '</span></div>' +
      '<div class="g-val">' + (X.COLOF[g.k] ? X.numBtn(X.COLOF[g.k], (g.fmt ? g.fmt(v) : X.sci(v)) + (g.unit ? ' <span class="g-unit">' + g.unit + '</span>' : ''), i) : (g.fmt ? g.fmt(v) : X.sci(v))) + '</div>' +
      '<div class="g-bar"><span style="width:' + w.toFixed(1) + '%;background:' + g.color + '"></span></div><div class="g-delta ' + cls + '">' + (d === 'same' ? '' : d) + '</div></div>';
  }
  // the three numbers that moved most since the last moment lead; ties keep the fixed gauge order
  function moved(g, i) {
    if (i === 0) return 0;
    const v = X.E[i][g.k], p = X.E[i - 1][g.k];
    if (v > 0 && p > 0) return Math.abs(Math.log10(v / p));
    return (v > 0) !== (p > 0) ? 99 : 0;
  }
  function citations(e) {
    const nums = e.cites.match(/\d+/g) || [];
    return nums.length ? '<ol class="refs">' + nums.map(n => '<li value="' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol>' : '';
  }
  function rawTable(i) {
    const CEN = window.SI_CENSUS;
    if (!CEN) return '<p class="note">Loading all 72 census columns…</p>';
    const row = CEN.rows[i];
    return '<details><summary style="cursor:pointer;font-weight:700">All ' + CEN.columns.length + ' census columns for this moment</summary><div class="raw" style="margin-top:8px"><table><tbody>' +
      CEN.columns.map((c, k) => '<tr><th>' + esc(c) + '</th><td>' + esc(row[k]) + '</td></tr>').join('') + '</tbody></table></div></details>';
  }
  function needRaw() {
    if (!document.body.classList.contains('expert') || window.SI_CENSUS) return;
    X.loadCensus(() => { const b = $('rawBox'); if (b) b.innerHTML = rawTable(cur); });
  }
  document.addEventListener('si:expert', needRaw);

  // "Also around" lists the moment's other life, so it drops entries that name the star: its name, its
  // taxon, or a proper name inside either ("Lystrosaurus" in "Lystrosaurus survives", "Charnia" in
  // "Trichoplax & Charnia"; the name's first word is skipped, since "Early" or "Walking" are too generic)
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

  // a small copy of the board, for the finale's then-and-now
  function miniBoard(i, label) {
    return '<figure class="mini"><figcaption>' + label + '</figcaption><div class="mini-board">' + X.ORDER.map(k => {
      const p = X.PK[k], s = X.stateAt(k, i);
      return '<span class="' + (s ? '' : 'off') + '" style="--pc:' + p.color + '" title="' + p.name + '">' + (s ? esc(s.label) : 'Not yet') + '</span>';
    }).join('') + '</div></figure>';
  }

  function renderCard() {
    const i = cur, e = X.E[i], a = X.actOf(i), st = X.STOP[e.id], news = X.newAt(i), crisis = X.CRISIS[e.id];
    if (news.length && (!selPart || !news.some(u => u.part === selPart))) selPart = news[0].part;
    if (!selPart) selPart = 'cpu';
    const epi = X.EPI[e.epi] || { label: e.epi, lvl: 0, about: '' };
    const meter = '<span class="meter" aria-hidden="true">' + [1, 2, 3, 4].map(n => '<i class="' + (n <= epi.lvl ? 'on' : '') + '"></i>').join('') + '</span>';
    const card = $('card');
    card.className = 'card' + (crisis ? ' is-crisis' : '');
    card.style.setProperty('--ac', a.color);

    // the band names the moment once: who, what, how big
    const band = '<div class="card-band"><span class="eyebrow">Act ' + a.n + ' · ' + esc(a.name) + ' · ' + X.fmtTime(e.t) + '</span>' +
      '<h2>' + esc(st ? st.who : X.titleOf(i)) + '</h2>' +
      (st ? '<p class="formal k-only"><i>' + esc(st.taxon) + '</i> · ' + esc(st.scale) + '</p>' : '') +
      '<p class="formal x-only mono" style="font-size:13px">' + e.id + ' · ' + esc(e.name) + ' · ' + esc(e.period) + '</p>' +
      '<div class="chips"><span class="chip" title="' + esc(epi.about) + '">' + meter + 'How sure: ' + esc(epi.label) + '</span>' +
      (crisis ? '<span class="chip crisis">Crisis: ' + esc(crisis) + '</span>' : '') +
      '<button type="button" class="btn sm ghost share" data-share="' + e.id + '">Copy link</button></div></div>';

    // between stops, the plate shows the next stop's creature faded, with hops to the stops on either side
    const near = X.stopsAround(i), nx = near.next || near.prev;
    const others = st ? othersOf(e, st) : e.clade;
    const around = others ? '<p class="dom"><b>Also around:</b> ' + esc(others) + '</p>' : '';
    const plate = st
      ? '<figure class="plate" style="--g:' + (crisis ? 'var(--crisis)' : a.color) + '">' + X.plateArt(e.id, st.glyph, st.who) + '<figcaption>' + X.plateCredit(e.id) + around + '</figcaption></figure>'
      : '<figure class="plate between" style="--g:' + X.actOf(nx.i).color + '">' + X.plateArt(nx.epoch, nx.glyph, nx.who) + '<figcaption>' +
        '<span class="sub">' + (near.next ? 'Next stop' : 'Last stop') + ' · ' + X.fmtShort(X.E[nx.i].t) + '</span><span class="who">' + esc(nx.who) + '</span>' +
        '<span class="hop">' + (near.prev ? '<button type="button" class="btn ghost sm" data-jump="' + near.prev.i + '" title="' + esc(near.prev.who) + '" aria-label="Last stop: ' + esc(near.prev.who) + '">← Last stop</button>' : '') +
        (near.next ? '<button type="button" class="btn ghost sm" data-jump="' + near.next.i + '" title="' + esc(near.next.who) + '" aria-label="Next stop: ' + esc(near.next.who) + '">Next stop →</button>' : '') + '</span>' +
        X.plateCredit(nx.epoch) + around + '</figcaption></figure>';

    // story first: what happened, and what is new, right beside the creature
    const lead = '<div class="lead">' + plate + '<div class="lead-story"><p class="hook">' + esc(X.hookOf(i)) + '</p>' +
      (news.length ? '<div class="new-now"><span class="sub">New right now</span><div class="new-list">' + news.map(u => '<a class="part-chip" href="tree.html#' + u.id + '" style="--pc:' + X.PK[u.part].color + '">' + X.icon(u.part) + esc(u.label) + '</a>').join('') + '</div></div>' : '') +
      '</div></div>';

    const board = '<div class="board-col"><span class="sub">The best parts on Earth right now</span><div class="board">' +
      X.ORDER.map(k => {
        const p = X.PK[k], s = X.stateAt(k, i), isNew = s && s.i === i;
        return '<button type="button" class="slot' + (s ? '' : ' off') + (isNew ? ' new' : '') + (selPart === k ? ' sel' : '') + '" data-part="' + k + '" aria-pressed="' + (selPart === k) + '" style="--pc:' + p.color + ';--po:' + p.on + '">' +
          '<span class="sn">' + X.icon(k) + p.name + '</span><span class="sv">' + (s ? esc(s.label) : 'Not yet') + '</span>' + (isNew ? '<span class="pill">New</span>' : '') + '</button>';
      }).join('') + '</div><div class="pp" id="pp"></div></div>';

    const ranked = X.GAUGES.map((g, k) => ({ g, k, m: moved(g, i) })).sort((p, q) => q.m - p.m || p.k - q.k);
    const top = ranked.slice(0, 3).sort((p, q) => p.k - q.k), rest = ranked.slice(3).sort((p, q) => p.k - q.k);
    const sg = e.gould, pct = Math.max(0, Math.min(100, sg / 18 * 100));
    const planet = '<div class="planet"><span class="sub">Earth at this moment <span class="k-only" style="text-transform:none;letter-spacing:0;font-weight:400">· biggest changes since the last moment</span></span>' +
      '<div class="gauges">' + top.map(x => gaugeRow(x.g, i)).join('') + '</div>' +
      '<details class="more-g"' + (allGauges ? ' open' : '') + '><summary>Show all ' + X.GAUGES.length + ' numbers</summary><div class="gauges">' + rest.map(x => gaugeRow(x.g, i)).join('') + '</div></details>' +
      '<div class="tail"><span class="sub">The long tail</span><div class="tail-track"><span class="tail-dot" style="left:' + pct.toFixed(1) + '%"></span></div>' +
      '<div class="tail-scale"><span>typical cell</span><span>10¹⁸× more</span></div>' +
      '<p>Most cells are still simple microbes doing about 850 operations a second. The most capable single thing alive does ' + X.sci(e.cmax) + (sg > 0 ? ', about ' + X.sci(Math.pow(10, sg)) + ' times more.' : ', no more than a typical microbe today.') + '<span class="x-only"> σ_Gould = ' + sg.toFixed(2) + ' dex.</span></p></div>' +
      '<dl class="world"><div><dt>Surface</dt><dd>' + X.numBtn('surface_temp_c', X.plain(e.temp) + ' °C', i) + '</dd></div><div><dt>Oxygen</dt><dd>' + X.numBtn('atm_o2_pct', X.sci(e.o2) + '%', i) + '</dd></div><div><dt>CO₂</dt><dd>' + X.numBtn('atm_co2_ppm', Math.round(e.co2).toLocaleString('en-US') + ' ppm', i) + '</dd></div>' +
      '<div class="wide"><dt>The map</dt><dd>' + esc(e.cont) + '</dd></div></dl></div>';

    const myths = X.MYTHS.filter(m => m.epochs.indexOf(e.id) >= 0);
    if (openMyth && !myths.some(m => m.id === openMyth)) openMyth = null;
    const story = '<div class="story">' +
      (myths.length ? '<div class="know"><span class="sub">Myth busters</span>' + myths.map(m => '<button type="button" class="myth-chip" data-myth="' + m.id + '" aria-expanded="' + (openMyth === m.id) + '">' + esc(m.title) + '</button>').join('') + '</div><div id="mythbox"></div>' : '') +
      '<div class="lab x-only"><h3><span class="tag">EXPERT</span>Census row ' + e.id + '</h3>' +
      '<p class="note"><b>Key event:</b> ' + esc(e.key) + '<br><b>Shock note:</b> ' + esc(e.shock) + '<br><b>Duration:</b> ' + esc(e.dur) + ' · <b>Evidence class:</b> ' + esc(e.epi) + '</p>' +
      '<pre class="formula">' + esc(e.formula.split('; ').join('\n')) + '</pre>' + citations(e) + '<div id="rawBox">' + rawTable(i) + '</div>' +
      '<a href="data.html#' + e.id + '">Open in the Data Lab →</a></div></div>';

    const finale = i === X.N - 1
      ? '<section class="finale" aria-labelledby="finH"><h3 id="finH">You crossed 4.1 billion years in ' + X.STOPS.length + ' stops.</h3>' +
        '<p>The same nine parts, then and now. Every box on the right rests on something older on the left.</p>' +
        '<div class="then-now">' + miniBoard(0, 'Then · ' + X.fmtTime(X.E[0].t)) + miniBoard(i, 'Now · ' + X.fmtTime(e.t)) + '</div>' +
        '<div class="cta"><a class="btn" href="tree.html">Follow a thread in the tree →</a><a class="btn ghost" href="how.html">Check our numbers</a></div></section>'
      : '';

    card.innerHTML = band + '<div class="card-body">' + lead + '<div class="card-grid">' + board + planet + '</div>' + story + '<div class="minds" id="minds" hidden></div>' + finale + '</div>';
    renderMinds();
    renderPart();
    renderMyth();
    needRaw();
  }
  // three catalog systems whose kind first appeared in this act, nearest in time to this moment
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
      ? '<div class="inv-refs x-only"><span class="sub">Sources for ' + esc(s.label) + '</span><ol class="refs">' + s.refs.map(n => '<li value="' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol></div>'
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
    const st = X.STOP[X.E[cur].id];
    if (stopsOnly) return st ? 'Stop ' + (st.n + 1) + ' / ' + X.STOPS.length : 'Moment ' + (cur + 1) + ' / ' + X.N;
    return 'Moment ' + (cur + 1) + ' / ' + X.N;
  }
  // jumps (rail, chart, slider, history strip) push a history entry so browser Back returns to the last stop;
  // stepping with Next/Back replaces it, so 40 clicks don't fill the history; while the slider is
  // being dragged ('live') the URL waits for the drag to end, and a run of slider moves ('slide',
  // e.g. arrow keys) shares one entry so Back returns to where the sliding started
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
    document.querySelectorAll('.act-seg .dots i').forEach(d => d.classList.toggle('on', Number(d.dataset.i) === cur));
    $('actNow').textContent = 'Act ' + a.n + ' · ' + a.name;
    const hash = '#' + X.E[cur].id;
    try {
      if (push === 'live') { /* wait for the drag to end */ }
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
    if (stopsOnly) {
      const list = X.STOPS.map(s => s.i);
      const t = dir > 0 ? list.find(x => x > cur) : list.slice().reverse().find(x => x < cur);
      if (t !== undefined) select(t);
    } else select(cur + dir);
  }
  $('prev').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('first').addEventListener('click', () => select(0));
  $('today').addEventListener('click', () => select(X.N - 1));
  $('stopsOnly').addEventListener('change', ev => { stopsOnly = ev.target.checked; $('pos').textContent = posText(); });
  $('card').addEventListener('click', ev => {
    const slot = ev.target.closest('.slot'); if (slot) { selPart = slot.dataset.part; renderPart(); return; }
    const j = ev.target.closest('[data-jump]'); if (j) { select(Number(j.dataset.jump), true, true); return; }
    const m = ev.target.closest('.myth-chip'); if (m) { openMyth = openMyth === m.dataset.myth ? null : m.dataset.myth; renderMyth(); return; }
    const sh = ev.target.closest('[data-share]'); if (sh) copyLink(sh);
  });
  // share pages (s/<moment>.html) carry that moment's own title, hook and preview card, then forward here
  function copyLink(btn) {
    const url = new URL('s/' + btn.dataset.share + '.html', location.href).href;
    const done = ok => {
      $('shareMsg').textContent = ok ? 'Link copied' : 'Copy failed. The link is ' + url;
      btn.textContent = ok ? 'Link copied ✓' : 'Copy link';
      if (!ok) { try { window.prompt('Copy this link:', url); } catch (e) { /* prompts blocked: the live region already carries the link */ } }
      setTimeout(() => { if (btn.isConnected) btn.textContent = 'Copy link'; }, 2200);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
    else done(false);
  }
  $('card').addEventListener('toggle', ev => { if (ev.target.classList && ev.target.classList.contains('more-g')) allGauges = ev.target.open; }, true);
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

  // with no moment in the URL, start at the beginning and offer the last place this reader stopped
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
