// Boise MLS Market Data — September 2024 to August 2026
// Data source: Databricks main.gold_mls.search_listings
// Filters: sale_status = 'SOLD', property_type_aggregated = 'Single Family',
//          county IN ('Ada County', 'Canyon County', 'Gem County', 'Valley County'),
//          grouped by close_date month.
// Prices use current_price: close_price is only 2-4% populated before Oct 2025,
// while current_price is 100% populated across all 24 months and matches
// close_price exactly on rows where both are present.
// Medians are percentile_approx(current_price, 0.5) — the same estimator the
// series has used since it was first published, kept so refreshed months stay
// comparable with the ones already on the page.
// Updated: September 7, 2026 (August 2026 close month)
//
// Absorption / months of supply need an inventory count, which the table does not
// store historically. It is reconstructed as listings whose date_enter_market is on
// or before month end and whose date_exit_market is after it (or null) — an
// active-plus-pending count, validated at 97-99% against today's actual on-market
// figures for Ada, Canyon and Gem. Valley is null before Feb 2026; see the note on
// valleyMedianPrice.
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
      { month: 'Jul 25', medianPrice: 550000, avgPrice: 680717, dom: 36, volumeM: 614.0, closed: 902, sf: 902, inventory: 3522, absorption: 25.6, monthsSupply: 3.9 },
      { month: 'Aug 25', medianPrice: 560000, avgPrice: 680427, dom: 39, volumeM: 566.1, closed: 832, sf: 832, inventory: 3506, absorption: 23.7, monthsSupply: 4.2 },
      { month: 'Sep 25', medianPrice: 559900, avgPrice: 686954, dom: 41, volumeM: 540.6, closed: 787, sf: 787, inventory: 3484, absorption: 22.6, monthsSupply: 4.4 },
      { month: 'Oct 25', medianPrice: 549900, avgPrice: 650477, dom: 44, volumeM: 554.2, closed: 852, sf: 852, inventory: 3296, absorption: 25.8, monthsSupply: 3.9 },
      { month: 'Nov 25', medianPrice: 564880, avgPrice: 694372, dom: 46, volumeM: 481.9, closed: 694, sf: 694, inventory: 3128, absorption: 22.2, monthsSupply: 4.5 },
      { month: 'Dec 25', medianPrice: 525000, avgPrice: 651200, dom: 50, volumeM: 454.5, closed: 698, sf: 698, inventory: 2684, absorption: 26.0, monthsSupply: 3.8 },
      { month: 'Jan 26', medianPrice: 535000, avgPrice: 649292, dom: 52, volumeM: 344.8, closed: 531, sf: 531, inventory: 2755, absorption: 19.3, monthsSupply: 5.2 },
      { month: 'Feb 26', medianPrice: 538000, avgPrice: 642614, dom: 57, volumeM: 417.1, closed: 649, sf: 649, inventory: 2773, absorption: 23.4, monthsSupply: 4.3 },
      { month: 'Mar 26', medianPrice: 543000, avgPrice: 650927, dom: 52, volumeM: 529.9, closed: 814, sf: 814, inventory: 2994, absorption: 27.2, monthsSupply: 3.7 },
      { month: 'Apr 26', medianPrice: 545000, avgPrice: 652640, dom: 42, volumeM: 595.2, closed: 912, sf: 912, inventory: 3284, absorption: 27.8, monthsSupply: 3.6 },
      { month: 'May 26', medianPrice: 575990, avgPrice: 683068, dom: 31, volumeM: 687.2, closed: 1006, sf: 1006, inventory: 3421, absorption: 29.4, monthsSupply: 3.4 },
      { month: 'Jun 26', medianPrice: 584000, avgPrice: 702512, dom: 30, volumeM: 729.9, closed: 1039, sf: 1039, inventory: 3489, absorption: 29.8, monthsSupply: 3.4 },
      { month: 'Jul 26', medianPrice: 602000, avgPrice: 721773, dom: 30, volumeM: 687.8, closed: 953, sf: 953, inventory: 3477, absorption: 27.4, monthsSupply: 3.6 },
      { month: 'Aug 26', medianPrice: 595000, avgPrice: 711784, dom: 35, volumeM: 681.2, closed: 957, sf: 957, inventory: 3318, absorption: 28.8, monthsSupply: 3.5 },
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
      { month: 'Jul 25', medianPrice: 429900, avgPrice: 496665, dom: 39, volumeM: 226.5, closed: 456, sf: 456, inventory: 1979, absorption: 23.0, monthsSupply: 4.3 },
      { month: 'Aug 25', medianPrice: 435000, avgPrice: 501129, dom: 46, volumeM: 220.0, closed: 439, sf: 439, inventory: 1989, absorption: 22.1, monthsSupply: 4.5 },
      { month: 'Sep 25', medianPrice: 421688, avgPrice: 493207, dom: 55, volumeM: 208.1, closed: 422, sf: 422, inventory: 1935, absorption: 21.8, monthsSupply: 4.6 },
      { month: 'Oct 25', medianPrice: 425000, avgPrice: 505025, dom: 47, volumeM: 231.8, closed: 459, sf: 459, inventory: 1803, absorption: 25.5, monthsSupply: 3.9 },
      { month: 'Nov 25', medianPrice: 425000, avgPrice: 493282, dom: 55, volumeM: 168.2, closed: 341, sf: 341, inventory: 1766, absorption: 19.3, monthsSupply: 5.2 },
      { month: 'Dec 25', medianPrice: 434990, avgPrice: 505466, dom: 60, volumeM: 218.4, closed: 432, sf: 432, inventory: 1508, absorption: 28.6, monthsSupply: 3.5 },
      { month: 'Jan 26', medianPrice: 420000, avgPrice: 493529, dom: 63, volumeM: 135.2, closed: 274, sf: 274, inventory: 1631, absorption: 16.8, monthsSupply: 6.0 },
      { month: 'Feb 26', medianPrice: 443990, avgPrice: 488027, dom: 61, volumeM: 178.1, closed: 365, sf: 365, inventory: 1703, absorption: 21.4, monthsSupply: 4.7 },
      { month: 'Mar 26', medianPrice: 431990, avgPrice: 490995, dom: 60, volumeM: 221.9, closed: 452, sf: 452, inventory: 1820, absorption: 24.8, monthsSupply: 4.0 },
      { month: 'Apr 26', medianPrice: 429900, avgPrice: 503184, dom: 48, volumeM: 260.1, closed: 517, sf: 517, inventory: 1914, absorption: 27.0, monthsSupply: 3.7 },
      { month: 'May 26', medianPrice: 444900, avgPrice: 512976, dom: 43, volumeM: 268.3, closed: 523, sf: 523, inventory: 2004, absorption: 26.1, monthsSupply: 3.8 },
      { month: 'Jun 26', medianPrice: 435900, avgPrice: 507774, dom: 41, volumeM: 295.0, closed: 581, sf: 581, inventory: 1975, absorption: 29.4, monthsSupply: 3.4 },
      { month: 'Jul 26', medianPrice: 445000, avgPrice: 511739, dom: 39, volumeM: 255.4, closed: 499, sf: 499, inventory: 2034, absorption: 24.5, monthsSupply: 4.1 },
      { month: 'Aug 26', medianPrice: 443400, avgPrice: 530332, dom: 40, volumeM: 249.8, closed: 471, sf: 471, inventory: 1937, absorption: 24.3, monthsSupply: 4.1 },
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
  // ── Gem County (Emmett, Sweet, Letha, Ola, Horseshoe Bend) ──
  // Part of the Boise MSA, but a thin market: ~29 closings a month, and
  // 95% of them are in Emmett (83617). Single-month moves are noisy.

  gemMedianPrice: {
    id: 'gemMedianPrice',
    name: 'Gem County Median Close Price',
    section: 'boise',
    value: 542500,
    unit: '$',
    date: '2026-08-31',
    periodChange: +17500, // Aug 26 vs Jul 26
    yoyChange: +67075, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [420066, 410242, 430000, 389900, 414100, 450000, 397500, 475000, 424900, 459000, 460000, 475425, 494900, 482500, 455000, 420000, 433990, 470000, 490000, 507900, 500000, 465000, 525000, 542500],
    category: 'Gem County Market',
    local: true,
    monthlyHistory: [
      { month: 'Jul 25', medianPrice: 460000, avgPrice: 469523, dom: 44, volumeM: 15.5, closed: 33, sf: 33, inventory: 197, absorption: 16.8, monthsSupply: 6.0 },
      { month: 'Aug 25', medianPrice: 475425, avgPrice: 610832, dom: 41, volumeM: 23.2, closed: 38, sf: 38, inventory: 175, absorption: 21.7, monthsSupply: 4.6 },
      { month: 'Sep 25', medianPrice: 494900, avgPrice: 567235, dom: 84, volumeM: 18.7, closed: 33, sf: 33, inventory: 173, absorption: 19.1, monthsSupply: 5.2 },
      { month: 'Oct 25', medianPrice: 482500, avgPrice: 502032, dom: 105, volumeM: 15.1, closed: 30, sf: 30, inventory: 158, absorption: 19.0, monthsSupply: 5.3 },
      { month: 'Nov 25', medianPrice: 455000, avgPrice: 629592, dom: 61, volumeM: 13.2, closed: 21, sf: 21, inventory: 149, absorption: 14.1, monthsSupply: 7.1 },
      { month: 'Dec 25', medianPrice: 420000, avgPrice: 506861, dom: 67, volumeM: 11.2, closed: 22, sf: 22, inventory: 143, absorption: 15.4, monthsSupply: 6.5 },
      { month: 'Jan 26', medianPrice: 433990, avgPrice: 500002, dom: 63, volumeM: 12.5, closed: 25, sf: 25, inventory: 131, absorption: 19.1, monthsSupply: 5.2 },
      { month: 'Feb 26', medianPrice: 470000, avgPrice: 526323, dom: 61, volumeM: 14.2, closed: 27, sf: 27, inventory: 134, absorption: 20.1, monthsSupply: 5.0 },
      { month: 'Mar 26', medianPrice: 490000, avgPrice: 588233, dom: 57, volumeM: 15.3, closed: 26, sf: 26, inventory: 140, absorption: 18.6, monthsSupply: 5.4 },
      { month: 'Apr 26', medianPrice: 507900, avgPrice: 577594, dom: 37, volumeM: 17.3, closed: 30, sf: 30, inventory: 155, absorption: 19.4, monthsSupply: 5.2 },
      { month: 'May 26', medianPrice: 500000, avgPrice: 533025, dom: 40, volumeM: 19.7, closed: 37, sf: 37, inventory: 170, absorption: 21.8, monthsSupply: 4.6 },
      { month: 'Jun 26', medianPrice: 465000, avgPrice: 621131, dom: 57, volumeM: 22.4, closed: 36, sf: 36, inventory: 178, absorption: 20.2, monthsSupply: 4.9 },
      { month: 'Jul 26', medianPrice: 525000, avgPrice: 585217, dom: 49, volumeM: 21.7, closed: 37, sf: 37, inventory: 170, absorption: 21.8, monthsSupply: 4.6 },
      { month: 'Aug 26', medianPrice: 542500, avgPrice: 623116, dom: 44, volumeM: 21.2, closed: 34, sf: 34, inventory: 163, absorption: 20.9, monthsSupply: 4.8 },
    ],
  },

  gemAvgPrice: {
    id: 'gemAvgPrice',
    name: 'Gem County Average Close Price',
    section: 'boise',
    value: 623116,
    unit: '$',
    date: '2026-08-31',
    periodChange: +37899, // Aug 26 vs Jul 26
    yoyChange: +12284, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [475759, 490363, 543082, 479858, 469990, 550819, 579694, 516504, 510057, 551510, 469523, 610832, 567235, 502032, 629592, 506861, 500002, 526323, 588233, 577594, 533025, 621131, 585217, 623116],
    category: 'Gem County Market',
    local: true,
  },

  gemSingleFamilyClosed: {
    id: 'gemSingleFamilyClosed',
    name: 'Gem County Single-Family Homes Closed',
    section: 'boise',
    value: 34,
    unit: ' homes',
    date: '2026-08-31',
    periodChange: -3, // Aug 26 vs Jul 26
    yoyChange: -4, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [38, 30, 24, 25, 17, 16, 26, 25, 36, 32, 33, 38, 33, 30, 21, 22, 25, 27, 26, 30, 37, 36, 37, 34],
    category: 'Gem County Market',
    local: true,
  },

  gemDom: {
    id: 'gemDom',
    name: 'Gem County Average Days on Market',
    section: 'boise',
    value: 44,
    unit: ' days',
    date: '2026-08-31',
    periodChange: -5, // Aug 26 vs Jul 26
    yoyChange: +3, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [38, 30, 60, 48, 59, 71, 49, 45, 49, 52, 44, 41, 84, 105, 61, 67, 63, 61, 57, 37, 40, 57, 49, 44],
    category: 'Gem County Market',
    local: true,
  },

  gemDollarVolume: {
    id: 'gemDollarVolume',
    name: 'Gem County Total Dollar Volume',
    section: 'boise',
    value: 21185945,
    unit: '$',
    date: '2026-08-31',
    periodChange: -467093, // Aug 26 vs Jul 26
    yoyChange: -2025672, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [18078828, 14710898, 13033962, 11996457, 7989830, 8813097, 15072037, 12912608, 18362066, 17648319, 15494250, 23211617, 18718762, 15060952, 13221425, 11150938, 12500060, 14210732, 15294050, 17327807, 19721940, 22360704, 21653038, 21185945],
    category: 'Gem County Market',
    local: true,
  },

  // ── Valley County (McCall, Donnelly, Cascade, Yellow Pine) ──
  // NOT part of the Boise MSA — it is the separate McCall micropolitan area,
  // covered here because it trades on the same MLS. A resort market: ~36
  // closings a month and a handful of Payette Lake luxury sales can move the
  // average by $400K, so the median is the more reliable read.

  valleyMedianPrice: {
    id: 'valleyMedianPrice',
    name: 'Valley County Median Close Price',
    section: 'boise',
    value: 762500,
    unit: '$',
    date: '2026-08-31',
    periodChange: -27500, // Aug 26 vs Jul 26
    yoyChange: -112500, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [775000, 860000, 743600, 835000, 805518, 849000, 850000, 685000, 744000, 899000, 797500, 875000, 694900, 695000, 825000, 715000, 700000, 840000, 899000, 788000, 730000, 950000, 790000, 762500],
    category: 'Valley County Market',
    local: true,
    monthlyHistory: [
      { month: 'Jul 25', medianPrice: 797500, avgPrice: 954261, dom: 71, volumeM: 39.1, closed: 41, sf: 41, inventory: 1614, absorption: 2.5, monthsSupply: 39.4 },
      { month: 'Aug 25', medianPrice: 875000, avgPrice: 1287893, dom: 76, volumeM: 78.6, closed: 61, sf: 61, inventory: 1638, absorption: 3.7, monthsSupply: 26.9 },
      { month: 'Sep 25', medianPrice: 694900, avgPrice: 797145, dom: 95, volumeM: 59.0, closed: 74, sf: 74, inventory: 1597, absorption: 4.6, monthsSupply: 21.6 },
      { month: 'Oct 25', medianPrice: 695000, avgPrice: 1003408, dom: 130, volumeM: 62.2, closed: 62, sf: 62, inventory: 1014, absorption: 6.1, monthsSupply: 16.4 },
      { month: 'Nov 25', medianPrice: 825000, avgPrice: 826450, dom: 135, volumeM: 22.3, closed: 27, sf: 27, inventory: 959, absorption: 2.8, monthsSupply: 35.5 },
      { month: 'Dec 25', medianPrice: 715000, avgPrice: 1133823, dom: 129, volumeM: 44.2, closed: 39, sf: 39, inventory: 899, absorption: 4.3, monthsSupply: 23.1 },
      { month: 'Jan 26', medianPrice: 700000, avgPrice: 873838, dom: 157, volumeM: 28.0, closed: 32, sf: 32, inventory: 351, absorption: 9.1, monthsSupply: 11.0 },
      { month: 'Feb 26', medianPrice: 840000, avgPrice: 1207947, dom: 135, volumeM: 23.0, closed: 19, sf: 19, inventory: 385, absorption: 4.9, monthsSupply: 20.3 },
      { month: 'Mar 26', medianPrice: 899000, avgPrice: 1122827, dom: 58, volumeM: 16.8, closed: 15, sf: 15, inventory: 410, absorption: 3.7, monthsSupply: 27.3 },
      { month: 'Apr 26', medianPrice: 788000, avgPrice: 998661, dom: 66, volumeM: 18.0, closed: 18, sf: 18, inventory: 456, absorption: 3.9, monthsSupply: 25.3 },
      { month: 'May 26', medianPrice: 730000, avgPrice: 989667, dom: 45, volumeM: 19.8, closed: 20, sf: 20, inventory: 555, absorption: 3.6, monthsSupply: 27.8 },
      { month: 'Jun 26', medianPrice: 950000, avgPrice: 1390300, dom: 42, volumeM: 50.1, closed: 36, sf: 36, inventory: 587, absorption: 6.1, monthsSupply: 16.3 },
      { month: 'Jul 26', medianPrice: 790000, avgPrice: 934510, dom: 56, volumeM: 32.7, closed: 35, sf: 35, inventory: 607, absorption: 5.8, monthsSupply: 17.3 },
      { month: 'Aug 26', medianPrice: 762500, avgPrice: 1237165, dom: 59, volumeM: 45.8, closed: 37, sf: 37, inventory: 579, absorption: 6.4, monthsSupply: 15.6 },
    ],
  },

  valleyAvgPrice: {
    id: 'valleyAvgPrice',
    name: 'Valley County Average Close Price',
    section: 'boise',
    value: 1237165,
    unit: '$',
    date: '2026-08-31',
    periodChange: +302655, // Aug 26 vs Jul 26
    yoyChange: -50728, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [917306, 1175758, 801266, 1236266, 1269901, 1761054, 974759, 968479, 986706, 1342153, 954261, 1287893, 797145, 1003408, 826450, 1133823, 873838, 1207947, 1122827, 998661, 989667, 1390300, 934510, 1237165],
    category: 'Valley County Market',
    local: true,
  },

  valleySingleFamilyClosed: {
    id: 'valleySingleFamilyClosed',
    name: 'Valley County Single-Family Homes Closed',
    section: 'boise',
    value: 37,
    unit: ' homes',
    date: '2026-08-31',
    periodChange: +2, // Aug 26 vs Jul 26
    yoyChange: -24, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [49, 43, 37, 38, 25, 16, 29, 25, 32, 38, 41, 61, 74, 62, 27, 39, 32, 19, 15, 18, 20, 36, 35, 37],
    category: 'Valley County Market',
    local: true,
  },

  valleyDom: {
    id: 'valleyDom',
    name: 'Valley County Average Days on Market',
    section: 'boise',
    value: 59,
    unit: ' days',
    date: '2026-08-31',
    periodChange: +3, // Aug 26 vs Jul 26
    yoyChange: -17, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [81, 98, 117, 112, 115, 134, 150, 147, 71, 73, 71, 76, 95, 130, 135, 129, 157, 135, 58, 66, 45, 42, 56, 59],
    category: 'Valley County Market',
    local: true,
  },

  valleyDollarVolume: {
    id: 'valleyDollarVolume',
    name: 'Valley County Total Dollar Volume',
    section: 'boise',
    value: 45775102,
    unit: '$',
    date: '2026-08-31',
    periodChange: +13067266, // Aug 26 vs Jul 26
    yoyChange: -32786396, // Aug 26 vs Aug 25
    release: 'Monthly — Intermountain MLS',
    sparkline: [44947988, 50557580, 29646839, 46978105, 31747518, 28176862, 28268001, 24211975, 31574600, 51001800, 39124700, 78561498, 58988706, 62211300, 22314150, 44219100, 27962800, 22951000, 16842400, 17975900, 19793339, 50050800, 32707836, 45775102],
    category: 'Valley County Market',
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
