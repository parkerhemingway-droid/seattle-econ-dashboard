// Absorption charts for the Boise-area counties, drawn under each county's
// historical table in the Boise section.
//
// The series is whatever the table already shows — same monthlyHistory rows,
// same reconstructed inventory, same nulls. Nothing is recomputed here, so the
// chart and the table above it can never disagree. Months whose inventory is
// untrustworthy carry null and are drawn as a gap rather than interpolated
// across; see the methodology note at the bottom of the section.
//
// Absorption is closings in the month ÷ listings on market at month end, as a
// percent per month. Months of supply is its reciprocal and rides in the
// tooltip rather than on a second axis: at Ada's ~28%/3.5mo the two curves are
// the same information mirrored, and a second axis just invites reading a
// crossover that has no meaning.

const BOISE_ABS_CHARTS = {};

// Pulled off :root so the canvas tracks the stylesheet instead of hardcoding
// hexes that drift when the palette changes.
function bacVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// Rows worth plotting: absorption is null for every month whose reconstructed
// inventory was rejected. Valley has no usable months before Feb 2026.
function bacUsableRows(history) {
  return history.filter(m => m.absorption != null);
}

function bacCsvRows(county, history) {
  const rows = [['county', 'month', 'closed_sf', 'on_market_month_end', 'absorption_pct', 'months_supply']];
  history.forEach(m => {
    rows.push([
      county,
      m.month,
      m.sf,
      m.inventory == null ? '' : m.inventory,
      m.absorption == null ? '' : m.absorption.toFixed(1),
      m.monthsSupply == null ? '' : m.monthsSupply.toFixed(1),
    ]);
  });
  return rows;
}

// data: URL rather than a blob: URL — blob downloads are dropped in the
// wrapped/in-app browsers this dashboard gets opened in, the same reason the
// IMLS area export at the bottom of this section uses one.
function bacDownloadCsv(county, history) {
  const csv = bacCsvRows(county, history).map(r => r.map(v => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\n');

  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `${county.toLowerCase()}-county-absorption-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Chart.js renders onto a transparent canvas, so a straight toDataURL gives a
// PNG that is invisible against anything pale. Repaint onto an opaque copy at
// 2x for a slide-usable export.
function bacDownloadPng(county, canvas) {
  const scale = 2;
  const out = document.createElement('canvas');
  out.width = canvas.width * scale;
  out.height = canvas.height * scale;
  const ctx = out.getContext('2d');
  ctx.fillStyle = bacVar('--surface', '#1a1d27');
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0, out.width, out.height);

  const a = document.createElement('a');
  a.href = out.toDataURL('image/png');
  a.download = `${county.toLowerCase()}-county-absorption-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Appends the header row, canvas and download buttons for one county to `el`.
// Returns silently when the county has no plottable month, so a county whose
// inventory reconstruction was rejected outright gets no empty frame.
function renderBoiseAbsorption(el, county, history) {
  const usable = bacUsableRows(history);
  if (usable.length < 2) return;

  const text = bacVar('--text', '#e2e8f0');
  const muted = bacVar('--text-muted', '#8892aa');
  const border = bacVar('--border', '#2e3250');
  const accent = bacVar('--accent', '#4f8ef7');

  const head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:28px;';
  head.innerHTML = `<div class="subsection-title" style="margin:0;">${county} County Absorption Rate</div>`;

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:6px;';
  const csvBtn = document.createElement('button');
  csvBtn.className = 'btn-icon';
  csvBtn.title = `Download ${county} County absorption data as CSV`;
  csvBtn.textContent = 'CSV';
  const pngBtn = document.createElement('button');
  pngBtn.className = 'btn-icon';
  pngBtn.title = `Download ${county} County absorption chart as PNG`;
  pngBtn.textContent = 'PNG';
  actions.append(csvBtn, pngBtn);
  head.appendChild(actions);
  el.appendChild(head);

  const wrap = document.createElement('div');
  wrap.style.cssText = `background:var(--surface);border:1px solid var(--border);border-radius:var(--card-radius);padding:14px 16px 10px;margin-bottom:${history.some(m => m.absorption == null) ? '8px' : '32px'};`;
  const holder = document.createElement('div');
  holder.style.cssText = 'position:relative;height:260px;';
  const canvas = document.createElement('canvas');
  holder.appendChild(canvas);
  wrap.appendChild(holder);
  el.appendChild(wrap);

  // Gaps stay gaps: plot the full history with nulls in place rather than the
  // filtered list, so a blank stretch reads as "not measured" instead of the
  // line quietly closing over it.
  const labels = history.map(m => m.month);
  const values = history.map(m => m.absorption);

  csvBtn.addEventListener('click', e => { e.stopPropagation(); bacDownloadCsv(county, history); });
  pngBtn.addEventListener('click', e => { e.stopPropagation(); bacDownloadPng(county, canvas); });

  const id = `abs_${county.toLowerCase()}`;
  if (BOISE_ABS_CHARTS[id]) BOISE_ABS_CHARTS[id].destroy();

  BOISE_ABS_CHARTS[id] = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Absorption',
        data: values,
        borderColor: accent,
        backgroundColor: accent + '22',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: accent,
        tension: 0.3,
        fill: true,
        spanGaps: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: bacVar('--surface2', '#222635'),
          borderColor: border,
          borderWidth: 1,
          titleColor: text,
          bodyColor: text,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: ctx => {
              const m = history[ctx.dataIndex];
              return [
                `Absorption: ${m.absorption.toFixed(1)}% / mo`,
                `Months of supply: ${m.monthsSupply.toFixed(1)}`,
                `Closed: ${m.sf.toLocaleString()}`,
                `On market at month end: ${m.inventory.toLocaleString()}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: border, drawTicks: false },
          ticks: { color: muted, font: { size: 10 }, maxRotation: 45, minRotation: 45 },
        },
        y: {
          beginAtZero: true,
          grid: { color: border, drawTicks: false },
          ticks: { color: muted, font: { size: 10 }, callback: v => v + '%' },
          title: { display: true, text: 'Absorption (% of on-market inventory per month)', color: muted, font: { size: 10 } },
        },
      },
    },
  });
}
