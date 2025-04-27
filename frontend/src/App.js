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
import LearningPage from './pages/LearningPage';
import LearningModule from './components/LearningModule';
import LearningModuleAdmin from './pages/admin/LearningModuleAdmin'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/stocks" element={<StockDashboard />} />
        <Route path='/learning' element={<LearningPage/>}/>
        <Route path="/learning/:id" element={<LearningModule />} />
        <Route path="/analytics" element={<Analytics/>}/>
        <Route path='/signup' element={<Signup/>}/> {/* Make sure this matches the import */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/admin/learning" element={<ProtectedRoute isAdmin={true}><LearningModuleAdmin /></ProtectedRoute>
    } 
  />
        {/* Removed duplicate admin route */}
      </Routes>
    </Router>
  );
}

export default App;