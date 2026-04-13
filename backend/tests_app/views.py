from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from accounts.permissions import CanManageContent, CanManageTests
from .models import Direction, Subject, Test, Question, Answer
from .serializers import (
    DirectionSerializer,
    SubjectSerializer,
    TestSerializer,
    QuestionSerializer,
    PublicQuestionSerializer,
    AnswerSerializer,
)


# =========================
# PUBLIC API
# =========================

class TestListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tests = Test.objects.filter(is_active=True).select_related("school_class", "subject").order_by("id")
        serializer = TestSerializer(tests, many=True)
        return Response(serializer.data)


class TestQuestionsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, test_id):
        questions = Question.objects.filter(test_id=test_id).prefetch_related("answers").order_by("order")
        serializer = PublicQuestionSerializer(questions, many=True, context={"request": request})
        return Response(serializer.data)


# =========================
# ADMIN API - DIRECTION
# =========================

class AdminDirectionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Direction.objects.all().order_by("name_uz")
    serializer_class = DirectionSerializer
    permission_classes = [CanManageContent]


@api_view(["PATCH", "DELETE"])
@permission_classes([CanManageContent])
def admin_direction_update_view(request, direction_id):
    try:
        direction = Direction.objects.get(id=direction_id)
    except Direction.DoesNotExist:
        return Response({"error": "Yo‘nalish topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        direction.is_active = False
        direction.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = DirectionSerializer(direction, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# ADMIN API - SUBJECT
# =========================

class AdminSubjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Subject.objects.select_related("direction").all().order_by("name_uz")
    serializer_class = SubjectSerializer
    permission_classes = [CanManageContent]


@api_view(["PATCH", "DELETE"])
@permission_classes([CanManageContent])
def admin_subject_update_view(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id)
    except Subject.DoesNotExist:
        return Response({"error": "Fan topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        subject.is_active = False
        subject.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = SubjectSerializer(subject, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# ADMIN API - TEST
# =========================

class AdminTestListCreateAPIView(generics.ListCreateAPIView):
    queryset = Test.objects.select_related("school_class", "subject").all().order_by("-id")
    serializer_class = TestSerializer
    permission_classes = [CanManageTests]


@api_view(["PATCH", "DELETE"])
@permission_classes([CanManageTests])
def admin_test_update_view(request, test_id):
    try:
        test = Test.objects.get(id=test_id)
    except Test.DoesNotExist:
        return Response({"error": "Test topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        test.is_active = False
        test.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = TestSerializer(test, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# ADMIN API - QUESTION
# =========================

class AdminQuestionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Question.objects.select_related("test").prefetch_related("answers").all().order_by("-id")
    serializer_class = QuestionSerializer
    permission_classes = [CanManageContent]


@api_view(["PATCH", "DELETE"])
@permission_classes([CanManageContent])
def admin_question_update_view(request, question_id):
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({"error": "Savol topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        from attempts.models import TestSessionAnswer

        is_used = (
            question.student_answers.exists()
            or TestSessionAnswer.objects.filter(question=question).exists()
        )
        if is_used:
            return Response(
                {"error": "Bu savol natijalarda ishlatilgan, shuning uchun o'chirib bo'lmaydi"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = QuestionSerializer(question, data=request.data, partial=True, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# ADMIN API - ANSWER
# =========================

class AdminAnswerListCreateAPIView(generics.ListCreateAPIView):
    queryset = Answer.objects.select_related("question").all().order_by("-id")
    serializer_class = AnswerSerializer
    permission_classes = [CanManageContent]


@api_view(["PATCH", "DELETE"])
@permission_classes([CanManageContent])
def admin_answer_update_view(request, answer_id):
    try:
        answer = Answer.objects.get(id=answer_id)
    except Answer.DoesNotExist:
        return Response({"error": "Javob topilmadi"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        from attempts.models import TestSessionAnswer

        is_used = (
            answer.selected_by_students.exists()
            or TestSessionAnswer.objects.filter(selected_answer=answer).exists()
        )
        if is_used:
            return Response(
                {"error": "Bu javob natijalarda ishlatilgan, shuning uchun o'chirib bo'lmaydi"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        answer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = AnswerSerializer(answer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
