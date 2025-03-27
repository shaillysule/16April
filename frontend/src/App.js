import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import StocksOverview from './pages/StockOverview';
// import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/stocks" element={<StocksOverview />} />
        <Route path="/analytics" element={<Analytics />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
