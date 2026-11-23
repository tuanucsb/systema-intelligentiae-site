(function () {
  'use strict';
  const X = window.SIX;
  // the six stories and the book lenses moved to their own page; keep old links working
  const MOVED = /^#((dna|sex|nerves|motors|plants|immunity)-story|stories|books)$/;
  if (MOVED.test(location.hash)) { location.replace('stories.html' + (location.hash === '#stories' ? '' : location.hash)); return; }
  X.chrome('how');
  const $ = id => document.getElementById(id);
  const esc = X.esc;
  const colors = ['io', 'store', 'ram', 'power', 'cpu', 'wire', 'backup', 'net'];

  $('myths').innerHTML = X.MYTHS.map((m, k) => '<article class="myth" id="' + m.id + '" style="--mc:var(--c-' + colors[k % colors.length] + ');--mo:var(--on-' + colors[k % colors.length] + ')">' +
    '<span class="n">Myth ' + (k + 1) + '</span><h3>' + esc(m.title) + '</h3>' +
    '<div class="vs"><div><span class="sub">The popular estimate</span><p class="bad">' + esc(m.myth) + '</p></div><div><span class="sub">What the evidence says</span><p class="good">' + esc(m.measured) + '</p></div></div>' +
    '<p>' + esc(m.why) + '</p>' +
    '<div class="links">' + m.epochs.map(id => { const i = X.IDX[id], st = X.STOP[id]; return '<a href="journey.html#' + id + '">See it at ' + X.fmtShort(X.E[i].t) + ' (' + esc(st ? st.who : X.titleOf(i)) + ') →</a>'; }).join('') + '</div>' +
    '<p class="src">Sources: ' + esc(m.sources) + '</p></article>').join('');

  $('levels').innerHTML = Object.keys(X.EPI).map(key => {
    const lv = X.EPI[key];
    const rows = X.E.filter(e => e.epi === key);
    const range = rows.length ? X.fmtShort(rows[0].t) + (rows.length > 1 ? ' → ' + X.fmtShort(rows[rows.length - 1].t) : '') + ' · ' + rows.length + (rows.length === 1 ? ' moment' : ' moments') : '';
    return '<div class="level"><span class="meter" aria-hidden="true">' + [1, 2, 3, 4].map(n => '<i class="' + (n <= lv.lvl ? 'on' : '') + '"></i>').join('') + '</span>' +
      '<h3>' + lv.label + '</h3><p>' + lv.about + '</p><span class="range">' + range + '</span><code class="x-only mono" style="font-size:12px;color:var(--ink-3)">' + esc(key) + '</code></div>';
  }).join('');

  const GL = {
    cells: 'Every living cell on Earth: bacteria, archaea, plant, fungus and animal cells. Dead wood is not counted.',
    hcopy: 'All the DNA letters in all living cells, counting every copy. Two bits per letter.',
    hdiv: 'Only the unique genetic code, with repeated copies of the same genes removed. Like counting different books, not printed copies.',
    mact: 'Short-lived memory that disappears in seconds to minutes without power: protein switches, nerve firing, computer RAM.',
    cbio: 'Chemical reactions inside cells that process information, per second.',
    cneu: 'Signals passed between nerve cells across all animals, per second.',
    cdig: 'Operations computers actually carry out per second, not their advertised peak.',
    mexo: 'Information stored outside living bodies: stone tools, clay, books, hard drives.',
    ptot: 'All power used by life plus all power used by human technology.',
    grp: 'The largest group that coordinates as one: a biofilm, an ant colony, a city, a planet.'
  };
  const EXTRA_GL = [
    { label: 'Single-system complexity (1 unit)', color: 'var(--s-entity)', sym: 'C_max,entity · ops/s', col: 'c_max_entity_ops_sec',
      text: 'How many operations ONE individual cell, tree, animal or supercomputer processes per second (~850/s in one bacterium vs. ~1.5×10¹⁴/s in one human brain vs. 3×10²⁰/s in one frontier AI cluster).' },
    { label: 'Complexity lead over a microbe', color: 'var(--c-cpu)', sym: 'σ_Gould · digits (log₁₀)', col: 'gould_variance_right_tail',
      text: 'Orders-of-magnitude gap between the most capable single entity alive and a typical bacterium (~17.5 digits in 2026). Tracks complexity growth while most cells remain bacteria.' }
  ];
  $('gloss').innerHTML = X.GAUGES.map(g => '<div class="gloss"><b><span class="dot" style="background:' + g.color + ';margin-right:8px"></span>' + g.label + '</b><p>' + GL[g.k] + (X.COLOF[g.k] ? ' <button type="button" class="num-link" data-num="' + X.COLOF[g.k] + '">Where today’s value comes from</button>' : '') + '</p><code class="x-only">' + g.sym + (g.unit ? ' · ' + g.unit : '') + '</code></div>').join('') +
    EXTRA_GL.map(x => '<div class="gloss"><b><span class="dot" style="background:' + x.color + ';margin-right:8px"></span>' + esc(x.label) + '</b><p>' + esc(x.text) + ' <button type="button" class="num-link" data-num="' + x.col + '">Where today’s value comes from</button> · <a href="atlas.html#systems-db">Browse all systems →</a></p><code class="x-only">' + esc(x.sym) + '</code></div>').join('');

  const EQ = [
    ['1. State of the planet', 'Ψ(t) = ( H_copy, H_div, H_sel, M_active, M_passive, C_biochem, C_neural, C_digital,exec, P_total, Φ_persist )', 'Ten quantities in four unit families, never summed into one score.'],
    ['2. Carbon closure', 'B_total = B_prok + B_wood + B_euk,act + B_animal\n2026:  550 = 77.5 + 380.0 + 90.5 + 2.0   Gt C', 'Wood is closed as its own compartment, so dead tissue is never divided into cells.'],
    ['3. Microbe census', 'm̄_C,prok = f_deep·m_deep + f_oligo·m_oligo + f_surf·m_surf = 25 fg C/cell\n(f = 0.2226, 0.6274, 0.1500)\nN_prok = B_prok / m̄_C,prok = 7.75×10¹⁶ g / 2.5×10⁻¹⁴ g = 3.10×10³⁰ cells', 'Three habitats: deep subsurface, starved soil and dark ocean, active surface.'],
    ['4. DNA: copies, selected, unique', 'H_copy = N_prok·b_prok + N_euk·b_euk = 3.60×10³⁷ bits\nH_sel  = 0.85·H_copy,prok + 0.15·H_copy,euk = 1.84×10³⁷ bits\nH_div  = Σ_clusters(70% identity) 2·L_c·Φ_sel,c = 3.80×10¹² bits\nH_div ≪ H_sel ≤ H_copy   (holds at all 68 epochs)', 'b_prok = 6.0×10⁶ bits per cell; b_euk = 1.92×10⁸ bits per cell; 85% microbial vs. 15% eukaryotic constrained share.'],
    ['5. Nerve signaling', 'C_neural = N_synapses · f̄ = 3.00×10²⁷ × 0.10 Hz = 3.0×10²⁶ events/s', 'Summed bottom-up over nematodes, insects, copepods, fish, birds and mammals; global mean rate is capped by cold-blooded invertebrate metabolism.'],
    ['6. Executed silicon', 'C_digital,exec = Σ_families n_f · peak_f · u_f = 1.89×10²² ops/s\nC_digital,exec / C_neural = 6.3×10⁻⁵', 'u_f is real utilization (~0.60 for datacenter AI accelerators, ~0.15 for client phones and PCs; fleet mean 0.249).'],
    ['7. Power closure', 'P_total = P_bio + P_tech = 65.0 + 19.5 = 84.5 TW\nP_bio = Σ over 6 living compartments ≤ gross primary production (~220–250 TW)', 'The biological budget (14.0 TW microbes + 48.5 TW plants/fungi + 2.5 TW animals) closes beneath solar capture.'],
    ['8. Long tail (Gould)', 'σ_Gould(t) = log₁₀( C_max,entity(t) / 10³ ) = 17.48 digits in 2026\n(17.55 digits relative to the exact 846 ops/s/cell 2026 microbial mean)', 'The most capable single entity moves 17.5 orders of magnitude right while Earth’s modal cell remains a bacterium.'],
    ['9. Persistence', 'Φ = Σ_media M_m · τ_m   split into Φ_bio,lineage, Φ_bio,unpowered, Φ_exo,unpowered', 'Living repair (50 Myr lineage), fossil decay (521 yr bone half-life) and unpowered digital media (3.5–25 yr) follow distinct physics.'],
    ['10. Uncertainty', 'UF₉₅(Y) = P₉₇.₅(Y) / P₂.₅(Y)   from 10,000 joint draws over shared drivers', 'Example: N_prok 95% interval 1.57–6.20×10³⁰ cells (UF₉₅ = 3.95).'],
    ['11. Single-unit Atlas rates', 'C_nerve,1 = N_neurons · s_syn/neu · f_Hz = N_neurons · r_clade\nC_AI,1    = 2 · N_params,act · R_tokens/s     |     C_group = N_members · C_member + C_sil', 'Used across all 703 deduplicated systems in the Atlas (e.g. human cortex: 8.6×10¹⁰ × 1,744 = 1.5×10¹⁴/s).'],
    ['12. Thermodynamic cost per event', 'E_event = P_compartment / C_compartment  ≥  k_B · T · ln 2\n2026 floor (15 °C):  k_B T ln 2 = 2.76×10⁻²¹ J/bit', 'Surface microbe turnover ~4.1×10⁻²¹ J (×1.5 floor); human brain ~1.3×10⁻¹³ J/synapse; 2026 silicon fleet ~4.2×10⁻¹² J/op.']
  ];
  $('eqs').innerHTML = EQ.map(q => '<div class="eq"><h3>' + q[0] + '</h3><pre>' + esc(q[1]) + '</pre><p>' + q[2] + '</p></div>').join('');

  /* ---------- visual calculation architecture & thermodynamic cost scale ---------- */
  const mathDisc = $('mathDisc');
  if (mathDisc) {
    const syncMathDisc = () => {
      if (document.body.classList.contains('expert') || location.hash === '#math') mathDisc.open = true;
    };
    syncMathDisc();
    document.addEventListener('si:expert', syncMathDisc);
    addEventListener('hashchange', syncMathDisc);
  }

  if ($('calcVisuals')) {
    const eNow = X.E[X.N - 1];
    const KB = 1.380649e-23;
    const Tkelvin = (eNow.temp || 15) + 273.15;
    const bitFloor = KB * Tkelvin * Math.LN2;
    const f1 = n => n.toFixed(1);

    // 1. Closure Flow SVG (Inputs -> Equations -> Outputs)
    const LANES = [
      {
        n: '1', col: 'var(--s-chem)',
        inTitle: 'Global biomass survey', inVal: eNow.bio + ' Gt C total', inSub: '77.5 microbes · 380 wood · 90.5 plants · 2.0 animals',
        eqTitle: 'Cell & DNA stoichiometry', eqCode: 'N_prok = B_prok ÷ 25 fg C', eqSub: 'H_DNA = 6 Mb·N_prok + 192 Mb·N_euk (wood = 0 cells)',
        outTitle: 'Cells & genetic store', outVal: X.sci(eNow.cells) + ' cells', outSub: X.sci(eNow.hcopy) + ' DNA bits (' + X.sci(eNow.hsel) + ' selected)'
      },
      {
        n: '2', col: 'var(--s-neuro)',
        inTitle: 'Animal neuron & synapse census', inVal: '3.0×10²⁷ synapses', inSub: '3.4×10²⁴ neurons across worms, arthropods & vertebrates',
        eqTitle: 'Biochemical & synaptic rates', eqCode: 'C_nerve = N_syn × 0.10 Hz', eqSub: 'C_chem = 846·N_prok + 2,000·N_euk /s',
        outTitle: 'Biological throughput', outVal: X.sci(eNow.cneu) + ' nerve/s', outSub: X.sci(eNow.cbio) + ' cell reactions/s'
      },
      {
        n: '3', col: 'var(--s-silicon)',
        inTitle: 'Silicon fleet & archives', inVal: '6.49×10⁹ active chips', inSub: '7.6×10²² peak ops/s · 15 ZB external storage',
        eqTitle: 'Duty cycle & Gould tail', eqCode: 'C_sil = Σ n_f · peak_f · u_f', eqSub: 'ū = 24.9% · σ_Gould = log₁₀(C_max ÷ 10³)',
        outTitle: 'Executed chips & peak unit', outVal: X.sci(eNow.cdig) + ' ops/s', outSub: '1 cluster = ' + X.sci(eNow.cmax) + '/s (+' + eNow.gould.toFixed(1) + ' digits)'
      },
      {
        n: '4', col: 'var(--c-power)',
        inTitle: 'Solar & primary energy flux', inVal: X.watts(eNow.ptot) + ' used', inSub: '65.0 TW biosphere + 19.5 TW human industry',
        eqTitle: 'Thermodynamic Landauer bound', eqCode: '𝔹 = P ÷ (k_B T ln 2)', eqSub: 'k_B T ln 2 = ' + X.sci(bitFloor) + ' J/bit at ' + Math.round(eNow.temp) + ' °C',
        outTitle: 'Closed energy & bit ceiling', outVal: X.sci(eNow.ptot / bitFloor) + ' b/s', outSub: '80 GW chips · 20 GW memory refresh'
      }
    ];

    let flowSvg = '';
    const FW = 1000, FH = 388;
    const X1 = 16, W1 = 286, X2 = 352, W2 = 296, X3 = 698, W3 = 286;
    flowSvg += '<text class="side" x="' + X1 + '" y="18">MEASURED INPUTS (2026)</text>' +
      '<text class="side" x="' + X2 + '" y="18">EQUATIONS</text>' +
      '<text class="side" x="' + X3 + '" y="18">THE NUMBERS WE REPORT</text>';

    LANES.forEach((ln, idx) => {
      const y = 30 + idx * 88, bh = 74, ym = y + bh / 2;
      // Connecting arrows
      flowSvg += '<line x1="' + (X1 + W1) + '" y1="' + ym + '" x2="' + (X2 - 7) + '" y2="' + ym + '" stroke="' + ln.col + '" stroke-width="2.2"/>' +
        '<polygon points="' + (X2 - 9) + ',' + (ym - 4.5) + ' ' + (X2 - 1) + ',' + ym + ' ' + (X2 - 9) + ',' + (ym + 4.5) + '" fill="' + ln.col + '"/>' +
        '<line x1="' + (X2 + W2) + '" y1="' + ym + '" x2="' + (X3 - 7) + '" y2="' + ym + '" stroke="' + ln.col + '" stroke-width="2.2"/>' +
        '<polygon points="' + (X3 - 9) + ',' + (ym - 4.5) + ' ' + (X3 - 1) + ',' + ym + ' ' + (X3 - 9) + ',' + (ym + 4.5) + '" fill="' + ln.col + '"/>';

      // Box 1: Input
      flowSvg += '<rect x="' + X1 + '" y="' + y + '" width="' + W1 + '" height="' + bh + '" rx="8" fill="var(--surface)" stroke="var(--line-2)" stroke-width="1.4"/>' +
        '<rect x="' + X1 + '" y="' + y + '" width="5" height="' + bh + '" rx="2.5" fill="' + ln.col + '"/>' +
        '<text x="' + (X1 + 14) + '" y="' + (y + 20) + '" fill="var(--ink-2)" font-size="12" font-weight="700">' + ln.n + '. ' + esc(ln.inTitle) + '</text>' +
        '<text x="' + (X1 + 14) + '" y="' + (y + 42) + '" fill="var(--ink)" font-family="var(--display)" font-size="16" font-weight="800">' + esc(ln.inVal) + '</text>' +
        '<text x="' + (X1 + 14) + '" y="' + (y + 61) + '" fill="var(--ink-3)" font-size="11.3">' + esc(ln.inSub) + '</text>';

      // Box 2: Equation
      flowSvg += '<rect x="' + X2 + '" y="' + y + '" width="' + W2 + '" height="' + bh + '" rx="8" fill="var(--surface-2)" stroke="' + ln.col + '" stroke-width="1.5"/>' +
        '<text x="' + (X2 + 12) + '" y="' + (y + 19) + '" fill="var(--ink-2)" font-size="11.5" font-weight="700">' + esc(ln.eqTitle) + '</text>' +
        '<text x="' + (X2 + 12) + '" y="' + (y + 41) + '" fill="var(--ink)" font-family="var(--mono)" font-size="13" font-weight="600">' + esc(ln.eqCode) + '</text>' +
        '<text x="' + (X2 + 12) + '" y="' + (y + 61) + '" fill="var(--ink-3)" font-size="11.2">' + esc(ln.eqSub) + '</text>';

      // Box 3: Closed Output
      flowSvg += '<rect x="' + X3 + '" y="' + y + '" width="' + W3 + '" height="' + bh + '" rx="8" fill="var(--surface)" stroke="' + ln.col + '" stroke-width="1.8"/>' +
        '<text x="' + (X3 + 12) + '" y="' + (y + 20) + '" fill="var(--ink-2)" font-size="12" font-weight="700">' + esc(ln.outTitle) + '</text>' +
        '<text x="' + (X3 + 12) + '" y="' + (y + 42) + '" fill="var(--ink)" font-family="var(--display)" font-size="16" font-weight="800">' + esc(ln.outVal) + '</text>' +
        '<text x="' + (X3 + 12) + '" y="' + (y + 61) + '" fill="var(--ink-3)" font-size="11.3">' + esc(ln.outSub) + '</text>';
    });

    // 2. Energy Cost per Operation Thermometer (J/op vs Landauer k_B T ln 2)
    const E_ITEMS = [
      { name: 'Landauer 1-bit physical floor (15 °C)', j: bitFloor, col: 'var(--c-power)', shape: 'hollow', how: 'k_B · T · ln 2 at 288.15 K — minimum heat to erase 1 bit in physics' },
      { name: 'Surface microbe enzyme turnover', j: 4.05e-21, col: 'var(--s-chem)', shape: 'circle', how: '9.42 TW ÷ 2.33×10³³ turnovers/s (includes passive near-equilibrium catalysis)' },
      { name: 'DNA Polymerase III proofreading step', j: 5.7e-20, col: 'var(--c-store)', shape: 'square', how: 'Hopfield–Ninio kinetic proofreading cleavage (~2 NTPs per proofread error check)' },
      { name: 'Single ATP hydrolysis (ΔG_ATP)', j: 8.3e-20, col: 'var(--s-chem)', shape: 'circle', how: 'Standard cellular physiological free energy per ATP molecule (~20–30 k_B T)' },
      { name: 'Plant, fungal & protist cell step', j: 2.68e-19, col: 'var(--act-3)', shape: 'square', how: '48.5 TW non-woody eukaryotic metabolism ÷ 1.81×10³² intracellular events/s' },
      { name: 'Mammalian cortical synapse (local)', j: 1.0e-14, col: 'var(--s-neuro)', shape: 'diamond', how: 'Vesicle release + postsynaptic ion pumping at one grey-matter synapse (Attwell & Laughlin 2001)' },
      { name: 'Whole human brain per synapse signal', j: 20 / 1.5e14, col: 'var(--c-prog)', shape: 'diamond', how: '20 W whole-brain power ÷ 1.5×10¹⁴ synaptic events/s (includes axons, glia & resting leak)' },
      { name: 'AI tensor chip dense math (FP16 MAC)', j: 7.08e-13, col: 'var(--c-cpu)', shape: 'triangle', how: 'Nvidia H100 SXM5 on-chip 16-bit multiply-accumulate (700 W ÷ ~9.9×10¹⁴ sustained ops/s)' },
      { name: '2026 global computer fleet average', j: (eNow.pit || 8e10) / eNow.cdig, col: 'var(--s-silicon)', shape: 'triangle', how: '80 GW world digital IT wall power ÷ 1.89×10²² executed silicon ops/s' },
      { name: 'Off-chip DRAM memory word fetch', j: 2.0e-10, col: 'var(--s-silicon)', shape: 'triangle', how: 'Moving a 64-bit word across off-die DRAM pins (~280× costlier than on-chip tensor math)' }
    ];

    const EW = 1000, EH = 398, EL = 286, ER = 148, ET = 32, EB = 42, EPW = EW - EL - ER;
    const ELO = -21.2, EHI = -9.2;
    const xE = j => EL + (Math.log10(j) - ELO) / (EHI - ELO) * EPW;
    const rowH = (EH - ET - EB) / E_ITEMS.length;
    let eSvg = '';

    [-21, -18, -15, -12, -9].forEach(d => {
      const x = xE(Math.pow(10, d));
      const unitLbl = d === -21 ? '10⁻²¹ J (zJ)' : d === -18 ? '10⁻¹⁸ J (aJ)' : d === -15 ? '10⁻¹⁵ J (fJ)' : d === -12 ? '10⁻¹² J (pJ)' : '10⁻⁹ J (nJ)';
      eSvg += '<line class="grid" x1="' + f1(x) + '" x2="' + f1(x) + '" y1="' + (ET - 6) + '" y2="' + (EH - EB) + '"/>' +
        '<text class="tick" x="' + f1(x) + '" y="' + (ET - 12) + '" text-anchor="middle">' + unitLbl + '</text>';
    });
    const xFloor = xE(bitFloor);
    eSvg += '<line x1="' + f1(xFloor) + '" x2="' + f1(xFloor) + '" y1="' + (ET - 4) + '" y2="' + (EH - EB + 4) + '" stroke="var(--c-power)" stroke-width="2" stroke-dasharray="4 3"/>';

    E_ITEMS.forEach((it, k) => {
      const cy = ET + (k + 0.5) * rowH, x = xE(it.j);
      const mult = it.j / bitFloor;
      const multTxt = k === 0 ? '1× floor' : '×' + X.sci(mult);
      eSvg += '<line x1="' + f1(xFloor) + '" x2="' + f1(x) + '" y1="' + f1(cy) + '" y2="' + f1(cy) + '" stroke="' + it.col + '" stroke-width="' + (k === 0 ? 0 : 3.2) + '" opacity="0.55"/>';
      let mk = '';
      if (it.shape === 'hollow') mk = '<circle class="fp" cx="' + f1(x) + '" cy="' + f1(cy) + '" r="6" style="fill:var(--surface);stroke:' + it.col + ';stroke-width:2.4"/>';
      else if (it.shape === 'square') mk = '<rect class="fp" x="' + f1(x - 5.2) + '" y="' + f1(cy - 5.2) + '" width="10.4" height="10.4" rx="2" style="fill:' + it.col + '"/>';
      else if (it.shape === 'diamond') mk = '<polygon class="fp" points="' + f1(x) + ',' + f1(cy - 6.4) + ' ' + f1(x + 6.4) + ',' + f1(cy) + ' ' + f1(x) + ',' + f1(cy + 6.4) + ' ' + f1(x - 6.4) + ',' + f1(cy) + '" style="fill:' + it.col + '"/>';
      else if (it.shape === 'triangle') mk = '<polygon class="fp" points="' + f1(x) + ',' + f1(cy - 6.5) + ' ' + f1(x + 6.2) + ',' + f1(cy + 5) + ' ' + f1(x - 6.2) + ',' + f1(cy + 5) + '" style="fill:' + it.col + '"/>';
      else mk = '<circle class="fp" cx="' + f1(x) + '" cy="' + f1(cy) + '" r="5.6" style="fill:' + it.col + '"/>';

      eSvg += '<g class="fpt eth-pt" tabindex="0" role="button" data-ei="' + k + '" aria-label="' + esc(it.name + ': ' + X.sci(it.j) + ' joules (' + multTxt + ')') + '">' +
        '<rect x="8" y="' + f1(cy - rowH / 2) + '" width="' + (EW - 16) + '" height="' + f1(rowH) + '" fill="transparent"/>' +
        '<text x="' + (EL - 12) + '" y="' + f1(cy + 4) + '" text-anchor="end" fill="var(--ink)" font-size="12.5" font-weight="' + (k === 0 ? '800' : '600') + '">' + esc(it.name) + '</text>' +
        mk +
        '<text x="' + f1(x + 10) + '" y="' + f1(cy + 4) + '" fill="var(--ink-2)" font-size="12" class="tnum"><tspan font-weight="700" fill="var(--ink)">' + X.sci(it.j) + ' J</tspan> · ' + multTxt + '</text></g>';
    });
    eSvg += '<text class="tick" x="' + EL + '" y="' + (EH - 10) + '">Energy spent per elementary event (E = P ÷ C, log₁₀ joules; dashed orange line = Landauer k_B T ln 2 floor) →</text>';

    $('calcVisuals').innerHTML =
      '<figure class="lab-fig calc-fig">' +
      '<figcaption><h3>How four measurements become the numbers we report</h3>' +
      '<p>Each number on the right comes from a measured input on the left and an equation in the middle, so one number cannot drift without moving the others.</p></figcaption>' +
      '<div class="plot-wrap"><svg viewBox="0 0 ' + FW + ' ' + FH + '" class="plot" role="img" aria-label="Three-column calculation flow diagram showing how biomass, animal synapses, chip inventories and solar power convert via equations into Earth’s closed 2026 gauges.">' + flowSvg + '</svg></div>' +
      '</figure>' +
      '<figure class="lab-fig calc-fig">' +
      '<figcaption><h3>What one operation costs, from a microbe to a computer</h3>' +
      '<p>Erasing one bit at 15 °C costs at least <b>k<sub>B</sub>T ln 2 = ' + X.sci(bitFloor) + ' J</b>. That is the floor physics allows. Microbes work close to it; brains and chips spend millions to billions of times more on each step, because they send fast signals over long distances without errors.</p></figcaption>' +
      '<div class="plot-wrap"><svg viewBox="0 0 ' + EW + ' ' + EH + '" class="plot fig" role="img" aria-label="Logarithmic comparison of joules per operation from Landauer’s 2.8×10⁻²¹ J floor through microbial enzymes, cortical synapses and AI tensor cores up to 2×10⁻¹⁰ J off-chip DRAM fetches.">' + eSvg + '</svg></div>' +
      '<p class="readout fig-read" id="ethRead" aria-live="polite">Hover, tap or tab to any row (Up/Down or Left/Right arrows) to inspect how its energy per event is calculated.</p>' +
      '<details class="evid-disc sm-disc"><summary>Show the energy-per-operation numbers &amp; equations</summary>' +
      '<div class="tbl-wrap" style="margin-top:8px"><table class="rt"><caption>Energy cost per operation and multiple above Landauer’s floor at 15 °C</caption>' +
      '<thead><tr><th scope="col">System / operation</th><th scope="col">Energy per event (J)</th><th scope="col">× Landauer floor</th><th scope="col">Derivation</th></tr></thead><tbody>' +
      E_ITEMS.map((it, k) => '<tr><th scope="row">' + esc(it.name) + '</th><td class="tnum">' + X.sci(it.j) + ' J</td><td class="tnum">' + (k === 0 ? '1×' : '×' + X.sci(it.j / bitFloor)) + '</td><td style="text-align:left;white-space:normal">' + esc(it.how) + '</td></tr>').join('') +
      '</tbody></table></div></details></figure>';

    const ethRead = $('ethRead');
    $('calcVisuals').querySelectorAll('.eth-pt').forEach(g => {
      const show = () => {
        const it = E_ITEMS[Number(g.dataset.ei)];
        if (!it || !ethRead) return;
        const mult = it.j / bitFloor;
        ethRead.innerHTML = '<b>' + esc(it.name) + '</b>: <b>' + X.sci(it.j) + ' J</b> (' + (mult < 1.01 ? 'exact physical floor' : '<b>×' + X.sci(mult) + '</b> above Landauer’s limit') + ') — ' + esc(it.how);
      };
      g.addEventListener('mouseenter', show);
      g.addEventListener('focus', show);
      g.addEventListener('click', show);
      g.addEventListener('keydown', ev => {
        const step = (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') ? 1 : (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') ? -1 : 0;
        if (!step) return;
        const all = [...$('calcVisuals').querySelectorAll('.eth-pt')];
        const nx = all[all.indexOf(g) + step];
        if (nx) { ev.preventDefault(); nx.focus(); }
      });
    });
  }

  const jump = $('jump');
  if (jump && 'IntersectionObserver' in window) {
    const links = [...jump.querySelectorAll('a')];
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => { if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }), { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.how-part').forEach(sec => io.observe(sec));
  }

  const key = ['1', '2', '3', '4', '5', '13', '20', '23', '25', '27', '39', '47', '68', '86'];
  const refs = X.SI.refs;
  const nums = Object.keys(refs).map(Number).sort((a, b) => a - b);
  const keyNums = key.map(Number).filter(n => refs[n]);
  $('keySrc').innerHTML = keyNums.map(n => '<li value="' + n + '">' + esc(refs[n]) + '</li>').join('');
  $('allSrc').innerHTML = nums.map(n => '<li value="' + n + '">' + esc(refs[n]) + '</li>').join('');

  /* ---------- test today's numbers: two estimates make each headline number ---------- */
  // inputs are the 2026 model values; each output's shaded range is the 95% band from the Monte Carlo ledger
  const IN = {
    biomass: { name: 'Carbon in bacteria and archaea', v: 77.5, unit: 'Gt C', kind: 'Measured', sym: 'B_prok',
      note: 'All the carbon held in microbes, from a global census of life. It is a modern estimate, not a count of every cell.', src: 'Bar-On, Phillips & Milo (2018)', sid: 'S1', tab: 'sources' },
    mass: { name: 'Carbon in one typical cell', v: 25, unit: 'fg C', kind: 'Model assumption', sym: 'm_cell',
      note: 'One average cell size stands in for every microbe. Real cells vary by habitat: under the seafloor they hold about 14 fg each.', src: 'Kallmeyer et al. (2012) for the seafloor value', sid: 'S3', tab: 'sources' },
    synapses: { name: 'Synapses in all animals', v: 3e27, unit: 'synapses', kind: 'Model estimate', sym: 'N_syn',
      note: 'Built from how many worms, insects and other animals there are, their neurons, and synapses per neuron. Each step has its own uncertainty.', src: 'van den Hoogen et al. (2019), Rosenberg et al. (2023), Herculano-Houzel (2016)', sid: 'S5, S6, S17', tab: 'sources' },
    rate: { name: 'Signals per synapse each second', v: 0.1, unit: 'per second', kind: 'Model assumption', sym: 'f_syn',
      note: 'How often an average synapse fires. With the synapse count fixed, 10% more firing means 10% more nerve signals.' },
    peak: { name: 'Top speed of every chip', v: 7.6e22, unit: 'ops/s', kind: 'Inventory', sym: 'P_peak',
      note: 'The peak speed of every AI accelerator, graphics card, server, PC and phone, added up. Different chips count operations differently.', src: 'Epoch AI (2025) and the device inventory', sid: 'S12', tab: 'devices' },
    util: { name: 'Share of time chips are busy', v: 0.249, unit: '', kind: 'Model assumption', sym: 'u',
      note: 'On average chips run at about a quarter of their top speed: AI chips in data centers near 60%, phones and PCs near 15%.', tab: 'devices' }
  };
  const MC = (window.SI_LEDGERS && window.SI_LEDGERS.uncertainty) || { rows: [] };
  const band = re => { const r = MC.rows.find(x => re.test(x[0])); return r ? [Number(r[3]), Number(r[5])] : null; };
  const OUT = [
    { k: 'cells', name: 'Bacteria and archaea cells', a: 'biomass', b: 'mass', op: '÷', f: (a, b) => a * 1e30 / b, unit: 'cells', color: 'var(--s-chem)', range: band(/Prokaryotic Cell Census/), sym: 'N = B × 10³⁰ ÷ m',
      note: 'Biomass divided by the carbon in one cell. Double the biomass and the count doubles; double the cell size and it halves.', ex: 'Elasticity +1 on biomass, −1 on cell mass.' },
    { k: 'neural', name: 'Nerve signals every second', a: 'synapses', b: 'rate', op: '×', f: (a, b) => a * b, unit: 'per second', color: 'var(--s-neuro)', range: band(/Neural Event Rate/), sym: 'C_neural = N_syn × f_syn',
      note: 'Synapses times how often each one fires. These are signals between nerve cells, not thoughts, and not the same thing as computer operations.', ex: 'Elasticity +1 on both inputs.' },
    { k: 'digital', name: 'Chip operations every second', a: 'peak', b: 'util', op: '×', f: (a, b) => a * b, unit: 'ops/s', color: 'var(--s-silicon)', range: band(/Executed Digital Throughput/), sym: 'C_digital = P_peak × u',
      note: 'Top speed times the share of time chips are busy. Chip work and nerve signals are different kinds of events, so they cannot be compared one to one.', ex: 'Elasticity +1 on both inputs.' }
  ];
  const OK = {}; OUT.forEach(o => { OK[o.k] = o; });
  const outOf = k => OUT.find(o => o.a === k || o.b === k);
  const showIn = (k, v) => k === 'util' ? (v * 100).toFixed(1) + '%' : (v >= 1e4 ? X.sci(v) : X.plain(v)) + (IN[k].unit ? ' ' + IN[k].unit : '');
  let pick = 'rate', shown = 'rate', pct = 0;

  const tester = $('tester');
  if (tester) {
    tester.innerHTML = '<div class="t-rows">' + OUT.map(o => '<div class="t-row" style="--tc:' + o.color + '">' +
      [o.a, o.b].map((k, n) => (n ? '<span class="t-op" aria-hidden="true">' + o.op + '</span>' : '') +
        '<button type="button" class="t-box t-in" data-k="' + k + '" aria-pressed="false"><span class="t-name">' + IN[k].name + '</span><span class="t-val" id="tv-' + k + '"></span></button>').join('') +
      '<span class="t-op" aria-hidden="true">=</span>' +
      '<button type="button" class="t-box t-out" data-k="' + o.k + '" aria-pressed="false"><span class="t-name">' + o.name + '</span><span class="t-val" id="tv-' + o.k + '"></span><span class="t-chg" id="tc-' + o.k + '"></span></button>' +
      '<div class="t-band" aria-hidden="true"><span class="t-zone" id="tz-' + o.k + '"></span><span class="t-mid" id="tm-' + o.k + '"></span><span class="t-dot" id="td-' + o.k + '"></span></div>' +
      '<p class="t-range" id="tr-' + o.k + '"></p><p class="t-sym x-only mono">' + o.sym + '</p></div>').join('') + '</div>' +
      '<div class="t-ctl"><label for="tSlide">Change <b id="tWhat"></b> by <output id="tPct" for="tSlide">0%</output></label>' +
      '<input type="range" class="time-slider" id="tSlide" min="-50" max="50" step="5" value="0"><button type="button" class="btn sm ghost" id="tReset">Reset</button></div>' +
      '<p class="t-read" id="tRead" aria-live="polite"></p><div class="t-note" id="tNote"></div>';
    tester.addEventListener('click', ev => {
      const b = ev.target.closest('.t-box'); if (!b) return;
      if (IN[b.dataset.k] && b.dataset.k !== pick) { pick = b.dataset.k; pct = 0; }
      shown = b.dataset.k; drawTest();
    });
    $('tSlide').addEventListener('input', ev => { pct = Number(ev.target.value); shown = pick; drawTest(); });
    $('tReset').addEventListener('click', () => { pct = 0; drawTest(); });
    drawTest();
  }
  function drawTest() {
    const val = {}; Object.keys(IN).forEach(k => { val[k] = IN[k].v * (k === pick ? 1 + pct / 100 : 1); });
    const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n).toFixed(Math.abs(n) < 10 && n % 1 ? 1 : 0) + '%';
    Object.keys(IN).forEach(k => { $('tv-' + k).textContent = showIn(k, val[k]); });
    tester.querySelectorAll('.t-box').forEach(b => { b.classList.toggle('on', b.dataset.k === pick); b.classList.toggle('shown', b.dataset.k === shown); b.setAttribute('aria-pressed', String(b.dataset.k === pick || b.dataset.k === shown)); });
    let reading = '';
    OUT.forEach(o => {
      const base = o.f(IN[o.a].v, IN[o.b].v), v = o.f(val[o.a], val[o.b]), ch = (v / base - 1) * 100;
      $('tv-' + o.k).textContent = X.sci(v) + ' ' + o.unit;
      $('tc-' + o.k).textContent = Math.abs(ch) < 0.05 ? '' : sign(ch);
      // the band spans a quarter of the low end to four times the high end, on a log scale
      const r = o.range;
      if (r) {
        const lo = Math.log10(r[0] / 4), hi = Math.log10(r[1] * 4), at = x => ((Math.log10(x) - lo) / (hi - lo) * 100).toFixed(1) + '%';
        const z = $('tz-' + o.k); z.style.left = at(r[0]); z.style.width = 'calc(' + at(r[1]) + ' - ' + at(r[0]) + ')';
        $('tm-' + o.k).style.left = at(base); $('td-' + o.k).style.left = at(v);
        const inside = v >= r[0] && v <= r[1];
        $('td-' + o.k).classList.toggle('out', !inside);
        $('tr-' + o.k).innerHTML = 'Range we allow for: ' + X.sci(r[0]) + ' to ' + X.sci(r[1]) + '<span class="x-only"> (95%, 10,000 draws)</span>';
        if (o === outOf(pick)) reading = o.name + ': ' + X.sci(v) + ' ' + o.unit + (pct ? ' (' + sign(ch) + ')' : '') + '. ' +
          (!pct ? 'Move the slider to change ' + IN[pick].name.toLowerCase() + '.' : inside ? 'Still inside the range we already allow for.' : 'Outside the range we allow for. If this input were really that far off, our range would be too narrow.');
      }
    });
    $('tWhat').textContent = IN[pick].name.toLowerCase();
    $('tPct').textContent = pct > 0 ? '+' + pct + '%' : pct < 0 ? '−' + -pct + '%' : '0%';
    $('tSlide').value = pct; $('tSlide').setAttribute('aria-valuetext', (pct > 0 ? '+' : '') + pct + ' percent');
    $('tRead').textContent = reading + ' Only one input changes at a time.';
    // the note explains whichever box was picked last: what kind of number it is and where it comes from
    const isOut = OK[shown], d = isOut ? OK[shown] : IN[shown];
    const kind = isOut ? 'Calculated' : d.kind;
    $('tNote').innerHTML = '<span class="chip">' + kind + '</span> <b>' + esc(d.name) + '</b><p>' + esc(d.note) + (isOut ? '<span class="x-only"> ' + esc(d.ex) + '</span>' : '') + '</p>' +
      (d.src ? '<p class="t-src">Source: ' + esc(d.src) + '<span class="x-only mono"> · ' + d.sid + ' · ' + d.sym + '</span>' + (d.tab ? ' · <a href="data.html#' + d.tab + '">See it in the Data Lab →</a>' : '') + '</p>'
        : d.tab ? '<p class="t-src"><a href="data.html#' + d.tab + '">See it in the Data Lab →</a></p>' : '');
  }
})();
