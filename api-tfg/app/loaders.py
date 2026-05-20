import joblib
import pandas as pd

from tensorflow.keras.models import load_model

from .config import (
    MODEL_PATH,
    SCALER_PATH,
    ENCODERS_PATH,
    METADATA_PATH,
    MATCHES_PATH,
    TEAM_STATE_PATH,
    ENGINEERING_PATH,
    DEMO_PATH,
    COV_MATRIX_PATH
)

# =========================
# LOAD MODEL
# =========================

print("Loading model...")

model = load_model(MODEL_PATH)

print("Loading scaler...")

scaler = joblib.load(SCALER_PATH)

print("Loading encoders...")

encoders = joblib.load(ENCODERS_PATH)

print("Loading metadata...")

metadata = joblib.load(METADATA_PATH)

# =========================
# LOAD DATASETS
# =========================

print("Loading datasets...")

df_matches = pd.read_csv(MATCHES_PATH)

df_team_state = pd.read_csv(TEAM_STATE_PATH)

df_engineering = pd.read_csv(ENGINEERING_PATH)

df_demo = pd.read_csv(DEMO_PATH)

df_cov_matrix = pd.read_csv(COV_MATRIX_PATH,index_col=0)

# =========================
# DATE PARSING
# =========================

for df in [
    df_matches,
    df_team_state,
    df_engineering,
    df_demo
]:

    if "date" in df.columns:

        df["date"] = pd.to_datetime(df["date"])

print("Loaders OK")
