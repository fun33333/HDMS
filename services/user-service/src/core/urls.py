"""
URL configuration for User Service.
"""
from django.contrib import admin
from django.urls import path
from .routers import api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api.urls),
]

