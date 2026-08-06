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

// ── Section 1: summary statistics ────────────────────────────────────────────
// The source report carries Jul-25 and YTD-25 columns, but 949 of the 991
// July-2025 Ada closings have no close_price recorded (95.8%). Every 2025 price
// and dollar-volume figure is therefore computed on a ~4% sample. Those columns
// are rendered behind a toggle and marked, and the derived percent-change values
// that depend on them are withheld rather than published.
const AR_UNRELIABLE_2025 = true;

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
    const chg = r.pct ? r.pct[0] : null;
    const chgYtd = r.pct ? r.pct[1] : null;

    return `<tr>
      <td class="ar-rowlab">${r.label}</td>
      <td class="ar-figure">${fmt(r.vals[0])}</td>
      <td>${suppress ? '<span class="ar-withheld" title="Base period is a 4% sample — withheld">withheld</span>' : arDelta(chg, isDom)}</td>
      <td class="ar-figure">${fmt(r.vals[1])}</td>
      <td>${suppress ? '<span class="ar-withheld" title="Base period is a 4% sample — withheld">withheld</span>' : arDelta(chgYtd, isDom)}</td>
      <td class="ar-figure ar-prev12">${fmt(r.vals[4])}</td>
      <td class="ar-figure ar-y2025">${fmt(r.vals[2])}</td>
      <td class="ar-figure ar-y2025">${fmt(r.vals[3])}</td>
    </tr>`;
  }).join('');

  return `<div class="ar-tablecard">
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
    return `<div class="ar-kpi" style="--ar-accent:${s.color}">
      <div class="ar-kpi-label"><span class="ar-swatch" style="background:${s.color}"></span>${s.label}</div>
      <div class="ar-kpi-value">${arNum(m.sold.vals[0])}<span class="ar-kpi-unit">sold · Jul-26</span></div>
      <div class="ar-kpi-delta">${arDelta(m.sold.pct ? m.sold.pct[0] : null)} vs Jul-25 units</div>
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
// Two areas in the source (Meridian SE 1000 / Meridian SW 1010) report identical
// average and median prices across different unit counts, which cannot arise
// from a correct aggregation; Boise North 0100 carries a price with zero new
// units. Those cells are flagged rather than silently shown.
const AR_SUSPECT_AREAS = { '1000': true, '1010': true };

