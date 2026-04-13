from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_ADMIN = "admin"
    ROLE_USER = "user"

    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_USER, "User"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_USER)
    full_name = models.CharField(max_length=255, blank=True)

    # oddiy user uchun granular permissionlar
    can_manage_users = models.BooleanField(default=False)
    can_manage_settings = models.BooleanField(default=False)
    can_manage_organizations = models.BooleanField(default=False)
    can_manage_classes = models.BooleanField(default=False)
    can_manage_tests = models.BooleanField(default=False)
    can_manage_content = models.BooleanField(default=False)
    can_view_results = models.BooleanField(default=False)
    can_export_excel = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    @property
    def is_admin_role(self):
        return self.role == self.ROLE_ADMIN


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default="EduTest")
    required_subject_count = models.PositiveIntegerField(default=3)
    header_phone = models.CharField(max_length=30, default="+998 71 000 00 00")
    telegram_url = models.URLField(blank=True, default="")
    instagram_url = models.URLField(blank=True, default="")
    ticker_text = models.TextField(
        default="Ushbu platforma yordamida o‘z bilimingizni sinab ko‘rishingiz mumkin va o‘z reyting natijalaringiz bilan tanishib olasiz"
    )
    ticker_enabled = models.BooleanField(default=True)
    certificate_enabled = models.BooleanField(default=True)
    certificate_passing_percentage = models.PositiveIntegerField(default=60)
    certificate_template = models.JSONField(blank=True, default=dict)
    certificate_public_base_url = models.URLField(blank=True, default="")
    certificate_lookup_path = models.CharField(max_length=120, default="/certificate")
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "Platforma sozlamalari"

    class Meta:
        verbose_name = "Platforma sozlamasi"
        verbose_name_plural = "Platforma sozlamalari"
