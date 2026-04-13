from django.contrib import admin
from .models import Region, District, School


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_uz', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name_uz', 'name_ru')


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_uz', 'region', 'is_active', 'created_at')
    list_filter = ('is_active', 'region')
    search_fields = ('name_uz', 'name_ru')


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_uz', 'district', 'is_active', 'created_at')
    list_filter = ('is_active', 'district')
    search_fields = ('name_uz', 'name_ru')