function arAreaSection() {
  const maxSold = Math.max(...ADA_REPORT.areas.map(a => a.total.sold));
  const rows = ADA_REPORT.areas.map(a => {
    const suspect = AR_SUSPECT_AREAS[a.code];
    const w = pctW => Math.max(1, (pctW / maxSold) * 100);
    const mix = a.total.sold ? (a.new.sold / a.total.sold) * 100 : 0;
    return `<tr data-area="${a.code}">
      <td class="ar-rowlab">${a.name}${suspect ? ' <span class="ar-flag" title="Average and median price duplicated across Meridian SE / SW in the source — treat as provisional">⚑</span>' : ''}</td>
      <td class="ar-figure">${a.code}</td>
      <td class="ar-barcell">
        <div class="ar-bar-wrap" title="${a.new.sold} new · ${a.existing.sold} existing">
          <div class="ar-bar ar-bar-new" style="width:${w(a.new.sold)}%"></div>
          <div class="ar-bar ar-bar-ex" style="width:${w(a.existing.sold)}%"></div>
        </div>
      </td>
      <td class="ar-figure"><b>${a.total.sold}</b></td>
      <td class="ar-figure" style="color:${MR.blue}">${a.new.sold}</td>
      <td class="ar-figure" style="color:${MR.slate}">${a.existing.sold}</td>
      <td class="ar-figure">${arPct(mix)}</td>
      <td class="ar-figure">${arPct(a.total.pct)}</td>
      <td class="ar-figure${suspect ? ' ar-suspect' : ''}">${arMoney(a.total.avg)}</td>
      <td class="ar-figure${suspect ? ' ar-suspect' : ''}">${arMoney(a.total.med)}</td>
    </tr>`;
  }).join('');

  const T = ADA_REPORT.areaTotals;
  return `<div class="ar-tablecard">
    <div class="ar-tablecard-head">
      <span class="ar-tablecard-title">Sales by IMLS Area — July 2026</span>
      <span class="ar-legend">
        <i class="ar-swatch" style="background:${MR.blue}"></i>New
        <i class="ar-swatch" style="background:${MR.slate}"></i>Existing
      </span>
    </div>
    <div class="ar-scroll">
    <table class="data-table ar-table ar-area-table">
      <thead><tr>
        <th>MLS Area</th><th class="ar-figure">Code</th><th style="width:150px">Mix</th>
        <th class="ar-figure">Sold</th><th class="ar-figure">New</th><th class="ar-figure">Existing</th>
        <th class="ar-figure">New %</th><th class="ar-figure">Mkt %</th>
        <th class="ar-figure">Avg Price</th><th class="ar-figure">Median</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr>
        <td class="ar-rowlab"><b>All areas</b></td><td class="ar-figure">—</td><td></td>
        <td class="ar-figure"><b>${arNum(T.total.sold)}</b></td>
        <td class="ar-figure" style="color:${MR.blue}"><b>${arNum(T.new.sold)}</b></td>
        <td class="ar-figure" style="color:${MR.slate}"><b>${arNum(T.existing.sold)}</b></td>
        <td class="ar-figure">${arPct(T.new.sold / T.total.sold * 100)}</td>
        <td class="ar-figure">100.0%</td>
        <td class="ar-figure"><b>${arMoney(T.total.avg)}</b></td>
        <td class="ar-figure">—</td>
      </tr></tfoot>
    </table>
    </div>
  </div>`;
}

