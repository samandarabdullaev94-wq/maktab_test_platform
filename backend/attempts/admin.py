from django.contrib import admin
from .models import Certificate, Student, TestAttempt, StudentAnswer


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'phone', 'gender', 'school', 'school_class', 'class_section')
    list_filter = ('gender', 'school', 'school_class', 'class_section')
    search_fields = ('full_name', 'phone')


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'test', 'score', 'total_questions', 'is_completed', 'started_at')
    list_filter = ('is_completed', 'test')
    search_fields = ('student__full_name',)
    actions = ['calculate_results']

    def calculate_results(self, request, queryset):
        for attempt in queryset:
            attempt.calculate_score()
        self.message_user(request, "Natijalar hisoblandi")

    calculate_results.short_description = "Hisoblash (score)"


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'attempt', 'question', 'selected_answer')


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("code", "full_name", "percentage", "issued_at")
    search_fields = ("code", "full_name")
    readonly_fields = ("code", "issued_at")
