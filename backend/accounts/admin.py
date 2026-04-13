from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SiteSettings


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "full_name",
        "role",
        "is_staff",
        "is_active",
        "can_manage_users",
        "can_manage_settings",
        "can_manage_organizations",
        "can_manage_classes",
        "can_manage_tests",
        "can_manage_content",
        "can_view_results",
        "can_export_excel",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Extra Fields",
            {
                "fields": (
                    "full_name",
                    "role",
                    "can_manage_users",
                    "can_manage_settings",
                    "can_manage_organizations",
                    "can_manage_classes",
                    "can_manage_tests",
                    "can_manage_content",
                    "can_view_results",
                    "can_export_excel",
                )
            },
        ),
    )


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "site_name",
        "header_phone",
        "telegram_url",
        "instagram_url",
        "ticker_enabled",
        "certificate_enabled",
        "certificate_passing_percentage",
        "updated_at",
        "required_subject_count",
    )
