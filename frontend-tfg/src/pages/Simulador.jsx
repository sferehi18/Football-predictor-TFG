// Simulador.jsx
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import MatchCard from "../components/MatchCard";

function Simulador() {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchSeleccionado, setMatchSeleccionado] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [resultadoReal, setResultadoReal] = useState(null);
  const [metricasAvanzadas, setMetricasAvanzadas] = useState(null); // <- NUEVO: Almacena std y medias continuas

  const API_URL = "http://localhost:8000";

  // =========================
  // LOAD GAMES
  // =========================
  useEffect(() => {
    fetch(`${API_URL}/games`)
      .then((res) => res.json())
      .then((data) => setPartidos(data))
      .catch((err) => console.error(err));
  }, []);

  // =========================
  // PREDICT MATCH
  // =========================
  const predecirPartido = async (partido) => {
    setLoading(true);
    setMatchSeleccionado(partido);
    setResultado(null);
    setResultadoReal(null);
    setMetricasAvanzadas(null);

    try {
      const response = await fetch(
        `${API_URL}/predict-test/${partido.game_id}`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Error en predicción");
      
      const data = await response.json();

      // Mapeo adaptivo al formato del Backend
      const mcH = data.montecarlo?.H || 0;
      const mcD = data.montecarlo?.D || 0;
      const mcA = data.montecarlo?.A || 0;
      const totalMontecarlo = mcH + mcD + mcA || 1;

      // Guardamos las métricas de incertidumbre (mecanismo de defensa contra nulos)
      setMetricasAvanzadas(data.metrics || data.stats || null);

      const datosGrafico = [
        {
          name: "LOCAL",
          valor: mcH,
          modelProb: ((data.probabilities?.home_win || data.home_win || 0) * 100).toFixed(1),
          mcProb: ((mcH / totalMontecarlo) * 100).toFixed(1),
          color: "#00ff88",
          code: "H",
        },
        {
          name: "EMPATE",
          valor: mcD,
          modelProb: ((data.probabilities?.draw || data.draw || 0) * 100).toFixed(1),
          mcProb: ((mcD / totalMontecarlo) * 100).toFixed(1),
          color: "#aaa",
          code: "D",
        },
        {
          name: "VISITANTE",
          valor: mcA,
          modelProb: ((data.probabilities?.away_win || data.away_win || 0) * 100).toFixed(1),
          mcProb: ((mcA / totalMontecarlo) * 100).toFixed(1),
          color: "#00ccff",
          code: "A",
        },
      ];

      setResultado(datosGrafico);
      setResultadoReal(data.real_result);
    } catch (error) {
      console.error(error);
      alert("Error realizando la predicción interactiva");
    }
    setLoading(false);
  };

  // =========================
  // AUXILIAR METRICS CALCULATIONS
  // =========================
  const checkAcierto = () => {
    if (!resultado || !resultadoReal) return null;
    const prediccionIA = [...resultado].sort(
      (a, b) => parseFloat(b.modelProb) - parseFloat(a.modelProb)
    )[0].code;
    return prediccionIA === resultadoReal;
  };

  const modeloGanador = resultado
    ? [...resultado].sort((a, b) => parseFloat(b.modelProb) - parseFloat(a.modelProb))[0]
    : null;

  const montecarloGanador = resultado
    ? [...resultado].sort((a, b) => parseFloat(b.mcProb) - parseFloat(a.mcProb))[0]
    : null;

  const maxDiff = resultado
    ? Math.max(...resultado.map((r) => Math.abs(parseFloat(r.modelProb) - parseFloat(r.mcProb))))
    : 0;
  const convergencia = (100 - maxDiff).toFixed(1);

  const totalSimulaciones = resultado ? resultado.reduce((acc, r) => acc + r.valor, 0) : 0;

  // Cálculo dinámico del nivel de confianza (Antes llamado riesgo)
  const getRiskLevel = () => {
    if (!metricasAvanzadas) return { text: "N/A", color: "#666" };
    
    // Extraemos la desviación estándar media
    const std_H = metricasAvanzadas.mc_std_H ?? metricasAvanzadas.mc_std?.[2] ?? 0;
    const std_A = metricasAvanzadas.mc_std_A ?? metricasAvanzadas.mc_std?.[0] ?? 0;
    const avg_std = (std_H + std_A) / 2;

    // Traducimos los valores matemáticos a lenguaje natural
    if (avg_std > 0.06) return { text: "PARTIDO CAÓTICO / IMPREDECIBLE", color: "#ff4444" };
    if (avg_std > 0.035) return { text: "PARTIDO IGUALADO / DUDOSO", color: "#ffaa00" };
    return { text: "PREDICCIÓN SÓLIDA", color: "#00ff88" };
  };

  const riesgo = getRiskLevel();

  return (
    <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", height: "100%", boxSizing: "border-box" }}>
      
      {/* PANEL IZQUIERDO: LISTA DE PARTIDOS */}
      <div style={{ flex: "1", minWidth: "320px", maxWidth: "380px", height: "calc(100vh - 120px)", overflowY: "auto", paddingRight: "15px" }}>
        <h2 style={{ color: "#fff", margin: "0 0 20px 0", fontSize: "1rem", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid #333", paddingBottom: "15px", position: "sticky", top: 0, backgroundColor: "#0b0f0c", zIndex: 10 }}>
          Partidos ({partidos.length})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {partidos.map((p, index) => (
            <MatchCard key={index} partido={p} isSelected={matchSeleccionado === p} isLoading={loading} onPredict={predecirPartido} />
          ))}
        </div>
      </div>

      {/* PANEL DERECHO: MONITOR DE DASHBOARD */}
      <div style={{ flex: "2", position: "sticky", top: 0 }}>
        {resultado ? (
          <div className="card" style={{ padding: "30px", border: "1px solid #222", backgroundColor: "#0a0a0a", borderRadius: "8px" }}>
            
            {/* ENCABEZADO */}
            <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "30px", fontSize: "1.2rem", letterSpacing: "1px", textTransform: "uppercase" }}>
              <span style={{ color: "#00ff88" }}>{matchSeleccionado.home_team}</span>
              {" vs "}
              <span style={{ color: "#00ccff" }}>{matchSeleccionado.away_team}</span>
            </h2>

            {/* WIDGET 1: GROUND TRUTH / RESULTADO REAL */}
            {resultadoReal && (
              <div style={{ marginBottom: "25px", padding: "18px", backgroundColor: "#000", border: `1px solid ${checkAcierto() ? "#00ff88" : "#ff4444"}`, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "4px" }}>
                <div>
                  <div style={{ color: "#555", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>Resultado Real (Ground Truth)</div>
                  <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "bold" }}>
                    {resultadoReal === "H" ? "VICTORIA LOCAL" : resultadoReal === "A" ? "VICTORIA VISITANTE" : "EMPATE"}
                  </div>
                </div>
                <div style={{ backgroundColor: checkAcierto() ? "#00ff88" : "#ff4444", color: "#000", padding: "6px 14px", fontWeight: "bold", fontSize: "0.75rem", borderRadius: "2px" }}>
                  {checkAcierto() ? "INFERENCIA CORRECTA" : "MISS EN BACKTESTING"}
                </div>
              </div>
            )}

            {/* FILA DE CONTENIDO PRINCIPAL */}
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
              
              {/* SUBPANEL IZQUIERDO: PROBABILIDADES */}
              <div style={{ flex: 1, minWidth: "260px" }}>
                <h4 style={{ color: "#888", marginBottom: "20px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Distribución Teórica vs Empírica
                </h4>

                {resultado.map((r, i) => {
                  // Extraemos volatilidad individual por resultado si existe en las métricas
                  const stdKey = r.code === "H" ? "mc_std_H" : r.code === "A" ? "mc_std_A" : "mc_std_D";
                  const stdValue = metricasAvanzadas ? (metricasAvanzadas[stdKey] ?? metricasAvanzadas.mc_std?.[r.code === "H" ? 2 : r.code === "D" ? 1 : 0]) : null;

                  return (
                    <div key={i} style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#ccc", fontSize: "0.85rem" }}>{r.name}</span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: r.color, fontWeight: "bold", fontSize: "0.95rem" }}>{r.modelProb}%</span>
                          <span style={{ color: "#666", fontSize: "0.75rem", marginLeft: "8px" }}>MC {r.mcProb}%</span>
                          {stdValue !== null && (
                            <div style={{ color: "#555", fontSize: "0.7rem", marginTop: "2px" }}>
                              Incertidumbre: ±{(stdValue * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ width: "100%", height: "5px", background: "#151515", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${r.modelProb}%`, height: "100%", background: r.color, transition: "width 1s ease-out" }} />
                      </div>
                    </div>
                  );
                })}

              {/* NUEVA SECCIÓN DE ANÁLISIS DE FIABILIDAD */}
              <div style={{ marginTop: "25px", padding: "15px", backgroundColor: "#0f1110", border: "1px solid #1a1e1b", borderRadius: "6px" }}>
                <div style={{ color: "#666", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                  Nivel de Confianza de la IA
                </div>
                
                {/* El color y el texto (riesgo.text) los modificaremos arriba para que digan "SEGURO", "INCERTO", etc. */}
                <div style={{ color: riesgo.color, fontWeight: "bold", fontSize: "0.85rem", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  {riesgo.text}
                </div>
                
                <p style={{ color: "#666", fontSize: "0.75rem", margin: 0, lineHeight: "1.3" }}>
                  Mide qué tan seguro está el modelo de su propia predicción. Si el partido sufre imprevistos (ruido en la simulación), un nivel alto indica que el favorito probablemente gane de todas formas.
                </p>
              </div>

            </div>

            {/* SUBPANEL DERECHO: GRÁFICO RECHARTS */}
            <div style={{ flex: 1.3, minWidth: "280px", height: "300px" }}>
              <h4 style={{ color: "#888", textAlign: "center", marginBottom: "15px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Partidos Paralelos Simulados
              </h4>

              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={resultado} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#444" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#444" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#111" }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div style={{ backgroundColor: "#000", border: "1px solid #222", padding: "10px", borderRadius: "4px", fontSize: "0.8rem" }}>
                          <div style={{ color: d.color, fontWeight: "bold", marginBottom: "5px" }}>{d.name}</div>
                          <div style={{ color: "#888" }}>Simulaciones Ganadas: <span style={{ color: "#fff" }}>{d.valor} de 1000</span></div>
                          <div style={{ color: "#888" }}>Prob. tras simular: <span style={{ color: d.color }}>{d.mcProb}%</span></div>
                          <div style={{ color: "#888" }}>Prob. Inicial (Teórica): <span style={{ color: "#fff" }}>{d.modelProb}%</span></div>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="valor" radius={[3, 3, 0, 0]} maxBarSize={50}>
                    {resultado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
                {/* MÉTRICAS ESTRUCTURALES DEL FOOTER DEL MONITOR */}
                <div style={{ marginTop: "10px", borderTop: "1px solid #151515", paddingTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
                  <div>
                    <span style={{ color: "#555" }}>Convergencia (LLN):</span>
                    <span style={{ color: "#00ff88", marginLeft: "6px", fontWeight: "bold" }}>{convergencia}%</span>
                  </div>
                  <div>
                    <span style={{ color: "#555" }}>Escenarios Ejecutados:</span>
                    <span style={{ color: "#fff", marginLeft: "6px" }}>{totalSimulaciones}</span>
                  </div>
                  <div>
                    <span style={{ color: "#555" }}>Sesgo de Inferencia:</span>
                    <span style={{ color: modeloGanador?.code === montecarloGanador?.code ? "#00ff88" : "#ff4444", marginLeft: "6px" }}>
                      {modeloGanador?.code === montecarloGanador?.code ? "NEUTRO" : "DIVERGENTE"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#555" }}>Backtesting Mode:</span>
                    <span style={{ color: "#999", marginLeft: "6px" }}>V2.0 Core</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* ESTADO POR DEFECTO SIN PARTIDO SELECCIONADO */
          <div style={{ height: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #222", borderRadius: "8px", color: "#444" }}>
            <h3 style={{ textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontSize: "0.95rem" }}>
              Ningún partido seleccionado
            </h3>
            <p style={{ fontSize: "0.85rem", margin: 0 }}>Haz clic en "Ver Predicción" en el panel izquierdo para inicializar el Montecarlo</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Simulador;