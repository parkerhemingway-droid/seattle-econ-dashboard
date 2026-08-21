// ── Ada County Single-Family Residential Market Report ───────────────────────
// Renders the July 2026 IMLS-style breakdown inside the Boise MSA section.
// Data comes from js/ada-report-data.js (ADA_REPORT), which is generated from
// data_science.compass_db.ada_county_report_csv plus the trailing-12-month
// new-construction tier cut. Do not hand-edit the numbers here.

// Market Research palette. Assigned by the job each colour does, not by rank:
//   blue  = New Construction   slate = Existing   purple = Total / all product
//   green = favourable change  orange = unfavourable change  amber = caution
const MR = {
  blue: '#007bff', purple: '#9c27b0', orange: '#ff7043',
  amber: '#ffb30f', green: '#00d084', slate: '#607d8b'
};

const AR_SERIES = {
  new:      { label: 'New Construction', color: MR.blue },
  existing: { label: 'Existing',         color: MR.slate },
  total:    { label: 'Total',            color: MR.purple }
};

// ── formatters ───────────────────────────────────────────────────────────────
const arMoney = v => v == null ? '—' : '$' + Math.round(v).toLocaleString();
const arMoneyK = v => {
  if (v == null) return '—';
  if (Math.abs(v) >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e3) return '$' + Math.round(v / 1e3) + 'K';
  return '$' + Math.round(v);
};
const arNum = (v, d = 0) => v == null ? '—' : v.toLocaleString(undefined, {
  minimumFractionDigits: d, maximumFractionDigits: d
});
const arPct = (v, d = 1) => v == null ? '—' : v.toFixed(d) + '%';

// Signed change chip. `invert` flips which direction reads as favourable
// (a rise in days-on-market is not good news).
function arDelta(v, invert = false) {
  if (v == null) return '<span class="ar-delta ar-flat">—</span>';
  const good = invert ? v < 0 : v > 0;
  const cls = v === 0 ? 'ar-flat' : (good ? 'ar-up' : 'ar-down');
  const arrow = v === 0 ? '' : (v > 0 ? '▲' : '▼');
  return `<span class="ar-delta ${cls}">${arrow} ${Math.abs(v).toFixed(1)}%</span>`;
}

const arEl = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};

// ── Brand lockup ─────────────────────────────────────────────────────────────
// Built as inline SVG rather than the PNG so the wordmark stays legible on the
// dark surface (images/research-logo.png is a light-blue "Research"-only cut).
function arBrandLockup() {
  return `
  <div class="ar-brand">
    <img class="ar-brand-mark" src="images/intel-mark.svg" alt="" aria-hidden="true">
    <div class="ar-brand-words">
      <span class="ar-brand-market">Market</span>
      <span class="ar-brand-research">Research</span>
      <span class="ar-brand-sub">Compass International Holdings</span>
    </div>
  </div>`;
}

// ── Scope: which product segment the whole report is filtered to ─────────────
// 'all' shows New and Existing side by side; 'new' / 'existing' narrow every
// section to that segment. The Total block is kept under every scope — it is
// the county baseline the segment is read against, and dropping it would leave
// the shares ("% of sales") without a denominator on the page.
const AR_SCOPES = [
  { key: 'all',      label: 'All Product' },
  { key: 'new',      label: 'New Construction' },
  { key: 'existing', label: 'Existing' }
];

function arScopeBar() {
  const btns = AR_SCOPES.map(s =>
    `<button class="ar-toggle-btn${s.key === 'all' ? ' active' : ''}" data-scope="${s.key}"
       aria-pressed="${s.key === 'all'}">${s.label}</button>`).join('');
  return `<div class="ar-controls">
    <span class="ar-controls-label">View</span>
    <span class="ar-toggle" role="group" aria-label="Product segment">${btns}</span>
    <button class="ar-pdf-btn" id="ar-pdf" type="button">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>Download PDF</button>
    <span class="ar-pdf-hint">One page, letter landscape &middot; choose “Save as PDF”
      and untick “Headers and footers”</span>
  </div>`;
}

// ── Section 1: summary statistics ────────────────────────────────────────────
// The source report carries Jul-25 and YTD-25 columns, but 949 of the 991
// July-2025 Ada closings have no close_price recorded (95.8%). Every 2025 price
// and dollar-volume figure is therefore computed on a ~4% sample. Those columns
// are rendered behind a toggle and marked, and the derived percent-change values
// that depend on them are withheld rather than published.
const AR_UNRELIABLE_2025 = true;

// The source defines new construction as assessor year built >= 2025 — a FIXED
// threshold, not a rolling one. So the Jul-26 / YTD-26 "new" bucket holds two
// build vintages (2025 and 2026) while the Jul-25 / YTD-25 bucket holds one
// (2025). Unit growth across those columns is therefore mostly definitional,
// and the same reclassification drains the existing bucket by the same homes.
//
// Checked against main.gold_mls.search_listings (Ada + Canyon, SOLD, single
// family, 25 ZIPs, recomputed 2026-08-21 for the Ada+Canyon report): of the
// 3,501 YTD-26 sales built >= 2025, 2,206 were built in 2025 — 63% of the
// bucket is prior-vintage carryover the 2025 column cannot contain.
// Like-for-like current-vintage sales went 1,426 -> 1,295 (-9.2%); on a rolling
// "built this year or last" definition, 3,183 -> 3,501 (+10.0%) against a total
// market of +13.1%. The source's +153.4% is an artifact of the fixed threshold.
const AR_VINTAGE_SHIFT = true;
const AR_VINTAGE_TITLE =
  'Not comparable: the source defines new construction as year built >= 2025, a fixed '
  + 'threshold, so the 2026 columns span two build vintages and the 2025 columns span one. '
  + 'On a rolling definition Ada + Canyon new-construction sales grew ~10% YTD, in line '
  + 'with the market, not 153.4%.';

