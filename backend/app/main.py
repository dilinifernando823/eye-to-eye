from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    admin,
    ai,
    appointments,
    auth,
    cart,
    loyalty,
    orders,
    prescriptions,
    products,
    recommendations,
    wishlist,
)

app = FastAPI(title="Eye To Eye Opticians API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["wishlist"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(loyalty.router, prefix="/api/loyalty", tags=["loyalty"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(
    recommendations.router, prefix="/api/recommendations", tags=["recommendations"]
)
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["prescriptions"])


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Eye To Eye API is running", "version": "1.0.0"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}
