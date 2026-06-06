import React, { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Package, X } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverage', 'Home & Garden', 'Health', 'Sports', 'Books', 'Other'];

function StockIndicator({ qty, reorderLevel }) {
  if (qty === 0) return <span className="badge badge-red">● Out of Stock</span>;
  if (qty <= reorderLevel) return <span className="badge badge-yellow">● Low Stock</span>;
  return <span className="badge badge-green">● In Stock</span>;
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    name: '', sku: '', description: '', price: '', quantity: '',
    category: '', reorder_level: 10
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!product;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.name || !form.sku || !form.price) {
      toast.error('Name, SKU and Price are required');
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity) || 0,
        reorder_level: parseInt(form.reorder_level) || 10,
      };
      if (isEdit) {
        await productsAPI.update(product.id, data);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(data);
        toast.success('Product created!');
      }
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Product Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Premium Headphones" />
          </div>
          <div className="form-group">
            <label>SKU / Code *</label>
            <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. HP-001" disabled={isEdit} />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Short product description..." rows={2} />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Quantity in Stock</label>
            <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category || ''} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Reorder Level</label>
            <input type="number" min="0" value={form.reorder_level} onChange={e => set('reorder_level', e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const load = () => {
    setLoading(true);
    productsAPI.getAll()
      .then(r => setProducts(r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await productsAPI.delete(product.id);
      toast.success('Product deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Delete failed');
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">Manage your product catalog and inventory levels</p>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search className="search-icon" size={15} />
          <input
            placeholder="Search by name, SKU or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={48} /></div>
            <div className="empty-state-text">
              {search ? 'No products match your search' : 'No products yet. Add your first product!'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.description && (
                        <div style={{ fontSize: 12, color: '#5a5a72', marginTop: 2 }}>
                          {p.description.slice(0, 50)}{p.description.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td><code style={{ fontSize: 12, background: '#1e1e2e', padding: '2px 8px', borderRadius: 6 }}>{p.sku}</code></td>
                    <td>{p.category ? <span className="badge badge-blue">{p.category}</span> : <span style={{ color: '#5a5a72' }}>—</span>}</td>
                    <td style={{ fontWeight: 600 }}>₹{p.price.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: p.quantity === 0 ? '#ef4444' : p.quantity <= p.reorder_level ? '#f59e0b' : '#f0f0f8' }}>
                        {p.quantity}
                      </span>
                      <span style={{ color: '#5a5a72', fontSize: 12 }}> / {p.reorder_level}</span>
                    </td>
                    <td><StockIndicator qty={p.quantity} reorderLevel={p.reorder_level} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditProduct(p); setModalOpen(true); }}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductModal
          product={editProduct}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
