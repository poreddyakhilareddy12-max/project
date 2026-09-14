# NER-LOGIX
## AI-Based Smart Logistics Accessibility Intelligence Platform for the North Eastern Region of India

> **SIH Enterprise Edition** &bull; Autonomous GIS, Machine Learning Terrain Hazard Prediction, Medical Priority Corridors, and Resilient Offline Field Synchronization.

---

## 1. Executive Summary & Core Problem

The **North Eastern Region (NER) of India** (Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Arunachal Pradesh, Sikkim) faces extreme logistics vulnerability due to young Himalayan fold mountains, high seismic activity, intense monsoon rainfall (>2,500 mm annually), frequent landslides, bridge failures, and single-point-of-failure highway corridors (e.g. NH-29, NH-2, NH-6, NH-10).

**NER-LOGIX** is a unified command-and-control logistics accessibility platform that:
1. **Monitors real-time road accessibility** across all 8 North Eastern states and remote districts.
2. **Predicts disruption risks (0–100 score)** using a Scikit-Learn Machine Learning pipeline evaluating slope, 24h/72h rainfall, elevation, soil moisture saturation, and historical landslide vulnerability.
3. **Calculates explainable delay metrics** (e.g. `Normal ETA: 9h 10m` vs `Risk-Adjusted ETA: 12h 10m` with exact hazard causes).
4. **Calculates Multi-Objective Route Alternatives** (Fastest vs. Safest vs. Recommended) and enforces **Medical Priority Corridors** ($\alpha=3.5$ risk penalty) for ICU medicines, vaccines, and emergency supplies.
5. **Provides Offline-First Field Geo-Tagging** with browser IndexedDB, local photo capture, and automatic background synchronization upon network reconnection.
6. **Integrates Low-Bandwidth / SMS & USSD fallback** parsing compact telegrams (`INCIDENT|NH2|LANDSLIDE|CRITICAL|25.51,94.14`) into live command alerts.

---

## 2. System Architecture

```
                                  +---------------------------------------+
                                  |            CLIENT DEVICES             |
                                  | - Command Center (Desktop / Ops Room) |
                                  | - Field Operations (Tablet / Mobile)  |
                                  | - Driver Cockpit (Outdoor Mobile UI)  |
                                  +-------------------+-------------------+
                                                      |
                                     IndexedDB Queue  |  REST / Multipart / JSON
                                    (Offline Reports) |  (JWT Authenticated)
                                                      v
+---------------------------------------------------------------------------------------------------------+
|                                        APPLICATION GATEWAY (FastAPI)                                    |
|                                                                                                         |
|  +--------------------+  +--------------------+  +----------------------+  +-------------------------+  |
|  | Auth & RBAC (JWT)  |  | Vehicle GPS Engine |  | GIS Routing Engine   |  | Offline Sync Controller |  |
|  +--------------------+  +--------------------+  +----------------------+  +-------------------------+  |
|  | Alerts Engine      |  | District Health    |  | ML Risk Service      |  | Compact SMS Gateway     |  |
|  +--------------------+  +--------------------+  +----------------------+  +-------------------------+  |
+---------------------------------------------------------------------------------------------------------+
                  |                                     |                                   |
                  v                                     v                                   v
+------------------------------------+  +-------------------------------+  +-------------------------------+
|      INTELLIGENCE / ML LAYER       |  |       GIS ROUTING LAYER       |  |       PERSISTENCE LAYER       |
| Scikit-Learn Random Forest Model   |  | OSRM + Curated Highway Graph  |  | SQLAlchemy 2.0 ORM            |
| - Slope, Rainfall, Soil Moisture   |  | - NH-27, NH-29, NH-2, NH-6    |  | - SQLite (Zero-Config Dev)    |
| - Feature Contribution Engine      |  | - Medical Corridor Weighting  |  | - PostgreSQL (Production)     |
+------------------------------------+  +-------------------------------+  +-------------------------------+
```

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React-Leaflet / Leaflet (CartoDB Dark Matter tiles), Recharts, Dexie / IndexedDB, Lucide Icons.
- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Python-Jose (JWT), Passlib / Bcrypt.
- **Machine Learning**: Scikit-learn (RandomForestRegressor), pandas, numpy, joblib.
- **GIS & Routing**: Hybrid OSRM API + deterministic topological graph of North East National Highways.
- **Offline Storage**: IndexedDB (browser local database) with automated sync reconciliation.

---

## 4. Demo Credentials & User Personas

| Persona | Email / Username | Password | Role & Default Workspace |
| :--- | :--- | :--- | :--- |
| **Director / Admin** | `admin@nerlogix.gov.in` (`admin`) | `Password123!` | **Central Command Center** (Full GIS radar, alert triage, route planner) |
| **Field Official** | `official@nerlogix.gov.in` (`official`) | `Password123!` | **Field Operations Portal** (Geo-tagged incident reporting & offline sync) |
| **Convoy Driver** | `driver@nerlogix.gov.in` (`driver`) | `Password123!` | **Driver Cockpit** (Outdoor-ready mobile cockpit, GPS transmitter, warnings) |

*(Note: The login page also features one-click Persona switcher buttons for rapid demonstration).*

---

## 5. Quick Start (Running Locally)

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ & npm

### Method 1: One-Click Startup Script (Windows)
Double-click `run_local.bat` or run in terminal:
```powershell
.\run_local.bat
```

### Method 2: Manual Terminal Startup

**Terminal 1 — Backend:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
python app/ml/train.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Backend runs on `http://localhost:8000`. Interactive OpenAPI documentation available at `http://localhost:8000/docs`.*

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 6. Docker Deployment

