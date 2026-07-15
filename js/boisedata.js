// Boise MLS data integration — fetches live metrics from serving endpoint
// Parallel to databricks-data.js but for Boise (Ada + Canyon County, ID)

const BoiseData = (() => {
  let cachedData = null;
  let lastFetch = null;

  const STORAGE_KEY_ENDPOINT = 'db_boise_endpoint';

  // ── Config ──────────────────────────────────────────────────────────────────

  function getConfig() {
    return {
      workspace:  (localStorage.getItem('db_workspace') || '').replace(/\/$/, ''),
      endpoint:   (localStorage.getItem(STORAGE_KEY_ENDPOINT) || '').trim(),
      token:      (localStorage.getItem('db_token') || '').trim(),
    };
  }

  function saveEndpoint(name) {
    localStorage.setItem(STORAGE_KEY_ENDPOINT, name.trim());
  }

  function restoreInput() {
    const el = document.getElementById('db-boise-endpoint-input');
    if (el) el.value = localStorage.getItem(STORAGE_KEY_ENDPOINT) || '';
  }

  function isConfigured() {
    const c = getConfig();
    return !!(c.workspace && c.endpoint && c.token);
  }

  // ── Fetch ───────────────────────────────────────────────────────────────────

  async function fetchAll() {
    if (!isConfigured()) return null;
    const config = getConfig();

    try {
      const url = `${config.workspace}/serving-endpoints/${config.endpoint}/invocations`;
      const resp = await Promise.race([
        fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: { request: ['all'] } }),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 6000)
        ),
      ]);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(`HTTP ${resp.status}`);
      }

      const json = await resp.json();
      const raw = json.predictions?.[0];
      if (!raw) throw new Error('Empty predictions');

      const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
      cachedData = payload;
      lastFetch = new Date();
      return payload;

    } catch (e) {
      console.warn('[BoiseData] Fetch failed:', e.message);
      return null;
    }
  }

  // ── Zip lookup ──────────────────────────────────────────────────────────────
  // Returns metrics for a single zip, or null if not found

  function getZipMetrics(zipcode) {
    if (!cachedData || !cachedData.by_zip) return null;
    return cachedData.by_zip.find(z => z.zipcode === zipcode) || null;
  }

  // ── Status ──────────────────────────────────────────────────────────────────

  function setStatus(state, detail) {
    const el = document.getElementById('db-boise-status');
    if (!el) return;
    const map = {
      loading: { icon: '⏳', text: 'Fetching Boise data…',        color: 'var(--text-muted)' },
      live:    { icon: '●',  text: `Live Boise data · ${detail}`, color: 'var(--green)'      },
      static:  { icon: '○',  text: 'Static Boise data',           color: 'var(--text-muted)' },
      error:   { icon: '!',  text: `Static data · ${detail}`,     color: 'var(--yellow)'     },
    };
    const s = map[state] || map.static;
    el.innerHTML = `<span style="color:${s.color};font-size:0.68rem;display:flex;align-items:center;gap:5px;margin-top:4px">
      <span>${s.icon}</span><span>${s.text}</span>
    </span>`;
  }

  // ── CSV export ──────────────────────────────────────────────────────────────

  function exportZipTableCsv(headline, byZip) {
    if (!byZip || !byZip.length) {
      console.warn('No Boise zip data to export');
      return;
    }

    const rows = [
      [
        'Boise MLS Market Analysis — Ada + Canyon County, ID',
        `As of ${headline.metric_date}`,
      ],
      [],
      ['COUNTY HEADLINE METRICS'],
      ['County', 'Median List Price', 'Median Close Price', 'Active Listings', 'Pending Listings', 'Closed Sales (30d)', 'Median DOM'],
      ['Ada', headline.ada.median_list_price, headline.ada.median_close_price, headline.ada.active_listings, headline.ada.pending_listings, headline.ada.closed_sales_30d, headline.ada.median_dom],
      ['Canyon', headline.canyon.median_list_price, headline.canyon.median_close_price, headline.canyon.active_listings, headline.canyon.pending_listings, headline.canyon.closed_sales_30d, headline.canyon.median_dom],
      ['Combined', headline.combined.median_list_price, headline.combined.median_close_price, headline.combined.active_listings, headline.combined.pending_listings, headline.combined.closed_sales_30d, headline.combined.median_dom],
      [],
      ['ZIP CODE METRICS'],
      [
        'Zip Code', 'City', 'County',
        'Median List Price', 'Median Close Price', 'Median Current Price', 'Avg Price/SqFt',
        'Active Listings', 'Pending Listings',
        'Closed (30d)', 'Closed (60d)',
        'Median DOM', 'Avg DOM',
        'Sale-to-List %', 'Months of Supply',
      ],
    ];

    for (const z of byZip) {
      rows.push([
        z.zipcode, z.city, z.county,
        z.median_list_price, z.median_close_price, z.median_current_price, z.avg_price_per_sqft,
        z.active_listings, z.pending_listings,
        z.closed_sales_30d, z.closed_sales_60d,
        z.median_dom, z.avg_dom,
        (z.sale_to_list_ratio ? z.sale_to_list_ratio.toFixed(2) : '—'),
        (z.months_supply ? z.months_supply.toFixed(2) : '—'),
      ]);
    }

    const csv = rows.map(r => r.map(v => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'number') return v.toFixed(0);
      return String(v).includes(',') ? `"${v}"` : v;
    }).join(',')).join('\n');

    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `boise-mls-${headline.metric_date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  return {
    fetchAll,
    getZipMetrics,
    isConfigured,
    saveEndpoint,
    restoreInput,
    setStatus,
    exportZipTableCsv,
    getCachedData: () => cachedData,
  };
})();
