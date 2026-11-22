(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('data');
  const $ = id => document.getElementById(id);
  const esc = X.esc;
  const CEN = window.SI_CENSUS;
  const LED = window.SI_LEDGERS || {};

  const isNum = v => v !== '' && v != null && isFinite(Number(v));
  function numericCols(cols, rows) {
    const out = new Set();
    cols.forEach((c, k) => {
      const vals = rows.map(r => r[k]).filter(v => v !== '' && v != null);
      if (vals.length && vals.filter(isNum).length / vals.length >= 0.8) out.add(c);
    });
    return out;
  }
  const fmtCell = v => { const n = Number(v); if (!isNum(v)) return esc(v); if (n !== 0 && (Math.abs(n) >= 1e5 || Math.abs(n) < 0.01)) return X.sci(n); return esc(String(+n.toPrecision(6))); };

  const PRESETS = {
    'Story essentials': ['epoch_id', 'time_mya', 'name', 'total_cells', 'h_copy_bits', 'm_active_bits', 'c_biochem_ops_sec', 'c_neural_ops_sec', 'c_digital_ops_sec', 'p_metabolic_watts', 'epistemic_status'],
    'Memory': ['epoch_id', 'time_mya', 'h_copy_bits', 'h_sel_bits', 'h_unique_bits', 'm_active_bits', 'm_passive_bits', 'm_exo_installed_bits', 'm_dram_bits', 'tau_retention_years', 'phi_persistence_bit_years', 'phi_bio_lineage_bit_years', 'phi_bio_unpowered_bit_years', 'phi_exo_unpowered_bit_years', 'dominant_memory_medium'],
    'Computing': ['epoch_id', 'time_mya', 'c_total_ops_sec', 'c_biochem_ops_sec', 'c_bioelectric_ops_sec', 'c_neural_ops_sec', 'c_neural_upper_ops_sec', 'c_digital_ops_sec', 'c_digital_ai_ops_sec', 'c_max_entity_ops_sec', 'n_neurons_global', 'n_synapses_global', 'digital_to_neural_compute_ratio', 'gould_variance_right_tail', 'planetary_ops_per_joule'],
    'Biomass & energy': ['epoch_id', 'time_mya', 'total_biomass_gt_c', 'prokaryotic_biomass_gt_c', 'phytomass_structural_gt_c', 'eukaryotic_active_biomass_gt_c', 'metazoan_biomass_gt_c', 'p_metabolic_watts', 'p_prok_watts', 'p_euk_watts', 'p_animal_watts', 'p_bio_watts', 'p_tech_primary_watts', 'p_digital_it_watts', 'p_memory_refresh_watts'],
    'Environment & groups': ['epoch_id', 'time_mya', 'geological_period', 'surface_temp_c', 'atm_o2_pct', 'atm_co2_ppm', 'continental_config', 'max_collective_group_size', 'collective_organization_mode', 'duration_readable'],
    'Derivations & citations': ['epoch_id', 'name', 'key_event', 'shocks_notes', 'stoichiometric_derivation_formula', 'primary_citations_footnotes', 'epistemic_status'],
    'All columns': null
  };

  const TABS = [['census', 'Census · 64 moments'], ['plot', 'Plot builder']].concat(Object.keys(LED).map(k => [k, LED[k].title.split(' (')[0]]));
  let tab = 'census', preset = 'Story essentials', filter = '', sortCol = null, sortDir = 1, hiRow = null;
  const CNUM = numericCols(CEN.columns, CEN.rows);

  $('tabs').innerHTML = TABS.map(t => '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + esc(t[1]) + '</button>').join('');
  $('tabs').addEventListener('click', ev => { const b = ev.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; sortCol = null; sortDir = 1; draw(); } });

  function table(cols, rows, nums, opts) {
    opts = opts || {};
    const idx = cols.map(c => opts.allCols ? opts.allCols.indexOf(c) : cols.indexOf(c));
    let rs = rows.map((r, k) => ({ r, k }));
    if (opts.filter) { const f = opts.filter.toLowerCase(); rs = rs.filter(x => x.r.join(' ').toLowerCase().includes(f)); }
    if (opts.sortCol != null) {
      const j = (opts.allCols || cols).indexOf(opts.sortCol), n = nums.has(opts.sortCol);
      rs.sort((a, b) => { const va = a.r[j], vb = b.r[j]; return (n ? (Number(va) - Number(vb)) : String(va).localeCompare(String(vb))) * opts.sortDir; });
    }
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + cols.map(c => '<th scope="col" data-sort="' + esc(c) + '"' + (opts.sortCol === c ? ' aria-sort="' + (opts.sortDir > 0 ? 'ascending' : 'descending') + '"' : '') + '>' + esc(c) + (opts.allCols && (X.SI.numrefs || {})[c] ? ' <button type="button" class="num-i" data-num="' + esc(c) + '"' + (opts.hi != null ? ' data-i="' + opts.hi + '"' : '') + ' aria-label="Where ' + esc(c) + ' comes from" data-tip="Where this column comes from: equation, inputs and sources">i</button>' : '') + '</th>').join('') + '</tr></thead><tbody>' +
      rs.map(x => '<tr' + (opts.hi != null && x.k === opts.hi ? ' class="cur" id="hiRow" style="outline:3px solid var(--c-cpu);outline-offset:-3px"' : '') + '>' + idx.map((j, c) => { const v = x.r[j]; const n = nums.has(cols[c]) && isNum(v); return '<td class="' + (n ? 'n' : '') + '"' + (n ? ' title="' + esc(v) + '"' : '') + '>' + (n ? fmtCell(v) : esc(v)) + '</td>'; }).join('') + '</tr>').join('') +
      (!rs.length && opts.filter ? '<tr><td class="empty" colspan="' + cols.length + '"><div class="em"><span>No moments match “' + esc(opts.filter) + '”. Try a period (Cambrian) or an epoch ID (EP14).</span><button type="button" class="btn sm ghost" id="clearFilt">Clear filter</button></div></td></tr>' : '') +
      '</tbody></table></div><p class="readout">' + rs.length + ' rows × ' + cols.length + ' columns. Click a column title to sort. Hover a number for its exact value.</p>';
  }

  function drawCensus() {
    const cols = (PRESETS[preset] || CEN.columns).filter(c => CEN.columns.indexOf(c) >= 0);
    $('panel').innerHTML = '<div class="lab-tools"><label class="sub" for="preset">Columns</label><select id="preset">' + Object.keys(PRESETS).map(p => '<option' + (p === preset ? ' selected' : '') + '>' + p + '</option>').join('') + '</select>' +
      '<input type="search" id="filt" placeholder="Filter rows: Cambrian, extinction, EP14…" value="' + esc(filter) + '" aria-label="Filter rows">' +
      '<a class="btn sm" href="data/earth_census_64_epochs.csv" download>Download CSV</a></div>' +
      '<div class="note-box">One row per moment, from 4.1 billion years ago (EP01a) to 2026 (EP32b). Units are in the column names: <span class="mono">_bits</span>, <span class="mono">_ops_sec</span>, <span class="mono">_watts</span>, <span class="mono">_gt_c</span> (gigatonnes of carbon), <span class="mono">time_mya</span> (millions of years ago).</div>' +
      table(cols, CEN.rows, CNUM, { allCols: CEN.columns, filter, sortCol, sortDir, hi: hiRow });
    $('preset').addEventListener('change', ev => { preset = ev.target.value; sortCol = null; drawCensus(); });
    const f = $('filt');
    f.addEventListener('input', () => { filter = f.value; const pos = f.selectionStart; drawCensus(); const g = $('filt'); g.focus(); try { g.setSelectionRange(pos, pos); } catch (e) { /* ignore */ } });
    const cl = $('clearFilt');
    if (cl) cl.addEventListener('click', () => { filter = ''; drawCensus(); $('filt').focus(); });
    bindSort(drawCensus);
    const r = $('hiRow'); if (r) requestAnimationFrame(() => r.scrollIntoView({ block: 'center' }));
  }
  function bindSort(redraw) {
    $('panel').querySelectorAll('th[data-sort]').forEach(th => th.addEventListener('click', ev => {
      if (ev.target.closest('[data-num]')) return;   // the info button opens "Where this number comes from" instead
      const c = th.dataset.sort; if (sortCol === c) sortDir = -sortDir; else { sortCol = c; sortDir = 1; } redraw();
    }));
  }

  /* ---------- plot builder ---------- */
  const PLOTCOLS = CEN.columns.filter(c => CNUM.has(c) && c !== 'time_mya');
  let plotSel = ['c_biochem_ops_sec', 'c_neural_ops_sec', 'c_digital_ops_sec'], logY = true;
  const PC = ['var(--c-ram)', 'var(--c-io)', 'var(--c-wire)'];
  function drawPlot() {
    $('panel').innerHTML = '<div class="lab-tools">' + [0, 1, 2].map(k => '<select data-s="' + k + '" aria-label="Series ' + (k + 1) + '" style="border-color:' + PC[k] + '"><option value="">(none)</option>' + PLOTCOLS.map(c => '<option' + (plotSel[k] === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select>').join('') +
      '<label class="toggle"><input type="checkbox" id="logY"' + (logY ? ' checked' : '') + '> Log scale</label></div>' +
      '<div class="plot-wrap"><svg id="plot" class="plot" viewBox="0 0 1000 400" role="img" aria-label="Plot of selected census columns"></svg></div><p class="time-key" data-time-key="moments"></p><p class="readout" id="pread">Hover the plot to read values. X axis: the 64 moments in order (time not to scale).</p>';
    $('panel').querySelectorAll('select[data-s]').forEach(s => s.addEventListener('change', () => { plotSel[Number(s.dataset.s)] = s.value; drawPlot(); }));
    $('logY').addEventListener('change', ev => { logY = ev.target.checked; drawPlot(); });
    const W = 1000, H = 400, Lm = 70, R = 20, T = 20, B = 46, N = CEN.rows.length;
    const series = plotSel.map((c, k) => c ? { c, k, j: CEN.columns.indexOf(c) } : null).filter(Boolean);
    let vals = [];
    series.forEach(s => CEN.rows.forEach(r => { const v = Number(r[s.j]); if (isNum(r[s.j]) && (!logY || v > 0)) vals.push(logY ? Math.log10(v) : v); }));
    if (!vals.length) { $('plot').innerHTML = '<text x="500" y="200" text-anchor="middle" class="tick">Pick a column with values above zero.</text>'; return; }
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (lo === hi) { lo -= 1; hi += 1; }
    const Xp = i => Lm + i * (W - Lm - R) / (N - 1);
    const Yp = v => T + (hi - v) / (hi - lo) * (H - T - B);
    let s = '';
    for (let g = 0; g <= 5; g++) {
      const v = lo + (hi - lo) * g / 5, y = Yp(v);
      s += '<line class="grid" x1="' + Lm + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (Lm - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + (logY ? '10' + X.sup(Math.round(v)) : X.sci(v)) + '</text>';
    }
    X.ACTS.forEach(a => { s += '<text class="tick" x="' + Xp(a.i0).toFixed(1) + '" y="' + (H - 12) + '">' + a.n + ' ' + X.fmtShort(X.E[a.i0].t) + '</text>'; });
    s += '<line class="axis" x1="' + Lm + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>';
    series.forEach(se => {
      let d = '', pen = false, pts = '';
      CEN.rows.forEach((r, i) => {
        const v = Number(r[se.j]);
        if (isNum(r[se.j]) && (!logY || v > 0)) { const y = Yp(logY ? Math.log10(v) : v); d += (pen ? 'L' : 'M') + Xp(i).toFixed(1) + ' ' + y.toFixed(1); pen = true; pts += '<circle class="pt" cx="' + Xp(i).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" style="fill:' + PC[se.k] + '"/>'; }
        else pen = false;
      });
      s += '<path class="ln" d="' + d + '" style="stroke:' + PC[se.k] + '"/>' + pts;
    });
    s += '<line id="phov" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-dasharray="2 3" visibility="hidden"/><rect id="phit" x="' + Lm + '" y="' + T + '" width="' + (W - Lm - R) + '" height="' + (H - T - B) + '" fill="transparent"/>';
    const svg = $('plot'); svg.innerHTML = s;
    X.timeKeys();
    $('phit').addEventListener('mousemove', ev => {
      const r = svg.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * W;
      const i = Math.max(0, Math.min(N - 1, Math.round((x - Lm) / ((W - Lm - R) / (N - 1)))));
      const hv = $('phov'); hv.setAttribute('x1', Xp(i)); hv.setAttribute('x2', Xp(i)); hv.setAttribute('visibility', 'visible');
      $('pread').innerHTML = esc(CEN.rows[i][0] + ' · ' + X.fmtShort(X.E[i].t)) + ' · ' + series.map(se => '<span style="color:' + PC[se.k] + '">●</span> ' + esc(se.c) + ' = ' + esc(CEN.rows[i][se.j])).join(' · ');
    });
  }

  /* ---------- story figures for the DNA and nerve ledgers (S1, 21 Nov 2026) ---------- */
  const objRows = l => l.rows.map(r => { const o = {}; l.columns.forEach((c, j) => { o[c] = r[j]; }); return o; });
  // How a date is known: colour and shape together, so identity is never colour alone.
  const EV = {
    fossil: { n: 'Fossil', c: 'var(--c-store)', s: 'circle' },
    molecular_clock: { n: 'Gene clock', c: 'var(--c-cpu)', s: 'square' },
    living_inference: { n: 'Inferred from living species', c: 'var(--c-power)', s: 'triangle' },
    measured: { n: 'Measured today', c: 'var(--l-chem)', s: 'diamond' },
    estimate: { n: 'Estimate', c: 'var(--ink-3)', s: 'circle' }
  };
  function sym(shape, x, y, r, fill, extra) {
    const a = ' style="fill:' + fill + '"' + (extra || '');
    if (shape === 'square') return '<rect class="fp" x="' + (x - r).toFixed(1) + '" y="' + (y - r).toFixed(1) + '" width="' + (2 * r) + '" height="' + (2 * r) + '" rx="1.5"' + a + '/>';
    if (shape === 'triangle') return '<polygon class="fp" points="' + x.toFixed(1) + ',' + (y - r * 1.2).toFixed(1) + ' ' + (x + r * 1.1).toFixed(1) + ',' + (y + r * 0.8).toFixed(1) + ' ' + (x - r * 1.1).toFixed(1) + ',' + (y + r * 0.8).toFixed(1) + '"' + a + '/>';
    if (shape === 'diamond') return '<polygon class="fp" points="' + x.toFixed(1) + ',' + (y - r * 1.25).toFixed(1) + ' ' + (x + r * 1.25).toFixed(1) + ',' + y.toFixed(1) + ' ' + x.toFixed(1) + ',' + (y + r * 1.25).toFixed(1) + ' ' + (x - r * 1.25).toFixed(1) + ',' + y.toFixed(1) + '"' + a + '/>';
    return '<circle class="fp" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '"' + a + '/>';
  }
  const legendSym = (shape, fill) => '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">' + sym(shape, 7, 7, 4.6, fill) + '</svg>';
  // Greedy label placement: try a few vertical nudges, drop the label if all collide (the readout and table still carry it).
  // Optional `left` lets a label try the left side of its point (returned as {x, y}); points can be reserved first.
  function placer(maxX) {
    const boxes = [];
    const free = b => !boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const fn = function (x, y, w, h, left) {
      const tries = [];
      [0, -12, 12, -24, 24].forEach(dy => { tries.push([x, dy]); if (left != null) tries.push([left - w, dy]); });
      for (const [tx, dy] of tries) {
        const b = { x0: tx, x1: tx + w, y0: y + dy - h, y1: y + dy };
        if ((maxX == null || b.x1 <= maxX) && b.x0 >= 0 && free(b)) { boxes.push(b); return left != null ? { x: tx, y: y + dy } : y + dy; }
      }
      return null;
    };
    fn.reserve = (x0, y0, x1, y1) => boxes.push({ x0, y0, x1, y1 });
    return fn;
  }
  const words = n => {
    if (!(n > 0)) return '0';
    const u = [[1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million'], [1e3, ' thousand']];
    for (const [v, w] of u) if (n >= v) { const q = n / v; return (q >= 100 ? Math.round(q) : +q.toPrecision(2)) + w; }
    return String(Math.round(n));
  };
  const rangeText = (lo, hi) => (lo > 0 && hi > 0 && lo !== hi) ? ', between ' + X.fmtTime(hi) + ' and ' + X.fmtTime(lo) : '';
  const SHORT = {
    'Lab-evolved RNA polymerase ribozyme': 'RNA copier (lab)', 'LUCA (reconstructed from living genomes)': 'LUCA, the common ancestor',
    'Escherichia coli K-12': 'E. coli', 'Methanocaldococcus jannaschii': 'Methane maker', 'Synechocystis sp. PCC 6803': 'Cyanobacterium',
    'Reclinomonas americana mitochondrion': 'Mitochondrion', 'Arabidopsis thaliana chloroplast': 'Chloroplast',
    "Saccharomyces cerevisiae (baker's yeast)": 'Yeast', 'Neurospora crassa': 'Bread mould', 'Monosiga brevicollis (choanoflagellate)': 'Choanoflagellate',
    'Amphimedon queenslandica (sponge)': 'Sponge', 'Nematostella vectensis (sea anemone)': 'Sea anemone', 'Drosophila melanogaster (fruit fly)': 'Fruit fly',
    'Caenorhabditis elegans': 'Roundworm', 'Branchiostoma floridae (lancelet, before the doublings)': 'Lancelet',
    'Neoceratodus forsteri (Australian lungfish)': 'Lungfish', 'Arabidopsis thaliana (thale cress)': 'Thale cress', 'Danio rerio (zebrafish)': 'Zebrafish',
    'Gallus gallus (chicken)': 'Chicken', 'Homo sapiens': 'Human', 'Paramecium tetraurelia': 'Paramecium',
    'Tmesipteris oblanceolata (fork fern)': 'Fork fern (largest genome)', 'Nasuia deltocephalinicola': 'Insect symbiont (smallest)',
    'Sorangium cellulosum So0157-2': 'Soil myxobacterium',
    'Chlamydomonas reinhardtii (green alga)': 'Green alga', 'Physcomitrium patens (moss)': 'Moss', 'Amborella trichopoda': 'Amborella (flowering plant)', 'Triticum aestivum (bread wheat)': 'Bread wheat'
  };
  const shortName = o => SHORT[o] || o.split(' (')[0];

  // Figure A: genome size of each milestone's living stand-in, at the milestone's date (true time, log).
  let genomeGroup = 'All';
  function figGenomes(l) {
    const rows = objRows(l).filter(r => Number(r.genome_bp) > 0 && r.lineage !== 'Read or made by people')
      .sort((a, b) => Number(b.time_mya) - Number(a.time_mya));
    const groups = ['All'].concat([...new Set(rows.map(r => r.lineage))]);
    const W = 1000, H = 500, L = 78, T = 30, B = 52, XT1 = 770, XTODAY = 812;
    const LX0 = 9.7, LX1 = 3.7, LY0 = 2, LY1 = 11.6;
    const xOf = t => t > 0 ? L + (LX0 - Math.log10(t * 1e6)) / (LX0 - LX1) * (XT1 - L) : XTODAY;
    const yOf = bp => T + (LY1 - Math.log10(bp)) / (LY1 - LY0) * (H - T - B);
    let s = '';
    [[2, '100'], [4, '10 thousand'], [6, '1 million'], [8, '100 million'], [10, '10 billion']].forEach(([v, lab]) => {
      const y = yOf(Math.pow(10, v));
      s += '<line class="grid" x1="' + L + '" x2="' + (W - 10) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });
    [[9.6, '4 Ga'], [9, '1 Ga'], [8.7, '500 Ma'], [8, '100 Ma'], [7, '10 Ma'], [6, '1 Ma'], [5, '100 ka'], [4, '10 ka']].forEach(([v, lab]) => {
      const x = L + (LX0 - v) / (LX0 - LX1) * (XT1 - L);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '"/><text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    s += '<line class="axis" x1="' + L + '" x2="' + XT1 + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<line class="grid" x1="' + ((XT1 + XTODAY) / 2 - 4) + '" x2="' + ((XT1 + XTODAY) / 2 - 4) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="3 4"/>' +
      '<text class="tick" x="' + XTODAY + '" y="' + (H - B + 18) + '" text-anchor="middle">today</text>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Time, log scale: each grid step is ×10 further back</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 12) + '">DNA letters in one genome (log scale)</text>' +
      '<text class="tick" x="' + XTODAY + '" y="' + (T - 12) + '" text-anchor="middle">records measured today</text>';
    const place = placer(W - 4);
    rows.forEach(r => { const x = xOf(Number(r.time_mya)), y = yOf(Number(r.genome_bp)); place.reserve(x - 7, y - 7, x + 7, y + 7); });
    place.reserve(0, 0, L - 2, H);  // keep labels off the axis numbers
    let pts = '', labs = '';
    rows.forEach((r, i) => {
      const t = Number(r.time_mya), x = xOf(t), y = yOf(Number(r.genome_bp)), e = EV[r.evidence] || EV.estimate;
      const on = genomeGroup === 'All' || r.lineage === genomeGroup;
      pts += '<g class="fpt' + (on ? '' : ' dim') + '" tabindex="' + (on ? 0 : -1) + '" role="button" data-i="' + i + '" aria-label="' + esc(shortName(r.representative_organism) + ', ' + words(Number(r.genome_bp)) + ' DNA letters, ' + r.plain_title) + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12" fill="transparent"/>' + sym(e.s, x, y, 5.5, e.c) + '</g>';
      if (on) {
        const name = shortName(r.representative_organism), w = name.length * 6.2 + 4;
        let p = place(x + 9, y + 4, w, 12, t > 0 ? x - 9 : null);
        if (typeof p === 'number') p = { x: x + 9, y: p };
        if (p) labs += '<text class="flab" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '">' + esc(name) + '</text>';
      }
    });
    s += labs + pts;
    const html = '<figure class="lab-fig" id="figG">' +
      '<figcaption><h3>Genomes grew, then stopped tracking complexity</h3><p>Each point is the genome of a living stand-in for a milestone, placed at the milestone’s date. Genomes grew about a thousandfold up to the first complex cells. After that, size and complexity part ways: a fern holds 50 times our DNA, a lungfish 14 times.</p></figcaption>' +
      '<div class="fig-tools" role="group" aria-label="Highlight a group">' + groups.map(g => '<button type="button" class="part-chip" data-g="' + esc(g) + '" aria-pressed="' + (g === genomeGroup) + '">' + esc(g) + '</button>').join('') + '</div>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Genome size against time, ' + rows.length + ' genomes. The table below lists every value.">' + s + '</svg></div>' +
      '<p class="fig-legend"><span>How the date is known:</span>' + ['fossil', 'molecular_clock', 'living_inference', 'measured'].map(k => '<span>' + legendSym(EV[k].s, EV[k].c) + esc(EV[k].n) + '</span>').join('') + '</p>' +
      '<p class="time-key" data-time-key></p>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to a point to read it. The genomes are of living organisms (or a reconstruction, for LUCA), not of the ancient ones. Use the buttons to pick out one group, such as plants and algae.</p></figure>';
    return { html, bind: () => bindPoints(rows, r => '<b>' + esc(shortName(r.representative_organism)) + '</b> · ' + esc(words(Number(r.genome_bp))) + ' DNA letters' +
      (Number(r.protein_genes) > 0 ? ' · ' + Number(r.protein_genes).toLocaleString('en-US') + ' protein genes' : '') +
      (r.copy_errors_per_bp_per_generation ? ' · ' + X.sci(Number(r.copy_errors_per_bp_per_generation)) + ' copying errors per letter per generation' : '') +
      '<br>' + esc(r.plain_title) + ': ' + (Number(r.time_mya) > 0 ? esc(X.fmtTime(Number(r.time_mya))) : 'measured today') + ' (' + esc((EV[r.evidence] || EV.estimate).n) + esc(rangeText(Number(r.low_mya), Number(r.high_mya))) + ').' +
      '<br><span class="fig-src">Source: ' + esc(r.source) + (r.mutation_source ? '; copying errors: ' + esc(r.mutation_source) : '') + '</span>', g => { genomeGroup = g; }) };
  }

  function bindPoints(rows, text, setGroup) {
    const fig = $('panel').querySelector('.lab-fig'), read = $('figRead');
    const show = g => { fig.querySelectorAll('.fpt.cur').forEach(n => n.classList.remove('cur')); g.classList.add('cur'); read.innerHTML = text(rows[Number(g.dataset.i)]); };
    fig.querySelectorAll('.fpt').forEach(g => {
      g.addEventListener('mouseenter', () => show(g));
      g.addEventListener('focus', () => show(g));
      g.addEventListener('click', () => show(g));
      g.addEventListener('keydown', ev => {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        const all = [...fig.querySelectorAll('.fpt[tabindex="0"]')], k = all.indexOf(g);
        const nx = all[k + (ev.key === 'ArrowRight' ? 1 : -1)];
        if (nx) { ev.preventDefault(); nx.focus(); }
      });
    });
    fig.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => { setGroup(b.dataset.g); drawLedger(tab); const nb = $('panel').querySelector('[data-g="' + b.dataset.g + '"]'); if (nb) nb.focus(); }));
  }

  // Figure B: the animal with the most neurons at each moment (one column per moment, log scale).
  let bigSel = null;
  function figBiggest(l) {
    const rows = objRows(l), N = rows.length;
    const W = 1000, H = 440, L = 78, R = 170, T = 30, B = 52, LY0 = 3, LY1 = 12;
    const cw = (W - L - R) / N, x0 = i => L + i * cw;
    const yOf = n => T + (LY1 - Math.log10(n)) / (LY1 - LY0) * (H - T - B);
    let s = '';
    for (let v = LY0; v <= LY1; v++) {
      const y = yOf(Math.pow(10, v)), lab = { 3: '1 thousand', 6: '1 million', 9: '1 billion', 12: '1 trillion' }[v];
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"' + (lab ? '' : ' opacity=".45"') + '/>' + (lab ? '<text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>' : '');
    }
    X.ACTS.forEach((a, k) => {
      const x = x0(a.i0), nx = k + 1 < X.ACTS.length ? x0(X.ACTS[k + 1].i0) : W, full = nx - x > 70;  // crowded early acts keep only their numeral
      s += '<text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '">' + a.n + (full ? ' ' + X.fmtShort(X.E[a.i0].t) : '') + '</text>';
    });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 12) + '">Neurons in the biggest brain alive (log scale: each line is ×10)</text>';
    [['Human brain, 86 billion', 8.6e10], ['Honeybee, 1 million', 9.6e5], ['Fruit fly, 140 thousand', 1.4e5]].forEach(([lab, n]) => {
      const y = yOf(n);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="fref"/><text class="tick" x="' + (W - R + 8) + '" y="' + (y + 4).toFixed(1) + '">' + lab + '</text>';
    });
    let band = '', line = '', first = -1, last = '';
    const place = placer(), labs = [];
    rows.forEach((r, i) => {
      const n = Number(r.neurons);
      if (!(n > 0)) return;
      if (first < 0) first = i;
      const lo = Number(r.low) || n, hi = Number(r.high) || n;
      band += '<rect x="' + x0(i).toFixed(1) + '" y="' + yOf(hi).toFixed(1) + '" width="' + (cw + 0.5).toFixed(1) + '" height="' + Math.max(1, yOf(lo) - yOf(hi)).toFixed(1) + '" class="fband"/>';
      line += (line ? 'L' : 'M') + x0(i).toFixed(1) + ' ' + yOf(n).toFixed(1) + 'L' + (x0(i) + cw).toFixed(1) + ' ' + yOf(n).toFixed(1);
      if (r.animal !== last) { labs.push([i, r, n]); last = r.animal; }
    });
    s += band + '<path class="fstep" d="' + line + '"/>';
    if (first > 0) s += '<text class="tick" x="' + ((L + x0(first)) / 2).toFixed(1) + '" y="' + (yOf(1e3) - 10).toFixed(1) + '" text-anchor="middle">No neurons yet</text>';
    labs.forEach(([i, r, n]) => {
      const name = i === N - 1 ? 'Elephant today: 257 billion' : r.animal, w = name.length * 6.4 + 4;
      const x = i === N - 1 ? W - R + 8 : x0(i) + 3, y = i === N - 1 ? yOf(n) + 4 : yOf(n) - 7;
      const ly = place(x, y, w, 12);
      if (ly != null) s += '<text class="flab" x="' + x.toFixed(1) + '" y="' + ly.toFixed(1) + '">' + esc(name) + '</text>';
    });
    rows.forEach((r, i) => { if (X.CRISIS[r.epoch_id]) s += '<path d="M' + (x0(i) + cw / 2 - 5).toFixed(1) + ' ' + (H - B) + 'l5 -8l5 8z" class="fcrisis"><title>' + esc(X.CRISIS[r.epoch_id]) + '</title></path>'; });
    s += '<line id="bigHov" class="fhov" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" visibility="hidden"/><rect id="bigHit" x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '" fill="transparent"/>';
    const html = '<figure class="lab-fig" id="figB">' +
      '<figcaption><h3>The biggest brain grew about 25 million times</h3><p>The animal with the most neurons alive at each moment, from about 10,000 in the first nerve nets to 257 billion in today’s African elephant. Only the elephant has been counted; the shaded band shows the range of estimates for the rest, and dinosaur brains are disputed. Plants and fungi have no neurons: their electrical signals are counted separately in the census.</p></figcaption>' +
      '<div class="plot-wrap"><svg class="plot fig" id="bigSvg" tabindex="0" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Biggest brain at each of the 64 moments. Use the left and right arrow keys to step through the moments; the table below lists every value.">' + s + '</svg></div>' +
      '<p class="fig-legend"><span><svg width="18" height="10" aria-hidden="true"><path d="M1 5h16" class="fstep"/></svg>Best estimate</span><span><svg width="18" height="10" aria-hidden="true"><rect x="1" y="1" width="16" height="8" class="fband"/></svg>Range of estimates</span><span><svg width="12" height="10" aria-hidden="true"><path d="M1 9l5 -8l5 8z" class="fcrisis"/></svg>Crisis</span></p>' +
      '<p class="time-key" data-time-key="moments"></p>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover the chart, or focus it and use the arrow keys, to read each moment.</p></figure>';
    const bind = () => {
      const svg = $('bigSvg'), hov = $('bigHov'), read = $('figRead');
      const sel = i => {
        bigSel = i = Math.max(0, Math.min(N - 1, i));
        const r = rows[i], n = Number(r.neurons), xm = x0(i) + cw / 2;
        hov.setAttribute('x1', xm); hov.setAttribute('x2', xm); hov.setAttribute('visibility', 'visible');
        const lo = Number(r.low), hi = Number(r.high);
        read.innerHTML = '<b>' + esc(X.fmtTime(Number(r.time_mya))) + '</b> · ' + esc(X.momentText(i).split(': ').slice(1).join(': ')) + '<br>' +
          (n > 0 ? esc(r.animal) + ': about ' + esc(words(n)) + ' neurons' + (lo > 0 && hi > 0 && lo !== hi ? ' (' + esc(words(lo)) + ' to ' + esc(words(hi)) + ')' : '') + ' · ' + esc((EV[r.evidence] || EV.estimate).n) + '. ' + esc(r.method) : 'No neurons yet.') +
          '<br><span class="fig-src">Source: ' + esc(r.source) + '</span>';
      };
      $('bigHit').addEventListener('mousemove', ev => { const b = svg.getBoundingClientRect(); sel(Math.floor(((ev.clientX - b.left) / b.width * W - L) / cw)); });
      $('bigHit').addEventListener('click', ev => { const b = svg.getBoundingClientRect(); sel(Math.floor(((ev.clientX - b.left) / b.width * W - L) / cw)); });
      svg.addEventListener('keydown', ev => {
        const d = { ArrowRight: 1, ArrowLeft: -1, Home: -1e3, End: 1e3 }[ev.key];
        if (d == null) return;
        ev.preventDefault(); sel((bigSel == null ? N - 1 : bigSel) + d);
      });
      if (bigSel != null) sel(bigSel);
    };
    return { html, bind };
  }
  const FIGS = { genomes: figGenomes, biggest: figBiggest };

  /* ---------- ledgers ---------- */
  function drawLedger(k) {
    const l = LED[k];
    const nums = numericCols(l.columns, l.rows);
    const fig = FIGS[k] ? FIGS[k](l) : null;
    $('panel').innerHTML = '<div class="lab-tools"><h2 style="font-size:1.4rem;flex:1 1 300px">' + esc(l.title) + '</h2><a class="btn sm" href="' + esc(l.file) + '" download>Download CSV</a></div>' +
      (fig ? fig.html : '') + table(l.columns, l.rows, nums, { sortCol, sortDir });
    bindSort(() => drawLedger(k));
    if (fig) { fig.bind(); X.timeKeys(); }
  }

  function draw() {
    $('tabs').querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    if (tab === 'census') drawCensus();
    else if (tab === 'plot') drawPlot();
    else drawLedger(tab);
  }

  const h = (location.hash || '').slice(1);
  if (X.IDX[h] !== undefined) { hiRow = X.IDX[h]; preset = 'Story essentials'; }
  else if (LED[h]) tab = h;  // data.html#devices opens that ledger
  draw();
})();
