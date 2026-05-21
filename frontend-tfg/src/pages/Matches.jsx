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

function Matches() {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchSeleccionado, setMatchSeleccionado] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [resultadoReal, setResultadoReal] = useState(null);

  // =========================
  // LOAD GAMES
  // =========================
  const API_URL = window.__ENV__.VITE_API_URL;

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

    try {
      const response = await fetch(
        `${API_URL}/predict-test/${partido.game_id}`,
        {
          method: "POST",
        }
      );

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

  // =========================
  // CHECK HIT / MISS
  // =========================
  const checkAcierto = () => {
    if (!resultado || !resultadoReal) return null;

    const prediccionIA = [...resultado].sort((a, b) => b.valor - a.valor)[0]
      .code;

    return prediccionIA === resultadoReal;
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(300px, 380px) 1fr", // Columna fija y columna flexible
        gap: "30px",
        width: "100%",                  // Ocupa exactamente el ancho disponible
        maxWidth: "100vw",              // Evita desbordamiento horizontal
        height: "calc(100vh - 40px)",   // Se ajusta a la pantalla verticalmente
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "#0b0f0c"
      }}
    >
      {/* PANEL IZQUIERDO: LISTA DE PARTIDOS */}
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          paddingRight: "10px",
          boxSizing: "border-box"
        }}
      >
        <h2
          style={{
            color: "#fff",
            margin: "0 0 20px 0",
            fontSize: "1rem",
            letterSpacing: "1px",
            textTransform: "uppercase",
            borderBottom: "1px solid #333",
            paddingBottom: "15px",
            position: "sticky",
            top: 0,
            backgroundColor: "#0b0f0c",
            zIndex: 10,
          }}
        >
          Partidos ({partidos.length})
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {partidos.map((p, index) => (
            <MatchCard
              key={index}
              partido={p}
              isSelected={matchSeleccionado === p}
              isLoading={loading}
              onPredict={predecirPartido}
            />
          ))}
        </div>
      </div>

      {/* PANEL DERECHO: DETALLES Y GRÁFICO */}
      <div style={{ height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
        {resultado ? (
          <div
            style={{
              padding: "30px",
              border: "1px solid #222",
              backgroundColor: "#0a0a0a",
              borderRadius: "8px",
            }}
          >
            <h2
              style={{
                color: "#fff",
                textAlign: "center",
                marginBottom: "40px",
                fontSize: "1.2rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#00ff88" }}>{matchSeleccionado.home_team}</span>
              {" vs "}
              <span style={{ color: "#00ccff" }}>{matchSeleccionado.away_team}</span>
            </h2>

            {/* RESULTADO REAL */}
            {resultadoReal && (
              <div
                style={{
                  marginBottom: "30px",
                  padding: "20px",
                  backgroundColor: "#000",
                  border: `1px solid ${checkAcierto() ? "#00ff88" : "#ff4444"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "#555", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>
                    Resultado Real
                  </div>
                  <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "bold" }}>
                    {resultadoReal === "H" ? "VICTORIA LOCAL" : resultadoReal === "A" ? "VICTORIA VISITANTE" : "EMPATE"}
                  </div>
                </div>

                <div style={{ backgroundColor: checkAcierto() ? "#00ff88" : "#ff4444", color: "#000", padding: "5px 15px", fontWeight: "bold", fontSize: "0.8rem", borderRadius: "2px" }}>
                  {checkAcierto() ? "PREDICCIÓN CORRECTA" : "FALLO"}
                </div>
              </div>
            )}

            {/* CONTENIDO INTERNO EN DOS COLUMNAS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", alignItems: "center" }}>
              
              {/* LISTA DE PROBABILIDADES */}
              <div>
                <h4 style={{ color: "#888", marginBottom: "25px", fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Probabilidades
                </h4>
                {resultado.map((r, i) => (
                  <div key={i} style={{ marginBottom: "25px" }}>
                    <div style={{ display: "flex", justifyDisntent: "space-between", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#ccc", fontSize: "0.9rem" }}>{r.name}</span>
                      <span style={{ color: r.color, fontWeight: "bold", fontSize: "0.9rem" }}>{r.prob}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "#111", borderRadius: "3px" }}>
                      <div style={{ width: `${r.valor}%`, height: "100%", backgroundColor: r.color, borderRadius: "3px" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* GRÁFICO RECHARTS */}
              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultado} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#444" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#444" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ backgroundColor: "#000", border: "1px solid #222", color: "#fff" }} />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                      {resultado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        ) : loading ? (
          <div style={{ height: "300px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "1px dashed #222", borderRadius: "8px", color: "#666" }}>
            <div style={{ fontSize: "1.2rem", color: "#00ff88", marginBottom: "10px", fontWeight: "500" }}>Consultando a la IA...</div>
            <p style={{ fontSize: "0.85rem", margin: 0 }}>Calculando probabilidades del partido</p>
          </div>
        ) : (
          <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center", border: "1px dashed #222", borderRadius: "8px", color: "#444", fontSize: "0.9rem" }}>
            Selecciona un partido del panel izquierdo para generar la predicción
          </div>
        )}
      </div>
    </div>
  );
}

export default Matches;