// Unit-count changes are safe for the county total — the vintage threshold only
// moves homes between the new and existing buckets, it does not add or remove
// sales — so only those two bands are suppressed.
function arCountNotComparable(key, label) {
  return AR_VINTAGE_SHIFT && /homes sold/i.test(label) && (key === 'new' || key === 'existing');
}

function arRowIsPrice(label) {
  return /price|volume/i.test(label);
}

function arSummaryTable(key) {
  const t = ADA_REPORT.summary[key];
  const s = AR_SERIES[key];
  const body = t.rows.map(r => {
    const isPrice = arRowIsPrice(r.label);
    const isDom = /days on market/i.test(r.label);
    const isVol = /volume/i.test(r.label);
    const fmt = v => isDom ? arNum(v, 1) : (isPrice ? (isVol ? arMoneyK(v) : arMoney(v)) : arNum(v));

    // Withhold change vs. 2025 for any price/volume row — the base is a 4% sample.
    const suppress = AR_UNRELIABLE_2025 && isPrice;
    // ...and for the new/existing unit counts, where the fixed vintage
    // threshold makes the two years measure different things.
    const notComp = arCountNotComparable(key, r.label);
    const chg = r.pct ? r.pct[0] : null;
    const chgYtd = r.pct ? r.pct[1] : null;
    const deltaCell = v => suppress
      ? '<span class="ar-withheld" title="Base period is a 4% sample — withheld">withheld</span>'
      : notComp
        ? `<span class="ar-notcomp" title="${AR_VINTAGE_TITLE}">not comparable</span>`
        : arDelta(v, isDom);

    return `<tr>
      <td class="ar-rowlab">${r.label}</td>
      <td class="ar-figure">${fmt(r.vals[0])}</td>
      <td>${deltaCell(chg)}</td>
      <td class="ar-figure">${fmt(r.vals[1])}</td>
      <td>${deltaCell(chgYtd)}</td>
      <td class="ar-figure ar-prev12">${fmt(r.vals[4])}</td>
      <td class="ar-figure ar-y2025">${fmt(r.vals[2])}</td>
      <td class="ar-figure ar-y2025">${fmt(r.vals[3])}</td>
    </tr>`;
  }).join('');

  return `<div class="ar-tablecard ar-seg" data-seg="${key}">
    <div class="ar-tablecard-head">
      <span class="ar-swatch" style="background:${s.color}"></span>
      <span class="ar-tablecard-title">${s.label}</span>
    </div>
    <div class="ar-scroll">
    <table class="data-table ar-table">
      <thead><tr>
        <th>Metric</th><th class="ar-figure">Jul-26</th><th>vs Jul-25</th>
        <th class="ar-figure">YTD 26</th><th>vs YTD 25</th>
        <th class="ar-figure ar-prev12">Prev 12 Mths</th>
        <th class="ar-figure ar-y2025">Jul-25</th><th class="ar-figure ar-y2025">YTD 25</th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table>
    </div>
  </div>`;
}

// ── KPI tiles ────────────────────────────────────────────────────────────────
function arKpiRow() {
  const pick = key => {
    const rows = ADA_REPORT.summary[key].rows;
    const find = re => rows.find(r => re.test(r.label));
    return {
      sold: find(/homes sold/i),
      median: find(/median price/i),
      dom: find(/days on market/i),
      active: find(/active residential/i),
      pending: find(/pending residential/i)
    };
  };
  return ['total', 'existing', 'new'].map(key => {
    const s = AR_SERIES[key], m = pick(key);
    return `<div class="ar-kpi ar-seg" data-seg="${key}" style="--ar-accent:${s.color}">
      <div class="ar-kpi-label"><span class="ar-swatch" style="background:${s.color}"></span>${s.label}</div>
      <div class="ar-kpi-value">${arNum(m.sold.vals[0])}<span class="ar-kpi-unit">sold · Jul-26</span></div>
      <div class="ar-kpi-delta">${arCountNotComparable(key, m.sold.label)
        ? `<span class="ar-notcomp" title="${AR_VINTAGE_TITLE}">not comparable vs Jul-25</span>`
        : `${arDelta(m.sold.pct ? m.sold.pct[0] : null)} vs Jul-25 units`}</div>
      <div class="ar-kpi-grid">
        <div><span>Median</span><b>${arMoney(m.median.vals[0])}</b></div>
        <div><span>DOM</span><b>${arNum(m.dom.vals[0], 1)}</b></div>
        <div><span>Active</span><b>${arNum(m.active.vals[0])}</b></div>
        <div><span>Pending</span><b>${arNum(m.pending.vals[0])}</b></div>
      </div>
    </div>`;
  }).join('');
}

