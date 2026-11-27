/* Interactive 10-Dimension Eye & Vision Evolution Explorer (eyes.html) */
(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('eyes');
  const $ = id => document.getElementById(id);
  const esc = X.esc;

  const LED = (window.SI_LEDGERS && window.SI_LEDGERS.eyes10d) || { columns: [], rows: [] };
  const COLS = LED.columns;
  const ROWS = LED.rows.map(arr => {
    const obj = {};
    COLS.forEach((c, i) => { obj[c] = arr[i]; });
    obj._t = Number(obj.time_mya || 0);
    obj._diam = Number(obj.eye_diameter_mm || 0);
    obj._fn = Number(obj.f_number || 0);
    obj._rec = Number(obj.photoreceptors_per_eye || 0);
    obj._cpd = Number(obj.acuity_cycles_per_deg || 0);
    obj._chan = Number(obj.spectral_channels || 0);
    obj._hz = Number(obj.flicker_fusion_hz || 0);
    obj._dr = Number(obj.dynamic_range_log10 || 0);
    obj._fov = Number(obj.total_fov_deg || 0);
    obj._stereo = Number(obj.stereo_overlap_deg || 0);
    obj._rng = Number(obj.visual_range_m || 0);
    obj._layers = Number(obj.retinal_layers || 0);
    obj._raw = Number(obj.raw_receptor_bits_sec || 0);
    obj._out = Number(obj.optic_output_bits_sec || 0);
    obj._ratio = Number(obj.compression_ratio || 1);
    obj._mw = Number(obj.eye_power_mw || 0);
    obj._share = Number(obj.body_energy_share_pct || 0);
    obj._comp = Number(obj.composite_10d_index || 0);
    obj._scores = [
      Number(obj.d1_optics_score || 0),
      Number(obj.d2_receptors_score || 0),
      Number(obj.d3_acuity_score || 0),
      Number(obj.d4_spectral_score || 0),
      Number(obj.d5_temporal_score || 0),
      Number(obj.d6_sensitivity_score || 0),
      Number(obj.d7_stereo_range_score || 0),
      Number(obj.d8_compression_score || 0),
      Number(obj.d9_efficiency_score || 0),
      Number(obj.d10_toolkit_score || 0)
    ];
    return obj;
  });
  const BY_SLUG = {};
  ROWS.forEach(r => { BY_SLUG[r.slug] = r; });

  const GROUP_COLORS = {
    'Microbial light switches': '#169674',
    'First cups, pinholes & mirrors': '#0e87b8',
    'Arthropod compound & hyperspectral eyes': '#d97706',
    'Vertebrate camera eyes': '#b83280',
    'Human & synthetic vision': '#6b46c1'
  };

  const DIMS = [
    {
      key: 'd1', idx: 0, short: 'Optics & size', color: 'var(--c-io)', span: '2 µm → 270 mm bio (6.5 m JWST)',
      title: 'Optical geometry, eye diameter & f-number',
      desc: 'From 3-µm bacterial cell lenses, concave cups and Nautilus pinholes to calcite crystal doublets, 200-mirror scallops, 27-cm giant squid eyes and segmented space mirrors.',
      val: r => r._diam, lo: 1e-3, hi: 1e4,
      fmt: r => X.plain(r._diam) + ' mm · f/' + r._fn + ' (' + r.optical_type.split(' (')[0] + ')'
    },
    {
      key: 'd2', idx: 1, short: 'Photoreceptors', color: 'var(--c-cpu)', span: '1 → 10⁹ / eye',
      title: 'Detector / photoreceptor count per eye',
      desc: 'Sampling elements per eye: 1 algal eyespot, 28,000 dragonfly facets, 126 million human rods & cones, and 1 billion photoreceptors in wedge-tailed eagles and giant squid.',
      val: r => r._rec, lo: 0.8, hi: 2e9,
      fmt: r => (r._rec > 0 ? X.sci(r._rec) + ' receptors' : '0 (regressed cavefish)')
    },
    {
      key: 'd3', idx: 2, short: 'Acuity (cpd)', color: 'var(--c-prog)', span: '0.005 → 140 cpd bio',
      title: 'Spatial resolving power (cycles per degree)',
      desc: 'Finest grating resolved: ~0.02 cpd eyespots, ~2 cpd insect diffraction limit, 60 cpd human fovea (1 arcmin), 140 cpd wedge-tailed eagle, and 36,000 cpd on JWST.',
      val: r => r._cpd, lo: 4e-3, hi: 5e4,
      fmt: r => (r._cpd > 0 ? X.plain(r._cpd) + ' cpd' : '0 cpd (eyeless)')
    },
    {
      key: 'd4', idx: 3, short: 'Color & pol', color: 'var(--c-make)', span: '1 → 16 bio channels',
      title: 'Spectral channels & polarization detection',
      desc: 'From 1-opsin monochromats and 2-cone nocturnal mammals to 3-cone primates, 4-cone UV birds with oil droplets, and 16-channel circular-polarization mantis shrimp.',
      val: r => Math.max(0.5, r._chan), lo: 0.5, hi: 35,
      fmt: r => r._chan + ' ch (' + r.wavelength_span_nm + ' nm) · Pol: ' + r.polarization_mode
    },
    {
      key: 'd5', idx: 4, short: 'Speed (Hz)', color: 'var(--c-wire)', span: '0.2 → 300 Hz bio (10 kHz DVS)',
      title: 'Temporal flicker-fusion resolution',
      desc: 'Speed vs. photon summing: 1.5 Hz in deep-sea twilight, 40 Hz in brain-heated swordfish, 60 Hz in humans, 145 Hz in songbirds, 300 Hz in dragonflies, and 10,000 Hz in event chips.',
      val: r => r._hz, lo: 0.15, hi: 1.5e4,
      fmt: r => (r._hz > 0 ? X.plain(r._hz) + ' Hz' : '—')
    },
    {
      key: 'd6', idx: 5, short: 'Dynamic range', color: 'var(--c-power)', span: '10²× → 10¹⁰× (10 log)',
      title: 'Single-photon sensitivity & dynamic range',
      desc: 'Operating light span: a human duplex rod+cone retina spans 10¹⁰× (10 log units) from single-photon starlight to noon snow, outclassing single-exposure silicon CMOS (~10⁴·⁴×).',
      val: r => Math.pow(10, Math.max(0.1, r._dr)), lo: 1, hi: 2e10,
      fmt: r => '10' + X.sup(Math.round(r._dr)) + '× (' + r._dr + ' log) · 1-photon: ' + r.single_photon_capable
    },
    {
      key: 'd7', idx: 6, short: 'Stereo & range', color: 'var(--c-net)', span: '1 mm → 6 km bio (10²⁶ m JWST)',
      title: 'Field of view, stereo overlap & medium range',
      desc: '360° dragonfly panorama vs. 120–130° owl/primate stereo overlap, plus Tiktaalik’s 100× sight-range and 1,000,000× monitored-volume jump from water into air.',
      val: r => Math.min(1e5, r._rng), lo: 5e-4, hi: 1e5,
      fmt: r => r._fov + '° FOV (' + r._stereo + '° stereo) · ' + fmtRangeM(r._rng)
    },
    {
      key: 'd8', idx: 7, short: 'Compression', color: 'var(--c-ram)', span: '1:1 → 500:1 edge filter',
      title: 'Retinal neural layers & edge compression',
      desc: 'On-sensor preprocessing: five vertebrate retinal layers distil ~1 Gb/s of raw photon arrivals into ~8.75 Mb/s across ~30 ganglion feature streams (>100:1 compression).',
      val: r => r._ratio, lo: 0.8, hi: 600,
      fmt: r => r._layers + ' layers · ' + X.plain(r._ratio) + ':1 (' + X.sci(r._out) + ' b/s out)'
    },
    {
      key: 'd9', idx: 8, short: 'Metabolic cost', color: 'var(--s-chem)', span: '10⁻¹⁰ mW → 1,500 mW bio',
      title: 'Dark-current ATP cost & body share',
      desc: 'Photoreceptors leak dark current nonstop: blowfly retinas burn ~8.5% of insect ATP, swordfish eye heaters burn 1.5 W, and cavefish saved 15% of juvenile energy by going blind.',
      val: r => Math.max(1e-10, r._mw), lo: 1e-10, hi: 5e6,
      fmt: r => X.sci(r._mw) + ' mW (' + r._share + '% budget)'
    },
    {
      key: 'd10', idx: 9, short: 'Pax6 & opsins', color: 'var(--c-store)', span: 'PixJ → 5-class c-opsin + CMOS',
      title: 'Genetic master switch, opsin family & crystallins',
      desc: 'Shared Pax6/eyeless master regulator paired with diverging rhabdomeric (r-opsin) microvilli, ciliary (c-opsin) rods/cones, enzyme-derived crystallins, and silicon photodiodes.',
      val: r => Math.pow(10, r._scores[9]), lo: 1, hi: 1e10,
      fmt: r => r.opsin_class
    }
  ];
  const DIM_BY_KEY = {};
  DIMS.forEach(d => { DIM_BY_KEY[d.key] = d; });

  function fmtAge(mya) {
    if (!(mya > 0)) return 'Today (2026)';
    return X.fmtShort(mya) + (mya >= 0.01 ? ' ago' : '');
  }
  function fmtRangeM(m) {
    if (!(m > 0)) return '0 m';
    if (m > 1e12) return '13.5B light-yr';
    if (m >= 1000) return X.plain(m / 1000) + ' km';
    if (m >= 1) return X.plain(m) + ' m';
    return X.plain(m * 1000) + ' mm';
  }

  /* ---------- KPI Strip ---------- */
  $('eyeKpis').innerHTML = [
    ['<364,000 gen', 'Patch to camera eye', 'Nilsson & Pelger’s upper bound for evolving a focused lens eye via 1% steps—under half a million years.', 'var(--c-io)'],
    ['140 cpd', 'Sharpest biological eye', 'Australia’s wedge-tailed eagle packs 1M cones/mm² inside a magnifying foveal pit (2.3× human acuity).', 'var(--c-prog)'],
    ['16 channels', 'Richest biological color', 'Peacock mantis shrimp scan reefs with 12–16 UV-to-red opsins plus linear and circular polarization.', 'var(--c-make)'],
    ['300 Hz / 10¹⁰×', 'Speed vs. starlight span', 'Dragonflies refresh 300 times/s; vertebrate rod-cone duplex retinas span ten billion-fold light levels.', 'var(--c-wire)'],
    ['114:1 edge AI', 'Human retinal compression', 'Five neural layers inside your eyeball compress ~1 Gb/s of raw light into 30 parallel movies on 45 mW.', 'var(--c-ram)']
  ].map(k =>
    '<article class="org-kpi" style="--kc:' + k[3] + '">' +
    '<span class="k-lbl">' + esc(k[1]) + '</span>' +
    '<div class="k-num">' + esc(k[0]) + '</div>' +
    '<p>' + esc(k[2]) + '</p></article>'
  ).join('');

  /* ---------- 01. Live Interactive Optical Ray-Tracing Bench ---------- */
  let optMode = 'camera';
  const pupilSlider = $('pupilSlider');
  const lensSlider = $('lensSlider');

  function syncSliderCss(sl) {
    sl.style.setProperty('--attr-min', sl.min || 0);
    sl.style.setProperty('--attr-max', sl.max || 100);
    sl.style.setProperty('--control-value', sl.value);
  }

  $('opticModes').addEventListener('click', ev => {
    const b = ev.target.closest('[data-opt]');
    if (!b) return;
    optMode = b.dataset.opt;
    $('opticModes').querySelectorAll('[data-opt]').forEach(btn => btn.setAttribute('aria-pressed', String(btn === b)));
    if (optMode === 'patch') { lensSlider.value = '0'; pupilSlider.value = '80'; }
    else if (optMode === 'cup') { lensSlider.value = '0'; pupilSlider.value = '55'; }
    else if (optMode === 'pinhole') { lensSlider.value = '0'; pupilSlider.value = '14'; }
    else if (optMode === 'camera') { lensSlider.value = '100'; pupilSlider.value = '38'; }
    else if (optMode === 'compound') { lensSlider.value = '100'; pupilSlider.value = '26'; }
    else if (optMode === 'mirror') { lensSlider.value = '100'; pupilSlider.value = '62'; }
    drawRayBench();
  });
  pupilSlider.addEventListener('input', drawRayBench);
  lensSlider.addEventListener('input', drawRayBench);

  function drawRayBench() {
    syncSliderCss(pupilSlider);
    syncSliderCss(lensSlider);
    const ap = Number(pupilSlider.value);     // 6..85
    const foc = Number(lensSlider.value);    // 0..130 (100 = exact focus on retina)
    const fNum = (80 / Math.max(6, ap)).toFixed(1);
    $('pupilOut').textContent = ap + '% (f/' + fNum + ')';
    pupilSlider.setAttribute('aria-valuetext', ap + ' percent opening, f/' + fNum);
    $('lensOut').textContent = foc === 0 ? '0% (no lens)' : foc + '%' + (Math.abs(foc - 100) <= 4 ? ' (sharp focus)' : foc < 100 ? ' (under-focused)' : ' (over-focused)');
    lensSlider.setAttribute('aria-valuetext', $('lensOut').textContent);

    const eyeX = 500, retX = 720, cy = 138;
    const halfAp = ap * 0.85;
    let svg = '';

    // Two distant light targets on left (amber sun-lit prey top, cyan reef feature bottom)
    const srcs = [
      { x: 68, y: 66, col: '#f59e0b', name: 'Upper target' },
      { x: 68, y: 210, col: '#06b6d4', name: 'Lower target' }
    ];
    srcs.forEach(s => {
      svg += '<circle cx="' + s.x + '" cy="' + s.y + '" r="10" fill="' + s.col + '"/>' +
        '<text x="' + s.x + '" y="' + (s.y + 24) + '" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink-2)">' + s.name + '</text>';
    });

    let cpd = 0.02, fluxPct = 100, genSteps = 0, caption = '';

    if (optMode === 'compound') {
      // Draw convex ommatidial fan on right
      const nOm = 9;
      for (let k = 0; k < nOm; k++) {
        const ang = -0.65 + (1.3 * k) / (nOm - 1);
        const ox = 520 + Math.cos(ang) * 70, oy = cy + Math.sin(ang) * 95;
        const rx = 520 + Math.cos(ang) * 145, ry = cy + Math.sin(ang) * 155 * 0.72;
        svg += '<line x1="' + ox.toFixed(1) + '" y1="' + oy.toFixed(1) + '" x2="' + rx.toFixed(1) + '" y2="' + ry.toFixed(1) + '" stroke="var(--ink-3)" stroke-width="5" stroke-linecap="round" opacity=".35"/>';
        svg += '<ellipse cx="' + ox.toFixed(1) + '" cy="' + oy.toFixed(1) + '" rx="5" ry="9" transform="rotate(' + (ang * 57.3).toFixed(1) + ' ' + ox.toFixed(1) + ' ' + oy.toFixed(1) + ')" fill="#38bdf8" fill-opacity=".55" stroke="var(--ink-2)"/>';
      }
      srcs.forEach((s, idx) => {
        const hitK = idx === 0 ? 2 : 6;
        const ang = -0.65 + (1.3 * hitK) / (nOm - 1);
        const ox = 520 + Math.cos(ang) * 70, oy = cy + Math.sin(ang) * 95;
        const rx = 520 + Math.cos(ang) * 145, ry = cy + Math.sin(ang) * 155 * 0.72;
        [-7, 0, 7].forEach(dy => {
          svg += '<path d="M' + s.x + ' ' + s.y + ' L' + ox.toFixed(1) + ' ' + (oy + dy * 0.4).toFixed(1) + ' L' + rx.toFixed(1) + ' ' + ry.toFixed(1) + '" fill="none" stroke="' + s.col + '" stroke-width="1.8" opacity=".82"/>';
        });
        svg += '<circle cx="' + rx.toFixed(1) + '" cy="' + ry.toFixed(1) + '" r="6" fill="' + s.col + '"/>';
      });
      cpd = Math.max(0.4, (2.2 - Math.abs(ap - 26) * 0.02) * (foc > 40 ? 1 : 0.4));
      fluxPct = Math.round(ap * 0.55);
      genSteps = 120000;
      caption = 'Compound apposition eye (Anomalocaris, dragonfly): each tiny facet samples one narrow cone of sky at up to 300 Hz, but small facet apertures hit wave diffraction near ~2 cycles/degree.';
    } else if (optMode === 'mirror') {
      // Concave guanine crystal parabolic mirror at right reflecting back onto stacked distal/proximal retina!
      const mirX = 720, focusRetX = 595;
      svg += '<path d="M ' + (mirX - 30) + ' ' + (cy - 98) + ' Q ' + (mirX + 34) + ' ' + cy + ' ' + (mirX - 30) + ' ' + (cy + 98) + '" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>';
      svg += '<line x1="' + focusRetX + '" y1="' + (cy - 68) + '" x2="' + focusRetX + '" y2="' + (cy + 68) + '" stroke="var(--c-prog)" stroke-width="5" stroke-linecap="round"/>';
      svg += '<text x="' + (mirX + 8) + '" y="' + (cy - 104) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#0284c7">Guanine / gold mirror</text>';
      svg += '<text x="' + focusRetX + '" y="' + (cy - 76) + '" text-anchor="middle" font-size="11" font-weight="700" fill="var(--c-prog)">Stacked retina</text>';

      const defocus = Math.abs(100 - foc) * 0.38 * (ap / 45);
      srcs.forEach((s, idx) => {
        const imgY = cy + (idx === 0 ? -36 : 36);
        [-halfAp * 0.75, 0, halfAp * 0.75].forEach((off, rIdx) => {
          const my = cy + off;
          const mx = mirX + 2 - (off * off) / 260;
          const ry = imgY + (rIdx - 1) * defocus;
          svg += '<path d="M' + s.x + ' ' + s.y + ' L' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' L' + focusRetX + ' ' + ry.toFixed(1) + '" fill="none" stroke="' + s.col + '" stroke-width="1.7" opacity=".82"/>';
        });
        svg += '<ellipse cx="' + focusRetX + '" cy="' + imgY + '" rx="4" ry="' + Math.max(3.5, defocus + 3).toFixed(1) + '" fill="' + s.col + '" opacity=".85"/>';
      });
      cpd = Number((18 / (1 + defocus * 0.5)).toFixed(1));
      fluxPct = Math.min(100, Math.round(ap * 1.25));
      genSteps = 280000;
      caption = 'Biological & space parabolic mirror (Scallop Pecten 200 eyes, spookfish diverticulum, James Webb): bounces wide f/0.9 light with zero chromatic aberration onto a front-facing retina.';
    } else {
      // Patch -> Cup -> Pinhole -> Camera eye continuous Nilsson-Pelger geometry
      const isPatch = optMode === 'patch';
      const isCup = optMode === 'cup';
      const effectiveLens = (optMode === 'camera') ? foc : (foc * 0.65);

      // Draw sclera / cup wall & aperture baffles
      if (isPatch) {
        svg += '<line x1="' + retX + '" y1="' + (cy - 95) + '" x2="' + retX + '" y2="' + (cy + 95) + '" stroke="var(--c-io)" stroke-width="6" stroke-linecap="round"/>';
      } else {
        const cupLeft = isCup ? 610 : eyeX;
        svg += '<path d="M ' + cupLeft + ' ' + (cy - halfAp) + ' C ' + (cupLeft + 30) + ' ' + (cy - 106) + ', ' + (retX - 10) + ' ' + (cy - 102) + ', ' + retX + ' ' + cy +
          ' C ' + (retX - 10) + ' ' + (cy + 102) + ', ' + (cupLeft + 30) + ' ' + (cy + 106) + ', ' + cupLeft + ' ' + (cy + halfAp) + '" fill="none" stroke="var(--ink-2)" stroke-width="4.5"/>';
        // Iris / pinhole baffles
        if (!isCup) {
          svg += '<line x1="' + eyeX + '" y1="' + (cy - 102) + '" x2="' + eyeX + '" y2="' + (cy - halfAp) + '" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>';
          svg += '<line x1="' + eyeX + '" y1="' + (cy + halfAp) + '" x2="' + eyeX + '" y2="' + (cy + 102) + '" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>';
        }
      }

      // Draw graded lens if effectiveLens > 0
      if (effectiveLens > 2 && !isPatch) {
        const lensRx = 10 + (effectiveLens / 130) * 18;
        svg += '<ellipse cx="' + (eyeX + 10) + '" cy="' + cy + '" rx="' + lensRx.toFixed(1) + '" ry="' + Math.max(16, halfAp * 0.96).toFixed(1) + '" fill="#38bdf8" fill-opacity=".38" stroke="#0284c7" stroke-width="2"/>';
      }

      // Trace 5 rays from each source through aperture to retina
      const blurRadius = isPatch ? 72 : Math.abs(1 - effectiveLens / 100) * halfAp * 0.92 + (ap < 12 ? (14 - ap) * 0.8 : 0);
      srcs.forEach((s, idx) => {
        const chiefSlope = (cy - s.y) / (eyeX - s.x);
        const centerRetY = isPatch ? cy : Math.max(cy - 78, Math.min(cy + 78, cy + chiefSlope * (retX - eyeX) * 0.82));
        [-0.85, -0.42, 0, 0.42, 0.85].forEach(frac => {
          const ay = cy + frac * halfAp;
          const ry = isPatch ? (cy + frac * 78) : (centerRetY + frac * (1 - effectiveLens / 100) * halfAp);
          const midX = isPatch ? eyeX : (eyeX + 8);
          svg += '<path d="M' + s.x + ' ' + s.y + ' L' + midX + ' ' + ay.toFixed(1) + ' L' + (retX - 4) + ' ' + ry.toFixed(1) + '" fill="none" stroke="' + s.col + '" stroke-width="1.55" opacity=".78"/>';
        });
        svg += '<ellipse cx="' + (retX - 3) + '" cy="' + centerRetY.toFixed(1) + '" rx="4.5" ry="' + Math.max(3.2, blurRadius).toFixed(1) + '" fill="' + s.col + '" opacity=".85"/>';
      });

      // Retinal intensity inset on far right (x = 775..900)
      svg += '<rect x="772" y="34" width="130" height="208" rx="10" fill="var(--surface)" stroke="var(--line)"/>';
      svg += '<text x="837" y="54" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink-2)">Retinal image</text>';
      const sep = isPatch ? 0 : 42;
      const spotR = Math.max(4, Math.min(48, blurRadius * 0.85 + 3.5));
      const bright = Math.min(1, Math.max(0.14, (ap / 52) * (effectiveLens > 50 ? 1.25 : 0.7)));
      svg += '<circle cx="837" cy="' + (cy - sep) + '" r="' + spotR.toFixed(1) + '" fill="#f59e0b" fill-opacity="' + bright.toFixed(2) + '"/>';
      svg += '<circle cx="837" cy="' + (cy + sep) + '" r="' + spotR.toFixed(1) + '" fill="#06b6d4" fill-opacity="' + bright.toFixed(2) + '"/>';
      svg += '<text x="837" y="228" text-anchor="middle" font-size="10.5" fill="var(--ink-3)">' + (spotR < 14 && sep > 0 ? 'Resolved (2 targets!)' : 'Overlapping blur!') + '</text>';

      fluxPct = Math.min(100, Math.round((ap * ap) / (45 * 45) * 45));
      cpd = isPatch ? 0.02 : Number((62 / (1 + blurRadius * 1.45)).toFixed(2));
      genSteps = isPatch ? 0 : isCup ? 75000 : (effectiveLens < 10 ? 165000 : 364000);
      caption = isPatch
        ? 'Stage 1 · Flat opsin patch: tells day from night, but rays from both targets flood every receptor equally—zero spatial image.'
        : isCup
          ? 'Stage 2 · Concave pigment cup (Planaria): walls block oblique rays, giving coarse shadow direction (~0.06 cpd) in ~75,000 generations.'
          : (effectiveLens < 15
            ? 'Stage 3 · Nautilus pinhole trap: narrowing the pupil sharpens spots ONLY by throwing away >95% of photons! Drag the lens slider up to break the trap.'
            : 'Stage 4 · Graded-index camera eye (fish, octopus, eagle, human): a refractive lens bends wide-aperture rays onto one tiny retinal point—both bright AND sharp in <364,000 generations.');
    }

    $('eyeRaySvg').innerHTML = svg;
    $('eyeRayReadout').innerHTML =
      '<span><b>Estimated acuity:</b> ' + cpd + ' cycles/deg · <b>Relative photon catch:</b> ' + fluxPct + '% · <b>Nilsson–Pelger evolutionary path:</b> ~' + genSteps.toLocaleString('en-US') + ' generations</span>' +
      '<span style="color:var(--ink);font-size:13.5px">' + esc(caption) + '</span>';
  }

  /* ---------- 02. 10-Dimension Cards & Deep-Time Chart ---------- */
  let activeDim = 'all';

  function renderDimCards() {
    $('eyeDimCards').innerHTML = DIMS.map((d, idx) =>
      '<button type="button" class="dim-card" data-pick-dim="' + d.key + '" aria-pressed="' + (activeDim === d.key) + '" style="--dc:' + d.color + '">' +
      '<div class="dim-card-top"><span class="dim-num">Dimension ' + (idx + 1) + '</span><span class="dim-span">' + esc(d.span) + '</span></div>' +
      '<h3>' + esc(d.title) + '</h3>' +
      '<p>' + esc(d.desc) + '</p></button>'
    ).join('');
  }

  function selectDim(key, focusTab) {
    activeDim = key;
    const tabs = [...$('eyeTabs').querySelectorAll('[role="tab"]')];
    tabs.forEach(btn => {
      const on = btn.dataset.dim === key;
      btn.setAttribute('aria-selected', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on) {
        $('eyeTabPanel').setAttribute('aria-labelledby', btn.id);
        try { btn.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' }); } catch (e) { /* ignore */ }
        if (focusTab) btn.focus();
      }
    });
    renderDimCards();
    drawDeepTimeChart();
  }

  $('eyeTabs').addEventListener('click', ev => {
    const b = ev.target.closest('[role="tab"]');
    if (b) selectDim(b.dataset.dim, false);
  });
  $('eyeTabs').addEventListener('keydown', ev => {
    const tabs = [...$('eyeTabs').querySelectorAll('[role="tab"]')];
    const cur = tabs.indexOf(document.activeElement);
    if (cur < 0) return;
    let nx = -1;
    if (ev.key === 'ArrowRight') nx = (cur + 1) % tabs.length;
    else if (ev.key === 'ArrowLeft') nx = (cur - 1 + tabs.length) % tabs.length;
    else if (ev.key === 'Home') nx = 0;
    else if (ev.key === 'End') nx = tabs.length - 1;
    if (nx >= 0) { ev.preventDefault(); selectDim(tabs[nx].dataset.dim, true); }
  });
  $('eyeDimCards').addEventListener('click', ev => {
    const c = ev.target.closest('[data-pick-dim]');
    if (c) {
      selectDim(c.dataset.pickDim, false);
      $('eyeTabs').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  function xOfMya(mya) {
    const Lm = 76, Rm = 28, W = 1000;
    const hi = Math.log10(3000 + 0.001), lo = Math.log10(0.001);
    const v = Math.log10(Math.max(0, mya) + 0.001);
    return Lm + (hi - v) / (hi - lo) * (W - Lm - Rm);
  }

  function drawDeepTimeChart() {
    const svg = $('eyeTimeSvg');
    const W = 1000, H = 390, T = 26, B = 52, Lm = 76, Rm = 28;
    const xTicks = [
      [2700, '2.7 Ga'], [1500, '1.5 Ga (Eyespot)'], [518, '518 Ma (Cambrian)'],
      [365, '365 Ma (Air)'], [185, '185 Ma'], [32, '32 Ma (Eagle)'], [0.3, '300 ka'], [0, 'Today']
    ];
    let out = '';
    xTicks.forEach(([t, lbl]) => {
      const x = xOfMya(t);
      out += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--line)" stroke-dasharray="3 3"/>';
      out += '<text x="' + x.toFixed(1) + '" y="' + (H - 28) + '" text-anchor="middle" font-size="11" fill="var(--ink-3)">' + esc(lbl) + '</text>';
    });

    if (activeDim === 'all') {
      $('eyeDimIntro').innerHTML =
        '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px">' +
        '<div><h3 style="margin:0;font-size:1.15rem">Composite 10-Dimension Vision Score (0–100) across 2.7 billion years</h3>' +
        '<p style="margin:4px 0 0;font-size:14px;color:var(--ink-2)">Notice the Cambrian explosion of optics (~541–515 Ma), Tiktaalik’s water-to-air jump (365 Ma), blind cavefish purposefully dropping back near zero to save 15% energy, and eagles/humans/JWST at the top.</p></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px">' +
        Object.entries(GROUP_COLORS).map(([g, col]) => '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:9px;height:9px;border-radius:50%;background:' + col + '"></i>' + esc(g) + '</span>').join('') +
        '</div></div>';

      for (let g = 0; g <= 5; g++) {
        const val = g * 20;
        const y = (H - B) - (val / 100) * (H - T - B);
        out += '<line x1="' + Lm + '" x2="' + (W - Rm) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)"/>';
        out += '<text x="' + (Lm - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="11.5" fill="var(--ink-3)">' + val + '</text>';
      }

      const sortedByAge = ROWS.slice().sort((a, b) => b._t - a._t);
      let best = -1, envPts = [];
      sortedByAge.forEach(r => {
        if (r._comp >= best) {
          best = r._comp;
          envPts.push([xOfMya(r._t), (H - B) - (r._comp / 100) * (H - T - B)]);
        }
      });
      if (envPts.length > 1) {
        out += '<path d="' + envPts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="var(--c-io)" stroke-width="2.2" stroke-opacity=".55" stroke-dasharray="5 4"/>';
      }

      const callouts = new Set([
        'cyanobacteria-micro-lens', 'algal-channelrhodopsin-eyespot', 'anomalocaris-cambrian-compound',
        'mantis-shrimp-16-channel', 'dragonfly-300hz-pursuit', 'tiktaalik-water-to-air-leap',
        'ichthyosaur-giant-sea-eye', 'eagle-140cpd-dual-fovea', 'blind-cavefish-regression',
        'human-foveal-edge-retina', 'jwst-cryo-infrared-eye'
      ]);
      ROWS.forEach(r => {
        const x = xOfMya(r._t);
        const y = (H - B) - (r._comp / 100) * (H - T - B);
        const col = GROUP_COLORS[r.lineage_group] || '#6b46c1';
        out += '<g class="e-pt" data-slug="' + esc(r.slug) + '" tabindex="0" role="button" aria-label="' + esc(r.species_or_system + ': 10D score ' + r._comp + ' at ' + fmtAge(r._t)) + '" style="cursor:pointer">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6.2" fill="' + col + '" stroke="var(--surface)" stroke-width="1.8"/>' +
          (callouts.has(r.slug) ? '<text x="' + (x > 860 ? x - 9 : x + 9).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="' + (x > 860 ? 'end' : 'start') + '" font-size="10.8" font-weight="700" fill="var(--ink)">' + esc(r.species_or_system.split(' (')[0]) + '</text>' : '') +
          '</g>';
      });
    } else {
      const D = DIM_BY_KEY[activeDim];
      $('eyeDimIntro').innerHTML =
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
      valid.forEach(r => {
        const v = D.val(r);
        const lv = Math.max(loL, Math.min(hiL, Math.log10(v)));
        const x = xOfMya(r._t);
        const y = (H - B) - ((lv - loL) / (hiL - loL)) * (H - T - B);
        const col = GROUP_COLORS[r.lineage_group] || '#6b46c1';
        const labelMe = ['algal-channelrhodopsin-eyespot', 'nautilus-pinhole-eye', 'mantis-shrimp-16-channel', 'dragonfly-300hz-pursuit', 'giant-squid-270mm-eye', 'eagle-140cpd-dual-fovea', 'human-foveal-edge-retina', 'neuromorphic-event-camera', 'jwst-cryo-infrared-eye'].includes(r.slug);
        out += '<g class="e-pt" data-slug="' + esc(r.slug) + '" tabindex="0" role="button" aria-label="' + esc(r.species_or_system + ': ' + D.fmt(r)) + '" style="cursor:pointer">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6.2" fill="' + col + '" stroke="var(--surface)" stroke-width="1.8"/>' +
          (labelMe ? '<text x="' + (x > 860 ? x - 9 : x + 9).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="' + (x > 860 ? 'end' : 'start') + '" font-size="10.8" font-weight="700" fill="var(--ink)">' + esc(r.species_or_system.split(' (')[0]) + '</text>' : '') +
          '</g>';
      });
    }

    out += '<text x="500" y="' + (H - 7) + '" text-anchor="middle" font-size="11.5" fill="var(--ink-3)">Deep time (logarithmic scale from 2.7 billion years ago to 2026 — click any circle for full 10D profile)</text>';
    svg.innerHTML = out;
  }

  $('eyeTimeSvg').addEventListener('pointerover', ev => {
    const g = ev.target.closest('.e-pt');
    if (!g) return;
    const r = BY_SLUG[g.dataset.slug];
    if (!r) return;
    const D = activeDim === 'all' ? null : DIM_BY_KEY[activeDim];
    $('eyeChartReadout').innerHTML =
      '<span><b>' + esc(r.species_or_system) + '</b> (' + esc(fmtAge(r._t)) + ') — ' +
      esc(D ? D.fmt(r) : ('Composite 10D score ' + r._comp + ' / 100 · ' + r.plain_title)) + '</span>' +
      '<button type="button" class="btn sm ghost" data-open-eye="' + esc(r.slug) + '">Inspect 10D card →</button>';
  });
  $('eyeTimeSvg').addEventListener('click', ev => {
    const g = ev.target.closest('.e-pt');
    if (g && BY_SLUG[g.dataset.slug]) openStageModal(BY_SLUG[g.dataset.slug]);
  });
  $('eyeTimeSvg').addEventListener('keydown', ev => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      const g = ev.target.closest('.e-pt');
      if (g && BY_SLUG[g.dataset.slug]) { ev.preventDefault(); openStageModal(BY_SLUG[g.dataset.slug]); }
    }
  });
  $('eyeChartReadout').addEventListener('click', ev => {
    const b = ev.target.closest('[data-open-eye]');
    if (b && BY_SLUG[b.dataset.openEye]) openStageModal(BY_SLUG[b.dataset.openEye]);
  });

  /* ---------- 03. 3-Eye 10-Axis Radar Comparator ---------- */
  const CMP_COLORS = ['#0ea5e9', '#d946ef', '#f59e0b'];
  let cmpSlugs = ['human-foveal-edge-retina', 'eagle-140cpd-dual-fovea', 'mantis-shrimp-16-channel'];

  function renderPickers() {
    $('eyePickers').innerHTML = [0, 1, 2].map(k =>
      '<div class="org-pick-field" style="--pc:' + CMP_COLORS[k] + '">' +
      '<label for="epick-' + k + '">Eye / Sensor ' + (k + 1) + '</label>' +
      '<select id="epick-' + k + '" data-slot="' + k + '">' +
      ROWS.map(r => '<option value="' + esc(r.slug) + '"' + (r.slug === cmpSlugs[k] ? ' selected' : '') + '>' + esc(r.species_or_system + ' (' + fmtAge(r._t) + ')') + '</option>').join('') +
      '</select></div>'
    ).join('');
    $('eyePickers').querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', () => {
        cmpSlugs[Number(sel.dataset.slot)] = sel.value;
        drawRadarAndTable();
      });
    });
  }

  document.querySelectorAll('[data-epreset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const parts = btn.dataset.epreset.split(',');
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

    [2, 4, 6, 8, 10].forEach(lvl => {
      const rr = (lvl / 10) * R;
      const pts = DIMS.map((_, i) => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / 10;
        return (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
      }).join(' ');
      svg += '<polygon points="' + pts + '" fill="none" stroke="var(--line)" stroke-width="' + (lvl === 10 ? 1.5 : 1) + '"/>';
    });

    DIMS.forEach((d, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / 10;
      const x2 = cx + R * Math.cos(a), y2 = cy + R * Math.sin(a);
      const lx = cx + (R + 26) * Math.cos(a), ly = cy + (R + 22) * Math.sin(a);
      const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="var(--line-2)"/>';
      svg += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="' + anchor + '" font-size="11.5" font-weight="700" fill="var(--ink-2)">' + (i + 1) + '·' + esc(d.short) + '</text>';
    });

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

    picks.forEach((r, idx) => {
      const y = 434;
      const x = 24 + idx * 168;
      svg += '<rect x="' + x + '" y="' + (y - 9) + '" width="12" height="12" rx="3" fill="' + CMP_COLORS[idx] + '"/>' +
        '<text x="' + (x + 17) + '" y="' + y + '" font-size="11.5" font-weight="700" fill="var(--ink)">' + esc(r.species_or_system.split(' (')[0].slice(0, 20)) + '</text>';
    });
    $('eyeRadarSvg').innerHTML = svg;

    $('eyeCmpHead').innerHTML = '<tr><th scope="col">Dimension</th>' +
      picks.map((r, idx) => '<th scope="col" style="border-bottom:3px solid ' + CMP_COLORS[idx] + '">' + esc(r.species_or_system.split(' (')[0]) + '</th>').join('') +
      '</tr>';
    $('eyeCmpBody').innerHTML =
      '<tr><th scope="row">Composite 10D</th>' + picks.map(r => '<td><b>' + r._comp + ' / 100</b></td>').join('') + '</tr>' +
      DIMS.map((d, i) =>
        '<tr><th scope="row">' + (i + 1) + ' · ' + esc(d.short) + '</th>' +
        picks.map(r => '<td>' + esc(d.fmt(r)) + '</td>').join('') + '</tr>'
      ).join('') +
      '<tr><th scope="row">Toolkit</th>' + picks.map(r => '<td>' + esc(r.genetic_toolkit) + '</td>').join('') + '</tr>';
  }

  /* ---------- 05. Progressive-Enhanced Sortable 36-Row Table ---------- */
  const tbody = $('eyeTableBody');
  const sortTable = $('eyeSortTable');
  const sortStatus = $('eyeSortStatus');
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  function buildInitialTableRows() {
    const sorted = ROWS.slice().sort((a, b) => b._t - a._t);
    tbody.innerHTML = sorted.map(r => {
      const col = GROUP_COLORS[r.lineage_group] || '#6b46c1';
      return '<tr data-slug="' + esc(r.slug) + '" data-group="' + esc(r.lineage_group) + '">' +
        '<th scope="row" data-value="' + esc(r.species_or_system) + '">' +
        '<button type="button" class="sto-paper" data-open-eye="' + esc(r.slug) + '" style="font-weight:700;text-decoration:none;color:var(--ink)">' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + col + ';margin-right:6px" aria-hidden="true"></span>' +
        esc(r.species_or_system) + '</button>' +
        '<div style="font-size:11.5px;font-weight:500;color:var(--ink-3);margin-top:2px">' + esc(r.optical_type) + '</div></th>' +
        '<td class="num" data-value="' + r._t + '">' + esc(fmtAge(r._t)) + '</td>' +
        '<td class="num" data-value="' + r._diam + '">' + X.plain(r._diam) + ' · f/' + r._fn + '</td>' +
        '<td class="num" data-value="' + r._rec + '">' + (r._rec > 0 ? X.sci(r._rec) : '0') + '</td>' +
        '<td class="num" data-value="' + r._cpd + '">' + (r._cpd > 0 ? X.plain(r._cpd) : '0') + '</td>' +
        '<td class="num" data-value="' + r._chan + '">' + r._chan + (r.polarization_mode !== 'None' ? ' + Pol' : '') + '</td>' +
        '<td class="num" data-value="' + r._hz + '">' + (r._hz > 0 ? X.plain(r._hz) : '—') + '</td>' +
        '<td class="num" data-value="' + r._dr + '">' + (r._dr > 0 ? '10' + X.sup(Math.round(r._dr)) + '×' : '—') + '</td>' +
        '<td class="num" data-value="' + r._rng + '">' + r._stereo + '° · ' + esc(fmtRangeM(r._rng)) + '</td>' +
        '<td class="num" data-value="' + r._ratio + '">' + X.plain(r._ratio) + ':1</td>' +
        '<td class="num" data-value="' + r._mw + '">' + X.sci(r._mw) + '</td>' +
        '<td data-value="' + esc(r.opsin_class) + '" style="max-width:190px;font-size:12px">' + esc(r.opsin_class) + '</td>' +
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
    sortStatus.textContent = 'Sorted by ' + button.textContent.trim() + ', ' + direction + ', ' + visibleCount + ' eyes shown';
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
    const q = ($('eyeSearch').value || '').trim().toLowerCase();
    const grp = $('eyeGroupSel').value;
    let shown = 0;
    for (const tr of tbody.rows) {
      const r = BY_SLUG[tr.dataset.slug];
      const matchGrp = grp === 'all' || tr.dataset.group === grp;
      const hay = r ? (r.species_or_system + ' ' + r.milestone + ' ' + r.optical_type + ' ' + r.plain_title + ' ' + r.opsin_class + ' ' + r.genetic_toolkit).toLowerCase() : '';
      const ok = matchGrp && (!q || hay.includes(q));
      tr.hidden = !ok;
      if (ok) shown++;
    }
    sortStatus.textContent = shown + ' of ' + tbody.rows.length + ' eye stages shown';
  }
  $('eyeSearch').addEventListener('input', applyTableFilter);
  $('eyeGroupSel').addEventListener('change', applyTableFilter);
  tbody.addEventListener('click', ev => {
    const b = ev.target.closest('[data-open-eye]');
    if (b && BY_SLUG[b.dataset.openEye]) openStageModal(BY_SLUG[b.dataset.openEye]);
  });

  /* ---------- Stage Detail Modal (<dialog closedby="any">) ---------- */
  const modal = $('eyeStageModal');
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
      '<h1 id="eyeModalTitle" style="font-size:1.45rem;margin:4px 0 0">' + esc(r.plain_title) + '</h1>' +
      '<p style="margin:4px 0 0;font-size:14px;color:var(--ink-3)"><b>' + esc(r.species_or_system) + '</b> · ' + esc(r.milestone) + '</p></div>' +
      '<form method="dialog"><button value="close" class="btn sm ghost" autofocus aria-label="Close stage details">Close ✕</button></form></div>' +
      '<p style="font-size:15.5px;line-height:1.5;margin:0">' + esc(r.plain_text) + '</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">' +
      DIMS.map((d, i) => '<div style="padding:8px 10px;border-radius:var(--r-md);background:var(--surface-2);font-size:13px">' +
        '<div style="font-weight:700;color:var(--ink-3);font-size:11px;text-transform:uppercase">' + (i + 1) + ' · ' + esc(d.short) + ' (' + r._scores[i].toFixed(1) + '/10)</div>' +
        '<div style="font-weight:700;color:var(--ink);margin-top:2px">' + esc(d.fmt(r)) + '</div></div>').join('') +
      '</div>' +
      '<p style="font-size:13px;color:var(--ink-2);margin:0"><b>Genetic &amp; optical toolkit:</b> ' + esc(r.genetic_toolkit) + '<br>' +
      '<b>Sources:</b> ' + esc(r.source) + (r.note ? ' — ' + esc(r.note) : '') + '</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      '<a class="btn sm" href="journey.html#' + esc(r.epoch_id) + '">Visit stop on the Journey →</a>' +
      (inv ? '<a class="btn sm ghost" href="tree.html#' + esc(r.inv) + '">' + esc(inv.label) + ' in the Tree →</a>' : '') +
      '<a class="btn sm ghost" href="data.html#eyes10d">Open in Data Lab →</a></div></div>';
    if (modal.showModal) modal.showModal();
    else modal.setAttribute('open', '');
  }

  /* ---------- Init ---------- */
  drawRayBench();
  renderDimCards();
  drawDeepTimeChart();
  renderPickers();
  drawRadarAndTable();
  buildInitialTableRows();
})();
