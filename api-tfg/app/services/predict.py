from app.loaders import (
    model,
    metadata
)

from app.services.montecarlo import run_montecarlo

# =========================
# PREPARE MODEL INPUTS
# =========================

def prepare_model_inputs(df):

    return [

        df["home_team_enc"].values,
        df["away_team_enc"].values,

        df["home_manager_enc"].values,
        df["away_manager_enc"].values,

        df["home_formation_enc"].values,
        df["away_formation_enc"].values,

        df[metadata["num_cols"]]
        .values
        .astype("float32")
    ]

# =========================
# PREDICT MATCH
# =========================

def predict_match(match_df):

    inputs = prepare_model_inputs(match_df)

    probs = model.predict(
        inputs,
        verbose=0
    )[0]

    montecarlo = run_montecarlo(probs)

    return {
        "away_win": float(probs[0]),
        "draw": float(probs[1]),
        "home_win": float(probs[2]),
        "montecarlo": montecarlo
    }