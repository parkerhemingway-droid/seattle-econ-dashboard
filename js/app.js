// ── Utilities ────────────────────────────────────────────────────────────────

const flagged = new Set(JSON.parse(localStorage.getItem('flagged') || '[]'));

function saveFlagged() {
  localStorage.setItem('flagged', JSON.stringify([...flagged]));
}

function fmt(metric) {
  const v = metric.value;
  const u = metric.unit || '';
  if (u === '$') return '$' + v.toLocaleString();
  if (u === ' homes' || u === '/wk' || u === '/mo' || u === '' && v > 10000) return v.toLocaleString() + (u !== '' ? u : '');
  if (u === 'M' || u === 'M SAAR' || u === 'K SAAR' || u === 'K') return v.toLocaleString() + u;
  return v + u;
}

function fmtChange(val, unit) {
  if (val === null || val === undefined) return '—';
  const u = unit || '';
  const sign = val > 0 ? '+' : '';
  if (u === '$') return sign + '$' + Math.abs(val).toLocaleString();
  return sign + val + (u === ' homes' || u === '/wk' ? '' : u);
}

// Append % in parentheses for non-percentage metrics where it adds context.
function fmtChangePct(change, currentValue, unit) {
  const u = unit || '';
  if (!change || u === '%' || u.endsWith('%')) return '';
  const prior = currentValue - change;
  if (!prior || prior === 0) return '';
  const pct = (change / Math.abs(prior)) * 100;
  if (!isFinite(pct)) return '';
  const sign = pct > 0 ? '+' : '';
  return ` <span style="opacity:0.7;font-size:.7rem">(${sign}${pct.toFixed(1)}%)</span>`;
}

function fmtYoyPct(metric) {
  return fmtChangePct(metric.yoyChange, metric.value, metric.unit);
}

function fmtPeriodPct(metric) {
  return fmtChangePct(metric.periodChange, metric.value, metric.unit);
}

function changeClass(val, invertedMetrics = false) {
  if (val === 0) return '';
  const up = val > 0;
  const good = invertedMetrics ? !up : up;
  return good ? 'up' : 'down';
}

// Metrics where lower = better (unemployment, claims, days on market, etc.)
const INVERTED = new Set(['u3', 'u6', 'seaUnemployment', 'initialClaims', 'continuingClaims',
  'waStateInitialClaims', 'seaDaysOnMarket', 'seaPriceReductions', 'mortgageRate',
  'mortgageSpread', 'joltsLayoffs', 'oil']);

function exportCsv(metric) {
  const rows = [
    ['date', 'value', 'unit', 'period_change', 'yoy_change'],
    [metric.date, metric.value, metric.unit, metric.periodChange, metric.yoyChange],
  ];
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${metric.id}_${metric.date}.csv`;
  a.click();
}

// ── Metric Card ──────────────────────────────────────────────────────────────

function buildMetricCard(metric) {
  const isFlagged = flagged.has(metric.id);
  const inverted = INVERTED.has(metric.id);
  const pcClass = changeClass(metric.periodChange, inverted);
  const yoyClass = changeClass(metric.yoyChange, inverted);

  const card = document.createElement('div');
  card.className = 'metric-card' + (isFlagged ? ' flagged' : '');
  card.dataset.id = metric.id;

  const canvasId = 'spark_' + metric.id;
  card.innerHTML = `
    <div class="metric-name">${metric.name}${metric.local ? ' <span title="Seattle/WA localized">📍</span>' : ''}</div>
    <div class="sparkline-container"><canvas id="${canvasId}" width="200" height="40"></canvas></div>
    <div class="metric-date">${metric.date}</div>
    <div class="metric-value">${fmt(metric)}</div>
    <div class="metric-changes">
      <span class="metric-change ${pcClass}" title="Period change">${fmtChange(metric.periodChange, metric.unit)}${fmtPeriodPct(metric)} period</span>
      <span class="metric-change ${yoyClass}" title="Year-over-year">${fmtChange(metric.yoyChange, metric.unit)} YoY${fmtYoyPct(metric)}</span>
    </div>
    <div class="metric-release">${metric.release}</div>
    <div class="metric-signal loading" data-signal-id="${metric.id}">Generating signal…</div>
    <div class="card-actions">
      <button class="btn-icon flag-btn ${isFlagged ? 'flagged' : ''}" data-id="${metric.id}" title="Flag">★</button>
      <button class="btn-icon csv-btn" data-id="${metric.id}" title="Export CSV">CSV</button>
    </div>
  `;

  // Modal wired via delegated listener below (see initClickDelegation)

  // Wire flag button
  card.querySelector('.flag-btn').addEventListener('click', e => {
    const id = e.currentTarget.dataset.id;
    if (flagged.has(id)) { flagged.delete(id); } else { flagged.add(id); }
    saveFlagged();
    // Re-render active section
    navigate(currentSection);
  });

  // Wire CSV button
  card.querySelector('.csv-btn').addEventListener('click', e => {
    exportCsv(ALL_METRICS[e.currentTarget.dataset.id]);
  });

  return card;
}

// Draw sparklines after cards are in the DOM
function drawSparklines(metrics) {
  metrics.forEach(metric => {
    const canvas = document.getElementById('spark_' + metric.id);
    if (canvas && metric.sparkline) {
      const inverted = INVERTED.has(metric.id);
      const positiveTrend = inverted
        ? metric.sparkline[metric.sparkline.length - 1] < metric.sparkline[0]
        : metric.sparkline[metric.sparkline.length - 1] > metric.sparkline[0];
      renderSparkline(canvas, metric.sparkline, positiveTrend);
    }
  });
}

// Populate AI signals for visible cards
function populateSignals(metrics, containerEl) {
  if (!AI.hasKey()) {
    metrics.forEach(m => {
      const el = document.querySelector(`[data-signal-id="${m.id}"]`);
      if (el) { el.textContent = ''; el.classList.remove('loading'); }
    });
    if (containerEl && !containerEl.querySelector('.ai-key-banner')) {
      const banner = document.createElement('div');
      banner.className = 'ai-key-banner';
      banner.innerHTML = `<span>✦ Connect your <strong>Databricks</strong> workspace in the sidebar to get AI-generated signals on every card.</span>
        <button onclick="document.getElementById('db-workspace-input').focus();document.getElementById('db-workspace-input').scrollIntoView({behavior:'smooth'})">Connect →</button>`;
      containerEl.appendChild(banner);
    }
    return;
  }
  AI.batchSignals(metrics, (id, signal) => {
    const el = document.querySelector(`[data-signal-id="${id}"]`);
    if (el) {
      el.textContent = signal;
      el.classList.remove('loading');
      el.classList.add('ai-badge');
    }
  });
}

// ── Narrative Box ────────────────────────────────────────────────────────────

function buildNarrativeBox(staticText, genFn) {
  const box = document.createElement('div');
  box.className = 'narrative-box';
  box.innerHTML = `<h3>Market Narrative</h3><p>${staticText}</p>`;

  if (AI.hasKey()) {
    box.classList.add('loading');
    genFn().then(text => {
      if (text) box.querySelector('p').textContent = text;
      box.classList.remove('loading');
    });
  }
  return box;
}

// ── Section: Today ───────────────────────────────────────────────────────────

function renderToday() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Today — ${TODAY_SUMMARY_CONTEXT.date}</div>
    <div class="section-subtitle">Daily summary for the Greater Seattle economy</div>`;

  el.appendChild(buildNarrativeBox(TODAY_SUMMARY_CONTEXT.narrative, () => AI.todayNarrative(TODAY_SUMMARY_CONTEXT)));

  // Hero stats
  const hero = document.createElement('div');
  hero.className = 'today-hero';
  const heroMetrics = ['treasury10y', 'mortgageRate', 'sp500', 'oil', 'seaMedianPrice', 'seaActiveInventory'];
  heroMetrics.forEach(id => {
    const m = ALL_METRICS[id];
    if (!m) return;
    const inverted = INVERTED.has(id);
    const cls = changeClass(m.periodChange, inverted);
    hero.innerHTML += `<div class="hero-stat">
      <div class="hero-stat-label">${m.name}</div>
      <div class="hero-stat-value ${cls}">${fmt(m)}</div>
      <div class="hero-stat-change ${cls}">${fmtChange(m.periodChange, m.unit)}</div>
    </div>`;
  });
  el.appendChild(hero);

  // Markets subsection
  el.innerHTML += `<div class="subsection-title">Markets</div>`;
  const marketsGrid = document.createElement('div');
  marketsGrid.className = 'card-grid';
  const marketIds = ['treasury10y', 'treasury2y', 'sp500', 'oil', 'mortgageRate', 'mortgageSpread'];
  const mMetrics = marketIds.map(id => ALL_METRICS[id]).filter(Boolean);
  mMetrics.forEach(m => marketsGrid.appendChild(buildMetricCard(m)));
  el.appendChild(marketsGrid);

  el.innerHTML += `<div class="section-divider"></div><div class="subsection-title">Inflation Expectations & Fed</div>`;
  const infGrid = document.createElement('div');
  infGrid.className = 'card-grid';
  ['breakeven5y', 'breakeven10y', 'effFedFunds', 'clevelandFedInfExp'].forEach(id => {
    infGrid.appendChild(buildMetricCard(ALL_METRICS[id]));
  });
  el.appendChild(infGrid);

  el.innerHTML += `<div class="section-divider"></div><div class="subsection-title">Labor Headlines</div>`;
  const laborGrid = document.createElement('div');
  laborGrid.className = 'card-grid';
  ['initialClaims', 'continuingClaims', 'u3', 'waStateInitialClaims'].forEach(id => {
    laborGrid.appendChild(buildMetricCard(ALL_METRICS[id]));
  });
  el.appendChild(laborGrid);

  const allMetricsShown = [...mMetrics,
    ...['breakeven5y', 'breakeven10y', 'effFedFunds', 'clevelandFedInfExp',
        'initialClaims', 'continuingClaims', 'u3', 'waStateInitialClaims'].map(id => ALL_METRICS[id])];

  setTimeout(() => {
    drawSparklines(allMetricsShown);
    populateSignals(allMetricsShown, el);
  }, 50);

  return el;
}

// ── Construction Pipeline Forecast ───────────────────────────────────────────

