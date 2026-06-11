"""
ASGI config for jobportal project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobportal.settings')  # Changed to jobportal
django.setup()

# Import from your jobapp
from jobapp import routing  # This imports from your jobapp/routing.py

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})

"""
ASGI config for jobportal project.
 
It exposes the ASGI callable as a module-level variable named ``application``.
 
For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""
 
import os
 
from django.core.asgi import get_asgi_application
 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobportal.settings')
 
application = get_asgi_application()
 
 
import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import jobapp.routing
 
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yourproject.settings")
 
django_asgi_app = get_asgi_application()
 
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            jobapp.routing.websocket_urlpatterns
        )
    ),
})