// ── Section 2: sales by MLS area ─────────────────────────────────────────────
// The source report carries several defects that a correct aggregation cannot
// produce. They are detected here rather than listed by hand: a hardcoded list
// goes stale silently the first time the notebook is rerun, and these are all
// checkable from the numbers themselves.
//
//   · new + existing must equal the area total;
//   · a price cannot be reported against zero units;
//   · with one unit, average must equal median;
//   · two areas sharing an exact median and a near-exact average is a copied
//     row, not a coincidence.
//
// Returns { areaCode: [reason, ...] }.
function arAreaAudit() {
  const out = {};
  const add = (code, msg) => { (out[code] = out[code] || []).push(msg); };
  const bands = ['total', 'new', 'existing'];

  ADA_REPORT.areas.forEach(a => {
    const sum = a.new.sold + a.existing.sold;
    if (sum !== a.total.sold) {
      add(a.code, `New + Existing = ${sum} against ${a.total.sold} sold `
                + `(${sum > a.total.sold ? '+' : ''}${sum - a.total.sold})`);
    }
    bands.forEach(k => {
      const s = a[k];
      if (!s) return;
      if (s.sold === 0 && (s.avg != null || s.med != null)) {
        add(a.code, `${AR_SERIES[k].label}: price reported against zero units`);
      }
      if (s.sold === 1 && s.avg != null && s.med != null && s.avg !== s.med) {
        add(a.code, `${AR_SERIES[k].label}: one unit, but average ≠ median`);
      }
    });
  });

  // Copied rows. Group by band + median, then require the averages to agree to
  // within $100 — median alone repeats legitimately across areas.
  const byMed = {};
  ADA_REPORT.areas.forEach(a => bands.forEach(k => {
    const s = a[k];
    if (!s || !s.sold || s.med == null || s.avg == null) return;
    (byMed[k + '|' + s.med] = byMed[k + '|' + s.med] || []).push({ a, s, k });
  }));
  Object.values(byMed).forEach(list => {
    if (list.length < 2) return;
    list.forEach(({ a, s, k }) => {
      const twins = list.filter(o => o.a !== a && Math.abs(o.s.avg - s.avg) < 100);
      if (twins.length) {
        add(a.code, `${AR_SERIES[k].label}: average and median duplicate `
                  + `${twins.map(o => o.a.name).join(', ')}`);
      }
    });
  });

  return out;
}

// Under 'all' the bar cell splits new vs existing. Under a single segment it
// shows that segment's share of its own county total, so bar length stays
// comparable down the column instead of silently changing meaning.
function arAreaSection(scope = 'all') {
  const T = ADA_REPORT.areaTotals;
  const seg = a => scope === 'new' ? a.new : scope === 'existing' ? a.existing : a.total;
  // Ordered by the metric on display; sorting by total under a segment scope
  // yields a column that looks ranked but isn't.
  const areas = ADA_REPORT.areas.slice().sort((a, b) => seg(b).sold - seg(a).sold);
  const segT = scope === 'new' ? T.new : scope === 'existing' ? T.existing : T.total;
  const maxSold = Math.max(...areas.map(a => seg(a).sold), 1);
  const segColor = scope === 'new' ? MR.blue : scope === 'existing' ? MR.slate : MR.purple;

  const audit = arAreaAudit();

  const rows = areas.map(a => {
    const issues = audit[a.code];
    const s = seg(a);
    const w = v => Math.max(v ? 1 : 0, (v / maxSold) * 100);
    const flag = issues
      ? ` <span class="ar-flag" title="${issues.join(' · ')}">⚑</span>`
      : '';
    // Only tint the price cells when the defect is actually about prices; a
    // count mismatch says nothing about whether the average is right.
    const priceIssue = issues && issues.some(m => /price|average|median/i.test(m));
    const sc = priceIssue ? ' ar-suspect' : '';

    const bar = scope === 'all'
      ? `<div class="ar-bar-wrap" title="${a.new.sold} new · ${a.existing.sold} existing">
           <div class="ar-bar ar-bar-new" style="width:${w(a.new.sold)}%"></div>
           <div class="ar-bar ar-bar-ex" style="width:${w(a.existing.sold)}%"></div>
         </div>`
      : `<div class="ar-bar-wrap" title="${s.sold} ${scope === 'new' ? 'new' : 'existing'}">
           <div class="ar-bar" style="width:${w(s.sold)}%;background:${segColor}"></div>
         </div>`;

    const mid = scope === 'all'
      ? `<td class="ar-figure"><b>${a.total.sold}</b></td>
         <td class="ar-figure" style="color:${MR.blue}">${a.new.sold}</td>
         <td class="ar-figure" style="color:${MR.slate}">${a.existing.sold}</td>
         <td class="ar-figure">${arPct(a.total.sold ? (a.new.sold / a.total.sold) * 100 : 0)}</td>
         <td class="ar-figure">${arPct(a.total.pct)}</td>`
      : `<td class="ar-figure" style="color:${segColor}"><b>${s.sold}</b></td>
         <td class="ar-figure">${arPct(s.pct)}</td>
         <td class="ar-figure">${a.total.sold}</td>
         <td class="ar-figure">${arPct(a.total.sold ? (s.sold / a.total.sold) * 100 : 0)}</td>`;

    return `<tr data-area="${a.code}">
      <td class="ar-rowlab">${a.name}${flag}</td>
      <td class="ar-figure">${a.code}</td>
      <td class="ar-barcell">${bar}</td>
      ${mid}
      <td class="ar-figure${sc}">${arMoney(s.avg)}</td>
      <td class="ar-figure${sc}">${arMoney(s.med)}</td>
    </tr>`;
  }).join('');

  const head = scope === 'all'
    ? `<th class="ar-figure">Sold</th><th class="ar-figure">New</th>
       <th class="ar-figure">Existing</th><th class="ar-figure">New %</th>
       <th class="ar-figure">Mkt %</th>`
    : `<th class="ar-figure">Sold</th><th class="ar-figure">% of Segment</th>
       <th class="ar-figure">Area Total</th><th class="ar-figure">Share of Area</th>`;

  const foot = scope === 'all'
    ? `<td class="ar-figure"><b>${arNum(T.total.sold)}</b></td>
       <td class="ar-figure" style="color:${MR.blue}"><b>${arNum(T.new.sold)}</b></td>
       <td class="ar-figure" style="color:${MR.slate}"><b>${arNum(T.existing.sold)}</b></td>
       <td class="ar-figure">${arPct(T.new.sold / T.total.sold * 100)}</td>
       <td class="ar-figure">100.0%</td>`
    : `<td class="ar-figure" style="color:${segColor}"><b>${arNum(segT.sold)}</b></td>
       <td class="ar-figure">100.0%</td>
       <td class="ar-figure">${arNum(T.total.sold)}</td>
       <td class="ar-figure">${arPct(segT.sold / T.total.sold * 100)}</td>`;

  const legend = scope === 'all'
    ? `<i class="ar-swatch" style="background:${MR.blue}"></i>New
       <i class="ar-swatch" style="background:${MR.slate}"></i>Existing`
    : `<i class="ar-swatch" style="background:${segColor}"></i>${AR_SERIES[scope].label}`;

  return `<div class="ar-tablecard">
    <div class="ar-tablecard-head">
      <span class="ar-tablecard-title">Sales by IMLS Area — ${ADA_REPORT.period}</span>
      <span class="ar-legend">${legend}</span>
    </div>
    <div class="ar-scroll">
    <table class="data-table ar-table ar-area-table">
      <thead><tr>
        <th>MLS Area</th><th class="ar-figure">Code</th><th style="width:150px">Mix</th>
        ${head}
        <th class="ar-figure">Avg Price</th><th class="ar-figure">Median</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr>
        <td class="ar-rowlab"><b>All areas</b></td><td class="ar-figure">—</td><td></td>
        ${foot}
        <td class="ar-figure"><b>${arMoney(segT.avg)}</b></td>
        <td class="ar-figure">—</td>
      </tr></tfoot>
    </table>
    </div>
  </div>`;
}

