# Databricks notebook — Deploy Boise MLS serving endpoint
# Serves econ.boise.metrics_by_zip as JSON for the dashboard

import mlflow
import mlflow.pyfunc
import pandas as pd
import json
from datetime import datetime

# ── Define the model ─────────────────────────────────────────────────────────

class BoiseDataModel(mlflow.pyfunc.PythonModel):
    """
    Serves Boise MLS metrics by zip code + headline stats.

    Request: { "inputs": { "request": ["all"] } }
    Response: { "predictions": ["<JSON string>"] }

    JSON payload:
        {
          "metric_date": "2026-07-15",
          "headline": { ada: {...}, canyon: {...}, combined: {...} },
          "by_zip": [
            { "zipcode": "83702", "city": "Boise", "county": "Ada",
              "median_list_price": 425000, "median_close_price": 410000, ... },
            ...
          ]
        }
    """

    def predict(self, context, model_input, params=None):
        from pyspark.sql import SparkSession

        spark = SparkSession.builder.getOrCreate()

        # Fetch headline metrics (most recent)
        headline_df = spark.sql("""
            SELECT
                ada_median_list_price, ada_median_close_price,
                ada_active_listings, ada_pending_listings,
                ada_closed_sales_30d, ada_median_dom,
                canyon_median_list_price, canyon_median_close_price,
                canyon_active_listings, canyon_pending_listings,
                canyon_closed_sales_30d, canyon_median_dom,
                combined_median_list_price, combined_median_close_price,
                combined_active_listings, combined_pending_listings,
                combined_closed_sales_30d, combined_median_dom,
                metric_date
            FROM econ.boise.metrics_headline
            ORDER BY metric_date DESC
            LIMIT 1
        """).toPandas()

        # Fetch all zip code metrics (most recent)
        zip_df = spark.sql("""
            SELECT
                zipcode, city, county,
                median_list_price, median_close_price, median_current_price,
                avg_price_per_sqft,
                active_listings, pending_listings,
                closed_sales_30d, closed_sales_60d,
                median_dom, avg_dom,
                sale_to_list_ratio, months_supply,
                metric_date
            FROM econ.boise.metrics_by_zip
            WHERE metric_date = (SELECT MAX(metric_date) FROM econ.boise.metrics_by_zip)
            ORDER BY zipcode
        """).toPandas()

        # Build headline dict
        headline = {}
        if not headline_df.empty:
            row = headline_df.iloc[0]
            headline = {
                'ada': {
                    'median_list_price': float(row['ada_median_list_price'] or 0),
                    'median_close_price': float(row['ada_median_close_price'] or 0),
                    'active_listings': int(row['ada_active_listings'] or 0),
                    'pending_listings': int(row['ada_pending_listings'] or 0),
                    'closed_sales_30d': int(row['ada_closed_sales_30d'] or 0),
                    'median_dom': float(row['ada_median_dom'] or 0),
                },
                'canyon': {
                    'median_list_price': float(row['canyon_median_list_price'] or 0),
                    'median_close_price': float(row['canyon_median_close_price'] or 0),
                    'active_listings': int(row['canyon_active_listings'] or 0),
                    'pending_listings': int(row['canyon_pending_listings'] or 0),
                    'closed_sales_30d': int(row['canyon_closed_sales_30d'] or 0),
                    'median_dom': float(row['canyon_median_dom'] or 0),
                },
                'combined': {
                    'median_list_price': float(row['combined_median_list_price'] or 0),
                    'median_close_price': float(row['combined_median_close_price'] or 0),
                    'active_listings': int(row['combined_active_listings'] or 0),
                    'pending_listings': int(row['combined_pending_listings'] or 0),
                    'closed_sales_30d': int(row['combined_closed_sales_30d'] or 0),
                    'median_dom': float(row['combined_median_dom'] or 0),
                },
                'metric_date': str(row['metric_date']),
            }

        # Build zip metrics list
        by_zip = []
        for _, row in zip_df.iterrows():
            by_zip.append({
                'zipcode': row['zipcode'],
                'city': row['city'],
                'county': row['county'],
                'median_list_price': float(row['median_list_price'] or 0),
                'median_close_price': float(row['median_close_price'] or 0),
                'median_current_price': float(row['median_current_price'] or 0),
                'avg_price_per_sqft': float(row['avg_price_per_sqft'] or 0),
                'active_listings': int(row['active_listings'] or 0),
                'pending_listings': int(row['pending_listings'] or 0),
                'closed_sales_30d': int(row['closed_sales_30d'] or 0),
                'closed_sales_60d': int(row['closed_sales_60d'] or 0),
                'median_dom': float(row['median_dom'] or 0),
                'avg_dom': float(row['avg_dom'] or 0),
                'sale_to_list_ratio': float(row['sale_to_list_ratio'] or 0),
                'months_supply': float(row['months_supply'] or 0),
            })

        payload = {
            'headline': headline,
            'by_zip': by_zip,
        }

        return pd.DataFrame([{'result': json.dumps(payload, default=str)}])


# ── Log and register ──────────────────────────────────────────────────────────

EXPERIMENT_NAME = "/Shared/seattle-econ-dashboard"
mlflow.set_experiment(EXPERIMENT_NAME)

with mlflow.start_run(run_name="boise-data-v1") as run:
    mlflow.pyfunc.log_model(
        artifact_path="boise_data",
        python_model=BoiseDataModel(),
    )
    model_uri = f"runs:/{run.info.run_id}/boise_data"
    print(f"Model logged: {model_uri}")

registered = mlflow.register_model(
    model_uri=model_uri,
    name="econ.boise.boise_data_model",
)
print(f"Registered version: {registered.version}")


# ── Deploy serving endpoint ───────────────────────────────────────────────────

from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import (
    EndpointCoreConfigInput,
    ServedModelInput,
    ServedModelInputWorkloadSize,
)

w = WorkspaceClient()
ENDPOINT_NAME = "boise-mls-data"

endpoint_config = EndpointCoreConfigInput(
    served_models=[
        ServedModelInput(
            model_name="econ.boise.boise_data_model",
            model_version=str(registered.version),
            workload_size=ServedModelInputWorkloadSize.SMALL,
            scale_to_zero_enabled=True,
        )
    ]
)

try:
    ep = w.serving_endpoints.create_and_wait(
        name=ENDPOINT_NAME,
        config=endpoint_config,
    )
    print(f"\n✓ Endpoint '{ENDPOINT_NAME}' created and ready.")
except Exception as e:
    if "already exists" in str(e).lower():
        ep = w.serving_endpoints.update_config_and_wait(
            name=ENDPOINT_NAME,
            served_models=endpoint_config.served_models,
        )
        print(f"\n✓ Endpoint '{ENDPOINT_NAME}' updated.")
    else:
        raise

print(f"\nEndpoint: {ENDPOINT_NAME}")
print(f"Use this in the dashboard to fetch live Boise MLS data.")
