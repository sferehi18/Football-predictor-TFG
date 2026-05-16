import numpy as np
import pandas as pd

from loaders import (
    df_team_state,
    scaler,
    encoders,
    metadata
)

# =========================
# VARIABLES TEMPORALES
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
# ÚLTIMO ESTADO EQUIPO
# =========================

def get_last_team_state(team, match_date):

    match_date = pd.to_datetime(match_date)

    team_history = df_team_state[
        (df_team_state["team"] == team) &
        (df_team_state["date"] < match_date)
    ]

    if team_history.empty:
        raise ValueError(f"No hay histórico para {team}")

    return (
        team_history
        .sort_values("date")
        .iloc[-1]
    )


# =========================
# FEATURE ENGINEERING
# =========================

def add_difference_features(df):

    diff_cols = [
        'shots_last_5',
        'shots_target_last_5',
        'corners_last_5',
        'fouls_last_5',
        'yellow_cards_last_5',
        'red_cards_last_5',
        'xp_last_5',
        'xg_last_5',
        'np_xg_last_5',
        'ppda_last_5',
        'deep_completions_last_5'
    ]

    for col in diff_cols:

        df[f'{col}_diff'] = (
            df[f'home_{col}'] -
            df[f'away_{col}']
        )

        df[f'{col}_abs_diff'] = abs(
            df[f'home_{col}'] -
            df[f'away_{col}']
        )

    # ppda invertido
    df['ppda_last_5_diff'] = (
        df['away_ppda_last_5'] -
        df['home_ppda_last_5']
    )

    # tabla
    df['table_position_diff'] = (
        df['away_position_last'] -
        df['home_position_last']
    )

    df['table_position_abs_diff'] = abs(
        df['home_position_last'] -
        df['away_position_last']
    )

    return df


# =========================
# BUILD MATCH FEATURES
# =========================

def build_match_features(request):

    home_state = get_last_team_state(
        request.home_team,
        request.date
    )

    away_state = get_last_team_state(
        request.away_team,
        request.date
    )

    row = {}

    # home
    for col, value in home_state.items():

        if col in ["team", "date"]:
            continue

        row[f"home_{col}"] = value

    # away
    for col, value in away_state.items():

        if col in ["team", "date"]:
            continue

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

    # features temporales
    row.update(
        create_time_features(
            request.date,
            request.time
        )
    )

    df = pd.DataFrame([row])

    # =========================
    # FEATURE ENGINEERING
    # =========================

    df = add_difference_features(df)

    # =========================
    # ENCODERS
    # =========================

    df["home_team_enc"] = encoders["team"].transform(
        df["home_team"]
    )

    df["away_team_enc"] = encoders["team"].transform(
        df["away_team"]
    )

    df["home_manager_enc"] = encoders["manager"].transform(
        df["home_manager"]
    )

    df["away_manager_enc"] = encoders["manager"].transform(
        df["away_manager"]
    )

    df["home_formation_enc"] = encoders["formation"].transform(
        df["home_formation"]
    )

    df["away_formation_enc"] = encoders["formation"].transform(
        df["away_formation"]
    )

    # =========================
    # ESCALADO
    # =========================

    num_cols = metadata["num_cols"]

    df[num_cols] = scaler.transform(
        df[num_cols]
    )

    return df


# =========================
# PREPARAR INPUTS KERAS
# =========================

def prepare_keras_inputs(df):

    num_cols = metadata["num_cols"]

    return [

        df["home_team_enc"].values,
        df["away_team_enc"].values,

        df["home_manager_enc"].values,
        df["away_manager_enc"].values,

        df["home_formation_enc"].values,
        df["away_formation_enc"].values,

        df[num_cols].values.astype("float32")
    ]
