from app.loaders import (
    model,
    metadata,
    df_cov_matrix,
    encoders,
    scaler
)

from app.services.montecarlo import run_montecarlo
from app.services.montecarlo import run_montecarlo_simulation
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


def prepare_model_inputs_custom(df):

    feature_cols = scaler.feature_names_in_

    X_num = df[feature_cols].copy()

    X_num = scaler.transform(X_num)

    return [
        df["home_team_enc"].values,
        df["away_team_enc"].values,
        df["home_manager_enc"].values,
        df["away_manager_enc"].values,
        df["home_formation_enc"].values,
        df["away_formation_enc"].values,
        X_num.astype("float32")
    ]


# =========================
# PREDICT MATCH
# =========================

def predict_match(match_df):
    # Ya no necesitas hacer model.predict() aquí, porque 
    # run_montecarlo_simulation ya lo hace internamente y te lo devuelve.
    
    resultados_mc = run_montecarlo_simulation(
        base_df=match_df,
        model=model,
        metadata=metadata,
        cov_matrix_df=df_cov_matrix, 
        n_simulations=1000
    )
    
    # Devuelve el diccionario directamente para evitar la doble anidación
    return resultados_mc