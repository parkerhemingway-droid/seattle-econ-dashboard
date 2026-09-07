// Monthly median sale price by calendar year, single family detached, IMLS.
// This is the exact series behind the four Flourish median-price charts, kept
// here so the site can offer the data as a download without a round trip to
// Flourish — and so the numbers in those charts stay reviewable in the repo.
//
// Pulled from main.gold_mls.search_listings with
//   state = 'ID' AND property_type_aggregated = 'Single Family' AND sale_status = 'SOLD'
// and percentile_approx(current_price, 0.5) as the median estimator, the same
// one the monthly tables use.
//
// Window is 2023-2026. 2022 is clean and available if a fifth line is ever
// wanted, but 2021 is not: Jan-Jul 2021 is a broken feed (Ada records 9, 70,
// 504, 341, 105, 111 and 119 closings against a normal 500-900; Gem records 1,
// 4, 21, 15, 3, 3 and 5). Blank cells are months that have not closed yet.

const BOISE_MEDIAN_YOY = {
  years: ['2023', '2024', '2025', '2026'],
  months: ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December'],
  counties: {
    Ada: [
      [490000, 519900, 547000, 535000],
      [499900, 525000, 540000, 538000],
      [494900, 559000, 570000, 543000],
      [524900, 555000, 549900, 545000],
      [539500, 559990, 581990, 575990],
      [549990, 574652, 584900, 584000],
      [547500, 549000, 550000, 602000],
      [524958, 540995, 560000, 595000],
      [539000, 539999, 559900, null],
      [545000, 549990, 549900, null],
      [535000, 529900, 564880, null],
      [520000, 529900, 525000, null],
    ],
    Canyon: [
      [395445, 399990, 425000, 420000],
      [392990, 409900, 419000, 443990],
      [399000, 415000, 424990, 431990],
      [394900, 432981, 416900, 429900],
      [419900, 424900, 433990, 444900],
      [405000, 425000, 439990, 435900],
      [404990, 428580, 429900, 445000],
      [407990, 414990, 435000, 443400],
      [415000, 424990, 421688, null],
      [400000, 414900, 425000, null],
      [399990, 419990, 425000, null],
      [413500, 410990, 434990, null],
    ],
    Gem: [
      [378490, 389900, 414100, 433990],
      [435000, 540000, 450000, 470000],
      [430000, 409900, 397500, 490000],
      [457745, 524900, 475000, 507900],
      [449900, 420000, 424900, 500000],
      [439950, 410000, 459000, 465000],
      [524900, 453995, 460000, 525000],
      [545000, 393000, 475425, 542500],
      [442190, 420066, 494900, null],
      [539777, 410242, 482500, null],
      [430000, 430000, 455000, null],
      [449000, 389900, 420000, null],
    ],
    Valley: [
      [549900, 775000, 805518, 700000],
      [699000, 935000, 849000, 840000],
      [750000, 816000, 850000, 899000],
      [599900, 759900, 685000, 788000],
      [599390, 650000, 744000, 730000],
      [535000, 724900, 899000, 950000],
      [708000, 760000, 797500, 790000],
      [719000, 650000, 875000, 762500],
      [679900, 775000, 694900, null],
      [940000, 860000, 695000, null],
      [685000, 743600, 825000, null],
      [903000, 835000, 715000, null],
    ],
  },
};
