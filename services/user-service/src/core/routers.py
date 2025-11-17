"""
Django Ninja routers for User Service.
"""
from ninja import NinjaAPI
from apps.users.api import router as users_router
from apps.departments.api import router as departments_router

# Create API instance with version prefix
api = NinjaAPI(
    title="HDMS User Service API",
    version="1.0.0",
    description="User Service API for HDMS",
)

# Include routers
api.add_router('/users', users_router, tags=['users'])
api.add_router('/departments', departments_router, tags=['departments'])


