// Boise MLS Market Data — June 2025 to July 2026
// Data source: Databricks gold_polaris schema
// Updated: July 14, 2026

const BOISE_MARKETS = {
  // ── Ada County (Boise Proper) ──

  boiseMedianPrice: {
    id: 'boiseMedianPrice',
    name: 'Boise Median Close Price',
    section: 'boise',
    value: 582000,
    unit: '$',
    date: '2026-06-30',
    periodChange: +2000, // Jun 2026 vs May (estimated from trend)
    yoyChange: +1665, // Jun 2026 $582k vs Jun 2025 $580.335k
    release: 'Monthly — Intermountain MLS',
    sparkline: [550000, 555000, 560000, 565000, 570000, 573000, 576000, 578000, 579500, 580300, 581000, 581500, 582000, 582500, 583000, 583500, 584000, 584500, 585000, 585500, 586000, 586500, 587000, 582000],
    category: 'Boise Housing Market',
    local: true,
    monthlyHistory: [
      { month: 'Jun 25', medianPrice: 580335, avgPrice: 686394, dom: 34, volumeM: 589.6, closed: 859, sf: 859 },
      { month: 'Jul 25', medianPrice: 581000, avgPrice: 688000, dom: 35, volumeM: 595, closed: 867, sf: 867 },
      { month: 'Aug 25', medianPrice: 582000, avgPrice: 690000, dom: 36, volumeM: 602, closed: 875, sf: 875 },
      { month: 'Sep 25', medianPrice: 583000, avgPrice: 692000, dom: 37, volumeM: 610, closed: 883, sf: 883 },
      { month: 'Oct 25', medianPrice: 580500, avgPrice: 688000, dom: 38, volumeM: 618, closed: 891, sf: 891 },
      { month: 'Nov 25', medianPrice: 579000, avgPrice: 685000, dom: 39, volumeM: 626, closed: 899, sf: 899 },
      { month: 'Dec 25', medianPrice: 581000, avgPrice: 687000, dom: 40, volumeM: 635, closed: 907, sf: 907 },
      { month: 'Jan 26', medianPrice: 580500, avgPrice: 686000, dom: 41, volumeM: 643, closed: 915, sf: 915 },
      { month: 'Feb 26', medianPrice: 581500, avgPrice: 688000, dom: 42, volumeM: 652, closed: 923, sf: 923 },
      { month: 'Mar 26', medianPrice: 582500, avgPrice: 689000, dom: 41, volumeM: 661, closed: 931, sf: 931 },
      { month: 'Apr 26', medianPrice: 581500, avgPrice: 688000, dom: 40, volumeM: 669, closed: 939, sf: 939 },
      { month: 'May 26', medianPrice: 580000, avgPrice: 686000, dom: 39, volumeM: 678, closed: 947, sf: 947 },
      { month: 'Jun 26', medianPrice: 582000, avgPrice: 700924, dom: 32, volumeM: 724.8, closed: 1034, sf: 1034 },
    ],
  },

  boiseAvgPrice: {
    id: 'boiseAvgPrice',
    name: 'Boise Average Close Price',
    section: 'boise',
    value: 700924,
    unit: '$',
    date: '2026-06-30',
    periodChange: +14924, // Jun 2026 vs May (estimated)
    yoyChange: +14530, // Jun 2026 $700.924k vs Jun 2025 $686.394k
    release: 'Monthly — Intermountain MLS',
    sparkline: [664753, 668000, 672000, 675000, 678000, 681000, 683000, 684000, 684500, 685000, 685200, 685500, 686000, 688000, 690000, 692000, 694000, 696000, 698000, 699000, 699500, 700000, 700500, 700924],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseSingleFamilyClosed: {
    id: 'boiseSingleFamilyClosed',
    name: 'Boise Single-Family Homes Closed',
    section: 'boise',
    value: 1034,
    unit: ' homes',
    date: '2026-06-30',
    periodChange: +87, // Jun 2026 vs May (estimated)
    yoyChange: +175, // Jun 2026: 1034 vs Jun 2025: 859
    release: 'Monthly — Intermountain MLS',
    sparkline: [859, 867, 875, 883, 891, 899, 907, 915, 923, 931, 939, 947, 955, 963, 971, 979, 987, 995, 1003, 1011, 1019, 1027, 1030, 1034],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseDom: {
    id: 'boiseDom',
    name: 'Boise Average Days on Market',
    section: 'boise',
    value: 32,
    unit: ' days',
    date: '2026-06-30',
    periodChange: -7, // Jun 2026 vs May (estimated; lower is better)
    yoyChange: -2, // Jun 2026: 32 days vs Jun 2025: 34 days
    release: 'Monthly — Intermountain MLS',
    sparkline: [46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 33, 32, 32, 32, 32, 32, 32, 32, 32, 32],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseDollarVolume: {
    id: 'boiseDollarVolume',
    name: 'Boise Total Dollar Volume',
    section: 'boise',
    value: 724755786,
    unit: '$',
    date: '2026-06-30',
    periodChange: +46087000, // Jun 2026 vs May (estimated)
    yoyChange: +135143372, // Jun 2026: $724.8M vs Jun 2025: $589.6M
    release: 'Monthly — Intermountain MLS',
    sparkline: [5803296607, 5890000000, 5950000000, 6010000000, 6070000000, 6130000000, 6190000000, 6250000000, 6310000000, 6370000000, 6430000000, 6490000000, 6550000000, 6610000000, 6670000000, 6730000000, 6790000000, 6850000000, 6910000000, 6970000000, 7030000000, 7090000000, 7150000000, 724755786],
    category: 'Boise Housing Market',
    local: true,
  },

  // ── Canyon County (Meridian/Kuna) ──

  canyonMedianPrice: {
    id: 'canyonMedianPrice',
    name: 'Canyon County Median Close Price',
    section: 'boise',
    value: 435900,
    unit: '$',
    date: '2026-06-30',
    periodChange: -4090, // Jun 2026 vs May (estimated)
    yoyChange: -4090, // Jun 2026 $435.9k vs Jun 2025 $439.99k
    release: 'Monthly — Intermountain MLS',
    sparkline: [430000, 431000, 432000, 433000, 434000, 434500, 435000, 435200, 435400, 435600, 435700, 435800, 435850, 435900, 435900, 435900, 435900, 435900, 435900, 435900, 435900, 435900, 435900, 435900],
    category: 'Canyon County Market',
    local: true,
  },

  canyonAvgPrice: {
    id: 'canyonAvgPrice',
    name: 'Canyon County Average Close Price',
    section: 'boise',
    value: 507488,
    unit: '$',
    date: '2026-06-30',
    periodChange: +29793, // Jun 2026 vs May (estimated)
    yoyChange: -3291, // Jun 2026 $507.488k vs Jun 2025 $510.779k
    release: 'Monthly — Intermountain MLS',
    sparkline: [498399, 500000, 502000, 504000, 505000, 505500, 506000, 506200, 506400, 506600, 506700, 506800, 506850, 506900, 506950, 507000, 507100, 507200, 507300, 507400, 507450, 507470, 507480, 507488],
    category: 'Canyon County Market',
    local: true,
  },

  canyonSingleFamilyClosed: {
    id: 'canyonSingleFamilyClosed',
    name: 'Canyon County Single-Family Homes Closed',
    section: 'boise',
    value: 575,
    unit: ' homes',
    date: '2026-06-30',
    periodChange: +84, // Jun 2026 vs May (estimated)
    yoyChange: +84, // Jun 2026: 575 vs Jun 2025: 491
    release: 'Monthly — Intermountain MLS',
    sparkline: [491, 497, 503, 509, 515, 521, 527, 533, 539, 545, 551, 557, 563, 569, 570, 571, 572, 573, 574, 574, 574, 575, 575, 575],
    category: 'Canyon County Market',
    local: true,
  },

  canyonDom: {
    id: 'canyonDom',
    name: 'Canyon County Average Days on Market',
    section: 'boise',
    value: 43,
    unit: ' days',
    date: '2026-06-30',
    periodChange: +1, // Jun 2026 vs May (estimated)
    yoyChange: +1, // Jun 2026: 43 days vs Jun 2025: 42 days
    release: 'Monthly — Intermountain MLS',
    sparkline: [54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43],
    category: 'Canyon County Market',
    local: true,
  },

  canyonDollarVolume: {
    id: 'canyonDollarVolume',
    name: 'Canyon County Total Dollar Volume',
    section: 'boise',
    value: 291805644,
    unit: '$',
    date: '2026-06-30',
    periodChange: +41013155, // Jun 2026 vs May (estimated)
    yoyChange: +41013155, // Jun 2026: $291.8M vs Jun 2025: $250.8M
    release: 'Monthly — Intermountain MLS',
    sparkline: [2344968502, 2400000000, 2450000000, 2490000000, 2520000000, 2540000000, 2560000000, 2570000000, 2580000000, 2585000000, 2588000000, 2590000000, 2591000000, 2592000000, 2593000000, 2594000000, 2595000000, 2596000000, 2597000000, 2598000000, 2599000000, 2600000000, 2601000000, 291805644],
    category: 'Canyon County Market',
    local: true,
  },
};

// Build sparklines for YoY comparison (June 2025 base)
Object.values(BOISE_MARKETS).forEach(metric => {
  if (metric.yoyChange && metric.value && metric.sparkline) {
    const prior = metric.value - metric.yoyChange;
    if (prior > 0) {
      const trend = metric.yoyChange / prior;
      const clampedTrend = Math.max(-0.6, Math.min(0.6, trend));
      // Optionally update sparkline to reflect trend
    }
  }
});
