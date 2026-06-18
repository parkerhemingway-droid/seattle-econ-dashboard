// Mock data — Seattle-localized where applicable, national where metro data unavailable.
// Replace sparkline arrays with real API calls to wire up live data.

const TODAY = '2026-06-18';

function sparkline(base, count = 24, volatility = 0.02, trend = 0) {
  const arr = [];
  let val = base;
  for (let i = 0; i < count; i++) {
    val = val * (1 + (Math.random() - 0.5) * volatility + trend / count);
    arr.push(+val.toFixed(4));
  }
  return arr;
}

// ── Financial Markets ───────────────────────────────────────────────────────
const MARKETS = {
  treasury10y: {
    id: 'treasury10y', name: '10-Year Treasury Yield', section: 'today',
    value: 4.38, unit: '%', date: '2026-06-18',
    periodChange: +0.04, yoyChange: -0.41,
    release: 'Daily — Treasury Dept.',
    sparkline: sparkline(4.38, 24, 0.02),
    category: 'Financial Markets',
  },
  treasury2y: {
    id: 'treasury2y', name: '2-Year Treasury Yield', section: 'today',
    value: 4.12, unit: '%', date: '2026-06-18',
    periodChange: +0.02, yoyChange: -0.58,
    release: 'Daily — Treasury Dept.',
    sparkline: sparkline(4.12, 24, 0.02),
    category: 'Financial Markets',
  },
  sp500: {
    id: 'sp500', name: 'S&P 500', section: 'today',
    value: 5482, unit: '', date: '2026-06-18',
    periodChange: +23, yoyChange: +312,
    release: 'Daily — NYSE',
    sparkline: sparkline(5482, 24, 0.012),
    category: 'Financial Markets',
  },
  oil: {
    id: 'oil', name: 'WTI Crude Oil', section: 'today',
    value: 72.40, unit: '$/bbl', date: '2026-06-18',
    periodChange: -1.20, yoyChange: -8.30,
    release: 'Daily — EIA',
    sparkline: sparkline(72.40, 24, 0.025),
    category: 'Financial Markets',
  },
  mortgageRate: {
    id: 'mortgageRate', name: 'Mortgage Rate (30-yr)', section: 'today',
    value: 6.82, unit: '%', date: '2026-06-13',
    periodChange: -0.05, yoyChange: -0.22,
    release: 'Weekly — Freddie Mac',
    sparkline: sparkline(6.82, 24, 0.01),
    category: 'Financial Markets',
  },
  mortgageSpread: {
    id: 'mortgageSpread', name: 'Mortgage Spread (vs 10yr)', section: 'today',
    value: 2.44, unit: '%', date: '2026-06-13',
    periodChange: -0.09, yoyChange: +0.19,
    release: 'Weekly — Freddie Mac',
    sparkline: sparkline(2.44, 24, 0.015),
    category: 'Financial Markets',
  },
};