// ── Migration section helper (used by Housing + Luxury) ─────────────────────
function buildMigrationSection(migData, idSuffix) {
  const wrap = document.createElement('div');

  const mkChartCard = (title, id, height = 240) => {
    const card = document.createElement('div');
    card.className = 'migration-chart-card';
    card.innerHTML = `<div class="migration-chart-title">${title}</div><div class="migration-chart-wrap" style="height:${height}px"><canvas id="${id}"></canvas></div>`;
    return card;
  };

  const row = document.createElement('div');
  row.className = 'migration-row';
  row.appendChild(mkChartCard('Where Buyers Are Coming From', `mig-buyers-${idSuffix}`));
  row.appendChild(mkChartCard('Where Sellers Are Going', `mig-sellers-${idSuffix}`));
  wrap.appendChild(row);

  const noteEl = document.createElement('div');
  noteEl.className = 'migration-note';
  noteEl.textContent = migData.note;
  wrap.appendChild(noteEl);

  const srcEl = document.createElement('div');
  srcEl.className = 'luxury-source';
  srcEl.textContent = `Source: ${migData.sources}`;
  wrap.appendChild(srcEl);

  // Draw after in DOM
  setTimeout(() => {
    const C_BLUE   = '#007BFF';
    const C_ORANGE = '#FF7043';
    const tickColor = '#90A4AE';
    const tickFont = { size: 10 };
    const tt = { backgroundColor: '#ffffff', borderColor: '#DADADA', borderWidth: 1, titleColor: '#000', bodyColor: '#4a4a4a', padding: 10, cornerRadius: 4 };
    const gridColor = 'rgba(218,218,218,0.1)';
    const scaleBase = { ticks: { color: tickColor, font: tickFont, padding: 6 }, grid: { color: gridColor, drawTicks: false }, border: { display: false } };
    const scaleNoVGrid = { ...scaleBase, grid: { display: false }, border: { display: false } };

    const drawMigChart = (canvasId, items, color, labelKey, valueKey, fmtLabel) => {
      const el = document.getElementById(canvasId);
      if (!el) return;
      destroyChart(canvasId);
      const sorted = [...items].sort((a, b) => a[valueKey] - b[valueKey]);
      chartRegistry[canvasId] = new Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
          labels: sorted.map(d => d[labelKey]),
          datasets: [{
            label: 'Share %',
            data: sorted.map(d => d[valueKey]),
            backgroundColor: color + 'cc',
            borderWidth: 0,
            borderRadius: 4,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          layout: { padding: { top: 4, right: 40 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              ...tt,
              callbacks: {
                label: c => ` ${c.parsed.x}% of relocating ${fmtLabel}`,
                afterLabel: c => {
                  const item = sorted[c.dataIndex];
                  const yoy = item.yoy;
                  const dir = yoy > 0 ? `+${yoy}% YoY` : `${yoy}% YoY`;
                  return [`${dir}`, item.note];
                },
              },
            },
          },
          scales: {
            x: { ...scaleBase, ticks: { ...scaleBase.ticks, callback: v => `${v}%` }, max: Math.max(...items.map(d => d[valueKey])) + 4 },
            y: scaleNoVGrid,
          },
        },
        plugins: [{
          id: 'yoyLabels',
          afterDatasetsDraw(chart) {
            const { ctx, scales: { x, y } } = chart;
            ctx.save();
            ctx.font = '9px -apple-system, sans-serif';
            sorted.forEach((item, i) => {
              const yoy = item.yoy;
              if (yoy === 0) return;
              const xPos = x.getPixelForValue(item[valueKey]);
              const yPos = y.getPixelForValue(i);
              ctx.fillStyle = yoy > 0 ? '#00D084' : '#FF7043';
              ctx.fillText(`${yoy > 0 ? '+' : ''}${yoy}%`, xPos + 4, yPos + 4);
            });
            ctx.restore();
          },
        }],
      });
    };

    drawMigChart(`mig-buyers-${idSuffix}`, migData.buyerOrigins,     C_BLUE,   'metro', 'share', 'buyers');
    drawMigChart(`mig-sellers-${idSuffix}`, migData.sellerDestinations, C_ORANGE, 'metro', 'share', 'sellers');
  }, 0);

  return wrap;
}

