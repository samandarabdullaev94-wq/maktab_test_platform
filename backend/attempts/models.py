from django.db import models
from organizations.models import School
from classes_app.models import SchoolClass, ClassSection
from tests_app.models import Test, Question, Answer


class Student(models.Model):
    GENDER_MALE = 'male'
    GENDER_FEMALE = 'female'

    GENDER_CHOICES = [
        (GENDER_MALE, 'Male'),
        (GENDER_FEMALE, 'Female'),
    ]

    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='students')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='students')
    class_section = models.ForeignKey(ClassSection, on_delete=models.CASCADE, related_name='students')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class TestAttempt(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attempts')
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')

    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(blank=True, null=True)

    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.full_name} - {self.test.title}"

    def calculate_score(self):
        answers = self.student_answers.select_related('selected_answer')

        correct_count = 0

        for ans in answers:
            if ans.selected_answer and ans.selected_answer.is_correct:
                correct_count += 1

        self.score = correct_count
        self.total_questions = self.test.questions.count()
        self.is_completed = True
        self.save()


class StudentAnswer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='student_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers')
    selected_answer = models.ForeignKey(
        Answer,
        on_delete=models.CASCADE,
        related_name='selected_by_students',
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.attempt.student.full_name} - {self.question.id}"


class TestSession(models.Model):
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    gender = models.CharField(max_length=10)

    region_id = models.IntegerField()
    district_id = models.IntegerField()
    school_id = models.IntegerField()
    school_class_id = models.IntegerField()
    class_section_id = models.IntegerField()

    selected_test_ids = models.JSONField(default=list)
    total_time_seconds = models.PositiveIntegerField(default=0)

    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.full_name} - session #{self.id}"


class TestSessionAnswer(models.Model):
    session = models.ForeignKey(
        TestSession,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(
        Answer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        unique_together = ('session', 'question')

    def __str__(self):
        return f"Session {self.session_id} - Question {self.question_id}"


class Certificate(models.Model):
    code = models.CharField(max_length=32, unique=True, db_index=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="certificates")
    session = models.OneToOneField(
        TestSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certificate",
    )
    attempt = models.OneToOneField(
        TestAttempt,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certificate",
    )
    full_name = models.CharField(max_length=255)
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    verify_url = models.URLField(max_length=500)
    qr_code_url = models.URLField(max_length=800, blank=True, default="")
    template_snapshot = models.JSONField(blank=True, default=dict)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return f"{self.full_name} - {self.code}"
