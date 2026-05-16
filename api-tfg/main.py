from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from loaders import (
    model,
    df_demo,
    metadata
)

import numpy as np

app = FastAPI(title="Football Prediction API")

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# PREPARE INPUTS
# =========================

def prepare_model_inputs(df, num_cols):

    return [
        df['home_team_enc'].values,
        df['away_team_enc'].values,

        df['home_manager_enc'].values,
        df['away_manager_enc'].values,

        df['home_formation_enc'].values,
        df['away_formation_enc'].values,

        df[num_cols].values.astype("float32")
    ]


# =========================
# GET ALL GAMES
# =========================

@app.get("/games")
def get_games():

    games = df_demo[
        [
            "game_id",
            "home_team",
            "away_team",
            "date",
            "Time",
            "FTR"
        ]
    ].copy()

    games["date"] = games["date"].astype(str)

    return games.to_dict(orient="records")


# =========================
# PREDICT TEST GAME
# =========================

@app.post("/predict-test/{game_id}")
def predict_test_game(game_id: int):

    match = df_demo[
        df_demo["game_id"] == game_id
    ]

    if match.empty:

        raise HTTPException(
            status_code=404,
            detail="Partido no encontrado"
        )

    # preparar entradas keras
    inputs = prepare_model_inputs(
        match,
        metadata["num_cols"]
    )

    # predicción
    probs = model.predict(
        inputs,
        verbose=0
    )[0]

    # simulación montecarlo
    n_sims = 10000

    results = np.random.choice(
        ['A', 'D', 'H'],
        size=n_sims,
        p=probs
    )

    return {

        "game_id": int(match.iloc[0]["game_id"]),

        "home_team": match.iloc[0]["home_team"],
        "away_team": match.iloc[0]["away_team"],

        "probabilities": {

            "away_win": float(probs[0]),
            "draw": float(probs[1]),
            "home_win": float(probs[2])
        },

        "montecarlo": {

            "A": int(np.sum(results == "A")),
            "D": int(np.sum(results == "D")),
            "H": int(np.sum(results == "H"))
        },

        "real_result": match.iloc[0]["FTR"]
    }
