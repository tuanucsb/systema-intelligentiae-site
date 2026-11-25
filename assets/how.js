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

    // 3. Task B4: From carbon to cells waterfall (drawn from LED.power & census)
    const pLed = (window.SI_LEDGERS && window.SI_LEDGERS.power) || { columns: [], rows: [] };
    const pCol = c => pLed.columns.indexOf(c);
    const pRow = re => pLed.rows.find(r => re.test(String(r[0]))) || [];
    const cleanCite = s => String(s || '').replace(/\s*\[S\d+[a-z]?\]/g, '').trim();

    const rSubBio = pRow(/SUBTOTAL BIOSPHERE/i);
    const rWood = pRow(/2a\.\s*Extracellular/i);
    const rEuk = pRow(/2b\.\s*Metabolically Active/i);
    const rAnim = pRow(/3\.\s*Global Metazoan/i);
    const rProk = pRow(/SUBTOTAL 1:/i);
    const rDeep = pRow(/1a\.\s*Deep/i);
    const rOligo = pRow(/1b\.\s*Oligotrophic/i);
    const rSurf = pRow(/1c\.\s*Metabolically Active/i);
    const rTech = pRow(/4\.\s*Human Industrial/i);
    const rGrand = pRow(/GRAND TOTAL/i);

    const bTot = Number(rSubBio[pCol('biomass_gt_c')]) || eNow.bio;
    const bWood = Number(rWood[pCol('biomass_gt_c')]) || 380;
    const bEuk = Number(rEuk[pCol('biomass_gt_c')]) || 90.5;
    const nEuk = Number(rEuk[pCol('unit_count_n')]) || 9.05e28;
    const bAnim = Number(rAnim[pCol('biomass_gt_c')]) || 2;
    const bProk = Number(rProk[pCol('biomass_gt_c')]) || 77.5;
    const nProk = Number(rProk[pCol('unit_count_n')]) || eNow.cells;
    const bDeep = Number(rDeep[pCol('biomass_gt_c')]) || 17.25, nDeep = Number(rDeep[pCol('unit_count_n')]) || 6.9e29;
    const bOligo = Number(rOligo[pCol('biomass_gt_c')]) || 48.625, nOligo = Number(rOligo[pCol('unit_count_n')]) || 1.945e30;
    const bSurf = Number(rSurf[pCol('biomass_gt_c')]) || 11.625, nSurf = Number(rSurf[pCol('unit_count_n')]) || 4.65e29;
    const fgPerCell = Math.round((bProk * 1e30) / nProk);

    const WF_STEPS = [
      { key: 'total', label: 'All living carbon', sub: bTot + ' Gt C', top: bTot, bot: 0, col: 'var(--act-2)', numCol: 'total_biomass_gt_c',
        valTxt: bTot + ' Gt C', cellsTxt: X.sci(nProk + nEuk) + ' living cells',
        study: cleanCite(rSubBio[pCol('primary_source_ref')] || 'Bar-On, Phillips & Milo (2018)'),
        detail: 'Global survey of every plant, microbe, fungus and animal on Earth: ' + bTot + ' billion tonnes of carbon in all.' },
      { key: 'wood', label: '− Dead wood & bark', sub: '−' + bWood + ' Gt C', top: bTot, bot: bTot - bWood, col: 'var(--ink-3)', drop: true,
        valTxt: '−' + bWood + ' Gt C (0 cells)', cellsTxt: '0 active cells (support matrix)',
        study: cleanCite(rWood[pCol('primary_source_ref')]),
        detail: 'Tree trunks and heartwood hold ' + Math.round(bWood / bTot * 100) + '% of living biomass carbon as inert cellulose and lignin, so dividing total plant mass by cell size would wildly overcount cells.' },
      { key: 'euk', label: '− Leaves, roots & fungi', sub: '−' + bEuk + ' Gt C', top: bTot - bWood, bot: bTot - bWood - bEuk, col: 'var(--act-3)', drop: true,
        valTxt: '−' + bEuk + ' Gt C', cellsTxt: X.sci(nEuk) + ' complex cells (at 1 pg C/cell)',
        study: cleanCite(rEuk[pCol('primary_source_ref')]),
        detail: 'Metabolically active plant leaves, roots, fungi and protists weigh ~1,000 femtograms of carbon per cell, yielding ' + X.sci(nEuk) + ' nucleated cells.' },
      { key: 'anim', label: '− All animals', sub: '−' + bAnim + ' Gt C', top: bProk + bAnim, bot: bProk, col: 'var(--s-neuro)', drop: true,
        valTxt: '−' + bAnim + ' Gt C', cellsTxt: '~2×10²⁷ animal cells (' + X.sci(eNow.neurons) + ' neurons)',
        study: cleanCite(rAnim[pCol('primary_source_ref')]),
        detail: 'Insects, roundworms, fish, birds, livestock and humans together hold only ' + bAnim + ' Gt C — under 0.4% of Earth’s biomass.' },
      { key: 'prok', label: '= Microbe carbon', sub: bProk + ' Gt C ÷ ' + fgPerCell + ' fg', top: bProk, bot: 0, col: 'var(--s-chem)', numCol: 'total_cells',
        valTxt: bProk + ' Gt C', cellsTxt: X.sci(nProk) + ' bacteria & archaea',
        study: 'Bar-On, Phillips & Milo (2018); Kallmeyer et al. (2012)',
        detail: bProk + '×10¹⁵ g carbon divided by ' + fgPerCell + '×10⁻¹⁵ g per cell = ' + X.sci(nProk) + ' microbial cells (97% of all living cells on Earth).' },
      { key: 'hab', label: 'Split into 3 habitats', sub: X.sci(nProk) + ' cells', top: bProk, bot: 0, col: 'var(--s-chem)', stacked: true, numCol: 'c_biochem_ops_sec',
        valTxt: X.sci(nProk) + ' cells', cellsTxt: Math.round(nDeep / nProk * 100) + '% deep · ' + Math.round(nOligo / nProk * 100) + '% starving · ' + Math.round(nSurf / nProk * 100) + '% surface',
        study: cleanCite(rDeep[pCol('primary_source_ref')]) + '; ' + cleanCite(rOligo[pCol('primary_source_ref')]),
        detail: 'Deep rock (' + X.sci(nDeep) + ' cells, 10 reactions/s; ' + cleanCite(rDeep[pCol('primary_source_ref')]) + '), starving soil & dark ocean (' + X.sci(nOligo) + ' cells, 150/s; ' + cleanCite(rOligo[pCol('primary_source_ref')]) + '), and active sunlit surface (' + X.sci(nSurf) + ' cells, 5,000/s).' }
    ];

    const WFW = 1000, WFH = 340, WFL = 62, WFR = 24, WFT = 34, WFB = 66;
    const wfPlotW = WFW - WFL - WFR, wfPlotH = WFH - WFT - WFB;
    const yWF = gt => WFT + (1 - gt / bTot) * wfPlotH;
    const colW = wfPlotW / WF_STEPS.length, barW = Math.min(96, colW * 0.64);
    let wfSvg = '';
    [0, 100, 200, 300, 400, 550].forEach(gt => {
      const y = yWF(gt);
      wfSvg += '<line class="grid" x1="' + WFL + '" x2="' + (WFW - WFR) + '" y1="' + f1(y) + '" y2="' + f1(y) + '"/>' +
        '<text class="tick" x="' + (WFL - 8) + '" y="' + f1(y + 4) + '" text-anchor="end">' + gt + (gt === 550 ? ' Gt C' : '') + '</text>';
    });
    WF_STEPS.forEach((st, idx) => {
      const cx = WFL + (idx + 0.5) * colW, bx = cx - barW / 2;
      const yTop = yWF(st.top), yBot = yWF(st.bot), bh = Math.max(4, yBot - yTop);
      if (idx > 0 && idx < 5) {
        const prev = WF_STEPS[idx - 1];
        const py = prev.drop ? yWF(prev.bot) : yWF(prev.top);
        wfSvg += '<line x1="' + f1(cx - colW + barW / 2) + '" x2="' + f1(bx) + '" y1="' + f1(py) + '" y2="' + f1(py) + '" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="3 3"/>';
      }
      if (idx === 4) {
        // Zoom magnification connectors from 77.5 Gt C bar into the expanded habitat stack on the right
        const nextX = WFL + 5.5 * colW - barW / 2;
        wfSvg += '<path d="M' + f1(bx + barW) + ' ' + f1(yTop) + ' L' + f1(nextX) + ' ' + f1(WFT + 18) + ' M' + f1(bx + barW) + ' ' + f1(yBot) + ' L' + f1(nextX) + ' ' + f1(yWF(0)) + '" stroke="var(--s-chem)" stroke-width="1.3" stroke-dasharray="4 3" fill="none" opacity="0.7"/>';
      }
      let barBody = '';
      if (st.stacked) {
        // Expanded full-height habitat breakdown of the 3.10e30 microbial cells
        const stackTop = WFT + 18, stackH = yWF(0) - stackTop;
        const segs = [
          { n: nSurf, lbl: 'Surface 15%', c: 'var(--s-chem)', op: '1' },
          { n: nOligo, lbl: 'Starving 63%', c: 'color-mix(in srgb, var(--s-chem) 62%, var(--surface))', op: '1' },
          { n: nDeep, lbl: 'Deep rock 22%', c: 'color-mix(in srgb, var(--s-chem) 34%, var(--ink-3))', op: '1' }
        ];
        let sy = stackTop;
        segs.forEach(sg => {
          const sh = (sg.n / nProk) * stackH;
          barBody += '<rect x="' + f1(bx) + '" y="' + f1(sy) + '" width="' + f1(barW) + '" height="' + f1(Math.max(2, sh - 1.5)) + '" rx="4" fill="' + sg.c + '" stroke="var(--ink)" stroke-width="0.8"/>';
          if (sh >= 22) barBody += '<text x="' + f1(cx) + '" y="' + f1(sy + sh / 2 + 4) + '" text-anchor="middle" fill="#0b0c1a" font-size="10.5" font-weight="700">' + sg.lbl + '</text>';
          sy += sh;
        });
        barBody += '<text x="' + f1(cx) + '" y="' + f1(stackTop - 6) + '" text-anchor="middle" fill="var(--ink)" font-size="11.5" font-weight="800">' + X.sci(nProk) + ' cells</text>';
      } else {
        barBody = '<rect x="' + f1(bx) + '" y="' + f1(yTop) + '" width="' + f1(barW) + '" height="' + f1(bh) + '" rx="5" fill="' + st.col + '" fill-opacity="' + (st.drop ? '0.26' : '0.88') + '" stroke="' + st.col + '" stroke-width="1.8"' + (st.drop ? ' stroke-dasharray="4 2"' : '') + '/>' +
          '<text x="' + f1(cx) + '" y="' + f1(Math.max(16, yTop - 6)) + '" text-anchor="middle" fill="var(--ink)" font-size="11.5" font-weight="700" class="tnum">' + esc(st.sub) + '</text>';
      }
      wfSvg += '<g class="fpt wf-pt" tabindex="0" role="button" data-wfi="' + idx + '" aria-label="' + esc(st.label + ': ' + st.valTxt + ', ' + st.cellsTxt + '. Study: ' + st.study) + '">' +
        '<rect x="' + f1(cx - colW / 2 + 2) + '" y="' + (WFT - 16) + '" width="' + f1(colW - 4) + '" height="' + (WFH - WFT + 10) + '" fill="transparent"/>' +
        barBody +
        '<text x="' + f1(cx) + '" y="' + (WFH - WFB + 20) + '" text-anchor="middle" fill="var(--ink)" font-size="11.8" font-weight="700">' + esc(st.label) + '</text>' +
        '<text x="' + f1(cx) + '" y="' + (WFH - WFB + 36) + '" text-anchor="middle" fill="var(--ink-3)" font-size="10.8">' + esc(st.key === 'hab' ? '3 habitats (zoomed)' : st.cellsTxt.split(' (')[0]) + '</text></g>';
    });

    // 4. Task B3: Where Earth's power goes (flow from sunlight & fuel into microbes, plants, animals & technology)
    const dLed = (window.SI_LEDGERS && window.SI_LEDGERS.devices) || { columns: [], rows: [] };
    const dCol = c => dLed.columns.indexOf(c);
    const pBioTW = Number(rSubBio[pCol('compartment_power_tw')]) || (eNow.pbio / 1e12) || 65;
    const pTechTW = Number(rTech[pCol('compartment_power_tw')]) || (eNow.ptech / 1e12) || 19.5;
    const pGrandTW = Number(rGrand[pCol('compartment_power_tw')]) || (eNow.ptot / 1e12) || 84.5;
    const pEukTW = Number(rEuk[pCol('compartment_power_tw')]) || 48.5;
    const pProkTW = Number(rProk[pCol('compartment_power_tw')]) || 14.0;
    const pSurfTW = Number(rSurf[pCol('compartment_power_tw')]) || 9.42;
    const pOligoTW = Number(rOligo[pCol('compartment_power_tw')]) || 3.89;
    const pDeepTW = Number(rDeep[pCol('compartment_power_tw')]) || 0.69;
    const pAnimTW = Number(rAnim[pCol('compartment_power_tw')]) || 2.5;
    const dTotRow = dLed.rows.find(r => /TOTAL GLOBAL/i.test(String(r[0]))) || [];
    const pItGW = Number(dTotRow[dCol('aggregate_wall_power_gw')]) || ((eNow.pit || 8e10) / 1e9) || 80;
    const pItTW = pItGW / 1000;
    const pIndTW = +(pTechTW - pItTW).toFixed(2);
    const devBreak = dLed.rows.filter(r => !/TOTAL GLOBAL/i.test(String(r[0]))).map(r => String(r[0]).split(' (')[0] + ' ' + r[dCol('aggregate_wall_power_gw')] + ' GW').join(' · ');

    const PF_SINKS = [
      { key: 'plants', name: 'Active plants, fungi & protists', tw: pEukTW, srcKey: 'sun', col: 'var(--act-3)', numCol: 'p_bio_watts',
        sub: X.sci(Number(rEuk[pCol('compartment_event_rate_ops_s')]) || 1.81e32) + ' cell reactions/s · dead wood uses 0 W',
        how: cleanCite(rEuk[pCol('primary_source_ref')]) + '. Photosynthesis stores ~130 TW in new growth each year; ' + pEukTW + ' TW runs living leaves, roots, fungi and protists, while the other ~65 TW goes into dead wood, soil litter and wildfires.' },
      { key: 'microbes', name: 'Bacteria & archaea (3 habitats)', tw: pProkTW, srcKey: 'sun', col: 'var(--s-chem)', numCol: 'c_biochem_ops_sec',
        sub: pSurfTW + ' TW surface · ' + pOligoTW + ' TW starving · ' + pDeepTW + ' TW deep rock',
        how: cleanCite(rSurf[pCol('primary_source_ref')]) + '; ' + cleanCite(rDeep[pCol('primary_source_ref')]) + '. Powers ' + X.sci(Number(rProk[pCol('compartment_event_rate_ops_s')]) || 2.62e33) + ' enzyme reactions/s across ' + X.sci(nProk) + ' cells.' },
      { key: 'animals', name: 'All animals (incl. 0.18 TW brains)', tw: pAnimTW, srcKey: 'sun', col: 'var(--s-neuro)', numCol: 'p_animal_watts',
        sub: X.sci(eNow.cneu) + ' nerve signals/s (' + (pAnimTW / pGrandTW * 100).toFixed(1) + '% of Earth’s budget)',
        how: cleanCite(rAnim[pCol('primary_source_ref')]) + '. All animal bodies use ' + pAnimTW + ' TW; nervous systems use ~0.18 TW (~160 GW in humans and wild vertebrates/arthropods).' },
      { key: 'industry', name: 'Human heat, transport & industry', tw: pIndTW, srcKey: 'fuel', col: 'var(--c-power)', numCol: 'p_tech_primary_watts',
        sub: 'Fossil fuels, nuclear, hydro, wind & solar outside computing',
        how: cleanCite(rTech[pCol('primary_source_ref')]) + '. Over 99.5% of human primary energy heats buildings, smelts materials, grows food and moves vehicles rather than flipping bits.' },
      { key: 'chips', name: 'All computers & data centres', tw: pItTW, srcKey: 'fuel', col: 'var(--s-silicon)', numCol: 'p_digital_it_watts',
        sub: pItGW + ' GW wall power (' + (pItTW / pGrandTW * 100).toFixed(2) + '% of budget) · ' + X.sci(eNow.cdig) + ' ops/s',
        how: (devBreak ? devBreak + '. ' : '') + 'Includes 20 GW continuous refresh power keeping DRAM and flash/disk archives alive.' }
    ];

    const PFW = 1000, PFH = 368, PFL = 22, PFR = 22, PFT = 34;
    const sx0 = PFL, sw = 232, mx0 = 382, mw = 150, dx0 = 656, dw = PFW - PFR - dx0;
    const scaleH = 236, pxPerTW = scaleH / pGrandTW;
    const sunH = pBioTW * pxPerTW, fuelH = pTechTW * pxPerTW;
    const sunY = PFT + 26, fuelY = sunY + sunH + 28;
    const midY = PFT + 34;
    let pfSvg = '<text class="side" x="' + sx0 + '" y="18">ENERGY SOURCES</text>' +
      '<text class="side" x="' + mx0 + '" y="18">CLOSED BUDGET</text>' +
      '<text class="side" x="' + dx0 + '" y="18">WHERE IT GOES (2026)</text>';

    // Left source nodes
    pfSvg += '<rect x="' + sx0 + '" y="' + f1(sunY) + '" width="' + sw + '" height="' + f1(sunH) + '" rx="8" fill="color-mix(in srgb, var(--s-chem) 16%, var(--surface))" stroke="var(--s-chem)" stroke-width="1.8"/>' +
      '<text x="' + (sx0 + 12) + '" y="' + f1(sunY + 22) + '" fill="var(--ink)" font-size="13" font-weight="700">Sunlight via photosynthesis</text>' +
      '<text x="' + (sx0 + 12) + '" y="' + f1(sunY + 44) + '" fill="var(--ink)" font-family="var(--display)" font-size="17" font-weight="800" class="tnum">' + pBioTW.toFixed(1) + ' TW active life</text>' +
      '<text x="' + (sx0 + 12) + '" y="' + f1(sunY + 63) + '" fill="var(--ink-2)" font-size="11.2">(of ~130 TW annual plant growth;</text>' +
      '<text x="' + (sx0 + 12) + '" y="' + f1(sunY + 78) + '" fill="var(--ink-3)" font-size="11.2">~65 TW → dead wood, litter &amp; fire)</text>';

    pfSvg += '<rect x="' + sx0 + '" y="' + f1(fuelY) + '" width="' + sw + '" height="' + f1(Math.max(58, fuelH)) + '" rx="8" fill="color-mix(in srgb, var(--c-power) 16%, var(--surface))" stroke="var(--c-power)" stroke-width="1.8"/>' +
      '<text x="' + (sx0 + 12) + '" y="' + f1(fuelY + 20) + '" fill="var(--ink)" font-size="13" font-weight="700">Fuels, nuclear &amp; renewables</text>' +
      '<text x="' + (sx0 + 12) + '" y="' + f1(fuelY + 41) + '" fill="var(--ink)" font-family="var(--display)" font-size="16.5" font-weight="800" class="tnum">' + pTechTW.toFixed(1) + ' TW industry</text>';

    // Center budget spine
    pfSvg += '<path d="M' + (sx0 + sw) + ' ' + f1(sunY + sunH / 2) + ' C' + (sx0 + sw + 64) + ' ' + f1(sunY + sunH / 2) + ' ' + (mx0 - 64) + ' ' + f1(midY + sunH / 2) + ' ' + mx0 + ' ' + f1(midY + sunH / 2) + '" stroke="var(--s-chem)" stroke-width="' + f1(Math.max(4, sunH * 0.72)) + '" stroke-opacity="0.24" fill="none"/>' +
      '<path d="M' + (sx0 + sw) + ' ' + f1(fuelY + Math.max(58, fuelH) / 2) + ' C' + (sx0 + sw + 64) + ' ' + f1(fuelY + Math.max(58, fuelH) / 2) + ' ' + (mx0 - 64) + ' ' + f1(midY + sunH + fuelH / 2) + ' ' + mx0 + ' ' + f1(midY + sunH + fuelH / 2) + '" stroke="var(--c-power)" stroke-width="' + f1(Math.max(4, fuelH * 0.72)) + '" stroke-opacity="0.26" fill="none"/>';

    pfSvg += '<rect x="' + mx0 + '" y="' + f1(midY) + '" width="' + mw + '" height="' + f1(scaleH) + '" rx="8" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/>' +
      '<rect x="' + (mx0 + 3) + '" y="' + f1(midY + 3) + '" width="6" height="' + f1(sunH - 4) + '" rx="3" fill="var(--s-chem)"/>' +
      '<rect x="' + (mx0 + 3) + '" y="' + f1(midY + sunH + 1) + '" width="6" height="' + f1(fuelH - 4) + '" rx="3" fill="var(--c-power)"/>' +
      '<text x="' + (mx0 + mw / 2 + 3) + '" y="' + f1(midY + scaleH / 2 - 14) + '" text-anchor="middle" fill="var(--ink-2)" font-size="12" font-weight="700">Earth total</text>' +
      '<text x="' + (mx0 + mw / 2 + 3) + '" y="' + f1(midY + scaleH / 2 + 10) + '" text-anchor="middle" fill="var(--ink)" font-family="var(--display)" font-size="20" font-weight="800" class="tnum">' + pGrandTW.toFixed(1) + ' TW</text>' +
      '<text x="' + (mx0 + mw / 2 + 3) + '" y="' + f1(midY + scaleH / 2 + 29) + '" text-anchor="middle" fill="var(--ink-3)" font-size="11" class="tnum">' + Math.round(pBioTW / pGrandTW * 100) + '% life · ' + Math.round(pTechTW / pGrandTW * 100) + '% tech</text>';

    // Right sink boxes + Sankey ribbons
    let curMidY = midY, sinkY = PFT + 8;
    const sinkGap = 10, sinkBoxH = 54;
    PF_SINKS.forEach((sk, k) => {
      const ribH = Math.max(2.5, sk.tw * pxPerTW);
      const yFrom = curMidY + sk.tw * pxPerTW / 2;
      curMidY += sk.tw * pxPerTW;
      const by = sinkY + k * (sinkBoxH + sinkGap), yTo = by + sinkBoxH / 2;
      const valLbl = sk.tw >= 1 ? sk.tw.toFixed(sk.tw % 1 ? 2 : 1).replace(/\.00$/, '.0') + ' TW' : Math.round(sk.tw * 1000) + ' GW';
      pfSvg += '<path class="pf-rib" data-pfi="' + k + '" d="M' + (mx0 + mw) + ' ' + f1(yFrom) + ' C' + (mx0 + mw + 62) + ' ' + f1(yFrom) + ' ' + (dx0 - 62) + ' ' + f1(yTo) + ' ' + dx0 + ' ' + f1(yTo) + '" stroke="' + sk.col + '" stroke-width="' + f1(ribH) + '" stroke-opacity="0.34" fill="none"/>' +
        '<g class="fpt pf-pt" tabindex="0" role="button" data-pfi="' + k + '" aria-label="' + esc(sk.name + ': ' + valLbl + '. ' + sk.how) + '">' +
        '<rect x="' + dx0 + '" y="' + f1(by) + '" width="' + dw + '" height="' + sinkBoxH + '" rx="8" fill="var(--surface)" stroke="' + sk.col + '" stroke-width="1.6"/>' +
        '<rect x="' + dx0 + '" y="' + f1(by) + '" width="5" height="' + sinkBoxH + '" rx="2.5" fill="' + sk.col + '"/>' +
        '<text x="' + (dx0 + 13) + '" y="' + f1(by + 20) + '" fill="var(--ink)" font-size="12.5" font-weight="700">' + esc(sk.name) + '</text>' +
        '<text x="' + (dx0 + dw - 10) + '" y="' + f1(by + 20) + '" text-anchor="end" fill="var(--ink)" font-family="var(--display)" font-size="14" font-weight="800" class="tnum">' + valLbl + '</text>' +
        '<text x="' + (dx0 + 13) + '" y="' + f1(by + 40) + '" fill="var(--ink-3)" font-size="11.1">' + esc(sk.sub) + '</text></g>';
    });

    $('calcVisuals').innerHTML =
      '<figure class="lab-fig calc-fig">' +
      '<figcaption><h3>How four measurements become the numbers we report</h3>' +
      '<p>Each number on the right comes from a measured input on the left and an equation in the middle, so one number cannot drift without moving the others.</p></figcaption>' +
      '<div class="plot-wrap"><svg viewBox="0 0 ' + FW + ' ' + FH + '" class="plot" role="img" aria-label="Three-column calculation flow diagram showing how biomass, animal synapses, chip inventories and solar power convert via equations into Earth’s closed 2026 gauges.">' + flowSvg + '</svg></div>' +
      '</figure>' +

      '<figure class="lab-fig calc-fig" id="carbon-to-cells">' +
      '<figcaption><h3>How can anyone count ' + X.sci(nProk) + ' cells? From living carbon to three habitats</h3>' +
      '<p>No one counts microbes one by one. Surveys weigh Earth’s ' + X.numBtn('total_biomass_gt_c', bTot + ' billion tonnes of living carbon') + ', subtract dead wood, plants and animals to isolate <b>' + bProk + ' Gt C in bacteria and archaea</b>, divide by ' + fgPerCell + ' femtograms per cell to get ' + X.numBtn('total_cells', X.sci(nProk) + ' cells') + ', and split them across three habitats that react at very different speeds.</p></figcaption>' +
      '<div class="plot-wrap"><svg viewBox="0 0 ' + WFW + ' ' + WFH + '" class="plot fig" role="img" aria-label="Step-by-step waterfall chart from ' + bTot + ' gigatonnes of total living carbon minus ' + bWood + ' gigatonnes of dead wood, ' + bEuk + ' gigatonnes of leaves, roots and fungi, and ' + bAnim + ' gigatonnes of animals to ' + bProk + ' gigatonnes of microbial carbon, yielding ' + X.sci(nProk) + ' cells across deep rock, starving soil and ocean, and active surface habitats.">' + wfSvg + '</svg></div>' +
      '<p class="readout fig-read" id="wfRead" aria-live="polite">Hover, tap or tab through the six steps to see the arithmetic and the published study behind each bar.</p>' +
      '<details class="evid-disc sm-disc"><summary><b>Show the carbon-to-cells step table &amp; studies</b></summary>' +
      '<div class="tbl-wrap" tabindex="0" role="region" aria-label="Carbon to cells breakdown"><table class="rt"><caption>Step-by-step mass balance from global living carbon to microbial and nucleated cell counts (2026)</caption>' +
      '<thead><tr><th scope="col">Step</th><th scope="col">Carbon (Gt C)</th><th scope="col">Living cells</th><th scope="col">Key study</th></tr></thead><tbody>' +
      WF_STEPS.map(st => '<tr><th scope="row">' + esc(st.label) + '</th><td class="tnum">' + esc(st.valTxt) + '</td><td class="tnum">' + esc(st.cellsTxt) + '</td><td style="text-align:left;white-space:normal">' + esc(st.study) + '</td></tr>').join('') +
      '</tbody></table></div></details></figure>' +

      '<figure class="lab-fig calc-fig" id="earth-power-flow">' +
      '<figcaption><h3>Where Earth’s ' + X.numBtn('p_metabolic_watts', pGrandTW.toFixed(1) + ' TW') + ' of power goes</h3>' +
      '<p>Plants capture about 130 TW of sunlight as new growth each year; ' + X.numBtn('p_bio_watts', pBioTW.toFixed(1) + ' TW') + ' of it runs living cells right now (the rest builds dead wood or burns in wildfires and decay). Human industry adds ' + X.numBtn('p_tech_primary_watts', pTechTW.toFixed(1) + ' TW') + ' of fuels and electricity. Every animal alive shares 3% of the budget, and all ' + X.numBtn('p_digital_it_watts', pItGW + ' GW') + ' of computers take under a tenth of one percent.</p></figcaption>' +
      '<div class="plot-wrap"><svg viewBox="0 0 ' + PFW + ' ' + PFH + '" class="plot fig" role="img" aria-label="Power flow diagram from ' + pBioTW.toFixed(1) + ' terawatts of photosynthetic metabolism and ' + pTechTW.toFixed(1) + ' terawatts of human primary energy into ' + pEukTW + ' TW plants and fungi, ' + pProkTW + ' TW microbes, ' + pAnimTW + ' TW animals, ' + pIndTW + ' TW non-computing human industry, and ' + pItGW + ' GW digital computers.">' + pfSvg + '</svg></div>' +
      '<p class="readout fig-read" id="pfRead" aria-live="polite">Hover, tap or tab to any compartment on the right to see its share of Earth’s power, what it runs, and its source.</p>' +
      '<details class="evid-disc sm-disc"><summary><b>Show the closed 2026 power budget table</b></summary>' +
      '<div class="tbl-wrap" tabindex="0" role="region" aria-label="2026 planetary power flow"><table class="rt"><caption>Closed 2026 planetary power budget from energy sources to biological and technological compartments</caption>' +
      '<thead><tr><th scope="col">Compartment</th><th scope="col">Power</th><th scope="col">Share of ' + pGrandTW.toFixed(1) + ' TW</th><th scope="col">What it drives &amp; source</th></tr></thead><tbody>' +
      PF_SINKS.map(sk => '<tr><th scope="row">' + esc(sk.name) + '</th><td class="tnum">' + (sk.tw >= 1 ? sk.tw.toFixed(2).replace(/\.00$/, '.0') + ' TW' : Math.round(sk.tw * 1000) + ' GW') + '</td><td class="tnum">' + (sk.tw / pGrandTW * 100).toFixed(sk.tw < 1 ? 2 : 1) + '%</td><td style="text-align:left;white-space:normal">' + esc(sk.how) + '</td></tr>').join('') +
      '</tbody></table></div></details></figure>' +

      '<figure class="lab-fig calc-fig">' +
      '<figcaption><h3>What one operation costs, from a microbe to a computer</h3>' +
      '<p>Erasing one bit at 15 °C costs at least <b>k<sub>B</sub>T ln 2 = ' + X.sci(bitFloor) + ' J</b>. That is the floor physics allows. Microbes work close to it; brains and chips spend millions to billions of times more on each step, because they send fast signals over long distances without errors.</p></figcaption>' +
      '<div class="plot-wrap"><svg viewBox="0 0 ' + EW + ' ' + EH + '" class="plot fig" role="img" aria-label="Logarithmic comparison of joules per operation from Landauer’s 2.8×10⁻²¹ J floor through microbial enzymes, cortical synapses and AI tensor cores up to 2×10⁻¹⁰ J off-chip DRAM fetches.">' + eSvg + '</svg></div>' +
      '<p class="readout fig-read" id="ethRead" aria-live="polite">Hover, tap or tab to any row (Up/Down or Left/Right arrows) to inspect how its energy per event is calculated.</p>' +
      '<details class="evid-disc sm-disc"><summary><b>Show the energy-per-operation numbers &amp; equations</b></summary>' +
      '<div class="tbl-wrap" tabindex="0" role="region" aria-label="Energy cost per operation"><table class="rt"><caption>Energy cost per operation and multiple above Landauer’s floor at 15 °C</caption>' +
      '<thead><tr><th scope="col">System / operation</th><th scope="col">Energy per event (J)</th><th scope="col">× Landauer floor</th><th scope="col">Derivation</th></tr></thead><tbody>' +
      E_ITEMS.map((it, k) => '<tr><th scope="row">' + esc(it.name) + '</th><td class="tnum">' + X.sci(it.j) + ' J</td><td class="tnum">' + (k === 0 ? '1×' : '×' + X.sci(it.j / bitFloor)) + '</td><td style="text-align:left;white-space:normal">' + esc(it.how) + '</td></tr>').join('') +
      '</tbody></table></div></details></figure>';

    function bindSvgGroup(sel, onShow, onActivate) {
      const nodes = [...$('calcVisuals').querySelectorAll(sel)];
      nodes.forEach(g => {
        g.addEventListener('mouseenter', () => onShow(g));
        g.addEventListener('focus', () => onShow(g));
        g.addEventListener('click', () => { onShow(g); if (onActivate) onActivate(g); });
        g.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') { ev.preventDefault(); onShow(g); if (onActivate) onActivate(g); return; }
          if (ev.key === ' ') { ev.preventDefault(); return; }
          const step = (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') ? 1 : (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') ? -1 : 0;
          if (!step) return;
          const nx = nodes[nodes.indexOf(g) + step];
          if (nx) { ev.preventDefault(); nx.focus(); }
        });
        g.addEventListener('keyup', ev => {
          if (ev.key === ' ') { ev.preventDefault(); onShow(g); if (onActivate) onActivate(g); }
        });
      });
    }

    const wfRead = $('wfRead');
    bindSvgGroup('.wf-pt', g => {
      const st = WF_STEPS[Number(g.dataset.wfi)];
      if (!st || !wfRead) return;
      wfRead.innerHTML = '<b>' + esc(st.label) + '</b> (' + esc(st.valTxt) + ' → <b>' + esc(st.cellsTxt) + '</b>): ' + esc(st.detail) + ' <span class="muted">Study: ' + esc(st.study) + '.</span>';
    }, g => {
      const st = WF_STEPS[Number(g.dataset.wfi)];
      if (st && st.numCol) X.numPanel(st.numCol);
    });

    const pfRead = $('pfRead');
    bindSvgGroup('.pf-pt', g => {
      const idx = Number(g.dataset.pfi), sk = PF_SINKS[idx];
      if (!sk || !pfRead) return;
      $('calcVisuals').querySelectorAll('.pf-rib').forEach(r => r.setAttribute('stroke-opacity', Number(r.dataset.pfi) === idx ? '0.72' : '0.18'));
      const valLbl = sk.tw >= 1 ? sk.tw.toFixed(sk.tw % 1 ? 2 : 1).replace(/\.00$/, '.0') + ' TW' : Math.round(sk.tw * 1000) + ' GW';
      pfRead.innerHTML = '<b>' + esc(sk.name) + '</b>: <b>' + valLbl + '</b> (' + (sk.tw / pGrandTW * 100).toFixed(sk.tw < 1 ? 2 : 1) + '% of ' + pGrandTW.toFixed(1) + ' TW) — ' + esc(sk.how);
    }, g => {
      const sk = PF_SINKS[Number(g.dataset.pfi)];
      if (sk && sk.numCol) X.numPanel(sk.numCol);
    });

    const ethRead = $('ethRead');
    bindSvgGroup('.eth-pt', g => {
      const it = E_ITEMS[Number(g.dataset.ei)];
      if (!it || !ethRead) return;
      const mult = it.j / bitFloor;
      ethRead.innerHTML = '<b>' + esc(it.name) + '</b>: <b>' + X.sci(it.j) + ' J</b> (' + (mult < 1.01 ? 'exact physical floor' : '<b>×' + X.sci(mult) + '</b> above Landauer’s limit') + ') — ' + esc(it.how);
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

  /* ---------- B6: Source map (key studies on the left -> 26 census numbers on the right) ---------- */
  const smHost = $('sourceMap');
  if (smHost && X.SI.numrefs) {
    const L = window.SI_LEDGERS || {};
    const S = L.sources || { columns: [], rows: [] };
    const NR = X.SI.numrefs;
    const OVR = L.overrides || { columns: [], rows: [] };
    const ovColIdx = OVR.columns.indexOf('census_column'), ovTagIdx = OVR.columns.indexOf('provenance_tag');
    const unsourcedPast = new Set();
    OVR.rows.forEach(r => { if (r[ovTagIdx] === 'hand_unsourced') unsourcedPast.add(r[ovColIdx]); });

    const iSid = 0, iRef = S.columns.indexOf('primary_reference'), iCon = S.columns.indexOf('verified_empirical_constraint');
    const studies = S.rows.map(r => ({
      id: String(r[iSid]),
      ref: String(r[iRef >= 0 ? iRef : 1] || ''),
      short: String(r[iRef >= 0 ? iRef : 1] || '').replace(/\s*\([^)]*\).*$/, (_, m) => '').slice(0, 42),
      label: (() => {
        const raw = String(r[iRef >= 0 ? iRef : 1] || '');
        const m = raw.match(/^([^(]+?\(\d{4}(?:,\s*\d{4})?\))/);
        return m ? m[1].trim() : raw.slice(0, 38);
      })(),
      con: String(r[iCon >= 0 ? iCon : 2] || '')
    }));
    const studyIdx = {};
    studies.forEach((st, idx) => { studyIdx[st.id] = idx; });

    // Order the 26 census numbers by mean connected study index so connectors flow cleanly without tangles,
    // placing any number with zero key studies at the bottom in red outline.
    const numCols = Object.keys(NR).map(col => {
      const r = NR[col];
      const sids = (r.s || []).filter(id => studyIdx[id] != null);
      const meanIdx = sids.length ? sids.reduce((a, id) => a + studyIdx[id], 0) / sids.length : 999;
      return { col, name: X.numName(col), kind: r.kind, sids, meanIdx, basis: r.basis || '', hasUnsourcedPast: unsourcedPast.has(col) };
    }).sort((a, b) => (a.sids.length === 0) - (b.sids.length === 0) || a.meanIdx - b.meanIdx || a.name.localeCompare(b.name));

    const studyFeeds = {};
    studies.forEach(st => { studyFeeds[st.id] = []; });
    numCols.forEach(nc => { nc.sids.forEach(id => { if (studyFeeds[id]) studyFeeds[id].push(nc.col); }); });

    const rowH = 30, topY = 36;
    const nRowsMax = Math.max(studies.length, numCols.length);
    const SMW = 1000, SMH = topY + nRowsMax * rowH + 18;
    const LX = 16, LW = 336, RX = 628, RW = 356;
    const yL = idx => topY + idx * rowH + 12;
    const yR = idx => topY + idx * rowH + 12;

    const noStudyCount = numCols.filter(n => !n.sids.length).length;
    let edgesSvg = '', leftSvg = '', rightSvg = '';

    numCols.forEach((nc, ri) => {
      const yr = yR(ri);
      nc.sids.forEach(sid => {
        const li = studyIdx[sid];
        if (li == null) return;
        const yl = yL(li);
        const x1 = LX + LW, x2 = RX, mx = (x1 + x2) / 2;
        edgesSvg += '<path class="sm-edge" data-sid="' + esc(sid) + '" data-col="' + esc(nc.col) + '" d="M' + x1 + ' ' + yl + ' C' + mx + ' ' + yl + ' ' + mx + ' ' + yr + ' ' + x2 + ' ' + yr + '" fill="none" stroke="var(--ink-3)" stroke-width="1.35" stroke-opacity="0.28"/>';
      });
    });

    studies.forEach((st, li) => {
      const y = topY + li * rowH, ym = yL(li), cnt = (studyFeeds[st.id] || []).length;
      const lbl = st.label.length > 38 ? st.label.slice(0, 37) + '…' : st.label;
      leftSvg += '<g class="sm-node sm-study" data-sid="' + esc(st.id) + '" tabindex="0" role="button" aria-label="Study: ' + esc(st.ref) + ' — supports ' + cnt + (cnt === 1 ? ' number' : ' numbers') + '">' +
        '<rect x="' + LX + '" y="' + y + '" width="' + LW + '" height="24" rx="5" fill="var(--surface)" stroke="' + (cnt ? 'var(--line-2)' : 'var(--line)') + '" stroke-width="1.1"/>' +
        '<rect x="' + LX + '" y="' + y + '" width="4" height="24" rx="2" fill="' + (cnt ? 'var(--c-store)' : 'var(--ink-3)') + '"/>' +
        '<text x="' + (LX + 11) + '" y="' + (ym + 4) + '" fill="var(--ink)" font-size="11.5" font-weight="600">' + esc(lbl) + '</text>' +
        '<text x="' + (LX + LW - 8) + '" y="' + (ym + 4) + '" text-anchor="end" fill="var(--ink-3)" font-family="var(--mono)" font-size="10.5">' + (cnt ? cnt + (cnt === 1 ? ' num' : ' nums') : 'table ref') + '</text>' +
      '</g>';
    });

    numCols.forEach((nc, ri) => {
      const y = topY + ri * rowH, ym = yR(ri), gap = nc.sids.length === 0;
      const kindMap = { inventory: 'Counts', calc: 'Calc', assume: 'Assume', hand: 'Hand' };
      const badge = gap ? 'NO KEY STUDY' : (kindMap[nc.kind] || nc.kind) + ' · ' + nc.sids.length + (nc.sids.length === 1 ? ' study' : ' studies');
      const shortNm = nc.name.length > 31 ? nc.name.slice(0, 30) + '…' : nc.name;
      rightSvg += '<g class="sm-node sm-num' + (gap ? ' is-gap' : '') + '" data-col="' + esc(nc.col) + '" tabindex="0" role="button" aria-label="' + esc(nc.name) + (gap ? ' — no dedicated key study in register; click to inspect' : ' — supported by ' + nc.sids.length + ' key studies; click to open provenance') + '">' +
        '<rect x="' + RX + '" y="' + y + '" width="' + RW + '" height="24" rx="5" fill="var(--surface)" stroke="' + (gap ? 'var(--crisis)' : 'var(--line-2)') + '" stroke-width="' + (gap ? '1.8' : '1.1') + '"' + (gap ? ' stroke-dasharray="5 3"' : '') + '/>' +
        '<rect x="' + RX + '" y="' + y + '" width="4" height="24" rx="2" fill="' + (gap ? 'var(--crisis)' : nc.hasUnsourcedPast ? 'var(--c-power)' : 'var(--s-chem)') + '"/>' +
        '<text x="' + (RX + 11) + '" y="' + (ym + 4) + '" fill="' + (gap ? 'var(--crisis)' : 'var(--ink)') + '" font-size="11.5" font-weight="' + (gap ? '700' : '600') + '">' + esc(shortNm) + '</text>' +
        '<text x="' + (RX + RW - 8) + '" y="' + (ym + 4) + '" text-anchor="end" fill="' + (gap ? 'var(--crisis)' : 'var(--ink-3)') + '" font-family="var(--mono)" font-size="10.2" font-weight="' + (gap ? '700' : '500') + '">' + esc(badge) + '</text>' +
      '</g>';
    });

    const smSvg = '<text class="side" x="' + LX + '" y="20">AUDITED KEY STUDIES (' + studies.length + ')</text>' +
      '<text class="side" x="' + RX + '" y="20">CENSUS NUMBERS (' + numCols.length + ' · ' + noStudyCount + ' WITHOUT A KEY STUDY)</text>' +
      edgesSvg + leftSvg + rightSvg;

    const smTable = numCols.map(nc => {
      const sNames = nc.sids.map(id => { const s = studies[studyIdx[id]]; return s ? s.label : id; }).join('; ');
      return '<tr><th scope="row">' + esc(nc.name) + '</th><td>' + esc(nc.kind) + '</td><td>' + (sNames ? esc(sNames) : 'None — model assumption') + '</td><td>' + esc(nc.basis) + '</td></tr>';
    }).join('');

    smHost.innerHTML = '<figure class="viz-card" id="source-map">' +
      '<figcaption><h3>Source map: which studies hold up which numbers</h3><p>Verified anchor studies on the left connect to the 26 census numbers they support on the right. Hover or focus any study or number to trace its links; click any number on the right to open its full equation and moment-by-moment provenance. Numbers with no dedicated global study stand in <b>red dashed outline</b>.</p></figcaption>' +
      '<svg class="viz-svg" viewBox="0 0 ' + SMW + ' ' + SMH + '" role="img" aria-label="Two-column source map connecting ' + studies.length + ' key studies on the left to ' + numCols.length + ' census numbers on the right; ' + noStudyCount + ' number lacks a dedicated global study">' + smSvg + '</svg>' +
      '<p class="viz-readout" id="smRead" aria-live="polite">Hover or focus any study or census number to trace its evidence links, or click a number on the right to inspect how it is built.</p>' +
      '<details class="viz-a11y"><summary>Read the source-to-number map as a table</summary><div class="scroll" tabindex="0" role="region" aria-label="Scrollable data table"><table class="data"><caption>Key studies supporting each of the 26 census numbers</caption><thead><tr><th scope="col">Census number</th><th scope="col">Type</th><th scope="col">Supporting key studies</th><th scope="col">What it rests on</th></tr></thead><tbody>' + smTable + '</tbody></table></div></details>' +
      '</figure>';

    const smRead = $('smRead');
    const smNodes = [...smHost.querySelectorAll('.sm-node')];
    const smEdges = [...smHost.querySelectorAll('.sm-edge')];
    const highlightSm = el => {
      const sid = el.dataset.sid, col = el.dataset.col;
      smEdges.forEach(e => {
        const hit = sid ? e.dataset.sid === sid : e.dataset.col === col;
        e.setAttribute('stroke', hit ? 'var(--c-store)' : 'var(--ink-3)');
        e.setAttribute('stroke-width', hit ? '2.4' : '1.2');
        e.setAttribute('stroke-opacity', hit ? '0.92' : '0.10');
      });
      if (!smRead) return;
      if (sid) {
        const st = studies[studyIdx[sid]];
        const fed = (studyFeeds[sid] || []).map(c => X.numName(c));
        smRead.innerHTML = '<b>' + esc(st.ref) + '</b> — ' + esc(st.con) + (fed.length ? ' · Supports: <b>' + esc(fed.join(', ')) + '</b>.' : ' · Supports organism benchmark tables.');
      } else if (col) {
        const nc = numCols.find(x => x.col === col);
        if (!nc) return;
        const sList = nc.sids.map(id => studies[studyIdx[id]] && studies[studyIdx[id]].label).filter(Boolean);
        smRead.innerHTML = '<b>' + esc(nc.name) + '</b>: ' + (sList.length ? 'Supported by <b>' + esc(sList.join('; ')) + '</b>.' : '<b style="color:var(--crisis)">No dedicated global study</b> — model assumption.') + (nc.hasUnsourcedPast ? ' <span class="muted">(Earlier deep-time moments include hand-set scenarios; see Data Lab → Evidence heat map.)</span>' : '');
      }
    };
    const resetSm = () => {
      smEdges.forEach(e => { e.setAttribute('stroke', 'var(--ink-3)'); e.setAttribute('stroke-width', '1.35'); e.setAttribute('stroke-opacity', '0.28'); });
    };
    smNodes.forEach(el => {
      el.addEventListener('pointerenter', () => highlightSm(el));
      el.addEventListener('focus', () => highlightSm(el));
      el.addEventListener('pointerleave', resetSm);
      el.addEventListener('blur', resetSm);
      el.addEventListener('click', () => {
        highlightSm(el);
        if (el.dataset.col) X.numPanel(el.dataset.col);
      });
      el.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); highlightSm(el); if (el.dataset.col) X.numPanel(el.dataset.col); return; }
        if (ev.key === ' ') { ev.preventDefault(); return; }
        const step = (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') ? 1 : (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') ? -1 : 0;
        if (!step) return;
        const nx = smNodes[smNodes.indexOf(el) + step];
        if (nx) { ev.preventDefault(); nx.focus(); }
      });
      el.addEventListener('keyup', ev => {
        if (ev.key === ' ') { ev.preventDefault(); highlightSm(el); if (el.dataset.col) X.numPanel(el.dataset.col); }
      });
    });
  }

  /* ---------- B5: test today's 6 headline numbers (all baselines read from census & ledgers) ---------- */
  const eNowT = X.E[X.N - 1];
  const L_all = window.SI_LEDGERS || {};
  const devRows = (L_all.devices && L_all.devices.rows) || [];
  const devCols = (L_all.devices && L_all.devices.columns) || [];
  const devTot = devRows.find(r => /TOTAL GLOBAL/i.test(String(r[0]))) || [];
  const iPeak = devCols.indexOf('aggregate_peak_ops_sec'), iUtil = devCols.indexOf('utilization_central');
  const pwrRows = (L_all.power && L_all.power.rows) || [];
  const pwrCols = (L_all.power && L_all.power.columns) || [];
  const iBioC = pwrCols.indexOf('biomass_gt_c');
  const prokSub = pwrRows.find(r => /SUBTOTAL 1:/i.test(String(r[0]))) || [];
  const bProkNow = Number(prokSub[iBioC]) || 77.5;
  const mCellNow = Math.round(bProkNow * 1e30 / eNowT.cells);
  const synNow = eNowT.cneu / 0.1;
  const peakNow = Number(devTot[iPeak]) || 7.6e22;
  const utilNow = Number(devTot[iUtil]) || 0.249;
  const dnaProkNow = eNowT.cells * 6e6;
  const dnaEukNow = Math.max(0, eNowT.hcopy - dnaProkNow);
  const medRows = (L_all.media && L_all.media.rows) || [];
  const medCols = (L_all.media && L_all.media.columns) || [];
  const iMedCap = medCols.indexOf('installed_capacity_2026_bits');
  const ssdRow = medRows.find(r => /NAND Flash/i.test(String(r[0]))) || [];
  const ssdBitsNow = Number(ssdRow[iMedCap]) || 4.8e22;
  const magBitsNow = Math.max(0, eNowT.mexo - ssdBitsNow);

  const IN = {
    biomass: { name: 'Carbon in bacteria and archaea', v: bProkNow, unit: 'Gt C', kind: 'Measured', sym: 'B_prok',
      note: 'All the carbon held in microbes, from a global census of life. It is a modern estimate, not a count of every cell.', src: 'Bar-On, Phillips & Milo (2018)', sid: 'S1', tab: 'sources' },
    mass: { name: 'Carbon in one typical cell', v: mCellNow, unit: 'fg C', kind: 'Model assumption', sym: 'm_cell',
      note: 'One average cell size stands in for every microbe. Real cells vary by habitat: under the seafloor they hold about 14 fg each.', src: 'Kallmeyer et al. (2012) for the seafloor value', sid: 'S3', tab: 'sources' },
    synapses: { name: 'Synapses in all animals', v: synNow, unit: 'synapses', kind: 'Model estimate', sym: 'N_syn',
      note: 'Built from how many worms, insects and other animals there are, their neurons, and synapses per neuron. Each step has its own uncertainty.', src: 'van den Hoogen et al. (2019), Rosenberg et al. (2023), Herculano-Houzel (2016)', sid: 'S5, S6, S17', tab: 'sources' },
    rate: { name: 'Signals per synapse each second', v: 0.1, unit: 'per second', kind: 'Model assumption', sym: 'f_syn',
      note: 'How often an average synapse fires across mostly tiny cold-blooded invertebrates. With the synapse count fixed, 10% more firing means 10% more nerve signals.' },
    peak: { name: 'Top speed of every chip', v: peakNow, unit: 'ops/s', kind: 'Inventory', sym: 'P_peak',
      note: 'The peak speed of every AI accelerator, graphics card, server, PC and phone, added up. Different chips count operations differently.', src: 'Epoch AI (2025) and the device inventory', sid: 'S12', tab: 'devices' },
    util: { name: 'Share of time chips are busy', v: utilNow, unit: '', kind: 'Model assumption', sym: 'u',
      note: 'On average chips run at about a quarter of their top speed: AI chips in data centers near 60%, phones and PCs near 15%.', tab: 'devices' },
    dnaprok: { name: 'DNA in bacteria and archaea', v: dnaProkNow, unit: 'bits', kind: 'Calculated', sym: 'H_prok',
      note: '3.1×10³⁰ microbial cells times 3 million DNA letters per cell (6 million bits). Streamlined ocean cells carry less (~1.3–2 million letters), soil microbes carry more.', src: 'Landenmark et al. (2015), Giovannoni et al. (2005)', sid: 'S2', tab: 'dna' },
    dnaeuk: { name: 'DNA in complex cells', v: dnaEukNow, unit: 'bits', kind: 'Model estimate', sym: 'H_euk',
      note: '9.05×10²⁸ active plant, fungal, algal and animal cells times ~96 million DNA letters per cell (~1.92×10⁸ bits). Dead wood cells are excluded.', src: 'Bar-On et al. (2018), Landenmark et al. (2015)', sid: 'S1, S2', tab: 'dna' },
    magstore: { name: 'Hard disks, tape and print', v: magBitsNow, unit: 'bits', kind: 'Inventory', sym: 'M_mag',
      note: 'Enterprise cloud hard-disk drives (5.4×10²² bits) plus archival magnetic tape and optical/print libraries (1.8×10²² bits).', src: 'IDC Global StorageSphere (2025), INSIC Tape Roadmap', sid: 'S23', tab: 'media' },
    ssdstore: { name: 'Solid-state flash (SSDs)', v: ssdBitsNow, unit: 'bits', kind: 'Inventory', sym: 'M_nand',
      note: '3D NAND flash drives across phones, laptops and data centers (4.8×10²² bits). Holds charge for ~3.5 years unpowered vs. millennia for clay.', src: 'IDC Global StorageSphere (2025), JEDEC JESD218B', sid: 'S23', tab: 'media' },
    pbio: { name: 'Power used by living cells', v: eNowT.pbio, unit: 'W', kind: 'Calculated', sym: 'P_bio',
      note: 'Instantaneous respiration inside living cells: 14 TW microbes + 48.5 TW active plant, fungal and protist cells + 2.5 TW animals (excluding ~65 TW locked into dead wood and peat).', src: 'Bar-On et al. (2018), Field et al. (1998)', sid: 'S1', tab: 'power' },
    ptech: { name: 'Power used by human technology', v: eNowT.ptech, unit: 'W', kind: 'Measured', sym: 'P_tech',
      note: 'World primary energy supply from fossil fuels, renewables, nuclear and fuelwood (~19.5 TW), strictly excluding human food and draft-animal fodder.', src: 'Energy Institute (2024, 2025), Smil (2017)', sid: 'S22', tab: 'techpower' }
  };
  const MC = L_all.uncertainty || { rows: [] };
  const band = re => { const r = MC.rows.find(x => re.test(x[0])); return r ? [Number(r[3]), Number(r[5])] : null; };
  const OUT = [
    { k: 'cells', name: 'Bacteria and archaea cells', a: 'biomass', b: 'mass', op: '÷', f: (a, b) => a * 1e30 / b, unit: 'cells', color: 'var(--s-chem)', range: band(/Prokaryotic Cell Census/), sym: 'N = B × 10³⁰ ÷ m',
      note: 'Biomass divided by the carbon in one cell. Double the biomass and the count doubles; double the cell size and it halves.', ex: 'Elasticity +1 on biomass, −1 on cell mass.' },
    { k: 'neural', name: 'Nerve signals every second', a: 'synapses', b: 'rate', op: '×', f: (a, b) => a * b, unit: 'per second', color: 'var(--s-neuro)', range: band(/Neural Event Rate/), sym: 'C_neural = N_syn × f_syn',
      note: 'Synapses times how often each one fires. These are signals between nerve cells, not thoughts, and not the same thing as computer operations.', ex: 'Elasticity +1 on both inputs.' },
    { k: 'digital', name: 'Chip operations every second', a: 'peak', b: 'util', op: '×', f: (a, b) => a * b, unit: 'ops/s', color: 'var(--s-silicon)', range: band(/Executed Digital Throughput/), sym: 'C_digital = P_peak × u',
      note: 'Top speed times the share of time chips are busy. Chip work and nerve signals are different kinds of events, so they cannot be compared one to one.', ex: 'Elasticity +1 on both inputs.' },
    { k: 'hcopy', name: 'All DNA stored in cells', a: 'dnaprok', b: 'dnaeuk', op: '+', f: (a, b) => a + b, unit: 'bits', color: 'var(--c-store)', range: band(/DNA Copy Store H_copy/), sym: 'H_copy = H_prok + H_euk',
      note: 'Microbial DNA and nucleated-cell DNA contribute nearly half each today (~1.86×10³⁷ + 1.74×10³⁷ = 3.60×10³⁷ bits).', ex: 'Additive store closure (~52% prokaryotic, ~48% eukaryotic).' },
    { k: 'mexo', name: 'Memory outside the body', a: 'magstore', b: 'ssdstore', op: '+', f: (a, b) => a + b, unit: 'bits', color: 'var(--c-backup)', range: band(/Exosomatic Installed Storage M_exo/), sym: 'M_exo = M_mag + M_nand',
      note: 'Installed magnetic disks/tape plus solid-state flash sum to 1.2×10²³ bits (15 zettabytes)—distinct from ~200 ZB/yr of fleeting internet traffic.', ex: 'Additive storage closure (~60% magnetic/archival, ~40% flash).' },
    { k: 'ptot', name: 'Power used by life and technology', a: 'pbio', b: 'ptech', op: '+', f: (a, b) => a + b, unit: 'W', color: 'var(--c-power)', range: band(/Total Planetary Power P_total/), sym: 'P_total = P_bio + P_tech',
      note: 'Living cellular respiration (65.0 TW) plus human primary energy (19.5 TW) equals 84.5 TW. Technology is tightly measured; biological respiration sets almost all the uncertainty.', ex: 'Additive power closure (~77% biological, ~23% technological).' }
  ];
  const OK = {}; OUT.forEach(o => { OK[o.k] = o; });
  const outOf = k => OUT.find(o => o.a === k || o.b === k);
  const fmtTest = (u, v) => u === 'W' ? X.watts(v) : (v >= 1e4 ? X.sci(v) : X.plain(v)) + (u ? ' ' + u : '');
  const showIn = (k, v) => k === 'util' ? (v * 100).toFixed(1) + '%' : fmtTest(IN[k].unit, v);
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
      $('tv-' + o.k).textContent = fmtTest(o.unit, v);
      $('tc-' + o.k).textContent = Math.abs(ch) < 0.05 ? '' : sign(ch);
      // the band spans a quarter of the low end to four times the high end, on a log scale
      const r = o.range;
      if (r) {
        const lo = Math.log10(r[0] / 4), hi = Math.log10(r[1] * 4), at = x => ((Math.log10(x) - lo) / (hi - lo) * 100).toFixed(1) + '%';
        const z = $('tz-' + o.k); z.style.left = at(r[0]); z.style.width = 'calc(' + at(r[1]) + ' - ' + at(r[0]) + ')';
        $('tm-' + o.k).style.left = at(base); $('td-' + o.k).style.left = at(v);
        const inside = v >= r[0] && v <= r[1];
        $('td-' + o.k).classList.toggle('out', !inside);
        $('tr-' + o.k).innerHTML = 'Range we allow for: ' + (o.unit === 'W' ? X.watts(r[0]) + ' to ' + X.watts(r[1]) : X.sci(r[0]) + ' to ' + X.sci(r[1])) + '<span class="x-only"> (95%, 10,000 draws)</span>';
        if (o === outOf(pick)) reading = o.name + ': ' + fmtTest(o.unit, v) + (pct ? ' (' + sign(ch) + ')' : '') + '. ' +
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