// Written from arAreaAudit() rather than prose, so it cannot drift from the ⚑
// flags in the table above or go stale when the notebook is rerun.
function arAuditCallout() {
  const audit = arAreaAudit();
  const name = code => (ADA_REPORT.areas.find(a => a.code === code) || {}).name || code;
  const codes = Object.keys(audit);
  if (!codes.length) return '';

  const isCount = m => /New \+ Existing/.test(m);
  const countAreas = codes.filter(c => audit[c].some(isCount));
  const priceAreas = codes.filter(c => audit[c].some(m => !isCount(m)));

  const T = ADA_REPORT.areaTotals;
  const bandSum = T.new.sold + T.existing.sold;
  const list = cs => cs.map(c => `${name(c)} (${c})`).join(', ');

  const countPara = countAreas.length ? `
    <b>${countAreas.length} of ${ADA_REPORT.areas.length} areas do not add up.</b>
    New + Existing ≠ Sold for ${list(countAreas)}. The gaps run in both directions and net to
    ${bandSum - T.total.sold}, so the county band totals below the table read
    ${arNum(T.new.sold)} new + ${arNum(T.existing.sold)} existing =
    ${arNum(bandSum)} against ${arNum(T.total.sold)} sold — while Sections 1 and 3 both split
    the same month as ${arNum(T.new.sold + 1)} + ${arNum(T.existing.sold + 1)}.
    This is not the two unassigned-area sales it has previously been attributed to: the Sold
    column sums to the full ${arNum(T.total.sold)}, and a sale missing an area would drop out
    of all three columns at once.` : '';

  const pricePara = priceAreas.length ? `
    <b>Price defects.</b> ${priceAreas.map(c =>
      `<em>${name(c)} (${c})</em> — ${audit[c].filter(m => !isCount(m)).join('; ')}`).join('. ')}.` : '';

  return `<div class="ar-callout ar-callout-note">
    ${countPara}${countPara && pricePara ? '<br><br>' : ''}${pricePara}
    <br><br>Every one of these originates in
    <code>data_science.compass_db.ada_county_report_csv</code>; the figures above reproduce the
    source faithfully. They need fixing in the generating notebook. Treat flagged area prices as
    provisional and area counts as ±1.
  </div>`;
}

