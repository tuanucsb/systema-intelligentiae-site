/* Isometric Switchback Staircase & Responsive Stepped Panorama for journey.html
   Follows DESIGN.md: all 68 stops across 7 Acts matching Journey, colour = data only,
   light/dark tokens, non-anthropocentric parallel branch markers, crisis red fracture steps,
   + / - trade-offs, clickable 3D steps/banners/parts, and WCAG 1.4.13 hovercards on every stop circle. */
(function () {
  'use strict';
  const X = window.SIX;
  if (!X) return;
  const esc = X.esc;

  // Matches Journey's exact Key milestones (26) filter while defaulting to all 68 stops
  const TOUR_SET = new Set((X.TOUR || []).map(s => s.epoch));

  const ACT_SPANS_SHORT = {
    I: '4.1–3.8 Ga',
    II: '3.2–2.1 Ga',
    III: '1.8 Ga – 555 Ma',
    IV: '541–253 Ma',
    V: '252–7 Ma',
    VI: '3.3 Ma – 1890',
    VII: '1945 – 2026'
  };

  const TRADEOFFS = {
    EP03b: 'Anaerobic microbes driven from sunlit seas into air-free mud',
    EP04a: 'Engulfed bacteria surrender ~95% of their own genes to the host nucleus',
    EP04b: 'Swallowed plastids shed most standalone genes to the host cell nucleus',
    EP08b: 'Soft, unarmored seafloor mat-grazers fade as visual hunters spread',
    EP11a: 'Slow, energy-hungry giant axons replaced by thin myelinated fibers',
    EP12b: 'Effortless water buoyancy traded for heavy load-bearing ribs and limbs',
    EP13b: 'Aquatic gills and water-ripple lateral lines lost on dry land',
    EP15a: 'Repeated non-coding DNA stripped down for compact, high-oxygen cells',
    EP15b: 'Two of four color-vision cone types lost during the nocturnal bottleneck',
    EP16b: 'Rear jaw-hinge bones detached from chewing to build the three-bone ear',
    EP17a: 'Heavy teeth and long bony tails shed along the bird flight line',
    EP17b: 'Individual worker reproduction traded for sterile caste superorganisms',
    EP19a: 'Sharp claws flatten into nails; snout and smell genes shrink for stereo sight',
    EP19b: 'Whales trade smell for biosonar; birds shed heavy cortical layers for dense nuclei',
    EP20a: 'External tail lost; Vitamin C synthesis gone (fruit now required in diet)',
    EP20b: 'Tree-grasping big toe traded for an upright walking hip and knee',
    EP21a: 'Climbing foot arch stiffens into a spring-like stride',
    EP22a: 'Gut and chewing jaws shrink as fire and cooking digest food outside the body',
    EP22c: 'Heavy brow ridges and thick fur reduced; sweat cools long endurance runs',
    EP25a: 'Exact recall offloaded from mortal brains onto unpowered 5,000-year clay',
    EP28a: 'Hand-copied scribal scarcity gives way to mass-printed rag paper',
    EP29b: 'Cheap acid wood-pulp paper crumbles in decades compared with rag or clay',
    EP31a: 'Unpowered media lifespan drops from millennia (clay) to ~5–10 years (flash/disk)',
    EP32a: 'Hand-coded feature rules replaced by compute-heavy learned attention'
  };

  const PARALLEL_PEAKS = {
    EP05a: 'Algal branch',
    EP08b: 'Arthropod + chordate split',
    EP09a: 'Cephalopod peak',
    EP13a: 'Insect flight peak',
    EP17m: 'Plant + insect partnership',
    EP17b: 'Dinosaur + ant peak',
    EP19b: 'Whale + songbird peak',
    EP19c: '8-kg whale brain peak'
  };

  const STEP_LABELS = {
    EP23b: 'Ice-age speakers & artists'
  };

  const CRISIS_BY_ID = {};
  (window.SI && window.SI.crises || []).forEach(c => { CRISIS_BY_ID[c.epoch_id] = c; });

  function firstSentence(txt) {
    if (!txt) return '';
    return txt.trim().split(/(?<!\d)\.(?!\d)\s+/)[0].replace(/\.$/, '');
  }

  function fmtStepTime(mya) {
    if (!(mya > 0)) return '2026 CE';
    if (mya >= 1000) return +(mya / 1000).toFixed(2) + ' Ga';
    if (mya >= 1) return +mya.toFixed(1) + ' Ma';
    const yrs = mya * 1e6;
    if (yrs >= 10000) return Math.round(yrs / 1000) + ' ka';
    const ce = Math.round(2026 - yrs);
    if (ce <= 0) {
      const bce = Math.abs(1 - ce) >= 500 ? Math.round((1 - ce) / 100) * 100 : (1 - ce);
      return '~' + bce + ' BCE';
    }
    return ce + ' CE';
  }

  function wrapLines(text, maxChars) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return [''];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      if (cur.length + 1 + words[i].length <= maxChars) cur += ' ' + words[i];
      else { lines.push(cur); cur = words[i]; }
    }
    lines.push(cur);
    return lines;
  }

  function resolveCalloutY(items, minY, gap) {
    if (!items.length) return;
    items.sort((a, b) => a.anchorY - b.anchorY);
    let cur = minY;
    items.forEach(it => {
      it.y = Math.max(cur, it.anchorY - it.h * 0.35);
      cur = it.y + it.h + gap;
    });
    for (let i = items.length - 2; i >= 0; i--) {
      const hiAllowed = items[i + 1].y - items[i].h - gap;
      const desired = items[i].anchorY - items[i].h * 0.35;
      if (items[i].y > desired) items[i].y = Math.min(items[i].y, Math.max(desired, hiAllowed));
    }
    cur = minY;
    items.forEach(it => {
      if (it.y < cur) it.y = cur;
      cur = it.y + it.h + gap;
    });
  }

  function poolIndices(allMode) {
    const out = [];
    for (let i = 0; i < X.N; i++) {
      if (allMode || TOUR_SET.has(X.E[i].id)) out.push(i);
    }
    return out;
  }

  function buildFlights(allMode) {
    const flights = [];
    let dir = 1;
    X.ACTS.forEach(act => {
      const indices = [];
      for (let i = act.i0; i <= act.i1; i++) {
        if (allMode || TOUR_SET.has(X.E[i].id)) indices.push(i);
      }
      if (!indices.length) return;
      if (!allMode || indices.length <= 8) {
        flights.push({ act, partIdx: 0, partCount: 1, dir, indices });
        dir *= -1;
      } else {
        const nRuns = Math.ceil(indices.length / 7);
        let pos = 0;
        for (let r = 0; r < nRuns; r++) {
          const rem = indices.length - pos;
          const sz = Math.ceil(rem / (nRuns - r));
          flights.push({ act, partIdx: r, partCount: nRuns, dir, indices: indices.slice(pos, pos + sz) });
          pos += sz;
          dir *= -1;
        }
      }
    });
    return flights;
  }

  function renderSvgStaircase(allMode, selIdx, stepCoords) {
    const flights = buildFlights(allMode);
    const W = 1200;
    const sx = allMode ? 48 : 52;
    const sy = allMode ? 20 : 21;
    const rh = allMode ? 28 : 30;
    const wallH = 72;
    const turnDrop = 124;
    const R_MED = allMode ? 19.5 : 21;

    let px = 0;
    const relXs = [];
    flights.forEach(fl => {
      const d = fl.dir, n = fl.indices.length;
      for (let k = 0; k < n; k++) {
        relXs.push(d === 1 ? px : px - 2 * sx, d === 1 ? px + 2 * sx : px);
        if (k < n - 1) px += d * sx;
      }
      px += d * sx;
    });

    const midRelX = 0.5 * (Math.min(...relXs) + Math.max(...relXs));
    let curX = W * 0.5 - midRelX;
    let curY = 78;

    const leftCallouts = [];
    const rightCallouts = [];
    const maxInvLines = allMode ? 2 : 3;

    flights.forEach(fl => {
      const d = fl.dir, n = fl.indices.length;
      const geoms = [];
      fl.indices.forEach((i, k) => {
        const e = X.E[i];
        const eid = e.id;
        const st = X.STOP[eid];
        const isCrisis = Boolean(CRISIS_BY_ID[eid]);
        const stepRh = rh + (isCrisis ? 5 : 0);

        const A = [curX, curY];
        const B = [curX + d * sx, curY + sy];
        const C = [curX + d * 2 * sx, curY];
        const D = [curX + d * sx, curY - sy];
        const center = [curX + d * sx, curY];

        geoms.push({ i, e, eid, st, k, n, dir: d, A, B, C, D, center, rh: stepRh, isCrisis });

        curX = B[0];
        curY = B[1] + (k < n - 1 ? stepRh : turnDrop);
      });
      fl.geoms = geoms;

      geoms.forEach(sg => {
        const eid = sg.eid;
        const invs = X.INV.filter(u => u.i === sg.i);
        const trade = TRADEOFFS[eid];
        const cr = CRISIS_BY_ID[eid];
        const entries = [];
        let totalLines = 0;

        if (cr) {
          const sp = (cr.species_lost || '').trim();
          const pref = sp ? 'LOST (' + sp + '): ' : 'CRISIS: ';
          const wlines = wrapLines(pref + cr.lost.trim(), 36);
          entries.push({ kind: 'crisis', color: 'var(--crisis)', lines: wlines, inv: null });
          totalLines += wlines.length;
        } else {
          invs.slice(0, maxInvLines).forEach(inv => {
            const pcol = X.PK[inv.part] ? X.PK[inv.part].color : 'var(--ink-2)';
            let det = firstSentence(inv.detail);
            if (allMode || det.length > 62) det = inv.label;
            else det = inv.label + ' — ' + det;
            const wlines = wrapLines(det, 38);
            entries.push({ kind: 'plus', color: pcol, lines: wlines, inv });
            totalLines += wlines.length;
          });
          if (trade) {
            const wlines = wrapLines(trade, 38);
            entries.push({ kind: 'minus', color: 'var(--c-power)', lines: wlines, inv: null });
            totalLines += wlines.length;
          }
        }

        if (!entries.length) return;
        const cxS = sg.center[0], cyS = sg.center[1];
        const nearMid = Math.abs(cxS - W * 0.5) < 68;
        const biasRight = nearMid ? (rightCallouts.length <= leftCallouts.length) : (cxS > W * 0.5);
        const side = biasRight ? 'right' : 'left';
        const cardH = 26 + totalLines * 15;
        const whoDisp = STEP_LABELS[eid] || (sg.st ? sg.st.who : X.titleOf(sg.i));
        const anchorX = side === 'right' ? (d === 1 ? sg.C[0] : sg.A[0]) : (d === 1 ? sg.A[0] : sg.C[0]);

        const cal = {
          i: sg.i,
          eid,
          who: whoDisp,
          when: fmtStepTime(sg.e.t),
          actColor: fl.act.color,
          isCrisis: Boolean(cr),
          entries,
          anchorX,
          anchorY: cyS - 8,
          h: cardH,
          side
        };
        if (side === 'left') leftCallouts.push(cal);
        else rightCallouts.push(cal);
      });
    });

    resolveCalloutY(leftCallouts, 16, allMode ? 8 : 11);
    resolveCalloutY(rightCallouts, 16, allMode ? 8 : 11);

    const lastB = flights[flights.length - 1].geoms.slice(-1)[0].B;
    const lastStepY = lastB[1] + wallH + 38;
    const maxCalY = Math.max(
      lastStepY,
      ...leftCallouts.concat(rightCallouts).map(c => c.y + c.h + 20)
    );
    const H = Math.ceil(maxCalY + 16);

    if (stepCoords) {
      flights.forEach(fl => {
        fl.geoms.forEach(sg => {
          const medCenterY = sg.center[1] - 29;
          stepCoords[sg.i] = {
            x: sg.center[0] / W,
            y: medCenterY / H,
            rRatio: (R_MED + 4) / W,
            W,
            H
          };
        });
      });
    }

    const CARD_W = 294;
    const LEFT_X = 12;
    const RIGHT_X = W - 12 - CARD_W;

    const svg = [];
    const shownCount = allMode ? X.STOPS.length : X.TOUR.length;
    svg.push('<svg class="stairs-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="stSvgTitle stSvgDesc">');
    svg.push('<title id="stSvgTitle">Thinking Matter: isometric switchback staircase across 7 Acts of Earth’s history</title>');
    svg.push('<desc id="stSvgDesc">Interactive 3D switchback staircase showing ' + (allMode ? 'all ' + shownCount + ' stops' : shownCount + ' key milestones') + ' from 4.1 billion years ago to 2026 CE. Hover over any stop circle for a brief description and link, or select any step to explore.</desc>');

    svg.push('<defs>');
    svg.push('<filter id="stMedShadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0b0c1a" flood-opacity="0.22"/></filter>');
    flights.forEach(fl => {
      fl.geoms.forEach(sg => {
        svg.push('<clipPath id="st-clip-' + sg.eid + '"><circle cx="0" cy="0" r="' + (R_MED - 1.4).toFixed(1) + '"/></clipPath>');
      });
    });
    svg.push('</defs>');

    // 1. Leader curves
    svg.push('<g class="st-leaders" aria-hidden="true">');
    leftCallouts.concat(rightCallouts).forEach(cal => {
      const x0 = cal.side === 'left' ? LEFT_X + CARD_W : RIGHT_X;
      const y0 = cal.y + 16;
      const x1 = cal.anchorX, y1 = cal.anchorY;
      const c1x = x0 + (x1 - x0) * 0.48;
      const c2x = x1 - (x1 - x0) * 0.35;
      const cls = 'st-leader' + (cal.isCrisis ? ' is-crisis' : '') + (cal.i === selIdx ? ' is-sel' : '');
      svg.push('<path class="' + cls + '" data-for="' + cal.i + '" d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' C' + c1x.toFixed(1) + ',' + y0.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + y1.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1.toFixed(1) + '"/>');
      svg.push('<circle class="st-leader-dot' + (cal.isCrisis ? ' is-crisis' : '') + '" data-for="' + cal.i + '" cx="' + x1.toFixed(1) + '" cy="' + y1.toFixed(1) + '" r="2.5"/>');
    });
    svg.push('</g>');

    // 2. Flights
    const seenActs = new Set();
    flights.forEach((fl, fi) => {
      const act = fl.act, an = act.n, d = fl.dir, geoms = fl.geoms;
      const firstForAct = !seenActs.has(an);
      seenActs.add(an);
      const flightId = firstForAct ? ' id="st-act-' + an + '"' : '';

      svg.push('<g' + flightId + ' class="st-flight" style="--ac:' + act.color + '">');

      if (fi < flights.length - 1) {
        const lg = geoms[geoms.length - 1];
        const pierH = turnDrop + sy;
        const p1 = lg.A[0].toFixed(1) + ',' + lg.A[1].toFixed(1) + ' ' + lg.B[0].toFixed(1) + ',' + lg.B[1].toFixed(1) + ' ' + lg.B[0].toFixed(1) + ',' + (lg.B[1] + pierH).toFixed(1) + ' ' + lg.A[0].toFixed(1) + ',' + (lg.A[1] + pierH).toFixed(1);
        const p2 = lg.B[0].toFixed(1) + ',' + lg.B[1].toFixed(1) + ' ' + lg.C[0].toFixed(1) + ',' + lg.C[1].toFixed(1) + ' ' + lg.C[0].toFixed(1) + ',' + (lg.C[1] + pierH).toFixed(1) + ' ' + lg.B[0].toFixed(1) + ',' + (lg.B[1] + pierH).toFixed(1);
        svg.push('<polygon class="st-wall" points="' + p1 + '"/>');
        svg.push('<polygon class="st-riser" points="' + p2 + '"/>');
      }

      const wallPts = [];
      geoms.forEach(sg => {
        wallPts.push(sg.A[0].toFixed(1) + ',' + sg.A[1].toFixed(1));
        wallPts.push(sg.B[0].toFixed(1) + ',' + sg.B[1].toFixed(1));
      });
      const bLast = geoms[geoms.length - 1].B;
      const aFirst = geoms[0].A;
      wallPts.push(bLast[0].toFixed(1) + ',' + (bLast[1] + wallH).toFixed(1));
      wallPts.push(aFirst[0].toFixed(1) + ',' + (aFirst[1] + wallH).toFixed(1));
      svg.push('<polygon class="st-wall" points="' + wallPts.join(' ') + '"/>');
      svg.push('<line class="st-cornice" x1="' + aFirst[0].toFixed(1) + '" y1="' + (aFirst[1] + wallH - 3).toFixed(1) + '" x2="' + bLast[0].toFixed(1) + '" y2="' + (bLast[1] + wallH - 3).toFixed(1) + '"/>');

      // Steps
      geoms.forEach(sg => {
        const cls = 'st-step-prism' + (sg.isCrisis ? ' is-crisis' : '') + (sg.i === selIdx ? ' is-sel' : '');
        const riserPts = sg.B[0].toFixed(1) + ',' + sg.B[1].toFixed(1) + ' ' + sg.C[0].toFixed(1) + ',' + sg.C[1].toFixed(1) + ' ' + sg.C[0].toFixed(1) + ',' + (sg.C[1] + sg.rh).toFixed(1) + ' ' + sg.B[0].toFixed(1) + ',' + (sg.B[1] + sg.rh).toFixed(1);
        const treadPts = sg.A[0].toFixed(1) + ',' + sg.A[1].toFixed(1) + ' ' + sg.B[0].toFixed(1) + ',' + sg.B[1].toFixed(1) + ' ' + sg.C[0].toFixed(1) + ',' + sg.C[1].toFixed(1) + ' ' + sg.D[0].toFixed(1) + ',' + sg.D[1].toFixed(1);
        svg.push('<g class="' + cls + '" data-step="' + sg.i + '" data-i="' + sg.i + '">');
        svg.push('<polygon class="st-riser" points="' + riserPts + '"/>');
        svg.push('<polygon class="st-tread" points="' + treadPts + '"/>');
        svg.push('<line class="st-lip" x1="' + sg.A[0].toFixed(1) + '" y1="' + sg.A[1].toFixed(1) + '" x2="' + sg.B[0].toFixed(1) + '" y2="' + sg.B[1].toFixed(1) + '"/>');
        if (sg.isCrisis) {
          const mx = sg.center[0], my = sg.center[1];
          svg.push('<polyline class="st-crack" points="' + (mx - 13).toFixed(1) + ',' + (my - 4).toFixed(1) + ' ' + (mx - 3).toFixed(1) + ',' + (my + 2).toFixed(1) + ' ' + (mx + 2).toFixed(1) + ',' + (my - 3).toFixed(1) + ' ' + (mx + 13).toFixed(1) + ',' + (my + 4).toFixed(1) + '"/>');
        }
        svg.push('</g>');
      });

      // Clickable Skewed Act Banner on Flank Wall
      const dxW = bLast[0] - aFirst[0];
      const dyW = bLast[1] - aFirst[1];
      const skewDeg = Math.atan2(dyW, Math.abs(dxW)) * 180 / Math.PI;
      const partSuffix = fl.partCount > 1 ? ' (' + (fl.partIdx + 1) + '/' + fl.partCount + ')' : '';
      const spanTxt = fl.partIdx === 0 ? ' · ' + (ACT_SPANS_SHORT[an] || act.span) : partSuffix;
      const titleSize = geoms.length <= 2 ? '14.5px' : '16.5px';
      const padX = geoms.length <= 2 ? 7 : 13;
      const bannerW = Math.min(240, Math.max(92, Math.abs(dxW) - 16));
      const firstGeom = geoms[0];
      svg.push('<a href="#' + firstGeom.eid + '" class="st-act-hit" data-i="' + firstGeom.i + '" data-act="' + esc(an) + '" aria-label="' + esc('Act ' + an + ': ' + act.name + partSuffix + ' — select first stop') + '">');
      if (d === 1) {
        const wx = aFirst[0] + padX;
        const wy = aFirst[1] + 26 + padX * (dyW / dxW);
        svg.push('<g transform="translate(' + wx.toFixed(1) + ',' + wy.toFixed(1) + ') skewY(' + skewDeg.toFixed(2) + ')">');
        svg.push('<rect x="-4" y="-13" width="' + bannerW.toFixed(1) + '" height="37" rx="4" fill="#fff" fill-opacity="0"/>');
        svg.push('<text x="0" y="0" class="st-wall-num">Act ' + esc(an + spanTxt) + '</text>');
        svg.push('<text x="0" y="18.5" class="st-wall-title" style="font-size:' + titleSize + '">' + esc(act.name + (fl.partIdx > 0 ? partSuffix : '')) + '</text>');
        svg.push('</g>');
      } else {
        const wx = aFirst[0] - padX;
        const wy = aFirst[1] + 26 + (-padX) * (dyW / dxW);
        svg.push('<g transform="translate(' + wx.toFixed(1) + ',' + wy.toFixed(1) + ') skewY(' + (-skewDeg).toFixed(2) + ')">');
        svg.push('<rect x="' + (-bannerW + 4).toFixed(1) + '" y="-13" width="' + bannerW.toFixed(1) + '" height="37" rx="4" fill="#fff" fill-opacity="0"/>');
        svg.push('<text x="0" y="0" text-anchor="end" class="st-wall-num">Act ' + esc(an + spanTxt) + '</text>');
        svg.push('<text x="0" y="18.5" text-anchor="end" class="st-wall-title" style="font-size:' + titleSize + '">' + esc(act.name + (fl.partIdx > 0 ? partSuffix : '')) + '</text>');
        svg.push('</g>');
      }
      svg.push('</a>');

      // Interactive Medallion Circles, Unified 3D Step Hit Polygon & Step Labels (no SVG <title> so custom hovercard isn't covered)
      geoms.forEach(sg => {
        const mx = sg.center[0], my = sg.center[1];
        const medY = my - 29;
        const whoShort = STEP_LABELS[sg.eid] || (sg.st ? sg.st.who : X.titleOf(sg.i));
        const whenStr = fmtStepTime(sg.e.t);
        const pl = window.SI && window.SI.plates ? window.SI.plates[sg.eid] : null;
        const isSel = sg.i === selIdx;
        const hitCls = 'st-hit' + (sg.isCrisis ? ' is-crisis' : '') + (isSel ? ' is-sel' : '');
        const ly = medY - R_MED - 16;
        const prismHitPts =
          sg.A[0].toFixed(1) + ',' + sg.A[1].toFixed(1) + ' ' +
          sg.D[0].toFixed(1) + ',' + sg.D[1].toFixed(1) + ' ' +
          sg.C[0].toFixed(1) + ',' + sg.C[1].toFixed(1) + ' ' +
          sg.C[0].toFixed(1) + ',' + (sg.C[1] + sg.rh).toFixed(1) + ' ' +
          sg.B[0].toFixed(1) + ',' + (sg.B[1] + sg.rh).toFixed(1) + ' ' +
          sg.B[0].toFixed(1) + ',' + sg.B[1].toFixed(1);

        svg.push('<a href="#' + sg.eid + '" class="' + hitCls + '" data-i="' + sg.i + '" aria-label="' + esc('Stop ' + (sg.i + 1) + ' of ' + X.STOPS.length + ': ' + whoShort + ', ' + whenStr + (sg.isCrisis ? ', planetary crisis' : '')) + '">');
        svg.push('<polygon class="st-hit-poly" points="' + prismHitPts + '"/>');
        svg.push('<ellipse cx="' + mx.toFixed(1) + '" cy="' + (my - 1).toFixed(1) + '" rx="11.5" ry="4.8" class="st-shadow"/>');
        svg.push('<line x1="' + mx.toFixed(1) + '" y1="' + (my - 2).toFixed(1) + '" x2="' + mx.toFixed(1) + '" y2="' + (medY + R_MED).toFixed(1) + '" class="st-pin"/>');

        svg.push('<g class="st-med" transform="translate(' + mx.toFixed(1) + ',' + medY.toFixed(1) + ')"><g class="st-med-lift">');
        if (isSel) svg.push('<circle cx="0" cy="0" r="' + (R_MED + 5).toFixed(1) + '" class="st-sel-ring"/>');
        svg.push('<circle cx="0" cy="0" r="' + R_MED.toFixed(1) + '" class="st-med-bg" filter="url(#stMedShadow)"/>');
        if (pl && pl.file) {
          svg.push('<image href="' + esc(pl.file) + '" x="' + (-R_MED).toFixed(1) + '" y="' + (-R_MED).toFixed(1) + '" width="' + (2 * R_MED).toFixed(1) + '" height="' + (2 * R_MED).toFixed(1) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#st-clip-' + sg.eid + ')"/>');
        }
        svg.push('<circle cx="0" cy="0" r="' + R_MED.toFixed(1) + '" class="st-med-ring"/>');
        if (sg.isCrisis) {
          svg.push('<circle cx="14.5" cy="-14.5" r="7" class="st-crisis-dot"/>');
          svg.push('<text x="14.5" y="-11" text-anchor="middle" class="st-crisis-bang">!</text>');
        }
        svg.push('</g></g>');

        svg.push('<text x="' + mx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" class="st-who">' + esc(whoShort) + '</text>');
        svg.push('<text x="' + mx.toFixed(1) + '" y="' + (ly + 11.2).toFixed(1) + '" text-anchor="middle" class="st-when">' + esc(whenStr) + '</text>');

        if (PARALLEL_PEAKS[sg.eid]) {
          const ptxt = PARALLEL_PEAKS[sg.eid];
          const pw = ptxt.length * 5.2 + 13;
          svg.push('<g transform="translate(' + mx.toFixed(1) + ',' + (ly - 14.5).toFixed(1) + ')" aria-hidden="true">');
          svg.push('<rect x="' + (-pw / 2).toFixed(1) + '" y="-9" width="' + pw.toFixed(1) + '" height="13" rx="3" class="st-peak-box"/>');
          svg.push('<text x="0" y="0.5" text-anchor="middle" class="st-peak-txt">' + esc(ptxt) + '</text>');
          svg.push('</g>');
        }
        svg.push('</a>');
      });

      svg.push('</g>');
    });

    // 3. Callout Columns (Card link to Stop + sibling '+' links to Tree of Inventions)
    function drawCalloutCol(list, colX) {
      svg.push('<g class="st-callouts">');
      list.forEach(cal => {
        const isSel = cal.i === selIdx;
        const grpCls = 'st-cal-grp' + (cal.isCrisis ? ' is-crisis' : '') + (isSel ? ' is-sel' : '');
        const barX = cal.side === 'left' ? CARD_W - 3.5 : 0;

        const cardBody = [];
        const invLinks = [];
        let ry = 31.5;

        cal.entries.forEach(ent => {
          if (ent.kind === 'plus' && ent.inv) {
            const rowTop = ry - 11.2;
            const rowH = ent.lines.length * 15;
            const pInfo = X.PK[ent.inv.part];
            const pName = pInfo ? pInfo.name : ent.inv.part;
            invLinks.push('<a href="tree.html#' + esc(ent.inv.id) + '" class="st-cal-inv" data-inv="' + esc(ent.inv.id) + '" aria-label="' + esc(pName + ' upgrade: ' + ent.inv.label + ' — open in the Tree') + '">');
            invLinks.push('<rect class="st-inv-bg" x="5" y="' + rowTop.toFixed(1) + '" width="' + (CARD_W - 10) + '" height="' + rowH.toFixed(1) + '" rx="4" style="fill:' + ent.color + '"/>');
            ent.lines.forEach((ln, li) => {
              const lyRow = ry + li * 15;
              if (li === 0) {
                invLinks.push('<circle cx="15" cy="' + (lyRow - 3.5).toFixed(1) + '" r="5.3" style="fill:' + ent.color + '"/>');
                invLinks.push('<text x="15" y="' + lyRow.toFixed(1) + '" text-anchor="middle" class="st-cal-sym">+</text>');
              }
              invLinks.push('<text x="25" y="' + lyRow.toFixed(1) + '" class="st-cal-txt">' + esc(ln) + '</text>');
            });
            invLinks.push('</a>');
            ry += rowH;
          } else if (ent.kind === 'minus') {
            ent.lines.forEach((ln, li) => {
              const lyRow = ry + li * 15;
              if (li === 0) {
                cardBody.push('<circle cx="15" cy="' + (lyRow - 3.5).toFixed(1) + '" r="5.3" class="st-minus-dot"/>');
                cardBody.push('<text x="15" y="' + lyRow.toFixed(1) + '" text-anchor="middle" class="st-cal-sym">−</text>');
              }
              cardBody.push('<text x="25" y="' + lyRow.toFixed(1) + '" class="st-cal-txt is-minus">' + esc(ln) + '</text>');
            });
            ry += ent.lines.length * 15;
          } else if (ent.kind === 'crisis') {
            ent.lines.forEach((ln, li) => {
              const lyRow = ry + li * 15;
              if (li === 0) {
                cardBody.push('<polygon points="15,' + (lyRow - 9).toFixed(1) + ' 21,' + (lyRow + 1).toFixed(1) + ' 9,' + (lyRow + 1).toFixed(1) + '" class="st-crisis-tri"/>');
              }
              cardBody.push('<text x="25" y="' + lyRow.toFixed(1) + '" class="st-cal-crisis">' + esc(ln) + '</text>');
            });
            ry += ent.lines.length * 15;
          }
        });

        svg.push('<g class="' + grpCls + '" data-cal-for="' + cal.i + '" style="--ac:' + cal.actColor + '" transform="translate(' + colX + ',' + cal.y.toFixed(1) + ')">');
        svg.push('<a href="#' + cal.eid + '" class="st-cal" data-i="' + cal.i + '" aria-label="Details for ' + esc(cal.who + ', ' + cal.when) + '">');
        svg.push('<rect class="st-cal-bg" x="0" y="0" width="' + CARD_W + '" height="' + cal.h.toFixed(1) + '" rx="7"/>');
        svg.push('<rect class="st-cal-bar" x="' + barX + '" y="0" width="3.5" height="' + cal.h.toFixed(1) + '" rx="1.5"/>');
        svg.push('<text x="10" y="16" class="st-cal-hdr">' + esc(cal.who) + ' <tspan class="st-cal-when">· ' + esc(cal.when) + '</tspan></text>');
        svg.push(cardBody.join(''));
        svg.push('</a>');
        svg.push(invLinks.join(''));
        svg.push('</g>');
      });
      svg.push('</g>');
    }

    drawCalloutCol(leftCallouts, LEFT_X);
    drawCalloutCol(rightCallouts, RIGHT_X);

    svg.push('</svg>');
    return svg.join('');
  }

  function renderCompactTrail(allMode, selIdx) {
    return X.ACTS.map((act, ai) => {
      const indices = [];
      for (let i = act.i0; i <= act.i1; i++) {
        if (allMode || TOUR_SET.has(X.E[i].id)) indices.push(i);
      }
      const dirTxt = ai % 2 === 0 ? 'Flight ' + act.n + ' ↘' : 'Flight ' + act.n + ' ↙';
      const itemsHtml = indices.map(i => {
        const e = X.E[i], eid = e.id, st = X.STOP[eid];
        const cr = CRISIS_BY_ID[eid];
        const invs = X.INV.filter(u => u.i === i);
        const trade = TRADEOFFS[eid];
        const peak = PARALLEL_PEAKS[eid];
        const pl = window.SI && window.SI.plates ? window.SI.plates[eid] : null;
        const who = STEP_LABELS[eid] || (st ? st.who : X.titleOf(i));
        const isSel = i === selIdx;

        return '<li class="stc-item' + (cr ? ' is-crisis' : '') + (isSel ? ' is-sel' : '') + '">' +
          '<button type="button" class="stc-btn" data-i="' + i + '" aria-pressed="' + isSel + '">' +
          '<span class="stc-med">' + (pl && pl.file ? '<img src="' + esc(pl.file) + '" alt="" width="48" height="48" loading="lazy">' : X.glyph(st ? st.glyph : 'generic')) + '</span>' +
          '<span class="stc-main">' +
          '<span class="stc-top"><b>' + esc((i + 1) + '. ' + who) + '</b><span class="stc-when tnum">' + esc(fmtStepTime(e.t)) + '</span></span>' +
          '<span class="stc-hook">' + esc(X.hookOf(i)) + '</span>' +
          (peak ? '<span class="stc-peak">' + esc(peak) + '</span>' : '') +
          (cr ? '<span class="stc-crisis"><b>LOST' + (cr.species_lost ? ' (' + esc(cr.species_lost) + ')' : '') + ':</b> ' + esc(cr.lost) + '</span>' : '') +
          (!cr && invs.length ? '<span class="stc-tags">' + invs.slice(0, 3).map(u => '<span class="stc-plus" style="--pc:' + X.PK[u.part].color + '"><i>+</i>' + esc(u.label) + '</span>').join('') + '</span>' : '') +
          (!cr && trade ? '<span class="stc-minus"><i>−</i>' + esc(trade) + '</span>' : '') +
          '</span></button></li>';
      }).join('');

      return '<section class="stc-act" id="stc-act-' + act.n + '" style="--ac:' + act.color + '" aria-labelledby="stc-h-' + act.n + '">' +
        '<header class="stc-head"><span class="stc-dir">' + esc(dirTxt) + ' · ' + esc(ACT_SPANS_SHORT[act.n] || act.span) + '</span>' +
        '<h3 id="stc-h-' + act.n + '">Act ' + esc(act.n) + ' · ' + esc(act.name) + '</h3></header>' +
        '<ol class="stc-list" role="list">' + itemsHtml + '</ol></section>';
    }).join('');
  }

  function renderInspector(i) {
    const e = X.E[i], eid = e.id, a = X.actOf(i), st = X.STOP[eid];
    const cr = CRISIS_BY_ID[eid];
    const invs = X.INV.filter(u => u.i === i);
    const trade = TRADEOFFS[eid];
    const who = st ? st.who : X.titleOf(i);

    return '<div class="st-insp' + (cr ? ' is-crisis' : '') + '" style="--ac:' + a.color + '">' +
      '<div class="st-insp-media">' + X.plateArt(eid, st ? st.glyph : 'generic', who, false) + X.plateCredit(eid) + '</div>' +
      '<div class="st-insp-body">' +
      '<div class="st-insp-top"><span class="eyebrow">Stop ' + (i + 1) + ' of ' + X.STOPS.length + ' · Act ' + esc(a.n) + ' · ' + esc(X.fmtTime(e.t)) + '</span>' +
      (PARALLEL_PEAKS[eid] ? '<span class="chip">' + esc(PARALLEL_PEAKS[eid]) + '</span>' : '') +
      (cr ? '<span class="chip crisis">Planetary crisis</span>' : '') + '</div>' +
      '<h3>' + esc(who) + (st ? ' <span class="st-insp-tax">· <i>' + esc(st.taxon) + '</i></span>' : '') + '</h3>' +
      '<p class="st-insp-hook">' + esc(X.hookOf(i)) + '</p>' +
      (cr ? '<p class="st-insp-crisis"><b>What was lost:</b> ' + esc(cr.lost) + '</p>' : '') +
      (invs.length ? '<div class="new-list">' + invs.map(u => '<a class="part-chip" href="tree.html#' + u.id + '" style="--pc:' + X.PK[u.part].color + '">' + X.icon(u.part) + esc(u.label) + '</a>').join('') + '</div>' : '') +
      (trade ? '<p class="st-insp-trade"><span class="st-minus-pill">− Trade-off</span> ' + esc(trade) + '</p>' : '') +
      '<div class="st-insp-actions"><a class="btn sm st-go-stop" href="#' + esc(eid) + '" data-open-card="' + i + '">Open Stop ' + (i + 1) + ': ' + esc(who) + ' →</a>' +
      '<span class="st-insp-hint muted"><span class="v-ptr">Hover over</span><span class="v-touch">Tap</span> any circle below for its description &amp; link</span></div>' +
      '</div></div>';
  }

  function renderPopoverHtml(i, allMode) {
    const e = X.E[i], eid = e.id, a = X.actOf(i), st = X.STOP[eid];
    const cr = CRISIS_BY_ID[eid];
    const invs = X.INV.filter(u => u.i === i);
    const trade = TRADEOFFS[eid];
    const pl = window.SI && window.SI.plates ? window.SI.plates[eid] : null;
    const who = st ? st.who : X.titleOf(i);
    const pool = poolIndices(allMode);
    const pPos = pool.indexOf(i);
    const hasPrev = pPos > 0;
    const hasNext = pPos >= 0 && pPos < pool.length - 1;

    return '<div class="st-pop-inner' + (cr ? ' is-crisis' : '') + '" style="--ac:' + a.color + '">' +
      '<div class="st-pop-top">' +
      '<span class="eyebrow tnum">Stop ' + (i + 1) + ' of ' + X.STOPS.length + ' · Act ' + esc(a.n) + ' · ' + esc(X.fmtTime(e.t)) + '</span>' +
      '<button type="button" class="st-pop-x" data-close-pop aria-label="Close stop preview">×</button>' +
      '</div>' +
      '<div class="st-pop-who">' +
      '<span class="st-pop-med">' + (pl && pl.file ? '<img src="' + esc(pl.file) + '" alt="" width="48" height="48">' : X.glyph(st ? st.glyph : 'generic')) + '</span>' +
      '<div><h4>' + esc(who) + '</h4>' +
      (st ? '<p class="st-pop-tax"><i>' + esc(st.taxon) + '</i>' + (st.scale ? ' · ' + esc(st.scale) : '') + '</p>' : '') +
      '</div></div>' +
      '<p class="st-pop-hook">' + esc(X.hookOf(i)) + '</p>' +
      (cr ? '<p class="st-insp-crisis"><b>Lost:</b> ' + esc(cr.lost) + '</p>' : '') +
      (invs.length ? '<div class="new-list">' + invs.slice(0, 3).map(u => '<a class="part-chip" href="tree.html#' + u.id + '" style="--pc:' + X.PK[u.part].color + '">' + X.icon(u.part) + esc(u.label) + '</a>').join('') + '</div>' : '') +
      (trade ? '<p class="st-pop-trade"><span class="st-minus-pill">− Trade-off</span> ' + esc(trade) + '</p>' : '') +
      '<div class="st-pop-foot">' +
      '<a class="btn sm st-go-stop" href="#' + esc(eid) + '" data-open-card="' + i + '">Open Stop ' + (i + 1) + ': ' + esc(who) + ' →</a>' +
      '<div class="st-pop-nav">' +
      '<button type="button" class="btn sm ghost" data-pop-step="-1" data-cur="' + i + '"' + (hasPrev ? '' : ' disabled') + ' aria-label="Earlier stop on staircase">←</button>' +
      '<button type="button" class="btn sm ghost" data-pop-step="1" data-cur="' + i + '"' + (hasNext ? '' : ' disabled') + ' aria-label="Next stop on staircase">→</button>' +
      '</div></div></div>';
  }

  function renderKeyLegend() {
    const partPills = X.ORDER.map(k => {
      const p = X.PK[k];
      return '<a class="st-part-pill" href="tree.html#lane-' + esc(k) + '" style="--pc:' + p.color + '" data-tip="' + esc(p.name + ': ' + p.question + ' — click to see all upgrades in the Tree') + '"><i aria-hidden="true"></i>' + esc(p.short || p.name) + '</a>';
    }).join('');
    return '<div class="st-legend-wrap">' +
      '<div class="st-legend">' +
      '<span class="st-leg-item"><i class="st-sym-plus" aria-hidden="true">+</i><span><b>Upgraded part</b> (<span class="v-ptr">click</span><span class="v-touch">tap</span> any + line to open in the Tree)</span></span>' +
      '<span class="st-leg-item"><i class="st-sym-minus" aria-hidden="true">−</i><span><b>Trade-off or offload</b> (trait shed or externalized)</span></span>' +
      '<span class="st-leg-item"><i class="st-sym-crisis" aria-hidden="true"></i><span><b>Planetary crisis</b> (glaciation or mass extinction)</span></span>' +
      '<span class="st-leg-item"><i class="st-sym-peak" aria-hidden="true"></i><span><b>Parallel branch peak</b> (non-human frontier)</span></span>' +
      '</div>' +
      '<div class="st-parts-bar" role="group" aria-label="Ten functional parts in the Tree">' + partPills + '</div>' +
      '</div>';
  }

  function renderFinaleTerrace() {
    const iNow = X.N - 1;
    const nCells = X.numBtn ? X.numBtn('total_cells', '~3.1×10³⁰', iNow) : '~3.1×10³⁰';
    const nBio = X.numBtn ? X.numBtn('c_biochem_ops_sec', '~2.8×10³³', iNow) : '~2.8×10³³';
    const nDig = X.numBtn ? X.numBtn('c_digital_ops_sec', '~1.9×10²² ops/s', iNow) : '~1.9×10²² ops/s';
    const nNeu = X.numBtn ? X.numBtn('c_neural_ops_sec', '~3×10²⁶ signals/s', iNow) : '~3×10²⁶ signals/s';
    const nExo = X.numBtn ? X.numBtn('m_exo_installed_bits', '15 zettabytes', iNow) : '15 zettabytes';
    const nGrp = X.numBtn ? X.numBtn('max_collective_group_size', '8.1 billion', iNow) : '8.1 billion';

    return '<div class="st-finale">' +
      '<span class="eyebrow">Earth today (2026 CE) · Planetary reality check</span>' +
      '<h3>Every new floor arrived faster—and none of the older floors went away</h3>' +
      '<div class="st-fin-grid">' +
      '<div class="st-fin-card" style="--fc:var(--act-2)"><b class="tnum">97%</b><h4>Most living cells are still bacteria</h4><p>Earth holds ' + nCells + ' living cells running ' + nBio + ' chemical reactions a second. The typical cell is still a microbe.</p><a class="st-fin-link" href="how.html#test">Test today’s cell numbers →</a></div>' +
      '<div class="st-fin-card" style="--fc:var(--s-neuro)"><b class="tnum">0.006%</b><h4>Silicon is tiny next to animal nerves</h4><p>All world chips (' + nDig + ') run a tiny fraction of animal nervous systems (' + nNeu + ', mostly in insects and worms).</p><a class="st-fin-link" href="index.html#thread=neural">When do chips catch animal nerves? →</a></div>' +
      '<div class="st-fin-card" style="--fc:var(--s-silicon)"><b class="tnum">1 light-day</b><h4>Memory &amp; senses reach past Earth</h4><p>' + nExo + ' of external archives, ' + nGrp + ' people and ~17,500 spacecraft extend sensing 25.9 billion km to Voyager 1.</p><a class="st-fin-link" href="data.html#offworld2026">Inspect the 2026 space inventory →</a></div>' +
      '</div></div>';
  }

  function renderDock(i) {
    const e = X.E[i], eid = e.id, a = X.actOf(i), st = X.STOP[eid];
    const pl = window.SI && window.SI.plates ? window.SI.plates[eid] : null;
    const who = st ? st.who : X.titleOf(i);
    return '<div class="st-dock-inner" style="--ac:' + a.color + '">' +
      '<span class="st-dock-med">' + (pl && pl.file ? '<img src="' + esc(pl.file) + '" alt="" width="38" height="38">' : X.glyph(st ? st.glyph : 'generic')) + '</span>' +
      '<div class="st-dock-txt"><b>Stop ' + (i + 1) + ': ' + esc(who) + '</b> <span class="tnum muted">· ' + esc(fmtStepTime(e.t)) + '</span>' +
      '<p>' + esc(X.hookOf(i)) + '</p></div>' +
      '<a class="btn sm st-go-stop" href="#' + esc(eid) + '" data-open-card="' + i + '">Open stop →</a>' +
      '</div>';
  }

  function openPopover(container, selIdx, allMode, pinned) {
    const pop = container && container.querySelector('#stairsPop');
    const fig = container && container.querySelector('.stairs-fig');
    const coords = container && container._stepCoords && container._stepCoords[selIdx];
    if (!pop || !fig || !coords || fig.offsetParent === null) return;

    clearTimeout(container._stHideT);
    clearTimeout(container._stOpenT);
    container._popIdx = selIdx;
    if (pinned) container._popPinned = true;

    pop.innerHTML = renderPopoverHtml(selIdx, Boolean(allMode));
    pop.hidden = false;
    container.classList.add('pop-open');

    const figW = fig.clientWidth || 1000;
    const figH = fig.clientHeight || 2000;
    const popW = Math.min(340, figW - 24);
    const popH = pop.offsetHeight || 230;

    const stepPxX = coords.x * figW;
    const stepPxY = coords.y * figH;
    const medR = Math.max(18, (coords.rRatio || 0.02) * figW);

    let leftPx = coords.x < 0.5
      ? Math.min(figW - popW - 14, stepPxX + medR + 10)
      : Math.max(14, stepPxX - medR - popW - 10);
    leftPx = Math.max(12, Math.min(figW - popW - 12, leftPx));

    const topPx = Math.max(12, Math.min(Math.max(12, figH - popH - 12), stepPxY - popH * 0.38));

    pop.style.left = leftPx.toFixed(0) + 'px';
    pop.style.top = topPx.toFixed(0) + 'px';
  }

  function closePopover(container) {
    if (!container) return;
    clearTimeout(container._stHideT);
    clearTimeout(container._stOpenT);
    container._popPinned = false;
    container._popIdx = -1;
    const pop = container.querySelector('#stairsPop');
    if (pop) pop.hidden = true;
    container.classList.remove('pop-open');
  }

  // WCAG 1.4.13 Hoverable, Persistent & Dismissible stop-circle hovercard + synchronized highlight
  function bindHoverSync(container) {
    if (container._stHoverBound) return;
    container._stHoverBound = true;
    let hovIdx = -1;

    const setHov = idx => {
      if (idx === hovIdx) return;
      if (hovIdx >= 0) {
        container.querySelectorAll('[data-step="' + hovIdx + '"], .st-hit[data-i="' + hovIdx + '"], [data-for="' + hovIdx + '"], [data-cal-for="' + hovIdx + '"]').forEach(n => n.classList.remove('is-hov'));
      }
      hovIdx = idx;
      if (hovIdx >= 0) {
        container.querySelectorAll('[data-step="' + hovIdx + '"], .st-hit[data-i="' + hovIdx + '"], [data-for="' + hovIdx + '"], [data-cal-for="' + hovIdx + '"]').forEach(n => n.classList.add('is-hov'));
      }
    };

    const scheduleClose = () => {
      clearTimeout(container._stOpenT);
      if (container._popPinned) return;
      clearTimeout(container._stHideT);
      container._stHideT = setTimeout(() => {
        if (!container._popPinned) {
          closePopover(container);
          setHov(-1);
        }
      }, 220);
    };

    container.addEventListener('pointerover', ev => {
      if (ev.pointerType === 'touch') return;
      const target = ev.target;
      if (!target || !target.closest) return;

      // Hovering inside the open hovercard keeps it open so the user can read and click the stop link
      if (target.closest('#stairsPop')) {
        clearTimeout(container._stHideT);
        clearTimeout(container._stOpenT);
        if (container._popIdx >= 0) setHov(container._popIdx);
        return;
      }

      // Hovering over a stop circle / 3D step triggers the hovercard with brief description + link
      const circleHit = target.closest('.st-hit[data-i], .st-step-prism[data-step]');
      if (circleHit) {
        const idx = circleHit.hasAttribute('data-step')
          ? Number(circleHit.getAttribute('data-step'))
          : Number(circleHit.getAttribute('data-i'));
        clearTimeout(container._stHideT);
        setHov(idx);
        if (!container._popPinned) {
          const pop = container.querySelector('#stairsPop');
          const alreadyOpen = pop && !pop.hidden;
          if (alreadyOpen && container._popIdx === idx) return;
          clearTimeout(container._stOpenT);
          container._stOpenT = setTimeout(() => {
            openPopover(container, idx, container._allMode, false);
          }, alreadyOpen ? 0 : 75);
        }
        return;
      }

      // Hovering over a margin callout card highlights its leader & step without stealing the circle hovercard
      const calGrp = target.closest('.st-cal-grp[data-cal-for]');
      if (calGrp) {
        clearTimeout(container._stOpenT);
        setHov(Number(calGrp.getAttribute('data-cal-for')));
        if (!container._popPinned) scheduleClose();
        return;
      }

      scheduleClose();
    });

    container.addEventListener('pointerleave', () => {
      clearTimeout(container._stOpenT);
      if (!container._popPinned) scheduleClose();
      else setHov(-1);
    });

    container.addEventListener('focusin', ev => {
      const target = ev.target;
      if (!target || !target.closest) return;
      if (target.closest('#stairsPop')) {
        clearTimeout(container._stHideT);
        return;
      }
      const hit = target.closest('.st-hit[data-i]');
      if (hit && hit.matches(':focus-visible')) {
        const idx = Number(hit.getAttribute('data-i'));
        setHov(idx);
        openPopover(container, idx, container._allMode, false);
      }
    });

    container.addEventListener('focusout', ev => {
      const next = ev.relatedTarget;
      if (next && next.closest && (next.closest('#stairsPop') || next.closest('.st-hit[data-i]'))) return;
      if (!container._popPinned) scheduleClose();
    });
  }

  let dockIO = null;

  window.SI_STAIRS = {
    TOUR_COUNT: TOUR_SET.size,
    hasLandmark: id => TOUR_SET.has(id),
    poolIndices,
    render(container, opts) {
      const allMode = (opts && opts.all !== undefined) ? Boolean(opts.all) : true;
      const selIdx = (opts && typeof opts.cur === 'number') ? opts.cur : 0;
      if (dockIO) { dockIO.disconnect(); dockIO = null; }
      const stepCoords = {};
      container._stepCoords = stepCoords;
      container._allMode = allMode;
      container._popPinned = false;
      container._popIdx = -1;
      container.classList.remove('pop-open');

      const shownDesc = allMode ? X.STOPS.length + ' stops' : X.TOUR.length + ' key milestones';

      container.innerHTML =
        '<div class="st-head">' +
        '<div class="st-head-top">' +
        '<div><span class="eyebrow">The Journey Panorama · ' + X.ACTS.length + ' acts · ' + shownDesc + '</span>' +
        '<h2 id="stairsH">Thinking Matter: walk all ' + X.STOPS.length + ' stops on one staircase</h2>' +
        '<p class="muted"><span class="v-ptr">Hold your pointer over</span><span class="v-touch">Tap</span> any circle for a brief description and a link to open that stop. Equal-sized steps show order of arrival, not equal time spans or species rank.</p></div>' +
        '<div class="st-head-tools">' +
        '<div class="seg" role="group" aria-label="Staircase step density">' +
        '<button type="button" data-st-density="all" aria-pressed="' + allMode + '">All ' + X.STOPS.length + ' stops</button>' +
        '<button type="button" data-st-density="tour" aria-pressed="' + (!allMode) + '">Key milestones (' + X.TOUR.length + ')</button>' +
        '</div>' +
        '<a class="btn sm ghost" href="assets/thinking-matter-staircase.svg" target="_blank" rel="noopener">Clickable poster (SVG) ↗</a>' +
        '</div></div>' +
        renderKeyLegend() +
        '</div>' +
        '<div id="stairsInspect" aria-live="polite">' + renderInspector(selIdx) + '</div>' +
        '<div class="stairs-stage">' +
        '<figure class="stairs-fig">' +
        renderSvgStaircase(allMode, selIdx, stepCoords) +
        '<div class="st-pop" id="stairsPop" hidden role="region" aria-label="Stop preview"></div>' +
        '<figcaption class="stairs-cap"><p class="time-key" data-time-key=""></p></figcaption>' +
        '</figure>' +
        '<div class="stairs-compact">' + renderCompactTrail(allMode, selIdx) + '</div>' +
        '</div>' +
        renderFinaleTerrace() +
        '<div class="st-dock" id="stairsDock" hidden>' + renderDock(selIdx) + '</div>';

      if (X.timeKeys) X.timeKeys();
      bindHoverSync(container);

      const inspEl = container.querySelector('#stairsInspect');
      const dockEl = container.querySelector('#stairsDock');
      const stageEl = container.querySelector('.stairs-stage');
      if ('IntersectionObserver' in window && inspEl && dockEl && stageEl) {
        let inspSeenAbove = false, stageVisible = false;
        const syncDock = () => {
          const show = inspSeenAbove && stageVisible;
          dockEl.hidden = !show;
          document.documentElement.classList.toggle('has-st-dock', show);
        };
        dockIO = new IntersectionObserver(entries => {
          entries.forEach(ent => {
            if (ent.target === inspEl) {
              inspSeenAbove = !ent.isIntersecting && ent.boundingClientRect.bottom < 0;
            } else if (ent.target === stageEl) {
              stageVisible = ent.isIntersecting;
            }
          });
          syncDock();
        }, { threshold: 0 });
        dockIO.observe(inspEl);
        dockIO.observe(stageEl);
      }
    },
    updateSelection(container, selIdx) {
      const insp = container.querySelector('#stairsInspect');
      if (insp) insp.innerHTML = renderInspector(selIdx);
      const dock = container.querySelector('#stairsDock');
      if (dock) dock.innerHTML = renderDock(selIdx);
      container.querySelectorAll('.st-step-prism').forEach(el => {
        el.classList.toggle('is-sel', Number(el.dataset.step) === selIdx);
      });
      container.querySelectorAll('.st-hit').forEach(el => {
        const on = Number(el.dataset.i) === selIdx;
        el.classList.toggle('is-sel', on);
        const lift = el.querySelector('.st-med-lift') || el.querySelector('.st-med');
        if (lift) {
          let ring = lift.querySelector('.st-sel-ring');
          if (on && !ring) {
            ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            ring.setAttribute('cx', '0');
            ring.setAttribute('cy', '0');
            ring.setAttribute('r', '25');
            ring.setAttribute('class', 'st-sel-ring');
            lift.insertBefore(ring, lift.firstChild);
          } else if (!on && ring) {
            ring.remove();
          }
        }
      });
      container.querySelectorAll('.st-cal-grp').forEach(el => {
        el.classList.toggle('is-sel', Number(el.dataset.calFor) === selIdx);
      });
      container.querySelectorAll('.st-leader').forEach(el => {
        el.classList.toggle('is-sel', Number(el.dataset.for) === selIdx);
      });
      container.querySelectorAll('.stc-item').forEach(li => {
        const btn = li.querySelector('.stc-btn');
        const on = btn && Number(btn.dataset.i) === selIdx;
        li.classList.toggle('is-sel', Boolean(on));
        if (btn) btn.setAttribute('aria-pressed', String(Boolean(on)));
      });
    },
    openPopover(container, selIdx, allMode, pinned) {
      openPopover(container, selIdx, allMode, pinned !== false);
    },
    closePopover,
    scrollToAct(container, actN) {
      const svgTarget = container.querySelector('#st-act-' + actN);
      const compTarget = container.querySelector('#stc-act-' + actN);
      const target = (compTarget && compTarget.offsetParent !== null) ? compTarget : svgTarget;
      if (target) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }
  };
})();
