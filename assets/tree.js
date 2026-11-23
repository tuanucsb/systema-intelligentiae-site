(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('tree');
  const $ = id => document.getElementById(id);
  const esc = X.esc;
  const canvas = $('canvas'), wrapC = $('wrapC'), headInner = $('laneHeadInner'), drawer = $('drawer'), shell = document.querySelector('.tree-shell');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PATHS = [
    {
      key: 'neural',
      label: 'How neural computation evolved',
      color: 'var(--c-cpu)',
      about: 'From spare synapse proteins and jellyfish nerve nets to octopus arm cords, bird forebrains, human cortex and reasoning AI.',
      steps: ['synapse-kit', 'bioelectric', 'neurons', 'three-part-brain', 'distributed-arms', 'reinforcing', 'escape-reflex', 'myelin', 'mushroom-bodies', 'three-layer-pallium', 'neocortex', 'flight-controller', 'dense-pallium', 'folded-cortex', 'mentalizing', 'parietal-visuomotor', 'hierarchical-planning', 'speaking', 'gpus', 'transformers', 'reasoning'].filter(id => X.INVK[id])
    },
    {
      key: 'networks',
      label: 'Animal & human communication networks',
      color: 'var(--c-net)',
      about: 'How separate cells, coral clones, fish schools, bird flocks, insect colonies, animal families, whale pods and human societies wire up as one.',
      steps: ['quorum', 'multicellular', 'reef-colonies', 'schools', 'wood-wide-web', 'eusocial', 'family-care', 'flocks', 'vocal-pods', 'primate-troops', 'matriarch-clans', 'hunting-bands', 'tribes', 'villages', 'city-states', 'coinage-markets', 'empires', 'journals', 'arpanet', 'web', 'planetary-net'].filter(id => X.INVK[id])
    },
    {
      key: 'memory',
      label: 'How memory left the body',
      color: 'var(--c-backup)',
      about: 'From RNA and DNA inside cells to synapse weights, struck stone, ochre, clay tokens, alphabets, rag paper, print and 15 zettabytes.',
      steps: ['rna', 'dna', 'chromatin', 'synaptic-weights', 'stone-tools', 'engraved-symbols', 'cave-art', 'clay-tokens', 'cuneiform', 'alphabet', 'codex', 'paper-mills', 'printing', 'digital-storage', 'zettabytes'].filter(id => X.INVK[id])
    },
    {
      key: 'senses',
      label: 'Senses & edge computing',
      color: 'var(--c-io)',
      about: 'From molecules bumping a wall to 16,000-lens compound eyes, water-ripple sensors, whiskers, 100:1 retinal edge compression and sonar.',
      steps: ['contact-chem', 'chemoreceptors', 'eyespot', 'compound-eyes', 'lateral-line', 'eyes-in-air', 'whiskers-turbinals', 'middle-ear', 'color-fovea', 'echolocation', 'bipedal-gait', 'tool-hands'].filter(id => X.INVK[id])
    },
    {
      key: 'bennett',
      label: 'Bennett’s 5 brain breakthroughs',
      color: 'var(--c-prog)',
      about: 'Max Bennett’s five vertebrate control layers—Steering, Reinforcing, Simulating, Mentalizing and Speaking—plus how AI jumped straight to language.',
      steps: ['steering', 'reinforcing', 'simulating', 'mentalizing', 'speaking', 'transformers', 'reasoning'].filter(id => X.INVK[id])
    },
    {
      key: 'symbio',
      label: 'Symbiogenesis & mergers (Agüera y Arcas)',
      color: 'var(--c-net)',
      about: 'Blaise Agüera y Arcas’s lens: major leaps happen when separate replicators merge—from self-copying tapes and mitochondria to human-AI networks.',
      steps: ['self-copying', 'syntrophy', 'endosymbiosis', 'mitochondria', 'chloroplast', 'multicellular', 'wood-wide-web', 'eusocial', 'stored-programs', 'transformers', 'planetary-net'].filter(id => X.INVK[id])
    },
    {
      key: 'making',
      label: 'Replication, reproduction & manufacturing',
      color: 'var(--c-make)',
      about: 'How life and technology make more of themselves: RNA templates, cell division, embryos, castes, stone tools, movable type, lathes, synthetic cells and EUV chip fabs.',
      steps: ['template-copying', 'binary-fission', 'mitotic-spindle', 'germline-embryo', 'hox-body-plan', 'spores-seeds', 'metamorphosis', 'queen-castes', 'live-birth-milk', 'knapped-manufacture', 'selective-breeding', 'movable-type-molds', 'machine-tools', 'photolithography', 'synthetic-cell', 'euv-fabs-synbio', 'ai-assisted-design'].filter(id => X.INVK[id])
    },
    {
      key: 'dna',
      label: 'How DNA & genomes evolved',
      color: 'var(--c-store)',
      about: 'From 200-letter self-copying RNA and LUCA’s 2.5M DNA letters to spool-packed chromosomes, whole-genome doublings, flowers, reading DNA, synthetic cells and CRISPR.',
      steps: ['rna', 'genetic-code', 'dna', 'gene-swapping', 'crispr-immunity', 'chromatin', 'organelle-transfer', 'sex', 'genome-doublings', 'polyploid-genomes', 'lean-genomes', 'flowering-genomes', 'human-genome', 'agriculture', 'dna-sequencing', 'synthetic-cell', 'crispr-synbio', 'mrna-vaccines', 'drift-barrier-dna'].filter(id => X.INVK[id])
    },
    {
      key: 'sex',
      label: 'How sexual reproduction evolved',
      color: 'var(--c-make)',
      about: 'When sex began and how it grew sophisticated: sideways DNA repair, meiosis, mating types, Bangiomorpha, sperm & egg, internal mating, XY/ZW, flowers, courtship, grandmothers and IVF.',
      steps: ['gene-swapping', 'meiotic-core', 'mating-types', 'sex', 'germline-embryo', 'sperm-and-egg', 'broadcast-spawning', 'internal-fertilization', 'spores-seeds', 'land-mating', 'sex-chromosomes', 'flowering-genomes', 'queen-castes', 'live-birth-milk', 'courtship-selection', 'pair-bonds-care', 'assisted-reproduction'].filter(id => X.INVK[id])
    },
    {
      key: 'plants',
      label: 'Plants & fungi: sensing without brains',
      color: 'var(--s-chem)',
      about: 'How rooted life senses sun, gravity, winter and herbivores without a single neuron: clocks, chloroplasts, fungal webs, 20-second calcium counters, wound waves and flowers.',
      steps: ['day-clock', 'oxy-photo', 'chloroplast', 'eyespot', 'sex', 'mycelia', 'land-plants', 'spores-seeds', 'wood-wide-web', 'calcium-memory', 'polyploid-genomes', 'plant-signals', 'flowering-genomes', 'agriculture', 'selective-breeding'].filter(id => X.INVK[id])
    },
    {
      key: 'immunity',
      label: 'Immune systems: the second memory',
      color: 'var(--c-prog)',
      about: 'How cells tell self from invader and remember past plagues: bacterial CRISPR mugshots, innate Toll alarms, vertebrate V(D)J antibody shuffling, maternal milk and mRNA vaccines.',
      steps: ['dna', 'gene-swapping', 'crispr-immunity', 'meiotic-core', 'tissue-waves', 'genome-doublings', 'adaptive-immunity', 'live-birth-milk', 'dna-sequencing', 'crispr-synbio', 'mrna-vaccines'].filter(id => X.INVK[id])
    },
    {
      key: 'motors',
      label: 'Molecular motors, microtubules & wiring',
      color: 'var(--c-wire)',
      about: 'How life escaped slow random diffusion: bacterial rings and rotary flagella, microtubule pipes with kinesin and dynein walkers, cilia, spindles, axons and fiber.',
      steps: ['diffusion', 'binary-fission', 'chemoreceptors', 'mitochondria', 'molecular-motors', 'mitotic-spindle', 'eyespot', 'sex', 'mycelia', 'bare-axons', 'synaptic-weights', 'myelin', 'telegraph', 'fiber'].filter(id => X.INVK[id])
    },
    {
      key: 'space',
      label: 'Computing beyond Earth (orbit to Voyager)',
      color: 'var(--s-silicon)',
      about: 'How computers left our planet: silicon chips, Apollo’s 72 KB Moon landing, Voyager’s twin interstellar probes and billion-year Golden Records, autonomous Mars rovers and 17,500 laser-linked satellites.',
      steps: ['telegraph', 'stored-programs', 'integrated-circuits', 'apollo-guidance', 'voyager-probes', 'fiber', 'mars-autonomy', 'gpus', 'deep-space-links', 'offworld-fleet'].filter(id => X.INVK[id])
    }
  ];
  const PATHK = {}; PATHS.forEach(p => { PATHK[p.key] = p; });

  let visible = new Set(window.innerWidth < 640 ? ['cpu', 'prog', 'net'] : X.ORDER);
  let sel = null;          // { type: 'inv', id } | { type: 'lane', key } | { type: 'epoch', i }
  let mode = 'near';       // near | back | forward
  let activePath = null;   // key in PATHK
  let peek = false;
  let trail = [];
  let L = null;
  try { trail = JSON.parse(sessionStorage.getItem('si-trail') || '[]').filter(id => X.INVK[id]); } catch (e) { trail = []; }
  const saveTrail = () => { try { sessionStorage.setItem('si-trail', JSON.stringify(trail)); } catch (e) { /* storage blocked */ } };
  const setHash = h => { try { history.replaceState(null, '', h ? '#' + h : location.pathname); } catch (e) { /* ignore */ } };

  /* ---------- layout ---------- */
  function layout() {
    const W = wrapC.clientWidth;
    const narrow = W < 640;
    const lanes = X.ORDER.filter(k => visible.has(k));
    const n = Math.max(1, lanes.length);
    const G = narrow ? 70 : (W - 196) / n >= 112 ? 196 : 150;
    const laneW = Math.max(92, (W - G) / n);
    const compact = laneW < 140;
    const inset = compact ? 4 : 7;
    const totalW = Math.round(G + laneW * lanes.length);
    const laneX = {}; lanes.forEach((k, j) => { laneX[k] = G + j * laneW; });
    const rows = []; const actY = {}; let y = 0;
    for (let i = 0; i < X.N; i++) {
      const a = X.actOf(i), e = X.E[i];
      if (a.i0 === i) { actY[a.n] = y; y += 54; }
      const big = X.newAt(i).some(u => visible.has(u.part)) || X.STOP[e.id] || X.CRISIS[e.id];
      const h = big ? 88 : 26;
      rows[i] = { y, h }; y += h;
    }
    const pos = {};
    X.INV.forEach(u => {
      if (!visible.has(u.part)) return;
      const r = rows[u.i];
      pos[u.id] = { x: laneX[u.part] + inset, y: r.y + 12, w: laneW - 2 * inset, h: r.h - 24 };
    });
    return { W, narrow, compact, G, lanes, laneW, laneX, totalW, totalH: y + 40, rows, actY, pos };
  }

  const SOFT = {
    photosynthesis: 5, mitochondria: 4, chromosomes: 6, chloroplast: 6, superorganisms: 5,
    echolocation: 4, mechanical: 4, microchips: 5, transformers: 5, supercomputers: 5,
    everywhere: 5, electronic: 4, distributed: 6, formations: 5, coalitions: 5, algorithms: 4,
    photolithography: 5, metamorphosis: 4, interchangeable: 5, domestication: 6, coordinated: 4
  };
  const soft = t => esc(t).replace(/[A-Za-z]{10,}/g, w => { const k = SOFT[w.toLowerCase()]; return k ? w.slice(0, k) + '\u00ad' + w.slice(k) : w; });

  const LOSS = {}; (X.SI.crises || []).forEach(c => { LOSS[c.epoch_id] = c; });

  function curve(a, b) {
    const ax = a.x + a.w / 2, bx = b.x + b.w / 2;
    if (b.y > a.y + 1) {
      const y1 = a.y + a.h, y2 = b.y, dy = y2 - y1;
      return 'M' + ax.toFixed(1) + ' ' + y1 + ' C' + ax.toFixed(1) + ' ' + (y1 + dy * 0.5).toFixed(1) + ' ' + bx.toFixed(1) + ' ' + (y2 - dy * 0.5).toFixed(1) + ' ' + bx.toFixed(1) + ' ' + y2;
    }
    const y = a.y + a.h;
    return 'M' + ax.toFixed(1) + ' ' + y + ' C' + ax.toFixed(1) + ' ' + (y + 18) + ' ' + bx.toFixed(1) + ' ' + (y + 18) + ' ' + bx.toFixed(1) + ' ' + y;
  }

  function render() {
    L = layout();
    canvas.style.width = L.totalW + 'px';
    canvas.style.height = L.totalH + 'px';
    headInner.style.width = L.totalW + 'px';
    let h = '';
    L.lanes.forEach(k => { h += '<div class="lane-bg" style="left:' + L.laneX[k] + 'px;width:' + L.laneW + 'px;--pc:' + X.PK[k].color + '"></div>'; });
    X.ACTS.forEach(a => {
      h += '<div class="act-row" id="act-' + a.n + '" style="top:' + L.actY[a.n] + 'px;height:54px;--ac:' + a.color + ';--ao:' + a.on + '"><div class="act-lbl"><span class="num">' + a.n + '</span><b>' + a.name + '</b><span>' + a.span + '</span></div></div>';
    });
    let gut = '';
    for (let i = 0; i < X.N; i++) {
      const e = X.E[i], r = L.rows[i], st = X.STOP[e.id], a = X.actOf(i);
      const cls = 'gut' + (L.narrow ? ' narrow' : '') + (X.CRISIS[e.id] ? ' crisis' : '');
      const box = '<div class="' + cls + '" style="top:' + r.y + 'px;height:' + r.h + 'px;width:' + L.G + 'px">';
      if (X.CRISIS[e.id]) {
        h += '<div class="crisis-row" style="top:' + r.y + 'px;height:' + r.h + 'px"></div>';
        // What the crisis wiped out, across the part columns; opens the moment panel.
        const c = LOSS[e.id];
        if (c && c.lost) h += '<button type="button" class="loss-band" data-ep="' + i + '" style="top:' + (r.y + 14) + 'px;height:' + (r.h - 28) + 'px;left:' + (L.G + 8) + 'px;width:' + (L.totalW - L.G - 16) + 'px"><span class="tri" aria-hidden="true"></span><span class="lb-txt"><b>Lost</b> ' + esc(c.lost) + '</span></button>';
      }
      if (r.h < 40) {
        gut += box + (L.narrow ? '' : '<span class="time" style="opacity:.7">' + X.fmtShort(e.t) + '</span>') + '</div>';
        continue;
      }
      let g = '<span class="time">' + X.fmtShort(e.t) + '</span>';
      if (st) g += '<a class="who" href="journey.html#' + e.id + '" style="--g:' + (X.CRISIS[e.id] ? 'var(--crisis)' : a.color) + '" title="' + esc(st.who + ' · visit this stop') + '"><span class="mini">' + X.glyph(st.glyph) + '</span><b>' + esc(st.who) + '</b></a>';
      else if (X.CRISIS[e.id]) g += '<span class="crisis-lbl">' + esc(X.CRISIS[e.id]) + '</span>';
      else g += '<a class="mo" href="journey.html#' + e.id + '">' + esc(X.titleOf(i)) + '</a>';
      gut += box + g + '</div>';
    }
    h += '<div class="gut-layer" style="width:' + L.G + 'px;height:' + L.totalH + 'px">' + gut + '</div>';
    let s = '<svg class="edges" width="' + L.totalW + '" height="' + L.totalH + '" viewBox="0 0 ' + L.totalW + ' ' + L.totalH + '" aria-hidden="true">';
    L.lanes.forEach(k => {
      const hist = X.HIST[k];
      for (let j = 1; j < hist.length; j++) {
        const a = L.pos[hist[j - 1].id], b = L.pos[hist[j].id];
        if (!a || !b) continue;
        const x = (a.x + a.w / 2).toFixed(1);
        s += '<line class="lane-track" data-a="' + hist[j - 1].id + '" data-b="' + hist[j].id + '" style="--pc:' + X.PK[k].color + '" x1="' + x + '" y1="' + (a.y + a.h) + '" x2="' + x + '" y2="' + b.y + '"/>';
      }
    });
    X.SI.links.forEach(l => {
      const a = L.pos[l.from], b = L.pos[l.to];
      if (a && b) s += '<path class="lk" data-a="' + l.from + '" data-b="' + l.to + '" d="' + curve(a, b) + '"/>';
    });
    s += '</svg>';
    let n = '';
    X.INV.forEach(u => {
      const p = L.pos[u.id]; if (!p) return;
      n += '<button type="button" class="node" id="n-' + u.id + '" data-id="' + u.id + '" style="left:' + p.x.toFixed(1) + 'px;top:' + p.y + 'px;width:' + p.w.toFixed(1) + 'px;height:' + p.h + 'px;--pc:' + X.PK[u.part].color + ';--po:' + X.PK[u.part].on + '" title="' + esc(u.detail) + '"><i class="nd"></i><span>' + soft(u.label) + '</span></button>';
    });
    canvas.innerHTML = h + s + n;
    canvas.classList.toggle('compact', L.compact);
    $('laneHead').classList.toggle('compact', L.compact);
    let hh = '<div class="lh-gutter" style="left:0;width:' + L.G + 'px">' + (L.narrow ? '' : 'When · who') + '</div>';
    L.lanes.forEach(k => {
      hh += '<button type="button" class="lh" data-lane="' + k + '" style="left:' + (L.laneX[k] + 4).toFixed(1) + 'px;width:' + (L.laneW - 8).toFixed(1) + 'px;--pc:' + X.PK[k].color + ';--po:' + X.PK[k].on + '" title="' + esc(X.PK[k].name + ': ' + X.PK[k].question) + '">' + X.icon(k) + '<span>' + X.PK[k].short + '</span></button>';
    });
    headInner.innerHTML = hh;
    syncX();
    highlight();
  }
  function syncX() {
    const sx = wrapC.scrollLeft;
    headInner.style.transform = 'translateX(' + (-sx) + 'px)';
    shell.style.setProperty('--sx', sx + 'px');
    shell.classList.toggle('stuck', sx > 0);
  }

  /* ---------- highlight ---------- */
  function currentSet() {
    if (activePath && PATHK[activePath]) {
      const steps = PATHK[activePath].steps;
      const set = new Set(steps);
      return { set, edge: (a, b) => set.has(a) && set.has(b) };
    }
    if (!sel) return null;
    if (sel.type === 'inv') {
      if (mode === 'near') {
        const set = new Set([sel.id]);
        X.IN[sel.id].forEach(x => set.add(x.id)); X.OUT[sel.id].forEach(x => set.add(x.id));
        return { set, edge: (a, b) => a === sel.id || b === sel.id };
      }
      const set = X.closure(sel.id, mode);
      return { set, edge: (a, b) => set.has(a) && set.has(b) };
    }
    if (sel.type === 'lane') {
      const set = new Set(X.HIST[sel.key].map(u => u.id));
      return { set, edge: (a, b) => set.has(a) && set.has(b) && X.INVK[a].part === sel.key && X.INVK[b].part === sel.key };
    }
    const set = new Set(X.newAt(sel.i).map(u => u.id));
    return { set, edge: () => false };
  }
  function highlight() {
    const cs = currentSet();
    canvas.classList.toggle('dim', !!cs);
    canvas.querySelectorAll('.node').forEach(el => {
      const id = el.dataset.id;
      el.classList.toggle('hl', !!cs && cs.set.has(id));
      el.classList.toggle('sel', !!sel && sel.type === 'inv' && sel.id === id);
    });
    canvas.querySelectorAll('.edges [data-a]').forEach(el => el.classList.toggle('hl', !!cs && cs.edge(el.dataset.a, el.dataset.b)));
    return cs;
  }

  /* ---------- drawer ---------- */
  const refBadge = refs => {
    if (!refs || !refs.length) return '';
    const tip = refs.map(n => '[' + n + '] ' + (X.SI.refs[n] || 'Reference ' + n)).join(' | ');
    return ' <span class="x-only mono" style="font-size:12px;color:var(--ink-3)" title="' + esc(tip) + '">[' + refs.join(', ') + ']</span>';
  };
  const relItem = (id, why, refs, kind) => {
    const u = X.INVK[id];
    const r = refs && refs.length ? refs : (u.refs || []);
    const tag = kind === 'lane' ? '<em class="rel-kind">same part</em> ' : '';
    return '<li><button type="button" data-go="' + id + '" style="--pc:' + X.PK[u.part].color + '"><i class="dot"></i><b>' + esc(u.label) + '</b><span>' + X.fmtShort(X.E[u.i].t) + ' · ' + tag + esc(why) + refBadge(r) + '</span></button></li>';
  };
  const relList = (title, items) => '<div class="rel"><span class="sub">' + title + '</span>' + (items.length ? '<ul>' + items.join('') + '</ul>' : '<p class="none">None recorded in the tree.</p>') + '</div>';
  function citations(e) {
    const nums = (e.cites.match(/\d+/g) || []);
    if (!nums.length) return '';
    return '<ol class="refs">' + nums.map(n => '<li value="' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol>';
  }
  function invSourcesBlock(u) {
    const nums = (u.refs || []).slice();
    if (!nums.length) return '';
    return '<details class="evid-disc sm-disc x-only"><summary>Sources for ' + esc(u.label) + ' (' + nums.length + ')</summary>' +
      '<ol class="refs">' + nums.map(n => '<li value="' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol></details>';
  }
  function expertBlock(e) {
    const epi = X.EPI[e.epi] || { label: e.epi };
    return '<div class="lab x-only"><h3><span class="tag">EXPERT</span>Census row ' + e.id + '</h3>' +
      '<p class="mono" style="font-size:13px">' + esc(e.name) + '<br>' + esc(e.period) + ' · t = ' + e.t + ' Ma · ' + esc(epi.label) + ' (' + esc(e.epi) + ')</p>' +
      '<pre class="formula">' + esc(e.formula.split('; ').join('\n')) + '</pre>' + citations(e) +
      '<a href="data.html#' + e.id + '">Open this row in the Data Lab →</a></div>';
  }
  function trailHtml() {
    if (trail.length < 2) return '';
    return '<div class="trail"><span class="sub">Your trail</span>' + trail.map((id, k) => (k ? '<span aria-hidden="true">→</span>' : '') + '<button type="button" data-go="' + id + '" class="' + (sel && sel.id === id ? 'now' : '') + '">' + esc(X.INVK[id].label) + '</button>').join('') + '</div>';
  }
  function pathBarHtml(curId) {
    if (!activePath || !PATHK[activePath]) return '';
    const P = PATHK[activePath], idx = P.steps.indexOf(curId);
    const prevId = idx > 0 ? P.steps[idx - 1] : null;
    const nextId = idx >= 0 && idx < P.steps.length - 1 ? P.steps[idx + 1] : null;
    return '<div class="path-bar" style="--pc:' + P.color + '"><div class="pb-head"><span class="sub">Guided path' + (idx >= 0 ? ' · Step ' + (idx + 1) + ' / ' + P.steps.length : '') + '</span><button type="button" class="pb-exit" data-clear-path="1">Exit path</button></div>' +
      '<b>' + esc(P.label) + '</b><p>' + esc(P.about) + '</p>' +
      '<div class="pb-nav"><button type="button" class="btn sm ghost" data-step="' + (prevId || '') + '"' + (prevId ? '' : ' disabled') + '>← Earlier</button>' +
      '<button type="button" class="btn sm" data-step="' + (nextId || '') + '"' + (nextId ? '' : ' disabled') + '>Next in path →</button></div></div>';
  }
  // Ledger rows that illustrate this invention (matched by the row's `inv`, not by moment, since rows carry their own dates).
  function invLedgerHtml(u) {
    const when = t => !(t > 0) ? 'today' : (t * 1e6 < 10000 ? 'in ' : 'about ') + X.fmtTime(t);
    const neu = (X.SI.neural || []).filter(r => r.inv === u.id).map(n =>
      '<div class="dr-spot" style="--sc:var(--c-cpu)"><span class="sub">A brain or sense example · ' + when(n.t) + '</span><b>' + esc(n.pt) + '</b><p>' + esc(n.px) + '</p>' +
      '<p class="x-only">' + esc(n.name) + ' · Circuit: ' + esc(n.motif) + (n.neu > 0 ? ' · ' + X.sci(n.neu) + ' neurons' : '') + '</p>' +
      '<a href="data.html#neural">See all ' + (X.SI.neural || []).length + ' in the Data Lab →</a></div>');
    const net = (X.SI.networks || []).filter(r => r.inv === u.id).map(g =>
      '<div class="dr-spot" style="--sc:var(--c-net)"><span class="sub">A group example · ' + when(g.t) + '</span><b>' + esc(g.pt) + '</b><p>' + esc(g.px) + '</p>' +
      '<p class="x-only">' + esc(g.name) + ' · Channel: ' + esc(g.chan) + (g.size ? ' · ~' + X.sci(g.size) + ' members' : '') + '</p>' +
      '<a href="data.html#networks">See all ' + (X.SI.networks || []).length + ' in the Data Lab →</a></div>');
    const mk = (X.SI.making || []).filter(r => r.inv === u.id).map(m =>
      '<div class="dr-spot" style="--sc:var(--c-make)"><span class="sub">Replication &amp; making · ' + when(m.t) + '</span><b>' + esc(m.name) + '</b><p>' + esc(m.why) + '</p>' +
      '<p class="x-only">' + esc(m.sys) + ' · Blueprint: ~' + X.sci(m.bits) + ' bits · Autonomy: ' + esc(m.auto) + '</p>' +
      '<a href="data.html#making">See all ' + (X.SI.making || []).length + ' in the Data Lab →</a></div>');
    const mot = (X.SI.motors || []).filter(r => r.inv === u.id).map(m =>
      '<div class="dr-spot" style="--sc:var(--c-wire)"><span class="sub">Molecular motors &amp; tracks · ' + when(m.t) + '</span><b>' + esc(m.pt) + '</b><p>' + esc(m.px) + '</p>' +
      '<p class="x-only">' + esc(m.name) + (m.vel > 0 ? ' · ' + X.plain(m.vel) + ' µm/s' : '') + (m.step > 0 ? ' · ' + X.plain(m.step) + ' nm step' : '') + '</p>' +
      '<a href="data.html#motors">See all ' + (X.SI.motors || []).length + ' in the Data Lab →</a></div>');
    const gen = (X.SI.genomes || []).filter(r => r.inv === u.id).map(g =>
      '<div class="dr-spot" style="--sc:var(--c-store)"><span class="sub">DNA &amp; genome milestone · ' + when(g.t) + '</span><b>' + esc(g.pt) + '</b><p>' + esc(g.px) + '</p>' +
      '<p class="x-only">' + esc(g.sys) + (g.bp > 0 ? ' · ' + X.sci(g.bp) + ' letters' : '') + (g.genes > 0 ? ' · ' + X.sci(g.genes) + ' genes' : '') + (g.err > 0 ? ' · 1 error in ' + X.sci(Math.round(1 / g.err)) : '') + '</p>' +
      '<a href="data.html#genomes">All ' + (X.SI.genomes || []).length + ' genome milestones →</a> · <a href="stories.html#dna-story">DNA story →</a></div>');
    const sx = (X.SI.sex || []).filter(r => r.inv === u.id).map(s =>
      '<div class="dr-spot" style="--sc:var(--c-make)"><span class="sub">Sexual reproduction (Step ' + s.lvl + '/16) · ' + when(s.t) + '</span><b>' + esc(s.pt) + '</b><p>' + esc(s.px) + '</p>' +
      '<p class="x-only">' + esc(s.sys) + ' · ' + esc(s.mode) + '</p>' +
      '<a href="data.html#sex">All ' + (X.SI.sex || []).length + ' sex evolution steps →</a> · <a href="stories.html#sex-story">Sex story →</a></div>');
    const ng = (X.SI.nervegenes || []).filter(r => r.inv === u.id).map(g =>
      '<div class="dr-spot" style="--sc:var(--c-wire)"><span class="sub">Nerve gene before nerves · ' + when(g.t) + '</span><b>' + esc(g.pt) + '</b><p>' + esc(g.px) + '</p>' +
      '<p class="x-only">' + esc(g.name) + ' · ' + esc(g.grp) + '</p>' +
      '<a href="data.html#nervegenes">All ' + (X.SI.nervegenes || []).length + ' nerve-gene families →</a></div>');
    const off = (X.SI.offworld || []).filter(r => r.inv === u.id).map(o =>
      '<div class="dr-spot" style="--sc:var(--s-silicon)"><span class="sub">Computing beyond Earth · ' + (o.yr >= 2026 ? 'today' : o.yr) + ' · ' + esc(o.regime) + '</span><b>' + esc(o.pt) + '</b><p>' + esc(o.px) + '</p>' +
      '<p class="x-only">' + esc(o.name) + ' · ' + X.sci(o.km) + ' km · ' + X.sci(o.ops) + ' ops/s · ' + X.sci(o.bps) + ' b/s</p>' +
      '<a href="data.html#offworld">All ' + (X.SI.offworld || []).length + ' off-world milestones →</a> · <a href="data.html#offworld2026">2026 space inventory →</a></div>');
    const pl = (X.SI.plants || []).filter(r => r.inv === u.id).map(p =>
      '<div class="dr-spot" style="--sc:var(--s-chem)"><span class="sub">Plant &amp; fungal sensing · ' + when(p.t) + '</span><b>' + esc(p.pt) + '</b><p>' + esc(p.px) + '</p>' +
      '<p class="x-only">' + esc(p.sys) + ' · ' + esc(p.chan) + '</p>' +
      '<a href="data.html#plants">All ' + (X.SI.plants || []).length + ' plant milestones →</a> · <a href="stories.html#plants-story">Plants story →</a></div>');
    const imm = (X.SI.immunity || []).filter(r => r.inv === u.id).map(im =>
      '<div class="dr-spot" style="--sc:var(--c-prog)"><span class="sub">Immune memory · ' + when(im.t) + '</span><b>' + esc(im.pt) + '</b><p>' + esc(im.px) + '</p>' +
      '<p class="x-only">' + esc(im.sys) + ' · ' + esc(im.mech) + '</p>' +
      '<a href="data.html#immunity">All ' + (X.SI.immunity || []).length + ' immune milestones →</a> · <a href="stories.html#immunity-story">Immunity story →</a></div>');
    return off.concat(gen, sx, pl, imm, neu, ng, net, mk, mot).join('');
  }
  function epochLedgerHtml(ep) {
    const when = t => !(t > 0) ? 'today' : (t * 1e6 < 10000 ? 'in ' : 'about ') + X.fmtTime(t);
    const off = (X.OFFWORLD[ep] || []).map(o =>
      '<div class="dr-spot" style="--sc:var(--s-silicon)"><span class="sub">Computing beyond Earth · ' + (o.yr >= 2026 ? 'today' : o.yr) + '</span><b>' + esc(o.pt) + '</b><p>' + esc(o.px) + '</p>' +
      '<a href="data.html#offworld">Open off-world computing ledger →</a></div>');
    const gen = (X.GENOMES[ep] || []).map(g =>
      '<div class="dr-spot" style="--sc:var(--c-store)"><span class="sub">DNA &amp; genomes · ' + when(g.t) + '</span><b>' + esc(g.pt) + '</b><p>' + esc(g.px) + '</p>' +
      '<a href="data.html#genomes">Open genome ledger →</a> · <a href="stories.html#dna-story">Read DNA story →</a></div>');
    const sx = (X.SEX[ep] || []).map(s =>
      '<div class="dr-spot" style="--sc:var(--c-make)"><span class="sub">Sexual reproduction (Step ' + s.lvl + '/16) · ' + when(s.t) + '</span><b>' + esc(s.pt) + '</b><p>' + esc(s.px) + '</p>' +
      '<a href="data.html#sex">Open sexual reproduction ledger →</a></div>');
    const pl = (X.PLANTS[ep] || []).map(p =>
      '<div class="dr-spot" style="--sc:var(--s-chem)"><span class="sub">Plant &amp; fungal sensing · ' + when(p.t) + '</span><b>' + esc(p.pt) + '</b><p>' + esc(p.px) + '</p>' +
      '<a href="data.html#plants">Open plant signalling ledger →</a></div>');
    const imm = (X.IMMUNITY[ep] || []).map(im =>
      '<div class="dr-spot" style="--sc:var(--c-prog)"><span class="sub">Immune memory · ' + when(im.t) + '</span><b>' + esc(im.pt) + '</b><p>' + esc(im.px) + '</p>' +
      '<a href="data.html#immunity">Open immune evolution ledger →</a></div>');
    const ng = (X.NERVEGENES[ep] || []).map(g =>
      '<div class="dr-spot" style="--sc:var(--c-wire)"><span class="sub">Nerve genes · ' + when(g.t) + '</span><b>' + esc(g.pt) + '</b><p>' + esc(g.px) + '</p>' +
      '<a href="data.html#nervegenes">Open nerve-gene ledger →</a></div>');
    return off.concat(gen, sx, pl, imm, ng).join('');
  }
  const top = (chip, title) => '<button type="button" class="dr-handle" aria-expanded="' + !peek + '" aria-label="' + (peek ? 'Show details' : 'Fold details down') + '"><i aria-hidden="true"></i><span>' + esc(title) + '</span></button>' +
    '<div class="dr-top">' + chip + '<button type="button" class="x" id="drClose" aria-label="Close details">×</button></div>';

  function drawInv(u) {
    const p = X.PK[u.part], e = X.E[u.i], a = X.actOf(u.i), st = X.STOP[e.id];
    const cs = currentSet();
    const count = activePath && PATHK[activePath]
      ? 'Highlighting ' + PATHK[activePath].steps.length + ' steps in "' + PATHK[activePath].label + '"'
      : mode === 'near' ? X.IN[u.id].length + ' linked predecessors, ' + X.OUT[u.id].length + ' linked developments'
      : mode === 'back' ? 'Builds on ' + (cs.set.size - 1) + ' earlier inventions' : 'Connected to ' + (cs.set.size - 1) + ' later developments';
    const fig = X.invGallery(u, st, a.color);
    const byTime = list => list.slice().sort((x, y) => X.INVK[x.id].i - X.INVK[y.id].i);
    drawer.innerHTML = top('<span class="part-chip" style="--pc:' + p.color + '">' + X.icon(p.key) + p.name + '</span>', u.label) +
      pathBarHtml(u.id) +
      '<div><h2>' + esc(u.label) + '</h2><p class="dr-when">' + X.fmtTime(e.t) + ' · Act ' + a.n + ': ' + a.name + '</p></div>' +
      '<p class="dr-detail">' + esc(u.detail) + '</p>' + fig + X.invMore(u) + X.perspForInv(u.id) + invLedgerHtml(u) +
      '<div style="display:grid;gap:6px"><div class="modes" role="group" aria-label="What to highlight">' +
      [['near', 'Neighbors', 'Highlight linked predecessors and linked developments'], ['back', 'Rests on', 'Highlight all earlier inventions connected to this one'], ['forward', 'Led to', 'Highlight all later developments connected to this one']].map(m => '<button type="button" data-mode="' + m[0] + '" data-tip="' + m[2] + '" aria-pressed="' + (!activePath && mode === m[0]) + '">' + m[1] + '</button>').join('') +
      '</div><span class="muted" style="font-size:14px">' + esc(count) + '</span></div>' +
      relList('Linked predecessors', byTime(X.IN[u.id]).map(x => relItem(x.id, x.why, x.refs, x.kind))) +
      relList('Linked developments', byTime(X.OUT[u.id]).map(x => relItem(x.id, x.why, x.refs, x.kind))) +
      '<div style="display:grid;gap:8px"><span class="sub">Earth at that moment</span><div class="mini-stats">' +
      [['cells', 'living cells'], ['cneu', 'nerve signals per second'], ['cdig', 'silicon operations per second'], ['ptot', 'power used']].map(([k, lbl]) => '<div><b>' + (k === 'ptot' ? X.watts(e[k]) : X.sci(e[k])) + '</b><span>' + lbl + '</span></div>').join('') +
      '</div></div>' + invSourcesBlock(u) + expertBlock(e) + trailHtml();
  }
  function drawLane(k) {
    const p = X.PK[k];
    drawer.innerHTML = top('<span class="part-chip" style="--pc:' + p.color + '">' + X.icon(k) + 'Part</span>', p.name) +
      '<div><h2>' + p.name + '</h2><p class="dr-detail" style="margin-top:6px">' + p.question + '</p></div>' +
      '<dl class="trio"><dt>Bacterium</dt><dd>' + p.bacterium + '</dd><dt>You</dt><dd>' + p.you + '</dd><dt>Laptop</dt><dd>' + p.laptop + '</dd></dl>' +
      relList(X.HIST[k].length + ' upgrades, oldest first', X.HIST[k].map(u => relItem(u.id, u.detail, u.refs)));
  }
  // Crisis moments: what was lost, the census's own before-and-after, and sources (Expert view).
  function lossHtml(i) {
    const e = X.E[i], c = LOSS[e.id];
    if (!c || !c.detail || i === 0) return '';
    const p = X.E[i - 1], drops = [];
    if (p.bio > 0 && e.bio < p.bio * 0.9) drops.push('living carbon fell from ' + X.plain(p.bio) + ' to ' + X.numBtn('total_biomass_gt_c', X.plain(e.bio), i) + ' billion tonnes');
    if (p.cneu > 0 && e.cneu < p.cneu * 0.9) drops.push('nerve signals fell from ' + X.sci(p.cneu) + ' to ' + X.numBtn('c_neural_ops_sec', X.sci(e.cneu), i) + ' a second');
    const refs = String(c.refs || '').split(';').map(x => x.trim()).filter(Boolean);
    return '<section class="dr-loss"><span class="sub"><span class="tri" aria-hidden="true"></span>What was lost</span>' +
      (c.species_lost ? '<p class="loss-big"><b>' + esc(c.species_lost) + '</b> of sea species</p>' : '<p class="loss-big"><b>Not countable</b> · no fossils record it</p>') +
      '<p>' + esc(c.detail) + '</p>' +
      (drops.length ? '<p class="loss-census"><b>Census estimate</b>, against the moment before: ' + drops.join('; ') + '.</p>' : '') +
      (refs.length ? '<details class="evid-disc sm-disc x-only"><summary>Sources for these losses (' + refs.length + ')</summary><ol class="refs">' + refs.map(n => '<li value="' + n + '">' + esc(X.SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol></details>' : '') +
      '</section>';
  }
  function drawEpoch(i) {
    const e = X.E[i], a = X.actOf(i), st = X.STOP[e.id];
    drawer.innerHTML = top('<span class="chip" style="background:color-mix(in srgb,' + a.color + ' 20%,var(--surface))">Act ' + a.n + ' · ' + a.name + '</span>', st ? st.who : X.titleOf(i)) +
      '<div><h2>' + esc(st ? st.who : X.titleOf(i)) + '</h2><p class="dr-when">' + X.fmtTime(e.t) + (st ? ' · ' + esc(X.titleOf(i)) : '') + '</p></div>' +
      '<a class="dr-who" href="journey.html#' + e.id + '" style="--g:' + a.color + '">' + (st ? '<span class="mini">' + X.plateThumb(e.id, st.glyph) + '</span>' : '') + '<span><b>' + esc(X.hookOf(i)) + '</b><span>Visit this stop →</span></span></a>' +
      lossHtml(i) + relList('New at this moment', X.newAt(i).map(u => relItem(u.id, u.detail, u.refs))) +
      epochLedgerHtml(e.id) + X.perspForEpoch(e.id) + expertBlock(e);
  }
  function drawDrawer() {
    if (!sel) return;
    if (sel.type === 'inv') { drawInv(X.INVK[sel.id]); X.bindCarousels(drawer); }
    else if (sel.type === 'lane') drawLane(sel.key);
    else drawEpoch(sel.i);
  }
  function openDrawer() {
    const was = !drawer.hidden;
    drawer.hidden = false;
    document.body.classList.add('drawer-open');
    return was;
  }
  function closeDrawer() {
    drawer.hidden = true;
    peek = false; drawer.classList.remove('peek');
    document.body.classList.remove('drawer-open');
    sel = null;
    activePath = null;
    renderPaths();
    render();
    setHash('');
  }

  /* ---------- selection ---------- */
  const sheetH = () => window.innerWidth <= 900 && !drawer.hidden ? drawer.offsetHeight : 0;
  function scrollToY(y) {
    const rect = canvas.getBoundingClientRect();
    const head = $('laneHead').offsetHeight;
    const avail = window.innerHeight - sheetH() - head;
    window.scrollTo({ top: Math.max(0, window.scrollY + rect.top + y - head - avail * 0.25), behavior: reduced ? 'auto' : 'smooth' });
  }
  function reveal(id, always) {
    const p = L.pos[id]; if (!p) return;
    const run = () => {
      const top = canvas.getBoundingClientRect().top + p.y;
      const head = $('laneHead').offsetHeight;
      if (always || top < head + 4 || top + p.h > window.innerHeight - sheetH() - 4) scrollToY(p.y);
      const left = p.x - wrapC.scrollLeft;
      if (always || left < L.G || left + p.w > wrapC.clientWidth) wrapC.scrollLeft = Math.max(0, p.x + p.w / 2 - L.G - (wrapC.clientWidth - L.G) / 2);
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }
  function setPeek(v) {
    peek = v;
    drawer.classList.toggle('peek', v);
    const hd = drawer.querySelector('.dr-handle');
    if (hd) { hd.setAttribute('aria-expanded', String(!v)); hd.setAttribute('aria-label', v ? 'Show details' : 'Fold details down'); }
    if (!v && sel && sel.type === 'inv') reveal(sel.id, false);
  }
  function selectInv(id, scroll) {
    const u = X.INVK[id]; if (!u) return;
    if (!visible.has(u.part)) { visible.add(u.part); chips(); }
    sel = { type: 'inv', id };
    trail = trail.filter(t => t !== id); trail.push(id); if (trail.length > 10) trail.shift(); saveTrail();
    openDrawer(); render(); drawDrawer();
    setHash(activePath ? 'path=' + activePath + ':' + id : id);
    reveal(id, scroll !== false);
    if (scroll !== false && !reduced) {
      const el = $('n-' + id);
      if (el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2500); }
    }
  }
  function startPath(key, stepId) {
    const P = PATHK[key]; if (!P || !P.steps.length) return;
    activePath = key;
    P.steps.forEach(id => visible.add(X.INVK[id].part));
    chips();
    renderPaths();
    selectInv(stepId && P.steps.indexOf(stepId) >= 0 ? stepId : P.steps[0], true);
  }
  function selectLane(k) {
    activePath = null; renderPaths();
    if (!visible.has(k)) { visible.add(k); chips(); }
    sel = { type: 'lane', key: k }; mode = 'near';
    openDrawer(); render(); drawDrawer(); setHash('lane-' + k);
  }
  function selectEpoch(i) {
    activePath = null; renderPaths();
    sel = { type: 'epoch', i };
    openDrawer(); render(); drawDrawer(); setHash(X.E[i].id);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToY(L.rows[i].y)));
  }

  /* ---------- controls ---------- */
  function renderPaths() {
    const box = $('guidedPaths'); if (!box) return;
    box.innerHTML = '<span class="sub" style="align-self:center;margin-right:4px">Guided paths</span>' +
      PATHS.map(p => '<button type="button" class="path-chip" data-path="' + p.key + '" aria-pressed="' + (activePath === p.key) + '" style="--pc:' + p.color + '" data-tip="' + esc(p.about) + '"><i class="dot"></i>' + esc(p.label) + ' <small>(' + p.steps.length + ')</small></button>').join('');
  }
  $('guidedPaths').addEventListener('click', ev => {
    const b = ev.target.closest('[data-path]'); if (!b) return;
    if (activePath === b.dataset.path) { activePath = null; renderPaths(); highlight(); drawDrawer(); if (sel && sel.type === 'inv') setHash(sel.id); }
    else startPath(b.dataset.path);
  });

  function chips() {
    const partial = visible.size < X.ORDER.length;
    $('laneChips').innerHTML = '<span class="sub" style="align-self:center;margin-right:4px">Parts shown' + (partial ? ' (' + visible.size + ' of ' + X.ORDER.length + ')' : '') + '</span>' +
      X.PARTS.map(p => '<button type="button" class="part-chip" data-toggle="' + p.key + '" data-tip="Show or hide this column. ' + esc(p.name) + ' answers: ' + esc(p.question) + '" aria-pressed="' + visible.has(p.key) + '" style="--pc:' + p.color + '">' + X.icon(p.key) + p.name + '</button>').join('') +
      (partial ? '<button type="button" class="chip" data-toggle="all" style="cursor:pointer;font-weight:700">Show all ' + X.ORDER.length + '</button>' : '');
  }
  $('laneChips').addEventListener('click', ev => {
    const b = ev.target.closest('[data-toggle]'); if (!b) return;
    const k = b.dataset.toggle;
    if (k === 'all') visible = new Set(X.ORDER);
    else if (visible.has(k)) { if (visible.size > 1) visible.delete(k); }
    else visible.add(k);
    if (sel && sel.type === 'inv' && !visible.has(X.INVK[sel.id].part)) { sel = null; drawer.hidden = true; document.body.classList.remove('drawer-open'); }
    chips(); render();
  });
  $('actJump').innerHTML = X.ACTS.map(a => '<button type="button" data-act="' + a.n + '" style="--ac:' + a.color + ';--ao:' + a.on + '" title="Act ' + a.n + ': ' + esc(a.name) + '">' + a.n + '</button>').join('');
  $('actJump').addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b) scrollToY(L.actY[b.dataset.act] + 40); });

  canvas.addEventListener('click', ev => {
    const lb = ev.target.closest('.loss-band');
    if (lb) { selectEpoch(Number(lb.dataset.ep)); return; }
    const n = ev.target.closest('.node');
    if (n) {
      if (activePath && PATHK[activePath] && PATHK[activePath].steps.indexOf(n.dataset.id) < 0) { activePath = null; renderPaths(); }
      selectInv(n.dataset.id, false);
    }
  });
  headInner.addEventListener('click', ev => { const b = ev.target.closest('[data-lane]'); if (b) selectLane(b.dataset.lane); });

  let swipeY = null, swiped = false;
  drawer.addEventListener('pointerdown', ev => {
    const hd = ev.target.closest('.dr-handle'); if (!hd) return;
    swipeY = ev.clientY; swiped = false;
    try { hd.setPointerCapture(ev.pointerId); } catch (e) { /* not supported */ }
  });
  drawer.addEventListener('pointerup', ev => {
    if (swipeY == null) return;
    const dy = ev.clientY - swipeY; swipeY = null;
    if (Math.abs(dy) > 30) { swiped = true; setPeek(dy > 0); }
  });
  drawer.addEventListener('click', ev => {
    if (ev.target.closest('.dr-handle')) { if (!swiped) setPeek(!peek); swiped = false; return; }
    if (ev.target.closest('#drClose')) { closeDrawer(); return; }
    if (ev.target.closest('[data-clear-path]')) { activePath = null; renderPaths(); highlight(); drawDrawer(); if (sel && sel.type === 'inv') setHash(sel.id); return; }
    const stp = ev.target.closest('[data-step]'); if (stp && stp.dataset.step) { selectInv(stp.dataset.step, true); return; }
    const m = ev.target.closest('[data-mode]'); if (m) { activePath = null; renderPaths(); mode = m.dataset.mode; highlight(); drawDrawer(); if (sel && sel.type === 'inv') setHash(sel.id); return; }
    const g = ev.target.closest('[data-go]'); if (g) {
      if (activePath && PATHK[activePath] && PATHK[activePath].steps.indexOf(g.dataset.go) < 0) { activePath = null; renderPaths(); }
      if (sel && sel.type === 'inv') mode = 'near';
      selectInv(g.dataset.go);
    }
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !drawer.hidden) closeDrawer(); });
  wrapC.addEventListener('scroll', syncX);
  let rt = null;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 150); });

  /* ---------- search ---------- */
  const index = [].concat(
    X.INV.map(u => ({ kind: 'inv', id: u.id, label: u.label, hay: (u.label + ' ' + u.detail).toLowerCase(), sub: X.PK[u.part].name + ' · ' + X.fmtShort(X.E[u.i].t), color: X.PK[u.part].color })),
    X.STOPS.map(s => ({ kind: 'stop', i: s.i, label: s.who, hay: (s.who + ' ' + s.taxon + ' ' + X.titleOf(s.i)).toLowerCase(), sub: 'Stop · ' + X.fmtShort(X.E[s.i].t), color: X.actOf(s.i).color })),
    X.PARTS.map(p => ({ kind: 'lane', key: p.key, label: p.name, hay: (p.name + ' ' + p.question).toLowerCase(), sub: 'Part', color: p.color })),
    PATHS.map(p => ({ kind: 'path', key: p.key, label: p.label, hay: (p.label + ' ' + p.about).toLowerCase(), sub: 'Guided path · ' + p.steps.length + ' steps', color: p.color }))
  );
  const q = $('q'), res = $('results');
  let hits = [], cur = 0;
  function showResults() {
    const v = q.value.trim().toLowerCase();
    if (!v) { res.hidden = true; return; }
    hits = index.filter(x => x.hay.includes(v)).sort((a, b) => (b.label.toLowerCase().startsWith(v) ? 1 : 0) - (a.label.toLowerCase().startsWith(v) ? 1 : 0)).slice(0, 8);
    cur = 0;
    res.innerHTML = hits.length ? hits.map((x, k) => '<button type="button" data-k="' + k + '" class="' + (k === 0 ? 'on' : '') + '"><i class="dot" style="background:' + x.color + '"></i>' + esc(x.label) + '<small>' + esc(x.sub) + '</small></button>').join('') : '<p class="none" style="padding:8px 10px;margin:0">No matches. Try “whale”, “myelin” or “zero”.</p>';
    res.hidden = false;
  }
  function go(x) {
    res.hidden = true; q.value = '';
    if (x.kind === 'inv') selectInv(x.id);
    else if (x.kind === 'stop') selectEpoch(x.i);
    else if (x.kind === 'path') startPath(x.key);
    else selectLane(x.key);
  }
  q.addEventListener('input', showResults);
  q.addEventListener('keydown', ev => {
    if (res.hidden || !hits.length) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault(); cur = (cur + (ev.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length;
      res.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === cur));
    } else if (ev.key === 'Enter') { ev.preventDefault(); go(hits[cur]); }
    else if (ev.key === 'Escape') res.hidden = true;
  });
  res.addEventListener('click', ev => { const b = ev.target.closest('[data-k]'); if (b) go(hits[Number(b.dataset.k)]); });
  document.addEventListener('click', ev => { if (!ev.target.closest('.search')) res.hidden = true; });

  /* ---------- start ---------- */
  renderPaths();
  chips();
  render();
  function applyTreeHash() {
    const h = decodeURIComponent((location.hash || '').slice(1));
    if (!h) return;
    if (h.indexOf('path=') === 0) {
      const parts = h.slice(5).split(':');
      if (PATHK[parts[0]] && (activePath !== parts[0] || (parts[1] && (!sel || sel.id !== parts[1])))) startPath(parts[0], parts[1]);
    } else if (X.INVK[h]) {
      if (!sel || sel.type !== 'inv' || sel.id !== h) selectInv(h);
    } else if (h.indexOf('lane-') === 0 && X.PK[h.slice(5)]) {
      if (!sel || sel.type !== 'lane' || sel.key !== h.slice(5)) selectLane(h.slice(5));
    } else if (X.IDX[h] !== undefined) {
      if (!sel || sel.type !== 'epoch' || sel.i !== X.IDX[h]) selectEpoch(X.IDX[h]);
    }
  }
  applyTreeHash();
  window.addEventListener('hashchange', applyTreeHash);
  const sq = new URLSearchParams(location.search).get('q');
  if (sq) { q.value = sq; showResults(); q.focus(); }
})();
