export default function MatchCard({ partido, isSelected, isLoading, onPredict }) {
  
  // compatibilidad con ambos formatos (por si acaso)
  const homeTeam = partido.home_team || partido.Equipo_L;
  const awayTeam = partido.away_team || partido.Equipo_V;

  const managerHome =  partido.home_manager || "";
  const managerAway =  partido.away_manager || "";

  const formationHome =  partido.home_formation || "";
  const formationAway =  partido.away_formation || "";

  const matchDate = partido.date || partido.Fecha || partido.Date || "";

  return (
    <div className="card" style={{ 
      border: isSelected ? '1px solid #00ff88' : '1px solid #333',
      backgroundColor: isSelected ? '#111' : 'transparent',
      transition: 'all 0.3s ease',
      padding: '20px',
      borderRadius: '8px',
      boxSizing: 'border-box'
    }}>
      
      {/* FECHA */}
      {matchDate && (
        <div style={{ 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '0.75rem', 
          marginBottom: '15px', 
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          Fecha: {String(matchDate)}
        </div>
      )}

      {/* EQUIPOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        
        {/* LOCAL */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ 
            width: '40px', height: '40px', background: '#222', color: '#00ff88', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 10px auto', fontSize: '1.2rem', fontWeight: 'bold' 
          }}>
            {homeTeam?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>
            {homeTeam ?? "Desconocido"}
          </div>
        </div>

        <div style={{ color: '#555', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px' }}>
          VS
        </div>

        {/* VISITANTE */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ 
            width: '40px', height: '40px', background: '#222', color: '#00ccff', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 10px auto', fontSize: '1.2rem', fontWeight: 'bold' 
          }}>
            {awayTeam?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>
            {awayTeam ?? "Desconocido"}
          </div>
        </div>
      </div>

      {/* INFO MANAGERS */}
      <div style={{ fontSize: '0.8rem', color: '#888', borderTop: '1px solid #222', paddingTop: '15px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#aaa' }}>Local</span>
          <span>{managerHome} <span style={{ color: '#555' }}>|</span> {formationHome}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa' }}>Visitante</span>
          <span>{managerAway} <span style={{ color: '#555' }}>|</span> {formationAway}</span>
        </div>
      </div>

      {/* BOTÓN */}
      <button 
        onClick={() => onPredict(partido)}
        disabled={isLoading}
        style={{ 
          width: '100%', 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: isSelected ? '#00ff88' : 'transparent',
          color: isSelected ? '#000' : '#00ff88',
          border: '1px solid #00ff88',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          transition: 'all 0.2s ease'
        }}
      >
        {isLoading && isSelected ? 'Calculando...' : 'Ver Predicción'}
      </button>
    </div>
  );
}