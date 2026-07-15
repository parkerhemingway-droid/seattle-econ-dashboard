# Databricks notebook — Boise MLS metrics aggregation
# Run daily to update econ.boise.metrics_by_zip and metrics_headline
# Data source: main.gold_mls.search_listings (Ada + Canyon County, ID)

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from datetime import date

spark = SparkSession.builder.getOrCreate()

TODAY = date.today().isoformat()

print(f"Computing Boise MLS metrics for {TODAY}...")

# ── Fetch active and pending listings from IMLS ──────────────────────────────

df = spark.sql("""
  SELECT
    zipcode,
    city,
    county,
    listing_status,
    sale_status,
    list_price,
    current_price,
    close_price,
    days_on_market_from_feed,
    price_per_square_foot,
    list_date,
    close_date,
    last_modified_date
  FROM main.gold_mls.search_listings
  WHERE county IN ('Ada', 'Canyon')
    AND state = 'ID'
    AND zipcode IS NOT NULL
    AND is_deleted = false
    AND property_type_aggregated = 'Residential'
""")

df.cache()

# ── Metrics by zip code ──────────────────────────────────────────────────────

zip_metrics = df.groupBy('zipcode', 'city', 'county').agg(
    percentile_approx(col('list_price'),     0.5).alias('median_list_price'),
    percentile_approx(col('close_price'),    0.5).alias('median_close_price'),
    percentile_approx(col('current_price'),  0.5).alias('median_current_price'),
    avg(col('price_per_square_foot')).alias('avg_price_per_sqft'),

    # Active listings (status = 'Active')
    countif(col('listing_status') == 'Active').alias('active_listings'),

    # Pending listings (status = 'Pending' or 'Under Contract')
    countif((col('listing_status') == 'Pending') | (col('listing_status') == 'Under Contract')).alias('pending_listings'),

    # Closed sales (last 30 days)
    countif((col('sale_status') == 'Closed') & (datediff(to_date(lit(TODAY)), col('close_date')) <= 30)).alias('closed_sales_30d'),

    # Closed sales (last 60 days)
    countif((col('sale_status') == 'Closed') & (datediff(to_date(lit(TODAY)), col('close_date')) <= 60)).alias('closed_sales_60d'),

    # DOM metrics
    percentile_approx(col('days_on_market_from_feed'), 0.5).alias('median_dom'),
    avg(col('days_on_market_from_feed')).alias('avg_dom'),

    count(lit(1)).alias('total_listings')
).withColumn('metric_date', to_date(lit(TODAY)))

# Sale-to-list ratio: median(close_price / list_price) * 100
zip_metrics = zip_metrics.withColumn(
    'sale_to_list_ratio',
    when(col('median_list_price').isNotNull() & (col('median_list_price') > 0),
         (col('median_close_price') / col('median_list_price')) * 100
    ).otherwise(None)
)

# Months of supply: active / (closed_sales_30d / 30) * 30
zip_metrics = zip_metrics.withColumn(
    'months_supply',
    when((col('closed_sales_30d') > 0) & (col('active_listings') > 0),
         (col('active_listings') / (col('closed_sales_30d') / 30.0))
    ).otherwise(None)
)

# Select final columns
zip_metrics = zip_metrics.select(
    'zipcode', 'city', 'county',
    'median_list_price', 'median_close_price', 'median_current_price', 'avg_price_per_sqft',
    'active_listings', 'pending_listings', 'closed_sales_30d', 'closed_sales_60d',
    'median_dom', 'avg_dom', 'sale_to_list_ratio', 'months_supply',
    'metric_date'
)

# UPSERT into econ.boise.metrics_by_zip
zip_metrics.write.format('delta').mode('overwrite') \
    .option('mergeSchema', 'true') \
    .saveAsTable('econ.boise.metrics_by_zip')

print(f"  ✓ Inserted {zip_metrics.count()} zip codes")

# ── County-level headline metrics ────────────────────────────────────────────

# Ada County
ada = df.filter(col('county') == 'Ada').agg(
    percentile_approx(col('list_price'),     0.5).alias('ada_median_list_price'),
    percentile_approx(col('close_price'),    0.5).alias('ada_median_close_price'),
    countif(col('listing_status') == 'Active').alias('ada_active_listings'),
    countif((col('listing_status') == 'Pending') | (col('listing_status') == 'Under Contract')).alias('ada_pending_listings'),
    countif((col('sale_status') == 'Closed') & (datediff(to_date(lit(TODAY)), col('close_date')) <= 30)).alias('ada_closed_sales_30d'),
    percentile_approx(col('days_on_market_from_feed'), 0.5).alias('ada_median_dom'),
)

# Canyon County
canyon = df.filter(col('county') == 'Canyon').agg(
    percentile_approx(col('list_price'),     0.5).alias('canyon_median_list_price'),
    percentile_approx(col('close_price'),    0.5).alias('canyon_median_close_price'),
    countif(col('listing_status') == 'Active').alias('canyon_active_listings'),
    countif((col('listing_status') == 'Pending') | (col('listing_status') == 'Under Contract')).alias('canyon_pending_listings'),
    countif((col('sale_status') == 'Closed') & (datediff(to_date(lit(TODAY)), col('close_date')) <= 30)).alias('canyon_closed_sales_30d'),
    percentile_approx(col('days_on_market_from_feed'), 0.5).alias('canyon_median_dom'),
)

# Combined (Ada + Canyon)
combined = df.agg(
    percentile_approx(col('list_price'),     0.5).alias('combined_median_list_price'),
    percentile_approx(col('close_price'),    0.5).alias('combined_median_close_price'),
    countif(col('listing_status') == 'Active').alias('combined_active_listings'),
    countif((col('listing_status') == 'Pending') | (col('listing_status') == 'Under Contract')).alias('combined_pending_listings'),
    countif((col('sale_status') == 'Closed') & (datediff(to_date(lit(TODAY)), col('close_date')) <= 30)).alias('combined_closed_sales_30d'),
    percentile_approx(col('days_on_market_from_feed'), 0.5).alias('combined_median_dom'),
)

# Merge into single row with metric_date
headline = ada.crossJoin(canyon).crossJoin(combined) \
    .withColumn('metric_date', to_date(lit(TODAY)))

headline.write.format('delta').mode('overwrite') \
    .option('mergeSchema', 'true') \
    .saveAsTable('econ.boise.metrics_headline')

print(f"  ✓ Updated headline metrics")
print(f"\n✓ Boise metrics complete — {TODAY}")
