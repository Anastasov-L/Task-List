from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, PublicUserViewSet, AuthCheckView

from rest_framework.views import APIView


router = DefaultRouter()
router.register(r'users', PublicUserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/', AuthCheckView.as_view(), name='auth-check'),
    path('', include(router.urls)),
]