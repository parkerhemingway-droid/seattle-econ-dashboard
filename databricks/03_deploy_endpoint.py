# Databricks notebook — deploy the dashboard data serving endpoint.
# Run after 01_create_tables.sql and 02_seed_current_data.py.
#
# This creates an MLflow pyfunc model that reads from the Delta tables
# and returns JSON consumed by databricks-data.js in the dashboard.
#
# After deployment, enter the endpoint name in the dashboard sidebar's
# "Data Endpoint Name" field (e.g. "dashboard-data").

import mlflow
import mlflow.pyfunc
import pandas as pd
import json
from datetime import datetime

# ── 1. Define the model ───────────────────────────────────────────────────────

class DashboardDataModel(mlflow.pyfunc.PythonModel):
    """
    Reads econ.dashboard.* Delta tables and returns structured JSON
    for the Seattle Economic Dashboard frontend.

    Request (Databricks serving invocations format):
        { "inputs": { "request": ["all"] } }

    Response:
        { "predictions": ["<JSON string>"] }

    JSON payload shape:
        {
          "today": "YYYY-MM-DD",
          "metrics": [{ "id", "value", "period_change", "yoy_change", "date" }, ...],
          "upcomingReleases": [{ "date", "name", "prior", "consensus", "source", "actual" }, ...],
          "recentReleases": { "Source": [{ "name", "value", "date" }, ...], ... }
        }
    """

    def predict(self, context, model_input, params=None):
        from pyspark.sql import SparkSession

        spark = SparkSession.builder.getOrCreate()

        # Metrics — only the dynamic fields the frontend needs
        metrics_df = spark.sql("""
            SELECT
                id,
                value,
                period_change,
                yoy_change,
                DATE_FORMAT(metric_date, 'yyyy-MM-dd') AS date
            FROM econ.dashboard.metrics
        """).toPandas()

        # Upcoming releases — future dates only
        upcoming_df = spark.sql("""
            SELECT
                DATE_FORMAT(release_date, 'yyyy-MM-dd') AS date,
                name,
                COALESCE(prior, '')     AS prior,
                COALESCE(consensus, '') AS consensus,
                COALESCE(source, '')    AS source,
                actual
            FROM econ.dashboard.upcoming_releases
            WHERE release_date >= CURRENT_DATE()
            ORDER BY release_date
        """).toPandas()
        # Replace NaN actuals with None for clean JSON
        upcoming_df['actual'] = upcoming_df['actual'].where(upcoming_df['actual'].notna(), None)

        # Recent releases — grouped by source
        recent_df = spark.sql("""
            SELECT
                source,
                name,
                value,
                DATE_FORMAT(release_date, 'yyyy-MM-dd') AS date
            FROM econ.dashboard.recent_releases
            ORDER BY source, release_date DESC
        """).toPandas()

        recent = {}
        for _, row in recent_df.iterrows():
            src = row['source']
            if src not in recent:
                recent[src] = []
            if len(recent[src]) < 6:
                recent[src].append({
                    'name':  row['name'],
                    'value': row['value'],
                    'date':  row['date'],
                })

        payload = {
            'today':            datetime.now().strftime('%Y-%m-%d'),
            'metrics':          metrics_df.to_dict('records'),
            'upcomingReleases': upcoming_df.to_dict('records'),
            'recentReleases':   recent,
        }

        return pd.DataFrame([{'result': json.dumps(payload, default=str)}])


# ── 2. Log the model to MLflow ────────────────────────────────────────────────

EXPERIMENT_NAME = "/Shared/seattle-econ-dashboard"
mlflow.set_experiment(EXPERIMENT_NAME)

with mlflow.start_run(run_name="dashboard-data-v1") as run:
    mlflow.pyfunc.log_model(
        artifact_path="dashboard_data",
        python_model=DashboardDataModel(),
        # No extra pip packages needed — uses workspace Spark session
    )
    model_uri = f"runs:/{run.info.run_id}/dashboard_data"
    print(f"Model logged: {model_uri}")

# Register the model in Unity Catalog
registered = mlflow.register_model(
    model_uri=model_uri,
    name="econ.dashboard.dashboard_data_model",
)
print(f"Registered version: {registered.version}")


# ── 3. Deploy the serving endpoint ───────────────────────────────────────────
# Uses the Databricks SDK (pre-installed on DBR 13+)

from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import (
    EndpointCoreConfigInput,
    ServedModelInput,
    ServedModelInputWorkloadSize,
)

w = WorkspaceClient()
ENDPOINT_NAME = "dashboard-data"  # This is what you enter in the sidebar

endpoint_config = EndpointCoreConfigInput(
    served_models=[
        ServedModelInput(
            model_name="econ.dashboard.dashboard_data_model",
            model_version=str(registered.version),
            workload_size=ServedModelInputWorkloadSize.SMALL,
            scale_to_zero_enabled=True,
        )
    ]
)

try:
    # Create new endpoint
    ep = w.serving_endpoints.create_and_wait(
        name=ENDPOINT_NAME,
        config=endpoint_config,
    )
    print(f"\n✓ Endpoint '{ENDPOINT_NAME}' created and ready.")
except Exception as e:
    if "already exists" in str(e).lower():
        # Update existing endpoint
        ep = w.serving_endpoints.update_config_and_wait(
            name=ENDPOINT_NAME,
            served_models=endpoint_config.served_models,
        )
        print(f"\n✓ Endpoint '{ENDPOINT_NAME}' updated.")
    else:
        raise

print(f"\nEnter '{ENDPOINT_NAME}' in the dashboard sidebar > Data Endpoint Name.")
print(f"Use the same Workspace URL and Token already configured for AI signals.")
