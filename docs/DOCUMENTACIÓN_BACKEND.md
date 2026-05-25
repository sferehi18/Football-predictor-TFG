# 📋 Documentación - Football Prediction API

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Módulos Principales](#módulos-principales)
4. [Endpoints](#endpoints)
5. [Flujo de Datos](#flujo-de-datos)
6. [Variables de Entorno](#variables-de-entorno)
7. [Dependencias Externas](#dependencias-externas)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Descripción General

**Football Prediction API** es una API REST construida con **FastAPI** que realiza predicciones de resultados de partidos de fútbol utilizando un modelo de **Deep Learning (TensorFlow/Keras)**.

### Características Principales
- Predicción de resultados con probabilidades (Victoria Local, Empate, Victoria Visitante)
- Simulación Monte Carlo para análisis adicional
- Integración con AWS S3 para almacenamiento de modelos y datos
- Logging de predicciones en S3 con particionamiento temporal
- API REST con CORS habilitado
- Validación de datos con Pydantic

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  main.py (Endpoints)                                        │
│  ├── GET  / (Health Check)                                 │
│  ├── GET  /games (Listar partidos disponibles)             │
│  └── POST /predict-test/{game_id} (Realizar predicción)    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
│                                                              │
│  predict.py        → Lógica de predicción                  │
│  logger.py         → Tracking de eventos                   │
│  montecarlo.py     → Simulaciones (no incluido)            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│                                                              │
│  loaders.py        → Carga de modelos y datos              │
│  config.py         → Configuración centralizada            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
│                                                              │
│  AWS S3            → Storage de modelos y datasets         │
│  TensorFlow/Keras  → Modelo de predicción                  │
│  Joblib            → Serialización (scaler, encoders)      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Módulos Principales

### 1. `config.py` - Configuración Centralizada

**Propósito**: Gestionar todas las rutas y configuraciones del proyecto.

#### Variables de Entorno
```python
ENV                 # Ambiente (local, staging, production)
MODEL_PATH          # Ruta al modelo Keras
SCALER_PATH         # Ruta al escalador de features
ENCODERS_PATH       # Ruta a los codificadores categóricos
METADATA_PATH       # Metadatos del modelo
MATCHES_PATH        # CSV de partidos históricos
TEAM_STATE_PATH     # CSV de estado de equipos
ENGINEERING_PATH    # CSV con features engineered
DEMO_PATH           # CSV de demo para testing
S3_DATA_BUCKET      # Bucket S3 para datos
S3_MODELS_BUCKET    # Bucket S3 para modelos
AWS_REGION          # Región AWS
```

#### Estructura
```
BASE_DIR/
├── .env                    # Variables de entorno
├── models/
│   ├── modelo_tfg.keras
│   ├── scaler.pkl
│   ├── encoders.pkl
│   └── model_metadata.pkl
└── data/
    ├── partidos_stats_xi.csv
    ├── estados_de_forma.csv
    ├── partidos_engineering.csv
    └── partidos_demo_web.csv
```

---

### 2. `loaders.py` - Carga de Modelos y Datos

**Propósito**: Descargar desde S3 e inicializar modelos y datasets.

#### Flujo de Ejecución
```
1. download_from_s3()
   ├── Crear directorios: /app/app/models y /app/app/data
   ├── Descargar modelos (si no existen localmente)
   │   ├── modelo_tfg.keras (TensorFlow)
   │   ├── scaler.pkl (MinMaxScaler/StandardScaler)
   │   ├── encoders.pkl (LabelEncoders)
   │   └── model_metadata.pkl
   └── Descargar datasets
       ├── partidos_stats_xi.csv
       ├── estados_de_forma.csv
       ├── partidos_engineering.csv
       └── partidos_demo_web.csv

2. load_model(MODEL_PATH)
   └── Cargar modelo TensorFlow en memoria

3. joblib.load() × 3
   ├── Scaler para normalización de features numéricos
   ├── Encoders para variables categóricas
   └── Metadata con información del modelo

4. pd.read_csv() × 4
   ├── Cargar datasets en DataFrames
   └── Parsear columna 'date' como datetime
```

#### Variables Globales Expuestas
```python
model               # Modelo TensorFlow Keras cargado
scaler              # Escalador de features
encoders            # Codificadores categóricos
metadata            # Metadatos del modelo
df_matches          # DataFrame con partidos
df_team_state       # DataFrame con estado de equipos
df_engineering      # DataFrame con features engineering
df_demo             # DataFrame demo para testing
```

---

### 3. `main.py` - Endpoints FastAPI

**Propósito**: Exponer los endpoints REST.

#### Configuración CORS
```python
allow_origins=["*"]        # Acepta cualquier origen
allow_credentials=True     # Permite cookies/headers auth
allow_methods=["*"]        # Permite todos los métodos
allow_headers=["*"]        # Permite todos los headers
```

#### Endpoints

##### `GET /`
**Health Check del servicio**

```bash
curl http://localhost:8000/
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "service": "football-api"
}
```

---

##### `GET /games`
**Lista todos los partidos disponibles en el dataset demo**

```bash
curl http://localhost:8000/games
```

**Response (200 OK)**:
```json
[
  {
    "game_id": 1,
    "home_team": "Real Madrid",
    "away_team": "Barcelona",
    "date": "2023-01-15",
    "Time": "20:00",
    "FTR": "H"
  },
  {
    "game_id": 2,
    "home_team": "Athletic Bilbao",
    "away_team": "Valencia",
    "date": "2023-01-16",
    "Time": "19:30",
    "FTR": "D"
  }
]
```

**Campos**:
- `game_id` (int): ID único del partido
- `home_team` (str): Equipo local
- `away_team` (str): Equipo visitante
- `date` (str): Fecha (YYYY-MM-DD)
- `Time` (str): Hora del partido (HH:MM)
- `FTR` (str): Resultado final (H=Home win, D=Draw, A=Away win)

---

##### `POST /predict-test/{game_id}`
**Realiza predicción para un partido específico**

```bash
curl -X POST http://localhost:8000/predict-test/1
```

**Response (200 OK)**:
```json
{
  "game_id": 1,
  "home_team": "Real Madrid",
  "away_team": "Barcelona",
  "probabilities": {
    "away_win": 0.15,
    "draw": 0.25,
    "home_win": 0.60
  },
  "montecarlo": {
    "simulations": 1000,
    "home_win_pct": 62.5,
    "draw_pct": 23.8,
    "away_win_pct": 13.7
  },
  "real_result": "H"
}
```

**Campos de Respuesta**:
- `game_id`: ID del partido
- `home_team` / `away_team`: Nombres de equipos
- `probabilities`: Distribución de probabilidades del modelo
  - `home_win`: Probabilidad de victoria local (0-1)
  - `draw`: Probabilidad de empate (0-1)
  - `away_win`: Probabilidad de victoria visitante (0-1)
- `montecarlo`: Resultado de simulación Monte Carlo
  - `simulations`: Número de simulaciones ejecutadas
  - `home_win_pct`, `draw_pct`, `away_win_pct`: Porcentajes simulados
- `real_result`: Resultado real del partido (para validación)

**Errores**:
- `404 Not Found`: Si el `game_id` no existe en el dataset demo
  ```json
  {
    "detail": "Partido no encontrado"
  }
  ```

---

### 4. `predict.py` - Lógica de Predicción

**Propósito**: Procesar features y ejecutar modelo.

#### Función: `prepare_model_inputs(df)`

Prepara los inputs para el modelo neural a partir de un DataFrame.

**Entradas**:
```python
df.columns contiene:
  - home_team_enc        # Team local codificado (int)
  - away_team_enc        # Team visitante codificado (int)
  - home_manager_enc     # Manager local codificado (int)
  - away_manager_enc     # Manager visitante codificado (int)
  - home_formation_enc   # Formación local codificada (int)
  - away_formation_enc   # Formación visitante codificada (int)
  - metadata["num_cols"] # Columnas numéricas variadas
```

**Salida**:
```python
[
  home_team_enc.values,        # Input 0: Team local
  away_team_enc.values,        # Input 1: Team visitante
  home_manager_enc.values,     # Input 2: Manager local
  away_manager_enc.values,     # Input 3: Manager visitante
  home_formation_enc.values,   # Input 4: Formación local
  away_formation_enc.values,   # Input 5: Formación visitante
  numerical_features           # Input 6: Features normalizados
]
```

#### Función: `predict_match(match_df)`

Ejecuta la predicción completa.

**Proceso**:
```
1. prepare_model_inputs(match_df)
   └── Preparar 7 inputs para la red neural

2. model.predict(inputs, verbose=0)
   └── Forward pass del modelo
   └── Output shape: [1, 3] (3 probabilidades)

3. run_montecarlo(probs)
   └── Ejecutar simulación Monte Carlo
   └── (Función no incluida, debe estar en montecarlo.py)

4. return {
     "away_win": float(probs[0]),    # P(Away Win)
     "draw": float(probs[1]),        # P(Draw)
     "home_win": float(probs[2])     # P(Home Win)
     "montecarlo": montecarlo_result
   }
```

**Notas**:
- Las probabilidades suman ≈ 1.0 (softmax output)
- verbose=0 desactiva el output de TensorFlow
- Los datos deben estar encodificados previamente

---

### 5. `logger.py` - Tracking de Eventos

**Propósito**: Registrar predicciones en S3 para auditoría y análisis.

#### Función: `save_prediction_event(...)`

**Parámetros**:
```python
game_id: int              # ID del partido
home_team: str            # Nombre team local
away_team: str            # Nombre team visitante
prediction: dict          # Resultado de predict_match()
  └── prediction["home_win"]
  └── prediction["draw"]
  └── prediction["away_win"]
```

#### Estructura del Evento

```python
event = {
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_timestamp": "2024-05-20T14:30:45.123456+00:00",
    
    "game_id": 1,
    "home_team": "Real Madrid",
    "away_team": "Barcelona",
    
    "home_win_prob": 0.60,
    "draw_prob": 0.25,
    "away_win_prob": 0.15,
    
    "predicted_result": "H"  # Clase con prob máxima
}
```

#### Almacenamiento en S3

**Bucket**: `football-tfg-logs`

**Path Pattern**:
```
analytics/predictions/
  year=2024/
  month=5/
  {uuid}.csv
```

**Ejemplo Path Completo**:
```
analytics/predictions/year=2024/month=5/a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6.csv
```

**Ventajas**:
- Particionamiento por año/mes para queries eficientes
- UUID para evitar colisiones
- Formato CSV para análisis con Athena/BigQuery

---

### 6. `predict_schema.py` - Validación de Datos

**Propósito**: Validar requests entrantes con Pydantic.

```python
class PredictRequest(BaseModel):
    home_team: str              # Equipo local (requerido)
    away_team: str              # Equipo visitante (requerido)
    home_manager: str           # Manager del equipo local
    away_manager: str           # Manager del equipo visitante
    home_formation: str         # Formación del equipo local (ej: "4-3-3")
    away_formation: str         # Formación del equipo visitante
    date: str                   # Fecha (formato: YYYY-MM-DD)
    time: str                   # Hora (formato: HH:MM)
```

**Nota**: Este schema no se utiliza en los endpoints actuales. Está disponible para futuras extensiones que acepten datos de entrada directa.

---

## Flujo de Datos

### Flujo Completo de Predicción

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: POST /predict-test/1                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ MAIN.PY: predict_test_game(game_id=1)                       │
│ - Filtrar df_demo donde game_id == 1                        │
│ - Validar que la fila existe                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ PREDICT.PY: predict_match(match_df)                         │
│ 1. prepare_model_inputs()                                   │
│    - Encodificar variables categóricas                      │
│    - Normalizar variables numéricas                         │
│ 2. model.predict(inputs)                                    │
│    - Forward pass red neural                                │
│    - Output: [P(away), P(draw), P(home)]                    │
│ 3. run_montecarlo(probs)                                    │
│    - Simulaciones probabilísticas                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ LOGGER.PY: save_prediction_event()                          │
│ - Crear evento con metadata                                 │
│ - Convertir a CSV                                           │
│ - Subir a S3 con timestamp                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ CLIENT RESPONSE (200 OK)                                    │
│ {                                                           │
│   "game_id": 1,                                             │
│   "probabilities": {...},                                   │
│   "montecarlo": {...},                                      │
│   "real_result": "H"                                        │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Inicialización de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│ IMPORT loaders.py                                           │
│ (Ejecución automática al importar)                          │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ download_from_s3()                                          │
│ - Conectar a AWS S3                                         │
│ - Descargar modelos (si no existen)                         │
│ - Descargar datasets (si no existen)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ load_model(MODEL_PATH)                                      │
│ load_model() x3 (scaler, encoders, metadata)               │
│ read_csv() x4 (datasets)                                    │
│ - Cargar todo en memoria global                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ FastAPI App Ready to Serve                                  │
│ Variables globales en loaders.py listos                    │
└─────────────────────────────────────────────────────────────┘
```

---

### Archivo `.env` Requerido

```bash
# AMBIENTE
ENV=production

# RUTAS LOCALES (se ignoran si está en S3)
MODEL_PATH=/app/app/models/modelo_tfg.keras
SCALER_PATH=/app/app/models/scaler.pkl
ENCODERS_PATH=/app/app/models/encoders.pkl
METADATA_PATH=/app/app/models/model_metadata.pkl

MATCHES_PATH=/app/app/data/partidos_stats_xi.csv
TEAM_STATE_PATH=/app/app/data/estados_de_forma.csv
ENGINEERING_PATH=/app/app/data/partidos_engineering.csv
DEMO_PATH=/app/app/data/partidos_demo_web.csv

# AWS S3
S3_DATA_BUCKET=football-tfg-data
S3_MODELS_BUCKET=football-tfg-models
AWS_REGION=eu-west-1
```

### Autenticación AWS

La aplicación usa credenciales AWS por defecto:
1. Variables de entorno: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
2. Archivo `~/.aws/credentials`
3. IAM Role (si está en EC2/ECS)

---

## Dependencias Externas

### Python Packages

```python
fastapi>=0.100.0
uvicorn>=0.20.0
python-multipart>=0.0.6
pandas==2.2.2
numpy==2.0.2
scikit-learn==1.6.1
joblib==1.5.3
tensorflow-cpu==2.20.0
python-dotenv
boto3

```

### Servicios Externos

| Servicio | Propósito |
| ---------- | ----------- |
| AWS S3 | Storage de modelos y datos |
| AWS IAM | Autenticación |
| TensorFlow | Inference |

---

## Ejemplos de Uso

### 1. Instalación y Setup Local

```bash
# Clonar proyecto
git clone <repo_url>
cd football-api

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales AWS

# Ejecutar servidor
uvicorn main:app --reload --port 8000
```

### 2. Health Check

```bash
curl http://localhost:8000/
```

### 3. Listar Partidos

```bash
curl http://localhost:8000/games | python -m json.tool
```

### 4. Hacer Predicción

```bash
# Obtener un game_id válido
curl http://localhost:8000/games | grep game_id

# Hacer predicción
curl -X POST http://localhost:8000/predict-test/1 | python -m json.tool
```

**Última actualización**: 20/05/2026
**Versión API**: 1.0.0  
