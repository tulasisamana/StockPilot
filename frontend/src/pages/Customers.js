import React, { useEffect, useState } from 'react';
import { customersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, Users, X, Mail, Phone } from 'lucide-react';

function CustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.full_name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    setLoading(true);
    try {
      await customersAPI.create(form);
      toast.success('Customer added!');
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add New Customer</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-group">
          <label>Full Name *</label>
          <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="e.g. Rahul Sharma" />
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul@example.com" />
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City, State, PIN" rows={3} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    customersAPI.getAll()
      .then(r => setCustomers(r.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleDelete(c) {
    if (!window.confirm(`Delete customer "${c.full_name}"?`)) return;
    try {
      await customersAPI.delete(c.id);
      toast.success('Customer deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Delete failed');
    }
  }

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  // Generate avatar color from name
  const avatarColor = (name) => {
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">Manage your customer accounts and contact information</p>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search className="search-icon" size={15} />
          <input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={48} /></div>
            <div className="empty-state-text">
              {search ? 'No customers match your search' : 'No customers yet. Add your first customer!'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: avatarColor(c.full_name),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
                        }}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.full_name}</div>
                          <div style={{ fontSize: 12, color: '#5a5a72' }}>ID #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                          <Mail size={12} style={{ color: '#5a5a72' }} />{c.email}
                        </div>
                        {c.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8b8ba7' }}>
                            <Phone size={12} style={{ color: '#5a5a72' }} />{c.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#8b8ba7', maxWidth: 200 }}>
                      {c.address || <span style={{ color: '#5a5a72' }}>—</span>}
                    </td>
                    <td style={{ fontSize: 13, color: '#8b8ba7' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <CustomerModal onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}
