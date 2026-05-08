# Modelo de Predicción de Partidos de Fútbol: LaLiga

Un sistema de predicción de resultados de fútbol basado en Deep Learning que combina estadísticas de rendimiento, contexto táctico y análisis de calidad de los equipos para pronosticar encuentros de la Primera División de España.

## Descripción del Proyecto

Este proyecto implementa un modelo de red neuronal multi-entrada diseñado para capturar la complejidad de los partidos de fútbol. Va más allá de las estadísticas tradicionales al incorporar datos como el contexto táctico y el valor de mercado en tiempo real de los onces iniciales.

### Características Principales

* **Preprocesamiento Inteligente:** Integración, limpieza y validación de datos procedentes de múltiples fuentes heterogéneas.
* **Análisis de Contexto Táctico:** Incorporación de formaciones de los equipos y métricas de calidad del 11 inicial (edades, valoraciones económicas).
* **Arquitectura de Red Neuronal Profunda:** Modelo multi-entrada con capas de *embedding* para manejar variables categóricas y continuas de forma simultánea.
* **Prevención de Sobreajuste:** Implementación de *Early Stopping* durante la fase de entrenamiento.
* **Cuantificación de Incertidumbre:** Uso de simulaciones de Montecarlo sobre las probabilidades arrojadas por el modelo para generar distribuciones robustas de los resultados.

---

## Pipeline de Ejecución

El proyecto está estructurado en tres fases secuenciales, diseñadas para asegurar la reproducibilidad y el correcto tratamiento de los datos temporales:

```text
┌─────────────────────────────────────────────────────────────┐
│          FASE 1: PREPROCESAMIENTO DE ESTADÍSTICAS           │
│          Archivo: Matchstats_preprocessing.ipynb            │
├─────────────────────────────────────────────────────────────┤
│ • Carga de datos (Football-data, Understat)                 │
│ • Limpieza y validación (tipos de datos, valores nulos)     │
│ • Ingeniería de características (medias móviles, EWMA)      │
│ • Output: df_estadisticas_procesadas.csv                    │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│          FASE 2: CALIDAD DEL 11 Y CONTEXTO                  │
│          Archivo: Context_preprocessing.ipynb               │
├─────────────────────────────────────────────────────────────┤
│ • Cruce de alineaciones con valoraciones (Transfermarkt)    │
│ • Asignación de formaciones y entrenadores                  │
│ • Cálculo de métricas agregadas del 11 titular              │
│ • Fusión final con datos estadísticos                       │
│ • Output: datalake_partidos_model_ready.csv                 │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│    FASE 3: ENTRENAMIENTO DEL MODELO Y EVALUACIÓN            │
│    Archivo: Model_training.ipynb                            │
├─────────────────────────────────────────────────────────────┤
│ • División temporal (Train/Test) para evitar Data Leakage   │
│ • Transformación a formato "Local vs Visitante"             │
│ • Construcción y entrenamiento de la red neuronal           │
│ • Evaluación de métricas y análisis de explicabilidad       │
│ • Exportación del modelo y preprocesadores (.keras / .pkl)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Fuentes de Datos

El modelo se alimenta de la triangulación de tres fuentes de datos principales para construir una visión holística de cada encuentro:

* **[Football-Data.co.uk](https://www.football-data.co.uk/spainm.php):** Resultados históricos, cuotas de mercado y estadísticas básicas del partido.
* **[Understat](https://understat.com/):** Métricas avanzadas de rendimiento (Goles Esperados - xG, Puntos Esperados - xPts, PPDA).
* **[Transfermarkt](https://www.kaggle.com/datasets/davidcariboo/player-scores):** Datos económicos y tácticos mediante el dataset público estructurado en Kaggle.

---

## Requisitos y Dependencias

Para ejecutar los notebooks, se requiere un entorno Python 3.8 o superior con las siguientes librerías instaladas:

```text

pandas==2.2.2
numpy==2.0.2
scikit-learn==1.6.1
joblib==1.5.3
tensorflow-cpu==2.20.0

```

---

## Instrucciones de Uso

El flujo de trabajo está optimizado para su ejecución en cuadernos jupyter.

### Ejecución en Google Colab (Recomendado)

1. Acceda a [Google Colab](https://colab.research.google.com/).
2. Suba los tres archivos `.ipynb` proporcionados en el repositorio.
3. Asegúrese de cargar los datasets originales en la carpeta de entorno virtual o monte su unidad de Google Drive.
4. Ejecute los notebooks secuencialmente de arriba a abajo en el siguiente orden:
* `Matchstats_preprocessing.ipynb`
* `Context_preprocessing.ipynb`
* `Model_training.ipynb`
