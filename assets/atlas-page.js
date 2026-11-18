(function () {
  'use strict';
  const X = window.SIX, esc = X.esc;
  X.chrome('atlas');
  const $ = id => document.getElementById(id);
  const f1 = n => n.toFixed(1);
  let focus = (/kind=(\w+)/.exec(location.hash) || [])[1] || null;
  if (focus && !X.KIND[focus]) focus = null;

  function draw(rows) {
    const a = $('atlas'), w = 1000, h = 520, l = 58, r = 20, t = 16, b = 46;
    a.setAttribute('viewBox', '0 0 ' + w + ' ' + h); a.classList.add('stk', 'atl');
    const TX = Math.log10(4.2e9), V0 = -3, V1 = 23;
    const xx = y => l + (TX - Math.log10(Math.max(1, y))) / TX * (w - l - r), yy = v => t + (V1 - Math.log10(v)) / (V1 - V0) * (h - t - b);
    let g = '';
    [0, 5, 10, 15, 20].forEach(v => { g += '<line class="grid" x1="' + l + '" x2="' + (w - r) + '" y1="' + f1(yy(Math.pow(10, v))) + '" y2="' + f1(yy(Math.pow(10, v))) + '"/><text class="tick" x="' + (l - 8) + '" y="' + f1(yy(Math.pow(10, v)) + 4) + '" text-anchor="end">' + (v ? '10' + X.sup(v) : '1') + '</text>'; });
    [[1e9, '1 billion years ago'], [1e8, '100 million'], [1e7, '10 million'], [1e6, '1 million'], [1e5, '100,000'], [1e4, '10,000'], [1e3, '1,000'], [100, '100'], [10, '10'], [1, 'today']].forEach(([y, lbl]) => {
      g += '<line class="grid" x1="' + f1(xx(y)) + '" x2="' + f1(xx(y)) + '" y1="' + t + '" y2="' + (h - b) + '"/><text class="tick" x="' + f1(xx(y)) + '" y="' + (h - b + 18) + '" text-anchor="' + (y === 1 ? 'end' : 'middle') + '">' + lbl + '</text>';
    });
    g += '<text class="side" x="' + (l + 8) + '" y="' + (t + 12) + '">OPERATIONS A SECOND ↑</text><text class="side" x="' + (w - r) + '" y="' + (h - 6) + '" text-anchor="end">FIRST APPEARED, YEARS BEFORE TODAY →</text>';
    // the most numerous kind goes down first so the rare ones stay visible on top
    const order = { nerve: 0, chem: 1, sil: 2, grp: 3, exo: 4, ai: 5 };
    rows.map((d, i) => i).sort((p, q) => order[rows[p][3]] - order[rows[q][3]]).forEach(i => {
      const d = rows[i];
      g += '<circle class="dot' + (d[4] ? ' class' : '') + (focus === d[3] ? ' on' : '') + '" data-i="' + i + '" style="--k:' + X.KIND[d[3]].color + ';fill:' + X.KIND[d[3]].color + '" cx="' + f1(xx(d[1])) + '" cy="' + f1(yy(d[2])) + '" r="4"/>';
    });
    a.innerHTML = g;
    a.classList.toggle('focus', !!focus);
  }
  function tip(rows) {
    const a = $('atlas'), box = $('tip');
    a.addEventListener('mousemove', ev => {
      const c = ev.target.closest('.dot'); if (!c) { box.hidden = true; return; }
      const d = rows[Number(c.dataset.i)];
      box.innerHTML = '<b>' + esc(d[0]) + '</b><span>' + esc(X.KIND[d[3]].name) + ' · ' + esc(X.yearsAgo(d[1])) + '<br>' + (d[4] ? 'about ' : '') + X.sci(d[2]) + ' operations a second' + (d[4] ? ' (class estimate)' : '') + '</span>';
      box.hidden = false;
      box.style.left = Math.max(8, Math.min(innerWidth - 310, ev.clientX + 14)) + 'px';
      box.style.top = Math.min(innerHeight - 90, ev.clientY + 16) + 'px';
    });
    a.addEventListener('mouseleave', () => { box.hidden = true; });
  }

  X.loadAtlas(A => {
    if (!A) {
      $('atlas').parentElement.innerHTML = '<p class="note" style="padding:24px">The atlas data did not load. Reload the page, or open the <a href="data.html">Data Lab</a>.</p>';
      return;
    }
    const rows = A.systems, n = {}, cls = rows.filter(d => d[4]).length;
    rows.forEach(d => { n[d[3]] = (n[d[3]] || 0) + 1; });
    const keys = () => { document.querySelectorAll('#atKeys .key').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === focus)); };
    $('atKeys').innerHTML = X.KINDS.map(([k, name]) => '<button type="button" class="key" data-k="' + k + '" aria-pressed="false" style="--k:' + X.KIND[k].color + '"><i></i>' + name + ' <small>' + (n[k] || 0) + '</small></button>').join('');
    $('atKeys').addEventListener('click', ev => {
      const b = ev.target.closest('.key'); if (!b) return;
      focus = focus === b.dataset.k ? null : b.dataset.k;
      try { history.replaceState(null, '', focus ? '#kind=' + focus : location.pathname); } catch (e) { /* ignore */ }
      keys(); draw(rows);
    });
    $('atNote').innerHTML = rows.length + ' systems. A filled dot has its own estimated rate; a hollow dot (' + cls + ' of them) carries a round order-of-magnitude class, which is why hollow dots line up in rows. Kinds are a first sorting by name and still need review.';
    keys(); draw(rows); tip(rows);

    const dims = A.dims.slice(0, 14);
    $('cov').insertAdjacentHTML('beforeend', '<thead><tr><th scope="col" style="text-align:left">Dimension</th>' + X.KINDS.map(([k, name]) => '<th scope="col" style="--k:' + X.KIND[k].color + '"><i></i>' + name + '<small>' + A.totals[k] + ' systems</small></th>').join('') + '</tr></thead><tbody>' +
      dims.map(d => '<tr><th scope="row">' + esc(d) + '</th>' + X.KINDS.map(([k]) => {
        const v = A.matrix[d][k] || 0, share = Math.min(1, v / A.totals[k]);
        return '<td class="' + (v ? (share > 0.62 ? 'hi' : '') : 'z') + '" style="--v:' + Math.round(share * 78) + '" title="' + v + ' of ' + A.totals[k] + ' systems">' + (v || '·') + '</td>';
      }).join('') + '</tr>').join('') + '</tbody>');
  });
})();
