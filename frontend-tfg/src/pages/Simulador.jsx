import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import MatchCard from '../components/MatchCard'

function Simulador() {
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [matchSeleccionado, setMatchSeleccionado] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [resultadoReal, setResultadoReal] = useState(null)
  const [metadata, setMetadata] = useState({})
  useEffect(() => {
    fetch('http://localhost:8000/api/partidos-demo')
      .then(res => res.json())
      .then(data => setPartidos(data))
      .catch(err => console.error("Error cargando partidos:", err))
  }, [])

  const predecirPartido = async (partido) => {
    setLoading(true)
    setMatchSeleccionado(partido)
    setResultado(null) 
    setMetadata(null);
    setResultadoReal(null)

    // CAMBIO APLICADO: Añadidas la fecha y la hora obligatorias
    const payload = {
      equipo_L: partido.Equipo_L,
      equipo_V: partido.Equipo_V,
      manager_L: partido.manager_name_L,
      manager_V: partido.manager_name_V,
      formation_L: partido.formation_L,
      formation_V: partido.formation_V,
      fecha: partido.Fecha,
      hora: partido.hora_L || "21:00"
    }

    try {
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error("Datos rechazados por la API")
      }

      const data = await response.json()
      
      const datosGrafico = [
        { name: 'LOCAL', valor: data.montecarlo.H, prob: (data.probabilidades.Local * 100).toFixed(1), color: '#00ff88', code: 'H' },
        { name: 'EMPATE', valor: data.montecarlo.D, prob: (data.probabilidades.Empate * 100).toFixed(1), color: '#555555', code: 'D' },
        { name: 'VISITANTE', valor: data.montecarlo.A, prob: (data.probabilidades.Visitante * 100).toFixed(1), color: '#00ccff', code: 'A' }
      ]
      setResultado(datosGrafico)
      setResultadoReal(data.real);
      setMetadata(data.metadata); // Asegúrate que el backend devuelva "real"
    } catch (error) {
      console.error("Error de conexión:", error)
      alert("Error en la predicción. Revisa la consola.")
    }
    setLoading(false)
  }

  // Lógica para comprobar el acierto (HIT/MISS)
  const checkAcierto = () => {
    if (!resultado || !resultadoReal) return null;
    // La predicción de la IA es la opción con más votos en Montecarlo
    const prediccionIA = [...resultado].sort((a, b) => b.valor - a.valor)[0].code;
    return prediccionIA === resultadoReal;
  }

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', height: '100%', boxSizing: 'border-box' }}>
      
      {/* PANEL IZQUIERDO */}
      <div style={{ flex: '1', minWidth: '320px', maxWidth: '380px', height: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '15px' }}>
        <h2 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: '15px', position: 'sticky', top: 0, backgroundColor: '#0b0f0c', zIndex: 10 }}>
          Partidos ({partidos.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {partidos.map((p, index) => (
            <MatchCard key={index} partido={p} isSelected={matchSeleccionado === p} isLoading={loading} onPredict={predecirPartido} />
          ))}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div style={{ flex: '2', position: 'sticky', top: 0 }}>
        {resultado ? (
          <div className="card" style={{ padding: '30px', border: '1px solid #222', backgroundColor: '#0a0a0a', borderRadius: '8px' }}>
            <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Análisis Estocástico: <span style={{ color: '#00ff88' }}>{matchSeleccionado.Equipo_L}</span> vs <span style={{ color: '#00ccff' }}>{matchSeleccionado.Equipo_V}</span>
            </h2>

            {/* CAJA DE VALIDACIÓN (RESULTADO REAL) */}
            {resultadoReal && (
              <div style={{ 
                marginBottom: '30px', 
                padding: '20px', 
                backgroundColor: '#000', 
                border: `1px solid ${checkAcierto() ? '#00ff88' : '#ff4444'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Ground Truth (Resultado Real)</div>
                  <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                    {resultadoReal === 'H' ? 'VICTORIA LOCAL' : resultadoReal === 'A' ? 'VICTORIA VISITANTE' : 'EMPATE'}
                  </div>
                </div>
                <div style={{ 
                  backgroundColor: checkAcierto() ? '#00ff88' : '#ff4444', 
                  color: '#000', 
                  padding: '5px 15px', 
                  fontWeight: 'bold', 
                  fontSize: '0.8rem',
                  borderRadius: '2px'
                }}>
                  {checkAcierto() ? 'INFERENCIA CORRECTA (HIT)' : 'ERROR DE MODELO (MISS)'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h4 style={{ color: '#888', marginBottom: '25px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Probabilidades</h4>
                {resultado.map((r, i) => (
                  <div key={i} style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                      <span style={{ color: '#ccc' }}>{r.name}</span>
                      <span style={{ color: r.color, fontWeight: 'bold' }}>{r.prob}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px' }}>
                      <div style={{ width: `${r.prob}%`, height: '100%', background: r.color, borderRadius: '2px', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1.5, minWidth: '300px', height: '320px' }}>
                <h4 style={{ color: '#888', textAlign: 'center', marginBottom: '20px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Simulaciones</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultado} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#1a1a1a' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px', color: '#fff' }} />
                    <Bar dataKey="valor" radius={[2, 2, 0, 0]} maxBarSize={60}>
                      {resultado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
           
            {metadata && (
      <div style={{ 
          display: 'flex', 
    justifyContent: 'space-around', 
    marginTop: '50px', 
    fontSize: '0.75rem', 
    color: '#666',
    borderTop: '1px solid #222',
    paddingTop: '10px'
  }}>
    <span> <b>Fecha ultimo estado Local:</b> {metadata.fecha_ultimo_estado_L}</span>
    <span> <b>Fecha ultimo estado Visitante:</b> {metadata.fecha_ultimo_estado_V}</span>
  </div>
)} <div style={{ fontSize: '0.7rem', color: '#333', marginTop: '30px', textAlign: 'center' }}>
                Módulo de Backtesting en tiempo real v1.0 | Comparación con dataset de validación
            </div>
          </div>
        ) : (
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #1a1a1a', borderRadius: '8px', color: '#444' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Ningún partido seleccionado</h3>
            <p style={{ fontSize: '0.9rem' }}>Selecciona "Ver Predicción" en la lista de la izquierda.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Simulador