// ── Seattle Housing ─────────────────────────────────────────────────────────
const HOUSING = {
  seaMedianPrice: {
    id: 'seaMedianPrice', name: 'Seattle Median Sale Price', section: 'housing',
    value: 875000, unit: '$', date: '2026-06-01',
    periodChange: +12000, yoyChange: +38000,
    release: 'Monthly — Redfin/NWMLS',
    sparkline: sparkline(875000, 24, 0.015, 0.003),
    category: 'Housing',
    local: true,
  },
  seaMedianListPrice: {
    id: 'seaMedianListPrice', name: 'Seattle Median List Price', section: 'housing',
    value: 899000, unit: '$', date: '2026-06-13',
    periodChange: +5000, yoyChange: +42000,
    release: 'Weekly — Altos/Redfin',
    sparkline: sparkline(899000, 24, 0.012, 0.002),
    category: 'Housing',
    local: true,
  },
  seaActiveInventory: {
    id: 'seaActiveInventory', name: 'Seattle Active Inventory', section: 'housing',
    value: 3241, unit: ' homes', date: '2026-06-13',
    periodChange: +187, yoyChange: +621,
    release: 'Weekly — Altos Research',
    sparkline: sparkline(3241, 24, 0.03, 0.005),
    category: 'Housing',
    local: true,
  },
  seaWeeksSupply: {
    id: 'seaWeeksSupply', name: 'Seattle Weeks of Supply', section: 'housing',
    value: 5.2, unit: ' wks', date: '2026-06-13',
    periodChange: +0.3, yoyChange: +1.1,
    release: 'Weekly — Altos Research',
    sparkline: sparkline(5.2, 24, 0.04),
    category: 'Housing',
    local: true,
  },
  seaNewListings: {
    id: 'seaNewListings', name: 'Seattle New Listings', section: 'housing',
    value: 892, unit: '/wk', date: '2026-06-13',
    periodChange: +42, yoyChange: +118,
    release: 'Weekly — Altos Research',
    sparkline: sparkline(892, 24, 0.05),
    category: 'Housing',
    local: true,
  },
  seaPendingSales: {
    id: 'seaPendingSales', name: 'Seattle Pending Sales', section: 'housing',
    value: 1104, unit: '/wk', date: '2026-06-13',
    periodChange: -28, yoyChange: +94,
    release: 'Weekly — Altos/Redfin',
    sparkline: sparkline(1104, 24, 0.04),
    category: 'Housing',
    local: true,
  },
  seaDaysOnMarket: {
    id: 'seaDaysOnMarket', name: 'Seattle Days on Market', section: 'housing',
    value: 18, unit: ' days', date: '2026-06-13',
    periodChange: +2, yoyChange: +5,
    release: 'Weekly — Altos/Redfin',
    sparkline: sparkline(18, 24, 0.08),
    category: 'Housing',
    local: true,
  },
  seaPriceReductions: {
    id: 'seaPriceReductions', name: 'Seattle Price Reductions', section: 'housing',
    value: 18.4, unit: '%', date: '2026-06-13',
    periodChange: +0.8, yoyChange: +3.2,
    release: 'Weekly — Altos Research',
    sparkline: sparkline(18.4, 24, 0.03),
    category: 'Housing',
    local: true,
  },
  seaSaleTListRatio: {
    id: 'seaSaleTListRatio', name: 'Sale-to-List Ratio', section: 'housing',
    value: 101.2, unit: '%', date: '2026-05-31',
    periodChange: -0.4, yoyChange: -1.8,
    release: 'Monthly — Redfin',
    sparkline: sparkline(101.2, 24, 0.005),
    category: 'Housing',
    local: true,
  },
  seaCaseShiller: {
    id: 'seaCaseShiller', name: 'Case-Shiller Seattle HPI', section: 'housing',
    value: 402.1, unit: '', date: '2026-04-30',
    periodChange: +3.2, yoyChange: +18.4,
    release: 'Monthly (2mo lag) — S&P/CS',
    sparkline: sparkline(402.1, 24, 0.008, 0.002),
    category: 'Housing',
    local: true,
  },
  kingCountyHomeowners: {
    id: 'kingCountyHomeowners', name: 'King Co. Homeownership Rate', section: 'housing',
    value: 51.2, unit: '%', date: '2026-01-01',
    periodChange: +0.3, yoyChange: -0.8,
    release: 'Annual — Census ACS',
    sparkline: sparkline(51.2, 10, 0.01),
    category: 'Housing',
    local: true,
  },
  seaAffordabilityRatio: {
    id: 'seaAffordabilityRatio', name: 'Price-to-Income Ratio (Seattle)', section: 'housing',
    value: 10.4, unit: 'x', date: '2026-01-01',
    periodChange: +0.2, yoyChange: +0.4,
    release: 'Annual — Census/Redfin',
    sparkline: sparkline(10.4, 10, 0.02),
    category: 'Housing',
    local: true,
  },
  // National housing data
  existingHomeSales: {
    id: 'existingHomeSales', name: 'Existing Home Sales (Natl)', section: 'housing',
    value: 4.03, unit: 'M SAAR', date: '2026-05-22',
    periodChange: -0.08, yoyChange: +0.24,
    release: 'Monthly — NAR',
    sparkline: sparkline(4.03, 24, 0.03),
    category: 'Housing',
  },
  newHomeSales: {
    id: 'newHomeSales', name: 'New Home Sales (Natl)', section: 'housing',
    value: 683, unit: 'K SAAR', date: '2026-05-23',
    periodChange: +12, yoyChange: +54,
    release: 'Monthly — Census/HUD',
    sparkline: sparkline(683, 24, 0.04),
    category: 'Housing',
  },
  housingStarts: {
    id: 'housingStarts', name: 'Housing Starts (Natl)', section: 'housing',
    value: 1.361, unit: 'M SAAR', date: '2026-05-20',
    periodChange: +0.043, yoyChange: -0.082,
    release: 'Monthly — Census/HUD',
    sparkline: sparkline(1.361, 24, 0.04),
    category: 'Construction',
  },
  buildingPermits: {
    id: 'buildingPermits', name: 'Building Permits (Natl)', section: 'housing',
    value: 1.412, unit: 'M SAAR', date: '2026-05-20',
    periodChange: +0.018, yoyChange: -0.061,
    release: 'Monthly — Census/HUD',
    sparkline: sparkline(1.412, 24, 0.035),
    category: 'Construction',
  },
  seaPermits: {
    id: 'seaPermits', name: 'Seattle MSA Permits', section: 'housing',
    value: 3842, unit: '/mo', date: '2026-04-30',
    periodChange: +204, yoyChange: -318,
    release: 'Monthly — Census',
    sparkline: sparkline(3842, 24, 0.06),
    category: 'Construction',
    local: true,
  },
  housingCompletions: {
    id: 'housingCompletions', name: 'Housing Completions (Natl)', section: 'housing',
    value: 1.621, unit: 'M SAAR', date: '2026-05-20',
    periodChange: +0.091, yoyChange: +0.104,
    release: 'Monthly — Census/HUD',
    sparkline: sparkline(1.621, 24, 0.04),
    category: 'Construction',
  },
  unitsUnderConstruction: {
    id: 'unitsUnderConstruction', name: 'Units Under Construction (Natl)', section: 'housing',
    value: 1.432, unit: 'M', date: '2026-05-20',
    periodChange: -0.021, yoyChange: -0.241,
    release: 'Monthly — Census/HUD',
    sparkline: sparkline(1.432, 24, 0.02),
    category: 'Construction',
  },
  // Seattle MSA construction pipeline
  seaCompletions: {
    id: 'seaCompletions', name: 'Seattle MSA Completions', section: 'housing',
    value: 1284, unit: ' units/mo', date: '2026-04-30',
    periodChange: +112, yoyChange: +198,
    release: 'Monthly — Census (Seattle-Tacoma-Bellevue MSA)',
    sparkline: sparkline(1284, 24, 0.06, 0.004),
    category: 'Construction',
    local: true,
  },
  seaUnderConstruction: {
    id: 'seaUnderConstruction', name: 'Seattle MSA Units Under Construction', section: 'housing',
    value: 28420, unit: ' units', date: '2026-04-30',
    periodChange: -640, yoyChange: -3180,
    release: 'Monthly — Census (Seattle-Tacoma-Bellevue MSA)',
    sparkline: sparkline(28420, 24, 0.025, -0.003),
    category: 'Construction',
    local: true,
  },
  seaMultifamilyUnder: {
    id: 'seaMultifamilyUnder', name: 'Seattle Multifamily Under Construction', section: 'housing',
    value: 19840, unit: ' units', date: '2026-04-30',
    periodChange: -410, yoyChange: -2940,
    release: 'Monthly — Census (5+ unit buildings)',
    sparkline: sparkline(19840, 24, 0.03, -0.004),
    category: 'Construction',
    local: true,
  },
  seaSingleFamilyUnder: {
    id: 'seaSingleFamilyUnder', name: 'Seattle Single-Family Under Construction', section: 'housing',
    value: 8580, unit: ' units', date: '2026-04-30',
    periodChange: -230, yoyChange: -240,
    release: 'Monthly — Census (1-unit buildings)',
    sparkline: sparkline(8580, 24, 0.035, -0.001),
    category: 'Construction',
    local: true,
  },
};

