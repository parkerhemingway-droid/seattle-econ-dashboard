// ── Zip drill-down → single-page printable PDF ───────────────────────────────
// Same approach as js/ada-report-export.js: build a self-contained light-theme
// document sized to ONE letter sheet and hand it to the browser's print dialog
// ("Save as PDF"). No library — the dashboard has no build step, and a print
// stylesheet keeps the tables as selectable text instead of a bitmap.
//
// Portrait rather than the Ada report's landscape: a zip snapshot is one narrow
// column of metrics plus a short peer table, so portrait wastes less sheet.

// Brand mark is shared with the Ada exporter (loaded first). Guarded so a
// reordered script tag degrades to a wordmark instead of throwing.
const ZP_MARK = typeof AR_PDF_MARK === 'string' ? AR_PDF_MARK : '';

const ZP_CSS = `
 @page { size: letter portrait; margin: .4in; }
 * { box-sizing: border-box; }
 html, body { margin:0; padding:0; }
 body { font-family: Arial, Helvetica, sans-serif; color:#1a1a1a; font-size:9px;
   -webkit-print-color-adjust: exact; print-color-adjust: exact; }
 /* One sheet, explicitly: 11in less .4in margins, less a hair for the rounding
    browsers do on the last line box. */
 .sheet { width:7.7in; height:10.1in; overflow:hidden; }

 h1 { font-size:23px; font-weight:400; text-align:right; margin:0; letter-spacing:-.5px; }
 h2 { color:#007bff; font-size:10px; margin:14px 0 4px; text-transform:uppercase;
   letter-spacing:.045em; }
 .sub { font-size:12px; font-weight:bold; }
 .meta { font-size:9px; color:#333; }
 .topbar { display:flex; align-items:center; justify-content:space-between;
   border-bottom:1px solid #d5d5d5; padding-bottom:6px; }
 .titles { text-align:center; }
 .brand { display:flex; align-items:center; gap:8px; }
 .brand svg { height:30px; width:auto; display:block; }
 .brand-words { display:flex; flex-direction:column; line-height:1; }
 .brand-market { font-size:15px; font-weight:300; color:#111; }
 .brand-research { font-size:15px; font-weight:300; color:#007bff; }
 .brand-sub { font-size:5.5px; letter-spacing:.14em; text-transform:uppercase;
   color:#555; margin-top:3px; font-family:Georgia,serif; }
 .accentbar { display:flex; gap:2px; margin-top:4px; justify-content:flex-end; }
 .accentbar i { width:17px; height:3px; border-radius:1px; display:block; }

 /* Hero tiles — six across, one row. */
 .hero { display:flex; gap:5px; margin-top:11px; }
 .tile { flex:1; min-width:0; border:.5px solid #c4c4c4; border-top:2px solid #007bff;
   padding:5px 4px; text-align:center; background:#fafbfc; }
 .tile .k { font-size:6.4px; text-transform:uppercase; letter-spacing:.05em;
   color:#555; line-height:1.25; }
 .tile .v { font-size:14px; font-weight:bold; margin-top:2px; letter-spacing:-.3px; }

 table { border-collapse:collapse; width:100%; font-size:8.4px; }
 th, td { border:.5px solid #c4c4c4; padding:3px 5px; text-align:center; }
 thead th { background:#f2f6fa; font-weight:bold; font-size:8px; color:#33475b; }
 td.lab, th.lab { text-align:left; }
 tr.alt td { background:#f7f8f9; }
 .up { color:#00875a; } .dn { color:#c0392b; }

 .crit { font-size:8.4px; line-height:1.5; border:.5px solid #d5d5d5;
   border-left:2px solid #007bff; padding:6px 8px; margin-top:4px; }
 .crit b { color:#007bff; }
 .note { font-size:7.4px; color:#555; line-height:1.45; margin-top:10px;
   border-top:1px solid #d5d5d5; padding-top:5px; }
 .note b { color:#333; }
`;

// Print copies of the formatters — these emit an en-dash for missing values
// rather than the dashboard's em-dash glyph.
const zpMoney = v => v == null ? '&ndash;' : '$' + Math.round(v).toLocaleString();
const zpNum   = v => v == null ? '&ndash;' : Math.round(v).toLocaleString();
const zpSign  = v => (v >= 0 ? '+' : '') + v;

