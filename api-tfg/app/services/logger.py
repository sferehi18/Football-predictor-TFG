import io
import uuid
import boto3
import pandas as pd

from datetime import datetime, timezone

s3 = boto3.client("s3")

TRACKING_BUCKET = "football-tfg-logs"

def save_prediction_event(
    game_id,
    home_team,
    away_team,
    prediction
):

    event = {
        "event_id": str(uuid.uuid4()),
        "event_timestamp": datetime.now(timezone.utc).isoformat(),

        "game_id": game_id,

        "home_team": home_team,
        "away_team": away_team,

        "home_win_prob": prediction["home_win"],
        "draw_prob": prediction["draw"],
        "away_win_prob": prediction["away_win"],

        "predicted_result": max(
            {
                "H": prediction["home_win"],
                "D": prediction["draw"],
                "A": prediction["away_win"]
            },
            key=lambda x: {
                "H": prediction["home_win"],
                "D": prediction["draw"],
                "A": prediction["away_win"]
            }[x]
        )
    }

    df = pd.DataFrame([event])

    buffer = io.StringIO()

    df.to_csv(buffer, index=False)

    key = (
        f"analytics/predictions/"
        f"year={datetime.now(timezone.utc).year}/"
        f"month={datetime.now(timezone.utc).month}/"
        f"{uuid.uuid4()}.csv"
    )

    s3.put_object(
        Bucket=TRACKING_BUCKET,
        Key=key,
        Body=buffer.getvalue()
    )

    print(f"Prediction event uploaded: {key}")