# Databricks notebook — import and run once to seed Delta tables
# with the values currently in data.js (as of June 22, 2026).
# After seeding, use 03_refresh_data.py on a schedule to keep values current.
#
# Cluster requirements: any DBR 13+ with Unity Catalog enabled.
# Run 01_create_tables.sql first.

from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, DateType
from datetime import date
import json

spark = SparkSession.builder.getOrCreate()

# ── Metrics ───────────────────────────────────────────────────────────────────
# id, value, period_change, yoy_change, metric_date

metrics_data = [
    # Financial Markets
    ("treasury10y",      4.36,      -0.02,   -0.43,  date(2026, 6, 22)),
    ("treasury2y",       4.09,      -0.03,   -0.61,  date(2026, 6, 22)),
    ("sp500",         5521.0,       39.0,   351.0,   date(2026, 6, 22)),
    ("oil",             71.80,      -0.60,   -8.90,  date(2026, 6, 22)),
    ("mortgageRate",     6.79,      -0.03,   -0.25,  date(2026, 6, 19)),
    ("mortgageSpread",   2.43,      -0.01,    0.14,  date(2026, 6, 19)),

    # Seattle Housing
    ("seaMedianPrice",      875000.0,  12000.0,  38000.0, date(2026, 6, 1)),
    ("seaMedianListPrice",  899000.0,   5000.0,  42000.0, date(2026, 6, 13)),
    ("seaActiveInventory",    3241.0,    187.0,    621.0, date(2026, 6, 13)),
    ("seaWeeksSupply",           5.2,      0.3,      1.1, date(2026, 6, 13)),
    ("seaNewListings",         892.0,     42.0,    118.0, date(2026, 6, 13)),
    ("seaPendingSales",       1104.0,    -28.0,     94.0, date(2026, 6, 13)),
    ("seaDaysOnMarket",         18.0,      2.0,      5.0, date(2026, 6, 13)),
    ("seaPriceReductions",      18.4,      0.8,      3.2, date(2026, 6, 13)),
    ("seaSaleTListRatio",      101.2,     -0.4,     -1.8, date(2026, 5, 31)),
    ("seaCaseShiller",         402.1,      3.2,     18.4, date(2026, 4, 30)),
    ("existingHomeSales",        4.08,      0.05,    0.29, date(2026, 6, 20)),
    ("newHomeSales",           683.0,     12.0,     54.0, date(2026, 5, 23)),
    ("housingStarts",            1.361,     0.043,  -0.082, date(2026, 5, 20)),
    ("buildingPermits",          1.412,     0.018,  -0.061, date(2026, 5, 20)),

    # Mortgage Applications (MBA)
    ("mbaPurchaseIndex",    150.2,   1.6,   -9.2, date(2026, 6, 18)),
    ("mbaRefiIndex",        621.8,   9.4,  192.4, date(2026, 6, 18)),
    ("mbaMarketComposite",  215.6,   2.8,   19.4, date(2026, 6, 18)),
    ("mbaArmShare",           8.3,  -0.1,    1.0, date(2026, 6, 18)),

    # Inflation
    ("cpiHeadline",    2.9,  -0.1,  -0.7, date(2026, 6, 11)),
    ("cpiCore",        3.2,  -0.1,  -0.8, date(2026, 6, 11)),
    ("pce",            2.6,  -0.1,  -0.6, date(2026, 5, 30)),
    ("pceCore",        2.8,  -0.1,  -0.4, date(2026, 5, 30)),
    ("trimmedMeanPce", 2.9, -0.05,  -0.5, date(2026, 5, 30)),
    ("breakeven5y",    2.42, -0.02, -0.10, date(2026, 6, 22)),
    ("breakeven10y",   2.36, -0.02, -0.08, date(2026, 6, 22)),
    ("cpiShelter",     4.8,  -0.2,  -1.4, date(2026, 6, 11)),
    ("cpiEnergy",     -4.2,  -0.8,  -2.1, date(2026, 6, 11)),
    ("cpiFood",        2.3,   0.1,  -0.9, date(2026, 6, 11)),
    ("ppi",            2.4,  -0.3,  -0.8, date(2026, 6, 12)),
    ("ppiCore",        2.9,  -0.1,  -0.6, date(2026, 6, 12)),

    # Employment
    ("initialClaims",       218000.0,  -4000.0,   6000.0, date(2026, 6, 19)),
    ("continuingClaims",   1871000.0,  14000.0,  82000.0, date(2026, 6, 19)),
    ("u3",                       4.1,      0.0,      0.3, date(2026, 6, 6)),
    ("u6",                       7.8,      0.1,      0.5, date(2026, 6, 6)),
    ("nfp",                 177000.0, -12000.0, -34000.0, date(2026, 6, 6)),
    ("lfpr",                    62.5,      0.0,     -0.1, date(2026, 6, 6)),
    ("avgHourlyEarnings",        3.9,      0.1,     -0.4, date(2026, 6, 6)),
    ("joltsOpenings",            7.19,    -0.14,    -0.82, date(2026, 5, 31)),
    ("joltsQuits",               3.31,     0.08,    -0.22, date(2026, 5, 31)),
    ("joltsLayoffs",             1.61,    -0.04,     0.18, date(2026, 5, 31)),
    ("waStateInitialClaims",  9840.0,   -320.0,    480.0, date(2026, 6, 19)),
    ("seaUnemployment",          3.8,     -0.1,      0.4, date(2026, 5, 31)),
    ("seaPayrolls",           8400.0,  -1200.0,  -2800.0, date(2026, 5, 31)),

    # Federal Reserve
    ("effFedFunds",   4.33,  0.0,  -0.92, date(2026, 6, 22)),
    ("fedTargetHigh", 4.50,  0.0,  -1.00, date(2026, 6, 22)),
    ("cutProbJul",   12.0,  -2.0,   None, date(2026, 6, 22)),
    ("cutProbSep",   70.0,   2.0,   None, date(2026, 6, 22)),
    ("cutProbNov",   84.0,   2.0,   None, date(2026, 6, 22)),
]

