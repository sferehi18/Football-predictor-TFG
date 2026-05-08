import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout({ stats }) {
  return (
    <div style={{ backgroundColor: '#0b0f0c', minHeight: '100vh', width: '100%' }}>
      <Header stats={stats} />
      <main style={{ padding: '30px 40px' }}>
        <Outlet />
      </main>
    </div>
  );
}