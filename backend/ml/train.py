"""
ASTRA-SAFE ML Training & Evaluation Pipeline
Trains and compares:
1. Logistic Regression
2. Random Forest Classifier
3. XGBoost Classifier

Calculates metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix),
selects the best model prioritizing Hazard Recall & F1-Score,
and persists the trained model, preprocessor pipeline, and metrics JSON.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve,
    precision_recall_curve
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from ml.dataset import load_dataset

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "asteroid_model.joblib")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")
ALL_MODELS_PATH = os.path.join(MODELS_DIR, "all_models.joblib")

FEATURE_COLS = [
    "estimated_diameter_km",
    "relative_velocity_kms",
    "miss_distance_km",
    "eccentricity",
    "inclination_deg",
    "orbital_period_days",
    "semi_major_axis_au",
    "absolute_magnitude_h"
]

TARGET_COL = "is_hazardous"


def train_and_evaluate(random_state: int = 42):
    os.makedirs(MODELS_DIR, exist_ok=True)
    df = load_dataset()

    print(f"[ASTRA-SAFE] Total records: {len(df)}")
    print(f"[ASTRA-SAFE] Target counts: {df[TARGET_COL].value_counts().to_dict()}")

    # Clean & validate
    df = df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    df = df.drop_duplicates()

    X = df[FEATURE_COLS]
    y = df[TARGET_COL].astype(int)

    # Stratified Train/Test split to avoid data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_state, stratify=y
    )

    print(f"[ASTRA-SAFE] Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), FEATURE_COLS)
        ]
    )

    # Fit preprocessor on X_train only
    preprocessor.fit(X_train)
    X_train_scaled = preprocessor.transform(X_train)
    X_test_scaled = preprocessor.transform(X_test)

    # Calculate scale_pos_weight for XGBoost to handle class imbalance
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos_weight = float(neg_count / max(pos_count, 1))

    # Define candidate models
    candidate_models = {
        "Logistic Regression": {
            "model": LogisticRegression(
                class_weight="balanced",
                max_iter=2000,
                C=1.0,
                random_state=random_state
            ),
            "description": "Baseline linear classifier with balanced class weighting for hazard sensitivity.",
            "hyperparameters": {"class_weight": "balanced", "max_iter": 2000, "C": 1.0, "solver": "lbfgs"}
        },
        "Random Forest": {
            "model": RandomForestClassifier(
                n_estimators=200,
                max_depth=12,
                min_samples_split=4,
                min_samples_leaf=2,
                class_weight="balanced_subsample",
                random_state=random_state,
                n_jobs=-1
            ),
            "description": "Ensemble of 200 decision trees with balanced bootstrap subsampling for robust non-linear boundaries.",
            "hyperparameters": {"n_estimators": 200, "max_depth": 12, "min_samples_split": 4, "class_weight": "balanced_subsample"}
        },
        "XGBoost": {
            "model": XGBClassifier(
                n_estimators=200,
                max_depth=5,
                learning_rate=0.06,
                subsample=0.85,
                colsample_bytree=0.85,
                scale_pos_weight=scale_pos_weight,
                eval_metric="logloss",
                random_state=random_state,
                n_jobs=-1
            ),
            "description": "Gradient boosted decision trees optimized with positive class scale weighting for planetary defense recall.",
            "hyperparameters": {"n_estimators": 200, "max_depth": 5, "learning_rate": 0.06, "scale_pos_weight": round(scale_pos_weight, 2)}
        }
    }

    results = {}
    fitted_models = {}

    for name, info in candidate_models.items():
        clf = info["model"]
        clf.fit(X_train_scaled, y_train)
        fitted_models[name] = clf

        y_pred = clf.predict(X_test_scaled)
        y_prob = clf.predict_proba(X_test_scaled)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        # ROC Curve coordinates (downsampled for frontend charts)
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        step_roc = max(1, len(fpr) // 30)
        roc_curve_data = [
            {"fpr": round(float(f), 4), "tpr": round(float(t), 4)}
            for f, t in zip(fpr[::step_roc], tpr[::step_roc])
        ]
        # Ensure endpoints
        if roc_curve_data[-1] != {"fpr": 1.0, "tpr": 1.0}:
            roc_curve_data.append({"fpr": 1.0, "tpr": 1.0})

        # Precision-Recall curve coordinates
        p_curve, r_curve, _ = precision_recall_curve(y_test, y_prob)
        step_pr = max(1, len(p_curve) // 30)
        pr_curve_data = [
            {"recall": round(float(r), 4), "precision": round(float(p), 4)}
            for r, p in zip(r_curve[::step_pr], p_curve[::step_pr])
        ]

        # Feature Importance / Coefficients
        feature_importance = {}
        if hasattr(clf, "feature_importances_"):
            importances = clf.feature_importances_
            feature_importance = {
                col: round(float(imp), 4) for col, imp in zip(FEATURE_COLS, importances)
            }
        elif hasattr(clf, "coef_"):
            coefs = np.abs(clf.coef_[0])
            coef_norm = coefs / coefs.sum()
            feature_importance = {
                col: round(float(c), 4) for col, c in zip(FEATURE_COLS, coef_norm)
            }

        # Sort feature importance descending
        feature_importance_sorted = sorted(
            [{"feature": k, "importance": v, "impact_level": "High" if v > 0.18 else ("Medium" if v > 0.08 else "Low")}
             for k, v in feature_importance.items()],
            key=lambda x: x["importance"],
            reverse=True
        )

        results[name] = {
            "name": name,
            "description": info["description"],
            "hyperparameters": info["hyperparameters"],
            "metrics": {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(auc, 4),
            },
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1],
                "raw": cm
            },
            "roc_curve": roc_curve_data,
            "pr_curve": pr_curve_data,
            "feature_importance": feature_importance_sorted
        }

        print(f"\n--- {name} Results ---")
        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}  <-- Critical Planetary Defense Metric")
        print(f"F1-Score:  {f1:.4f}")
        print(f"ROC-AUC:   {auc:.4f}")
        print(f"Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")

    # Model Selection Rule:
    # Planetary defense screening prioritizes Hazard Recall (minimizing False Negatives).
    # Score = 0.50 * Recall + 0.30 * F1 + 0.20 * ROC-AUC
    def selection_score(m_res):
        m = m_res["metrics"]
        return 0.50 * m["recall"] + 0.30 * m["f1_score"] + 0.20 * m["roc_auc"]

    best_model_name = max(results.keys(), key=lambda k: selection_score(results[k]))
    best_model = fitted_models[best_model_name]

    print(f"\n=======================================================")
    print(f"[ASTRA-SAFE] Selected Best Model: {best_model_name}")
    print(f"Selection Rule: Prioritizing Recall (50%) + F1 (30%) + ROC-AUC (20%)")
    print(f"Recall: {results[best_model_name]['metrics']['recall']:.4f}")
    print(f"F1-Score: {results[best_model_name]['metrics']['f1_score']:.4f}")
    print(f"ROC-AUC: {results[best_model_name]['metrics']['roc_auc']:.4f}")
    print(f"=======================================================\n")

    # Construct complete Pipeline for the best model
    best_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", best_model)
    ])

    # Save artifacts
    joblib.dump(best_pipeline, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    joblib.dump(fitted_models, ALL_MODELS_PATH)

    metrics_payload = {
        "selected_model": best_model_name,
        "selection_rationale": "In planetary defense preliminary screening, missing a hazardous asteroid (False Negative) is catastrophic. The model selection rule prioritizes Hazard Recall (50%) combined with balanced F1-Score (30%) and ROC-AUC (20%).",
        "dataset_statistics": {
            "total_samples": len(df),
            "training_samples": len(X_train),
            "testing_samples": len(X_test),
            "potentially_hazardous_count": int((df[TARGET_COL] == 1).sum()),
            "non_hazardous_count": int((df[TARGET_COL] == 0).sum()),
            "hazardous_percentage": round(float((df[TARGET_COL] == 1).mean()) * 100, 2),
            "features_used": FEATURE_COLS
        },
        "models": results
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"[ASTRA-SAFE] Saved best model pipeline to: {MODEL_PATH}")
    print(f"[ASTRA-SAFE] Saved preprocessor to: {PREPROCESSOR_PATH}")
    print(f"[ASTRA-SAFE] Saved metrics to: {METRICS_PATH}")

    return best_pipeline, metrics_payload


if __name__ == "__main__":
    train_and_evaluate()
