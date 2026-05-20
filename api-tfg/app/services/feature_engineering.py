import numpy as np
import pandas as pd

from app.loaders import df_team_state, scaler, encoders


# =========================
# TIME FEATURES
# =========================
def create_time_features(date_str, time_str):

    date_dt = pd.to_datetime(date_str)

    try:
        hour = int(time_str.split(":")[0])
    except:
        hour = 18

    month = date_dt.month
    day_of_week = date_dt.dayofweek

    return {
        "month_sin": np.sin(2 * np.pi * month / 12),
        "month_cos": np.cos(2 * np.pi * month / 12),
        "dow_sin": np.sin(2 * np.pi * day_of_week / 7),
        "dow_cos": np.cos(2 * np.pi * day_of_week / 7),
        "hour_sin": np.sin(2 * np.pi * hour / 24),
        "hour_cos": np.cos(2 * np.pi * hour / 24)
    }


# =========================
# LAST TEAM STATE
# =========================
def get_last_team_state(team, match_date):

    match_date = pd.to_datetime(match_date)

    cols = [
        'shots_last_5', 'shots_target_last_5', 'corners_last_5',
        'fouls_last_5', 'yellow_cards_last_5', 'red_cards_last_5',
        'xp_last_5', 'xg_last_5', 'np_xg_last_5', 'ppda_last_5',
        'deep_completions_last_5',
        'shots_ewm_5', 'shots_target_ewm_5', 'corners_ewm_5',
        'fouls_ewm_5', 'yellow_cards_ewm_5', 'red_cards_ewm_5',
        'xp_ewm_5', 'xg_ewm_5', 'np_xg_ewm_5', 'ppda_ewm_5',
        'deep_completions_ewm_5',
        'manager', 'formation', 'team', 'position_last', 'date'
    ]

    team_history = df_team_state[
        (df_team_state["team"] == team) &
        (df_team_state["date"] < match_date)
    ]

    if team_history.empty:
        raise ValueError(f"No hay histórico para {team}")

    return team_history.sort_values("date").iloc[-1][cols]


# =========================
# DIFFERENCE FEATURES
# =========================
def add_difference_features(df):

    base_cols = [
        'shots_last_5', 'shots_target_last_5', 'corners_last_5',
        'fouls_last_5', 'yellow_cards_last_5', 'red_cards_last_5',
        'xp_last_5', 'xg_last_5', 'np_xg_last_5', 'ppda_last_5',
        'deep_completions_last_5',
        'shots_ewm_5', 'shots_target_ewm_5', 'corners_ewm_5',
        'fouls_ewm_5', 'yellow_cards_ewm_5', 'red_cards_ewm_5',
        'xp_ewm_5', 'xg_ewm_5', 'np_xg_ewm_5', 'ppda_ewm_5',
        'deep_completions_ewm_5'
    ]

    for col in base_cols:
        df[f"{col}_diff"] = df[f"home_{col}"] - df[f"away_{col}"]
        df[f"{col}_abs_diff"] = np.abs(df[f"home_{col}"] - df[f"away_{col}"])

    df["ppda_last_5_diff"] = df["away_ppda_last_5"] - df["home_ppda_last_5"]
    df["table_position_diff"] = df["away_position_last"] - df["home_position_last"]
    df["table_position_abs_diff"] = np.abs(df["table_position_diff"])

    return df


def build_match_features(request):

    home_state = get_last_team_state(request.home_team, request.date)
    away_state = get_last_team_state(request.away_team, request.date)

    row = {}

    # raw states
    for col, value in home_state.items():
        if col not in ["team", "date"]:
            row[f"home_{col}"] = value

    for col, value in away_state.items():
        if col not in ["team", "date"]:
            row[f"away_{col}"] = value

    # metadata
    row["home_team"] = request.home_team
    row["away_team"] = request.away_team
    row["home_manager"] = request.home_manager
    row["away_manager"] = request.away_manager
    row["home_formation"] = request.home_formation
    row["away_formation"] = request.away_formation
    row["date"] = request.date
    row["Time"] = request.time

    row.update(create_time_features(request.date, request.time))

    df = pd.DataFrame([row])

    df = add_difference_features(df)

    # encoders
    df["home_team_enc"] = encoders["team"].transform(df["home_team"])
    df["away_team_enc"] = encoders["team"].transform(df["away_team"])
    df["home_manager_enc"] = encoders["manager"].transform(df["home_manager"])
    df["away_manager_enc"] = encoders["manager"].transform(df["away_manager"])
    df["home_formation_enc"] = encoders["formation"].transform(df["home_formation"])
    df["away_formation_enc"] = encoders["formation"].transform(df["away_formation"])

    return df

# =========================
# KERAS INPUTS
# =========================
def prepare_keras_inputs(df):

    return [
        df["home_team_enc"].values,
        df["away_team_enc"].values,
        df["home_manager_enc"].values,
        df["away_manager_enc"].values,
        df["home_formation_enc"].values,
        df["away_formation_enc"].values,
        df.values.astype("float32")
    ]