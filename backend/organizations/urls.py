from django.urls import path
from .views import (
    RegionListAPIView,
    DistrictListAPIView,
    SchoolListAPIView,
    AdminRegionListCreateAPIView,
    AdminDistrictListCreateAPIView,
    AdminSchoolListCreateAPIView,
    admin_region_update_view,
    admin_district_update_view,
    admin_school_update_view,
)

urlpatterns = [
    path("regions/", RegionListAPIView.as_view(), name="regions-list"),
    path("regions/<int:region_id>/districts/", DistrictListAPIView.as_view(), name="districts-list"),
    path("districts/<int:district_id>/schools/", SchoolListAPIView.as_view(), name="schools-list"),

    path("admin/regions/", AdminRegionListCreateAPIView.as_view(), name="admin-regions"),
    path("admin/regions/<int:region_id>/", admin_region_update_view, name="admin-region-update"),

    path("admin/districts/", AdminDistrictListCreateAPIView.as_view(), name="admin-districts"),
    path("admin/districts/<int:district_id>/", admin_district_update_view, name="admin-district-update"),

    path("admin/schools/", AdminSchoolListCreateAPIView.as_view(), name="admin-schools"),
    path("admin/schools/<int:school_id>/", admin_school_update_view, name="admin-school-update"),
]