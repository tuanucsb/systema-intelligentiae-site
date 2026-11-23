/* Theories of Intelligence, Tracking Audit, Anti-Entropic Organization & Exponential Planetary Metric
   Every number, regression and milestone count is computed dynamically from window.SI and window.SI_LEDGERS. */
(function () {
  'use strict';
  const X = window.SIX, E = X.E, N = X.N, esc = X.esc, sci = X.sci, sup = X.sup;
  X.chrome('theories');
  const $ = id => document.getElementById(id);
  const LED = window.SI_LEDGERS || {};
  const nRows = k => (LED[k] && LED[k].rows ? LED[k].rows.length : (X.SI[k] ? X.SI[k].length : 0));
  const KB = 1.380649e-23;
  const eNow = E[N - 1], e0 = E[0];
  const TNow = eNow.temp + 273.15, bitNow = KB * TNow * Math.LN2;
  const f1 = n => n.toFixed(1), f2 = n => n.toFixed(2);
  const fmtGain = dex => (dex < 0.05 ? '1×' : dex < 4 ? Math.pow(10, dex).toFixed(1) + '×' : sci(Math.pow(10, dex)) + '×');

  // Ensure active nav item is scrolled into horizontal view inside .site-nav on narrow screens
  requestAnimationFrame(() => {
    const curNav = document.querySelector('.site-nav a[aria-current="page"]');
    if (curNav && getComputedStyle(curNav).display !== 'none') {
      try { curNav.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' }); } catch (e) { /* ignore */ }
    }
  });

  /* ---------- Expert banner helper ---------- */
  const turnBtn = $('turnOnExpert');
  if (turnBtn) {
    turnBtn.addEventListener('click', () => {
      const sw = document.getElementById('expertToggle');
      if (sw && !sw.checked) { sw.checked = true; sw.dispatchEvent(new Event('change')); }
    });
  }

  /* ---------- Compute 5-pillar Organizational Intelligence across all 68 moments ---------- */
  const lg10 = v => (v > 0 ? Math.log10(v) : 0);
  const RAW = E.map(e => {
    const T = e.temp + 273.15, bit = KB * T * Math.LN2;
    const B = (e.pbio + e.ptech) / bit;
    const K = e.hdiv + e.mexo;
    const cbio = e.cbio || 0, cbel = e.cbel || 0, cneu = e.cneu || 0, cai = e.cai || 0, csil = Math.max(0, (e.cdig || 0) - cai);
    const subFull = [cbio, cbel, cneu, csil, cai].reduce((a, x) => a + Math.log10(1 + x), 0);
    const subBio  = [cbio, cbel, cneu].reduce((a, x) => a + Math.log10(1 + x), 0);
    const A = Math.max(1, e.cmax || 1);
    const W = Math.sqrt(Math.max(1, e.mact || 1) * Math.max(1, e.grp || 1));
    return {
      T, bit, P: e.pbio + e.ptech, B,
      K, K_bio: e.hdiv,
      subFull, subBio,
      A, A_bio: Math.min(A, 1.5e14),
      W,
      lgB: lg10(B), lgK: lg10(K), lgKBio: lg10(e.hdiv),
      lgA: lg10(A), lgABio: lg10(Math.min(A, 1.5e14)), lgW: lg10(W)
    };
  });
  const R0 = RAW[0];

  const PILLARS = [
    { k: 'bud', sym: '𝔹 / 𝔹₀', name: 'Free-energy budget', color: 'var(--c-power)', desc: 'Landauer bit-operations/s paid for by biospheric + technospheric power (P / k_B T ln 2).' },
    { k: 'know', sym: 'K / K₀', name: 'Distinct knowledge', color: 'var(--c-store)', desc: 'Non-redundant genetic sequences (H_unique) plus exosomatic cultural & digital archives (M_exo).' },
    { k: 'sub', sym: 'Φ_sub / Φ₀', name: 'Multi-substrate stack', color: 'var(--c-cpu)', desc: 'Multiplicative capacity Π_s(1 + C_s) across chemistry, bioelectricity, nerves, silicon & AI.' },
    { k: 'peak', sym: 'C_max / C₀', name: 'Frontier agent peak', color: 'var(--c-io)', desc: 'Operations/s concentrated inside the single most capable cell, brain or compute cluster.' },
    { k: 'work', sym: '√(M_act·N_grp)', name: 'Working state × reach', color: 'var(--c-net)', desc: 'Volatile real-time working memory coupled across the largest coordinated collective.' }
  ];

  let weights = { bud: 1, know: 1, sub: 1, peak: 1, work: 1 };
  let activePreset = 'canonical';
  let bioOnly = false, normSub = false;
  let selIdx = N - 1;

  function pillarDex(i) {
    const r = RAW[i];
    const dB = lg10((bioOnly ? E[i].pbio / r.bit : r.B)) - R0.lgB;
    const dK = (bioOnly ? r.lgKBio : r.lgK) - R0.lgK;
    const rawSub = (bioOnly ? r.subBio : r.subFull) - R0.subFull;
    const dC = normSub ? rawSub / 5 : rawSub;
    const dA = (bioOnly ? r.lgABio : r.lgA) - R0.lgA;
    const dW = r.lgW - R0.lgW;
    return { bud: Math.max(0, dB), know: Math.max(0, dK), sub: Math.max(0, dC), peak: Math.max(0, dA), work: Math.max(0, dW) };
  }

  function computeSeries() {
    const wSum = PILLARS.reduce((s, p) => s + weights[p.k], 0) || 1;
    return E.map((_, i) => {
      const d = pillarDex(i);
      const parts = {};
      let tot = 0;
      PILLARS.forEach(p => {
        const c = (weights[p.k] * d[p.k]) / wSum;
        parts[p.k] = c;
        tot += c;
      });
      return { dex: tot, parts, raw: d };
    });
  }

  function linReg(xs, ys) {
    const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0, sst = 0;
    for (let k = 0; k < n; k++) { num += (xs[k] - mx) * (ys[k] - my); den += (xs[k] - mx) ** 2; sst += (ys[k] - my) ** 2; }
    const slope = den ? num / den : 0, intercept = my - slope * mx;
    const ssr = xs.reduce((s, x, k) => s + (ys[k] - (intercept + slope * x)) ** 2, 0);
    return { slope, intercept, r2: sst ? 1 - ssr / sst : 0 };
  }

  const baseSeries = computeSeries();
  const baseTopDex = baseSeries[N - 1].dex;
  const baseDoublings = baseTopDex / Math.log10(2);
  const ledgerCount = Object.keys(LED).length;
  const sysCount = LED.systems ? LED.systems.rows.length : 703;
  document.querySelectorAll('.js-n-moments').forEach(el => { el.textContent = String(N); });
  if ($('metricSlider')) { $('metricSlider').max = N - 1; $('metricSlider').value = selIdx; }

  /* ---------- Hero KPIs ---------- */
  $('heroKpis').innerHTML = [
    { c: 'var(--c-prog)', sub: 'Literature synthesis', val: '8 schools · 12 debates', txt: 'Schrödinger (1944) to Bennett (2023) & Agüera y Arcas (2025), tested against one dataset.' },
    { c: 'var(--c-store)', sub: 'Empirical audit scope', val: N + ' moments · ' + ledgerCount + ' ledgers', txt: sysCount.toLocaleString('en-US') + ' tracked systems, 10 functional board parts & 10,000-draw uncertainty closure.' },
    { c: 'var(--l-chem)', sub: 'Anti-entropic floor', val: sci(bitNow) + ' J/bit', txt: 'Landauer minimum at ' + Math.round(eNow.temp) + ' °C; ' + X.watts(RAW[N - 1].P) + ' holds Earth’s biology & archives ordered.' },
    { c: 'var(--c-cpu)', sub: 'Planetary intelligence gain', val: fmtGain(baseTopDex), txt: f1(baseTopDex) + ' orders of magnitude (' + f1(baseDoublings) + ' doublings) since 4.10 Ga.' }
  ].map(k => '<div class="th-kpi" style="--kc:' + k.c + '"><span class="sub">' + esc(k.sub) + '</span><b>' + k.val + '</b><span>' + esc(k.txt) + '</span></div>').join('');

  /* ==========================================================================
     SECTION 1: EIGHT FOUNDATIONAL BOOKS & THEORETICAL SCHOOLS
     ========================================================================== */
  const SCHOOLS = [
    { k: 'all', label: 'All 8 schools', c: 'var(--ink)' },
    { k: 'physics', label: 'Thermodynamics & physics', c: 'var(--c-power)' },
    { k: 'compute', label: 'Computation & automata', c: 'var(--c-make)' },
    { k: 'neuro', label: 'Evolution & neuroscience', c: 'var(--c-prog)' },
    { k: 'culture', label: 'Culture, explanation & AI', c: 'var(--c-backup)' }
  ];

  const BOOKS = [
    {
      id: 'schrodinger', cat: 'physics', color: 'var(--c-power)', yr: '1944',
      school: 'Thermodynamics & Statistical Biophysics',
      author: 'Erwin Schrödinger',
      work: 'What Is Life? The Physical Aspect of the Living Cell',
      thesis: 'Closed physical systems inexorably decay toward maximum-entropy equilibrium, yet living cells stay exquisitely ordered for decades and lineages for eons. Schrödinger deduced two physical requirements: organisms must continuously extract free energy ("feed on negative entropy") from environmental gradients, and heredity must reside in an "aperiodic crystal"—a discrete molecular code-script shielded against thermal k_B T noise and stabilized by diploid meiosis.',
      law: 'dS_cell / dt = Ṡ_internal − J_free-energy / T < 0   |   Code-script: 2 bits / base pair',
      origin: '4.10–3.80 billion yrs ago (alkaline hydrothermal vents & LUCA)',
      originHref: 'journey.html#EP01a',
      trackedHtml: () => 'Power closure (' + X.numBtn('p_metabolic_watts', X.watts(RAW[N - 1].P)) + ' today) and global DNA copy store (' + X.numBtn('h_copy_bits', sci(eNow.hcopy) + ' bits') + ' across ' + X.numBtn('total_cells', sci(eNow.cells) + ' living cells') + ').',
      aiView: 'Silicon data centers obey the exact same thermodynamic bookkeeping (80 GW electrical draw exported as low-grade heat), but lack self-maintaining metabolic closure.',
      verdict: 'Confirmed across all ' + N + ' moments: life’s global power budget closed under solar primary production (~65 TW bio) while DNA error rates fell to 10⁻¹⁰/bp.',
      critique: 'Explains how cellular structure persists across generations, but cannot by itself distinguish a metabolizing grass lawn from an adaptive brain: raw thermodynamic efficiency η actually peaked in Archean microbes because neurons and chips spend millions of times above Landauer’s floor for speed.',
      links: [['Visit Hadean vents →', 'journey.html#EP01a'], ['Walk DNA & genomes →', 'tree.html#path=dna'], ['Energy budget formula →', 'intelligence.html#f-budget']]
    },
    {
      id: 'vonneumann', cat: 'compute', color: 'var(--c-make)', yr: '1948 · 1961',
      school: 'Universal Automata, Information & Erasure Physics',
      author: 'John von Neumann, Claude Shannon & Rolf Landauer',
      work: 'Theory of Self-Reproducing Automata · Mathematical Theory of Communication · Irreversibility & Heat Generation',
      thesis: 'Von Neumann proved open-ended evolutionary complexity requires splitting a self-reproducing system into a passive symbolic tape (copied uninterpreted so mutations are heritable) and an active universal constructor that reads the tape to build physical machinery—the exact architecture of DNA + the ribosome discovered five years later. Shannon gave information its substrate-independent unit (the bit), and Landauer proved erasing one bit irreversibly dissipates at least k_B T ln 2 of heat.',
      law: 'Constructor = Tape(I) + Copier(B) + Builder(A) + Controller(C)   |   E_erase ≥ k_B T ln 2',
      origin: '3.80 billion yrs ago (DNA-ribosome split); reborn 1945 CE (stored-program computers)',
      originHref: 'journey.html#EP01b',
      trackedHtml: () => nRows('making') + '-step constructor ledger, executed silicon (' + X.numBtn('c_digital_ops_sec', sci(eNow.cdig) + ' ops/s') + ') and unique genetic diversity (' + X.numBtn('h_unique_bits', sci(eNow.hdiv) + ' bits') + ').',
      aiView: 'Modern AI runs on stored-program von Neumann hardware, hitting the 20,000× off-chip DRAM data-movement energy wall while still relying on human fabs to reproduce.',
      verdict: 'Resolves the hardware/wetware gap: dense H100 tensor math sits ~71× above cortical synapses in J/op, whereas EUV fabs remain non-autonomous constructors.',
      critique: 'Shannon entropy and Turing universality are intentionally semantic-blind: copying a random bitstring costs the same minimum Landauer heat as copying Newton’s Principia, so syntactic bit counts must be paired with selection (H_sel) and predictive utility.',
      links: [['Walk constructors & fabs →', 'tree.html#path=making'], ['Hardware & device ledgers →', 'data.html#devices']]
    },
    {
      id: 'margulis-gould', cat: 'neuro', color: 'var(--s-entity)', yr: '1981 · 1996',
      school: 'Symbiogenesis & Macroevolutionary Contingency',
      author: 'Lynn Margulis & Stephen Jay Gould',
      work: 'Symbiosis in Cell Evolution (1981) · Wonderful Life (1989) · Full House (1996)',
      thesis: 'Margulis demonstrated that life’s greatest bioenergetic leap—the complex eukaryotic cell—came not from point mutations, but from symbiogenetic fusion of an archaeon and an aerobic bacterium (mitochondria), multiplying energy per gene ~10,000-fold. Gould showed that because life began against a "left wall" of minimal prokaryotic viability, bacteria remain Earth’s modal organisms (>97% of cells); rising complexity is strictly an expanding right-hand tail repeatedly pruned by contingent mass extinctions.',
      law: 'σ_Gould(t) = log₁₀( C_max,entity(t) / 10³ )   |   Modal cell ≈ 846 ops/s for 4.1 Gyr',
      origin: '1.85 billion yrs ago (eukaryogenesis) & 7 planetary extinction resets',
      originHref: 'journey.html#EP04a',
      trackedHtml: () => 'Right-tail complexity lead (' + X.numBtn('gould_variance_right_tail', f1(eNow.gould) + ' digits') + ') and single-entity peak (' + X.numBtn('c_max_entity_ops_sec', sci(eNow.cmax) + ' ops/s') + ').',
      aiView: 'Views human-machine coupling as an ecological/symbiotic guild, while warning against reading vertebrate or AI history as an inevitable ladder.',
      verdict: 'Strongly supported: bacterial cell counts stay near 3.1×10³⁰ while σ_Gould widens from 0 to 17.5 orders of magnitude and End-Permian / K-Pg shocks crash neural ops by >92%.',
      critique: 'Strict anti-progress skepticism at the single-species level can miss genuine planet-scale ratchets: after each mass extinction, peak brain neuron density and exosomatic memory rebounded past pre-crisis ceilings.',
      links: [['Follow symbiogenesis →', 'tree.html#path=symbio'], ['Visit the Great Dying →', 'journey.html#EP14a']]
    },
    {
      id: 'bennett', cat: 'neuro', color: 'var(--c-prog)', yr: '2023',
      school: 'Evolutionary Vertebrate Neuroscience',
      author: 'Max Bennett',
      work: 'A Brief History of Intelligence: Evolution, AI, and the Five Breakthroughs That Made Our Brains',
      thesis: 'Intelligence in the animal brain was built through five cumulative architectural breakthroughs along the bilaterian-to-human lineage: (1) Steering (~540 Ma, bilateral sensors + positive/negative valence), (2) Reinforcing (~500 Ma, vertebrate basal ganglia + dopamine temporal-difference reward prediction error), (3) Simulating (~200 Ma, mammalian neocortex + hippocampal episodic replay for vicarious trial-and-error), (4) Mentalizing (~34–20 Ma, primate granular prefrontal Theory of Mind), and (5) Speaking (~300 ka, nested human language).',
      law: 'Brain stack = Steering ⊂ Dopamine RL ⊂ Cortical Simulation ⊂ Theory of Mind ⊂ Grammar',
      origin: '~555–541 million yrs ago (early bilaterian worm navigation & Cambrian steering)',
      originHref: 'journey.html#EP08a',
      trackedHtml: () => 'Global animal synaptic signaling (' + X.numBtn('c_neural_ops_sec', sci(eNow.cneu) + ' signals/s') + ' across ' + X.numBtn('n_neurons_global', sci(eNow.neurons) + ' neurons') + ') and ' + nRows('neural') + ' circuit milestones.',
      aiView: 'Inversion thesis: Large Language Models trained on human text mastered Breakthrough 5 (Speaking) first, without the embodied homeostatic drives and world-models of Breakthroughs 1–4.',
      verdict: 'Maps cleanly onto vertebrate fossil/molecular anchors, while our clade census adds a twist: nematodes and arthropods still hold >90% of Earth’s animal neurons.',
      critique: 'Tracking the human ancestral spine underweights convergent non-mammalian intelligence—especially corvid and parrot nuclear pallia (packing 2.4×10⁸ neurons/g without six-layered cortex), octopus distributed arm nervous systems, and eusocial insect colonies.',
      links: [['Walk Bennett’s 5 breakthroughs →', 'tree.html#path=bennett'], ['54-species brain ledger →', 'data.html#brains']]
    },
    {
      id: 'aguera', cat: 'compute', color: 'var(--c-wire)', yr: '2025',
      school: 'Computational Abiogenesis & Predictive Symbiogenesis',
      author: 'Blaise Agüera y Arcas',
      work: 'What Is Life?: Evolution as Computation · What Is Intelligence?: Lessons from AI About Evolution, Computing, and Minds',
      thesis: 'Life and mind are one continuous phenomenon—general-purpose predictive computation. In unseeded BFF Turing-tape experiments with zero fitness objective, random programs colliding in memory spontaneously phase-transition into self-copying replicators. Across 4.1 billion years, symbiogenesis (replicators merging into higher-level cooperative units) and sequence prediction (compressing past sensory inputs to forecast the next state, from bacterial Umwelt to cortical replay to Transformers) drive every major transition.',
      law: 'Life ≡ Self-modifying replicator computation   |   Mind ≡ Next-state sequence prediction',
      origin: '4.10 billion yrs ago (spontaneous computational abiogenesis) → 2026 planetary AI',
      originHref: 'journey.html#EP32a',
      trackedHtml: () => 'Learned neural-net tensor compute (' + X.numBtn('c_digital_ai_ops_sec', sci(eNow.cai) + ' AI ops/s') + ') and largest coordinated network (' + X.numBtn('max_collective_group_size', sci(eNow.grp) + ' individuals') + ').',
      aiView: 'Sequence-predicting foundation models and test-time reasoning clusters are genuinely intelligent minds; human-AI coupling is Earth’s next symbiogenetic transition.',
      verdict: 'Captures the explosive ×2.4/yr growth of learned AI compute since 2012 and unifies DNA, sex, brains and stored-program machines on one conceptual board.',
      critique: 'Equating sequence prediction with full biological agency faces two physical counterweights in our ledgers: global silicon still runs ~15,900× fewer events/s than animal synapses, and AI hardware requires external human industrial megawatts to persist and replicate.',
      links: [['Visit Transformers & AI →', 'journey.html#EP32a'], ['Communication networks ledger →', 'data.html#networks']]
    },
    {
      id: 'friston', cat: 'physics', color: 'var(--c-io)', yr: '2010 · 2022',
      school: 'Variational Free Energy & Predictive Processing',
      author: 'Karl Friston, Jakob Hohwy & Andy Clark',
      work: 'The Free-Energy Principle (2010) · Surfing Uncertainty (2016) · Active Inference (2022)',
      thesis: 'Any self-organizing system separated from a noisy world by a statistical boundary—a Markov blanket of sensory and active states (cell membrane, skin/muscles, colony perimeter)—persists far from equilibrium if and only if it minimizes variational free energy, an upper bound on sensory surprise (−ln p(o|m)). It has only two moves: update its internal generative model to match observations (perception/learning) or act on the world to make its predictions come true (active control).',
      law: 'F(q, o) = D_KL[ q(z) ∥ p(z | o, m) ] − ln p(o | m)   ⟹   Minimize surprise + model complexity',
      origin: '4.10–3.50 billion yrs ago (lipid/mineral Markov blankets & bacterial chemotaxis)',
      originHref: 'journey.html#EP02a',
      trackedHtml: () => 'Volatile real-time working state (' + X.numBtn('m_active_bits', sci(eNow.mact) + ' active bits') + ' across protein phosphorylation, membrane voltages, Ca²⁺ buffers & DRAM).',
      aiView: 'World-modeling + active tool-use loops move passive predictors toward genuine active-inference agents, governed by a shared speed-accuracy-energy Pareto frontier.',
      verdict: 'Directly links Schrödinger’s thermodynamic survival to Bayesian neuroscience and matches the τ⁻⁰·⁶² deliberation error-scaling across mammals and reasoning models.',
      critique: 'Because even a bacterium or simple homeostat minimizes variational free energy over a 1-second horizon, the framework requires explicit counterfactual horizon (τ_delib) and stored model capacity (K) to separate reflexes from deep planning.',
      links: [['Visit bacterial chemotaxis →', 'journey.html#EP02a'], ['Check Paper 3 deliberation check →', 'research.html#paper3']]
    },
    {
      id: 'levin-hawkins', cat: 'neuro', color: 'var(--c-cpu)', yr: '2021 · 2022',
      school: 'Scale-Free Bioelectricity & Cortical Reference Frames',
      author: 'Michael Levin & Jeff Hawkins',
      work: 'Technological Approach to Mind Everywhere (TAME, 2022) · A Thousand Brains (2021)',
      thesis: 'Levin shows cognition predates neurons: non-neural gap-junction bioelectric networks store anatomical target morphologies as collective memories, scaling each cell’s tiny "cognitive light cone" into tissue- and organism-scale goals. Hawkins proposes that mammalian neocortex scaled general intelligence by tiling ~150,000 homologous cortical columns—each pairing sensory input with grid-cell-like 3D reference frames—that vote laterally to build compositional object and concept models.',
      law: 'Cognitive Light Cone = Spatial × Temporal goal radius   |   Cortex = N_columns × Reference-frame voting',
      origin: '1.50 Ga–635 Ma (bioelectric sheets & pre-neural scaffolds) → 200 Ma (cortical columns)',
      originHref: 'journey.html#EP05b',
      trackedHtml: () => 'Non-neural bioelectric signaling (' + X.numBtn('c_bioelectric_ops_sec', sci(eNow.cbel) + ' events/s') + ' in plants, biofilms & tissues) and 11 pre-neural ion-channel/synapse gene families.',
      aiView: 'Suggests monolithic sequence models still lack modular reference-frame voting and multi-scale homeostatic self-repair (morphogenetic plasticity).',
      verdict: 'Validated by nerve_genes_evolution (ion pores & PSD-95 scaffolds predate neurons by >500 Myr) and cortical scaling across 54 dissected species.',
      critique: 'Six-layered cortical columns are not the sole route to abstract reference frames: birds evolved non-layered nuclear pallia (DVR/wulst) that match primate tool-making and planning at a fraction of mammalian brain mass.',
      links: [['Visit pre-neural synapse parts →', 'journey.html#EP05b'], ['Molecular motors & wiring →', 'tree.html#path=motors']]
    },
    {
      id: 'henrich-deutsch-chollet', cat: 'culture', color: 'var(--c-backup)', yr: '2011 · 2015 · 2019',
      school: 'Cumulative Cultural Ratchet, Universal Explanation & Skill Efficiency',
      author: 'Joseph Henrich, David Deutsch & François Chollet',
      work: 'The Secret of Our Success (2015) · The Beginning of Infinity (2011) · On the Measure of Intelligence (2019)',
      thesis: 'Individual Homo sapiens brains did not grow over the last 30,000 years; civilization exploded because high-fidelity social learning and external symbols forged a "Collective Brain" (Henrich) that prevents knowledge loss at death. Once cumulative archives cross a critical threshold, societies discover universal explanatory conjectures capable of transforming arbitrary physical matter (Deutsch)—while true general intelligence is measured by sample-efficient program synthesis on novel tasks rather than frozen skill memorization (Chollet).',
      law: 'IS(system) = Skill_generalization / (Prior + Experience)   |   M_exo(2026) ≫ H_unique(DNA)',
      origin: '3.3 million yrs ago (stone-tool traditions) → 3200 BCE (writing) → 1450 (print) → cloud',
      originHref: 'journey.html#EP25a',
      trackedHtml: () => 'Exosomatic memory (' + X.numBtn('m_exo_installed_bits', sci(eNow.mexo) + ' bits') + ', surpassing unique DNA ' + X.numBtn('h_unique_bits', sci(eNow.hdiv) + ' bits') + ' by >10 orders of magnitude).',
      aiView: 'Distinguishes vast pre-trained cultural compression (memorizing the Collective Brain) from sample-efficient on-the-fly synthesis when facing genuinely out-of-distribution problems.',
      verdict: 'Explains the sharpest inflection in our entire census: human skull volume stayed flat while exosomatic storage rose ×10¹⁹ from early hominins to 15 zettabytes.',
      critique: 'Reveals the Archival Fragility Paradox in our persistence ledger: unpowered clay cuneiform survives 5,000 years at 0 W, whereas modern 3D NAND flash decays in ~3.5 years without 20 GW of continuous electrical maintenance.',
      links: [['Walk how memory left the body →', 'tree.html#path=memory'], ['Persistence media ledger →', 'data.html#media']]
    }
  ];

  let curSchool = 'all', critiquesOpen = false;

  function renderBooks() {
    $('schoolFilter').innerHTML = SCHOOLS.map(s =>
      '<button type="button" class="th-pill" data-s="' + s.k + '" aria-pressed="' + (s.k === curSchool) + '" style="--pc:' + s.c + '">' +
      '<i></i>' + esc(s.label) + '</button>'
    ).join('');

    const list = curSchool === 'all' ? BOOKS : BOOKS.filter(b => b.cat === curSchool);
    $('theoryCards').innerHTML = list.map(b =>
      '<article class="th-book" id="book-' + b.id + '" style="--bc:' + b.color + '">' +
      '<div class="th-book-top"><span class="th-book-school">' + esc(b.school) + '</span><span class="th-book-yr">' + esc(b.yr) + '</span></div>' +
      '<h3>' + esc(b.author) + '</h3>' +
      '<p class="th-book-work"><cite>' + esc(b.work) + '</cite></p>' +
      '<p class="th-book-thesis">' + esc(b.thesis) + '</p>' +
      '<div class="th-book-law">' + esc(b.law) + '</div>' +
      '<dl class="th-book-meta">' +
      '<dt>Origin threshold</dt><dd><a href="' + b.originHref + '">' + esc(b.origin) + '</a></dd>' +
      '<dt>Tracked in census</dt><dd>' + b.trackedHtml() + '</dd>' +
      '<dt>Census verdict</dt><dd><b>' + esc(b.verdict) + '</b></dd>' +
      '</dl>' +
      '<details class="evid-disc sm-disc th-crit-disc"' + (critiquesOpen ? ' open' : '') + '>' +
      '<summary>AI implication &amp; methodological blind spot</summary>' +
      '<div class="th-critique"><p style="margin-bottom:6px"><b style="color:var(--ink)">On modern AI:</b> ' + esc(b.aiView) + '</p>' +
      '<p><b style="color:var(--ink)">Blind spot / tension:</b> ' + esc(b.critique) + '</p></div></details>' +
      '<div class="th-book-links">' + b.links.map(l => '<a href="' + l[1] + '">' + esc(l[0]) + '</a>').join('') + '</div>' +
      '</article>'
    ).join('');
  }

  $('schoolFilter').addEventListener('click', ev => {
    const btn = ev.target.closest('[data-s]');
    if (!btn) return;
    curSchool = btn.dataset.s;
    renderBooks();
  });
  $('toggleCritiques').addEventListener('click', () => {
    critiquesOpen = !critiquesOpen;
    $('toggleCritiques').setAttribute('aria-expanded', String(critiquesOpen));
    $('toggleCritiques').textContent = critiquesOpen ? 'Collapse critiques & blind spots' : 'Expand all critiques & blind spots';
    document.querySelectorAll('.th-crit-disc').forEach(d => { d.open = critiquesOpen; });
  });
  renderBooks();

  $('theoryMatrixBody').innerHTML = BOOKS.map(b =>
    '<tr style="--rc:' + b.color + '">' +
    '<th scope="row">' + esc(b.author) + '<br><small style="font-family:var(--body);font-weight:400;color:var(--ink-3)">' + esc(b.yr) + '</small></th>' +
    '<td>' + esc(b.school) + '</td>' +
    '<td><a href="' + b.originHref + '">' + esc(b.origin) + '</a></td>' +
    '<td>' + b.trackedHtml() + '</td>' +
    '<td>' + esc(b.aiView) + '</td>' +
    '<td><b style="color:var(--ink)">' + esc(b.verdict) + '</b></td>' +
    '</tr>'
  ).join('');

  /* ==========================================================================
     SECTION 2: TWELVE DEEP-TIME CROSSROADS (X.PERSP)
     ========================================================================== */
  function renderCrossroads(q, forceOpen) {
    const term = (q || '').trim().toLowerCase();
    const rows = (X.PERSP || []).filter(p => {
      if (!term) return true;
      const hay = [p.title, p.schrodinger, p.bennett, p.aguera].concat(p.inventions || []).join(' ').toLowerCase();
      return hay.includes(term);
    });
    if (!rows.length) {
      $('crossList').innerHTML = '<p class="muted">No crossroads match “' + esc(q) + '”.</p>';
      return;
    }
    $('crossList').innerHTML = rows.map((p, k) => {
      const openAttr = forceOpen === true || (forceOpen == null && (term || k === 0 || p.id === 'ai-debate')) ? ' open' : '';
      const epLinks = (p.epochs || []).slice(0, 4).map(ep => {
        const idx = X.IDX[ep], st = X.STOP[ep];
        const lbl = idx != null ? X.fmtShort(E[idx].t) + (st ? ' · ' + st.who : '') : ep;
        return '<a href="journey.html#' + esc(ep) + '">Stop: ' + esc(lbl) + '<span class="x-only mono"> · ' + esc(ep) + '</span></a>';
      }).join('');
      const invLinks = (p.inventions || []).slice(0, 5).map(id => {
        const u = X.INVK[id];
        return u ? '<a href="tree.html#' + esc(id) + '">Tree: ' + esc(u.label) + '</a>' : '';
      }).join('');
      return '<details class="evid-disc persp-disc th-cross-item" id="cross-' + esc(p.id) + '"' + openAttr + ' style="padding:12px 16px;border-radius:var(--r-lg)">' +
        '<summary><span style="color:var(--ink-3);font-variant-numeric:tabular-nums;margin-right:4px">' + String(k + 1).padStart(2, '0') + '.</span> <b>' + esc(p.title) + '</b></summary>' +
        '<div class="persp-grid">' +
        '<div class="persp-col" style="--pc:var(--c-power)"><span class="sub">E. Schrödinger · <cite>What Is Life?</cite> (1944)</span><p>' + esc(p.schrodinger) + '</p></div>' +
        '<div class="persp-col" style="--pc:var(--c-prog)"><span class="sub">M. Bennett · <cite>A Brief History of Intelligence</cite> (2023)</span><p>' + esc(p.bennett) + '</p></div>' +
        '<div class="persp-col" style="--pc:var(--c-net)"><span class="sub">B. Agüera y Arcas · <cite>What Is Intelligence?</cite> (2025)</span><p>' + esc(p.aguera) + '</p></div>' +
        '</div>' +
        '<div class="th-cross-meta">' + epLinks + invLinks + '</div>' +
        '</details>';
    }).join('');
  }
  renderCrossroads('', null);
  $('crossSearch').addEventListener('input', ev => renderCrossroads(ev.target.value, null));
  $('openAllCross').addEventListener('click', () => { document.querySelectorAll('.th-cross-item').forEach(d => { d.open = true; }); });
  $('closeAllCross').addEventListener('click', () => { document.querySelectorAll('.th-cross-item').forEach(d => { d.open = false; }); });

  /* ==========================================================================
     SECTION 3: FULL TRACKING & EPISTEMIC AUDIT REVIEW
     ========================================================================== */
  // 3A. Epistemic grade breakdown across the 68 census moments
  const epiOrder = [
    ['Calibrated Modern Inventory', 'var(--l-chem)'],
    ['Historical & Archaeological Reconstruction', 'var(--c-store)'],
    ['Proxy-Constrained Phanerozoic Scenario', 'var(--c-prog)'],
    ['Deep-Time Conditional Scenario', 'var(--c-power)']
  ];
  $('epiBars').innerHTML = epiOrder.map(([key, col]) => {
    const info = X.EPI[key] || { label: key, lvl: 1 };
    const matched = E.filter(e => e.epi === key);
    const cnt = matched.length, pct = (cnt / N * 100).toFixed(0);
    const span = matched.length ? X.fmtShort(matched[0].t) + ' → ' + X.fmtShort(matched[matched.length - 1].t) : '';
    return '<div class="th-ev-row">' +
      '<div class="th-ev-top"><b><span class="meter" aria-hidden="true">' + [1, 2, 3, 4].map(n => '<i class="' + (n <= info.lvl ? 'on' : '') + '"></i>').join('') + '</span>' + esc(info.label) + '</b>' +
      '<span>' + cnt + ' of ' + N + ' moments (' + pct + '%) · ' + esc(span) + '</span></div>' +
      '<div class="th-ev-track"><i style="width:' + pct + '%;background:' + col + '"></i></div></div>';
  }).join('');

  // 3B. Evidence class breakdown across all dated evolutionary milestone ledgers
  const milestonePools = ['genomes', 'sex', 'motors', 'plants', 'immunity', 'nervegenes', 'neural', 'networks', 'offworld'];
  const evCounts = { measured: 0, fossil: 0, molecular_clock: 0, living_inference: 0, estimate: 0 };
  let totalMilestones = 0;
  milestonePools.forEach(k => {
    (X.SI[k] || []).forEach(r => {
      const ev = r.ev || 'estimate';
      evCounts[ev] = (evCounts[ev] || 0) + 1;
      totalMilestones++;
    });
  });
  const EV_META = [
    ['measured', '◆ Measured today (censuses, genomes & hardware)', 'var(--l-chem)'],
    ['fossil', '● Direct fossil or archaeological trace', 'var(--c-store)'],
    ['molecular_clock', '■ Calibrated gene / molecular clock', 'var(--c-cpu)'],
    ['living_inference', '▲ Inferred across living sister clades', 'var(--c-power)'],
    ['estimate', '○ Mechanistic / stoichiometric estimate', 'var(--ink-3)']
  ];
  $('evTypeBars').innerHTML = EV_META.map(([k, lbl, col]) => {
    const c = evCounts[k] || 0, pct = totalMilestones ? (c / totalMilestones * 100).toFixed(0) : 0;
    return '<div class="th-ev-row">' +
      '<div class="th-ev-top"><b>' + esc(lbl) + '</b><span>' + c + ' of ' + totalMilestones + ' milestones (' + pct + '%)</span></div>' +
      '<div class="th-ev-track"><i style="width:' + pct + '%;background:' + col + '"></i></div></div>';
  }).join('');

  // 3C. 14-Domain Track Audit Table
  const TRACKS = [
    {
      name: 'Biomass, Cells & Power Closure', c: 'var(--l-chem)',
      rows: N + ' moments + ' + nRows('power') + ' power compartments',
      span: '10⁵ W → 84.5 TW · 550 Gt C · 3.1×10³⁰ cells',
      anchors: 'Bar-On et al. (2018); Kallmeyer et al. (2012); Magnabosco et al. (2018); Whitman et al. (1998)',
      audit: '✓ Closed 2026 carbon & power budgets (separating 380 Gt C dead wood from living cells); pre-541 Ma cell totals are geochemical scenarios.',
      links: [['Census →', 'data.html'], ['Power ledger →', 'data.html#power']]
    },
    {
      name: 'DNA, Genomes & Copy Fidelity', c: 'var(--c-store)',
      rows: nRows('genomes') + ' genome milestones + ' + N + '-step inventory',
      span: '~200 RNA letters → 160 Gb (Tmesipteris fern) · 3.6×10³⁷ bits',
      anchors: 'Moody et al. (2024) LUCA; Landenmark et al. (2015); Lynch (2010) drift-barrier; Coelho et al. (2022)',
      audit: '✓ Modern H_copy sits within 1 SD of Landenmark; H_unique (3.8×10¹² bits) is bounded from 303M sampled gene clusters and interpolated in deep time.',
      links: [['Genomes ledger →', 'data.html#genomes'], ['Tree path →', 'tree.html#path=dna']]
    },
    {
      name: 'Sexual Reproduction & Recombination', c: 'var(--c-make)',
      rows: nRows('sex') + ' sophistication milestones',
      span: '3.8 Ga RecA repair → 1.05 Ga Bangiomorpha → IVF & screening',
      anchors: 'Butterfield (2000); Long et al. (2014) Microbrachius; Hawkes et al. (1998) grandmother hypothesis',
      audit: '✓ Every row carries fossil or molecular-clock bounds; behavioral mate-choice intensity in extinct taxa is inferred from living clades.',
      links: [['Sex ledger →', 'data.html#sex'], ['Tree path →', 'tree.html#path=sex']]
    },
    {
      name: 'Molecular Motors & Intracellular Wiring', c: 'var(--c-wire)',
      rows: nRows('motors') + ' biophysical transport milestones',
      span: 'FtsZ rings → 1–5 µm/s kinesin/dynein → 50 µm/s Myosin XI',
      anchors: 'Vale et al. (1985); Hirokawa et al. (2009); Wickstead & Gull (2011)',
      audit: '✓ Step sizes (8 nm), stall forces (5–7 pN) and speeds measured by single-molecule optical traps; LECA repertoire inferred phylogenetically.',
      links: [['Motors ledger →', 'data.html#motors'], ['Tree path →', 'tree.html#path=motors']]
    },
    {
      name: 'Replication & Universal Constructors', c: 'var(--c-make)',
      rows: nRows('making') + ' replication & manufacturing steps',
      span: 'Autocatalysis & ribosome → Gutenberg molds → EUV chip fabs',
      anchors: 'von Neumann (1966); Watson & Crick (1953); Gibson et al. (2010) synthetic cell',
      audit: '✓ Highlights self-sufficiency: bacteria self-copy at ~20 nJ/cell, whereas semiconductor fabs require global supply chains and megawatts.',
      links: [['Making ledger →', 'data.html#making'], ['Tree path →', 'tree.html#path=making']]
    },
    {
      name: 'Plants & Fungal Non-Neural Sensing', c: 'var(--s-chem)',
      rows: nRows('plants') + ' sensing & memory milestones',
      span: '0.5 s eyespot → 20 s Ca²⁺ counter → winter Polycomb chromatin & seed dormancy',
      anchors: 'Toyota et al. (2018) GLR waves; Böhm et al. (2016) Dionaea; Angel et al. (2011) FLC; Karst et al. (2023)',
      audit: '✓ Explicitly separates proven vascular glutamate waves, VOCs and mycorrhizal nutrient trade from over-claimed forest-wide "mother tree" messaging.',
      links: [['Plants ledger →', 'data.html#plants'], ['Tree path →', 'tree.html#path=plants']]
    },
    {
      name: 'Immune Systems & Somatic Memory', c: 'var(--c-prog)',
      rows: nRows('immunity') + ' antiviral & adaptive milestones',
      span: '3.8 Ga restriction enzymes & CRISPR → 10¹¹–10¹⁴ V(D)J / VLR clones → 42-day mRNA',
      anchors: 'Barrangou et al. (2007); Tonegawa (1983); Pancer et al. (2004); Karikó et al. (2005)',
      audit: '✓ Contrasts Lamarckian heritable CRISPR arrays with convergent somatic lymphocyte shuffling in lampreys and jawed vertebrates.',
      links: [['Immunity ledger →', 'data.html#immunity'], ['Tree path →', 'tree.html#path=immunity']]
    },
    {
      name: 'Pre-Neural Genes & Bioelectricity', c: 'var(--c-io)',
      rows: nRows('nervegenes') + ' gene families + 5 bioelectric groups',
      span: '3.5 Ga bacterial K⁺ pores → sponge PSD scaffolds → tree & biofilm waves',
      anchors: 'Sakarya et al. (2007); Moroz et al. (2014); Burkhardt et al. (2023); Crowther et al. (2015)',
      audit: '✓ Tree phloem signaling anchored to 3.04×10¹² trees; global bacterial biofilm potassium-wave share spans 10²⁴–10²⁶ events/s.',
      links: [['Nerve genes →', 'data.html#nervegenes'], ['Journey stop →', 'journey.html#EP05b']]
    },
    {
      name: 'Nervous Systems & Circuit Breakthroughs', c: 'var(--c-cpu)',
      rows: nRows('neural') + ' circuit milestones + ' + nRows('neuronsbygroup') + '-step clade census',
      span: '0 → 3.4×10²⁴ neurons · 3.0×10²⁶ synaptic signals/s · 120 m/s myelin',
      anchors: 'Ma et al. (2012) Fuxianhuia; van den Hoogen et al. (2019); Rosenberg et al. (2023); Attwell & Laughlin (2001)',
      audit: '✓ Bottom-up clade sum (~6×10²³ counted land neurons vs. 3.4×10²⁴ upper model including marine zooplankton); pelagic arthropod neuron counts remain under-sampled.',
      links: [['Neural ledger →', 'data.html#neural'], ['Neurons by clade →', 'data.html#neuronsbygroup']]
    },
    {
      name: 'Brain Architecture & Biggest Brains', c: 'var(--s-neuro)',
      rows: nRows('brains') + ' dissected species + ' + nRows('biggest') + ' moment leaders',
      span: '302 neurons (C. elegans) → 8.6×10¹⁰ (human) → 2.57×10¹¹ (elephant)',
      anchors: 'Herculano-Houzel (2016, 2023); Olkowicz et al. (2016) avian pallium; Caspar et al. (2024)',
      audit: '✓ Isotropic fractionator counts for living species; non-avian dinosaur neuron ranges explicitly bracket reptile-like (250M) vs. endotherm (3.3B) scaling.',
      links: [['Biggest brain →', 'data.html#biggest'], ['54 brains →', 'data.html#brains']]
    },
    {
      name: 'Communication Networks & Collectives', c: 'var(--c-net)',
      rows: nRows('networks') + ' inter-entity networks',
      span: 'µm quorum sensing → 20M-ant colonies → 8.1×10⁹ networked humans',
      anchors: 'Dunbar (1993); Schultheiss et al. (2022); Hilbert & López (2011)',
      audit: '✓ Separates O(1) stigmergic insect pheromones from exosomatic human institutions; pre-literate group sizes carry archaeological range bars.',
      links: [['Networks ledger →', 'data.html#networks'], ['Tree path →', 'tree.html#path=networks']]
    },
    {
      name: 'Exosomatic Memory & Media Persistence', c: 'var(--c-backup)',
      rows: nRows('media') + ' archival media classes',
      span: '10⁴ bits lithic/ochre → 1.20×10²³ bits (15 ZB installed) · 64 ms to 5,000 yr',
      anchors: 'IDC Global StorageSphere (2024); Allentoft et al. (2012) mtDNA decay; JEDEC DDR5',
      audit: '✓ Strictly separates installed storage (15 ZB) from annual traffic (200 ZB/yr); M_exo still includes duplicated file copies across devices.',
      links: [['Media ledger →', 'data.html#media'], ['Memory path →', 'tree.html#path=memory']]
    },
    {
      name: 'Silicon Hardware, AI & Uncertainty', c: 'var(--s-silicon)',
      rows: nRows('devices') + ' hardware tiers + ' + nRows('uncertainty') + ' Monte Carlo rows',
      span: '1 op/s mechanical → 1.89×10²² executed ops/s (9.0×10²¹ AI tensor ops/s)',
      anchors: 'Epoch AI (2025); IEA Datacenter Electricity (2024); Sevilla et al. (2022)',
      audit: '✓ Adjusts advertised peak (7.6×10²² ops/s) by real utilization (~60% AI clusters, ~15% client devices); AI trend rests on 2012–2026 anchor points.',
      links: [['Devices ledger →', 'data.html#devices'], ['Uncertainty →', 'data.html#uncertainty']]
    },
    {
      name: 'Tracked Systems Atlas & Off-World Probes', c: 'var(--act-7)',
      rows: sysCount + ' cataloged systems + ' + nRows('offworld') + ' spaceflight milestones',
      span: 'Earth surface → Moon, Mars, L2 (JWST) & Voyager 1 at 2.59×10¹⁰ km (1 light-day)',
      anchors: 'NASA JPL Horizons / Deep Space Network (2026); full 1,300-source catalog',
      audit: '✓ Spaceflight clocks, wattages and distances directly metered; ~40% of biological catalog rates in the ' + sysCount + '-system scatter are order-of-magnitude class estimates (drawn hollow).',
      links: [['Atlas of minds →', 'atlas.html'], ['Off-world ledger →', 'data.html#offworld']]
    }
  ];

  $('trackTableBody').innerHTML = TRACKS.map(t =>
    '<tr style="--rc:' + t.c + '">' +
    '<th scope="row">' + esc(t.name) + '</th>' +
    '<td class="num-c">' + esc(t.rows) + '</td>' +
    '<td>' + esc(t.span) + '</td>' +
    '<td>' + esc(t.anchors) + '</td>' +
    '<td>' + esc(t.audit) + '</td>' +
    '<td style="white-space:nowrap">' + t.links.map(l => '<a href="' + l[1] + '" style="display:block;font-weight:700;font-size:13.5px">' + esc(l[0]) + '</a>').join('') + '</td>' +
    '</tr>'
  ).join('');

  /* ==========================================================================
     SECTION 4: THERMODYNAMICS & MAXWELL'S DEMON NEGENTROPY VISUALIZER
     ========================================================================== */
  const DEMON_REGIMES = [
    {
      k: 'cell', label: '1. Living cell & DNA proofreading', c: 'var(--l-chem)',
      power: '2.0×10⁻¹⁷ W / surface microbe (5,000 turnovers/s)',
      landauerMult: '~1.5× above k_B T ln 2 per turnover (~30× per ATP step)',
      orderedBits: '6.0×10⁶ bits / genome (3.6×10³⁷ bits global)',
      suppression: '10⁻⁴ raw → 10⁻¹⁰ errors/bp (kinetic proofreading)',
      persistence: '50,000,000 yr lineage vs. 521 yr dead bone DNA',
      agentLbl: 'Ribosome + Polymerase Proofreader',
      inLbl: 'Redox / Solar ΔG (ATP ≈ 30 k_B T ln 2)',
      rightTitle: 'Ordered Aperiodic Crystal & Membrane Δψ'
    },
    {
      k: 'brain', label: '2. Cortical brain (20 W demon)', c: 'var(--s-neuro)',
      power: '20 W whole human brain (~1.5×10¹⁴ syn/s)',
      landauerMult: '×4.8×10⁷ above Landauer floor per synaptic event',
      orderedBits: '~4.7 bits / synapse (~7×10¹⁴ bits connectome)',
      suppression: 'Na⁺/K⁺ pumps hold −70 mV against millisecond leak',
      persistence: 'Decades of episodic memory vs. 10 ms voltage decay',
      agentLbl: 'Sensory-Cortical Predictive Loop',
      inLbl: 'Glucose + O₂ Metabolic Flux (20 W)',
      rightTitle: 'Structured World-Model & Coordinated Action'
    },
    {
      k: 'planet', label: '3. 2026 Biosphere + Technosphere', c: 'var(--c-cpu)',
      power: X.watts(RAW[N - 1].P) + ' (65 TW bio + 19.5 TW tech)',
      landauerMult: '20 GW continuous scrubbing prevents digital bit-rot',
      orderedBits: '3.6×10³⁷ DNA bits + 1.2×10²³ digital archive bits',
      suppression: 'ECC memory + cultural ratchet across 8.1B humans',
      persistence: 'Global scientific archive + 3-nm crystalline wafers',
      agentLbl: 'Planetary Science + AI Control Loop',
      inLbl: 'Solar Photons + Grid Power (84.5 TW)',
      rightTitle: 'Biosphere, Cities & Silicon Fabs'
    }
  ];

  let demonIdx = 2, coupling = 100;
  $('demonRegimes').innerHTML = DEMON_REGIMES.map((d, idx) =>
    '<button type="button" class="th-pill" data-d="' + idx + '" aria-pressed="' + (idx === demonIdx) + '" style="--pc:' + d.c + '"><i></i>' + esc(d.label) + '</button>'
  ).join('');

  // Deterministic pseudo-random coordinates for 24 particles in each chamber
  const PSEED = Array.from({ length: 24 }, (_, k) => {
    const a = Math.sin((k + 1) * 12.9898) * 43758.5453;
    const b = Math.sin((k + 1) * 78.233) * 19341.1234;
    const rx = a - Math.floor(a), ry = b - Math.floor(b);
    const col = k % 6, row = Math.floor(k / 6);
    return { rx, ry, col, row, kind: k % 3 };
  });

  function drawDemon() {
    const d = DEMON_REGIMES[demonIdx];
    const c = coupling / 100; // 0 = dead equilibrium, 1 = full intelligent organization
    $('demonOut').textContent = coupling + '%';
    Array.from($('demonRegimes').children).forEach((b, idx) => b.setAttribute('aria-pressed', String(idx === demonIdx)));

    const pColors = ['var(--l-chem)', 'var(--c-store)', 'var(--c-power)'];
    let leftDots = '', rightDots = '', links = '';

    // Left chamber (x: 24..336, y: 54..286): always unopposed 2nd Law disorder
    PSEED.forEach(p => {
      const x = 44 + p.rx * 270, y = 74 + p.ry * 188;
      const vx = Math.cos(p.rx * 6.28) * 11, vy = Math.sin(p.ry * 6.28) * 11;
      leftDots += '<line x1="' + f1(x) + '" y1="' + f1(y) + '" x2="' + f1(x + vx) + '" y2="' + f1(y + vy) + '" stroke="var(--ink-3)" stroke-width="1.3" opacity="0.55"/>';
      leftDots += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="5.2" fill="' + pColors[p.kind] + '" opacity="0.72"/>';
    });

    // Right chamber (x: 644..956, y: 54..286): interpolates between thermal chaos (c=0) and crystal/network lattice (c=1)
    const rPts = PSEED.map(p => {
      const randX = 668 + p.rx * 264, randY = 76 + p.ry * 184;
      const gridX = 684 + p.col * 46, gridY = 86 + p.row * 46;
      return {
        x: randX * (1 - c) + gridX * c,
        y: randY * (1 - c) + gridY * c,
        col: p.col, row: p.row, kind: p.row % 3
      };
    });
    if (c > 0.15) {
      rPts.forEach((p, idx) => {
        if (p.col < 5) {
          const nx = rPts[idx + 1];
          links += '<line x1="' + f1(p.x) + '" y1="' + f1(p.y) + '" x2="' + f1(nx.x) + '" y2="' + f1(nx.y) + '" stroke="var(--ink-3)" stroke-width="1.5" opacity="' + f2(c * 0.65) + '"/>';
        }
        if (p.row < 3) {
          const ny = rPts[idx + 6];
          links += '<line x1="' + f1(p.x) + '" y1="' + f1(p.y) + '" x2="' + f1(ny.x) + '" y2="' + f1(ny.y) + '" stroke="var(--ink-3)" stroke-width="1.5" opacity="' + f2(c * 0.45) + '"/>';
        }
      });
    }
    rPts.forEach(p => {
      rightDots += '<circle cx="' + f1(p.x) + '" cy="' + f1(p.y) + '" r="' + f1(4.8 + c * 1.4) + '" fill="' + pColors[p.kind] + '"/>';
    });

    const localSign = c >= 0.35 ? 'LOCAL ΔS < 0 (ORGANIZED)' : 'LOCAL ΔS > 0 (DECAYING)';
    const localCol = c >= 0.35 ? 'var(--l-chem)' : 'var(--crisis)';
    const barOrder = Math.round(12 + c * 86);

    $('demonSvg').innerHTML =
      // Left chamber
      '<rect x="20" y="46" width="316" height="252" rx="10" fill="var(--surface)" stroke="var(--line-2)" stroke-width="1.5"/>' +
      '<text x="178" y="32" text-anchor="middle" fill="var(--crisis)" font-family="var(--display)" font-weight="800" font-size="13.5">CLOSED BOX · 2ND LAW ALONE (ΔS &gt; 0)</text>' +
      leftDots +
      '<rect x="36" y="270" width="284" height="8" rx="4" fill="var(--surface-3)"/>' +
      '<rect x="36" y="270" width="34" height="8" rx="4" fill="var(--crisis)"/>' +
      '<text x="36" y="264" fill="var(--ink-3)" font-size="11.5" font-weight="700">Mutual information &amp; structural order: ~0% (equilibrium)</text>' +

      // Center Intelligent Maxwell's Demon Engine
      '<rect x="368" y="64" width="244" height="212" rx="12" fill="var(--surface)" stroke="' + d.c + '" stroke-width="2.2"/>' +
      '<text x="490" y="32" text-anchor="middle" fill="var(--ink)" font-family="var(--display)" font-weight="800" font-size="13.5">INTELLIGENT AGENT (' + coupling + '%)</text>' +
      // Free energy inflow from top
      '<line x1="490" y1="38" x2="490" y2="60" stroke="var(--c-power)" stroke-width="3"/>' +
      '<polygon points="484,56 496,56 490,64" fill="var(--c-power)"/>' +
      '<text x="490" y="84" text-anchor="middle" fill="var(--c-power)" font-size="11.5" font-weight="700">⚡ ' + esc(d.inLbl) + '</text>' +
      // 3 internal steps: Sense -> Model K -> Act
      '<rect x="386" y="96" width="208" height="36" rx="6" fill="var(--surface-2)" stroke="var(--line-2)"/>' +
      '<text x="490" y="119" text-anchor="middle" fill="var(--ink)" font-size="12.5" font-weight="700">1. Sense state &amp; measure error</text>' +
      '<rect x="386" y="140" width="208" height="40" rx="6" fill="var(--surface-2)" stroke="var(--c-store)" stroke-width="1.4"/>' +
      '<text x="490" y="158" text-anchor="middle" fill="var(--ink)" font-size="12.5" font-weight="700">2. Compress into model K(t)</text>' +
      '<text x="490" y="173" text-anchor="middle" fill="var(--ink-2)" font-size="11">' + esc(d.agentLbl) + '</text>' +
      '<rect x="386" y="188" width="208" height="36" rx="6" fill="var(--surface-2)" stroke="var(--l-chem)" stroke-width="1.4"/>' +
      '<text x="490" y="211" text-anchor="middle" fill="var(--ink)" font-size="12.5" font-weight="700">3. Act: sort, repair &amp; build</text>' +
      // Arrows connecting chambers
      '<line x1="336" y1="170" x2="364" y2="170" stroke="var(--ink-3)" stroke-width="2" stroke-dasharray="4 3"/>' +
      '<line x1="612" y1="170" x2="640" y2="170" stroke="' + localCol + '" stroke-width="3"/>' +
      '<polygon points="636,164 644,170 636,176" fill="' + localCol + '"/>' +
      // Waste heat exhaust downward (Global 2nd Law satisfied!)
      '<line x1="490" y1="276" x2="490" y2="306" stroke="var(--crisis)" stroke-width="2.5" opacity="' + f2(0.25 + 0.75 * c) + '"/>' +
      '<polygon points="484,302 496,302 490,311" fill="var(--crisis)" opacity="' + f2(0.25 + 0.75 * c) + '"/>' +
      '<text x="490" y="328" text-anchor="middle" fill="var(--ink-2)" font-size="11.5" font-weight="600">Exports waste heat Q̇_out / T ≥ |ΔṠ_local| (global 2nd Law holds)</text>' +

      // Right chamber
      '<rect x="644" y="46" width="316" height="252" rx="10" fill="var(--surface)" stroke="' + localCol + '" stroke-width="1.8"/>' +
      '<text x="802" y="32" text-anchor="middle" fill="' + localCol + '" font-family="var(--display)" font-weight="800" font-size="13.5">OPEN SYSTEM · ' + esc(localSign) + '</text>' +
      links + rightDots +
      '<rect x="660" y="270" width="284" height="8" rx="4" fill="var(--surface-3)"/>' +
      '<rect x="660" y="270" width="' + Math.round(284 * barOrder / 100) + '" height="8" rx="4" fill="' + localCol + '"/>' +
      '<text x="660" y="264" fill="var(--ink)" font-size="11.5" font-weight="700">' + esc(d.rightTitle) + ' (' + barOrder + '% organized)</text>';

    $('demonStats').innerHTML = [
      ['Free-energy input', c === 0 ? '0 W (switched off)' : d.power, c === 0 ? 'No energy to pay Landauer cost' : d.landauerMult],
      ['Maintained structure', c === 0 ? 'Decaying to noise' : d.orderedBits, c === 0 ? 'Polymers & charges equilibrate' : 'Held far from thermal equilibrium'],
      ['Error & noise control', c === 0 ? 'Unchecked drift' : d.suppression, c === 0 ? 'Errors accumulate every second' : 'Active measurement + correction'],
      ['Persistence horizon', c === 0 ? 'Milliseconds to years' : d.persistence, 'Local entropy lowered; cosmic entropy rises']
    ].map(s => '<div class="th-dstat"><span>' + esc(s[0]) + '</span><b>' + esc(s[1]) + '</b><small>' + esc(s[2]) + '</small></div>').join('');
  }

  $('demonRegimes').addEventListener('click', ev => {
    const b = ev.target.closest('[data-d]');
    if (!b) return;
    demonIdx = Number(b.dataset.d);
    coupling = 100;
    $('demonSlide').value = 100;
    drawDemon();
  });
  $('demonSlide').addEventListener('input', ev => { coupling = Number(ev.target.value); drawDemon(); });
  drawDemon();

  // 4B. Persistence Decay vs Active Repair Chart (from SI_LEDGERS.media + census)
  (function renderDecayChart() {
    const medRows = (LED.media && LED.media.rows) || [];
    const colIdx = name => (LED.media ? LED.media.columns.indexOf(name) : -1);
    const iMed = colIdx('storage_medium'), iLife = colIdx('mean_retention_lifetime_yr');
    const findLife = tok => {
      const r = medRows.find(x => String(x[iMed] || '').includes(tok));
      return r ? Number(r[iLife]) : null;
    };
    const items = [
      { name: 'Volatile computer DRAM (no refresh)', yr: 0.064 / 3.156e7, kind: 'Unpowered electronic', c: 'var(--s-silicon)', note: '64 ms JEDEC capacitor leak without 11 GW refresh' },
      { name: '3D NAND flash SSD (unpowered)', yr: findLife('NAND') || 3.5, kind: 'Unpowered digital', c: 'var(--s-silicon)', note: 'Charge-trap leakage in unpowered consumer/cloud flash' },
      { name: 'Magnetic hard disk drive (unpowered)', yr: findLife('Hard Disks') || 7.0, kind: 'Unpowered digital', c: 'var(--s-silicon)', note: 'Thermal magnetic domain relaxation & lubricant decay' },
      { name: 'Archival magnetic tape (unpowered)', yr: findLife('Magnetic Tape') || 25, kind: 'Unpowered digital', c: 'var(--s-silicon)', note: 'Requires periodic migration every ~15–25 years' },
      { name: 'Acid wood-pulp book paper', yr: findLife('Wood-Pulp') || 80, kind: 'Unpowered physical', c: 'var(--c-backup)', note: 'Acid-catalyzed cellulose hydrolysis ("slow fires")' },
      { name: 'Dead DNA in bone (no metabolism)', yr: 521, kind: 'Unpowered biological', c: 'var(--crisis)', note: '242-bp mtDNA half-life at 13.1 °C (Allentoft et al. 2012)' },
      { name: 'Fired clay cuneiform tablet', yr: findLife('Cuneiform') || 5000, kind: 'Unpowered physical', c: 'var(--c-backup)', note: 'Zero-watt ceramic mineral inscription' },
      { name: 'Living DNA lineage (active repair & selection)', yr: eNow.phi && eNow.hcopy ? 5e7 : 5e7, kind: 'Powered intelligent repair', c: 'var(--l-chem)', note: 'Proofread, repaired & selected across generations (Raup 1978 / census)' }
    ];

    const W = 960, H = 310, L = 278, R = 118, T = 24, B = 38, PW = W - L - R;
    const minLog = -9, maxLog = 8; // 10^-9 yr (~30 ms) to 10^8 yr (100 Myr)
    const xOf = yr => L + (Math.log10(yr) - minLog) / (maxLog - minLog) * PW;
    const rowH = (H - T - B) / items.length;
    let svg = '';
    [-9, -6, -3, 0, 2, 4, 6, 8].forEach(d => {
      const x = xOf(Math.pow(10, d));
      const lbl = d === -9 ? '30 ms' : d === -6 ? '30 s' : d === -3 ? '9 hr' : d === 0 ? '1 yr' : '10' + sup(d) + ' yr';
      svg += '<line x1="' + f1(x) + '" x2="' + f1(x) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--line)" stroke-width="1"/>';
      svg += '<text x="' + f1(x) + '" y="' + (H - 12) + '" text-anchor="middle" fill="var(--ink-3)" font-size="11.5">' + lbl + '</text>';
    });
    const xZero = xOf(1);
    svg += '<line x1="' + f1(xZero) + '" x2="' + f1(xZero) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--line-2)" stroke-dasharray="3 3"/>';

    items.forEach((it, k) => {
      const y = T + k * rowH + 5, bh = rowH - 10, x = xOf(it.yr);
      const valTxt = it.yr < 1e-4 ? '64 ms' : it.yr < 100 ? it.yr + ' yr' : it.yr < 1e5 ? it.yr.toLocaleString('en-US') + ' yr' : '50 Myr';
      svg += '<text x="' + (L - 10) + '" y="' + f1(y + bh * 0.72) + '" text-anchor="end" fill="var(--ink)" font-size="12.5" font-weight="' + (k === items.length - 1 ? '800' : '600') + '">' + esc(it.name) + '</text>';
      svg += '<rect x="' + L + '" y="' + f1(y) + '" width="' + f1(Math.max(3, x - L)) + '" height="' + f1(bh) + '" rx="4" fill="' + it.c + '" opacity="' + (k === items.length - 1 ? '1' : '0.82') + '"/>';
      svg += '<text x="' + f1(x + 8) + '" y="' + f1(y + bh * 0.72) + '" fill="var(--ink)" font-size="12.5" font-weight="700">' + esc(valTxt) + '</text>';
    });
    $('decaySvg').innerHTML = svg;
    $('decayTableBox').innerHTML = '<table class="rt"><thead><tr><th scope="col">Medium</th><th scope="col">Regime</th><th scope="col">Retention lifetime</th><th scope="col">Physical mechanism</th></tr></thead><tbody>' +
      items.map(it => '<tr><th scope="row">' + esc(it.name) + '</th><td>' + esc(it.kind) + '</td><td>' + (it.yr < 1e-4 ? '64 milliseconds' : sci(it.yr) + ' years') + '</td><td>' + esc(it.note) + '</td></tr>').join('') +
      '</tbody></table>';
  })();

  /* ==========================================================================
     SECTION 5: PLANETARY ORGANIZATIONAL INTELLIGENCE METRIC & CHARTS
     ========================================================================== */
  $('pillarCards').innerHTML = PILLARS.map(p =>
    '<div class="th-pillar-card" style="--pk:' + p.color + '">' +
    '<span class="sym">' + esc(p.sym) + '</span>' +
    '<b>' + esc(p.name) + '</b>' +
    '<span>' + esc(p.desc) + '</span></div>'
  ).join('');

  // Accessible Tabs with roving tabindex + arrow keys + hidden="until-found" + beforematch sync
  const tabBar = $('metricTabs');
  const tabs = Array.from(tabBar.querySelectorAll('[role="tab"]'));
  const panels = Array.from($('metricPanels').querySelectorAll('[role="tabpanel"]'));

  function activateMetricTab(targetTab, moveFocus) {
    tabs.forEach(t => {
      const on = t === targetTab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(p => {
      if (p.id === targetTab.dataset.panel) p.removeAttribute('hidden');
      else p.setAttribute('hidden', 'until-found');
    });
    if (moveFocus) targetTab.focus();
    try { targetTab.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' }); } catch (e) { /* fallback */ }
    renderAllMetricCharts();
  }

  tabBar.addEventListener('click', ev => {
    const t = ev.target.closest('[role="tab"]');
    if (t) activateMetricTab(t, false);
  });
  tabBar.addEventListener('keydown', ev => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let nx = -1;
    if (ev.key === 'ArrowRight') nx = (i + 1) % tabs.length;
    else if (ev.key === 'ArrowLeft') nx = (i - 1 + tabs.length) % tabs.length;
    else if (ev.key === 'Home') nx = 0;
    else if (ev.key === 'End') nx = tabs.length - 1;
    if (nx >= 0) { ev.preventDefault(); activateMetricTab(tabs[nx], true); }
  });
  $('metricPanels').addEventListener('beforematch', ev => {
    const panel = ev.target.closest('[role="tabpanel"]');
    if (!panel) return;
    const matchTab = tabs.find(t => t.dataset.panel === panel.id);
    if (matchTab) activateMetricTab(matchTab, false);
  });

  // Weight presets & sliders
  const PRESETS = {
    canonical: { label: 'Canonical 5-pillar', w: { bud: 1, know: 1, sub: 1, peak: 1, work: 1 }, bio: false, norm: false },
    normlayer: { label: 'Normalized substrate mean', w: { bud: 1, know: 1, sub: 1, peak: 1, work: 1 }, bio: false, norm: true },
    knowcomp:  { label: 'Knowledge + compute only', w: { bud: 0, know: 1.5, sub: 1.5, peak: 1, work: 0 }, bio: false, norm: false },
    bioonly:   { label: 'Biology only (no culture/silicon)', w: { bud: 1, know: 1, sub: 1, peak: 1, work: 1 }, bio: true, norm: false }
  };

  $('weightPresets').innerHTML = Object.keys(PRESETS).map(k =>
    '<button type="button" class="th-pill" data-wp="' + k + '" aria-pressed="' + (k === activePreset) + '" style="--pc:var(--c-cpu)"><i></i>' + esc(PRESETS[k].label) + '</button>'
  ).join('');

  $('weightSliders').innerHTML = PILLARS.map(p =>
    '<div class="th-w-item" style="--pk:' + p.color + '">' +
    '<label for="ws-' + p.k + '"><span>' + esc(p.name) + '</span><output id="wo-' + p.k + '">×1</output></label>' +
    '<input type="range" id="ws-' + p.k + '" data-wk="' + p.k + '" min="0" max="2" step="0.5" value="1"></div>'
  ).join('');

  $('weightPresets').addEventListener('click', ev => {
    const b = ev.target.closest('[data-wp]');
    if (!b) return;
    activePreset = b.dataset.wp;
    const pr = PRESETS[activePreset];
    bioOnly = pr.bio; normSub = pr.norm;
    PILLARS.forEach(p => { weights[p.k] = pr.w[p.k]; $('ws-' + p.k).value = pr.w[p.k]; });
    updateWeightsUI();
  });

  $('weightSliders').addEventListener('input', ev => {
    const inp = ev.target.closest('[data-wk]');
    if (!inp) return;
    weights[inp.dataset.wk] = Number(inp.value);
    if (PILLARS.every(p => weights[p.k] === 0)) { weights[inp.dataset.wk] = 0.5; inp.value = 0.5; }
    activePreset = '';
    bioOnly = false;
    updateWeightsUI();
  });

  let SER = baseSeries;

  function drawDeepChart() {
    const svg = $('svgDeep');
    const W = 980, H = 380, L = 58, R = 24, T = 30, B = 42, PW = W - L - R, PH = H - T - B;
    const maxDex = Math.max(6, Math.ceil(Math.max(...SER.map(s => s.dex)) * 1.08));
    const xOf = i => L + i / (N - 1) * PW;
    const yOf = v => T + (1 - v / maxDex) * PH;

    let g = '';
    // Act bands along top
    X.ACTS.forEach(a => {
      const x0 = xOf(a.i0), x1 = xOf(a.i1);
      g += '<rect x="' + f1(x0) + '" y="' + (T - 14) + '" width="' + f1(Math.max(2, x1 - x0 - 2)) + '" height="4" rx="1" fill="' + a.color + '"/>';
      if (x1 - x0 > 26) g += '<text x="' + f1((x0 + x1) / 2) + '" y="' + (T - 18) + '" text-anchor="middle" fill="var(--ink-2)" font-family="var(--display)" font-size="11" font-weight="800">' + a.n + '</text>';
      if (a.i0 > 0) g += '<line x1="' + f1(x0) + '" x2="' + f1(x0) + '" y1="' + T + '" y2="' + (T + PH) + '" stroke="var(--line)" stroke-dasharray="3 3"/>';
    });

    // Horizontal log10 gridlines
    const step = Math.max(2, Math.ceil(maxDex / 6));
    for (let d = 0; d <= maxDex; d += step) {
      const y = yOf(d);
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + f1(y) + '" y2="' + f1(y) + '" stroke="var(--line)" stroke-width="1"/>';
      g += '<text x="' + (L - 8) + '" y="' + f1(y + 4) + '" text-anchor="end" fill="var(--ink-3)" font-size="11.5">' + (d === 0 ? '1' : '10' + sup(d)) + '</text>';
    }

    // Stacked pillar areas
    const running = E.map(() => 0);
    PILLARS.forEach(p => {
      const bot = running.slice();
      SER.forEach((s, i) => { running[i] += s.parts[p.k]; });
      let path = 'M' + f1(xOf(0)) + ' ' + f1(yOf(bot[0]));
      for (let i = 0; i < N; i++) path += 'L' + f1(xOf(i)) + ' ' + f1(yOf(running[i]));
      for (let i = N - 1; i >= 0; i--) path += 'L' + f1(xOf(i)) + ' ' + f1(yOf(bot[i]));
      path += 'Z';
      g += '<path d="' + path + '" fill="' + p.color + '" opacity="0.28"/>';
    });

    // OLS exponential fit line across the 64 evolutionary steps
    const ks = E.map((_, i) => i), ys = SER.map(s => s.dex);
    const fit = linReg(ks, ys);
    const fy0 = Math.max(0, fit.intercept), fy1 = Math.min(maxDex, fit.intercept + fit.slope * (N - 1));
    g += '<line x1="' + f1(xOf(0)) + '" y1="' + f1(yOf(fy0)) + '" x2="' + f1(xOf(N - 1)) + '" y2="' + f1(yOf(fy1)) + '" stroke="var(--ink-3)" stroke-width="1.8" stroke-dasharray="6 4"/>';
    g += '<text x="' + (L + 10) + '" y="' + (T + 18) + '" fill="var(--ink-2)" font-size="12" font-weight="700">Step-exponential fit: ×' + (Math.pow(10, fit.slope)).toFixed(2) + ' per transition (R² = ' + fit.r2.toFixed(2) + ')</text>';

    // Composite curve
    let lineD = '';
    SER.forEach((s, i) => { lineD += (i ? 'L' : 'M') + f1(xOf(i)) + ' ' + f1(yOf(s.dex)); });
    g += '<path d="' + lineD + '" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';

    // Crises on baseline
    E.forEach((e, i) => {
      if (X.CRISIS[e.id]) g += '<path d="M' + f1(xOf(i) - 4.5) + ' ' + (T + PH + 9) + ' h9 l-4.5 -8 z" fill="var(--crisis)"/>';
    });

    // Time ticks
    [['EP01a', '4.1 Ga'], ['EP04a', '1.8 Ga'], ['EP08a', '541 Ma'], ['EP14a', '252 Ma'], ['EP18a', '66 Ma'], ['EP21a', '3.3 Ma'], ['EP30a', '1945'], ['EP32b', '2026']].forEach(([id, lbl], k, arr) => {
      const i = X.IDX[id];
      const anc = k === 0 ? 'start' : k === arr.length - 1 ? 'end' : 'middle';
      g += '<text x="' + f1(xOf(i)) + '" y="' + (H - 8) + '" text-anchor="' + anc + '" fill="var(--ink-3)" font-size="11.5">' + lbl + '</text>';
    });

    // Selection hairline & dot
    const sx = xOf(selIdx), sy = yOf(SER[selIdx].dex);
    g += '<line x1="' + f1(sx) + '" x2="' + f1(sx) + '" y1="' + T + '" y2="' + (T + PH) + '" stroke="var(--ink)" stroke-width="1.3" stroke-dasharray="3 3"/>';
    g += '<circle cx="' + f1(sx) + '" cy="' + f1(sy) + '" r="5.5" fill="var(--ink)" stroke="var(--surface)" stroke-width="2.2"/>';

    svg.innerHTML = g;
    $('deepHeadline').textContent = 'Across ' + N + ' evolutionary moments, planetary organizational intelligence grows by ' + f1(SER[N - 1].dex) + ' orders of magnitude (' + fmtGain(SER[N - 1].dex) + ')';
    renderReadout();
  }

  function renderReadout() {
    const s = SER[selIdx], e = E[selIdx], st = X.STOP[e.id];
    const who = st ? st.who : X.titleOf(selIdx);
    const mult = fmtGain(s.dex);
    $('metricReadout').innerHTML =
      '<div><span class="sub">' + esc(X.fmtTime(e.t)) + '<span class="x-only mono"> · ' + esc(e.id) + '</span></span>' +
      '<div style="font:800 1.25rem/1.2 var(--display);color:var(--ink)">' + esc(who) + ' — <span style="color:var(--c-cpu)">' + mult + '</span> baseline</div></div>' +
      '<div class="th-pillar-chips">' + PILLARS.map(p =>
        '<span class="th-pchip" style="--pk:' + p.color + '"><i></i>' + esc(p.name) + ': <b>+' + f1(s.parts[p.k]) + ' dex</b></span>'
      ).join('') + '</div>';
  }

  // Pointer interaction on #svgDeep
  (function bindDeepPointer() {
    const svg = $('svgDeep');
    const pick = ev => {
      const r = svg.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width * 980;
      const idx = Math.max(0, Math.min(N - 1, Math.round((x - 58) / (980 - 58 - 24) * (N - 1))));
      if (idx !== selIdx) {
        selIdx = idx;
        $('metricSlider').value = selIdx;
        drawDeepChart();
      }
    };
    svg.addEventListener('pointerdown', pick);
    svg.addEventListener('pointermove', ev => { if (ev.buttons || ev.pointerType === 'mouse') pick(ev); });
    $('metricSlider').addEventListener('input', ev => { selIdx = Number(ev.target.value); drawDeepChart(); });
  })();

  function drawModernCharts() {
    // Left: True linear geological time J-curve (4100 Ma -> 0 Ma)
    const W = 480, H = 300, L = 52, R = 20, T = 20, B = 36, PW = W - L - R, PH = H - T - B;
    const maxD = Math.max(6, Math.ceil(SER[N - 1].dex * 1.05));
    const t0 = E[0].t;
    const xT = t => L + (t0 - t) / t0 * PW;
    const yD = d => T + (1 - d / maxD) * PH;
    let gJ = '';
    for (let k = 0; k <= 4; k++) {
      const d = Math.round(maxD * k / 4), y = yD(d);
      gJ += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + f1(y) + '" y2="' + f1(y) + '" stroke="var(--line)"/>';
      gJ += '<text x="' + (L - 6) + '" y="' + f1(y + 4) + '" text-anchor="end" fill="var(--ink-3)" font-size="11">' + (d === 0 ? '1' : '10' + sup(d)) + '</text>';
    }
    [[4000, '4 Ga'], [3000, '3 Ga'], [2000, '2 Ga'], [1000, '1 Ga'], [0, '2026']].forEach(([t, lbl], idx) => {
      gJ += '<text x="' + f1(xT(t)) + '" y="' + (H - 8) + '" text-anchor="' + (idx === 0 ? 'start' : idx === 4 ? 'end' : 'middle') + '" fill="var(--ink-3)" font-size="11">' + lbl + '</text>';
    });
    let areaJ = 'M' + f1(xT(E[0].t)) + ' ' + (T + PH), pathJ = '';
    E.forEach((e, i) => {
      const x = xT(e.t), y = yD(SER[i].dex);
      areaJ += 'L' + f1(x) + ' ' + f1(y);
      pathJ += (i ? 'L' : 'M') + f1(x) + ' ' + f1(y);
    });
    areaJ += 'L' + f1(xT(0)) + ' ' + (T + PH) + 'Z';
    gJ += '<path d="' + areaJ + '" fill="var(--c-cpu)" opacity="0.16"/>';
    gJ += '<path d="' + pathJ + '" fill="none" stroke="var(--c-cpu)" stroke-width="2.6"/>';
    gJ += '<circle cx="' + f1(xT(0)) + '" cy="' + f1(yD(SER[N - 1].dex)) + '" r="5" fill="var(--c-cpu)"/>';
    gJ += '<text x="' + (W - R - 8) + '" y="' + (T + 20) + '" text-anchor="end" fill="var(--ink)" font-size="11.5" font-weight="700">Vertical Anthropocene spike →</text>';
    $('svgJCurve').innerHTML = gJ;

    // Right: Modern Silicon & AI zoom (1945..2026 CE, indices 58..63)
    const modIdx = [];
    for (let i = 0; i < N; i++) if (2026 - E[i].t * 1e6 >= 1940) modIdx.push(i);
    const yrs = modIdx.map(i => 2026 - E[i].t * 1e6);
    const vals = modIdx.map(i => SER[i].dex);
    const lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
    const xY = yr => L + (yr - 1945) / (2026 - 1945) * PW;
    const yM = v => T + (1 - (v - lo) / Math.max(1, hi - lo)) * PH;
    const fitM = linReg(yrs, vals);
    const dblYr = fitM.slope > 0.0001 ? (Math.log10(2) / fitM.slope) : Infinity;

    let gM = '';
    for (let k = 0; k <= 4; k++) {
      const v = Math.round(lo + (hi - lo) * k / 4), y = yM(v);
      gM += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + f1(y) + '" y2="' + f1(y) + '" stroke="var(--line)"/>';
      gM += '<text x="' + (L - 6) + '" y="' + f1(y + 4) + '" text-anchor="end" fill="var(--ink-3)" font-size="11">10' + sup(v) + '</text>';
    }
    [1945, 1966, 1985, 2000, 2012, 2026].forEach((yr, idx) => {
      gM += '<text x="' + f1(xY(yr)) + '" y="' + (H - 8) + '" text-anchor="' + (idx === 0 ? 'start' : idx === 5 ? 'end' : 'middle') + '" fill="var(--ink-3)" font-size="11">' + yr + '</text>';
    });
    // OLS exponential line on semilog plot
    gM += '<line x1="' + f1(xY(1945)) + '" y1="' + f1(yM(fitM.intercept + fitM.slope * 1945)) + '" x2="' + f1(xY(2026)) + '" y2="' + f1(yM(fitM.intercept + fitM.slope * 2026)) + '" stroke="var(--ink-3)" stroke-width="1.8" stroke-dasharray="5 4"/>';

    let pathM = '';
    modIdx.forEach((i, k) => { pathM += (k ? 'L' : 'M') + f1(xY(yrs[k])) + ' ' + f1(yM(vals[k])); });
    gM += '<path d="' + pathM + '" fill="none" stroke="var(--s-silicon)" stroke-width="2.8"/>';
    let prevLblX = -999;
    modIdx.forEach((i, k) => {
      const x = xY(yrs[k]), y = yM(vals[k]);
      gM += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="4.8" fill="var(--s-silicon)" stroke="var(--surface)" stroke-width="1.8"/>';
      if (x - prevLblX >= 22 || k === modIdx.length - 1) {
        gM += '<text x="' + f1(x + (k === modIdx.length - 1 ? -6 : 0)) + '" y="' + f1(y - (k % 2 && x - prevLblX < 34 ? 14 : 9)) + '" text-anchor="' + (k === modIdx.length - 1 ? 'end' : 'middle') + '" fill="var(--ink)" font-size="10.5" font-weight="700">' + Math.round(yrs[k]) + '</text>';
        prevLblX = x;
      }
    });
    $('svgModern').innerHTML = gM;
    $('modFitStat').textContent = isFinite(dblYr) && dblYr < 500
      ? 'exponential fit R² = ' + fitM.r2.toFixed(2) + ', doubling every ' + dblYr.toFixed(2) + ' years across 1945–2026'
      : 'flat when culture & silicon weights are zeroed out';
  }

  function drawTempoChart() {
    const ERAS = [
      { name: '1. Cells, DNA & photosynthesis (4.1 Ga → 541 Ma)', i0: X.IDX.EP01a, i1: X.IDX.EP08a, c: 'var(--l-chem)' },
      { name: '2. Nervous systems, myelin & warm brains (541 → 3.3 Ma)', i0: X.IDX.EP08a, i1: X.IDX.EP21a, c: 'var(--s-neuro)' },
      { name: '3. Hominin tools, speech & early writing (3.3 Ma → 1844)', i0: X.IDX.EP21a, i1: X.IDX.EP29b, c: 'var(--c-backup)' },
      { name: '4. Telegraph, industrial print & early chips (1844 → 2000)', i0: X.IDX.EP29b, i1: X.IDX.EP31a, c: 'var(--c-store)' },
      { name: '5. Cloud, mobile internet & AI clusters (2000 → 2026)', i0: X.IDX.EP31a, i1: X.IDX.EP32b, c: 'var(--c-cpu)' }
    ];
    const stats = ERAS.map(er => {
      const dtYr = (E[er.i0].t - E[er.i1].t) * 1e6;
      const dDex = Math.max(0.01, SER[er.i1].dex - SER[er.i0].dex);
      const doublings = dDex / Math.log10(2);
      return Object.assign({}, er, { dtYr, dDex, doublings, t2: dtYr / doublings });
    });

    const W = 960, H = 300, L = 382, R = 138, T = 24, B = 38, PW = W - L - R;
    const minL = -0.3, maxL = 8.2; // ~0.5 yr to 150 Myr
    const xOf = yr => L + (Math.log10(Math.max(0.5, yr)) - minL) / (maxL - minL) * PW;
    const rowH = (H - T - B) / stats.length;

    let g = '';
    [0, 2, 4, 6, 8].forEach(d => {
      const x = xOf(Math.pow(10, d));
      const lbl = d === 0 ? '1 yr' : d === 2 ? '100 yr' : d === 4 ? '10 kyr' : d === 6 ? '1 Myr' : '100 Myr';
      g += '<line x1="' + f1(x) + '" x2="' + f1(x) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--line)"/>';
      g += '<text x="' + f1(x) + '" y="' + (H - 10) + '" text-anchor="middle" fill="var(--ink-3)" font-size="11.5">' + lbl + '</text>';
    });

    stats.forEach((st, k) => {
      const y = T + k * rowH + 6, bh = rowH - 12, x = xOf(st.t2);
      const txt = st.t2 >= 1e6 ? f1(st.t2 / 1e6) + ' Myr' : st.t2 >= 1e3 ? Math.round(st.t2 / 1e3).toLocaleString('en-US') + ' kyr' : st.t2 >= 10 ? f1(st.t2) + ' yr' : st.t2.toFixed(2) + ' yr';
      g += '<text x="' + (L - 12) + '" y="' + f1(y + bh * 0.68) + '" text-anchor="end" fill="var(--ink)" font-size="12.5" font-weight="700">' + esc(st.name) + '</text>';
      g += '<rect x="' + L + '" y="' + f1(y) + '" width="' + f1(Math.max(4, x - L)) + '" height="' + f1(bh) + '" rx="5" fill="' + st.c + '"/>';
      g += '<text x="' + f1(x + 8) + '" y="' + f1(y + bh * 0.68) + '" fill="var(--ink)" font-size="12.5" font-weight="800">doubles every ' + esc(txt) + '</text>';
    });
    $('svgTempo').innerHTML = g;
    const ratio = stats[0].t2 / stats[stats.length - 1].t2;
    $('tempoSummary').innerHTML = '<b>Key finding:</b> Under the current weights, Earth’s organizational intelligence doubled roughly every <b>' + f1(stats[0].t2 / 1e6) + ' million years</b> during unicellular evolution, versus every <b>' + stats[stats.length - 1].t2.toFixed(2) + ' years</b> between 2000 and 2026—a <b>' + sci(ratio) + '-fold acceleration</b> of the evolutionary clock.';
  }

  function renderMilestoneTable() {
    const MILES = ['EP01a', 'EP01b', 'EP04a', 'EP08a', 'EP11a', 'EP15b', 'EP18b', 'EP21a', 'EP25a', 'EP30a', 'EP31b', 'EP32b'];
    $('metricTableBody').innerHTML = MILES.map(id => {
      const i = X.IDX[id], e = E[i], s = SER[i], d = s.raw, st = X.STOP[id];
      return '<tr style="--rc:' + X.actOf(i).color + '">' +
        '<th scope="row"><a href="journey.html#' + id + '" style="color:var(--ink);text-decoration:none">' + esc(st ? st.who : X.titleOf(i)) + '</a><span class="x-only mono" style="display:block;font-size:11.5px;color:var(--ink-3)">' + id + '</span></th>' +
        '<td class="num-c">' + esc(X.fmtShort(e.t)) + '</td>' +
        '<td class="num-c">' + fmtGain(d.bud) + '</td>' +
        '<td class="num-c">' + fmtGain(d.know) + '</td>' +
        '<td class="num-c">' + fmtGain(d.sub) + '</td>' +
        '<td class="num-c" style="color:var(--c-cpu);font-weight:800">' + fmtGain(s.dex) + '</td>' +
        '</tr>';
    }).join('');
  }

  function renderAllMetricCharts() {
    drawDeepChart();
    drawModernCharts();
    drawTempoChart();
    renderMilestoneTable();
  }

  function updateWeightsUI() {
    Array.from($('weightPresets').children).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.wp === activePreset)));
    PILLARS.forEach(p => { $('wo-' + p.k).textContent = '×' + weights[p.k]; });
    SER = computeSeries();
    const topDex = SER[N - 1].dex, dbl = topDex / Math.log10(2);
    $('weightSummary').innerHTML = 'Today’s planetary index under these weights: <b>' + fmtGain(topDex) + '</b> above Hadean origin (<b>+' + f1(topDex) + ' orders of magnitude · ' + f1(dbl) + ' doublings</b>).' +
      (bioOnly ? ' <i>Counterfactual biology-only mode excludes human exosomatic archives and silicon hardware—showing biology alone rose ' + fmtGain(topDex) + ' before plateauing near metabolic limits.</i>' : '');
    renderAllMetricCharts();
  }

  updateWeightsUI();
})();
