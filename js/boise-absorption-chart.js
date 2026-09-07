// Local Chart.js rendering of a county's absorption series.
//
// This is the fallback behind the Flourish absorption embed: when a chart has
// not been published yet, boise-flourish-charts.js calls this so the page
// still carries the series instead of a gap. It draws only the chart — the
// caller owns the heading and the download controls.
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

// Appends the chart card for one county to `el`. Returns silently when the
// county has no plottable month, so a county whose inventory reconstruction
// was rejected outright gets no empty frame.
function renderBoiseAbsorptionChart(el, county, history) {
  const usable = bacUsableRows(history);
  if (usable.length < 2) return;

  const text = bacVar('--text', '#e2e8f0');
  const muted = bacVar('--text-muted', '#8892aa');
  const border = bacVar('--border', '#2e3250');
  const accent = bacVar('--accent', '#4f8ef7');

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
