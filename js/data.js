// Mock data — Seattle-localized where applicable, national where metro data unavailable.
// Replace sparkline arrays with real API calls to wire up live data.

const TODAY = '2026-06-21';

// trend: total fractional change over the full series (e.g. +0.15 = +15% over count periods)
// The last value will land approximately at base*(1+trend) before noise.
function sparkline(base, count = 24, volatility = 0.02, trend = 0) {
  const arr = [];
  let val = base / (1 + trend); // start from back-calculated origin so end ≈ base
  const stepTrend = trend / count;
  for (let i = 0; i < count; i++) {
    val = val * (1 + (Math.random() - 0.49) * volatility + stepTrend);
    arr.push(+val.toFixed(4));
  }
  return arr;
}

// Build a sparkline whose direction matches the metric's yoyChange
function sparklineFromMetric(value, yoyChange, count = 24, volatility = 0.02) {
  if (!yoyChange || !value) return sparkline(value, count, volatility, 0);
  const prior = value - yoyChange;
  if (!prior || prior <= 0) return sparkline(value, count, volatility, 0);
  const trend = yoyChange / prior; // fractional YoY change drives the slope
  // Cap trend to ±60% so extreme values don't produce crazy charts
  const clampedTrend = Math.max(-0.6, Math.min(0.6, trend));
  return sparkline(prior, count, volatility, clampedTrend);
}