// ── Seattle Construction Pipeline Forecast ──────────────────────────────────
// Modeled from permits → starts → under construction → completions pipeline.
// Typical Seattle construction timeline: permits ~3mo lead on starts,
// multifamily avg 18–22mo build time, single-family avg 8–12mo.
// Forecast derived from current under-construction stock and historical
// completion rates by building type.

const PIPELINE_FORECAST = {
  // 5 years of historical monthly completions (Jan 2021 – May 2026)
  // Seattle-Tacoma-Bellevue MSA — mock data modeled on Census CBSA 42660 patterns
  historical: [
    // 2021 — post-COVID construction ramp, MF surge beginning
    { month: 'Jan 21', sf: 310, mf: 520 }, { month: 'Feb 21', sf: 285, mf: 490 },
    { month: 'Mar 21', sf: 340, mf: 610 }, { month: 'Apr 21', sf: 380, mf: 680 },
    { month: 'May 21', sf: 420, mf: 740 }, { month: 'Jun 21', sf: 460, mf: 810 },
    { month: 'Jul 21', sf: 490, mf: 870 }, { month: 'Aug 21', sf: 510, mf: 920 },
    { month: 'Sep 21', sf: 480, mf: 890 }, { month: 'Oct 21', sf: 440, mf: 850 },
    { month: 'Nov 21', sf: 390, mf: 780 }, { month: 'Dec 21', sf: 360, mf: 720 },
    // 2022 — peak construction boom, supply chain delays easing
    { month: 'Jan 22', sf: 370, mf: 780 }, { month: 'Feb 22', sf: 350, mf: 820 },
    { month: 'Mar 22', sf: 410, mf: 910 }, { month: 'Apr 22', sf: 460, mf: 980 },
    { month: 'May 22', sf: 510, mf: 1060 }, { month: 'Jun 22', sf: 560, mf: 1140 },
    { month: 'Jul 22', sf: 590, mf: 1220 }, { month: 'Aug 22', sf: 620, mf: 1310 },
    { month: 'Sep 22', sf: 580, mf: 1270 }, { month: 'Oct 22', sf: 540, mf: 1190 },
    { month: 'Nov 22', sf: 490, mf: 1080 }, { month: 'Dec 22', sf: 450, mf: 1020 },
    // 2023 — rate shock slows SF starts; MF pipeline still delivering
    { month: 'Jan 23', sf: 420, mf: 1050 }, { month: 'Feb 23', sf: 390, mf: 1090 },
    { month: 'Mar 23', sf: 430, mf: 1180 }, { month: 'Apr 23', sf: 410, mf: 1240 },
    { month: 'May 23', sf: 440, mf: 1320 }, { month: 'Jun 23', sf: 470, mf: 1410 },
    { month: 'Jul 23', sf: 500, mf: 1490 }, { month: 'Aug 23', sf: 520, mf: 1560 },
    { month: 'Sep 23', sf: 490, mf: 1510 }, { month: 'Oct 23', sf: 460, mf: 1440 },
    { month: 'Nov 23', sf: 420, mf: 1360 }, { month: 'Dec 23', sf: 390, mf: 1290 },
    // 2024 — MF completions peak as 2022 starts deliver, SF recovering
    { month: 'Jan 24', sf: 380, mf: 1340 }, { month: 'Feb 24', sf: 360, mf: 1380 },
    { month: 'Mar 24', sf: 400, mf: 1460 }, { month: 'Apr 24', sf: 440, mf: 1540 },
    { month: 'May 24', sf: 490, mf: 1620 }, { month: 'Jun 24', sf: 530, mf: 1680 },
    { month: 'Jul 24', sf: 560, mf: 1720 }, { month: 'Aug 24', sf: 580, mf: 1750 },
    { month: 'Sep 24', sf: 550, mf: 1700 }, { month: 'Oct 24', sf: 510, mf: 1630 },
    { month: 'Nov 24', sf: 470, mf: 1550 }, { month: 'Dec 24', sf: 430, mf: 1470 },
    // 2025 — MF wave cresting, pipeline thinning
    { month: 'Jan 25', sf: 410, mf: 1490 }, { month: 'Feb 25', sf: 390, mf: 1510 },
    { month: 'Mar 25', sf: 430, mf: 1560 }, { month: 'Apr 25', sf: 460, mf: 1590 },
    { month: 'May 25', sf: 490, mf: 1610 }, { month: 'Jun 25', sf: 510, mf: 1580 },
    { month: 'Jul 25', sf: 530, mf: 1540 }, { month: 'Aug 25', sf: 520, mf: 1490 },
    { month: 'Sep 25', sf: 500, mf: 1440 }, { month: 'Oct 25', sf: 470, mf: 1390 },
    { month: 'Nov 25', sf: 440, mf: 1340 }, { month: 'Dec 25', sf: 410, mf: 1280 },
    // 2026 Jan–May actual
    { month: 'Jan 26', sf: 390, mf: 1220 }, { month: 'Feb 26', sf: 370, mf: 1190 },
    { month: 'Mar 26', sf: 410, mf: 1210 }, { month: 'Apr 26', sf: 450, mf: 834 },
    { month: 'May 26', sf: 430, mf: 1180 },
  ],

  // Forecast: Jun 2026 – Nov 2027
  monthly: (() => {
    const months = [];
    const sfStock = 8580;
    let cumulative = 0;
    const startDate = new Date(2026, 5, 1);
    for (let i = 0; i < 18; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const sfUnits = Math.round(sfStock * Math.exp(-0.12 * i) * 0.12 + 80);
      const mfPeak = 1400;
      const mfUnits = Math.round(mfPeak * Math.exp(-0.5 * Math.pow((i - 7) / 4, 2)) + 200);
      const totalUnits = sfUnits + mfUnits;
      cumulative += totalUnits;
      months.push({ month: label, sfUnits, mfUnits, totalUnits, cumulativeUnits: cumulative });
    }
    return months;
  })(),

  // Submarket breakdown
  submarkets: [
    { name: 'Seattle Core (Cap Hill, SLU, Downtown)', sfPct: 4,  mfPct: 28, totalUnits: 7940 },
    { name: 'Eastside (Bellevue, Kirkland, Redmond)',  sfPct: 22, mfPct: 31, totalUnits: 8820 },
    { name: 'South King Co. (Renton, Kent, Auburn)',   sfPct: 31, mfPct: 18, totalUnits: 6240 },
    { name: 'North King Co. (Shoreline, Bothell)',     sfPct: 18, mfPct: 12, totalUnits: 4210 },
    { name: 'Snohomish Co. (Everett, Lynnwood)',       sfPct: 18, mfPct: 8,  totalUnits: 3720 },
    { name: 'Pierce Co. (Tacoma, Puyallup)',           sfPct: 7,  mfPct: 3,  totalUnits: 1490 },
  ],

  assumptions: [
    'Single-family avg build time: 9 months from start to completion',
    'Multifamily avg build time: 18 months from start to completion',
    'Current pipeline: 28,420 units under construction as of Apr 2026',
    'Permit pull-through rate: ~78% (permits that result in starts within 6 months)',
    'Absorption rate assumption: ~85% of completions absorbed within 90 days in current market',
    'New permits (3,842/mo) add to pipeline with ~3mo lag to start',
    'Forecast horizon: 18 months (Jun 2026 – Nov 2027)',
    'Data source: Census Building Permits Survey, Seattle MSA (CBSA 42660)',
  ],
};

