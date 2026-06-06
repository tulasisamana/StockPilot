import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Package, Users, ShoppingCart, DollarSign,
  AlertTriangle, TrendingUp, Activity, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

function StatCard({ icon: Icon, label, value, color, badge, badgeType }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {badge && (
        <div className={`stat-badge ${badgeType}`}>{badge}</div>
      )}
    </div>
  );
}

function StockBadge({ qty, reorderLevel }) {
  if (qty === 0) return <span className="badge badge-red">Out of Stock</span>;
  if (qty <= reorderLevel) return <span className="badge badge-yellow">Low Stock</span>;
  return <span className="badge badge-green">In Stock</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#16161f', border: '1px solid #2a2a3e',
        borderRadius: 10, padding: '10px 14px', fontSize: 13
      }}>
        <p style={{ color: '#8b8ba7', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#a5b4fc', fontWeight: 600 }}>{payload[0].value} units sold</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!stats) return <div className="empty-state">Failed to load dashboard</div>;

  const healthColor = stats.inventory_health_score >= 70 ? '#10b981'
    : stats.inventory_health_score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">Real-time inventory intelligence & order overview</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Package} label="Total Products" value={stats.total_products}
          color="#6366f1"
          badge={stats.out_of_stock_count > 0 ? `${stats.out_of_stock_count} out of stock` : 'All stocked'}
          badgeType={stats.out_of_stock_count > 0 ? 'danger' : 'up'}
        />
        <StatCard
          icon={Users} label="Customers" value={stats.total_customers}
          color="#06b6d4" badge="Active accounts" badgeType="up"
        />
        <StatCard
          icon={ShoppingCart} label="Total Orders" value={stats.total_orders}
          color="#10b981" badge="All time" badgeType="up"
        />
        <StatCard
          icon={DollarSign} label="Revenue" value={`₹${stats.total_revenue.toLocaleString()}`}
          color="#f59e0b" badge="Cumulative" badgeType="up"
        />
      </div>

      {/* Inventory Health Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="section-title">
            <Activity size={16} style={{ color: '#6366f1' }} />
            Inventory Health Score
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: healthColor }}>
            {stats.inventory_health_score}%
          </span>
        </div>
        <div className="health-bar">
          <div className="health-fill" style={{ width: `${stats.inventory_health_score}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#5a5a72' }}>
          <span>Critical</span>
          <span>Healthy</span>
        </div>
      </div>

      {/* Charts + Low Stock */}
      <div className="dashboard-grid">

        {/* Top Products Chart */}
        <div className="card">
          <div className="section-title">
            <TrendingUp size={16} style={{ color: '#6366f1' }} />
            Top Selling Products
          </div>
          {stats.top_products.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.top_products} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8b8ba7' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8b8ba7' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="total_sold" radius={[6, 6, 0, 0]}>
                  {stats.top_products.map((_, i) => (
                    <Cell key={i} fill={['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">No order data yet</div>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="section-title">
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
            Stock Alerts
            {stats.low_stock_count > 0 && (
              <span className="badge badge-yellow" style={{ marginLeft: 'auto' }}>
                {stats.low_stock_count}
              </span>
            )}
          </div>
          {stats.low_stock_products.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-text">All products are well stocked!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.low_stock_products.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#1e1e2e', borderRadius: 10
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#5a5a72', marginTop: 2 }}>{p.sku}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StockBadge qty={p.quantity} reorderLevel={p.reorder_level} />
                    <div style={{ fontSize: 11, color: '#5a5a72', marginTop: 3 }}>
                      {p.quantity} / {p.reorder_level} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Orders */}
          <div className="section-title" style={{ marginTop: 24 }}>
            <Layers size={16} style={{ color: '#6366f1' }} />
            Recent Orders
          </div>
          {stats.recent_orders.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <div className="empty-state-text">No orders yet</div>
            </div>
          ) : (
            stats.recent_orders.map(o => (
              <div key={o.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: '#1e1e2e', borderRadius: 10, marginBottom: 6
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Order #{o.id}</div>
                  <div style={{ fontSize: 11, color: '#5a5a72', marginTop: 2 }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-green">{o.status}</span>
                  <div style={{ fontSize: 12, color: '#8b8ba7', marginTop: 3 }}>
                    ₹{o.total_amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
