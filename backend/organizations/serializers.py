from rest_framework import serializers
from .models import Region, District, School


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name_uz", "name_ru", "is_active"]


class DistrictSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name_uz", read_only=True)

    class Meta:
        model = District
        fields = ["id", "name_uz", "name_ru", "is_active", "region", "region_name"]


class SchoolSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name_uz", read_only=True)
    region_id = serializers.IntegerField(source="district.region_id", read_only=True)

    class Meta:
        model = School
        fields = [
            "id",
            "name_uz",
            "name_ru",
            "is_active",
            "district",
            "district_name",
            "region_id",
        ]