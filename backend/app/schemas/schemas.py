from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# ──────────────── Product Schemas ────────────────

class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: float
    quantity: int
    category: Optional[str] = None
    reorder_level: Optional[int] = 10

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None
    reorder_level: Optional[int] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ──────────────── Customer Schemas ────────────────

class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────── Order Schemas ────────────────

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    customer_id: int
    status: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerOut] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True