// ── Section 3: units sold by price class ─────────────────────────────────────
// Rows are rebuilt on both the period toggle and the scope toggle, so the
// builder is shared rather than duplicated in the event handler.
function arPriceClassRows(which, scope = 'all') {
  const data = which === 'jul' ? ADA_REPORT.priceClassJul : ADA_REPORT.priceClassYtd;
  const showNew = scope !== 'existing', showEx = scope !== 'new';
  // Bars are scaled against the largest bar actually on screen, so narrowing to
  // one segment re-fills the column instead of leaving every bar half-length.
  const max = Math.max(...data.map(r => Math.max(showNew ? r.new : 0, showEx ? r.ex : 0)), 1);

  return data.map(r => {
    const shown = (showNew ? r.new : 0) + (showEx ? r.ex : 0);
    const newCells = showNew
      ? `<td class="ar-figure" style="color:${MR.blue}">${r.new || '—'}</td>
         <td class="ar-figure">${r.new ? arPct(r.newPct) : '—'}</td>` : '';
    const exCells = showEx
      ? `<td class="ar-figure" style="color:${MR.slate}">${r.ex || '—'}</td>
         <td class="ar-figure">${r.ex ? arPct(r.exPct) : '—'}</td>` : '';
    const bar = `<td class="ar-barcell">
        <div class="ar-bar-wrap ar-bar-split">
          ${showNew ? `<div class="ar-bar ar-bar-new" style="width:${(r.new / max) * 100}%"></div>` : ''}
          ${showEx ? `<div class="ar-bar ar-bar-ex" style="width:${(r.ex / max) * 100}%"></div>` : ''}
        </div>
      </td>`;
    // "All" is a butterfly: New | bars | Existing. With one segment there is no
    // second wing to balance, so the bars trail the figures they belong to.
    const body = showNew && showEx ? newCells + bar + exCells : newCells + exCells + bar;
    return `<tr class="${shown ? '' : 'ar-empty'}">
      <td class="ar-rowlab">${r.range}</td>
      ${body}
    </tr>`;
  }).join('');
}

function arPriceClassSection(scope = 'all', which = 'jul') {
  const showNew = scope !== 'existing', showEx = scope !== 'new';
  const legend = scope === 'all'
    ? `<i class="ar-swatch" style="background:${MR.blue}"></i>New
       <i class="ar-swatch" style="background:${MR.slate}"></i>Existing`
    : `<i class="ar-swatch" style="background:${showNew ? MR.blue : MR.slate}"></i>${AR_SERIES[scope].label}`;

  return `<div class="ar-tablecard">
    <div class="ar-tablecard-head">
      <span class="ar-tablecard-title">Units Sold by Price Class</span>
      <span class="ar-toggle" role="group" aria-label="Period">
        <button class="ar-toggle-btn${which === 'jul' ? ' active' : ''}" data-pc="jul">${ADA_REPORT.period}</button>
        <button class="ar-toggle-btn${which === 'ytd' ? ' active' : ''}" data-pc="ytd">Year to Date</button>
      </span>
      <span class="ar-legend">${legend}</span>
    </div>
    <div class="ar-scroll">
    <table class="data-table ar-table">
      <thead><tr>
        <th>Sales Price Range</th>
        ${showNew && showEx
          ? '<th class="ar-figure">New</th><th class="ar-figure">New %</th>'
            + '<th style="width:170px">Distribution</th>'
            + '<th class="ar-figure">Existing</th><th class="ar-figure">Existing %</th>'
          : (showNew ? '<th class="ar-figure">New</th><th class="ar-figure">New %</th>'
                     : '<th class="ar-figure">Existing</th><th class="ar-figure">Existing %</th>')
            + '<th style="width:170px">Distribution</th>'}
      </tr></thead>
      <tbody id="ar-pc-body">${arPriceClassRows(which, scope)}</tbody>
    </table>
    </div>
  </div>`;
}

// ── New-construction market dynamics (trailing 12 months) ────────────────────
function arNcTierSection() {
  const T = ADA_REPORT.ncTotals;
  const rows = ADA_REPORT.ncTiers.map(r => {
    const dead = !r.sold && !r.active && !r.pending;
    return `<tr class="${dead ? 'ar-empty' : ''}">
      <td class="ar-rowlab">${r.tier}</td>
      <td class="ar-figure">${r.active || '—'}</td>
      <td class="ar-figure">${r.pending || '—'}</td>
      <td class="ar-figure">${r.sold || '—'}</td>
      <td class="ar-figure">${r.moi == null ? '—' : r.moi.toFixed(1)}</td>
      <td class="ar-figure">${arMoney(r.orig)}</td>
      <td class="ar-figure">${arMoney(r.soldPrice)}</td>
      <td class="ar-figure">${r.ratio == null ? '—' : (r.ratio * 100).toFixed(1) + '%'}</td>
      <td class="ar-figure">${arNum(r.sqft)}</td>
      <td class="ar-figure">${r.psf == null ? '—' : '$' + r.psf.toFixed(2)}</td>
      <td class="ar-figure">${arNum(r.cdom)}</td>
    </tr>`;
  }).join('');

  return `<div class="ar-tablecard">
    <div class="ar-tablecard-head">
      <span class="ar-swatch" style="background:${MR.blue}"></span>
      <span class="ar-tablecard-title">New Construction Market Dynamics — by price tier</span>
      <span class="ar-tablecard-note">Trailing 12 months · Aug 1 2025 – Jul 31 2026</span>
    </div>
    <div class="ar-scroll">
    <table class="data-table ar-table">
      <thead>
        <tr>
          <th rowspan="2">Price Tier</th>
          <th class="ar-figure" colspan="2">Current</th>
          <th class="ar-figure">12 Mths</th>
          <th class="ar-figure" colspan="7">Average based on 12-month solds</th>
        </tr>
        <tr>
          <th class="ar-figure">Active</th><th class="ar-figure">Pending</th>
          <th class="ar-figure">Sold</th><th class="ar-figure">Mos. Inv.</th>
          <th class="ar-figure">List Price</th><th class="ar-figure">Sold Price</th>
          <th class="ar-figure">SP/LP</th><th class="ar-figure">Avg SqFt</th>
          <th class="ar-figure">$/SqFt</th><th class="ar-figure">CDOM</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td class="ar-rowlab"><b>Total</b></td>
          <td class="ar-figure"><b>${arNum(T.active)}</b></td>
          <td class="ar-figure"><b>${arNum(T.pending)}</b></td>
          <td class="ar-figure"><b>${arNum(T.sold)}</b></td>
          <td class="ar-figure"><b>${T.moi.toFixed(1)}</b></td>
          <td colspan="6"></td>
        </tr>
        <tr>
          <td class="ar-rowlab"><b>Average price</b></td>
          <td class="ar-figure">${arMoney(T.avgActive)}</td>
          <td class="ar-figure">${arMoney(T.avgPending)}</td>
          <td class="ar-figure">${arMoney(T.soldPrice)}</td>
          <td class="ar-figure">—</td>
          <td class="ar-figure">${arMoney(T.orig)}</td>
          <td class="ar-figure">${arMoney(T.soldPrice)}</td>
          <td class="ar-figure">${(T.ratio * 100).toFixed(1)}%</td>
          <td class="ar-figure">${arNum(T.sqft)}</td>
          <td class="ar-figure">$${T.psf.toFixed(2)}</td>
          <td class="ar-figure">${arNum(T.cdom)}</td>
        </tr>
      </tfoot>
    </table>
    </div>
  </div>`;
}

