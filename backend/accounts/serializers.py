from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, SiteSettings


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "can_manage_users": user.can_manage_users,
            "can_manage_settings": user.can_manage_settings,
            "can_manage_organizations": user.can_manage_organizations,
            "can_manage_classes": user.can_manage_classes,
            "can_manage_tests": user.can_manage_tests,
            "can_manage_content": user.can_manage_content,
            "can_view_results": user.can_view_results,
            "can_export_excel": user.can_export_excel,
        }
        return data


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "role",
            "can_manage_users",
            "can_manage_settings",
            "can_manage_organizations",
            "can_manage_classes",
            "can_manage_tests",
            "can_manage_content",
            "can_view_results",
            "can_export_excel",
        ]


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "role",
            "is_active",
            "can_manage_users",
            "can_manage_settings",
            "can_manage_organizations",
            "can_manage_classes",
            "can_manage_tests",
            "can_manage_content",
            "can_view_results",
            "can_export_excel",
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "role",
            "is_active",
            "can_manage_users",
            "can_manage_settings",
            "can_manage_organizations",
            "can_manage_classes",
            "can_manage_tests",
            "can_manage_content",
            "can_view_results",
            "can_export_excel",
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "full_name",
            "email",
            "role",
            "is_active",
            "can_manage_users",
            "can_manage_settings",
            "can_manage_organizations",
            "can_manage_classes",
            "can_manage_tests",
            "can_manage_content",
            "can_view_results",
            "can_export_excel",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class SiteSettingsSerializer(serializers.ModelSerializer):
    def validate_certificate_passing_percentage(self, value):
        if value > 100:
            raise serializers.ValidationError("Foiz 0 va 100 oralig'ida bo'lishi kerak")
        return value

    def validate_certificate_lookup_path(self, value):
        if not value:
            return "/certificate"
        return value if value.startswith("/") else f"/{value}"

    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "site_name",
            "header_phone",
            "telegram_url",
            "instagram_url",
            "ticker_text",
            "ticker_text_uz",
            "ticker_text_ru",
            "ticker_enabled",
            "required_subject_count",
            "certificate_enabled",
            "certificate_passing_percentage",
            "certificate_template",
            "certificate_public_base_url",
            "certificate_lookup_path",
            "updated_at",
        ]
