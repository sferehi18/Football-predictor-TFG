import os
import boto3
import joblib
import pandas as pd
from tensorflow.keras.models import load_model
from .config import (
    S3_DATA_BUCKET,
    S3_MODELS_BUCKET,
    AWS_REGION,
    MODEL_PATH,
    SCALER_PATH,
    ENCODERS_PATH,
    METADATA_PATH,
    MATCHES_PATH,
    TEAM_STATE_PATH,
    ENGINEERING_PATH,
    DEMO_PATH
)

# =========================
# S3 CLIENT
# =========================
s3 = boto3.client("s3", region_name=AWS_REGION)

# =========================
# DOWNLOAD FILES
# =========================
def download_from_s3():
    os.makedirs("/app/app/models", exist_ok=True)
    os.makedirs("/app/app/data", exist_ok=True)

    # =========================
    # MODELS
    # =========================
    model_files = [
        "modelo_tfg_v4.keras",
        "scaler_v4.pkl",
        "encoders_v4.pkl",
        "model_metadata_v4.pkl"
    ]

    for file in model_files:
        local_path = f"/app/app/models/{file}"
        key = f"models/{file}"  # 👈 1. Definimos key correctamente aquí arriba

        print("TRY MODEL KEY:", key)
        s3.head_object(Bucket=S3_MODELS_BUCKET, Key=key)
        
        print(f"Downloading MODELS: {file}")
        # 👈 2. Corregido de "data/processed/" a "models/"
        s3.download_file(S3_MODELS_BUCKET, key, local_path)

    # =========================
    # DATASETS
    # =========================
    data_files = [
        "partidos_stats_xi.csv",
        "estados_de_forma.csv",
        "partidos_engenieering.csv",
        "partidos_demo_web.csv"
    ]

    for file in data_files:
        local_path = f"/app/app/data/{file}"
        key = f"data/processed/{file}"
        
        print("TRY DATA KEY:", key)
        s3.head_object(Bucket=S3_DATA_BUCKET, Key=key)
        
        print(f"Downloading dataset: {file}")
        s3.download_file(S3_DATA_BUCKET, key, local_path)

    print("S3 download complete")

# =========================
# DOWNLOAD FROM S3
# =========================
download_from_s3()

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

# =========================
# DATE PARSING
# =========================
for df in [df_matches, df_team_state, df_engineering, df_demo]:
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])

print("Loaders OK")