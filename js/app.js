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