schema = StructType([
    StructField("id",            StringType(), False),
    StructField("value",         DoubleType(), True),
    StructField("period_change", DoubleType(), True),
    StructField("yoy_change",    DoubleType(), True),
    StructField("metric_date",   DateType(),   True),
])

df_metrics = spark.createDataFrame(metrics_data, schema=schema)
df_metrics.write.format("delta").mode("overwrite") \
    .option("mergeSchema", "true") \
    .saveAsTable("econ.dashboard.metrics")

print(f"Seeded {df_metrics.count()} metrics")

# ── Upcoming releases ─────────────────────────────────────────────────────────

upcoming_data = [
    (date(2026, 6, 24), "New Home Sales (May)",        "683K",      "690K",    "Census/HUD",        None),
    (date(2026, 6, 25), "Consumer Confidence (Jun)",   "98.0",      "99.4",    "Conference Board",  None),
    (date(2026, 6, 26), "Initial Jobless Claims",      "218K",      "215K",    "DOL",               None),
    (date(2026, 6, 26), "GDP (Q1 Final)",              "+1.2%",     "+1.3%",   "BEA",               None),
    (date(2026, 6, 27), "PCE Inflation (May)",         "2.6%",      "2.5%",    "BEA",               None),
    (date(2026, 6, 27), "Personal Income (May)",       "+0.3%",     "+0.4%",   "BEA",               None),
    (date(2026, 7,  1), "ISM Manufacturing (Jun)",     "48.5",      "49.0",    "ISM",               None),
    (date(2026, 7,  4), "Independence Day (Closed)",   "",          "",        "",                  None),
    (date(2026, 7, 10), "CPI (June)",                  "2.9%",      "2.8%",    "BLS",               None),
    (date(2026, 7, 15), "Housing Starts (June)",       "1.361M",    "1.375M",  "Census/HUD",        None),
    (date(2026, 7, 16), "Retail Sales (June)",         "+0.1%",     "+0.3%",   "Census",            None),
    (date(2026, 7, 22), "Existing Home Sales (June)",  "4.08M",     "4.10M",   "NAR",               None),
    (date(2026, 7, 29), "JOLTS (May)",                 "7.19M",     "7.22M",   "BLS",               None),
    (date(2026, 7, 29), "FOMC Rate Decision",          "4.25-4.50%","No Change","Federal Reserve",  None),
    (date(2026, 7, 31), "PCE Inflation (June)",        "2.5%",      "2.4%",    "BEA",               None),
]

