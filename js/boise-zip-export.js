// ── Boise MSA ZIP focus → single-page printable PDF ──────────────────────────
// Companion to js/ada-report-export.js, for when the Ada+Canyon report is
// focused on one ZIP. Same technique: a self-contained light-theme document
// sized to ONE letter-landscape sheet, handed to the browser's print dialog.
//
// WHY THIS IS A SEPARATE SHEET RATHER THAN THE AREA REPORT FILTERED DOWN.
// The source report (data_science.compass_db.ada_canyon_county_report_csv) has
// no ZIP dimension — it aggregates to IMLS areas, and areas do not nest inside
// ZIPs in either direction. Prorating the area tables by listing share would
// produce ZIP figures that look authoritative and are not: a 45%-share ZIP does
// not carry 45% of its area's $1M+ closings. So this sheet is built from the
// direct ZIP pull (BOISE_ZIP_METRICS, main.gold_mls.search_listings) and shows
// the covering IMLS areas alongside it, at full area scope and labelled as such.
// Nothing on the sheet is apportioned.

// Brand mark is shared with the Ada exporter (loaded first). Guarded so a
// reordered script tag degrades to a wordmark instead of throwing.
const BZP_MARK = typeof AR_PDF_MARK === 'string' ? AR_PDF_MARK : '';

const BZP_CSS = `
 @page { size: letter landscape; margin: .3in; }
 * { box-sizing: border-box; }
 html, body { margin:0; padding:0; }
 body { font-family: Arial, Helvetica, sans-serif; color:#1a1a1a; font-size:7.4px;
   -webkit-print-color-adjust: exact; print-color-adjust: exact; }
 .sheet { width:10.4in; height:7.82in; overflow:hidden; }

 h1 { font-size:25px; font-weight:400; text-align:right; margin:0; letter-spacing:-.5px; }
 h2 { color:#007bff; font-size:9.4px; margin:0 0 3px; text-transform:uppercase;
   letter-spacing:.045em; }
 h2 .n { color:#666; text-transform:none; letter-spacing:0; font-weight:normal; }
 .sub { font-size:11px; font-weight:bold; }
 .meta { font-size:8px; color:#333; }
 .scope { display:inline-block; margin-left:7px; padding:0 6px; border-radius:8px;
   background:#007bff; color:#fff; font-size:7px; font-weight:bold; }
 .topbar { display:flex; align-items:center; justify-content:space-between;
   border-bottom:1px solid #d5d5d5; padding-bottom:4px; margin-bottom:7px; }
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

 /* Hero tiles — nine across, one row. */
 .hero { display:flex; gap:4px; margin-bottom:7px; }
 .tile { flex:1; min-width:0; border:.5px solid #c4c4c4; border-top:2px solid #007bff;
   padding:4px 3px; text-align:center; background:#fafbfc; }
 .tile .k { font-size:5.6px; text-transform:uppercase; letter-spacing:.05em;
   color:#555; line-height:1.25; }
 .tile .v { font-size:13px; font-weight:bold; margin-top:2px; letter-spacing:-.3px; }
 .tile .d { font-size:5.8px; margin-top:1px; }

 .cols { display:flex; gap:11px; align-items:flex-start; }
 .c1 { width:44%; } .c2 { flex:1; min-width:0; }
 .blk { margin-bottom:7px; }

 table { border-collapse:collapse; width:100%; font-size:7.2px; table-layout:fixed; }
 th, td { border:.5px solid #c4c4c4; padding:1.6px 2px; text-align:center;
   overflow:hidden; white-space:nowrap; }
 thead th { background:#f2f6fa; font-weight:bold; font-size:6.5px; line-height:1.1;
   white-space:normal; color:#33475b; }
 td.lab, th.lab { text-align:left; }
 tr.alt td { background:#f4f4f4; }
 tr.tot td { font-weight:bold; background:#e8eef4; }
 tr.me td { font-weight:bold; background:#e2efff; }
 .up { color:#00875a; } .dn { color:#c0392b; }
 .flag { color:#c78a00; }
 .der { color:#8a6d00; }

 .crit { font-size:7px; line-height:1.45; border:.5px solid #d5d5d5;
   border-left:2px solid #007bff; padding:4px 6px; }
 .crit b { color:#007bff; }
 .warn { border:.5px solid #f0dcae; border-left:2px solid #ffb30f; background:#fffaf0;
   padding:4px 6px; font-size:7px; line-height:1.45; }
 .note { font-size:6.3px; color:#555; line-height:1.4; margin-top:6px;
   border-top:1px solid #d5d5d5; padding-top:3px; }
 .note b { color:#333; }
 .duo { display:flex; gap:7px; margin-bottom:7px; }
 .duo > * { flex:1; }
 /* Beside a narrow area table the two callouts read better stacked than as two
    ~3in columns of 7px text. */
 .duo-stack { flex-direction:column; }
`;

