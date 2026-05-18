import os

from dotenv import load_dotenv

# =========================
# ENVIRONMENT
# =========================
ENV = os.getenv("ENV")

# =========================
# BASE DIRECTORY
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =========================
# LOAD ENV FILE
# =========================

if ENV == "production":

    load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

else:

    load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

# =========================
# MODEL PATHS
# =========================

MODEL_PATH = os.getenv("MODEL_PATH")

SCALER_PATH = os.getenv("SCALER_PATH")

ENCODERS_PATH = os.getenv("ENCODERS_PATH")

METADATA_PATH = os.getenv("METADATA_PATH")

# =========================
# DATA PATHS
# =========================

MATCHES_PATH = os.getenv("MATCHES_PATH")

TEAM_STATE_PATH = os.getenv("TEAM_STATE_PATH")

ENGINEERING_PATH = os.getenv("ENGINEERING_PATH")

DEMO_PATH = os.getenv("DEMO_PATH")