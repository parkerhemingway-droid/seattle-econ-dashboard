// GitHub Action data updater — runs on a schedule, fetches live data from FRED,
// then rewrites the live values in js/data.js without touching mock sparklines
// or the pipeline forecast model.
//
// Run: node scripts/update-data.js
// Requires: FRED_API_KEY environment variable

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const API_KEY = process.env.FRED_API_KEY;
if (!API_KEY) { console.error('FRED_API_KEY not set'); process.exit(1); }

const DATA_FILE = path.join(__dirname, '../js/data.js');

// ── FRED series to fetch ──────────────────────────────────────────────────────
// Each entry: { metricId, seriesId, transform }
// transform: 'latest' = last observation value
//            'yoy'    = (latest - year_ago) / year_ago * 100
//            'mom'    = latest - prev_month value
//            'diff'   = latest - prev observation
const SERIES = [
  // Financial Markets
  { metricId: 'treasury10y',   seriesId: 'DGS10',         transform: 'latest' },
  { metricId: 'treasury2y',    seriesId: 'DGS2',          transform: 'latest' },
  { metricId: 'sp500',         seriesId: 'SP500',         transform: 'latest' },
  { metricId: 'oil',           seriesId: 'DCOILWTICO',    transform: 'latest' },
  { metricId: 'mortgageRate',  seriesId: 'MORTGAGE30US',  transform: 'latest' },

  // Inflation
  { metricId: 'cpiHeadline',   seriesId: 'CPIAUCSL',      transform: 'yoy' },
  { metricId: 'cpiCore',       seriesId: 'CPILFESL',      transform: 'yoy' },
  { metricId: 'pce',           seriesId: 'PCEPI',         transform: 'yoy' },
  { metricId: 'pceCore',       seriesId: 'PCEPILFE',      transform: 'yoy' },
  { metricId: 'breakeven5y',   seriesId: 'T5YIE',         transform: 'latest' },
  { metricId: 'breakeven10y',  seriesId: 'T10YIE',        transform: 'latest' },
  { metricId: 'cpiShelter',    seriesId: 'CUSR0000SAH1',  transform: 'yoy' },
  { metricId: 'cpiEnergy',     seriesId: 'CUSR0000SACE',  transform: 'yoy' },
  { metricId: 'cpiFood',       seriesId: 'CUSR0000SAF1',  transform: 'yoy' },
  { metricId: 'cpiMedical',    seriesId: 'CUUR0000SAM',   transform: 'yoy' },
  { metricId: 'cpiTransport',  seriesId: 'CUSR0000SAT1',  transform: 'yoy' },
  { metricId: 'ppi',           seriesId: 'PPIACO',        transform: 'yoy' },
  { metricId: 'ppiCore',       seriesId: 'PPIFID',        transform: 'yoy' },

  // Employment
  { metricId: 'initialClaims',     seriesId: 'ICSA',          transform: 'latest' },
  { metricId: 'continuingClaims',  seriesId: 'CCSA',          transform: 'latest' },
  { metricId: 'u3',                seriesId: 'UNRATE',        transform: 'latest' },
  { metricId: 'u6',                seriesId: 'U6RATE',        transform: 'latest' },
  { metricId: 'nfp',               seriesId: 'PAYEMS',        transform: 'mom' },
  { metricId: 'lfpr',              seriesId: 'CIVPART',       transform: 'latest' },
  { metricId: 'avgHourlyEarnings', seriesId: 'CES0500000003', transform: 'yoy' },
  { metricId: 'joltsOpenings',     seriesId: 'JTSJOL',        transform: 'latest' },
  { metricId: 'joltsQuits',        seriesId: 'JTSQUL',        transform: 'latest' },
  { metricId: 'joltsLayoffs',      seriesId: 'JTSLDL',        transform: 'latest' },

  // Housing — national
  { metricId: 'existingHomeSales',      seriesId: 'EXHOSLUSM495S', transform: 'latest' },
  { metricId: 'newHomeSales',           seriesId: 'HSN1F',         transform: 'latest' },
  { metricId: 'housingStarts',          seriesId: 'HOUST',         transform: 'latest' },
  { metricId: 'buildingPermits',        seriesId: 'PERMIT',        transform: 'latest' },
  { metricId: 'housingCompletions',     seriesId: 'COMPUTSA',      transform: 'latest' },
  { metricId: 'unitsUnderConstruction', seriesId: 'UNDCONTSA',     transform: 'latest' },

  // Seattle-specific via FRED
  { metricId: 'seaCaseShiller',   seriesId: 'SEXRNSA',      transform: 'latest' },
  { metricId: 'seaUnemployment',  seriesId: 'SEAT453URN',   transform: 'latest' },

  // Fed
  { metricId: 'effFedFunds',  seriesId: 'EFFR',   transform: 'latest' },
  { metricId: 'fedTargetHigh', seriesId: 'DFEDTARU', transform: 'latest' },

  // Breakevens (already listed above, just confirming)
];

// ── FRED fetch helper ─────────────────────────────────────────────────────────

