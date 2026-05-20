
import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function CustomPredictor() {
  const API_URL = window.ENV?.VITE_API_URL || "http://localhost:8000";

  const [metadata, setMetadata] = useState({
    teams: [],
    managers: [],
    formations: [],
  });

  const [loading, setLoading] = useState(false);

  const [resultado, setResultado] = useState(null);

  const [formData, setFormData] = useState({
    home_team: "",
    away_team: "",

    home_manager: "",
    away_manager: "",

    home_formation: "",
    away_formation: "",

    date: "",
    time: "20:00",
  });

  // =========================
  // LOAD METADATA
  // =========================

  useEffect(() => {
    fetch(`${API_URL}/metadata`)
      .then((res) => res.json())
      .then((data) => {
        setMetadata(data);

        setFormData((prev) => ({
          ...prev,
          home_team: data.teams[0] || "",
          away_team: data.teams[1] || "",

          home_manager: data.managers[0] || "",
          away_manager: data.managers[1] || "",

          home_formation: data.formations[0] || "",
          away_formation: data.formations[1] || "",
        }));
      })
      .catch(console.error);
  }, []);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // PREDICT
  // =========================

  const predict = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict-custom`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();

      const datosGrafico = [
        {
          name: "LOCAL",
          valor: data.montecarlo.H,
          prob: (data.home_win * 100).toFixed(1),
          color: "#00ff88",
        },

        {
          name: "EMPATE",
          valor: data.montecarlo.D,
          prob: (data.draw * 100).toFixed(1),
          color: "#666666",
        },

        {
          name: "VISITANTE",
          valor: data.montecarlo.A,
          prob: (data.away_win * 100).toFixed(1),
          color: "#00ccff",
        },
      ];

      setResultado(datosGrafico);
    } catch (err) {
      console.error(err);

      alert("Error realizando predicción");
    }

    setLoading(false);
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
      }}
    >
      {/* LEFT PANEL */}

      <div
        className="card"
        style={{
          flex: 1,
          padding: "25px",
          border: "1px solid #222",
          backgroundColor: "#0a0a0a",
          borderRadius: "8px",
        }}
      >
        <h2
          style={{
            color: "#fff",
            marginBottom: "25px",
            textTransform: "uppercase",
            fontSize: "1rem",
            letterSpacing: "1px",
          }}
        >
          Custom Match Simulation
        </h2>

        {/* HOME TEAM */}

        <label style={labelStyle}>Home Team</label>

        <select
          name="home_team"
          value={formData.home_team}
          onChange={handleChange}
          style={inputStyle}
        >
          {metadata.teams.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* AWAY TEAM */}

        <label style={labelStyle}>Away Team</label>

        <select
          name="away_team"
          value={formData.away_team}
          onChange={handleChange}
          style={inputStyle}
        >
          {metadata.teams.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* DATE */}

        <label style={labelStyle}>Date</label>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* TIME */}

        <label style={labelStyle}>Time</label>

        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* HOME MANAGER */}

        <label style={labelStyle}>Home Manager</label>

        <select
          name="home_manager"
          value={formData.home_manager}
          onChange={handleChange}
          style={inputStyle}
        >
          {metadata.managers.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        {/* AWAY MANAGER */}

        <label style={labelStyle}>Away Manager</label>

        <select
          name="away_manager"
          value={formData.away_manager}
          onChange={handleChange}
          style={inputStyle}
        >
          {metadata.managers.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        {/* HOME FORMATION */}

        <label style={labelStyle}>Home Formation</label>

        <select
          name="home_formation"
          value={formData.home_formation}
          onChange={handleChange}
          style={inputStyle}
        >
          {metadata.formations.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>

        {/* AWAY FORMATION */}

        <label style={labelStyle}>Away Formation</label>

        <select
          name="away_formation"
          value={formData.away_formation}
          onChange={handleChange}
          style={inputStyle}
        >
          {metadata.formations.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>

        <button
          onClick={predict}
          disabled={loading}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "14px",
            backgroundColor: "#00ff88",
            border: "none",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {loading ? "Simulating..." : "Predict Match"}
        </button>
      </div>

      {/* RIGHT PANEL */}

      <div
        className="card"
        style={{
          flex: 1.5,
          padding: "30px",
          border: "1px solid #222",
          backgroundColor: "#0a0a0a",
          borderRadius: "8px",
        }}
      >
        {resultado ? (
          <>
            <h2
              style={{
                color: "#fff",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              <span style={{ color: "#00ff88" }}>
                {formData.home_team}
              </span>

              {" vs "}

              <span style={{ color: "#00ccff" }}>
                {formData.away_team}
              </span>
            </h2>

            {/* PROBABILITIES */}

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
                    }}
                  />
                </div>
              </div>
            ))}

            {/* CHART */}

            <div
              style={{
                height: "320px",
                marginTop: "40px",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultado}>
                  <XAxis
                    dataKey="name"
                    stroke="#555"
                    tick={{
                      fill: "#888",
                    }}
                  />

                  <YAxis
                    stroke="#555"
                    tick={{
                      fill: "#888",
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid #333",
                    }}
                  />

                  <Bar dataKey="valor">
                    {resultado.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div
            style={{
              height: "500px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Configure a custom simulation
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  color: "#888",
  marginBottom: "8px",
  marginTop: "18px",
  fontSize: "0.8rem",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#000",
  border: "1px solid #222",
  color: "#fff",
  outline: "none",
};

export default CustomPredictor;
