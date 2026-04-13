from django.contrib import admin
from .models import Direction, Subject, Test, Question, Answer


@admin.register(Direction)
class DirectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_uz', 'is_active')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_uz', 'direction', 'is_active')
    list_filter = ('direction',)


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'school_class', 'subject', 'duration_minutes', 'is_active')
    list_filter = ('school_class', 'subject')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'test', 'order')


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'text', 'is_correct')