// ── 13-month trend ───────────────────────────────────────────────────────────
// Two measures of different scale (monthly sales in the hundreds, standing
// inventory in the thousands) get two stacked panels sharing one x-axis — never
// one plot with two y-scales.
function arTrendChart() {
  const d = ADA_REPORT.ncMonthly;
  const W = 720, PAD_L = 46, PAD_R = 12;
  const H1 = 178, H2 = 104, GAP = 18, XAXIS = 22;
  const PAD_T1 = 22, PAD_T2 = 20;
  const H = H1 + GAP + H2 + XAXIS;
  const iw = W - PAD_L - PAD_R;
  const slot = iw / d.length;
  const bw = Math.min(13, slot * 0.30);
  const label = m => m.replace(', ', "'");

  // ── Panel 1: closed vs pending sales, one shared units axis ──
  const maxBar = Math.max(...d.map(m => Math.max(m.closed, m.pending)));
  const nice1 = Math.ceil(maxBar / 100) * 100;
  const ih1 = H1 - PAD_T1;
  let bars = '', grid1 = '';
  for (let g = 0; g <= 3; g++) {
    const y = PAD_T1 + ih1 - (ih1 * g / 3);
    grid1 += `<line class="ar-grid" x1="${PAD_L}" y1="${y.toFixed(1)}" x2="${W - PAD_R}" y2="${y.toFixed(1)}"/>
      <text class="ar-axis" x="${PAD_L - 8}" y="${(y + 3).toFixed(1)}" text-anchor="end">${Math.round(nice1 * g / 3)}</text>`;
  }
  d.forEach((m, i) => {
    const x = PAD_L + i * slot + slot / 2;
    const hc = (m.closed / nice1) * ih1, hp = (m.pending / nice1) * ih1;
    // 2px surface gap between adjacent fills; rounded data-end on the baseline.
    bars += `<rect class="ar-mark" x="${(x - bw - 1).toFixed(1)}" y="${(PAD_T1 + ih1 - hc).toFixed(1)}" width="${bw}" height="${hc.toFixed(1)}" rx="3" fill="${MR.blue}"><title>${m.m} · Closed ${m.closed}</title></rect>`;
    bars += `<rect class="ar-mark" x="${(x + 1).toFixed(1)}" y="${(PAD_T1 + ih1 - hp).toFixed(1)}" width="${bw}" height="${hp.toFixed(1)}" rx="3" fill="${MR.slate}"><title>${m.m} · Pending ${m.pending}</title></rect>`;
  });

  // ── Panel 2: active listings, its own axis, zero-based ──
  const top2 = H1 + GAP;
  const maxAct = Math.max(...d.map(m => m.active));
  const nice2 = Math.ceil(maxAct / 500) * 500;
  const ih2 = H2 - PAD_T2;
  let grid2 = '';
  [0, 1].forEach(g => {
    const y = top2 + PAD_T2 + ih2 - (ih2 * g);
    grid2 += `<line class="ar-grid" x1="${PAD_L}" y1="${y.toFixed(1)}" x2="${W - PAD_R}" y2="${y.toFixed(1)}"/>
      <text class="ar-axis" x="${PAD_L - 8}" y="${(y + 3).toFixed(1)}" text-anchor="end">${g ? nice2.toLocaleString() : 0}</text>`;
  });
  const pts = d.map((m, i) => [
    PAD_L + i * slot + slot / 2,
    top2 + PAD_T2 + ih2 - (m.active / nice2) * ih2,
    m.active, m.m
  ]);
  const line = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  // Direct-label the endpoints only; every point still gets a hover target.
  const hovers = pts.map(p =>
    `<circle class="ar-mark" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="8" fill="transparent"><title>${p[3]} · ${p[2].toLocaleString()} active</title></circle>`).join('');
  const ends = [pts[0], pts[pts.length - 1]].map((p, i) =>
    `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${MR.amber}" stroke="var(--surface)" stroke-width="2"/>
     <text class="ar-axis ar-axis-strong" x="${(p[0] + (i ? -6 : 6)).toFixed(1)}" y="${(p[1] - 9).toFixed(1)}" text-anchor="${i ? 'end' : 'start'}">${p[2].toLocaleString()}</text>`).join('');

  const ticks = d.map((m, i) =>
    `<text class="ar-axis" x="${(PAD_L + i * slot + slot / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${label(m.m)}</text>`).join('');

  return `<div class="ar-tablecard">
    <div class="ar-tablecard-head">
      <span class="ar-tablecard-title">New Construction — 13-month trend</span>
      <span class="ar-legend">
        <i class="ar-swatch" style="background:${MR.blue}"></i>Closed
        <i class="ar-swatch" style="background:${MR.slate}"></i>Pending
        <i class="ar-swatch ar-swatch-line" style="background:${MR.amber}"></i>Active
      </span>
    </div>
    <div class="ar-scroll">
      <svg class="ar-chart" viewBox="0 0 ${W} ${H}" role="img"
           aria-label="Monthly closed and pending new-construction sales, with standing active listings shown on a separate panel">
        <text class="ar-axis ar-panel-label" x="${PAD_L}" y="9">MONTHLY SALES (UNITS)</text>
        ${grid1}${bars}
        <text class="ar-axis ar-panel-label" x="${PAD_L}" y="${top2 + 8}">ACTIVE LISTINGS AT MONTH END</text>
        ${grid2}
        <polyline points="${line}" fill="none" stroke="${MR.amber}" stroke-width="2"
                  stroke-linejoin="round" stroke-linecap="round"/>
        ${ends}${hovers}${ticks}
      </svg>
    </div>
    <div class="ar-chart-note">Sales and standing inventory are different measures on different scales,
      so they get two panels on a shared time axis rather than two y-axes on one plot. Active counts are
      reconstructed from listing dates; the current-status snapshot in the table above reads
      ${ADA_REPORT.ncTotals.active.toLocaleString()}.</div>
  </div>`;
}