To launch the complete production-grade containerized system:
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 7. Real vs. Simulated Boundaries (Academic & Hackathon Integrity)

| Feature | Integrity Status | Description |
| :--- | :--- | :--- |
| **GIS Map & Geography** | **100% REAL** | Real OpenStreetMap vector tiles and genuine geographic coordinates across Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Arunachal Pradesh, and Sikkim. |
| **Routing Geometry** | **100% REAL** | Real highway geometries fetched from OSRM driving engine API and real topological vectors. |
| **Photo Upload & Evidence** | **100% REAL** | Upload form starts **completely empty** (no fake photographs). Real camera and file uploads stored to disk. |
| **Offline Persistence** | **100% REAL** | Real browser IndexedDB database. Works completely without internet connection. |
| **Authentication & RBAC** | **100% REAL** | Real bcrypt salt hashing and RFC 7519 HMAC-SHA256 JWT tokens. |
| **Fleet GPS Telemetry** | **SIMULATED ADAPTER** | Includes an interactive waypoint simulation engine (with Play/Pause/Speed toggle) along with production REST endpoint `/api/vehicles/{id}/location` ready for hardware IoT GPS trackers. |
| **ML Hazard Calibration** | **CALIBRATED SYNTHETIC** | Trained on 3,500 records calibrated to North East India monsoonal rainfall, steep Barail/Patkai slopes, and soil saturation. |
| **SMS Gateway** | **SIMULATED ADAPTER** | Functional parsing engine for compact SMS syntax (`INCIDENT|NH2|LANDSLIDE|HIGH|...`) with an interactive simulation terminal. |

---

## 8. Complete Hackathon Demonstration Walkthrough

1. **Command Center Overview**:
   - Log in as **Admin** (`admin` / `Password123!`).
   - Observe the live North East GIS radar: NH-27 (Green), NH-6 (Yellow), NH-29 (Orange), NH-2 Mao Corridor (Red Blocked).
   - Observe active fleets, including the Medical Convoy `AS-01-MC-1049`.

2. **Route Planner & Medical Corridor**:
   - Open **Route Planner** and select `Guwahati Medical College` &rarr; `RIMS Hospital, Imphal`.
   - Select Cargo Priority: **Medical & Vaccine Shipment**.
   - Inspect Route A (Fastest dry-season route via NH-2: blocked by Landslide at Mao gate with +180 min delay).
   - Inspect Route B / C: System automatically prioritizes and recommends the **Southern Alternate Corridor (NH-6 &rarr; NH-37 via Silchar)**, avoiding the impassable choke-point.

3. **Driver Mobile View**:
   - Click logout and log in as **Driver** (`driver` / `Password123!`).
   - Notice the high-contrast outdoor dashboard showing the active medical shipment, normal ETA, expected delay (+110m), and route warning.
   - Click **"Transmit Live GPS Ping"** to stream device coordinates.
   - Click **"Accept Recommended Alternate Bypass"** to reroute the convoy away from the hazard zone.

4. **Simulate Remote Disconnect & Offline Geo-Tagging**:
   - In the top header bar, click **"Simulate Disconnect: OFFLINE"** (or disconnect your network adapter).
   - Notice the system status switch to `OFFLINE MODE`.
   - Go to **Field Incident Report**.
   - Notice the photo upload container is **strictly empty** (no fake placeholder).
   - Click "Take Photo" or "Upload Photo", select an image, type description, and click **"Save Locally (Offline Queue)"**.
   - A banner confirms: `OFFLINE MODE: Incident saved securely in local browser storage`.
   - The header displays `1 PENDING SYNC`.

5. **Automatic Reconnection & Sync**:
   - Click **"Simulate Disconnect: ONLINE"** (or restore your network).
   - Watch the header automatically transition to `SYNCING...` &rarr; `SYNCED`.
   - Switch back to **Command Center**: The newly submitted incident appears on the live GIS map, the affected road segment risk elevates, and an automated alert is created!

6. **Low-Bandwidth / SMS Fallback**:
   - Open **Low-Bandwidth / SMS**.
   - Click a preset (e.g. `INCIDENT|NH2|LANDSLIDE|CRITICAL|25.512,94.148 Major rockfall at Mao gate`).
   - Click **"Transmit Payload via SMS Gateway"**.
   - The response log confirms immediate parsing and ingestion as a geo-tagged incident in the command center.

---

## 9. API Reference Summary

- `POST /api/auth/login`: Issue JWT token
- `GET /api/auth/me`: Fetch authenticated user profile
- `POST /api/routes/compare`: Evaluate candidate routes with risk cost & delay explainability
- `GET /api/routes/segments`: Monitored road segments with risk scores and geometry
- `POST /api/risk/predict`: ML disruption risk prediction with explainable feature contributions
- `GET /api/vehicles`: Live fleet telematics
- `POST /api/vehicles/{id}/location`: Transmit GPS telemetry
- `GET /api/trips`: Active logistics movements
- `POST /api/incidents`: Submit geo-tagged incident report
- `POST /api/incidents/upload-photo`: Upload incident image evidence
- `POST /api/incidents/sync`: Batch offline synchronization endpoint
- `GET /api/districts`: District accessibility matrix (GREEN, YELLOW, ORANGE, RED)
- `GET /api/alerts`: Triage automated hazard warnings
- `POST /api/low-bandwidth/parse-sms`: Ingest compact SMS/USSD syntax
- `GET /api/analytics/overview`: Aggregate KPIs, bottleneck ranking, and risk distribution

---

## 10. License & Intellectual Property

Developed for the Smart India Hackathon (SIH) Logistics & Accessibility Problem Statement. Built with open-source GIS and machine learning standards for Indian national highway infrastructure resilience.
