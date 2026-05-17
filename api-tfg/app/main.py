from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.loaders import df_demo

from app.services.predict import predict_match

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

    match = df_demo[
        df_demo["game_id"] == game_id
    ]

    if match.empty:

        raise HTTPException(
            status_code=404,
            detail="Partido no encontrado"
        )

    prediction = predict_match(match)

    return {

        "game_id": int(match.iloc[0]["game_id"]),

        "home_team": match.iloc[0]["home_team"],

        "away_team": match.iloc[0]["away_team"],

        "probabilities": {

            "away_win": prediction["away_win"],
            "draw": prediction["draw"],
            "home_win": prediction["home_win"]
        },

        "montecarlo": prediction["montecarlo"],

        "real_result": match.iloc[0]["FTR"]
    }