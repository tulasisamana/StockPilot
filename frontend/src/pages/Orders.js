import React, { useEffect, useState } from 'react';
import { ordersAPI, customersAPI, productsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, ShoppingCart, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([customersAPI.getAll(), productsAPI.getAll()])
      .then(([c, p]) => { setCustomers(c.data); setProducts(p.data); });
  }, []);

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
  const setItem = (idx, key, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [key]: val } : item));

  const getProduct = (id) => products.find(p => p.id === parseInt(id));

  const subtotal = items.reduce((sum, item) => {
    const p = getProduct(item.product_id);
    return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
  }, 0);

  async function handleSubmit() {
    if (!customerId) { toast.error('Select a customer'); return; }
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) { toast.error('Add at least one item'); return; }

    setLoading(true);
    try {
      await ordersAPI.create({
        customer_id: parseInt(customerId),
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
        notes
      });
      toast.success('Order placed successfully!');
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <span className="modal-title">Create New Order</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-group">
          <label>Customer *</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Select customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#8b8ba7', marginBottom: 10 }}>
            Order Items *
          </label>
          {items.map((item, idx) => {
            const p = getProduct(item.product_id);
            const overStock = p && parseInt(item.quantity) > p.quantity;
            return (
              <div key={idx} className="order-item-row">
                <div>
                  <select
                    value={item.product_id}
                    onChange={e => setItem(idx, 'product_id', e.target.value)}
                    style={{ marginBottom: 0 }}
                  >
                    <option value="">Choose product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                        {p.name} — ₹{p.price} ({p.quantity} in stock)
                      </option>
                    ))}
                  </select>
                  {overStock && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                      <AlertCircle size={11} /> Only {p.quantity} available
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => setItem(idx, 'quantity', e.target.value)}
                  style={{ textAlign: 'center', padding: '11px 8px' }}
                />
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  style={{ padding: '10px', opacity: items.length === 1 ? 0.3 : 1 }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          <button className="add-item-btn" onClick={addItem}>
            <Plus size={14} /> Add another item
          </button>
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." rows={2} />
        </div>

        {/* Order total preview */}
        <div style={{
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 4
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: '#8b8ba7' }}>Estimated Total</span>
            <span style={{ fontWeight: 700, color: '#a5b4fc' }}>₹{subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {expanded ? <ChevronUp size={14} style={{ color: '#5a5a72' }} /> : <ChevronDown size={14} style={{ color: '#5a5a72' }} />}
            <span style={{ fontWeight: 600 }}>#{order.id}</span>
          </div>
        </td>
        <td>
          {order.customer ? (
            <div>
              <div style={{ fontWeight: 500 }}>{order.customer.full_name}</div>
              <div style={{ fontSize: 12, color: '#5a5a72' }}>{order.customer.email}</div>
            </div>
          ) : '—'}
        </td>
        <td>
          <span className={`badge ${order.status === 'confirmed' ? 'badge-green' : order.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
            {order.status}
          </span>
        </td>
        <td>{order.items?.length || 0} items</td>
        <td style={{ fontWeight: 600 }}>₹{order.total_amount?.toLocaleString()}</td>
        <td style={{ fontSize: 13, color: '#8b8ba7' }}>{new Date(order.created_at).toLocaleDateString()}</td>
        <td onClick={e => e.stopPropagation()}>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(order)}>
            <Trash2 size={13} />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: 0, background: 'rgba(99,102,241,0.04)' }}>
            <div style={{ padding: '12px 32px 16px' }}>
              <div style={{ fontSize: 12, color: '#5a5a72', fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Order Items
              </div>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    {['Product', 'SKU', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                      <th key={h} style={{ fontSize: 11, color: '#5a5a72', padding: '6px 8px', textAlign: 'left', border: 'none', background: 'none' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: '6px 8px', fontSize: 13 }}>{item.product?.name || `Product #${item.product_id}`}</td>
                      <td style={{ padding: '6px 8px', fontSize: 12, color: '#8b8ba7' }}>
                        <code style={{ background: '#1e1e2e', padding: '1px 6px', borderRadius: 4 }}>{item.product?.sku || '—'}</code>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: 13, fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ padding: '6px 8px', fontSize: 13 }}>₹{item.unit_price}</td>
                      <td style={{ padding: '6px 8px', fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>₹{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {order.notes && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#8b8ba7' }}>
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    ordersAPI.getAll()
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleDelete(order) {
    if (!window.confirm(`Cancel order #${order.id}? Stock will be restored.`)) return;
    try {
      await ordersAPI.delete(order.id);
      toast.success('Order cancelled. Stock restored.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to cancel order');
    }
  }

  const filtered = orders.filter(o =>
    `${o.id}`.includes(search) ||
    (o.customer?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-subtitle">Track and manage customer orders with automatic inventory sync</p>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search className="search-icon" size={15} />
          <input
            placeholder="Search by order ID, customer name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShoppingCart size={48} /></div>
            <div className="empty-state-text">
              {search ? 'No orders match your search' : 'No orders yet. Create your first order!'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <OrderRow key={order.id} order={order} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <OrderModal onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}
