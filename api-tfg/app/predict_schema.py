from pydantic import BaseModel

class MatchPredictionRequest(BaseModel):

    home_team: str
    away_team: str

    date: str
    time: str

    home_manager: str
    away_manager: str

    home_formation: str
    away_formation: str