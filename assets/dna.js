/* Why DNA Is Really a Computer — and How Simple Local Rules Compute (dna.html)
   Interactive E. coli lacZYA AND-NOT gate, 70S ribosome codon stepper,
   Wolfram 1D Cellular Automaton + Winfree DX DNA Sticky-End Tile Simulator,
   and live 22-system thermodynamic benchmark from window.SI_LEDGERS.automata. */
(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('dna');
  const $ = id => document.getElementById(id);
  const esc = X.esc, sci = X.sci;
  const E = X.E, eNow = E[E.length - 1];
  const LED = window.SI_LEDGERS || {};
  const AUTO = LED.automata || { columns: [], rows: [] };

  /* ---------- Hero KPIs ---------- */
  const autoCount = AUTO.rows.length || 22;
  if ($('inlineHcopy')) $('inlineHcopy').textContent = sci(eNow.hcopy) + ' bits';
  $('dnaKpis').innerHTML = [
    {
      c: 'var(--c-store)',
      sub: 'Quaternary storage density',
      val: '2 bits / base pair',
      txt: '2.4×10²¹ bits/cm³ crystal limit (13M× 3D NAND); ' + sci(eNow.hcopy) + ' bits alive across Earth today.'
    },
    {
      c: 'var(--c-power)',
      sub: 'Proofreading energy',
      val: '~20× Landauer floor',
      txt: '5.7×10⁻²⁰ J per copied DNA base (2.2×10⁻¹⁰ error) vs. ~2.5×10⁸× Landauer in a GPU tensor op.'
    },
    {
      c: 'var(--c-make)',
      sub: 'Minimal universal local rule',
      val: 'Rule 110 · 8 bits',
      txt: '1D 2-state 3-neighbor cellular automaton proved Turing-complete—and executed by 355 DNA tiles.'
    },
    {
      c: 'var(--c-cpu)',
      sub: 'Sourced systems on this page',
      val: autoCount + ' benchmarks',
      txt: '8 living genomic compilers, 3 biological skin/shell CAs, 5 formal CAs & 6 lab DNA computers.'
    }
  ].map(k => '<div class="dna-kpi" style="--kc:' + k.c + '"><span class="sub">' + esc(k.sub) + '</span><b>' + esc(k.val) + '</b><span>' + esc(k.txt) + '</span></div>').join('');

  /* ==========================================================================
     LAB 1A: E. COLI LAC OPERON (AND-NOT PROMOTER GATE)
     ========================================================================== */
  let hasLactose = true, hasGlucose = false, leakPct = 1;

  function renderOperon() {
    $('btnLactose').setAttribute('aria-pressed', String(hasLactose));
    $('btnGlucose').setAttribute('aria-pressed', String(hasGlucose));
    $('lacPill').textContent = hasLactose ? '1 · PRESENT' : '0 · ABSENT';
    $('gluPill').textContent = hasGlucose ? '1 · PRESENT' : '0 · ABSENT';
    $('lacDesc').textContent = hasLactose
      ? 'Allolactose binds LacI → repressor lifts off lacO DNA'
      : 'Active LacI tetramer clamps lacO → blocks RNA Polymerase';
    $('gluDesc').textContent = hasGlucose
      ? 'Low cAMP → CRP stays inactive (weak promoter recruitment)'
      : 'High cAMP → CRP–cAMP bends DNA & recruits RNA Polymerase';
    $('leakOut').textContent = leakPct + '%';

    const repressorBound = !hasLactose;
    const crpActive = !hasGlucose;
    let ratePct, gateState, gateHeadline;
    if (!repressorBound && crpActive) {
      ratePct = 100;
      gateState = 'LOGIC 1 · FULL TRANSCRIPTION (100%)';
      gateHeadline = 'Both conditions met (Lactose = 1 AND NOT Glucose = 1): CRP–cAMP recruits RNA Polymerase and lacO is clear, transcribing lacZ, lacY and lacA at full speed.';
    } else if (!repressorBound && !crpActive) {
      ratePct = Math.max(3, leakPct + 2);
      gateState = 'LOGIC 0 · BASAL DRIP (~' + ratePct + '%)';
      gateHeadline = 'Operator lacO is open, but because glucose is available cAMP stays low—CRP does not recruit RNA Polymerase, so transcription stays near basal levels until glucose runs out.';
    } else {
      ratePct = leakPct;
      gateState = 'LOGIC 0 · REPRESSED (' + (leakPct ? '~' + leakPct + '% thermal leak' : '0%理想') + ')';
      gateHeadline = 'LacI repressor physically straddles the lacO operator site on DNA, blocking RNA Polymerase from advancing' + (leakPct > 0 ? ' except during brief ' + leakPct + '% thermal unbinding events (which let LacY permease exist to detect future lactose!).' : '.');
    }

    const svg = $('operonSvg');
    const rnaActive = ratePct >= 50;
    const basalOnly = !rnaActive && ratePct > 0;
    svg.innerHTML =
      '<rect x="16" y="88" width="528" height="22" rx="5" fill="var(--surface)" stroke="var(--line-2)" stroke-width="1.5"/>' +
      // DNA locus segments
      '<rect x="28" y="88" width="96" height="22" fill="color-mix(in srgb,var(--c-power) 24%,var(--surface))" stroke="var(--c-power)" stroke-width="1.2"/>' +
      '<text x="76" y="103" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">CAP site</text>' +
      '<rect x="132" y="88" width="108" height="22" fill="color-mix(in srgb,var(--c-prog) 24%,var(--surface))" stroke="var(--c-prog)" stroke-width="1.2"/>' +
      '<text x="186" y="103" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">Promoter</text>' +
      '<rect x="248" y="88" width="92" height="22" fill="color-mix(in srgb,var(--crisis) 20%,var(--surface))" stroke="var(--crisis)" stroke-width="1.2"/>' +
      '<text x="294" y="103" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">lacO operator</text>' +
      '<rect x="348" y="88" width="184" height="22" fill="color-mix(in srgb,var(--c-store) 22%,var(--surface))" stroke="var(--c-store)" stroke-width="1.2"/>' +
      '<text x="440" y="103" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">lacZ · lacY · lacA genes</text>' +
      // CRP-cAMP state
      (crpActive
        ? '<rect x="34" y="42" width="84" height="36" rx="8" fill="var(--c-power)"/><text x="76" y="64" text-anchor="middle" font-size="11" font-weight="700" fill="var(--on-power)">CRP–cAMP ✓</text><path d="M118 60 Q135 60 142 74" fill="none" stroke="var(--c-power)" stroke-width="2.2"/>'
        : '<rect x="34" y="24" width="84" height="30" rx="8" fill="var(--surface)" stroke="var(--line-2)" stroke-dasharray="4 3"/><text x="76" y="43" text-anchor="middle" font-size="10.5" fill="var(--ink-3)">CRP unbound</text>') +
      // RNA Polymerase state
      '<ellipse cx="186" cy="' + (rnaActive ? '64' : '46') + '" rx="46" ry="20" fill="' + (rnaActive ? 'var(--l-chem)' : 'var(--surface)') + '" stroke="var(--l-chem)" stroke-width="2"/>' +
      '<text x="186" y="' + (rnaActive ? '68' : '50') + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + (rnaActive ? '#ffffff' : 'var(--ink-2)') + '">RNA Pol</text>' +
      // LacI Repressor state
      (repressorBound
        ? '<rect x="252" y="46" width="84" height="42" rx="8" fill="var(--crisis)"/><text x="294" y="66" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff">LacI BLOCK</text><text x="294" y="80" text-anchor="middle" font-size="9.5" fill="#ffffff">clamped to DNA</text>'
        : '<g><rect x="252" y="16" width="90" height="32" rx="8" fill="var(--surface)" stroke="var(--line-2)"/><text x="297" y="36" text-anchor="middle" font-size="10.5" fill="var(--ink-2)">LacI + lactose ↑</text></g>') +
      // Output mRNA wave
      (rnaActive
        ? '<path d="M356 132 q14 -10 28 0 t28 0 t28 0 t28 0 t28 0 t28 0" fill="none" stroke="var(--c-store)" stroke-width="3"/><text x="440" y="162" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">100% mRNA burst (~30 transcripts/min)</text>'
        : basalOnly
          ? '<path d="M362 134 q14 -4 28 0 t28 0" fill="none" stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="4 3"/><text x="440" y="162" text-anchor="middle" font-size="11.5" fill="var(--ink-2)">~' + ratePct + '% basal leak (' + (hasGlucose && hasLactose ? 'glucose catabolite repression' : 'brief thermal unbinding') + ')</text>'
          : '<text x="440" y="156" text-anchor="middle" font-size="11.5" fill="var(--ink-3)">0% mRNA output (strictly blocked)</text>');

    $('operonReadout').innerHTML = '<b>' + esc(gateState.replace('理想', 'ideal')) + '</b><br>' + esc(gateHeadline);

    const rows = [
      [0, 0, 'LacI clamped · CRP active', '~' + leakPct + '% (OFF)'],
      [0, 1, 'LacI clamped · CRP off', '~' + leakPct + '% (OFF)'],
      [1, 1, 'lacO open · CRP off', '~' + Math.max(3, leakPct + 2) + '% (OFF / basal)'],
      [1, 0, 'lacO open · CRP–cAMP bound', '100% (ON · Logic 1)']
    ];
    $('operonTruthBody').innerHTML = rows.map(r => {
      const act = (r[0] === (hasLactose ? 1 : 0)) && (r[1] === (hasGlucose ? 1 : 0));
      return '<tr' + (act ? ' class="active-row"' : '') + '><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + esc(r[2]) + '</td><td>' + esc(r[3]) + '</td></tr>';
    }).join('');
  }

  $('btnLactose').addEventListener('click', () => { hasLactose = !hasLactose; renderOperon(); });
  $('btnGlucose').addEventListener('click', () => { hasGlucose = !hasGlucose; renderOperon(); });
  $('leakSlider').addEventListener('input', ev => { leakPct = Number(ev.target.value); renderOperon(); });
  renderOperon();

  /* ==========================================================================
     LAB 1B: 70S RIBOSOME 3-BASE TAPE TRANSDUCER & MUTATION TESTER
     ========================================================================== */
  const CODON_TABLE = {
    UUU:'Phe',UUC:'Phe',UUA:'Leu',UUG:'Leu',CUU:'Leu',CUC:'Leu',CUA:'Leu',CUG:'Leu',
    AUU:'Ile',AUC:'Ile',AUA:'Ile',AUG:'Met',GUU:'Val',GUC:'Val',GUA:'Val',GUG:'Val',
    UCU:'Ser',UCC:'Ser',UCA:'Ser',UCG:'Ser',CCU:'Pro',CCC:'Pro',CCA:'Pro',CCG:'Pro',
    ACU:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',GCU:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
    UAU:'Tyr',UAC:'Tyr',UAA:'STOP',UAG:'STOP',CAU:'His',CAC:'His',CAA:'Gln',CAG:'Gln',
    AAU:'Asn',AAC:'Asn',AAA:'Lys',AAG:'Lys',GAU:'Asp',GAC:'Asp',GAA:'Glu',GAG:'Glu',
    UGU:'Cys',UGC:'Cys',UGA:'STOP',UGG:'Trp',CGU:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
    AGU:'Ser',AGC:'Ser',AGA:'Arg',AGG:'Arg',GGU:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly'
  };
  const COMP_DNA = { A: 'T', U: 'A', C: 'G', G: 'C' };
  const COMP_RNA = { A: 'U', U: 'A', C: 'G', G: 'C' };

  // Human HBB (beta-globin) N-terminal coding mRNA: AUG GUG CAC CUG ACU CCU GAG GAG AAG UAA
  const WILD_MRNA = 'AUGGUGCACCUGACUCCUGAGGAGAAGUAA';
  let curMrna = WILD_MRNA;
  let mutMode = 'wild';
  let riboIdx = 0;

  function codonsOf(seq) {
    const out = [];
    for (let i = 0; i + 3 <= seq.length; i += 3) {
      const c = seq.slice(i, i + 3);
      out.push({ c, aa: CODON_TABLE[c] || '?' });
    }
    return out;
  }

  function renderRibosome() {
    const cds = codonsOf(curMrna);
    const wildCds = codonsOf(WILD_MRNA);
    if (riboIdx >= cds.length) riboIdx = cds.length - 1;

    // Stop translation at first STOP codon
    let stopAt = cds.findIndex(x => x.aa === 'STOP');
    if (stopAt < 0) stopAt = cds.length - 1;

    $('riboTape').innerHTML = cds.map((item, k) => {
      const changed = !wildCds[k] || wildCds[k].c !== item.c;
      const cls = 'dna-codon' + (k === riboIdx ? ' is-head' : '') + (changed ? ' is-mut' : '');
      return '<button type="button" class="' + cls + '" data-cidx="' + k + '" aria-label="Codon ' + (k + 1) + ': ' + item.c + ' (' + item.aa + ')">' +
        '<span class="bases">' + esc(item.c) + '</span>' +
        '<span class="aa">' + esc(k > stopAt ? '—' : item.aa) + '</span></button>';
    }).join('');

    const cur = cds[riboIdx];
    const dnaTemplate = cur.c.split('').map(b => COMP_DNA[b]).join('');
    const anticodon = cur.c.split('').map(b => COMP_RNA[b]).join('');
    const chain = cds.slice(0, Math.min(riboIdx + 1, stopAt + 1)).map(x => x.aa);

    $('riboSvg').innerHTML =
      // Template DNA 3'->5'
      '<text x="20" y="30" font-size="11.5" font-weight="700" fill="var(--ink-3)">Template DNA (3′→5′)</text>' +
      '<rect x="172" y="14" width="128" height="24" rx="5" fill="var(--surface)" stroke="var(--line-2)"/>' +
      '<text x="236" y="30" text-anchor="middle" font-family="var(--mono)" font-size="14" font-weight="700" fill="var(--ink)">3′-' + esc(dnaTemplate) + '-5′</text>' +
      // mRNA 5'->3'
      '<text x="20" y="68" font-size="11.5" font-weight="700" fill="var(--ink-3)">mRNA codon #' + (riboIdx + 1) + ' (5′→3′)</text>' +
      '<rect x="172" y="52" width="128" height="26" rx="5" fill="color-mix(in srgb,var(--c-store) 18%,var(--surface))" stroke="var(--c-store)" stroke-width="1.6"/>' +
      '<text x="236" y="69" text-anchor="middle" font-family="var(--mono)" font-size="14.5" font-weight="700" fill="var(--ink)">5′-' + esc(cur.c) + '-3′</text>' +
      // 70S Ribosome A/P dome + tRNA
      '<rect x="318" y="14" width="222" height="66" rx="12" fill="color-mix(in srgb,var(--c-make) 15%,var(--surface))" stroke="var(--c-make)" stroke-width="1.8"/>' +
      '<text x="429" y="35" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--ink)">70S Ribosome A-site</text>' +
      '<text x="429" y="54" text-anchor="middle" font-family="var(--mono)" font-size="12.5" fill="var(--ink-2)">' +
      (cur.aa === 'STOP' ? 'Release Factor RF1/RF2 → halt' : 'tRNA anticodon 3′-' + esc(anticodon) + '-5′ → ' + esc(cur.aa)) + '</text>' +
      '<text x="429" y="71" text-anchor="middle" font-size="10.5" fill="var(--ink-3)">~4 GTP/ATP equivalents (~132× Landauer)</text>' +
      // Growing peptide chain
      '<text x="20" y="108" font-size="11.5" font-weight="700" fill="var(--ink-3)">Polypeptide output:</text>' +
      chain.map((aa, idx) => {
        const x = 20 + idx * 52;
        const isStop = aa === 'STOP';
        return '<rect x="' + x + '" y="118" width="46" height="28" rx="6" fill="' + (isStop ? 'var(--crisis)' : 'var(--c-store)') + '"/>' +
          '<text x="' + (x + 23) + '" y="136" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + (isStop ? '#ffffff' : 'var(--on-store)') + '">' + esc(aa) + '</text>';
      }).join('');

    const mutNotes = {
      wild: 'Wild-type human β-globin start tape: every 3-letter codon maps cleanly from Met-Val-His-Leu-Thr-Pro-Glu-Glu-Lys to STOP.',
      wobble: '<b>Error-tolerant Gray-like code (GAG → GAA at codon 7):</b> Flipping the 3rd wobble base still encodes <b>Glu</b> (glutamate). Built-in degeneracy absorbs ~25% of 3rd-position point mutations with zero protein change.',
      sickle: '<b>Single-bit missense flip (GAG → GUG at codon 7):</b> Swapping A→U in the middle position replaces hydrophilic <b>Glu</b> with hydrophobic <b>Val</b>—the exact 1-letter bug behind sickle-cell hemoglobin.',
      frame: '<b>Uncommad frameshift (+1 U inserted inside codon 4):</b> Because the ribosome steps strictly +3 letters with no punctuation commas, inserting one extra letter scrambles every downstream codon!'
    };
    $('riboReadout').innerHTML = '<b>Step ' + (riboIdx + 1) + ' of ' + cds.length + ' · Codon ' + esc(cur.c) + ' → ' + esc(cur.aa) + '</b><br>' + mutNotes[mutMode];
  }

  $('riboTape').addEventListener('click', ev => {
    const b = ev.target.closest('[data-cidx]');
    if (!b) return;
    riboIdx = Number(b.dataset.cidx);
    renderRibosome();
  });
  $('riboStep').addEventListener('click', () => {
    const len = Math.floor(curMrna.length / 3);
    riboIdx = (riboIdx + 1) % len;
    renderRibosome();
  });
  $('riboReset').addEventListener('click', () => { riboIdx = 0; renderRibosome(); });
  $('mutWobble').addEventListener('click', () => {
    curMrna = 'AUGGUGCACCUGACUCCUGAAGAGAAGUAA';
    mutMode = 'wobble'; riboIdx = 6; renderRibosome();
  });
  $('mutSickle').addEventListener('click', () => {
    curMrna = 'AUGGUGCACCUGACUCCUGUGGAGAAGUAA';
    mutMode = 'sickle'; riboIdx = 6; renderRibosome();
  });
  $('mutFrame').addEventListener('click', () => {
    curMrna = 'AUGGUGCACUCUGACUCCUGAGGAGAAGUAA';
    mutMode = 'frame'; riboIdx = 3; renderRibosome();
  });
  $('mutWild').addEventListener('click', () => {
    curMrna = WILD_MRNA;
    mutMode = 'wild'; riboIdx = 0; renderRibosome();
  });
  renderRibosome();

  /* ==========================================================================
     LAB 2: WOLFRAM ELEMENTARY CELLULAR AUTOMATA & WINFREE DNA STICKY-END TILES
     ========================================================================== */
  const PRESETS = {
    '90': {
      rule: 90,
      seed: 'single',
      cls: 'Wolfram Class 2/3 · Additive modulo-2 (Sierpiński fractal)',
      formula: 'next(C) = L XOR R',
      title: 'Rule 90 — Rothemund, Papadakis & Winfree’s 2004 DNA Sierpiński Triangle Crystal',
      desc: 'Each cell’s next state is the exclusive-OR (XOR) of its left and right neighbors. In 2004, Winfree’s Caltech lab synthesized four double-crossover (DX) DNA tiles whose 5-base sticky ends physically compute L XOR R in water, growing fractal Sierpiński triangles at ~1.4% mismatch error.'
    },
    '110': {
      rule: 110,
      seed: 'gliders',
      cls: 'Wolfram Class 4 · Localized gliders & Turing-universal computation',
      formula: 'next(C) = (C OR R) AND NOT (L AND C AND R)',
      title: 'Rule 110 — Cook & Wolfram’s Minimal Universal Computer (Run on 355 DNA Tiles in 2019)',
      desc: 'Sitting right on the phase boundary between rigid crystals and chaos, Rule 110 forms a periodic “ether” background crossed by particle-like gliders whose collisions emulate any Turing machine. In 2019, Damien Woods & Erik Winfree executed Rule 110 inside self-assembling 16-helix DNA nanotubes.'
    },
    '30': {
      rule: 30,
      seed: 'single',
      cls: 'Wolfram Class 3 · Deterministic chaos & computational irreducibility',
      formula: 'next(C) = L XOR (C OR R)',
      title: 'Rule 30 — Deterministic Randomness & the Cone-Snail Shell Pattern',
      desc: 'From one single active cell, Rule 30’s left side looks striped while its center and right explode into aperiodic triangles with no shortcut formula—mirroring the pigment calcium-carbonate shell grown row-by-row by the marine snail Conus textile.'
    },
    '184': {
      rule: 184,
      seed: 'traffic',
      cls: 'Particle-conserving transport & majority density classifier',
      formula: 'next(C) = (L AND NOT C) OR (C AND R)',
      title: 'Rule 184 — Ribosome mRNA Traffic Flow & Density Classification',
      desc: 'Every 1 hops one step to the right whenever the next site is empty (0)—the exact discrete TASEP (totally asymmetric simple exclusion process) used in biophysics to model 70S ribosomes queuing along an mRNA strand and kinesin motors walking along microtubules.'
    },
    'custom': {
      rule: 110,
      seed: 'single',
      cls: 'Custom 8-bit Elementary Automaton (256 total rules)',
      formula: 'Toggle any of the 8 3-cell neighborhoods below',
      title: 'Custom 8-Bit Rule Explorer — Flip Any Bit in the Lookup Table',
      desc: 'Every 1D binary cellular automaton with 3-cell neighborhoods is completely specified by an 8-bit byte (0 to 255). Toggle individual neighborhoods below and watch how tiny 1-bit flips jump between dead uniformity (Class 1), stripes (Class 2), chaos (Class 3), and glider computing (Class 4).'
    }
  };

  // Sticky-end 5-nt DNA pad sequences representing binary bit 0 vs bit 1 on left/right input/output pads
  const PAD_SEQ = {
    L0_top: '5′-AGTCA-3′', L0_bot: '3′-TCAGT-5′',
    L1_top: '5′-GCTAC-3′', L1_bot: '3′-CGATG-5′',
    R0_top: '5′-CATGA-3′', R0_bot: '3′-GTACT-5′',
    R1_top: '5′-TGCGA-3′', R1_bot: '3′-ACGCT-5′'
  };

  let curTabKey = '90';
  let ruleNum = 90;
  let gridW = 71;
  let gridH = 46;
  let seedKind = 'single';
  let noisePct = 0;
  let caGrid = [];
  let caFlipped = [];
  let selR = 8, selC = 35;

  function mulberry32(a) {
    return function () {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildSeedRow(w, kind) {
    const row = new Array(w).fill(0);
    const mid = Math.floor(w / 2);
    if (kind === 'single') {
      row[mid] = 1;
    } else if (kind === 'sparse') {
      row[Math.max(2, Math.floor(w * 0.28))] = 1;
      row[Math.min(w - 3, Math.floor(w * 0.72))] = 1;
    } else if (kind === 'gliders') {
      // Classic Rule 110 ether + right-edge glider perturbations
      const ether = [0,0,0,1,0,0,1,1,0,1,1,1,1,1];
      for (let i = 0; i < w; i++) row[i] = ether[i % 14];
      for (let k = Math.max(0, w - 15); k < w; k++) row[k] = (k % 3 === 0 || k === w - 2) ? 1 : 0;
    } else {
      const rng = mulberry32(421994);
      for (let i = 0; i < w; i++) row[i] = rng() < 0.45 ? 1 : 0;
    }
    return row;
  }

  function simulateCA() {
    gridH = Math.round(gridW * 0.65);
    caGrid = new Array(gridH);
    caFlipped = new Array(gridH);
    caGrid[0] = buildSeedRow(gridW, seedKind);
    caFlipped[0] = new Array(gridW).fill(false);

    const rng = mulberry32(19532004 + ruleNum * 31 + gridW);
    const pErr = noisePct / 100;

    for (let r = 1; r < gridH; r++) {
      const prev = caGrid[r - 1];
      const next = new Array(gridW);
      const flip = new Array(gridW);
      for (let c = 0; c < gridW; c++) {
        const L = prev[(c - 1 + gridW) % gridW];
        const C = prev[c];
        const R = prev[(c + 1) % gridW];
        const idx = (L << 2) | (C << 1) | R;
        let bit = (ruleNum >> idx) & 1;
        let wasErr = false;
        if (pErr > 0 && rng() < pErr) {
          bit ^= 1;
          wasErr = true;
        }
        next[c] = bit;
        flip[c] = wasErr;
      }
      caGrid[r] = next;
      caFlipped[r] = flip;
    }
    selR = Math.max(1, Math.min(gridH - 1, selR));
    selC = Math.max(0, Math.min(gridW - 1, selC));
  }

  function renderRuleBits() {
    const bin = ruleNum.toString(2).padStart(8, '0');
    $('caRuleBadge').textContent = 'Rule ' + ruleNum + ' = ' + bin + '₂';
    let html = '';
    for (let idx = 7; idx >= 0; idx--) {
      const L = (idx >> 2) & 1, C = (idx >> 1) & 1, R = idx & 1;
      const out = (ruleNum >> idx) & 1;
      html += '<button type="button" class="dna-bit-btn' + (out ? ' bit-on' : '') + '" data-bidx="' + idx + '" aria-pressed="' + Boolean(out) + '" aria-label="Neighborhood ' + L + C + R + ' outputs ' + out + '">' +
        '<span class="dna-bit-hood" aria-hidden="true">' +
        '<i class="' + (L ? 'on' : '') + '"></i><i class="' + (C ? 'on' : '') + '"></i><i class="' + (R ? 'on' : '') + '"></i></span>' +
        '<span class="mono" style="font-size:11px;color:var(--ink-3)">' + L + C + R + '</span>' +
        '<span class="dna-bit-out">→ ' + out + '</span></button>';
    }
    $('caRuleBits').innerHTML = html;
  }

  function renderTileInspector() {
    const r = selR, c = selC;
    const prev = caGrid[r - 1];
    const L = prev[(c - 1 + gridW) % gridW];
    const C = prev[c];
    const R = prev[(c + 1) % gridW];
    const idx = (L << 2) | (C << 1) | R;
    const idealOut = (ruleNum >> idx) & 1;
    const actualOut = caGrid[r][c];
    const mismatched = caFlipped[r][c];

    const leftStickyIn = L ? PAD_SEQ.L1_top : PAD_SEQ.L0_top;
    const rightStickyIn = R ? PAD_SEQ.R1_top : PAD_SEQ.R0_top;
    const outSticky = actualOut ? PAD_SEQ.L1_bot : PAD_SEQ.L0_bot;

    $('caTileInspector').innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">' +
      '<span class="eyebrow">Cell &amp; DNA Tile Inspector</span>' +
      '<span class="mono" style="font-size:12px;color:var(--ink-3)">Row t=' + r + ', Col x=' + c + '</span></div>' +
      '<h4>(' + L + ', ' + C + ', ' + R + ') → ' + actualOut + (mismatched ? ' <span style="color:var(--crisis)">[thermal mismatch!]</span>' : '') + '</h4>' +
      '<p>Parent row <span class="mono">t−1</span> reads <b>L=' + L + ', C=' + C + ', R=' + R + '</b> (pattern <span class="mono">' + L + C + R + '₂ = #' + idx + '</span>). Rule ' + ruleNum + ' maps this neighborhood to <b>' + idealOut + '</b>' +
      (mismatched ? ', flipped to <b>' + actualOut + '</b> by Brownian sticky-end misbinding.' : '.') + '</p>' +
      // SVG of Winfree Double-Crossover (DX) DNA Tile with 4 sticky ends
      '<svg viewBox="0 0 300 185" class="dna-svg-frame" role="img" aria-label="Double-crossover DNA tile showing two top 5-base input sticky ends hybridizing to parent bits and two bottom output sticky ends propagating bit ' + actualOut + '">' +
      // Top input pads
      '<rect x="20" y="14" width="116" height="30" rx="5" fill="var(--surface)" stroke="var(--c-power)" stroke-width="1.5"/>' +
      '<text x="78" y="28" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-2)">Left sticky pad (bit ' + L + ')</text>' +
      '<text x="78" y="40" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="var(--ink)">' + leftStickyIn + '</text>' +
      '<rect x="164" y="14" width="116" height="30" rx="5" fill="var(--surface)" stroke="var(--c-power)" stroke-width="1.5"/>' +
      '<text x="222" y="28" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-2)">Right/center pad (' + C + '·' + R + ')</text>' +
      '<text x="222" y="40" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="var(--ink)">' + rightStickyIn + '</text>' +
      // Double-crossover DX core body (two parallel DNA helices with Holliday crossovers)
      '<rect x="44" y="54" width="212" height="68" rx="10" fill="' + (actualOut ? 'color-mix(in srgb,var(--c-store) 20%,var(--surface))' : 'var(--surface)') + '" stroke="' + (mismatched ? 'var(--crisis)' : 'var(--c-store)') + '" stroke-width="2"/>' +
      '<line x1="56" y1="74" x2="244" y2="74" stroke="var(--c-store)" stroke-width="2.2"/>' +
      '<line x1="56" y1="102" x2="244" y2="102" stroke="var(--c-make)" stroke-width="2.2"/>' +
      '<path d="M98 74 L112 102 M112 74 L98 102 M188 74 L202 102 M202 74 L188 102" stroke="var(--ink-3)" stroke-width="1.6"/>' +
      '<text x="150" y="92" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--ink)">DX DNA Tile · Output = ' + actualOut + '</text>' +
      // Bottom output sticky ends
      '<rect x="28" y="132" width="110" height="34" rx="5" fill="var(--surface)" stroke="var(--l-chem)" stroke-width="1.5"/>' +
      '<text x="83" y="146" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-2)">SE output sticky end</text>' +
      '<text x="83" y="159" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="var(--ink)">' + outSticky + '</text>' +
      '<rect x="162" y="132" width="110" height="34" rx="5" fill="var(--surface)" stroke="var(--l-chem)" stroke-width="1.5"/>' +
      '<text x="217" y="146" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-2)">SW output sticky end</text>' +
      '<text x="217" y="159" text-anchor="middle" font-family="var(--mono)" font-size="9.5" fill="var(--ink)">' + outSticky + '</text>' +
      // Connectors
      '<line x1="78" y1="44" x2="78" y2="54" stroke="var(--c-power)" stroke-width="2"/>' +
      '<line x1="222" y1="44" x2="222" y2="54" stroke="var(--c-power)" stroke-width="2"/>' +
      '<line x1="83" y1="122" x2="83" y2="132" stroke="var(--l-chem)" stroke-width="2"/>' +
      '<line x1="217" y1="122" x2="217" y2="132" stroke="var(--l-chem)" stroke-width="2"/>' +
      '</svg>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:space-between;align-items:center">' +
      '<span class="mono" style="font-size:11.5px;color:var(--ink-2)">ΔG° ≈ ' + (mismatched ? '−2.1 k_B T (mispair)' : '−9.4 k_B T (10 matched bp)') + '</span>' +
      '<div style="display:flex;gap:4px">' +
      '<button type="button" class="btn sm ghost" id="nudgeLeft" aria-label="Inspect cell to the left">←</button>' +
      '<button type="button" class="btn sm ghost" id="nudgeDown" aria-label="Inspect next row down">↓</button>' +
      '<button type="button" class="btn sm ghost" id="nudgeRight" aria-label="Inspect cell to the right">→</button>' +
      '</div></div>';

    $('nudgeLeft').addEventListener('click', () => { selC = (selC - 1 + gridW) % gridW; drawCAGrid(); renderTileInspector(); });
    $('nudgeRight').addEventListener('click', () => { selC = (selC + 1) % gridW; drawCAGrid(); renderTileInspector(); });
    $('nudgeDown').addEventListener('click', () => { selR = selR + 1 < gridH ? selR + 1 : 1; drawCAGrid(); renderTileInspector(); });
  }

  function drawCAGrid() {
    const cell = 10;
    const W = gridW * cell;
    const H = gridH * cell;
    const svg = $('caSvg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    let pathsOn = '';
    let pathsErr = '';
    for (let r = 0; r < gridH; r++) {
      const row = caGrid[r];
      const flp = caFlipped[r];
      const y = r * cell;
      for (let c = 0; c < gridW; c++) {
        if (flp[c]) {
          pathsErr += 'M' + (c * cell + 0.6) + ' ' + (y + 0.6) + 'h' + (cell - 1.2) + 'v' + (cell - 1.2) + 'h-' + (cell - 1.2) + 'Z';
        } else if (row[c]) {
          pathsOn += 'M' + (c * cell + 0.6) + ' ' + (y + 0.6) + 'h' + (cell - 1.2) + 'v' + (cell - 1.2) + 'h-' + (cell - 1.2) + 'Z';
        }
      }
    }

    const pL = (selC - 1 + gridW) % gridW;
    const pR = (selC + 1) % gridW;
    const py = (selR - 1) * cell;
    const cy = selR * cell;

    svg.innerHTML =
      '<rect width="' + W + '" height="' + H + '" fill="var(--surface-2)"/>' +
      '<path d="' + pathsOn + '" fill="var(--c-store)"/>' +
      (pathsErr ? '<path d="' + pathsErr + '" fill="var(--crisis)"/>' : '') +
      // Highlight 3 parent cells (L, C, R) and child cell
      '<rect x="' + (pL * cell) + '" y="' + py + '" width="' + cell + '" height="' + cell + '" fill="none" stroke="var(--c-power)" stroke-width="2.2"/>' +
      '<rect x="' + (selC * cell) + '" y="' + py + '" width="' + cell + '" height="' + cell + '" fill="none" stroke="var(--c-power)" stroke-width="2.2"/>' +
      '<rect x="' + (pR * cell) + '" y="' + py + '" width="' + cell + '" height="' + cell + '" fill="none" stroke="var(--c-power)" stroke-width="2.2"/>' +
      '<rect x="' + (selC * cell - 1) + '" y="' + (cy - 1) + '" width="' + (cell + 2) + '" height="' + (cell + 2) + '" fill="none" stroke="var(--l-chem)" stroke-width="2.6"/>';
  }

  function renderPresetHeader() {
    const p = PRESETS[curTabKey] || PRESETS.custom;
    $('caPresetIntro').innerHTML =
      '<span class="eyebrow">' + esc(p.cls) + ' · ' + esc(p.formula) + '</span>' +
      '<h3 style="font-size:1.22rem;margin:0">' + esc(p.title) + '</h3>' +
      '<p style="font-size:14.5px;color:var(--ink-2);margin:0;line-height:1.5">' + esc(p.desc) + '</p>';
    $('caWidthOut').textContent = gridW + ' × ' + Math.round(gridW * 0.65) + ' rows';
    $('caNoiseOut').textContent = noisePct === 0
      ? '0% (exact formal CA)'
      : noisePct.toFixed(1) + '% (' + (Math.abs(noisePct - 1.4) < 0.25 ? '2004 DNA tile crystal rate' : 'thermal tile mismatch') + ')';
  }

  function updateAllCA() {
    simulateCA();
    renderPresetHeader();
    renderRuleBits();
    drawCAGrid();
    renderTileInspector();
  }

  function selectCATab(key, focusTab) {
    curTabKey = key;
    const p = PRESETS[key] || PRESETS.custom;
    if (key !== 'custom') {
      ruleNum = p.rule;
      seedKind = p.seed;
      $('caSeed').value = seedKind;
    }
    const tabs = [...$('caTabs').querySelectorAll('[role="tab"]')];
    tabs.forEach(btn => {
      const on = btn.dataset.rule === key;
      btn.setAttribute('aria-selected', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on) {
        $('caPanel').setAttribute('aria-labelledby', btn.id);
        if (focusTab) btn.focus();
      }
    });
    selR = 8;
    selC = Math.floor(gridW / 2);
    updateAllCA();
  }

  $('caTabs').addEventListener('click', ev => {
    const b = ev.target.closest('[role="tab"]');
    if (b) selectCATab(b.dataset.rule, false);
  });
  $('caTabs').addEventListener('keydown', ev => {
    const tabs = [...$('caTabs').querySelectorAll('[role="tab"]')];
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let nx = -1;
    if (ev.key === 'ArrowRight') nx = (i + 1) % tabs.length;
    else if (ev.key === 'ArrowLeft') nx = (i - 1 + tabs.length) % tabs.length;
    else if (ev.key === 'Home') nx = 0;
    else if (ev.key === 'End') nx = tabs.length - 1;
    if (nx >= 0) {
      ev.preventDefault();
      selectCATab(tabs[nx].dataset.rule, true);
    }
  });

  $('caRuleBits').addEventListener('click', ev => {
    const b = ev.target.closest('[data-bidx]');
    if (!b) return;
    const idx = Number(b.dataset.bidx);
    ruleNum ^= (1 << idx);
    curTabKey = 'custom';
    $('caTabs').querySelectorAll('[role="tab"]').forEach(t => {
      const on = t.dataset.rule === 'custom';
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) $('caPanel').setAttribute('aria-labelledby', t.id);
    });
    updateAllCA();
  });

  $('caSeed').addEventListener('change', ev => { seedKind = ev.target.value; updateAllCA(); });
  $('caWidth').addEventListener('input', ev => { gridW = Number(ev.target.value); selC = Math.floor(gridW / 2); updateAllCA(); });
  $('caNoise').addEventListener('input', ev => { noisePct = Number(ev.target.value); updateAllCA(); });

  $('caSvg').addEventListener('click', ev => {
    const rect = $('caSvg').getBoundingClientRect();
    const xRatio = (ev.clientX - rect.left) / rect.width;
    const yRatio = (ev.clientY - rect.top) / rect.height;
    selC = Math.max(0, Math.min(gridW - 1, Math.floor(xRatio * gridW)));
    selR = Math.max(1, Math.min(gridH - 1, Math.floor(yRatio * gridH)));
    drawCAGrid();
    renderTileInspector();
  });

  updateAllCA();

  /* ==========================================================================
     SECTION 5: BENCHMARK SVG + 22-ROW RESPONSIVE DATA TABLE
     ========================================================================== */
  const cols = AUTO.columns || [];
  const ci = name => cols.indexOf(name);
  const parsedRows = (AUTO.rows || []).map(r => ({
    cat: r[ci('category')] || '',
    milestone: r[ci('milestone')] || '',
    sys: r[ci('representative_system')] || '',
    rule: r[ci('local_rule_or_gate')] || '',
    stepS: Number(r[ci('step_latency_s')] || 0),
    eJ: Number(r[ci('energy_per_op_j')] || 0),
    landauer: Number(r[ci('landauer_multiple_300k')] || 0),
    par: Number(r[ci('parallel_units_typical')] || 0),
    src: r[ci('source')] || '',
    pt: r[ci('plain_title')] || ''
  }));

  function fmtStep(s) {
    if (s >= 86400) return (s / 86400).toFixed(1).replace(/\.0$/, '') + ' days';
    if (s >= 3600) return (s / 3600).toFixed(1).replace(/\.0$/, '') + ' hr';
    if (s >= 60) return (s / 60).toFixed(1).replace(/\.0$/, '') + ' min';
    if (s >= 1) return s + ' s';
    if (s >= 1e-3) return (s * 1e3).toPrecision(2) + ' ms';
    if (s >= 1e-6) return (s * 1e6).toPrecision(2) + ' µs';
    if (s >= 1e-9) return (s * 1e9).toPrecision(2) + ' ns';
    return (s * 1e12).toPrecision(2) + ' ps';
  }

  // Draw head-to-head Landauer multiple horizontal bar chart
  function drawBenchmarkChart() {
    const bench = [
      { label: 'Tandem RNA riboswitch gate (in vivo)', mult: 17.4, c: 'var(--l-chem)', tag: 'Living RNA' },
      { label: 'DNA Polymerase III proofreading head', mult: 19.9, c: 'var(--c-store)', tag: 'Living DNA' },
      { label: 'Winfree DX DNA tile Rule 90 crystal', mult: 27.9, c: 'var(--c-make)', tag: 'Lab DNA CA' },
      { label: 'Benenson–Shapiro FokI DNA automaton', mult: 34.8, c: 'var(--c-make)', tag: 'Lab DNA FSM' },
      { label: 'Woods–Winfree 355-tile Rule 110 DNA CA', mult: 41.8, c: 'var(--c-make)', tag: 'Lab DNA CA' },
      { label: '70S Ribosome codon step (4 NTPs)', mult: 132.0, c: 'var(--c-store)', tag: 'Living RNA/Protein' },
      { label: 'Lv–Fan 24-gate programmable DNA IC (DPGA)', mult: 139.0, c: 'var(--c-make)', tag: 'Lab DNA IC' },
      { label: 'Qian–Winfree 130-strand seesaw circuit', mult: 174.0, c: 'var(--c-make)', tag: 'Lab DNA Gate' },
      { label: 'Mammalian cortical synapse (local vesicle)', mult: 3.48e6, c: 'var(--l-nerve)', tag: 'Brain synapse' },
      { label: 'Apple M4 3 nm Neural Engine (16-core NPU)', mult: 4.60e7, c: 'var(--l-sil)', tag: '3 nm CMOS' },
      { label: 'Datacenter H100 dense FP16 tensor op', mult: 2.47e8, c: 'var(--l-sil)', tag: 'Datacenter GPU' }
    ];

    const W = 920, H = 360, L = 278, R = 108, T = 28, B = 38;
    const PW = W - L - R;
    const maxLog = 9; // 10^0 (Landauer = 1x) to 10^9x
    const xOf = m => L + (Math.log10(Math.max(1, m)) / maxLog) * PW;
    const rowH = (H - T - B) / bench.length;

    let s = '';
    for (let lg = 0; lg <= 9; lg += 1) {
      const x = L + (lg / maxLog) * PW;
      s += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--line)" stroke-dasharray="' + (lg === 0 ? 'none' : '3 3') + '"/>';
      if (lg % 3 === 0 || lg === 1) {
        s += '<text x="' + x.toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="11" font-family="var(--mono)" fill="var(--ink-3)">' + (lg === 0 ? '1× (Landauer)' : '10' + X.sup(lg) + '×') + '</text>';
      }
    }

    bench.forEach((b, k) => {
      const y = T + k * rowH + 4;
      const bh = Math.max(14, rowH - 9);
      const bx = xOf(b.mult);
      s += '<text x="' + (L - 10) + '" y="' + (y + bh * 0.72).toFixed(1) + '" text-anchor="end" font-size="12" font-weight="600" fill="var(--ink)">' + esc(b.label) + '</text>';
      s += '<rect x="' + L + '" y="' + y.toFixed(1) + '" width="' + Math.max(4, bx - L).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="4" fill="' + b.c + '"/>';
      const lbl = b.mult < 1000 ? Math.round(b.mult) + '×' : sci(b.mult) + '×';
      s += '<text x="' + (bx + 7).toFixed(1) + '" y="' + (y + bh * 0.74).toFixed(1) + '" font-size="11.5" font-family="var(--mono)" font-weight="700" fill="var(--ink)">' + lbl + '</text>';
    });

    $('dnaBenchSvg').innerHTML = s;
  }
  drawBenchmarkChart();

  const CATS = [
    { k: 'all', label: 'All ' + parsedRows.length + ' systems', c: 'var(--ink)' },
    { k: '1.', label: 'Living DNA & RNA (8)', c: 'var(--c-store)' },
    { k: '2.', label: 'Biological CAs (3)', c: 'var(--l-chem)' },
    { k: '3.', label: 'Formal & Wolfram CAs (5)', c: 'var(--c-cpu)' },
    { k: '4.', label: 'Engineered DNA circuits (6)', c: 'var(--c-make)' }
  ];
  let curCat = 'all';

  function renderLedgerTable() {
    $('ledgerCats').innerHTML = CATS.map(c =>
      '<button type="button" class="dna-pill" data-cat="' + c.k + '" aria-pressed="' + (c.k === curCat) + '" style="--pc:' + c.c + '"><i></i>' + esc(c.label) + '</button>'
    ).join('');

    const shown = curCat === 'all' ? parsedRows : parsedRows.filter(r => r.cat.startsWith(curCat));
    $('dnaLedgerBody').innerHTML = shown.map(r =>
      '<tr>' +
      '<th scope="row">' + esc(r.milestone) + '<br><small style="font-weight:400;color:var(--ink-2)">' + esc(r.sys) + '</small></th>' +
      '<td>' + esc(r.cat.replace(/^\d+\.\s*/, '')) + '</td>' +
      '<td>' + esc(r.rule) + '</td>' +
      '<td class="num">' + esc(fmtStep(r.stepS)) + '</td>' +
      '<td class="num">' + sci(r.eJ) + '</td>' +
      '<td class="num">' + sci(r.landauer) + '×</td>' +
      '<td class="num">' + sci(r.par) + '</td>' +
      '<td style="font-size:12.5px;color:var(--ink-2)">' + esc(r.src) + '</td>' +
      '</tr>'
    ).join('');
  }

  $('ledgerCats').addEventListener('click', ev => {
    const b = ev.target.closest('[data-cat]');
    if (!b) return;
    curCat = b.dataset.cat;
    renderLedgerTable();
  });
  renderLedgerTable();
})();
