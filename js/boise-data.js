// Boise MLS Market Data — September 2024 to August 2026
// Data source: Databricks main.gold_mls.search_listings
// Filters: sale_status = 'SOLD', property_type_aggregated = 'Single Family',
//          county IN ('Ada County', 'Canyon County'), grouped by close_date month.
// Prices use current_price: close_price is only 2-4% populated before Oct 2025,
// while current_price is 100% populated across all 24 months and matches
// close_price exactly on rows where both are present.
// Medians are percentile_approx(current_price, 0.5) — the same estimator the
// series has used since it was first published, kept so refreshed months stay
// comparable with the ones already on the page.
// Updated: September 7, 2026 (August 2026 close month)
//
// Every month is re-pulled on each refresh rather than appended, so late-recorded
// closings revise recent history. This pull moved Jul 2026 Ada from 949 closings
// to 953 and Jun 2026 from 1038 to 1039; older months are unchanged.

// Period labels for every Boise MLS surface in js/app.js. A monthly refresh
// should change these five strings and nothing else in that file.
const BOISE_PERIOD = {
  month: 'Aug 2026',          // headline close month
  monthShort: 'Aug 26',       // matches the monthlyHistory labels
  monthName: 'August',        // prose
  prior: 'Aug 2025',          // year-ago comparison month
  histRange: 'Jul 2025 – Aug 2026',
  sparkStart: 'Sep 2024',
};

