/* Current-state (2026) + 68-moment time-scrubbable pie breakdown + Population x Complexity map. */
(function () {
  'use strict';
  const X = window.SIX;
  if (!X) return;
  const esc = X.esc;
  const $ = id => document.getElementById(id);
  const root = $('todayPieApp');
  if (!root) return;

  const N = X.N;
  let curMode = 'events';
  let selEpoch = N - 1;

  // Era quick-jump stops (resolved dynamically by epoch_id so indices stay exact across 68 moments)
  const ERA_JUMPS = [
    ['EP01a', '4.1 Ga · Vents'],
    ['EP04a', '1.85 Ga · Complex cell'],
    ['EP07b', '555 Ma · First nerves'],
    ['EP11b', '400 Ma · Land plants'],
    ['EP17m', '125 Ma · Flowers'],
    ['EP18a', '66 Ma · Asteroid'],
    ['EP30a', '1945 · Computers'],
    ['EP32b', '2026 · Today']
  ].map(([ep, label]) => ({ idx: X.IDX[ep] != null ? X.IDX[ep] : N - 1, label }));

  // All 2026 numbers match EP32b, paper0_power_closure_ledger.csv, bioelectric_by_group.csv,
  // neurons_by_clade_by_moment.csv, and paper0_device_inventory_ledger.csv.
  const GROUPS = [
    {
      key: 'microbes',
      name: 'Microbes (bacteria & archaea)',
      short: 'Microbes',
      color: 'var(--s-chem)',
      count: '3.1×10³⁰ cells',
      oneName: '1 bacterium (E. coli)',
      oneOps: 846,
      oneNote: '~850 reactions/s · ~100 bits active state',
      totalOps: 2.624e33,
      fastOps: 6.97e23,
      powerTW: 14.0,
      bitsAll: 1.86e37,
      bitsLearned: 0,
      repro: '100% self-copying cell division (~20 min)',
      atlasKind: 'chem'
    },
    {
      key: 'trees',
      name: 'Trees, plants & fungi',
      short: 'Trees & plants',
      color: 'var(--act-3)',
      count: '3.04×10¹² trees (9.05×10²⁸ nucleated cells)',
      oneName: '1 mature tree (phloem network)',
      oneOps: 1e9,
      oneNote: '~10⁹ phloem electrical signals/s · 0 neurons',
      totalOps: 1.81e32,
      fastOps: 3.0e21,
      powerTW: 48.5,
      bitsAll: 1.74e37,
      bitsLearned: 0,
      repro: 'Autonomous spores, seeds & root clones',
      atlasKind: 'chem'
    },
    {
      key: 'animals',
      name: 'Wild & farm animals',
      short: 'Wild animals',
      color: 'var(--s-neuro)',
      count: '~10²¹ nematodes, insects, fish, birds & mammals',
      oneName: '1 honeybee (~10⁸/s) to 1 whale (~10¹⁴/s)',
      oneOps: 1e10,
      oneNote: '10³ (worm) to 10¹⁴ (whale) synapse signals/s',
      totalOps: 2.988e26,
      fastOps: 2.988e26,
      powerTW: 1.70,
      bitsAll: 3.8e35,
      bitsLearned: 1.40e28,
      repro: 'Fertilized egg, metamorphosis or live birth',
      atlasKind: 'nerve'
    },
    {
      key: 'humans',
      name: 'Humans (8.1 billion brains & bodies)',
      short: 'Humans',
      color: 'var(--c-prog)',
      count: '8.1×10⁹ people (7.05×10²⁰ neurons)',
      oneName: '1 human brain (86B neurons)',
      oneOps: 1.5e14,
      oneNote: '~1.5×10¹⁴ synapse signals/s · ~39 bits/s speech',
      totalOps: 1.22e24,
      fastOps: 1.22e24,
      powerTW: 0.80,
      bitsAll: 5.2e29,
      bitsLearned: 5.60e24,
      repro: 'Live birth + decade of family & school teaching',
      atlasKind: 'nerve'
    },
    {
      key: 'computers',
      name: 'Computers & AI (chips & data centers)',
      short: 'Computers & AI',
      color: 'var(--s-silicon)',
      count: '6.49×10⁹ active chips (incl. 15M AI accelerators)',
      oneName: '1 frontier 100k-GPU AI cluster',
      oneOps: 3.0e20,
      oneNote: '3×10²⁰ ops/s in one cluster (phone: ~10¹²/s)',
      totalOps: 1.89e22,
      fastOps: 1.89e22,
      powerTW: 0.08,
      bitsAll: 1.20e23,
      bitsLearned: 1.20e23,
      repro: 'EUV wafer fabs + AI chip layout (needs human supply chain)',
      atlasKind: 'ai'
    },
    {
      key: 'offworld',
      name: 'Off-world spacecraft (orbit to Voyager 1)',
      short: 'Off-world craft',
      color: 'var(--c-wire)',
      count: '~17,500 active satellites + ~40 deep-space probes',
      oneName: 'Voyager 1 (~1.2×10⁴/s at 1 light-day)',
      oneOps: 1.2e4,
      oneNote: '69 KB RAM at 25.9B km (ISS server: 2.5×10¹²/s)',
      totalOps: 1.90e15,
      fastOps: 1.90e15,
      powerTW: 0.000042,
      bitsAll: 1.10e16,
      bitsLearned: 1.10e16,
      repro: 'Earth-built rockets + remote code patches across light-hours',
      atlasKind: 'sil',
      linkHref: 'data.html#offworld'
    }
  ];

  // 10 landmark populations for the Population x Complexity Iso-Throughput Map (2026)
  const MAP_POINTS = [
    { name: 'Bacteria & archaea', pop: 3.1e30, one: 846, color: 'var(--s-chem)', shape: 'circle', unit: 'reactions/s', note: '3.1×10³⁰ cells × ~846 reactions/s = 2.6×10³³/s planetary chemistry' },
    { name: 'Soil nematodes', pop: 4.4e20, one: 7.5e3, color: 'var(--s-neuro)', shape: 'triangle', unit: 'signals/s', note: '4.4×10²⁰ roundworms × ~7,500 synapse signals/s = ~3.3×10²⁴/s' },
    { name: 'Land mites & insects', pop: 1.0e19, one: 2.5e7, color: 'var(--s-neuro)', shape: 'circle', unit: 'signals/s', note: '10¹⁹ land arthropods dominating global animal neuron count' },
    { name: 'Trees (phloem electrical)', pop: 3.04e12, one: 1.0e9, color: 'var(--act-3)', shape: 'square', unit: 'signals/s', note: '3.04 trillion trees × ~10⁹ slow phloem signals/s (~3×10²¹/s electrical)' },
    { name: 'Wild & domestic birds', pop: 7.5e10, one: 2.0e11, color: 'var(--s-neuro)', shape: 'diamond', unit: 'signals/s', note: '75 billion birds with ultra-dense pallial neurons (~240M neurons/g)' },
    { name: 'Humans (8.1B brains)', pop: 8.1e9, one: 1.5e14, color: 'var(--c-prog)', shape: 'circle', unit: 'signals/s', note: '8.1 billion people × ~1.5×10¹⁴ synapse signals/s = 1.22×10²⁴/s on 20 W/brain' },
    { name: 'Smartphones & PCs', pop: 5.5e9, one: 1.8e12, color: 'var(--s-silicon)', shape: 'square', unit: 'ops/s', note: '~5.5 billion active personal devices running ~10²² executed ops/s' },
    { name: 'Data-center AI GPUs', pop: 1.5e7, one: 6.0e14, color: 'var(--c-cpu)', shape: 'diamond', unit: 'ops/s', note: '~15 million AI accelerators executing ~9×10²¹ neural-net ops/s' },
    { name: 'Frontier 100k-GPU clusters', pop: 30, one: 3.0e20, color: 'var(--s-silicon)', shape: 'triangle', unit: 'ops/s', note: 'Handful of coherent 100k-GPU superclusters: 3×10²⁰ ops/s in one entity' },
    { name: 'Voyager 1 (1 light-day)', pop: 1, one: 1.2e4, color: 'var(--c-wire)', shape: 'diamond', unit: 'ops/s', note: 'Farthest human-made computer (25.9B km): radiation-hardened 69 KB brain' }
  ];

  const MODES = {
    events: {
      label: 'Information events / sec',
      note: 'Because 3.1×10³⁰ bacteria run chemical reactions in parallel, microbes dominate raw event volume. Zooming in twice reveals wild animals (99.7% of fast signals) and then humans, computers and trees.',
      pies: [
        {
          title: '1. All events on Earth',
          sub: '2.80×10³³ reactions & ops / sec',
          zoomTo: 'Zoom ×10⁷ into fast electrical & chip signals →',
          slices: [
            { label: 'Microbes (chemistry)', val: 2.624e33, color: 'var(--s-chem)', unit: '/s' },
            { label: 'Trees, plants & fungi', val: 1.81e32, color: 'var(--act-3)', unit: '/s' },
            { label: 'Nerves + chips (<0.001%)', val: 3.01e26, color: 'var(--s-neuro)', unit: '/s', minDeg: 2.5 }
          ]
        },
        {
          title: '2. Fast electrical & nerve signals',
          sub: '3.01×10²⁶ fast signals / sec',
          zoomTo: 'Zoom ×240 past wild animals & biofilms →',
          slices: [
            { label: 'Wild animals (nerves)', val: 2.988e26, color: 'var(--s-neuro)', unit: '/s' },
            { label: 'Humans, chips & trees (0.41%)', val: 1.24e24, color: 'var(--c-prog)', unit: '/s', minDeg: 3 },
            { label: 'Microbial biofilms (electrical)', val: 6.97e23, color: 'var(--s-chem)', unit: '/s', minDeg: 3 }
          ]
        },
        {
          title: '3. Inside that sliver: humans, chips & trees',
          sub: '1.24×10²⁴ signals & ops / sec',
          slices: [
            { label: 'Human brains (8.1B)', val: 1.22e24, color: 'var(--c-prog)', unit: '/s' },
            { label: 'Other computers & phones', val: 9.9e21, color: 'var(--s-silicon)', unit: '/s', minDeg: 3 },
            { label: 'AI neural-net chips', val: 9.0e21, color: 'var(--c-cpu)', unit: '/s', minDeg: 3 },
            { label: 'Trees (phloem electrical)', val: 3.0e21, color: 'var(--act-3)', unit: '/s', minDeg: 2.5 }
          ]
        }
      ]
    },
    power: {
      label: 'Power used (84.5 TW)',
      note: 'On an energy pie, nothing is microscopic: trees, plants and fungi capture and burn 57.4% of Earth’s budget, human industry uses 23.1% (with 80 GW in computers), and microbes use 16.6%.',
      pies: [
        {
          title: '1. Whole planet power budget',
          sub: '84.5 terawatts (65 TW life + 19.5 TW tech)',
          zoomTo: 'Zoom ×33 into animals, humans & computers →',
          slices: [
            { label: 'Trees, plants & fungi', val: 48.5, color: 'var(--act-3)', unit: ' TW' },
            { label: 'Human industry & transport', val: 19.42, color: 'var(--c-backup)', unit: ' TW' },
            { label: 'Microbes', val: 14.0, color: 'var(--s-chem)', unit: ' TW' },
            { label: 'Wild & farm animals', val: 1.70, color: 'var(--s-neuro)', unit: ' TW' },
            { label: 'Human bodies & brains', val: 0.80, color: 'var(--c-prog)', unit: ' TW' },
            { label: 'Computers & data centers', val: 0.08, color: 'var(--s-silicon)', unit: ' TW', minDeg: 2.5 }
          ]
        },
        {
          title: '2. Animals, human bodies & computers',
          sub: '2.58 terawatts combined',
          slices: [
            { label: 'Wild & farm animals', val: 1.70, color: 'var(--s-neuro)', unit: ' TW' },
            { label: 'Human bodies (non-brain)', val: 0.64, color: 'var(--c-prog)', unit: ' TW' },
            { label: 'Human brains (8.1B × 20 W)', val: 0.16, color: 'var(--c-cpu)', unit: ' TW' },
            { label: 'Computers & data centers (80 GW)', val: 0.08, color: 'var(--s-silicon)', unit: ' TW' }
          ]
        }
      ]
    },
    memory: {
      label: 'Stored memory (bits)',
      note: 'Copied across 3.2×10³⁰ cells, DNA holds 3.6×10³⁷ bits—though only 3.8×10¹² bits are unique genetic recipes. Zooming into non-DNA memory shows animal synapses and humanity’s 15 zettabytes of outside storage.',
      pies: [
        {
          title: '1. All stored bits (including DNA copies)',
          sub: '3.60×10³⁷ bits total',
          zoomTo: 'Zoom into learned synapse & digital memory →',
          slices: [
            { label: 'Microbial DNA copies', val: 1.86e37, color: 'var(--s-chem)', unit: ' bits' },
            { label: 'Plant, fungal & animal DNA', val: 1.74e37, color: 'var(--act-3)', unit: ' bits' },
            { label: 'Synapses + digital (<0.001%)', val: 1.40e28, color: 'var(--s-neuro)', unit: ' bits', minDeg: 2.5 }
          ]
        },
        {
          title: '2. Learned synapses & outside archives',
          sub: '1.40×10²⁸ non-DNA bits',
          zoomTo: 'Zoom into humans vs. digital storage →',
          slices: [
            { label: 'Wild animal synapses', val: 1.40e28, color: 'var(--s-neuro)', unit: ' bits' },
            { label: 'Human synapses + digital (0.04%)', val: 5.72e24, color: 'var(--c-prog)', unit: ' bits', minDeg: 3.5 }
          ]
        },
        {
          title: '3. Human brains vs. computers & books',
          sub: '5.72×10²⁴ bits',
          slices: [
            { label: 'Human brain synapses (8.1B)', val: 5.60e24, color: 'var(--c-prog)', unit: ' bits' },
            { label: 'Digital & written archives (15 ZB)', val: 1.20e23, color: 'var(--s-silicon)', unit: ' bits' }
          ]
        }
      ]
    },
    complexity: {
      label: 'Complexity of ONE unit',
      note: 'Why bacteria dominate volume without being complex thinkers: one bacterium runs ~850 reactions/s (~3 digits), while one tree runs ~10⁹ electrical signals/s, one human brain ~1.5×10¹⁴/s, and one frontier AI cluster 3×10²⁰ ops/s—a 10¹⁷.⁵-fold complexity gap.',
      pies: [
        {
          title: 'Order-of-magnitude complexity (digits of ops/s per single unit)',
          sub: 'Comparing ONE individual of each kind (log₁₀ scale)',
          isLogComplexity: true,
          slices: [
            { label: '1 AI supercomputer (3×10²⁰/s)', val: Math.log10(3e20), raw: '3×10²⁰ ops/s', color: 'var(--s-silicon)', unit: ' digits' },
            { label: '1 human brain (1.5×10¹⁴/s)', val: Math.log10(1.5e14), raw: '1.5×10¹⁴ signals/s', color: 'var(--c-prog)', unit: ' digits' },
            { label: '1 animal (honeybee ~10⁸ to whale ~10¹⁴/s)', val: Math.log10(1e11), raw: '~10¹¹ signals/s (octopus)', color: 'var(--s-neuro)', unit: ' digits' },
            { label: '1 mature tree (~10⁹/s phloem)', val: Math.log10(1e9), raw: '~10⁹ signals/s', color: 'var(--act-3)', unit: ' digits' },
            { label: '1 bacterium (~850/s)', val: Math.log10(846), raw: '~850 reactions/s', color: 'var(--s-chem)', unit: ' digits' }
          ]
        }
      ]
    },
    map: {
      label: 'Population × Complexity map',
      note: 'Why microbes rule planetary totals while brains and AI rule single-unit complexity: diagonal lines mark equal planetary throughput (Total = How many exist × 1-unit speed). Microbes sit bottom-right (vast count, tiny unit); AI clusters sit top-left (tiny count, huge unit).',
      pies: []
    }
  };

  function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcPath(cx, cy, rOut, rIn, a0, a1) {
    const span = Math.min(359.99, Math.max(0.4, a1 - a0));
    const end = a0 + span;
    const large = span > 180 ? 1 : 0;
    const [x0, y0] = polar(cx, cy, rOut, a0);
    const [x1, y1] = polar(cx, cy, rOut, end);
    const [x2, y2] = polar(cx, cy, rIn, end);
    const [x3, y3] = polar(cx, cy, rIn, a0);
    return 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
      'A' + rOut + ' ' + rOut + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
      'L' + x2.toFixed(2) + ' ' + y2.toFixed(2) +
      'A' + rIn + ' ' + rIn + ' 0 ' + large + ' 0 ' + x3.toFixed(2) + ' ' + y3.toFixed(2) + 'Z';
  }

  function fmtPct(p) {
    if (p >= 99.95 && p < 100) return '>99.9%';
    if (p >= 10) return p.toFixed(1) + '%';
    if (p >= 1) return p.toFixed(1) + '%';
    if (p >= 0.01) return p.toFixed(2) + '%';
    return '<0.01%';
  }

  function fmtVal(s, isLog) {
    if (isLog) return s.raw + ' (' + s.val.toFixed(1) + ' digits)';
    if (s.unit === ' TW') {
      if (s.val < 0.001) return X.plain(s.val * 1e6) + ' MW';
      return (s.val < 0.1 ? X.plain(s.val * 1000) + ' GW' : X.plain(s.val) + ' TW');
    }
    return X.sci(s.val) + s.unit;
  }

  function renderPieCard(pie, centerLabel) {
    const activeSlices = pie.slices.filter(s => s.val > 0);
    const total = activeSlices.reduce((t, s) => t + s.val, 0) || 1;
    const rawDegs = activeSlices.map(s => (s.val / total) * 360);
    let extra = 0;
    const adjDegs = rawDegs.map((d, idx) => {
      const minD = activeSlices[idx].minDeg || 0;
      if (activeSlices.length > 1 && d < minD) { extra += (minD - d); return minD; }
      return d;
    });
    if (extra > 0 && activeSlices.length > 1) {
      const bigIdx = adjDegs.indexOf(Math.max(...adjDegs));
      adjDegs[bigIdx] = Math.max(10, adjDegs[bigIdx] - extra);
    }

    let ang = 0;
    const paths = activeSlices.map((s, idx) => {
      const pct = (s.val / total) * 100;
      const d0 = ang, d1 = ang + adjDegs[idx];
      ang = d1;
      const lbl = s.label + ': ' + (pie.isLogComplexity ? fmtVal(s, true) : fmtPct(pct) + ' (' + fmtVal(s, false) + ')');
      return '<path d="' + arcPath(110, 110, 96, 52, d0, d1) + '" style="fill:' + s.color + ';stroke:var(--surface);stroke-width:2" data-tip="' + esc(lbl) + '"><title>' + esc(lbl) + '</title></path>';
    }).join('');

    const aria = pie.title + ' (' + pie.sub + '): ' + activeSlices.map(s => {
      const pct = (s.val / total) * 100;
      return s.label + ' ' + (pie.isLogComplexity ? fmtVal(s, true) : fmtPct(pct));
    }).join('; ');

    const legend = '<ul class="pie-leg" role="list">' + activeSlices.map(s => {
      const pct = (s.val / total) * 100;
      return '<li><i style="background:' + s.color + '" aria-hidden="true"></i><span class="pl-name">' + esc(s.label) + '</span>' +
        '<b class="tnum">' + (pie.isLogComplexity ? s.val.toFixed(1) + ' digits' : fmtPct(pct)) + '</b>' +
        '<small class="tnum">' + esc(pie.isLogComplexity ? s.raw : fmtVal(s, false)) + '</small></li>';
    }).join('') + '</ul>';

    const cTop = pie.isLogComplexity ? '1 unit' : (centerLabel || '2026');
    return '<figure class="pie-card">' +
      '<figcaption><span class="pie-t">' + esc(pie.title) + '</span><span class="pie-sub">' + esc(pie.sub) + '</span></figcaption>' +
      '<div class="pie-body"><svg viewBox="0 0 220 220" class="pie-svg" role="img" aria-label="' + esc(aria) + '">' +
      paths +
      '<text x="110" y="106" text-anchor="middle" class="pie-c1">' + esc(cTop) + '</text>' +
      '<text x="110" y="123" text-anchor="middle" class="pie-c2">' + (pie.isLogComplexity ? 'log₁₀ ops/s' : 'share') + '</text>' +
      '</svg>' + legend + '</div>' +
      (pie.zoomTo ? '<p class="pie-zoom-tag">' + esc(pie.zoomTo) + '</p>' : '') +
      '</figure>';
  }

  // Dynamic pies for any historical/geological moment i < N - 1, computed directly from X.E[i]
  function buildEpochPies(i) {
    const e = X.E[i];
    const st = X.STOP[e.id];
    const when = X.fmtShort(e.t);
    const prokOps = e.cells * 846.318;
    const eukOps = Math.max(0, e.cbio - prokOps);

    if (curMode === 'events') {
      const fastSlices = [];
      if (e.cneu > 0) fastSlices.push({ label: 'Animal nerves', val: e.cneu, color: 'var(--s-neuro)', unit: '/s', minDeg: 3 });
      if (e.cbel > 0) fastSlices.push({ label: 'Bioelectric (biofilms & plants)', val: e.cbel, color: 'var(--s-chem)', unit: '/s', minDeg: 3 });
      if (e.cdig - e.cai > 0) fastSlices.push({ label: 'General computers & chips', val: e.cdig - e.cai, color: 'var(--s-silicon)', unit: '/s', minDeg: 3 });
      if (e.cai > 0) fastSlices.push({ label: 'AI accelerators', val: e.cai, color: 'var(--c-cpu)', unit: '/s', minDeg: 3 });
      const fastTot = fastSlices.reduce((t, s) => t + s.val, 0);

      const allSlices = [{ label: 'Microbes (cell chemistry)', val: prokOps, color: 'var(--s-chem)', unit: '/s' }];
      if (eukOps > 0) allSlices.push({ label: 'Complex cells (algae, plants, fungi)', val: eukOps, color: 'var(--act-3)', unit: '/s', minDeg: 2.5 });
      if (fastTot > 0) allSlices.push({ label: 'Fast electrical, nerve & chip signals', val: fastTot, color: 'var(--s-neuro)', unit: '/s', minDeg: 2.5 });

      const out = [{
        title: '1. All information events (' + when + ')',
        sub: X.sci(e.cbio + fastTot) + ' reactions & signals / sec',
        zoomTo: fastTot > 0 ? 'Right: zoom into fast bioelectric, nerve & silicon signals →' : 'Before bioelectric waves, nerves or chips existed',
        slices: allSlices
      }];
      if (fastTot > 0) {
        out.push({
          title: '2. Fast electrical, nerve & chip signals (' + when + ')',
          sub: X.sci(fastTot) + ' fast signals / sec',
          slices: fastSlices
        });
      }
      return out;
    }

    if (curMode === 'power') {
      const nonAnimTW = Math.max(0, (e.pbio - (e.pani || 0)) / 1e12);
      const animTW = (e.pani || 0) / 1e12;
      const techTW = Math.max(0, ((e.ptech || 0) - (e.pit || 0)) / 1e12);
      const itTW = (e.pit || 0) / 1e12;
      const slices = [{ label: eukOps > 0 ? 'Microbes, algae & land plants' : 'Microbes (chemosynthesis / early sun)', val: nonAnimTW, color: eukOps > 0 ? 'var(--act-3)' : 'var(--s-chem)', unit: ' TW' }];
      if (animTW > 0) slices.push({ label: 'Animals & brains', val: animTW, color: 'var(--s-neuro)', unit: ' TW', minDeg: 3 });
      if (techTW > 0) slices.push({ label: 'Human fire, farming & industry', val: techTW, color: 'var(--c-backup)', unit: ' TW', minDeg: 3 });
      if (itTW > 0) slices.push({ label: 'Computers & IT', val: itTW, color: 'var(--s-silicon)', unit: ' TW', minDeg: 2.5 });
      return [{
        title: 'Planetary power budget (' + when + ')',
        sub: X.watts(e.ptot) + ' total (' + X.watts(e.pbio) + ' biology' + (e.ptech > 0 ? ' + ' + X.watts(e.ptech) + ' tech' : '') + ')',
        slices
      }];
    }

    if (curMode === 'memory') {
      const prokBits = Math.min(e.hcopy, e.cells * 6e6);
      const eukBits = Math.max(0, e.hcopy - prokBits);
      const synBits = Math.max(0, e.mpas - e.hcopy - (e.mexo || 0));
      const exoBits = e.mexo || 0;
      const allSlices = [{ label: 'Microbial DNA / RNA copies', val: prokBits || e.hcopy, color: 'var(--s-chem)', unit: ' bits' }];
      if (eukBits > 0) allSlices.push({ label: 'Complex-cell DNA (algae, plants, animals)', val: eukBits, color: 'var(--act-3)', unit: ' bits', minDeg: 2.5 });
      if (synBits + exoBits > 0) allSlices.push({ label: 'Synapses + outside archives', val: synBits + exoBits, color: 'var(--s-neuro)', unit: ' bits', minDeg: 2.5 });
      const out = [{
        title: '1. All stored bits (' + when + ')',
        sub: X.sci(e.mpas) + ' passive bits (' + X.sci(e.hdiv) + ' unique genetic bits)',
        slices: allSlices
      }];
      if (synBits + exoBits > 0) {
        const nonDna = [];
        if (synBits > 0) nonDna.push({ label: 'Animal brain & nerve synapses', val: synBits, color: 'var(--s-neuro)', unit: ' bits' });
        if (exoBits > 0) nonDna.push({ label: 'Outside memory (stone, clay, print, chips)', val: exoBits, color: 'var(--s-silicon)', unit: ' bits', minDeg: 3 });
        out.push({
          title: '2. Learned synapses & outside memory (' + when + ')',
          sub: X.sci(synBits + exoBits) + ' non-DNA bits',
          slices: nonDna
        });
      }
      return out;
    }

    // complexity mode at past epoch
    const slices = [
      { label: 'Most capable single entity (' + (st ? st.who : X.titleOf(i)) + ')', val: Math.max(0.5, Math.log10(Math.max(10, e.cmax))), raw: X.sci(e.cmax) + '/s', color: e.cdig > e.cneu && e.cmax > 1e15 ? 'var(--s-silicon)' : (e.cneu > 0 ? 'var(--s-neuro)' : 'var(--act-3)'), unit: ' digits' },
      { label: '1 typical microbe (~850/s baseline)', val: Math.log10(846), raw: '~850 reactions/s', color: 'var(--s-chem)', unit: ' digits' }
    ];
    return [{
      title: 'Peak single-unit complexity vs. 1 microbe (' + when + ')',
      sub: 'Lead over a bacterium: ' + (e.gould || 0).toFixed(1) + ' orders of magnitude (log₁₀)',
      isLogComplexity: true,
      slices
    }];
  }

  function renderComplexityBars() {
    const maxLog = Math.log10(3e20);
    return '<div class="cplx-bars" aria-label="Single-system processing capacity on a base-10 log scale">' +
      '<span class="sub">How much information ONE single unit processes vs. a typical microbe (~850/s)</span>' +
      GROUPS.slice().reverse().map(g => {
        const lg = Math.log10(g.oneOps);
        const w = Math.max(6, (lg / maxLog) * 100);
        const lead = g.oneOps / 846;
        return '<div class="cb-row">' +
          '<div class="cb-top"><b>' + esc(g.oneName) + '</b><span class="tnum">' + esc(g.oneNote) + (lead > 1.5 ? ' · <b>' + X.sci(lead) + '×</b> a bacterium' : ' · baseline cell') + '</span></div>' +
          '<div class="cb-track"><span style="width:' + w.toFixed(1) + '%;background:' + g.color + '"></span></div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  function mapShape(shape, x, y, r, fill) {
    const a = ' style="fill:' + fill + ';stroke:var(--surface);stroke-width:1.6"';
    if (shape === 'square') return '<rect x="' + (x - r).toFixed(1) + '" y="' + (y - r).toFixed(1) + '" width="' + (2 * r) + '" height="' + (2 * r) + '" rx="2"' + a + '/>';
    if (shape === 'triangle') return '<polygon points="' + x.toFixed(1) + ',' + (y - r * 1.25).toFixed(1) + ' ' + (x + r * 1.15).toFixed(1) + ',' + (y + r * 0.9).toFixed(1) + ' ' + (x - r * 1.15).toFixed(1) + ',' + (y + r * 0.9).toFixed(1) + '"' + a + '/>';
    if (shape === 'diamond') return '<polygon points="' + x.toFixed(1) + ',' + (y - r * 1.3).toFixed(1) + ' ' + (x + r * 1.3).toFixed(1) + ',' + y.toFixed(1) + ' ' + x.toFixed(1) + ',' + (y + r * 1.3).toFixed(1) + ' ' + (x - r * 1.3).toFixed(1) + ',' + y.toFixed(1) + '"' + a + '/>';
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '"' + a + '/>';
  }

  function renderIsoMap() {
    const W = 940, H = 430, L = 76, R = 30, T = 30, B = 52;
    const LX0 = -0.4, LX1 = 31.5, LY0 = 2.0, LY1 = 21.5;
    const xOf = lp => L + (lp - LX0) / (LX1 - LX0) * (W - L - R);
    const yOf = lc => T + (LY1 - lc) / (LY1 - LY0) * (H - T - B);
    let s = '';

    // Grid lines
    [[0, '1'], [6, '1M'], [9, '1B'], [12, '10¹²'], [18, '10¹⁸'], [24, '10²⁴'], [30, '10³⁰']].forEach(([lp, lab]) => {
      const x = xOf(lp);
      s += '<line class="grid" x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '"/>' +
        '<text class="tick" x="' + x.toFixed(1) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + lab + '</text>';
    });
    [[3, '10³/s'], [9, '10⁹/s'], [13, '10¹³/s'], [17, '10¹⁷/s'], [20, '10²⁰/s']].forEach(([lc, lab]) => {
      const y = yOf(lc);
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>' +
        '<text class="tick" x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + lab + '</text>';
    });

    // Diagonal iso-throughput lines: log10(pop) + log10(one) = K
    [
      [15, '10¹⁵/s total (all space)'],
      [22, '10²²/s total (all chips & humans)'],
      [26, '10²⁶/s total (all animal nerves)'],
      [33, '10³³/s total (all cell chemistry)']
    ].forEach(([K, lab]) => {
      const pts = [];
      for (const lp of [LX0, LX1]) {
        const lc = K - lp;
        if (lc >= LY0 && lc <= LY1) pts.push([lp, lc]);
      }
      for (const lc of [LY0, LY1]) {
        const lp = K - lc;
        if (lp >= LX0 && lp <= LX1) pts.push([lp, lc]);
      }
      pts.sort((a, b) => a[0] - b[0]);
      if (pts.length >= 2) {
        const p0 = pts[0], p1 = pts[pts.length - 1];
        const x1 = xOf(p0[0]), y1 = yOf(p0[1]), x2 = xOf(p1[0]), y2 = yOf(p1[1]);
        s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="5 4"/>';
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 5;
        s += '<text class="tick" x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '" text-anchor="middle" style="font-size:11px">' + esc(lab) + '</text>';
      }
    });

    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text class="tick" x="' + L + '" y="' + (H - 8) + '">How many exist in 2026 (population count, log₁₀ scale) →</text>' +
      '<text class="tick" x="' + (L + 4) + '" y="' + (T - 10) + '">1-unit processing speed / complexity (events or ops per second, log₁₀)</text>';

    MAP_POINTS.forEach((p, idx) => {
      const x = xOf(Math.log10(p.pop)), y = yOf(Math.log10(p.one));
      const leftAlign = Math.log10(p.pop) > 22;
      const dy = p.name.indexOf('Smartphones') >= 0 ? 15 : (p.name.indexOf('Humans') >= 0 ? -9 : 4);
      s += '<g class="pie-mpt" tabindex="0" role="button" data-mi="' + idx + '" aria-label="' + esc(p.name + ': ' + X.sci(p.pop) + ' units at ' + X.sci(p.one) + ' ' + p.unit + ' each') + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="13" fill="transparent"/>' +
        mapShape(p.shape, x, y, 6.5, p.color) +
        '<text class="flab" x="' + (leftAlign ? x - 10 : x + 10).toFixed(1) + '" y="' + (y + dy).toFixed(1) + '" text-anchor="' + (leftAlign ? 'end' : 'start') + '">' + esc(p.name) + '</text></g>';
    });

    return '<figure class="pie-card pie-map-card">' +
      '<figcaption><span class="pie-t">Abundance vs. single-unit complexity across 30 orders of magnitude (2026)</span>' +
      '<span class="pie-sub">Diagonal dashed lines connect equal planetary totals (Population × 1-unit speed). Moving up-and-left trades vast headcount for concentrated complexity inside one mind or cluster.</span></figcaption>' +
      '<div class="plot-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="plot fig" role="img" aria-label="Log-log map of population count versus single-unit complexity across ten biological and technological groups in 2026.">' + s + '</svg></div>' +
      '<p class="readout" id="pieMapRead" aria-live="polite">Hover, tap or tab to any group to read its population, 1-unit speed and planetary total.</p>' +
      '</figure>';
  }

  function epochTextFor(i) {
    const e = X.E[i], st = X.STOP[e.id];
    return X.fmtShort(e.t) + ' — ' + (st ? st.who : X.titleOf(i));
  }

  function renderStageHtml() {
    if (curMode === 'map') {
      return '<div class="pie-grid pies-map">' + renderIsoMap() + '</div>';
    }
    if (selEpoch === N - 1) {
      const M = MODES[curMode];
      const colsClass = M.pies.length === 3 ? 'pies-3' : M.pies.length === 2 ? 'pies-2' : 'pies-1';
      return '<div class="pie-grid ' + colsClass + '">' + M.pies.map(p => renderPieCard(p, '2026')).join('') + (curMode === 'complexity' ? renderComplexityBars() : '') + '</div>';
    }
    const e = X.E[selEpoch], st = X.STOP[e.id], a = X.actOf(selEpoch);
    const epPies = buildEpochPies(selEpoch);
    const colsClass = epPies.length === 2 ? 'pies-2' : 'pies-1';
    const banner = '<div class="pie-ep-banner" style="--ac:' + a.color + '">' +
      '<div><span class="sub">Act ' + a.n + ' · ' + esc(a.name) + ' · ' + esc(X.fmtTime(e.t)) + '</span>' +
      '<b>' + esc(st ? st.who : X.titleOf(selEpoch)) + '</b> — ' + esc(X.hookOf(selEpoch)) + '</div>' +
      '<a class="btn sm ghost" href="journey.html#' + esc(e.id) + '">Visit stop →</a></div>';
    return banner + '<div class="pie-grid ' + colsClass + '">' + epPies.map(p => renderPieCard(p, X.fmtShort(e.t))).join('') + '</div>';
  }

  function bindMapEvents() {
    const mr = $('pieMapRead');
    if (!mr) return;
    root.querySelectorAll('.pie-mpt').forEach(g => {
      const show = () => {
        const p = MAP_POINTS[Number(g.dataset.mi)];
        if (!p) return;
        mr.innerHTML = '<b>' + esc(p.name) + '</b> · Population: <b>' + X.sci(p.pop) + '</b> · 1 unit: <b>' + X.sci(p.one) + ' ' + esc(p.unit) + '</b> · Planetary total: <b>' + X.sci(p.pop * p.one) + '/s</b> — ' + esc(p.note);
      };
      g.addEventListener('mouseenter', show);
      g.addEventListener('focus', show);
      g.addEventListener('click', show);
    });
  }

  function syncScrubberUI() {
    const sl = $('pieEpochSlider');
    const out = $('pieEpochOut');
    const txt = epochTextFor(selEpoch);
    if (sl) {
      sl.value = String(selEpoch);
      sl.setAttribute('aria-valuetext', txt);
      sl.style.setProperty('--control-value', String(selEpoch));
    }
    if (out) out.textContent = txt;
    root.querySelectorAll('[data-era-idx]').forEach(b => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.eraIdx) === selEpoch));
    });
  }

  function updateStageOnly() {
    const stg = $('pieDynStage');
    if (stg) {
      stg.innerHTML = renderStageHtml();
      bindMapEvents();
    }
    syncScrubberUI();
  }

  function render() {
    const M = MODES[curMode];
    const txt = epochTextFor(selEpoch);
    root.innerHTML =
      '<div class="pie-controls"><div class="seg" role="group" aria-label="What the planetary diagram measures">' +
      Object.keys(MODES).map(k => '<button type="button" data-pmode="' + k + '" aria-pressed="' + (k === curMode) + '">' + esc(MODES[k].label) + '</button>').join('') +
      '</div>' +
      (curMode !== 'map'
        ? '<div class="pie-scrub">' +
          '<div class="pie-scrub-top"><label for="pieEpochSlider">Scrub across all ' + N + ' moments:</label>' +
          '<output id="pieEpochOut" for="pieEpochSlider" class="tnum">' + esc(txt) + '</output></div>' +
          '<input type="range" id="pieEpochSlider" class="pie-range" min="0" max="' + (N - 1) + '" step="1" value="' + selEpoch + '" aria-valuetext="' + esc(txt) + '" style="--attr-min:0;--attr-max:' + (N - 1) + ';--control-value:' + selEpoch + '">' +
          '<div class="pie-eras" role="group" aria-label="Jump to a landmark era">' +
          ERA_JUMPS.map(j => '<button type="button" class="part-chip" data-era-idx="' + j.idx + '" aria-pressed="' + (j.idx === selEpoch) + '">' + esc(j.label) + '</button>').join('') +
          '</div></div>'
        : '') +
      '<p class="note" aria-live="polite">' + esc(M.note) + '</p></div>' +
      '<div id="pieDynStage">' + renderStageHtml() + '</div>' +
      '<details class="evid-disc" open><summary>Compare all 6 groups side by side in 2026: Earth’s 5 groups + off-world spacecraft out to 1 light-day</summary>' +
      '<div class="tbl-wrap" tabindex="0" role="region" aria-labelledby="todayTblCap">' +
      '<table class="rt pie-tbl"><caption id="todayTblCap">2026 planetary and off-world information processing, single-unit complexity, power and replication mode across six groups</caption>' +
      '<thead><tr><th scope="col">Group</th><th scope="col">How many exist</th><th scope="col">One unit’s capacity (complexity)</th><th scope="col">Total events / s</th><th scope="col">Power used</th><th scope="col">Replication / making</th></tr></thead>' +
      '<tbody>' + GROUPS.map(g =>
        '<tr><th scope="row"><span class="dot" style="background:' + g.color + ';margin-right:7px" aria-hidden="true"></span><a href="' + (g.linkHref || ('atlas.html#kind=' + g.atlasKind)) + '">' + esc(g.short) + '</a></th>' +
        '<td class="tnum">' + esc(g.count) + '</td>' +
        '<td class="tnum"><b>' + esc(g.oneName) + '</b><br><span class="muted">' + esc(g.oneNote) + '</span></td>' +
        '<td class="tnum">' + X.sci(g.totalOps) + '/s' + (g.key === 'trees' ? '<br><span class="muted">(' + X.sci(g.fastOps) + '/s electrical)</span>' : '') + (g.key === 'offworld' ? '<br><span class="muted">(0.00001% of Earth chips)</span>' : '') + '</td>' +
        '<td class="tnum">' + (g.powerTW < 0.001 ? Math.round(g.powerTW * 1e6) + ' MW' : (g.powerTW < 0.1 ? Math.round(g.powerTW * 1000) + ' GW' : g.powerTW.toFixed(g.powerTW < 2 ? 2 : 1) + ' TW')) + '</td>' +
        '<td>' + esc(g.repro) + '</td></tr>'
      ).join('') + '</tbody></table></div>' +
      '<p class="note" style="margin-top:10px">Chemical reactions in cells, nerve spikes and chip operations are different physical events and are never merged into a single score. Individual system complexity is tracked across ' + N + ' moments via ' +
      X.numBtn('c_max_entity_ops_sec', 'most capable single thinker (C_max)') + ' and ' + X.numBtn('gould_variance_right_tail', 'lead over a typical cell (σ_Gould)') +
      ', across space in <a href="data.html#offworld">Computing beyond Earth →</a>, and system by system in the <a href="atlas.html#systems-db">703-system Atlas &amp; Database →</a></p></details>';

    root.querySelectorAll('[data-pmode]').forEach(btn => {
      btn.addEventListener('click', () => {
        curMode = btn.dataset.pmode;
        render();
        const next = root.querySelector('[data-pmode="' + curMode + '"]');
        if (next) next.focus();
      });
    });

    const sl = $('pieEpochSlider');
    if (sl) {
      sl.addEventListener('input', ev => {
        selEpoch = Number(ev.target.value);
        updateStageOnly();
      });
    }
    root.querySelectorAll('[data-era-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        selEpoch = Number(btn.dataset.eraIdx);
        updateStageOnly();
      });
    });

    bindMapEvents();
  }

  render();
})();