// ── Inflation ────────────────────────────────────────────────────────────────
const INFLATION = {
  cpiHeadline: {
    id: 'cpiHeadline', name: 'CPI (Headline, YoY)', section: 'inflation',
    value: 2.9, unit: '%', date: '2026-06-11',
    periodChange: -0.1, yoyChange: -0.7,
    release: 'Monthly — BLS',
    sparkline: sparkline(2.9, 24, 0.04),
    category: 'Inflation',
  },
  cpiCore: {
    id: 'cpiCore', name: 'Core CPI (YoY)', section: 'inflation',
    value: 3.2, unit: '%', date: '2026-06-11',
    periodChange: -0.1, yoyChange: -0.8,
    release: 'Monthly — BLS',
    sparkline: sparkline(3.2, 24, 0.03),
    category: 'Inflation',
  },
  pce: {
    id: 'pce', name: 'PCE (YoY)', section: 'inflation',
    value: 2.6, unit: '%', date: '2026-05-30',
    periodChange: -0.1, yoyChange: -0.6,
    release: 'Monthly — BEA',
    sparkline: sparkline(2.6, 24, 0.03),
    category: 'Inflation',
  },
  pceCore: {
    id: 'pceCore', name: 'Core PCE (YoY)', section: 'inflation',
    value: 2.8, unit: '%', date: '2026-05-30',
    periodChange: -0.1, yoyChange: -0.4,
    release: 'Monthly — BEA',
    sparkline: sparkline(2.8, 24, 0.025),
    category: 'Inflation',
  },
  trimmedMeanPce: {
    id: 'trimmedMeanPce', name: 'Trimmed Mean PCE', section: 'inflation',
    value: 2.9, unit: '%', date: '2026-05-30',
    periodChange: -0.05, yoyChange: -0.5,
    release: 'Monthly — Dallas Fed',
    sparkline: sparkline(2.9, 24, 0.025),
    category: 'Inflation',
  },
  breakeven5y: {
    id: 'breakeven5y', name: '5-Year Breakeven', section: 'inflation',
    value: 2.44, unit: '%', date: '2026-06-18',
    periodChange: -0.02, yoyChange: -0.08,
    release: 'Daily — Treasury',
    sparkline: sparkline(2.44, 24, 0.015),
    category: 'Inflation',
  },
  breakeven10y: {
    id: 'breakeven10y', name: '10-Year Breakeven', section: 'inflation',
    value: 2.38, unit: '%', date: '2026-06-18',
    periodChange: -0.01, yoyChange: -0.06,
    release: 'Daily — Treasury',
    sparkline: sparkline(2.38, 24, 0.015),
    category: 'Inflation',
  },
  clevelandFedInfExp: {
    id: 'clevelandFedInfExp', name: 'Cleveland Fed Inf. Exp. (1yr)', section: 'inflation',
    value: 3.1, unit: '%', date: '2026-06-01',
    periodChange: -0.2, yoyChange: -0.4,
    release: 'Monthly — Cleveland Fed',
    sparkline: sparkline(3.1, 24, 0.02),
    category: 'Inflation',
  },
  cpiShelter: {
    id: 'cpiShelter', name: 'CPI Shelter (YoY)', section: 'inflation',
    value: 4.8, unit: '%', date: '2026-06-11',
    periodChange: -0.2, yoyChange: -1.4,
    release: 'Monthly — BLS',
    sparkline: sparkline(4.8, 24, 0.025),
    category: 'Inflation',
  },
  cpiEnergy: {
    id: 'cpiEnergy', name: 'CPI Energy (YoY)', section: 'inflation',
    value: -4.2, unit: '%', date: '2026-06-11',
    periodChange: -0.8, yoyChange: -2.1,
    release: 'Monthly — BLS',
    sparkline: sparkline(-4.2, 24, 0.05),
    category: 'Inflation',
  },
  cpiFood: {
    id: 'cpiFood', name: 'CPI Food & Beverage (YoY)', section: 'inflation',
    value: 2.3, unit: '%', date: '2026-06-11',
    periodChange: +0.1, yoyChange: -0.9,
    release: 'Monthly — BLS',
    sparkline: sparkline(2.3, 24, 0.03),
    category: 'Inflation',
  },
  cpiMedical: {
    id: 'cpiMedical', name: 'CPI Medical (YoY)', section: 'inflation',
    value: 2.8, unit: '%', date: '2026-06-11',
    periodChange: +0.2, yoyChange: +0.6,
    release: 'Monthly — BLS',
    sparkline: sparkline(2.8, 24, 0.025),
    category: 'Inflation',
  },
  cpiTransport: {
    id: 'cpiTransport', name: 'CPI Transportation (YoY)', section: 'inflation',
    value: 3.8, unit: '%', date: '2026-06-11',
    periodChange: +0.3, yoyChange: +0.4,
    release: 'Monthly — BLS',
    sparkline: sparkline(3.8, 24, 0.04),
    category: 'Inflation',
  },
  seaMetroCpi: {
    id: 'seaMetroCpi', name: 'Seattle Metro CPI (YoY)', section: 'inflation',
    value: 3.1, unit: '%', date: '2026-04-30',
    periodChange: -0.2, yoyChange: -0.9,
    release: 'Bimonthly — BLS',
    sparkline: sparkline(3.1, 12, 0.035),
    category: 'Inflation',
    local: true,
  },
  ppi: {
    id: 'ppi', name: 'PPI (YoY)', section: 'inflation',
    value: 2.4, unit: '%', date: '2026-06-12',
    periodChange: -0.3, yoyChange: -0.8,
    release: 'Monthly — BLS',
    sparkline: sparkline(2.4, 24, 0.04),
    category: 'Inflation',
  },
  ppiCore: {
    id: 'ppiCore', name: 'Core PPI (YoY)', section: 'inflation',
    value: 2.9, unit: '%', date: '2026-06-12',
    periodChange: -0.1, yoyChange: -0.6,
    release: 'Monthly — BLS',
    sparkline: sparkline(2.9, 24, 0.03),
    category: 'Inflation',
  },
};

