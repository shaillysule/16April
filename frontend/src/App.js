import PortfolioPage from "./pages/PortfolioPage";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import StockDashboard from "./stock/StockDashboard";
import StockDetail from "./stock/stockDetail";
import Analytics from './components/Analytics';
import Signup from "./Signup"; // Make sure the name matches what's exported
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/stocks" element={<StockDashboard />} />
        <Route path="/analytics" element={<Analytics/>}/>
        <Route path='/signup' element={<Signup/>}/> {/* Make sure this matches the import */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        
        {/* Removed duplicate admin route */}
      </Routes>
    </Router>
  );
}

export default App;
