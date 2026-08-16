from fastapi import APIRouter, Depends

from app.core.admin_deps import get_admin_user
from app.routers.admin import admins, analytics, appointments, customers, orders, products, settings

router = APIRouter(dependencies=[Depends(get_admin_user)])

router.include_router(analytics.router)
router.include_router(products.router)
router.include_router(orders.router)
router.include_router(appointments.router)
router.include_router(customers.router)
router.include_router(admins.router)
router.include_router(settings.router)

__all__ = ["router"]