// ── Employment ───────────────────────────────────────────────────────────────
const EMPLOYMENT = {
  initialClaims: {
    id: 'initialClaims', name: 'Initial Claims', section: 'employment',
    value: 218000, unit: '', date: '2026-06-14',
    periodChange: -4000, yoyChange: +6000,
    release: 'Weekly — DOL',
    sparkline: sparkline(218000, 24, 0.03),
    category: 'Labor',
  },
  continuingClaims: {
    id: 'continuingClaims', name: 'Continuing Claims', section: 'employment',
    value: 1871000, unit: '', date: '2026-06-07',
    periodChange: +14000, yoyChange: +82000,
    release: 'Weekly — DOL',
    sparkline: sparkline(1871000, 24, 0.025),
    category: 'Labor',
  },
  waStateInitialClaims: {
    id: 'waStateInitialClaims', name: 'WA State Initial Claims', section: 'employment',
    value: 9840, unit: '', date: '2026-06-14',
    periodChange: -320, yoyChange: +480,
    release: 'Weekly — WA ESD',
    sparkline: sparkline(9840, 24, 0.04),
    category: 'Labor',
    local: true,
  },
  u3: {
    id: 'u3', name: 'U-3 Unemployment Rate', section: 'employment',
    value: 4.1, unit: '%', date: '2026-06-06',
    periodChange: 0, yoyChange: +0.3,
    release: 'Monthly — BLS',
    sparkline: sparkline(4.1, 24, 0.02),
    category: 'Labor',
  },
  u6: {
    id: 'u6', name: 'U-6 Unemployment Rate', section: 'employment',
    value: 7.8, unit: '%', date: '2026-06-06',
    periodChange: +0.1, yoyChange: +0.5,
    release: 'Monthly — BLS',
    sparkline: sparkline(7.8, 24, 0.02),
    category: 'Labor',
  },
  seaUnemployment: {
    id: 'seaUnemployment', name: 'Seattle Metro Unemployment', section: 'employment',
    value: 3.8, unit: '%', date: '2026-05-31',
    periodChange: -0.1, yoyChange: +0.4,
    release: 'Monthly — BLS/WA ESD',
    sparkline: sparkline(3.8, 24, 0.025),
    category: 'Labor',
    local: true,
  },
  nfp: {
    id: 'nfp', name: 'Nonfarm Payrolls (MoM)', section: 'employment',
    value: 177000, unit: '', date: '2026-06-06',
    periodChange: -12000, yoyChange: -34000,
    release: 'Monthly — BLS',
    sparkline: sparkline(177000, 24, 0.06),
    category: 'Labor',
  },
  seaPayrolls: {
    id: 'seaPayrolls', name: 'Seattle MSA Payrolls (MoM)', section: 'employment',
    value: 8400, unit: '', date: '2026-05-31',
    periodChange: -1200, yoyChange: -2800,
    release: 'Monthly — BLS',
    sparkline: sparkline(8400, 24, 0.08),
    category: 'Labor',
    local: true,
  },
  lfpr: {
    id: 'lfpr', name: 'Labor Force Participation', section: 'employment',
    value: 62.5, unit: '%', date: '2026-06-06',
    periodChange: 0, yoyChange: -0.1,
    release: 'Monthly — BLS',
    sparkline: sparkline(62.5, 24, 0.005),
    category: 'Labor',
  },
  avgHourlyEarnings: {
    id: 'avgHourlyEarnings', name: 'Avg Hourly Earnings (YoY)', section: 'employment',
    value: 3.9, unit: '%', date: '2026-06-06',
    periodChange: +0.1, yoyChange: -0.4,
    release: 'Monthly — BLS',
    sparkline: sparkline(3.9, 24, 0.02),
    category: 'Labor',
  },
  atlantaWageTracker: {
    id: 'atlantaWageTracker', name: 'Atlanta Fed Wage Tracker (YoY)', section: 'employment',
    value: 4.3, unit: '%', date: '2026-06-01',
    periodChange: -0.2, yoyChange: -0.8,
    release: 'Monthly — Atlanta Fed',
    sparkline: sparkline(4.3, 24, 0.02),
    category: 'Labor',
  },
  joltsOpenings: {
    id: 'joltsOpenings', name: 'JOLTS Job Openings', section: 'employment',
    value: 7.19, unit: 'M', date: '2026-05-31',
    periodChange: -0.14, yoyChange: -0.82,
    release: 'Monthly — BLS',
    sparkline: sparkline(7.19, 24, 0.04),
    category: 'Labor',
  },
  joltsQuits: {
    id: 'joltsQuits', name: 'JOLTS Quits', section: 'employment',
    value: 3.31, unit: 'M', date: '2026-05-31',
    periodChange: +0.08, yoyChange: -0.22,
    release: 'Monthly — BLS',
    sparkline: sparkline(3.31, 24, 0.035),
    category: 'Labor',
  },
  joltsLayoffs: {
    id: 'joltsLayoffs', name: 'JOLTS Layoffs', section: 'employment',
    value: 1.61, unit: 'M', date: '2026-05-31',
    periodChange: -0.04, yoyChange: +0.18,
    release: 'Monthly — BLS',
    sparkline: sparkline(1.61, 24, 0.04),
    category: 'Labor',
  },
  seaTechLayoffs: {
    id: 'seaTechLayoffs', name: 'Seattle Tech Sector Emp.', section: 'employment',
    value: 312400, unit: ' jobs', date: '2026-05-31',
    periodChange: -2100, yoyChange: -8400,
    release: 'Monthly — BLS/WA ESD',
    sparkline: sparkline(312400, 24, 0.01),
    category: 'Labor',
    local: true,
  },
};

