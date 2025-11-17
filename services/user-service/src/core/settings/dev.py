"""
Development settings for User Service.
"""
from .base import *

DEBUG = True

# Development-specific settings
ALLOWED_HOSTS = ['*']

# CORS for development
CORS_ALLOW_ALL_ORIGINS = True

# Logging for development
LOGGING['loggers']['apps']['level'] = 'DEBUG'


