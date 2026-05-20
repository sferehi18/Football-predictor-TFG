# Modelo de Predicción de Partidos de Fútbol: LaLiga

Un sistema de predicción de resultados de fútbol basado en Deep Learning que combina estadísticas de rendimiento, contexto táctico y análisis de calidad de los equipos para pronosticar encuentros de la Primera División de España.

## Descripción del Proyecto

Este proyecto implementa un modelo de red neuronal multi-entrada diseñado para capturar la complejidad de los partidos de fútbol. Va más allá de las estadísticas tradicionales al incorporar datos como el contexto táctico y el valor de mercado en tiempo real de los onces iniciales.

### Características Principales

* **Preprocesamiento Inteligente:** Integración, limpieza y validación de datos procedentes de múltiples fuentes heterogéneas.
* **Análisis de Contexto Táctico:** Incorporación de formaciones de los equipos y métricas de calidad del 11 inicial (edades, valoraciones económicas).
* **Arquitectura de Red Neuronal Profunda:** Modelo multi-entrada con capas de *embedding* para manejar variables categóricas y continuas de forma simultánea.
* **Prevención de Sobreajuste:** Implementación de *Early Stopping* durante la fase de entrenamiento.

# Sistema de Prediccion de Partidos de Futbol: LaLiga

Un sistema de prediccion de resultados de futbol basado en Deep Learning que combina estadisticas de rendimiento, contexto tactico y analisis de calidad de los equipos para pronosticar encuentros de la Primera Division de Espana en tiempo real.

## Fuentes de Datos

El modelo se alimenta de la triangulación de tres fuentes de datos principales para construir una visión holística de cada encuentro:

* **[Football-Data.co.uk](https://www.football-data.co.uk/spainm.php):** Resultados históricos, cuotas de mercado y estadísticas básicas del partido.
* **[Understat](https://understat.com/):** Métricas avanzadas de rendimiento (Goles Esperados - xG, Puntos Esperados - xPts, PPDA).
* **[Transfermarkt](https://www.kaggle.com/datasets/davidcariboo/player-scores):** Datos económicos y tácticos mediante el dataset público estructurado en Kaggle.

---

## Arquitectura del Sistema

La aplicacion esta disenada bajo una arquitectura desacoplada, contenedorizada y automatizada en la nube:

```text
[ Frontend: React ] <───────────────( HTTP )───────────────> [ Backend: FastAPI ]
                                                               (En AWS EC2 via DockerHub)
                                                                    │          │
                                       (Carga en memoria al iniciar)│          │(Guarda JSON logs)
                                                                    ▼          ▼
                                                             [ Bucket S3 ] ──> [ Tabla Hive ]
                                                                    ▲
                                                                    │(Actualización Semanal)
                                                              [ n8n Workflow ]

```

* **Frontend:** SPA moderna desarrollada en React que consume las predicciones y las muestra al usuario.
* **Backend:** API REST construida con FastAPI que sirve el modelo. Al arrancar en AWS EC2, descarga los artefactos (modelo en formato h5/keras, encoders, metadata) directamente desde AWS S3 a la memoria RAM para optimizar la latencia de inferencia.
* **Data Pipeline (n8n):** Un flujo de trabajo semanal automatizado en n8n se encarga de actualizar los datos crudos de origen en el bucket de S3.
* **Monitoreo y Analytics:** Cada peticion que recibe el backend genera un log en un bucket de S3, el cual esta conectado a una tabla de Apache Hive para auditoria y analisis de comportamiento de usuarios.

---

## Flujo de Datos y Machine Learning

La logica de datos y modelado se encuentra unificada en el pipeline completo (`Full_preprocessing_training_process.ipynb`) ubicado en la carpeta de Colab. Este proceso automatiza la triangulacion de tres fuentes principales de datos:

* **Football-Data.co.uk:** Resultados historicos, cuotas de mercado y estadisticas basicas de los encuentros.
* **Understat:** Metricas avanzadas de rendimiento como Goles Esperados (xG), Puntos Esperados (xPts) y PPDA.
* **Transfermarkt:** Datos economicos y de plantilla para calcular el valor de mercado y la calidad de los onces iniciales.

### Fases del Pipeline Centralizado

1. **Preprocesamiento de Estadisticas (Matchstats Preprocessing):**
* Carga, limpieza y validacion de tipos de datos.
* Tratamiento de valores nulos y homogeneizacion de nombres de equipos.
* Ingenieria de caracteristicas mediante el calculo de medias moviles y medias moviles ponderadas exponencialmente (EWMA) para capturar la racha reciente de los equipos.


2. **Calidad del Once y Contexto Tactico (Context Preprocessing):**
* Cruce de alineaciones confirmadas con las valoraciones economicas de Transfermarkt.
* Asignacion de formaciones tacticas y analisis del historico de entrenadores.
* Calculo de metricas agregadas del once titular (edad media, valor de mercado total, experiencia).


3. **Entrenamiento y Evaluacion del Modelo:**
* Transformacion matricial a formato comparativo (Local vs Visitante).
* Division temporal estricta entre conjuntos de entrenamiento y prueba (Train/Test Split) para evitar la fuga de datos (Data Leakage).
* Construccion de una Red Neuronal Profunda (DNN) multi-entrada con capas de embedding para variables categoricas y densas para variables continuas.
* Entrenamiento optimizado con regularizacion y Early Stopping para evitar el sobreajuste.
* Exportacion automatica de los archivos del modelo entrenado, escaladores, codificadores de variables categoricas y metadatos hacia el bucket de AWS S3.



---

## Requisitos y Dependencias de Infraestructura

Para el correcto despliegue del sistema completo se requiere:

* Docker y Docker Compose instalado en la maquina local o instancia EC2.
* Credenciales de AWS (IAM User) con politicas de lectura y escritura sobre los buckets de S3 asignados.

---

## Instalacion y Uso (Entorno Local)

El proyecto incluye un archivo de configuracion para levantar el entorno de desarrollo local empleando contenedores. Los archivos `.dockerignore` estan configurados en cada modulo para evitar la inclusion de entornos virtuales, archivos locales temporales o dependencias innecesarias en las imagenes de Docker.

Para lanzar el proyecto en el entorno local basta con abrir la terminal en cualquier ide con docker instalado en el sistem y ejecutar
```bash
docker-compose up --build
```
Acceder mediante localhost

# Uso en arquitectura aws

### 1. Configurar Variables de Entorno
Crear una carpeta para el proyecto en la instancia EC2
Crear un archivo `.env` en la raiz del proyecto tomando como base el archivo `.env` de la rama `production`
Subir a dockerhub
Hacer pull desde la instancia EC2
Una vez este configurado correctamente, creamos un docker-compose-yml en la instancia EC2, cogiendo como base el presente en la rama `production`
Ajustamos las variables y puertos

### 2. Desplegar con Docker Compose

Desde la raiz , ejecute el siguiente comando en la terminal:

```bash
docker-compose up --build
```

Acceder en principio mediante:
* **Frontend:** Disponible localmente en `http://localhost:3000` (o el puerto configurado en el entorno de React).
* **Backend (Documentacion Interactiva):** Disponible en `http://localhost:8000/docs`.

---

## Resumen Gestion de Entornos 

El ciclo de vida del software se administra mediante el aislamiento en ramas de Git:

* **Rama main / develop (Desarrollo):** Orientada a pruebas locales mediante `docker-compose.yml`.
* **Rama prod (Produccion):** Modifica el comportamiento para el entorno en la nube.
1. Las imagenes estables del Frontend y Backend se compilan y se alojan en DockerHub.
2. La instancia AWS EC2 descarga estas imagenes y las ejecuta mediante un archivo `docker-compose.prod.yml`.
3. Al iniciar el contenedor del backend en EC2, la API de FastAPI descarga los pesos de la red neuronal y los transformadores desde S3 y los mantiene en la memoria RAM para garantizar respuestas de baja latencia.



---

## Estructura del Repositorio

```text
├── backend/                                      # Codigo de la API en FastAPI
│   ├── .dockerignore                             # Exclusion de archivos para el contenedor de la API
│   ├── Dockerfile
│   └── ...
├── colab/                                        # Entorno de experimentacion y entrenamiento inicial
│   └── Full_preprocessing_training_process.ipynb # Pipeline centralizado de datos y entrenamiento
├── frontend/                                     # Aplicacion SPA en React
│   ├── .dockerignore                             # Exclusion de archivos para el contenedor de la interfaz
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml                            # Orquestador de contenedores local
└── README.md                                     # Esta documentacion

```

```

```