// ── Federal Reserve ──────────────────────────────────────────────────────────
const FED = {
  effFedFunds: {
    id: 'effFedFunds', name: 'Effective Fed Funds Rate', section: 'fed',
    value: 4.33, unit: '%', date: '2026-06-18',
    periodChange: 0, yoyChange: -0.92,
    release: 'Daily — FRED',
    sparkline: sparkline(4.33, 24, 0.003),
    category: 'Federal Reserve',
  },
  fedTargetHigh: {
    id: 'fedTargetHigh', name: 'Fed Target Range (Upper)', section: 'fed',
    value: 4.50, unit: '%', date: '2026-06-18',
    periodChange: 0, yoyChange: -1.0,
    release: 'FOMC Decision',
    sparkline: sparkline(4.5, 24, 0.001),
    category: 'Federal Reserve',
  },
  // Cut probabilities for upcoming FOMC meetings
  cutProbJul: {
    id: 'cutProbJul', name: 'Jul FOMC Cut Prob.', section: 'fed',
    value: 14, unit: '%', date: '2026-06-18',
    periodChange: -2, yoyChange: null,
    release: 'Daily — CME FedWatch',
    sparkline: sparkline(14, 24, 0.1),
    category: 'Federal Reserve',
  },
  cutProbSep: {
    id: 'cutProbSep', name: 'Sep FOMC Cut Prob.', section: 'fed',
    value: 68, unit: '%', date: '2026-06-18',
    periodChange: +4, yoyChange: null,
    release: 'Daily — CME FedWatch',
    sparkline: sparkline(68, 24, 0.06),
    category: 'Federal Reserve',
  },
  cutProbNov: {
    id: 'cutProbNov', name: 'Nov FOMC Cut Prob.', section: 'fed',
    value: 82, unit: '%', date: '2026-06-18',
    periodChange: +2, yoyChange: null,
    release: 'Daily — CME FedWatch',
    sparkline: sparkline(82, 24, 0.04),
    category: 'Federal Reserve',
  },
};

