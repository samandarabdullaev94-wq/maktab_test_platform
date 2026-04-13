from rest_framework import serializers
from .models import Direction, Subject, Test, Question, Answer


class DirectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Direction
        fields = ["id", "name_uz", "name_ru", "is_active"]


class SubjectSerializer(serializers.ModelSerializer):
    direction_name = serializers.CharField(source="direction.name_uz", read_only=True)

    class Meta:
        model = Subject
        fields = [
            "id",
            "direction",
            "direction_name",
            "name_uz",
            "name_ru",
            "is_active",
        ]


class TestSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source="school_class.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name_uz", read_only=True)

    class Meta:
        model = Test
        fields = [
            "id",
            "school_class",
            "class_name",
            "subject",
            "subject_name",
            "title",
            "is_active",
            "duration_minutes",
            "created_at",
        ]


class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.text", read_only=True)

    class Meta:
        model = Answer
        fields = ["id", "question", "question_text", "text", "is_correct"]


class PublicAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    test_title = serializers.CharField(source="test.title", read_only=True)

    class Meta:
        model = Question
        fields = ["id", "test", "test_title", "text", "image", "order", "answers"]


class PublicQuestionSerializer(serializers.ModelSerializer):
    answers = PublicAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "test", "text", "image", "order", "answers"]
