import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Products
export const productsAPI = {
  getAll: () => api.get('/products/'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Customers
export const customersAPI = {
  getAll: () => api.get('/customers/'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers/', data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Orders
export const ordersAPI = {
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders/', data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
