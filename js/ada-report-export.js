// ── Ada County report → single-page printable PDF ────────────────────────────
// Builds a self-contained light-theme document sized to ONE letter-landscape
// sheet and hands it to the browser's print dialog ("Save as PDF"). No library:
// the dashboard has no build step, and a print stylesheet gives exact control
// over pagination, which a canvas-rasterising exporter does not — the tables
// stay selectable text rather than becoming a bitmap.
//
// Everything is laid out in two columns on one sheet. The density that buys is
// the whole point of the format: this is a one-sheet market summary, not a
// report to page through. Compaction moves that made it fit:
//   · the three summary blocks are one table with group rows, not three tables
//     with three repeated headers (saves ~60px and reads better);
//   · the "sold by area" bar chart is folded into the area table as an inline
//     distribution column, so the visual costs no vertical space;
//   · the trend chart's bars are dodged rather than overlaid, and the active-
//     listings line gets its own band at the top so its labels never land on a bar.

// The 3-bar mark, inlined rather than <img src="images/intel-mark.svg"> so the
// popup does not have to resolve a relative URL before printing.
const AR_PDF_MARK = `
<svg width="428" height="1265" viewBox="0 0 428 1265" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="368.966" y1="220.055" x2="368.966" y2="1264.77" stroke="url(#q0)" stroke-width="87.182"/>
<line x1="205.532" y1="478.68" x2="205.532" y2="1264.77" stroke="url(#q1)" stroke-width="87.182"/>
<line x1="43.591" y1="772.18" x2="43.591" y2="1264.77" stroke="url(#q2)" stroke-width="87.182"/>
<circle cx="372.881" cy="55.1195" r="55.1195" fill="url(#q3)"/>
<defs>
<linearGradient id="q0" x1="324.875" y1="220.055" x2="324.875" y2="1264.77" gradientUnits="userSpaceOnUse">
<stop stop-color="#007BFF"/><stop offset="1" stop-color="#99CAFF"/></linearGradient>
<linearGradient id="q1" x1="161.441" y1="478.68" x2="161.441" y2="1264.77" gradientUnits="userSpaceOnUse">
<stop stop-color="#007BFF"/><stop offset="1" stop-color="#99CAFF"/></linearGradient>
<linearGradient id="q2" x1="-0.5" y1="772.18" x2="-0.499983" y2="1264.77" gradientUnits="userSpaceOnUse">
<stop stop-color="#007BFF"/><stop offset="1" stop-color="#99CAFF"/></linearGradient>
<linearGradient id="q3" x1="399.615" y1="35.8743" x2="396.741" y2="110.633" gradientUnits="userSpaceOnUse">
<stop stop-color="#007BFF"/><stop offset="1" stop-color="#99CAFF"/></linearGradient>
</defs></svg>`;

const AR_PDF_WITHHELD =
  '<span class="wh" title="Base period is a ~4% sample">wthld</span>';

