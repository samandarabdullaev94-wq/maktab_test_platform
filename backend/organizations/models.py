from django.db import models


class Region(models.Model):
    name_uz = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Region'
        verbose_name_plural = 'Regions'
        ordering = ['name_uz']

    def __str__(self):
        return self.name_uz


class District(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='districts')
    name_uz = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'District'
        verbose_name_plural = 'Districts'
        ordering = ['name_uz']

    def __str__(self):
        return f'{self.region.name_uz} - {self.name_uz}'


class School(models.Model):
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='schools')
    name_uz = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'School'
        verbose_name_plural = 'Schools'
        ordering = ['name_uz']

    def __str__(self):
        return self.name_uz