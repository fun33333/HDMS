"""
Production settings for User Service.
"""
from .base import *

DEBUG = False

# Security settings for production
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Allowed hosts must be set in production
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Logging for production
LOGGING['formatters']['verbose'] = {
    'format': '{levelname} {asctime} {module} {message}',
    'style': '{',
}
LOGGING['loggers']['apps']['level'] = 'INFO'


