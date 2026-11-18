// Home hero: five floors of thinking. The story comes first; the measured chart stays in the evidence view below.
(function () {
  'use strict';
  const X = window.SIX, E = X.E, esc = X.esc, now = E[X.N - 1];
  const $ = id => document.getElementById(id);
  const T0 = E[0].t * 1e6;                                     // years in the whole story
  const firstYears = f => E[E.findIndex(f)].t * 1e6;
  // two significant figures: 551,700,000 reads as "550 million"
  const sig2 = n => { const p = Math.pow(10, Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; };
  const big = n => { const v = sig2(n); return v >= 1e9 ? String(+(v / 1e9).toFixed(1)) + ' billion' : v >= 1e6 ? String(+(v / 1e6).toFixed(1)) + ' million' : Math.round(n).toLocaleString('en'); };
  const times = n => (n >= 1e6 ? Math.round(n / 1e6) + ' million' : (Math.round(n / 1000) * 1000).toLocaleString('en'));
  // the one-day clock: where a date falls if 4.1 billion years were squeezed into 24 hours
  const secLeft = y => y / T0 * 86400;
  function clock(y) {
    const s = secLeft(y);
    if (s >= 86399) return '00:00';
    if (s < 1) return 'last ' + (s * 1000 < 1 ? (s * 1000).toFixed(1) : Math.round(s * 1000)) + ' thousandths of a second';
    const t = 86400 - s, h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), ss = Math.floor(t % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + (s < 3600 ? ':' + String(ss).padStart(2, '0') : '');
  }
  // oldest first; `photo` is the stop whose picture stands for the floor, `enter` the moment the floor first appears
  const FLOORS = [
    { k: 'chem', go: 'Meet the first cells', name: 'Chemistry in cells', years: T0, photo: 'EP02a', enter: 'EP01a', thread: 'chem',
      title: 'A cell can pass on a recipe for making another cell.',
      text: 'DNA stores inherited instructions, and a living cell reads and copies them. Its chemistry also compares now with a moment ago, which is enough to swim toward food. For 3.5 billion years this was the only floor.',
      today: 'About ' + times(now.cbio / now.cneu) + ' chemical reactions in cells for every nerve signal fired on Earth.', note: 'Still by far the busiest floor.' },
    { k: 'nerve', go: 'Meet the first worm', name: 'Nerves and brains', years: firstYears(e => e.cneu > 0), photo: 'EP08b', enter: 'EP07b', thread: 'neural',
      title: 'A signal can connect what an animal senses to what it does.',
      text: 'Nerve cells carry signals across a body far faster than a chemical can drift there. That speed made hunting, fleeing and learning within one lifetime possible.',
      today: 'About ' + times(now.cneu / now.cdig) + ' nerve signals for every operation run on a chip.', note: 'Almost all of them in small animals, not in people.' },
    { k: 'exo', go: 'Meet the first toolmaker', name: 'Memory outside the body', years: firstYears(e => e.mexo > 0), photo: 'EP25a', enter: 'EP21a', thread: 'memory',
      title: 'Knowledge can reach someone who never met its author.',
      text: 'A stone tool carries the memory of how to make it. Speech lets a group share what one member learned, and writing lets later readers build on earlier work without starting again.',
      today: 'About ' + String(+(now.mexo / 8 / now.grp / 1e12).toFixed(1)) + ' terabytes kept outside the body for every person alive.', note: 'The fastest-growing kind of memory on Earth.' },
    { k: 'sil', go: 'Meet ENIAC', name: 'Machines that compute', years: firstYears(e => e.id === 'EP30a'), photo: 'EP30a', enter: 'EP30a', thread: 'biggest',
      title: 'A machine can carry out a stored set of instructions.',
      text: 'The first electronic computers filled a room and did a few thousand sums a second. Chips follow their instructions exactly, and for 67 years that was all they did.',
      today: 'About ' + (now.cdig / now.grp / 1e12).toFixed(1) + ' trillion chip operations each second for every person alive.', note: 'Counting every phone, laptop and data center.' },
    { k: 'ai', go: 'See deep learning arrive', name: 'Machines that learn', years: firstYears(e => e.cai > 0), photo: 'EP31b', enter: 'EP31b', thread: 'neural',
      title: 'A machine can learn a task from examples.',
      text: 'A neural net is not given the rules. It is shown a great many examples and adjusts itself until its answers improve. It is the newest floor and, so far, a thin one.',
      today: 'Already about ' + Math.round(now.cai / now.cdig * 100) + '% of all chip work, growing about 2.4 times every year.', note: 'Measured since 2012.' }
  ];
  FLOORS.forEach((f, i) => { f.color = 'var(--l-' + f.k + ')'; f.wait = i ? FLOORS[i - 1].years - f.years : 0; });
  // dates keep three figures (555 million); waits between floors are rounded to two
  const exact = n => (n >= 1e9 ? String(+(n / 1e9).toPrecision(3)) + ' billion' : n >= 1e6 ? String(+(n / 1e6).toPrecision(3)) + ' million' : Math.round(n).toLocaleString('en'));
  const ago = f => (f.years < 200 ? 'since ' + Math.round(2026 - f.years) : exact(f.years) + ' years ago');
  const btns = Array.from(document.querySelectorAll('#floors .floor'));
  if (btns.length !== FLOORS.length) return;

  // the static markup carries names and pictures; times come from the census so they cannot drift from it
  btns.forEach((b, i) => { const w = b.querySelector('.when'); w.innerHTML = '<b>' + clock(FLOORS[i].years) + '</b><span>' + ago(FLOORS[i]) + '</span>'; });

  let cur = 0;
  function show(i, focus) {
    cur = i;
    const f = FLOORS[i], up = FLOORS[i + 1];
    btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    const d = $('floorDetail');
    d.style.setProperty('--k', f.color);
    d.innerHTML = '<div><span class="eyebrow"><i class="kbar"></i>Floor ' + (i + 1) + ' of ' + FLOORS.length + ' · ' + esc(f.name) + '</span><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p>' +
      '<p>' + (f.wait ? 'It arrived ' + big(f.wait) + ' years after the floor below it.' : 'It has been running since the start.') + '</p>' +
      '<div class="floor-actions"><button type="button" class="btn sm" id="floorNext">' + (up ? 'Next floor up: ' + esc(up.name) + ' ↑' : 'Back to the ground floor ↓') + '</button>' +
      '<a href="journey.html#' + f.enter + '">' + esc(f.go) + ' →</a>' +
      '<a href="#thread=' + f.thread + '">Ask a question about this floor →</a></div></div>' +
      '<div><div class="today"><span class="sub">Today, in plain numbers</span><b>' + esc(f.today) + '</b><span>' + esc(f.note) + '</span></div>' + X.plateCredit(f.photo) + '</div>';
    $('floorNext').addEventListener('click', () => { show(up ? i + 1 : 0, true); });
    if (focus) btns[cur].focus({ preventScroll: true });
  }
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);

  // the clock beside the building
  const pct = y => (1 - y / T0) * 100;
  $('dayClock').innerHTML = [['00:00', 0], ['06:00', 25], ['12:00', 50], ['18:00', 75], ['24:00', 100]].map(h => '<span class="hr" style="bottom:' + h[1] + '%">' + h[0] + '</span>').join('') +
    FLOORS.map(f => '<i class="mk" style="--k:' + f.color + ';bottom:' + pct(f.years).toFixed(2) + '%"></i>').join('') +
    '<span class="cap" style="bottom:' + (pct(FLOORS[1].years) - 9).toFixed(1) + '%"><b>' + clock(FLOORS[1].years) + '</b>nerves</span>' +
    '<span class="cap" style="top:-4px"><b>last ' + Math.round(secLeft(FLOORS[2].years)) + ' seconds</b>three floors at once</span>';

  // the day drawn to scale: three bars, each a close-up of the last sliver of the one above
  (function () {
    const s = $('zoom'), W = 1000, L = 190, R = 980, PW = R - L, LH = 22, f1 = n => n.toFixed(1), span3 = 100;
    s.classList.add('zm');
    const BARS = [
      { title: 'The whole day', sub: big(T0) + ' years', span: T0, lanes: [0, 1], ticks: [[T0, '00:00'], [T0 * .75, '06:00'], [T0 * .5, '12:00'], [T0 * .25, '18:00'], [0, 'midnight']] },
      { title: 'The last ' + Math.round(secLeft(FLOORS[2].years)) + ' seconds', sub: big(FLOORS[2].years) + ' years', span: FLOORS[2].years, lanes: [0, 1, 2], ticks: [[FLOORS[2].years, big(FLOORS[2].years) + ' years ago'], [2e6, '2 million'], [1e6, '1 million'], [0, 'today']] },
      { title: 'The last ' + Math.round(secLeft(span3) * 1000) + ' thousandths of a second', sub: span3 + ' years', span: span3, lanes: [0, 1, 2, 3, 4], ticks: [[100, '1926'], [81, '1945'], [56, '1970'], [26, '2000'], [14, '2012'], [0, '2026']] }
    ];
    let y = 22, g = '', prev = null;
    BARS.forEach((b, bi) => {
      const top = y + 12, h = b.lanes.length * LH, xx = yr => L + (1 - Math.min(yr, b.span) / b.span) * PW;
      g += '<text class="bt" x="' + L + '" y="' + y + '">' + b.title + '</text><text class="bs" x="' + R + '" y="' + y + '" text-anchor="end">' + b.sub + '</text>';
      if (prev) {
        g += '<path class="zf" d="M' + R + ' ' + prev.bottom + ' L' + R + ' ' + top + ' L' + L + ' ' + top + ' L' + f1(prev.x) + ' ' + prev.bottom + ' Z"/>';
        g += '<path class="zl" d="M' + f1(prev.x) + ' ' + prev.bottom + ' L' + L + ' ' + top + '"/><path class="zl" d="M' + R + ' ' + prev.bottom + ' L' + R + ' ' + top + '"/>';
      }
      b.lanes.forEach((li, r) => {
        const f = FLOORS[li], x0 = xx(f.years), ly = top + (b.lanes.length - 1 - r) * LH;
        g += '<rect class="lane" x="' + f1(x0) + '" y="' + ly + '" width="' + f1(Math.max(2, R - x0)) + '" height="' + LH + '" style="fill:' + f.color + '"/>';
        g += '<text class="ln" x="' + (L - 10) + '" y="' + (ly + 15) + '" text-anchor="end">' + f.name + '</text>';
      });
      g += '<rect class="frame-l" x="' + L + '" y="' + top + '" width="' + PW + '" height="' + h + '"/>';
      b.ticks.forEach(([yr, lbl], k) => { g += '<text class="tk" x="' + f1(xx(yr)) + '" y="' + (top + h + 15) + '" text-anchor="' + (k === 0 ? 'start' : yr === 0 ? 'end' : 'middle') + '">' + lbl + '</text>'; });
      const next = BARS[bi + 1];
      prev = next ? { x: Math.min(R - 3, xx(next.span)), bottom: top + h + 22 } : null;
      y = top + h + 74;
    });
    s.setAttribute('viewBox', '0 0 ' + W + ' ' + (y - 46));
    s.innerHTML = g;
  })();
})();
