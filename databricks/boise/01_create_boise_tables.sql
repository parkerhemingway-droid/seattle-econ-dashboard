-- Boise MLS Market Analysis — Unity Catalog setup
-- Run this once to create tables for Ada + Canyon County metrics

CREATE CATALOG IF NOT EXISTS econ;
CREATE SCHEMA  IF NOT EXISTS econ.boise;

-- ── Boise metrics by zip code ────────────────────────────────────────────────
-- Aggregated from main.gold_mls.search_listings
-- Updated daily by 02_boise_metrics.py

CREATE TABLE IF NOT EXISTS econ.boise.metrics_by_zip (
  zipcode                STRING  NOT NULL,
  city                   STRING,
  county                 STRING  NOT NULL,
  metric_date            DATE    NOT NULL,

  -- Pricing
  median_list_price      DOUBLE,
  median_close_price     DOUBLE,
  median_current_price   DOUBLE,
  avg_price_per_sqft     DOUBLE,

  -- Market activity
  active_listings        BIGINT,
  pending_listings       BIGINT,
  closed_sales_30d       BIGINT,
  closed_sales_60d       BIGINT,

  -- Days on market
  median_dom             DOUBLE,
  avg_dom                DOUBLE,

  -- Sale-to-list ratio (%)
  sale_to_list_ratio     DOUBLE,

  -- Inventory metrics
  months_supply          DOUBLE,

  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  CONSTRAINT pk_boise_zip PRIMARY KEY (zipcode, metric_date)
)
USING DELTA
TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');

-- ── County-level headline metrics ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS econ.boise.metrics_headline (
  metric_date            DATE    NOT NULL PRIMARY KEY,

  -- Ada County
  ada_median_list_price      DOUBLE,
  ada_median_close_price     DOUBLE,
  ada_active_listings        BIGINT,
  ada_pending_listings       BIGINT,
  ada_closed_sales_30d       BIGINT,
  ada_median_dom             DOUBLE,

  -- Canyon County
  canyon_median_list_price   DOUBLE,
  canyon_median_close_price  DOUBLE,
  canyon_active_listings     BIGINT,
  canyon_pending_listings    BIGINT,
  canyon_closed_sales_30d    BIGINT,
  canyon_median_dom          DOUBLE,

  -- Combined Ada + Canyon (Boise MSA)
  combined_median_list_price DOUBLE,
  combined_median_close_price DOUBLE,
  combined_active_listings   BIGINT,
  combined_pending_listings  BIGINT,
  combined_closed_sales_30d  BIGINT,
  combined_median_dom        DOUBLE,

  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
USING DELTA;