// Same thresholds the on-screen drill-down uses, kept in one place so the sheet
// and the screen can never disagree about what counts as hot or cooling.
const zpDomCls   = v => v <= 10 ? 'up' : v >= 20 ? 'dn' : '';
const zpS2lCls   = v => v >= 101 ? 'up' : v < 99 ? 'dn' : '';
const zpReduxCls = v => v <= 8 ? 'up' : v >= 16 ? 'dn' : '';

const zpDomTxt   = v => v <= 10 ? 'Hot &mdash; seller market' : v >= 20 ? 'Cooling' : 'Balanced';
const zpS2lTxt   = v => v >= 101 ? 'Selling above ask' : v < 99 ? 'Below ask' : 'At ask';
const zpReduxTxt = v => v <= 8 ? 'Sellers hold firm' : v >= 16 ? 'Sellers cutting prices' : 'Normal';

function zpHero(d) {
  return `<div class="hero">${[
    ['Median Sale Price', '$' + (d.medianPrice / 1000).toFixed(0) + 'K'],
    ['Median List Price', '$' + (d.medianListPrice / 1000).toFixed(0) + 'K'],
    ['Days on Market',    d.daysOnMarket],
    ['Sale-to-List',      d.saleToList + '%'],
    ['Active Listings',   zpNum(d.inventory)],
    ['Price YoY',         zpSign(d.yoyPricePct) + '%'],
  ].map(([k, v]) => `<div class="tile"><div class="k">${k}</div>
      <div class="v">${v}</div></div>`).join('')}</div>`;
}

function zpSnapshot(d) {
  const rows = [
    ['Median Sale Price', zpMoney(d.medianPrice),
      `<span class="${d.yoyPricePct >= 0 ? 'up' : 'dn'}">${zpSign(d.yoyPricePct)}% YoY</span>`],
    ['Median List Price', zpMoney(d.medianListPrice), '&ndash;'],
    ['Days on Market', d.daysOnMarket + ' days',
      `<span class="${zpDomCls(d.daysOnMarket)}">${zpDomTxt(d.daysOnMarket)}</span>`],
    ['Sale-to-List Ratio', d.saleToList + '%',
      `<span class="${zpS2lCls(d.saleToList)}">${zpS2lTxt(d.saleToList)}</span>`],
    ['Active Listings', zpNum(d.inventory), '&ndash;'],
    ['New Listings (mo)', zpNum(d.newListings), '&ndash;'],
    ['Pending Sales (mo)', zpNum(d.pendingSales),
      d.pendingSales > d.newListings * 0.75 ? 'Strong absorption' : 'Moderate demand'],
    ['Price Reductions', d.priceReductions + '% of listings',
      `<span class="${zpReduxCls(d.priceReductions)}">${zpReduxTxt(d.priceReductions)}</span>`],
  ];
  return `<h2>Full Market Snapshot</h2>
    <table><thead><tr><th class="lab">Metric</th><th>Value</th><th>Signal</th></tr></thead>
    <tbody>${rows.map(([a, b, c], i) =>
      `<tr class="${i % 2 ? 'alt' : ''}"><td class="lab">${a}</td><td>${b}</td>
        <td>${c}</td></tr>`).join('')}</tbody></table>`;
}

function zpContext(zip, d) {
  // ALL_METRICS is the dashboard's live metric store; the fallback matches the
  // one renderZip() uses so the sheet and the screen quote the same baseline.
  const seaMedian = (typeof ALL_METRICS !== 'undefined' && ALL_METRICS['seaMedianPrice'])
    ? ALL_METRICS['seaMedianPrice'].value : 825000;
  const vs = ((d.medianPrice - seaMedian) / seaMedian * 100).toFixed(1);
  const stance = d.saleToList >= 102 ? 'strong seller'
    : d.saleToList < 99 ? 'buyer-leaning' : 'balanced';
  const redux = d.priceReductions <= 8 ? 'indicating sellers have significant pricing power.'
    : d.priceReductions >= 16 ? 'suggesting sellers are having to adjust expectations.'
    : 'a normal level for the current market.';
  return `<h2>How ${zip} Compares</h2>
    <div class="crit"><b>${d.name}</b> has a median sale price of
      <b>${zpMoney(d.medianPrice)}</b>, which is
      <b class="${vs >= 0 ? 'up' : 'dn'}">${vs >= 0 ? '+' : ''}${vs}%</b>
      vs the Seattle MSA median of ${zpMoney(seaMedian)}.
      At <b>${d.daysOnMarket} days on market</b> and a <b>${d.saleToList}%</b>
      sale-to-list ratio, this zip is a <b>${stance} market</b>.
      ${d.priceReductions}% of listings have seen price reductions, ${redux}</div>`;
}

