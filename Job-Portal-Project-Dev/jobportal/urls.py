from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static
 
schema_view = get_schema_view(
    openapi.Info(
        title="Job Portal API",
        default_version='v1',
        description="API documentation for Job Portal",
    ),
    public=True,
    permission_classes=[AllowAny],
)
 
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('jobapp.urls')),
 
    # Swagger / API Docs
    path('docs/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc'),
]
 
# Media support (important for profile photos, resumes, logos)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
 
 