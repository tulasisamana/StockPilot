# ⚡ StockPilot — Inventory Command Center

> A production-ready, containerized Inventory & Order Management System built with FastAPI, React, PostgreSQL and Docker.

---

## 🚀 Quick Start (Docker — Recommended)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd stockpilot

# 2. Copy environment config
cp .env.example .env

# 3. Build and start everything
docker-compose up --build

# App is live at:
#   Frontend → http://localhost:3000
#   Backend API → http://localhost:8000
#   API Docs → http://localhost:8000/docs
```

That's it. All three services (frontend, backend, database) start together.

---

## 💡 What Makes This Different

| Feature | Description |
|---|---|
| 🎛️ Command Center Dashboard | Live KPI cards, inventory health score, top-product bar chart |
| 📊 Inventory Health Meter | Visual gauge — red/amber/green based on stock levels |
| ⚠️ Smart Stock Alerts | Per-product low-stock and out-of-stock badges |
| 🛒 Multi-item Order Builder | Add multiple products per order, real-time total preview |
| 🔄 Automatic Stock Sync | Orders reduce stock; cancellations restore it — atomically |
| 🔍 Live Search | Instant filtering across all entities |
| 📱 Responsive UI | Works on desktop and mobile |

---

## 🗂️ Project Structure

```
stockpilot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── database/db.py       # SQLAlchemy setup
│   │   ├── models/models.py     # DB models
│   │   ├── schemas/schemas.py   # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py      # CRUD + SKU uniqueness
│   │       ├── customers.py     # CRUD + email uniqueness
│   │       ├── orders.py        # Order creation + stock reduction
│   │       └── dashboard.py     # Analytics endpoint
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js     # KPIs, charts, alerts
│   │   │   ├── Products.js      # Full CRUD table
│   │   │   ├── Customers.js     # Customer management
│   │   │   └── Orders.js        # Order builder + expandable rows
│   │   ├── services/api.js      # Axios API layer
│   │   └── index.css            # Design system
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /products/ | List all products |
| POST | /products/ | Create product (unique SKU) |
| GET | /products/{id} | Get product by ID |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | /customers/ | List all customers |
| POST | /customers/ | Create customer (unique email) |
| GET | /customers/{id} | Get customer by ID |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | /orders/ | List all orders |
| POST | /orders/ | Create order (validates stock) |
| GET | /orders/{id} | Get order with full details |
| DELETE | /orders/{id} | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | /dashboard/stats | Full analytics snapshot |

**Interactive docs:** http://localhost:8000/docs

---

## ⚙️ Business Rules Implemented

- ✅ Product SKU must be unique
- ✅ Customer email must be unique
- ✅ Product quantity cannot be negative
- ✅ Orders fail if any product has insufficient stock
- ✅ Creating an order automatically reduces stock (atomic transaction)
- ✅ Cancelling an order restores stock
- ✅ Total amount is auto-calculated by the backend
- ✅ All APIs use proper HTTP status codes and error messages

---

## 🌐 Deployment Guide

### Backend → Render / Railway / Fly.io

1. Push backend folder to GitHub
2. Create a new Web Service on Render
3. Set environment variable: `DATABASE_URL=<your-postgres-url>`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel / Netlify

1. Push frontend folder to GitHub
2. Connect to Vercel
3. Set environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com`
4. Build command: `npm run build`
5. Output directory: `build`

### Docker Hub

```bash
# Tag and push backend image
docker build -t yourusername/stockpilot-backend:latest ./backend
docker push yourusername/stockpilot-backend:latest
```

---

## 🛠️ Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set DATABASE_URL to your local postgres
export DATABASE_URL=postgresql://user:pass@localhost:5432/stockpilot

uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic v2 |
| Database | PostgreSQL 15 |
| Frontend | React 18, React Router, Recharts, Lucide Icons |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx (frontend) |
| Deployment | Render/Railway (backend), Vercel/Netlify (frontend) |
