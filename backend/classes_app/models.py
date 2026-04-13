from django.db import models
from organizations.models import School


class SchoolClass(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classes')
    name = models.PositiveIntegerField()  # 5, 6, 7, 8, 9, 10, 11
    student_limit = models.PositiveIntegerField(default=30)
    test_price = models.DecimalField(max_digits=12, decimal_places=2, default=15000)
    duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'School Class'
        verbose_name_plural = 'School Classes'
        ordering = ['name']
        unique_together = ('school', 'name')

    def __str__(self):
        return f'{self.school.name_uz} - {self.name}-sinf'


class ClassSection(models.Model):
    SECTION_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
    ]

    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=1, choices=SECTION_CHOICES)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Class Section'
        verbose_name_plural = 'Class Sections'
        ordering = ['name']
        unique_together = ('school_class', 'name')

    def __str__(self):
        return f'{self.school_class.name}-sinf {self.name}'