// ── AVM comparison helper (used by Luxury forecast) ──────────────────────────
function buildAvmComparison(avmData) {
  const wrap = document.createElement('div');
  wrap.className = 'avm-compare-wrap';
  wrap.innerHTML = `<div class="avm-compare-title">AVM Benchmark Cross-Check — 12-Month Price Forecast</div>
    <table class="avm-compare-table">
      <thead><tr><th>Source</th><th>YoY Forecast</th><th>Methodology</th><th>Coverage Note</th></tr></thead>
      <tbody>
        ${avmData.map(r => {
          const cls = r.source === 'This Model' ? 'avm-row-highlight' : '';
          const color = r.forecast >= 3.0 ? 'var(--green)' : 'var(--text-muted)';
          return `<tr class="${cls}">
            <td><strong>${r.source}</strong></td>
            <td style="color:${color};font-weight:700">+${r.forecast}%</td>
            <td style="color:var(--text-muted)">${r.methodology}</td>
            <td style="color:var(--text-muted)">${r.coverage}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div style="font-size:0.7rem;color:var(--text-muted);margin-top:8px">
      Our model applies a supply-scarcity premium (+0.3–1.4%) above AVM consensus to reflect illiquid comps and Medina/Mercer Island structural undersupply. ±4% confidence interval.
    </div>`;
  return wrap;
}

function buildPipelineForecast() {
  const wrap = document.createElement('div');

  const hist  = PIPELINE_FORECAST.historical;
  const fcast = PIPELINE_FORECAST.monthly;
  const todayIdx = hist.length - 1;
  const allLabels = [...hist.map(h => h.month), ...fcast.map(f => f.month)];

  // Per-type series
  const sfHistData  = [...hist.map(h => h.sf),       ...Array(fcast.length).fill(null)];
  const sfFcastData = [...Array(hist.length).fill(null), ...fcast.map(f => f.sfUnits)];
  const mfHistData  = [...hist.map(h => h.mf),       ...Array(fcast.length).fill(null)];
  const mfFcastData = [...Array(hist.length).fill(null), ...fcast.map(f => f.mfUnits)];

  // Rolling averages per type
  function rollingAvg12(series) {
    return series.map((_, i) => {
      const w = series.slice(Math.max(0, i - 11), i + 1).filter(v => v !== null);
      return w.length ? Math.round(w.reduce((s, v) => s + v, 0) / w.length) : null;
    });
  }
  const sfAll = [...hist.map(h => h.sf), ...fcast.map(f => f.sfUnits)];
  const mfAll = [...hist.map(h => h.mf), ...fcast.map(f => f.mfUnits)];
  const sfAvg = rollingAvg12(sfAll);
  const mfAvg = rollingAvg12(mfAll);

  // Summary callouts
  const sfFcastTotal  = fcast.reduce((s, m) => s + m.sfUnits, 0);
  const mfFcastTotal  = fcast.reduce((s, m) => s + m.mfUnits, 0);
  const totalForecast = fcast.reduce((s, m) => s + m.totalUnits, 0);
  const next6mo       = fcast.slice(0, 6).reduce((s, m) => s + m.totalUnits, 0);
  const next12mo      = fcast.slice(0, 12).reduce((s, m) => s + m.totalUnits, 0);
  const peakMonth     = fcast.reduce((p, m) => m.totalUnits > p.totalUnits ? m : p);
  const sfHistAvg     = Math.round(sfAll.slice(0, hist.length).reduce((s, v) => s + v, 0) / hist.length);
  const mfHistAvg     = Math.round(mfAll.slice(0, hist.length).reduce((s, v) => s + v, 0) / hist.length);

  const callouts = document.createElement('div');
  callouts.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px;margin-bottom:20px;';
  [
    { label: 'Total Under Construction',    value: (28420).toLocaleString(),         sub: 'as of Apr 2026' },
    { label: 'SF 5-Yr Avg / Month',         value: sfHistAvg.toLocaleString(),        sub: 'Jan 2021–May 2026', color: '#34d399' },
    { label: 'MF 5-Yr Avg / Month',         value: mfHistAvg.toLocaleString(),        sub: 'Jan 2021–May 2026', color: '#4f8ef7' },
    { label: 'SF Forecast 18-Month',        value: sfFcastTotal.toLocaleString(),      sub: 'Jun 2026–Nov 2027', color: '#34d399' },
    { label: 'MF Forecast 18-Month',        value: mfFcastTotal.toLocaleString(),      sub: 'Jun 2026–Nov 2027', color: '#4f8ef7' },
    { label: 'Peak Forecast Month',         value: peakMonth.month,                   sub: `~${peakMonth.totalUnits.toLocaleString()} total units` },
  ].forEach(c => {
    callouts.innerHTML += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center">
      <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${c.label}</div>
      <div style="font-size:1.3rem;font-weight:800;color:${c.color || 'var(--text)'}">${c.value}</div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">${c.sub}</div>
    </div>`;
  });
  wrap.appendChild(callouts);

  // Shared legend
  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;font-size:.72rem;color:var(--text-muted);margin-bottom:12px;flex-wrap:wrap;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#34d399cc;margin-right:4px"></span>SF Historical</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#34d39944;border:1px solid #34d399;margin-right:4px"></span>SF Forecast</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#4f8ef7cc;margin-right:4px"></span>MF Historical</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#4f8ef744;border:1px solid #4f8ef7;margin-right:4px"></span>MF Forecast</span>
    <span><span style="display:inline-block;width:18px;height:2px;background:#fbbf24;margin-right:4px;vertical-align:middle"></span>12-mo Rolling Avg</span>
    <span><span style="display:inline-block;width:2px;height:12px;background:#fbbf2488;margin-right:4px;vertical-align:middle;border-left:2px dashed #fbbf24;"></span>Today</span>`;
  wrap.appendChild(legend);

  // Helper to build one chart panel
  function makeChartPanel(title, histData, fcastData, avgData, color, canvasId) {
    const panel = document.createElement('div');
    panel.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-bottom:14px;';
    panel.innerHTML = `<div style="font-size:.85rem;font-weight:600;color:var(--text);margin-bottom:10px">${title}</div>`;
    const cw = document.createElement('div');
    cw.style.cssText = 'position:relative;height:260px;';
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    cw.appendChild(canvas);
    panel.appendChild(cw);
    return panel;
  }

  const sfPanel = makeChartPanel('Single-Family Completions — History & Forecast', sfHistData, sfFcastData, sfAvg, '#34d399', 'pipeline-chart-sf');
  const mfPanel = makeChartPanel('Multifamily Completions — History & Forecast',    mfHistData, mfFcastData, mfAvg, '#4f8ef7', 'pipeline-chart-mf');
  wrap.appendChild(sfPanel);
  wrap.appendChild(mfPanel);

  // Submarket table
  const smTitle = document.createElement('div');
  smTitle.className = 'subsection-title';
  smTitle.textContent = 'Pipeline by Submarket';
  wrap.appendChild(smTitle);
  const smTable = document.createElement('div');
  smTable.innerHTML = `<table class="data-table">
    <thead><tr><th>Submarket</th><th>SF Share</th><th>Multifamily Share</th><th>Est. Units in Pipeline</th></tr></thead>
    <tbody>${PIPELINE_FORECAST.submarkets.map(s => `
      <tr>
        <td>${s.name}</td>
        <td style="color:var(--green)">${s.sfPct}%</td>
        <td style="color:var(--accent)">${s.mfPct}%</td>
        <td style="font-weight:600">${s.totalUnits.toLocaleString()}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
  wrap.appendChild(smTable);

  // Assumptions box
  const assumTitle = document.createElement('div');
  assumTitle.className = 'subsection-title';
  assumTitle.textContent = 'Forecast Assumptions';
  wrap.appendChild(assumTitle);
  const assumBox = document.createElement('div');
  assumBox.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--yellow);border-radius:8px;padding:14px 16px;font-size:.8rem;color:var(--text-muted);line-height:1.7;';
  assumBox.innerHTML = `<div style="font-size:.72rem;font-weight:700;color:var(--yellow);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">⚠ Model Forecast — Data Sources &amp; Assumptions</div>` +
    PIPELINE_FORECAST.assumptions.map(a => {
      const color = a.startsWith('✓') ? 'var(--green)' : a.startsWith('~') ? 'var(--yellow)' : 'var(--text-muted)';
      return `<div style="color:${color}">• ${a}</div>`;
    }).join('');
  wrap.appendChild(assumBox);

  // Draw both charts
  setTimeout(() => {
    const todayPlugin = {
      id: 'todayLine',
      afterDraw(chart) {
        const { ctx: c, scales: { x, y } } = chart;
        const xPos = x.getPixelForValue(todayIdx);
        c.save();
        c.strokeStyle = '#fbbf2466';
        c.lineWidth = 1.5;
        c.setLineDash([5, 4]);
        c.beginPath();
        c.moveTo(xPos, y.top);
        c.lineTo(xPos, y.bottom);
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = '#fbbf24';
        c.font = '10px sans-serif';
        c.fillText('Today', xPos + 4, y.top + 12);
        c.restore();
      },
    };

    function drawComboChart(canvasId, histData, fcastData, avgData, color) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;
      destroyChart(canvasId);
      chartRegistry[canvasId] = new Chart(ctx, {
        plugins: [todayPlugin],
        data: {
          labels: allLabels,
          datasets: [
            {
              type: 'bar', label: 'Historical',
              data: histData, backgroundColor: color + 'cc',
              stack: 'vals', borderRadius: 2,
            },
            {
              type: 'bar', label: 'Forecast',
              data: fcastData, backgroundColor: color + '44',
              borderColor: color, borderWidth: 1,
              stack: 'vals', borderRadius: 2,
            },
            {
              type: 'line', label: '12-mo Avg',
              data: avgData,
              borderColor: '#fbbf24', borderWidth: 2,
              pointRadius: 0, tension: 0.4, fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1a1d27', borderColor: '#2e3250', borderWidth: 1,
              titleColor: '#e2e8f0', bodyColor: '#8892aa',
            },
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: '#8892aa', font: { size: 9 },
                callback(val, i) { return i % 6 === 0 ? allLabels[i] : ''; },
              },
              grid: { color: '#2e3250' },
            },
            y: {
              stacked: true,
              ticks: { color: '#8892aa', font: { size: 10 } },
              grid: { color: '#2e3250' },
              title: { display: true, text: 'Units', color: '#8892aa', font: { size: 10 } },
            },
          },
        },
      });
    }

    drawComboChart('pipeline-chart-sf', sfHistData, sfFcastData, sfAvg, '#34d399');
    drawComboChart('pipeline-chart-mf', mfHistData, mfFcastData, mfAvg, '#4f8ef7');
  }, 80);

  return wrap;
}

// ── Section: Housing ─────────────────────────────────────────────────────────

function renderHousing() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Housing — Greater Seattle</div>
    <div class="section-subtitle">King, Snohomish & Pierce County market data</div>`;

  el.appendChild(buildNarrativeBox(
    'Seattle housing inventory climbed to its highest level since 2019 while prices held near record highs. Affordability remains historically stretched at a 10.4x price-to-income ratio.',
    () => AI.housingNarrative()
  ));

  const sections = [
    { title: 'Seattle Market Pulse', ids: ['seaMedianPrice', 'seaMedianListPrice', 'seaActiveInventory', 'seaWeeksSupply', 'seaNewListings', 'seaPendingSales', 'seaDaysOnMarket', 'seaPriceReductions', 'seaSaleTListRatio'] },
    { title: 'Home Prices', ids: ['seaCaseShiller', 'seaMedianPrice', 'existingHomeSales', 'newHomeSales'] },
    { title: 'Affordability', ids: ['seaAffordabilityRatio', 'kingCountyHomeowners', 'mortgageRate', 'mortgageSpread'] },
    { title: 'Mortgage Applications (Weekly — MBA)', ids: ['mbaPurchaseIndex', 'mbaRefiIndex', 'mbaMarketComposite', 'mbaArmShare'] },
    { title: 'Seattle Construction Pipeline', ids: ['seaPermits', 'kingPermits', 'piercePermits', 'snohomishPermits', 'seaUnderConstruction', 'seaMultifamilyUnder', 'seaSingleFamilyUnder', 'seaCompletions'] },
    { title: 'National Construction Context', ids: ['housingStarts', 'buildingPermits', 'housingCompletions', 'unitsUnderConstruction'] },
    { title: 'National Context', ids: ['existingHomeSales', 'newHomeSales'] },
  ];

  const allShown = [];
  sections.forEach(s => {
    el.innerHTML += `<div class="subsection-title">${s.title}</div>`;
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    s.ids.forEach(id => {
      const m = ALL_METRICS[id];
      if (m) { grid.appendChild(buildMetricCard(m)); allShown.push(m); }
    });
    el.appendChild(grid);
  });

  // ── Construction Pipeline Forecast ──
  el.innerHTML += `<div class="subsection-title">Construction Completion Forecast — 18-Month Pipeline</div>`;
  el.appendChild(buildPipelineForecast());

  // ── Migration ──
  const migTitle = document.createElement('div');
  migTitle.className = 'subsection-title';
  migTitle.textContent = 'Buyer Origins & Seller Destinations — Greater Seattle MSA';
  el.appendChild(migTitle);
  el.appendChild(buildMigrationSection(MIGRATION_DATA.general, 'housing'));

  setTimeout(() => {
    drawSparklines(allShown);
    populateSignals(allShown, el);
  }, 50);

  return el;
}

// ── Section: Luxury Market ───────────────────────────────────────────────────

function renderLuxury() {
  const el = document.createElement('div');
  const d = LUXURY_DATA;
  const h = d.headline;

  const fmtM = v => v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : `$${v.toLocaleString()}`;
  const sign = v => v > 0 ? `+${v}` : `${v}`;
  const mkTitle = text => { const t = document.createElement('div'); t.className = 'subsection-title'; t.textContent = text; return t; };
  const mkChartCard = (title, id, height = 210) => {
    const card = document.createElement('div');
    card.className = 'luxury-chart-card';
    card.innerHTML = `<div class="luxury-chart-title">${title}</div><div class="luxury-chart-wrap" style="height:${height}px"><canvas id="${id}"></canvas></div>`;
    return card;
  };

  el.innerHTML = `<div class="section-title">Luxury Market — $3M+</div>
    <div class="section-subtitle">Greater Seattle ultra-premium residential — King, Snohomish & Pierce Counties</div>`;

  // ── Hero stat bar ──
  const hero = document.createElement('div');
  hero.className = 'luxury-hero';
  const heroStats = [
    { label: 'Median Sale Price',  value: fmtM(h.medianPrice),         sub: `YoY ${sign(h.yoyPricePct)}%`, cls: h.yoyPricePct >= 0 ? 'up' : 'down' },
    { label: 'Avg Sale Price',     value: fmtM(h.avgPrice),             sub: 'rolling 12-month', cls: '' },
    { label: 'Active Inventory',   value: h.activeInventory.toString(), sub: `${h.absorptionMonths} mo supply`, cls: '' },
    { label: 'Avg Days on Market', value: `${h.medianDOM} days`,        sub: 'median', cls: '' },
    { label: 'Sale / List Ratio',  value: `${h.saleToList}%`,           sub: 'avg concession ~3.2%', cls: '' },
    { label: 'Price Reductions',   value: `${h.priceReductions}%`,      sub: 'of active listings', cls: '' },
    { label: 'Closed Sales',       value: h.closedSales.toString(),      sub: 'May 2026', cls: '' },
    { label: 'New Listings',       value: h.newListings.toString(),      sub: 'May 2026', cls: '' },
    { label: 'Pending Listings',   value: h.pendingListings.toString(),  sub: `${h.pendingRatio}% of active`, cls: '' },
  ];
  hero.innerHTML = heroStats.map(s => `
    <div class="luxury-hero-stat">
      <div class="luxury-hero-label">${s.label}</div>
      <div class="luxury-hero-value ${s.cls}">${s.value}</div>
      <div class="luxury-hero-sub">${s.sub}</div>
    </div>`).join('');
  el.appendChild(hero);

  // ── Trend charts (price + sales/DOM side-by-side) ──
  el.appendChild(mkTitle('12-Month Trend'));
  const trendChartRow = document.createElement('div');
  trendChartRow.className = 'luxury-chart-row';
  trendChartRow.appendChild(mkChartCard('Median Sale Price', 'lux-price-chart'));
  trendChartRow.appendChild(mkChartCard('Closed Sales & Days on Market', 'lux-sales-chart'));
  el.appendChild(trendChartRow);
  el.appendChild(mkChartCard('Listings Going Pending — Monthly Count &amp; Pending-to-Active Ratio (%)', 'lux-pending-chart', 200));

  // ── Monthly trend table ──
  const trendWrap = document.createElement('div');
  trendWrap.className = 'luxury-table-wrap';
  const months = d.monthly;
  trendWrap.innerHTML = `<table class="data-table">
    <thead>
      <tr>
        <th>Month</th><th>Median Price</th><th>Closed Sales</th><th>Pending</th><th>Avg DOM</th>
        <th>Sale/List %</th><th>Inventory</th><th>Price Reductions</th>
      </tr>
    </thead>
    <tbody>
      ${months.slice().reverse().map((row, i, arr) => {
        const prev = arr[i + 1];
        const pc = prev ? (row.medianPrice > prev.medianPrice ? 'up' : row.medianPrice < prev.medianPrice ? 'down' : '') : '';
        const sc = prev ? (row.closedSales > prev.closedSales ? 'up' : row.closedSales < prev.closedSales ? 'down' : '') : '';
        const pg = prev ? (row.pending > prev.pending ? 'up' : row.pending < prev.pending ? 'down' : '') : '';
        const dc = prev ? (row.dom < prev.dom ? 'up' : row.dom > prev.dom ? 'down' : '') : '';
        const s2 = prev ? (row.saleToList > prev.saleToList ? 'up' : row.saleToList < prev.saleToList ? 'down' : '') : '';
        const ic = prev ? (row.inventory < prev.inventory ? 'up' : row.inventory > prev.inventory ? 'down' : '') : '';
        const rc = prev ? (row.priceReductions < prev.priceReductions ? 'up' : row.priceReductions > prev.priceReductions ? 'down' : '') : '';
        const pendRatio = ((row.pending / row.inventory) * 100).toFixed(1);
        return `<tr>
          <td>${row.month}</td>
          <td class="${pc}">${fmtM(row.medianPrice)}</td>
          <td class="${sc}">${row.closedSales}</td>
          <td class="${pg}">${row.pending} <span style="color:var(--text-muted);font-size:0.75em">(${pendRatio}%)</span></td>
          <td class="${dc}">${row.dom}</td>
          <td class="${s2}">${row.saleToList.toFixed(1)}%</td>
          <td class="${ic}">${row.inventory}</td>
          <td class="${rc}">${row.priceReductions}%</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
  el.appendChild(trendWrap);

  // ── Price tier breakdowns ──
  el.appendChild(mkTitle('Price Tier Breakdown'));
  const tierGrid = document.createElement('div');
  tierGrid.className = 'luxury-tier-grid';
  d.tiers.forEach(t => {
    const cls = t.yoyPricePct > 0 ? 'up' : 'down';
    tierGrid.innerHTML += `
      <div class="luxury-tier-card">
        <div class="luxury-tier-label">${t.label}</div>
        <div class="luxury-tier-price">${fmtM(t.medianPrice)}<span class="luxury-tier-change ${cls}">${sign(t.yoyPricePct)}% YoY</span></div>
        <div class="luxury-tier-stats">
          <span title="Active listings">📦 ${t.inventory} active</span>
          <span title="Closed sales last month">✓ ${t.closedSales} sold</span>
          <span title="Avg days on market">⏱ ${t.dom}d DOM</span>
          <span title="Sale-to-list ratio">⚖ ${t.saleToList}% S/L</span>
          <span title="% with price reductions">✂ ${t.priceReductions}% cuts</span>
        </div>
      </div>`;
  });
  el.appendChild(tierGrid);
  el.appendChild(mkChartCard('Median Price by Tier', 'lux-tier-chart', 160));

  // ── Submarket breakdown ──
  el.appendChild(mkTitle('Submarket Breakdown'));
  const subGrid = document.createElement('div');
  subGrid.className = 'luxury-sub-grid';
  d.submarkets.forEach(s => {
    const cls = s.yoyPricePct > 0 ? 'up' : 'down';
    const absorb = s.inventory && s.closedSales ? (s.inventory / s.closedSales).toFixed(1) : '—';
    subGrid.innerHTML += `
      <div class="luxury-sub-card">
        <div class="luxury-sub-header">
          <div>
            <div class="luxury-sub-name">${s.name}</div>
            <div class="luxury-sub-county">${s.county} County · ${s.zips.join(', ')}</div>
          </div>
          <div class="luxury-sub-price">
            ${fmtM(s.medianPrice)}
            <span class="${cls}">${sign(s.yoyPricePct)}%</span>
          </div>
        </div>
        <div class="luxury-sub-stats">
          <div class="luxury-sub-stat"><div class="luxury-sub-stat-val">${s.inventory}</div><div class="luxury-sub-stat-lbl">Active</div></div>
          <div class="luxury-sub-stat"><div class="luxury-sub-stat-val">${s.closedSales}</div><div class="luxury-sub-stat-lbl">Sold/mo</div></div>
          <div class="luxury-sub-stat"><div class="luxury-sub-stat-val">${absorb}mo</div><div class="luxury-sub-stat-lbl">Supply</div></div>
          <div class="luxury-sub-stat"><div class="luxury-sub-stat-val">${s.dom}d</div><div class="luxury-sub-stat-lbl">DOM</div></div>
          <div class="luxury-sub-stat"><div class="luxury-sub-stat-val">${s.saleToList}%</div><div class="luxury-sub-stat-lbl">S/L</div></div>
          <div class="luxury-sub-stat"><div class="luxury-sub-stat-val ${s.priceReductions >= 40 ? 'down' : ''}">${s.priceReductions}%</div><div class="luxury-sub-stat-lbl">Cuts</div></div>
        </div>
        <div class="luxury-sub-notes">${s.notes}</div>
      </div>`;
  });
  el.appendChild(subGrid);
  el.appendChild(mkChartCard('Median Price by Submarket (blue = YoY+, orange = YoY−)', 'lux-sub-chart', 260));

  // ── Property type breakdown ──
  el.appendChild(mkTitle('By Property Type'));
  const typeGrid = document.createElement('div');
  typeGrid.className = 'luxury-type-grid';
  d.propertyTypes.forEach(t => {
    typeGrid.innerHTML += `
      <div class="luxury-type-card">
        <div class="luxury-type-name">${t.type}</div>
        <div class="luxury-type-share">${t.share}% of sales</div>
        <div class="luxury-type-price">${fmtM(t.medianPrice)}</div>
        <div class="luxury-type-meta">
          <span>${t.dom}d DOM</span>
          <span>${t.saleToList}% S/L</span>
        </div>
        <div class="luxury-type-bar"><div class="luxury-type-bar-fill" style="width:${Math.min(t.share * 2.8, 100)}%"></div></div>
      </div>`;
  });
  el.appendChild(typeGrid);

  // ── Forecast ──
  el.appendChild(mkTitle('12-Month Price & Activity Forecast — Jun 2026 – May 2027'));
  el.appendChild(mkChartCard('Median Price Forecast vs. Historical', 'lux-fcast-price-chart', 220));
  const fcastRow = document.createElement('div');
  fcastRow.className = 'luxury-chart-row';
  fcastRow.appendChild(mkChartCard('Closed Sales Forecast', 'lux-fcast-sales-chart'));
  fcastRow.appendChild(mkChartCard('Inventory & Pending Forecast', 'lux-fcast-inv-chart'));
  el.appendChild(fcastRow);

  el.appendChild(buildAvmComparison(d.avmComparison));

  const assumWrap = document.createElement('div');
  assumWrap.className = 'luxury-forecast-assumptions';
  assumWrap.innerHTML = `<div class="luxury-forecast-assume-title">Forecast Assumptions</div>` +
    d.forecastAssumptions.map(a => {
      const color = a.startsWith('~') ? 'var(--text-muted)' : '#BCC8CE';
      return `<div style="color:${color}">• ${a}</div>`;
    }).join('');
  el.appendChild(assumWrap);

  // ── Buyer & Seller Migration ──
  const migTitle2 = document.createElement('div');
  migTitle2.className = 'subsection-title';
  migTitle2.textContent = 'Buyer Origins & Seller Destinations — $3M+ Segment';
  el.appendChild(migTitle2);
  el.appendChild(buildMigrationSection(MIGRATION_DATA.luxury, 'luxury'));

  // ── Source note ──
  const src = document.createElement('div');
  src.className = 'luxury-source';
  src.textContent = `Source: ${d.sources}`;
  el.appendChild(src);

  // ── Draw all charts after element is in DOM ──
  setTimeout(() => {
    // Compass brand palette
    const C_BLUE   = '#007BFF';
    const C_ORANGE = '#FF7043';
    const C_AMBER  = '#FFB30F';
    const C_TEAL   = '#00D084';
    const C_PURPLE = '#9C27B0';

    // Flourish-style shared config
    const tt = {
      backgroundColor: '#ffffff',
      borderColor: '#DADADA',
      borderWidth: 1,
      titleColor: '#000000',
      bodyColor: '#4a4a4a',
      padding: 10,
      cornerRadius: 4,
      displayColors: false,
    };
    const gridColor = 'rgba(218,218,218,0.1)';
    const tickColor = '#90A4AE';
    const tickFont = { size: 10, family: '-apple-system, BlinkMacSystemFont, sans-serif' };
    const scaleBase = {
      ticks: { color: tickColor, font: tickFont, padding: 6 },
      grid: { color: gridColor, drawTicks: false },
      border: { display: false },
    };
    const scaleNoVGrid = { ...scaleBase, grid: { display: false }, border: { display: false } };

    // Chart 1 — Median price 12-month line (Compass blue)
    const priceEl = document.getElementById('lux-price-chart');
    if (priceEl) {
      destroyChart('lux-price-chart');
      const ctx = priceEl.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 210);
      grad.addColorStop(0, C_BLUE + '40');
      grad.addColorStop(1, C_BLUE + '00');
      chartRegistry['lux-price-chart'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months.map(m => m.month),
          datasets: [{
            label: 'Median Price', data: months.map(m => m.medianPrice / 1e6),
            borderColor: C_BLUE, borderWidth: 2.5,
            pointRadius: 4, pointBackgroundColor: '#1a1d27', pointBorderColor: C_BLUE, pointBorderWidth: 2,
            tension: 0.4, fill: true, backgroundColor: grad,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 8, right: 8 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tt, callbacks: { label: c => ` $${c.parsed.y.toFixed(2)}M` } },
          },
          scales: {
            x: scaleNoVGrid,
            y: { ...scaleBase, ticks: { ...scaleBase.ticks, callback: v => `$${v.toFixed(1)}M` } },
          },
        },
      });
    }

    // Chart 2 — Closed sales (Compass blue bars) + DOM (Compass orange line)
    const salesEl = document.getElementById('lux-sales-chart');
    if (salesEl) {
      destroyChart('lux-sales-chart');
      chartRegistry['lux-sales-chart'] = new Chart(salesEl.getContext('2d'), {
        data: {
          labels: months.map(m => m.month),
          datasets: [
            {
              type: 'bar', label: 'Closed Sales', data: months.map(m => m.closedSales),
              backgroundColor: C_BLUE + 'cc', borderWidth: 0, borderRadius: 5, yAxisID: 'yL',
            },
            {
              type: 'line', label: 'Avg DOM', data: months.map(m => m.dom),
              borderColor: C_ORANGE, borderWidth: 2.5,
              pointRadius: 3, pointBackgroundColor: '#1a1d27', pointBorderColor: C_ORANGE, pointBorderWidth: 2,
              tension: 0.4, fill: false, yAxisID: 'yR',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 8, right: 8 } },
          plugins: {
            legend: {
              display: true, position: 'top', align: 'end',
              labels: { color: tickColor, font: { size: 10 }, boxWidth: 10, boxHeight: 10, padding: 12, usePointStyle: true },
            },
            tooltip: { ...tt, displayColors: true, mode: 'index', intersect: false },
          },
          scales: {
            x: scaleNoVGrid,
            yL: {
              type: 'linear', position: 'left', ...scaleBase,
              ticks: { ...scaleBase.ticks, color: C_BLUE },
              title: { display: true, text: 'Sales', color: C_BLUE, font: { size: 9 } },
            },
            yR: {
              type: 'linear', position: 'right',
              ticks: { color: C_ORANGE, font: tickFont, padding: 6 },
              grid: { drawOnChartArea: false }, border: { display: false },
              title: { display: true, text: 'DOM', color: C_ORANGE, font: { size: 9 } },
            },
          },
        },
      });
    }

    // Chart 3 — Tier prices (horizontal bar, one Compass color per tier)
    const tierEl = document.getElementById('lux-tier-chart');
    if (tierEl) {
      destroyChart('lux-tier-chart');
      chartRegistry['lux-tier-chart'] = new Chart(tierEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: d.tiers.map(t => t.label),
          datasets: [{
            label: 'Median Price',
            data: d.tiers.map(t => t.medianPrice / 1e6),
            backgroundColor: [C_BLUE + 'cc', C_PURPLE + 'cc', C_ORANGE + 'cc', C_AMBER + 'cc'],
            borderWidth: 0, borderRadius: 5,
          }],
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 4, right: 20 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tt, callbacks: { label: c => ` $${c.parsed.x.toFixed(2)}M` } },
          },
          scales: {
            x: { ...scaleBase, ticks: { ...scaleBase.ticks, callback: v => `$${v}M` } },
            y: scaleNoVGrid,
          },
        },
      });
    }

    // Chart 3b — Pending listings (teal bars) + pending-to-active ratio (amber line)
    const pendEl = document.getElementById('lux-pending-chart');
    if (pendEl) {
      destroyChart('lux-pending-chart');
      chartRegistry['lux-pending-chart'] = new Chart(pendEl.getContext('2d'), {
        data: {
          labels: months.map(m => m.month),
          datasets: [
            {
              type: 'bar', label: 'Listings Gone Pending',
              data: months.map(m => m.pending),
              backgroundColor: C_TEAL + 'cc', borderWidth: 0, borderRadius: 5, yAxisID: 'yL',
            },
            {
              type: 'line', label: 'Pending / Active %',
              data: months.map(m => +((m.pending / m.inventory) * 100).toFixed(1)),
              borderColor: C_AMBER, borderWidth: 2.5,
              pointRadius: 3, pointBackgroundColor: '#1a1d27', pointBorderColor: C_AMBER, pointBorderWidth: 2,
              tension: 0.4, fill: false, yAxisID: 'yR',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 8, right: 8 } },
          plugins: {
            legend: {
              display: true, position: 'top', align: 'end',
              labels: { color: tickColor, font: { size: 10 }, boxWidth: 10, boxHeight: 10, padding: 12, usePointStyle: true },
            },
            tooltip: { ...tt, displayColors: true, mode: 'index', intersect: false,
              callbacks: {
                label: c => c.datasetIndex === 0
                  ? ` ${c.parsed.y} pending`
                  : ` ${c.parsed.y}% of active`,
              },
            },
          },
          scales: {
            x: scaleNoVGrid,
            yL: {
              type: 'linear', position: 'left', ...scaleBase,
              ticks: { ...scaleBase.ticks, color: C_TEAL },
              title: { display: true, text: 'Pending', color: C_TEAL, font: { size: 9 } },
            },
            yR: {
              type: 'linear', position: 'right',
              ticks: { color: C_AMBER, font: tickFont, padding: 6, callback: v => `${v}%` },
              grid: { drawOnChartArea: false }, border: { display: false },
              title: { display: true, text: 'Pend/Active', color: C_AMBER, font: { size: 9 } },
            },
          },
        },
      });
    }

    // Chart 4 — Submarket prices (horizontal bar, blue=YoY+ / orange=YoY−)
    const subEl = document.getElementById('lux-sub-chart');
    if (subEl) {
      destroyChart('lux-sub-chart');
      const sorted = [...d.submarkets].sort((a, b) => b.medianPrice - a.medianPrice);
      chartRegistry['lux-sub-chart'] = new Chart(subEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: sorted.map(s => s.name),
          datasets: [{
            label: 'Median Price',
            data: sorted.map(s => s.medianPrice / 1e6),
            backgroundColor: sorted.map(s => (s.yoyPricePct >= 0 ? C_BLUE : C_ORANGE) + 'cc'),
            borderWidth: 0, borderRadius: 5,
          }],
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 4, right: 20 } },
          plugins: {
            legend: { display: false },
            tooltip: { ...tt, callbacks: { label: c => ` $${c.parsed.x.toFixed(2)}M` } },
          },
          scales: {
            x: { ...scaleBase, ticks: { ...scaleBase.ticks, callback: v => `$${v}M` } },
            y: scaleNoVGrid,
          },
        },
      });
    }

    // ── Forecast charts ──────────────────────────────────────────────────────
    const fcast = d.forecast;
    const histLabels = months.map(m => m.month);
    const fcastLabels = fcast.map(f => f.month);
    const allLabels = [...histLabels, ...fcastLabels];
    const C_GREY = '#607D8B';

    // Forecast Chart 1 — median price: history line + forecast line + confidence band
    const fPriceEl = document.getElementById('lux-fcast-price-chart');
    if (fPriceEl) {
      destroyChart('lux-fcast-price-chart');
      const histPrices = months.map(m => m.medianPrice / 1e6);
      const fcastPrices = fcast.map(f => f.medianPrice / 1e6);
      // Confidence band: ±4% around forecast
      const bandHigh = fcastPrices.map(v => +(v * 1.04).toFixed(3));
      const bandLow  = fcastPrices.map(v => +(v * 0.96).toFixed(3));
      chartRegistry['lux-fcast-price-chart'] = new Chart(fPriceEl.getContext('2d'), {
        data: {
          labels: allLabels,
          datasets: [
            {
              type: 'line', label: 'Historical',
              data: [...histPrices, ...Array(fcastLabels.length).fill(null)],
              borderColor: C_BLUE, borderWidth: 2.5,
              pointRadius: 3, pointBackgroundColor: '#1a1d27', pointBorderColor: C_BLUE, pointBorderWidth: 2,
              tension: 0.4, fill: false,
            },
            {
              type: 'line', label: 'Forecast',
              data: [...Array(histLabels.length - 1).fill(null), histPrices[histPrices.length - 1], ...fcastPrices],
              borderColor: C_AMBER, borderWidth: 2.5, borderDash: [6, 4],
              pointRadius: 2, pointBackgroundColor: C_AMBER,
              tension: 0.4, fill: false,
            },
            {
              type: 'line', label: 'Upper bound (+4%)',
              data: [...Array(histLabels.length - 1).fill(null), histPrices[histPrices.length - 1], ...bandHigh],
              borderColor: C_AMBER + '44', borderWidth: 1, borderDash: [3, 4],
              pointRadius: 0, tension: 0.4, fill: '+1', backgroundColor: C_AMBER + '18',
            },
            {
              type: 'line', label: 'Lower bound (−4%)',
              data: [...Array(histLabels.length - 1).fill(null), histPrices[histPrices.length - 1], ...bandLow],
              borderColor: C_AMBER + '44', borderWidth: 1, borderDash: [3, 4],
              pointRadius: 0, tension: 0.4, fill: false,
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 8, right: 8 } },
          plugins: {
            legend: {
              display: true, position: 'top', align: 'end',
              labels: {
                color: tickColor, font: { size: 10 }, boxWidth: 10, padding: 10, usePointStyle: true,
                filter: item => !item.text.includes('bound'),
              },
            },
            tooltip: { ...tt, mode: 'index', intersect: false,
              callbacks: { label: c => c.parsed.y != null ? ` ${c.dataset.label}: $${c.parsed.y.toFixed(2)}M` : null } },
          },
          scales: {
            x: {
              ...scaleNoVGrid,
              ticks: { ...scaleBase.ticks, callback: (v, i) => i % 3 === 0 ? allLabels[i] : '' },
            },
            y: { ...scaleBase, ticks: { ...scaleBase.ticks, callback: v => `$${v.toFixed(1)}M` } },
          },
        },
      });
    }

    // Forecast Chart 2 — closed sales: history bars + forecast bars (different opacity)
    const fSalesEl = document.getElementById('lux-fcast-sales-chart');
    if (fSalesEl) {
      destroyChart('lux-fcast-sales-chart');
      chartRegistry['lux-fcast-sales-chart'] = new Chart(fSalesEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: 'Historical', data: [...months.map(m => m.closedSales), ...Array(fcastLabels.length).fill(null)],
              backgroundColor: C_BLUE + 'cc', borderWidth: 0, borderRadius: 4,
            },
            {
              label: 'Forecast', data: [...Array(histLabels.length).fill(null), ...fcast.map(f => f.closedSales)],
              backgroundColor: C_AMBER + 'bb', borderWidth: 1, borderColor: C_AMBER, borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 8, right: 8 } },
          plugins: {
            legend: { display: true, position: 'top', align: 'end',
              labels: { color: tickColor, font: { size: 10 }, boxWidth: 10, padding: 10, usePointStyle: true } },
            tooltip: { ...tt, mode: 'index', intersect: false },
          },
          scales: {
            x: { ...scaleNoVGrid, ticks: { ...scaleBase.ticks, callback: (v, i) => i % 3 === 0 ? allLabels[i] : '' } },
            y: { ...scaleBase, ticks: { ...scaleBase.ticks, callback: v => `${v} sales` } },
          },
        },
      });
    }

    // Forecast Chart 3 — inventory (line) + pending (bars)
    const fInvEl = document.getElementById('lux-fcast-inv-chart');
    if (fInvEl) {
      destroyChart('lux-fcast-inv-chart');
      const histInv  = months.map(m => m.inventory);
      const fcastInv = fcast.map(f => f.inventory);
      chartRegistry['lux-fcast-inv-chart'] = new Chart(fInvEl.getContext('2d'), {
        data: {
          labels: allLabels,
          datasets: [
            {
              type: 'line', label: 'Inventory (hist.)',
              data: [...histInv, ...Array(fcastLabels.length).fill(null)],
              borderColor: C_BLUE, borderWidth: 2, pointRadius: 2,
              pointBackgroundColor: '#1a1d27', pointBorderColor: C_BLUE,
              tension: 0.4, fill: false, yAxisID: 'yL',
            },
            {
              type: 'line', label: 'Inventory (fcast)',
              data: [...Array(histLabels.length - 1).fill(null), histInv[histInv.length-1], ...fcastInv],
              borderColor: C_AMBER, borderWidth: 2, borderDash: [6,4], pointRadius: 2,
              pointBackgroundColor: C_AMBER, tension: 0.4, fill: false, yAxisID: 'yL',
            },
            {
              type: 'bar', label: 'Pending (hist.)',
              data: [...months.map(m => m.pending), ...Array(fcastLabels.length).fill(null)],
              backgroundColor: C_TEAL + 'aa', borderWidth: 0, borderRadius: 3, yAxisID: 'yR',
            },
            {
              type: 'bar', label: 'Pending (fcast)',
              data: [...Array(histLabels.length).fill(null), ...fcast.map(f => f.pending)],
              backgroundColor: C_AMBER + '66', borderWidth: 1, borderColor: C_AMBER, borderRadius: 3, yAxisID: 'yR',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          layout: { padding: { top: 8, right: 8 } },
          plugins: {
            legend: { display: true, position: 'top', align: 'end',
              labels: { color: tickColor, font: { size: 10 }, boxWidth: 10, padding: 8, usePointStyle: true } },
            tooltip: { ...tt, mode: 'index', intersect: false },
          },
          scales: {
            x: { ...scaleNoVGrid, ticks: { ...scaleBase.ticks, callback: (v, i) => i % 3 === 0 ? allLabels[i] : '' } },
            yL: { type: 'linear', position: 'left', ...scaleBase,
              ticks: { ...scaleBase.ticks, color: C_BLUE },
              title: { display: true, text: 'Inventory', color: C_BLUE, font: { size: 9 } } },
            yR: { type: 'linear', position: 'right',
              ticks: { color: C_TEAL, font: tickFont, padding: 6 },
              grid: { drawOnChartArea: false }, border: { display: false },
              title: { display: true, text: 'Pending', color: C_TEAL, font: { size: 9 } } },
          },
        },
      });
    }
  }, 0);

  return el;
}

