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
      <span class="metric-change ${pcClass}" title="Period change">${fmtChange(metric.periodChange, metric.unit)} period</span>
      <span class="metric-change ${yoyClass}" title="Year-over-year">${fmtChange(metric.yoyChange, metric.unit)} YoY</span>
    </div>
    <div class="metric-release">${metric.release}</div>
    <div class="metric-signal loading" data-signal-id="${metric.id}">Generating signal…</div>
    <div class="card-actions">
      <button class="btn-icon flag-btn ${isFlagged ? 'flagged' : ''}" data-id="${metric.id}" title="Flag">★</button>
      <button class="btn-icon csv-btn" data-id="${metric.id}" title="Export CSV">CSV</button>
    </div>
  `;

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
function populateSignals(metrics) {
  if (!AI.hasKey()) {
    metrics.forEach(m => {
      const el = document.querySelector(`[data-signal-id="${m.id}"]`);
      if (el) { el.textContent = 'Add Claude API key (sidebar) for AI signals.'; el.classList.remove('loading'); }
    });
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
    populateSignals(allMetricsShown);
  }, 50);

  return el;
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
    { title: 'Construction', ids: ['housingStarts', 'buildingPermits', 'seaPermits', 'housingCompletions', 'unitsUnderConstruction'] },
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

  setTimeout(() => {
    drawSparklines(allShown);
    populateSignals(allShown);
  }, 50);

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
    populateSignals(allShown);
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
    populateSignals(allShown);
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
    populateSignals(shown);
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
    populateSignals(flaggedMetrics);
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
    populateSignals(allShown);
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
    <p><strong>AI Signals:</strong> Enter a Claude API key (sidebar bottom) to get a one-line AI interpretation on every card and AI-generated narrative summaries at the top of each section. Uses claude-haiku-4-5 — very inexpensive. Key is stored only in your browser's localStorage.</p>
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

// ── Routing ──────────────────────────────────────────────────────────────────

let currentSection = 'today';

const RENDERERS = {
  today: renderToday,
  housing: renderHousing,
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
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.section === section);
  });
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  const renderer = RENDERERS[section] || renderToday;
  main.appendChild(renderer());
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

document.getElementById('save-key-btn').addEventListener('click', () => {
  const key = document.getElementById('api-key-input').value;
  AI.setKey(key);
  document.getElementById('api-key-input').value = '';
  navigate(currentSection); // re-render to trigger AI signals
});

// Handle hash navigation on load
const hash = window.location.hash.replace('#', '') || 'today';
navigate(RENDERERS[hash] ? hash : 'today');