// Print palette is the same six hexes; only the surface changes (dark → paper).
const AR_PDF_CSS = `
 @page { size: letter landscape; margin: .3in; }
 * { box-sizing: border-box; }
 html, body { margin:0; padding:0; }
 body { font-family: Arial, Helvetica, sans-serif; color:#1a1a1a; font-size:7px;
   -webkit-print-color-adjust: exact; print-color-adjust: exact; }
 /* One sheet, explicitly. 8.5in tall less .3in margins, less a hair for the
    rounding browsers do on the last line box. */
 .sheet { width:10.4in; height:7.82in; padding:0; overflow:hidden; }
 h1 { font-size:25px; font-weight:400; text-align:right; margin:0; letter-spacing:-.5px; }
 h2 { color:#007bff; font-size:9.4px; margin:0 0 2px; text-transform:uppercase;
   letter-spacing:.045em; }
 h2 .n { color:#666; text-transform:none; letter-spacing:0; font-weight:normal; }
 .sub { font-size:10px; font-weight:bold; }
 .meta { font-size:8px; color:#333; }
 .scope { display:inline-block; margin-left:7px; padding:0 6px; border-radius:8px;
   background:#007bff; color:#fff; font-size:7px; font-weight:bold; }
 .topbar { display:flex; align-items:center; justify-content:space-between;
   border-bottom:1px solid #d5d5d5; padding-bottom:4px; margin-bottom:6px; }
 .titles { text-align:center; }
 .brand { display:flex; align-items:center; gap:8px; }
 .brand svg { height:27px; width:auto; display:block; }
 .brand-words { display:flex; flex-direction:column; line-height:1; }
 .brand-market { font-size:14px; font-weight:300; color:#111; }
 .brand-research { font-size:14px; font-weight:300; color:#007bff; }
 .brand-sub { font-size:5px; letter-spacing:.14em; text-transform:uppercase;
   color:#555; margin-top:3px; font-family:Georgia,serif; }
 .accentbar { display:flex; gap:2px; margin-top:3px; justify-content:flex-end; }
 .accentbar i { width:16px; height:3px; border-radius:1px; display:block; }

 .cols { display:flex; gap:11px; align-items:flex-start; }
 .c1 { width:47.5%; } .c2 { flex:1; min-width:0; }
 .blk { margin-bottom:6px; }

 table { border-collapse:collapse; width:100%; font-size:7.2px; table-layout:fixed; }
 th, td { border:.5px solid #c4c4c4; padding:1.4px 2px; text-align:center;
   overflow:hidden; white-space:nowrap; }
 thead th { background:#f2f6fa; font-weight:bold; font-size:6.5px; line-height:1.1;
   white-space:normal; color:#33475b; }
 td.lab, th.lab { text-align:left; }
 tr.alt td { background:#f4f4f4; }
 tr.tot td { font-weight:bold; background:#e8eef4; }
 tr.grp td { background:#007bff; color:#fff; font-weight:bold; text-align:left;
   letter-spacing:.04em; font-size:7px; }
 .up { color:#00875a; } .dn { color:#c0392b; }
 .wh { color:#8a6d00; font-style:italic; }
 .flag { color:#c78a00; }
 .suspect { color:#a6791a; }

 /* inline distribution bar inside the area table */
 td.bar { padding:0 3px; }
 .barwrap { display:flex; align-items:center; height:5px; }
 .barwrap i { display:block; height:5px; border-radius:1px; }

 .legend { font-size:6.9px; margin:0 0 2px; }
 .legend span { margin-right:9px; }
 .sw { display:inline-block; width:8px; height:6px; vertical-align:-.5px; margin-right:2px; }
 svg text.ax { font-size:5.2px; text-anchor:middle; fill:#555; }
 svg text.bv { font-size:5.2px; text-anchor:middle; fill:#333; }
 svg text.pl { font-size:5.2px; text-anchor:middle; fill:#333; }

 .crit { font-size:7px; line-height:1.45; border:.5px solid #d5d5d5;
   border-left:2px solid #007bff; padding:3px 5px; }
 .crit b { color:#007bff; }
 .warn { border:.5px solid #f0dcae; border-left:2px solid #ffb30f; background:#fffaf0;
   padding:4px 6px; font-size:7px; line-height:1.45; }
 .note { font-size:6.3px; color:#555; line-height:1.4; margin-top:5px;
   border-top:1px solid #d5d5d5; padding-top:3px; }
 .note b { color:#333; }
 .duo { display:flex; gap:7px; margin-bottom:6px; }
 .duo > * { flex:1; }
`;

