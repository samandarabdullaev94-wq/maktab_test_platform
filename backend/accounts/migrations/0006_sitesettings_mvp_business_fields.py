from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0005_remove_sitesettings_minutes_per_subject_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="certificate_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="certificate_lookup_path",
            field=models.CharField(default="/certificate", max_length=120),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="certificate_passing_percentage",
            field=models.PositiveIntegerField(default=60),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="certificate_public_base_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="certificate_template",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="instagram_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="telegram_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]
