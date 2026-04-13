from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from accounts.permissions import CanManageOrganizations
from .models import Region, District, School
from .serializers import RegionSerializer, DistrictSerializer, SchoolSerializer


class RegionListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        regions = Region.objects.filter(is_active=True)
        serializer = RegionSerializer(regions, many=True)
        return Response(serializer.data)


class DistrictListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, region_id):
        districts = District.objects.filter(region_id=region_id, is_active=True)
        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)


class SchoolListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, district_id):
        schools = School.objects.filter(district_id=district_id, is_active=True)
        serializer = SchoolSerializer(schools, many=True)
        return Response(serializer.data)


class AdminRegionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Region.objects.all().order_by("name_uz")
    serializer_class = RegionSerializer
    permission_classes = [CanManageOrganizations]


class AdminDistrictListCreateAPIView(generics.ListCreateAPIView):
    queryset = District.objects.select_related("region").all().order_by("name_uz")
    serializer_class = DistrictSerializer
    permission_classes = [CanManageOrganizations]


class AdminSchoolListCreateAPIView(generics.ListCreateAPIView):
    queryset = School.objects.select_related("district", "district__region").all().order_by("name_uz")
    serializer_class = SchoolSerializer
    permission_classes = [CanManageOrganizations]


@api_view(["PATCH"])
@permission_classes([CanManageOrganizations])
def admin_region_update_view(request, region_id):
    try:
        region = Region.objects.get(id=region_id)
    except Region.DoesNotExist:
        return Response({"error": "Viloyat topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    serializer = RegionSerializer(region, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([CanManageOrganizations])
def admin_district_update_view(request, district_id):
    try:
        district = District.objects.get(id=district_id)
    except District.DoesNotExist:
        return Response({"error": "Tuman/Shahar topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    serializer = DistrictSerializer(district, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([CanManageOrganizations])
def admin_school_update_view(request, school_id):
    try:
        school = School.objects.get(id=school_id)
    except School.DoesNotExist:
        return Response({"error": "Maktab topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    serializer = SchoolSerializer(school, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