// ── Section: Inflation ───────────────────────────────────────────────────────

function renderInflation() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Inflation</div>
    <div class="section-subtitle">CPI, PCE, PPI and inflation expectations — national & Seattle metro</div>`;

  const sections = [
    { title: 'Headline Measures', ids: ['cpiHeadline', 'cpiCore', 'pce', 'pceCore', 'trimmedMeanPce'] },
    { title: 'Inflation Expectations', ids: ['breakeven5y', 'breakeven10y', 'clevelandFedInfExp'] },
    { title: 'CPI Components', ids: ['cpiShelter', 'cpiEnergy', 'cpiFood', 'cpiMedical', 'cpiTransport'] },
    { title: 'Seattle Metro', ids: ['seaMetroCpi'] },
    { title: 'Producer Prices', ids: ['ppi', 'ppiCore'] },
  ];

  const allShown = [];
  sections.forEach(s => {
    el.innerHTML += `<div class="subsection-title">${s.title}</div>`;
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    s.ids.forEach(id => {
      const m = ALL_METRICS[id];
      if (m) { grid.appendChild(buildMetricCard(m)); allShown.push(m); }
    });
    el.appendChild(grid);
  });

  setTimeout(() => {
    drawSparklines(allShown);
    populateSignals(allShown, el);
  }, 50);

  return el;
}

// ── Section: Employment ──────────────────────────────────────────────────────

function renderEmployment() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Employment</div>
    <div class="section-subtitle">Labor market data — Seattle MSA, Washington State, and national</div>`;

  const sections = [
    { title: 'Seattle & WA State', ids: ['seaUnemployment', 'waStateInitialClaims', 'seaPayrolls', 'seaTechLayoffs'] },
    { title: 'Unemployment Dashboard', ids: ['u3', 'u6', 'initialClaims', 'continuingClaims'] },
    { title: 'Payrolls & Labor Force', ids: ['nfp', 'lfpr', 'avgHourlyEarnings', 'atlantaWageTracker'] },
    { title: 'JOLTS', ids: ['joltsOpenings', 'joltsQuits', 'joltsLayoffs'] },
  ];

  const allShown = [];
  sections.forEach(s => {
    el.innerHTML += `<div class="subsection-title">${s.title}</div>`;
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    s.ids.forEach(id => {
      const m = ALL_METRICS[id];
      if (m) { grid.appendChild(buildMetricCard(m)); allShown.push(m); }
    });
    el.appendChild(grid);
  });

  // U1–U6 comparison table
  el.innerHTML += `<div class="subsection-title">Unemployment Rate Spectrum</div>
  <table class="data-table">
    <thead><tr><th>Measure</th><th>Description</th><th>Rate</th></tr></thead>
    <tbody>
      <tr><td>U-1</td><td>Persons unemployed 15+ weeks</td><td>1.2%</td></tr>
      <tr><td>U-2</td><td>Job losers & persons who completed temp jobs</td><td>2.0%</td></tr>
      <tr><td>U-3</td><td>Official unemployment rate</td><td>4.1%</td></tr>
      <tr><td>U-4</td><td>U-3 + discouraged workers</td><td>4.5%</td></tr>
      <tr><td>U-5</td><td>U-4 + marginally attached workers</td><td>5.4%</td></tr>
      <tr><td>U-6</td><td>U-5 + part-time for economic reasons</td><td>7.8%</td></tr>
    </tbody>
  </table>`;

  setTimeout(() => {
    drawSparklines(allShown);
    populateSignals(allShown, el);
  }, 50);

  return el;
}

