// ── Ada County report → printable PDF ────────────────────────────────────────
// Builds a self-contained light-theme document sized for letter landscape and
// hands it to the browser's print dialog ("Save as PDF"). No library: the
// dashboard has no build step, and a print stylesheet gives exact control over
// pagination, which a canvas-rasterising exporter does not — the tables stay
// selectable text rather than becoming a bitmap.
//
// Layout mirrors ada_county_market_breakdown_2026-07.html: brand lockup left,
// "Market Dynamics" wordmark right, accent bar, then a chart/criteria column
// beside the summary tables, with detail tables on the following pages.

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
  '<span class="wh" title="Base period is a ~4% sample">withheld</span>';

// Print palette is the same six hexes; only the surface changes (dark → paper).
const AR_PDF_CSS = `
 @page { size: letter landscape; margin: .4in; }
 * { box-sizing: border-box; }
 body { font-family: Arial, Helvetica, sans-serif; color:#1a1a1a; margin:0; padding:20px 24px; }
 h1 { font-size:38px; font-weight:400; text-align:right; margin:0 0 6px; letter-spacing:-.5px; }
 h2 { color:#007bff; font-size:12.5px; margin:0 0 6px; }
 .sub { text-align:center; font-size:15px; font-weight:bold; margin:2px 0 5px; }
 .meta { text-align:center; font-size:11px; margin-bottom:12px; }
 .scope { display:inline-block; margin-left:10px; padding:1px 7px; border-radius:9px;
   background:#007bff; color:#fff; font-size:9.5px; font-weight:bold; vertical-align:1px; }
 .wrap { display:flex; gap:24px; align-items:flex-start; }
 .left { width:44%; } .right { flex:1; }
 .blk { margin-bottom:13px; }
 .legend { font-size:10px; margin-bottom:4px; }
 .legend span { margin-right:12px; }
 .sw { display:inline-block; width:11px; height:9px; vertical-align:-1px; margin-right:3px; }
 svg text.al { font-size:7.5px; text-anchor:end; fill:#333; }
 svg text.vl { font-size:7.5px; text-anchor:start; fill:#333; }
 svg text.ax { font-size:7px; text-anchor:middle; fill:#333; }
 svg text.bl { font-size:7px; fill:#fff; text-anchor:start; }
 svg text.pl { font-size:7.5px; fill:#333; text-anchor:middle; }
 table { border-collapse:collapse; width:100%; font-size:9.5px; }
 th, td { border:1px solid #b9b9b9; padding:3px 4px; text-align:center; }
 thead th { background:#fff; font-weight:normal; font-size:8.5px; line-height:1.15; }
 td.lab, th.lab { text-align:left; padding-left:6px; }
 tr.alt td { background:#ececec; }
 tr.tot td { font-weight:bold; }
 .up { color:#00875a; } .dn { color:#c0392b; }
 .wh { color:#8a6d00; font-style:italic; }
 .flag { color:#c78a00; margin-left:3px; }
 .suspect { color:#a6791a; }
 .crit { margin-top:15px; font-size:9px; }
 .crit h3 { color:#007bff; font-size:11.5px; margin:0 0 4px; }
 .brand { display:flex; align-items:center; gap:10px; }
 .brand svg { height:38px; width:auto; display:block; }
 .brand-words { display:flex; flex-direction:column; line-height:1; }
 .brand-market { font-size:20px; font-weight:300; color:#111; }
 .brand-research { font-size:20px; font-weight:300; color:#007bff; }
 .brand-sub { font-size:6.5px; letter-spacing:.14em; text-transform:uppercase;
   color:#555; margin-top:5px; font-family:Georgia,serif; }
 .topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
 .accentbar { display:flex; gap:3px; margin-top:6px; justify-content:flex-end; }
 .accentbar i { width:22px; height:5px; border-radius:2px; display:block; }
 .note { font-size:8.5px; color:#555; margin-top:9px; line-height:1.45; }
 .warn { border-left:3px solid #ffb30f; background:#fffaf0; padding:6px 9px;
   font-size:8.7px; line-height:1.45; margin:0 0 11px; }
 .page { page-break-before:always; margin-top:30px; }
`;