function fredFetch(seriesId, limit = 13) {
  return new Promise((resolve, reject) => {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error_message) { reject(new Error(`FRED ${seriesId}: ${json.error_message}`)); return; }
          // Filter out missing values (.)
          const obs = (json.observations || []).filter(o => o.value !== '.');
          resolve(obs);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function toNum(v) { return parseFloat(parseFloat(v).toFixed(4)); }

async function fetchMetric(cfg) {
  try {
    const obs = await fredFetch(cfg.seriesId, 14);
    if (!obs.length) return null;

    const latest = obs[0];
    const latestVal = toNum(latest.value);
    const latestDate = latest.date;

    let value, periodChange, yoyChange;

    if (cfg.transform === 'latest') {
      value = latestVal;
      periodChange = obs[1] ? toNum(latestVal - toNum(obs[1].value)) : 0;
      // yoy: find obs ~12 months ago
      const yoyObs = obs.find(o => {
        const d = new Date(o.date);
        const ref = new Date(latest.date);
        ref.setFullYear(ref.getFullYear() - 1);
        return Math.abs(d - ref) < 45 * 86400000; // within 45 days
      });
      yoyChange = yoyObs ? toNum(latestVal - toNum(yoyObs.value)) : null;

    } else if (cfg.transform === 'yoy') {
      // Return YoY % change as the primary value
      const need = await fredFetch(cfg.seriesId, 14);
      const cur  = toNum(need[0].value);
      const prev = need[1] ? toNum(need[1].value) : cur;
      const yoyObs = need.find(o => {
        const d = new Date(o.date);
        const ref = new Date(need[0].date);
        ref.setFullYear(ref.getFullYear() - 1);
        return Math.abs(d - ref) < 45 * 86400000;
      });
      const yoyBase = yoyObs ? toNum(yoyObs.value) : cur;
      value = toNum(((cur - yoyBase) / yoyBase) * 100);
      periodChange = toNum(value - ((prev - yoyBase) / yoyBase) * 100);
      yoyChange = value; // for YoY metrics the value IS the YoY change

    } else if (cfg.transform === 'mom') {
      // MoM difference in level (e.g. payrolls)
      value = obs[1] ? toNum(toNum(latest.value) - toNum(obs[1].value)) : 0;
      periodChange = obs[1] && obs[2] ? toNum(value - (toNum(obs[1].value) - toNum(obs[2].value))) : 0;
      yoyChange = null;
    }

    return { metricId: cfg.metricId, value, periodChange, yoyChange, date: latestDate };
  } catch (e) {
    console.warn(`  ⚠ ${cfg.metricId} (${cfg.seriesId}): ${e.message}`);
    return null;
  }
}

// ── Patch data.js in-place ────────────────────────────────────────────────────
// We do surgical string replacements rather than regenerating the whole file,
// so sparklines, the pipeline forecast model, and all other structure are preserved.

function patchDataFile(updates) {
  let src = fs.readFileSync(DATA_FILE, 'utf8');
  let patched = 0;

  for (const u of updates) {
    if (!u) continue;
    const { metricId, value, periodChange, yoyChange, date } = u;

    // Match the metric block by id and replace value, periodChange, yoyChange, date
    const patterns = [
      // value: 1234.5,
      { key: 'value',        val: value,        regex: new RegExp(`(id: '${metricId}'[\\s\\S]*?value:\\s*)([^,\\n]+)`) },
      // periodChange: +1.2,
      { key: 'periodChange', val: periodChange, regex: new RegExp(`(id: '${metricId}'[\\s\\S]*?periodChange:\\s*)([^,\\n]+)`) },
      // date: '2026-06-01',
      { key: 'date',         val: `'${date}'`,  regex: new RegExp(`(id: '${metricId}'[\\s\\S]*?date:\\s*)('[^']+')`), raw: true },
    ];

    if (yoyChange !== null && yoyChange !== undefined) {
      patterns.push({ key: 'yoyChange', val: yoyChange, regex: new RegExp(`(id: '${metricId}'[\\s\\S]*?yoyChange:\\s*)([^,\\n]+)`) });
    }

    for (const p of patterns) {
      const newVal = p.raw ? p.val : (typeof p.val === 'number' ? (p.val >= 0 ? `+${p.val}` : `${p.val}`) : p.val);
      if (p.key === 'value') {
        // value field uses plain number, not signed
        src = src.replace(p.regex, (m, prefix) => `${prefix}${typeof value === 'number' ? value : value}`);
      } else {
        src = src.replace(p.regex, (m, prefix) => `${prefix}${newVal}`);
      }
      patched++;
    }

    console.log(`  ✓ ${metricId}: ${value} (${date})`);
  }

  // Update the TODAY constant at top of file
  const today = new Date().toISOString().slice(0, 10);
  src = src.replace(/const TODAY = '[^']+';/, `const TODAY = '${today}';`);

  fs.writeFileSync(DATA_FILE, src, 'utf8');
  console.log(`\nPatched ${patched} fields across ${updates.filter(Boolean).length} metrics.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching ${SERIES.length} FRED series...`);
  const results = [];
  for (const cfg of SERIES) {
    process.stdout.write(`  Fetching ${cfg.seriesId}...`);
    const result = await fetchMetric(cfg);
    if (result) process.stdout.write(` ${result.value}\n`);
    else process.stdout.write(' skipped\n');
    results.push(result);
    // Be polite to FRED API — 120 req/min limit
    await new Promise(r => setTimeout(r, 550));
  }

  console.log('\nPatching data.js...');
  patchDataFile(results);
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