// ── Assembly ─────────────────────────────────────────────────────────────────
function buildAdaMarketReport() {
  if (typeof ADA_REPORT === 'undefined') return document.createComment('ADA_REPORT missing');

  const wrap = arEl('div', 'ar-report');
  const cov = ADA_REPORT.coverage;
  const missPct = (cov.jul25MissingClosePrice / cov.jul25Sold * 100).toFixed(1);

  wrap.innerHTML = `
    <div class="ar-header">
      ${arBrandLockup()}
      <div class="ar-header-titles">
        <div class="ar-title">Ada &amp; Canyon County Single-Family Residential Market Report</div>
        <div class="ar-subtitle">${ADA_REPORT.period} · ${ADA_REPORT.county}</div>
      </div>
      <div class="ar-accentbar">
        <i style="background:${MR.blue}"></i><i style="background:${MR.purple}"></i>
        <i style="background:${MR.orange}"></i><i style="background:${MR.amber}"></i>
        <i style="background:${MR.green}"></i><i style="background:${MR.slate}"></i>
      </div>
    </div>

    <div class="ar-callout ar-callout-warn">
      <b>Read the 2025 comparisons with care.</b> ${cov.jul25MissingClosePrice} of the
      ${cov.jul25Sold.toLocaleString()} July-2025 Ada + Canyon closings (${missPct}%) have no close
      price recorded, so every 2025 price and dollar-volume figure in the source report is
      computed on a ~4% sample. Unit counts for 2025 are sound; prices are not. Price and volume changes against
      2025 are withheld below, and the 2025 columns are hidden by default.
      <button class="ar-linkbtn" id="ar-toggle-2025">Show 2025 columns</button>
    </div>

    <div class="ar-callout ar-callout-warn">
      <b>New-construction growth vs 2025 is not a like-for-like comparison.</b>
      The source classifies new construction by assessor year built <b>≥ 2025</b> — a fixed
      threshold, not a rolling one. The 2026 columns therefore span two build vintages
      (2025 and 2026) while the 2025 columns span one, and the same reclassification moves
      homes out of the existing bucket. A house built in 2025 and resold in July 2026 counts
      as new construction.
      <br><br>
      Cross-checked against <code>main.gold_mls.search_listings</code> (Ada + Canyon, sold,
      single family, 25 ZIPs): of the 3,501 YTD-26 sales built ≥ 2025, <b>2,206 were built in
      2025</b> — 63% of the bucket is carryover the 2025 column cannot contain. Comparing like
      with like, current-vintage sales went <b>1,426 → 1,295 (−9.2%)</b>; on a rolling “built
      this year or last” definition, <b>3,183 → 3,501 (+10.0%)</b>, against a total market of
      +13.1%. New construction has held a steady <b>~38% share both years</b> — it did not
      climb from 16.6% to 37.3%. Unit-count changes for the new and existing bands are marked
      <span class="ar-notcomp">not comparable</span> below; the county total is unaffected,
      because the threshold only moves sales between buckets.
    </div>

    ${arScopeBar()}

    <div class="ar-kpirow">${arKpiRow()}</div>

    <div class="ar-blocktitle">Section 1 · Summary Statistics</div>
    ${arSummaryTable('total')}
    ${arSummaryTable('existing')}
    ${arSummaryTable('new')}

    <div class="ar-blocktitle">Section 2 · Sales by IMLS Area</div>
    <div id="ar-area-host">${arAreaSection('all')}</div>
    ${arAuditCallout()}

    <div class="ar-blocktitle">Section 3 · Units Sold by Price Class</div>
    <div id="ar-pc-host">${arPriceClassSection('all')}</div>

    <div class="ar-blocktitle ar-seg" data-seg="new">Section 4 · New Construction Market Dynamics</div>
    <div class="ar-seg" data-seg="new">
      ${arNcTierSection()}
      ${arTrendChart()}
    </div>
    <div class="ar-callout ar-callout-note ar-existing-only" hidden>
      <b>Section 4 is new-construction only.</b> The trailing-12-month tier table and 13-month
      trend are cut from the new-construction listing set; there is no equivalent existing-home
      tier series in <code>ADA_REPORT</code>, so the section is hidden under this view rather
      than shown with new-construction numbers under an “Existing” label.
    </div>

    <div class="ar-callout ar-callout-note">
      <b>Sources & method.</b> Sections 1–3 come from
      <code>data_science.compass_db.ada_canyon_county_report_csv</code> (${ADA_REPORT.period} run,
      generated ${ADA_REPORT.generated}) and cover <b>Ada and Canyon County</b> — 24 IMLS areas.
      <b style="color:var(--mr-amber)">Section 4 is still ${ADA_REPORT.ncScope || 'Ada County only'}</b>
      and was not regenerated by that notebook, so its totals do not tie to Sections 1–3.
      It is a trailing-12-month cut of <code>data_analytics.dev.dim_listing</code> joined to
      <code>main.gold_polaris.dim_property</code> for year built, filtered to Ada County single
      family / townhouse / condo with at least 1 bed, 1 bath and a $2K price floor.
      <b>New construction is defined by assessor year built ≥ 2025, not by the IMLS
      <em>NewConstructionYN</em> flag.</b> IMLS publishes that flag, but it is not ingested into
      the Compass warehouse — <code>main.silver_mls.listing_idaho_imls</code> is a 69-column RESO
      subset carrying neither <em>NewConstructionYN</em> nor <em>YearBuilt</em>, and the only
      <code>is_new_construction_flag</code> in the warehouse sits on DMS tables (Compass-listed
      inventory only, 71% null). Year built therefore misses a spec home listed in 2026 but
      recorded as built 2024, and includes a 2025-built resale IMLS would not flag as new
      construction. <em>List Price</em> is the list price of record —
      <code>dim_listing</code> stores one list price, so SP/LP is not a true
      sold-to-original-list ratio. Distressed share is not carried in these tables. Counts differ
      slightly between sections because Section 4 uses a 12-month close window while Sections 1–3
      use calendar July and YTD. Generated ${ADA_REPORT.generated}.
    </div>
  `;

  // 2025 column reveal
  const btn = wrap.querySelector('#ar-toggle-2025');
  btn.addEventListener('click', () => {
    const on = wrap.classList.toggle('ar-show-2025');
    btn.textContent = on ? 'Hide 2025 columns' : 'Show 2025 columns';
  });

  // Price-class period toggle. Delegated, because the card is re-rendered
  // whenever the scope changes and a bound listener would go with it.
  let arScope = 'all';
  let arPeriod = 'jul';
  const pcHost = wrap.querySelector('#ar-pc-host');
  const areaHost = wrap.querySelector('#ar-area-host');

  pcHost.addEventListener('click', e => {
    const b = e.target.closest('.ar-toggle-btn[data-pc]');
    if (!b) return;
    arPeriod = b.dataset.pc;
    pcHost.querySelectorAll('.ar-toggle-btn[data-pc]').forEach(x =>
      x.classList.toggle('active', x === b));
    pcHost.querySelector('#ar-pc-body').innerHTML = arPriceClassRows(arPeriod, arScope);
  });

  // Product-segment scope
  wrap.querySelectorAll('.ar-toggle-btn[data-scope]').forEach(b => {
    b.addEventListener('click', () => {
      arScope = b.dataset.scope;
      wrap.querySelectorAll('.ar-toggle-btn[data-scope]').forEach(x => {
        const on = x === b;
        x.classList.toggle('active', on);
        x.setAttribute('aria-pressed', String(on));
      });
      // Scope drives visibility of the tagged blocks via CSS...
      wrap.classList.remove('ar-scope-all', 'ar-scope-new', 'ar-scope-existing');
      wrap.classList.add('ar-scope-' + arScope);
      wrap.querySelector('.ar-existing-only').hidden = arScope !== 'existing';
      // ...and a rebuild of the two tables whose columns actually change.
      areaHost.innerHTML = arAreaSection(arScope);
      pcHost.innerHTML = arPriceClassSection(arScope, arPeriod);
    });
  });

  // PDF export — reflects whatever scope is on screen.
  const pdfBtn = wrap.querySelector('#ar-pdf');
  pdfBtn.addEventListener('click', () => {
    if (typeof adaReportPdf !== 'function') return;
    const ok = adaReportPdf(arScope);
    if (!ok) {
      pdfBtn.textContent = 'Popup blocked — allow popups';
      setTimeout(() => { pdfBtn.innerHTML = pdfBtn.dataset.label; }, 3200);
    }
  });
  pdfBtn.dataset.label = pdfBtn.innerHTML;

  wrap.classList.add('ar-scope-all');
  return wrap;
}
