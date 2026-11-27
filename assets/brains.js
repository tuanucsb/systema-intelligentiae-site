/* Interactive 10-Dimension Brain Evolution Explorer (brains.html) */
(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('brains');
  const $ = id => document.getElementById(id);
  const esc = X.esc;

  // Hydrate full 52-column ledger rows from window.SI_LEDGERS.brains10d
  const LED = (window.SI_LEDGERS && window.SI_LEDGERS.brains10d) || { columns: [], rows: [] };
  const COLS = LED.columns;
  const ROWS = LED.rows.map(arr => {
    const obj = {};
    COLS.forEach((c, i) => { obj[c] = arr[i]; });
    obj._t = Number(obj.time_mya || 0);
    obj._neu = Number(obj.neurons || 0);
    obj._fneu = Number(obj.forebrain_or_pallial_neurons || 0);
    obj._mass = Number(obj.brain_mass_g || 0);
    obj._eq = Number(obj.eq_index || 0);
    obj._dens = Number(obj.neurons_per_gram || 0);
    obj._syn = Number(obj.synapses || 0);
    obj._vel = Number(obj.axon_speed_m_s || 0);
    obj._w = Number(obj.brain_power_watts || 0);
    obj._share = Number(obj.body_power_share_pct || 0);
    obj._ops = Number(obj.neural_ops_sec || 0);
    obj._opj = Number(obj.ops_per_joule || 0);
    obj._wm = Number(obj.working_memory_bits || 0);
    obj._store = Number(obj.synaptic_storage_bits || 0);
    obj._tau = Number(obj.deliberation_horizon_s || 0);
    obj._reg = Number(obj.brain_regions_count || 0);
    obj._ctypes = Number(obj.cell_types_count || 0);
    obj._bps = Number(obj.comm_bandwidth_bits_sec || 0);
    obj._grp = Number(obj.social_group_size || 0);
    obj._yr = Number(obj.maturation_time_yr || 0);
    obj._comp = Number(obj.composite_10d_index || 0);
    obj._scores = [
      Number(obj.d1_neurons_score || 0),
      Number(obj.d2_mass_eq_score || 0),
      Number(obj.d3_wiring_speed_score || 0),
      Number(obj.d4_power_budget_score || 0),
      Number(obj.d5_compute_score || 0),
      Number(obj.d6_memory_score || 0),
      Number(obj.d7_horizon_score || 0),
      Number(obj.d8_complexity_score || 0),
      Number(obj.d9_language_score || 0),
      Number(obj.d10_plasticity_score || 0)
    ];
    return obj;
  });
  const BY_SLUG = {};
  ROWS.forEach(r => { BY_SLUG[r.slug] = r; });

  const GROUP_COLORS = {
    'Pre-neural': '#169674',
    'Nerve nets & invertebrates': '#0e87b8',
    'Fish & amphibians': '#2b6cb0',
    'Reptiles, dinosaurs & birds': '#d97706',
    'Mammals': '#c05621',
    'Primates & hominins': '#b83280',
    'People & silicon': '#6b46c1'
  };

  const DIMS = [
    {
      key: 'd1', idx: 0, short: 'Neurons', color: 'var(--c-cpu)', span: '0 → 257B bio',
      title: 'Neuron count & forebrain share',
      desc: 'Total excitable decision cells—from 302 in C. elegans to 257 billion in elephants—and how many sit in integrative forebrain/pallium (16.3B in humans vs 5.6B in elephants).',
      val: r => r._neu, log: true, lo: 1, hi: 2e12,
      fmt: r => (r._neu > 0 ? X.sci(r._neu) + ' neurons' + (r._fneu > 0 ? ' (' + X.sci(r._fneu) + ' forebrain)' : '') : '0 neurons (pre-neural)')
    },
    {
      key: 'd2', idx: 1, short: 'Mass & EQ', color: 'var(--c-make)', span: '50 ng → 7.8 kg',
      title: 'Brain mass, EQ & packing density',
      desc: 'Absolute mass (up to 7,800 g in sperm whales), Jerison encephalization quotient (7.55 in humans, 4.26 in dolphins), and packing density (247M neurons/g in songbirds).',
      val: r => r._mass, log: true, lo: 1e-8, hi: 2e8,
      fmt: r => (r._mass > 0 ? X.sci(r._mass) + ' g' + (r._eq > 0 ? ' · EQ ' + r._eq : '') : 'Single cell')
    },
    {
      key: 'd3', idx: 2, short: 'Synapses & speed', color: 'var(--c-wire)', span: '3 mm/s → 120 m/s',
      title: 'Synaptic fan-out & conduction velocity',
      desc: 'Total adjustable junctions (up to 300 trillion in a 5-year-old child) paired with spike travel speed—jumping 40,000-fold from chemical waves to myelinated fibers.',
      val: r => r._vel, log: true, lo: 5e-4, hi: 3e8,
      fmt: r => X.sci(r._syn) + ' syn · ' + (r._vel >= 1e4 ? X.sci(r._vel) : X.plain(r._vel)) + ' m/s'
    },
    {
      key: 'd4', idx: 3, short: 'Power & body %', color: 'var(--c-power)', span: '0.3 µW → 20 W (60% max)',
      title: 'Metabolic watts & share of body budget',
      desc: 'Continuous ATP burn and fraction of resting body power: 20% in adult humans, ~52% in human 5-year-olds, 60% in elephantnose fish, and 120 MW in frontier GPU clusters.',
      val: r => r._w, log: true, lo: 1e-12, hi: 2e8,
      fmt: r => X.watts(r._w) + ' (' + r._share + '% of body)'
    },
    {
      key: 'd5', idx: 4, short: 'Compute & ops/J', color: 'var(--s-neuro)', span: '50 → 2×10²⁰ ops/s',
      title: 'Synaptic throughput & thermodynamic efficiency',
      desc: 'Operations per second and operations per joule: songbirds and human brains deliver 7.5×10¹² to 3×10¹³ synaptic ops/J, outpacing current GPU clusters on efficiency.',
      val: r => r._ops, log: true, lo: 20, hi: 5e20,
      fmt: r => X.sci(r._ops) + ' ops/s · ' + X.sci(r._opj) + ' ops/J'
    },
    {
      key: 'd6', idx: 5, short: 'Memory stack', color: 'var(--c-ram)', span: '8 bits → 7×10¹⁴ bits',
      title: 'Online working scratchpad & lifetime synaptic storage',
      desc: 'Short-term persistent activity (~4 prefrontal chunks online across distractions) backed by ~4.7 bits per synapse of lifetime associative memory (~88 TB in a human skull).',
      val: r => Math.max(r._store, r._wm), log: true, lo: 5, hi: 2e15,
      fmt: r => 'Scratchpad ' + X.sci(r._wm) + ' b · Lifetime ' + X.sci(r._store) + ' b'
    },
    {
      key: 'd7', idx: 6, short: 'Planning horizon', color: 'var(--c-prog)', span: '0.5 s → decades',
      title: 'Counterfactual & deliberation time horizon',
      desc: 'How far ahead an action loop predicts before committing: millisecond reflexes, 3.5-second rat maze sweeps, 17-hour raven tool foresight, and multi-decade human plans.',
      val: r => r._tau, log: true, lo: 0.2, hi: 2e9,
      fmt: r => fmtSpan(r._tau)
    },
    {
      key: 'd8', idx: 7, short: 'Circuit complexity', color: 'var(--c-store)', span: '2 → 8,453 cell types',
      title: 'Brain regions, cell-type diversity & control motifs',
      desc: 'Distinct transcriptomic cell classes (118 in C. elegans, 8,453 in Drosophila, 3,313+ across 180 cortical areas in humans) and Max Bennett’s five vertebrate control layers.',
      val: r => r._ctypes, log: true, lo: 1, hi: 10000,
      fmt: r => r._ctypes.toLocaleString('en-US') + ' cell types · ' + r._reg + ' regions'
    },
    {
      key: 'd9', idx: 8, short: 'Language & social', color: 'var(--c-net)', span: '0.01 → 39.1 bits/s',
      title: 'Inter-brain communication bandwidth & recursive syntax',
      desc: 'Information rate between minds: chemical trails, 1.8-bit/s honeybee vector dances, learned songbird/cetacean dialects, and universal ~39.1-bit/s recursive human speech.',
      val: r => r._bps, log: true, lo: 0.005, hi: 2e12,
      fmt: r => (r._bps >= 1000 ? X.sci(r._bps) : X.plain(r._bps)) + ' bits/s · ' + r.language_tier
    },
    {
      key: 'd10', idx: 9, short: 'Plasticity & youth', color: 'var(--c-backup)', span: '10 hr → 24 yr',
      title: 'Learning rule & developmental wiring window',
      desc: 'From fixed embryonic lineages to dopamine reward prediction, sleep replay, and humanity’s 22-to-25-year childhood myelination scaffolded by parents, grandmothers and schools.',
      val: r => r._yr, log: true, lo: 5e-4, hi: 30,
      fmt: r => fmtYears(r._yr) + ' · ' + r.plasticity_mode
    }
  ];
  const DIM_BY_KEY = {};
  DIMS.forEach(d => { DIM_BY_KEY[d.key] = d; });

  function fmtAge(mya) {
    if (!(mya > 0)) return 'Today (2026)';
    return X.fmtShort(mya) + (mya >= 0.01 ? ' ago' : '');
  }
  function fmtSpan(s) {
    if (s >= 3.15e7) return X.plain(s / 3.15e7) + ' yr';
    if (s >= 86400) return X.plain(s / 86400) + ' days';
    if (s >= 3600) return X.plain(s / 3600) + ' hr';
    if (s >= 60) return X.plain(s / 60) + ' min';
    return X.plain(s) + ' s';
  }
  function fmtYears(yr) {
    if (yr >= 1) return X.plain(yr) + ' yr';
    if (yr * 365 >= 1) return Math.round(yr * 365) + ' days';
    return Math.round(yr * 8760) + ' hr';
  }

  /* ---------- KPI Strip ---------- */
  $('brainKpis').innerHTML = [
    ['0 → 257B', 'Biological neuron span', 'From nerveless sponges & placozoans to 257B in elephants and 86.1B in humans (16.3B cortical).', 'var(--c-cpu)'],
    ['7.8 kg / EQ 7.6', 'Peak mass vs. encephalization', 'Sperm whales hold the heaviest brain ever evolved; humans lead encephalization quotient at 7.55.', 'var(--c-make)'],
    ['40,000× faster', 'Signal velocity leap', 'From 3 mm/s sponge chemical waves to 120 m/s vertebrate myelinated axons at 1% energy cost.', 'var(--c-wire)'],
    ['20 W (52% peak)', 'Human brain power budget', '20% of adult resting energy—rising past 50% of whole-body glucose in a 5-year-old child.', 'var(--c-power)'],
    ['39.1 bits/s', 'Universal spoken rate', 'All 17 measured spoken languages converge near ~39 bits/s across the arcuate syntax loop.', 'var(--c-net)']
  ].map(k =>
    '<article class="org-kpi" style="--kc:' + k[3] + '">' +
    '<span class="k-lbl">' + esc(k[1]) + '</span>' +
    '<div class="k-num">' + esc(k[0]) + '</div>' +
    '<p>' + esc(k[2]) + '</p></article>'
  ).join('');

  /* ---------- 01. 10-Dimension Cards + Deep-Time Chart ---------- */
  let activeDim = 'all';

  function renderDimCards() {
    $('brainDimCards').innerHTML = DIMS.map((d, idx) =>
      '<button type="button" class="dim-card" data-pick-dim="' + d.key + '" aria-pressed="' + (activeDim === d.key) + '" style="--dc:' + d.color + '">' +
      '<div class="dim-card-top"><span class="dim-num">Dimension ' + (idx + 1) + '</span><span class="dim-span">' + esc(d.span) + '</span></div>' +
      '<h3>' + esc(d.title) + '</h3>' +
      '<p>' + esc(d.desc) + '</p></button>'
    ).join('');
  }

  function selectDim(key, focusTab) {
    activeDim = key;
    const tabs = [...$('brainTabs').querySelectorAll('[role="tab"]')];
    tabs.forEach(btn => {
      const on = btn.dataset.dim === key;
      btn.setAttribute('aria-selected', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on) {
        $('brainTabPanel').setAttribute('aria-labelledby', btn.id);
        try { btn.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' }); } catch (e) { /* older browsers */ }
        if (focusTab) btn.focus();
      }
    });
    renderDimCards();
    drawDeepTimeChart();
  }

  $('brainTabs').addEventListener('click', ev => {
    const b = ev.target.closest('[role="tab"]');
    if (b) selectDim(b.dataset.dim, false);
  });
  $('brainTabs').addEventListener('keydown', ev => {
    const tabs = [...$('brainTabs').querySelectorAll('[role="tab"]')];
    const cur = tabs.indexOf(document.activeElement);
    if (cur < 0) return;
    let nx = -1;
    if (ev.key === 'ArrowRight') nx = (cur + 1) % tabs.length;
    else if (ev.key === 'ArrowLeft') nx = (cur - 1 + tabs.length) % tabs.length;
    else if (ev.key === 'Home') nx = 0;
    else if (ev.key === 'End') nx = tabs.length - 1;
    if (nx >= 0) { ev.preventDefault(); selectDim(tabs[nx].dataset.dim, true); }
  });
  $('brainDimCards').addEventListener('click', ev => {
    const c = ev.target.closest('[data-pick-dim]');
    if (c) {
      selectDim(c.dataset.pickDim, false);
      $('brainTabs').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Pseudo-log time x-axis mapping 1000 Ma -> Today (0 Ma) smoothly
  function xOfMya(mya) {
    const Lm = 76, Rm = 28, W = 1000;
    // Map log10(mya + 0.001) from [3.0 -> -3.0] left-to-right
    const hi = Math.log10(1000 + 0.001), lo = Math.log10(0.001);
    const v = Math.log10(Math.max(0, mya) + 0.001);
    return Lm + (hi - v) / (hi - lo) * (W - Lm - Rm);
  }

  function drawDeepTimeChart() {
    const svg = $('brainTimeSvg');
    const W = 1000, H = 390, T = 26, B = 52, Lm = 76, Rm = 28;
    const xTicks = [
      [900, '900 Ma'], [541, '541 Ma (Cambrian)'], [365, '365 Ma (Land)'],
      [205, '205 Ma (Cortex)'], [66, '66 Ma'], [7, '7 Ma'], [0.3, '300 ka'], [0, 'Today']
    ];
    let out = '';

    // Vertical time ticks
    xTicks.forEach(([t, lbl]) => {
      const x = xOfMya(t);
      out += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--line)" stroke-dasharray="3 3"/>';
      out += '<text x="' + x.toFixed(1) + '" y="' + (H - 28) + '" text-anchor="middle" font-size="11" fill="var(--ink-3)">' + esc(lbl) + '</text>';
    });

    if (activeDim === 'all') {
      $('brainDimIntro').innerHTML =
        '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px">' +
        '<div><h3 style="margin:0;font-size:1.15rem">Composite 10-Dimension Brain Score (0–100) + envelope across 900 Myr</h3>' +
        '<p style="margin:4px 0 0;font-size:14px;color:var(--ink-2)">Sum of all ten calibrated 0–10 dimension scores. Notice how octopuses, ravens, dolphins, elephants, hominins and silicon clusters climb via radically different combinations.</p></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px">' +
        Object.entries(GROUP_COLORS).map(([g, col]) => '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:9px;height:9px;border-radius:50%;background:' + col + '"></i>' + esc(g) + '</span>').join('') +
        '</div></div>';

      for (let g = 0; g <= 5; g++) {
        const val = g * 20;
        const y = (H - B) - (val / 100) * (H - T - B);
        out += '<line x1="' + Lm + '" x2="' + (W - Rm) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)"/>';
        out += '<text x="' + (Lm - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="11.5" fill="var(--ink-3)">' + val + '</text>';
      }

      // Upper frontier envelope across time
      const sortedByAge = ROWS.slice().sort((a, b) => b._t - a._t);
      let best = -1, envPts = [];
      sortedByAge.forEach(r => {
        if (r._comp >= best) {
          best = r._comp;
          envPts.push([xOfMya(r._t), (H - B) - (r._comp / 100) * (H - T - B)]);
        }
      });
      if (envPts.length > 1) {
        out += '<path d="' + envPts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="var(--c-cpu)" stroke-width="2.2" stroke-opacity=".55" stroke-dasharray="5 4"/>';
      }

      const calloutSlugs = new Set([
        'choanoflagellate-scaffold', 'cnidarian-nerve-net', 'cambrian-arthropod-brain',
        'jawed-shark-myelinated-cns', 'octopus-distributed-mind', 'morganucodon-first-neocortex',
        'raven-corvid-pallium', 'african-elephant-257b', 'bottlenose-dolphin-sonar-brain',
        'homo-sapiens-globular-language', 'frontier-reasoning-cluster'
      ]);

      ROWS.forEach(r => {
        const x = xOfMya(r._t);
        const y = (H - B) - (r._comp / 100) * (H - T - B);
        const col = GROUP_COLORS[r.lineage_group] || '#6b46c1';
        out += '<g class="b-pt" data-slug="' + esc(r.slug) + '" tabindex="0" role="button" aria-label="' + esc(r.species_or_system + ': 10D score ' + r._comp + ' at ' + fmtAge(r._t)) + '" style="cursor:pointer">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6.2" fill="' + col + '" stroke="var(--surface)" stroke-width="1.8"/>' +
          (calloutSlugs.has(r.slug) ? '<text x="' + (x > 870 ? x - 9 : x + 9).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="' + (x > 870 ? 'end' : 'start') + '" font-size="11" font-weight="700" fill="var(--ink)">' + esc(r.species_or_system.split(' (')[0]) + '</text>' : '') +
          '</g>';
      });
    } else {
      const D = DIM_BY_KEY[activeDim];
      $('brainDimIntro').innerHTML =
        '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px">' +
        '<div><h3 style="margin:0;font-size:1.15rem">Dimension ' + (D.idx + 1) + ' · ' + esc(D.title) + '</h3>' +
        '<p style="margin:4px 0 0;font-size:14px;color:var(--ink-2)">' + esc(D.desc) + '</p></div>' +
        '<span class="paradox-stat">Span: ' + esc(D.span) + '</span></div>';

      const loL = Math.log10(D.lo), hiL = Math.log10(D.hi);
      for (let g = 0; g <= 5; g++) {
        const lv = loL + (hiL - loL) * g / 5;
        const y = (H - B) - (g / 5) * (H - T - B);
        out += '<line x1="' + Lm + '" x2="' + (W - Rm) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)"/>';
        out += '<text x="' + (Lm - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="var(--ink-3)">10' + X.sup(Math.round(lv)) + '</text>';
      }

      const valid = ROWS.filter(r => D.val(r) > 0);
      const sorted = valid.slice().sort((a, b) => b._t - a._t);
      let best = -Infinity, env = [];
      sorted.forEach(r => {
        const v = D.val(r);
        if (v >= best) {
          best = v;
          const lv = Math.max(loL, Math.min(hiL, Math.log10(v)));
          env.push([xOfMya(r._t), (H - B) - ((lv - loL) / (hiL - loL)) * (H - T - B)]);
        }
      });
      if (env.length > 1) {
        out += '<path d="' + env.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="' + D.color + '" stroke-width="2.2" stroke-opacity=".6" stroke-dasharray="5 4"/>';
      }

      valid.forEach(r => {
        const v = D.val(r);
        const lv = Math.max(loL, Math.min(hiL, Math.log10(v)));
        const x = xOfMya(r._t);
        const y = (H - B) - ((lv - loL) / (hiL - loL)) * (H - T - B);
        const col = GROUP_COLORS[r.lineage_group] || '#6b46c1';
        const labelMe = ['nematode-302-connectome', 'fruit-fly-connectome', 'octopus-distributed-mind', 'raven-corvid-pallium', 'african-elephant-257b', 'sperm-whale-heaviest-brain', 'elephantnose-electro-cerebellum', 'homo-sapiens-globular-language', 'frontier-reasoning-cluster'].includes(r.slug);
        out += '<g class="b-pt" data-slug="' + esc(r.slug) + '" tabindex="0" role="button" aria-label="' + esc(r.species_or_system + ': ' + D.fmt(r)) + '" style="cursor:pointer">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6.2" fill="' + col + '" stroke="var(--surface)" stroke-width="1.8"/>' +
          (labelMe ? '<text x="' + (x > 860 ? x - 9 : x + 9).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="' + (x > 860 ? 'end' : 'start') + '" font-size="10.8" font-weight="700" fill="var(--ink)">' + esc(r.species_or_system.split(' (')[0]) + '</text>' : '') +
          '</g>';
      });
    }

    out += '<text x="500" y="' + (H - 7) + '" text-anchor="middle" font-size="11.5" fill="var(--ink-3)">Deep time (logarithmic scale from 900 million years ago to 2026 — click any circle for full 10D profile)</text>';
    svg.innerHTML = out;
  }

  $('brainTimeSvg').addEventListener('pointerover', ev => {
    const g = ev.target.closest('.b-pt');
    if (!g) return;
    const r = BY_SLUG[g.dataset.slug];
    if (!r) return;
    const D = activeDim === 'all' ? null : DIM_BY_KEY[activeDim];
    $('brainChartReadout').innerHTML =
      '<span><b>' + esc(r.species_or_system) + '</b> (' + esc(fmtAge(r._t)) + ') — ' +
      esc(D ? D.fmt(r) : ('Composite 10D score ' + r._comp + ' / 100 · ' + r.plain_title)) + '</span>' +
      '<button type="button" class="btn sm ghost" data-open-stage="' + esc(r.slug) + '">Inspect 10D card →</button>';
  });
  $('brainTimeSvg').addEventListener('click', ev => {
    const g = ev.target.closest('.b-pt');
    if (g && BY_SLUG[g.dataset.slug]) openStageModal(BY_SLUG[g.dataset.slug]);
  });
  $('brainTimeSvg').addEventListener('keydown', ev => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      const g = ev.target.closest('.b-pt');
      if (g && BY_SLUG[g.dataset.slug]) { ev.preventDefault(); openStageModal(BY_SLUG[g.dataset.slug]); }
    }
  });
  $('brainChartReadout').addEventListener('click', ev => {
    const b = ev.target.closest('[data-open-stage]');
    if (b && BY_SLUG[b.dataset.openStage]) openStageModal(BY_SLUG[b.dataset.openStage]);
  });

  /* ---------- 02. 3-Brain 10-Axis Radar Comparator ---------- */
  const CMP_COLORS = ['#d946ef', '#0ea5e9', '#ea580c'];
  let cmpSlugs = ['homo-sapiens-globular-language', 'raven-corvid-pallium', 'african-elephant-257b'];

  function renderPickers() {
    $('brainPickers').innerHTML = [0, 1, 2].map(k =>
      '<div class="org-pick-field" style="--pc:' + CMP_COLORS[k] + '">' +
      '<label for="bpick-' + k + '">Brain ' + (k + 1) + '</label>' +
      '<select id="bpick-' + k + '" data-slot="' + k + '">' +
      ROWS.map(r => '<option value="' + esc(r.slug) + '"' + (r.slug === cmpSlugs[k] ? ' selected' : '') + '>' + esc(r.species_or_system + ' (' + fmtAge(r._t) + ')') + '</option>').join('') +
      '</select></div>'
    ).join('');
    $('brainPickers').querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', () => {
        cmpSlugs[Number(sel.dataset.slot)] = sel.value;
        drawRadarAndTable();
      });
    });
  }

  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const parts = btn.dataset.preset.split(',');
      if (parts.length === 3 && parts.every(s => BY_SLUG[s])) {
        cmpSlugs = parts;
        renderPickers();
        drawRadarAndTable();
      }
    });
  });

  function drawRadarAndTable() {
    const picks = cmpSlugs.map(s => BY_SLUG[s] || ROWS[0]);
    const cx = 260, cy = 228, R = 158;
    let svg = '';

    // Concentric decagon rings (2, 4, 6, 8, 10)
    [2, 4, 6, 8, 10].forEach(lvl => {
      const rr = (lvl / 10) * R;
      const pts = DIMS.map((_, i) => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / 10;
        return (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
      }).join(' ');
      svg += '<polygon points="' + pts + '" fill="none" stroke="var(--line)" stroke-width="' + (lvl === 10 ? 1.5 : 1) + '"/>';
    });

    // Spokes & labels
    DIMS.forEach((d, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / 10;
      const x2 = cx + R * Math.cos(a), y2 = cy + R * Math.sin(a);
      const lx = cx + (R + 26) * Math.cos(a), ly = cy + (R + 22) * Math.sin(a);
      const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="var(--line-2)"/>';
      svg += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="' + anchor + '" font-size="11.5" font-weight="700" fill="var(--ink-2)">' + (i + 1) + '·' + esc(d.short) + '</text>';
    });

    // 3 polygons
    picks.forEach((r, idx) => {
      const col = CMP_COLORS[idx];
      const pts = r._scores.map((sc, i) => {
        const rr = (Math.max(0.3, sc) / 10) * R;
        const a = -Math.PI / 2 + (2 * Math.PI * i) / 10;
        return (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
      }).join(' ');
      svg += '<polygon points="' + pts + '" fill="' + col + '" fill-opacity="0.16" stroke="' + col + '" stroke-width="2.5"/>';
      r._scores.forEach((sc, i) => {
        const rr = (Math.max(0.3, sc) / 10) * R;
        const a = -Math.PI / 2 + (2 * Math.PI * i) / 10;
        svg += '<circle cx="' + (cx + rr * Math.cos(a)).toFixed(1) + '" cy="' + (cy + rr * Math.sin(a)).toFixed(1) + '" r="3.6" fill="' + col + '"/>';
      });
    });

    // Legend row at bottom
    picks.forEach((r, idx) => {
      const y = 434;
      const x = 24 + idx * 168;
      svg += '<rect x="' + x + '" y="' + (y - 9) + '" width="12" height="12" rx="3" fill="' + CMP_COLORS[idx] + '"/>' +
        '<text x="' + (x + 17) + '" y="' + y + '" font-size="11.5" font-weight="700" fill="var(--ink)">' + esc(r.species_or_system.split(' (')[0].slice(0, 20)) + '</text>';
    });
    $('brainRadarSvg').innerHTML = svg;

    // Quantitative comparison table
    $('brainCmpHead').innerHTML = '<tr><th scope="col">Dimension</th>' +
      picks.map((r, idx) => '<th scope="col" style="border-bottom:3px solid ' + CMP_COLORS[idx] + '">' + esc(r.species_or_system.split(' (')[0]) + '</th>').join('') +
      '</tr>';
    $('brainCmpBody').innerHTML =
      '<tr><th scope="row">Composite 10D</th>' + picks.map(r => '<td><b>' + r._comp + ' / 100</b></td>').join('') + '</tr>' +
      DIMS.map((d, i) =>
        '<tr><th scope="row">' + (i + 1) + ' · ' + esc(d.short) + '</th>' +
        picks.map(r => '<td>' + esc(d.fmt(r)) + '</td>').join('') + '</tr>'
      ).join('') +
      '<tr><th scope="row">Control tier</th>' + picks.map(r => '<td>' + esc(r.bennett_stage) + '</td>').join('') + '</tr>';
  }

  /* ---------- 03. Interactive Brain Scaling & Cooking Simulator ---------- */
  const massSlider = $('simMassSlider');
  function syncSliderCss(sl) {
    sl.style.setProperty('--attr-min', sl.min || 0);
    sl.style.setProperty('--attr-max', sl.max || 100);
    sl.style.setProperty('--control-value', sl.value);
  }
  function updateBrainSim() {
    syncSliderCss(massSlider);
    const massG = Math.pow(10, Number(massSlider.value));
    const arch = $('simArch').value;
    const diet = $('simDiet').value;
    const massLabel = massG >= 1000 ? (massG / 1000).toFixed(2) + ' kg' : (massG >= 1 ? Math.round(massG).toLocaleString('en-US') + ' g' : (massG * 1000).toFixed(1) + ' mg');
    $('simMassOut').textContent = massLabel;
    massSlider.setAttribute('aria-valuetext', massLabel);

    // Empirical Herculano-Houzel & Olkowicz allometric cellular scaling laws
    let neurons = 0, pallialShare = 0.20, ePerNeu = 2.3e-10, vel = 85, archNote = '';
    if (arch === 'primate') {
      neurons = 6.3e7 * Math.pow(massG, 0.98);
      pallialShare = 0.22;
      ePerNeu = 2.32e-10;
      vel = 95;
      archNote = 'Primates prevent neuron bloating: doubling brain mass nearly doubles neurons linearly.';
    } else if (arch === 'corvid') {
      neurons = 1.65e8 * Math.pow(massG, 0.94);
      pallialShare = 0.56;
      ePerNeu = 0.95e-10;
      vel = 70;
      archNote = 'Songbird/corvid nuclear pallium packs ~2.5× more neurons/g at ~40% the glucose cost per neuron.';
    } else if (arch === 'rodent') {
      neurons = 9.5e7 * Math.pow(massG, 0.62);
      pallialShare = 0.17;
      ePerNeu = 2.6e-10;
      vel = 75;
      archNote = 'In rodents & hoofed mammals, larger brains inflate cell size—so neuron count grows sluggishly (exponent ~0.62).';
    } else {
      neurons = 1.9e8 * Math.pow(massG, 0.85);
      pallialShare = 0.35;
      ePerNeu = 1.6e-10;
      vel = 20;
      archNote = 'Unmyelinated cephalopods offload 60% of neurons into flexible arms to dodge slow cross-body cables.';
    }

    const forebrainNeu = neurons * pallialShare;
    const watts = neurons * ePerNeu;
    const kcalPerDay = watts * 86400 / 4184;
    // Fonseca-Azevedo & Herculano-Houzel (2012): raw ape feeding yields ~200-250 brain kcal/day within 8-hr foraging ceiling
    const rawForageHours = (kcalPerDay / 515) * 4.2 + 2.2;
    const forageHours = diet === 'cooked' ? rawForageHours * 0.44 : rawForageHours;
    const skullDiamM = 0.012 * Math.pow(massG, 1 / 3);
    const transitMs = (skullDiamM / vel) * 1000;
    const viable = forageHours <= 8.5;

    const bars = [
      ['Total neurons', X.sci(neurons), Math.min(100, Math.max(4, (Math.log10(neurons) - 6) / 6 * 100)), 'var(--c-cpu)'],
      ['Forebrain / pallial neurons', X.sci(forebrainNeu), Math.min(100, Math.max(4, (Math.log10(forebrainNeu) - 5.5) / 6 * 100)), 'var(--c-prog)'],
      ['Brain metabolic power', X.watts(watts) + ' (' + Math.round(kcalPerDay) + ' kcal/day)', Math.min(100, Math.max(4, (Math.log10(watts + 1e-4) + 3) / 5.5 * 100)), 'var(--c-power)'],
      ['Daily feeding hours needed', forageHours.toFixed(1) + ' hr / day' + (viable ? ' (feasible)' : ' — EXCEEDS DAYLIGHT!'), Math.min(100, forageHours / 12 * 100), viable ? 'var(--s-chem)' : 'var(--crisis)']
    ];

    let s = '';
    bars.forEach((b, k) => {
      const y = 22 + k * 50;
      s += '<text x="18" y="' + (y + 13) + '" font-size="13" font-weight="700" fill="var(--ink)">' + esc(b[0]) + '</text>';
      s += '<text x="900" y="' + (y + 13) + '" text-anchor="end" font-size="12.5" font-family="var(--mono)" font-weight="700" fill="var(--ink)">' + esc(b[1]) + '</text>';
      s += '<rect x="18" y="' + (y + 20) + '" width="882" height="12" rx="6" fill="var(--surface)"/>';
      s += '<rect x="18" y="' + (y + 20) + '" width="' + (8.82 * b[2]).toFixed(1) + '" height="12" rx="6" fill="' + b[3] + '"/>';
    });
    // 8-hour raw foraging limit line on bar 4
    const limitX = 18 + (8.0 / 12) * 882;
    s += '<line x1="' + limitX.toFixed(1) + '" x2="' + limitX.toFixed(1) + '" y1="166" y2="210" stroke="var(--crisis)" stroke-width="2" stroke-dasharray="3 2"/>';
    s += '<text x="' + (limitX - 6).toFixed(1) + '" y="218" text-anchor="end" font-size="10.5" font-weight="700" fill="var(--crisis)">8-hr raw-ape foraging wall</text>';
    $('brainSimSvg').innerHTML = s;

    $('brainSimReadout').innerHTML =
      '<span><b>Cross-brain spike delay:</b> ' + transitMs.toFixed(2) + ' ms across ~' + (skullDiamM * 100).toFixed(1) + ' cm · ' + esc(archNote) + '</span>' +
      '<span style="font-weight:700;color:' + (viable ? 'var(--ink)' : 'var(--crisis)') + '">' +
      (viable ? 'Energetically sustainable' : 'Impossible on raw foraging without cooking!') + '</span>';
  }
  massSlider.addEventListener('input', updateBrainSim);
  $('simArch').addEventListener('change', updateBrainSim);
  $('simDiet').addEventListener('change', updateBrainSim);

  /* ---------- 05. Progressive-Enhanced Sortable 42-Row Table (modern-web-guidance: sortable-table & dynamic-sort) ---------- */
  const tbody = $('brainTableBody');
  const sortTable = $('brainSortTable');
  const sortStatus = $('brainSortStatus');
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  function buildInitialTableRows() {
    const sorted = ROWS.slice().sort((a, b) => b._t - a._t);
    tbody.innerHTML = sorted.map(r => {
      const col = GROUP_COLORS[r.lineage_group] || '#6b46c1';
      return '<tr data-slug="' + esc(r.slug) + '" data-group="' + esc(r.lineage_group) + '">' +
        '<th scope="row" data-value="' + esc(r.species_or_system) + '">' +
        '<button type="button" class="sto-paper" data-open-stage="' + esc(r.slug) + '" style="font-weight:700;text-decoration:none;color:var(--ink)">' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + col + ';margin-right:6px" aria-hidden="true"></span>' +
        esc(r.species_or_system) + '</button>' +
        '<div style="font-size:11.5px;font-weight:500;color:var(--ink-3);margin-top:2px">' + esc(r.milestone) + '</div></th>' +
        '<td class="num" data-value="' + r._t + '">' + esc(fmtAge(r._t)) + '</td>' +
        '<td class="num" data-value="' + r._neu + '">' + (r._neu > 0 ? X.sci(r._neu) : '0') + '</td>' +
        '<td class="num" data-value="' + r._mass + '">' + (r._mass > 0 ? X.sci(r._mass) + (r._eq > 0 ? ' (' + r._eq + ')' : '') : '—') + '</td>' +
        '<td class="num" data-value="' + r._syn + '">' + (r._syn > 0 ? X.sci(r._syn) : '0') + ' · ' + X.plain(r._vel) + '</td>' +
        '<td class="num" data-value="' + r._w + '">' + X.watts(r._w) + ' (' + r._share + '%)</td>' +
        '<td class="num" data-value="' + r._ops + '">' + X.sci(r._ops) + '</td>' +
        '<td class="num" data-value="' + r._store + '">' + (r._store > 0 ? X.sci(r._store) : X.sci(r._wm)) + '</td>' +
        '<td class="num" data-value="' + r._tau + '">' + esc(fmtSpan(r._tau)) + '</td>' +
        '<td class="num" data-value="' + r._ctypes + '">' + r._ctypes.toLocaleString('en-US') + '</td>' +
        '<td class="num" data-value="' + r._bps + '">' + (r._bps >= 1000 ? X.sci(r._bps) : X.plain(r._bps)) + '</td>' +
        '<td class="num" data-value="' + r._yr + '">' + esc(fmtYears(r._yr)) + '</td>' +
        '<td class="num" data-value="' + r._comp + '"><b>' + r._comp.toFixed(1) + '</b></td>' +
        '</tr>';
    }).join('');
  }

  function reorderRows(container, orderedNodes) {
    const move = Object.hasOwn(Element.prototype, 'moveBefore')
      ? node => container.moveBefore(node, null)
      : node => container.append(node);
    for (const node of orderedNodes) move(node);
  }

  function sortByHeaderButton(button) {
    const th = button.closest('th');
    if (!th) return;
    const direction = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    for (const header of sortTable.tHead.rows[0].cells) header.removeAttribute('aria-sort');
    th.setAttribute('aria-sort', direction);

    const colIdx = th.cellIndex;
    const type = th.dataset.type || 'text';
    const factor = direction === 'ascending' ? 1 : -1;
    const rows = [...tbody.rows];
    const keyed = rows.map(row => {
      const cell = row.cells[colIdx];
      const raw = cell.dataset.value != null ? cell.dataset.value : cell.textContent.trim();
      return { row, val: type === 'number' ? Number(raw) : raw };
    });
    keyed.sort((a, b) => factor * (type === 'number' ? (a.val - b.val) : collator.compare(a.val, b.val)));
    const ordered = keyed.map(k => k.row);

    const update = () => reorderRows(tbody, ordered);
    if (sortTable.startViewTransition) sortTable.startViewTransition(update);
    else if (document.startViewTransition) document.startViewTransition(update);
    else update();

    const visibleCount = ordered.filter(r => !r.hidden).length;
    sortStatus.textContent = 'Sorted by ' + button.textContent.trim() + ', ' + direction + ', ' + visibleCount + ' stages shown';
  }

  sortTable.addEventListener('command', ev => {
    if (ev.command === '--sort') sortByHeaderButton(ev.source);
  });
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    for (const button of sortTable.tHead.querySelectorAll('button[command="--sort"]')) {
      button.addEventListener('click', () => sortByHeaderButton(button));
    }
  }

  function applyTableFilter() {
    const q = ($('brainSearch').value || '').trim().toLowerCase();
    const grp = $('brainGroupSel').value;
    let shown = 0;
    for (const tr of tbody.rows) {
      const r = BY_SLUG[tr.dataset.slug];
      const matchGrp = grp === 'all' || tr.dataset.group === grp;
      const hay = r ? (r.species_or_system + ' ' + r.milestone + ' ' + r.architecture_motif + ' ' + r.plain_title + ' ' + r.language_tier + ' ' + r.plasticity_mode).toLowerCase() : '';
      const ok = matchGrp && (!q || hay.includes(q));
      tr.hidden = !ok;
      if (ok) shown++;
    }
    sortStatus.textContent = shown + ' of ' + tbody.rows.length + ' brain stages shown';
  }
  $('brainSearch').addEventListener('input', applyTableFilter);
  $('brainGroupSel').addEventListener('change', applyTableFilter);
  tbody.addEventListener('click', ev => {
    const b = ev.target.closest('[data-open-stage]');
    if (b && BY_SLUG[b.dataset.openStage]) openStageModal(BY_SLUG[b.dataset.openStage]);
  });

  /* ---------- Stage Detail Modal (<dialog closedby="any">) ---------- */
  const modal = $('brainStageModal');
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, d) => {
      const r = d.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    modal.addEventListener('pointerdown', e => { pressedOutside = outside(e, modal); });
    modal.addEventListener('pointerup', e => { if (pressedOutside && outside(e, modal)) modal.close(); });
  }
  modal.addEventListener('close', () => { modal.returnValue = ''; });

  function openStageModal(r) {
    const inv = X.INVK[r.inv];
    modal.innerHTML =
      '<div class="org-modal-inner">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;gap:12px">' +
      '<div><span class="eyebrow">' + esc(r.lineage_group) + ' · ' + esc(fmtAge(r._t)) + ' · Composite ' + r._comp + '/100</span>' +
      '<h1 id="brainModalTitle" style="font-size:1.45rem;margin:4px 0 0">' + esc(r.plain_title) + '</h1>' +
      '<p style="margin:4px 0 0;font-size:14px;color:var(--ink-3)"><b>' + esc(r.species_or_system) + '</b> · ' + esc(r.milestone) + '</p></div>' +
      '<form method="dialog"><button value="close" class="btn sm ghost" autofocus aria-label="Close stage details">Close ✕</button></form></div>' +
      '<p style="font-size:15.5px;line-height:1.5;margin:0">' + esc(r.plain_text) + '</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">' +
      DIMS.map((d, i) => '<div style="padding:8px 10px;border-radius:var(--r-md);background:var(--surface-2);font-size:13px">' +
        '<div style="font-weight:700;color:var(--ink-3);font-size:11px;text-transform:uppercase">' + (i + 1) + ' · ' + esc(d.short) + ' (' + r._scores[i].toFixed(1) + '/10)</div>' +
        '<div style="font-weight:700;color:var(--ink);margin-top:2px">' + esc(d.fmt(r)) + '</div></div>').join('') +
      '</div>' +
      '<p style="font-size:13px;color:var(--ink-2);margin:0"><b>Architecture:</b> ' + esc(r.architecture_motif) + ' · <b>Control stage:</b> ' + esc(r.bennett_stage) + '<br>' +
      '<b>Sources:</b> ' + esc(r.source) + (r.note ? ' — ' + esc(r.note) : '') + '</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      '<a class="btn sm" href="journey.html#' + esc(r.epoch_id) + '">Visit stop on the Journey →</a>' +
      (inv ? '<a class="btn sm ghost" href="tree.html#' + esc(r.inv) + '">' + esc(inv.label) + ' in the Tree →</a>' : '') +
      '<a class="btn sm ghost" href="data.html#brains10d">Open in Data Lab →</a></div></div>';
    if (modal.showModal) modal.showModal();
    else modal.setAttribute('open', '');
  }

  /* ---------- Init ---------- */
  renderDimCards();
  drawDeepTimeChart();
  renderPickers();
  drawRadarAndTable();
  updateBrainSim();
  buildInitialTableRows();
})();
