// Paper 0's four figures, drawn from its ledgers. X.paper0Figures() fills #fig1 to #fig4 (and #say1, #say3) wherever they exist.
(function () {
  'use strict';
  window.SIX.paper0Figures = function () {
  const X = window.SIX, E = X.E, N = X.N, L = window.SI_LEDGERS, esc = X.esc, now = E[N - 1];
  const $ = id => document.getElementById(id), f1 = n => n.toFixed(1);
  const col = (led, name) => led.columns.indexOf(name);
  const fix = (n, d) => String(+n.toPrecision(d || 2));

  /* ---------- 1. the power bar ---------- */
  (function () {
    const P = L.power, tw = col(P, 'compartment_power_tw'), find = p => Number(P.rows.find(r => String(r[0]).indexOf(p) === 0)[tw]);
    const itGW = Number(L.devices.rows.find(r => String(r[0]).indexOf('TOTAL') === 0)[col(L.devices, 'aggregate_wall_power_gw')]);
    const parts = [
      { name: 'Plants, fungi and other complex cells', v: find('2b.'), cls: 'n3' },
      { name: 'Microbes at the surface', v: find('1c.'), cls: 'n2' },
      { name: 'Microbes on standby', v: find('1b.'), cls: 'n1' },
      { name: 'Microbes deep underground', v: find('1a.'), cls: 'n0' },
      { name: 'Animals', v: find('3.'), cls: 'nerve' },
      { name: 'Technology', v: find('4.'), cls: 'sil' }
    ];
    const total = parts.reduce((t, p) => t + p.v, 0), W = 1000, Lm = 20, R = 20, y = 96, h = 64, PW = W - Lm - R;
    let x = Lm, g = '';
    parts.forEach((p, k) => {
      const w = p.v / total * PW; p.x = x; p.w = w;
      g += '<rect class="seg ' + p.cls + '" x="' + f1(x) + '" y="' + y + '" width="' + f1(w) + '" height="' + h + '"/>';
      x += w;
    });
    // labels above for wide pieces, below with leaders for narrow ones
    let below = 0;
    parts.forEach(p => {
      const cx = p.x + p.w / 2, share = Math.round(p.v / total * 100), txt = fix(p.v, 3) + ' TW · ' + (share < 1 ? 'under 1' : share) + '%';
      if (p.w > 150) { g += '<text class="t" x="' + f1(p.x + 4) + '" y="' + (y - 28) + '">' + esc(p.name) + '</text><text class="s" x="' + f1(p.x + 4) + '" y="' + (y - 10) + '">' + txt + '</text>'; }
      else { const ty = y + h + 34 + below * 40; below++; g += '<path class="lead" d="M' + f1(cx) + ' ' + (y + h + 2) + ' V' + (ty - 2) + ' H' + f1(cx - 8) + '"/><text class="t" x="' + f1(cx - 14) + '" y="' + (ty - 4) + '" text-anchor="end">' + esc(p.name) + '</text><text class="s" x="' + f1(cx - 14) + '" y="' + (ty + 12) + '" text-anchor="end">' + txt + '</text>'; }
    });
    // the chips' own share of the technology piece, drawn to scale inside it
    const tech = parts[5], itw = itGW / 1000 / total * PW;
    g += '<rect x="' + f1(tech.x + tech.w - itw - 1) + '" y="' + y + '" width="' + f1(Math.max(1.5, itw)) + '" height="' + h + '" style="fill:var(--ink)"/>';
    g += '<path class="lead" d="M' + f1(tech.x + tech.w - 1) + ' ' + (y - 2) + ' V' + (y - 46) + ' H' + f1(tech.x + tech.w - 8) + '"/><text class="t" x="' + f1(tech.x + tech.w - 12) + '" y="' + (y - 50) + '" text-anchor="end">All computers: ' + itGW + ' GW</text><text class="s" x="' + f1(tech.x + tech.w - 12) + '" y="' + (y - 66) + '" text-anchor="end">the thin dark line at the right edge</text>';
    $('fig1').setAttribute('viewBox', '0 0 ' + W + ' ' + (y + h + 34 + below * 40));
    $('fig1').innerHTML = g;
    const an = parts[4].v, it = itGW / 1000;
    $('say1').textContent = 'Earth runs on about ' + fix(total, 3) + ' terawatts. Every animal alive gets ' + Math.round(an / total * 100) + '% of it, and every computer about ' + fix(it / total * 100, 1) + '%.';
  })();

  /* ---------- 2. extinctions ---------- */
  (function () {
    const U = (L.uncertainty ? L.uncertainty.rows : []);
    const rng = token => { const r = U.find(x => String(x[0]).indexOf(token) >= 0); return r ? [Number(r[3]), Number(r[5])] : null; };
    const rows = X.SI.crises.map(c => { const i = X.IDX[c.epoch_id], p = E[i - 1], e = E[i]; return p && p.cneu > 0 ? { name: c.name.replace(' extinction', ''), from: p.t, to: e.t, nerve: (1 - e.cneu / p.cneu) * 100, bio: (1 - e.bio / p.bio) * 100, r: e.t > 251 && e.t < 252 ? rng('End-Permian') : Math.abs(e.t - 66) < 0.01 ? rng('K-Pg') : null } : null; }).filter(Boolean);
    const W = 1000, Lm = 250, R = 70, T = 30, RH = 62, PW = W - Lm - R, xx = v => Lm + v / 100 * PW;
    let g = '';
    [0, 25, 50, 75, 100].forEach(v => { g += '<line class="grid" x1="' + f1(xx(v)) + '" x2="' + f1(xx(v)) + '" y1="' + (T - 6) + '" y2="' + (T + rows.length * RH) + '"/><text class="tk" x="' + f1(xx(v)) + '" y="' + (T - 12) + '" text-anchor="middle">' + v + '%</text>'; });
    rows.forEach((r, k) => {
      const y = T + k * RH + 10;
      g += '<text class="t" x="' + (Lm - 14) + '" y="' + (y + 14) + '" text-anchor="end">' + esc(r.name) + '</text><text class="s" x="' + (Lm - 14) + '" y="' + (y + 31) + '" text-anchor="end">' + fix(r.from, 4) + ' to ' + fix(r.to, 4) + ' million years ago</text>';
      g += '<rect class="cri" x="' + Lm + '" y="' + y + '" width="' + f1(xx(r.nerve) - Lm) + '" height="22" rx="2"/><rect class="cri2" x="' + Lm + '" y="' + (y + 26) + '" width="' + f1(xx(r.bio) - Lm) + '" height="12" rx="2"/>';
      if (r.r) g += '<line class="rng" x1="' + f1(xx(r.r[0])) + '" x2="' + f1(xx(r.r[1])) + '" y1="' + (y + 11) + '" y2="' + (y + 11) + '"/><line class="rng" x1="' + f1(xx(r.r[0])) + '" x2="' + f1(xx(r.r[0])) + '" y1="' + (y + 5) + '" y2="' + (y + 17) + '"/><line class="rng" x1="' + f1(xx(r.r[1])) + '" x2="' + f1(xx(r.r[1])) + '" y1="' + (y + 5) + '" y2="' + (y + 17) + '"/>';
      g += '<text class="t" x="' + f1(Math.max(xx(r.nerve), r.r ? xx(r.r[1]) : 0) + 8) + '" y="' + (y + 16) + '">' + fix(r.nerve, 3) + '%</text><text class="s" x="' + f1(xx(r.bio) + 8) + '" y="' + (y + 37) + '">' + Math.round(r.bio) + '%</text>';
    });
    g += '<line class="ax" x1="' + Lm + '" x2="' + Lm + '" y1="' + (T - 6) + '" y2="' + (T + rows.length * RH) + '"/>';
    $('fig2').setAttribute('viewBox', '0 0 ' + W + ' ' + (T + rows.length * RH + 6));
    $('fig2').innerHTML = g;
  })();

  /* ---------- 3. the ladder ---------- */
  (function () {
    const brain = E[X.IDX.EP30a].cmax, marks = [
      { v: brain, name: 'One human brain', unit: 'nerve signals a second', cls: 'nerve' },
      { v: now.cmax, name: 'The largest AI cluster', unit: 'chip operations a second', cls: 'sil' },
      { v: now.cdig, name: 'Every chip on Earth', unit: 'chip operations a second', cls: 'sil' },
      { v: brain * now.grp, name: 'Every human brain', unit: 'nerve signals a second', cls: 'nerve' },
      { v: now.cneu, name: 'Every animal nervous system', unit: 'nerve signals a second', cls: 'nerve' }
    ];
    const W = 1000, H = 470, T = 26, B = 26, ax = 300, lo = 13, hi = 27, yy = v => T + (hi - Math.log10(v)) / (hi - lo) * (H - T - B);
    let g = '';
    for (let p = 14; p <= 26; p += 2) g += '<line class="grid" x1="' + (ax - 46) + '" x2="' + (ax + 46) + '" y1="' + f1(yy(Math.pow(10, p))) + '" y2="' + f1(yy(Math.pow(10, p))) + '"/><text class="tk" x="' + (ax - 54) + '" y="' + f1(yy(Math.pow(10, p)) + 4) + '" text-anchor="end">10' + X.sup(p) + '</text>';
    g += '<line class="ax" x1="' + (ax - 46) + '" x2="' + (ax - 46) + '" y1="' + T + '" y2="' + (H - B) + '"/><line class="ax" x1="' + (ax + 46) + '" x2="' + (ax + 46) + '" y1="' + T + '" y2="' + (H - B) + '"/>';
    marks.forEach(m => {
      const y = yy(m.v);
      g += '<rect class="' + m.cls + '" x="' + (ax - 46) + '" y="' + f1(y - 5) + '" width="92" height="10" rx="2"/><path class="lead" d="M' + (ax + 50) + ' ' + f1(y) + ' H' + (ax + 84) + '"/>';
      g += '<text class="t" x="' + (ax + 92) + '" y="' + f1(y - 1) + '">' + esc(m.name) + '</text><text class="s" x="' + (ax + 92) + '" y="' + f1(y + 15) + '">' + X.sci(m.v) + ' ' + m.unit + '</text>';
    });
    // the three gaps the paper reports, as brackets on the far right
    const gap = (a, b, x, label) => { const y1 = yy(a), y2 = yy(b); g += '<path class="lead" style="stroke:var(--ink)" d="M' + (x - 8) + ' ' + f1(y1) + ' H' + x + ' V' + f1(y2) + ' H' + (x - 8) + '"/><text class="big" x="' + (x + 12) + '" y="' + f1((y1 + y2) / 2 + 2) + '">' + label + '</text>'; };
    const times = f => (f >= 1e6 ? fix(f / 1e6) + ' million times' : Math.round(+f.toPrecision(2)).toLocaleString('en') + ' times');
    gap(now.cmax, brain, 700, times(now.cmax / brain));
    gap(brain * now.grp, now.cdig, 700, times(brain * now.grp / now.cdig));
    gap(now.cneu, brain * now.grp, 700, times(now.cneu / (brain * now.grp)));
    $('fig3').setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    $('fig3').innerHTML = g;
    $('say3').textContent = 'The largest AI cluster runs ' + times(now.cmax / brain) + ' more operations than one brain fires signals. All the world’s chips together are still ' + times(brain * now.grp / now.cdig) + ' short of all human brains.';
  })();

  /* ---------- 4. how long memory lasts ---------- */
  (function () {
    const M = L.media, life = col(M, 'mean_retention_lifetime_yr');
    const pick = (token, name, cls) => { const r = M.rows.find(x => String(x[0]).indexOf(token) >= 0); return r ? { name, v: Number(r[life]), cls } : null; };
    const rows = [
      pick('Baked', 'Fired clay and carved stone', 'exo'), pick('Post-Mortem', 'DNA in old bone', 'dna'), pick('Rag Paper', 'Rag paper books', 'exo'),
      pick('Acidic', 'Modern print paper', 'exo'), pick('Tape', 'Magnetic tape', 'sil'), pick('Hard', 'Hard disks', 'sil'), pick('NAND', 'Flash drives and SSDs', 'sil'), pick('DRAM', 'Computer working memory', 'sil')
    ].filter(Boolean);
    const say = v => (v >= 1 ? (v >= 100 ? Math.round(+v.toPrecision(2)).toLocaleString('en') : fix(v)) + ' years' : v * 3.156e7 >= 1 ? fix(v * 3.156e7) + ' seconds' : fix(v * 3.156e10) + ' thousandths of a second');
    const W = 1000, Lm = 250, R = 190, T = 30, RH = 40, PW = W - Lm - R, lo = -9, hi = 4, xx = v => Lm + (Math.log10(v) - lo) / (hi - lo) * PW;
    let g = '';
    [[2.03e-9, ''], [3.17e-8, '1 second'], [1 / 365.25, '1 day'], [1, '1 year'], [100, '100 years'], [10000, '10,000 years']].forEach(([v, lbl]) => { if (!lbl) return; g += '<line class="grid" x1="' + f1(xx(v)) + '" x2="' + f1(xx(v)) + '" y1="' + (T - 6) + '" y2="' + (T + rows.length * RH) + '"/><text class="tk" x="' + f1(xx(v)) + '" y="' + (T - 12) + '" text-anchor="middle">' + lbl + '</text>'; });
    rows.forEach((r, k) => {
      const y = T + k * RH + 8;
      g += '<text class="t" x="' + (Lm - 14) + '" y="' + (y + 16) + '" text-anchor="end">' + esc(r.name) + '</text>';
      g += '<rect class="' + r.cls + '" x="' + Lm + '" y="' + y + '" width="' + f1(Math.max(3, xx(r.v) - Lm)) + '" height="22" rx="2"/><text class="s" x="' + f1(xx(r.v) + 8) + '" y="' + (y + 16) + '">' + say(r.v) + '</text>';
    });
    g += '<line class="ax" x1="' + Lm + '" x2="' + Lm + '" y1="' + (T - 6) + '" y2="' + (T + rows.length * RH) + '"/>';
    $('fig4').setAttribute('viewBox', '0 0 ' + W + ' ' + (T + rows.length * RH + 6));
    $('fig4').innerHTML = g;
  })();
  };
})();
