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

  /* ---------- ledgers ---------- */
  function drawLedger(k) {
    const l = LED[k];
    const nums = numericCols(l.columns, l.rows);
    $('panel').innerHTML = '<div class="lab-tools"><h2 style="font-size:1.4rem;flex:1 1 300px">' + esc(l.title) + '</h2><a class="btn sm" href="' + esc(l.file) + '" download>Download CSV</a></div>' +
      table(l.columns, l.rows, nums, { sortCol, sortDir });
    bindSort(() => drawLedger(k));
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
