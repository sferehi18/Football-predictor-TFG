from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from pydantic import BaseModel
from typing import List

app = FastAPI(title="API de Predicción LaLiga TFG")

# Configurar CORS para que React pueda comunicarse con la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CARGA DE ACTIVOS ---
MODEL_PATH = "models/modelo_tfg.keras"
PIPELINE_PATH = "models/pipeline_preprocesamiento.pkl"
ENCODER_PATH = "models/label_encoder_target.pkl"
DATA_PATH = "data/estados_de_forma.csv"
DEMO_PATH = "data/partidos_demo_web.csv"
TEST_PATH = "data/datalake_partidos_test.csv"

modelo = load_model(MODEL_PATH)
preprocesador = joblib.load(PIPELINE_PATH)
encoder = joblib.load(ENCODER_PATH)
df_estado = pd.read_csv(DATA_PATH)
df_estado['Fecha'] = pd.to_datetime(df_estado['Fecha'])
df_demo = pd.read_csv(DEMO_PATH)
df_test = pd.read_csv(TEST_PATH)

# --- MODELOS DE DATOS (Pydantic) ---
class PredictRequest(BaseModel):
    equipo_L: str
    equipo_V: str
    manager_L: str
    manager_V: str
    formation_L: str
    formation_V: str
    fecha: str  # Recibido desde el simulador de React
    hora: str   # Recibido desde el simulador de React

# --- FUNCIONES AUXILIARES ---
def get_features_temporales(fecha_str, hora_str):
    """Calcula variables de ingeniería de características en tiempo real"""
    fecha_dt = pd.to_datetime(fecha_str)
    
    # 1. Momento del día
    try:
        h = int(hora_str.split(':')[0])
    except:
        h = 18
    if h < 15: momento = 'Mañana'
    elif h < 19: momento = 'Tarde'
    else: momento = 'Noche'
    
    # 2. Estación
    mes = fecha_dt.month
    if mes in [12, 1, 2]: estacion = 'Invierno'
    elif mes in [3, 4, 5]: estacion = 'Primavera'
    elif mes in [6, 7, 8]: estacion = 'Verano'
    else: estacion = 'Otoño'
    
    # 3. Variables cíclicas (Seno/Coseno)
    dia_del_ano = fecha_dt.dayofyear
    temp_sin = np.sin(2 * np.pi * dia_del_ano / 365.25)
    temp_cos = np.cos(2 * np.pi * dia_del_ano / 365.25)
    
    return momento, estacion, temp_sin, temp_cos

# --- ENDPOINTS ---

@app.get("/api/config")
def get_config():
    return {
        "equipos": sorted(df_estado['Equipo'].unique().tolist()),
        "entrenadores": sorted(df_estado['manager_name'].unique().tolist()),
        "formaciones": sorted(df_estado['formation'].unique().tolist())
    }

@app.get("/api/partidos-demo")
def get_demo_matches():
    return df_demo.to_dict(orient="records")



# Función auxiliar para buscar el estado histórico coherente
def obtener_estado_temporal(equipo, fecha_limite):
    # Asegurar que comparamos fechas
    fecha_limite_dt = pd.to_datetime(fecha_limite)
    
    # Buscamos en el histórico completo estados de ese equipo antes de la fecha
    pasado = df_estado[(df_estado['Equipo'] == equipo) & (df_estado['Fecha'] < fecha_limite_dt)]
    
    if pasado.empty:
        # Si no hay pasado, devolvemos su primera fila histórica disponible
        return df_estado[df_estado['Equipo'] == equipo].sort_values('Fecha').iloc[0].to_dict()
    
    # Devolvemos el estado más cercano al partido (el último del pasado)
    return pasado.sort_values('Fecha').iloc[-1].to_dict()
    
