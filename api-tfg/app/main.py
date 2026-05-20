from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.loaders import df_demo

from app.services.predict import predict_match
from app.services.feature_engineering import build_match_features
from app.predict_schema import MatchPredictionRequest
from app.loaders import (
    df_team_state
)
app = FastAPI(
    title="Football Prediction API"
)

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
# HEALTHCHECK
# =========================

@app.get("/")
def root():

    return {
        "status": "ok",
        "service": "football-api"
    }


@app.get("/metadata")
def get_metadata():

    return {

        "teams": sorted(
            df_team_state["team"]
            .dropna()
            .unique()
            .tolist()
        ),

        "formations": sorted(
            df_team_state["formation"]
            .dropna()
            .unique()
            .tolist()
        ),

        "managers": sorted(
            df_team_state["manager"]
            .dropna()
            .unique()
            .tolist()
        )
    }


# =========================
# GET GAMES
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
# PREDICT GAME
# =========================

@app.post("/predict-test/{game_id}")
def predict_test_game(game_id: int):
    match = df_demo[df_demo["game_id"] == game_id]

    if match.empty:
        raise HTTPException(
            status_code=404,
            detail="Partido no encontrado"
        )

    # Suponiendo que predict_match llama internamente a run_montecarlo_simulation
    prediction = predict_match(match)

    return {
        "game_id": int(match.iloc[0]["game_id"]),
        "home_team": str(match.iloc[0]["home_team"]),
        "away_team": str(match.iloc[0]["away_team"]),
        "probabilities": {
            "away_win": prediction["away_win"],
            "draw": prediction["draw"],
            "home_win": prediction["home_win"]
        },
        "montecarlo": prediction["montecarlo"],
        "stats": prediction.get("stats", {}), # Inyección opcional libre de NumPy
        "real_result": str(match.iloc[0]["FTR"])
    }

@app.post("/predict-custom")
def predict_custom(request: MatchPredictionRequest):

    df_features = build_match_features(request)
    
    prediction = predict_match(df_features)

    return prediction