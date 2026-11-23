(function () {
  'use strict';
  const X = window.SIX, esc = X.esc;
  X.chrome('atlas');
  const $ = id => document.getElementById(id);
  const f1 = n => n.toFixed(1);
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  let focus = (/kind=(\w+)/.exec(location.hash) || [])[1] || null;
  if (focus && !X.KIND[focus]) focus = null;
  let query = '';
  let selIdx = null;
  let rowEls = [];

  const EQ_RULES = {
    chem: {
      eqn: 'C<sub>chem</sub> = N<sub>sites</sub> · k<sub>cat</sub> &nbsp;or&nbsp; N<sub>cells</sub> · f<sub>wave</sub>',
      plain: 'Active enzyme, motor or ion-channel turnovers per second inside one cell, filament or plant body.',
      anchor: 'E. coli (~850/s, Milo & Phillips 2015); mature tree phloem (~10⁹/s, Fromm & Lautner 2007).'
    },
    nerve: {
      eqn: 'C<sub>nerve</sub> = N<sub>neurons</sub> · s<sub>syn/neu</sub> · f<sub>Hz</sub> = N<sub>neurons</sub> · r<sub>clade</sub>',
      plain: 'Counted neurons multiplied by clade-calibrated synapses per neuron and metabolic firing rate.',
      anchor: 'r_clade ≈ 25–50/s (worms & fish), 100–300/s (insects & birds), 1,744/s (human cortex: 86B → 1.5×10¹⁴/s).'
    },
    grp: {
      eqn: 'C<sub>group</sub> = N<sub>members</sub> · C<sub>member</sub> + C<sub>silicon</sub>',
      plain: 'Individual members multiplied by per-member neural throughput, plus shared silicon in modern networks.',
      anchor: 'Leafcutter colony (8M ants → 2.0×10¹⁴/s); 2026 human + internet network (~1.0×10²⁴/s).'
    },
    exo: {
      eqn: 'C<sub>exo</sub> = R<sub>write / serve</sub> &nbsp;(symbols or queries / s)',
      plain: 'Sustained physical inscription, printing, broadcast or archive-serving rate of one external memory system.',
      anchor: 'Sumerian scribe (~0.2 symbols/s); Gutenberg press (~8/s); global web archive (~5×10⁶/s).'
    },
    sil: {
      eqn: 'C<sub>sil</sub> = N<sub>cores/gates</sub> · f<sub>clock</sub> · u<sub>duty</sub>',
      plain: 'Executed digital, analog or quantum gate operations per second at realistic sustained duty cycle.',
      anchor: 'Apollo AGC (4.3×10⁴/s); Voyager 1 at 1 light-day (1.2×10⁴/s); Nvidia B200 GPU (4.5×10¹⁵/s).'
    },
    ai: {
      eqn: 'C<sub>AI</sub> = 2 · N<sub>active params</sub> · R<sub>tokens/s</sub>',
      plain: 'Sustained floating-point or tensor multiply-accumulates per second for one active model instance or search.',
      anchor: '1958 Mark I Perceptron (400/s); AlphaGo match rig (2.5×10¹⁴/s); frontier reasoning stream (~8×10¹⁴/s).'
    }
  };

  function syncRing() {
    const a = $('atlas'), ring = $('atlasRing');
    if (a && ring) {
      if (selIdx == null) ring.setAttribute('visibility', 'hidden');
      else {
        const dot = a.querySelector('.dot[data-i="' + selIdx + '"]');
        if (!dot) ring.setAttribute('visibility', 'hidden');
        else {
          ring.setAttribute('cx', dot.getAttribute('cx'));
          ring.setAttribute('cy', dot.getAttribute('cy'));
          ring.setAttribute('visibility', 'visible');
        }
      }
    }
    const np = $('atlNeuronPlot'), nRing = $('atlScaleRing');
    if (np && nRing) {
      if (selIdx == null) nRing.setAttribute('visibility', 'hidden');
      else {
        const pt = np.querySelector('.npt[data-i="' + selIdx + '"]');
        if (!pt) nRing.setAttribute('visibility', 'hidden');
        else {
          nRing.setAttribute('cx', pt.dataset.x);
          nRing.setAttribute('cy', pt.dataset.y);
          nRing.setAttribute('visibility', 'visible');
        }
      }
    }
  }

  function syncFilterButtons() {
    document.querySelectorAll('#atKeys .key').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === focus)));
    document.querySelectorAll('#atlEqCards .atl-eq-btn').forEach(b => {
      const on = b.dataset.k === focus;
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'Showing this group (click to show all)' : 'Filter map & table to this group →';
    });
  }

  function draw(rows) {
    const a = $('atlas'), w = 1000, h = 520, l = 58, r = 20, t = 16, b = 46;
    a.setAttribute('viewBox', '0 0 ' + w + ' ' + h); a.classList.add('stk', 'atl');
    const TX = Math.log10(4.2e9), V0 = -3, V1 = 25;
    const xx = y => l + (TX - Math.log10(Math.max(1, y))) / TX * (w - l - r), yy = v => t + (V1 - Math.log10(v)) / (V1 - V0) * (h - t - b);
    let g = '';
    [0, 5, 10, 15, 20].forEach(v => { g += '<line class="grid" x1="' + l + '" x2="' + (w - r) + '" y1="' + f1(yy(Math.pow(10, v))) + '" y2="' + f1(yy(Math.pow(10, v))) + '"/><text class="tick" x="' + (l - 8) + '" y="' + f1(yy(Math.pow(10, v)) + 4) + '" text-anchor="end">' + (v ? '10' + X.sup(v) : '1') + '</text>'; });
    [[1e9, '1 billion years ago'], [1e8, '100 million'], [1e7, '10 million'], [1e6, '1 million'], [1e5, '100,000'], [1e4, '10,000'], [1e3, '1,000'], [100, '100'], [10, '10'], [1, 'today']].forEach(([y, lbl]) => {
      g += '<line class="grid" x1="' + f1(xx(y)) + '" x2="' + f1(xx(y)) + '" y1="' + t + '" y2="' + (h - b) + '"/><text class="tick" x="' + f1(xx(y)) + '" y="' + (h - b + 18) + '" text-anchor="' + (y === 1 ? 'end' : 'middle') + '">' + lbl + '</text>';
    });
    g += '<text class="side" x="' + (l + 8) + '" y="' + (t + 12) + '">1-UNIT OPERATIONS A SECOND (COMPLEXITY) ↑</text><text class="side" x="' + (w - r) + '" y="' + (h - 6) + '" text-anchor="end">FIRST APPEARED, YEARS BEFORE TODAY →</text>';
    const order = { nerve: 0, chem: 1, sil: 2, grp: 3, exo: 4, ai: 5 };
    rows.map((d, i) => i).sort((p, q) => order[rows[p][3]] - order[rows[q][3]]).forEach(i => {
      const d = rows[i];
      g += '<circle class="dot' + (d[4] ? ' class' : '') + (focus === d[3] ? ' on' : '') + '" data-i="' + i + '" style="--k:' + X.KIND[d[3]].color + ';fill:' + X.KIND[d[3]].color + '" cx="' + f1(xx(d[1])) + '" cy="' + f1(yy(d[2])) + '" r="4"/>';
    });
    g += '<circle id="atlasRing" class="atl-ring" cx="0" cy="0" r="8.5" visibility="hidden"/>';
    a.innerHTML = g;
    a.classList.toggle('focus', !!focus);
    syncRing();
  }

  function renderEquationsAndScaling(rows) {
    const eqBox = $('atlEqCards');
    if (eqBox) {
      const stats = {};
      X.KINDS.forEach(([k]) => { stats[k] = { count: 0, min: Infinity, max: 0 }; });
      rows.forEach(d => {
        const st = stats[d[3]];
        if (!st) return;
        st.count++;
        if (d[2] < st.min) st.min = d[2];
        if (d[2] > st.max) st.max = d[2];
      });
      eqBox.innerHTML = X.KINDS.map(([k, name]) => {
        const r = EQ_RULES[k], st = stats[k];
        const col = X.KIND[k].color;
        return '<article class="atl-eq-card" style="--kc:' + col + '">' +
          '<div class="atl-eq-top"><span class="atl-eq-kind"><i></i>' + esc(name) + '</span><span class="atl-eq-cnt tnum">' + st.count + ' systems</span></div>' +
          '<p class="atl-eq-plain">' + esc(r.plain) + '</p>' +
          '<div class="iq-eqn">' + r.eqn + '</div>' +
          '<p class="atl-eq-meta"><span class="tnum"><b>Span:</b> ' + X.sci(st.min) + ' → ' + X.sci(st.max) + ' /s</span><br>' + esc(r.anchor) + '</p>' +
          '<button type="button" class="btn sm ghost atl-eq-btn" data-k="' + k + '" aria-pressed="' + String(focus === k) + '">' +
          (focus === k ? 'Showing this group (click to show all)' : 'Filter map & table to this group →') + '</button>' +
          '</article>';
      }).join('');

      eqBox.addEventListener('click', ev => {
        const b = ev.target.closest('.atl-eq-btn');
        if (!b) return;
        focus = focus === b.dataset.k ? null : b.dataset.k;
        try { history.replaceState(null, '', focus ? '#kind=' + focus : location.pathname); } catch (e) { /* ignore */ }
        syncFilterButtons();
        draw(rows);
        drawScalingPlot(rows);
        applyFilter(true);
      });
    }
    drawScalingPlot(rows);
  }

  function drawScalingPlot(rows) {
    const mount = $('atlScaleMount');
    if (!mount) return;
    const pts = [];
    rows.forEach((d, idx) => {
      const neu = Number(d[7] || 0), ops = Number(d[2] || 0);
      if ((d[3] === 'nerve' || d[3] === 'grp') && neu >= 1 && ops > 0) {
        pts.push({ idx, name: d[0], yrs: d[1], ops, kind: d[3], isClass: !!d[4], taxon: d[5], neu, rate: ops / neu });
      }
    });
    if (!pts.length) return;

    const W = 1000, H = 450, L = 76, R = 32, T = 30, B = 54;
    const LX0 = 0.8, LX1 = 21.4, LY0 = 2.0, LY1 = 24.6;
    const xOf = n => L + (Math.log10(n) - LX0) / (LX1 - LX0) * (W - L - R);
    const yOf = c => T + (LY1 - Math.log10(c)) / (LY1 - LY0) * (H - T - B);

    let s = '';
    // Gridlines
    [[2, '100'], [4, '10⁴'], [6, '10⁶'], [8, '10⁸'], [10, '10¹⁰'], [12, '10¹²'], [15, '10¹⁵'], [18, '10¹⁸'], [21, '10²¹']].forEach(([lx, lab]) => {
      if (lx < LX0 || lx > LX1) return;
      const x = xOf(Math.pow(10, lx));
      s += '<line class="grid" x1="' + f1(x) + '" x2="' + f1(x) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="2 3"/>' +
        '<text class="tick" x="' + f1(x) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    [[3, '10³/s'], [6, '10⁶/s'], [9, '10⁹/s'], [12, '10¹²/s'], [15, '10¹⁵/s'], [18, '10¹⁸/s'], [21, '10²¹/s'], [24, '10²⁴/s']].forEach(([ly, lab]) => {
      const y = yOf(Math.pow(10, ly));
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + f1(y) + '" y2="' + f1(y) + '"/>' +
        '<text class="tick" x="' + (L - 8) + '" y="' + f1(y + 4) + '" text-anchor="end">' + lab + '</text>';
    });

    // Three linear scaling bands: log10(C) = log10(N) + log10(r)
    const BANDS = [
      [1744, 'Mammal/primate cortex line (r ≈ 1,744 syn·Hz/neuron)', 'var(--s-neuro)'],
      [150, 'Bird pallium & insect mushroom-body line (r ≈ 150 /neuron)', 'var(--c-cpu)'],
      [25, 'Cold-blooded nerve-net & worm baseline (r ≈ 25 /neuron)', 'var(--ink-3)']
    ];
    BANDS.forEach(([rate, lbl, col]) => {
      const lr = Math.log10(rate);
      const lxA = Math.max(LX0, LY0 - lr), lxB = Math.min(LX1, LY1 - lr);
      const x1 = xOf(Math.pow(10, lxA)), y1 = yOf(Math.pow(10, lxA + lr));
      const x2 = xOf(Math.pow(10, lxB)), y2 = yOf(Math.pow(10, lxB + lr));
      s += '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '" stroke="' + col + '" stroke-width="1.6" stroke-dasharray="6 4" opacity="0.72"/>';
      const lxLbl = rate > 1000 ? 6.6 : rate > 100 ? 12.8 : 14.5;
      const xl = xOf(Math.pow(10, lxLbl)), yl = yOf(Math.pow(10, lxLbl + lr));
      const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      s += '<text class="tick" transform="translate(' + f1(xl) + ',' + f1(yl - 5) + ') rotate(' + f1(ang) + ')" style="fill:' + col + ';font-weight:700">' + esc(lbl) + '</text>';
    });

    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Neurons in one body or coordinated collective (N_neurons, log₁₀ scale) →</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">1-unit synaptic or collective throughput (C = N_neurons × r_clade, ops/s)</text>';

    // Plot points: circles for individual nerve animals, diamonds for colonies/societies
    const boxes = [];
    const canPlace = b => b.x0 >= L + 4 && b.x1 <= W - R - 4 && b.y0 >= T + 4 && b.y1 <= H - B - 4 &&
      !boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);

    const LANDMARKS = [
      [/Caenorhabditis elegans|^Roundworm/i, 'C. elegans (302)'],
      [/Drosophila melanogaster|Fruit fly/i, 'Fruit fly (1.4×10⁵)'],
      [/Apis mellifera|Honeybee \(worker|Western honeybee/i, 'Honeybee (9.6×10⁵)'],
      [/Octopus vulgaris|Common octopus/i, 'Octopus (5×10⁸)'],
      [/Corvus corax|Common raven/i, 'Raven (2.2×10⁹)'],
      [/^Human brain|Homo sapiens \(anatomically modern|^Anatomically modern human/i, 'Human brain (86B → 1.5×10¹⁴/s)'],
      [/Loxodonta africana|African bush elephant/i, 'Elephant (257B, 97.5% cerebellum)'],
      [/Orcinus orca|Killer whale/i, 'Killer whale (43B cortical)'],
      [/Atta|Leafcutter ant supercolony|Leafcutter/i, 'Leafcutter colony'],
      [/Global networked humanity|8\.1-Billion|Internet-connected humanity|Planetary human/i, '2026 Human + AI net']
    ];
    const pickedLabels = new Map();
    LANDMARKS.forEach(([rx, short]) => {
      const hit = pts.find(p => rx.test(p.name + ' ' + p.taxon) && !pickedLabels.has(p.idx));
      if (hit) pickedLabels.set(hit.idx, short);
    });

    let marks = '', labels = '';
    pts.forEach(p => {
      const x = xOf(p.neu), y = yOf(p.ops);
      boxes.push({ x0: x - 6, y0: y - 6, x1: x + 6, y1: y + 6 });
      const col = X.KIND[p.kind].color;
      const dim = focus && focus !== p.kind ? ' dim' : '';
      const fillStyle = p.isClass ? 'fill:var(--surface);stroke:' + col + ';stroke-width:1.7' : 'fill:' + col + ';stroke:var(--surface);stroke-width:1.2';
      const shape = p.kind === 'grp'
        ? '<polygon class="fp" points="' + f1(x) + ',' + f1(y - 5.6) + ' ' + f1(x + 5.6) + ',' + f1(y) + ' ' + f1(x) + ',' + f1(y + 5.6) + ' ' + f1(x - 5.6) + ',' + f1(y) + '" style="' + fillStyle + '"/>'
        : '<circle class="fp" cx="' + f1(x) + '" cy="' + f1(y) + '" r="4.3" style="' + fillStyle + '"/>';
      marks += '<g class="fpt npt' + dim + '" tabindex="0" role="button" data-i="' + p.idx + '" data-x="' + f1(x) + '" data-y="' + f1(y) + '" aria-label="' + esc(p.name + ': ' + X.sci(p.neu) + ' neurons, ' + X.sci(p.ops) + ' ops/s (' + X.plain(p.rate) + ' per neuron)') + '">' +
        '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="10" fill="transparent"/>' + shape + '</g>';
    });

    pts.forEach(p => {
      const short = pickedLabels.get(p.idx);
      if (!short || (focus && focus !== p.kind)) return;
      const x = xOf(p.neu), y = yOf(p.ops), w = short.length * 6.2 + 6, h = 13;
      const tries = [[x + 8, y + 4, 'start'], [x - 8, y + 4, 'end'], [x + 8, y - 9, 'start'], [x - 8, y - 9, 'end'], [x + 8, y + 16, 'start'], [x - 8, y + 16, 'end']];
      for (const [tx, ty, anc] of tries) {
        const bx = anc === 'end' ? { x0: tx - w, x1: tx, y0: ty - h, y1: ty + 2 } : { x0: tx, x1: tx + w, y0: ty - h, y1: ty + 2 };
        if (canPlace(bx)) {
          boxes.push(bx);
          labels += '<text class="flab" x="' + f1(tx) + '" y="' + f1(ty) + '" text-anchor="' + anc + '">' + esc(short) + '</text>';
          break;
        }
      }
    });

    s += marks + labels + '<circle id="atlScaleRing" class="atl-ring" cx="0" cy="0" r="8.5" visibility="hidden"/>';

    const nerveCnt = pts.filter(p => p.kind === 'nerve').length;
    const grpCnt = pts.filter(p => p.kind === 'grp').length;

    mount.innerHTML = '<figure class="lab-fig atl-scale-fig" id="atlScaleFig">' +
      '<figcaption><h3>Neuron-to-signal scaling across ' + pts.length + ' nervous systems and collectives</h3>' +
      '<p>Why neuron count alone does not equal processing rate: cold-blooded worms and fishes fire ~25–50 synaptic events per neuron per second, birds and insects ~100–300, and synapse-dense mammal cortices ~1,744. Because 97.5% of an African elephant’s 257 billion neurons are low-firing cerebellar granule cells, one human cortex (86B neurons, ~1.5×10¹⁴/s) out-fires a whole elephant brain (~5.0×10¹³/s).</p></figcaption>' +
      '<div class="plot-wrap"><svg id="atlNeuronPlot" class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Log-log scatter plot of neuron count versus single-system operations per second across ' + nerveCnt + ' nervous systems and ' + grpCnt + ' collectives, with three clade scaling reference lines.">' + s + '</svg></div>' +
      '<p class="fig-legend"><span>Markers:</span>' +
      '<span><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="4.5" style="fill:var(--l-nerve)"/></svg>Individual nervous system (' + nerveCnt + ')</span>' +
      '<span><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><polygon points="7,1.5 12.5,7 7,12.5 1.5,7" style="fill:var(--l-grp)"/></svg>Colony or society (' + grpCnt + ')</span>' +
      '<span><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="4.3" style="fill:var(--surface);stroke:var(--ink-2);stroke-width:1.8"/></svg>Hollow = class-level estimate</span></p>' +
      '<p class="readout fig-read" id="atlScaleRead" aria-live="polite">Hover, tap or tab to any point to inspect its neuron count, 1-unit operations/s and effective per-neuron rate (C ÷ N_neurons). Click to highlight in the database below.</p>' +
      '<details class="evid-disc sm-disc"><summary>Clade per-neuron conversion rates &amp; anatomical sources</summary>' +
      '<div class="tbl-wrap" style="margin-top:8px"><table class="rt"><caption>Biophysical conversion constants used in C_nerve = N_neurons × s_syn/neu × f_Hz</caption>' +
      '<thead><tr><th scope="col">Clade / architecture</th><th scope="col">Synapses / neuron</th><th scope="col">Mean active rate</th><th scope="col">Rate r_clade (ops/neuron/s)</th><th scope="col">Primary empirical anchor</th></tr></thead>' +
      '<tbody>' +
      '<tr><th scope="row">Cnidarian nerve nets &amp; nematodes</th><td>~25–100</td><td>0.5–1 Hz</td><td>25–50</td><td>White et al. (1986) C. elegans connectome (~7,500 synapses / 302 neurons)</td></tr>' +
      '<tr><th scope="row">Arthropods, molluscs &amp; ectotherm vertebrates</th><td>~100–500</td><td>0.2–0.5 Hz</td><td>50–150</td><td>Scheffer et al. (2020) Drosophila hemibrain; Bullock (1984)</td></tr>' +
      '<tr><th scope="row">Songbirds, corvids &amp; parrots (nuclear pallium)</th><td>~500–1,000</td><td>0.2–0.4 Hz</td><td>150–300</td><td>Olkowicz et al. (2016) avian pallial neuron packing</td></tr>' +
      '<tr><th scope="row">African elephant (cerebellar-dominated mammal)</th><td>~2,000 cortical / low granule</td><td>~0.1–1 Hz</td><td>~195 whole-brain</td><td>Herculano-Houzel et al. (2014): 251B cerebellar vs. 5.6B cortical neurons</td></tr>' +
      '<tr><th scope="row">Primates, cetaceans &amp; cortical-rich mammals</th><td>~1,700–7,000</td><td>~0.25–1 Hz</td><td>1,000–2,000 (human: 1,744)</td><td>Herculano-Houzel (2009); Azevedo et al. (2009); Attwell &amp; Laughlin (2001)</td></tr>' +
      '</tbody></table></div></details></figure>';

    syncRing();

    const readEl = $('atlScaleRead');
    const ptMap = new Map(pts.map(p => [p.idx, p]));
    mount.querySelectorAll('.npt').forEach(g => {
      const show = () => {
        const p = ptMap.get(Number(g.dataset.i));
        if (!p || !readEl) return;
        readEl.innerHTML = '<b>' + esc(p.name) + '</b>' + (p.taxon ? ' (<i>' + esc(p.taxon) + '</i>)' : '') +
          ' · Neurons: <b>' + X.sci(p.neu) + '</b> · Throughput: <b>' + (p.isClass ? '~' : '') + X.sci(p.ops) + ' ops/s</b>' +
          ' · Ratio: <b>' + X.sci(p.rate) + ' ops/neuron/s</b>';
      };
      const pick = () => {
        const idx = Number(g.dataset.i);
        selIdx = idx;
        syncRing();
        show();
        const tr = document.getElementById('sys-row-' + idx);
        if (tr) {
          if (tr.hidden) { focus = null; query = ''; $('sysQuery').value = ''; syncFilterButtons(); draw(rows); drawScalingPlot(rows); applyFilter(false); }
          rowEls.forEach(r => r.el.classList.remove('cur'));
          tr.classList.add('cur');
        }
      };
      g.addEventListener('mouseenter', show);
      g.addEventListener('focus', show);
      g.addEventListener('click', pick);
      g.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); return; }
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        const vis = [...mount.querySelectorAll('.npt:not(.dim)')];
        const k = vis.indexOf(g), nx = vis[k + (ev.key === 'ArrowRight' ? 1 : -1)];
        if (nx) { ev.preventDefault(); nx.focus(); }
      });
    });
  }

  function tip(rows) {
    const a = $('atlas'), box = $('tip');
    const showTip = (c, cx, cy) => {
      const d = rows[Number(c.dataset.i)];
      box.innerHTML = '<b>' + esc(d[0]) + '</b><span>' + esc(X.KIND[d[3]].name) + (d[5] ? ' · <i>' + esc(d[5]) + '</i>' : '') + ' · ' + esc(X.yearsAgo(d[1])) + '<br>' + (d[4] ? 'about ' : '') + X.sci(d[2]) + ' operations/s per unit' + (d[4] ? ' (class estimate)' : '') + ' · select to view in table</span>';
      box.hidden = false;
      box.style.left = Math.max(8, Math.min(innerWidth - 320, cx + 14)) + 'px';
      box.style.top = Math.min(innerHeight - 100, cy + 16) + 'px';
    };
    a.addEventListener('pointermove', ev => {
      if (ev.pointerType === 'touch') return;
      const c = ev.target.closest('.dot'); if (!c) { box.hidden = true; return; }
      showTip(c, ev.clientX, ev.clientY);
    });
    a.addEventListener('pointerleave', () => { box.hidden = true; });
    a.addEventListener('click', ev => {
      const c = ev.target.closest('.dot'); if (!c) return;
      const idx = Number(c.dataset.i);
      selIdx = idx;
      syncRing();
      const tr = document.getElementById('sys-row-' + idx);
      if (tr) {
        if (tr.hidden) { focus = null; query = ''; $('sysQuery').value = ''; syncFilterButtons(); draw(rows); drawScalingPlot(rows); applyFilter(false); }
        rowEls.forEach(r => r.el.classList.remove('cur'));
        tr.classList.add('cur');
        tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });
  }

  function reorderDom(tbody, ordered) {
    const canMove = typeof tbody.moveBefore === 'function';
    for (const item of ordered) {
      if (canMove) tbody.moveBefore(item.el, null);
      else tbody.appendChild(item.el);
    }
  }

  function applyFilter(announce) {
    const q = query.trim().toLowerCase();
    let shown = 0;
    for (const item of rowEls) {
      const okKind = !focus || item.kind === focus;
      const okQ = !q || item.search.indexOf(q) >= 0;
      const vis = okKind && okQ;
      item.el.hidden = !vis;
      if (vis) shown++;
    }
    const total = rowEls.length;
    $('sysCount').textContent = shown === total ? total + ' systems' : shown + ' of ' + total + ' systems';
    $('sysReset').hidden = !focus && !q;
    if (announce) $('sysStatus').textContent = shown + ' systems shown';
  }

  function buildTable(rows) {
    const tbody = $('sysBody');
    const frag = document.createDocumentFragment();
    rowEls = rows.map((d, i) => {
      const tr = document.createElement('tr');
      tr.id = 'sys-row-' + i;
      tr.dataset.i = String(i);
      const kName = X.KIND[d[3]] ? X.KIND[d[3]].name : d[3];
      const kColor = X.KIND[d[3]] ? X.KIND[d[3]].color : 'var(--ink-3)';
      const taxon = d[5] || '—';
      const paradigm = d[6] || '—';
      const neu = Number(d[7] || 0);
      tr.innerHTML =
        '<th scope="row">' + esc(d[0]) + '</th>' +
        '<td><span class="dot" style="background:' + kColor + ';margin-right:6px" aria-hidden="true"></span>' + esc(kName) + '</td>' +
        '<td>' + esc(taxon) + '</td>' +
        '<td>' + esc(paradigm) + '</td>' +
        '<td class="n tnum" data-value="' + d[1] + '">' + esc(X.yearsAgo(d[1])) + '</td>' +
        '<td class="n tnum" data-value="' + d[2] + '">' + (d[4] ? '~' : '') + X.sci(d[2]) + '</td>' +
        '<td class="n tnum" data-value="' + neu + '">' + (neu > 0 ? X.sci(neu) : '—') + '</td>';
      frag.appendChild(tr);
      return {
        el: tr,
        kind: d[3],
        search: (d[0] + ' ' + kName + ' ' + taxon + ' ' + paradigm).toLowerCase(),
        vals: [d[0], kName, taxon, paradigm, Number(d[1]), Number(d[2]), neu]
      };
    });
    tbody.appendChild(frag);

    // Initial sort: descending by 1-unit ops/s (column 5)
    rowEls.sort((a, b) => b.vals[5] - a.vals[5]);
    reorderDom(tbody, rowEls);
    applyFilter(false);

    const table = $('sysTable');
    table.tHead.addEventListener('click', ev => {
      const btn = ev.target.closest('button.sort-btn');
      if (!btn) return;
      const th = btn.closest('th');
      const colIdx = th.cellIndex;
      const isNum = th.dataset.type === 'number';
      const cur = th.getAttribute('aria-sort');
      const dir = cur === 'ascending' ? 'descending' : cur === 'descending' ? 'ascending' : (isNum ? 'descending' : 'ascending');
      for (const h of table.tHead.rows[0].cells) h.removeAttribute('aria-sort');
      th.setAttribute('aria-sort', dir);
      const factor = dir === 'ascending' ? 1 : -1;
      rowEls.sort((a, b) => factor * (isNum ? (a.vals[colIdx] - b.vals[colIdx]) : collator.compare(a.vals[colIdx], b.vals[colIdx])));
      reorderDom(tbody, rowEls);
      $('sysStatus').textContent = 'Sorted by ' + btn.textContent.trim() + ', ' + dir;
    });

    let deb = null;
    $('sysQuery').addEventListener('input', ev => {
      query = ev.target.value;
      applyFilter(false);
      clearTimeout(deb);
      deb = setTimeout(() => { $('sysStatus').textContent = $('sysCount').textContent; }, 350);
    });
    tbody.addEventListener('click', ev => {
      const tr = ev.target.closest('tr[data-i]');
      if (!tr) return;
      selIdx = Number(tr.dataset.i);
      rowEls.forEach(r => r.el.classList.remove('cur'));
      tr.classList.add('cur');
      syncRing();
      $('sysStatus').textContent = rows[selIdx][0] + ' highlighted on complexity chart';
    });

    $('sysReset').addEventListener('click', () => {
      focus = null;
      query = '';
      selIdx = null;
      $('sysQuery').value = '';
      try { history.replaceState(null, '', location.pathname); } catch (e) { /* ignore */ }
      syncFilterButtons();
      rowEls.forEach(r => r.el.classList.remove('cur'));
      draw(rows);
      drawScalingPlot(rows);
      applyFilter(true);
      $('sysQuery').focus();
    });
  }

  X.loadAtlas(A => {
    if (!A) {
      $('atlas').parentElement.innerHTML = '<p class="note" style="padding:24px">The atlas data did not load. Reload the page, or open the <a href="data.html">Data Lab</a>.</p>';
      return;
    }
    const rows = A.systems, n = {}, cls = rows.filter(d => d[4]).length;
    rows.forEach(d => { n[d[3]] = (n[d[3]] || 0) + 1; });
    $('atKeys').innerHTML = X.KINDS.map(([k, name]) => '<button type="button" class="key" data-k="' + k + '" aria-pressed="false" style="--k:' + X.KIND[k].color + '"><i></i>' + name + ' <small>' + (n[k] || 0) + '</small></button>').join('');
    $('atKeys').addEventListener('click', ev => {
      const b = ev.target.closest('.key'); if (!b) return;
      focus = focus === b.dataset.k ? null : b.dataset.k;
      try { history.replaceState(null, '', focus ? '#kind=' + focus : location.pathname); } catch (e) { /* ignore */ }
      syncFilterButtons(); draw(rows); drawScalingPlot(rows); applyFilter(true);
    });
    $('atNote').innerHTML = rows.length + ' unique systems. A filled dot has a system-specific estimate; a hollow dot (' + cls + ' of them) carries an order-of-magnitude class estimate.';
    draw(rows); tip(rows);
    renderEquationsAndScaling(rows);
    syncFilterButtons();
    buildTable(rows);

    const dims = A.dims.slice(0, 14);
    $('cov').insertAdjacentHTML('beforeend', '<thead><tr><th scope="col" style="text-align:left">Dimension</th>' + X.KINDS.map(([k, name]) => '<th scope="col" style="--k:' + X.KIND[k].color + '"><i></i>' + name + '<small>' + A.totals[k] + ' systems</small></th>').join('') + '</tr></thead><tbody>' +
      dims.map(d => '<tr><th scope="row">' + esc(d) + '</th>' + X.KINDS.map(([k]) => {
        const v = A.matrix[d][k] || 0, share = Math.min(1, v / Math.max(1, A.totals[k]));
        return '<td class="' + (v ? (share > 0.62 ? 'hi' : '') : 'z') + '" style="--v:' + Math.round(share * 78) + '" title="' + v + ' of ' + A.totals[k] + ' systems">' + (v || '·') + '</td>';
      }).join('') + '</tr>').join('') + '</tbody>');
  });
})();