// ── small formatters (print copies — the dashboard ones emit — for null) ──────
const arpMoney = v => v == null ? '&ndash;' : '$' + Math.round(v).toLocaleString();
const arpNum   = v => v == null ? '&ndash;' : Math.round(v).toLocaleString();
const arpPct   = v => v == null ? '&ndash;' : v.toFixed(1) + '%';
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

// ── summary tables ───────────────────────────────────────────────────────────
function arPdfSummary(key) {
  const t = ADA_REPORT.summary[key];
  const title = { total: 'Total Market', existing: 'Existing Homes',
                  new: 'Newly Constructed Homes' }[key];
  const hdr = t.header.map(h => `<th>${h}</th>`).join('');

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
    return `<tr${i % 2 ? ' class="alt"' : ''}><td class="lab">${r.label}</td>${cells}
      <td>${chg(p[0])}</td><td>${chg(p[1])}</td></tr>`;
  }).join('');

  return `<div class="blk"><h2>${title}</h2>
    <table><thead><tr><th class="lab"></th>${hdr}<th>% Chg<br>Jul</th><th>% Chg<br>YTD</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

// ── horizontal "sold by area" bars ───────────────────────────────────────────
function arPdfAreaChart(scope) {
  const val = a => scope === 'new' ? a.new.sold
              : scope === 'existing' ? a.existing.sold : a.total.sold;
  // Sort by the metric actually being drawn — sorting by total under a segment
  // scope produces bars that look ordered but aren't.
  const areas = ADA_REPORT.areas.slice().sort((a, b) => val(b) - val(a));
  const CW = 540, ROW = 16, LBL = 118, PAD = 42;
  const plot = CW - LBL - PAD;
  const H = ROW * areas.length + 16;
  const mx = Math.max(...areas.map(val), 1);

  const parts = areas.map((a, i) => {
    const y = i * ROW + 8;
    let bars;
    if (scope === 'all') {
      const wn = a.new.sold / mx * plot, we = a.existing.sold / mx * plot;
      // 2px surface gap between the two adjacent fills
      bars = `<rect x="${LBL}" y="${y}" width="${wn.toFixed(1)}" height="10" fill="#007bff"/>
        <rect x="${(LBL + wn + 2).toFixed(1)}" y="${y}" width="${Math.max(we - 2, 0).toFixed(1)}" height="10" fill="#607d8b"/>`;
    } else {
      const c = scope === 'new' ? '#007bff' : '#607d8b';
      bars = `<rect x="${LBL}" y="${y}" width="${(val(a) / mx * plot).toFixed(1)}" height="10" fill="${c}"/>`;
    }
    const end = scope === 'all'
      ? LBL + (a.new.sold + a.existing.sold) / mx * plot
      : LBL + val(a) / mx * plot;
    return `<text x="${LBL - 6}" y="${y + 8}" class="al">${a.name}</text>${bars}
      <text x="${(end + 6).toFixed(1)}" y="${y + 8}" class="vl">${val(a)}</text>`;
  }).join('');

  const legend = scope === 'all'
    ? `<span><i class="sw" style="background:#007bff"></i>New Construction</span>
       <span><i class="sw" style="background:#607d8b"></i>Existing</span>`
    : `<span><i class="sw" style="background:${scope === 'new' ? '#007bff' : '#607d8b'}"></i>${AR_PDF_SCOPE_LABEL[scope]}</span>`;

  return `<h2>Homes Sold by Area &mdash; ${ADA_REPORT.period}</h2>
    <div class="legend">${legend}</div>
    <svg width="${CW}" height="${H}" style="border:1px solid #ddd">${parts}</svg>`;
}

// ── area detail table ────────────────────────────────────────────────────────
function arPdfAreaTable(scope) {
  const T = ADA_REPORT.areaTotals;
  const seg = a => scope === 'new' ? a.new : scope === 'existing' ? a.existing : a.total;
  const areas = ADA_REPORT.areas.slice().sort((a, b) => seg(b).sold - seg(a).sold);
  const flagged = { '1000': 1, '1010': 1, '0100': 1 };

  const head = scope === 'all'
    ? `<th class="lab">IMLS Area</th><th>Sold</th><th>% of<br>Sales</th><th>Avg Price</th>
       <th>Median</th><th>New<br>Sold</th><th>New<br>Avg Price</th>
       <th>Existing<br>Sold</th><th>Existing<br>Avg Price</th>`
    : `<th class="lab">IMLS Area</th><th>Sold</th><th>% of Segment<br>Sales</th>
       <th>Avg Price</th><th>Median</th><th>Total Sold<br>(all product)</th><th>Share of<br>Area</th>`;

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
    return `<tr${i % 2 ? ' class="alt"' : ''}><td class="lab">${a.code} &middot; ${a.name}${f}</td>${body}</tr>`;
  }).join('');

  const t = scope === 'new' ? T.new : scope === 'existing' ? T.existing : T.total;
  const foot = scope === 'all'
    ? `<td>${arpNum(T.total.sold)}</td><td>100.0%</td><td>${arpMoney(T.total.avg)}</td><td>&ndash;</td>
       <td>${arpNum(T.new.sold)}</td><td>${arpMoney(T.new.avg)}</td>
       <td>${arpNum(T.existing.sold)}</td><td>${arpMoney(T.existing.avg)}</td>`
    : `<td>${arpNum(t.sold)}</td><td>100.0%</td><td>${arpMoney(t.avg)}</td><td>&ndash;</td>
       <td>${arpNum(T.total.sold)}</td>
       <td>${arpPct(t.sold / T.total.sold * 100)}</td>`;

  return `<div class="blk"><h2>Sold by Area &mdash; ${ADA_REPORT.period}</h2>
    <table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody>
    <tfoot><tr class="tot"><td class="lab">All areas</td>${foot}</tr></tfoot></table></div>`;
}

// ── price-class table ────────────────────────────────────────────────────────
function arPdfPriceClass(scope) {
  const J = ADA_REPORT.priceClassJul, Y = ADA_REPORT.priceClassYtd;
  const showNew = scope !== 'existing', showEx = scope !== 'new';
  const span = (showNew ? 2 : 0) + (showEx ? 2 : 0);

  const rows = J.map((j, i) => {
    const y = Y[i];
    if (!(j.new || j.ex || y.new || y.ex)) return '';
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
    <table><thead>
      <tr><th class="lab" rowspan="2">Price Class</th>
        <th colspan="${span}">${ADA_REPORT.period}</th>
        <th colspan="${span}">Year to Date 2026</th></tr>
      <tr>${subhead}${subhead}</tr>
    </thead><tbody>${rows}</tbody></table></div>`;
}

