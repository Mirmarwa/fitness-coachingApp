from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from programs.views import ProgramViewSet
from users.views import UserViewSet
from coaching.views import CoachViewSet

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'programs', ProgramViewSet, basename='programs')
router.register(r'users', UserViewSet, basename='users')
router.register(r'coaches', CoachViewSet, basename='coaches')

urlpatterns = [
    path('admin/', admin.site.urls),

    # API routes
    path('api/', include(router.urls)),

    # payments
    path('api/payments/', include('payments.urls')),

    # JWT auth
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