// ── Upcoming Releases ────────────────────────────────────────────────────────
const UPCOMING_RELEASES = [
  { date: '2026-06-19', name: 'Initial Jobless Claims', prior: '222K', consensus: '218K', source: 'DOL' },
  { date: '2026-06-20', name: 'Existing Home Sales', prior: '4.00M', consensus: '4.05M', source: 'NAR' },
  { date: '2026-06-24', name: 'New Home Sales', prior: '683K', consensus: '690K', source: 'Census/HUD' },
  { date: '2026-06-25', name: 'Consumer Confidence', prior: '98.0', consensus: '99.4', source: 'Conference Board' },
  { date: '2026-06-26', name: 'GDP (Q1 Final)', prior: '+1.2%', consensus: '+1.3%', source: 'BEA' },
  { date: '2026-06-27', name: 'PCE Inflation (May)', prior: '2.6%', consensus: '2.5%', source: 'BEA' },
  { date: '2026-06-27', name: 'Personal Income (May)', prior: '+0.3%', consensus: '+0.4%', source: 'BEA' },
  { date: '2026-07-01', name: 'ISM Manufacturing', prior: '48.5', consensus: '49.0', source: 'ISM' },
  { date: '2026-07-04', name: 'Independence Day (Markets Closed)', prior: '', consensus: '', source: '' },
  { date: '2026-07-10', name: 'CPI (June)', prior: '2.9%', consensus: '2.8%', source: 'BLS' },
  { date: '2026-07-15', name: 'Housing Starts (June)', prior: '1.361M', consensus: '1.375M', source: 'Census/HUD' },
  { date: '2026-07-16', name: 'Retail Sales (June)', prior: '+0.1%', consensus: '+0.3%', source: 'Census' },
  { date: '2026-07-22', name: 'Existing Home Sales (June)', prior: '4.03M', consensus: '4.06M', source: 'NAR' },
  { date: '2026-07-29', name: 'JOLTS (June)', prior: '7.19M', consensus: '7.22M', source: 'BLS' },
  { date: '2026-07-30', name: 'FOMC Rate Decision', prior: '4.25–4.50%', consensus: 'No Change', source: 'Federal Reserve' },
];