const BOISE_MARKETS = {
  // ── Ada County (Boise, Meridian, Eagle, Star, Kuna, Garden City) ──

  boiseMedianPrice: {
    id: 'boiseMedianPrice',
    name: 'Boise Median Close Price',
    section: 'boise',
    value: 595000,
    unit: '$',
    date: '2026-08-31',
    periodChange: -7000, // Aug 26 vs Jul 26
    yoyChange: +35000, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [539999, 549990, 529900, 529900, 547000, 540000, 570000, 549900, 581990, 584900, 550000, 560000, 559900, 549900, 564880, 525000, 535000, 538000, 543000, 545000, 575990, 584000, 602000, 595000],
    category: 'Boise Housing Market',
    local: true,
    monthlyHistory: [
      { month: 'Jul 25', medianPrice: 550000, avgPrice: 680717, dom: 36, volumeM: 614.0, closed: 902, sf: 902 },
      { month: 'Aug 25', medianPrice: 560000, avgPrice: 680427, dom: 39, volumeM: 566.1, closed: 832, sf: 832 },
      { month: 'Sep 25', medianPrice: 559900, avgPrice: 686954, dom: 41, volumeM: 540.6, closed: 787, sf: 787 },
      { month: 'Oct 25', medianPrice: 549900, avgPrice: 650477, dom: 44, volumeM: 554.2, closed: 852, sf: 852 },
      { month: 'Nov 25', medianPrice: 564880, avgPrice: 694372, dom: 46, volumeM: 481.9, closed: 694, sf: 694 },
      { month: 'Dec 25', medianPrice: 525000, avgPrice: 651200, dom: 50, volumeM: 454.5, closed: 698, sf: 698 },
      { month: 'Jan 26', medianPrice: 535000, avgPrice: 649292, dom: 52, volumeM: 344.8, closed: 531, sf: 531 },
      { month: 'Feb 26', medianPrice: 538000, avgPrice: 642614, dom: 57, volumeM: 417.1, closed: 649, sf: 649 },
      { month: 'Mar 26', medianPrice: 543000, avgPrice: 650927, dom: 52, volumeM: 529.9, closed: 814, sf: 814 },
      { month: 'Apr 26', medianPrice: 545000, avgPrice: 652640, dom: 42, volumeM: 595.2, closed: 912, sf: 912 },
      { month: 'May 26', medianPrice: 575990, avgPrice: 683068, dom: 31, volumeM: 687.2, closed: 1006, sf: 1006 },
      { month: 'Jun 26', medianPrice: 584000, avgPrice: 702512, dom: 30, volumeM: 729.9, closed: 1039, sf: 1039 },
      { month: 'Jul 26', medianPrice: 602000, avgPrice: 721773, dom: 30, volumeM: 687.8, closed: 953, sf: 953 },
      { month: 'Aug 26', medianPrice: 595000, avgPrice: 711784, dom: 35, volumeM: 681.2, closed: 957, sf: 957 },
    ],
  },

  boiseAvgPrice: {
    id: 'boiseAvgPrice',
    name: 'Boise Average Close Price',
    section: 'boise',
    value: 711784,
    unit: '$',
    date: '2026-08-31',
    periodChange: -9989, // Aug 26 vs Jul 26
    yoyChange: +31357, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [640168, 649734, 657891, 647380, 639375, 640369, 694584, 646957, 692745, 691934, 680717, 680427, 686954, 650477, 694372, 651200, 649292, 642614, 650927, 652640, 683068, 702512, 721773, 711784],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseSingleFamilyClosed: {
    id: 'boiseSingleFamilyClosed',
    name: 'Boise Single-Family Homes Closed',
    section: 'boise',
    value: 957,
    unit: ' homes',
    date: '2026-08-31',
    periodChange: +4, // Aug 26 vs Jul 26
    yoyChange: +125, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [711, 816, 662, 685, 499, 607, 679, 749, 846, 859, 902, 832, 787, 852, 694, 698, 531, 649, 814, 912, 1006, 1039, 953, 957],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseDom: {
    id: 'boiseDom',
    name: 'Boise Average Days on Market',
    section: 'boise',
    value: 35,
    unit: ' days',
    date: '2026-08-31',
    periodChange: +5, // Aug 26 vs Jul 26
    yoyChange: -4, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [37, 40, 39, 48, 50, 49, 43, 37, 32, 32, 36, 39, 41, 44, 46, 50, 52, 57, 52, 42, 31, 30, 30, 35],
    category: 'Boise Housing Market',
    local: true,
  },

  boiseDollarVolume: {
    id: 'boiseDollarVolume',
    name: 'Boise Total Dollar Volume',
    section: 'boise',
    value: 681177597,
    unit: '$',
    date: '2026-08-31',
    periodChange: -6671883, // Aug 26 vs Jul 26
    yoyChange: +115062284, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [455159468, 530182722, 435523575, 443455620, 319048354, 388704011, 471622643, 484570966, 586062222, 594370879, 614006496, 566115313, 540632780, 554206813, 481894022, 454537931, 344773938, 417056481, 529854861, 595208023, 687166330, 729909896, 687849480, 681177597],
    category: 'Boise Housing Market',
    local: true,
  },

  // ── Canyon County (Nampa, Caldwell, Middleton, Greenleaf, Notus, Parma, Wilder) ──

  canyonMedianPrice: {
    id: 'canyonMedianPrice',
    name: 'Canyon County Median Close Price',
    section: 'boise',
    value: 443400,
    unit: '$',
    date: '2026-08-31',
    periodChange: -1600, // Aug 26 vs Jul 26
    yoyChange: +8400, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [424990, 414900, 419990, 410990, 425000, 419000, 424990, 416900, 433990, 439990, 429900, 435000, 421688, 425000, 425000, 434990, 420000, 443990, 431990, 429900, 444900, 435900, 445000, 443400],
    category: 'Canyon County Market',
    local: true,
    monthlyHistory: [
      { month: 'Jul 25', medianPrice: 429900, avgPrice: 496665, dom: 39, volumeM: 226.5, closed: 456, sf: 456 },
      { month: 'Aug 25', medianPrice: 435000, avgPrice: 501129, dom: 46, volumeM: 220.0, closed: 439, sf: 439 },
      { month: 'Sep 25', medianPrice: 421688, avgPrice: 493207, dom: 55, volumeM: 208.1, closed: 422, sf: 422 },
      { month: 'Oct 25', medianPrice: 425000, avgPrice: 505025, dom: 47, volumeM: 231.8, closed: 459, sf: 459 },
      { month: 'Nov 25', medianPrice: 425000, avgPrice: 493282, dom: 55, volumeM: 168.2, closed: 341, sf: 341 },
      { month: 'Dec 25', medianPrice: 434990, avgPrice: 505466, dom: 60, volumeM: 218.4, closed: 432, sf: 432 },
      { month: 'Jan 26', medianPrice: 420000, avgPrice: 493529, dom: 63, volumeM: 135.2, closed: 274, sf: 274 },
      { month: 'Feb 26', medianPrice: 443990, avgPrice: 488027, dom: 61, volumeM: 178.1, closed: 365, sf: 365 },
      { month: 'Mar 26', medianPrice: 431990, avgPrice: 490995, dom: 60, volumeM: 221.9, closed: 452, sf: 452 },
      { month: 'Apr 26', medianPrice: 429900, avgPrice: 503184, dom: 48, volumeM: 260.1, closed: 517, sf: 517 },
      { month: 'May 26', medianPrice: 444900, avgPrice: 512976, dom: 43, volumeM: 268.3, closed: 523, sf: 523 },
      { month: 'Jun 26', medianPrice: 435900, avgPrice: 507774, dom: 41, volumeM: 295.0, closed: 581, sf: 581 },
      { month: 'Jul 26', medianPrice: 445000, avgPrice: 511739, dom: 39, volumeM: 255.4, closed: 499, sf: 499 },
      { month: 'Aug 26', medianPrice: 443400, avgPrice: 530332, dom: 40, volumeM: 249.8, closed: 471, sf: 471 },
    ],
  },

  canyonAvgPrice: {
    id: 'canyonAvgPrice',
    name: 'Canyon County Average Close Price',
    section: 'boise',
    value: 530332,
    unit: '$',
    date: '2026-08-31',
    periodChange: +18593, // Aug 26 vs Jul 26
    yoyChange: +29203, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [492067, 475849, 479069, 479892, 496535, 494347, 500316, 472864, 488763, 515523, 496665, 501129, 493207, 505025, 493282, 505466, 493529, 488027, 490995, 503184, 512976, 507774, 511739, 530332],
    category: 'Canyon County Market',
    local: true,
  },

  canyonSingleFamilyClosed: {
    id: 'canyonSingleFamilyClosed',
    name: 'Canyon County Single-Family Homes Closed',
    section: 'boise',
    value: 471,
    unit: ' homes',
    date: '2026-08-31',
    periodChange: -28, // Aug 26 vs Jul 26
    yoyChange: +32, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [432, 457, 394, 374, 268, 372, 392, 502, 467, 492, 456, 439, 422, 459, 341, 432, 274, 365, 452, 517, 523, 581, 499, 471],
    category: 'Canyon County Market',
    local: true,
  },

  canyonDom: {
    id: 'canyonDom',
    name: 'Canyon County Average Days on Market',
    section: 'boise',
    value: 40,
    unit: ' days',
    date: '2026-08-31',
    periodChange: +1, // Aug 26 vs Jul 26
    yoyChange: -6, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [50, 48, 53, 54, 57, 59, 51, 46, 41, 39, 39, 46, 55, 47, 55, 60, 63, 61, 60, 48, 43, 41, 39, 40],
    category: 'Canyon County Market',
    local: true,
  },

  canyonDollarVolume: {
    id: 'canyonDollarVolume',
    name: 'Canyon County Total Dollar Volume',
    section: 'boise',
    value: 249786277,
    unit: '$',
    date: '2026-08-31',
    periodChange: -5571578, // Aug 26 vs Jul 26
    yoyChange: +29790560, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [212572942, 217463187, 188753134, 179479789, 133071450, 183897208, 196123751, 237377574, 228252261, 253637205, 226479375, 219995717, 208133533, 231806574, 168209023, 218361382, 135226878, 178129863, 221929672, 260145874, 268286306, 295016944, 255357855, 249786277],
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
