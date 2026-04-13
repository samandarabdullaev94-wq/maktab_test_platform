from django.utils import timezone
from django.http import HttpResponse
from django.conf import settings
from openpyxl import Workbook
from urllib.parse import quote
import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from accounts.permissions import CanExportExcel
from .models import (
    Student,
    TestAttempt,
    StudentAnswer,
    TestSession,
    TestSessionAnswer,
    Certificate,
)
from .serializers import (
    CertificateSerializer,
    StartSessionSerializer,
    TestSessionDetailSerializer,
)
from tests_app.models import Test, Question, Answer
from organizations.models import School
from classes_app.models import SchoolClass, ClassSection
from accounts.models import SiteSettings


def build_certificate_verify_url(request, settings_obj, code):
    lookup_path = (settings_obj.certificate_lookup_path or "/certificate").strip()
    lookup_path = lookup_path if lookup_path.startswith("/") else f"/{lookup_path}"
    base_url = (settings_obj.certificate_public_base_url or "").strip()

    if base_url:
        return f"{base_url.rstrip('/')}{lookup_path.rstrip('/')}/{code}"

    origin = request.headers.get("Origin")
    if origin and origin in settings.CORS_ALLOWED_ORIGINS:
        return f"{origin.rstrip('/')}{lookup_path.rstrip('/')}/{code}"

    return request.build_absolute_uri(f"{lookup_path.rstrip('/')}/{code}")


def build_certificate_qr_url(verify_url):
    encoded_url = quote(verify_url, safe="")
    return (
        "https://api.qrserver.com/v1/create-qr-code/"
        f"?size=180x180&data={encoded_url}"
    )


def issue_certificate_if_eligible(
    *,
    request,
    student,
    score,
    total_questions,
    percentage,
    session=None,
    attempt=None,
):
    settings_obj, _ = SiteSettings.objects.get_or_create(pk=1)

    if (
        not settings_obj.certificate_enabled
        or total_questions <= 0
        or percentage < settings_obj.certificate_passing_percentage
    ):
        return None

    certificate = None
    if session:
        certificate = Certificate.objects.filter(session=session).first()
    if not certificate and attempt:
        certificate = Certificate.objects.filter(attempt=attempt).first()

    code = certificate.code if certificate else uuid.uuid4().hex[:12].upper()
    verify_url = build_certificate_verify_url(request, settings_obj, code)

    values = {
        "student": student,
        "session": session,
        "attempt": attempt,
        "full_name": student.full_name,
        "score": score,
        "total_questions": total_questions,
        "percentage": round(percentage, 2),
        "verify_url": verify_url,
        "qr_code_url": build_certificate_qr_url(verify_url),
        "template_snapshot": settings_obj.certificate_template or {},
    }

    if certificate:
        for field, value in values.items():
            setattr(certificate, field, value)
        certificate.save()
        return certificate

    return Certificate.objects.create(code=code, **values)


class CheckTestAccessAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        full_name = data.get("full_name")
        phone = data.get("phone")
        school_class_id = data.get("school_class_id")
        class_section_id = data.get("class_section_id")
        test_id = data.get("test_id")

        if not all([full_name, phone, school_class_id, class_section_id, test_id]):
            return Response(
                {"error": "Majburiy maydonlar to‘liq emas"},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_attempt = TestAttempt.objects.filter(
            test_id=test_id,
            student__full_name=full_name,
            student__phone=phone,
        ).first()

        if existing_attempt:
            return Response(
                {
                    "allowed": False,
                    "error": "Siz bu testni avval topshirgansiz"
                },
                status=status.HTTP_200_OK
            )

        try:
            school_class = SchoolClass.objects.get(id=school_class_id)
        except SchoolClass.DoesNotExist:
            return Response(
                {"error": "Sinf topilmadi"},
                status=status.HTTP_404_NOT_FOUND
            )

        class_attempt_count = TestAttempt.objects.filter(
            test_id=test_id,
            student__school_class_id=school_class_id,
            student__class_section_id=class_section_id,
        ).count()

        if class_attempt_count >= school_class.student_limit:
            return Response(
                {
                    "allowed": False,
                    "error": "Bu sinf uchun test topshirish limiti tugagan"
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "allowed": True,
                "message": "Testni boshlash mumkin"
            },
            status=status.HTTP_200_OK
        )


class SubmitTestAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        full_name = data.get("full_name")
        phone = data.get("phone")
        gender = data.get("gender")
        school_id = data.get("school_id")
        school_class_id = data.get("school_class_id")
        class_section_id = data.get("class_section_id")
        test_id = data.get("test_id")
        answers = data.get("answers", {})

        if not all([full_name, phone, gender, school_id, school_class_id, class_section_id, test_id]):
            return Response(
                {"error": "Majburiy maydonlar to‘liq emas"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            school = School.objects.get(id=school_id)
            school_class = SchoolClass.objects.get(id=school_class_id)
            class_section = ClassSection.objects.get(id=class_section_id)
            test = Test.objects.get(id=test_id)
        except (School.DoesNotExist, SchoolClass.DoesNotExist, ClassSection.DoesNotExist, Test.DoesNotExist):
            return Response(
                {"error": "Bog‘liq ma’lumot topilmadi"},
                status=status.HTTP_404_NOT_FOUND
            )

        existing_attempt = TestAttempt.objects.filter(
            test_id=test_id,
            student__full_name=full_name,
            student__phone=phone,
        ).first()

        if existing_attempt:
            return Response(
                {"error": "Siz bu testni avval topshirgansiz"},
                status=status.HTTP_400_BAD_REQUEST
            )

        class_attempt_count = TestAttempt.objects.filter(
            test_id=test_id,
            student__school_class_id=school_class_id,
            student__class_section_id=class_section_id,
        ).count()

        if class_attempt_count >= school_class.student_limit:
            return Response(
                {"error": "Bu sinf uchun test topshirish limiti tugagan"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student = Student.objects.create(
            full_name=full_name,
            phone=phone,
            gender=gender,
            school=school,
            school_class=school_class,
            class_section=class_section,
        )

        attempt = TestAttempt.objects.create(
            student=student,
            test=test,
            started_at=timezone.now(),
        )

        for question_id, answer_id in answers.items():
            try:
                question = Question.objects.get(id=question_id, test=test)
                selected_answer = Answer.objects.get(id=answer_id, question=question)
                StudentAnswer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_answer=selected_answer,
                )
            except (Question.DoesNotExist, Answer.DoesNotExist):
                continue

        attempt.finished_at = timezone.now()
        attempt.calculate_score()
        percentage = (
            round((attempt.score / attempt.total_questions) * 100, 2)
            if attempt.total_questions else 0
        )
        certificate = issue_certificate_if_eligible(
            request=request,
            student=student,
            attempt=attempt,
            score=attempt.score,
            total_questions=attempt.total_questions,
            percentage=percentage,
        )

        return Response({
            "message": "Test muvaffaqiyatli yuborildi",
            "attempt_id": attempt.id,
            "score": attempt.score,
            "total_questions": attempt.total_questions,
            "percentage": percentage,
            "certificate": CertificateSerializer(certificate).data if certificate else None,
        })


class LeaderboardAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        test_id = request.GET.get("test_id")

        attempts = TestAttempt.objects.filter(is_completed=True)

        if test_id and str(test_id).isdigit():
            attempts = attempts.filter(test_id=int(test_id))

        best_results = {}

        for attempt in attempts:
            key = f"{attempt.student.full_name}_{attempt.student.phone}"

            if key not in best_results:
                best_results[key] = attempt
            else:
                if attempt.score > best_results[key].score:
                    best_results[key] = attempt

        sorted_results = sorted(
            best_results.values(),
            key=lambda x: x.score,
            reverse=True
        )[:20]

        data = []

        for attempt in sorted_results:
            data.append({
                "full_name": attempt.student.full_name,
                "score": attempt.score,
                "total_questions": attempt.total_questions,
                "percentage": round((attempt.score / attempt.total_questions) * 100, 1)
                if attempt.total_questions else 0,
                "certificate_code": getattr(getattr(attempt, "certificate", None), "code", ""),
                "certificate_verify_url": getattr(getattr(attempt, "certificate", None), "verify_url", ""),
                "school": attempt.student.school.name_uz,
                "class": attempt.student.school_class.name,
                "section": attempt.student.class_section.name,
            })

        return Response(data)


class ExportResultsExcelAPIView(APIView):
    permission_classes = [CanExportExcel]

    def get(self, request):
        test_id = request.GET.get("test_id")
        region_id = request.GET.get("region_id")
        district_id = request.GET.get("district_id")
        school_id = request.GET.get("school_id")
        school_class_id = request.GET.get("school_class_id")
        class_section_id = request.GET.get("class_section_id")

        attempts = TestAttempt.objects.filter(is_completed=True).select_related(
            "student",
            "student__school__district__region",
            "student__school_class",
            "student__class_section",
            "test",
        )

        if test_id:
            attempts = attempts.filter(test_id=test_id)
        if region_id:
            attempts = attempts.filter(student__school__district__region_id=region_id)
        if district_id:
            attempts = attempts.filter(student__school__district_id=district_id)
        if school_id:
            attempts = attempts.filter(student__school_id=school_id)
        if school_class_id:
            attempts = attempts.filter(student__school_class_id=school_class_id)
        if class_section_id:
            attempts = attempts.filter(student__class_section_id=class_section_id)

        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Natijalar"

        headers = [
            "T/R",
            "Ism familiya",
            "Telefon",
            "Jins",
            "Viloyat",
            "Tuman/Shahar",
            "Maktab",
            "Sinf",
            "Sinf harfi",
            "Test nomi",
            "Ball",
            "Jami savollar",
            "Foiz",
            "Sertifikat kodi",
            "Sertifikat URL",
        ]
        sheet.append(headers)

        for index, attempt in enumerate(attempts, start=1):
            percentage = (
                round((attempt.score / attempt.total_questions) * 100, 1)
                if attempt.total_questions else 0
            )
            certificate = getattr(attempt, "certificate", None)
            sheet.append([
                index,
                attempt.student.full_name,
                attempt.student.phone,
                attempt.student.gender,
                attempt.student.school.district.region.name_uz,
                attempt.student.school.district.name_uz,
                attempt.student.school.name_uz,
                attempt.student.school_class.name,
                attempt.student.class_section.name,
                attempt.test.title,
                attempt.score,
                attempt.total_questions,
                percentage,
                certificate.code if certificate else "",
                certificate.verify_url if certificate else "",
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="natijalar.xlsx"'

        workbook.save(response)
        return response


@api_view(["POST"])
@permission_classes([AllowAny])
def start_test_session(request):
    serializer = StartSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    selected_test_ids = data["selected_test_ids"]

    full_name = data["full_name"]
    phone = data["phone"]
    school_class_id = data["school_class_id"]
    class_section_id = data["class_section_id"]

    settings_obj, _ = SiteSettings.objects.get_or_create(pk=1)
    required_count = settings_obj.required_subject_count

    if len(selected_test_ids) != required_count:
        return Response(
            {"error": f"Aynan {required_count} ta fan tanlanishi kerak"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Sinfni topamiz
    try:
        school_class = SchoolClass.objects.get(id=school_class_id)
    except SchoolClass.DoesNotExist:
        return Response(
            {"error": "Sinf topilmadi"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        class_section = ClassSection.objects.get(id=class_section_id)
    except ClassSection.DoesNotExist:
        return Response(
            {"error": "Sinf harfi topilmadi"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Tanlangan testlarni olamiz
    tests = Test.objects.filter(id__in=selected_test_ids, is_active=True)

    if tests.count() != len(selected_test_ids):
        return Response(
            {"error": "Tanlangan fanlardan biri topilmadi yoki faol emas"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Har bir tanlangan test shu sinfga tegishlimi tekshiramiz
    wrong_class_test = tests.exclude(school_class_id=school_class_id).first()
    if wrong_class_test:
        return Response(
            {"error": "Tanlangan fanlardan biri ushbu sinfga mos emas"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Har bir fan bo‘yicha:
    # 1) o‘quvchi oldin ishlaganmi
    # 2) sinf limiti to‘lganmi
    for test in tests:
        existing_attempt = TestAttempt.objects.filter(
            test=test,
            student__full_name=full_name,
            student__phone=phone,
        ).first()

        if existing_attempt:
            return Response(
                {"error": f"Siz '{test.title}' fanini avval topshirgansiz"},
                status=status.HTTP_400_BAD_REQUEST
            )

        class_attempt_count = TestAttempt.objects.filter(
            test=test,
            student__school_class_id=school_class_id,
            student__class_section_id=class_section_id,
        ).count()

        if class_attempt_count >= school_class.student_limit:
            return Response(
                {
                    "error": f"'{test.title}' fani uchun ushbu sinfda limit tugagan"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    # Har bir fan uchun o‘zining duration_minutes qiymati olinadi
    total_time_seconds = sum(test.duration_minutes for test in tests) * 60

    session = TestSession.objects.create(
        full_name=data["full_name"],
        phone=data["phone"],
        gender=data["gender"],
        region_id=data["region_id"],
        district_id=data["district_id"],
        school_id=data["school_id"],
        school_class_id=data["school_class_id"],
        class_section_id=data["class_section_id"],
        selected_test_ids=selected_test_ids,
        total_time_seconds=total_time_seconds,
    )

    return Response(
        {"session_id": session.id},
        status=status.HTTP_201_CREATED
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_test_session(request, session_id):
    try:
        session = TestSession.objects.get(pk=session_id)
    except TestSession.DoesNotExist:
        return Response(
            {"error": "Session topilmadi"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TestSessionDetailSerializer(session, context={"request": request})
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([AllowAny])
def submit_test_session(request, session_id):
    try:
        session = TestSession.objects.get(pk=session_id)
    except TestSession.DoesNotExist:
        return Response(
            {"error": "Session topilmadi"},
            status=status.HTTP_404_NOT_FOUND
        )

    answers = request.data.get("answers", [])

    if not isinstance(answers, list):
        return Response(
            {"error": "answers list bo‘lishi kerak"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Session javoblarini tozalaymiz va qayta yozamiz
    TestSessionAnswer.objects.filter(session=session).delete()

    saved_answers = []
    session_attempts = []
    overall_correct_count = 0

    # Tanlangan fan id larini int ko‘rinishga keltiramiz
    selected_test_ids = []
    for test_id in session.selected_test_ids:
        try:
            selected_test_ids.append(int(test_id))
        except (TypeError, ValueError):
            continue

    overall_total_questions = Question.objects.filter(
        test_id__in=selected_test_ids
    ).count()

    for item in answers:
        question_id = item.get("question_id")
        answer_id = item.get("answer_id")

        if not question_id or not answer_id:
            continue

        try:
            question = Question.objects.get(pk=question_id)

            # Faqat session ichidagi fan savollarigagina ruxsat
            if question.test_id not in selected_test_ids:
                continue

            answer = Answer.objects.get(pk=answer_id, question=question)
        except (Question.DoesNotExist, Answer.DoesNotExist):
            continue

        TestSessionAnswer.objects.create(
            session=session,
            question=question,
            selected_answer=answer,
        )

        saved_answers.append({
            "question": question,
            "answer": answer,
        })

        if answer.is_correct:
            overall_correct_count += 1

    session.finished_at = timezone.now()
    session.save()

    # Eski leaderboard tizimi uchun student topamiz yoki yaratamiz
    try:
        school = School.objects.get(id=session.school_id)
        school_class = SchoolClass.objects.get(id=session.school_class_id)
        class_section = ClassSection.objects.get(id=session.class_section_id)
    except (School.DoesNotExist, SchoolClass.DoesNotExist, ClassSection.DoesNotExist):
        return Response(
            {"error": "Bog‘liq maktab/sinf ma’lumotlari topilmadi"},
            status=status.HTTP_400_BAD_REQUEST
        )

    student, _ = Student.objects.get_or_create(
        full_name=session.full_name,
        phone=session.phone,
        school=school,
        school_class=school_class,
        class_section=class_section,
        defaults={
            "gender": session.gender,
        }
    )

    # Har bir fan uchun alohida attempt yaratamiz yoki yangilaymiz
    for test_id in selected_test_ids:
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            continue

        test_questions = [
            item for item in saved_answers
            if item["question"].test_id == test_id
        ]

        # Attempt bo‘lsa topamiz, bo‘lmasa yaratamiz
        attempt, created = TestAttempt.objects.get_or_create(
            student=student,
            test=test,
            defaults={
                "started_at": session.started_at,
                "finished_at": session.finished_at,
            }
        )

        # Eski natijani ustidan yangilaymiz
        if not created:
            attempt.started_at = session.started_at
            attempt.finished_at = session.finished_at
            attempt.save()

            # Eski student answers ni tozalaymiz
            StudentAnswer.objects.filter(attempt=attempt).delete()

        # Shu fan bo‘yicha javoblarni yozamiz
        for item in test_questions:
            StudentAnswer.objects.create(
                attempt=attempt,
                question=item["question"],
                selected_answer=item["answer"],
            )

        # Ballni qayta hisoblaymiz
        attempt.calculate_score()
        session_attempts.append(attempt)

    percentage = (
        round((overall_correct_count / overall_total_questions) * 100, 1)
        if overall_total_questions else 0
    )
    certificate = issue_certificate_if_eligible(
        request=request,
        student=student,
        session=session,
        attempt=session_attempts[0] if session_attempts else None,
        score=overall_correct_count,
        total_questions=overall_total_questions,
        percentage=percentage,
    )

    return Response({
        "score": overall_correct_count,
        "total_questions": overall_total_questions,
        "percentage": percentage,
        "certificate": CertificateSerializer(certificate).data if certificate else None,
    })


class CertificateVerifyAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, code):
        try:
            certificate = Certificate.objects.get(code=code)
        except Certificate.DoesNotExist:
            return Response(
                {"error": "Sertifikat topilmadi"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(CertificateSerializer(certificate).data)
