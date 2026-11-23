(function () {
  'use strict';
  const X = window.SIX;
  X.chrome('stories');
  const $ = id => document.getElementById(id);
  const esc = X.esc;

  /* ---------- the six tracks: plain narrative + which ledgers hold their dated milestones ---------- */
  const TRACKS = [
    {
      id: 'dna-story', key: 'dna', short: 'DNA & genomes', color: 'var(--c-store)', ledgers: ['genomes'], inv: 'dna',
      title: 'How heredity grew: from RNA copiers to 3.6×10³⁷ bits of DNA',
      lead: 'Life’s memory started as a short RNA strand that copied itself. Today every living cell together holds about 3.6×10³⁷ bits of DNA.',
      body: [
        'About 4 billion years ago, the first heredity may have been short RNA strands that copied themselves. A copier like that has a hard limit: it must make fewer than about one mistake per copy, or its message melts into noise. In the lab, the best RNA copiers today manage strands of about 200 letters.',
        'By 4.2 billion years ago, the common ancestor of all life had solved the problem with DNA, proofreading proteins and a code every cell still uses. Its genome held about 2.5 million letters and 2,600 genes, the size of a modern bacterium. Microbes did not only pass genes to their offspring: they swapped them sideways, so a useful gene could spread across the living world.',
        'The next big step was the complex cell, about 1.65 to 2 billion years ago. It wound its DNA on protein spools, captured a bacterium that became the mitochondrion, and moved most of that bacterium’s genes into its own nucleus. Genomes could now grow a hundredfold. Sex, seen in a 1.05-billion-year-old red seaweed, shuffled two parents’ genes in every generation.',
        'Animals brought genes for gluing cells together and laying out a body, though much of that toolkit is older than animals. Early vertebrates then copied their whole genome twice, and the spare copies took on new jobs. After that, genome size stopped tracking complexity: a lungfish has 14 times our DNA, a small fern 50 times, and a roundworm of 1,000 cells has nearly as many genes as we do.',
        'Accuracy follows a different rule. Species with huge populations copy most accurately: E. coli makes about one error per 5 billion letters, Paramecium one per 50 billion. Each human child carries about 70 new changes. Since 1977 people have learned to read DNA, then to write it (2010), edit it (2012) and store their own files in it.'
      ],
      links: [['Walk DNA in the Tree', 'tree.html#path=dna'], ['Genome figure in the Data Lab', 'data.html#genomes']]
    },
    {
      id: 'sex-story', key: 'sex', short: 'Sex', color: 'var(--c-make)', ledgers: ['sex'], inv: 'sex',
      title: 'When sex began, and how it grew into flowers, songs and grandmothers',
      lead: 'Sex began as a way to repair broken DNA. Over a billion years it built bodies, flowers, courtship songs and long human childhoods.',
      body: [
        'Long before two-parent sex, bacteria and archaea repaired broken DNA against a neighbour’s copy and passed genes across cell-to-cell bridges. By about 1.85 billion years ago, the ancestor of all complex cells had turned those repair tools into meiosis: pairing two chromosome sets, swapping matching stretches, and dealing one clean half into each sex cell.',
        'By 1.05 billion years ago, a many-celled red seaweed, Bangiomorpha, left fossils with clear sexual spores. As bodies grew, sex cells split into two kinds: millions of small searching sperm and a few large, well-fed eggs. Armoured fish 385 million years ago left the oldest evidence of internal mating, and on land seed plants piped sperm through pollen tubes.',
        'Later lineages stacked new tricks on top: sex chromosomes in mammals and birds, flowers that hire insects with colour and nectar, ant and bee queens that store sperm for decades, placentas and milk, songbird courtship, and human grandmothers who help feed grandchildren. Since 1978, IVF has brought medicine into conception itself.'
      ],
      links: [['Walk sex in the Tree', 'tree.html#path=sex'], ['Sex figure in the Data Lab', 'data.html#sex']]
    },
    {
      id: 'nerves-story', key: 'nerves', short: 'Nerves & brains', color: 'var(--c-cpu)', ledgers: ['nervegenes', 'neural'], inv: 'neurons',
      title: 'From calcium waves to 3×10²⁶ nerve signals a second',
      lead: 'The parts of a nerve are older than nerves. Brains came late, and most of the world’s neurons still sit in small animals.',
      body: [
        'Bacteria already have the potassium pores that reset a neuron after it fires, and relatives of the receptors that hear glutamate and GABA. The single-celled relatives of animals fire calcium spikes and hold the machinery that releases a signal at a synapse. Sponges, with no neurons at all, have the receiving side of a synapse.',
        'The first animals coordinated without nerves: a sponge squeezes its whole body with slow calcium waves. Neurons appear in jellyfish-like animals by about 560 million years ago, and comb jellies may have built theirs separately. By 555 million years ago worm-like animals had gathered neurons into a head. Jawed fish later wrapped nerves in myelin, which carries signals at up to 120 metres a second.',
        'The biggest brain alive grew about 25-million-fold: from about 10,000 neurons in the first nerve nets to 257 billion in today’s African elephant, the largest brain ever counted. Dinosaur brains are disputed: estimates for Tyrannosaurus run from a quarter of a billion to 3.3 billion forebrain neurons.',
        'Most neurons do not sit in big brains. Counting by animal group gives about 6×10²³ neurons today, mostly in roundworms and tiny land arthropods. All 8 billion people hold about 7×10²⁰, about a thousandth of the total, and each human brain runs 86 billion of them on 20 watts.'
      ],
      links: [['Walk nerves in the Tree', 'tree.html#path=neural'], ['Biggest-brain figure in the Data Lab', 'data.html#biggest']]
    },
    {
      id: 'motors-story', key: 'motors', short: 'Motors', color: 'var(--c-wire)', ledgers: ['motors'], inv: 'molecular-motors',
      title: 'How cells beat diffusion: protein roads and walking motors',
      lead: 'Big cells were too big for drifting molecules, so they built roads and two-footed walkers to carry their cargo.',
      body: [
        'Across a bacterium one micrometre wide, random drifting crosses the cell in thousandths of a second, so bacteria never needed walking motors. When complex cells grew a thousand times larger, drifting hit a wall: its time grows with the square of the distance. Drifting a protein down a one-metre human nerve would take about 1,585 years.',
        'Powered by the energy from mitochondria, early complex cells built hollow protein tubes, microtubules, and two-footed motors, kinesin and dynein, that walk along them at a few micrometres a second. The same parts were later reused to pull chromosomes apart, beat cilia, stir plant cells and keep every synapse in a brain supplied.'
      ],
      links: [['Walk motors in the Tree', 'tree.html#path=motors'], ['Motors in the Data Lab', 'data.html#motors']]
    },
    {
      id: 'plants-story', key: 'plants', short: 'Plants & fungi', color: 'var(--s-chem)', ledgers: ['plants'], inv: 'plant-signals',
      title: 'How green life senses sun, touch, winter and attack without neurons',
      lead: 'Plants hold most of the living carbon on Earth. They sense and remember without a single neuron.',
      body: [
        'Plants hold about 450 billion tonnes of carbon, more than four-fifths of all living biomass; animals hold about 2 billion. Plants make food from sunlight where they stand, so a brain would be dead weight. Instead they spread sensing across millions of root tips, leaf pores and leaves.',
        'Without nerves, plants still run electrical and chemical signals. A Venus flytrap fires an electrical spike, counts two touches within 20 seconds and snaps shut. A caterpillar bite sends a calcium wave to unbitten leaves within two minutes. Over a winter, shoots count cold weeks in marks on their DNA packaging, so they flower in spring rather than in a warm spell in autumn.',
        'Underground, since at least 407 million years ago, fungal threads have traded soil phosphorus for plant sugar. Careful field studies support that trade; they do not yet support popular claims of trees “talking” through a wood-wide web.'
      ],
      links: [['Walk plants in the Tree', 'tree.html#path=plants'], ['Plants in the Data Lab', 'data.html#plants']]
    },
    {
      id: 'immunity-story', key: 'immunity', short: 'Immunity', color: 'var(--c-prog)', ledgers: ['immunity'], inv: 'adaptive-immunity',
      title: 'From bacterial CRISPR to antibodies and mRNA vaccines',
      lead: 'Life’s second memory: cells keep records of the enemies they have met, and pass them on.',
      body: [
        'Every cell is hunted by viruses that change far faster than their hosts. Bacteria and archaea invented two defences: chemical tags that mark their own DNA so unmarked invader DNA can be cut, and CRISPR, which stores short snippets of past viruses and passes that memory to daughter cells.',
        'Animals added roving cells that eat invaders and sensors that recognise common germ patterns. Around 500 to 450 million years ago, vertebrates twice invented a way to shuffle gene pieces into billions of different receptors: jawed fish with antibodies, lampreys with a separate system. Memory cells can last for decades.',
        'People learned to steer this second memory on purpose: Jenner’s cowpox vaccine in 1796, smallpox gone by 1980, pure antibodies from 1975, reprogrammed immune cells against cancer in 2017 and mRNA vaccines in 2020.'
      ],
      links: [['Walk immunity in the Tree', 'tree.html#path=immunity'], ['Immunity in the Data Lab', 'data.html#immunity']]
    }
  ];
  const TK = {}; TRACKS.forEach(t => { TK[t.key] = t; });

  const EVID = { fossil: 'Fossil', molecular_clock: 'Gene clock', living_inference: 'Inferred from living species', measured: 'Measured', estimate: 'Estimate' };
  const EV_ABOUT = {
    fossil: 'Dated by fossils in rock of known age',
    molecular_clock: 'Dated by counting gene differences between living species',
    living_inference: 'Dated by which living species share it',
    measured: 'Measured directly',
    estimate: 'No direct date exists, so this is an estimate'
  };

  /* ---------- every dated milestone becomes one story card ---------- */
  const ALL = [];
  TRACKS.forEach(tr => tr.ledgers.forEach(lk => (X.SI[lk] || []).forEach(r => {
    if (!r || !r.pt || X.IDX[r.ep] == null) return;
    ALL.push(Object.assign({ tr: tr, i: X.IDX[r.ep] }, r));
  })));
  ALL.sort((a, b) => b.t - a.t || a.i - b.i);
  ALL.forEach((r, k) => { r.uid = r.tr.key + '-' + k; });

  const papersOf = r => String(r.src || '').split(/;\s*/).map(s => s.trim()).filter(Boolean);
  const when = t => t >= 1 ? X.fmtShort(t) + ' ago' : X.fmtShort(t);
  const rangeText = r => (r.lo != null && r.hi != null && r.lo !== '' && r.hi !== '' && (Number(r.lo) !== Number(r.t) || Number(r.hi) !== Number(r.t)))
    ? 'between ' + X.fmtShort(Number(r.hi)) + ' and ' + X.fmtShort(Number(r.lo)) : '';

  function credit(p) {
    return '<span class="sto-credit">' + esc(p.author || '') + (p.licence ? ' · ' + (p.licence_url ? '<a href="' + esc(p.licence_url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.licence) + '</a>' : esc(p.licence)) : '') +
      (p.credit_url ? ' · <a href="' + esc(p.credit_url) + '" target="_blank" rel="noopener noreferrer">Source ↗</a>' : '') + '</span>';
  }
  function picture(ep, big) {
    const p = X.PLATES && X.PLATES[ep];
    if (!p || !p.file) return '';
    return '<figure class="sto-pic' + (big ? ' big' : '') + '"><img src="' + esc(p.file) + '" alt="' + esc(p.caption || '') + '" loading="lazy" decoding="async">' +
      '<figcaption>' + (big ? '' : '<span class="sto-cap">Picture from this moment: ' + esc(p.caption || '') + '</span>') + credit(p) + '</figcaption></figure>';
  }
  function evidence(r) {
    const ps = papersOf(r);
    const rng = rangeText(r);
    return '<div class="sto-ev"><span class="sub">How we know</span>' +
      (r.ev ? '<p><span class="chip ev-' + esc(r.ev) + '">' + esc(EVID[r.ev] || r.ev) + '</span> ' + esc(EV_ABOUT[r.ev] || '') + (rng ? ', ' + esc(rng) : '') + '.</p>' : '') +
      (r.dn ? '<p class="sto-note">' + esc(r.dn) + '</p>' : '') +
      (ps.length ? '<p class="sto-papers"><b>' + (ps.length > 1 ? 'Papers' : 'Paper') + ':</b> ' + ps.map(p => '<button type="button" class="sto-paper" data-paper="' + esc(p) + '">' + esc(p) + '</button>').join('; ') + '</p>' : '') +
      '</div>';
  }
  function thumb(ep) {
    const p = X.PLATES && X.PLATES[ep];
    return p && p.file ? '<img class="sto-thumb" src="' + esc(p.file) + '" alt="" loading="lazy" decoding="async">' : '';
  }
  function card(r, opts) {
    opts = opts || {};
    const inv = r.inv && X.INVK[r.inv];
    return '<article class="sto-card" id="' + r.uid + '" style="--sc:' + r.tr.color + '">' +
      '<div class="sto-txt"><p class="sto-when">' + (opts.thumb ? thumb(r.ep) : '') + '<span class="sto-tag">' + esc(r.tr.short) + '</span><b>' + esc(when(r.t)) + '</b></p>' +
      '<h3>' + esc(r.pt) + '</h3><p>' + esc(r.px || '') + '</p>' +
      '<p class="sto-sys x-only">' + esc(r.name || '') + (r.sys ? ' · ' + esc(r.sys) : '') + '</p>' +
      evidence(r) +
      '<p class="sto-go">' + (opts.thumb ? '<a href="journey.html#' + esc(r.ep) + '">See this moment on the Journey →</a>' : '') + (inv ? '<a href="tree.html#' + esc(r.inv) + '">' + esc(inv.label || 'This invention') + ' in the Tree →</a>' : '') + '</p>' +
      '</div></article>';
  }
  // one moment: its picture once, then every story it tells
  function momentGroups(list) {
    const groups = [];
    list.forEach(r => { const g = groups.find(x => x.ep === r.ep); if (g) g.rows.push(r); else groups.push({ ep: r.ep, i: r.i, rows: [r] }); });
    return groups;
  }
  function momentBlock(g) {
    const p = X.PLATES[g.ep] || {}, st0 = X.STOP && X.STOP[g.ep];
    return '<section class="sto-pgroup" id="pic-' + esc(g.ep) + '"><div class="sto-pg-pic">' + picture(g.ep, true) + '</div><div class="sto-pg-body">' +
      '<p class="sto-when"><b>' + esc(when(X.E[g.i].t)) + '</b>' + (st0 && st0.who ? '<span>' + esc(st0.who) + '</span>' : '') + '</p>' +
      '<h3>' + esc(p.caption || X.titleOf(g.i)) + '</h3>' +
      '<p class="sto-hint">' + (g.rows.length === 1 ? 'One story' : g.rows.length + ' stories') + ' from this moment · <a href="journey.html#' + esc(g.ep) + '">Open it on the Journey →</a></p>' +
      '<div class="sto-grid">' + g.rows.map(r => card(r)).join('') + '</div></div></section>';
  }

  /* ---------- state: which track, told which way ---------- */
  const st = { track: 'dna', view: 'time', paper: '', pic: '' };
  const VIEWS = [['time', 'In time order'], ['picture', 'By picture'], ['paper', 'By paper']];

  $('storyIndex').innerHTML =
    '<div class="sto-tracks" role="group" aria-label="Pick a story">' +
    TRACKS.map(t => '<button type="button" class="sto-track" data-track="' + t.key + '" style="--sc:' + t.color + '"><b>' + esc(t.short) + '</b><span>' + ALL.filter(r => r.tr === t).length + ' milestones</span></button>').join('') +
    '<button type="button" class="sto-track" data-track="all" style="--sc:var(--ink-3)"><b>All six</b><span>' + ALL.length + ' milestones</span></button></div>' +
    '<div class="sto-views"><span class="sub" id="tellH">Tell it</span><div class="seg" role="group" aria-labelledby="tellH">' +
    VIEWS.map(v => '<button type="button" data-view="' + v[0] + '">' + v[1] + '</button>').join('') + '</div></div>';

  function rows() { return st.track === 'all' ? ALL : ALL.filter(r => r.tr.key === st.track); }

  function narrative() {
    if (st.track === 'all') return '<header class="sto-head"><h2>Six stories, ' + ALL.length + ' dated milestones</h2><p class="sto-lead">Every card is one step in one of the six stories, shown with a picture from its moment and the evidence behind its date.</p></header>';
    const t = TK[st.track];
    const inv = X.INVK[t.inv];
    const av = inv && X.avCardHtml ? X.avCardHtml(inv.watch, inv.listen) : '';
    return '<header class="sto-head" id="' + t.id + '" style="--sc:' + t.color + '"><span class="eyebrow">' + esc(t.short) + ' · ' + rows().length + ' dated milestones</span>' +
      '<h2>' + esc(t.title) + '</h2><p class="sto-lead">' + esc(t.lead) + '</p>' +
      '<details class="sto-read"' + (st.view === 'time' ? ' open' : '') + '><summary>Read the whole story</summary><div class="story-body">' + t.body.map(p => '<p>' + esc(p) + '</p>').join('') + av + '</div></details>' +
      '<div class="story-links">' + t.links.map(l => '<a class="btn sm ghost" href="' + l[1] + '">' + esc(l[0]) + ' →</a>').join('') + '</div></header>';
  }

  function strip(list) {
    // the site's own spine: 68 moments in 7 acts; each milestone is a dot at its moment
    const lanes = {};
    const dots = list.map(r => { const l = lanes[r.i] = (lanes[r.i] || 0) + 1; return { r: r, lane: l - 1 }; });
    const maxLane = Math.max(1, ...Object.values(lanes));
    const x = i => ((i + 0.5) / X.N * 100).toFixed(2) + '%';
    return '<div class="sto-strip" style="--lanes:' + Math.min(maxLane, 6) + '" aria-label="Timeline of these milestones">' +
      '<div class="sto-acts">' + X.ACTS.map(a => '<span style="left:' + (a.i0 / X.N * 100).toFixed(2) + '%;width:' + ((a.i1 - a.i0 + 1) / X.N * 100).toFixed(2) + '%;--ac:' + a.color + '" title="' + esc(a.name) + '">' + toRoman(a.k) + '</span>').join('') + '</div>' +
      '<div class="sto-dots">' + dots.map(d => '<a class="sto-dot" href="#' + d.r.uid + '" style="left:' + x(d.r.i) + ';bottom:' + (Math.min(d.lane, 5) * 12 + 4) + 'px;--sc:' + d.r.tr.color + '" title="' + esc(when(d.r.t) + ': ' + d.r.pt) + '"><span class="sr-only">' + esc(when(d.r.t) + ': ' + d.r.pt) + '</span></a>').join('') + '</div>' +
      '<div class="sto-ends"><span>' + X.fmtShort(X.E[0].t) + ' ago</span><span>Today</span></div></div>';
  }
  function toRoman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n] || String(n); }

  function byTime(list) {
    let out = '', act = null;
    momentGroups(list).forEach(g => {
      const a = X.actOf(g.i);
      if (a !== act) { act = a; out += '<h3 class="sto-act" style="--ac:' + a.color + '">Act ' + toRoman(a.k) + ' · ' + esc(a.name) + '</h3>'; }
      out += momentBlock(g);
    });
    return out;
  }
  function byPicture(list) {
    const groups = momentGroups(list);
    if (st.pic) {
      const g = groups.find(x => x.ep === st.pic);
      if (g) return '<p class="sto-hint"><button type="button" class="btn sm ghost" data-allpics="1">← All ' + groups.length + ' pictures</button></p>' + momentBlock(g);
    }
    return '<p class="sto-hint">' + groups.length + ' pictures. Each is the star of one moment on the Journey; pick one to read the stories it tells.</p>' +
      '<div class="sto-gallery">' + groups.map(g => {
        const p = X.PLATES[g.ep] || {};
        return '<button type="button" class="sto-tile" data-pic="' + esc(g.ep) + '">' + (p.file ? '<img src="' + esc(p.file) + '" alt="" loading="lazy" decoding="async">' : '') +
          '<span class="sto-tile-t"><b>' + esc(when(X.E[g.i].t)) + '</b> · ' + (g.rows.length === 1 ? '1 story' : g.rows.length + ' stories') + '</span>' +
          '<span class="sto-tile-c">' + esc(p.caption || X.titleOf(g.i)) + '</span></button>';
      }).join('') + '</div>';
  }
  function byPaper(list) {
    const map = new Map();
    list.forEach(r => papersOf(r).forEach(p => { if (!map.has(p)) map.set(p, []); map.get(p).push(r); }));
    let groups = [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    if (st.paper) groups = groups.filter(g => g[0] === st.paper);
    return '<p class="sto-hint">' + (st.paper ? 'One paper and the stories it supports. <button type="button" class="btn sm ghost" data-allpapers="1">← All ' + map.size + ' papers</button>'
      : map.size + ' papers and books, most-used first. One paper can tell several stories, and a story often rests on more than one paper.') + '</p>' +
      groups.map(g => '<section class="sto-paper-group"><h3><span class="sto-pnum" title="Stories that cite it">' + g[1].length + '</span>' + esc(g[0]) + '</h3><div class="sto-grid">' + g[1].map(r => card(r, { thumb: true })).join('') + '</div></section>').join('');
  }

  function draw() {
    const list = rows();
    document.querySelectorAll('.sto-track').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.track === st.track)));
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === st.view)));
    $('storiesList').innerHTML = narrative() + strip(list) +
      (st.view === 'picture' ? byPicture(list) : st.view === 'paper' ? byPaper(list) : byTime(list));
  }
  function writeHash() {
    const t = st.track === 'all' ? 'all' : TK[st.track].id;
    const h = '#' + t + (st.view !== 'time' ? '&view=' + st.view : '') + (st.view === 'picture' && st.pic ? '&pic=' + st.pic : '');
    if (location.hash !== h) history.replaceState(null, '', h);
  }
  function readHash() {
    const h = decodeURIComponent((location.hash || '').slice(1));
    if (!h || h === 'books' || h === 'crossroads') return false;
    const parts = h.split('&');
    const t = TRACKS.find(x => x.id === parts[0] || x.key === parts[0]);
    if (t) st.track = t.key; else if (parts[0] === 'all') st.track = 'all'; else return false;
    const v = parts.find(p => p.startsWith('view='));
    st.view = v && VIEWS.some(x => x[0] === v.slice(5)) ? v.slice(5) : 'time';
    const pc = parts.find(p => p.startsWith('pic='));
    st.pic = pc && X.IDX[pc.slice(4)] != null ? pc.slice(4) : '';
    st.paper = '';
    return true;
  }

  $('storyIndex').addEventListener('click', ev => {
    const tb = ev.target.closest('[data-track]'), vb = ev.target.closest('[data-view]');
    if (tb) { st.track = tb.dataset.track; st.paper = ''; st.pic = ''; }
    else if (vb) { st.view = vb.dataset.view; st.paper = ''; st.pic = ''; }
    else return;
    draw(); writeHash();
  });
  const toTop = () => { const h = document.querySelector('.sto-strip'); if (h) h.scrollIntoView({ block: 'start' }); };
  $('storiesList').addEventListener('click', ev => {
    const pb = ev.target.closest('.sto-paper'), tile = ev.target.closest('[data-pic]'), dot = ev.target.closest('.sto-dot');
    if (pb) { st.view = 'paper'; st.paper = pb.dataset.paper; draw(); writeHash(); toTop(); }
    else if (tile) { st.pic = tile.dataset.pic; draw(); writeHash(); toTop(); }
    else if (ev.target.closest('[data-allpics]')) { st.pic = ''; draw(); writeHash(); toTop(); }
    else if (ev.target.closest('[data-allpapers]')) { st.paper = ''; draw(); writeHash(); toTop(); }
    else if (dot) {
      // a dot jumps to its card, switching back to time order if needed
      ev.preventDefault();
      const id = dot.getAttribute('href').slice(1);
      if (!document.getElementById(id) || st.view !== 'time') { st.view = 'time'; st.paper = ''; st.pic = ''; draw(); writeHash(); }
      const c = document.getElementById(id);
      if (c) { document.querySelectorAll('.sto-card.hit').forEach(x => x.classList.remove('hit')); c.classList.add('hit'); c.scrollIntoView({ block: 'center' }); }
    }
  });

  const fromHash = readHash();
  draw();
  if (fromHash) requestAnimationFrame(() => $('storyIndex').scrollIntoView({ block: 'start' }));
  addEventListener('hashchange', () => { if (readHash()) draw(); });

  /* ---------- three books ---------- */
  $('booksGrid').innerHTML =
    '<article class="book-card" style="--bc:var(--c-power)"><span class="sub">Physics and heredity · 1944</span><h3>Erwin Schrödinger · <cite>What Is Life?</cite></h3><p>Living things stay ordered by constantly drawing in usable energy. Nine years before the double helix, Schrödinger predicted that genes must be a code written in an irregular crystal.</p><p class="book-go"><a href="journey.html#EP01a">Visit the first vents →</a> · <a href="tree.html#path=dna">DNA in the Tree →</a></p></article>' +
    '<article class="book-card" style="--bc:var(--c-prog)"><span class="sub">Brain evolution · 2023</span><h3>Max Bennett · <cite>A Brief History of Intelligence</cite></h3><p>Five breakthroughs, each built on the last: steering, learning from reward, imagining, reading other minds, and speaking. He argues language models got the fifth before the first four.</p><p class="book-go"><a href="tree.html#path=bennett">Bennett’s five steps in the Tree →</a></p></article>' +
    '<article class="book-card" style="--bc:var(--c-net)"><span class="sub">Life as computation · 2025</span><h3>Blaise Agüera y Arcas · <cite>What Is Intelligence?</cite></h3><p>Life and mind are both prediction. Random programs can start copying themselves, big steps in evolution come from mergers such as the mitochondrion, and prediction machines can be truly intelligent.</p><p class="book-go"><a href="tree.html#path=symbio">Mergers in the Tree →</a></p></article>';
  if (X.PERSP && X.PERSP.length) $('booksPersp').innerHTML = X.PERSP.map(p => X.perspCard(p, false)).join('');
  if (/^#(books|crossroads)$/.test(location.hash)) {
    if (location.hash === '#crossroads') $('crossroads').open = true;
    requestAnimationFrame(() => document.querySelector(location.hash).scrollIntoView({ block: 'start' }));
  }
})();
