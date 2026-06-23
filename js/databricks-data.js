// Databricks live-data integration.
// Calls a Databricks Model Serving endpoint that returns fresh metric values
// from Unity Catalog Delta tables. Falls back transparently to static data.js
// if no endpoint is configured or the fetch fails.
//
// Expected endpoint response shape (predictions[0]):
// {
//   today: '2026-06-22',
//   metrics: [{ id, value, period_change, yoy_change, date }, ...],
//   upcomingReleases: [{ date, name, prior, consensus, source, actual? }, ...],
//   recentReleases: { 'Source Name': [{ name, value, date }, ...], ... },
//   todayNarrative: '...',        // optional
//   todayKeyMetrics: [...]        // optional
// }

const DatabricksData = (() => {
  const STORAGE_KEY_DATA_EP = 'db_data_endpoint';
  const FETCH_TIMEOUT_MS    = 6000;

  // Per-metric sparkline volatility — mirrors data.js recomputeSparklines
  const VOLATILITY_MAP = {
    sp500: 0.018, oil: 0.03, seaActiveInventory: 0.05, seaNewListings: 0.06,
    seaPendingSales: 0.05, nfp: 0.08, seaPayrolls: 0.09, initialClaims: 0.04,
    continuingClaims: 0.03, joltsOpenings: 0.04, joltsQuits: 0.04,
    housingStarts: 0.05, buildingPermits: 0.04, seaPermits: 0.07,
    kingPermits: 0.09, piercePermits: 0.10, snohomishPermits: 0.10,
  };

  // ── Config helpers ──────────────────────────────────────────────────────────

  function getConfig() {
    return {
      workspace:    (localStorage.getItem('db_workspace')     || '').replace(/\/$/, ''),
      dataEndpoint: (localStorage.getItem(STORAGE_KEY_DATA_EP) || '').trim(),
      token:        (localStorage.getItem('db_token')          || '').trim(),
    };
  }

  function saveDataEndpoint(name) {
    localStorage.setItem(STORAGE_KEY_DATA_EP, name.trim());
  }

  function restoreInput() {
    const el = document.getElementById('db-data-endpoint-input');
    if (el) el.value = localStorage.getItem(STORAGE_KEY_DATA_EP) || '';
  }

  function isConfigured() {
    const c = getConfig();
    return !!(c.workspace && c.dataEndpoint && c.token);
  }

  // ── Fetch ───────────────────────────────────────────────────────────────────

  async function fetchAll() {
    if (!isConfigured()) return null;
    const config = getConfig();

    try {
      const url = `${config.workspace}/serving-endpoints/${config.dataEndpoint}/invocations`;
      const fetchPromise = fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: { request: ['all'] } }),
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS)
      );

      const resp = await Promise.race([fetchPromise, timeoutPromise]);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(`HTTP ${resp.status}: ${err.message || ''}`);
      }

      const json = await resp.json();

      // Databricks pyfunc endpoints return: { "predictions": ["...json string..."] }
      const raw = json.predictions?.[0];
      if (!raw) throw new Error('Empty predictions array');
      const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;

      return payload;

    } catch (e) {
      console.warn('[DatabricksData] Fetch failed, using static data:', e.message);
      return null;
    }
  }

  // ── Merge live data into ALL_METRICS ─────────────────────────────────────────
  // Only overwrites value, periodChange, yoyChange, date.
  // Name, unit, release, category, sparkline are recomputed/kept from data.js.

  function merge(liveData) {
    if (!liveData) return;

    // Core metrics
    if (Array.isArray(liveData.metrics)) {
      for (const row of liveData.metrics) {
        const metric = ALL_METRICS[row.id];
        if (!metric) continue;
        metric.value        = Number(row.value)        ?? metric.value;
        metric.periodChange = Number(row.period_change ?? row.periodChange) ?? metric.periodChange;
        metric.yoyChange    = Number(row.yoy_change    ?? row.yoyChange)    ?? metric.yoyChange;
        if (row.date) metric.date = row.date;

        // Recompute sparkline with updated direction
        const vol = VOLATILITY_MAP[row.id] || 0.02;
        metric.sparkline = sparklineFromMetric(metric.value, metric.yoyChange, 24, vol);
      }
    }

    // Upcoming releases
    if (Array.isArray(liveData.upcomingReleases)) {
      UPCOMING_RELEASES.length = 0;
      for (const r of liveData.upcomingReleases) {
        UPCOMING_RELEASES.push({
          date:      r.date,
          name:      r.name,
          prior:     r.prior     || '',
          consensus: r.consensus || '',
          source:    r.source    || '',
          actual:    r.actual    || null,
        });
      }
    }

    // Recent releases
    if (liveData.recentReleases && typeof liveData.recentReleases === 'object') {
      Object.keys(RECENT_RELEASES).forEach(k => delete RECENT_RELEASES[k]);
      Object.assign(RECENT_RELEASES, liveData.recentReleases);
    }

    // Today context
    if (liveData.today) TODAY_SUMMARY_CONTEXT.date = liveData.today;
    if (liveData.todayNarrative) TODAY_SUMMARY_CONTEXT.narrative = liveData.todayNarrative;
    if (Array.isArray(liveData.todayKeyMetrics)) {
      TODAY_SUMMARY_CONTEXT.keyMetrics = liveData.todayKeyMetrics;
    }
  }

  // ── Status badge ─────────────────────────────────────────────────────────────

  function setStatus(state, detail) {
    const el = document.getElementById('db-data-status');
    if (!el) return;
    const map = {
      loading: { icon: '⏳', text: 'Fetching live data…',          color: 'var(--text-muted)' },
      live:    { icon: '●',  text: `Live data · ${detail}`,        color: 'var(--green)'      },
      static:  { icon: '○',  text: 'Static data (no endpoint set)', color: 'var(--text-muted)' },
      error:   { icon: '!',  text: `Static data · ${detail}`,      color: 'var(--yellow)'     },
    };
    const s = map[state] || map.static;
    el.innerHTML = `<span style="color:${s.color};font-size:0.68rem;display:flex;align-items:center;gap:5px;margin-top:4px">
      <span>${s.icon}</span><span>${s.text}</span>
    </span>`;
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  return { fetchAll, merge, isConfigured, saveDataEndpoint, restoreInput, setStatus };
})();
