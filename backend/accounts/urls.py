from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    MeAPIView,
    PublicSiteSettingsAPIView,
    AdminUserListAPIView,
    AdminUserDetailAPIView,
    AdminSiteSettingsAPIView,
)

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("me/", MeAPIView.as_view(), name="me"),

    path("site-settings/", PublicSiteSettingsAPIView.as_view(), name="site-settings"),

    path("admin/users/", AdminUserListAPIView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/", AdminUserDetailAPIView.as_view(), name="admin-user-detail"),

    path("admin/site-settings/", AdminSiteSettingsAPIView.as_view(), name="admin-site-settings"),
]