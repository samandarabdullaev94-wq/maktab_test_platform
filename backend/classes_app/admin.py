from django.contrib import admin
from .models import SchoolClass, ClassSection


class ClassSectionInline(admin.TabularInline):
    model = ClassSection
    extra = 3


@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'school',
        'student_limit',
        'test_price',
        'duration_minutes',
        'is_active',
    )
    list_filter = ('is_active', 'school')
    search_fields = ('school__name_uz',)
    inlines = [ClassSectionInline]


@admin.register(ClassSection)
class ClassSectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'school_class', 'name', 'is_active')
    list_filter = ('is_active', 'name')