from pyspark.sql.types import TimestampType
upcoming_schema = StructType([
    StructField("release_date", DateType(),   False),
    StructField("name",         StringType(), False),
    StructField("prior",        StringType(), True),
    StructField("consensus",    StringType(), True),
    StructField("source",       StringType(), True),
    StructField("actual",       StringType(), True),
])

df_upcoming = spark.createDataFrame(upcoming_data, schema=upcoming_schema)
df_upcoming.write.format("delta").mode("overwrite").saveAsTable("econ.dashboard.upcoming_releases")
print(f"Seeded {df_upcoming.count()} upcoming releases")

# ── Recent releases ───────────────────────────────────────────────────────────

recent_data = [
    ("Freddie Mac",    "Mortgage Rates (30yr)",           "6.79%",      date(2026, 6, 19)),
    ("BLS / DOL",      "Initial Claims (wk Jun 14)",      "218K",       date(2026, 6, 19)),
    ("BLS / DOL",      "CPI (May, YoY)",                  "2.9%",       date(2026, 6, 11)),
    ("BLS / DOL",      "PPI (May, YoY)",                  "2.4%",       date(2026, 6, 12)),
    ("BLS / DOL",      "Nonfarm Payrolls",                "+177K",      date(2026, 6,  6)),
    ("MBA",            "Purchase Index (wk Jun 13)",      "150.2 SA",   date(2026, 6, 18)),
    ("MBA",            "Refinance Index (wk Jun 13)",     "621.8 SA",   date(2026, 6, 18)),
    ("MBA",            "ARM Share",                       "8.3%",       date(2026, 6, 18)),
    ("NAR",            "Existing Home Sales (May)",       "4.08M SAAR", date(2026, 6, 20)),
    ("BEA",            "PCE (Apr, YoY)",                  "2.6%",       date(2026, 5, 30)),
    ("BEA",            "GDP Q1 Second Est.",              "+1.2%",      date(2026, 5, 29)),
    ("Altos Research", "Seattle Active Inventory",        "3,241",      date(2026, 6, 13)),
    ("Altos Research", "Seattle New Listings",            "892/wk",     date(2026, 6, 13)),
    ("Altos Research", "Seattle Pending Sales",           "1,104/wk",   date(2026, 6, 13)),
    ("Redfin",         "Seattle Median Sale Price",       "$875K",      date(2026, 6,  1)),
    ("Redfin",         "Seattle Days on Market",          "18 days",    date(2026, 6, 13)),
    ("WA ESD",         "WA Initial Claims",               "9,840",      date(2026, 6, 19)),
    ("WA ESD",         "Seattle Metro Unemployment",      "3.8%",       date(2026, 5, 31)),
]

recent_schema = StructType([
    StructField("source",       StringType(), False),
    StructField("name",         StringType(), False),
    StructField("value",        StringType(), False),
    StructField("release_date", DateType(),   False),
])

df_recent = spark.createDataFrame(recent_data, schema=recent_schema)
df_recent.write.format("delta").mode("overwrite").saveAsTable("econ.dashboard.recent_releases")
print(f"Seeded {df_recent.count()} recent release rows")

print("\n✓ All tables seeded. Run 03_deploy_endpoint.py next.")
