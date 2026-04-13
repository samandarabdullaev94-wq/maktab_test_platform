from django.urls import path
from .views import (
    SchoolClassListAPIView,
    ClassSectionListAPIView,
    AdminSchoolClassListCreateAPIView,
    AdminClassSectionListCreateAPIView,
    admin_school_class_update_view,
    admin_class_section_update_view,
)

urlpatterns = [
    path("schools/<int:school_id>/classes/", SchoolClassListAPIView.as_view(), name="school-classes-list"),
    path("classes/<int:class_id>/sections/", ClassSectionListAPIView.as_view(), name="class-sections-list"),

    path("admin/classes/", AdminSchoolClassListCreateAPIView.as_view(), name="admin-classes"),
    path("admin/classes/<int:class_id>/", admin_school_class_update_view, name="admin-class-update"),

    path("admin/class-sections/", AdminClassSectionListCreateAPIView.as_view(), name="admin-class-sections"),
    path("admin/class-sections/<int:section_id>/", admin_class_section_update_view, name="admin-class-section-update"),
]