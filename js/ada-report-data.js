// AUTO-GENERATED from data_science.compass_db.ada_canyon_county_report_csv
// (August 2026, generated upstream 2026-09-03; written out 2026-09-07).
// Regenerate rather than hand-edit.
//
// SCOPE: Ada + Canyon County. Section 2 carries 24 areas, including the
// seven Canyon areas (1200-1500) the earlier Ada-only export lacked.
//
// PERIOD LABELS: `period` / `periodShort` / `periodPrior` drive every month
// label in js/ada-market-report.js. A monthly refresh should not need to
// touch any string in that file. The keys `priceClassJul` / `priceClassYtd`
// keep their original names for compatibility - "Jul" there means "the
// report month", whatever `periodShort` says.
//
// ncTiers / ncTotals / ncMonthly are NOT from this notebook - they come from
// the earlier dim_listing x dim_property pull and remain ADA ONLY, and were
// not refreshed with this report. `ncScope` and `ncPeriod` record that so the
// UI can label them.
const ADA_REPORT = {
  "period": "August 2026",
  "periodShort": "Aug-26",
  "periodPrior": "Aug-25",
  "periodTtm": "Sep 1 2025 – Aug 31 2026",
  "periodYtd": "Jan 1 – Aug 31 2026",
  "county": "Ada & Canyon County, Idaho",
  "generated": "2026-09-07",
  "summary": {
    "total": {
      "header": [
        "Aug-26",
        "Year to Date 26",
        "Aug-25",
        "Year to Date 25",
        "Previous 12 Months"
      ],
      "rows": [
        {
          "label": "Total Single-Family Active Residential Listings",
          "vals": [
            3067,
            null,
            null,
            null,
            null
          ],
          "pct": null
        },
        {
          "label": "Total Single-Family Pending Residential Listings",
          "vals": [
            1986,
            null,
            null,
            null,
            null
          ],
          "pct": null
        },
        {
          "label": "Total Single-Family Homes Sold",
          "vals": [
            1416,
            10531,
            1271,
            9361,
            15215
          ],
          "pct": [
            11.4,
            12.5
          ]
        },
        {
          "label": "Median Price",
          "vals": [
            542990,
            515000,
            512900,
            500000,
            510000
          ],
          "pct": [
            5.9,
            3
          ]
        },
        {
          "label": "Average Price",
          "vals": [
            652733.1751412429,
            620140.7301300921,
            616547.9307631786,
            607444.0548018374,
            616866.5917186986
          ],
          "pct": [
            5.9,
            2.1
          ]
        },
        {
          "label": "Days on Market",
          "vals": [
            36.61864406779661,
            42.178805431582944,
            41.390243902439025,
            41.48413631022326,
            44.07801511666119
          ],
          "pct": null
        },
        {
          "label": "Total Single-Family Dollar Volume",
          "vals": [
            924270176,
            6530702029,
            783632420,
            5686283797,
            9385625193
          ],
          "pct": [
            17.9,
            14.9
          ]
        }
      ]
    },
    "existing": {
      "header": [
        "Aug-26",
        "Year to Date 26",
        "Aug-25",
        "Year to Date 25",
        "Previous 12 Months"
      ],
      "rows": [
        {
          "label": "Existing Active Residential Listings",
          "vals": [
            1559,
            null,
            null,
            null,
            null
          ],
          "pct": null
        },
        {
          "label": "Existing Pending Residential Listings",
          "vals": [
            907,
            null,
            null,
            null,
            null
          ],
          "pct": null
        },
        {
          "label": "Existing Homes Sold",
          "vals": [
            937,
            6651,
            914,
            7655,
            9678
          ],
          "pct": [
            2.5,
            -13.1
          ]
        },
        {
          "label": "Median Price",
          "vals": [
            535000,
            515000,
            509900,
            499999,
            510000
          ],
          "pct": [
            4.9,
            3
          ]
        },
        {
          "label": "Average Price",
          "vals": [
            641956.1931696906,
            620963.116072771,
            625007.0897155361,
            608229.085956891,
            617362.4032858028
          ],
          "pct": [
            2.7,
            2.1
          ]
        },
        {
          "label": "Days on Market",
          "vals": [
            28.022411953041622,
            29.423545331529095,
            38.76258205689278,
            41.834225996080995,
            33.72235999173383
          ],
          "pct": null
        },
        {
          "label": "Existing Dollar Volume",
          "vals": [
            601512953,
            4130025685,
            571256480,
            4655993653,
            5974833339
          ],
          "pct": [
            5.3,
            -11.3
          ]
        }
      ]
    },
    "new": {
      "header": [
        "Aug-26",
        "Year to Date 26",
        "Aug-25",
        "Year to Date 25",
        "Previous 12 Months"
      ],
      "rows": [
        {
          "label": "Newly Constructed Active Residential Listings",
          "vals": [
            1508,
            null,
            null,
            null,
            null
          ],
          "pct": null
        },
        {
          "label": "Newly Constructed Pending Residential Listings",
          "vals": [
            1079,
            null,
            null,
            null,
            null
          ],
          "pct": null
        },
        {
          "label": "Newly Constructed Homes Sold",
          "vals": [
            479,
            3880,
            357,
            1706,
            5537
          ],
          "pct": [
            34.2,
            127.4
          ]
        },
        {
          "label": "Median Price",
          "vals": [
            547000,
            517312,
            515990,
            509990,
            514900
          ],
          "pct": [
            6,
            1.4
          ]
        },
        {
          "label": "Average Price",
          "vals": [
            673814.6617954071,
            618731.0164948454,
            594890.5882352941,
            603921.5381008206,
            615999.9736319307
          ],
          "pct": [
            13.3,
            2.5
          ]
        },
        {
          "label": "Days on Market",
          "vals": [
            53.43423799582463,
            64.04355670103092,
            48.11764705882353,
            39.91324736225088,
            62.17843597616037
          ],
          "pct": null
        },
        {
          "label": "Newly Constructed Dollar Volume",
          "vals": [
            322757223,
            2400676344,
            212375940,
            1030290144,
            3410791854
          ],
          "pct": [
            52,
            133
          ]
        }
      ]
    }
  },
  "areas": [
    {
      "name": "Boise North",
      "code": "0100",
      "total": {
        "sold": 31,
        "pct": 2.1877205363443895,
        "avg": 1064797,
        "med": 899999
      },
      "new": {
        "sold": 0,
        "pct": 0,
        "avg": null,
        "med": null
      },
      "existing": {
        "sold": 30,
        "pct": 2.117148906139732,
        "avg": 1067929,
        "med": 920000
      }
    },
    {
      "name": "Boise NE",
      "code": "0200",
      "total": {
        "sold": 26,
        "pct": 1.834862385321101,
        "avg": 979510,
        "med": 859000
      },
      "new": {
        "sold": 3,
        "pct": 0.2117148906139732,
        "avg": 2071507,
        "med": 2328220
      },
      "existing": {
        "sold": 24,
        "pct": 1.6937191249117856,
        "avg": 860492,
        "med": 831000
      }
    },
    {
      "name": "Boise SE",
      "code": "0300",
      "total": {
        "sold": 35,
        "pct": 2.4700070571630204,
        "avg": 751406,
        "med": 750000
      },
      "new": {
        "sold": 1,
        "pct": 0.07057163020465773,
        "avg": 1406112,
        "med": 849900
      },
      "existing": {
        "sold": 34,
        "pct": 2.399435426958363,
        "avg": 727158,
        "med": 740000
      }
    },
    {
      "name": "Boise Bench",
      "code": "0400",
      "total": {
        "sold": 38,
        "pct": 2.681721947776994,
        "avg": 528630,
        "med": 545000
      },
      "new": {
        "sold": 1,
        "pct": 0.07057163020465773,
        "avg": 698280,
        "med": 559990
      },
      "existing": {
        "sold": 37,
        "pct": 2.611150317572336,
        "avg": 522212,
        "med": 541000
      }
    },
    {
      "name": "Boise South",
      "code": "0500",
      "total": {
        "sold": 33,
        "pct": 2.328863796753705,
        "avg": 563587,
        "med": 531885
      },
      "new": {
        "sold": 1,
        "pct": 0.07057163020465773,
        "avg": 522288,
        "med": 531885
      },
      "existing": {
        "sold": 32,
        "pct": 2.2582921665490474,
        "avg": 565357,
        "med": 529900
      }
    },
    {
      "name": "Boise SW-Meridian",
      "code": "0550",
      "total": {
        "sold": 36,
        "pct": 2.5405786873676783,
        "avg": 577220,
        "med": 565000
      },
      "new": {
        "sold": 4,
        "pct": 0.2822865208186309,
        "avg": 610606,
        "med": 599900
      },
      "existing": {
        "sold": 33,
        "pct": 2.328863796753705,
        "avg": 573564,
        "med": 559700
      }
    },
    {
      "name": "Boise West",
      "code": "0600",
      "total": {
        "sold": 36,
        "pct": 2.5405786873676783,
        "avg": 564296,
        "med": 515000
      },
      "new": {
        "sold": 2,
        "pct": 0.14114326040931546,
        "avg": 600375,
        "med": 531885
      },
      "existing": {
        "sold": 34,
        "pct": 2.399435426958363,
        "avg": 562502,
        "med": 515000
      }
    },
    {
      "name": "Boise W-Garden City",
      "code": "0650",
      "total": {
        "sold": 42,
        "pct": 2.9640084685956247,
        "avg": 570219,
        "med": 545000
      },
      "new": {
        "sold": 1,
        "pct": 0.07057163020465773,
        "avg": 877263,
        "med": 1099900
      },
      "existing": {
        "sold": 42,
        "pct": 2.9640084685956247,
        "avg": 563976,
        "med": 526000
      }
    },
    {
      "name": "Garden City",
      "code": "0700",
      "total": {
        "sold": 27,
        "pct": 1.9054340155257588,
        "avg": 817953,
        "med": 699900
      },
      "new": {
        "sold": 6,
        "pct": 0.4234297812279464,
        "avg": 1236276,
        "med": 1171747
      },
      "existing": {
        "sold": 21,
        "pct": 1.4820042342978124,
        "avg": 701753,
        "med": 579900
      }
    },
    {
      "name": "Boise NW",
      "code": "0800",
      "total": {
        "sold": 27,
        "pct": 1.9054340155257588,
        "avg": 790476,
        "med": 680000
      },
      "new": {
        "sold": 4,
        "pct": 0.2822865208186309,
        "avg": 1166791,
        "med": 1171747
      },
      "existing": {
        "sold": 22,
        "pct": 1.55257586450247,
        "avg": 715453,
        "med": 620000
      }
    },
    {
      "name": "Eagle",
      "code": "0900",
      "total": {
        "sold": 116,
        "pct": 8.186309103740296,
        "avg": 1140903,
        "med": 965000
      },
      "new": {
        "sold": 38,
        "pct": 2.681721947776994,
        "avg": 1248640,
        "med": 1099000
      },
      "existing": {
        "sold": 78,
        "pct": 5.504587155963303,
        "avg": 1088416,
        "med": 860000
      }
    },
    {
      "name": "Star",
      "code": "0950",
      "total": {
        "sold": 96,
        "pct": 6.774876499647142,
        "avg": 686584,
        "med": 609000
      },
      "new": {
        "sold": 54,
        "pct": 3.8108680310515175,
        "avg": 680514,
        "med": 624000
      },
      "existing": {
        "sold": 42,
        "pct": 2.9640084685956247,
        "avg": 694389,
        "med": 579900
      }
    },
    {
      "name": "Meridian SE",
      "code": "1000",
      "total": {
        "sold": 50,
        "pct": 3.5285815102328866,
        "avg": 639925,
        "med": 590000
      },
      "new": {
        "sold": 18,
        "pct": 1.2702893436838392,
        "avg": 656511,
        "med": 620000
      },
      "existing": {
        "sold": 32,
        "pct": 2.2582921665490474,
        "avg": 630447,
        "med": 574000
      }
    },
    {
      "name": "Meridian SW",
      "code": "1010",
      "total": {
        "sold": 49,
        "pct": 3.4580098800282286,
        "avg": 639925,
        "med": 590000
      },
      "new": {
        "sold": 18,
        "pct": 1.2702893436838392,
        "avg": 656511,
        "med": 620000
      },
      "existing": {
        "sold": 31,
        "pct": 2.1877205363443895,
        "avg": 630447,
        "med": 574000
      }
    },
    {
      "name": "Meridian NE",
      "code": "1020",
      "total": {
        "sold": 101,
        "pct": 7.127734650670431,
        "avg": 624365,
        "med": 577000
      },
      "new": {
        "sold": 36,
        "pct": 2.5405786873676783,
        "avg": 636156,
        "med": 599900
      },
      "existing": {
        "sold": 65,
        "pct": 4.587155963302752,
        "avg": 617829,
        "med": 565000
      }
    },
    {
      "name": "Meridian NW",
      "code": "1030",
      "total": {
        "sold": 104,
        "pct": 7.339449541284404,
        "avg": 626323,
        "med": 581000
      },
      "new": {
        "sold": 38,
        "pct": 2.681721947776994,
        "avg": 636283,
        "med": 599900
      },
      "existing": {
        "sold": 66,
        "pct": 4.65772759350741,
        "avg": 620554,
        "med": 577000
      }
    },
    {
      "name": "Kuna",
      "code": "1100",
      "total": {
        "sold": 107,
        "pct": 7.551164431898377,
        "avg": 556138,
        "med": 535000
      },
      "new": {
        "sold": 63,
        "pct": 4.446012702893436,
        "avg": 563706,
        "med": 544990
      },
      "existing": {
        "sold": 44,
        "pct": 3.10515172900494,
        "avg": 545264,
        "med": 527500
      }
    },
    {
      "name": "Nampa SW",
      "code": "1200",
      "total": {
        "sold": 90,
        "pct": 6.351446718419195,
        "avg": 517840,
        "med": 445000
      },
      "new": {
        "sold": 27,
        "pct": 1.9054340155257588,
        "avg": 571412,
        "med": 461990
      },
      "existing": {
        "sold": 63,
        "pct": 4.446012702893436,
        "avg": 494881,
        "med": 425000
      }
    },
    {
      "name": "Nampa NE",
      "code": "1210",
      "total": {
        "sold": 85,
        "pct": 5.998588567395907,
        "avg": 504914,
        "med": 443990
      },
      "new": {
        "sold": 37,
        "pct": 2.611150317572336,
        "avg": 466516,
        "med": 459990
      },
      "existing": {
        "sold": 48,
        "pct": 3.387438249823571,
        "avg": 534513,
        "med": 435000
      }
    },
    {
      "name": "Nampa South",
      "code": "1220",
      "total": {
        "sold": 71,
        "pct": 5.010585744530698,
        "avg": 481920,
        "med": 412990
      },
      "new": {
        "sold": 25,
        "pct": 1.7642907551164433,
        "avg": 656964,
        "med": 449990
      },
      "existing": {
        "sold": 46,
        "pct": 3.2462949894142556,
        "avg": 386788,
        "med": 370000
      }
    },
    {
      "name": "Caldwell South",
      "code": "1300",
      "total": {
        "sold": 65,
        "pct": 4.587155963302752,
        "avg": 416918,
        "med": 390000
      },
      "new": {
        "sold": 27,
        "pct": 1.9054340155257588,
        "avg": 445130,
        "med": 419990
      },
      "existing": {
        "sold": 38,
        "pct": 2.681721947776994,
        "avg": 396874,
        "med": 379000
      }
    },
    {
      "name": "Caldwell North",
      "code": "1310",
      "total": {
        "sold": 78,
        "pct": 5.504587155963303,
        "avg": 610437,
        "med": 517880
      },
      "new": {
        "sold": 32,
        "pct": 2.2582921665490474,
        "avg": 574243,
        "med": 509900
      },
      "existing": {
        "sold": 46,
        "pct": 3.2462949894142556,
        "avg": 635616,
        "med": 525000
      }
    },
    {
      "name": "Middleton",
      "code": "1400",
      "total": {
        "sold": 59,
        "pct": 4.1637261820748055,
        "avg": 635770,
        "med": 512723
      },
      "new": {
        "sold": 38,
        "pct": 2.681721947776994,
        "avg": 672506,
        "med": 512723
      },
      "existing": {
        "sold": 21,
        "pct": 1.4820042342978124,
        "avg": 569294,
        "med": 510000
      }
    },
    {
      "name": "Canyon County Rural",
      "code": "1500",
      "total": {
        "sold": 15,
        "pct": 1.058574453069866,
        "avg": 493847,
        "med": 454900
      },
      "new": {
        "sold": 5,
        "pct": 0.35285815102328866,
        "avg": 416580,
        "med": 400000
      },
      "existing": {
        "sold": 10,
        "pct": 0.7057163020465773,
        "avg": 532480,
        "med": 475000
      }
    }
  ],
  "areaTotals": {
    "name": "Totals",
    "code": "ALL",
    "total": {
      "sold": 1417,
      "pct": 100,
      "avg": 657663,
      "med": null
    },
    "new": {
      "sold": 479,
      "pct": 100,
      "avg": 785257,
      "med": null
    },
    "existing": {
      "sold": 939,
      "pct": 100,
      "avg": 634924,
      "med": null
    }
  },
  "priceClassJul": [
    {
      "range": "$69,999 and under",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$70,000-$89,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$90,000-$99,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$100,000-$119,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$120,000-$159,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$160,000-$199,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$200,000-$249,999",
      "new": 0,
      "newPct": 0,
      "ex": 4,
      "exPct": 0.4
    },
    {
      "range": "$250,000-$299,999",
      "new": 0,
      "newPct": 0,
      "ex": 10,
      "exPct": 1.1
    },
    {
      "range": "$300,000-$399,999",
      "new": 27,
      "newPct": 5.6,
      "ex": 148,
      "exPct": 15.8
    },
    {
      "range": "$400,000-$499,999",
      "new": 162,
      "newPct": 33.8,
      "ex": 231,
      "exPct": 24.7
    },
    {
      "range": "$500,000-$599,999",
      "new": 102,
      "newPct": 21.3,
      "ex": 185,
      "exPct": 19.7
    },
    {
      "range": "$600,000-$699,999",
      "new": 55,
      "newPct": 11.5,
      "ex": 93,
      "exPct": 9.9
    },
    {
      "range": "$700,000-$799,999",
      "new": 38,
      "newPct": 7.9,
      "ex": 77,
      "exPct": 8.2
    },
    {
      "range": "$800,000-$899,999",
      "new": 23,
      "newPct": 4.8,
      "ex": 59,
      "exPct": 6.3
    },
    {
      "range": "$900,000-$999,999",
      "new": 13,
      "newPct": 2.7,
      "ex": 33,
      "exPct": 3.5
    },
    {
      "range": "$1,000,000-$1,999,999",
      "new": 52,
      "newPct": 10.9,
      "ex": 85,
      "exPct": 9.1
    },
    {
      "range": "$2,000,000-$2,999,999",
      "new": 5,
      "newPct": 1,
      "ex": 11,
      "exPct": 1.2
    },
    {
      "range": "$3,000,000-$3,999,999",
      "new": 2,
      "newPct": 0.4,
      "ex": 1,
      "exPct": 0.1
    },
    {
      "range": "$4,000,000-$4,999,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$5,000,000 and over",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    }
  ],
  "priceClassYtd": [
    {
      "range": "$69,999 and under",
      "new": 0,
      "newPct": 0,
      "ex": 2,
      "exPct": 0
    },
    {
      "range": "$70,000-$89,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$90,000-$99,999",
      "new": 0,
      "newPct": 0,
      "ex": 0,
      "exPct": 0
    },
    {
      "range": "$100,000-$119,999",
      "new": 0,
      "newPct": 0,
      "ex": 1,
      "exPct": 0
    },
    {
      "range": "$120,000-$159,999",
      "new": 0,
      "newPct": 0,
      "ex": 7,
      "exPct": 0.1
    },
    {
      "range": "$160,000-$199,999",
      "new": 0,
      "newPct": 0,
      "ex": 10,
      "exPct": 0.2
    },
    {
      "range": "$200,000-$249,999",
      "new": 0,
      "newPct": 0,
      "ex": 33,
      "exPct": 0.5
    },
    {
      "range": "$250,000-$299,999",
      "new": 0,
      "newPct": 0,
      "ex": 103,
      "exPct": 1.5
    },
    {
      "range": "$300,000-$399,999",
      "new": 308,
      "newPct": 7.9,
      "ex": 1208,
      "exPct": 18.2
    },
    {
      "range": "$400,000-$499,999",
      "new": 1477,
      "newPct": 38.1,
      "ex": 1769,
      "exPct": 26.6
    },
    {
      "range": "$500,000-$599,999",
      "new": 790,
      "newPct": 20.4,
      "ex": 1141,
      "exPct": 17.2
    },
    {
      "range": "$600,000-$699,999",
      "new": 450,
      "newPct": 11.6,
      "ex": 696,
      "exPct": 10.5
    },
    {
      "range": "$700,000-$799,999",
      "new": 287,
      "newPct": 7.4,
      "ex": 500,
      "exPct": 7.5
    },
    {
      "range": "$800,000-$899,999",
      "new": 154,
      "newPct": 4,
      "ex": 339,
      "exPct": 5.1
    },
    {
      "range": "$900,000-$999,999",
      "new": 109,
      "newPct": 2.8,
      "ex": 229,
      "exPct": 3.4
    },
    {
      "range": "$1,000,000-$1,999,999",
      "new": 272,
      "newPct": 7,
      "ex": 532,
      "exPct": 8
    },
    {
      "range": "$2,000,000-$2,999,999",
      "new": 23,
      "newPct": 0.6,
      "ex": 59,
      "exPct": 0.9
    },
    {
      "range": "$3,000,000-$3,999,999",
      "new": 8,
      "newPct": 0.2,
      "ex": 17,
      "exPct": 0.3
    },
    {
      "range": "$4,000,000-$4,999,999",
      "new": 1,
      "newPct": 0,
      "ex": 2,
      "exPct": 0
    },
    {
      "range": "$5,000,000 and over",
      "new": 1,
      "newPct": 0,
      "ex": 3,
      "exPct": 0
    }
  ],
  "ncTiers": [
    {
      "tier": "0 - 100K",
      "active": 0,
      "pending": 0,
      "sold": 0,
      "moi": null,
      "orig": null,
      "soldPrice": null,
      "ratio": null,
      "sqft": null,
      "psf": null,
      "cdom": null,
      "avgActive": null,
      "avgPending": null
    },
    {
      "tier": "100 - 150K",
      "active": 0,
      "pending": 0,
      "sold": 0,
      "moi": null,
      "orig": null,
      "soldPrice": null,
      "ratio": null,
      "sqft": null,
      "psf": null,
      "cdom": null,
      "avgActive": null,
      "avgPending": null
    },
    {
      "tier": "150 - 199K",
      "active": 0,
      "pending": 0,
      "sold": 0,
      "moi": null,
      "orig": null,
      "soldPrice": null,
      "ratio": null,
      "sqft": null,
      "psf": null,
      "cdom": null,
      "avgActive": null,
      "avgPending": null
    },
    {
      "tier": "200 - 249K",
      "active": 0,
      "pending": 0,
      "sold": 0,
      "moi": null,
      "orig": null,
      "soldPrice": null,
      "ratio": null,
      "sqft": null,
      "psf": null,
      "cdom": null,
      "avgActive": null,
      "avgPending": null
    },
    {
      "tier": "250 - 299K",
      "active": 0,
      "pending": 0,
      "sold": 0,
      "moi": null,
      "orig": null,
      "soldPrice": null,
      "ratio": null,
      "sqft": null,
      "psf": null,
      "cdom": null,
      "avgActive": null,
      "avgPending": null
    },
    {
      "tier": "300 - 349K",
      "active": 2,
      "pending": 1,
      "sold": 5,
      "moi": 4.8,
      "orig": 344718,
      "soldPrice": 344238,
      "ratio": 0.9986075574817677,
      "sqft": 1191,
      "psf": 289.03274559193954,
      "cdom": 39.2,
      "avgActive": 324000,
      "avgPending": 349990
    },
    {
      "tier": "350 - 399K",
      "active": 20,
      "pending": 20,
      "sold": 210,
      "moi": 1.1,
      "orig": 389272.5857142857,
      "soldPrice": 387291.74761904764,
      "ratio": 0.9949114369520695,
      "sqft": 1468.804761904762,
      "psf": 263.6781672172709,
      "cdom": 61.15714285714286,
      "avgActive": 391534.5,
      "avgPending": 385613.95
    },
    {
      "tier": "400 - 499K",
      "active": 212,
      "pending": 212,
      "sold": 1063,
      "moi": 2.4,
      "orig": 449933.4346190028,
      "soldPrice": 449251.74976481654,
      "ratio": 0.9984849206532884,
      "sqft": 1769.453433678269,
      "psf": 253.89294864399454,
      "cdom": 71.41392285983066,
      "avgActive": 449365.179245283,
      "avgPending": 449963.97641509434
    },
    {
      "tier": "500 - 599K",
      "active": 187,
      "pending": 149,
      "sold": 640,
      "moi": 3.5,
      "orig": 546400.7796875,
      "soldPrice": 545635.7,
      "ratio": 0.9985997829506437,
      "sqft": 2156.3203125,
      "psf": 253.04018926919048,
      "cdom": 67.653125,
      "avgActive": 557582.3903743315,
      "avgPending": 550923.865771812
    },
    {
      "tier": "600 - 799K",
      "active": 241,
      "pending": 216,
      "sold": 722,
      "moi": 4,
      "orig": 691022.6565096953,
      "soldPrice": 689801.8379501385,
      "ratio": 0.9982333161611182,
      "sqft": 2480.178670360111,
      "psf": 278.1258649603588,
      "cdom": 48.99445983379501,
      "avgActive": 701988.755186722,
      "avgPending": 696586.9120370371
    },
    {
      "tier": "800 - 999K",
      "active": 143,
      "pending": 99,
      "sold": 269,
      "moi": 6.4,
      "orig": 876607.9144981413,
      "soldPrice": 882656.970260223,
      "ratio": 1.0069005260642039,
      "sqft": 2861.739776951673,
      "psf": 308.43369385613033,
      "cdom": 46.98141263940521,
      "avgActive": 896948.7272727273,
      "avgPending": 875361.9696969697
    },
    {
      "tier": "1 - 1.5 M",
      "active": 88,
      "pending": 83,
      "sold": 205,
      "moi": 5.2,
      "orig": 1204756.643902439,
      "soldPrice": 1210921.7609756098,
      "ratio": 1.005117313197129,
      "sqft": 3247.858536585366,
      "psf": 372.8369777609562,
      "cdom": 37.107317073170734,
      "avgActive": 1195090.4886363635,
      "avgPending": 1204017.3253012048
    },
    {
      "tier": "1.5 - 2 M",
      "active": 27,
      "pending": 33,
      "sold": 43,
      "moi": 7.5,
      "orig": 1688364.0930232557,
      "soldPrice": 1700742.0930232557,
      "ratio": 1.00733135705216,
      "sqft": 3727.4186046511627,
      "psf": 456.27880134016306,
      "cdom": 34.906976744186046,
      "avgActive": 1774424.7037037036,
      "avgPending": 1683856.121212121
    },
    {
      "tier": "> 2 M",
      "active": 44,
      "pending": 42,
      "sold": 44,
      "moi": 12,
      "orig": 2759586.8863636362,
      "soldPrice": 2795429.5681818184,
      "ratio": 1.0129884230118997,
      "sqft": 4591.272727272727,
      "psf": 608.8572241802631,
      "cdom": 33.40909090909091,
      "avgActive": 2757113.977272727,
      "avgPending": 2643192.595238095
    }
  ],
  "ncTotals": {
    "active": 964,
    "pending": 855,
    "sold": 3201,
    "moi": 3.6,
    "orig": 652036.5670103093,
    "soldPrice": 652813.2892845985,
    "sqft": 2238.044673539519,
    "cdom": 59.61886910340519,
    "avgActive": 808968.2759336099,
    "avgPending": 806059.269005848,
    "ratio": 1.0011912250226251,
    "psf": 291.6891235473684
  },
  "ncMonthly": [
    {
      "m": "Jul, 25",
      "closed": 321,
      "pending": 307,
      "active": 1560
    },
    {
      "m": "Aug, 25",
      "closed": 311,
      "pending": 311,
      "active": 1617
    },
    {
      "m": "Sep, 25",
      "closed": 291,
      "pending": 291,
      "active": 1666
    },
    {
      "m": "Oct, 25",
      "closed": 348,
      "pending": 350,
      "active": 1642
    },
    {
      "m": "Nov, 25",
      "closed": 268,
      "pending": 276,
      "active": 1664
    },
    {
      "m": "Dec, 25",
      "closed": 320,
      "pending": 329,
      "active": 1575
    },
    {
      "m": "Jan, 26",
      "closed": 223,
      "pending": 259,
      "active": 1568
    },
    {
      "m": "Feb, 26",
      "closed": 286,
      "pending": 345,
      "active": 1544
    },
    {
      "m": "Mar, 26",
      "closed": 382,
      "pending": 443,
      "active": 1472
    },
    {
      "m": "Apr, 26",
      "closed": 360,
      "pending": 481,
      "active": 1398
    },
    {
      "m": "May, 26",
      "closed": 349,
      "pending": 462,
      "active": 1327
    },
    {
      "m": "Jun, 26",
      "closed": 339,
      "pending": 459,
      "active": 1263
    },
    {
      "m": "Jul, 26",
      "closed": 318,
      "pending": 558,
      "active": 1026
    }
  ],
  "ncScope": "Ada County only",
  "ncPeriod": "July 2026",
  "coverage": {
    "jul25Sold": 1281,
    "jul25MissingClosePrice": 1236
  }
};
