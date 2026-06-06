import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  BarChart3, Zap
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">⚡</div>
          <div>
            <div className="logo-text">StockPilot</div>
            <div className="logo-subtitle">INVENTORY COMMAND</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard className="nav-icon" size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Package className="nav-icon" size={18} />
          Products
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users className="nav-icon" size={18} />
          Customers
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ShoppingCart className="nav-icon" size={18} />
          Orders
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={12} style={{ color: '#6366f1' }} />
          <span>v1.0.0 · Production Ready</span>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16161f',
            color: '#f0f0f8',
            border: '1px solid #2a2a3e',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </Router>
  );
}
