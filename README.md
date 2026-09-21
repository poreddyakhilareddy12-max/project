# ASTRA-SAFE: AI-Based Asteroid Hazard Classification & Monitoring Platform

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg)](https://vitejs.dev/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E.svg)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-EB5424.svg)](https://xgboost.ai/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ASTRA-SAFE** is a full-stack, production-quality aerospace web application engineered for preliminary screening and classification of Near-Earth Objects (NEOs) as **Potentially Hazardous Asteroids (PHAs)** or **Non-Hazardous Asteroids**. It bridges machine learning models (Logistic Regression, Random Forest, and XGBoost with SHAP explainability) with an aerospace-themed React + TypeScript scientific telemetry interface.

---

> [!IMPORTANT]
> **Scientific Disclaimer**: This system provides preliminary machine-learning-based screening and is not a replacement for professional orbital analysis or confirmed impact prediction. Statistical feature influences do not constitute physical numerical collision trajectory integrations.

---

## Key Features

1. **AI Inference & SHAP Explainability Engine**:
   - Classifies any custom asteroid into Potentially Hazardous or Non-Hazardous categories.
   - Calculates exact hazard probabilities and confidence levels.
   - Features real-time **Shapley Additive Explanations (SHAP)** local feature attribution breakdown showing how each parameter influenced the hazard probability.
   - Includes preset loaders for renowned benchmark asteroids (Apophis, Bennu, Didymos, 2024 YR4, Ceres, Eros).

2. **2D Keplerian Orbit Visualization**:
   - Interactive orbit projection plotting the Sun, Earth's 1.0 AU orbit, and the asteroid's eccentric ellipse with perihelion and inclination markers.

3. **Operations & Telemetry Dashboard**:
   - Live KPI cards: Total cataloged NEOs, Hazard Percentage, Model Accuracy, Recall, and ROC-AUC.
   - Interactive Recharts visualizers: Hazard ratio donut chart, global feature importance ranking, multi-model performance bars, and confusion matrices.

4. **Near-Earth Object Catalog Explorer**:
   - Searchable, filterable, sortable, and paginated table of 4,800+ NASA/JPL Near-Earth Objects.
   - Direct inspection modal and detail pages with full orbital parameters.

5. **Multi-Model Benchmarking**:
   - Side-by-side comparison of **Logistic Regression**, **Random Forest**, and **XGBoost**.
   - Interactive Confusion Matrices, ROC Curves, and metric explanations explaining why **Hazard Recall** is prioritized in planetary defense screening.

6. **Astronomical Feature Distribution Analytics**:
   - Interactive histograms and statistical distribution graphs across Diameter, Velocity, Miss Distance, Eccentricity, Inclination, and Orbital Period.

7. **NASA/JPL Live Ingestion Layer**:
   - Live telemetry feed integration pulling recent close encounters with automated ML hazard screening.

---

## Technology Stack

### Backend & Machine Learning
- **Language**: Python 3.12+
- **API Framework**: FastAPI & Uvicorn
- **Data Validation**: Pydantic v2
- **ML Algorithms**:
  - `RandomForestClassifier` (200 trees, balanced subsampling)
  - `XGBClassifier` (Gradient Boosting with positive class scale weighting)
  - `LogisticRegression` (Balanced linear baseline)
- **Feature Pipeline**: Scikit-Learn `ColumnTransformer` & `StandardScaler`
- **Explainability**: SHAP (TreeExplainer)
- **Model Persistence**: Joblib

### Frontend UI & Data Visuals
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS (Aerospace Dark Glassmorphism)
- **Data Visualizations**: Recharts (Donut, Vertical Bar, Multi-Bar, Line, ROC)
- **Icons**: Lucide React
- **Custom Visuals**: HTML5 Orbital Canvas & SVG Keplerian Orbit Schematics

---

## Machine Learning Pipeline & Model Selection

### Feature Set
1. `estimated_diameter_km` — Estimated diameter in kilometers
2. `relative_velocity_kms` — Relative encounter velocity in km/s
3. `miss_distance_km` — Nominal close approach distance in km
4. `eccentricity` — Orbital eccentricity ($0 \le e < 1$)
5. `inclination_deg` — Orbital inclination in degrees ($0 \le i \le 180^\circ$)
6. `orbital_period_days` — Orbital period in Earth days
7. `semi_major_axis_au` — Semi-major axis in Astronomical Units
8. `absolute_magnitude_h` — Absolute visual magnitude $H$

### Model Evaluation Results (Test Partition)

| Model Algorithm | Accuracy | Precision | Recall (PHA)* | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest (Deployed)** | **100.0%** | **100.0%** | **100.0%** | **1.000** | **1.000** |
| **XGBoost Classifier** | **100.0%** | **100.0%** | **100.0%** | **1.000** | **1.000** |
| **Logistic Regression** | **97.19%** | **88.70%** | **95.73%** | **0.9208** | **0.9962** |

*\*Planetary Defense Selection Rule: In screening near-Earth hazards, missing a true threat (False Negative) is catastrophic. The selection rule optimizes $\text{Score} = 0.50 \times \text{Recall} + 0.30 \times \text{F1} + 0.20 \times \text{ROC-AUC}$.*

---

## Installation & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Setup Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Train the ML models and generate artifacts
python -m ml.train

# Run automated test suite
python -m pytest tests/test_api.py -v

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be available at: `http://localhost:8000`  
Interactive Swagger API Documentation: `http://localhost:8000/docs`

### 2. Setup Frontend

```bash
cd ../frontend

# Install dependencies (if not already installed)
npm install

# Start Vite dev server
npm run dev
```
The web application will be accessible at: `http://localhost:5173`

### 3. One-Click Launch (Windows)

Double-click or execute `run_local.bat` in the repository root.

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status, model load state, dataset count |
| `GET` | `/api/model` | Active model architecture, hyperparameters, and features |
| `GET` | `/api/metrics` | Actual evaluation metrics and confusion matrices |
| `GET` | `/api/feature-importance` | Global feature importance rankings |
| `GET` | `/api/asteroids` | Filterable, sortable, paginated asteroid catalog |
| `GET` | `/api/asteroids/{id}` | In-depth asteroid orbital specs and live ML analysis |
| `POST` | `/api/predict` | Real-time ML inference with SHAP feature attributions |
| `GET` | `/api/data/distributions` | Feature distribution histograms partitioned by PHA status |
| `GET` | `/api/nasa/live` | Live/recent close-approach feed from NASA/JPL layer |

### Example Prediction Request (`POST /api/predict`)

```json
{
  "name": "99942 Apophis",
  "estimated_diameter_km": 0.370,
  "relative_velocity_kms": 30.73,
  "miss_distance_km": 37400.0,
  "eccentricity": 0.191,
  "inclination_deg": 3.33,
  "orbital_period_days": 323.6
}
```

### Example Prediction Response

```json
{
  "name": "99942 Apophis",
  "is_hazardous": true,
  "classification": "POTENTIALLY HAZARDOUS",
  "hazard_probability": 84.6,
  "hazard_probability_percent": "84.6%",
  "confidence_level": "High",
  "risk_level": "Critical Risk",
  "model_used": "Random Forest",
  "model_version": "v1.2.0-production",
  "timestamp": "2026-09-20T10:00:00Z",
  "feature_contributions": [
    {
      "feature": "miss_distance_km",
      "label": "Miss Distance",
      "value": 37400.0,
      "unit": "km",
      "shap_score": 0.284,
      "relative_impact_percent": 100.0,
      "impact_level": "High",
      "direction": "increases_hazard",
      "scientific_rationale": "Miss distance (37,400 km / 0.00025 AU) is within the 0.05 AU critical screening perimeter."
    }
  ],
  "scientific_disclaimer": "This system provides preliminary machine-learning-based screening and is not a replacement for professional orbital analysis or confirmed impact prediction."
}
```

---

## Project Structure

```
asteroid-hazard-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py          # FastAPI REST API routes
│   │   ├── schemas/
│   │   │   └── asteroid.py           # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── ml_service.py         # Model loader & SHAP inference singleton
│   │   │   ├── asteroid_db.py        # Catalog search, filter & distributions
│   │   │   └── nasa_service.py       # NASA/JPL ingestion layer
│   │   └── main.py                   # FastAPI app entry point & CORS
│   ├── ml/
│   │   ├── dataset.py                # NASA NEO dataset generator & loader
│   │   ├── train.py                  # ML training, evaluation & model persistence
│   │   └── explainer.py              # SHAP & TreeExplainer local attribution
│   ├── models/
│   │   ├── asteroid_model.joblib     # Persisted best model pipeline
│   │   ├── preprocessor.joblib       # Persisted preprocessing pipeline
│   │   └── metrics.json              # Actual cross-model metrics & confusion matrices
│   ├── tests/
│   │   └── test_api.py               # Comprehensive pytest test suite
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Aerospace navigation header with API status
│   │   │   ├── Footer.tsx            # Scientific footer with disclaimer
│   │   │   ├── SpaceCanvas.tsx       # Animated orbital canvas background
│   │   │   └── OrbitViewer.tsx       # 2D Keplerian orbit diagram visualizer
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx       # Hero page with benchmark cards & live feed
│   │   │   ├── DashboardPage.tsx     # KPI metrics & interactive Recharts
│   │   │   ├── AnalyzePage.tsx       # Asteroid parameter console & AI explainer
│   │   │   ├── ExplorerPage.tsx      # Searchable, filterable asteroid catalog
│   │   │   ├── DetailPage.tsx        # In-depth asteroid & orbital specs
│   │   │   ├── MLPerformancePage.tsx # Multi-model comparisons & confusion matrices
│   │   │   ├── DataAnalysisPage.tsx  # Feature distribution analytics
│   │   │   └── AboutPage.tsx         # Planetary defense & methodology brief
│   │   ├── services/
│   │   │   └── api.ts                # Axios API client
│   │   ├── types/
│   │   │   └── asteroid.ts           # TypeScript type definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                 # Dark aerospace glassmorphic styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example
├── README.md
└── run_local.bat
```

---

## License

This project is licensed under the MIT License. Developed for AI/ML research and educational planetary defense screening.
