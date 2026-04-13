from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, SiteSettings
from .serializers import (
    CustomTokenObtainPairSerializer,
    MeSerializer,
    UserListSerializer,
    UserUpdateSerializer,
    UserCreateSerializer,
    SiteSettingsSerializer,
)
from .permissions import CanManageUsers, CanManageSettings


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)


class PublicSiteSettingsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj, _ = SiteSettings.objects.get_or_create(pk=1)
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data)


class AdminUserListAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("id")
    permission_classes = [CanManageUsers]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserListSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserDetailAPIView(APIView):
    permission_classes = [CanManageUsers]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Foydalanuvchi topilmadi"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Foydalanuvchi topilmadi"},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.id == request.user.id:
            return Response(
                {"error": "O'zingizni o'chirib bo'lmaydi"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.role == "admin":
            has_other_admin = User.objects.filter(
                role="admin",
                is_active=True,
            ).exclude(id=user.id).exists()
            if not has_other_admin:
                return Response(
                    {"error": "Oxirgi faol adminni o'chirib bo'lmaydi"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSiteSettingsAPIView(APIView):
    permission_classes = [CanManageSettings]

    def get(self, request):
        settings_obj, _ = SiteSettings.objects.get_or_create(pk=1)
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def patch(self, request):
        settings_obj, _ = SiteSettings.objects.get_or_create(pk=1)
        serializer = SiteSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
