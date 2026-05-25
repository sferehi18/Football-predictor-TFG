import { useLocation, NavLink } from 'react-router-dom';

export default function Header({ stats = { hits: 0, total: 0 } }) {
  const location = useLocation();

  const navStyle = {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.8rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '5px 15px',
    transition: 'all 0.3s ease'
  };

  const activeStyle = {
    color: '#00ff88',
    borderBottom: '1px solid #00ff88'
  };

  const precision = stats.total > 0 ? ((stats.hits / stats.total) * 100).toFixed(1) : 0;

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#000',
      borderBottom: '1px solid #111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      fontFamily: 'monospace',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* SECCIÓN LOGO Y NAVEGACIÓN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ff88', boxShadow: '0 0 8px #00ff88' }}></div>
          <span style={{ color: '#fff', fontWeight: 'bold', letterSpacing: '2px' }}> DeepStats</span>
        </div>

        <nav style={{ display: 'flex', gap: '10px' }}>
          <NavLink to="/" end style={({ isActive }) => isActive ? { ...navStyle, ...activeStyle } : navStyle}>
            Partidos disponibles
          </NavLink>
        </nav>
      </div>
    </header>
  );
}