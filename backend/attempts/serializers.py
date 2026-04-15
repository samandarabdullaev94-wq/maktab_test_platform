from django.utils import timezone
from rest_framework import serializers
from .models import Certificate, TestSession
from tests_app.models import Question, Test


class StartSessionSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    phone = serializers.CharField()
    gender = serializers.CharField()

    region_id = serializers.IntegerField()
    district_id = serializers.IntegerField()
    school_id = serializers.IntegerField()
    school_class_id = serializers.IntegerField()
    class_section_id = serializers.IntegerField()

    selected_test_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )


class SessionQuestionSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'text', 'test_id', 'image', 'answers']

    def get_answers(self, obj):
        return [
            {
                "id": answer.id,
                "text": answer.text,
            }
            for answer in obj.answers.all()
        ]

    def get_image(self, obj):
        if hasattr(obj, "image") and obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class TestSessionDetailSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    saved_answers = serializers.SerializerMethodField()
    remaining_time_seconds = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = TestSession
        fields = [
            'id',
            'full_name',
            'phone',
            'gender',
            'selected_test_ids',
            'total_time_seconds',
            'started_at',
            'finished_at',
            'remaining_time_seconds',
            'is_expired',
            'saved_answers',
            'questions',
        ]

    def get_questions(self, obj):
        questions = Question.objects.filter(
            test_id__in=obj.selected_test_ids
        ).prefetch_related("answers")

        return SessionQuestionSerializer(
            questions,
            many=True,
            context=self.context
        ).data

    def get_saved_answers(self, obj):
        return [
            {
                "question_id": answer.question_id,
                "answer_id": answer.selected_answer_id,
            }
            for answer in obj.answers.all()
            if answer.selected_answer_id
        ]

    def get_remaining_time_seconds(self, obj):
        elapsed_seconds = int((timezone.now() - obj.started_at).total_seconds())
        return max(0, obj.total_time_seconds - elapsed_seconds)

    def get_is_expired(self, obj):
        return self.get_remaining_time_seconds(obj) <= 0


class CertificateSerializer(serializers.ModelSerializer):
    issued_at = serializers.DateTimeField(read_only=True)
    template_snapshot = serializers.JSONField(read_only=True)
    test_title = serializers.SerializerMethodField()
    subject_names = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            "code",
            "full_name",
            "test_title",
            "subject_names",
            "score",
            "total_questions",
            "percentage",
            "verify_url",
            "qr_code_url",
            "template_snapshot",
            "issued_at",
            "date",
        ]

    def get_certificate_tests(self, obj):
        if obj.session_id and obj.session:
            selected_test_ids = []
            for test_id in obj.session.selected_test_ids:
                try:
                    selected_test_ids.append(int(test_id))
                except (TypeError, ValueError):
                    continue

            return list(
                Test.objects.filter(id__in=selected_test_ids).select_related("subject")
            )

        if obj.attempt_id and obj.attempt and obj.attempt.test_id:
            return [obj.attempt.test]

        return []

    def get_test_title(self, obj):
        return ", ".join(
            test.title
            for test in self.get_certificate_tests(obj)
            if test.title
        )

    def get_subject_names(self, obj):
        names = []
        for test in self.get_certificate_tests(obj):
            subject = getattr(test, "subject", None)
            if not subject:
                continue

            name = subject.name_uz or subject.name_ru
            if name and name not in names:
                names.append(name)

        return ", ".join(names)

    def get_date(self, obj):
        if not obj.issued_at:
            return ""

        return timezone.localtime(obj.issued_at).strftime("%d.%m.%Y")
