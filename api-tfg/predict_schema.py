from pydantic import BaseModel


class PredictRequest(BaseModel):

    home_team: str
    away_team: str

    home_manager: str
    away_manager: str

    home_formation: str
    away_formation: str

    date: str
    time: str
