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

  // =========================
  // LOAD GAMES
  // =========================
const API_URL = import.meta.env.VITE_API_URL
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
        },
      );

      if (!response.ok) {
        throw new Error("Error en predicción");
      }

      const data = await response.json();

      const datosGrafico = [
        {
          name: "LOCAL",
          valor: data.montecarlo.H,
          prob: (data.probabilities.home_win * 100).toFixed(1),
          color: "#00ff88",
          code: "H",
        },

        {
          name: "EMPATE",
          valor: data.montecarlo.D,
          prob: (data.probabilities.draw * 100).toFixed(1),
          color: "#666666",
          code: "D",
        },

        {
          name: "VISITANTE",
          valor: data.montecarlo.A,
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
        display: "flex",
        gap: "30px",
        alignItems: "flex-start",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* PANEL IZQUIERDO */}

      <div
        style={{
          flex: "1",
          minWidth: "320px",
          maxWidth: "380px",
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          paddingRight: "15px",
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
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

      {/* PANEL DERECHO */}

      <div
        style={{
          flex: "2",
          position: "sticky",
          top: 0,
        }}
      >
        {resultado ? (
          <div
            className="card"
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
              <span style={{ color: "#00ff88" }}>
                {matchSeleccionado.home_team}
              </span>

              {" vs "}

              <span style={{ color: "#00ccff" }}>
                {matchSeleccionado.away_team}
              </span>
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
                  <div
                    style={{
                      color: "#555",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "5px",
                    }}
                  >
                    Ground Truth
                  </div>

                  <div
                    style={{
                      color: "#fff",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    {resultadoReal === "H"
                      ? "VICTORIA LOCAL"
                      : resultadoReal === "A"
                        ? "VICTORIA VISITANTE"
                        : "EMPATE"}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: checkAcierto() ? "#00ff88" : "#ff4444",

                    color: "#000",

                    padding: "5px 15px",

                    fontWeight: "bold",

                    fontSize: "0.8rem",

                    borderRadius: "2px",
                  }}
                >
                  {checkAcierto() ? "INFERENCIA CORRECTA" : "MISS"}
                </div>
              </div>
            )}

            {/* CONTENIDO */}

            <div
              style={{
                display: "flex",
                gap: "40px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* PROBABILIDADES */}

              <div
                style={{
                  flex: 1,
                  minWidth: "250px",
                }}
              >
                <h4
                  style={{
                    color: "#888",
                    marginBottom: "25px",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Probabilidades
                </h4>

                {resultado.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "25px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ color: "#ccc" }}>{r.name}</span>

                      <span
                        style={{
                          color: r.color,
                          fontWeight: "bold",
                        }}
                      >
                        {r.prob}%
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        background: "#222",
                      }}
                    >
                      <div
                        style={{
                          width: `${r.prob}%`,
                          height: "100%",
                          background: r.color,
                          transition: "width 1s ease-out",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* GRAFICO */}

              <div
                style={{
                  flex: 1.5,
                  minWidth: "300px",
                  height: "320px",
                }}
              >
                <h4
                  style={{
                    color: "#888",
                    textAlign: "center",
                    marginBottom: "20px",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Simulaciones Montecarlo
                </h4>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resultado}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#555"
                      tick={{
                        fill: "#888",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      stroke="#555"
                      tick={{
                        fill: "#888",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      cursor={{ fill: "#1a1a1a" }}
                      contentStyle={{
                        backgroundColor: "#000",
                        border: "1px solid #333",
                        borderRadius: "4px",
                        color: "#fff",
                      }}
                    />

                    <Bar dataKey="valor" radius={[2, 2, 0, 0]} maxBarSize={60}>
                      {resultado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* FOOTER */}

            <div
              style={{
                fontSize: "0.7rem",
                color: "#333",
                marginTop: "30px",
                textAlign: "center",
              }}
            >
              Backtesting Module v2.0
            </div>
          </div>
        ) : (
          <div
            style={{
              height: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #1a1a1a",
              borderRadius: "8px",
              color: "#444",
            }}
          >
            <h3
              style={{
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Ningún partido seleccionado
            </h3>

            <p style={{ fontSize: "0.9rem" }}>Selecciona "Ver Predicción"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Simulador;
