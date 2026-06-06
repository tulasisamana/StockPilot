from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine, Base
from app.routers import products, customers, orders, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StockPilot API",
    description="AI-Powered Inventory & Order Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {"message": "StockPilot API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