// ── Section: Fed ─────────────────────────────────────────────────────────────

function renderFed() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Federal Reserve</div>
    <div class="section-subtitle">Rate policy, expectations, and FOMC calendar</div>`;

  // Policy rates
  el.innerHTML += `<div class="subsection-title">Current Policy</div>`;
  const policyGrid = document.createElement('div');
  policyGrid.className = 'card-grid';
  ['effFedFunds', 'fedTargetHigh'].forEach(id => policyGrid.appendChild(buildMetricCard(ALL_METRICS[id])));
  el.appendChild(policyGrid);

  // Cut probability cards
  el.innerHTML += `<div class="subsection-title">Cut Probabilities by Meeting (CME FedWatch)</div>`;
  const probGrid = document.createElement('div');
  probGrid.className = 'card-grid';
  ['cutProbJul', 'cutProbSep', 'cutProbNov'].forEach(id => probGrid.appendChild(buildMetricCard(ALL_METRICS[id])));
  el.appendChild(probGrid);

  // FOMC meeting probability bars
  el.innerHTML += `<div class="subsection-title">FOMC Meeting Probability Distribution</div>`;
  const meetingsEl = document.createElement('div');
  meetingsEl.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-bottom:16px;';
  FOMC_MEETINGS.forEach(mtg => {
    meetingsEl.innerHTML += `
    <div style="margin-bottom:16px;">
      <div style="font-weight:600;font-size:.85rem;margin-bottom:8px;color:var(--text)">${mtg.label} FOMC</div>
      <div class="prob-bar-row">
        <span class="prob-label">Hold</span>
        <div class="prob-bar-bg"><div class="prob-bar-fill" style="width:${mtg.holdProb}%;background:#4f8ef7"></div></div>
        <span class="prob-value" style="color:#4f8ef7">${mtg.holdProb}%</span>
      </div>
      <div class="prob-bar-row">
        <span class="prob-label">Cut</span>
        <div class="prob-bar-bg"><div class="prob-bar-fill" style="width:${mtg.cutProb}%;background:#34d399"></div></div>
        <span class="prob-value" style="color:#34d399">${mtg.cutProb}%</span>
      </div>
      <div class="prob-bar-row">
        <span class="prob-label">Hike</span>
        <div class="prob-bar-bg"><div class="prob-bar-fill" style="width:${mtg.hikeProb}%;background:#f87171"></div></div>
        <span class="prob-value" style="color:#f87171">${mtg.hikeProb}%</span>
      </div>
    </div>`;
  });
  el.appendChild(meetingsEl);

  const shown = ['effFedFunds', 'fedTargetHigh', 'cutProbJul', 'cutProbSep', 'cutProbNov'].map(id => ALL_METRICS[id]);
  setTimeout(() => {
    drawSparklines(shown);
    populateSignals(shown, el);
  }, 50);

  return el;
}

// ── Section: Upcoming ────────────────────────────────────────────────────────

function renderUpcoming() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Upcoming Releases</div>
    <div class="section-subtitle">Economic calendar — consensus estimates and prior readings</div>`;

  const calEl = document.createElement('div');
  UPCOMING_RELEASES.forEach(ev => {
    const d = new Date(ev.date + 'T12:00:00');
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    calEl.innerHTML += `<div class="calendar-event">
      <div class="calendar-date">${label}</div>
      <div class="calendar-details">
        <div class="calendar-name">${ev.name}</div>
        <div class="calendar-meta">Source: ${ev.source || '—'}</div>
        ${ev.prior ? `<div class="calendar-meta">Prior: ${ev.prior}</div>` : ''}
        ${ev.consensus ? `<div class="calendar-consensus">Consensus: ${ev.consensus}</div>` : ''}
      </div>
    </div>`;
  });
  el.appendChild(calEl);
  return el;
}

