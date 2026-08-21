// AUTO-GENERATED from data_science.compass_db.ada_canyon_county_report_csv
// (July 2026, generated 2026-08-21). Regenerate rather than hand-edit.
//
// SCOPE: Ada + Canyon County. Section 2 gained seven Canyon areas
// (1200-1500) that the earlier Ada-only export did not carry.
//
// ncTiers / ncTotals / ncMonthly are NOT from this notebook - they come
// from the earlier dim_listing x dim_property pull and remain ADA ONLY.
// `ncScope` records that so the UI can label it.
const ADA_REPORT = {
  "period": "July 2026",
  "county": "Ada & Canyon County, Idaho",
  "generated": "2026-08-21",
  "summary": {
    "total": {
      "header": [
        "Jul-26",
        "Year to Date 26",
        "Jul-25",
        "Year to Date 25",
        "Previous 12 Months"
      ],
      "rows": [
        {
          "label": "Total Single-Family Active Residential Listings",
          "vals": [
            3176.0,
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
            2107.0,
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
            1449.0,
            9111.0,
            1358.0,
            8090.0,
            15066.0
          ],
          "pct": [
            6.7,
            12.6
          ]
        },
        {
          "label": "Median Price",
          "vals": [
            539000.0,
            512300.0,
            509500.0,
            500000.0,
            509000.0
          ],
          "pct": [
            5.8,
            2.5
          ]
        },
        {
          "label": "Average Price",
          "vals": [
            649312.1704623878,
            614984.2391614532,
            617573.6215022091,
            606022.9143386898,
            613412.7828886234
          ],
          "pct": [
            5.1,
            1.5
          ]
        },
        {
          "label": "Days on Market",
          "vals": [
            34.24430641821946,
            43.296015805070795,
            37.14580265095729,
            41.49888751545117,
            44.70589406610912
          ],
          "pct": null
        },
        {
          "label": "Total Single-Family Dollar Volume",
          "vals": [
            940853335.0,
            5603121403.0,
            838664978.0,
            4902725377.0,
            9241676987.0
          ],
          "pct": [
            12.2,
            14.3
          ]
        }
      ]
    },
    "existing": {
      "header": [
        "Jul-26",
        "Year to Date 26",
        "Jul-25",
        "Year to Date 25",
        "Previous 12 Months"
      ],
      "rows": [
        {
          "label": "Existing Active Residential Listings",
          "vals": [
            1667.0,
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
            945.0,
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
            969.0,
            5711.0,
            1006.0,
            6748.0,
            9649.0
          ],
          "pct": [
            -3.7,
            -15.4
          ]
        },
        {
          "label": "Median Price",
          "vals": [
            543000.0,
            510000.0,
            515000.0,
            499995.0,
            505000.0
          ],
          "pct": [
            5.4,
            2.0
          ]
        },
        {
          "label": "Average Price",
          "vals": [
            648897.0206398349,
            616277.745403607,
            621185.5994035786,
            605681.5029638412,
            614214.6533319515
          ],
          "pct": [
            4.5,
            1.7
          ]
        },
        {
          "label": "Days on Market",
          "vals": [
            27.068111455108358,
            30.05988443354929,
            34.60337972166998,
            42.12314759928868,
            34.95667944864753
          ],
          "pct": null
        },
        {
          "label": "Existing Dollar Volume",
          "vals": [
            628781213.0,
            3519562204.0,
            624912713.0,
            4087138782.0,
            5926557190.0
          ],
          "pct": [
            0.6,
            -13.9
          ]
        }
      ]
    },
    "new": {
      "header": [
        "Jul-26",
        "Year to Date 26",
        "Jul-25",
        "Year to Date 25",
        "Previous 12 Months"
      ],
      "rows": [
        {
          "label": "Newly Constructed Active Residential Listings",
          "vals": [
            1509.0,
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
            1162.0,
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
            480.0,
            3400.0,
            352.0,
            1342.0,
            5417.0
          ],
          "pct": [
            36.4,
            153.4
          ]
        },
        {
          "label": "Median Price",
          "vals": [
            532717.0,
            514512.0,
            489990.0,
            507900.0,
            512000.0
          ],
          "pct": [
            8.7,
            1.3
          ]
        },
        {
          "label": "Average Price",
          "vals": [
            650150.2541666667,
            612811.5291176471,
            607250.7528409091,
            607739.6385991058,
            611984.4557873362
          ],
          "pct": [
            7.1,
            0.8
          ]
        },
        {
          "label": "Days on Market",
          "vals": [
            48.73125,
            65.52882352941177,
            44.41193181818182,
            38.35991058122206,
            62.07162636145468
          ],
          "pct": null
        },
        {
          "label": "Newly Constructed Dollar Volume",
          "vals": [
            312072122.0,
            2083559199.0,
            213752265.0,
            815586595.0,
            3315119797.0
          ],
          "pct": [
            46.0,
            155.5
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
        "sold": 30,
        "pct": 2.0689655172413794,
        "avg": 880365.0,
        "med": 715000.0
      },
      "new": {
        "sold": 0,
        "pct": 0.0,
        "avg": null,
        "med": null
      },
      "existing": {
        "sold": 30,
        "pct": 2.0689655172413794,
        "avg": 880365.0,
        "med": 715000.0
      }
    },
    {
      "name": "Boise NE",
      "code": "0200",
      "total": {
        "sold": 30,
        "pct": 2.0689655172413794,
        "avg": 964184.0,
        "med": 865000.0
      },
      "new": {
        "sold": 1,
        "pct": 0.06896551724137931,
        "avg": 669945.0,
        "med": 474990.0
      },
      "existing": {
        "sold": 29,
        "pct": 2.0,
        "avg": 976139.0,
        "med": 869000.0
      }
    },
    {
      "name": "Boise SE",
      "code": "0300",
      "total": {
        "sold": 41,
        "pct": 2.8275862068965516,
        "avg": 761685.0,
        "med": 715000.0
      },
      "new": {
        "sold": 1,
        "pct": 0.06896551724137931,
        "avg": 669945.0,
        "med": 474990.0
      },
      "existing": {
        "sold": 40,
        "pct": 2.7586206896551726,
        "avg": 763611.0,
        "med": 715000.0
      }
    },
    {
      "name": "Boise Bench",
      "code": "0400",
      "total": {
        "sold": 35,
        "pct": 2.413793103448276,
        "avg": 563522.0,
        "med": 524900.0
      },
      "new": {
        "sold": 1,
        "pct": 0.06896551724137931,
        "avg": 684116.0,
        "med": 484990.0
      },
      "existing": {
        "sold": 34,
        "pct": 2.3448275862068964,
        "avg": 559241.0,
        "med": 524900.0
      }
    },
    {
      "name": "Boise South",
      "code": "0500",
      "total": {
        "sold": 32,
        "pct": 2.206896551724138,
        "avg": 537264.0,
        "med": 515000.0
      },
      "new": {
        "sold": 1,
        "pct": 0.06896551724137931,
        "avg": 493327.0,
        "med": 484990.0
      },
      "existing": {
        "sold": 30,
        "pct": 2.0689655172413794,
        "avg": 539261.0,
        "med": 515000.0
      }
    },
    {
      "name": "Boise SW-Meridian",
      "code": "0550",
      "total": {
        "sold": 35,
        "pct": 2.413793103448276,
        "avg": 559405.0,
        "med": 555000.0
      },
      "new": {
        "sold": 4,
        "pct": 0.27586206896551724,
        "avg": 596792.0,
        "med": 605000.0
      },
      "existing": {
        "sold": 30,
        "pct": 2.0689655172413794,
        "avg": 554196.0,
        "med": 537000.0
      }
    },
    {
      "name": "Boise West",
      "code": "0600",
      "total": {
        "sold": 38,
        "pct": 2.6206896551724137,
        "avg": 519410.0,
        "med": 499900.0
      },
      "new": {
        "sold": 2,
        "pct": 0.13793103448275862,
        "avg": 546037.0,
        "med": 539000.0
      },
      "existing": {
        "sold": 36,
        "pct": 2.4827586206896552,
        "avg": 518160.0,
        "med": 498800.0
      }
    },
    {
      "name": "Boise W-Garden City",
      "code": "0650",
      "total": {
        "sold": 43,
        "pct": 2.9655172413793105,
        "avg": 553809.0,
        "med": 565000.0
      },
      "new": {
        "sold": 1,
        "pct": 0.06896551724137931,
        "avg": 860116.0,
        "med": 1109900.0
      },
      "existing": {
        "sold": 42,
        "pct": 2.896551724137931,
        "avg": 547154.0,
        "med": 539000.0
      }
    },
    {
      "name": "Garden City",
      "code": "0700",
      "total": {
        "sold": 27,
        "pct": 1.8620689655172413,
        "avg": 968284.0,
        "med": 959000.0
      },
      "new": {
        "sold": 7,
        "pct": 0.4827586206896552,
        "avg": 1204399.0,
        "med": 1109900.0
      },
      "existing": {
        "sold": 20,
        "pct": 1.3793103448275863,
        "avg": 884950.0,
        "med": 845000.0
      }
    },
    {
      "name": "Boise NW",
      "code": "0800",
      "total": {
        "sold": 34,
        "pct": 2.3448275862068964,
        "avg": 855227.0,
        "med": 810000.0
      },
      "new": {
        "sold": 5,
        "pct": 0.3448275862068966,
        "avg": 1204399.0,
        "med": 1109900.0
      },
      "existing": {
        "sold": 29,
        "pct": 2.0,
        "avg": 800501.0,
        "med": 735000.0
      }
    },
    {
      "name": "Eagle",
      "code": "0900",
      "total": {
        "sold": 104,
        "pct": 7.172413793103448,
        "avg": 1242980.0,
        "med": 1009000.0
      },
      "new": {
        "sold": 29,
        "pct": 2.0,
        "avg": 1477224.0,
        "med": 1200000.0
      },
      "existing": {
        "sold": 75,
        "pct": 5.172413793103448,
        "avg": 1152406.0,
        "med": 899500.0
      }
    },
    {
      "name": "Star",
      "code": "0950",
      "total": {
        "sold": 89,
        "pct": 6.137931034482759,
        "avg": 676803.0,
        "med": 645000.0
      },
      "new": {
        "sold": 40,
        "pct": 2.7586206896551726,
        "avg": 676997.0,
        "med": 669900.0
      },
      "existing": {
        "sold": 49,
        "pct": 3.3793103448275863,
        "avg": 676646.0,
        "med": 625000.0
      }
    },
    {
      "name": "Meridian SE",
      "code": "1000",
      "total": {
        "sold": 48,
        "pct": 3.310344827586207,
        "avg": 658431.0,
        "med": 609900.0
      },
      "new": {
        "sold": 23,
        "pct": 1.5862068965517242,
        "avg": 639163.0,
        "med": 609900.0
      },
      "existing": {
        "sold": 25,
        "pct": 1.7241379310344827,
        "avg": 675851.0,
        "med": 600000.0
      }
    },
    {
      "name": "Meridian SW",
      "code": "1010",
      "total": {
        "sold": 47,
        "pct": 3.2413793103448274,
        "avg": 658431.0,
        "med": 609900.0
      },
      "new": {
        "sold": 22,
        "pct": 1.5172413793103448,
        "avg": 639163.0,
        "med": 609900.0
      },
      "existing": {
        "sold": 25,
        "pct": 1.7241379310344827,
        "avg": 675851.0,
        "med": 600000.0
      }
    },
    {
      "name": "Meridian NE",
      "code": "1020",
      "total": {
        "sold": 101,
        "pct": 6.9655172413793105,
        "avg": 643599.0,
        "med": 586700.0
      },
      "new": {
        "sold": 35,
        "pct": 2.413793103448276,
        "avg": 634694.0,
        "med": 612411.0
      },
      "existing": {
        "sold": 66,
        "pct": 4.551724137931035,
        "avg": 648336.0,
        "med": 570000.0
      }
    },
    {
      "name": "Meridian NW",
      "code": "1030",
      "total": {
        "sold": 104,
        "pct": 7.172413793103448,
        "avg": 646491.0,
        "med": 599999.0
      },
      "new": {
        "sold": 37,
        "pct": 2.5517241379310347,
        "avg": 634730.0,
        "med": 612411.0
      },
      "existing": {
        "sold": 67,
        "pct": 4.620689655172414,
        "avg": 653043.0,
        "med": 587000.0
      }
    },
    {
      "name": "Kuna",
      "code": "1100",
      "total": {
        "sold": 117,
        "pct": 8.068965517241379,
        "avg": 548277.0,
        "med": 534000.0
      },
      "new": {
        "sold": 75,
        "pct": 5.172413793103448,
        "avg": 555794.0,
        "med": 525040.0
      },
      "existing": {
        "sold": 42,
        "pct": 2.896551724137931,
        "avg": 534632.0,
        "med": 555000.0
      }
    },
    {
      "name": "Nampa SW",
      "code": "1200",
      "total": {
        "sold": 101,
        "pct": 6.9655172413793105,
        "avg": 489798.0,
        "med": 443000.0
      },
      "new": {
        "sold": 29,
        "pct": 2.0,
        "avg": 530888.0,
        "med": 476571.0
      },
      "existing": {
        "sold": 72,
        "pct": 4.9655172413793105,
        "avg": 473248.0,
        "med": 417500.0
      }
    },
    {
      "name": "Nampa NE",
      "code": "1210",
      "total": {
        "sold": 112,
        "pct": 7.724137931034483,
        "avg": 483987.0,
        "med": 454990.0
      },
      "new": {
        "sold": 53,
        "pct": 3.6551724137931036,
        "avg": 497849.0,
        "med": 473890.0
      },
      "existing": {
        "sold": 59,
        "pct": 4.068965517241379,
        "avg": 471534.0,
        "med": 405000.0
      }
    },
    {
      "name": "Nampa South",
      "code": "1220",
      "total": {
        "sold": 57,
        "pct": 3.9310344827586206,
        "avg": 396573.0,
        "med": 403000.0
      },
      "new": {
        "sold": 17,
        "pct": 1.1724137931034482,
        "avg": 415746.0,
        "med": 419990.0
      },
      "existing": {
        "sold": 40,
        "pct": 2.7586206896551726,
        "avg": 388425.0,
        "med": 362500.0
      }
    },
    {
      "name": "Caldwell South",
      "code": "1300",
      "total": {
        "sold": 53,
        "pct": 3.6551724137931036,
        "avg": 426051.0,
        "med": 418000.0
      },
      "new": {
        "sold": 21,
        "pct": 1.4482758620689655,
        "avg": 450622.0,
        "med": 453334.0
      },
      "existing": {
        "sold": 32,
        "pct": 2.206896551724138,
        "avg": 409926.0,
        "med": 381000.0
      }
    },
    {
      "name": "Caldwell North",
      "code": "1310",
      "total": {
        "sold": 88,
        "pct": 6.068965517241379,
        "avg": 597421.0,
        "med": 450000.0
      },
      "new": {
        "sold": 33,
        "pct": 2.2758620689655173,
        "avg": 658482.0,
        "med": 494000.0
      },
      "existing": {
        "sold": 55,
        "pct": 3.793103448275862,
        "avg": 560784.0,
        "med": 409900.0
      }
    },
    {
      "name": "Middleton",
      "code": "1400",
      "total": {
        "sold": 61,
        "pct": 4.206896551724138,
        "avg": 642188.0,
        "med": 548990.0
      },
      "new": {
        "sold": 35,
        "pct": 2.413793103448276,
        "avg": 604536.0,
        "med": 499990.0
      },
      "existing": {
        "sold": 26,
        "pct": 1.793103448275862,
        "avg": 692873.0,
        "med": 599000.0
      }
    },
    {
      "name": "Canyon County Rural",
      "code": "1500",
      "total": {
        "sold": 23,
        "pct": 1.5862068965517242,
        "avg": 470710.0,
        "med": 413000.0
      },
      "new": {
        "sold": 7,
        "pct": 0.4827586206896552,
        "avg": 454277.0,
        "med": 418500.0
      },
      "existing": {
        "sold": 16,
        "pct": 1.103448275862069,
        "avg": 477900.0,
        "med": 389900.0
      }
    }
  ],
  "areaTotals": {
    "name": "Totals",
    "code": "ALL",
    "total": {
      "sold": 1450,
      "pct": 100.0,
      "avg": 656037.0,
      "med": null
    },
    "new": {
      "sold": 479,
      "pct": 100.0,
      "avg": 686924.0,
      "med": null
    },
    "existing": {
      "sold": 969,
      "pct": 100.0,
      "avg": 646460.0,
      "med": null
    }
  },
  "priceClassJul": [
    {
      "range": "$69,999 and under",
      "new": 0,
      "newPct": 0.0,
      "ex": 0,
      "exPct": 0.0
    },
    {
      "range": "$70,000-$89,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 0,
      "exPct": 0.0
    },
    {
      "range": "$90,000-$99,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 0,
      "exPct": 0.0
    },
    {
      "range": "$100,000-$119,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 1,
      "exPct": 0.1
    },
    {
      "range": "$120,000-$159,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 1,
      "exPct": 0.1
    },
    {
      "range": "$160,000-$199,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 1,
      "exPct": 0.1
    },
    {
      "range": "$200,000-$249,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 5,
      "exPct": 0.5
    },
    {
      "range": "$250,000-$299,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 12,
      "exPct": 1.2
    },
    {
      "range": "$300,000-$399,999",
      "new": 25,
      "newPct": 5.2,
      "ex": 159,
      "exPct": 16.4
    },
    {
      "range": "$400,000-$499,999",
      "new": 189,
      "newPct": 39.4,
      "ex": 237,
      "exPct": 24.5
    },
    {
      "range": "$500,000-$599,999",
      "new": 90,
      "newPct": 18.8,
      "ex": 154,
      "exPct": 15.9
    },
    {
      "range": "$600,000-$699,999",
      "new": 56,
      "newPct": 11.7,
      "ex": 116,
      "exPct": 12.0
    },
    {
      "range": "$700,000-$799,999",
      "new": 34,
      "newPct": 7.1,
      "ex": 89,
      "exPct": 9.2
    },
    {
      "range": "$800,000-$899,999",
      "new": 20,
      "newPct": 4.2,
      "ex": 57,
      "exPct": 5.9
    },
    {
      "range": "$900,000-$999,999",
      "new": 23,
      "newPct": 4.8,
      "ex": 46,
      "exPct": 4.7
    },
    {
      "range": "$1,000,000-$1,999,999",
      "new": 38,
      "newPct": 7.9,
      "ex": 78,
      "exPct": 8.0
    },
    {
      "range": "$2,000,000-$2,999,999",
      "new": 4,
      "newPct": 0.8,
      "ex": 8,
      "exPct": 0.8
    },
    {
      "range": "$3,000,000-$3,999,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 3,
      "exPct": 0.3
    },
    {
      "range": "$4,000,000-$4,999,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 1,
      "exPct": 0.1
    },
    {
      "range": "$5,000,000 and over",
      "new": 1,
      "newPct": 0.2,
      "ex": 1,
      "exPct": 0.1
    }
  ],
  "priceClassYtd": [
    {
      "range": "$69,999 and under",
      "new": 0,
      "newPct": 0.0,
      "ex": 2,
      "exPct": 0.0
    },
    {
      "range": "$70,000-$89,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 0,
      "exPct": 0.0
    },
    {
      "range": "$90,000-$99,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 0,
      "exPct": 0.0
    },
    {
      "range": "$100,000-$119,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 1,
      "exPct": 0.0
    },
    {
      "range": "$120,000-$159,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 7,
      "exPct": 0.1
    },
    {
      "range": "$160,000-$199,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 10,
      "exPct": 0.2
    },
    {
      "range": "$200,000-$249,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 29,
      "exPct": 0.5
    },
    {
      "range": "$250,000-$299,999",
      "new": 0,
      "newPct": 0.0,
      "ex": 93,
      "exPct": 1.6
    },
    {
      "range": "$300,000-$399,999",
      "new": 283,
      "newPct": 8.3,
      "ex": 1057,
      "exPct": 18.5
    },
    {
      "range": "$400,000-$499,999",
      "new": 1319,
      "newPct": 38.8,
      "ex": 1533,
      "exPct": 26.8
    },
    {
      "range": "$500,000-$599,999",
      "new": 684,
      "newPct": 20.1,
      "ex": 960,
      "exPct": 16.8
    },
    {
      "range": "$600,000-$699,999",
      "new": 395,
      "newPct": 11.6,
      "ex": 603,
      "exPct": 10.6
    },
    {
      "range": "$700,000-$799,999",
      "new": 247,
      "newPct": 7.3,
      "ex": 425,
      "exPct": 7.4
    },
    {
      "range": "$800,000-$899,999",
      "new": 128,
      "newPct": 3.8,
      "ex": 282,
      "exPct": 4.9
    },
    {
      "range": "$900,000-$999,999",
      "new": 96,
      "newPct": 2.8,
      "ex": 196,
      "exPct": 3.4
    },
    {
      "range": "$1,000,000-$1,999,999",
      "new": 219,
      "newPct": 6.4,
      "ex": 447,
      "exPct": 7.8
    },
    {
      "range": "$2,000,000-$2,999,999",
      "new": 20,
      "newPct": 0.6,
      "ex": 46,
      "exPct": 0.8
    },
    {
      "range": "$3,000,000-$3,999,999",
      "new": 6,
      "newPct": 0.2,
      "ex": 16,
      "exPct": 0.3
    },
    {
      "range": "$4,000,000-$4,999,999",
      "new": 1,
      "newPct": 0.0,
      "ex": 2,
      "exPct": 0.0
    },
    {
      "range": "$5,000,000 and over",
      "new": 2,
      "newPct": 0.1,
      "ex": 2,
      "exPct": 0.0
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
      "orig": 344718.0,
      "soldPrice": 344238.0,
      "ratio": 0.9986075574817677,
      "sqft": 1191.0,
      "psf": 289.03274559193954,
      "cdom": 39.2,
      "avgActive": 324000.0,
      "avgPending": 349990.0
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
      "moi": 4.0,
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
      "moi": 12.0,
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
  "coverage": {
    "jul25Sold": 1373,
    "jul25MissingClosePrice": 1324
  }
};
