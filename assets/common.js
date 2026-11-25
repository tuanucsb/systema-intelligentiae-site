/* Shared helpers for every page: data model, formatting, drawings, header, chart. */
(function () {
  'use strict';
  const SI = window.SI;
  const E = SI.epochs;
  const N = E.length;
  const IDX = {}; E.forEach((e, i) => { IDX[e.id] = i; });

  const ACTS = SI.acts.map((a, k) => Object.assign({}, a, { i0: IDX[a.from], i1: IDX[a.to], k: k + 1, color: 'var(--act-' + (k + 1) + ')', on: 'var(--on-act-' + (k + 1) + ')' }));
  const actOf = i => ACTS.find(a => i >= a.i0 && i <= a.i1);
  const CRISIS = {}; SI.crises.forEach(c => { CRISIS[c.epoch_id] = c.name; });

  const PARTS = SI.parts.map(p => Object.assign({}, p, { color: 'var(--c-' + p.key + ')', on: 'var(--on-' + p.key + ')' }));
  const PK = {}; PARTS.forEach(p => { PK[p.key] = p; });
  const ORDER = PARTS.map(p => p.key);

  const INV = SI.inventions.map(u => Object.assign({}, u, { i: IDX[u.epoch] }));
  const INVK = {}; INV.forEach(u => { INVK[u.id] = u; });
  const HIST = {}; ORDER.forEach(k => { HIST[k] = INV.filter(u => u.part === k).sort((a, b) => a.i - b.i); });
  const stateAt = (k, i) => { let s = null; for (const u of HIST[k]) { if (u.i <= i) s = u; else break; } return s; };
  const newAt = i => INV.filter(u => u.i === i).sort((a, b) => ORDER.indexOf(a.part) - ORDER.indexOf(b.part));

  const STOPS = SI.stops.map((s, n) => Object.assign({}, s, { i: IDX[s.epoch], n }));
  const STOP = {}; STOPS.forEach(s => { STOP[s.epoch] = s; });
  const TOUR = STOPS.filter(s => s.tour);
  const PLATES = SI.plates || {};
  const MYTHS = SI.myths;
  const NEURAL = {}; (SI.neural || []).forEach(r => { (NEURAL[r.ep] || (NEURAL[r.ep] = [])).push(r); });
  const NETWORKS = {}; (SI.networks || []).forEach(r => { (NETWORKS[r.ep] || (NETWORKS[r.ep] = [])).push(r); });
  const MAKING = {}; (SI.making || []).forEach(r => { (MAKING[r.ep] || (MAKING[r.ep] = [])).push(r); });
  const MOTORS = {}; (SI.motors || []).forEach(r => { (MOTORS[r.ep] || (MOTORS[r.ep] = [])).push(r); });
  const SEX = {}; (SI.sex || []).forEach(r => { (SEX[r.ep] || (SEX[r.ep] = [])).push(r); });
  const GENOMES = {}; (SI.genomes || []).forEach(r => { (GENOMES[r.ep] || (GENOMES[r.ep] = [])).push(r); });
  const NERVEGENES = {}; (SI.nervegenes || []).forEach(r => { (NERVEGENES[r.ep] || (NERVEGENES[r.ep] = [])).push(r); });
  const OFFWORLD = {}; (SI.offworld || []).forEach(r => { (OFFWORLD[r.ep] || (OFFWORLD[r.ep] = [])).push(r); });
  const PLANTS = {}; (SI.plants || []).forEach(r => { (PLANTS[r.ep] || (PLANTS[r.ep] = [])).push(r); });
  const IMMUNITY = {}; (SI.immunity || []).forEach(r => { (IMMUNITY[r.ep] || (IMMUNITY[r.ep] = [])).push(r); });
  const PERSP = SI.perspectives || [];
  const PERSP_EP = {}, PERSP_INV = {};
  PERSP.forEach(p => {
    (p.epochs || []).forEach(ep => { (PERSP_EP[ep] || (PERSP_EP[ep] = [])).push(p); });
    (p.inventions || []).forEach(id => { (PERSP_INV[id] || (PERSP_INV[id] = [])).push(p); });
  });
  // every moment has a plain title; between stops it also has its own hook
  const MOM = {}; (SI.moments || []).forEach(m => { MOM[m.epoch] = m; });
  const titleOf = i => (MOM[E[i].id] || {}).title || fmtTime(E[i].t);
  const hookOf = i => STOP[E[i].id] ? STOP[E[i].id].hook : (MOM[E[i].id] || {}).hook || E[i].key;
  const stopsAround = i => ({ prev: STOPS.filter(s => s.i < i).pop() || null, next: STOPS.find(s => s.i > i) || null });

  // graph: explicit links plus "next step in the same part"
  const IN = {}, OUT = {};
  INV.forEach(u => { IN[u.id] = []; OUT[u.id] = []; });
  SI.links.forEach(l => {
    OUT[l.from].push({ id: l.to, why: l.why, kind: 'link', refs: l.refs || [] });
    IN[l.to].push({ id: l.from, why: l.why, kind: 'link', refs: l.refs || [] });
  });
  ORDER.forEach(k => {
    const h = HIST[k];
    for (let j = 1; j < h.length; j++) {
      OUT[h[j - 1].id].push({ id: h[j].id, why: 'Next step in ' + PK[k].name.toLowerCase(), kind: 'lane' });
      IN[h[j].id].push({ id: h[j - 1].id, why: 'Earlier ' + PK[k].name.toLowerCase(), kind: 'lane' });
    }
  });
  function closure(id, dir) {
    const adj = dir === 'back' ? IN : OUT;
    const seen = new Set([id]); const st = [id];
    while (st.length) { const c = st.pop(); for (const n of adj[c]) if (!seen.has(n.id)) { seen.add(n.id); st.push(n.id); } }
    return seen;
  }

  const EPI = {
    'Deep-Time Conditional Scenario': { label: 'Educated scenario', lvl: 1, about: 'Built from physics and a few anchor facts. Treat as a careful estimate.' },
    'Proxy-Constrained Phanerozoic Scenario': { label: 'Fossil & proxy evidence', lvl: 2, about: 'Pinned by fossils, rock chemistry and living relatives.' },
    'Historical & Archaeological Reconstruction': { label: 'Historical record', lvl: 3, about: 'Pinned by archaeology, written records and population history.' },
    'Calibrated Modern Inventory': { label: 'Measured today', lvl: 4, about: 'Counted from modern surveys, censuses and hardware inventories.' }
  };

  /* ---------- formatting ---------- */
  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plain = v => Number(Number(v).toPrecision(3)).toLocaleString('en-US');
  function sci(v) {
    if (v === 0) return '0';
    if (v == null || isNaN(v)) return '—';
    const a = Math.abs(v);
    if (a >= 0.01 && a < 1e4) return plain(v);
    let e = Math.floor(Math.log10(a));
    let m = Math.round((v / Math.pow(10, e)) * 10) / 10;
    if (Math.abs(m) >= 10) { m /= 10; e += 1; }
    return (Number.isInteger(m) ? String(m) : m.toFixed(1)) + '×10' + sup(e);
  }
  function watts(v) {
    if (v >= 1e12) return plain(v / 1e12) + ' TW';
    if (v >= 1e9) return plain(v / 1e9) + ' GW';
    if (v >= 1e6) return plain(v / 1e6) + ' MW';
    if (v >= 1e3) return plain(v / 1e3) + ' kW';
    return plain(v) + ' W';
  }
  function fmtTime(t) {
    if (t >= 1000) return (t / 1000).toFixed(2) + ' billion yrs ago';
    if (t >= 1) return Number(t.toPrecision(4)) + ' million yrs ago';
    const ya = Math.round(t * 1e6);
    if (ya >= 10000) return Math.round(ya / 1000).toLocaleString('en-US') + ',000 yrs ago';
    const y = 2026 - ya;
    if (y <= 0) return Math.round((1 - y) / 100) * 100 + ' BCE';
    if (y < 1200) return Math.round(y / 100) * 100 + ' CE';
    return String(y);
  }
  function fmtShort(t) {
    if (t >= 1000) return (t / 1000).toFixed(2) + ' Ga';
    if (t >= 1) return Number(t.toPrecision(4)) + ' Ma';
    const ya = Math.round(t * 1e6);
    if (ya >= 10000) return Math.round(ya / 1000) + ' ka';
    const y = 2026 - ya;
    if (y <= 0) return Math.round((1 - y) / 100) * 100 + ' BCE';
    if (y < 1200) return Math.round(y / 100) * 100 + ' CE';
    return String(y);
  }
  function delta(v, p) {
    if (p == null) return '';
    if (p === 0 && v === 0) return '';
    if (p === 0) return 'new';
    if (v === 0) return '−100%';
    const r = v / p;
    if (r >= 1.05) return '×' + (r < 10 ? r.toFixed(1) : r < 1000 ? Math.round(r).toLocaleString('en-US') : sci(r));
    if (r <= 0.95) return '−' + Math.round((1 - r) * 100) + '%';
    return 'same';
  }

  const GAUGES = [
    { k: 'cells', label: 'Living cells', sym: 'N_cells', unit: '', color: 'var(--act-2)' },
    { k: 'hcopy', label: 'DNA stored, all copies', sym: 'H_copy', unit: 'bits', color: 'var(--c-store)' },
    { k: 'hdiv', label: 'Unique genetic code', sym: 'H_div', unit: 'bits', color: 'var(--c-store)' },
    { k: 'mact', label: 'Working memory', sym: 'M_active', unit: 'bits', color: 'var(--c-ram)' },
    { k: 'cbio', label: 'Chemical operations', sym: 'C_biochem', unit: '/s', color: 'var(--s-chem)' },
    { k: 'cneu', label: 'Synapse signals', sym: 'C_neural', unit: '/s', color: 'var(--s-neuro)' },
    { k: 'cdig', label: 'Silicon operations', sym: 'C_digital,exec', unit: '/s', color: 'var(--s-silicon)' },
    { k: 'mexo', label: 'Memory outside bodies', sym: 'M_exo', unit: 'bits', color: 'var(--c-backup)' },
    { k: 'ptot', label: 'Power used', sym: 'P_total', unit: '', color: 'var(--c-power)', fmt: watts },
    { k: 'grp', label: 'Biggest group acting as one', sym: 'max group', unit: '', color: 'var(--c-net)' }
  ];
  const RANGE = {};
  GAUGES.forEach(g => { const v = E.map(e => e[g.k]).filter(x => x > 0); RANGE[g.k] = [Math.log10(Math.min(...v)), Math.log10(Math.max(...v))]; });

  /* ---------- part icons (24×24) ---------- */
  const ICON = {
    power: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    io: '<path d="M2 12c3-6 17-6 20 0-3 6-17 6-20 0z"/><circle cx="12" cy="12" r="3"/>',
    wire: '<path d="M2 12c2.5-6 4.5-6 7 0s4.5 6 7 0 4-5 6 0"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    ram: '<rect x="2" y="7" width="20" height="9" rx="1.5"/><path d="M6 16v3M10 16v3M14 16v3M18 16v3M6 10h3M11 10h3M16 10h2"/>',
    prog: '<path d="M8 6 3 12l5 6M16 6l5 6-5 6M13.5 4l-3 16"/>',
    store: '<path d="M8 3c0 6 8 6 8 9s-8 3-8 9M16 3c0 6-8 6-8 9s8 3 8 9M9 6h6M9 18h6"/>',
    backup: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    net: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="19" r="2.5"/><path d="M7.5 6h9M6.2 8.2l4.6 8.6M17.8 8.2l-4.6 8.6"/>',
    make: '<circle cx="8.5" cy="12" r="5.5"/><circle cx="15.5" cy="12" r="5.5"/><path d="M12 7.5v9"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'
  };
  const icon = k => '<svg viewBox="0 0 24 24" class="picon" aria-hidden="true">' + (ICON[k] || '') + '</svg>';

  /* ---------- creature drawings (placeholder line art, viewBox 120×80) ---------- */
  function hx(cx, cy, r) { const p = []; for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); } return '<polygon class="f" points="' + p.join(' ') + '"/>'; }
  function rays(cx, cy, r0, r1, n) { let d = ''; for (let k = 0; k < n; k++) { const a = 2 * Math.PI * k / n; d += 'M' + (cx + r0 * Math.cos(a)).toFixed(1) + ' ' + (cy + r0 * Math.sin(a)).toFixed(1) + 'L' + (cx + r1 * Math.cos(a)).toFixed(1) + ' ' + (cy + r1 * Math.sin(a)).toFixed(1); } return d; }
  function star(cx, cy, ro, ri, n) { const p = []; for (let k = 0; k < 2 * n; k++) { const r = k % 2 ? ri : ro, a = Math.PI * k / n - Math.PI / 2; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  const FISH = '<path class="f" d="M18 40 C34 24 76 24 94 39 C76 56 34 56 18 40 Z"/><path class="f" d="M92 40 L110 28 Q104 40 110 52 Z"/>';
  const G = {
    protocell: () => hx(36, 28, 13) + hx(55.5, 39.3, 13) + hx(36, 50.6, 13) + hx(75, 28, 13) + hx(75, 50.6, 13) + '<circle cx="55.5" cy="39.3" r="6"/><circle class="a" cx="55.5" cy="39.3" r="2.4"/><circle cx="98" cy="30" r="2"/><circle cx="103" cy="20" r="1.5"/><circle cx="97" cy="12" r="1"/>',
    cell: () => '<rect class="f" x="28" y="24" width="64" height="32" rx="16"/><path class="as" d="M44 40 c4 -6 8 -6 12 0 s8 6 12 0 s8 -6 12 0"/><circle class="d" cx="38" cy="33" r="1.6"/><circle class="d" cx="83" cy="47" r="1.6"/><circle class="d" cx="40" cy="48" r="1.6"/><circle class="d" cx="82" cy="32" r="1.6"/>',
    rod: () => '<rect class="f" x="44" y="30" width="40" height="20" rx="10"/><path d="M44 40 c-5 -6 -9 6 -14 0 s-9 6 -14 0 s-9 6 -14 0"/><path class="t" d="M84 34 l3 -3 M86 40 h4 M84 46 l3 3"/><circle class="a" cx="97" cy="40" r="3"/><circle class="a" cx="104" cy="35" r="2.2"/><circle class="a" cx="105" cy="45" r="2"/><circle class="a" cx="112" cy="40" r="1.6"/><circle class="a" cx="114" cy="31" r="1.2"/>',
    cyano: () => [30, 47, 64, 81].map(x => '<circle class="f" cx="' + x + '" cy="50" r="8"/><path class="t" d="M' + (x - 4) + ' 48 q4 -3 8 0 M' + (x - 4) + ' 52 q4 3 8 0"/>').join('') + '<circle class="a" cx="102" cy="18" r="6"/><path class="t as" d="' + rays(102, 18, 9, 13, 8) + '"/>',
    ice: () => '<circle class="f" cx="60" cy="40" r="27"/><path class="ic" d="M39.9 22 A27 27 0 0 1 80.1 22 Z"/><path class="ic" d="M39.9 58 A27 27 0 0 0 80.1 58 Z"/><path class="t" d="M33 40 H87"/><path d="M60 31 v18 M52.2 35.5 l15.6 9 M52.2 44.5 l15.6 -9"/>',
    euk: () => '<circle class="f" cx="60" cy="40" r="29"/><circle cx="55" cy="38" r="10"/><circle class="d" cx="57" cy="36" r="2.4"/><g transform="rotate(-25 76 27)"><ellipse class="as" cx="76" cy="27" rx="8" ry="4"/><path class="t as" d="M70 27 l2.5 -2 l2.5 4 l2.5 -4 l2.5 4 l2.5 -2"/></g><g transform="rotate(20 74 55)"><ellipse class="as" cx="74" cy="55" rx="8" ry="4"/><path class="t as" d="M68 55 l2.5 -2 l2.5 4 l2.5 -4 l2.5 4 l2.5 -2"/></g><path class="t" d="M38 54 q6 6 14 4 M40 26 q4 -4 10 -4"/>',
    chlamy: () => '<ellipse class="f" cx="60" cy="48" rx="15" ry="21"/><path d="M57 28 c-6 -12 -16 -14 -26 -22 M63 28 c6 -12 16 -14 26 -22"/><path class="t" d="M48 52 q12 22 24 0"/><circle cx="60" cy="42" r="4"/><circle class="a" cx="71" cy="40" r="3.2"/>',
    filament: () => { let s = ''; for (let j = 0; j < 8; j++) { const y = 8 + j * 8; s += '<rect class="f" x="54" y="' + y + '" width="12" height="8" rx="2"/><circle class="d" cx="60" cy="' + (y + 4) + '" r="1.2"/>'; } return s + '<path d="M60 72 l-8 6 M60 72 l8 6 M60 72 v7"/>'; },
    rosette: () => { let s = ''; for (let k = 0; k < 7; k++) { const a = 2 * Math.PI * k / 7 - Math.PI / 2, c = Math.cos(a), n = Math.sin(a); const cx = 60 + 15 * c, cy = 40 + 15 * n, px = 60 + 21 * c, py = 40 + 21 * n; const l = dx => { const b = a + dx; return 'M' + px.toFixed(1) + ' ' + py.toFixed(1) + 'L' + (px + 6 * Math.cos(b)).toFixed(1) + ' ' + (py + 6 * Math.sin(b)).toFixed(1); }; s += '<circle class="f" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5.5"/><path class="t" d="' + l(0.45) + l(-0.45) + 'M' + px.toFixed(1) + ' ' + py.toFixed(1) + 'L' + (60 + 33 * c).toFixed(1) + ' ' + (40 + 33 * n).toFixed(1) + '"/>'; } return s + '<circle class="a" cx="60" cy="40" r="3"/>'; },
    frond: () => { let b = ''; for (let y = 18; y <= 62; y += 6) { const w = 17 * Math.sin(Math.PI * (y - 12) / 56) * 0.85; b += 'M60 ' + y + ' l' + w.toFixed(1) + ' -4 M60 ' + y + ' l' + (-w).toFixed(1) + ' -4 '; } return '<path class="f" d="M60 12 C80 24 82 54 60 68 C38 54 40 24 60 12 Z"/><path d="M60 72 V12"/><path class="t" d="' + b + '"/><ellipse class="t" cx="60" cy="74" rx="9" ry="2.5"/>'; },
    worm: () => '<path class="f" d="M24 42 C30 30 84 28 96 38 C101 42 99 49 92 51 C80 54 30 55 24 42 Z"/><path class="t" d="' + [36, 46, 56, 66, 76, 86].map(x => 'M' + x + ' 34 q2 8 0 16').join(' ') + '"/><circle class="a" cx="92" cy="41" r="2.4"/><path class="t dash" d="M4 46 H18"/>',
    burrow: () => '<path d="M4 22 H116"/><path class="t" d="M10 18 l4 4 M30 18 l4 4 M88 18 l4 4 M104 18 l4 4"/><path class="as" d="M18 22 L24 40 L34 34 L42 52 L52 46 L60 62 L70 56 L78 70"/><path class="t" d="M24 40 l-4 6 M42 52 l-4 6 M60 62 l-4 6 M34 34 l4 -5 M52 46 l4 -5 M70 56 l4 -5"/><ellipse class="f" cx="86" cy="71" rx="8" ry="3.5" transform="rotate(-20 86 71)"/>',
    arthropod: () => { let s = '<ellipse class="f" cx="66" cy="40" rx="32" ry="11"/>'; for (let k = 0; k < 9; k++) { const x = (42 + k * 6.5).toFixed(1); s += '<ellipse class="t" cx="' + x + '" cy="26" rx="3.4" ry="5.5"/><ellipse class="t" cx="' + x + '" cy="54" rx="3.4" ry="5.5"/>'; } return s + '<path d="M36 34 L28 26 M36 46 L28 54"/><circle class="a" cx="26" cy="24" r="3.8"/><circle class="a" cx="26" cy="56" r="3.8"/><path d="M34 37 C24 34 16 38 14 46 C13 51 18 52 20 48"/><path d="M34 43 C28 47 26 53 26 60 C26 65 31 65 32 61"/><path class="t" d="M98 40 l13 -8 M98 40 h14 M98 40 l13 8"/>'; },
    fish: () => FISH + '<path class="t" d="M44 29 C40 36 40 44 44 51"/><circle class="d" cx="28" cy="37" r="2.4"/><circle class="a" cx="50" cy="44" r="1.5"/><circle class="a" cx="55" cy="44" r="1.5"/><circle class="a" cx="60" cy="44" r="1.5"/><circle class="a" cx="65" cy="44" r="1.5"/>',
    jawfish: () => FISH + '<path class="as" d="M18 41 L31 46"/><path class="f" d="M60 26 L68 14 L74 28 Z"/><path class="f" d="M44 50 L38 62 L52 54 Z"/><path class="t" d="M40 30 C36 36 36 44 40 50"/><circle class="d" cx="28" cy="36" r="2.4"/>',
    plant: () => '<path d="M8 72 H112"/><path d="M60 72 V48 M60 48 C60 40 52 36 50 26 M60 48 C60 40 68 36 70 30 M50 26 C48 20 44 18 42 13 M50 26 C52 20 56 18 56 15 M70 30 C72 24 76 22 78 18 M30 72 V56 M30 56 C30 50 26 46 24 41 M30 56 C32 50 36 48 38 43 M88 72 V60 C88 54 92 50 94 46"/>' + [[42, 10], [56, 12], [78, 15], [24, 38], [38, 40], [94, 43]].map(([x, y]) => '<ellipse class="a" cx="' + x + '" cy="' + y + '" rx="2.8" ry="3.8"/>').join('') + '<path class="t" d="M14 75 Q40 79 70 75 Q90 73 106 77"/>',
    tetrapod: () => '<path class="t dash" d="M4 66 H116"/><path class="f" d="M14 42 C24 32 66 30 96 40 C76 52 34 54 14 42 Z"/><path class="f" d="M96 40 L112 33 L112 47 Z"/><path d="M40 49 L35 61 L44 63"/><path d="M72 48 L70 57 L77 59"/><circle class="d" cx="25" cy="38" r="2.4"/><path class="t" d="M33 33 C31 38 31 45 33 49"/>',
    dragonfly: () => '<ellipse class="f" cx="38" cy="22" rx="5.5" ry="18" transform="rotate(14 38 22)"/><ellipse class="f" cx="38" cy="58" rx="5.5" ry="18" transform="rotate(-14 38 58)"/><ellipse class="f" cx="52" cy="23" rx="5" ry="17" transform="rotate(-12 52 23)"/><ellipse class="f" cx="52" cy="57" rx="5" ry="17" transform="rotate(12 52 57)"/><path class="as" d="M36 40 H108" style="stroke-width:3.5"/><ellipse class="f" cx="34" cy="40" rx="7" ry="4.5"/><circle class="f" cx="22" cy="40" r="5"/><circle class="d" cx="20" cy="37" r="1.6"/><circle class="d" cx="20" cy="43" r="1.6"/>',
    lystro: () => '<ellipse class="f" cx="64" cy="40" rx="28" ry="14"/><path class="f" d="M38 34 C32 28 21 29 17 37 C15 43 20 48 27 48 L38 46 Z"/><path d="M21 47 l-2 8"/><circle class="d" cx="27" cy="36" r="2"/><path d="M46 51 v14 h-5 M58 53 v13 h-5 M76 52 v14 h-5 M86 49 v15 h-5 M92 38 l8 3"/>',
    mammal: () => '<path class="f" d="M12 44 C22 38 30 32 44 32 C64 30 82 34 88 44 C92 52 84 56 76 56 L40 56 C30 56 22 50 12 44 Z"/><path d="M36 33 c-2 -7 6 -9 8 -2"/><circle class="d" cx="27" cy="40" r="2"/><circle class="a" cx="12" cy="44" r="2"/><path class="t" d="M13 44 l-8 -3 M13 45 l-9 1 M13 46 l-8 4"/><path d="M88 48 C100 48 108 40 114 30"/><path d="M44 56 v6 M54 56 v6 M72 56 v6 M80 56 v6"/>',
    bird: () => '<path class="f" d="M54 40 C58 24 72 12 92 9 C86 16 82 22 76 27 C84 25 90 26 96 28 C84 34 72 38 62 43 Z"/><ellipse class="f" cx="56" cy="46" rx="16" ry="9"/><circle class="f" cx="40" cy="36" r="6"/><path d="M34 35 l-8 2 l8 2"/><circle class="d" cx="39" cy="35" r="1.4"/><path class="t" d="M64 30 l6 4 M70 24 l7 5 M78 18 l7 5"/><path class="as" d="M70 50 C82 56 96 60 112 60"/><path class="t" d="M80 54 l1 7 M88 57 l1 7 M96 59 l1 7 M104 60 l1 7"/><path d="M54 54 l-2 10 M60 54 l2 10"/>',
    trex: () => '<path class="f" d="M6 30 C24 26 40 26 52 30 C62 26 72 22 80 22 L84 16 L106 16 C110 16 112 20 112 24 L112 30 L98 30 L98 34 L86 34 C82 40 76 44 70 46 C60 48 54 46 50 44 C40 40 22 34 6 30 Z"/><path class="t" d="M98 30 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2"/><circle class="d" cx="100" cy="21" r="1.8"/><path d="M76 40 l4 5 l3 -1"/><path d="M54 44 L50 58 L56 70 L64 70 M64 46 L64 58 L70 70 L76 70"/><g class="t"><circle class="a" cx="18" cy="70" r="2"/><circle class="a" cx="23.5" cy="70" r="2.3"/><circle class="a" cx="30" cy="70" r="3"/><path d="M22 72 l-3 5 M24 72 v5 M26 72 l3 5 M22 68 l-3 -5 M24 68 v-5 M26 68 l3 -5"/></g>',
    impact: () => '<path class="f" d="M2 80 Q60 44 118 80 Z"/><circle class="d" cx="90" cy="16" r="6"/><path class="t" d="M95 12 l16 -9 M96 17 l18 -6 M92 10 l10 -9"/><path class="t dash" d="M86 22 L70 50"/><polygon class="a" points="' + star(66, 56, 12, 4.5, 8) + '"/>',
    whale: () => '<g transform="translate(14 0) scale(0.88)"><path class="f" d="M10 44 C16 38 26 37 34 37 C52 30 82 30 98 40 C104 43 108 39 113 33 L115 46 L109 46 C104 52 90 55 70 55 C46 56 26 52 16 48 L6 46 Z"/><path class="f" d="M64 32 L72 21 L76 33 Z"/><path d="M44 51 l-4 10 l10 -6"/><circle class="d" cx="24" cy="42" r="1.8"/></g><path class="as" d="M12 36 q-6 9 0 18 M7 31 q-9 14 0 28"/>',
    ape: () => '<circle class="f" cx="34" cy="38" r="6"/><circle class="f" cx="86" cy="38" r="6"/><circle class="f" cx="60" cy="38" r="24"/><path d="M44 31 Q60 23 76 31"/><circle class="d" cx="52" cy="35" r="2.2"/><circle class="d" cx="68" cy="35" r="2.2"/><ellipse cx="60" cy="49" rx="13" ry="9"/><circle class="d" cx="57" cy="47" r="1.2"/><circle class="d" cx="63" cy="47" r="1.2"/><path class="t" d="M54 53 Q60 56 66 53"/><circle class="a" cx="98" cy="16" r="4"/><circle class="a" cx="106" cy="10" r="2.4"/>',
    stone: () => '<path class="f" d="M60 10 C74 22 80 44 74 60 C70 70 50 70 46 60 C40 44 46 22 60 10 Z"/><path class="t" d="M60 10 L56 30 L62 46 L56 62 M48 30 H56 M67 26 L62 46 L73 44 M48 48 L62 46"/><ellipse class="f" cx="98" cy="30" rx="10" ry="7"/><path class="as" d="M84 20 l-6 -6 M86 26 l-8 -1 M88 15 l-3 -7"/>',
    fire: () => '<path d="M30 72 L90 60 M30 60 L90 72"/><path class="f" d="M60 62 C44 58 40 44 48 32 C50 40 54 42 56 40 C54 30 58 20 66 12 C66 24 74 30 76 40 C78 50 72 60 60 62 Z"/><path class="a" d="M60 58 C54 56 52 50 56 44 C58 48 62 48 62 44 C66 48 68 54 60 58 Z"/>',
    speech: () => '<path class="f" d="M40 72 L40 60 C30 56 26 46 28 36 C30 22 42 14 56 14 C70 14 78 24 78 34 L84 44 L78 46 L78 53 C78 57 74 59 68 59 L64 59 L64 72"/><circle class="d" cx="66" cy="30" r="1.8"/><path class="as" d="M90 40 q6 8 0 16 M96 34 q10 14 0 28 M102 28 q14 20 0 40"/>',
    tablet: () => { let s = '<rect class="f" x="30" y="10" width="60" height="60" rx="7"/><path class="t" d="M34 27 H86 M34 41 H86 M34 55 H86"/>'; [16, 30, 44, 58].forEach((y, r) => { for (let x = 37 + (r % 2) * 4; x <= 80; x += 10) s += '<path class="d" d="M' + x + ' ' + y + ' h5 l-2.5 7 Z"/>'; }); return s; },
    book: () => { let s = '<path class="f" d="M60 22 C48 16 30 16 16 20 V66 C30 62 48 62 60 68 Z"/><path class="f" d="M60 22 C72 16 90 16 104 20 V66 C90 62 72 62 60 68 Z"/><path class="t" d="'; [28, 34, 40, 46, 52, 58].forEach(y => { s += 'M22 ' + y + ' Q38 ' + (y - 3) + ' 54 ' + (y + 1) + ' M66 ' + (y + 1) + ' Q82 ' + (y - 3) + ' 98 ' + y + ' '; }); return s + '"/>'; },
    telegraph: () => '<path d="M30 76 V12 M18 18 H42"/><circle class="f" cx="20" cy="15" r="2.4"/><circle class="f" cx="40" cy="15" r="2.4"/><path class="t" d="M20 15 Q70 34 118 18 M40 15 Q80 30 118 26"/><path class="as" d="M64 52 l6 -8 l4 8 l6 -8 l4 8 l6 -8 l4 8"/><path d="M58 68 h4 M68 68 h12 M86 68 h4 M96 68 h12"/>',
    tube: () => { let s = '<path class="f" d="M30 66 V32 C30 14 60 14 60 32 V66 Z"/><rect x="26" y="66" width="38" height="8" rx="2"/><path class="t" d="M33 74 v5 M41 74 v5 M49 74 v5 M57 74 v5"/><rect class="t" x="38" y="32" width="14" height="24"/><path class="as" d="M40 60 l2 -6 l2 6 l2 -6 l2 6 l2 -6"/><rect class="f" x="72" y="16" width="36" height="56" rx="3"/>'; for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) s += '<circle class="' + ((r * 3 + c) % 5 === 0 ? 'a' : 'd') + '" cx="' + (78 + c * 8) + '" cy="' + (24 + r * 9) + '" r="1.8"/>'; return s; },
    chip: () => { let d = ''; for (let k = 0; k < 5; k++) { const x = 44 + k * 8, y = 24 + k * 8; d += 'M' + x + ' 16 v-6 M' + x + ' 64 v6 M36 ' + y + ' h-6 M84 ' + y + ' h6 '; } return '<rect class="f" x="36" y="16" width="48" height="48" rx="4"/><path d="' + d + '"/><rect class="as" x="48" y="28" width="24" height="24" rx="2"/><path class="t" d="M56 28 v24 M64 28 v24 M48 36 h24 M48 44 h24"/>'; },
    gpu: () => '<rect class="f" x="18" y="18" width="84" height="44" rx="4"/><rect class="as" x="26" y="26" width="14" height="12" rx="1.5"/><rect class="as" x="44" y="26" width="14" height="12" rx="1.5"/><rect class="as" x="62" y="26" width="14" height="12" rx="1.5"/><rect class="as" x="80" y="26" width="14" height="12" rx="1.5"/><rect class="as" x="26" y="42" width="14" height="12" rx="1.5"/><rect class="as" x="44" y="42" width="14" height="12" rx="1.5"/><rect class="as" x="62" y="42" width="14" height="12" rx="1.5"/><rect class="as" x="80" y="42" width="14" height="12" rx="1.5"/><path class="t" d="M28 62 v6 M38 62 v6 M48 62 v6 M58 62 v6 M68 62 v6 M78 62 v6 M88 62 v6"/><circle class="a" cx="33" cy="32" r="2"/><circle class="a" cx="51" cy="32" r="2"/><circle class="a" cx="69" cy="32" r="2"/><circle class="a" cx="87" cy="32" r="2"/>',
    aerobe: () => '<ellipse class="f" cx="54" cy="40" rx="28" ry="15"/><path class="as" d="M34 40 l5 -5 l5 10 l5 -10 l5 10 l5 -10 l5 10 l5 -5"/><circle class="a" cx="94" cy="28" r="3.5"/><circle class="a" cx="101" cy="28" r="3.5"/><circle class="a" cx="96" cy="48" r="3.5"/><circle class="a" cx="103" cy="48" r="3.5"/><path class="t" d="M88 30 l-5 4 M90 48 l-6 -4"/>',
    snowball: () => '<circle class="f" cx="60" cy="40" r="28"/><path class="ic" d="M33 32 A28 28 0 0 1 87 32 Z"/><path class="ic" d="M33 48 A28 28 0 0 0 87 48 Z"/><path class="t dash" d="M32 40 H88"/><circle class="a" cx="60" cy="40" r="3.5"/><path class="t" d="' + rays(60, 40, 6, 16, 6) + '"/>',
    trilobite: () => '<path class="f" d="M36 28 C36 14 84 14 84 28 Z"/><ellipse class="f" cx="60" cy="46" rx="22" ry="18"/><path class="t" d="M52 28 v34 M68 28 v34 M40 36 h40 M39 44 h42 M41 52 h38"/><circle class="d" cx="48" cy="22" r="2"/><circle class="d" cx="72" cy="22" r="2"/><path d="M46 16 C38 10 30 12 26 18 M74 16 C82 10 90 12 94 18"/>',
    hadrocodium: () => '<path class="f" d="M26 46 C34 38 44 34 56 34 C70 34 80 38 84 46 C86 51 80 54 72 54 L42 54 C34 54 30 50 26 46 Z"/><circle class="a" cx="44" cy="37" r="4.2"/><circle class="d" cx="35" cy="42" r="1.8"/><path class="as" d="M84 48 C96 50 104 44 110 34"/><path class="t" d="M26 46 l-7 -2 M26 47 l-7 2 M46 54 v5 M54 54 v5 M68 54 v5 M76 54 v5"/><rect class="t" x="18" y="16" width="34" height="8" rx="4"/>',
    primate: () => '<path class="t" d="M10 64 L110 48"/><path class="f" d="M34 46 C40 36 54 32 68 34 C78 36 84 42 82 50 L48 54 C38 54 32 50 34 46 Z"/><circle class="f" cx="34" cy="38" r="8"/><circle class="d" cx="31" cy="37" r="2"/><circle class="a" cx="39" cy="33" r="2.2"/><path class="as" d="M82 44 C96 36 106 22 102 12 C99 6 92 10 94 16"/><path d="M44 53 l-4 8 M54 53 l-2 7 M72 50 l2 6 M78 49 l4 6"/>',
    rack: () => { let s = ''; for (let j = 0; j < 4; j++) { const y = 8 + j * 17; s += '<rect class="f" x="30" y="' + y + '" width="60" height="13" rx="2"/><path class="t" d="M36 ' + (y + 4) + ' h28 M36 ' + (y + 9) + ' h28"/><circle class="d" cx="76" cy="' + (y + 6.5) + '" r="1.8"/><circle class="a" cx="83" cy="' + (y + 6.5) + '" r="2"/>'; } return s + '<path class="t as" d="M90 14 C104 14 104 31 90 31 M90 48 C104 48 104 65 90 65 M30 22 C16 22 16 56 30 56"/>'; },
    sponge: () => '<path class="f" d="M44 68 C40 48 42 26 50 18 C54 14 66 14 70 18 C78 26 80 48 76 68 Z"/><ellipse class="a" cx="60" cy="18" rx="9" ry="3.5"/><path class="t as" d="M60 12 v-6 M54 14 l-4 -5 M66 14 l4 -5"/><circle class="d" cx="50" cy="34" r="1.6"/><circle class="d" cx="68" cy="38" r="1.6"/><circle class="d" cx="54" cy="48" r="1.6"/><circle class="d" cx="66" cy="54" r="1.6"/><path class="t" d="M26 68 H94"/>',
    nautiloid: () => '<polygon class="f" points="108,40 46,27 46,53"/><path class="t" d="M58 30 v20 M70 32 v16 M82 34.5 v11 M94 37 v6"/><path class="f" d="M46 31 C36 31 32 35 32 40 C32 45 36 49 46 49 Z"/><circle class="d" cx="38" cy="37" r="2.2"/><path class="as" d="M32 35 C20 30 14 32 8 28 M32 39 H8 M32 43 C20 46 14 48 8 52 M32 46 C22 52 16 56 12 60"/>',
    eurypterid: () => '<ellipse class="f" cx="56" cy="40" rx="24" ry="12"/><polygon class="f" points="80,36 108,40 80,44"/><path class="t" d="M46 29 v22 M56 28 v24 M66 30 v20"/><path class="f" d="M44 29 L30 16 L38 24 Z M44 51 L30 64 L38 56 Z"/><path class="as" d="M33 35 L18 28 L22 34 M33 45 L18 52 L22 46"/><circle class="d" cx="38" cy="35" r="1.8"/><circle class="d" cx="38" cy="45" r="1.8"/>',
    placoderm: () => '<path class="f" d="M16 42 L34 24 L64 26 L94 38 L64 54 L34 56 Z"/><path class="f" d="M92 38 L110 26 L104 40 L110 52 Z"/><path class="as" d="M16 42 L32 44 L28 49 L20 47"/><path class="t" d="M46 26 L42 54 M58 27 L56 52"/><circle class="d" cx="30" cy="35" r="2.6"/>',
    amniote: () => '<path class="f" d="M18 48 C28 38 54 36 78 44 C92 48 102 44 112 36 C102 48 88 54 72 52 L32 52 Z"/><circle class="d" cx="26" cy="44" r="1.8"/><path d="M38 52 l-4 9 M66 52 l-3 9"/><ellipse class="f" cx="56" cy="22" rx="10" ry="7"/><path class="as" d="M52 22 c2 -3 6 -3 8 0"/>',
    cynodont: () => '<path class="f" d="M18 46 C26 34 48 30 74 34 C86 36 94 44 90 52 L34 52 C24 52 18 49 18 46 Z"/><path d="M90 48 C102 50 108 46 112 40 M38 52 v9 M48 52 v9 M72 52 v9 M82 52 v9"/><circle class="d" cx="30" cy="40" r="2"/><path class="as" d="M18 44 l-9 -4 M18 46 h-10 M18 48 l-9 4"/><path class="t" d="M36 33 q4 -6 8 0"/>',
    biped_dino: () => '<path class="f" d="M18 28 L38 26 L44 34 C56 32 72 34 86 40 L112 36 C96 46 78 48 64 46 L42 44 L36 34 L20 34 Z"/><circle class="d" cx="26" cy="30" r="1.8"/><path d="M58 46 L52 60 L58 70 h7 M66 46 L66 58 L74 68 h6 M44 42 l-4 8"/>',
    volcano: () => '<polygon class="f" points="16,70 46,30 74,30 104,70"/><path class="as" d="M52 30 C48 18 36 14 28 18 M60 30 V10 M68 30 C72 18 84 14 92 18"/><path class="a" d="M50 30 L44 48 L56 42 L62 54 L70 30 Z"/>',
    euprimate: () => '<path class="t" d="M12 66 L108 32"/><ellipse class="f" cx="54" cy="42" rx="18" ry="10" transform="rotate(-16 54 42)"/><circle class="f" cx="36" cy="36" r="8"/><circle class="a" cx="33" cy="35" r="2.6"/><circle class="a" cx="39" cy="35" r="2.6"/><path class="as" d="M70 38 C88 30 98 16 106 18"/><path d="M44 50 l-4 10 M64 44 l4 9"/>',
    biped_ape: () => '<circle class="f" cx="60" cy="16" r="7"/><path class="f" d="M54 24 H66 L68 46 H52 Z"/><path d="M55 46 L50 70 M65 46 L68 70 M54 27 L42 42 M66 27 L78 38"/><circle class="a" cx="80" cy="38" r="3"/><path class="t dash" d="M24 70 H96"/>',
    habilis: () => '<path class="f" d="M32 48 C30 28 46 16 66 18 C80 20 86 32 82 44 L86 52 L76 54 L74 62 H46 L44 50 Z"/><circle class="d" cx="72" cy="36" r="2.4"/><polygon class="a" points="96,26 108,38 98,52 90,40"/>',
    spear: () => '<path d="M14 62 L98 22"/><polygon class="a" points="110,16 94,19 99,28"/><polygon class="f" points="36,20 52,14 58,28 44,36"/><path class="t" d="M44 18 L48 32 M38 26 L54 22"/>',
    ochre: () => '<polygon class="f" points="22,26 92,20 100,56 28,62"/><path class="as" d="M36 28 L58 56 M52 26 L74 54 M68 24 L88 52 M34 52 L58 26 M50 54 L74 24 M66 54 L88 26"/>',
    wheat: () => '<path d="M42 70 V22 M78 70 V26"/><g class="f">' + [24, 32, 40, 48].map(y => '<ellipse cx="37" cy="' + y + '" rx="4" ry="2.5" transform="rotate(-30 37 ' + y + ')"/><ellipse cx="47" cy="' + y + '" rx="4" ry="2.5" transform="rotate(30 47 ' + y + ')"/>').join('') + '</g><polygon class="f" points="64,70 64,50 78,38 92,50 92,70"/><rect class="d" x="74" y="56" width="8" height="14"/>',
    bulla: () => '<circle class="f" cx="52" cy="42" r="24"/><path class="t" d="M36 34 l5 -3 l3 5 Z M48 30 h6 v6 h-6 Z"/><circle class="t" cx="44" cy="48" r="3.5"/><circle class="a" cx="88" cy="30" r="4.5"/><polygon class="a" points="84,48 94,48 89,39"/><rect class="a" x="84" y="54" width="9" height="9" rx="1.5"/>',
    alphabet: () => '<rect class="f" x="20" y="14" width="80" height="52" rx="6"/><path class="as" d="M32 48 L40 26 L48 48 M35 41 H45 M58 26 V48 Q70 48 70 37 Q70 26 58 26 M78 28 L88 48 M88 28 L78 48"/>',
    scroll_rule: () => '<rect class="f" x="26" y="16" width="68" height="48" rx="4"/><circle class="f" cx="26" cy="40" r="6"/><circle class="f" cx="94" cy="40" r="6"/><path class="as" d="M38 30 H56 L52 27 M66 30 L78 48 L56 48 Z"/><path class="t" d="M38 42 H50 M38 50 H50"/>',
    gears: () => '<circle class="f" cx="50" cy="40" r="20"/><circle class="d" cx="50" cy="40" r="5"/><path d="' + rays(50, 40, 20, 25, 12) + '"/><circle class="f" cx="82" cy="28" r="11"/><circle class="a" cx="82" cy="28" r="3"/><path d="' + rays(82, 28, 11, 14.5, 8) + '"/><path class="t" d="M36 40 H64 M50 26 V54"/>',
    codex: () => '<rect class="f" x="26" y="12" width="68" height="56" rx="4"/><path d="M36 12 V68"/><path class="t" d="M46 24 H82 M46 32 H82 M46 40 H82 M46 48 H74"/><polygon class="a" points="74,12 82,12 82,26 78,22 74,26"/>',
    zero: () => '<rect class="f" x="20" y="14" width="80" height="52" rx="6"/><ellipse class="as" cx="46" cy="40" rx="11" ry="16" style="fill:none;stroke-width:3.5"/><path d="M68 28 H86 L72 52 H88"/><circle class="a" cx="46" cy="40" r="2.5"/>',
    calculator: () => '<rect class="f" x="22" y="22" width="76" height="38" rx="4"/>' + [36, 52, 68, 84].map(x => '<circle class="a" cx="' + x + '" cy="41" r="6"/><path class="t" d="M' + x + ' 35 v12 M' + (x - 6) + ' 41 h12"/><rect class="d" x="' + (x - 4) + '" y="26" width="8" height="5"/>').join(''),
    punchcard: () => '<polygon class="f" points="18,18 94,18 102,26 102,62 18,62"/>' + [28, 38, 48, 58, 68, 78, 88].map((x, k) => '<rect class="' + (k % 2 ? 'a' : 'd') + '" x="' + x + '" y="' + (28 + (k % 3) * 9) + '" width="4" height="6"/><rect class="d" x="' + x + '" y="' + (37 + ((k + 1) % 2) * 9) + '" width="4" height="6"/>').join(''),
    wafer: () => '<circle class="f" cx="60" cy="40" r="27"/><path class="t" d="M36 28 H84 M33 40 H87 M36 52 H84 M48 16 V64 M60 13 V67 M72 16 V64"/><rect class="a" x="49" y="29" width="10" height="10"/><rect class="a" x="61" y="41" width="10" height="10"/>',
    transformer: () => { const L = [22, 40, 58], R = [22, 40, 58]; let s = ''; L.forEach(y1 => R.forEach(y2 => { s += '<line class="' + (y1 === y2 ? 'as' : 't') + '" x1="34" y1="' + y1 + '" x2="86" y2="' + y2 + '"/>'; })); L.forEach(y => { s += '<circle class="f" cx="30" cy="' + y + '" r="5.5"/><circle class="a" cx="90" cy="' + y + '" r="5.5"/>'; }); return s; },
    flower: () => { let s = '<path d="M52 74 V46"/><path class="f" d="M52 58 C42 54 38 60 46 64 Z M52 54 C62 50 66 56 58 60 Z"/>'; for (let k = 0; k < 6; k++) { const a = k * 60; s += '<ellipse class="f" cx="52" cy="24" rx="5.5" ry="11" transform="rotate(' + a + ' 52 36)"/>'; } s += '<circle class="a" cx="52" cy="36" r="6"/><ellipse class="f" cx="90" cy="28" rx="9" ry="5" transform="rotate(-18 90 28)"/><ellipse class="t" cx="88" cy="20" rx="6" ry="3" transform="rotate(-35 88 20)"/><circle class="a" cx="81" cy="30" r="2.2"/><path class="t dash" d="M62 34 Q72 28 80 30"/>'; return s; },
    spermwhale: () => '<path class="f" d="M14 30 C14 20 26 18 46 20 C68 22 86 30 98 38 L112 28 L108 40 L112 52 L98 43 C84 48 64 52 44 50 L24 48 L22 44 L38 44 L18 40 C14 38 14 34 14 30 Z"/><circle class="d" cx="34" cy="36" r="1.8"/><ellipse class="a" cx="28" cy="27" rx="9" ry="4"/><path class="as" d="M8 24 q-5 9 0 18 M4 19 q-8 14 0 28"/>',
    sapiens_skull: () => '<path class="f" d="M34 48 C30 28 42 14 60 14 C78 14 86 26 84 42 L86 50 L78 52 L76 62 H50 L48 52 C40 52 36 50 34 48 Z"/><circle class="d" cx="68" cy="36" r="3.2"/><circle class="d" cx="78" cy="36" r="2.2"/><path class="t" d="M52 56 H74"/><polygon class="a" points="98,24 108,40 98,56 92,40"/>',
    syn_cell: () => '<rect class="f" x="20" y="14" width="32" height="52" rx="5"/><rect class="t" x="24" y="20" width="24" height="36" rx="2"/><circle class="d" cx="36" cy="61" r="2"/><circle class="f" cx="84" cy="40" r="22"/><circle class="a" cx="84" cy="40" r="11" style="fill:none;stroke-width:2.5;stroke-dasharray:4 3"/><path class="as" d="M52 40 H62"/>',
    generic: () => '<circle class="t dash" cx="60" cy="40" r="24"/><circle class="a" cx="60" cy="40" r="3"/>'
  };
  const glyph = g => '<svg viewBox="0 0 120 80" class="gl" aria-hidden="true">' + (G[g] || G.generic)() + '</svg>';
  function plateArt(epochId, glyphKey, alt, eager) {
    const pl = PLATES[epochId];
    if (!pl || !pl.file) return '<div class="plate-art">' + glyph(glyphKey) + '</div>';
    return '<div class="plate-art has-photo">' +
      '<img class="plate-img" src="' + esc(pl.file) + '" alt="' + esc(alt || pl.caption || '') + '" width="640" height="480"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' onerror="this.parentElement.classList.remove(\'has-photo\');this.remove()">' +
      (pl.phylopic ? '<span class="plate-phylopic" title="PhyloPic body-plan silhouette"><img src="' + esc(pl.phylopic) + '" alt="" width="36" height="28" loading="lazy"></span>' : '') +
      '<span class="plate-glyph" title="Field-guide glyph">' + glyph(glyphKey) + '</span>' +
      '</div>';
  }
  function plateCredit(epochId) {
    const pl = PLATES[epochId];
    if (!pl || !pl.credit) return '';
    return '<p class="plate-credit"><a href="credits.html#' + esc(epochId) + '" title="Image source, author, and licence">' + esc(pl.credit) + '</a></p>';
  }
  function plateThumb(epochId, glyphKey) {
    const pl = PLATES[epochId];
    if (!pl || !pl.file) return glyph(glyphKey);
    return '<img class="plate-thumb" src="' + esc(pl.file) + '" alt="" loading="lazy" onerror="this.hidden=true;if(this.nextElementSibling)this.nextElementSibling.style.display=\'\'">' +
      '<span class="thumb-fallback" style="display:none">' + glyph(glyphKey) + '</span>';
  }

  /* ---------- header, footer, expert switch ---------- */
  function readExpert() { try { return localStorage.getItem('si-expert') === '1'; } catch (e) { return false; } }
  function writeExpert(v) { try { localStorage.setItem('si-expert', v ? '1' : '0'); } catch (e) { /* storage blocked */ } }
  const EXPERT_TIP = 'Expert view is for researchers and teachers. It adds the Theories tab in the menu, the symbols behind each number (like C_neural), the equations, every source and citation, the raw census rows, calculation graphs and uncertainty ranges. Switch it off to go back to the plain story. Your choice is remembered.';
  function chrome(page) {
    const mark = ORDER.map(k => '<i style="background:var(--c-' + k + ')"></i>').join('');
    const links = [['journey.html', 'journey', 'Journey'], ['tree.html', 'tree', 'Tree'], ['stories.html', 'stories', 'Stories'], ['atlas.html', 'atlas', 'Atlas'], ['how.html', 'how', 'How we know'], ['data.html', 'data', 'Data Lab'], ['theories.html', 'theories', 'Theories', true]];
    const footLinks = links.concat([['intelligence.html', 'intelligence', 'Intelligence formulas'], ['research.html', 'research', 'Papers'], ['papers.html', 'papers', 'Research desk']]);
    const head = document.getElementById('siteHead');
    const tools = head && head.querySelector('.head-tools');
    if (tools) {
      // the header and nav are static HTML so they work without scripts; only the switch needs JS
      tools.innerHTML = '<label class="switch" data-tip="' + EXPERT_TIP + '"><input type="checkbox" id="expertToggle"><span class="track"></span><span>Expert<span class="sw-more"> view</span></span><span class="tag">PhD</span></label>';
    } else if (head) {
      head.className = 'site-head';
      head.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">' + mark + '</span>Systema Intelligentiae</a>' +
        '<nav class="site-nav" aria-label="Main">' + links.map(l => '<a href="' + l[0] + '"' + (l[3] ? ' class="x-only"' : '') + (l[1] === page ? ' aria-current="page"' : '') + '>' + l[2] + '</a>').join('') + '</nav>' +
        '<div class="head-tools"><label class="switch" data-tip="' + EXPERT_TIP + '"><input type="checkbox" id="expertToggle"><span class="track"></span>Expert view <span class="tag">PhD</span></label></div></div>';
    }
    const foot = document.getElementById('siteFoot');
    if (foot) {
      foot.className = 'site-foot';
      const cur = (href, key, xOnly) => '<a href="' + href + '"' + (xOnly ? ' class="x-only"' : '') + (page === key ? ' aria-current="page"' : '') + '>';
      foot.innerHTML = '<div class="wrap">' +
        '<div class="colo" data-url="' + esc(location.href.split('#')[0]) + '"><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">' + mark + '</span>Systema Intelligentiae</a>' +
        '<p>A natural history of thinking matter: how Earth built memory, wiring and computing over 4.1 billion years, from one open census.</p>' +
        '<p class="upd">Last updated 22 Nov 2026</p></div>' +
        '<nav aria-labelledby="footExplore"><h2 id="footExplore">Explore</h2>' + footLinks.map(l => cur(l[0], l[1], l[3]) + l[2] + '</a>').join('') + '</nav>' +
        '<nav aria-labelledby="footAbout"><h2 id="footAbout">About</h2>' + cur('about.html', 'about') + 'About this project</a><a href="about.html#cite">How to cite</a>' +
        cur('credits.html', 'credits') + 'Image credits</a><a href="about.html#licence">Data licence</a><a href="data.html">Download the data</a></nav></div>';
    }
    timeKeys();
    const on = readExpert();
    document.body.classList.toggle('expert', on);
    const t = document.getElementById('expertToggle');
    if (t) {
      t.checked = on;
      t.addEventListener('change', () => {
        document.body.classList.toggle('expert', t.checked);
        writeExpert(t.checked);
        document.dispatchEvent(new CustomEvent('si:expert', { detail: t.checked }));
      });
    }
  }

  // all 72 census columns (census.js, ~109 KB) are only needed in Expert view, so pages fetch them on demand
  let censusWaiters = null;
  function loadCensus(cb) {
    if (window.SI_CENSUS) { cb(window.SI_CENSUS); return; }
    if (censusWaiters) { censusWaiters.push(cb); return; }
    censusWaiters = [cb];
    const s = document.createElement('script');
    s.src = 'assets/census.js';
    s.onload = () => { const w = censusWaiters; censusWaiters = null; w.forEach(f => f(window.SI_CENSUS)); };
    s.onerror = () => { censusWaiters = null; };
    document.head.appendChild(s);
  }

  // the catalog (atlas.js, ~60 KB) is only needed on the atlas page and for "Other minds" in the journey
  let atlasWaiters = null;
  function loadAtlas(cb) {
    if (window.SI_ATLAS) { cb(window.SI_ATLAS); return; }
    if (atlasWaiters) { atlasWaiters.push(cb); return; }
    atlasWaiters = [cb];
    const s = document.createElement('script');
    s.src = 'assets/atlas.js';
    s.onload = () => { const w = atlasWaiters; atlasWaiters = null; w.forEach(f => f(window.SI_ATLAS)); };
    s.onerror = () => { const w = atlasWaiters; atlasWaiters = null; w.forEach(f => f(null)); };
    document.head.appendChild(s);
  }
  // catalog kinds map onto the stack's layers and share their colours
  const KINDS = [['chem', 'Cells, plants, fungi'], ['nerve', 'Animals with nerves'], ['ai', 'Artificial neural nets'], ['sil', 'Computers and chips'], ['exo', 'Writing and archives'], ['grp', 'Colonies and societies']];
  const KIND = {}; KINDS.forEach(k => { KIND[k[0]] = { name: k[1], color: 'var(--l-' + k[0] + ')' }; });
  const yearsAgo = y => (y >= 1e9 ? (y / 1e9).toFixed(1).replace(/\.0$/, '') + ' billion years ago' : y >= 1e6 ? (y / 1e6).toFixed(1).replace(/\.0$/, '') + ' million years ago' : y >= 2000 ? Math.round(y).toLocaleString('en') + ' years ago' : y <= 1.5 ? 'today' : String(Math.round(2026 - y)));

  // the last journey moment a reader saw, for "Continue at stop N"
  function readLast() { try { const id = localStorage.getItem('si-last'); return IDX[id] !== undefined ? IDX[id] : null; } catch (e) { return null; } }
  function writeLast(i) { try { localStorage.setItem('si-last', E[i].id); } catch (e) { /* storage blocked */ } }
  const placeOf = i => STOP[E[i].id] ? 'stop ' + (STOP[E[i].id].n + 1) + ': ' + STOP[E[i].id].who : titleOf(i);

  // The wipe hides the marks until its animation runs, so start it only once the page is painting frames, and always
  // drop it after it should have finished: a throttled or background page then shows the full chart instead of an empty one.
  function drawIn(svg) {
    if (!window.requestAnimationFrame) return;
    requestAnimationFrame(() => {
      svg.classList.add('draw-in');
      setTimeout(() => svg.classList.remove('draw-in'), 1600);
    });
  }

  /* ---------- deep-time chart ---------- */
  const SERIES = ['cbio', 'cneu', 'cdig', 'cmax'];
  const momentText = i => fmtTime(E[i].t) + ': ' + (STOP[E[i].id] ? STOP[E[i].id].who : titleOf(i));
  function chart(svg, opts) {
    opts = opts || {};
    const W = 1000, H = opts.height || 300, L = 58, R = 18, T = 34, B = 46;
    const step = (W - L - R) / (N - 1);
    const X = i => L + i * step;
    const YMIN = -2, YMAX = 34;
    const Y = lv => T + (YMAX - lv) / (YMAX - YMIN) * (H - T - B);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.classList.add('chart');
    let s = '';
    ACTS.forEach(a => {
      const x0 = X(a.i0) - step / 2, x1 = X(a.i1) + step / 2;
      s += '<rect class="band" style="fill:' + a.color + '" x="' + x0.toFixed(1) + '" y="' + T + '" width="' + (x1 - x0).toFixed(1) + '" height="' + (H - T - B) + '"/>';
      s += '<text class="act" style="fill:color-mix(in srgb,' + a.color + ' 55%,var(--ink))" x="' + ((x0 + x1) / 2).toFixed(1) + '" y="' + (T - 11) + '" text-anchor="middle">' + a.n + '</text>';
    });
    [0, 10, 20, 30].forEach(lv => {
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(lv).toFixed(1) + '" y2="' + Y(lv).toFixed(1) + '"/>';
      s += '<text class="tick" x="' + (L - 8) + '" y="' + (Y(lv) + 4).toFixed(1) + '" text-anchor="end">10' + sup(lv) + '</text>';
    });
    s += '<text class="ylab" x="' + (L + 8) + '" y="' + (Y(-0.6)).toFixed(1) + '">operations per second, every step ×10</text>';
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>';
    s += '<g class="lines">';
    SERIES.forEach(k => {
      let d = '', pen = false;
      E.forEach((e, i) => { const v = e[k]; if (v > 0) { d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(Math.log10(v)).toFixed(1); pen = true; } else pen = false; });
      s += '<path class="s s-' + k + '" d="' + d + '"/>';
    });
    s += '</g>';
    STOPS.forEach(st => { s += '<circle class="stopdot" cx="' + X(st.i).toFixed(1) + '" cy="' + (H - B) + '" r="2.6"/>'; });
    E.forEach((e, i) => { if (CRISIS[e.id]) s += '<path class="crisis" d="M' + X(i).toFixed(1) + ' ' + (H - B + 6) + ' l-5 9 h10 Z"/>'; });
    [['EP01a', '4.1 Ga'], ['EP04a', '1.8 Ga'], ['EP08a', '541 Ma'], ['EP14a', '252 Ma'], ['EP21a', '3.3 Ma'], ['EP30a', '1945'], ['EP32b', '2026']].forEach(([id, lbl]) => {
      const i = IDX[id];
      s += '<text class="tick" x="' + X(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="' + (i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle') + '">' + lbl + '</text>';
    });
    s += '<line class="hovline" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" visibility="hidden"/><g class="selg"></g>';
    s += '<rect class="hit" x="' + (L - step / 2) + '" y="' + T + '" width="' + (W - L - R + step) + '" height="' + (H - T - B + 22) + '"/>';
    svg.innerHTML = s;
    const hit = svg.querySelector('.hit'), hov = svg.querySelector('.hovline'), selg = svg.querySelector('.selg');
    const pick = ev => { const r = svg.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * W; return Math.max(0, Math.min(N - 1, Math.round((x - L) / step))); };
    if (opts.onPick) hit.addEventListener('click', ev => opts.onPick(pick(ev)));
    hit.addEventListener('mousemove', ev => { const i = pick(ev); hov.setAttribute('x1', X(i)); hov.setAttribute('x2', X(i)); hov.setAttribute('visibility', 'visible'); if (opts.onHover) opts.onHover(i); });
    hit.addEventListener('mouseleave', () => { hov.setAttribute('visibility', 'hidden'); if (opts.onHover) opts.onHover(null); });
    // one authored moment: the lines wipe in left to right on first load (reduced motion shows them at once)
    if (opts.drawIn) drawIn(svg);
    // the slider is the keyboard and touch way through the 68 moments; input = live, change = committed
    const sl = opts.slider;
    if (sl) {
      sl.min = 0; sl.max = N - 1; sl.step = 1;
      sl.addEventListener('input', () => { if (opts.onSlide) opts.onSlide(Number(sl.value), false); });
      sl.addEventListener('change', () => { if (opts.onSlide) opts.onSlide(Number(sl.value), true); });
    }
    return {
      select(i) {
        let g = '<line class="selline" x1="' + X(i).toFixed(1) + '" x2="' + X(i).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '"/>';
        SERIES.forEach(k => { const v = E[i][k]; if (v > 0) g += '<circle class="seldot d-' + k + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(Math.log10(v)).toFixed(1) + '" r="6"/>'; });
        selg.innerHTML = g;
        if (sl) { sl.value = i; sl.setAttribute('aria-valuetext', momentText(i)); }
      }
    };
  }
  /* ---------- the Thinking Stack: seven capacities drawn as digit counts ----------
     Computing layers stack up from a centre line, memory layers stack down, the largest group is a strip below.
     A layer is as thick as its value has digits (log10), so the stack height is the sum of the digit counts. */
  const LAYERS = [
    { k: 'chem', side: 'up', name: 'Chemistry in cells', unit: 'reactions a second', sym: 'C_chem', color: 'var(--l-chem)', val: e => e.cbio },
    { k: 'nerve', side: 'up', name: 'Nerve signals', unit: 'signals a second', sym: 'C_nerve', color: 'var(--l-nerve)', val: e => e.cneu },
    { k: 'ai', side: 'up', name: 'Artificial neural nets', unit: 'operations a second', sym: 'C_AI', color: 'var(--l-ai)', val: e => e.cai || 0 },
    // all silicon minus the neural-net share, so nothing is counted twice
    { k: 'sil', side: 'up', name: 'Other silicon', unit: 'operations a second', sym: 'C_silicon', color: 'var(--l-sil)', val: e => Math.max(0, e.cdig - (e.cai || 0)) },
    { k: 'dna', side: 'down', name: 'DNA storage', unit: 'bits', sym: 'H_DNA', color: 'var(--l-dna)', val: e => e.hcopy },
    { k: 'exo', side: 'down', name: 'Outside memory', unit: 'bits', sym: 'M_exo', color: 'var(--l-exo)', val: e => e.mexo },
    { k: 'grp', side: 'strip', name: 'Largest group acting as one', unit: 'individuals', sym: 'N_group', color: 'var(--l-grp)', val: e => e.grp }
  ];
  const LK = {}; LAYERS.forEach(l => { LK[l.k] = l; });
  const digitsOf = v => (v >= 1 ? Math.log10(v) : 0);
  const DIGITS = E.map(e => { const o = {}; LAYERS.forEach(l => { o[l.k] = digitsOf(l.val(e)); }); return o; });
  const stackHeight = i => LAYERS.reduce((t, l) => t + DIGITS[i][l.k], 0);
  function stack(svg, opts) {
    opts = opts || {};
    const UP = LAYERS.filter(l => l.side === 'up'), DOWN = LAYERS.filter(l => l.side === 'down');
    const H = 470, T = 36, PB = 386, STRIP = 22, UPMAX = 108, DOWNMAX = 64;
    const S = (PB - T) / (UPMAX + DOWNMAX), Y0 = T + UPMAX * S, GY = PB + 16;
    let W = 1000, L = 54, R = 204, PW = W - L - R, narrow = false;
    let mode = 'ord', sel = N - 1, focus = null, hov = null, xb = [];
    svg.classList.add('stk');
    const f1 = n => n.toFixed(1);
    // wide: direct labels at the right edge; narrow (phones): all 68 columns fit the width and the legend carries the names
    function fit() { narrow = svg.parentElement.clientWidth < 640; W = narrow ? 400 : 1000; L = narrow ? 30 : 54; R = narrow ? 8 : 204; PW = W - L - R; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.classList.toggle('narrow', narrow); }
    function bounds() {
      const b = [];
      if (mode === 'ord') { for (let i = 0; i <= N; i++) b.push(L + i * PW / N); }
      else { const t0 = E[0].t; for (let i = 0; i < N; i++) b.push(L + (t0 - E[i].t) / t0 * PW); b.push(L + PW); }
      return b;
    }
    const colX = i => (mode === 'ord' ? (xb[i] + xb[i + 1]) / 2 : xb[i]);
    // one closed outline per run of columns where the layer exists, so empty stretches draw nothing
    function stepPath(top, bot) {
      let d = '', i = 0;
      while (i < N) {
        if (Math.abs(top[i] - bot[i]) < 0.01) { i++; continue; }
        let j = i; while (j < N && Math.abs(top[j] - bot[j]) >= 0.01) j++;
        d += 'M' + f1(xb[i]) + ' ' + f1(bot[i]);
        for (let c = i; c < j; c++) d += 'L' + f1(xb[c]) + ' ' + f1(top[c]) + 'L' + f1(xb[c + 1]) + ' ' + f1(top[c]);
        for (let c = j - 1; c >= i; c--) d += 'L' + f1(xb[c + 1]) + ' ' + f1(bot[c]) + 'L' + f1(xb[c]) + ' ' + f1(bot[c]);
        d += 'Z'; i = j;
      }
      return d;
    }
    function geometry() {
      const g = {}, up = E.map(() => 0), down = E.map(() => 0);
      UP.forEach(l => { const bot = up.map(b => Y0 - b * S); DIGITS.forEach((d, i) => { up[i] += d[l.k]; }); g[l.k] = { top: up.map(b => Y0 - b * S), bot }; });
      DOWN.forEach(l => { const top = down.map(b => Y0 + b * S); DIGITS.forEach((d, i) => { down[i] += d[l.k]; }); g[l.k] = { top, bot: down.map(b => Y0 + b * S) }; });
      g.grp = { top: DIGITS.map(d => GY + STRIP - d.grp * S), bot: DIGITS.map(() => GY + STRIP) };
      return g;
    }
    function place() {
      const hr = svg.querySelector('.hov'), sl = svg.querySelector('.sel');
      if (hov == null) hr.setAttribute('visibility', 'hidden');
      else { hr.setAttribute('visibility', 'visible'); hr.setAttribute('x', f1(xb[hov])); hr.setAttribute('width', f1(Math.max(1.5, xb[hov + 1] - xb[hov]))); }
      sl.setAttribute('x1', f1(colX(sel))); sl.setAttribute('x2', f1(colX(sel)));
    }
    let drawn = false;
    function render() {
      // the wipe plays once; a redraw for a highlight or a new time axis must not replay it
      if (drawn) svg.classList.remove('draw-in');
      drawn = true;
      fit(); xb = bounds();
      const g = geometry();
      let s = '';
      // acts: a thin key strip on top and a hairline at each boundary
      ACTS.forEach(a => {
        const x0 = xb[a.i0], x1 = xb[a.i1 + 1];
        s += '<rect x="' + f1(x0 + 1) + '" y="' + (T - 14) + '" width="' + f1(Math.max(0.5, x1 - x0 - 2)) + '" height="4" rx="1" style="fill:' + a.color + '"/>';
        if (x1 - x0 > 14) s += '<text class="actn" style="fill:color-mix(in srgb,' + a.color + ' 55%,var(--ink))" x="' + f1((x0 + x1) / 2) + '" y="' + (T - 19) + '" text-anchor="middle">' + a.n + '</text>';
        if (a.i0 > 0) s += '<line class="actline" x1="' + f1(x0) + '" x2="' + f1(x0) + '" y1="' + (T - 6) + '" y2="' + (GY + STRIP) + '"/>';
      });
      [20, 40, 60, 80, 100].forEach(d => { s += '<line class="grid" x1="' + L + '" x2="' + (L + PW) + '" y1="' + f1(Y0 - d * S) + '" y2="' + f1(Y0 - d * S) + '"/><text class="tick" x="' + (L - 8) + '" y="' + f1(Y0 - d * S + 4) + '" text-anchor="end">' + d + '</text>'; });
      [20, 40, 60].forEach(d => { s += '<line class="grid" x1="' + L + '" x2="' + (L + PW) + '" y1="' + f1(Y0 + d * S) + '" y2="' + f1(Y0 + d * S) + '"/><text class="tick" x="' + (L - 8) + '" y="' + f1(Y0 + d * S + 4) + '" text-anchor="end">' + d + '</text>'; });
      s += '<text class="side" x="' + (L + 8) + '" y="' + (T + 14) + '">DOING ↑' + (narrow ? '' : ' digits of operations a second') + '</text>';
      s += '<text class="side" x="' + (L + 8) + '" y="' + (PB - 7) + '">KEEPING ↓' + (narrow ? '' : ' digits of bits') + '</text>';
      s += '<g class="layers">';
      LAYERS.forEach(l => { s += '<path class="layer' + (focus && focus.indexOf(l.k) >= 0 ? ' on' : '') + '" style="fill:' + l.color + '" d="' + stepPath(g[l.k].top, g[l.k].bot) + '"/>'; });
      s += '</g>';
      s += '<line class="mid" x1="' + L + '" x2="' + (L + PW) + '" y1="' + f1(Y0) + '" y2="' + f1(Y0) + '"/><text class="tick" x="' + (L - 8) + '" y="' + f1(Y0 + 4) + '" text-anchor="end">0</text>';
      if (!narrow) {
        s += '<text class="tick" x="' + (L - 8) + '" y="' + f1(GY + STRIP - 4) + '" text-anchor="end">reach</text>';
        // direct labels at the right edge: name and today's value, kept 30px apart
        const now = E[N - 1], labs = LAYERS.map(l => ({ l, y: l.k === 'grp' ? GY + STRIP / 2 : (g[l.k].top[N - 1] + g[l.k].bot[N - 1]) / 2 })).sort((a, b) => a.y - b.y);
        labs.forEach(o => { o.ty = o.y; });
        for (let k = 1; k < labs.length; k++) if (labs[k].ty - labs[k - 1].ty < 30) labs[k].ty = labs[k - 1].ty + 30;
        for (let k = labs.length - 2; k >= 0; k--) if (labs[k + 1].ty - labs[k].ty < 30) labs[k].ty = labs[k + 1].ty - 30;
        labs.forEach(o => {
          const x = L + PW;
          s += '<path class="lead" fill="none" d="M' + (x + 3) + ' ' + f1(o.y) + ' L' + (x + 12) + ' ' + f1(o.ty) + ' H' + (x + 16) + '"/>';
          s += '<text class="lab" x="' + (x + 20) + '" y="' + f1(o.ty - 1) + '">' + esc(o.l.name) + '</text>';
          s += '<text class="labv" x="' + (x + 20) + '" y="' + f1(o.ty + 13) + '">' + sci(o.l.val(now)) + ' ' + o.l.unit + '</text>';
        });
      }
      STOPS.forEach(st => { s += '<circle class="stopdot" cx="' + f1(colX(st.i)) + '" cy="' + (GY + STRIP + 7) + '" r="2.2"/>'; });
      E.forEach((e, i) => { if (CRISIS[e.id]) s += '<path class="crisis" d="M' + f1(colX(i)) + ' ' + (GY + STRIP + 12) + ' l-4.5 8 h9 Z"/>'; });
      const ticks = mode === 'ord'
        ? (narrow ? [['EP01a', '4.1 Ga'], ['EP08a', '541 Ma'], ['EP21a', '3.3 Ma'], ['EP32b', '2026']] : [['EP01a', '4.1 Ga'], ['EP04a', '1.8 Ga'], ['EP08a', '541 Ma'], ['EP14a', '252 Ma'], ['EP21a', '3.3 Ma'], ['EP30a', '1945'], ['EP32b', '2026']]).map(([id, lbl]) => { const i = IDX[id]; return [colX(i), lbl, i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle']; })
        : (narrow ? [[4000, '4 Ga'], [2000, '2 Ga'], [0, 'today']] : [[4000, '4 billion years ago'], [3000, '3'], [2000, '2'], [1000, '1'], [541, '541 Ma'], [0, 'today']]).map(([t, lbl]) => [L + (E[0].t - t) / E[0].t * PW, lbl, t === 0 ? 'end' : t === 4000 ? 'start' : 'middle']);
      ticks.forEach(([x, lbl, a]) => { s += '<text class="tick" x="' + f1(x) + '" y="' + (H - 6) + '" text-anchor="' + a + '">' + lbl + '</text>'; });
      if (mode === 'time' && !narrow) s += '<text class="note" x="' + (L + PW - 8) + '" y="' + (T + 30) + '" text-anchor="end">all of human history is thinner than the right-hand edge →</text>';
      s += '<rect class="hov" y="' + (T - 6) + '" height="' + (GY + STRIP - T + 6) + '" visibility="hidden"/><line class="sel" y1="' + (T - 6) + '" y2="' + (GY + STRIP) + '"/>';
      s += '<rect class="hit" x="' + L + '" y="' + (T - 6) + '" width="' + PW + '" height="' + (GY + STRIP - T + 30) + '"/>';
      svg.innerHTML = s;
      svg.classList.toggle('focus', !!focus);
      const hit = svg.querySelector('.hit');
      const pick = ev => { const r = svg.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * W; let i = 0; while (i < N - 1 && xb[i + 1] <= x) i++; return i; };
      hit.addEventListener('mousemove', ev => { const i = pick(ev); if (i !== hov) { hov = i; place(); if (opts.onHover) opts.onHover(i); } });
      hit.addEventListener('mouseleave', () => { hov = null; place(); if (opts.onHover) opts.onHover(null); });
      hit.addEventListener('click', ev => { api.select(pick(ev)); });
      place();
    }
    const sl = opts.slider;
    const api = {
      select(i, quiet) {
        sel = Math.max(0, Math.min(N - 1, i)); place();
        if (sl) { sl.value = sel; sl.setAttribute('aria-valuetext', momentText(sel)); }
        if (!quiet && opts.onSelect) opts.onSelect(sel);
      },
      setMode(m) { mode = m === 'time' ? 'time' : 'ord'; render(); },
      setFocus(keys) { focus = keys && keys.length ? keys : null; render(); },
      get mode() { return mode; }, get selected() { return sel; }
    };
    if (sl) { sl.min = 0; sl.max = N - 1; sl.step = 1; sl.addEventListener('input', () => api.select(Number(sl.value))); }
    // the one authored moment: the layers wipe in left to right on first load (reduced motion shows them at once)
    if (opts.drawIn) drawIn(svg);
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { const was = narrow; fit(); if (was !== narrow) render(); }, 150); });
    render();
    return api;
  }

  const LEGEND = '<span><i style="background:var(--s-chem)"></i>Chemistry in cells</span><span><i style="background:var(--s-neuro)"></i>Nerve signals</span><span><i style="background:var(--s-silicon)"></i>Silicon chips</span><span><i class="dash"></i>Biggest single thinker</span><span><i class="tri"></i>Crisis</span>';

  /* ---------- "Where this number comes from": one panel for every census number ----------
     Any element with data-num="<census column>" (and optional data-i="<moment index>", default today) opens it.
     Content comes from content/number_sources.csv (SI.numrefs): equation, inputs, kind, sources. */
  let ledgerWaiters = null;
  function loadLedgers(cb) {
    if (window.SI_LEDGERS) { cb(window.SI_LEDGERS); return; }
    if (ledgerWaiters) { ledgerWaiters.push(cb); return; }
    ledgerWaiters = [cb];
    const s = document.createElement('script');
    s.src = 'assets/ledgers.js';
    s.onload = () => { const w = ledgerWaiters; ledgerWaiters = null; w.forEach(f => f(window.SI_LEDGERS)); };
    s.onerror = () => { const w = ledgerWaiters; ledgerWaiters = null; w.forEach(f => f(null)); };
    document.head.appendChild(s);
  }
  const W_ = 'W';
  const NUMNAME = {
    total_biomass_gt_c: ['Living matter', 'billion tonnes of carbon'], total_cells: ['Living cells', ''],
    h_copy_bits: ['DNA stored, every copy', 'bits'], h_sel_bits: ['DNA kept by selection', 'bits'], h_unique_bits: ['DNA, each sequence once', 'bits'],
    m_active_bits: ['Working memory', 'bits'], m_passive_bits: ['Long-term memory', 'bits'], m_exo_installed_bits: ['Memory outside the body', 'bits'],
    c_biochem_ops_sec: ['Reactions in cells', 'a second'], c_neural_ops_sec: ['Nerve signals', 'a second'], c_digital_ops_sec: ['Chip operations', 'a second'],
    c_digital_ai_ops_sec: ['AI chip operations', 'a second'], c_bioelectric_ops_sec: ['Electrical signals without nerves', 'a second'],
    c_max_entity_ops_sec: ['Most capable single thinker', 'operations a second'], gould_variance_right_tail: ['Lead of the top thinker over a typical cell', 'digits'],
    n_neurons_global: ['Neurons on Earth', ''], n_synapses_global: ['Synapses on Earth', ''],
    p_metabolic_watts: ['Power used by life and technology', W_], p_bio_watts: ['Power used by life', W_], p_tech_primary_watts: ['Power used by technology', W_],
    p_animal_watts: ['Power used by animals', W_], p_digital_it_watts: ['Power used by computers', W_], p_prok_watts: ['Power used by microbes', W_], p_euk_watts: ['Power used by other cells', W_],
    phi_persistence_bit_years: ['DNA memory × how long it lasts', 'bit-years'], tau_bio_lineage_years: ['How long a lineage lasts', 'years'],
    surface_temp_c: ['Surface temperature', '°C'], atm_o2_pct: ['Oxygen in the air', '%'], atm_co2_ppm: ['CO₂ in the air', 'parts per million'],
    max_collective_group_size: ['Largest group acting as one', 'individuals'],
    prokaryotic_biomass_gt_c: ['Carbon in microbes', 'billion tonnes'], phytomass_structural_gt_c: ['Carbon in wood', 'billion tonnes'],
    eukaryotic_active_biomass_gt_c: ['Carbon in other living cells', 'billion tonnes'], metazoan_biomass_gt_c: ['Carbon in animals', 'billion tonnes'],
    mean_prok_cell_mass_fg_c: ['Carbon in one microbe', 'femtograms'], n_euk_active_cells: ['Other active cells (plants, fungi, protists)', ''],
    f_deep_subsurface: ['Share of microbes deep in rock', ''], f_oligotrophic_maint: ['Share of microbes starving', ''], f_active_surface: ['Share of microbes at the surface', ''],
    m_dram_bits: ['Computer working memory (DRAM)', 'bits']
  };
  const NUMKIND = {
    inventory: ['From counts', 'Today’s value comes from surveys and inventories. Earlier moments are estimates.'],
    calc: ['Calculated', 'Worked out from other numbers in the census with the equation below.'],
    assume: ['Model assumption', 'Rests on a rule of thumb chosen for the model, not on a measurement.'],
    hand: ['Set by hand', 'Entered moment by moment by the model’s builder, guided by the studies listed below.']
  };
  const NUMUNC = { total_cells: 'N_prok', c_biochem_ops_sec: 'C_biochem', c_neural_ops_sec: 'C_neural (', c_digital_ops_sec: 'C_digital (' };
  const numName = c => (NUMNAME[c] || [c.replace(/_/g, ' '), ''])[0];
  const COLOF = {}; Object.keys(SI.numrefs || {}).forEach(c => { const k = SI.numrefs[c].k; if (k) COLOF[k] = c; });
  function numFmt(c, v) {
    if (v == null || v === '' || isNaN(v)) return '—';
    const u = (NUMNAME[c] || ['', ''])[1];
    if (u === W_) return watts(Number(v));
    if (/^f_/.test(c)) return Math.round(Number(v) * 1000) / 10 + '%';
    return sci(Number(v)) + (u ? ' ' + u : '');
  }
  let numDlg = null, numLast = null;
  // the calculation as a graph: the number on the right, what feeds it to the left (two levels deep)
  function calcGraph(col, i, C) {
    const box = numDlg && numDlg.querySelector('#numCalc'); if (!box) return;
    const NR = SI.numrefs || {}, valOf = c => { const j = C.columns.indexOf(c); return j >= 0 ? C.rows[i][j] : null; };
    const tree = (c, d) => { const R = NR[c]; return { c, R, kids: R && d < 2 ? R.in.map(k => tree(k, d + 1)) : [] }; };
    const root = tree(col, 0);
    let leaves = 0, depth = 0;
    const lay = (n, d) => { depth = Math.max(depth, d); if (!n.kids.length) { n.y = leaves++; } else { n.kids.forEach(k => lay(k, d + 1)); n.y = (n.kids[0].y + n.kids[n.kids.length - 1].y) / 2; } n.d = d; };
    lay(root, 0);
    const BW = 154, BH = 46, GX = 30, GY = 10, W = (depth + 1) * BW + depth * GX + 8, H = Math.max(1, leaves) * (BH + GY) + 8;
    const xOf = d => 4 + (depth - d) * (BW + GX), yOf = y => 4 + y * (BH + GY);
    const short = s => (s.length > 23 ? s.slice(0, 22) + '…' : s);
    let edges = '', nodes = '';
    const draw = n => {
      const x = xOf(n.d), y = yOf(n.y), open = !n.R || n.R.kind === 'hand' || n.R.kind === 'assume' || (!n.R.in.length);
      n.kids.forEach(k => {
        const x1 = xOf(k.d) + BW, y1 = yOf(k.y) + BH / 2, x2 = x, y2 = y + BH / 2, mx = (x1 + x2) / 2;
        edges += '<path d="M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + (x2 - 6) + ' ' + y2 + '"/><path class="hd" d="M' + (x2 - 7) + ' ' + (y2 - 4) + ' L' + (x2 - 1) + ' ' + y2 + ' L' + (x2 - 7) + ' ' + (y2 + 4) + '"/>';
        draw(k);
      });
      nodes += '<g class="cn' + (n.d === 0 ? ' root' : '') + (open ? ' leaf' : '') + '"' + (n.d ? ' data-num="' + n.c + '" data-i="' + i + '" role="button" tabindex="0"' : '') + '><title>' + esc(numName(n.c)) + (n.R ? ' · ' + esc(NUMKIND[n.R.kind][0]) : '') + '</title>' +
        '<rect x="' + x + '" y="' + y + '" width="' + BW + '" height="' + BH + '" rx="6"/>' +
        '<text x="' + (x + 10) + '" y="' + (y + 18) + '">' + esc(short(numName(n.c))) + '</text>' +
        '<text class="v" x="' + (x + 10) + '" y="' + (y + 36) + '">' + esc(numFmt(n.c, valOf(n.c))) + '</text></g>';
    };
    draw(root);
    box.innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Calculation graph for ' + esc(numName(col)) + '"><g class="ce">' + edges + '</g>' + nodes + '</svg>' +
      (leaves > 1 || root.kids.length ? '<p class="num-cap">Click a box on the left to open that number.</p>' : '<p class="num-cap">This number is not calculated from others in the census: it is entered directly.</p>');
  }
  // the number at every moment, on a log scale, with the opened moment ringed and 95% Monte Carlo band behind the line (B2)
  function histChart(col, i, U) {
    const box = numDlg && numDlg.querySelector('#numHist'), R = (SI.numrefs || {})[col]; if (!box || !R || !R.k) return;
    const lin = /^(surface_temp_c|atm_o2_pct|gould_variance_right_tail)$/.test(col);
    const vals = E.map(e => Number(e[R.k])), ok = v => isFinite(v) && (lin || v > 0), tr = v => (lin ? v : Math.log10(v));

    // Map per-moment 95% ranges from LED.uncertainty where present
    const bandMap = {};
    if (U && U.rows && U.columns) {
      const iEp = U.columns.indexOf('epoch_id'), iCol = U.columns.indexOf('census_column');
      if (iEp >= 0 && iCol >= 0) {
        U.rows.forEach(r => {
          if (r[iCol] === col && r[iEp]) {
            const blo = Number(r[3]), bhi = Number(r[5]);
            if (ok(blo) && ok(bhi)) bandMap[r[iEp]] = [blo, bhi];
          }
        });
      }
    }

    const ys = vals.filter(ok).map(tr);
    Object.keys(bandMap).forEach(ep => { ys.push(tr(bandMap[ep][0]), tr(bandMap[ep][1])); });
    if (!ys.length) { box.innerHTML = ''; return; }
    const lo = Math.min(...ys), hi = Math.max(...ys), span = hi - lo || 1, W = 520, H = 150, L = 8, Rr = 8, T = 14, B = 30;
    const xp = k => L + k / (N - 1) * (W - L - Rr), yp = v => T + (1 - (tr(v) - lo) / span) * (H - T - B);

    // Build contiguous 95% uncertainty band polygons (keeping plain line where moments have no range)
    let bandSvg = '', seg = [], hasBand = false;
    const flushSeg = () => {
      if (seg.length >= 2) {
        hasBand = true;
        const topPts = seg.map(s => xp(s.k).toFixed(1) + ' ' + yp(s.hi).toFixed(1));
        const botPts = seg.slice().reverse().map(s => xp(s.k).toFixed(1) + ' ' + yp(s.lo).toFixed(1));
        bandSvg += '<path class="hb" d="M' + topPts.join('L') + 'L' + botPts.join('L') + 'Z"/>';
      } else if (seg.length === 1) {
        hasBand = true;
        const s = seg[0], x0 = xp(s.k).toFixed(1);
        bandSvg += '<line class="hb-w" x1="' + x0 + '" x2="' + x0 + '" y1="' + yp(s.hi).toFixed(1) + '" y2="' + yp(s.lo).toFixed(1) + '"/>';
      }
      seg = [];
    };
    E.forEach((e, k) => {
      const b = bandMap[e.id];
      if (b && ok(vals[k])) seg.push({ k, lo: b[0], hi: b[1] });
      else flushSeg();
    });
    flushSeg();

    let d = '', pen = false;
    vals.forEach((v, k) => { if (ok(v)) { d += (pen ? 'L' : 'M') + xp(k).toFixed(1) + ' ' + yp(v).toFixed(1); pen = true; } else pen = false; });
    const acts = ACTS.map(a => '<line class="ab" x1="' + xp(a.i0).toFixed(1) + '" x2="' + xp(a.i0).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '"/><text class="tk" x="' + (xp(a.i0) + 3).toFixed(1) + '" y="' + (H - 12) + '">' + a.n + '</text>').join('');
    const fmtA = v => (lin ? numFmt(col, v) : '10' + sup(Math.round(v)));
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(numName(col)) + ' across the ' + N + ' moments' + (hasBand ? ' with 95% uncertainty band' : '') + '">' + acts +
      '<text class="tk" x="' + (W - Rr) + '" y="' + (T - 3) + '" text-anchor="end">' + fmtA(hi) + '</text><text class="tk" x="' + (W - Rr) + '" y="' + (H - B + 12) + '" text-anchor="end">' + fmtA(lo) + '</text>' +
      bandSvg + '<path class="hl" d="' + d + '"/>' + (ok(vals[i]) ? '<circle class="hr" cx="' + xp(i).toFixed(1) + '" cy="' + yp(vals[i]).toFixed(1) + '" r="5"/>' : '') + '</svg>' +
      '<p class="num-cap">Roman numerals mark the seven acts, from the first chemistry (I) to silicon (VII).' + (hasBand ? ' The shaded band marks the 95% range (10,000 draws); moments without a range keep the line alone.' : '') + (lin ? ' This one is drawn on an ordinary scale.' : '') + '</p>';
  }
  const PROV_LABEL = {
    measured: ['Measured here', 'Measured or inventoried directly for this moment.'],
    hand_sourced: ['Set by hand · sourced', 'Entered at this moment from a named dataset, fossil proxy or historical survey.'],
    hand_unsourced: ['Set by hand · no source', 'Entered by hand as a model scenario; no per-moment empirical dataset exists here.'],
    calc: ['Calculated', 'Worked out deterministically at this moment from the equation and inputs below.']
  };
  function numPanel(col, i) {
    const R = (SI.numrefs || {})[col];
    if (i == null || isNaN(i)) i = N - 1;
    const e = E[i], key = R && R.k, val = key && e[key] != null ? e[key] : null;
    if (!numDlg) {
      numDlg = document.createElement('dialog');
      numDlg.className = 'num-dlg';
      numDlg.setAttribute('aria-labelledby', 'numDlgH');
      numDlg.setAttribute('closedby', 'any');
      document.body.appendChild(numDlg);
      numDlg.addEventListener('click', ev => { if (ev.target.closest('.num-x')) numDlg.close(); });
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const outside = (ev, d) => { const r = d.getBoundingClientRect(); return ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom; };
        let pressedOut = false;
        numDlg.addEventListener('pointerdown', ev => { pressedOut = outside(ev, numDlg); });
        numDlg.addEventListener('pointerup', ev => { if (pressedOut && outside(ev, numDlg)) numDlg.close(); });
      }
      numDlg.addEventListener('close', () => {
        numDlg.returnValue = '';
        if (numLast && numLast.focus && document.contains(numLast)) numLast.focus();
      });
    }
    const when = i === N - 1 ? 'today' : momentText(i);
    const epi = EPI[e.epi] || null, kd = R ? NUMKIND[R.kind] : null;
    let h = '<div class="num-top"><div><span class="eyebrow">Where this number comes from</span><h2 id="numDlgH">' + esc(numName(col)) + '</h2></div><button type="button" class="num-x" aria-label="Close">×</button></div>';
    h += '<p class="num-val"><b>' + (val != null ? numFmt(col, val) : '—') + '</b><span>' + esc(when) + '</span><span id="numProvBadge"></span></p><div class="num-range" id="numRange"></div>';
    if (!R) {
      h += '<p class="muted">No source record exists for this number yet.</p>';
    } else {
      h += '<div class="num-how"><span class="num-kind" tabindex="0" data-tip="How the number is made overall. ' + esc(kd ? kd[1] : '') + '">' + esc(kd ? kd[0] : R.kind) + '</span>' + (epi ? '<span class="num-kind" tabindex="0" data-tip="How sure we are at this moment: ' + esc(epi.about) + '">' + esc(epi.label) + '</span>' : '') +
        '<p>' + esc(kd ? kd[1] : '') + (epi ? ' ' + esc(epi.about) : '') + '</p><p id="numProvNote" class="num-prov-note" hidden></p></div>';
      h += '<h3>How it is worked out</h3><pre class="formula">' + esc(R.eq) + '</pre><div id="numIn"></div>';
      h += '<div class="x-only num-graphs"><h3>The calculation as a graph</h3><p class="num-cap">Each box is one number at this moment; arrows show what feeds what. Boxes with a dashed edge are set by hand or are model assumptions, so the chain stops there.</p><div id="numCalc" class="num-calc"></div>' +
        '<h3>This number across all ' + N + ' moments</h3><p class="num-cap">Each step up is ten times more. Each column is one moment, not one year. The ring marks the moment you opened.</p><div id="numHist" class="num-hist"></div></div>';
      if (R.basis) h += '<h3>What it rests on</h3><p>' + esc(R.basis) + '</p>';
      h += '<div id="numSrc"></div>';
      const cites = (e.cites.match(/\d+/g) || []).map(Number), here = R.f.filter(n => cites.indexOf(n) >= 0), refs = here.length ? here : R.f;
      if (refs.length) h += '<details class="num-refs"><summary>' + refs.length + ' reference' + (refs.length > 1 ? 's' : '') + (here.length ? ' cited at this moment' : ' behind this number') + '</summary><ol class="refs">' + refs.map(n => '<li value="' + n + '">' + esc(SI.refs[n] || 'Reference ' + n) + '</li>').join('') + '</ol></details>';
      if (R.cite && R.cite.length) h += '<h3>Outside studies</h3><ul class="refs num-cite">' + R.cite.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>';
    }
    h += '<p class="num-go"><a href="data.html#' + e.id + '">See every moment in the Data Lab →</a><a href="data.html#evidence">Evidence heat map →</a>' + (/^(total_cells|c_neural_ops_sec|c_digital_ops_sec|h_copy_bits|m_exo_installed_bits|p_metabolic_watts)$/.test(col) && i === N - 1 ? '<a href="how.html#test">Test this number yourself →</a>' : '') + '</p>';
    numDlg.innerHTML = h;
    numLast = document.activeElement;
    if (!numDlg.open) { if (numDlg.showModal) numDlg.showModal(); else numDlg.setAttribute('open', ''); }
    if (!R) return;
    // Expert view: the calculation graph and the number's history
    const drawGraphs = () => {
      if (document.body.classList.contains('expert')) {
        loadCensus(C => {
          if (!C || !numDlg.open) return;
          calcGraph(col, i, C);
          histChart(col, i, window.SI_LEDGERS && window.SI_LEDGERS.uncertainty);
        });
      }
    };
    drawGraphs();
    document.removeEventListener('si:expert', numDlg._g || (() => {}));
    numDlg._g = drawGraphs; document.addEventListener('si:expert', drawGraphs);
    // inputs need the full census; key sources, per-moment provenance (B1), and 95% range (B2) need the ledgers
    if (R.in.length) loadCensus(C => {
      if (!C || !numDlg.open) return;
      const box = numDlg.querySelector('#numIn'); if (!box) return;
      box.innerHTML = '<table class="num-in"><caption>With the numbers ' + esc(i === N - 1 ? 'for today' : 'at this moment') + '</caption><tbody>' +
        R.in.map(c => { const j = C.columns.indexOf(c); return '<tr><th scope="row">' + esc(numName(c)) + '<code class="x-only">' + esc(c) + '</code></th><td>' + numFmt(c, j >= 0 ? C.rows[i][j] : null) + '</td></tr>'; }).join('') + '</tbody></table>';
    });
    loadLedgers(L => {
      if (!L || !numDlg.open) return;
      const S = L.sources, box = numDlg.querySelector('#numSrc');
      if (S && box && R.s.length) {
        const c = S.columns, iR = c.indexOf('primary_reference'), iC = c.indexOf('verified_empirical_constraint'), iA = c.indexOf('reconciliation_and_audit_status');
        const rows = R.s.map(id => S.rows.find(r => r[0] === id)).filter(Boolean);
        box.innerHTML = '<h3>Key studies</h3><ul class="num-src">' + rows.map(r => '<li><b>' + esc(r[iR]) + '</b><span>' + esc(r[iC]) + '</span><small class="x-only">' + esc(r[0]) + ' · ' + esc(r[iA]) + '</small></li>').join('') + '</ul>';
      }

      // B1: Per-moment provenance tag beside the value + specific source/note at this moment
      const OVR = L.overrides, pBadge = numDlg.querySelector('#numProvBadge'), pNote = numDlg.querySelector('#numProvNote');
      if (pBadge) {
        let pTag = 'calc', ovSrc = '', ovNote = '';
        if (OVR && OVR.rows && OVR.columns) {
          const iEp = OVR.columns.indexOf('epoch_id'), iCol = OVR.columns.indexOf('census_column'),
            iTag = OVR.columns.indexOf('provenance_tag'), iSrc = OVR.columns.indexOf('source'), iNt = OVR.columns.indexOf('note');
          const hit = OVR.rows.find(r => r[iEp] === e.id && r[iCol] === col);
          if (hit) { pTag = hit[iTag] || 'hand_sourced'; ovSrc = hit[iSrc] || ''; ovNote = hit[iNt] || ''; }
          else if (R.kind !== 'calc' && !R.in.length) { pTag = R.s.length ? 'hand_sourced' : 'hand_unsourced'; }
        }
        const meta = PROV_LABEL[pTag] || PROV_LABEL.calc;
        pBadge.innerHTML = '<span class="num-kind prov-' + esc(pTag) + '" tabindex="0" data-tip="' + esc(meta[1]) + '">' + esc(meta[0]) + '</span>';
        if (pNote && (ovNote || ovSrc)) {
          pNote.hidden = false;
          pNote.innerHTML = pTag === 'hand_unsourced'
            ? '<b>At this moment:</b> set by hand with no per-moment source' + (ovNote ? ' — ' + esc(ovNote) : '.')
            : '<b>At this moment:</b> ' + esc(ovNote) + (ovSrc ? ' <span class="muted">(Source: ' + esc(ovSrc) + ')</span>' : '');
        }
      }

      // B2: 95% range at any moment that has one in LED.uncertainty, plus refresh histChart band if Expert view is on
      const U = L.uncertainty, tok = NUMUNC[col], rg = numDlg.querySelector('#numRange');
      if (U && rg) {
        const iEp = U.columns ? U.columns.indexOf('epoch_id') : -1, iCol = U.columns ? U.columns.indexOf('census_column') : -1;
        let r = (iEp >= 0 && iCol >= 0) ? U.rows.find(x => x[iEp] === e.id && x[iCol] === col) : null;
        if (!r && tok && i === N - 1) r = U.rows.find(x => String(x[0]).indexOf(tok) >= 0);
        if (r) rg.innerHTML = '<p>95% range: ' + numFmt(col, Number(r[3])) + ' to ' + numFmt(col, Number(r[5])) + ' <span class="muted">(10,000 random draws of the inputs)</span></p>';
      }
      if (document.body.classList.contains('expert') && U) histChart(col, i, U);
    });
  }
  document.addEventListener('click', ev => {
    const t = ev.target.closest && ev.target.closest('[data-num]');
    if (!t) return;
    ev.preventDefault();
    numPanel(t.getAttribute('data-num'), t.hasAttribute('data-i') ? Number(t.getAttribute('data-i')) : null);
  });
  document.addEventListener('keydown', ev => {
    const t = ev.target.closest && ev.target.closest('[data-num][role="button"]');
    if (!t) return;
    if (ev.key === 'Enter') { ev.preventDefault(); t.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    else if (ev.key === ' ') { ev.preventDefault(); }
  });
  document.addEventListener('keyup', ev => {
    const t = ev.key === ' ' && ev.target.closest && ev.target.closest('[data-num][role="button"]');
    if (t) { ev.preventDefault(); t.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });

  /* ---------- tooltips: any element with data-tip (or a title) gets a styled tip on hover, keyboard focus or tap ---------- */
  let tipEl = null, tipFor = null, tipT = null;
  function tipOf(el) {
    if (el.hasAttribute('title') && !(el instanceof SVGElement)) { const t = el.getAttribute('title'); el.removeAttribute('title'); if (t && !el.hasAttribute('data-tip')) el.setAttribute('data-tip', t); }
    return el.getAttribute('data-tip');
  }
  function showTip(el) {
    const t = tipOf(el); if (!t) return;
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.id = 'siTip'; tipEl.setAttribute('role', 'tooltip'); document.body.appendChild(tipEl); }
    const dlg = el.closest('dialog'); if (dlg && tipEl.parentNode !== dlg) dlg.appendChild(tipEl); else if (!dlg && tipEl.parentNode !== document.body) document.body.appendChild(tipEl);
    tipEl.textContent = t; tipEl.hidden = false; tipFor = el; el.setAttribute('aria-describedby', 'siTip');
    const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = r.left + r.width / 2 - w / 2, y = r.bottom + 8, below = true;
    if (y + h > innerHeight - 8) { y = r.top - h - 8; below = false; }
    x = Math.max(8, Math.min(innerWidth - w - 8, x));
    tipEl.style.left = x + 'px'; tipEl.style.top = Math.max(8, y) + 'px'; tipEl.classList.toggle('above', !below);
  }
  function hideTip() { clearTimeout(tipT); if (tipEl) tipEl.hidden = true; if (tipFor) tipFor.removeAttribute('aria-describedby'); tipFor = null; }
  const tipTarget = n => n && n.closest && n.closest('[data-tip],[title]:not(svg *):not(title)');
  document.addEventListener('pointerover', ev => {
    if (ev.pointerType === 'touch') return;
    const el = tipTarget(ev.target);
    if (el === tipFor) return;
    hideTip();
    if (el) tipT = setTimeout(() => showTip(el), 300);
  });
  document.addEventListener('pointerout', ev => { const el = tipTarget(ev.target); if (el && !(ev.relatedTarget && el.contains(ev.relatedTarget))) hideTip(); });
  document.addEventListener('focusin', ev => { const el = tipTarget(ev.target); if (el && el.matches(':focus-visible')) showTip(el); });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') hideTip(); });
  addEventListener('scroll', hideTip, { passive: true });
  // on touch screens, tapping something that is not itself a control shows its tip
  document.addEventListener('click', ev => {
    const el = tipTarget(ev.target);
    if (!el || el.matches('a, button, input, select, textarea, summary, label, [data-num]')) return;
    if (tipFor === el) hideTip(); else showTip(el);
  });

  /* ---------- time labels: one key for Ma, Ga, ka, BCE and CE, placed under every chart with [data-time-key] ---------- */
  const TIME_TIPS = [['ka', 'thousand years ago', 'Kilo-annum: thousands of years before today. 10 ka is 10,000 years ago.'],
    ['Ma', 'million years ago', 'Mega-annum: millions of years before today. 66 Ma is when the asteroid hit.'],
    ['Ga', 'billion years ago', 'Giga-annum: billions of years before today. Earth formed about 4.5 Ga.'],
    ['BCE / CE', 'before / after year 1', 'Before Common Era and Common Era: the same count as BC and AD. Plain years like 1945 are CE.']];
  function timeKeys() {
    document.querySelectorAll('[data-time-key]').forEach(el => {
      if (el.dataset.done) return; el.dataset.done = '1';
      el.innerHTML = '<span class="tk-h">Time labels</span>' + TIME_TIPS.map(t => '<span class="tk-i" data-tip="' + esc(t[2]) + '" tabindex="0"><b>' + t[0] + '</b> = ' + t[1] + '</span>').join('') +
        (el.dataset.timeKey === 'moments' ? '<span class="tk-i" data-tip="The census has ' + N + ' moments, spaced far apart in deep time and close together recently. Drawing each one the same width keeps the recent ones visible." tabindex="0">Each column is one moment, not one year</span>' : '');
    });
  }
  function slidesOfInv(u) {
    if (!u) return [];
    const list = (u.pics || []).slice();
    const pl = PLATES[u.epoch];
    if (pl && pl.file && !list.some(p => p.credit_url === pl.credit_url || p.file === pl.file)) {
      const st = STOP[u.epoch];
      list.push({
        file: pl.file,
        caption: pl.caption || (st ? st.who + ' (' + st.taxon + ')' : u.label),
        credit: pl.credit,
        licence: pl.licence,
        author: pl.author,
        licence_url: pl.licence_url,
        credit_url: pl.credit_url
      });
    }
    return list;
  }

  function invGallery(u, st, actColor) {
    const slides = slidesOfInv(u);
    const stopLink = st
      ? '<a class="dr-who-link" href="journey.html#' + esc(u.epoch) + '"><b>' + esc(st.who) + '</b> · <i>' + esc(st.taxon) + '</i> · Visit stop →</a>'
      : '<a class="dr-who-link" href="journey.html#' + esc(u.epoch) + '"><b>' + esc(titleOf(u.i)) + '</b> · Visit stop →</a>';
    if (!slides.length) {
      return '<figure class="dr-plate" style="--g:' + actColor + '">' + (st ? plateArt(u.epoch, st.glyph, st.who) : '') + '<figcaption>' + stopLink + '</figcaption></figure>';
    }
    const M = slides.length;
    return '<section class="inv-carousel" aria-roledescription="carousel" aria-label="Pictures for ' + esc(u.label) + '" data-inv="' + esc(u.id) + '" style="--g:' + actColor + '">' +
      (M > 1 ? '<div class="inv-car-controls"><button type="button" class="inv-car-btn" data-dir="prev" aria-label="Previous picture" disabled>‹</button><button type="button" class="inv-car-btn" data-dir="next" aria-label="Next picture">›</button></div>' : '') +
      '<div class="inv-car-track" tabindex="0" role="group" aria-label="Pictures">' +
      slides.map((s, k) =>
        '<figure class="inv-car-slide" role="group" aria-roledescription="slide" aria-label="' + (k + 1) + ' of ' + M + '" data-marker-name="Picture ' + (k + 1) + ' of ' + M + '">' +
        '<button type="button" class="inv-car-zoom" data-lb-inv="' + esc(u.id) + '" data-lb-idx="' + k + '" aria-label="Enlarge picture ' + (k + 1) + ' of ' + M + ': ' + esc(s.caption) + '">' +
        '<img src="' + esc(s.file) + '" alt="' + esc(s.caption) + '" width="640" height="440"' + (k > 0 ? ' loading="lazy" fetchpriority="low"' : '') + '>' +
        '<span class="inv-zoom-pill" aria-hidden="true">Enlarge ⤢</span></button>' +
        '<figcaption><span class="inv-cap-txt">' + esc(s.caption) + '</span>' +
        '<span class="inv-cap-cred"><a href="' + esc(s.credit_url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.credit) + ' ↗</a></span></figcaption></figure>'
      ).join('') +
      '</div>' +
      '<p class="sr-only inv-car-status" role="status" aria-live="polite"></p>' +
      '<div class="inv-car-foot">' +
      (M > 1 ? '<nav class="inv-car-markers" aria-label="Choose a picture">' + slides.map((s, k) => '<button type="button" class="inv-car-dot" data-slide="' + k + '" aria-label="Picture ' + (k + 1) + ' of ' + M + '"' + (k === 0 ? ' aria-current="true"' : '') + '><i></i></button>').join('') + '</nav>' : '') +
      stopLink + '</div></section>';
  }

  function invThumbStrip(u) {
    const slides = slidesOfInv(u);
    if (!slides.length) return '';
    return '<div class="inv-thumbs" role="group" aria-label="Pictures for ' + esc(u.label) + '">' +
      slides.map((s, k) =>
        '<button type="button" class="inv-thumb-btn" data-lb-inv="' + esc(u.id) + '" data-lb-idx="' + k + '" aria-label="Enlarge picture ' + (k + 1) + ' of ' + slides.length + ': ' + esc(s.caption) + '">' +
        '<img src="' + esc(s.file) + '" alt="' + esc(s.caption) + '" width="220" height="150" loading="lazy">' +
        '<span>' + esc(s.caption) + '</span></button>'
      ).join('') + '</div>';
  }

  function bindCarousels(root) {
    const scope = root || document;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scope.querySelectorAll('.inv-carousel').forEach(car => {
      if (car.dataset.bound) return;
      car.dataset.bound = '1';
      const track = car.querySelector('.inv-car-track');
      const slides = [...track.querySelectorAll('.inv-car-slide')];
      if (slides.length < 2) return;
      const prevBtn = car.querySelector('[data-dir="prev"]');
      const nextBtn = car.querySelector('[data-dir="next"]');
      const dots = [...car.querySelectorAll('.inv-car-dot')];
      const status = car.querySelector('.inv-car-status');
      let settledIdx = 0, activeDot = 0, pendingIdx = null, rafId = 0, debTimer = null;

      const nearestIdx = () => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        slides.forEach((sl, k) => {
          const d = Math.abs((sl.offsetLeft + sl.offsetWidth / 2) - center);
          if (d < bestDist) { bestDist = d; best = k; }
        });
        return best;
      };
      const setDot = idx => {
        if (idx === activeDot) return;
        activeDot = idx;
        dots.forEach((d, k) => { if (k === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      };
      const syncButtons = idx => {
        const atStart = idx <= 0, atEnd = idx >= slides.length - 1;
        const prevHadFocus = document.activeElement === prevBtn;
        const nextHadFocus = document.activeElement === nextBtn;
        if (prevBtn) prevBtn.disabled = atStart;
        if (nextBtn) nextBtn.disabled = atEnd;
        if (atStart && prevHadFocus && nextBtn && !nextBtn.disabled) nextBtn.focus();
        if (atEnd && nextHadFocus && prevBtn && !prevBtn.disabled) prevBtn.focus();
      };
      const onSettle = () => {
        const idx = nearestIdx();
        pendingIdx = null;
        setDot(idx);
        syncButtons(idx);
        if (idx !== settledIdx) {
          settledIdx = idx;
          if (status) status.textContent = 'Picture ' + (idx + 1) + ' of ' + slides.length;
        }
      };
      const goTo = target => {
        const clamped = Math.max(0, Math.min(slides.length - 1, target));
        pendingIdx = clamped;
        setDot(clamped);
        syncButtons(clamped);
        const sl = slides[clamped];
        track.scrollTo({ left: sl.offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
        if (reduced) onSettle();
      };
      if (prevBtn) prevBtn.addEventListener('click', () => goTo((pendingIdx != null ? pendingIdx : nearestIdx()) - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goTo((pendingIdx != null ? pendingIdx : nearestIdx()) + 1));
      dots.forEach((d, k) => d.addEventListener('click', () => goTo(k)));
      track.addEventListener('scroll', () => {
        if (pendingIdx == null && !rafId) {
          rafId = requestAnimationFrame(() => { rafId = 0; setDot(nearestIdx()); });
        }
        if (!('onscrollend' in window)) {
          clearTimeout(debTimer);
          debTimer = setTimeout(onSettle, 140);
        }
      }, { passive: true });
      if ('onscrollend' in window) track.addEventListener('scrollend', onSettle);
    });
  }

  let lbDlg = null, lbState = null;
  function openInvLightbox(invId, idx) {
    const u = INVK[invId];
    const slides = slidesOfInv(u);
    if (!u || !slides.length) return;
    if (!lbDlg) {
      lbDlg = document.createElement('dialog');
      lbDlg.className = 'inv-lb';
      lbDlg.setAttribute('aria-labelledby', 'invLbTitle');
      lbDlg.setAttribute('closedby', 'any');
      document.body.appendChild(lbDlg);
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const outside = (ev, d) => { const r = d.getBoundingClientRect(); return ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom; };
        let pressedOut = false;
        lbDlg.addEventListener('pointerdown', ev => { pressedOut = outside(ev, lbDlg); });
        lbDlg.addEventListener('pointerup', ev => { if (pressedOut && outside(ev, lbDlg)) lbDlg.close(); });
      }
      lbDlg.addEventListener('close', () => { lbDlg.returnValue = ''; lbState = null; });
      lbDlg.addEventListener('click', ev => {
        if (ev.target.closest('.lb-close')) { lbDlg.close(); return; }
        const nav = ev.target.closest('[data-lb-step]');
        if (nav && lbState) { lbState.idx = (lbState.idx + Number(nav.dataset.lbStep) + lbState.slides.length) % lbState.slides.length; renderLb(); }
      });
      lbDlg.addEventListener('keydown', ev => {
        if (!lbState || lbState.slides.length < 2) return;
        if (ev.key === 'ArrowRight') { ev.preventDefault(); lbState.idx = (lbState.idx + 1) % lbState.slides.length; renderLb(); }
        else if (ev.key === 'ArrowLeft') { ev.preventDefault(); lbState.idx = (lbState.idx - 1 + lbState.slides.length) % lbState.slides.length; renderLb(); }
      });
    }
    lbState = { u, slides, idx: Math.max(0, Math.min(slides.length - 1, idx || 0)) };
    renderLb();
    if (!lbDlg.open) { if (lbDlg.showModal) lbDlg.showModal(); else lbDlg.setAttribute('open', ''); }
  }
  function renderLb() {
    if (!lbDlg || !lbState) return;
    const { u, slides, idx } = lbState;
    const s = slides[idx], M = slides.length;
    lbDlg.innerHTML =
      '<div class="num-top"><div><span class="eyebrow">' + esc(PK[u.part].name) + ' · Picture ' + (idx + 1) + ' of ' + M + '</span><h2 id="invLbTitle">' + esc(u.label) + '</h2></div>' +
      '<button type="button" class="num-x lb-close" aria-label="Close" autofocus>×</button></div>' +
      '<div class="inv-lb-stage">' +
      (M > 1 ? '<button type="button" class="inv-lb-nav prev" data-lb-step="-1" aria-label="Previous picture">‹</button>' : '') +
      '<img src="' + esc(s.file) + '" alt="' + esc(s.caption) + '">' +
      (M > 1 ? '<button type="button" class="inv-lb-nav next" data-lb-step="1" aria-label="Next picture">›</button>' : '') +
      '</div>' +
      '<p class="inv-lb-cap">' + esc(s.caption) + '</p>' +
      '<div class="inv-lb-cred"><span>By <b>' + esc(s.author) + '</b></span>' +
      '<a class="lic-badge" href="' + esc(s.licence_url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.licence) + '</a>' +
      '<a href="' + esc(s.credit_url) + '" target="_blank" rel="noopener noreferrer">Wikimedia Commons ↗</a></div>';
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('[data-lb-inv]');
    if (!b) return;
    ev.preventDefault();
    openInvLightbox(b.getAttribute('data-lb-inv'), Number(b.getAttribute('data-lb-idx') || 0));
  });

  // an invention's longer explanation, Watch & Listen media, and "learn more" links
  const YT_IC = '<svg viewBox="0 0 20 20" aria-hidden="true" class="av-ic"><rect x="1.5" y="4" width="17" height="12" rx="3.5" fill="currentColor" opacity=".16"/><path d="M8 7.2L13.5 10L8 12.8V7.2Z" fill="currentColor"/></svg>';
  const POD_IC = '<svg viewBox="0 0 20 20" aria-hidden="true" class="av-ic"><circle cx="10" cy="9" r="2.2" fill="currentColor"/><path d="M6.3 12.5a5.2 5.2 0 1 1 7.4 0M3.8 15a8.5 8.5 0 1 1 12.4 0M10 11.5v5.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  function avCardHtml(watch, listen) {
    if (!watch && !listen) return '';
    let out = '<div class="inv-av"><span class="sub">Watch &amp; listen</span><div class="inv-av-grid">';
    if (watch && watch[3]) {
      out += '<a class="av-card yt" href="' + esc(watch[3]) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="av-badge">' + YT_IC + 'Video · YouTube' + (watch[2] ? ' · ' + esc(watch[2]) : '') + '</span>' +
        '<b>' + esc(watch[0]) + '</b>' +
        '<span class="av-show">' + esc(watch[1]) + ' ↗</span></a>';
    }
    if (listen && listen[3]) {
      out += '<a class="av-card pod" href="' + esc(listen[3]) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="av-badge">' + POD_IC + 'Podcast' + (listen[2] ? ' · ' + esc(listen[2]) : '') + '</span>' +
        '<b>' + esc(listen[0]) + '</b>' +
        '<span class="av-show">' + esc(listen[1]) + ' ↗</span></a>';
    }
    out += '</div></div>';
    return out;
  }
  function invMore(u) {
    if (!u || (!u.more && !(u.learn && u.learn.length) && !u.watch && !u.listen)) return '';
    return '<div class="inv-more">' + (u.more ? '<p>' + esc(u.more) + '</p>' : '') +
      avCardHtml(u.watch, u.listen) +
      (u.learn && u.learn.length ? '<div class="inv-learn"><span class="sub">Read more</span><ul>' + u.learn.map(l =>
        '<li><a href="' + esc(l[2]) + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a><span> · ' + esc(l[1]) + '</span></li>').join('') + '</ul></div>' : '') + '</div>';
  }
  function perspCard(p, openByDefault) {
    if (!p) return '';
    return '<details class="evid-disc persp-disc"' + (openByDefault ? ' open' : '') + '>' +
      '<summary>Book perspectives · ' + esc(p.title) + ' (Schrödinger · Bennett · Agüera y Arcas)</summary>' +
      '<div class="persp-grid">' +
      '<div class="persp-col" style="--pc:var(--c-power)"><span class="sub">E. Schrödinger · <cite>What Is Life?</cite> (1944)</span><p>' + esc(p.schrodinger) + '</p></div>' +
      '<div class="persp-col" style="--pc:var(--c-prog)"><span class="sub">M. Bennett · <cite>A Brief History of Intelligence</cite> (2023)</span><p>' + esc(p.bennett) + '</p></div>' +
      '<div class="persp-col" style="--pc:var(--c-net)"><span class="sub">B. Agüera y Arcas · <cite>What Is Intelligence?</cite> (2025)</span><p>' + esc(p.aguera) + '</p></div>' +
      '</div></details>';
  }
  const perspForEpoch = ep => (PERSP_EP[ep] || []).map(p => perspCard(p, false)).join('');
  const perspForInv = id => (PERSP_INV[id] || []).map(p => perspCard(p, false)).join('');
  const numBtn = (col, html, i) => '<button type="button" class="num" data-num="' + col + '"' + (i != null ? ' data-i="' + i + '"' : '') + ' data-tip="Where this number comes from: its equation, inputs and sources">' + html + '</button>';

  window.SIX = {
    SI, E, N, IDX, ACTS, actOf, CRISIS, PARTS, PK, ORDER, INV, INVK, HIST, stateAt, newAt, STOPS, STOP, TOUR, PLATES, MYTHS, NEURAL, NETWORKS, MAKING, MOTORS, SEX, GENOMES, NERVEGENES, OFFWORLD, PLANTS, IMMUNITY, PERSP, PERSP_EP, PERSP_INV, MOM, titleOf, hookOf, stopsAround,
    IN, OUT, closure, EPI, GAUGES, RANGE, sup, esc, plain, sci, watts, fmtTime, fmtShort, delta, icon, glyph, plateArt, plateCredit, plateThumb, chrome, chart, LEGEND, stack, LAYERS, LK, DIGITS, stackHeight, loadAtlas, KINDS, KIND, yearsAgo,
    loadCensus, loadLedgers, readLast, writeLast, placeOf, momentText, readExpert, numPanel, numBtn, numName, COLOF, invMore, avCardHtml, invGallery, invThumbStrip, bindCarousels, slidesOfInv, openInvLightbox, perspCard, perspForEpoch, perspForInv, timeKeys
  };
})();
