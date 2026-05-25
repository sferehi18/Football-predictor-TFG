from app.loaders import (
    model,
    metadata,scaler
)

from app.services.montecarlo import run_montecarlo

# =========================
# PREPARE MODEL INPUTS
# =========================

def prepare_model_inputs(df, scaler, metadata):
    # 1. Columnas cíclicas que no se deben escalar
    not_scale = ['month_sin', 'month_cos', 'dow_sin', 'dow_cos', 'hour_sin', 'hour_cos']
    
    # 2. Separar y escalar las columnas numéricas puras
    num_cols_to_scale = [col for col in metadata["num_cols"] if col not in not_scale]
    raw_num_features = df[num_cols_to_scale].values.astype("float32")
    scaled_num_features = scaler.transform(raw_num_features)
    
    # 3. Extraer las columnas cíclicas sin alterar
    cyclic_features = df[not_scale].values.astype("float32")
    
    # 4. Concatenar numéricas escaladas + cíclicas en una sola matriz
    import numpy as np
    all_num_features = np.hstack([scaled_num_features, cyclic_features])
    
    return [
        df["home_team_enc"].values,
        df["away_team_enc"].values,
        df["home_manager_enc"].values,
        df["away_manager_enc"].values,
        df["home_formation_enc"].values,
        df["away_formation_enc"].values,
        all_num_features
    ]

# =========================
# PREDICT MATCH
# =========================

def predict_match(match_df):

    inputs = prepare_model_inputs(match_df,scaler,metadata)

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