// ── Section: Recent Releases ─────────────────────────────────────────────────

function renderRecent() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Recent Data Releases</div>
    <div class="section-subtitle">Latest readings organized by source</div>`;

  Object.entries(RECENT_RELEASES).forEach(([source, items]) => {
    const group = document.createElement('div');
    group.className = 'release-group';
    group.innerHTML = `<div class="release-group-title">${source}</div>`;
    items.forEach(item => {
      group.innerHTML += `<div class="release-item">
        <span class="release-item-name">${item.name}</span>
        <span class="release-item-value">${item.value}</span>
        <span class="release-item-date">${item.date}</span>
      </div>`;
    });
    el.appendChild(group);
  });

  return el;
}

// ── Section: Flagged ─────────────────────────────────────────────────────────

function renderFlagged() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Flagged Metrics</div>
    <div class="section-subtitle">Metrics you've starred for quick access</div>`;

  const flaggedMetrics = [...flagged].map(id => ALL_METRICS[id]).filter(Boolean);
  if (flaggedMetrics.length === 0) {
    el.innerHTML += `<p style="color:var(--text-muted);margin-top:16px;">No metrics flagged yet. Click the ★ button on any card to flag it.</p>`;
    return el;
  }

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  flaggedMetrics.forEach(m => grid.appendChild(buildMetricCard(m)));
  el.appendChild(grid);

  setTimeout(() => {
    drawSparklines(flaggedMetrics);
    populateSignals(flaggedMetrics, el);
  }, 50);

  return el;
}

// ── Section: All Data ─────────────────────────────────────────────────────────

function renderAllData() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">All Data</div>
    <div class="section-subtitle">Complete metric database grouped by category</div>`;

  const allShown = [];
  Object.entries(CATEGORIES).forEach(([cat, ids]) => {
    const catEl = document.createElement('div');
    catEl.className = 'alldata-category';
    catEl.innerHTML = `<div class="alldata-category-title">${cat}</div>`;
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    ids.forEach(id => {
      const m = ALL_METRICS[id];
      if (m) { grid.appendChild(buildMetricCard(m)); allShown.push(m); }
    });
    catEl.appendChild(grid);
    el.appendChild(catEl);
  });

  setTimeout(() => {
    drawSparklines(allShown);
    populateSignals(allShown, el);
  }, 50);

  return el;
}

// ── Section: Help / Sources ──────────────────────────────────────────────────

function renderHelp() {
  const el = document.createElement('div');
  el.innerHTML = `<div class="section-title">Help & Data Sources</div>
    <div class="section-subtitle">Metric definitions, data sources, and how to use this dashboard</div>`;

  // ── How to use ──
  el.innerHTML += `<div class="subsection-title">How to Use</div>`;
  const howTo = document.createElement('div');
  howTo.className = 'narrative-box';
  howTo.innerHTML = `<h3>Dashboard Guide</h3>
    <p><strong>Navigation:</strong> Use the left sidebar to jump between sections — Today, Housing, Inflation, Employment, Fed, and more.</p>
    <br>
    <p><strong>Metric Cards:</strong> Each card shows the metric name, a sparkline of recent history, the latest value, period change, and year-over-year change. Green = positive signal, red = negative signal (direction is context-aware — e.g. falling unemployment is green).</p>
    <br>
    <p><strong>★ Flag:</strong> Click the star on any card to save it to your Flagged section for quick daily reference. Flags persist across sessions.</p>
    <br>
    <p><strong>CSV Export:</strong> Click CSV on any card to download the latest reading as a spreadsheet.</p>
    <br>
    <p><strong>AI Signals:</strong> Enter your Databricks workspace URL, serving endpoint name, and a personal access token (or OAuth token) in the sidebar to get a one-line AI interpretation on every card and AI-generated narrative summaries at the top of each section. All credentials are stored only in your browser's localStorage.</p>
    <br>
    <p><strong>Search:</strong> The search bar at the top of the sidebar finds any metric by name or category.</p>
    <br>
    <p><strong>📍 Pin icon:</strong> Metrics marked with 📍 are localized to Seattle/King County/WA State. Unmarked metrics are national.</p>`;
  el.appendChild(howTo);

  // ── Data sources table ──
  el.innerHTML += `<div class="subsection-title">Data Sources</div>`;
  const sources = [
    { name: 'Altos Research', type: 'Weekly housing', url: 'https://www.altosresearch.com', metrics: 'Active inventory, new listings, pending sales, price reductions, days on market, weeks of supply', access: 'Paid subscription', live: false },
    { name: 'Redfin Data Center', type: 'Weekly/monthly housing', url: 'https://www.redfin.com/news/data-center/', metrics: 'Median sale price, sale-to-list ratio, days on market, pending sales', access: 'Free CSV download', live: false },
    { name: 'NWMLS', type: 'Monthly housing', url: 'https://www.nwmls.com/market-statistics/', metrics: 'King/Snohomish County closed sales, median prices', access: 'Public stats page', live: false },
    { name: 'FRED (St. Louis Fed)', type: 'Economic aggregator', url: 'https://fred.stlouisfed.org', metrics: 'Treasury yields, Fed funds rate, CPI, PCE, payrolls, claims — nearly everything national', access: 'Free API key at fred.stlouisfed.org/docs/api', live: true },
    { name: 'BLS (Bureau of Labor Statistics)', type: 'Monthly/weekly labor', url: 'https://www.bls.gov/developers/', metrics: 'CPI, PPI, nonfarm payrolls, unemployment rates, JOLTS, hourly earnings', access: 'Free API key', live: true },
    { name: 'BEA (Bureau of Economic Analysis)', type: 'Monthly macro', url: 'https://apps.bea.gov/API/signup/', metrics: 'PCE, GDP, personal income', access: 'Free API key', live: true },
    { name: 'Freddie Mac', type: 'Weekly mortgage', url: 'https://www.freddiemac.com/pmms', metrics: '30-year and 15-year fixed mortgage rates', access: 'Free CSV download (FRED also has this)', live: false },
    { name: 'NAR (National Assoc. of Realtors)', type: 'Monthly housing', url: 'https://www.nar.realtor/research-and-statistics', metrics: 'Existing home sales, pending home sales index', access: 'Public press releases; paid for full data', live: false },
    { name: 'Census / HUD', type: 'Monthly construction', url: 'https://www.census.gov/construction/nrc/', metrics: 'Housing starts, building permits, completions, units under construction, new home sales', access: 'Free — FRED carries it all', live: true },
    { name: 'S&P / Case-Shiller', type: 'Monthly home prices', url: 'https://fred.stlouisfed.org/series/SEXRNSA', metrics: 'Seattle Home Price Index (2-month lag)', access: 'Free via FRED (series SEXRNSA)', live: true },
    { name: 'WA Employment Security Dept.', type: 'Weekly/monthly labor', url: 'https://esd.wa.gov/labormarketinfo', metrics: 'WA initial claims, Seattle metro unemployment, WA payrolls by sector', access: 'Free download / public data', live: false },
    { name: 'CME FedWatch', type: 'Daily Fed expectations', url: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html', metrics: 'Cut/hold/hike probabilities by FOMC meeting', access: 'Free web scrape or paid API', live: false },
    { name: 'Atlanta Fed Wage Tracker', type: 'Monthly wages', url: 'https://www.atlantafed.org/chcs/wage-growth-tracker', metrics: 'Median wage growth YoY', access: 'Free CSV download', live: false },
    { name: 'Cleveland Fed', type: 'Monthly expectations', url: 'https://www.clevelandfed.org/indicators-and-data/inflation-expectations', metrics: '1-year inflation expectations', access: 'Free CSV download', live: false },
    { name: 'Dallas Fed', type: 'Monthly inflation', url: 'https://www.dallasfed.org/research/pce', metrics: 'Trimmed Mean PCE', access: 'Free CSV download', live: false },
    { name: 'Treasury Dept.', type: 'Daily yields', url: 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/', metrics: '2-year, 10-year Treasury yields, TIPS breakevens', access: 'Free CSV / FRED API', live: true },
  ];

  const table = document.createElement('div');
  table.innerHTML = `<table class="data-table">
    <thead><tr><th>Source</th><th>Covers</th><th>Metrics Used Here</th><th>Access</th><th>Live API?</th></tr></thead>
    <tbody>${sources.map(s => `
      <tr>
        <td><a href="${s.url}" target="_blank" style="color:var(--accent);text-decoration:none">${s.name}</a></td>
        <td style="color:var(--text-muted)">${s.type}</td>
        <td>${s.metrics}</td>
        <td style="color:var(--text-muted)">${s.access}</td>
        <td style="text-align:center">${s.live ? '<span style="color:var(--green)">✓</span>' : '<span style="color:var(--text-muted)">—</span>'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
  el.appendChild(table);

  // ── Metric definitions ──
  el.innerHTML += `<div class="subsection-title" style="margin-top:32px">Metric Definitions</div>`;

  const defs = [
    { term: 'Active Inventory', def: 'The number of homes listed for sale at a given point in time. Rising inventory favors buyers; falling inventory favors sellers.' },
    { term: 'Weeks of Supply', def: 'Active inventory divided by the weekly sales pace. Under 3 weeks = strong seller\'s market; 4–6 weeks = balanced; 6+ weeks = buyer\'s market.' },
    { term: 'Days on Market (DOM)', def: 'Median number of days from listing to accepted offer. A rising DOM signals softening demand.' },
    { term: 'Sale-to-List Ratio', def: 'Final sale price divided by the original list price. Above 100% means homes are selling above asking (bidding wars); below 100% means sellers are accepting discounts.' },
    { term: 'Price Reductions', def: 'Share of active listings that have had at least one price cut. Rising reductions = sellers losing pricing power.' },
    { term: 'Case-Shiller HPI', def: 'The S&P/Case-Shiller Home Price Index for Seattle. Tracks repeat-sale price changes on the same properties. Published with a ~2 month lag.' },
    { term: 'Price-to-Income Ratio', def: 'Median home price divided by median household income. A ratio above 5x is considered stretched; Seattle\'s 10.4x is among the highest in the US.' },
    { term: 'Mortgage Spread', def: 'The difference between the 30-year mortgage rate and the 10-year Treasury yield. Historically ~1.7%; elevated spreads (2.4%+) indicate lender risk aversion.' },
    { term: 'Treasury Breakeven', def: 'The difference between nominal Treasury yields and TIPS yields of the same maturity. Represents the market\'s implied inflation expectation over that horizon.' },
    { term: 'CPI vs PCE', def: 'Both measure inflation but differ in scope. PCE (the Fed\'s preferred measure) is broader, includes more healthcare, and weights categories by actual spending patterns rather than a fixed basket.' },
    { term: 'Core Inflation', def: 'CPI or PCE excluding food and energy, which are volatile. Core is used to gauge underlying inflation trend.' },
    { term: 'Trimmed Mean PCE', def: 'A Dallas Fed measure that strips out the highest and lowest price changes each month, leaving the middle of the distribution. Considered a clean signal of underlying inflation.' },
    { term: 'U-3 vs U-6', def: 'U-3 is the official unemployment rate (jobless and actively seeking work). U-6 adds discouraged workers and those working part-time who want full-time work — a broader measure of labor underutilization.' },
    { term: 'JOLTS', def: 'Job Openings and Labor Turnover Survey. Tracks openings, hires, quits, and layoffs. The quits rate ("Great Resignation" metric) reflects worker confidence in finding better jobs.' },
    { term: 'Labor Force Participation Rate (LFPR)', def: 'Share of the civilian non-institutional population that is working or actively looking for work. Declining LFPR can mask true unemployment.' },
    { term: 'Nonfarm Payrolls (NFP)', def: 'Monthly change in the number of employed workers, excluding farm workers and private household employees. The most-watched labor market release.' },
    { term: 'Initial Claims', def: 'New unemployment insurance filings in the most recent week. A leading indicator of layoffs. 4-week moving average smooths volatility.' },
    { term: 'Continuing Claims', def: 'The total number of people currently receiving unemployment benefits. A lagging indicator of labor market health.' },
    { term: 'Effective Fed Funds Rate', def: 'The actual overnight rate at which banks lend to each other, which the Fed steers toward its target range via open market operations.' },
    { term: 'FOMC Cut Probability', def: 'Derived from Fed Funds futures prices (CME FedWatch). Reflects market consensus on whether the Fed will cut, hold, or hike at the next meeting.' },
    { term: 'PPI (Producer Price Index)', def: 'Measures inflation at the wholesale/producer level — what businesses pay for inputs. Often leads CPI by 1–3 months as cost pressures pass through to consumers.' },
    { term: 'SAAR (Seasonally Adjusted Annual Rate)', def: 'A statistical adjustment that removes seasonal patterns and annualizes the monthly pace. Allows apples-to-apples comparisons across months.' },
  ];

  const defsEl = document.createElement('div');
  defsEl.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px;';
  defs.forEach(d => {
    defsEl.innerHTML += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px 16px;">
      <div style="font-weight:700;font-size:.83rem;color:var(--accent);margin-bottom:6px">${d.term}</div>
      <div style="font-size:.8rem;color:var(--text-muted);line-height:1.5">${d.def}</div>
    </div>`;
  });
  el.appendChild(defsEl);

  // ── Wiring up live data ──
  el.innerHTML += `<div class="subsection-title" style="margin-top:32px">Wiring Up Live Data</div>`;
  const liveBox = document.createElement('div');
  liveBox.className = 'narrative-box';
  liveBox.innerHTML = `<h3>How to Replace Mock Data with Real Feeds</h3>
    <p>All data currently lives in <code style="color:var(--accent)">js/data.js</code>. Each metric has a <code style="color:var(--accent)">sparkline</code> array and scalar values you can replace with API responses.</p>
    <br>
    <p><strong>Easiest starting point — FRED API (free):</strong><br>
    1. Get a free key at <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" style="color:var(--accent)">fred.stlouisfed.org</a><br>
    2. Fetch any series: <code style="color:var(--accent)">https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=YOUR_KEY&file_type=json</code><br>
    3. Replace the <code>sparkline</code> array and <code>value</code> fields in data.js with the response data.</p>
    <br>
    <p><strong>Key FRED series IDs used here:</strong></p>
    <table class="data-table" style="margin-top:8px">
      <thead><tr><th>Metric</th><th>FRED Series ID</th></tr></thead>
      <tbody>
        <tr><td>30-yr Mortgage Rate</td><td>MORTGAGE30US</td></tr>
        <tr><td>10-yr Treasury</td><td>DGS10</td></tr>
        <tr><td>2-yr Treasury</td><td>DGS2</td></tr>
        <tr><td>Effective Fed Funds</td><td>EFFR</td></tr>
        <tr><td>CPI YoY</td><td>CPIAUCSL (compute YoY)</td></tr>
        <tr><td>Core CPI YoY</td><td>CPILFESL</td></tr>
        <tr><td>PCE YoY</td><td>PCEPI</td></tr>
        <tr><td>Core PCE</td><td>PCEPILFE</td></tr>
        <tr><td>Initial Claims</td><td>ICSA</td></tr>
        <tr><td>Continuing Claims</td><td>CCSA</td></tr>
        <tr><td>Nonfarm Payrolls</td><td>PAYEMS</td></tr>
        <tr><td>U-3 Unemployment</td><td>UNRATE</td></tr>
        <tr><td>U-6 Unemployment</td><td>U6RATE</td></tr>
        <tr><td>Housing Starts</td><td>HOUST</td></tr>
        <tr><td>Building Permits</td><td>PERMIT</td></tr>
        <tr><td>Seattle Case-Shiller</td><td>SEXRNSA</td></tr>
        <tr><td>Seattle Unemployment</td><td>SEAT453URN</td></tr>
        <tr><td>5-yr Breakeven</td><td>T5YIE</td></tr>
        <tr><td>10-yr Breakeven</td><td>T10YIE</td></tr>
      </tbody>
    </table>`;
  el.appendChild(liveBox);

  return el;
}

