from rest_framework import serializers
from .models import SchoolClass, ClassSection


class SchoolClassSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.name_uz", read_only=True)
    district_name = serializers.CharField(source="school.district.name_uz", read_only=True)

    class Meta:
        model = SchoolClass
        fields = [
            "id",
            "school",
            "school_name",
            "district_name",
            "name",
            "student_limit",
            "test_price",
            "duration_minutes",
            "is_active",
        ]


class ClassSectionSerializer(serializers.ModelSerializer):
    school_class_name = serializers.IntegerField(source="school_class.name", read_only=True)
    school_name = serializers.CharField(source="school_class.school.name_uz", read_only=True)

    class Meta:
        model = ClassSection
        fields = [
            "id",
            "school_class",
            "school_class_name",
            "school_name",
            "name",
            "is_active",
        ]