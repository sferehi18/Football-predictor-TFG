
import numpy as np
import pandas as pd

# =========================
# MONTECARLO SIMPLE
# =========================

def run_montecarlo(probs, n_sims=10000):

    results = np.random.choice(
        ['A', 'D', 'H'],
        size=n_sims,
        p=probs
    )

    return {
        "A": int(np.sum(results == "A")),
        "D": int(np.sum(results == "D")),
        "H": int(np.sum(results == "H"))
    }


# =========================
# MONTECARLO FEATURE PERTURBATION
# =========================

import numpy as np
import pandas as pd

def run_montecarlo_simulation(base_df, model, metadata, cov_matrix_df, n_simulations=10000, noise_scale=0.15):
    seed_value = int(
    hash(f"{base_df['home_team_enc'].iloc[0]}_{base_df['away_team_enc'].iloc[0]}") % (2**31)
    )
    np.random.seed(seed_value)
    num_cols = metadata["num_cols"]
    
    
    # 1. SOLUCIÓN A LA COLINEALIDAD (Filtro propuesto por Claude)
    # Filtramos para no meter ruido en variables duplicadas o híper-correlacionadas
    cols_a_excluir = [
        'np_xg_last_5_diff', 'np_xg_ewm_5_diff',  # Duplicados de xG
        'home_position_last', 'away_position_last', # Posiciones en tabla no llevan este ruido
        # Si tienes las versiones _last_5 y _ewm_5 de la misma métrica, idealmente excluye una.
    ]
    
    simulation_cols = [
        col for col in num_cols 
        if col.endswith("_diff") 
        and not col.endswith("_abs_diff") 
        and "position" not in col 
        and col not in cols_a_excluir
    ]
    
    # Conseguimos los índices correctos para la matriz num_cols
    sim_col_idxs = [num_cols.index(col) for col in simulation_cols if col in base_df.columns]
    
    # Preparamos inputs puros
    inputs_pure = [
        base_df["home_team_enc"].values, base_df["away_team_enc"].values,
        base_df["home_manager_enc"].values, base_df["away_manager_enc"].values,
        base_df["home_formation_enc"].values, base_df["away_formation_enc"].values,
        base_df[num_cols].values.astype("float32")
    ]
    pure_pred = model.predict(inputs_pure, verbose=0)[0] 
    
    # 2. Generar Simulaciones con Ruido
    num_values_base = base_df[num_cols].values.astype("float32")
    num_values_sim = np.repeat(num_values_base, n_simulations, axis=0)
    
    # Extraemos covarianza limpia libre de colinealidad destructiva
    cov_matrix = cov_matrix_df.loc[simulation_cols, simulation_cols].values
    mean_zeros = np.zeros(len(simulation_cols))
    
    # Bajamos levemente el noise_scale a 0.15 (sugerencia analítica) para evitar distorsiones
    noise = np.random.multivariate_normal(mean=mean_zeros, cov=cov_matrix * (noise_scale ** 2), size=n_simulations)
    
    # Aplicamos el ruido
    num_values_sim[:, sim_col_idxs] += noise
    
    # OPTIONAL/RECOMENDADO: Acotamos los valores para que el ruido no cree valores aberrantes
    # (Por ejemplo, que la diferencia de xG no supere +- 4.0 goles por partido)
    # Buscamos los índices de las columnas xg si existen y las limitamos
    for idx, col in zip(sim_col_idxs, simulation_cols):
        if "xg" in col:
            num_values_sim[:, idx] = np.clip(num_values_sim[:, idx], -4.0, 4.0)
    
    inputs_sim = [
        np.repeat(base_df["home_team_enc"].values, n_simulations),
        np.repeat(base_df["away_team_enc"].values, n_simulations),
        np.repeat(base_df["home_manager_enc"].values, n_simulations),
        np.repeat(base_df["away_manager_enc"].values, n_simulations),
        np.repeat(base_df["home_formation_enc"].values, n_simulations),
        np.repeat(base_df["away_formation_enc"].values, n_simulations),
        num_values_sim
    ]
    
    preds_simadas = model.predict(inputs_sim, batch_size=n_simulations, verbose=0)
    
    # 3. Muestreo Probabilístico Correcto (Inverse Transform Sampling / Ruleta)
    cumsum_preds = np.cumsum(preds_simadas, axis=1)
    random_samples = np.random.rand(n_simulations, 1)
    ganadores_simulados = (random_samples < cumsum_preds).argmax(axis=1)
    
    count_A = int(np.sum(ganadores_simulados == 0))
    count_D = int(np.sum(ganadores_simulados == 1))
    count_H = int(np.sum(ganadores_simulados == 2))

    # Estadísticas de incertidumbre (Punto 5 de Claude - Opcional para robustez)
    mc_means = preds_simadas.mean(axis=0)
    mc_stds = preds_simadas.std(axis=0)
    
    # Retornamos el JSON plano compatible con tu Simulador.jsx
    return {
        "away_win": float(pure_pred[0]),
        "draw": float(pure_pred[1]),
        "home_win": float(pure_pred[2]),
        "montecarlo": {
            "A": count_A,
            "D": count_D,
            "H": count_H
        },
        "stats": { # Volvemos a llamarlo stats o metrics según lo pida tu Front
            "mc_mean_H": float(mc_means[2]),
            "mc_mean_D": float(mc_means[1]),
            "mc_mean_A": float(mc_means[0]),
            "mc_std": preds_simadas.std(axis=0).tolist()
        }

        }
    