// ── print formatters (emit an en-dash for missing values) ────────────────────
const bzpMoney = v => v == null ? '&ndash;' : '$' + Math.round(v).toLocaleString();
const bzpNum   = v => v == null ? '&ndash;' : Math.round(v).toLocaleString();
const bzpK     = v => v == null ? '&ndash;' : '$' + Math.round(v / 1000).toLocaleString() + 'K';
const bzpPct   = v => v == null ? '&ndash;' : v.toFixed(1) + '%';
const bzpChg   = v => v == null ? '&ndash;'
  : `<span class="${v >= 0 ? 'up' : 'dn'}">${v >= 0 ? '+' : ''}${v.toFixed(1)}%</span>`;

// ADA_REPORT pads area codes to four digits; the crosswalk does not.
const bzpPad = c => String(c).padStart(4, '0');

function bzpAreasFor(zip) {
  return typeof imlsAreasForZip === 'function' ? imlsAreasForZip(zip) : [];
}

// ── hero tiles ───────────────────────────────────────────────────────────────
function bzpHero(d) {
  const tiles = [
    ['Sold Jul-26',    bzpNum(d.julSold),      ''],
    ['Median Jul-26',  bzpK(d.julMed),         ''],
    ['Sold YTD-26',    bzpNum(d.ytdSold),      bzpChg(d.ytdSoldPct)],
    ['Median YTD-26',  bzpK(d.ytdMed),         bzpChg(d.ytdMedPct)],
    ['Median TTM',     bzpK(d.ttmMed),         ''],
    ['Resale Med TTM', bzpK(d.ttmResaleMed),   ''],
    ['$ / SqFt TTM',   d.ttmPpsf == null ? '&ndash;' : '$' + d.ttmPpsf, ''],
    ['Median DOM',     bzpNum(d.ttmDom),       ''],
    ['Active / Pend',  bzpNum(d.active) + ' / ' + bzpNum(d.pending), ''],
  ];
  return `<div class="hero">${tiles.map(([k, v, dd]) =>
    `<div class="tile"><div class="k">${k}</div><div class="v">${v}</div>
      <div class="d">${dd || '&nbsp;'}</div></div>`).join('')}</div>`;
}