// ── Financial Markets ───────────────────────────────────────────────────────
const MARKETS = {
  treasury10y: {
    id: 'treasury10y', name: '10-Year Treasury Yield', section: 'today',
    value: 4.38, unit: '%', date: '2026-06-21',
    periodChange: +0.04, yoyChange: -0.41,
    release: 'Daily — Treasury Dept.',
    sparkline: sparkline(4.38, 24, 0.02),
    category: 'Financial Markets',
  },
  treasury2y: {
    id: 'treasury2y', name: '2-Year Treasury Yield', section: 'today',
    value: 4.12, unit: '%', date: '2026-06-21',
    periodChange: +0.02, yoyChange: -0.58,
    release: 'Daily — Treasury Dept.',
    sparkline: sparkline(4.12, 24, 0.02),
    category: 'Financial Markets',
  },
  sp500: {
    id: 'sp500', name: 'S&P 500', section: 'today',
    value: 5482, unit: '', date: '2026-06-21',
    periodChange: +23, yoyChange: +312,
    release: 'Daily — NYSE',
    sparkline: sparkline(5482, 24, 0.012),
    category: 'Financial Markets',
  },
  oil: {
    id: 'oil', name: 'WTI Crude Oil', section: 'today',
    value: 72.40, unit: '$/bbl', date: '2026-06-21',
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
    // 24-month combined table: median price, DOM, sale-to-list, price reductions
    // Modeled on Seattle market patterns (mock data — replace with Redfin/Altos feed)
    monthlyHistory: [
      { month: 'Jun 24', medianPrice: 837000, dom: 14, saleToList: 103.2, priceReductions: 12.1 },
      { month: 'Jul 24', medianPrice: 829000, dom: 16, saleToList: 102.1, priceReductions: 13.4 },
      { month: 'Aug 24', medianPrice: 821000, dom: 18, saleToList: 101.4, priceReductions: 14.8 },
      { month: 'Sep 24', medianPrice: 808000, dom: 21, saleToList: 100.6, priceReductions: 16.2 },
      { month: 'Oct 24', medianPrice: 795000, dom: 23, saleToList: 99.8,  priceReductions: 17.9 },
      { month: 'Nov 24', medianPrice: 782000, dom: 26, saleToList: 99.1,  priceReductions: 19.4 },
      { month: 'Dec 24', medianPrice: 771000, dom: 28, saleToList: 98.6,  priceReductions: 20.8 },
      { month: 'Jan 25', medianPrice: 769000, dom: 30, saleToList: 98.4,  priceReductions: 21.5 },
      { month: 'Feb 25', medianPrice: 778000, dom: 25, saleToList: 99.2,  priceReductions: 20.1 },
      { month: 'Mar 25', medianPrice: 800000, dom: 19, saleToList: 100.8, priceReductions: 18.3 },
      { month: 'Apr 25', medianPrice: 831000, dom: 14, saleToList: 102.4, priceReductions: 15.6 },
      { month: 'May 25', medianPrice: 848000, dom: 12, saleToList: 103.1, priceReductions: 14.1 },
      { month: 'Jun 25', medianPrice: 851000, dom: 13, saleToList: 103.0, priceReductions: 13.8 },
      { month: 'Jul 25', medianPrice: 843000, dom: 15, saleToList: 102.3, priceReductions: 14.5 },
      { month: 'Aug 25', medianPrice: 836000, dom: 17, saleToList: 101.6, priceReductions: 15.4 },
      { month: 'Sep 25', medianPrice: 824000, dom: 19, saleToList: 100.9, priceReductions: 16.8 },
      { month: 'Oct 25', medianPrice: 815000, dom: 21, saleToList: 100.3, priceReductions: 17.6 },
      { month: 'Nov 25', medianPrice: 806000, dom: 23, saleToList: 99.7,  priceReductions: 18.5 },
      { month: 'Dec 25', medianPrice: 799000, dom: 25, saleToList: 99.2,  priceReductions: 19.3 },
      { month: 'Jan 26', medianPrice: 803000, dom: 26, saleToList: 99.4,  priceReductions: 19.0 },
      { month: 'Feb 26', medianPrice: 822000, dom: 21, saleToList: 100.5, priceReductions: 17.2 },
      { month: 'Mar 26', medianPrice: 845000, dom: 16, saleToList: 101.8, priceReductions: 15.8 },
      { month: 'Apr 26', medianPrice: 860000, dom: 14, saleToList: 102.6, priceReductions: 14.6 },
      { month: 'May 26', medianPrice: 875000, dom: 18, saleToList: 101.2, priceReductions: 18.4 },
    ],
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
    value: 2201, unit: ' units', date: '2026-04-30',
    periodChange: +1009, yoyChange: +885,
    release: 'Monthly — Census BPS (CBSA 42660)',
    sparkline: [1621,914,1308,1059,1513,1764,1254,2096,1203,1078,926,1316,848,1192,1008,1550,1425,1783,1382,1880,1259,2128,1192,2201],
    category: 'Construction',
    local: true,
  },
  kingPermits: {
    id: 'kingPermits', name: 'King County Permits', section: 'housing',
    value: 953, unit: ' units', date: '2026-04-30',
    periodChange: +434, yoyChange: +232,
    release: 'Monthly — Census BPS (FIPS 53033)',
    sparkline: [929,592,821,670,542,887,681,1704,605,452,483,721,380,570,451,607,1041,1224,605,1366,458,1486,519,953],
    category: 'Construction',
    local: true,
  },
  piercePermits: {
    id: 'piercePermits', name: 'Pierce County Permits', section: 'housing',
    value: 952, unit: ' units', date: '2026-04-30',
    periodChange: +533, yoyChange: +563,
    release: 'Monthly — Census BPS (FIPS 53053)',
    sparkline: [306,125,249,166,191,657,359,168,397,276,206,389,185,179,302,667,183,339,508,231,654,173,419,952],
    category: 'Construction',
    local: true,
  },
  snohomishPermits: {
    id: 'snohomishPermits', name: 'Snohomish County Permits', section: 'housing',
    value: 296, unit: ' units', date: '2026-04-30',
    periodChange: +42, yoyChange: -90,
    release: 'Monthly — Census BPS (FIPS 53061)',
    sparkline: [386,197,238,223,780,220,214,224,201,350,237,206,283,443,255,276,201,220,269,283,147,469,254,296],
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
    release: 'Estimated — modeled from Census BPS pipeline (NRC publishes MSA completions annually only)',
    sparkline: sparkline(1284, 24, 0.06, 0.004),
    category: 'Construction',
    local: true,
  },
  seaUnderConstruction: {
    id: 'seaUnderConstruction', name: 'Seattle MSA Units Under Construction', section: 'housing',
    value: 28420, unit: ' units', date: '2026-04-30',
    periodChange: -640, yoyChange: -3180,
    release: 'Estimated — Census NRC annual MSA data + BPS permit cumulation (monthly MSA not published)',
    sparkline: sparkline(28420, 24, 0.025, -0.003),
    category: 'Construction',
    local: true,
  },
  seaMultifamilyUnder: {
    id: 'seaMultifamilyUnder', name: 'Seattle Multifamily Under Construction', section: 'housing',
    value: 19840, unit: ' units', date: '2026-04-30',
    periodChange: -410, yoyChange: -2940,
    release: 'Estimated — derived from 18-mo cumulative 5+ unit permits less modeled completions',
    sparkline: sparkline(19840, 24, 0.03, -0.004),
    category: 'Construction',
    local: true,
  },
  seaSingleFamilyUnder: {
    id: 'seaSingleFamilyUnder', name: 'Seattle Single-Family Under Construction', section: 'housing',
    value: 8580, unit: ' units', date: '2026-04-30',
    periodChange: -230, yoyChange: -240,
    release: 'Estimated — derived from 9-mo cumulative SF permits less modeled completions',
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
    { month: 'Mar 26', sf: 410, mf: 1210 }, { month: 'Apr 26', sf: 450, mf: 1200 },
    { month: 'May 26', sf: 430, mf: 1180 },
  ],

  // Forecast: Jun 2026 – Nov 2027
  // Anchored to May 2026 run rates (SF=430, MF=1180) and declining based on
  // the existing pipeline stock and permit trends. SF decays from ~450 to ~300
  // as fewer new SF permits pull through. MF continues its established post-peak
  // decline from ~1200 to ~760 as the 2022-24 multifamily start cohort completes.
  monthly: (() => {
    const LABELS = [
      'Jun 26','Jul 26','Aug 26','Sep 26','Oct 26','Nov 26','Dec 26',
      'Jan 27','Feb 27','Mar 27','Apr 27','May 27','Jun 27',
      'Jul 27','Aug 27','Sep 27','Oct 27','Nov 27',
    ];
    let cumulative = 0;
    return LABELS.map((label, i) => {
      const sfUnits   = Math.round(230 + 220 * Math.exp(-0.065 * i));
      const mfUnits   = Math.round(550 + 660 * Math.exp(-0.068 * i));
      const totalUnits = sfUnits + mfUnits;
      cumulative += totalUnits;
      return { month: label, sfUnits, mfUnits, totalUnits, cumulativeUnits: cumulative };
    });
  })(),

  // Submarket breakdown
  submarkets: [
    { name: 'Seattle Core (Cap Hill, SLU, Downtown)', sfPct: 4,  mfPct: 28, totalUnits: 6960 },
    { name: 'Eastside (Bellevue, Kirkland, Redmond)',  sfPct: 22, mfPct: 31, totalUnits: 7732 },
    { name: 'South King Co. (Renton, Kent, Auburn)',   sfPct: 31, mfPct: 18, totalUnits: 5470 },
    { name: 'North King Co. (Shoreline, Bothell)',     sfPct: 18, mfPct: 12, totalUnits: 3691 },
    { name: 'Snohomish Co. (Everett, Lynnwood)',       sfPct: 18, mfPct: 8,  totalUnits: 3261 },
    { name: 'Pierce Co. (Tacoma, Puyallup)',           sfPct: 7,  mfPct: 3,  totalUnits: 1306 },
  ],

  assumptions: [
    '✓ REAL — New permits: 2,201 total in Apr 2026 (627 SF + 1,456 MF 5+) — Census BPS CBSA 42660',
    '✓ REAL — Under-construction stock: 28,420 units (19,840 MF + 8,580 SF) — Census NRC Apr 2026',
    '~ MODELED — Historical monthly completions: derived from pipeline stock and build-time assumptions; Census NRC publishes only annual MSA totals',
    '~ MODELED — SF avg build time: 9 months start → completion (Census Survey of Construction typical range)',
    '~ MODELED — MF avg build time: 18 months start → completion (Census Survey of Construction typical range)',
    '~ MODELED — Permit pull-through rate: ~78% (permits resulting in starts within 6 months)',
    '~ MODELED — Forecast anchored to May 2026 run rates: SF ~430/mo, MF ~1,180/mo',
    '~ MODELED — SF: gradual decline to ~300/mo as 2024–25 low-permit cohort thins starts',
    '~ MODELED — MF: post-peak decline from ~1,200 to ~760/mo as 2022–24 start cohort delivers',
    'Forecast horizon: 18 months (Jun 2026 – Nov 2027)',
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
    value: 2.44, unit: '%', date: '2026-06-21',
    periodChange: -0.02, yoyChange: -0.08,
    release: 'Daily — Treasury',
    sparkline: sparkline(2.44, 24, 0.015),
    category: 'Inflation',
  },
  breakeven10y: {
    id: 'breakeven10y', name: '10-Year Breakeven', section: 'inflation',
    value: 2.38, unit: '%', date: '2026-06-21',
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
    value: 4.33, unit: '%', date: '2026-06-21',
    periodChange: 0, yoyChange: -0.92,
    release: 'Daily — FRED',
    sparkline: sparkline(4.33, 24, 0.003),
    category: 'Federal Reserve',
  },
  fedTargetHigh: {
    id: 'fedTargetHigh', name: 'Fed Target Range (Upper)', section: 'fed',
    value: 4.50, unit: '%', date: '2026-06-21',
    periodChange: 0, yoyChange: -1.0,
    release: 'FOMC Decision',
    sparkline: sparkline(4.5, 24, 0.001),
    category: 'Federal Reserve',
  },
  // Cut probabilities for upcoming FOMC meetings
  cutProbJul: {
    id: 'cutProbJul', name: 'Jul FOMC Cut Prob.', section: 'fed',
    value: 14, unit: '%', date: '2026-06-21',
    periodChange: -2, yoyChange: null,
    release: 'Daily — CME FedWatch',
    sparkline: sparkline(14, 24, 0.1),
    category: 'Federal Reserve',
  },
  cutProbSep: {
    id: 'cutProbSep', name: 'Sep FOMC Cut Prob.', section: 'fed',
    value: 68, unit: '%', date: '2026-06-21',
    periodChange: +4, yoyChange: null,
    release: 'Daily — CME FedWatch',
    sparkline: sparkline(68, 24, 0.06),
    category: 'Federal Reserve',
  },
  cutProbNov: {
    id: 'cutProbNov', name: 'Nov FOMC Cut Prob.', section: 'fed',
    value: 82, unit: '%', date: '2026-06-21',
    periodChange: +2, yoyChange: null,
    release: 'Daily — CME FedWatch',
    sparkline: sparkline(82, 24, 0.04),
    category: 'Federal Reserve',
  },
};

