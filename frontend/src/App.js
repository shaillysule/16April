
import PortfolioPage from "./pages/PortfolioPage";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // ✅ this is your homepage after login
import AdminPanel from "./pages/AdminPanel";
import StockDashboard from "./stock/StockDashboard";
import StockDetail from "./stock/stockDetail";
import Analytics from './components/Analytics';
function App() {
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/stocks" element={<StockDashboard />} />
        <Route path="/analytics"element={<Analytics/>}/>
<Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} 
/>        <Route path="/stock/detail/:symbol" element={<StockDetail />} />
        <Route
          path="/admin"
          element={role === "admin" ? <AdminPanel /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;

