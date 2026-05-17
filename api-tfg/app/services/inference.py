
import numpy as np

from app.loaders import (
    modelo,
    scaler,
    encoders,
    metadata
)

# =========================
# PREPARAR INPUTS
# =========================

def prepare_model_inputs(match_df):

    # =========================
    # ENCODINGS
    # =========================

    match_df["home_team_enc"] = encoders["team"].transform(
        match_df["home_team"]
    )

    match_df["away_team_enc"] = encoders["team"].transform(
        match_df["away_team"]
    )

    match_df["home_manager_enc"] = encoders["manager"].transform(
        match_df["home_manager"]
    )

    match_df["away_manager_enc"] = encoders["manager"].transform(
        match_df["away_manager"]
    )

    match_df["home_formation_enc"] = encoders["formation"].transform(
        match_df["home_formation"]
    )

    match_df["away_formation_enc"] = encoders["formation"].transform(
        match_df["away_formation"]
    )

    match_df["home_club_id_enc"] = encoders["club"].transform(
        match_df["home_club_id"]
    )

    match_df["away_club_id_enc"] = encoders["club"].transform(
        match_df["away_club_id"]
    )

    # =========================
    # NUMÉRICAS
    # =========================

    num_cols = metadata["num_cols"]

    X_num = scaler.transform(
        match_df[num_cols]
    ).astype("float32")

    # =========================
    # INPUTS DINÁMICOS
    # =========================

    model_inputs = []

    for input_name, col_name in metadata["embedding_inputs"].items():

        model_inputs.append(
            match_df[col_name].values
        )

    model_inputs.append(X_num)

    return model_inputs


# =========================
# PREDICCIÓN
# =========================

def predict_match(match_df):

    model_inputs = prepare_model_inputs(match_df)

    probs = modelo.predict(
        model_inputs,
        verbose=0
    )[0]

    target_encoder = encoders["target"]

    prediction = {
        target_encoder.classes_[i]: float(probs[i])
        for i in range(len(probs))
    }

    return prediction
