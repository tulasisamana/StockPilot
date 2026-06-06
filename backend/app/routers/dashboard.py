from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.db import get_db
from app.models.models import Product, Customer, Order, OrderItem

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()

    low_stock = db.query(Product).filter(Product.quantity <= Product.reorder_level).all()
    out_of_stock = db.query(Product).filter(Product.quantity == 0).count()

    # Top 5 selling products by quantity
    top_products = db.query(
        Product.name,
        Product.sku,
        func.coalesce(func.sum(OrderItem.quantity), 0).label("total_sold")
    ).outerjoin(OrderItem).group_by(Product.id).order_by(
        func.coalesce(func.sum(OrderItem.quantity), 0).desc()
    ).limit(5).all()

    # Recent orders
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()

    # Inventory health score (products above reorder level / total)
    healthy_products = db.query(Product).filter(Product.quantity > Product.reorder_level).count()
    health_score = round((healthy_products / total_products * 100) if total_products > 0 else 0, 1)

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": round(float(total_revenue), 2),
        "out_of_stock_count": out_of_stock,
        "low_stock_count": len(low_stock),
        "inventory_health_score": health_score,
        "low_stock_products": [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "quantity": p.quantity,
                "reorder_level": p.reorder_level
            }
            for p in low_stock
        ],
        "top_products": [
            {"name": p.name, "sku": p.sku, "total_sold": int(p.total_sold)}
            for p in top_products
        ],
        "recent_orders": [
            {
                "id": o.id,
                "status": o.status,
                "total_amount": o.total_amount,
                "created_at": o.created_at.isoformat()
            }
            for o in recent_orders
        ]
    }
