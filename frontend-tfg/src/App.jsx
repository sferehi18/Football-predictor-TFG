import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Simulador from './pages/Simulador';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Simulador />} />
        </Route>
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;