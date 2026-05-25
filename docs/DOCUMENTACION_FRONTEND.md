# Documentación Frontend React - DeepStats

## Indice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Configuración](#configuración)
4. [Componentes](#componentes)
5. [Flujo de Datos](#flujo-de-datos)
6. [Integración con API](#integración-con-api)
7. [Estilos y Diseño](#estilos-y-diseño)
8. [Dependencias](#dependencias)

---

## Descripción General

El frontend es una aplicación React que proporciona una interfaz interactiva para consultar predicciones de resultados de partidos de fútbol. Los usuarios pueden seleccionar un partido de una lista y visualizar las probabilidades predichas por el modelo de IA en forma de gráficos y barras de progreso.

### Características Principales

- Listado de partidos disponibles
- Visualización en tiempo real de predicciones
- Gráficos interactivos con Recharts
- Comparación visual de resultado real vs predicción
- Diseño oscuro (dark mode)

---

## Arquitectura del Proyecto

```
project-root/
├── env.js              # Configuración global (API URL)
└── favicon.svg
├── src/
│   ├── components/
│   │   └── MatchCard.jsx   # Componente de tarjeta de partido
│   ├── pages/
│   │   └── Matches.jsx     # Página principal
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           # Estilos globales
├── index.html              # HTML principal
├── package.json
├── package-lock.json          # Configuración Vite
```

---

## Configuración

### Archivo: env.js

Ubicación: `public/env.js`

```javascript
window.__ENV__ = {
  VITE_API_URL: "http://54.173.157.105:8000"
};
```

Este archivo define la URL base de la API que será utilizada por toda la aplicación.

**Cómo funciona:**
1. El archivo se carga en index.html mediante `<script src="/env.js"></script>`
2. Crea un objeto global `window.__ENV__`
3. Los componentes acceden a través de `window.__ENV__.VITE_API_URL`

**Ventajas:**
- Configuración dinámica sin necesidad de rebuild
- Cambiar API URL editando un archivo simple
- Funciona en cualquier ambiente (desarrollo, staging, producción)

## Componentes

### 1. Matches.jsx - Componente Principal

Ubicación: `src/pages/Matches.jsx`

Este es el componente principal que gestiona la lista paginada de partidos.

#### Estado (useState)

```javascript
const [partidos, setPartidos] = useState([]);
// Array de objetos partido obtenido de la API

const [loading, setLoading] = useState(false);
// Indica si hay una petición en proceso

const [currentPage, setCurrentPage] = useState(0);
// Página actual de la paginación

const ITEMS_PER_PAGE = 6;
// Constante: 6 partidos por página
```

#### Efectos (useEffect) - LOAD GAMES

```javascript
const API_URL = window.__ENV__.VITE_API_URL;

useEffect(() => {
  fetch(`${API_URL}/games`)
    .then((res) => res.json())
    .then((data) => setPartidos(data))
    .catch((err) => console.error(err));
}, []);
```

**Ejecución:**
- Se ejecuta una sola vez al montar el componente (dependency array vacío)
- Obtiene la lista de partidos disponibles de `GET /games`
- Almacena los resultados en estado `partidos`

#### Paginación

```javascript
const totalPages = Math.ceil(partidos.length / ITEMS_PER_PAGE);
const startIdx = currentPage * ITEMS_PER_PAGE;
const endIdx = startIdx + ITEMS_PER_PAGE;
const partidosPaginados = partidos.slice(startIdx, endIdx);

const handleNextPage = () => {
  if (currentPage < totalPages - 1) {
    setCurrentPage(currentPage + 1);
  }
};

const handlePrevPage = () => {
  if (currentPage > 0) {
    setCurrentPage(currentPage - 1);
  }
};
```

**Características:**
- Calcula el total de páginas según cantidad de partidos
- `startIdx` y `endIdx` definen qué partidos mostrar
- `partidosPaginados` contiene solo los 6 partidos de la página actual
- Botones deshabilitados en extremos (primera y última página)

#### Layout Principal

```javascript
style={{
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
  backgroundColor: "#0b0f0c",
  minHeight: "calc(100vh - 110px)",
  padding: "40px",
  boxSizing: "border-box",
}}
```

**Explicación:**
- Layout vertical con flexbox
- Fondo oscuro (#0b0f0c)
- Altura mínima: viewport minus navbar
- Padding uniforme de 40px

#### Encabezado

```javascript
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #333",
  paddingBottom: "20px",
  marginBottom: "10px",
}}>
  <h2 style={{
    color: "#fff",
    margin: 0,
    fontSize: "1rem",
    letterSpacing: "1px",
    textTransform: "uppercase",
  }}>
    Partidos ({partidos.length})
  </h2>
</div>
```

**Características:**
- Título con contador de partidos totales
- Borde inferior sutil
- Estilos: uppercase, letter spacing

#### Contenedor de Tarjetas

```javascript
<div style={{
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
}}>
  {partidosPaginados.map((p, index) => (
    <MatchCard
      key={startIdx + index}
      partido={p}
      isLoading={loading}
      setLoading={setLoading}
      API_URL={API_URL}
    />
  ))}
</div>
```

**Características:**
- Layout vertical de tarjetas
- Map sobre `partidosPaginados` (solo los 6 de la página)
- Props: partido, isLoading, setLoading, API_URL
- key basado en índice absoluto (startIdx + index)

#### Controles de Paginación

```javascript
<div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  marginTop: "30px",
  borderTop: "1px solid #333",
  paddingTop: "20px",
}}>
  <button onClick={handlePrevPage} disabled={currentPage === 0}>
    ← Anterior
  </button>
  
  <div>
    Página {totalPages > 0 ? currentPage + 1 : 0} de {totalPages}
  </div>
  
  <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
    Siguiente →
  </button>
</div>
```

**Características:**
- Botones "Anterior" y "Siguiente" centrados
- Indicador de página actual
- Botones deshabilitados en extremos (fondo gris #222, cursor not-allowed)
- Borde superior sutil para separación
    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
      {resultado.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**Estado 2: Cargando**
```javascript
: loading ? (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
    <div style={{ fontSize: "1.2rem", color: "#00ff88", marginBottom: "10px" }}>Consultando a la IA...</div>
    <p style={{ fontSize: "0.85rem" }}>Calculando probabilidades del partido</p>
  </div>
) : ...}
```

**Estado 3: Sin selección**
```javascript
: (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "#444" }}>
    Selecciona un partido del panel izquierdo para generar la predicción
  </div>
)
```

---

### 2. MatchCard.jsx - Componente de Tarjeta de Partido

Ubicación: `src/components/MatchCard.jsx`

Componente que renderiza una tarjeta individual de partido con funcionalidad de predicción expandible.

#### Props Recibidas

```javascript
{
  partido,        // Objeto del partido con datos
  isLoading,      // Boolean: indica si se está cargando la predicción
  setLoading,     // Función para actualizar estado de carga
  API_URL         // URL base de la API
}
```

#### Estado (useState)

```javascript
const [expanded, setExpanded] = useState(false);
// Controla si la tarjeta está expandida para mostrar predicción

const [resultado, setResultado] = useState(null);
// Array con probabilidades formateadas para gráfico

const [resultadoReal, setResultadoReal] = useState(null);
// Resultado real del partido ("H", "D", "A")
```

#### Compatibilidad de Datos

```javascript
// Compatibilidad con ambos formatos de datos
const homeTeam = partido.home_team || partido.Equipo_L;
const awayTeam = partido.away_team || partido.Equipo_V;
const managerHome = partido.home_manager || "";
const managerAway = partido.away_manager || "";
const matchDate = partido.date || partido.Fecha || partido.Date || "";

// Variables para las formaciones
const formationHome = partido.home_formation || partido.Formacion_L || "";
const formationAway = partido.away_formation || partido.Formacion_V || "";
```

**Características:**
- Soporta múltiples formatos de datos de API
- Fallback a valores vacíos si no existen
- Permite integración con diferentes fuentes de datos

#### Función: predecirPartido - PREDICT MATCH

```javascript
const predecirPartido = async () => {
  setLoading(true);
  setExpanded(true);
  setResultado(null);
  setResultadoReal(null);

  try {
    const response = await fetch(`${API_URL}/predict-test/${partido.game_id}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Error en predicción");
    }

    const data = await response.json();

    const datosGrafico = [
      {
        name: "LOCAL",
        valor: parseFloat((data.probabilities.home_win * 100).toFixed(1)),
        prob: (data.probabilities.home_win * 100).toFixed(1),
        color: "#00ff88",
        code: "H",
      },
      {
        name: "EMPATE",
        valor: parseFloat((data.probabilities.draw * 100).toFixed(1)),
        prob: (data.probabilities.draw * 100).toFixed(1),
        color: "#666666",
        code: "D",
      },
      {
        name: "VISITANTE",
        valor: parseFloat((data.probabilities.away_win * 100).toFixed(1)),
        prob: (data.probabilities.away_win * 100).toFixed(1),
        color: "#00ccff",
        code: "A",
      },
    ];

    setResultado(datosGrafico);
    setResultadoReal(data.real_result);
  } catch (error) {
    console.error(error);
    alert("Error realizando predicción");
  }

  setLoading(false);
};
```

**Flujo:**
1. Establece `loading = true` y expande la tarjeta
2. Resetea resultados previos
3. Realiza POST a `/predict-test/{game_id}`
4. Transforma probabilidades decimales a porcentajes
5. Almacena datos y resultado real
6. Establece `loading = false`

#### Función: checkAcierto - CHECK HIT / MISS

```javascript
const checkAcierto = () => {
  if (!resultado || !resultadoReal) return null;

  const prediccionIA = [...resultado].sort((a, b) => b.valor - a.valor)[0]
    .code;

  return prediccionIA === resultadoReal;
};
```

**Lógica:**
1. Verifica que existan resultados y resultado real
2. Ordena resultados por probabilidad (mayor a menor)
3. Obtiene el código del resultado con mayor probabilidad
4. Compara con resultado real
5. Retorna true (acierto) o false (fallo)

---

## Flujo de Datos

### Flujo Completo: Seleccionar Partido y Obtener Predicción

```
Usuario hace clic en botón "Ver Predicción" en MatchCard
         │
         ▼
MatchCard.predecirPartido()
         │
         ├─ setLoading(true)
         ├─ setExpanded(true)
         ├─ setResultado(null)
         └─ setResultadoReal(null)
                   │
                   ▼
            fetch POST /predict-test/{game_id}
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
      ERROR              SUCCESS
         │                   │
         │                   ▼
         │         Response JSON
         │         {
         │           game_id: number,
         │           probabilities: {
         │             away_win: float,
         │             draw: float,
         │             home_win: float
         │           },
         │           real_result: "H"|"D"|"A"
         │         }
         │                   │
         │                   ▼
         │         Transformar a datosGrafico
         │         [
         │           { name: "LOCAL", valor: 60, prob: "60.0", color: "#00ff88", code: "H" },
         │           { name: "EMPATE", valor: 25, prob: "25.0", color: "#666666", code: "D" },
         │           { name: "VISITANTE", valor: 15, prob: "15.0", color: "#00ccff", code: "A" }
         │         ]
         │                   │
         │                   ▼
         │         setResultado(datosGrafico)
         │         setResultadoReal(data.real_result)
         │                   │
         └─────────┬─────────┘
                   │
                   ▼
            setLoading(false)
                   │
                   ▼
MatchCard se expande mostrando resultados y gráficos
```

### Flujo de Paginación (Matches.jsx)

```
Usuario hace clic en botón "Siguiente" o "Anterior"
         │
         ▼
handleNextPage() o handlePrevPage()
         │
         ├─ Verifica límites (primera/última página)
         │
         ▼
setCurrentPage(newPage)
         │
         ▼
Recalcula partidosPaginados con slice()
         │
         ▼
Se re-renderiza solo los 6 partidos de la nueva página
```

### Transformación de Datos

**Entrada (API Response):**
```json
{
  "probabilities": {
    "home_win": 0.60,
    "draw": 0.25,
    "away_win": 0.15
  },
  "real_result": "H"
}
```

**Transformación:**
```javascript
const home_win_percent = 0.60 * 100 = 60
const home_win_fixed = 60.toFixed(1) = "60.0"
const home_win_parsed = parseFloat("60.0") = 60

// Resultado final:
{
  name: "LOCAL",
  valor: 60,              // Para gráfico (width)
  prob: "60.0",           // Para mostrar con %
  color: "#00ff88",       // Color en pantalla
  code: "H"               // Código para comparar con real
}
```

---

## Integración con API

### URL Base

Se obtiene de `window.__ENV__.VITE_API_URL` definido en `env.js`

```javascript
const API_URL = window.__ENV__.VITE_API_URL;
// Valor: "http://54.173.157.105:8000"
```

### Endpoints Utilizados

#### GET /games

**Propósito:** Obtener lista de partidos disponibles

**Llamada:**
```javascript
fetch(`${API_URL}/games`)
  .then((res) => res.json())
  .then((data) => setPartidos(data))
```

**Esperado:**
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
  ...
]
```

**Ejecución:** Al montar el componente (useEffect con dependency array vacío)

#### POST /predict-test/{game_id}

**Propósito:** Obtener predicción de un partido

**Llamada:**
```javascript
const response = await fetch(
  `${API_URL}/predict-test/${partido.game_id}`,
  { method: "POST" }
);
const data = await response.json();
```

**Parámetro:**
- `game_id` (path parameter): ID del partido

**Esperado:**
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

**Errores:**
- 404 si el game_id no existe
- Capturado en catch, muestra alert

**Ejecución:** Al hacer clic en un MatchCard

### Manejo de Errores

```javascript
try {
  const response = await fetch(...);
  
  if (!response.ok) {
    throw new Error("Error en predicción");
  }
  
  const data = await response.json();
  // Procesar datos
  
} catch (error) {
  console.error(error);
  alert("Error realizando predicción");
}
```

---

## Estilos y Diseño

### Paleta de Colores

```
Fondo principal:        #0b0f0c    Gris muy oscuro (casi negro)
Fondo secundario:       #0a0a0a    Negro puro
Fondo terciario:        #111       Gris muy oscuro
Borde:                  #222       Gris oscuro
Texto principal:        #fff       Blanco
Texto secundario:       #ccc       Gris claro
Texto terciario:        #888       Gris medio
Texto débil:            #666       Gris oscuro
Texto muy débil:        #555       Gris más oscuro

Color LOCAL (HOME):     #00ff88    Verde neon
Color VISITANTE (AWAY): #00ccff    Cian neon
Color EMPATE (DRAW):    #666666    Gris
Color ERROR:            #ff4444    Rojo
Color ACIERTO:          #00ff88    Verde neon
```

### Tipografía

- **Font Family:** Sistema por defecto (no especificado, usa serif del navegador)
- **Encabezados:** `fontSize: "1.2rem"`, `fontWeight: "bold"`, `textTransform: "uppercase"`
- **Texto normal:** `fontSize: "0.9rem"`
- **Texto pequeño:** `fontSize: "0.8rem"` o `"0.85rem"`
- **Spacing:** `letterSpacing: "1px"` en títulos

### Propiedades CSS Utilizadas

```css
/* Bordes */
border: "1px solid #222"
border: "1px dashed #222"
borderRadius: "4px" o "8px"
borderBottom: "1px solid #333"

/* Fondos */
backgroundColor: "#0b0f0c" o "#0a0a0a"
background: "rgba(0, 255, 136, 0.1)"

/* Espaciado */
padding: "15px", "20px", "30px"
margin: "0", "10px", "25px"
gap: "15px", "30px", "40px"

/* Dimensiones */
width: "100%", "100vw", "6px"
height: "100%", "calc(100vh - 40px)", "260px", "6px"

/* Display */
display: "flex", "grid"
flexDirection: "column"
justifyContent: "center", "space-between"
alignItems: "center"

/* Positioning */
position: "sticky"
top: 0
zIndex: 10

/* Scrolling */
overflowY: "auto"

/* Responsive */
gridTemplateColumns: "minmax(300px, 380px) 1fr"
gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
boxSizing: "border-box"

/* Efectos */
transition: "all 0.3s"
cursor: "pointer", "not-allowed"
opacity: 0.6, 1
```

### Responsive Design

**Grid principal:**
```javascript
gridTemplateColumns: "minmax(300px, 380px) 1fr"
```
- Panel izquierdo: ancho mínimo 300px, máximo 380px
- Panel derecho: ocupa espacio restante
- En pantallas muy pequeñas, podría necesitar ajustes adicionales

**Grid interior (Probabilidades + Gráfico):**
```javascript
gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
```
- Cada columna mínimo 280px
- Se distribuyen automáticamente según espacio disponible
- En pantalla pequeña, apila verticalmente

### Dark Mode

El diseño es inherentemente dark mode:
- Fondos muy oscuros (#0b0f0c, #0a0a0a)
- Texto claro (blanco, gris claro)
- Acentos neon (#00ff88, #00ccff)
- No hay implementación de toggle light/dark

---


## Dependencias

### Dependencias Principales (en package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.5"
  }
}
```

### React (^18.2.0)

Framework principal para la interfaz.

Versión 18 incluye:
- Concurrent rendering
- Automatic batching
- useTransition hook
- useDeferredValue hook
- Suspense mejorado

Uso en proyecto:
- Components funcionales con hooks
- useState para estado
- useEffect para efectos secundarios

### React-DOM (^18.2.0)

Librería para renderizar React en el DOM.

Necesaria para:
- ReactDOM.render() (aunque aquí se usa implicit)
- Renderizar en `<div id="root"></div>`

### Recharts (^2.10.3)

Librería de gráficos construida con React.

Uso en proyecto:
```javascript
<ResponsiveContainer>
  <BarChart>
    <XAxis>
    <YAxis>
    <Tooltip>
    <Bar>
      <Cell>
```

Componentes utilizados:
- `ResponsiveContainer` - Contenedor responsivo
- `BarChart` - Gráfico de barras
- `XAxis` - Eje X
- `YAxis` - Eje Y
- `Tooltip` - Tooltip al hover
- `Bar` - Serie de datos
- `Cell` - Estilo individual de barras

### Vite (^4.4.5)

Build tool moderno y rápido.

Ventajas sobre Webpack/CRA:
- Startup más rápido (HMR instantáneo)
- Build muy rápido
- Configuración minimal
- Mejor soporte para assets estáticos
---