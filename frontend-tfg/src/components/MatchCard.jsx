import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function MatchCard({ partido, isLoading, setLoading, API_URL }) {
  const [expanded, setExpanded] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [resultadoReal, setResultadoReal] = useState(null);

  // Compatibilidad con ambos formatos de datos
  const homeTeam = partido.home_team || partido.Equipo_L;
  const awayTeam = partido.away_team || partido.Equipo_V;
  const managerHome = partido.home_manager || "";
  const managerAway = partido.away_manager || "";
  const matchDate = partido.date || partido.Fecha || partido.Date || "";
  
  // Variables para las formaciones
  const formationHome = partido.home_formation || partido.Formacion_L || "";
  const formationAway = partido.away_formation || partido.Formacion_V || "";

  // =========================
  // PREDICT MATCH
  // =========================
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

  // =========================
  // CHECK HIT / MISS
  // =========================
  const checkAcierto = () => {
    if (!resultado || !resultadoReal) return null;

    const prediccionIA = [...resultado].sort((a, b) => b.valor - a.valor)[0]
      .code;

    return prediccionIA === resultadoReal;
  };

  // Lógica dinámica para el color del borde perimetral
  const aciertoStatus = checkAcierto();
  const borderStyle = !expanded
    ? "1px solid #333" // Estado cerrado por defecto
    : aciertoStatus === true
    ? "2px solid #00ff88" // Verde si acertó
    : aciertoStatus === false
    ? "2px solid #ff4444" // Rojo si falló
    : "2px solid #00ff88"; // Verde por defecto mientras carga la API

  // =========================
  // RENDER
  // =========================
  return (
    <div
      style={{
        border: borderStyle,
        backgroundColor: expanded ? "#0a0a0a" : "transparent",
        transition: "all 0.3s ease",
        padding: expanded ? "24px" : "16px 24px",
        borderRadius: "12px",
        boxSizing: "border-box",
        width: expanded ? "100%" : "fit-content",
        maxWidth: "100%", 
        margin: "0 auto", 
        display: "flex",
        flexDirection: "column",
        gap: expanded ? "20px" : "15px",
      }}
    >
      {/* CONTENEDOR HORIZONTAL: TARJETA + BOTÓN */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* INFO PRINCIPAL DEL PARTIDO */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            flex: "1 1 auto",
            gap: "20px",
            alignItems: "center",
          }}
        >
          {/* SECCIÓN EQUIPOS Y FECHA */}
          <div style={{ flex: "0 1 auto", minWidth: "250px" }}>
            {matchDate && (
              <div
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: "0.75rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "8px", 
                }}
              >
                {String(matchDate)}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                gap: "15px",
              }}
            >
              {/* LOCAL */}
              <div style={{ textAlign: "center", width: "120px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#222",
                    color: "#00ff88",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px auto",
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                  }}
                >
                  {homeTeam?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {homeTeam ?? "Desconocido"}
                </div>
                {formationHome && (
                  <div style={{ color: "#00ff88", fontSize: "0.75rem", marginTop: "4px", fontWeight: "500", letterSpacing: "1px" }}>
                    {formationHome}
                  </div>
                )}
              </div>

              {/* VS */}
              <div
                style={{
                  color: "#555",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  letterSpacing: "2px",
                }}
              >
                VS
              </div>

              {/* VISITANTE */}
              <div style={{ textAlign: "center", width: "120px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#222",
                    color: "#00ccff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px auto",
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                  }}
                >
                  {awayTeam?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {awayTeam ?? "Desconocido"}
                </div>
                {formationAway && (
                  <div style={{ color: "#00ccff", fontSize: "0.75rem", marginTop: "4px", fontWeight: "500", letterSpacing: "1px" }}>
                    {formationAway}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN MANAGERS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "12px",
              flex: "0 1 auto", 
              borderLeft: "1px solid #222",
              paddingLeft: "20px",
            }}
          >
            <div>
              <div style={{ color: "#aaa", fontSize: "0.7rem", marginBottom: "2px" }}>
                MÁNAGER LOCAL
              </div>
              <div
                style={{
                  color: "#ddd",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "0.85rem",
                  maxWidth: "140px", 
                }}
              >
                {managerHome || "-"}
              </div>
            </div>

            <div>
              <div style={{ color: "#aaa", fontSize: "0.7rem", marginBottom: "2px" }}>
                MÁNAGER VISITANTE
              </div>
              <div
                style={{
                  color: "#ddd",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "0.85rem",
                  maxWidth: "140px", 
                }}
              >
                {managerAway || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN PREDICCIÓN */}
        <button
          onClick={predecirPartido}
          disabled={isLoading}
          style={{
            padding: "10px 20px", 
            backgroundColor: expanded ? "#00ff88" : "transparent",
            color: expanded ? "#000" : "#00ff88",
            border: "1px solid #00ff88",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "600",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            fontSize: "0.8rem",
            transition: "all 0.2s ease",
            opacity: isLoading ? 0.6 : 1,
            whiteSpace: "nowrap",
            flex: "0 0 auto",
            marginLeft: expanded ? "0" : "auto", 
          }}
        >
          {isLoading ? "Cargando..." : "Ver Predicción"}
        </button>
      </div>

      {/* SECCIÓN EXPANDIDA: GRÁFICO Y RESULTADOS */}
      {expanded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            borderTop: "1px solid #222",
            paddingTop: "24px",
            marginTop: "4px",
          }}
        >
          {/* RESULTADO REAL (Banner simplificado, sin badge de texto) */}
          {resultadoReal && (
            <div
              style={{
                padding: "16px 24px",
                backgroundColor: "#111",
                border: "1px solid #222",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                borderRadius: "8px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#888",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "4px",
                  }}
                >
                  Resultado Real
                </div>
                <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "bold" }}>
                  {resultadoReal === "H"
                    ? "VICTORIA LOCAL"
                    : resultadoReal === "A"
                    ? "VICTORIA VISITANTE"
                    : "EMPATE"}
                </div>
              </div>
            </div>
          )}

          {/* GRÁFICOS DE PROBABILIDAD */}
          {resultado && (
            <div style={{ backgroundColor: "#0f0f0f", padding: "20px", borderRadius: "8px" }}>
              <h4
                style={{
                  color: "#888",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  margin: "0 0 20px 0",
                }}
              >
                Probabilidades
              </h4>

              {/* BARRAS DE PROBABILIDAD DETALLADAS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {resultado.map((r, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ color: "#ccc", fontSize: "0.9rem", fontWeight: "500", letterSpacing: "0.5px" }}>
                        {r.name}
                      </span>
                      <span
                        style={{
                          color: r.color,
                          fontWeight: "bold",
                          fontSize: "0.95rem",
                        }}
                      >
                        {r.prob}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        backgroundColor: "#1a1a1a",
                        borderRadius: "5px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${r.valor}%`,
                          height: "100%",
                          backgroundColor: r.color,
                          borderRadius: "5px",
                          transition: "width 0.6s ease-in-out",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTÓN CERRAR */}
          <button
            onClick={() => setExpanded(false)}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "transparent",
              color: "#aaa",
              border: "1px solid #333",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#111";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#aaa";
            }}
          >
            Cerrar Predicción
          </button>
        </div>
      )}
    </div>
  );
}