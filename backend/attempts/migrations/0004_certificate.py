from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("attempts", "0003_testsession_total_time_seconds"),
    ]

    operations = [
        migrations.CreateModel(
            name="Certificate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(db_index=True, max_length=32, unique=True)),
                ("full_name", models.CharField(max_length=255)),
                ("score", models.PositiveIntegerField(default=0)),
                ("total_questions", models.PositiveIntegerField(default=0)),
                ("percentage", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("verify_url", models.URLField(max_length=500)),
                ("qr_code_url", models.URLField(blank=True, default="", max_length=800)),
                ("template_snapshot", models.JSONField(blank=True, default=dict)),
                ("issued_at", models.DateTimeField(auto_now_add=True)),
                (
                    "attempt",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="certificate",
                        to="attempts.testattempt",
                    ),
                ),
                (
                    "session",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="certificate",
                        to="attempts.testsession",
                    ),
                ),
                (
                    "student",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="certificates",
                        to="attempts.student",
                    ),
                ),
            ],
            options={
                "ordering": ["-issued_at"],
            },
        ),
    ]