// ── Recent Releases (grouped by source) ─────────────────────────────────────
const RECENT_RELEASES = {
  'Freddie Mac': [
    { name: 'Mortgage Rates (30yr)', value: '6.82%', date: '2026-06-13' },
  ],
  'BLS / DOL': [
    { name: 'Initial Claims', value: '222K', date: '2026-06-14' },
    { name: 'CPI (May, YoY)', value: '2.9%', date: '2026-06-11' },
    { name: 'PPI (May, YoY)', value: '2.4%', date: '2026-06-12' },
    { name: 'Nonfarm Payrolls', value: '+177K', date: '2026-06-06' },
  ],
  'BEA': [
    { name: 'PCE (Apr, YoY)', value: '2.6%', date: '2026-05-30' },
    { name: 'GDP Q1 Advance', value: '+1.2%', date: '2026-04-30' },
  ],
  'NAR': [
    { name: 'Existing Home Sales (Apr)', value: '4.00M', date: '2026-05-22' },
  ],
  'Altos Research': [
    { name: 'Seattle Active Inventory', value: '3,241', date: '2026-06-13' },
    { name: 'Seattle New Listings', value: '892/wk', date: '2026-06-13' },
    { name: 'Seattle Pending Sales', value: '1,104/wk', date: '2026-06-13' },
  ],
  'Redfin': [
    { name: 'Seattle Median Sale Price', value: '$875K', date: '2026-06-01' },
    { name: 'Seattle Days on Market', value: '18 days', date: '2026-06-13' },
  ],
  'WA ESD': [
    { name: 'WA Initial Claims', value: '9,840', date: '2026-06-14' },
    { name: 'Seattle Metro Unemployment', value: '3.8%', date: '2026-05-31' },
  ],
};

// ── All Data Master List ─────────────────────────────────────────────────────
const ALL_METRICS = {
  ...MARKETS,
  ...HOUSING,
  ...INFLATION,
  ...EMPLOYMENT,
  ...FED,
};

// Category grouping for All Data view
const CATEGORIES = {
  'Financial Markets': ['treasury10y', 'treasury2y', 'sp500', 'oil', 'mortgageRate', 'mortgageSpread'],
  'Housing — Seattle': ['seaMedianPrice', 'seaMedianListPrice', 'seaActiveInventory', 'seaWeeksSupply',
    'seaNewListings', 'seaPendingSales', 'seaDaysOnMarket', 'seaPriceReductions',
    'seaSaleTListRatio', 'seaCaseShiller', 'kingCountyHomeowners', 'seaAffordabilityRatio'],
  'Housing — National': ['existingHomeSales', 'newHomeSales'],
  'Construction — Seattle MSA': ['seaPermits', 'seaCompletions', 'seaUnderConstruction', 'seaMultifamilyUnder', 'seaSingleFamilyUnder'],
  'Construction — National': ['housingStarts', 'buildingPermits', 'housingCompletions', 'unitsUnderConstruction'],
  'Inflation': ['cpiHeadline', 'cpiCore', 'pce', 'pceCore', 'trimmedMeanPce',
    'breakeven5y', 'breakeven10y', 'clevelandFedInfExp', 'seaMetroCpi'],
  'CPI Components': ['cpiShelter', 'cpiEnergy', 'cpiFood', 'cpiMedical', 'cpiTransport'],
  'Producer Prices': ['ppi', 'ppiCore'],
  'Labor — Seattle / WA': ['waStateInitialClaims', 'seaUnemployment', 'seaPayrolls', 'seaTechLayoffs'],
  'Labor — National': ['initialClaims', 'continuingClaims', 'u3', 'u6', 'nfp',
    'lfpr', 'avgHourlyEarnings', 'atlantaWageTracker',
    'joltsOpenings', 'joltsQuits', 'joltsLayoffs'],
  'Federal Reserve': ['effFedFunds', 'fedTargetHigh', 'cutProbJul', 'cutProbSep', 'cutProbNov'],
};

// FOMC meeting schedule
const FOMC_MEETINGS = [
  { date: '2026-07-29', label: 'Jul 28–29', holdProb: 86, cutProb: 14, hikeProb: 0 },
  { date: '2026-09-16', label: 'Sep 15–16', holdProb: 32, cutProb: 68, hikeProb: 0 },
  { date: '2026-11-04', label: 'Nov 4–5', holdProb: 18, cutProb: 82, hikeProb: 0 },
  { date: '2026-12-16', label: 'Dec 15–16', holdProb: 22, cutProb: 77, hikeProb: 1 },
];

// Today summary — used for narrative generation
const TODAY_SUMMARY_CONTEXT = {
  date: TODAY,
  keyMetrics: [
    { name: '10yr Treasury', value: '4.38%', change: '+4bps today' },
    { name: 'Mortgage Rate', value: '6.82%', change: '-5bps WoW' },
    { name: 'Seattle Median Price', value: '$875K', change: '+$12K MoM, +$38K YoY' },
    { name: 'Seattle Inventory', value: '3,241 homes', change: '+187 WoW, +621 YoY' },
    { name: 'CPI (May)', value: '2.9% YoY', change: '-0.1 from Apr' },
    { name: 'Initial Claims', value: '222K', change: '-4K WoW' },
    { name: 'Fed Funds', value: '4.25-4.50%', change: 'Unchanged; Sep cut at 68%' },
  ],
  narrative: `Seattle's housing market continues to show signs of normalization heading into summer 2026.
Active inventory has climbed to 3,241 homes — the highest since early 2019 — giving buyers meaningfully more choice
than the historic lows of 2021–2022. Despite rising supply, the median sale price held firm at $875K (+4.5% YoY),
supported by resilient local employment in aerospace and healthcare. Mortgage rates edged down to 6.82%,
a modest tailwind for affordability. Nationally, inflation continues its gradual descent with May CPI at 2.9%,
keeping September Fed rate cut expectations elevated at 68%. The labor market remains solid but is softening
at the margins — initial claims ticked down but continuing claims crept higher.`
};