// ── Metric Expand Modal ──────────────────────────────────────────────────────

function closeModal() {
  const overlay = document.getElementById('metric-modal-overlay');
  if (overlay) overlay.classList.remove('open');
  destroyChart('modal-chart');
}

function openMetricModal(metricId) {
  const metric = ALL_METRICS[metricId];
  if (!metric) return;

  const overlay = document.getElementById('metric-modal-overlay');
  if (!overlay) return;

  const inverted = INVERTED.has(metricId);
  const pcClass  = changeClass(metric.periodChange, inverted);
  const yoyClass = changeClass(metric.yoyChange, inverted);

  // Header
  document.getElementById('modal-title').textContent = metric.name + (metric.local ? ' 📍' : '');
  document.getElementById('modal-meta').textContent  = `${metric.date}  ·  ${metric.category || ''}`;

  // Stat tiles
  document.getElementById('modal-stats').innerHTML = `
    <div class="modal-stat">
      <div class="modal-stat-label">Current</div>
      <div class="modal-stat-value">${fmt(metric)}</div>
    </div>
    <div class="modal-stat">
      <div class="modal-stat-label">Period Change</div>
      <div class="modal-stat-value ${pcClass}">${fmtChange(metric.periodChange, metric.unit)}${fmtPeriodPct(metric)}</div>
    </div>
    <div class="modal-stat">
      <div class="modal-stat-label">YoY Change</div>
      <div class="modal-stat-value ${yoyClass}">${fmtChange(metric.yoyChange, metric.unit)} YoY${fmtYoyPct(metric)}</div>
    </div>
    ${metric.unit ? `<div class="modal-stat"><div class="modal-stat-label">Unit</div><div class="modal-stat-value" style="font-size:1rem">${metric.unit.trim() || '—'}</div></div>` : ''}
  `;

  document.getElementById('modal-signal').textContent = 'Generating AI signal…';
  document.getElementById('modal-signal').classList.add('loading');
  document.getElementById('modal-source').textContent = `Source: ${metric.release || '—'}`;

  // Monthly breakdown table
  const existingTable = document.getElementById('modal-monthly-table');
  if (existingTable) existingTable.remove();

  const history = metric.monthlyHistory;
  if (history && history.length) {
    const tableWrap = document.createElement('div');
    tableWrap.id = 'modal-monthly-table';
    tableWrap.className = 'modal-monthly-wrap';
    const rows = history.slice().reverse().map((row, i, arr) => {
      const prev = arr[i + 1];
      const priceDir = prev ? (row.medianPrice > prev.medianPrice ? 'up' : row.medianPrice < prev.medianPrice ? 'down' : '') : '';
      const domDir   = prev ? (row.dom < prev.dom ? 'up' : row.dom > prev.dom ? 'down' : '') : '';
      const s2lDir   = prev ? (row.saleToList > prev.saleToList ? 'up' : row.saleToList < prev.saleToList ? 'down' : '') : '';
      const prDir    = prev ? (row.priceReductions < prev.priceReductions ? 'up' : row.priceReductions > prev.priceReductions ? 'down' : '') : '';
      return `<tr>
        <td>${row.month}</td>
        <td class="${priceDir}">$${row.medianPrice.toLocaleString()}</td>
        <td class="${domDir}">${row.dom}</td>
        <td class="${s2lDir}">${row.saleToList.toFixed(1)}%</td>
        <td class="${prDir}">${row.priceReductions.toFixed(1)}%</td>
      </tr>`;
    }).join('');
    tableWrap.innerHTML = `
      <div class="modal-monthly-title">Monthly Breakdown — Altos / Redfin <span class="modal-monthly-badge">Mock</span></div>
      <div class="modal-monthly-scroll">
        <table class="data-table">
          <thead><tr><th>Month</th><th>MDN Sale Price</th><th>Avg DOM</th><th>Sold/List %</th><th>Price Reductions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    document.getElementById('modal-signal').before(tableWrap);
  }

  // Show overlay
  overlay.classList.add('open');

  // Draw chart
  destroyChart('modal-chart');
  const canvas = document.getElementById('modal-chart');
  if (canvas && metric.sparkline && metric.sparkline.length) {
    const data = metric.sparkline;
    const positiveTrend = inverted ? data[data.length - 1] < data[0] : data[data.length - 1] > data[0];
    const color = positiveTrend ? '#34d399' : '#f87171';
    const labels = Array.from({ length: data.length }, (_, i) => {
      const d = new Date(metric.date);
      d.setMonth(d.getMonth() - (data.length - 1 - i));
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    chartRegistry['modal-chart'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: color,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.35,
          fill: true,
          backgroundColor: ctx => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 160);
            g.addColorStop(0, color + '33');
            g.addColorStop(1, color + '00');
            return g;
          },
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1a1d27', borderColor: '#2e3250', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#8892aa' },
        },
        scales: {
          x: { ticks: { color: '#8892aa', font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: '#2e3250' } },
          y: { ticks: { color: '#8892aa', font: { size: 10 } }, grid: { color: '#2e3250' } },
        },
      },
    });
  }

  // AI signal
  const signalEl = document.getElementById('modal-signal');
  if (AI.hasKey()) {
    AI.metricSignal(metric).then(sig => {
      signalEl.textContent = sig || 'No signal available.';
      signalEl.classList.remove('loading');
    }).catch(() => {
      signalEl.textContent = 'Signal unavailable.';
      signalEl.classList.remove('loading');
    });
  } else {
    signalEl.textContent = 'Connect Databricks in the sidebar to get AI signals.';
    signalEl.classList.remove('loading');
  }
}

// Wire modal close handlers
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('metric-modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Section: Zip Code ────────────────────────────────────────────────────────

function renderZip(zip) {
  const el = document.createElement('div');
  const d = ZIP_DATA[zip];

  if (!d) {
    el.innerHTML = `<div class="section-title">Zip Code: ${zip}</div>
      <div class="zip-not-found">
        <strong style="color:var(--yellow)">No data for zip code ${zip}.</strong><br><br>
        Coverage includes ~40 Seattle-area zip codes across King, Pierce, and Snohomish counties.
        Try one of the featured zips in the sidebar, or check the Housing section for county-level data.
      </div>`;
    return el;
  }

  const priceCls  = d.yoyPricePct >= 0 ? 'up' : 'down';
  const domCls    = d.daysOnMarket <= 10 ? 'up' : d.daysOnMarket >= 20 ? 'down' : '';
  const s2lCls    = d.saleToList >= 101 ? 'up' : d.saleToList < 99 ? 'down' : '';
  const reduxCls  = d.priceReductions <= 8 ? 'up' : d.priceReductions >= 16 ? 'down' : '';
  const sign      = v => v >= 0 ? `+${v}` : `${v}`;

  el.innerHTML = `
    <div class="section-title">Zip ${zip}</div>
    <div class="section-subtitle">${d.name} · ${d.county} County · Data as of Apr 2026</div>
    <div class="zip-neighborhood-badge">📍 ${d.name}, ${d.county} County</div>
  `;

  // Hero stats
  const hero = document.createElement('div');
  hero.className = 'zip-hero';
  [
    { label: 'Median Sale Price',  value: '$' + (d.medianPrice/1000).toFixed(0) + 'K',   cls: priceCls },
    { label: 'Median List Price',  value: '$' + (d.medianListPrice/1000).toFixed(0) + 'K', cls: '' },
    { label: 'Days on Market',     value: d.daysOnMarket + ' days',  cls: domCls },
    { label: 'Sale-to-List',       value: d.saleToList + '%',        cls: s2lCls },
    { label: 'Active Listings',    value: d.inventory.toLocaleString(), cls: '' },
    { label: 'Price YoY',          value: sign(d.yoyPricePct) + '%', cls: priceCls },
  ].forEach(s => {
    hero.innerHTML += `<div class="zip-stat">
      <div class="zip-stat-label">${s.label}</div>
      <div class="zip-stat-value ${s.cls}">${s.value}</div>
    </div>`;
  });
  el.appendChild(hero);

  // Detail table
  el.innerHTML += `<div class="subsection-title">Full Market Snapshot</div>`;
  const tbl = document.createElement('div');
  tbl.innerHTML = `<table class="data-table">
    <thead><tr><th>Metric</th><th>Value</th><th>Signal</th></tr></thead>
    <tbody>
      <tr><td>Median Sale Price</td><td>$${d.medianPrice.toLocaleString()}</td>
          <td class="${priceCls}">${sign(d.yoyPricePct)}% YoY</td></tr>
      <tr><td>Median List Price</td><td>$${d.medianListPrice.toLocaleString()}</td><td>—</td></tr>
      <tr><td>Days on Market</td><td>${d.daysOnMarket} days</td>
          <td class="${domCls}">${d.daysOnMarket <= 10 ? 'Hot — seller market' : d.daysOnMarket >= 20 ? 'Cooling' : 'Balanced'}</td></tr>
      <tr><td>Sale-to-List Ratio</td><td>${d.saleToList}%</td>
          <td class="${s2lCls}">${d.saleToList >= 101 ? 'Selling above ask' : d.saleToList < 99 ? 'Below ask' : 'At ask'}</td></tr>
      <tr><td>Active Listings</td><td>${d.inventory.toLocaleString()}</td><td>—</td></tr>
      <tr><td>New Listings (mo)</td><td>${d.newListings}</td><td>—</td></tr>
      <tr><td>Pending Sales (mo)</td><td>${d.pendingSales}</td>
          <td>${d.pendingSales > d.newListings * 0.75 ? 'Strong absorption' : 'Moderate demand'}</td></tr>
      <tr><td>Price Reductions</td><td>${d.priceReductions}% of listings</td>
          <td class="${reduxCls}">${d.priceReductions <= 8 ? 'Sellers hold firm' : d.priceReductions >= 16 ? 'Sellers cutting prices' : 'Normal'}</td></tr>
    </tbody>
  </table>`;
  el.appendChild(tbl);

  // Context vs county / MSA
  el.innerHTML += `<div class="subsection-title" style="margin-top:28px">Context — vs County & MSA</div>`;
  const seaMedian = ALL_METRICS['seaMedianPrice'] ? ALL_METRICS['seaMedianPrice'].value : 825000;
  const vsRegion = ((d.medianPrice - seaMedian) / seaMedian * 100).toFixed(1);
  const ctx = document.createElement('div');
  ctx.className = 'narrative-box';
  ctx.innerHTML = `<h3>How ${zip} Compares</h3>
    <p><strong>${d.name}</strong> has a median sale price of <strong>$${d.medianPrice.toLocaleString()}</strong>,
    which is <strong class="${vsRegion >= 0 ? 'up' : 'down'}" style="color:var(--${vsRegion >= 0 ? 'green' : 'red'})">${vsRegion >= 0 ? '+' : ''}${vsRegion}%</strong>
    vs the Seattle MSA median of $${seaMedian.toLocaleString()}.</p>
    <br>
    <p>At <strong>${d.daysOnMarket} days on market</strong> and a <strong>${d.saleToList}% sale-to-list ratio</strong>,
    this zip is a <strong>${d.saleToList >= 102 ? 'strong seller' : d.saleToList < 99 ? 'buyer-leaning' : 'balanced'} market</strong>.
    ${d.priceReductions}% of listings have seen price reductions,
    ${d.priceReductions <= 8 ? 'indicating sellers have significant pricing power.' :
      d.priceReductions >= 16 ? 'suggesting sellers are having to adjust expectations.' :
      'a normal level for the current market.'}</p>`;
  el.appendChild(ctx);

  // Nearby zips
  const nearby = Object.entries(ZIP_DATA)
    .filter(([z, zd]) => z !== zip && zd.county === d.county)
    .sort((a, b) => Math.abs(a[1].medianPrice - d.medianPrice) - Math.abs(b[1].medianPrice - d.medianPrice))
    .slice(0, 5);

  if (nearby.length) {
    el.innerHTML += `<div class="subsection-title">Nearby Zips — ${d.county} County</div>`;
    const nearbyTbl = document.createElement('div');
    nearbyTbl.innerHTML = `<table class="data-table">
      <thead><tr><th>Zip</th><th>Neighborhood</th><th>Median Price</th><th>DOM</th><th>Sale-to-List</th><th>YoY</th></tr></thead>
      <tbody>${nearby.map(([z, zd]) => `
        <tr style="cursor:pointer" onclick="navigateZip('${z}')">
          <td style="color:var(--accent);font-weight:600">${z}</td>
          <td>${zd.name}</td>
          <td>$${zd.medianPrice.toLocaleString()}</td>
          <td>${zd.daysOnMarket} days</td>
          <td class="${zd.saleToList >= 101 ? 'up' : zd.saleToList < 99 ? 'down' : ''}">${zd.saleToList}%</td>
          <td class="${zd.yoyPricePct >= 0 ? 'up' : 'down'}">${sign(zd.yoyPricePct)}%</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
    el.appendChild(nearbyTbl);
  }

  el.innerHTML += `<div class="section-divider"></div>
    <p style="font-size:.72rem;color:var(--text-muted)">
      ⚠ Zip code data is modeled from Zillow Research / Redfin estimates (Apr 2026).
      For authoritative figures use <a href="https://www.redfin.com/zipcode/${zip}" target="_blank" style="color:var(--accent)">Redfin</a>
      or <a href="https://www.zillow.com/homes/${zip}_rb/" target="_blank" style="color:var(--accent)">Zillow</a> directly.
    </p>`;

  return el;
}

// ── Routing ──────────────────────────────────────────────────────────────────

let currentSection = 'today';
let currentZip = null;

const RENDERERS = {
  today: renderToday,
  housing: renderHousing,
  luxury: renderLuxury,
  inflation: renderInflation,
  employment: renderEmployment,
  fed: renderFed,
  upcoming: renderUpcoming,
  recent: renderRecent,
  flagged: renderFlagged,
  alldata: renderAllData,
  help: renderHelp,
};

function navigate(section) {
  currentSection = section;
  currentZip = null;
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.section === section);
  });
  document.getElementById('zip-input').value = '';
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  const renderer = RENDERERS[section] || renderToday;
  main.appendChild(renderer());
  window.scrollTo(0, 0);
}

function navigateZip(zip) {
  zip = zip.trim();
  if (!/^\d{5}$/.test(zip)) return;
  currentZip = zip;
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  document.getElementById('zip-input').value = zip;
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  main.appendChild(renderZip(zip));
  window.scrollTo(0, 0);
}

// ── Search ───────────────────────────────────────────────────────────────────

function buildSearchIndex() {
  return Object.values(ALL_METRICS).map(m => ({
    id: m.id,
    name: m.name,
    section: m.section,
    category: m.category,
  }));
}

const searchIndex = buildSearchIndex();

function renderSearchResults(query) {
  const dropdown = document.getElementById('search-results');
  if (!query.trim()) { dropdown.classList.add('hidden'); return; }

  const q = query.toLowerCase();
  const matches = searchIndex.filter(m =>
    m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  ).slice(0, 8);

  if (!matches.length) { dropdown.classList.add('hidden'); return; }

  dropdown.innerHTML = matches.map(m =>
    `<div class="search-result-item" data-section="${m.section}" data-id="${m.id}">
      <div>${m.name}</div>
      <div class="result-section">${m.category} · ${m.section}</div>
    </div>`
  ).join('');

  dropdown.classList.remove('hidden');
  dropdown.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.section);
      dropdown.classList.add('hidden');
      document.getElementById('global-search').value = '';
      // Scroll to card after render
      setTimeout(() => {
        const card = document.querySelector(`[data-id="${item.dataset.id}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    });
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.nav-link').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    navigate(a.dataset.section);
  });
});

document.getElementById('global-search').addEventListener('input', e => {
  renderSearchResults(e.target.value);
});

document.addEventListener('click', e => {
  if (!e.target.closest('#search-results') && !e.target.closest('#global-search')) {
    document.getElementById('search-results').classList.add('hidden');
  }
});

document.getElementById('save-key-btn').addEventListener('click', async () => {
  const workspace = document.getElementById('db-workspace-input').value;
  const endpoint  = document.getElementById('db-endpoint-input').value;
  const token     = document.getElementById('api-key-input').value;
  const status    = document.getElementById('db-status');

  if (!workspace || !endpoint || !token) {
    status.textContent = 'Fill in all three fields.';
    status.style.color = 'var(--yellow)';
    return;
  }

  AI.setConfig({ workspace, endpoint, token });
  document.getElementById('api-key-input').value = '';
  status.textContent = 'Testing connection…';
  status.style.color = 'var(--text-muted)';

  const ok = await AI.testConnection();
  if (ok) {
    status.textContent = '✓ Connected';
    status.style.color = 'var(--green)';
    navigate(currentSection);
  } else {
    status.textContent = '✗ Connection failed — check URL, endpoint, and token';
    status.style.color = 'var(--red)';
  }
});

// ── Zip code input wiring ─────────────────────────────────────────────────────

// Populate featured zip chips
const chipsEl = document.getElementById('zip-chips');
ZIP_FEATURED.forEach(z => {
  const chip = document.createElement('span');
  chip.className = 'zip-chip';
  chip.textContent = z;
  chip.title = ZIP_DATA[z] ? ZIP_DATA[z].name : z;
  chip.addEventListener('click', () => navigateZip(z));
  chipsEl.appendChild(chip);
});

document.getElementById('zip-go-btn').addEventListener('click', () => {
  navigateZip(document.getElementById('zip-input').value);
});
document.getElementById('zip-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') navigateZip(e.target.value);
});
// Auto-navigate when exactly 5 digits are typed
document.getElementById('zip-input').addEventListener('input', e => {
  if (/^\d{5}$/.test(e.target.value)) navigateZip(e.target.value);
});

// Restore saved Databricks config into sidebar inputs
AI.restoreInputs();

// Single delegated listener for all card clicks → opens modal
document.addEventListener('click', e => {
  if (e.target.closest('.card-actions')) return;
  const card = e.target.closest('.metric-card');
  if (!card) return;
  openMetricModal(card.dataset.id);
});

// Handle hash navigation on load
const hash = window.location.hash.replace('#', '') || 'today';
navigate(RENDERERS[hash] ? hash : 'today');