// ── new-construction tiers + 13-month trend (new-construction data only) ─────
function arPdfNcSection() {
  const rows = ADA_REPORT.ncTiers.map((r, i) => `
    <tr${i % 2 ? ' class="alt"' : ''}><td class="lab">${r.tier}</td>
      <td>${r.active || '&ndash;'}</td><td>${r.pending || '&ndash;'}</td><td>${r.sold || '&ndash;'}</td>
      <td>${r.moi == null ? '&ndash;' : r.moi.toFixed(1)}</td>
      <td>${arpNum(r.orig)}</td><td>${arpNum(r.soldPrice)}</td>
      <td>${r.ratio == null ? '&ndash;' : (r.ratio * 100).toFixed(1) + '%'}</td>
      <td>${arpNum(r.sqft)}</td><td>${r.psf == null ? '&ndash;' : r.psf.toFixed(2)}</td>
      <td>${arpNum(r.cdom)}</td><td>n/a</td></tr>`).join('');

  const T = ADA_REPORT.ncTotals;
  const mon = ADA_REPORT.ncMonthly;
  const CW = 540, CH = 200, n = mon.length, slot = CW / n;
  const mx = Math.max(...mon.map(m => Math.max(m.closed, m.pending)));
  const amax = Math.max(...mon.map(m => m.active)), amin = Math.min(...mon.map(m => m.active));
  let bars = '', pts = [];
  mon.forEach((m, k) => {
    const x0 = k * slot, bw = slot * 0.30;
    const hc = m.closed / mx * CH, hp = m.pending / mx * CH;
    const bx = x0 + slot * 0.14, cx = bx + bw / 2;
    bars += `<rect x="${bx.toFixed(1)}" y="${(CH - hp).toFixed(1)}" width="${bw.toFixed(1)}" height="${hp.toFixed(1)}" fill="#607d8b"/>
      <rect x="${bx.toFixed(1)}" y="${(CH - hc).toFixed(1)}" width="${bw.toFixed(1)}" height="${hc.toFixed(1)}" fill="#007bff"/>
      <text x="${cx.toFixed(1)}" y="${CH - 6}" class="bl" transform="rotate(-90 ${cx.toFixed(1)} ${CH - 6})">${m.closed}</text>
      <text x="${(x0 + slot / 2).toFixed(1)}" y="${CH + 14}" class="ax">${m.m}</text>`;
    const ay = CH - ((m.active - amin * 0.85) / (amax - amin * 0.85)) * (CH * 0.55) - CH * 0.30;
    pts.push([x0 + slot / 2, ay, m.active]);
  });
  const poly = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const dots = pts.map(([x, y, a], i) => {
    // keep the first/last labels inside the plot instead of hanging off the edge
    const anchor = i === 0 ? ' style="text-anchor:start"'
                 : i === pts.length - 1 ? ' style="text-anchor:end"' : '';
    const lx = i === 0 ? x + 5 : i === pts.length - 1 ? x - 5 : x;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#ffb30f" stroke="#fff" stroke-width="1"/>
      <text x="${lx.toFixed(1)}" y="${(y - 7).toFixed(1)}" class="pl"${anchor}>${a}</text>`;
  }).join('');

  return `<div class="page">
    <div class="blk"><h2>New Construction Market Dynamics &mdash; Trailing 12 Months</h2>
    <table><thead>
      <tr><th class="lab" rowspan="2">Price in $1000's</th><th colspan="2">Current to Date</th>
        <th>12 Mths</th><th rowspan="2">Months of<br>Inventory</th>
        <th colspan="7">Average based on 12 Month Solds</th></tr>
      <tr><th>Active</th><th>Pending</th><th>Sold</th><th>Orig Price</th><th>Sold Price</th>
        <th>Sold to Orig<br>Ratio</th><th>Avg Sq Ft</th><th>$ per SqFt</th><th>CDOM</th>
        <th>%<br>Distressed</th></tr>
    </thead><tbody>${rows}</tbody>
    <tfoot>
      <tr class="tot"><td class="lab">Total</td>
        <td>${arpNum(T.active)}</td><td>${arpNum(T.pending)}</td><td>${arpNum(T.sold)}</td>
        <td>${T.moi == null ? '&ndash;' : T.moi.toFixed(1)}</td>
        <td colspan="6"></td><td>n/a</td></tr>
      <tr class="tot"><td class="lab">Average Price</td>
        <td>${arpMoney(T.avgActive)}</td><td>${arpMoney(T.avgPending)}</td>
        <td>${arpMoney(T.soldPrice)}</td><td>&ndash;</td>
        <td>${arpMoney(T.orig)}</td><td>${arpMoney(T.soldPrice)}</td>
        <td>${(T.ratio * 100).toFixed(1)}%</td><td>${arpNum(T.sqft)}</td>
        <td>$${T.psf.toFixed(0)}</td><td>${arpNum(T.cdom)}</td><td></td></tr>
    </tfoot></table></div>

    <div class="blk"><h2>Market Trends &mdash; 13 Months</h2>
    <div class="legend">
      <span><i class="sw" style="background:#007bff"></i>Closed Sales</span>
      <span><i class="sw" style="background:#607d8b"></i>Pending Sales</span>
      <span style="color:#c78a00">&#9472;&#9679;&#9472; Active Listings</span>
    </div>
    <svg width="${CW}" height="${CH + 22}" style="border:1px solid #ddd">${bars}
      <polyline points="${poly}" fill="none" stroke="#ffb30f" stroke-width="1.4"/>${dots}</svg></div>
  </div>`;
}

// ── document assembly ────────────────────────────────────────────────────────
function arPdfDocument(scope) {
  const cov = ADA_REPORT.coverage;
  const missPct = (cov.jul25MissingClosePrice / cov.jul25Sold * 100).toFixed(1);
  const scoped = scope !== 'all';
  const label = AR_PDF_SCOPE_LABEL[scope];

  const subtitle = scope === 'all'
    ? 'Single-Family Residential Home Market &mdash; New vs. Existing'
    : `Single-Family Residential Home Market &mdash; ${label}`;

  return `<!doctype html><html><head><meta charset="utf-8">
<title>Market Dynamics — Ada County ${label}, ${ADA_REPORT.period}</title>
<style>${AR_PDF_CSS}</style></head><body>
<div class="topbar">
  <div class="brand">${AR_PDF_MARK}
    <div class="brand-words"><span class="brand-market">Market</span>
      <span class="brand-research">Research</span>
      <span class="brand-sub">Compass International Holdings</span></div>
  </div>
  <div style="text-align:right"><h1>Market Dynamics</h1>
    <div class="accentbar">
      <i style="background:#007bff"></i><i style="background:#9c27b0"></i>
      <i style="background:#ff7043"></i><i style="background:#ffb30f"></i>
      <i style="background:#00d084"></i><i style="background:#607d8b"></i>
    </div>
  </div>
</div>
<div class="sub">${subtitle}</div>
<div class="meta"><b>Area:</b> Ada County &nbsp;&nbsp;&nbsp; <b>Report Month:</b> ${ADA_REPORT.period}
  ${scoped ? `<span class="scope">${label} only</span>` : ''}</div>

<div class="wrap">
  <div class="left">${arPdfAreaChart(scope)}
    <div class="crit"><h3>Report Criteria:</h3>
      Single-Family Residential &mdash; Ada County, ID, all 17 IMLS areas<br>
      New Construction = assessor year built &ge; 2025 (not the IMLS flag &mdash; see note)<br>
      Reporting month: ${ADA_REPORT.period}; YTD = Jan 1 &ndash; Jul 31<br>
      Previous 12 Months = Aug 1, 2025 &ndash; Jul 31, 2026
      ${scoped ? `<br><b>Filtered to ${label}.</b> The Total Market block is retained as the
        county baseline this segment is measured against.` : ''}
    </div>
  </div>
  <div class="right">
    <div class="warn"><b>2025 price and volume figures are withheld.</b>
      ${cov.jul25MissingClosePrice.toLocaleString()} of ${cov.jul25Sold.toLocaleString()}
      July-2025 closings (${missPct}%) carry no close price, so the Jul-25 and YTD-25 base is
      roughly a 4% sample. Counts are sound; median, average and dollar volume for those two
      columns &mdash; and every % change measured against them &mdash; are suppressed rather
      than published.</div>
    ${arPdfKeys(scope).map(arPdfSummary).join('')}
  </div>
</div>

<div class="page">
  ${arPdfAreaTable(scope)}
  ${arPdfPriceClass(scope)}
  <div class="note">
    Source: Compass Databricks &mdash; <i>data_science.compass_db.ada_county_report_csv</i>
    (${ADA_REPORT.period} run), Ada County single-family residential.
    Report date: ${ADA_REPORT.generated}.<br>
    &bull; <b>New construction is defined by assessor year built, not by the IMLS
    <i>NewConstructionYN</i> flag.</b> IMLS publishes that flag, but it is not ingested into the
    Compass warehouse &mdash; <i>main.silver_mls.listing_idaho_imls</i> is a 69-column RESO subset
    carrying neither <i>NewConstructionYN</i> nor <i>YearBuilt</i>, and the only
    <i>is_new_construction_flag</i> in the warehouse sits on DMS tables (Compass-listed inventory
    only, 71% null).<br>
    &bull; &#9873; marks a source-report aggregation defect. Meridian SE (1000) and Meridian SW
    (1010) report identical average and median prices on different unit counts (51 vs. 50 sales),
    and Boise North (0100) carries a $630,000 new-construction average against 0
    new-construction units. Those price cells are shown as reported but should not be relied on.<br>
    &bull; The summary tables split July's 1,035 sales as 319 new + 716 existing, but the area
    rows sum to 318 new + 715 existing = 1,033. Two July sales carry no IMLS area and drop out of
    the by-area table; the &ldquo;All areas&rdquo; row shows the summary total of 1,035.
  </div>
</div>
${scope === 'existing' ? '' : arPdfNcSection()}
</body></html>`;
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