// ── small formatters (print copies — the dashboard ones emit — for null) ──────
const arpMoney = v => v == null ? '&ndash;' : '$' + Math.round(v).toLocaleString();
const arpNum   = v => v == null ? '&ndash;' : Math.round(v).toLocaleString();
const arpPct   = v => v == null ? '&ndash;' : v.toFixed(1) + '%';
const arpK     = v => v == null ? '&ndash;' : Math.round(v / 1000).toLocaleString() + 'K';
const arpVol   = v => {
  if (v == null) return '&ndash;';
  if (Math.abs(v) >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  return '$' + Math.round(v).toLocaleString();
};

// Which summary blocks appear for a given scope. Total always stays: it is the
// county line every segment is measured against.
function arPdfKeys(scope) {
  if (scope === 'new')      return ['total', 'new'];
  if (scope === 'existing') return ['total', 'existing'];
  return ['total', 'existing', 'new'];
}

const AR_PDF_SCOPE_LABEL = {
  all: 'All Product', new: 'New Construction', existing: 'Existing Homes'
};

// ── summary: one table, three group bands ────────────────────────────────────
// The group row names the segment, so the row labels drop the segment prefix
// they used to repeat ("Existing Homes Sold" → "Homes Sold"). That keeps the
// label column narrow enough that nothing wraps.
function arPdfSummaryRows(key) {
  const t = ADA_REPORT.summary[key];
  const title = { total: 'Total Market', existing: 'Existing Homes',
                  new: 'Newly Constructed Homes' }[key];
  const strip = s => s
    .replace(/^Total Single-Family\s*/i, '')
    .replace(/^Newly Constructed\s*/i, '')
    .replace(/^Existing\s*/i, '')
    .replace(/Residential Listings/i, 'Listings')
    .replace(/^Homes Sold$/i, 'Homes Sold')
    .replace(/Dollar Volume/i, 'Dollar Volume');

  const rows = t.rows.map((r, i) => {
    const isPrice = /price|volume/i.test(r.label);
    const isVol = /volume/i.test(r.label);
    const isDom = /days on market/i.test(r.label);
    const fmt = v => v == null ? '&ndash;'
      : isVol ? arpVol(v) : isPrice ? arpMoney(v) : isDom ? Math.round(v) : arpNum(v);

    // 949 of 991 Jul-25 closings have no close price, so the 2025 price and
    // volume base is a ~4% sample. Counts survive; prices are withheld.
    const cells = r.vals.map((v, j) =>
      `<td>${isPrice && (j === 2 || j === 3) ? AR_PDF_WITHHELD : fmt(v)}</td>`).join('');

    const chg = n => {
      if (isPrice) return AR_PDF_WITHHELD;
      if (n == null) return '&ndash;';
      return `<span class="${n >= 0 ? 'up' : 'dn'}">${n >= 0 ? '+' : ''}${n.toFixed(1)}%</span>`;
    };
    const p = r.pct || [null, null];
    return `<tr${i % 2 ? ' class="alt"' : ''}><td class="lab">${strip(r.label)}</td>${cells}
      <td>${chg(p[0])}</td><td>${chg(p[1])}</td></tr>`;
  }).join('');

  return `<tr class="grp"><td colspan="8">${title}</td></tr>${rows}`;
}

function arPdfSummary(scope) {
  const hdr = ADA_REPORT.summary.total.header.map(h => `<th>${h}</th>`).join('');
  return `<div class="blk"><h2>Market Summary</h2>
    <table><colgroup><col style="width:23%">
      ${'<col>'.repeat(5)}<col style="width:8%"><col style="width:8%"></colgroup>
    <thead><tr><th class="lab">Metric</th>${hdr}
      <th>% Chg Jul</th><th>% Chg YTD</th></tr></thead>
    <tbody>${arPdfKeys(scope).map(arPdfSummaryRows).join('')}</tbody></table></div>`;
}

// ── area table, with the "sold by area" bars folded in as a column ───────────
function arPdfAreaTable(scope) {
  const T = ADA_REPORT.areaTotals;
  const seg = a => scope === 'new' ? a.new : scope === 'existing' ? a.existing : a.total;
  // Sort by the metric actually being drawn — sorting by total under a segment
  // scope produces bars that look ordered but aren't.
  const areas = ADA_REPORT.areas.slice().sort((a, b) => seg(b).sold - seg(a).sold);
  const flagged = { '1000': 1, '1010': 1, '0100': 1 };
  const mx = Math.max(...areas.map(a => seg(a).sold), 1);

  const bar = a => {
    if (scope !== 'all') {
      const c = scope === 'new' ? '#007bff' : '#607d8b';
      return `<div class="barwrap"><i style="width:${(seg(a).sold / mx * 100).toFixed(1)}%;background:${c}"></i></div>`;
    }
    // 2px surface gap between the two adjacent fills
    const wn = a.new.sold / mx * 100, we = a.existing.sold / mx * 100;
    return `<div class="barwrap">
      <i style="width:${wn.toFixed(1)}%;background:#007bff"></i>
      <i style="width:${we.toFixed(1)}%;background:#607d8b;margin-left:2px"></i></div>`;
  };

  const head = scope === 'all'
    ? `<th class="lab">IMLS Area</th><th>Distribution</th><th>Sold</th><th>% of<br>Sales</th>
       <th>Avg Price</th><th>Median</th><th>New<br>Sold</th><th>New<br>Avg</th>
       <th>Exist<br>Sold</th><th>Exist<br>Avg</th>`
    : `<th class="lab">IMLS Area</th><th>Distribution</th><th>Sold</th><th>% of<br>Segment</th>
       <th>Avg Price</th><th>Median</th><th>All<br>Product</th><th>Share of<br>Area</th>`;

  const rows = areas.map((a, i) => {
    const f = flagged[a.code] ? ' <span class="flag">&#9873;</span>' : '';
    const sc = flagged[a.code] ? ' class="suspect"' : '';
    const s = seg(a);
    const body = scope === 'all'
      ? `<td>${a.total.sold}</td><td>${arpPct(a.total.pct)}</td>
         <td${sc}>${arpMoney(a.total.avg)}</td><td${sc}>${arpMoney(a.total.med)}</td>
         <td>${a.new.sold}</td><td${sc}>${arpMoney(a.new.avg)}</td>
         <td>${a.existing.sold}</td><td${sc}>${arpMoney(a.existing.avg)}</td>`
      : `<td>${s.sold}</td><td>${arpPct(s.pct)}</td>
         <td${sc}>${arpMoney(s.avg)}</td><td${sc}>${arpMoney(s.med)}</td>
         <td>${a.total.sold}</td>
         <td>${a.total.sold ? arpPct(s.sold / a.total.sold * 100) : '&ndash;'}</td>`;
    return `<tr${i % 2 ? ' class="alt"' : ''}>
      <td class="lab">${a.code} &middot; ${a.name}${f}</td>
      <td class="bar">${bar(a)}</td>${body}</tr>`;
  }).join('');

  const t = scope === 'new' ? T.new : scope === 'existing' ? T.existing : T.total;
  const foot = scope === 'all'
    ? `<td>${arpNum(T.total.sold)}</td><td>100.0%</td><td>${arpMoney(T.total.avg)}</td><td>&ndash;</td>
       <td>${arpNum(T.new.sold)}</td><td>${arpMoney(T.new.avg)}</td>
       <td>${arpNum(T.existing.sold)}</td><td>${arpMoney(T.existing.avg)}</td>`
    : `<td>${arpNum(t.sold)}</td><td>100.0%</td><td>${arpMoney(t.avg)}</td><td>&ndash;</td>
       <td>${arpNum(T.total.sold)}</td>
       <td>${arpPct(t.sold / T.total.sold * 100)}</td>`;

  const legend = scope === 'all'
    ? `<span><i class="sw" style="background:#007bff"></i>New Construction</span>
       <span><i class="sw" style="background:#607d8b"></i>Existing</span>`
    : `<span><i class="sw" style="background:${scope === 'new' ? '#007bff' : '#607d8b'}"></i>${AR_PDF_SCOPE_LABEL[scope]}</span>`;

  return `<div class="blk">
    <h2>Homes Sold by Area <span class="n">&mdash; ${ADA_REPORT.period}</span></h2>
    <div class="legend">${legend}</div>
    <table><colgroup><col style="width:21%"><col style="width:13%">${'<col>'.repeat(scope === 'all' ? 8 : 6)}</colgroup>
    <thead><tr>${head}</tr></thead><tbody>${rows}</tbody>
    <tfoot><tr class="tot"><td class="lab">All areas</td><td></td>${foot}</tr></tfoot></table></div>`;
}

// ── price-class table ────────────────────────────────────────────────────────
function arPdfPriceClass(scope) {
  const J = ADA_REPORT.priceClassJul, Y = ADA_REPORT.priceClassYtd;
  const showNew = scope !== 'existing', showEx = scope !== 'new';
  const span = (showNew ? 2 : 0) + (showEx ? 2 : 0);

  // Drop a class only when it is empty in the segments actually shown — under a
  // scoped view an all-dash row is dead space, not information.
  const any = r => (showNew ? r.new : 0) + (showEx ? r.ex : 0);
  const rows = J.map((j, i) => {
    const y = Y[i];
    if (!(any(j) || any(y))) return '';
    const seg = (r, k) => (k === 'new'
      ? `<td>${r.new || '&ndash;'}</td><td>${r.new ? arpPct(r.newPct) : '&ndash;'}</td>`
      : `<td>${r.ex || '&ndash;'}</td><td>${r.ex ? arpPct(r.exPct) : '&ndash;'}</td>`);
    const cells = [j, y].map(r =>
      (showNew ? seg(r, 'new') : '') + (showEx ? seg(r, 'ex') : '')).join('');
    return `<tr><td class="lab">${j.range}</td>${cells}</tr>`;
  }).filter(Boolean)
    .map((r, i) => i % 2 ? r.replace('<tr>', '<tr class="alt">') : r).join('');

  const subhead = (showNew ? '<th>New</th><th>%</th>' : '') +
                  (showEx ? '<th>Existing</th><th>%</th>' : '');
  return `<div class="blk"><h2>Sold by Price Class</h2>
    <table><colgroup><col style="width:24%">${'<col>'.repeat(span * 2)}</colgroup><thead>
      <tr><th class="lab" rowspan="2">Price Class</th>
        <th colspan="${span}">${ADA_REPORT.period}</th>
        <th colspan="${span}">Year to Date 2026</th></tr>
      <tr>${subhead}${subhead}</tr>
    </thead><tbody>${rows}</tbody></table></div>`;
}

// ── new-construction tier table (new-construction data only) ─────────────────
function arPdfNcTable() {
  const rows = ADA_REPORT.ncTiers.map((r, i) => `
    <tr${i % 2 ? ' class="alt"' : ''}><td class="lab">${r.tier}</td>
      <td>${r.active || '&ndash;'}</td><td>${r.pending || '&ndash;'}</td><td>${r.sold || '&ndash;'}</td>
      <td>${r.moi == null ? '&ndash;' : r.moi.toFixed(1)}</td>
      <td>${arpK(r.orig)}</td><td>${arpK(r.soldPrice)}</td>
      <td>${r.ratio == null ? '&ndash;' : (r.ratio * 100).toFixed(1) + '%'}</td>
      <td>${arpNum(r.sqft)}</td><td>${r.psf == null ? '&ndash;' : '$' + r.psf.toFixed(0)}</td>
      <td>${arpNum(r.cdom)}</td></tr>`).join('');

  const T = ADA_REPORT.ncTotals;
  return `<div class="blk">
    <h2>New Construction Market Dynamics <span class="n">&mdash; trailing 12 months, Aug 1 2025 &ndash; Jul 31 2026</span></h2>
    <table><colgroup><col style="width:13%">${'<col>'.repeat(10)}</colgroup><thead>
      <tr><th class="lab" rowspan="2">Price Tier</th><th colspan="2">Current</th>
        <th>12 Mths</th><th rowspan="2">Mos.<br>Inv.</th>
        <th colspan="6">Average based on 12-month solds</th></tr>
      <tr><th>Active</th><th>Pending</th><th>Sold</th><th>Orig<br>Price</th><th>Sold<br>Price</th>
        <th>SP/OP</th><th>Avg<br>SqFt</th><th>$/SqFt</th><th>CDOM</th></tr>
    </thead><tbody>${rows}</tbody>
    <tfoot>
      <tr class="tot"><td class="lab">Total</td>
        <td>${arpNum(T.active)}</td><td>${arpNum(T.pending)}</td><td>${arpNum(T.sold)}</td>
        <td>${T.moi == null ? '&ndash;' : T.moi.toFixed(1)}</td><td colspan="6"></td></tr>
      <tr class="tot"><td class="lab">Average</td>
        <td>${arpK(T.avgActive)}</td><td>${arpK(T.avgPending)}</td>
        <td>${arpK(T.soldPrice)}</td><td>&ndash;</td>
        <td>${arpK(T.orig)}</td><td>${arpK(T.soldPrice)}</td>
        <td>${(T.ratio * 100).toFixed(1)}%</td><td>${arpNum(T.sqft)}</td>
        <td>$${T.psf.toFixed(0)}</td><td>${arpNum(T.cdom)}</td></tr>
    </tfoot></table></div>`;
}

// ── 13-month trend ───────────────────────────────────────────────────────────
// Closed and pending are dodged, not overlaid: an overlay only shows the part
// of pending that exceeds closed, which reads as a smaller number than it is.
// Active listings keep their own band across the top of the plot so the line
// and its labels never cross a bar.
function arPdfTrend() {
  const mon = ADA_REPORT.ncMonthly;
  const CW = 660, CH = 150, AX = 11, n = mon.length, slot = CW / n;
  const BAR_TOP = CH * 0.42;            // bars live in the lower 58%
  const LINE_TOP = CH * 0.06, LINE_BOT = CH * 0.32;
  const barMax = CH - BAR_TOP;

  const mx = Math.max(...mon.map(m => Math.max(m.closed, m.pending)));
  const amax = Math.max(...mon.map(m => m.active));
  const amin = Math.min(...mon.map(m => m.active));
  const bw = slot * 0.30, gap = 2;

  let bars = '';
  const pts = mon.map((m, k) => {
    const x0 = k * slot + (slot - (bw * 2 + gap)) / 2;
    const hc = m.closed / mx * barMax, hp = m.pending / mx * barMax;
    bars += `<rect x="${x0.toFixed(1)}" y="${(CH - hc).toFixed(1)}" width="${bw.toFixed(1)}" height="${hc.toFixed(1)}" fill="#007bff"/>
      <rect x="${(x0 + bw + gap).toFixed(1)}" y="${(CH - hp).toFixed(1)}" width="${bw.toFixed(1)}" height="${hp.toFixed(1)}" fill="#607d8b"/>
      <text x="${(k * slot + slot / 2).toFixed(1)}" y="${(CH - Math.max(hc, hp) - 2).toFixed(1)}" class="bv">${m.closed}</text>
      <text x="${(k * slot + slot / 2).toFixed(1)}" y="${CH + 8}" class="ax">${m.m}</text>`;
    const span = (amax - amin) || 1;
    const y = LINE_BOT - (m.active - amin) / span * (LINE_BOT - LINE_TOP);
    return [k * slot + slot / 2, y, m.active];
  });

  const poly = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const dots = pts.map(([x, y, a], i) => {
    // keep the first/last labels inside the plot instead of hanging off the edge
    const anchor = i === 0 ? ' style="text-anchor:start"'
                 : i === pts.length - 1 ? ' style="text-anchor:end"' : '';
    const lx = i === 0 ? x + 4 : i === pts.length - 1 ? x - 4 : x;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="#ffb30f" stroke="#fff" stroke-width=".8"/>
      <text x="${lx.toFixed(1)}" y="${(y - 4).toFixed(1)}" class="pl"${anchor}>${a}</text>`;
  }).join('');

  return `<div class="blk"><h2>New Construction Trend <span class="n">&mdash; 13 months</span></h2>
    <div class="legend">
      <span><i class="sw" style="background:#007bff"></i>Closed Sales (labelled)</span>
      <span><i class="sw" style="background:#607d8b"></i>Pending Sales</span>
      <span style="color:#c78a00">&#9679;&#9472; Active Listings</span>
    </div>
    <svg viewBox="0 0 ${CW} ${CH + AX}" width="100%"
      style="border:.5px solid #ddd;display:block;height:auto">
      ${bars}<polyline points="${poly}" fill="none" stroke="#ffb30f" stroke-width="1.1"/>${dots}</svg></div>`;
}

// ── document assembly ────────────────────────────────────────────────────────
function arPdfDocument(scope) {
  const cov = ADA_REPORT.coverage;
  const missPct = (cov.jul25MissingClosePrice / cov.jul25Sold * 100).toFixed(1);
  const scoped = scope !== 'all';
  const label = AR_PDF_SCOPE_LABEL[scope];
  const showNc = scope !== 'existing';

  const subtitle = scope === 'all'
    ? 'Single-Family Residential Home Market &mdash; New vs. Existing'
    : `Single-Family Residential Home Market &mdash; ${label}`;

  return `<!doctype html><html><head><meta charset="utf-8">
<title>Market Dynamics — Ada County ${label}, ${ADA_REPORT.period}</title>
<style>${AR_PDF_CSS}</style></head><body><div class="sheet">

<div class="topbar">
  <div class="brand">${AR_PDF_MARK}
    <div class="brand-words"><span class="brand-market">Market</span>
      <span class="brand-research">Research</span>
      <span class="brand-sub">Compass International Holdings</span></div>
  </div>
  <div class="titles">
    <div class="sub">${subtitle}</div>
    <div class="meta"><b>Area:</b> Ada County &nbsp;&nbsp; <b>Report Month:</b> ${ADA_REPORT.period}
      &nbsp;&nbsp; <b>Report date:</b> ${ADA_REPORT.generated}
      ${scoped ? `<span class="scope">${label} only</span>` : ''}</div>
  </div>
  <div style="text-align:right"><h1>Market Dynamics</h1>
    <div class="accentbar">
      <i style="background:#007bff"></i><i style="background:#9c27b0"></i>
      <i style="background:#ff7043"></i><i style="background:#ffb30f"></i>
      <i style="background:#00d084"></i><i style="background:#607d8b"></i>
    </div>
  </div>
</div>

<div class="cols">
  <div class="c1">
    ${arPdfAreaTable(scope)}
    ${arPdfPriceClass(scope)}
    ${showNc ? arPdfTrend() : ''}
  </div>
  <div class="c2">
    ${arPdfSummary(scope)}
    <div class="duo">
      <div class="warn"><b>2025 price and volume figures are withheld.</b>
        ${cov.jul25MissingClosePrice.toLocaleString()} of ${cov.jul25Sold.toLocaleString()}
        July-2025 closings (${missPct}%) carry no close price, so the Jul-25 and YTD-25
        base is roughly a 4% sample. Counts are sound; median, average and dollar volume
        for those two columns &mdash; and every % change against them &mdash; are
        suppressed rather than published.</div>
      <div class="crit"><b>Report criteria.</b>
        Single-Family Residential &mdash; Ada County, ID, all 17 IMLS areas.
        New Construction = assessor year built &ge; 2025 (not the IMLS flag &mdash; see note).
        Reporting month ${ADA_REPORT.period}; YTD = Jan 1 &ndash; Jul 31;
        Previous 12 Months = Aug 1, 2025 &ndash; Jul 31, 2026.${scoped
          ? ` <b>Filtered to ${label}</b> &mdash; the Total Market band is kept as the
              county baseline this segment is measured against.` : ''}</div>
    </div>
    ${showNc ? arPdfNcTable() : ''}
  </div>
</div>

<div class="note">
  Source: Compass Databricks &mdash; <i>data_science.compass_db.ada_county_report_csv</i>
  (${ADA_REPORT.period} run), Ada County single-family residential.
  <b>New construction is defined by assessor year built, not by the IMLS
  <i>NewConstructionYN</i> flag</b> &mdash; IMLS publishes that flag, but it is not ingested
  into the Compass warehouse (<i>main.silver_mls.listing_idaho_imls</i> is a 69-column RESO
  subset carrying neither <i>NewConstructionYN</i> nor <i>YearBuilt</i>, and the only
  <i>is_new_construction_flag</i> sits on DMS tables &mdash; Compass-listed inventory only,
  71% null).
  &nbsp;&bull;&nbsp; <span class="flag">&#9873;</span> marks a source-report aggregation
  defect: Meridian SE (1000) and Meridian SW (1010) report identical average and median
  prices on different unit counts (51 vs. 50 sales), and Boise North (0100) carries a
  $630,000 new-construction average against 0 new-construction units &mdash; shown as
  reported, but not to be relied on.
  &nbsp;&bull;&nbsp; The summary bands split July's 1,035 sales as 319 new + 716 existing;
  the area rows sum to 318 + 715 = 1,033. This is <b>not</b> two sales missing an IMLS area,
  as previously stated &mdash; the area Sold column sums to the full 1,035, and six areas
  individually fail new + existing = sold with gaps in both directions. The new/existing
  split is unreliable at &plusmn;1 per area.
  &nbsp;&bull;&nbsp; <b>New-construction change vs 2025 is not like-for-like.</b> Year built
  &ge; 2025 is a fixed threshold, so the 2026 columns span two build vintages and the 2025
  columns one. Against <i>main.gold_mls.search_listings</i>, 1,307 of the 2,065 YTD-26 sales
  built &ge; 2025 were built in 2025; on a rolling definition new construction grew ~14% YTD,
  in line with the market, and held a ~35% share both years &mdash; not the +170.8% the
  source reports.
  &nbsp;&bull;&nbsp; <span class="wh">wthld</span> = withheld.${showNc
    ? ' New-construction tier and trend figures use a 12-month close window, so they will'
      + ' not tie to the monthly sections above.' : ''}
</div>
</div></body></html>`;
}

// Opens the print view. Returns false if the popup was blocked so the caller
// can surface that rather than failing silently.
function adaReportPdf(scope) {
  const w = window.open('', '_blank', 'width=1200,height=850');
  if (!w) return false;
  w.document.open();
  w.document.write(arPdfDocument(scope || 'all'));
  w.document.close();
  // Give the popup a tick to lay out the SVG before the print dialog snapshots it.
  const go = () => setTimeout(() => { w.focus(); w.print(); }, 350);
  if (w.document.readyState === 'complete') go();
  else w.addEventListener('load', go);
  return true;
}
