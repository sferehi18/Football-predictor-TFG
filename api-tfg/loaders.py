from pathlib import Path

import joblib
import pandas as pd

from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).resolve().parent

# =========================
# PATHS
# =========================

MODEL_PATH = BASE_DIR / "models" / "modelo_tfg.keras"

SCALER_PATH = BASE_DIR / "models" / "scaler.pkl"
ENCODERS_PATH = BASE_DIR / "models" / "encoders.pkl"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.pkl"

MATCHES_PATH = BASE_DIR / "data" / "partidos_stats_xi.csv"
TEAM_STATE_PATH = BASE_DIR / "data" / "estados_de_forma.csv"
ENGINEERING_PATH = BASE_DIR / "data" / "partidos_engenieering.csv"
DEMO_PATH = BASE_DIR / "data" / "partidos_demo_web.csv"

print("Loading model...")
model = load_model(MODEL_PATH)

print("Loading scaler...")
scaler = joblib.load(SCALER_PATH)

print("Loading encoders...")
encoders = joblib.load(ENCODERS_PATH)

print("Loading metadata...")
metadata = joblib.load(METADATA_PATH)

print("Loading datasets...")
df_matches = pd.read_csv(MATCHES_PATH)

df_team_state = pd.read_csv(TEAM_STATE_PATH)

df_engineering = pd.read_csv(ENGINEERING_PATH)

df_demo = pd.read_csv(DEMO_PATH)

# =========================
# FECHAS
# =========================

for df in [df_matches, df_team_state, df_engineering, df_demo]:

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])

print("Loaders OK")
