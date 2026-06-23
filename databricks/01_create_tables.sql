-- Seattle Economic Dashboard — Unity Catalog setup
-- Run this once in a Databricks SQL Warehouse or notebook (%sql cell).
-- Replace 'econ' with your preferred catalog name throughout.

CREATE CATALOG IF NOT EXISTS econ;
CREATE SCHEMA  IF NOT EXISTS econ.dashboard;

-- ── Core metrics table ────────────────────────────────────────────────────────
-- One row per metric ID. Updated by the refresh job (03_refresh_data.py).

CREATE TABLE IF NOT EXISTS econ.dashboard.metrics (
  id             STRING  NOT NULL  COMMENT 'Matches ALL_METRICS key in data.js',
  value          DOUBLE            COMMENT 'Current value',
  period_change  DOUBLE            COMMENT 'Change from prior period (WoW / MoM)',
  yoy_change     DOUBLE            COMMENT 'Year-over-year change',
  metric_date    DATE              COMMENT 'As-of date for this reading',
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  CONSTRAINT pk_metrics PRIMARY KEY (id)
)
USING DELTA
TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');

-- ── Upcoming releases ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS econ.dashboard.upcoming_releases (
  release_date  DATE    NOT NULL,
  name          STRING  NOT NULL,
  prior         STRING,
  consensus     STRING,
  source        STRING,
  actual        STRING  COMMENT 'Filled in once the release drops',
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
USING DELTA;

-- ── Recent releases ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS econ.dashboard.recent_releases (
  source        STRING  NOT NULL,
  name          STRING  NOT NULL,
  value         STRING  NOT NULL,
  release_date  DATE    NOT NULL,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
USING DELTA;

-- ── Grant read access (adjust principal to your service principal / group) ─────
-- GRANT SELECT ON econ.dashboard.metrics          TO `dashboard-readers`;
-- GRANT SELECT ON econ.dashboard.upcoming_releases TO `dashboard-readers`;
-- GRANT SELECT ON econ.dashboard.recent_releases   TO `dashboard-readers`;
