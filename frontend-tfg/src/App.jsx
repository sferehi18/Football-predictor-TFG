import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Matches from './pages/Matches';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Matches />} />
        </Route>
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;