@app.post("/api/predict")
def predict(req: PredictRequest):
    try:
    # 1. Convertir la fecha del partido que llega de React a objeto datetime
        fecha_target = pd.to_datetime(req.fecha)

        data_L = obtener_estado_temporal(req.equipo_L, req.fecha)
        data_V = obtener_estado_temporal(req.equipo_V, req.fecha)

        
        # 4. Construir el diccionario del partido para el modelo
        partido = {}
        
        # Añadir features del local con sufijo _L
        for col, val in data_L.items():
            if col not in ['Equipo', 'Fecha', 'hora', 'resultado_final', 'game_id', 'es_local']:
                partido[col + "_L"] = val
        
        # Añadir features del visitante con sufijo _V
        for col, val in data_V.items():
            if col not in ['Equipo', 'Fecha', 'hora', 'resultado_final', 'game_id', 'es_local']:
                partido[col + "_V"] = val

        # 5. Inyectar metadatos y variables manuales/temporales
        partido['Equipo_L'] = req.equipo_L
        partido['Equipo_V'] = req.equipo_V
        partido['manager_name_L'] = req.manager_L
        partido['manager_name_V'] = req.manager_V
        partido['formation_L'] = req.formation_L
        partido['formation_V'] = req.formation_V
        partido['Fecha'] = req.fecha
        partido['hora'] = req.hora
        partido['resultado_final'] = 'H' # Dummy para el pipeline
        partido['game_id'] = 0           # Dummy

        # Obtener variables de seno/coseno según la fecha/hora del partido solicitado
        momento, estacion, t_sin, t_cos = get_features_temporales(req.fecha, req.hora)
        partido['momento_dia'] = momento
        partido['estacion_ano'] = estacion
        partido['temporada_sin'] = t_sin
        partido['temporada_cos'] = t_cos
        partido['hora_L'] = req.hora
        partido['hora_V'] = req.hora

        # 6. Preprocesamiento e Inferencia (Igual que antes)
        partido_df = pd.DataFrame([partido])
        X_trans = preprocesador.transform(partido_df)

       
        # 5. Preparar la lista de 9 inputs para la Red Neuronal
        # El orden debe ser idéntico al definido en el modelo Keras
        cols_num = [c for c in X_trans.columns if c.startswith('num__')]
        
        entradas = [
            X_trans[cols_num].astype('float32'),     # entrada_numericas (incluye sin/cos)
            X_trans['cat__club_id_L'].values,        # club_id_L
            X_trans['cat__club_id_V'].values,        # club_id_V
            X_trans['cat__manager_name_L'].values,   # manager_name_L
            X_trans['cat__manager_name_V'].values,   # manager_name_V
            X_trans['cat__formation_L'].values,      # formation_L
            X_trans['cat__formation_V'].values,      # formation_V
            X_trans['cat__momento_dia'].values,      # momento_dia 
            X_trans['cat__estacion_ano'].values      # estacion_ano
        ]
       
        # 6. Inferencia y Simulación
        probs = modelo.predict(entradas, verbose=0)[0]
        n_sims = 10000
        resultados = np.random.choice(encoder.classes_, size=n_sims, p=probs)

        # 7. Comparación con resultado real (Backtesting)
        match_real = df_test[
            (df_test['Equipo_L'] == req.equipo_L) & 
            (df_test['Equipo_V'] == req.equipo_V)
        ]
        real_val = match_real.iloc[0]['resultado_final'] if not match_real.empty else None

        return {
            "probabilidades": {
                "Local": float(probs[2]),
                "Empate": float(probs[1]),
                "Visitante": float(probs[0])
            },
            "montecarlo": {
                "H": int(np.sum(resultados == 'H')),
                "D": int(np.sum(resultados == 'D')),
                "A": int(np.sum(resultados == 'A'))
            },
            "real": real_val 
            ,
        "metadata":{
            "fecha_ultimo_estado_L": data_L['Fecha'].strftime('%Y-%m-%d') if 'Fecha' in data_L else None,
            "fecha_ultimo_estado_V": data_V['Fecha'].strftime('%Y-%m-%d') if 'Fecha' in data_V else None
            }
            
        }

    except Exception as e:
        print(f"Error detectado: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