// Same peer set the screen shows: closest median price within the county.
function zpNearby(zip, d) {
  if (typeof ZIP_DATA === 'undefined') return '';
  const near = Object.entries(ZIP_DATA)
    .filter(([z, zd]) => z !== zip && zd.county === d.county)
    .sort((a, b) => Math.abs(a[1].medianPrice - d.medianPrice)
                  - Math.abs(b[1].medianPrice - d.medianPrice))
    .slice(0, 8);
  if (!near.length) return '';
  return `<h2>Nearest Peers by Price &mdash; ${d.county} County</h2>
    <table><thead><tr><th>Zip</th><th class="lab">Neighborhood</th>
      <th>Median Price</th><th>DOM</th><th>Sale-to-List</th><th>YoY</th></tr></thead>
    <tbody>${near.map(([z, zd], i) => `<tr class="${i % 2 ? 'alt' : ''}">
        <td><b>${z}</b></td><td class="lab">${zd.name}</td>
        <td>${zpMoney(zd.medianPrice)}</td><td>${zd.daysOnMarket}</td>
        <td class="${zpS2lCls(zd.saleToList)}">${zd.saleToList}%</td>
        <td class="${zd.yoyPricePct >= 0 ? 'up' : 'dn'}">${zpSign(zd.yoyPricePct)}%</td>
      </tr>`).join('')}</tbody></table>`;
}

function zpDocument(zip, today) {
  const d = ZIP_DATA[zip];
  return `<!doctype html><html><head><meta charset="utf-8">
<title>Zip Market Snapshot — ${zip} ${d.name}</title>
<style>${ZP_CSS}</style></head><body><div class="sheet">

<div class="topbar">
  <div class="brand">${ZP_MARK}
    <div class="brand-words"><span class="brand-market">Market</span>
      <span class="brand-research">Research</span>
      <span class="brand-sub">Compass International Holdings</span></div>
  </div>
  <div class="titles">
    <div class="sub">Zip ${zip} &mdash; ${d.name}</div>
    <div class="meta"><b>County:</b> ${d.county} &nbsp;&nbsp;
      <b>Data as of:</b> Apr 2026 &nbsp;&nbsp; <b>Report date:</b> ${today}</div>
  </div>
  <div style="text-align:right"><h1>Zip Snapshot</h1>
    <div class="accentbar">
      <i style="background:#007bff"></i><i style="background:#9c27b0"></i>
      <i style="background:#ff7043"></i><i style="background:#ffb30f"></i>
      <i style="background:#00d084"></i><i style="background:#607d8b"></i>
    </div>
  </div>
</div>

${zpHero(d)}
${zpSnapshot(d)}
${zpContext(zip, d)}
${zpNearby(zip, d)}

<div class="note">
  <b>Source:</b> zip-level figures are modeled from Zillow Research and Redfin
  Data Center estimates (Apr 2026) &mdash; they are not MLS closings and are not
  reconciled to NWMLS. Treat them as directional. For authoritative figures see
  redfin.com/zipcode/${zip} or zillow.com.
  &nbsp;&bull;&nbsp; The Seattle MSA median used in the comparison above is the
  dashboard's live <i>seaMedianPrice</i> metric, which updates on a different
  cadence than these zip estimates.
  &nbsp;&bull;&nbsp; Coverage is ~40 zips across King, Pierce and Snohomish
  counties; "nearest peers" ranks by absolute median-price distance within the
  same county, not by geography.
</div>
</div></body></html>`;
}

// Opens the print view. Returns false if the popup was blocked so the caller can
// surface that rather than failing silently.
function zipReportPdf(zip) {
  if (typeof ZIP_DATA === 'undefined' || !ZIP_DATA[zip]) return false;
  const today = new Date().toISOString().slice(0, 10);
  const w = window.open('', '_blank', 'width=900,height=1100');
  if (!w) return false;
  w.document.open();
  w.document.write(zpDocument(zip, today));
  w.document.close();
  // Give the popup a tick to lay out the SVG before the print dialog snapshots it.
  const go = () => setTimeout(() => { w.focus(); w.print(); }, 350);
  if (w.document.readyState === 'complete') go();
  else w.addEventListener('load', go);
  return true;
}
