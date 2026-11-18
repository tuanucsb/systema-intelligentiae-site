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
  const PLATES = SI.plates || {};
  const MYTHS = SI.myths;
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
    generic: () => '<circle class="t dash" cx="60" cy="40" r="24"/><circle class="a" cx="60" cy="40" r="3"/>'
  };
  const glyph = g => '<svg viewBox="0 0 120 80" class="gl" aria-hidden="true">' + (G[g] || G.generic)() + '</svg>';
  function plateArt(epochId, glyphKey, alt) {
    const pl = PLATES[epochId];
    if (!pl || !pl.file) return '<div class="plate-art">' + glyph(glyphKey) + '</div>';
    return '<div class="plate-art has-photo">' +
      '<img class="plate-img" src="' + esc(pl.file) + '" alt="' + esc(alt || pl.caption || '') + '" loading="lazy" onerror="this.parentElement.classList.remove(\'has-photo\');this.remove()">' +
      (pl.phylopic ? '<span class="plate-phylopic" title="PhyloPic body-plan silhouette"><img src="' + esc(pl.phylopic) + '" alt="" loading="lazy"></span>' : '') +
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
  function chrome(page) {
    const mark = ORDER.map(k => '<i style="background:var(--c-' + k + ')"></i>').join('');
    const links = [['journey.html', 'journey', 'Journey'], ['tree.html', 'tree', 'Tree'], ['how.html', 'how', 'How we know'], ['data.html', 'data', 'Data Lab']];
    const footLinks = links.slice(0, 2).concat([['atlas.html', 'atlas', 'Atlas of minds']], links.slice(2), [['intelligence.html', 'intelligence', 'Intelligence formulas'], ['research.html', 'research', 'Papers'], ['papers.html', 'papers', 'Research desk']]);
    const head = document.getElementById('siteHead');
    const tools = head && head.querySelector('.head-tools');
    if (tools) {
      // the header and nav are static HTML so they work without scripts; only the switch needs JS
      tools.innerHTML = '<label class="switch" title="Show symbols, equations, sources and raw data"><input type="checkbox" id="expertToggle"><span class="track"></span><span>Expert<span class="sw-more"> view</span></span><span class="tag">PhD</span></label>';
    } else if (head) {
      head.className = 'site-head';
      head.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">' + mark + '</span>Systema Intelligentiae</a>' +
        '<nav class="site-nav" aria-label="Main">' + links.map(l => '<a href="' + l[0] + '"' + (l[1] === page ? ' aria-current="page"' : '') + '>' + l[2] + '</a>').join('') + '</nav>' +
        '<div class="head-tools"><label class="switch" title="Show symbols, equations, sources and raw data"><input type="checkbox" id="expertToggle"><span class="track"></span>Expert view <span class="tag">PhD</span></label></div></div>';
    }
    const foot = document.getElementById('siteFoot');
    if (foot) {
      foot.className = 'site-foot';
      const cur = (href, key) => '<a href="' + href + '"' + (page === key ? ' aria-current="page"' : '') + '>';
      foot.innerHTML = '<div class="wrap">' +
        '<div class="colo" data-url="' + esc(location.href.split('#')[0]) + '"><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">' + mark + '</span>Systema Intelligentiae</a>' +
        '<p>A natural history of thinking matter: how Earth built memory, wiring and computing over 4.1 billion years, from one open census.</p>' +
        '<p class="upd">Last updated 8 Nov 2026</p></div>' +
        '<nav aria-labelledby="footExplore"><h2 id="footExplore">Explore</h2>' + footLinks.map(l => cur(l[0], l[1]) + l[2] + '</a>').join('') + '</nav>' +
        '<nav aria-labelledby="footAbout"><h2 id="footAbout">About</h2>' + cur('about.html', 'about') + 'About this project</a><a href="about.html#cite">How to cite</a>' +
        cur('credits.html', 'credits') + 'Image credits</a><a href="about.html#licence">Data licence</a><a href="data.html">Download the data</a></nav></div>';
    }
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
    // the slider is the keyboard and touch way through the 64 moments; input = live, change = committed
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
    // wide: direct labels at the right edge; narrow (phones): all 64 columns fit the width and the legend carries the names
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

  window.SIX = {
    SI, E, N, IDX, ACTS, actOf, CRISIS, PARTS, PK, ORDER, INV, INVK, HIST, stateAt, newAt, STOPS, STOP, PLATES, MYTHS, MOM, titleOf, hookOf, stopsAround,
    IN, OUT, closure, EPI, GAUGES, RANGE, sup, esc, plain, sci, watts, fmtTime, fmtShort, delta, icon, glyph, plateArt, plateCredit, plateThumb, chrome, chart, LEGEND, stack, LAYERS, LK, DIGITS, stackHeight, loadAtlas, KINDS, KIND, yearsAgo,
    loadCensus, readLast, writeLast, placeOf, momentText, readExpert
  };
})();
