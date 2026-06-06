from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.db import get_db
from app.models.models import Order, OrderItem, Product, Customer
from app.schemas.schemas import OrderCreate, OrderOut

router = APIRouter()


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # Validate all products and stock upfront
    resolved_items = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        resolved_items.append((product, item.quantity))

    # Create order and reduce stock atomically
    total = 0.0
    db_order = Order(
        customer_id=order.customer_id,
        status="confirmed",
        notes=order.notes,
        total_amount=0.0
    )
    db.add(db_order)
    db.flush()

    for product, qty in resolved_items:
        subtotal = product.price * qty
        total += subtotal
        order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price,
            subtotal=subtotal
        )
        db.add(order_item)
        # Automatically reduce stock
        product.quantity -= qty

    db_order.total_amount = round(total, 2)
    db.commit()
    db.refresh(db_order)

    return db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == db_order.id).first()


@router.get("/", response_model=List[OrderOut])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock on cancellation
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
