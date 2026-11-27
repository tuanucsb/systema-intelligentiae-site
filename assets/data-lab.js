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

  const TABS = [['census', 'Census · ' + CEN.rows.length + ' moments'], ['evidence', 'Evidence heat map'], ['plot', 'Plot builder']].concat(Object.keys(LED).map(k => [k, LED[k].title.split(' (')[0]]));
  const TAB_GROUPS = [
    { key: 'all', label: 'All (' + TABS.length + ')', match: null },
    { key: 'core', label: 'Core & checks', match: new Set(['census', 'evidence', 'plot', 'overrides', 'paleoclimate', 'systems', 'censuschecks', 'reconciliations', 'invmedia']) },
    { key: 'dna', label: 'DNA, sex & making', match: new Set(['genomes', 'dnainventory', 'automata', 'sex', 'making', 'motors']) },
    { key: 'bio', label: 'Brains, eyes, plants & immunity', match: new Set(['brains10d', 'eyes10d', 'biggest', 'neural', 'nervegenes', 'nervespeed', 'neuronsbygroup', 'brains', 'deliberation', 'plants', 'immunity']) },
    { key: 'net', label: 'Networks, groups & space', match: new Set(['networks', 'groupsize', 'techpower', 'outsidememory', 'offworld', 'offworld2026']) },
    { key: 'budget', label: '2026 budgets & sources', match: new Set(['bioelectric', 'uncertainty', 'power', 'devices', 'media', 'sources']) }
  ];
  let tab = 'census', tabGroup = 'all', preset = 'Story essentials', filter = '', sortCol = null, sortDir = 1, hiRow = null;
  const CNUM = numericCols(CEN.columns, CEN.rows);

  $('tabs').innerHTML = TABS.map(t => '<button type="button" role="tab" id="tab-' + t[0] + '" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '" tabindex="' + (t[0] === tab ? 0 : -1) + '">' + esc(t[1]) + '</button>').join('');
  function syncTabGroupUI() {
    const grpEl = $('tabGroups');
    const curGrp = TAB_GROUPS.find(g => g.key === tabGroup) || TAB_GROUPS[0];
    if (grpEl) {
      grpEl.innerHTML = TAB_GROUPS.map(g => '<button type="button" class="part-chip" data-tgrp="' + g.key + '" aria-pressed="' + (g.key === tabGroup) + '">' + esc(g.label) + '</button>').join('');
      grpEl.querySelectorAll('[data-tgrp]').forEach(b => b.addEventListener('click', () => {
        tabGroup = b.dataset.tgrp;
        const gObj = TAB_GROUPS.find(g => g.key === tabGroup) || TAB_GROUPS[0];
        if (gObj.match && !gObj.match.has(tab)) {
          const firstMatch = TABS.find(t => gObj.match.has(t[0]));
          if (firstMatch) selectTab(firstMatch[0], false, true);
        }
        syncTabGroupUI();
      }));
    }
    $('tabs').querySelectorAll('[role="tab"]').forEach(b => {
      b.hidden = !!(curGrp.match && !curGrp.match.has(b.dataset.tab));
    });
  }
  function selectTab(nextTab, focusBtn, pushHash) {
    if (!nextTab) return;
    tab = nextTab; sortCol = null; sortDir = 1;
    const curGrp = TAB_GROUPS.find(g => g.key === tabGroup);
    if (curGrp && curGrp.match && !curGrp.match.has(tab)) tabGroup = 'all';
    syncTabGroupUI();
    if (pushHash !== false) {
      try { history.replaceState(null, '', nextTab === 'census' && hiRow == null ? location.pathname : '#' + nextTab); } catch (e) { /* ignore */ }
    }
    draw();
    const active = $('tabs').querySelector('[data-tab="' + tab + '"]');
    if (active) {
      try { active.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' }); } catch (e) { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      if (focusBtn) active.focus();
    }
  }
  $('tabs').addEventListener('click', ev => { const b = ev.target.closest('[data-tab]'); if (b) selectTab(b.dataset.tab, false, true); });
  $('tabs').addEventListener('keydown', ev => {
    const btns = [...$('tabs').querySelectorAll('[role="tab"]:not([hidden])')];
    const cur = btns.indexOf(document.activeElement);
    if (cur < 0) return;
    let nx = -1;
    if (ev.key === 'ArrowRight') nx = (cur + 1) % btns.length;
    else if (ev.key === 'ArrowLeft') nx = (cur - 1 + btns.length) % btns.length;
    else if (ev.key === 'Home') nx = 0;
    else if (ev.key === 'End') nx = btns.length - 1;
    if (nx >= 0) { ev.preventDefault(); selectTab(btns[nx].dataset.tab, true, true); }
  });

  function table(cols, rows, nums, opts) {
    opts = opts || {};
    const idx = cols.map(c => opts.allCols ? opts.allCols.indexOf(c) : cols.indexOf(c));
    let rs = rows.map((r, k) => ({ r, k }));
    if (opts.filter) { const f = opts.filter.toLowerCase(); rs = rs.filter(x => x.r.join(' ').toLowerCase().includes(f)); }
    if (opts.sortCol != null) {
      const j = (opts.allCols || cols).indexOf(opts.sortCol), n = nums.has(opts.sortCol);
      rs.sort((a, b) => { const va = a.r[j], vb = b.r[j]; return (n ? (Number(va) - Number(vb)) : String(va).localeCompare(String(vb))) * opts.sortDir; });
    }
    return '<div class="tbl-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table class="tbl"><thead><tr>' + cols.map(c => '<th scope="col" data-sort="' + esc(c) + '"' + (opts.sortCol === c ? ' aria-sort="' + (opts.sortDir > 0 ? 'ascending' : 'descending') + '"' : '') + '>' + esc(c) + (opts.allCols && (X.SI.numrefs || {})[c] ? ' <button type="button" class="num-i" data-num="' + esc(c) + '"' + (opts.hi != null ? ' data-i="' + opts.hi + '"' : '') + ' aria-label="Where ' + esc(c) + ' comes from" data-tip="Where this column comes from: equation, inputs and sources">i</button>' : '') + '</th>').join('') + '</tr></thead><tbody>' +
      rs.map(x => '<tr' + (opts.hi != null && x.k === opts.hi ? ' class="cur" id="hiRow" style="outline:3px solid var(--c-cpu);outline-offset:-3px"' : '') + '>' + idx.map((j, c) => { const v = x.r[j]; const n = nums.has(cols[c]) && isNum(v); return '<td class="' + (n ? 'n' : '') + '"' + (n ? ' title="' + esc(v) + '"' : '') + '>' + (n ? fmtCell(v) : esc(v)) + '</td>'; }).join('') + '</tr>').join('') +
      (!rs.length && opts.filter ? '<tr><td class="empty" colspan="' + cols.length + '"><div class="em"><span>No moments match “' + esc(opts.filter) + '”. Try a period (Cambrian) or an epoch ID (EP14).</span><button type="button" class="btn sm ghost" id="clearFilt">Clear filter</button></div></td></tr>' : '') +
      '</tbody></table></div><p class="readout">' + rs.length + ' rows × ' + cols.length + ' columns. Click a column title to sort. Hover a number for its exact value.</p>';
  }

  function drawCensus() {
    const cols = (PRESETS[preset] || CEN.columns).filter(c => CEN.columns.indexOf(c) >= 0);
    $('panel').innerHTML = '<div class="lab-tools"><label class="sub" for="preset">Columns</label><select id="preset">' + Object.keys(PRESETS).map(p => '<option' + (p === preset ? ' selected' : '') + '>' + p + '</option>').join('') + '</select>' +
      '<input type="search" id="filt" placeholder="Filter rows: Cambrian, extinction, EP14…" value="' + esc(filter) + '" aria-label="Filter rows">' +
      '<a class="btn sm" href="data/earth_census_68_epochs.csv" download>Download CSV</a></div>' +
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
      '<div class="plot-wrap"><svg id="plot" class="plot" viewBox="0 0 1000 400" role="img" aria-label="Plot of selected census columns"></svg></div><p class="time-key" data-time-key="moments"></p><p class="readout" id="pread">Hover the plot to read values. X axis: the ' + CEN.rows.length + ' moments in order (time not to scale).</p>';
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
    'Paracoccus denitrificans PD1222': 'Aerobic bacterium',
    'Reclinomonas americana mitochondrion': 'Mitochondrion', 'Arabidopsis thaliana chloroplast': 'Chloroplast',
    "Saccharomyces cerevisiae (baker's yeast)": 'Yeast', 'Neurospora crassa': 'Bread mould', 'Monosiga brevicollis (choanoflagellate)': 'Choanoflagellate',
    'Amphimedon queenslandica (sponge)': 'Sponge', 'Nematostella vectensis (sea anemone)': 'Sea anemone', 'Drosophila melanogaster (fruit fly)': 'Fruit fly',
    'Caenorhabditis elegans': 'Roundworm', 'Branchiostoma floridae (lancelet, before the doublings)': 'Lancelet',
    'Neoceratodus forsteri (Australian lungfish)': 'Lungfish', 'Arabidopsis thaliana (thale cress)': 'Thale cress', 'Danio rerio (zebrafish)': 'Zebrafish',
    'Gallus gallus (chicken)': 'Chicken', 'Homo sapiens': 'Human', 'Paramecium tetraurelia': 'Paramecium',
    'Tmesipteris oblanceolata (fork fern)': 'Fork fern (largest genome)', 'Nasuia deltocephalinicola': 'Insect symbiont (smallest)',
    'Sorangium cellulosum So0157-2': 'Soil myxobacterium',
    'Chlamydomonas reinhardtii (green alga)': 'Green alga', 'Physcomitrium patens (moss)': 'Moss',
    'Chondrus crispus (red alga)': 'Irish moss (red alga)', 'Marchantia polymorpha (liverwort)': 'Liverwort',
    'Anthoceros agrestis (hornwort)': 'Hornwort', 'Ceratopteris richardii (fern)': 'Ceratopteris fern',
    'Ectocarpus siliculosus (brown alga)': 'Brown seaweed', 'Pinus taeda (loblolly pine)': 'Loblolly pine (22B)',
    'Amborella trichopoda': 'Amborella (flowering plant)', 'Triticum aestivum (bread wheat)': 'Bread wheat',
    'Oryza sativa (rice)': 'Rice', 'Zea mays (maize)': 'Maize'
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
      '<figcaption><h3>Genomes grew, then stopped tracking complexity</h3><p>Each point is the genome of a living stand-in for a milestone, placed at the milestone’s date. Genomes grew about a thousandfold up to the first complex cells. After that, size and complexity part ways: a fern holds 50 times our DNA, a lungfish 14 times. <a href="stories.html#dna-story">Read the full DNA story →</a> · <a href="tree.html#path=dna">Walk DNA in the Tree →</a></p></figcaption>' +
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
      '<figcaption><h3>The biggest brain grew about 25 million times</h3><p>The animal with the most neurons alive at each moment, from about 10,000 in the first nerve nets to 257 billion in today’s African elephant. Only the elephant has been counted; the shaded band shows the range of estimates for the rest, and dinosaur brains are disputed. Plants and fungi have no neurons: their electrical signals are counted separately in the census. <a href="stories.html#nerves-story">Read the full nerves story →</a> · <a href="tree.html#path=neural">Walk neural evolution in the Tree →</a></p></figcaption>' +
      '<div class="plot-wrap"><svg class="plot fig" id="bigSvg" tabindex="0" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Biggest brain at each of the ' + N + ' moments. Use the left and right arrow keys to step through the moments; the table below lists every value.">' + s + '</svg></div>' +
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
  // Figure C: 16 sophistication steps of sexual reproduction across 3.8 billion years (log time vs step 1..16).
  let sexStage = 'All';
  function figSex(l) {
    const rows = objRows(l).sort((a, b) => Number(a.sophistication_level) - Number(b.sophistication_level));
    const stages = ['All'].concat([...new Set(rows.map(r => r.stage))]);
    const W = 1000, H = 480, L = 66, R = 210, T = 28, B = 52;
    const LX0 = 9.65, LX1 = 1.0;
    const xOf = mya => {
      const yrs = Math.max(10, Number(mya) * 1e6);
      return L + (LX0 - Math.log10(yrs)) / (LX0 - LX1) * (W - L - R);
    };
    const yOf = lvl => T + (16 - Number(lvl)) / 15 * (H - T - B);
    let s = '';
    [[9.6, '4 Ga'], [9, '1 Ga'], [8.7, '500 Ma'], [8, '100 Ma'], [7, '10 Ma'], [6, '1 Ma'], [4, '10 ka'], [1.7, '1978']].forEach(([v, lab]) => {
      const x = L + (LX0 - v) / (LX0 - LX1) * (W - L - R);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '"/><text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    [1, 4, 8, 12, 16].forEach(lvl => {
      const y = yOf(lvl);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" opacity=".45"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">Step ' + lvl + '</text>';
    });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Time before today (log scale: each step right is ×10 closer to 2026)</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">Cumulative sophistication of sexual reproduction (16 steps)</text>';
    let pathD = '', bars = '', pts = '', labs = '';
    rows.forEach((r, i) => {
      const x = xOf(r.time_mya), y = yOf(r.sophistication_level), e = EV[r.evidence] || EV.estimate;
      const on = sexStage === 'All' || r.stage === sexStage;
      pathD += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      if (r.low_mya !== '' && r.high_mya !== '') {
        const x1 = xOf(r.high_mya), x2 = xOf(r.low_mya);
        bars += '<line x1="' + x1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + e.c + '" stroke-width="3" opacity="' + (on ? '0.35' : '0.1') + '"/>';
      }
      pts += '<g class="fpt' + (on ? '' : ' dim') + '" tabindex="' + (on ? 0 : -1) + '" role="button" data-i="' + i + '" aria-label="' + esc('Step ' + r.sophistication_level + ': ' + r.plain_title) + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="11" fill="transparent"/>' + sym(e.s, x, y, 5.5, e.c) + '</g>';
      if (on) {
        const rightSide = x > W - R - 130;
        labs += '<text class="flab" x="' + (rightSide ? x - 9 : x + 9).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="' + (rightSide ? 'end' : 'start') + '">' + esc(r.plain_title) + '</text>';
      }
    });
    s += '<path d="' + pathD + '" fill="none" stroke="var(--c-make)" stroke-width="1.8" stroke-dasharray="4 3" opacity=".55"/>' + bars + labs + pts;
    const html = '<figure class="lab-fig" id="figS">' +
      '<figcaption><h3>How sexual reproduction began and grew sophisticated over 3.8 billion years</h3><p>From bacterial sideways DNA repair and eukaryotic meiosis to Bangiomorpha (1.05 Ga, oldest sexual fossil), unequal sperm and egg, armored-fish internal mating (385 Ma), pollen tubes, XY/ZW chromosomes, flowers and pollinators, mammal placentas, learned courtship songs, human grandmothers and IVF. Horizontal bars show each date’s uncertainty window. <a href="stories.html#sex-story">Read the full sex story →</a> · <a href="tree.html#path=sex">Walk this path in the Tree →</a></p></figcaption>' +
      '<div class="fig-tools" role="group" aria-label="Filter by stage">' + stages.map(g => '<button type="button" class="part-chip" data-g="' + esc(g) + '" aria-pressed="' + (g === sexStage) + '">' + esc(g.replace(/^\d+\.\s*/, '')) + '</button>').join('') + '</div>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sixteen steps in the evolution of sexual reproduction against log time. The table below lists every value.">' + s + '</svg></div>' +
      '<p class="fig-legend"><span>How each date is known:</span>' + ['fossil', 'molecular_clock', 'living_inference', 'measured'].map(k => '<span>' + legendSym(EV[k].s, EV[k].c) + esc(EV[k].n) + '</span>').join('') + '</p>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any step (and use Left/Right arrow keys) to inspect its mechanism, organism, parental investment and date evidence.</p></figure>';
    return {
      html,
      bind: () => bindPoints(rows, r => '<b>Step ' + esc(r.sophistication_level) + '/16 · ' + esc(r.plain_title) + '</b> (' + esc(X.fmtTime(Number(r.time_mya))) + ' · ' + esc((EV[r.evidence] || EV.estimate).n) + esc(rangeText(Number(r.low_mya), Number(r.high_mya))) + ')' +
        '<br>' + esc(r.plain_text) +
        '<br><b>Organism:</b> ' + esc(r.representative_organism) + ' · <b>Mode:</b> ' + esc(r.gamete_and_mating_mode) + ' · <b>Care:</b> ' + esc(r.parental_and_social_investment) +
        '<br><span class="fig-src">Source: ' + esc(r.source) + (r.inv ? ' · <a href="tree.html#' + esc(r.inv) + '">View in Tree →</a>' : '') + '</span>', g => { sexStage = g; })
    };
  }
  // Figure D: Computing beyond Earth — distance from Earth (log km & light-time) vs onboard compute (ops/s).
  let spaceFilter = 'All';
  const SPACE_SHORT = {
    'Explorer 1 & Vanguard 1 Orbital Transistor Telemetry': 'Explorer 1 (1958)',
    'Mariner 4 Central Computer & Endless-Loop Tape Recorder': 'Mariner 4 (1965)',
    'IBM Gemini Guidance Computer (Gemini 3–12)': 'Gemini (1965)',
    'Apollo Block II Guidance Computer (Command & Lunar Modules)': 'Apollo 11 AGC (1969)',
    'Pioneer 10 & Pioneer 11 (Jupiter/Saturn & Solar Escape)': 'Pioneer 10 (1972)',
    'Viking 1 & 2 Landers (Plated-Wire Guidance & Lab Computers)': 'Viking 1 (1976)',
    'Voyager 1 & Voyager 2 Six-Computer Suite + Golden Records': 'Voyager launch (1977)',
    'Galileo Jupiter Orbiter (Radiation-Hardened Microprocessors)': 'Galileo (1989)',
    'Hubble Space Telescope (DF-224 → Radiation-Hardened 80486)': 'Hubble (1990)',
    'Mars Pathfinder (RAD6000) & Sojourner Autonomous Rover (80C85)': 'Pathfinder & Sojourner (1997)',
    'Cassini Saturn Orbiter & Huygens Titan Lander': 'Cassini-Huygens (1997)',
    'New Horizons Pluto & Kuiper Belt Probe (Mongoose-V)': 'New Horizons (64 AU)',
    'Curiosity Rover (RAD750 + AEGIS Autonomous Target Selection)': 'Curiosity (2012)',
    'Perseverance Rover (RAD750 + Vision FPGA) & Ingenuity Helicopter (Snapdragon 801)': 'Perseverance & Ingenuity (2021)',
    'James Webb Space Telescope (Sun–Earth L2, 1.5 Million km)': 'James Webb at L2 (2021)',
    'DART SMART Nav Autonomous Asteroid Redirector & Psyche Deep-Space Laser': 'DART & Psyche laser (2022)',
    'Voyager 1 Crosses One Light-Day from Earth (Nov 2026, ~173 AU)': 'Voyager 1: 1 light-day (2026)',
    'Total Active Off-Earth Computing Fleet (~17,500 Satellites & ~40 Deep-Space Probes)': 'All ~17,540 off-Earth craft (2026)'
  };
  function figOffworld(l) {
    const rows = objRows(l);
    const groups = ['All', 'Active in 2026', 'Historical / dormant'];
    const isAct = r => String(r.active_2026 || '').startsWith('Yes') || String(r.active_2026 || '').startsWith('Perseverance');
    const matchGrp = r => spaceFilter === 'All' || (spaceFilter === 'Active in 2026' ? isAct(r) : !isAct(r));
    const W = 1000, H = 500, L = 82, R = 36, T = 34, B = 56;
    const LX0 = 2.2, LX1 = 10.65, LY0 = 1.6, LY1 = 16.0;
    const xOf = km => L + (Math.log10(Math.max(200, km)) - LX0) / (LX1 - LX0) * (W - L - R);
    const yOf = ops => T + (LY1 - Math.log10(Math.max(50, ops))) / (LY1 - LY0) * (H - T - B);
    let s = '';
    [[2, '100/s'], [5, '100k/s'], [8, '100M/s'], [11, '100B/s'], [14, '100T/s']].forEach(([v, lab]) => {
      const y = yOf(Math.pow(10, v));
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });
    [
      [400, 'LEO · 1.3 ms'],
      [384400, 'Moon · 1.3 s'],
      [1.5e6, 'L2 · 5 s'],
      [2.25e8, 'Mars · 12.5 min'],
      [1.43e9, 'Saturn · 1.3 hr'],
      [9.61e9, 'Kuiper · 8.9 hr'],
      [2.59e10, '1 light-day (25.9B km)']
    ].forEach(([km, lab]) => {
      const x = xOf(km);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="2 3"/>' +
        '<text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="' + (km > 1e10 ? 'end' : 'middle') + '">' + lab + '</text>';
    });
    const yPhone = yOf(5e12);
    s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yPhone.toFixed(1) + '" y2="' + yPhone.toFixed(1) + '" class="fref"/>' +
      '<text class="tick" x="' + (L + 8) + '" y="' + (yPhone - 6).toFixed(1) + '">1 modern smartphone on Earth (~5×10¹² ops/s)</text>';
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Distance from Earth &amp; one-way speed-of-light radio delay (log scale) →</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 12) + '">Onboard computing speed, operations per second (log scale)</text>';

    const place = placer(W - 8);
    place.reserve(0, 0, L - 2, H);
    rows.forEach(r => {
      const x = xOf(Number(r.distance_from_earth_km)), y = yOf(Number(r.compute_ops_sec));
      place.reserve(x - 8, y - 8, x + 8, y + 8);
    });
    let pts = '', labs = '';
    rows.forEach((r, i) => {
      const km = Number(r.distance_from_earth_km), ops = Number(r.compute_ops_sec);
      const x = xOf(km), y = yOf(ops), act = isAct(r), on = matchGrp(r);
      const fill = r.mission_or_system.indexOf('Total Active') >= 0 ? 'var(--c-prog)' : (act ? 'var(--s-silicon)' : 'var(--ink-3)');
      const shape = act ? 'diamond' : 'circle';
      const sName = SPACE_SHORT[r.mission_or_system] || r.plain_title;
      pts += '<g class="fpt' + (on ? '' : ' dim') + '" tabindex="' + (on ? 0 : -1) + '" role="button" data-i="' + i + '" aria-label="' + esc(sName + ', ' + X.sci(km) + ' km, ' + X.sci(ops) + ' ops/s') + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12" fill="transparent"/>' + sym(shape, x, y, 5.8, fill) + '</g>';
      if (on) {
        const w = sName.length * 6.2 + 4;
        let p = place(x + 9, y + 4, w, 13, x - 9);
        if (typeof p === 'number') p = { x: x + 9, y: p };
        if (p) labs += '<text class="flab" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '">' + esc(sName) + '</text>';
      }
    });
    s += labs + pts;
    const fmtLt = sec => sec >= 3600 ? (sec / 3600).toFixed(1) + ' hours' : sec >= 60 ? (sec / 60).toFixed(1) + ' minutes' : sec >= 0.5 ? sec.toFixed(2) + ' seconds' : (sec * 1000).toFixed(1) + ' ms';
    const html = '<figure class="lab-fig" id="figO">' +
      '<figcaption><h3>The farther a computer leaves Earth, the leaner and tougher its brain must be</h3><p>Outside Earth’s magnetic shield and repair reach, cosmic rays flip bits inside dense modern chips and sunlight fades with the square of distance. Every deep-space explorer beyond low orbit—including Voyager 1 at one full light-day (25.9 billion km, 69 KB of memory, ~12,000 ops/s)—computes slower than a single pocket phone, yet uses onboard autonomy because radio commands take minutes to 24 hours to arrive. All ~17,540 active off-planet spacecraft together run ~1.9×10¹⁵ ops/s, just 0.00001% of Earth’s silicon fleet. <a href="tree.html#path=space">Walk the spaceflight path in the Tree →</a> · <a href="data.html#offworld2026">Open the 2026 6-zone space inventory →</a></p></figcaption>' +
      '<div class="fig-tools" role="group" aria-label="Filter spacecraft">' + groups.map(g => '<button type="button" class="part-chip" data-g="' + esc(g) + '" aria-pressed="' + (g === spaceFilter) + '">' + esc(g) + '</button>').join('') + '</div>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Spacecraft computing speed against distance from Earth, 18 milestones from low orbit to Voyager 1 at 1 light-day.">' + s + '</svg></div>' +
      '<p class="fig-legend"><span>Status in 2026:</span><span>' + legendSym('diamond', 'var(--s-silicon)') + 'Active in space today</span><span>' + legendSym('circle', 'var(--ink-3)') + 'Historical / silent</span><span>' + legendSym('diamond', 'var(--c-prog)') + '2026 all-space total</span></p>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any spacecraft (Left/Right arrow keys step through) to inspect its distance, light-time delay, hardware, memory, radio bit rate and power source.</p></figure>';
    return {
      html,
      bind: () => bindPoints(rows, r => '<b>' + esc(r.plain_title) + ' (' + esc(r.year_ce) + ')</b> · ' + esc(r.regime) +
        '<br><b>Distance:</b> ' + X.sci(Number(r.distance_from_earth_km)) + ' km (' + esc(fmtLt(Number(r.one_way_light_time_s))) + ' one-way light time) · <b>Compute:</b> ' + X.sci(Number(r.compute_ops_sec)) + ' ops/s' +
        (Number(r.ram_bits) > 0 ? ' · <b>RAM:</b> ' + X.sci(Number(r.ram_bits)) + ' bits' : '') +
        (Number(r.downlink_bits_sec) > 0 ? ' · <b>Downlink:</b> ' + X.sci(Number(r.downlink_bits_sec)) + ' bits/s' : '') +
        '<br>' + esc(r.plain_text) +
        '<br><b>Hardware:</b> ' + esc(r.processor_hardware) + ' · <b>Power:</b> ' + X.watts(Number(r.power_watts)) + ' (' + esc(r.power_source) + ') · <b>2026:</b> ' + esc(r.active_2026) +
        '<br><span class="fig-src">Source: ' + esc(r.source) + (r.inv ? ' · <a href="tree.html#' + esc(r.inv) + '">View in Tree →</a>' : '') + '</span>', g => { spaceFilter = g; })
    };
  }
  // Figure E: Molecular motors vs. passive diffusion (crossing time t = L^2 / 2D vs active transport).
  let motorSel = null;
  function figMotors(l) {
    const rows = objRows(l).filter(r => Number(r.velocity_um_s) > 0);
    const W = 1000, H = 460, L = 86, R = 175, T = 30, B = 54;
    const LX0 = 0, LX1 = 6, LY0 = -3.5, LY1 = 10.6; // x: log10(um) 1 um..1 m; y: log10(sec) 0.3 ms..1,585 yr
    const xOf = um => L + (Math.log10(um) - LX0) / (LX1 - LX0) * (W - L - R);
    const yOf = sec => T + (LY1 - Math.log10(sec)) / (LY1 - LY0) * (H - T - B);
    let s = '';
    [
      [-3, '1 ms'],
      [0, '1 sec'],
      [1.78, '1 min'],
      [3.56, '1 hour'],
      [4.94, '1 day'],
      [7.5, '1 year'],
      [10.7, '1,585 yr']
    ].forEach(([ly, lab]) => {
      if (ly < LY0 || ly > LY1) return;
      const y = yOf(Math.pow(10, ly));
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });
    [
      [1, '1 µm (bacterium)'],
      [20, '20 µm (eukaryote)'],
      [1000, '1 mm (worm / leaf)'],
      [1e4, '1 cm'],
      [1e6, '1 m (human axon)']
    ].forEach(([um, lab]) => {
      const x = xOf(um);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="2 3"/><text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });

    // Quadratic diffusion curve: t = L^2 / (2 * D), D = 10 um^2/s for cytoplasmic protein
    let diffD = '';
    for (let k = 0; k <= 60; k++) {
      const um = Math.pow(10, LX0 + (LX1 - LX0) * k / 60);
      const sec = (um * um) / 20.0;
      diffD += (k ? 'L' : 'M') + xOf(um).toFixed(1) + ' ' + yOf(sec).toFixed(1);
    }
    s += '<path d="' + diffD + '" fill="none" stroke="var(--crisis)" stroke-width="2.6" stroke-dasharray="6 4"/>' +
      '<text class="tick" x="' + (W - R + 8) + '" y="' + (yOf(5e10) + 4).toFixed(1) + '" style="fill:var(--crisis-ink);font-weight:700">Passive diffusion (1,585 yr)</text>';

    // Active linear transport lines: t = um / v_um_s
    const LINES = [
      ['Kinesin-1 (~1 µm/s)', 1.0, 'var(--c-wire)'],
      ['Fast axonal (~4 µm/s)', 4.0, 'var(--c-store)'],
      ['Plant Myosin XI (50 µm/s)', 50.0, 'var(--s-chem)'],
      ['Bare nerve spike (1 m/s)', 1e6, 'var(--s-neuro)'],
      ['Myelinated spike (120 m/s)', 1.2e8, 'var(--c-cpu)']
    ];
    LINES.forEach(([lab, v, col]) => {
      const pts = [];
      for (const um of [1, 1e6]) {
        const sec = um / v, ly = Math.log10(sec);
        if (ly >= LY0 && ly <= LY1) pts.push([um, sec]);
      }
      for (const ly of [LY0, LY1]) {
        const sec = Math.pow(10, ly), um = sec * v, lx = Math.log10(um);
        if (lx >= LX0 && lx <= LX1) pts.push([um, sec]);
      }
      pts.sort((a, b) => a[0] - b[0]);
      if (pts.length >= 2) {
        const p0 = pts[0], p1 = pts[pts.length - 1];
        s += '<line x1="' + xOf(p0[0]).toFixed(1) + '" y1="' + yOf(p0[1]).toFixed(1) + '" x2="' + xOf(p1[0]).toFixed(1) + '" y2="' + yOf(p1[1]).toFixed(1) + '" stroke="' + col + '" stroke-width="2"/>';
        if (Math.abs(Math.log10(p1[0]) - LX1) < 0.05) {
          s += '<text class="tick" x="' + (W - R + 8) + '" y="' + (yOf(p1[1]) + 4).toFixed(1) + '">' + esc(lab) + '</text>';
        }
      }
    });

    // Plot measured motors at characteristic cellular/organismal distances
    let pts = '';
    rows.forEach((r, i) => {
      const v = Number(r.velocity_um_s);
      const um = r.milestone.indexOf('Axonal') >= 0 ? 1e6 : (r.milestone.indexOf('Myosin XI') >= 0 ? 1e5 : (r.milestone.indexOf('Flagellar') >= 0 || r.milestone.indexOf('FtsZ') >= 0 ? 2 : 30));
      const sec = Math.max(Math.pow(10, LY0 + 0.2), Math.min(Math.pow(10, LY1 - 0.2), um / v));
      const x = xOf(um), y = yOf(sec), e = EV[r.evidence] || EV.estimate;
      pts += '<g class="fpt" tabindex="0" role="button" data-i="' + i + '" aria-label="' + esc(r.plain_title + ': ' + v + ' µm/s') + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="11" fill="transparent"/>' + sym(e.s, x, y, 5.5, e.c) + '</g>';
    });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Distance across cell, leaf or nerve fiber (log₁₀ scale, 1 µm → 1 m)</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">Crossing time (log₁₀ scale: quadratic diffusion vs. linear motors &amp; spikes)</text>' + pts;

    const html = '<figure class="lab-fig" id="figM">' +
      '<figcaption><h3>Why complex cells and brains needed walking motors: the quadratic diffusion wall</h3><p>Across a 1-µm bacterium, passive thermal drifting crosses the cell in ~50 milliseconds—so bacteria never needed indoor cargo walkers. Because diffusion time grows with the <b>square</b> of distance (t = L²/2D), drifting a protein down a 1-meter human sciatic nerve would take ~1,585 years; ATP-driven kinesin highways deliver cargo in ~3–11 days while myelinated spikes carry the electrical message in 8 milliseconds. <a href="stories.html#motors-story">Read the motors story →</a> · <a href="tree.html#path=motors">Walk motors in the Tree →</a></p></figcaption>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Log-log crossing time versus distance comparing passive diffusion against kinesin, myosin XI and nerve spikes.">' + s + '</svg></div>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any motor point (Left/Right arrows step through) to read its speed, step size, force and ATP cost.</p></figure>';
    return {
      html,
      bind: () => bindPoints(rows, r => '<b>' + esc(r.plain_title) + '</b> (' + esc(X.fmtTime(Number(r.time_mya))) + ') · <b>' + esc(r.velocity_um_s) + ' µm/s</b>' +
        (Number(r.step_nm) > 0 ? ' · ' + esc(r.step_nm) + ' nm step' : '') +
        (Number(r.force_pn) > 0 ? ' · ' + esc(r.force_pn) + ' pN stall force' : '') +
        '<br>' + esc(r.plain_text) + '<br><span class="fig-src">Source: ' + esc(r.source) + '</span>', () => {})
    };
  }

  // Figure F: Replication, reproduction & manufacturing — Blueprint bits vs. Copy fidelity (log-log).
  let makeCat = 'All';
  function figMaking(l) {
    const rows = objRows(l).filter(r => Number(r.blueprint_bits) > 0 && Number(r.copy_error_per_bit) > 0);
    const cats = ['All'].concat([...new Set(rows.map(r => r.mode_category))]);
    const W = 1000, H = 470, L = 86, R = 36, T = 30, B = 54;
    const LX0 = 1.8, LX1 = 14.6, LY0 = 1.0, LY1 = 13.6; // y = -log10(error_per_bit): higher = more accurate!
    const xOf = bits => L + (Math.log10(bits) - LX0) / (LX1 - LX0) * (W - L - R);
    const yOf = err => T + (LY1 - (-Math.log10(err))) / (LY1 - LY0) * (H - T - B);
    let s = '';
    [[2, '1 in 100'], [5, '1 in 10⁵'], [9, '1 in 10⁹'], [12, '1 in 10¹²']].forEach(([acc, lab]) => {
      const y = T + (LY1 - acc) / (LY1 - LY0) * (H - T - B);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });
    [[2, '100 b'], [5, '100 kb'], [8, '100 Mb'], [11, '100 Gb'], [14, '100 Tb']].forEach(([lb, lab]) => {
      const x = L + (lb - LX0) / (LX1 - LX0) * (W - L - R);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="2 3"/><text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    // Eigen error threshold diagonal: bits * err = 1 => -log10(err) = log10(bits)
    s += '<line x1="' + xOf(100).toFixed(1) + '" y1="' + yOf(0.01).toFixed(1) + '" x2="' + xOf(3.9e13).toFixed(1) + '" y2="' + yOf(1 / 3.9e13).toFixed(1) + '" class="fref"/>' +
      '<text class="tick" x="' + (xOf(1e7) + 8).toFixed(1) + '" y="' + (yOf(1e-7) + 14).toFixed(1) + '">Eigen threshold (~1 error per full blueprint)</text>';
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Blueprint size in bits (RNA strand → genome → book → 100B-transistor EUV chip mask)</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">Copying accuracy (1 error in N bits; higher = cleaner copying)</text>';

    const place = placer(W - 8);
    place.reserve(0, 0, L - 2, H);
    const CAT_COL = {
      '1.': ['var(--s-chem)', 'circle'],
      '2.': ['var(--c-make)', 'diamond'],
      '3.': ['var(--c-backup)', 'square'],
      '4.': ['var(--s-silicon)', 'triangle']
    };
    rows.forEach(r => { place.reserve(xOf(Number(r.blueprint_bits)) - 7, yOf(Number(r.copy_error_per_bit)) - 7, xOf(Number(r.blueprint_bits)) + 7, yOf(Number(r.copy_error_per_bit)) + 7); });
    let pts = '', labs = '';
    rows.forEach((r, i) => {
      const bits = Number(r.blueprint_bits), err = Number(r.copy_error_per_bit);
      const x = xOf(bits), y = yOf(err);
      const on = makeCat === 'All' || r.mode_category === makeCat;
      const [col, shp] = CAT_COL[r.mode_category.slice(0, 2)] || ['var(--c-make)', 'circle'];
      const shortM = r.milestone.split(' (')[0].slice(0, 32);
      pts += '<g class="fpt' + (on ? '' : ' dim') + '" tabindex="' + (on ? 0 : -1) + '" role="button" data-i="' + i + '" aria-label="' + esc(r.milestone + ', ' + X.sci(bits) + ' bits') + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="11" fill="transparent"/>' + sym(shp, x, y, 5.5, col) + '</g>';
      if (on) {
        let p = place(x + 9, y + 4, shortM.length * 6.1 + 4, 12, x - 9);
        if (typeof p === 'number') p = { x: x + 9, y: p };
        if (p) labs += '<text class="flab" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '">' + esc(shortM) + '</text>';
      }
    });
    s += labs + pts;
    const html = '<figure class="lab-fig" id="figMk">' +
      '<figcaption><h3>Every leap in blueprint size demanded a matching leap in copying fidelity</h3><p>Without proofreading, Hadean RNA templates hit Eigen’s error cliff around ~200 bits. Cells jumped to megabase and gigabase genomes via polymerase proofreading and mismatch repair; human craft restarted at low accuracy with hand-knapped stone before movable type, precision lathes, silicon photolithography and 13.5-nm EUV scanners pushed exosomatic manufacturing past 10¹³ bits. <a href="tree.html#path=making">Walk replication &amp; making in the Tree →</a></p></figcaption>' +
      '<div class="fig-tools" role="group" aria-label="Filter mode">' + cats.map(g => '<button type="button" class="part-chip" data-g="' + esc(g) + '" aria-pressed="' + (g === makeCat) + '">' + esc(g.replace(/^\d+\.\s*/, '')) + '</button>').join('') + '</div>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Blueprint bits versus copying fidelity across 24 biological and technological replication milestones.">' + s + '</svg></div>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any milestone to read its blueprint bits, error rate, cycle time, energy cost and autonomy.</p></figure>';
    return {
      html,
      bind: () => bindPoints(rows, r => '<b>' + esc(r.milestone) + '</b> (' + esc(r.representative_system) + ')' +
        '<br><b>Blueprint:</b> ~' + X.sci(Number(r.blueprint_bits)) + ' bits · <b>Error:</b> ' + X.sci(Number(r.copy_error_per_bit)) + '/bit · <b>Autonomy:</b> ' + esc(r.self_sufficiency) +
        '<br>' + esc(r.what_changed) + '<br><span class="fig-src">Source: ' + esc(r.source) + '</span>', g => { makeCat = g; })
    };
  }

  // Figure G: The world's neurons by animal group across 55 moments (555 Ma -> 2026).
  let cladeSel = null;
  function figNeuronsByGroup(l) {
    const rows = objRows(l), N = rows.length;
    const W = 1000, H = 440, L = 82, R = 175, T = 30, B = 52, LY0 = 18, LY1 = 25;
    const cw = (W - L - R) / Math.max(1, N - 1), xOf = i => L + i * cw;
    const yOf = v => T + (LY1 - Math.log10(Math.max(1e18, v))) / (LY1 - LY0) * (H - T - B);
    let s = '';
    for (let v = LY0; v <= LY1; v++) {
      const y = yOf(Math.pow(10, v));
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">10' + X.sup(v) + '</text>';
    }
    [0, Math.floor(N * 0.25), Math.floor(N * 0.5), Math.floor(N * 0.75), N - 1].forEach(i => {
      const x = xOf(i);
      s += '<text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + esc(X.fmtShort(Number(rows[i].time_mya))) + '</text>';
    });
    const SERIES = [
      ['census_n_neurons_global', 'Census global curve (3.4×10²⁴)', 'var(--ink-3)', true],
      ['arthropods_land', 'Land arthropods (5.0×10²³)', 'var(--s-neuro)', false],
      ['nematodes', 'Soil roundworms (1.3×10²³)', 'var(--c-store)', false],
      ['fish', 'Fish (1.0×10²²)', 'var(--c-io)', false],
      ['humans', 'All 8.2B humans (7.1×10²⁰)', 'var(--c-prog)', false],
      ['birds', 'Wild & domestic birds (1.5×10¹⁹)', 'var(--c-power)', false]
    ];
    SERIES.forEach(([col, lab, color, dashed]) => {
      let d = '', pen = false, lastY = null;
      rows.forEach((r, i) => {
        const v = Number(r[col]);
        if (v >= 1e18) {
          const y = yOf(v);
          d += (pen ? 'L' : 'M') + xOf(i).toFixed(1) + ' ' + y.toFixed(1);
          pen = true; lastY = y;
        } else { pen = false; }
      });
      if (d) {
        s += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + (dashed ? '1.8' : '2.4') + '"' + (dashed ? ' stroke-dasharray="5 4"' : '') + '/>';
        if (lastY != null) s += '<text class="tick" x="' + (W - R + 8) + '" y="' + (lastY + 4).toFixed(1) + '" style="fill:' + color + ';font-weight:600">' + esc(lab.split(' (')[0]) + '</text>';
      }
    });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">Total neurons on Earth by animal group (log₁₀ scale, 555 Ma → 2026)</text>' +
      '<line id="clHov" class="fhov" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" visibility="hidden"/>' +
      '<rect id="clHit" x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '" fill="transparent"/>';

    const html = '<figure class="lab-fig" id="figCl">' +
      '<figcaption><h3>Tiny invertebrates hold >98% of Earth’s neurons; all humans hold ~0.1%</h3><p>Summing sourced animal clades today gives ~6.4×10²³ neurons—led by land mites, springtails and insects (~5.0×10²³) and soil roundworms (~1.3×10²³)—about fivefold below the census’s 3.4×10²⁴ upper curve (which leaves room for uncounted ocean copepods and higher mean arthropod neuron counts). All 8.2 billion humans together hold ~7.05×10²⁰ neurons. <a href="stories.html#nerves-story">Read the nerves story →</a></p></figcaption>' +
      '<div class="plot-wrap"><svg class="plot fig" id="clSvg" tabindex="0" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Neurons on Earth by animal clade across 55 moments from 555 million years ago to 2026.">' + s + '</svg></div>' +
      '<p class="time-key" data-time-key="moments"></p>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover the chart, or focus it and press Left/Right arrow keys, to compare animal groups at any moment.</p></figure>';
    const bind = () => {
      const svg = $('clSvg'), hov = $('clHov'), read = $('figRead');
      const sel = i => {
        cladeSel = i = Math.max(0, Math.min(N - 1, i));
        const r = rows[i], x = xOf(i);
        hov.setAttribute('x1', x); hov.setAttribute('x2', x); hov.setAttribute('visibility', 'visible');
        read.innerHTML = '<b>' + esc(X.fmtTime(Number(r.time_mya))) + ' (' + esc(r.epoch_id) + ')</b> · Sum of groups: <b>' + X.sci(Number(r.sum_of_groups)) + '</b> vs. Census: <b>' + X.sci(Number(r.census_n_neurons_global)) + '</b>' +
          '<br>Land arthropods: ' + X.sci(Number(r.arthropods_land)) + ' · Roundworms: ' + X.sci(Number(r.nematodes)) + ' · Fish: ' + X.sci(Number(r.fish)) + ' · Birds: ' + X.sci(Number(r.birds)) + ' · Humans: ' + X.sci(Number(r.humans));
      };
      $('clHit').addEventListener('mousemove', ev => { const b = svg.getBoundingClientRect(); sel(Math.round(((ev.clientX - b.left) / b.width * W - L) / cw)); });
      $('clHit').addEventListener('click', ev => { const b = svg.getBoundingClientRect(); sel(Math.round(((ev.clientX - b.left) / b.width * W - L) / cw)); });
      svg.addEventListener('keydown', ev => {
        const d = { ArrowRight: 1, ArrowLeft: -1, Home: -1e3, End: 1e3 }[ev.key];
        if (d == null) return;
        ev.preventDefault(); sel((cladeSel == null ? N - 1 : cladeSel) + d);
      });
    };
    return { html, bind };
  }

  // Figure H: Plant & fungal sensing without neurons — signal speed vs. memory window across 14 milestones.
  let plantCat = 'All';
  function figPlants(l) {
    const rows = objRows(l);
    const cats = ['All'].concat([...new Set(rows.map(r => r.category))]);
    const W = 1000, H = 450, L = 86, R = 36, T = 32, B = 54, XLOCAL = 132, XS0 = 200;
    const LX0 = -5.2, LX1 = 0.35, LY0 = -0.6, LY1 = 7.7;
    const xOf = spd => spd > 0 ? XS0 + (Math.log10(spd) - LX0) / (LX1 - LX0) * (W - R - XS0) : XLOCAL;
    const yOf = mem => T + (LY1 - Math.log10(Math.max(0.3, mem))) / (LY1 - LY0) * (H - T - B);
    let s = '';
    [[0, '1 second'], [1.778, '1 minute'], [3.556, '1 hour'], [4.937, '1 day'], [6.414, '1 month'], [7.499, '1 year']].forEach(([lv, lab]) => {
      const y = T + (LY1 - lv) / (LY1 - LY0) * (H - T - B);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });
    [[-5, '10 µm/s'], [-4, '0.1 mm/s'], [-3, '1 mm/s'], [-2, '1 cm/s'], [-1, '10 cm/s'], [0, '1 m/s']].forEach(([lv, lab]) => {
      const x = XS0 + (lv - LX0) / (LX1 - LX0) * (W - R - XS0);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="2 3"/><text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    s += '<line class="grid" x1="' + ((XLOCAL + XS0) / 2).toFixed(1) + '" x2="' + ((XLOCAL + XS0) / 2).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="3 4"/>' +
      '<text class="tick" x="' + XLOCAL + '" y="' + (H - B + 18) + '" text-anchor="middle">local cell</text>' +
      '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + XS0 + '" y="' + (H - 8) + '">Signal propagation speed across tissue, roots or air (log₁₀ m/s; myelinated animal nerves run 50–100× further right)</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">Memory or integration window (half a second → seasons &amp; years)</text>';
    const PCAT = {
      'Light & daily clocks': ['var(--c-power)', 'circle'],
      'Electrical & calcium waves': ['var(--c-wire)', 'triangle'],
      'Hydraulics & root foraging': ['var(--s-chem)', 'square'],
      'Seasonal & touch memory': ['var(--c-ram)', 'diamond'],
      'Chemical & pollinator signalling': ['var(--c-make)', 'circle']
    };
    const place = placer(W - 8);
    place.reserve(0, 0, L - 2, H);
    rows.forEach(r => { const x = xOf(Number(r.signal_speed_m_s)), y = yOf(Number(r.memory_window_s)); place.reserve(x - 7, y - 7, x + 7, y + 7); });
    let pts = '', labs = '';
    rows.forEach((r, i) => {
      const spd = Number(r.signal_speed_m_s), mem = Number(r.memory_window_s);
      const x = xOf(spd), y = yOf(mem);
      const on = plantCat === 'All' || r.category === plantCat;
      const [col, shp] = PCAT[r.category] || ['var(--s-chem)', 'circle'];
      const shortP = r.plain_title.length > 34 ? r.plain_title.slice(0, 32) + '…' : r.plain_title;
      pts += '<g class="fpt' + (on ? '' : ' dim') + '" tabindex="' + (on ? 0 : -1) + '" role="button" data-i="' + i + '" aria-label="' + esc(r.plain_title + ', ' + r.representative_system) + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12" fill="transparent"/>' + sym(shp, x, y, 5.8, col) + '</g>';
      if (on) {
        let p = place(x + 9, y + 4, shortP.length * 6.0 + 4, 12, spd > 0 ? x - 9 : null);
        if (typeof p === 'number') p = { x: x + 9, y: p };
        if (p) labs += '<text class="flab" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '">' + esc(shortP) + '</text>';
      }
    });
    s += labs + pts;
    const fmtMem = sec => sec >= 3.15e7 ? (sec / 3.1536e7).toFixed(1).replace(/\.0$/, '') + ' yr' : sec >= 86400 ? Math.round(sec / 86400) + ' d' : sec >= 3600 ? (sec / 3600).toFixed(1).replace(/\.0$/, '') + ' h' : sec >= 60 ? Math.round(sec / 60) + ' min' : sec + ' s';
    const html = '<figure class="lab-fig" id="figPl">' +
      '<figcaption><h3>Without nerves, plants trade speed for timescales from milliseconds to seasons</h3><p>Rooted organisms never paid the 20-watt metabolic bill of a brain, yet they compute across eight orders of magnitude in time: from half-second algal light steering and 20-second Venus flytrap calcium counters to two-minute vascular glutamate wound waves, winter-long Polycomb histone counters and multi-year seed dormancy. <a href="stories.html#plants-story">Read the plants &amp; fungi story →</a> · <a href="tree.html#path=plants">Walk plants in the Tree →</a></p></figcaption>' +
      '<div class="fig-tools" role="group" aria-label="Filter plant signalling category">' + cats.map(g => '<button type="button" class="part-chip" data-g="' + esc(g) + '" aria-pressed="' + (g === plantCat) + '">' + esc(g) + '</button>').join('') + '</div>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Plant and fungal signal propagation speed versus memory window across 14 milestones.">' + s + '</svg></div>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any milestone to read its organism, signalling channel, propagation speed, memory window and source.</p></figure>';
    return {
      html,
      bind: () => bindPoints(rows, r => '<b>' + esc(r.plain_title) + '</b> (' + esc(r.representative_system) + ' · ' + esc(X.fmtTime(Number(r.time_mya))) + ')' +
        '<br><b>Channel:</b> ' + esc(r.signalling_channel) + ' · <b>Speed:</b> ' + (Number(r.signal_speed_m_s) > 0 ? X.plain(Number(r.signal_speed_m_s)) + ' m/s' : 'cell-autonomous switch') + ' · <b>Memory window:</b> ~' + fmtMem(Number(r.memory_window_s)) +
        '<br>' + esc(r.plain_text) + '<br><span class="fig-src">Source: ' + esc(r.source) + '</span>', g => { plantCat = g; })
    };
  }

  // Figure I: Immune evolution — time (log scale) vs. threat repertoire diversity across 12 milestones.
  let immStage = 'All';
  function figImmunity(l) {
    const rows = objRows(l);
    const stages = ['All'].concat([...new Set(rows.map(r => r.stage))]);
    const W = 1000, H = 450, L = 86, R = 36, T = 32, B = 54;
    const LX0 = 9.7, LX1 = 0.5, LY0 = -0.3, LY1 = 14.8;
    const xOf = t => L + (LX0 - Math.log10(Math.max(3, t * 1e6))) / (LX0 - LX1) * (W - R - L);
    const yOf = rep => T + (LY1 - Math.log10(Math.max(1, rep))) / (LY1 - LY0) * (H - T - B);
    let s = '';
    [[0, '1 clone'], [3, '1 thousand'], [6, '1 million'], [9, '1 billion'], [12, '1 trillion'], [14, '100 trillion']].forEach(([lv, lab]) => {
      const y = T + (LY1 - lv) / (LY1 - LY0) * (H - T - B);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });
    [[9.6, '4 Ga'], [9, '1 Ga'], [8.7, '500 Ma'], [8, '100 Ma'], [6, '1 Ma'], [4, '10 ka'], [2.4, '1800 CE'], [0.8, '2020 CE']].forEach(([lv, lab]) => {
      const x = L + (LX0 - lv) / (LX0 - LX1) * (W - R - L);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="2 3"/><text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Time before present (log₁₀ years: archaean phage wars → Cambrian vertebrates → modern vaccines)</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">Distinct molecular targets recognized (repertoire diversity, log₁₀ scale)</text>';
    const ISTG = {
      '1.': ['var(--s-chem)', 'circle'],
      '2.': ['var(--c-store)', 'square'],
      '3.': ['var(--c-prog)', 'diamond'],
      '4.': ['var(--s-silicon)', 'triangle']
    };
    const place = placer(W - 8);
    place.reserve(0, 0, L - 2, H);
    rows.forEach(r => { const x = xOf(Number(r.time_mya)), y = yOf(Number(r.repertoire_diversity)); place.reserve(x - 7, y - 7, x + 7, y + 7); });
    let pts = '', labs = '';
    rows.forEach((r, i) => {
      const x = xOf(Number(r.time_mya)), y = yOf(Number(r.repertoire_diversity));
      const on = immStage === 'All' || r.stage === immStage;
      const [col, shp] = ISTG[r.stage.slice(0, 2)] || ['var(--c-prog)', 'circle'];
      const shortI = r.milestone.split(' (')[0].slice(0, 32);
      pts += '<g class="fpt' + (on ? '' : ' dim') + '" tabindex="' + (on ? 0 : -1) + '" role="button" data-i="' + i + '" aria-label="' + esc(r.plain_title + ', repertoire ' + X.sci(Number(r.repertoire_diversity))) + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12" fill="transparent"/>' + sym(shp, x, y, 5.8, col) + '</g>';
      if (on) {
        let p = place(x + 9, y + 4, shortI.length * 6.0 + 4, 12, x - 9);
        if (typeof p === 'number') p = { x: x + 9, y: p };
        if (p) labs += '<text class="flab" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '">' + esc(shortI) + '</text>';
      }
    });
    s += labs + pts;
    const html = '<figure class="lab-fig" id="figIm">' +
      '<figcaption><h3>Earth’s second learning system jumped a billionfold in diversity with early vertebrates</h3><p>Hardwired pattern sensors recognize tens to hundreds of microbial motifs; CRISPR-Cas stores thousands of heritable viral spacers; around 500–450 Ma, jawless lampreys (VLR) and jawed fishes (RAG1/2 V(D)J) independently invented somatic gene shuffling across 10¹¹–10¹⁴ lymphocyte receptors—now steered deliberately by vaccines, monoclonal antibodies, CAR-T cells and digital mRNA. <a href="stories.html#immunity-story">Read the immunity story →</a> · <a href="tree.html#path=immunity">Walk immunity in the Tree →</a></p></figcaption>' +
      '<div class="fig-tools" role="group" aria-label="Filter immune evolution stage">' + stages.map(g => '<button type="button" class="part-chip" data-g="' + esc(g) + '" aria-pressed="' + (g === immStage) + '">' + esc(g.replace(/^\d+\.\s*/, '')) + '</button>').join('') + '</div>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Immune repertoire diversity across deep time from bacterial restriction enzymes to mRNA vaccines.">' + s + '</svg></div>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any milestone to read its immune mechanism, repertoire size, memory duration and citation.</p></figure>';
    return {
      html,
      bind: () => bindPoints(rows, r => '<b>' + esc(r.plain_title) + '</b> (' + esc(r.representative_system) + ' · ' + esc(X.fmtTime(Number(r.time_mya))) + ')' +
        '<br><b>Repertoire:</b> ~' + X.sci(Number(r.repertoire_diversity)) + ' targets · <b>Memory duration:</b> ' + (Number(r.memory_duration_yr) >= 100 ? 'heritable across generations (~' + Number(r.memory_duration_yr) + '+ yr)' : Number(r.memory_duration_yr) > 0 ? '~' + Number(r.memory_duration_yr) + ' yr' : 'innate immediate response') +
        '<br>' + esc(r.plain_text) + '<br><span class="fig-src">Source: ' + esc(r.source) + '</span>', g => { immStage = g; })
    };
  }

  // Figure J: 2026 Closed Power Budget — Compartment Power (W) vs. Event Rate (events/s) with iso-cost E = P/C lines.
  function figPower(l) {
    const raw = objRows(l);
    const items = [];
    raw.forEach(r => {
      const nm = String(r.compartment || '');
      if (nm.startsWith('SUBTOTAL') || nm.startsWith('GRAND') || nm.startsWith('2a.')) return;
      const isTech = nm.startsWith('4.');
      const isAnim = nm.startsWith('3.');
      const pw = isTech ? 8.0e10 : (isAnim ? 1.8e11 : Number(r.compartment_power_w));
      const fullPw = Number(r.compartment_power_w);
      const ev = Number(r.compartment_event_rate_ops_s);
      const ej = Number(r.effective_energy_per_event_j) || (pw / ev);
      if (pw > 0 && ev > 0) {
        items.push({
          short: nm.startsWith('1a.') ? 'Deep subsurface microbes (0.69 TW)' :
            nm.startsWith('1b.') ? 'Starved soil/ocean microbes (3.89 TW)' :
            nm.startsWith('1c.') ? 'Active surface microbes (9.42 TW)' :
            nm.startsWith('2b.') ? 'Active plant, fungal & protist cells (48.5 TW)' :
            isAnim ? 'Animal neural tissue (0.18 TW of 2.5 TW animals)' :
            'Global computers & IT (80 GW of 19.5 TW tech)',
          color: nm.startsWith('1') ? 'var(--s-chem)' : nm.startsWith('2') ? 'var(--act-3)' : isAnim ? 'var(--s-neuro)' : 'var(--s-silicon)',
          shape: nm.startsWith('1') ? 'circle' : nm.startsWith('2') ? 'square' : isAnim ? 'diamond' : 'triangle',
          pw, fullPw, ev, ej,
          ontology: r.event_ontology,
          source: r.primary_source_ref
        });
      }
    });
    const W = 1000, H = 430, L = 82, R = 36, T = 30, B = 52;
    const LX0 = 21.4, LX1 = 34.2, LY0 = 10.4, LY1 = 14.2;
    const xOf = c => L + (Math.log10(c) - LX0) / (LX1 - LX0) * (W - L - R);
    const yOf = p => T + (LY1 - Math.log10(p)) / (LY1 - LY0) * (H - T - B);
    let s = '';
    [[22, '10²²/s'], [25, '10²⁵/s'], [28, '10²⁸/s'], [31, '10³¹/s'], [34, '10³⁴/s']].forEach(([lx, lab]) => {
      const x = xOf(Math.pow(10, lx));
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke-dasharray="2 3"/><text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    [[11, '100 GW'], [12, '1 TW'], [13, '10 TW'], [14, '100 TW']].forEach(([ly, lab]) => {
      const y = yOf(Math.pow(10, ly));
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });
    // Iso-energy diagonals: log10(P) = log10(C) + log10(E)
    [[-20.56, 'Landauer floor (2.8×10⁻²¹ J)', 'var(--c-power)'], [-18, '10⁻¹⁸ J / event', 'var(--line-2)'], [-15, '10⁻¹⁵ J / event', 'var(--line-2)'], [-12, '10⁻¹² J / event', 'var(--line-2)']].forEach(([le, lab, col]) => {
      const pts = [];
      for (const lx of [LX0, LX1]) { const ly = lx + le; if (ly >= LY0 && ly <= LY1) pts.push([lx, ly]); }
      for (const ly of [LY0, LY1]) { const lx = ly - le; if (lx >= LX0 && lx <= LX1) pts.push([lx, ly]); }
      pts.sort((a, b) => a[0] - b[0]);
      if (pts.length >= 2) {
        const p0 = pts[0], p1 = pts[pts.length - 1];
        const x1 = xOf(Math.pow(10, p0[0])), y1 = yOf(Math.pow(10, p0[1])), x2 = xOf(Math.pow(10, p1[0])), y2 = yOf(Math.pow(10, p1[1]));
        s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + col + '" stroke-width="' + (le < -20 ? '2' : '1.4') + '" stroke-dasharray="5 4"/>';
        s += '<text class="tick" x="' + ((x1 + x2) / 2).toFixed(1) + '" y="' + ((y1 + y2) / 2 - 5).toFixed(1) + '" text-anchor="middle">' + esc(lab) + '</text>';
      }
    });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">Compartment event rate C (operations or signals per second, log₁₀) →</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">Signalling / metabolic power P (watts, log₁₀; diagonals = energy per event E = P ÷ C)</text>';

    const place = placer(W - 8);
    place.reserve(0, 0, L - 2, H);
    items.forEach(it => place.reserve(xOf(it.ev) - 8, yOf(it.pw) - 8, xOf(it.ev) + 8, yOf(it.pw) + 8));
    let pts = '', labs = '';
    items.forEach((it, i) => {
      const x = xOf(it.ev), y = yOf(it.pw);
      pts += '<g class="fpt" tabindex="0" role="button" data-i="' + i + '" aria-label="' + esc(it.short + ', ' + X.sci(it.ev) + '/s, ' + X.sci(it.ej) + ' J/event') + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12" fill="transparent"/>' + sym(it.shape, x, y, 6.2, it.color) + '</g>';
      let p = place(x + 10, y + 4, it.short.length * 6.0 + 6, 13, x - 10);
      if (typeof p === 'number') p = { x: x + 10, y: p };
      if (p) labs += '<text class="flab" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '">' + esc(it.short) + '</text>';
    });
    s += labs + pts;
    const html = '<figure class="lab-fig" id="figPwr">' +
      '<figcaption><h3>Earth’s 84.5 TW closed power budget: power vs. event rate across compartments</h3><p>Diagonal lines mark constant energy per operation (<b>E = P ÷ C</b>). Active surface microbes sit within ×1.5 of Landauer’s physical limit (4.05×10⁻²¹ J/turnover), non-woody plant and fungal cells capture 48.5 TW, animal nervous tissue spends ~0.18 TW of animals’ 2.5 TW total (~6×10⁻¹⁶ J/synapse), and all world computers draw 80 GW of humanity’s 19.5 TW primary energy (~4.2×10⁻¹² J/op). <a href="how.html#math">Inspect all 12 equations →</a></p></figcaption>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Log-log map of compartment power versus event rate across six biospheric and technological compartments in 2026.">' + s + '</svg></div>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any compartment to read its power, event rate, joules per event and primary literature sources.</p></figure>';
    return {
      html,
      bind: () => bindPoints(items, it => '<b>' + esc(it.short) + '</b> · Signalling/metabolic power: <b>' + X.watts(it.pw) + '</b>' +
        (it.fullPw > it.pw * 1.1 ? ' (within ' + X.watts(it.fullPw) + ' compartment total)' : '') +
        ' · Rate: <b>' + X.sci(it.ev) + '/s</b> · Energy/event: <b>' + X.sci(it.ej) + ' J</b>' +
        '<br>' + esc(it.ontology) + '<br><span class="fig-src">Source: ' + esc(it.source) + '</span>', () => {})
    };
  }

  // Figure K: 2026 Global Computer Inventory — Peak vs. Executed Ops/s (C_exec = N * peak * u) across 4 hardware tiers.
  function figDevices(l) {
    const rows = objRows(l).filter(r => !String(r.device_family || '').startsWith('TOTAL'));
    const W = 1000, H = 310, L = 278, R = 185, T = 28, B = 40, PW = W - L - R;
    const maxOps = 3.2e22;
    const xW = v => Math.max(3, (v / maxOps) * PW);
    const rowH = (H - T - B) / rows.length;
    const COLORS = ['var(--c-cpu)', 'var(--s-silicon)', 'var(--c-store)', 'var(--c-wire)'];
    let s = '';
    [0, 1e22, 2e22, 3e22].forEach(v => {
      const x = L + (v / maxOps) * PW;
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (T - 6) + '" y2="' + (H - B) + '"/>' +
        '<text class="tick" x="' + x.toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle">' + (v === 0 ? '0' : (v / 1e22) + '×10²²/s') + '</text>';
    });
    rows.forEach((r, k) => {
      const y = T + k * rowH + 8, bh = rowH - 18;
      const pk = Number(r.aggregate_peak_ops_sec), ex = Number(r.executed_ops_sec_central), u = Number(r.utilization_central);
      const gw = Number(r.aggregate_wall_power_gw), short = r.device_family.split(' (')[0];
      const col = COLORS[k % COLORS.length];
      s += '<g class="fpt" tabindex="0" role="button" data-i="' + k + '" aria-label="' + esc(short + ': ' + X.sci(ex) + ' executed of ' + X.sci(pk) + ' peak ops/s') + '">' +
        '<rect x="8" y="' + (y - 4).toFixed(1) + '" width="' + (W - 16) + '" height="' + (bh + 8).toFixed(1) + '" fill="transparent"/>' +
        '<text x="' + (L - 12) + '" y="' + (y + bh * 0.68).toFixed(1) + '" text-anchor="end" fill="var(--ink)" font-size="12.5" font-weight="700">' + esc(short) + '</text>' +
        '<rect x="' + L + '" y="' + y.toFixed(1) + '" width="' + xW(pk).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="4" fill="' + col + '" opacity="0.22" stroke="' + col + '" stroke-width="1.2"/>' +
        '<rect x="' + L + '" y="' + y.toFixed(1) + '" width="' + xW(ex).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="4" fill="' + col + '"/>' +
        '<text x="' + (L + xW(pk) + 8).toFixed(1) + '" y="' + (y + bh * 0.68).toFixed(1) + '" fill="var(--ink-2)" font-size="12" class="tnum"><tspan font-weight="700" fill="var(--ink)">' + X.sci(ex) + '/s</tspan> (' + Math.round(u * 100) + '% of ' + X.sci(pk) + ') · ' + gw + ' GW</text></g>';
    });
    const html = '<figure class="lab-fig" id="figDev">' +
      '<figcaption><h3>Peak capacity vs. real executed compute across Earth’s 6.49 billion active chips</h3><p>Advertised hardware peaks add up to <b>7.6×10²² ops/s</b>, but phones and PCs sit idle most of the day (~14.5% utilization) while datacenter AI accelerators run hot (~60% utilization). Multiplying each family by its duty cycle (<b>C<sub>exec</sub> = N · peak · u</b>) gives <b>1.89×10²² executed ops/s</b> on <b>80 GW</b>—with 15 million AI chips already delivering nearly half (9.0×10²¹/s) of all executed silicon work.</p></figcaption>' +
      '<div class="plot-wrap"><svg class="plot fig" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Horizontal bar chart comparing advertised peak operations per second (translucent bar) against sustained executed operations per second (solid bar) across four global computer hardware families in 2026.">' + s + '</svg></div>' +
      '<p class="fig-legend"><span>Bars:</span><span><svg width="16" height="10" aria-hidden="true"><rect x="1" y="1" width="14" height="8" rx="2" style="fill:var(--c-cpu)"/></svg>Executed ops/s (C_exec)</span><span><svg width="16" height="10" aria-hidden="true"><rect x="1" y="1" width="14" height="8" rx="2" style="fill:var(--c-cpu);opacity:.24;stroke:var(--c-cpu)"/></svg>Advertised peak ops/s</span></p>' +
      '<p class="readout fig-read" id="figRead" aria-live="polite">Hover, tap or tab to any hardware family to inspect its active unit count, precision domain, utilization range, wall power and J/op.</p></figure>';
    return {
      html,
      bind: () => bindPoints(rows, r => '<b>' + esc(r.device_family) + '</b> · Units: <b>' + X.sci(Number(r.installed_active_units_2026)) + '</b> · Precision: ' + esc(r.dominant_precision_domain) +
        '<br>Peak: <b>' + X.sci(Number(r.aggregate_peak_ops_sec)) + '/s</b> × Utilization <b>' + (Number(r.utilization_central) * 100).toFixed(1) + '%</b> (' + esc(r.utilization_range) + ') = Executed: <b>' + X.sci(Number(r.executed_ops_sec_central)) + '/s</b>' +
        ' · Power: <b>' + esc(r.aggregate_wall_power_gw) + ' GW</b> (' + X.sci(Number(r.energy_per_op_j)) + ' J/op)' +
        '<br><span class="fig-src">Source: ' + esc(r.primary_source_ref) + '</span>', () => {})
    };
  }

  const FIGS = { genomes: figGenomes, biggest: figBiggest, sex: figSex, offworld: figOffworld, motors: figMotors, making: figMaking, neuronsbygroup: figNeuronsByGroup, plants: figPlants, immunity: figImmunity, power: figPower, devices: figDevices };

  /* ---------- B7: Evidence heat map (26 census numbers × 68 moments) ---------- */
  const EV_TIERS = {
    measured: { label: 'Measured / inventory', sym: '●', desc: 'Direct modern census, thermometer/ice-core record, UN/imperial census or hardware inventory' },
    fossil_proxy: { label: 'Fossil, proxy & archive', sym: '◆', desc: 'Fossil brain/colony record, geochemical/paleoclimate proxy compilation or historical archive' },
    calc: { label: 'Calculated from equation', sym: '=', desc: 'Worked out deterministically by formula from other columns in the census' },
    scenario: { label: 'Sourced scenario', sym: '~', desc: 'Model assumption or conditional scenario anchored to a published study' },
    hand_unsourced: { label: 'Set by hand · no source', sym: '?', desc: 'Entered by hand for this moment with no per-moment source dataset' }
  };
  let evFilter = 'all';

  function drawEvidence() {
    const NR = X.SI.numrefs || {};
    const cols = Object.keys(NR);
    const OVR = LED.overrides || { columns: [], rows: [] };
    const iEp = OVR.columns.indexOf('epoch_id'), iCol = OVR.columns.indexOf('census_column'),
      iTier = OVR.columns.indexOf('evidence_tier'), iSrc = OVR.columns.indexOf('source'), iNt = OVR.columns.indexOf('note');
    const ovMap = {};
    OVR.rows.forEach(r => { ovMap[r[iEp] + '|' + r[iCol]] = r; });

    const counts = { measured: 0, fossil_proxy: 0, calc: 0, scenario: 0, hand_unsourced: 0 };
    const grid = cols.map(col => {
      const R = NR[col];
      const cells = X.E.map((e, i) => {
        const hit = ovMap[e.id + '|' + col];
        let tier = 'calc', src = '', note = '';
        if (hit) {
          tier = EV_TIERS[hit[iTier]] ? hit[iTier] : 'scenario';
          src = hit[iSrc] || '';
          note = hit[iNt] || '';
        } else if (R.kind === 'assume') {
          tier = 'scenario';
          note = 'Calculated from a sourced model assumption (' + (R.eq || '') + ').';
        } else if (R.kind !== 'calc' && !(R.in && R.in.length)) {
          tier = (R.s && R.s.length) ? 'scenario' : 'hand_unsourced';
        } else {
          tier = 'calc';
          note = 'Calculated deterministically from ' + (R.in || []).map(X.numName).join(', ') + '.';
        }
        counts[tier] = (counts[tier] || 0) + 1;
        return { col, i, ep: e.id, t: e.t, tier, src, note, val: R.k ? e[R.k] : null };
      });
      return { col, name: X.numName(col), cells };
    });

    const totCells = cols.length * X.N;
    const actSpan = X.ACTS.map((a, ai) => {
      const i1 = ai < X.ACTS.length - 1 ? X.ACTS[ai + 1].i0 : X.N;
      return { n: a.n, title: a.title, span: i1 - a.i0 };
    });

    const filtBar = '<div class="fig-tools" role="group" aria-label="Filter evidence level">' +
      '<button type="button" class="part-chip" data-evf="all" aria-pressed="' + (evFilter === 'all') + '">All (' + totCells.toLocaleString('en-US') + ')</button>' +
      Object.keys(EV_TIERS).map(tk => {
        const m = EV_TIERS[tk], c = counts[tk] || 0;
        return '<button type="button" class="part-chip ev-chip-' + tk + '" data-evf="' + tk + '" aria-pressed="' + (evFilter === tk) + '"><span class="ev-sym" aria-hidden="true">' + m.sym + '</span> ' + esc(m.label) + ' (' + c + ')</button>';
      }).join('') + '</div>';

    const legendHtml = '<div class="ev-legend">' + Object.keys(EV_TIERS).map(tk => {
      const m = EV_TIERS[tk];
      return '<div class="ev-leg-item"><span class="ev-swatch ev-' + tk + '" aria-hidden="true">' + m.sym + '</span><div><b>' + esc(m.label) + '</b><span>' + esc(m.desc) + '</span></div></div>';
    }).join('') + '</div>';

    const theadActs = '<tr class="ev-acts"><th scope="col" class="ev-sticky">Census number (' + cols.length + ')</th>' +
      actSpan.map(a => '<th scope="colgroup" colspan="' + a.span + '" title="Act ' + esc(a.n) + ': ' + esc(a.title) + '">Act ' + esc(a.n) + '</th>').join('') + '</tr>';
    const theadMoms = '<tr class="ev-moms"><th scope="col" class="ev-sticky">Click any cell for its source</th>' +
      X.E.map((e, i) => '<th scope="col" title="' + esc(X.fmtShort(e.t) + ' — ' + X.titleOf(i)) + '">' + (i === 0 || i === X.N - 1 || i % 5 === 0 ? esc(X.fmtShort(e.t).replace(' ago', '')) : '·') + '</th>').join('') + '</tr>';

    const tbody = grid.map(row => '<tr><th scope="row" class="ev-sticky"><button type="button" class="num-link" data-num="' + esc(row.col) + '">' + esc(row.name) + '</button></th>' +
      row.cells.map(c => {
        const m = EV_TIERS[c.tier];
        const dim = evFilter !== 'all' && evFilter !== c.tier ? ' is-dim' : '';
        return '<td class="ev-td"><button type="button" class="ev-cell ev-' + c.tier + dim + '" data-evcol="' + esc(c.col) + '" data-evi="' + c.i + '" aria-label="' + esc(row.name + ' at ' + X.fmtShort(c.t) + ': ' + m.label) + '">' + m.sym + '</button></td>';
      }).join('') + '</tr>').join('');

    $('panel').innerHTML = '<div class="lab-tools"><h2 style="font-size:1.4rem;flex:1 1 320px">Evidence heat map · ' + cols.length + ' numbers × ' + X.N + ' moments</h2>' +
      (LED.overrides ? '<a class="btn sm" href="' + esc(LED.overrides.file) + '" download>Download overrides CSV</a>' : '') + '</div>' +
      '<p class="lede" style="font-size:15px;margin:0 0 12px">Every cell shows how one census number is known at one moment in history—from direct modern measurements (<b>●</b>) and fossil/proxy series (<b>◆</b>) to equations (<b>=</b>), sourced scenarios (<b>~</b>) and moments set by hand with no source (<b>?</b>). Click any cell to open its equation, inputs and source.</p>' +
      filtBar + legendHtml +
      '<p class="readout fig-read" id="evRead" aria-live="polite">Hover or focus any cell to inspect its moment, value, evidence level and source; click to open “Where this number comes from”.</p>' +
      '<div class="tbl-wrap ev-wrap" tabindex="0" role="region" aria-label="Evidence heat map across ' + cols.length + ' census numbers and ' + X.N + ' moments"><table class="ev-grid"><thead>' + theadActs + theadMoms + '</thead><tbody>' + tbody + '</tbody></table></div>';

    $('panel').querySelectorAll('[data-evf]').forEach(b => b.addEventListener('click', () => {
      evFilter = b.dataset.evf;
      drawEvidence();
    }));

    const evRead = $('evRead');
    const lookupCell = btn => {
      const col = btn.dataset.evcol, idx = Number(btn.dataset.evi);
      const rObj = grid.find(g => g.col === col);
      return rObj ? rObj.cells[idx] : null;
    };
    const showEv = btn => {
      const c = lookupCell(btn);
      if (!c || !evRead) return;
      const m = EV_TIERS[c.tier];
      evRead.innerHTML = '<b>' + esc(X.numName(c.col)) + '</b> · <b>' + esc(c.i === X.N - 1 ? 'Today (2026)' : X.fmtShort(c.t)) + '</b>: <b>' + esc(c.val != null ? X.numFmt(c.col, c.val) : '—') + '</b> · <span class="chip">' + m.sym + ' ' + esc(m.label) + '</span>' +
        (c.note ? ' — ' + esc(c.note) : '') + (c.src ? ' <span class="fig-src">(Source: ' + esc(c.src) + ')</span>' : '');
    };
    const evWrap = $('panel').querySelector('.ev-grid');
    if (evWrap) {
      evWrap.addEventListener('pointerover', ev => { const b = ev.target.closest('.ev-cell'); if (b) showEv(b); });
      evWrap.addEventListener('focusin', ev => { const b = ev.target.closest('.ev-cell'); if (b) showEv(b); });
      evWrap.addEventListener('click', ev => {
        const b = ev.target.closest('.ev-cell');
        if (!b) return;
        showEv(b);
        X.numPanel(b.dataset.evcol, Number(b.dataset.evi));
      });
    }
  }

  /* ---------- ledgers ---------- */
  let uncScope = 'today';
  const ACT_STARTS = new Set(X.ACTS.map(a => X.E[a.i0] && X.E[a.i0].id).filter(Boolean));
  function drawLedger(k) {
    const l = LED[k];
    const nums = numericCols(l.columns, l.rows);
    const fig = FIGS[k] ? FIGS[k](l) : null;
    let rowsToShow = l.rows, extraTools = '';
    if (k === 'uncertainty' && l.columns.indexOf('epoch_id') >= 0) {
      const iEp = l.columns.indexOf('epoch_id');
      const todayRows = l.rows.filter((r, idx) => idx < 19 || r[iEp] === 'EP32b');
      const actRows = l.rows.filter((r, idx) => idx < 19 || ACT_STARTS.has(r[iEp]));
      rowsToShow = uncScope === 'today' ? todayRows : uncScope === 'acts' ? actRows : l.rows;
      extraTools = '<div class="fig-tools" role="group" aria-label="Filter Monte Carlo scope" style="margin-bottom:10px">' +
        '<button type="button" class="part-chip" data-uscope="today" aria-pressed="' + (uncScope === 'today') + '">Today & extinction drops (' + todayRows.length + ')</button>' +
        '<button type="button" class="part-chip" data-uscope="acts" aria-pressed="' + (uncScope === 'acts') + '">Today + 7 Act openings (' + actRows.length + ')</button>' +
        '<button type="button" class="part-chip" data-uscope="all" aria-pressed="' + (uncScope === 'all') + '">All 68 moments (' + l.rows.length + ')</button></div>';
    }
    $('panel').innerHTML = '<div class="lab-tools"><h2 style="font-size:1.4rem;flex:1 1 300px">' + esc(l.title) + '</h2><a class="btn sm" href="' + esc(l.file) + '" download>Download CSV</a></div>' +
      (fig ? fig.html : '') + extraTools + table(l.columns, rowsToShow, nums, { sortCol, sortDir });
    $('panel').querySelectorAll('[data-uscope]').forEach(b => b.addEventListener('click', () => { uncScope = b.dataset.uscope; drawLedger(k); }));
    bindSort(() => drawLedger(k));
    if (fig) { fig.bind(); X.timeKeys(); }
  }

  function draw() {
    $('tabs').querySelectorAll('[data-tab]').forEach(b => {
      const on = b.dataset.tab === tab;
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
      if (on) $('panel').setAttribute('aria-labelledby', b.id);
    });
    if (tab === 'census') drawCensus();
    else if (tab === 'evidence') drawEvidence();
    else if (tab === 'plot') drawPlot();
    else drawLedger(tab);
  }

  function applyHash() {
    const h = (location.hash || '').slice(1);
    if (X.IDX[h] !== undefined) { tab = 'census'; hiRow = X.IDX[h]; preset = 'Story essentials'; }
    else if (h === 'plot' || h === 'census' || h === 'evidence') { tab = h; hiRow = null; }
    else if (LED[h]) { tab = h; hiRow = null; }
    const curGrp = TAB_GROUPS.find(g => g.key === tabGroup);
    if (curGrp && curGrp.match && !curGrp.match.has(tab)) tabGroup = 'all';
  }
  applyHash();
  syncTabGroupUI();
  draw();
  const initBtn = $('tabs').querySelector('[data-tab="' + tab + '"]');
  if (initBtn) { try { initBtn.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' }); } catch (e) { /* ignore */ } }
  addEventListener('hashchange', () => { applyHash(); syncTabGroupUI(); sortCol = null; sortDir = 1; draw(); });
})();
