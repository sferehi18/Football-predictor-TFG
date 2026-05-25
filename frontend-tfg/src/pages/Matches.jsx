import { useState, useEffect } from "react";
import MatchCard from "../components/MatchCard";

function Matches() {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

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
  // PAGINATION
  // =========================
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

  // =========================
  // RENDER
  // =========================
  return (
    <div
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
    >
      {/* HEADER CON TÍTULO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #333",
          paddingBottom: "20px",
          marginBottom: "10px",
        }}
      >
        <h2
          style={{
            color: "#fff",
            margin: 0,
            fontSize: "1rem",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Partidos ({partidos.length})
        </h2>
      </div>

      {/* CONTENEDOR DE TARJETAS (VERTICAL) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
        }}
      >
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

      {/* PAGINACIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          marginTop: "30px",
          borderTop: "1px solid #333",
          paddingTop: "20px",
        }}
      >
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: currentPage === 0 ? "#222" : "#00ff88",
            color: currentPage === 0 ? "#555" : "#000",
            border: "none",
            borderRadius: "4px",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            transition: "all 0.2s ease",
          }}
        >
          ← Anterior
        </button>

        <div
          style={{
            color: "#888",
            fontSize: "0.85rem",
            minWidth: "120px",
            textAlign: "center",
          }}
        >
          Página {totalPages > 0 ? currentPage + 1 : 0} de {totalPages}
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          style={{
            padding: "10px 20px",
            backgroundColor:
              currentPage === totalPages - 1 ? "#222" : "#00ff88",
            color: currentPage === totalPages - 1 ? "#555" : "#000",
            border: "none",
            borderRadius: "4px",
            cursor:
              currentPage === totalPages - 1 ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            transition: "all 0.2s ease",
          }}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

export default Matches;