// ── closings: the two windows the source actually supports a YoY on ──────────
function bzpClosings(d) {
  const rows = [
    ['Homes sold', bzpNum(d.julSold), bzpNum(d.ytdSold), bzpNum(d.ytd25Sold),
      bzpChg(d.ytdSoldPct), bzpNum(d.ttmSold)],
    ['Median price', bzpMoney(d.julMed), bzpMoney(d.ytdMed), bzpMoney(d.ytd25Med),
      bzpChg(d.ytdMedPct), bzpMoney(d.ttmMed)],
  ];
  return `<div class="blk"><h2>Closings <span class="n">&mdash; single family</span></h2>
    <table><colgroup><col style="width:22%">${'<col>'.repeat(5)}</colgroup>
    <thead><tr><th class="lab">Metric</th><th>Jul-26</th><th>YTD-26</th><th>YTD-25</th>
      <th>YTD % Chg</th><th>Trailing<br>12 Mths</th></tr></thead>
    <tbody>${rows.map(([a, ...c], i) =>
      `<tr${i % 2 ? ' class="alt"' : ''}><td class="lab">${a}</td>
        ${c.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// ── trailing-12-month detail, including the new/resale split ─────────────────
function bzpTtm(d) {
  const resale = d.ttmSold == null || d.ttmNew == null ? null : d.ttmSold - d.ttmNew;
  const rows = [
    ['Homes sold',                 bzpNum(d.ttmSold)],
    ['Median price',               bzpMoney(d.ttmMed)],
    ['Median price &mdash; resale only', bzpMoney(d.ttmResaleMed)],
    ['Median price per square foot', d.ttmPpsf == null ? '&ndash;' : '$' + d.ttmPpsf],
    ['Median days on market',      bzpNum(d.ttmDom)],
    ['Sale-to-list ratio',         d.ttmS2l == null ? '&ndash;' : d.ttmS2l + '%'],
    ['New construction sold',      bzpNum(d.ttmNew)],
    ['Resale sold',                bzpNum(resale)],
    ['New construction share',     bzpPct(d.newSharePct)],
    ['Active listings (now)',      bzpNum(d.active)],
    ['Under contract (now)',       bzpNum(d.pending)],
  ];
  return `<div class="blk">
    <h2>Trailing 12 Months <span class="n">&mdash; Aug 1 2025 &ndash; Jul 31 2026</span></h2>
    <table><colgroup><col style="width:62%"><col></colgroup>
    <tbody>${rows.map(([a, b], i) =>
      `<tr${i % 2 ? ' class="alt"' : ''}><td class="lab">${a}</td><td>${b}</td></tr>`
    ).join('')}</tbody></table></div>`;
}

// ── the IMLS areas this ZIP sits in, at FULL area scope ──────────────────────
// Shown unprorated on purpose. The share column says how much of the area the
// ZIP is, so the reader can see the area figure is a wider number than the ZIP.
function bzpAreaTable(zip, scope) {
  if (typeof ADA_REPORT === 'undefined') return '';
  const share = {};
  bzpAreasFor(zip).forEach(a => { share[bzpPad(a.code)] = a.pct; });
  const codes = Object.keys(share);
  if (!codes.length) {
    return `<div class="blk"><h2>Covering IMLS Areas</h2>
      <div class="warn"><b>ZIP ${zip} has no IMLS area assignment.</b> It carries closings in
      <i>main.gold_mls.search_listings</i> but does not appear in the area crosswalk, so no
      area-level figures can be shown against it.</div></div>`;
  }
  const audit = typeof arAreaAudit === 'function' ? arAreaAudit() : {};
  const seg = a => scope === 'new' ? a.new : scope === 'existing' ? a.existing : a.total;
  const areas = ADA_REPORT.areas
    .filter(a => share[a.code] != null)
    .sort((a, b) => seg(b).sold - seg(a).sold);
  const derived = c => {
    const src = typeof IMLS_AREAS !== 'undefined'
      ? IMLS_AREAS.find(x => bzpPad(x.code) === c) : null;
    return !!(src && src.derived);
  };

  const rows = areas.map((a, i) => {
    const s = seg(a);
    const f = audit[a.code] ? ' <span class="flag">&#9873;</span>' : '';
    const t = derived(a.code) ? ' <span class="der">&dagger;</span>' : '';
    return `<tr${i % 2 ? ' class="alt"' : ''}>
      <td class="lab">${a.code} &middot; ${a.name}${t}${f}</td>
      <td>${share[a.code]}%</td>
      <td>${s.sold}</td><td>${bzpPct(a.total.pct)}</td>
      <td>${bzpMoney(s.avg)}</td><td>${bzpMoney(s.med)}</td>
      <td>${a.new.sold}</td><td>${a.existing.sold}</td></tr>`;
  }).join('');

  const label = scope === 'new' ? 'New Construction'
              : scope === 'existing' ? 'Existing Homes' : 'All Product';
  return `<div class="blk">
    <h2>Covering IMLS Areas <span class="n">&mdash; ${ADA_REPORT.period}, whole area, not prorated</span></h2>
    <table><colgroup><col style="width:30%">${'<col>'.repeat(7)}</colgroup>
    <thead><tr><th class="lab">IMLS Area</th><th>${zip} share<br>of area</th>
      <th>Sold<br>(${label})</th><th>% of<br>County</th><th>Avg Price</th><th>Median</th>
      <th>New<br>Sold</th><th>Exist<br>Sold</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

// ── peer ZIPs in the same county, ranked by trailing-12-month median ─────────
function bzpPeers(zip) {
  if (typeof BOISE_ZIP_METRICS === 'undefined' || typeof IMLS_ZIP_META === 'undefined') return '';
  const meta = IMLS_ZIP_META[zip];
  if (!meta) return '';
  const peers = Object.keys(BOISE_ZIP_METRICS)
    .filter(z => IMLS_ZIP_META[z] && IMLS_ZIP_META[z].county === meta.county)
    .sort((a, b) => (BOISE_ZIP_METRICS[b].ttmMed || 0) - (BOISE_ZIP_METRICS[a].ttmMed || 0));

  const rows = peers.map((z, i) => {
    const p = BOISE_ZIP_METRICS[z], m = IMLS_ZIP_META[z];
    const cls = z === zip ? ' class="me"' : (i % 2 ? ' class="alt"' : '');
    return `<tr${cls}><td><b>${z}</b></td><td class="lab">${m.city} &middot; ${m.label}</td>
      <td>${bzpNum(p.julSold)}</td><td>${bzpK(p.julMed)}</td>
      <td>${bzpK(p.ttmMed)}</td><td>${bzpK(p.ttmResaleMed)}</td>
      <td>${p.ttmPpsf == null ? '&ndash;' : '$' + p.ttmPpsf}</td>
      <td>${bzpNum(p.ttmDom)}</td><td>${bzpPct(p.newSharePct)}</td>
      <td>${bzpNum(p.active)}</td></tr>`;
  }).join('');

  const rank = peers.indexOf(zip) + 1;
  return `<div class="blk">
    <h2>Peer ZIPs <span class="n">&mdash; ${meta.county} County, ranked by trailing-12-month median
      (${zip} ranks ${rank} of ${peers.length})</span></h2>
    <table><colgroup><col style="width:8%"><col style="width:24%">${'<col>'.repeat(8)}</colgroup>
    <thead><tr><th>ZIP</th><th class="lab">City &middot; Neighborhood</th>
      <th>Sold<br>Jul-26</th><th>Median<br>Jul-26</th><th>Median<br>TTM</th>
      <th>Resale<br>Med TTM</th><th>$/SqFt</th><th>DOM</th><th>New %</th>
      <th>Active</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

// ── document assembly ────────────────────────────────────────────────────────
function bzpDocument(zip, scope) {
  const d = BOISE_ZIP_METRICS[zip];
  const meta = IMLS_ZIP_META[zip];
  const areas = bzpAreasFor(zip);
  const anyDerived = areas.some(a => {
    const src = typeof IMLS_AREAS !== 'undefined'
      ? IMLS_AREAS.find(x => x.code === a.code) : null;
    return !!(src && src.derived);
  });
  const scoped = scope && scope !== 'all';
  const scopeLabel = scope === 'new' ? 'New Construction'
                   : scope === 'existing' ? 'Existing Homes' : 'All Product';
  const thin = d.julSold != null && d.julSold < 15;
  const generated = typeof ADA_REPORT !== 'undefined' ? ADA_REPORT.generated : '';
  const period = typeof ADA_REPORT !== 'undefined' ? ADA_REPORT.period : 'Jul-26';

  return `<!doctype html><html><head><meta charset="utf-8">
<title>ZIP Market Dynamics — ${zip} ${meta.city}, ${period}</title>
<style>${BZP_CSS}</style></head><body><div class="sheet">

<div class="topbar">
  <div class="brand">${BZP_MARK}
    <div class="brand-words"><span class="brand-market">Market</span>
      <span class="brand-research">Research</span>
      <span class="brand-sub">Compass International Holdings</span></div>
  </div>
  <div class="titles">
    <div class="sub">ZIP ${zip} &mdash; ${meta.city} &middot; ${meta.label}</div>
    <div class="meta"><b>County:</b> ${meta.county}, Idaho &nbsp;&nbsp;
      <b>Report Month:</b> ${period} &nbsp;&nbsp; <b>Report date:</b> ${generated}
      ${scoped ? `<span class="scope">Areas shown: ${scopeLabel}</span>` : ''}</div>
  </div>
  <div style="text-align:right"><h1>ZIP Market Dynamics</h1>
    <div class="accentbar">
      <i style="background:#007bff"></i><i style="background:#9c27b0"></i>
      <i style="background:#ff7043"></i><i style="background:#ffb30f"></i>
      <i style="background:#00d084"></i><i style="background:#607d8b"></i>
    </div>
  </div>
</div>

${bzpHero(d)}

<div class="cols">
  <div class="c1">
    ${bzpClosings(d)}
    ${bzpTtm(d)}
  </div>
  <div class="c2">
    ${bzpAreaTable(zip, scope || 'all')}
    <div class="duo duo-stack">
      <div class="crit"><b>Report criteria.</b> Single-family residential closings in ZIP ${zip},
        pulled directly from <i>main.gold_mls.search_listings</i> &mdash; not apportioned from the
        area report. Price = close price where recorded, otherwise current price. Jul-26 = calendar
        July; YTD = Jan 1 &ndash; Jul 31; trailing 12 months = Aug 1 2025 &ndash; Jul 31 2026.
        Active and under-contract are live counts at pull time, not period figures.</div>
      ${thin
        ? `<div class="warn"><b>Thin market &mdash; read the monthly figures loosely.</b>
            ZIP ${zip} closed ${d.julSold} single-family sales in July 2026. At that volume a
            single high or low sale moves the median several percent, so month-to-month swings
            here are mostly composition, not price movement. The trailing-12-month column
            (${bzpNum(d.ttmSold)} sales) is the one to quote.</div>`
        : `<div class="warn"><b>Median is a mix statistic, not a price index.</b>
            ZIP ${zip} closed ${bzpNum(d.ttmSold)} single-family sales over the trailing 12 months,
            ${bzpPct(d.newSharePct)} of them new construction. A shift in the size or vintage of
            what sold moves the median without any home changing in value; check
            $${d.ttmPpsf} per square foot alongside it.</div>`}
    </div>
  </div>
</div>

${bzpPeers(zip)}

<div class="note">
  <b>Source:</b> Compass Databricks &mdash; <i>main.gold_mls.search_listings</i>, pulled
  ${generated}, filtered to Idaho single-family residential MLS sales. Area figures come from
  <i>data_science.compass_db.ada_canyon_county_report_csv</i> (${period} run).
  &nbsp;&bull;&nbsp; <b>New vs resale here uses a rolling vintage</b> &mdash; built in the sale
  year or the one before. The area report uses a fixed &ldquo;year built &ge; 2025&rdquo;
  threshold, which counts 2025-built homes as new in both years and overstates new-construction
  growth. The two definitions will not tie; the ZIP figures are the like-for-like ones.
  &nbsp;&bull;&nbsp; Area figures are for the <b>whole IMLS area</b>. The share column is the
  ZIP's portion of that area's listings, not a weight applied to the figures &mdash; a
  45%-share ZIP does not carry 45% of its area's high-end closings.
  ${anyDerived ? '&nbsp;&bull;&nbsp; <span class="der">&dagger;</span> <b>Derived area mapping.</b> '
    + 'IMLS does not publish a Canyon County area/ZIP crosswalk. These areas were matched to ZIPs '
    + 'by reconciling each area’s July-2026 sold count and median against per-ZIP figures. '
    + 'Treat the pairing as strong inference, not as published geography.' : ''}
  ${typeof arAreaAudit === 'function' && Object.keys(arAreaAudit()).length
    ? '&nbsp;&bull;&nbsp; <span class="flag">&#9873;</span> marks a source-report aggregation '
      + 'defect in that area &mdash; duplicated average/median pairs, prices against zero units, '
      + 'or new + existing not equalling sold. Shown as reported; not to be relied on.' : ''}
</div>
</div></body></html>`;
}

// Opens the print view. Returns false if the ZIP has no metrics or the popup was
// blocked, so the caller can surface that rather than failing silently.
function boiseZipPdf(zip, scope) {
  const z = String(zip);
  if (typeof BOISE_ZIP_METRICS === 'undefined' || !BOISE_ZIP_METRICS[z]) return false;
  if (typeof IMLS_ZIP_META === 'undefined' || !IMLS_ZIP_META[z]) return false;
  const w = window.open('', '_blank', 'width=1200,height=850');
  if (!w) return false;
  w.document.open();
  w.document.write(bzpDocument(z, scope || 'all'));
  w.document.close();
  // Give the popup a tick to lay out before the print dialog snapshots it.
  const go = () => setTimeout(() => { w.focus(); w.print(); }, 350);
  if (w.document.readyState === 'complete') go();
  else w.addEventListener('load', go);
  return true;
}
