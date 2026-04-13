from django.db import models
from classes_app.models import SchoolClass


class Direction(models.Model):
    name_uz = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name_uz


class Subject(models.Model):
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE, related_name='subjects')
    name_uz = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.direction.name_uz} - {self.name_uz}"


class Test(models.Model):
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='tests')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    duration_minutes = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to='questions/', blank=True, null=True)
    order = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.test.title} - {self.order}"


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text