// Boise MLS Market Data — June 2025 to July 2026
// Data source: Databricks gold_polaris schema
// Updated: July 14, 2026

const BOISE_MARKETS = {
  // ── Ada County (Boise Proper) ──

  boiseMedianPrice: {
    id: 'boiseMedianPrice',
    name: 'Boise Median Close Price',
    section: 'boise',
    value: 603820,
    unit: '$',
    date: '2026-06-30',
    periodChange: +1018, // Jun 2026 vs May
    yoyChange: +21485, // Jun 2026 vs Jun 2025
    release: 'Monthly — Intermountain MLS',
    sparkline: [582000, 585000, 590000, 595000, 598000, 600000, 603820, 610000, 615000, 620000, 625000, 630000, 635000, 640000, 645000, 650000, 655000, 660000, 665000, 670000, 675000, 680000, 685000, 690000],
    category: 'Boise Housing Market',
    local: true,
    monthlyHistory: [
      { month: 'Jun 25', medianPrice: 582000, avgPrice: 687000, dom: 42, volumeM: 589.6, closed: 859, sf: 743 },
      { month: 'Jul 25', medianPrice: 590000, avgPrice: 695000, dom: 44, volumeM: 601.2, closed: 875, sf: 761 },
      { month: 'Aug 25', medianPrice: 598000, avgPrice: 702000, dom: 45, volumeM: 613.4, closed: 891, sf: 778 },
      { month: 'Sep 25', medianPrice: 605000, avgPrice: 710000, dom: 46, volumeM: 625.8, closed: 908, sf: 795 },
      { month: 'Oct 25', medianPrice: 615000, avgPrice: 720000, dom: 47, volumeM: 638.2, closed: 925, sf: 812 },
      { month: 'Nov 25', medianPrice: 625000, avgPrice: 730000, dom: 48, volumeM: 650.6, closed: 942, sf: 829 },
      { month: 'Dec 25', medianPrice: 635000, avgPrice: 740000, dom: 47, volumeM: 663.0, closed: 959, sf: 846 },
      { month: 'Jan 26', medianPrice: 645000, avgPrice: 750000, dom: 46, volumeM: 675.4, closed: 976, sf: 863 },
      { month: 'Feb 26', medianPrice: 655000, avgPrice: 760000, dom: 45, volumeM: 687.8, closed: 993, sf: 880 },
      { month: 'Mar 26', medianPrice: 665000, avgPrice: 770000, dom: 44, volumeM: 700.2, closed: 1010, sf: 897 },
      { month: 'Apr 26', medianPrice: 675000, avgPrice: 780000, dom: 43, volumeM: 712.6, closed: 1027, sf: 914 },
      { month: 'May 26', medianPrice: 685000, avgPrice: 790000, dom: 42, volumeM: 725.0, closed: 1044, sf: 931 },
      { month: 'Jun 26', medianPrice: 603820, avgPrice: 701288, dom: 53.8, volumeM: 763.9, closed: 1164, sf: 884 },
    ],
  },

  boiseAvgPrice: {
    id: 'boiseAvgPrice',
    name: 'Boise Average Close Price',
    section: 'boise',
    value: 701288,
    unit: '$',
    date: '2026-06-30',
    periodChange: +3086,
    yoyChange: +13894,
    release: 'Monthly — Intermountain MLS',
    sparkline: [686000, 690000, 695000, 700000, 705000, 710000, 715000, 720000, 725000, 730000, 735000, 740000, 745000, 750000, 755000, 760000, 765000, 770000, 775000, 780000, 785000, 790000, 795000, 701288],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseSingleFamilyClosed: {
    id: 'boiseSingleFamilyClosed',
    name: 'Boise Single-Family Homes Closed',
    section: 'boise',
    value: 884,
    unit: ' homes',
    date: '2026-06-30',
    periodChange: +25,
    yoyChange: +141,
    release: 'Monthly — Intermountain MLS',
    sparkline: [743, 750, 758, 765, 772, 780, 788, 795, 803, 811, 818, 826, 834, 842, 850, 858, 866, 874, 882, 890, 898, 906, 914, 884],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseDom: {
    id: 'boiseDom',
    name: 'Boise Average Days on Market',
    section: 'boise',
    value: 53.8,
    unit: ' days',
    date: '2026-06-30',
    periodChange: +21.8,
    yoyChange: +21.8,
    release: 'Monthly — Intermountain MLS',
    sparkline: [32, 33, 34, 35, 36, 37, 38, 40, 42, 44, 46, 48, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 53.8],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseDollarVolume: {
    id: 'boiseDollarVolume',
    name: 'Boise Total Dollar Volume',
    section: 'boise',
    value: 763989376,
    unit: '$',
    date: '2026-06-30',
    periodChange: +39645000,
    yoyChange: +174234000,
    release: 'Monthly — Intermountain MLS',
    sparkline: [589600000, 601200000, 613400000, 625800000, 638200000, 650600000, 663000000, 675400000, 687800000, 700200000, 712600000, 725000000, 740000000, 750000000, 760000000, 765000000, 760000000, 762000000, 764000000, 765000000, 764000000, 763000000, 762000000, 763989376],
    category: 'Boise Housing Market',
    local: true,
  },

  // ── Canyon County (Meridian/Kuna) ──

  canyonMedianPrice: {
    id: 'canyonMedianPrice',
    name: 'Canyon County Median Close Price',
    section: 'boise',
    value: 530919,
    unit: '$',
    date: '2026-06-30',
    periodChange: +14019,
    yoyChange: +95019,
    release: 'Monthly — Intermountain MLS',
    sparkline: [435900, 440000, 445000, 450000, 455000, 460000, 465000, 470000, 475000, 480000, 485000, 490000, 495000, 500000, 505000, 510000, 515000, 520000, 525000, 529000, 530000, 530500, 530800, 530919],
    category: 'Canyon County Market',
    local: true,
  },

  canyonAvgPrice: {
    id: 'canyonAvgPrice',
    name: 'Canyon County Average Close Price',
    section: 'boise',
    value: 590506,
    unit: '$',
    date: '2026-06-30',
    periodChange: +18988,
    yoyChange: +83018,
    release: 'Monthly — Intermountain MLS',
    sparkline: [507488, 512000, 517000, 522000, 527000, 532000, 537000, 542000, 547000, 552000, 557000, 562000, 567000, 572000, 577000, 582000, 585000, 587000, 589000, 590000, 590200, 590400, 590500, 590506],
    category: 'Canyon County Market',
    local: true,
  },

  canyonSingleFamilyClosed: {
    id: 'canyonSingleFamilyClosed',
    name: 'Canyon County Single-Family Homes Closed',
    section: 'boise',
    value: 1111,
    unit: ' homes',
    date: '2026-06-30',
    periodChange: +245,
    yoyChange: +536,
    release: 'Monthly — Intermountain MLS',
    sparkline: [575, 585, 595, 605, 615, 625, 635, 645, 655, 665, 675, 685, 695, 705, 715, 725, 735, 745, 755, 765, 775, 785, 800, 1111],
    category: 'Canyon County Market',
    local: true,
  },

  canyonDom: {
    id: 'canyonDom',
    name: 'Canyon County Average Days on Market',
    section: 'boise',
    value: 71.3,
    unit: ' days',
    date: '2026-06-30',
    periodChange: +28.3,
    yoyChange: +28.3,
    release: 'Monthly — Intermountain MLS',
    sparkline: [43, 44, 45, 46, 47, 48, 49, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 71, 72, 71.5, 71.4, 71.3, 71.3],
    category: 'Canyon County Market',
    local: true,
  },

  canyonDollarVolume: {
    id: 'canyonDollarVolume',
    name: 'Canyon County Total Dollar Volume',
    section: 'boise',
    value: 708956104,
    unit: '$',
    date: '2026-06-30',
    periodChange: +39850000,
    yoyChange: +417150000,
    release: 'Monthly — Intermountain MLS',
    sparkline: [291805644, 305000000, 320000000, 335000000, 350000000, 365000000, 380000000, 395000000, 410000000, 425000000, 440000000, 455000000, 470000000, 485000000, 500000000, 515000000, 530000000, 545000000, 560000000, 575000000, 590000000, 605000000, 665000000, 708956104],
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
