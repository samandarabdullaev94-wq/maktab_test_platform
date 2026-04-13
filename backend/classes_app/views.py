from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from accounts.permissions import CanManageClasses, CanReadClassesForTests
from .models import SchoolClass, ClassSection
from .serializers import SchoolClassSerializer, ClassSectionSerializer


class SchoolClassListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, school_id):
        classes = SchoolClass.objects.filter(school_id=school_id, is_active=True)
        serializer = SchoolClassSerializer(classes, many=True)
        return Response(serializer.data)


class ClassSectionListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, class_id):
        sections = ClassSection.objects.filter(school_class_id=class_id, is_active=True)
        serializer = ClassSectionSerializer(sections, many=True)
        return Response(serializer.data)


class AdminSchoolClassListCreateAPIView(generics.ListCreateAPIView):
    queryset = SchoolClass.objects.select_related("school", "school__district").all().order_by("school__name_uz", "name")
    serializer_class = SchoolClassSerializer

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [CanReadClassesForTests()]
        return [CanManageClasses()]


class AdminClassSectionListCreateAPIView(generics.ListCreateAPIView):
    queryset = ClassSection.objects.select_related("school_class", "school_class__school").all().order_by("school_class__name", "name")
    serializer_class = ClassSectionSerializer
    permission_classes = [CanManageClasses]


@api_view(["PATCH"])
@permission_classes([CanManageClasses])
def admin_school_class_update_view(request, class_id):
    try:
        school_class = SchoolClass.objects.get(id=class_id)
    except SchoolClass.DoesNotExist:
        return Response({"error": "Sinf topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    serializer = SchoolClassSerializer(school_class, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([CanManageClasses])
def admin_class_section_update_view(request, section_id):
    try:
        section = ClassSection.objects.get(id=section_id)
    except ClassSection.DoesNotExist:
        return Response({"error": "Sinf harfi topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClassSectionSerializer(section, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