// ── Section 3: units sold by price class ─────────────────────────────────────
function arPriceClassSection() {
  const build = which => {
    const data = which === 'jul' ? ADA_REPORT.priceClassJul : ADA_REPORT.priceClassYtd;
    const max = Math.max(...data.map(r => Math.max(r.new, r.ex)));
    return data.map(r => {
      const empty = r.new === 0 && r.ex === 0;
      return `<tr class="${empty ? 'ar-empty' : ''}">
        <td class="ar-rowlab">${r.range}</td>
        <td class="ar-figure" style="color:${MR.blue}">${r.new || '—'}</td>
        <td class="ar-figure">${r.new ? arPct(r.newPct) : '—'}</td>
        <td class="ar-barcell">
          <div class="ar-bar-wrap ar-bar-split">
            <div class="ar-bar ar-bar-new" style="width:${max ? (r.new / max) * 100 : 0}%"></div>
            <div class="ar-bar ar-bar-ex" style="width:${max ? (r.ex / max) * 100 : 0}%"></div>
          </div>
        </td>
        <td class="ar-figure" style="color:${MR.slate}">${r.ex || '—'}</td>
        <td class="ar-figure">${r.ex ? arPct(r.exPct) : '—'}</td>
      </tr>`;
    }).join('');
  };

  return `<div class="ar-tablecard">
    <div class="ar-tablecard-head">
      <span class="ar-tablecard-title">Units Sold by Price Class</span>
      <span class="ar-toggle" role="group" aria-label="Period">
        <button class="ar-toggle-btn active" data-pc="jul">July 2026</button>
        <button class="ar-toggle-btn" data-pc="ytd">Year to Date</button>
      </span>
      <span class="ar-legend">
        <i class="ar-swatch" style="background:${MR.blue}"></i>New
        <i class="ar-swatch" style="background:${MR.slate}"></i>Existing
      </span>
    </div>
    <div class="ar-scroll">
    <table class="data-table ar-table">
      <thead><tr>
        <th>Sales Price Range</th>
        <th class="ar-figure">New</th><th class="ar-figure">New %</th>
        <th style="width:170px">Distribution</th>
        <th class="ar-figure">Existing</th><th class="ar-figure">Existing %</th>
      </tr></thead>
      <tbody id="ar-pc-body">${build('jul')}</tbody>
    </table>
    </div>
    <div class="ar-pc-cache" hidden data-jul="1"></div>
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
        <div class="ar-title">Ada County Single-Family Residential Market Report</div>
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
      ${cov.jul25Sold} July-2025 Ada County closings (${missPct}%) have no close price recorded,
      so every 2025 price and dollar-volume figure in the source report is computed on a ~4%
      sample. Unit counts for 2025 are sound; prices are not. Price and volume changes against
      2025 are withheld below, and the 2025 columns are hidden by default.
      <button class="ar-linkbtn" id="ar-toggle-2025">Show 2025 columns</button>
    </div>

    <div class="ar-kpirow">${arKpiRow()}</div>

    <div class="ar-blocktitle">Section 1 · Summary Statistics</div>
    ${arSummaryTable('total')}
    ${arSummaryTable('existing')}
    ${arSummaryTable('new')}

    <div class="ar-blocktitle">Section 2 · Sales by IMLS Area</div>
    ${arAreaSection()}
    <div class="ar-callout ar-callout-note">
      <b>Flagged:</b> Meridian SE (1000) and Meridian SW (1010) report identical average
      ($646,125) and median ($600,000) prices across different unit counts (51 vs 50), which a
      correct per-area aggregation cannot produce. Boise North (0100) carries a $630,000
      new-construction price against zero new-construction units. Area-level <em>prices</em> are
      provisional pending a fix in the source notebook; area-level <em>counts</em> reconcile to
      the county total.
    </div>

    <div class="ar-blocktitle">Section 3 · Units Sold by Price Class</div>
    ${arPriceClassSection()}

    <div class="ar-blocktitle">Section 4 · New Construction Market Dynamics</div>
    ${arNcTierSection()}
    ${arTrendChart()}

    <div class="ar-callout ar-callout-note">
      <b>Sources & method.</b> Sections 1–3 come from
      <code>data_science.compass_db.ada_county_report_csv</code> (${ADA_REPORT.period} run).
      Section 4 is a trailing-12-month cut of <code>data_analytics.dev.dim_listing</code> joined to
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

  // Price-class period toggle
  const pcBody = wrap.querySelector('#ar-pc-body');
  wrap.querySelectorAll('.ar-toggle-btn').forEach(b => {
    b.addEventListener('click', () => {
      wrap.querySelectorAll('.ar-toggle-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const which = b.dataset.pc;
      const data = which === 'jul' ? ADA_REPORT.priceClassJul : ADA_REPORT.priceClassYtd;
      const max = Math.max(...data.map(r => Math.max(r.new, r.ex)));
      pcBody.innerHTML = data.map(r => {
        const empty = r.new === 0 && r.ex === 0;
        return `<tr class="${empty ? 'ar-empty' : ''}">
          <td class="ar-rowlab">${r.range}</td>
          <td class="ar-figure" style="color:${MR.blue}">${r.new || '—'}</td>
          <td class="ar-figure">${r.new ? arPct(r.newPct) : '—'}</td>
          <td class="ar-barcell">
            <div class="ar-bar-wrap ar-bar-split">
              <div class="ar-bar ar-bar-new" style="width:${max ? (r.new / max) * 100 : 0}%"></div>
              <div class="ar-bar ar-bar-ex" style="width:${max ? (r.ex / max) * 100 : 0}%"></div>
            </div>
          </td>
          <td class="ar-figure" style="color:${MR.slate}">${r.ex || '—'}</td>
          <td class="ar-figure">${r.ex ? arPct(r.exPct) : '—'}</td>
        </tr>`;
      }).join('');
    });
  });

  return wrap;
}
