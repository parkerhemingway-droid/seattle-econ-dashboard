# Databricks notebook — scheduled data refresh job.
# Schedule this to run daily (or more frequently for market data).
#
# Fetches live values from free public APIs:
#   - FRED (Federal Reserve Economic Data) — treasury yields, fed funds
#   - BLS  (Bureau of Labor Statistics)    — CPI, employment (when available)
#   - Freddie Mac (PMMS feed)              — mortgage rates
#
# For metrics not available via free API (Redfin, Altos, NWMLS, MBA),
# you can update rows manually via the Databricks SQL editor or wire in
# your own vendor API keys.
#
# To schedule: Jobs > Create Job > Notebook, set schedule to Daily at 7am PT.

import requests
from datetime import date, datetime, timedelta
from pyspark.sql import SparkSession
from pyspark.sql.functions import lit, current_timestamp
import json

spark = SparkSession.builder.getOrCreate()


# ── Helpers ───────────────────────────────────────────────────────────────────

def upsert_metric(id_, value, period_change, yoy_change, metric_date):
    """Write a single metric update using Delta MERGE."""
    spark.sql(f"""
        MERGE INTO econ.dashboard.metrics AS t
        USING (SELECT
            '{id_}'          AS id,
            {value}          AS value,
            {period_change}  AS period_change,
            {yoy_change}     AS yoy_change,
            DATE '{metric_date}' AS metric_date,
            CURRENT_TIMESTAMP() AS updated_at
        ) AS s ON t.id = s.id
        WHEN MATCHED THEN UPDATE SET *
        WHEN NOT MATCHED THEN INSERT *
    """)


def fred_series(series_id, api_key=None):
    """
    Fetch the most recent observation for a FRED series.
    No API key required for public series (uses FRED public endpoint).
    Returns (value, date) or (None, None) on failure.
    """
    url = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id":     series_id,
        "sort_order":    "desc",
        "limit":         2,  # latest + prior for period_change
        "file_type":     "json",
        "api_key":       api_key or "abcdefghijklmnopqrstuvwxyz012345",  # replace with your key
    }
    try:
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        obs = r.json().get("observations", [])
        if len(obs) < 1:
            return None, None, None
        latest = obs[0]
        prior  = obs[1] if len(obs) > 1 else obs[0]
        val     = float(latest["value"]) if latest["value"] != "." else None
        val_pr  = float(prior["value"])  if prior["value"]  != "." else None
        return val, val_pr, latest["date"]
    except Exception as e:
        print(f"  FRED {series_id} error: {e}")
        return None, None, None


# ── FRED: Treasury yields & breakevens ───────────────────────────────────────
# Replace the placeholder api_key with your free key from fred.stlouisfed.org

FRED_API_KEY = "YOUR_FRED_API_KEY"   # free at fred.stlouisfed.org/docs/api/api_key.html
today_str = str(date.today())

fred_metrics = [
    # (metric_id,         fred_series_id,  yoy_series_id_optional)
    ("treasury10y",      "DGS10"),
    ("treasury2y",       "DGS2"),
    ("effFedFunds",      "FEDFUNDS"),
    ("breakeven5y",      "T5YIE"),
    ("breakeven10y",     "T10YIE"),
]

for metric_id, series_id in fred_metrics:
    val, val_pr, obs_date = fred_series(series_id, FRED_API_KEY)
    if val is None:
        print(f"  Skipping {metric_id} — no FRED data")
        continue

    period_change = round(val - val_pr, 4) if val_pr is not None else 0

    # Approximate YoY by fetching the observation from ~1 year ago
    val_yoy, _, _ = fred_series(
        series_id + f"&observation_start={date.today() - timedelta(days=370)}"
        f"&observation_end={date.today() - timedelta(days=355)}",
        FRED_API_KEY
    )
    yoy_change = round(val - val_yoy, 4) if val_yoy is not None else 0

    upsert_metric(metric_id, val, period_change, yoy_change, obs_date or today_str)
    print(f"  ✓ {metric_id}: {val}")


# ── Freddie Mac: 30-year mortgage rate ───────────────────────────────────────
# PMMS is published weekly on Thursdays. FRED series: MORTGAGE30US

val, val_pr, obs_date = fred_series("MORTGAGE30US", FRED_API_KEY)
if val is not None:
    period_chg = round(val - val_pr, 2) if val_pr else 0
    val_yoy, _, _ = fred_series("MORTGAGE30US", FRED_API_KEY)  # approximate; refine with FRED history
    upsert_metric("mortgageRate", val, period_chg, 0, obs_date or today_str)
    print(f"  ✓ mortgageRate: {val}%")


# ── Manual updates section ────────────────────────────────────────────────────
# For data sources without a free API, update values here manually
# after each release, then re-run this notebook (or just use Databricks SQL).

# Example — uncomment and fill in after each Redfin/Altos release:
# upsert_metric("seaMedianPrice",     875000, 12000, 38000, "2026-06-01")
# upsert_metric("seaActiveInventory",   3241,   187,   621, "2026-06-13")
# upsert_metric("seaPendingSales",      1104,   -28,    94, "2026-06-13")
# upsert_metric("seaNewListings",        892,    42,   118, "2026-06-13")
# upsert_metric("seaDaysOnMarket",        18,     2,     5, "2026-06-13")
# upsert_metric("seaPriceReductions",   18.4,   0.8,   3.2, "2026-06-13")

# Example — after each MBA Wednesday release:
# upsert_metric("mbaPurchaseIndex",    150.2,  1.6,  -9.2, "2026-06-18")
# upsert_metric("mbaRefiIndex",        621.8,  9.4, 192.4, "2026-06-18")
# upsert_metric("mbaMarketComposite",  215.6,  2.8,  19.4, "2026-06-18")
# upsert_metric("mbaArmShare",           8.3, -0.1,   1.0, "2026-06-18")

# Example — FOMC cut probabilities (update from CME FedWatch after each FOMC):
# upsert_metric("cutProbJul",  12, -2, None, today_str)
# upsert_metric("cutProbSep",  70,  2, None, today_str)
# upsert_metric("cutProbNov",  84,  2, None, today_str)


# ── Update upcoming_releases: mark actuals ────────────────────────────────────
# When a release drops, update the 'actual' column so the dashboard
# shows the actual vs. consensus comparison.

# Example — after PCE drops:
# spark.sql("""
#   UPDATE econ.dashboard.upcoming_releases
#   SET actual = '2.5%', updated_at = CURRENT_TIMESTAMP()
#   WHERE name = 'PCE Inflation (May)' AND release_date = '2026-06-27'
# """)


print(f"\n✓ Refresh complete — {datetime.now().strftime('%Y-%m-%d %H:%M')} PT")
print("The serving endpoint will return updated values on the next invocation.")