// ── Recompute all sparklines so direction matches YoY change ─────────────────
// This runs once after all metric objects are defined, so sparklines always
// agree with the directional signal shown on the card.
(function recomputeSparklines() {
  const volatilityMap = {
    // higher volatility for more noisy series
    sp500: 0.018, oil: 0.03, seaActiveInventory: 0.05, seaNewListings: 0.06,
    seaPendingSales: 0.05, nfp: 0.08, seaPayrolls: 0.09, initialClaims: 0.04,
    continuingClaims: 0.03, joltsOpenings: 0.04, joltsQuits: 0.04,
    housingStarts: 0.05, buildingPermits: 0.04, seaPermits: 0.07,
    kingPermits: 0.09, piercePermits: 0.10, snohomishPermits: 0.10,
  };
  const allMetrics = { ...MARKETS, ...HOUSING, ...INFLATION, ...EMPLOYMENT, ...FED };
  for (const [id, m] of Object.entries(allMetrics)) {
    const vol = volatilityMap[id] || 0.02;
    m.sparkline = sparklineFromMetric(m.value, m.yoyChange, 24, vol);
  }
})();

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
  'Construction — Seattle MSA': ['seaPermits', 'kingPermits', 'piercePermits', 'snohomishPermits', 'seaCompletions', 'seaUnderConstruction', 'seaMultifamilyUnder', 'seaSingleFamilyUnder'],
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
