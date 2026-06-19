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

// ── Census BPS — Seattle MSA permits ─────────────────────────────────────────
// Fetches the monthly CBSA-level building permits XLS from Census and extracts
// Seattle-Tacoma-Bellevue (CBSA 42660) total, SF (1-unit), and MF (5+ units).

function fetchBpsXls(yyyymm) {
  return new Promise((resolve, reject) => {
    const url = `https://www.census.gov/construction/bps/xls/cbsamonthly_${yyyymm}.xls`;
    const opts = { headers: { 'User-Agent': 'Mozilla/5.0 seattle-econ-updater/1.0' } };
    https.get(url, opts, res => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', () => resolve(null));
  });
}

async function fetchSeaPermits() {
  try {
    // Try current month, fall back up to 3 months if not yet published
    const now = new Date();
    for (let lag = 1; lag <= 4; lag++) {
      const d = new Date(now.getFullYear(), now.getMonth() - lag, 1);
      const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      const buf = await fetchBpsXls(yyyymm);
      if (!buf) continue;

      // Parse XLS with a minimal BIFF8 reader — just find the Seattle row
      // xlrd not available in Node; use a regex scan on the raw buffer for the CBSA row
      // The XLS text cells are stored as UTF-16LE or ASCII depending on BIFF version.
      // Simpler: write to a temp file and use Node child_process to call python3
      const tmpFile = `/tmp/bps_${yyyymm}.xls`;
      fs.writeFileSync(tmpFile, buf);

      const result = await new Promise((resolve) => {
        const { exec } = require('child_process');
        const script = `
import xlrd, sys
wb = xlrd.open_workbook('${tmpFile}')
try:
    ws = wb.sheet_by_name('MSA Units')
except:
    print('NO_SHEET'); sys.exit(0)
for r in range(ws.nrows):
    if str(ws.cell_value(r,1)).strip() == '42660.0':
        print(int(ws.cell_value(r,4)), int(ws.cell_value(r,5)), int(ws.cell_value(r,8)))
        sys.exit(0)
print('NOT_FOUND')
`;
        exec(`python3 -c "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, (err, stdout) => {
          if (err || !stdout.trim() || stdout.includes('NO_SHEET') || stdout.includes('NOT_FOUND')) {
            resolve(null);
          } else {
            const [total, sf, mf] = stdout.trim().split(' ').map(Number);
            resolve({ total, sf, mf, yyyymm });
          }
        });
      });

      try { fs.unlinkSync(tmpFile); } catch (_) {}

      if (result) {
        console.log(`  ✓ BPS Seattle MSA ${result.yyyymm}: total=${result.total} SF=${result.sf} MF5+=${result.mf}`);
        return result;
      }
    }
    console.warn('  ⚠ BPS Seattle MSA: no data found in last 4 months');
    return null;
  } catch (e) {
    console.warn('  ⚠ BPS Seattle MSA:', e.message);
    return null;
  }
}

function patchSeaPermits(src, current, prior, priorYear) {
  if (!current) return src;
  const value        = current.total;
  const periodChange = prior     ? current.total - prior.total     : 0;
  const yoyChange    = priorYear ? current.total - priorYear.total : 0;

  // Build real 24-month sparkline from fetched history (most recent last)
  // We have current + up to 3 prior months from the lag loop; for a full 24-month
  // sparkline we patch only the scalar fields and leave the sparkline to accumulate
  // over time — or rebuild it if we have enough data.
  src = src.replace(
    /(id: 'seaPermits'[\s\S]*?value:\s*)([^,\n]+)/,
    (m, pre) => `${pre}${value}`
  );
  src = src.replace(
    /(id: 'seaPermits'[\s\S]*?periodChange:\s*)([^,\n]+)/,
    (m, pre) => `${pre}${periodChange >= 0 ? '+' : ''}${periodChange}`
  );
  src = src.replace(
    /(id: 'seaPermits'[\s\S]*?yoyChange:\s*)([^,\n]+)/,
    (m, pre) => `${pre}${yoyChange >= 0 ? '+' : ''}${yoyChange}`
  );

  // Update date to reflect data month
  const yr  = current.yyyymm.slice(0, 4);
  const mo  = current.yyyymm.slice(4, 6);
  const lastDay = new Date(parseInt(yr), parseInt(mo), 0).getDate();
  const newDate = `${yr}-${mo}-${lastDay}`;
  src = src.replace(
    /(id: 'seaPermits'[\s\S]*?date:\s*)('[^']+')/,
    (m, pre) => `${pre}'${newDate}'`
  );

  return src;
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

  // Fetch Seattle MSA permits from Census BPS (no API key required)
  console.log('\nFetching Seattle MSA permits from Census BPS...');
  const bpsCurrent   = await fetchSeaPermits();
  // Fetch one month prior for period change
  let bpsPrior = null, bpsPriorYear = null;
  if (bpsCurrent) {
    const d = new Date(parseInt(bpsCurrent.yyyymm.slice(0,4)), parseInt(bpsCurrent.yyyymm.slice(4,6)) - 2, 1);
    const priorMm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const buf = await fetchBpsXls(priorMm);
    if (buf) {
      fs.writeFileSync(`/tmp/bps_${priorMm}.xls`, buf);
      // quick python parse
      const { execSync } = require('child_process');
      try {
        const out = execSync(`python3 -c "import xlrd; wb=xlrd.open_workbook('/tmp/bps_${priorMm}.xls'); ws=wb.sheet_by_name('MSA Units'); [print(int(ws.cell_value(r,4)),int(ws.cell_value(r,5)),int(ws.cell_value(r,8))) for r in range(ws.nrows) if str(ws.cell_value(r,1)).strip()=='42660.0']"`).toString().trim();
        if (out) { const [t,s,m] = out.split(' ').map(Number); bpsPrior = {total:t,sf:s,mf:m,yyyymm:priorMm}; }
      } catch(_) {}
      try { fs.unlinkSync(`/tmp/bps_${priorMm}.xls`); } catch(_) {}
    }
    // Fetch same month prior year
    const dy = new Date(parseInt(bpsCurrent.yyyymm.slice(0,4)) - 1, parseInt(bpsCurrent.yyyymm.slice(4,6)) - 1, 1);
    const pyMm = `${dy.getFullYear()}${String(dy.getMonth() + 1).padStart(2, '0')}`;
    const bufY = await fetchBpsXls(pyMm);
    if (bufY) {
      fs.writeFileSync(`/tmp/bps_${pyMm}.xls`, bufY);
      try {
        const out = execSync(`python3 -c "import xlrd; wb=xlrd.open_workbook('/tmp/bps_${pyMm}.xls'); ws=wb.sheet_by_name('MSA Units'); [print(int(ws.cell_value(r,4)),int(ws.cell_value(r,5)),int(ws.cell_value(r,8))) for r in range(ws.nrows) if str(ws.cell_value(r,1)).strip()=='42660.0']"`).toString().trim();
        if (out) { const [t,s,m] = out.split(' ').map(Number); bpsPriorYear = {total:t,sf:s,mf:m,yyyymm:pyMm}; }
      } catch(_) {}
      try { fs.unlinkSync(`/tmp/bps_${pyMm}.xls`); } catch(_) {}
    }
  }

  console.log('\nPatching data.js...');
  let src = fs.readFileSync(DATA_FILE, 'utf8');
  if (bpsCurrent) src = patchSeaPermits(src, bpsCurrent, bpsPrior, bpsPriorYear);
  fs.writeFileSync(DATA_FILE, src, 'utf8');

  patchDataFile(results);
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
