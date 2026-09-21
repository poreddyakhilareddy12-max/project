"""
ASTRA-SAFE Asteroid Database & Telemetry Service
Provides fast in-memory querying, filtering, sorting, pagination, and statistical distribution computations
over the NASA/JPL Near-Earth Object catalog.
"""

import math
from typing import Optional, List, Dict, Any
import numpy as np
import pandas as pd
from ml.dataset import load_dataset
from app.services.ml_service import ml_service


class AsteroidDBService:
    _instance = None

    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.load_data()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = AsteroidDBService()
        return cls._instance

    def load_data(self):
        try:
            self.df = load_dataset()
            print(f"[AsteroidDBService] Loaded {len(self.df)} asteroid records into catalog memory.")
        except Exception as e:
            print(f"[AsteroidDBService] Error loading dataset: {e}")
            self.df = pd.DataFrame()

    def get_asteroids(
        self,
        search: Optional[str] = None,
        hazard_filter: Optional[str] = None,  # "all", "hazardous", "non_hazardous"
        sort_by: str = "estimated_diameter_km",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 15
    ) -> Dict[str, Any]:
        if self.df is None or self.df.empty:
            self.load_data()

        df_filtered = self.df.copy()

        # Text search
        if search and search.strip():
            query = search.strip().lower()
            df_filtered = df_filtered[
                df_filtered["name"].str.lower().str.contains(query, na=False) |
                df_filtered["id"].astype(str).str.lower().str.contains(query, na=False) |
                df_filtered["orbit_class"].str.lower().str.contains(query, na=False)
            ]

        # Hazard filter
        if hazard_filter == "hazardous":
            df_filtered = df_filtered[df_filtered["is_hazardous"] == 1]
        elif hazard_filter == "non_hazardous":
            df_filtered = df_filtered[df_filtered["is_hazardous"] == 0]

        total_count = len(df_filtered)
        hazardous_count = int((df_filtered["is_hazardous"] == 1).sum())
        non_hazardous_count = int((df_filtered["is_hazardous"] == 0).sum())

        # Sort
        ascending = (sort_order.lower() == "asc")
        if sort_by in df_filtered.columns:
            df_filtered = df_filtered.sort_values(by=sort_by, ascending=ascending)

        # Pagination
        total_pages = max(1, math.ceil(total_count / page_size))
        current_page = max(1, min(page, total_pages))
        start_idx = (current_page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = df_filtered.iloc[start_idx:end_idx].to_dict(orient="records")

        return {
            "total_count": total_count,
            "page": current_page,
            "page_size": page_size,
            "total_pages": total_pages,
            "hazardous_count": hazardous_count,
            "non_hazardous_count": non_hazardous_count,
            "asteroids": page_records
        }

    def get_asteroid_by_id(self, asteroid_id: str) -> Optional[Dict[str, Any]]:
        if self.df is None or self.df.empty:
            self.load_data()

        matches = self.df[self.df["id"].astype(str) == str(asteroid_id)]
        if matches.empty:
            # Try searching in name
            matches = self.df[self.df["name"].str.contains(str(asteroid_id), case=False, na=False)]

        if matches.empty:
            return None

        record = matches.iloc[0].to_dict()

        # Run through ML model for live prediction & attribution
        try:
            pred_res = ml_service.predict(record)
            record["ml_analysis"] = pred_res
        except Exception as e:
            record["ml_analysis"] = {"error": str(e)}

        return record

    def get_distributions(self) -> Dict[str, Any]:
        """
        Calculates histogram distributions and statistical summaries for key features,
        partitioned by Hazardous vs Non-Hazardous objects.
        """
        if self.df is None or self.df.empty:
            self.load_data()

        features = [
            {"key": "estimated_diameter_km", "label": "Diameter (km)", "unit": "km", "bins": 18, "log": True},
            {"key": "relative_velocity_kms", "label": "Relative Velocity (km/s)", "unit": "km/s", "bins": 18, "log": False},
            {"key": "miss_distance_km", "label": "Miss Distance (km)", "unit": "km", "bins": 18, "log": True},
            {"key": "eccentricity", "label": "Eccentricity", "unit": "ratio", "bins": 18, "log": False},
            {"key": "inclination_deg", "label": "Inclination (°)", "unit": "°", "bins": 18, "log": False},
            {"key": "orbital_period_days", "label": "Orbital Period (days)", "unit": "days", "bins": 18, "log": False}
        ]

        distributions = {}

        for feat in features:
            key = feat["key"]
            s_all = self.df[key].dropna()
            s_haz = self.df[self.df["is_hazardous"] == 1][key].dropna()
            s_safe = self.df[self.df["is_hazardous"] == 0][key].dropna()

            # Compute bin edges across full range
            min_val = float(s_all.min())
            max_val = float(s_all.max())

            if feat["log"] and min_val > 0:
                bin_edges = np.geomspace(max(min_val, 1e-4), max_val, feat["bins"] + 1)
            else:
                bin_edges = np.linspace(min_val, max_val, feat["bins"] + 1)

            counts_haz, _ = np.histogram(s_haz, bins=bin_edges)
            counts_safe, _ = np.histogram(s_safe, bins=bin_edges)

            histogram_data = []
            for i in range(len(counts_haz)):
                low = bin_edges[i]
                high = bin_edges[i + 1]
                mid = (low + high) / 2.0
                label = f"{low:.2f}-{high:.2f}" if high < 100 else f"{low:,.0f}-{high:,.0f}"
                histogram_data.append({
                    "range_label": label,
                    "midpoint": round(float(mid), 3),
                    "hazardous_count": int(counts_haz[i]),
                    "non_hazardous_count": int(counts_safe[i]),
                    "total_count": int(counts_haz[i] + counts_safe[i])
                })

            distributions[key] = {
                "key": key,
                "label": feat["label"],
                "unit": feat["unit"],
                "statistics": {
                    "mean_all": round(float(s_all.mean()), 3),
                    "mean_hazardous": round(float(s_haz.mean()), 3) if not s_haz.empty else 0.0,
                    "mean_non_hazardous": round(float(s_safe.mean()), 3) if not s_safe.empty else 0.0,
                    "median_all": round(float(s_all.median()), 3),
                    "std_all": round(float(s_all.std()), 3),
                    "min": round(min_val, 3),
                    "max": round(max_val, 3)
                },
                "histogram": histogram_data
            }

        return distributions


asteroid_db = AsteroidDBService.get_instance()
